"""
Scope every CSS selector inside the AI Studio's <style> block with
`.mn-ai-studio-wrapper` so the studio's styles can NEVER leak out of
its container into the Shopify theme chrome.

Rules:
  - `*`                       -> `.mn-ai-studio-wrapper *`
  - `:root`                   -> `.mn-ai-studio-wrapper`  (CSS vars scoped)
  - `html, body`              -> `.mn-ai-studio-wrapper`  (global-body CSS
                                  rewritten to apply only inside wrapper)
  - every other selector      -> `.mn-ai-studio-wrapper <selector>`
  - comma-separated lists     -> each selector individually prefixed
  - @keyframes / @font-face   -> untouched (they don't take selectors)
  - @media (...) { ... }      -> body processed recursively
  - inline `!important` flags preserved verbatim
"""

import re
import sys
from pathlib import Path

WRAPPER = ".mn-ai-studio-wrapper"

# ─── tokenise a CSS stylesheet into (selector, body) or (at-rule, body) blocks
# We do this by walking the string and tracking brace depth. This is the
# minimum correct parser — enough for the studio's hand-written CSS.

def tokenize(css: str):
    """Yield top-level blocks as {'kind': 'rule'|'at-rule'|'at-decl', 'prelude': str, 'body': str}."""
    i, n = 0, len(css)
    buf = []
    while i < n:
        # skip leading whitespace / comments but preserve them in output
        # by flushing them as 'verbatim' chunks
        ch = css[i]

        # Preserve comment blocks as-is
        if ch == '/' and i + 1 < n and css[i + 1] == '*':
            end = css.find('*/', i + 2)
            if end == -1:
                end = n
            else:
                end += 2
            yield {'kind': 'verbatim', 'text': css[i:end]}
            i = end
            continue

        # Preserve whitespace chunks
        if ch.isspace():
            j = i
            while j < n and css[j].isspace():
                j += 1
            yield {'kind': 'verbatim', 'text': css[i:j]}
            i = j
            continue

        # At-rule
        if ch == '@':
            # read prelude until `{` or `;`
            j = i
            while j < n and css[j] not in '{;':
                j += 1
            prelude = css[i:j]
            if j >= n:
                yield {'kind': 'verbatim', 'text': prelude}
                i = n
                continue
            if css[j] == ';':
                # at-rule declaration (e.g. @import ... ;)
                yield {'kind': 'at-decl', 'prelude': prelude, 'terminator': ';'}
                i = j + 1
                continue
            # it's an at-rule with a body
            body, end = _read_braced_block(css, j)
            yield {'kind': 'at-rule', 'prelude': prelude.rstrip(), 'body': body}
            i = end
            continue

        # Ordinary rule: read selector until `{`, then braced body
        j = i
        while j < n and css[j] != '{':
            j += 1
        if j >= n:
            yield {'kind': 'verbatim', 'text': css[i:]}
            return
        prelude = css[i:j]
        body, end = _read_braced_block(css, j)
        yield {'kind': 'rule', 'prelude': prelude.strip(), 'body': body}
        i = end

def _read_braced_block(css: str, open_idx: int):
    """Given css[open_idx] == '{', return (inner_text, idx_after_close_brace)."""
    assert css[open_idx] == '{'
    depth = 1
    j = open_idx + 1
    n = len(css)
    while j < n and depth > 0:
        ch = css[j]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return css[open_idx + 1:j], j + 1
        elif ch == '/' and j + 1 < n and css[j + 1] == '*':
            end = css.find('*/', j + 2)
            j = (end + 2) if end != -1 else n
            continue
        elif ch in '"\'':
            quote = ch
            j += 1
            while j < n and css[j] != quote:
                if css[j] == '\\' and j + 1 < n:
                    j += 2
                    continue
                j += 1
        j += 1
    return css[open_idx + 1:n], n


# ─── selector rewriting ────────────────────────────────────────────────────

def prefix_selector(selector: str) -> str:
    """Prefix a single selector with `.mn-ai-studio-wrapper`."""
    sel = selector.strip()
    if not sel:
        return sel
    # Special cases
    if sel == '*':
        return f'{WRAPPER} *'
    if sel == ':root':
        return WRAPPER
    if sel in ('html', 'body', 'html, body', 'html,body', 'body, html', 'body,html'):
        # Rewritten by caller (see rewrite_selector_list)
        return WRAPPER
    # Leave existing wrapper prefixes untouched (idempotent)
    if sel == WRAPPER or sel.startswith(WRAPPER + ' ') or sel.startswith(WRAPPER + '.') \
            or sel.startswith(WRAPPER + ':') or sel.startswith(WRAPPER + '>'):
        return sel
    return f'{WRAPPER} {sel}'


def rewrite_selector_list(selector_list: str) -> str:
    """Rewrite a full comma-separated selector list."""
    # Split on top-level commas only. CSS selectors don't nest parens for
    # commas except inside functional pseudo-classes like :is(), :not(),
    # :where() — handle that minimally by tracking paren depth.
    parts = _split_selector_list(selector_list)

    # Collapse any pure `html`/`body`/`html, body` chain → single wrapper
    cleaned = []
    saw_body = False
    for raw in parts:
        s = raw.strip()
        if not s:
            continue
        if s in ('html', 'body', ':root'):
            saw_body = True
            continue
        cleaned.append(prefix_selector(s))
    if saw_body and WRAPPER not in cleaned:
        cleaned.insert(0, WRAPPER)
    return ', '.join(cleaned) if cleaned else WRAPPER


def _split_selector_list(s: str):
    depth = 0
    buf = []
    out = []
    for ch in s:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth = max(0, depth - 1)
        if ch == ',' and depth == 0:
            out.append(''.join(buf))
            buf = []
            continue
        buf.append(ch)
    if buf:
        out.append(''.join(buf))
    return out


# ─── top-level scoping ─────────────────────────────────────────────────────

AT_RULES_THAT_TAKE_SELECTORS_INSIDE = {
    'media', 'supports', 'container', 'layer', 'document'
}

def scope_css(css: str, depth: int = 0) -> str:
    out = []
    for tok in tokenize(css):
        kind = tok['kind']
        if kind == 'verbatim':
            out.append(tok['text'])
        elif kind == 'at-decl':
            out.append(tok['prelude'] + tok.get('terminator', ';'))
        elif kind == 'at-rule':
            name = re.match(r'@([a-zA-Z-]+)', tok['prelude'])
            at_name = name.group(1).lower() if name else ''
            if at_name in ('keyframes', 'font-face', 'counter-style', 'property', 'page', 'charset', 'import', 'namespace'):
                # Don't touch bodies — they contain percentages / descriptors, not selectors
                out.append(f"{tok['prelude']} {{{tok['body']}}}")
            elif at_name in AT_RULES_THAT_TAKE_SELECTORS_INSIDE:
                # Recurse into the body
                inner = scope_css(tok['body'], depth + 1)
                out.append(f"{tok['prelude']} {{{inner}}}")
            else:
                # Unknown at-rule — leave body untouched to be safe
                out.append(f"{tok['prelude']} {{{tok['body']}}}")
        elif kind == 'rule':
            new_prelude = rewrite_selector_list(tok['prelude'])
            out.append(f"{new_prelude} {{{tok['body']}}}")
    return ''.join(out)


# ─── entry point: process an HTML file ────────────────────────────────────

STYLE_BLOCK_RE = re.compile(r'(<style\b[^>]*>)(.*?)(</style>)', re.DOTALL | re.IGNORECASE)

def scope_html(html: str) -> str:
    def _replace(m):
        open_tag, body, close_tag = m.group(1), m.group(2), m.group(3)
        scoped = scope_css(body)
        return f"{open_tag}{scoped}{close_tag}"
    return STYLE_BLOCK_RE.sub(_replace, html)


def main():
    if len(sys.argv) != 3:
        print("usage: python _scope_studio_css.py <input.html> <output.html>", file=sys.stderr)
        sys.exit(2)
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    raw = src.read_text(encoding='utf-8')
    scoped = scope_html(raw)
    dst.write_text(scoped, encoding='utf-8')
    print(f"[scope] {src} -> {dst} ({len(raw):,} -> {len(scoped):,} bytes)")


if __name__ == '__main__':
    main()
