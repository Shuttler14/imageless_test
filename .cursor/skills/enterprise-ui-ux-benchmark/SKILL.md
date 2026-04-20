---
name: enterprise-ui-ux-benchmark
description: Audits the codebase for design tokens and patterns before building, then ships UI that matches the theme with full interaction states and progressive disclosure. Use when enhancing Shopify Liquid sections, dashboard flows, onboarding, marketing pages, or any frontend where the user wants Linear/Stripe/Vercel-grade polish without breaking brand consistency.
---

# Enterprise UI/UX benchmark

Apply this workflow whenever the user asks to improve, polish, or redesign a page, section, or component. **Do not skip Phase 1.** Implementation without a token/pattern audit risks arbitrary colors and off-brand typography.

## Phase 1 — Learn before you build (mandatory)

Run this audit **silently** (summarize only if the user asks), then proceed.

### 1.1 Design tokens

Locate and internalize:

- CSS variables, `tailwind.config.*`, theme JSON, or global stylesheets
- Palette: primary, secondary, accent, background, surface, text (muted vs primary)
- Typography: font families, weights, size scale, line heights
- Spacing: scale, grid, max-widths, gutters
- Radii, shadows, elevation
- Motion: durations, easing (prefer 150–250ms ease-out for UI feedback)
- Any component primitives (shadcn, Radix, MUI, or project-specific)

### 1.2 Product context

Infer from routes, copy, and structure:

- Domain and audience (B2B, consumer, creator, internal)
- Navigation and information architecture
- Recurring layouts (sidebar, cards, tables, hero + grid)
- Voice: formal vs friendly vs technical

### 1.3 Theme signature

Decide internally:

- Minimal vs dense vs expressive
- What must be preserved
- What is inconsistent or below bar

**Gate:** Do not write UI code until tokens and conventions are identified or honestly flagged as missing (then propose minimal extensions that match existing patterns).

## Phase 2 — Design intelligence

Before coding, answer briefly (can stay internal unless the user wants a write-up):

1. **User goals:** Primary job; 2–3 secondary goals; likely emotional state; desired feeling on exit.
2. **Hierarchy:** Single most important message; progressive disclosure order; what to hide behind taps/expansion.
3. **Flow:** Happy path; current friction; micro-interactions that reward completion; transitions that reduce jank.
4. **Enterprise checklist** (apply every time):
   - Async actions: loading (prefer skeletons where data shape is known)
   - Empty states: informative + clear next step
   - Errors: specific, human, actionable (not generic “Something went wrong”)
   - Keyboard: focus order, focus-visible, Escape for modals
   - Controls: hover, focus, active, disabled
   - Responsive: breakpoints intentional, not accidental
   - Density: match task (scan vs read vs configure)
   - Rhythm: consistent vertical spacing and alignment

## Phase 3 — Build

1. **Honor the theme:** Use extracted tokens only; no one-off hex unless the codebase already does and you are matching. Match type scale and spacing. Reuse existing classes/partials before inventing names.
2. **Elevate, don’t decorate:** Motion communicates state; shadows suggest depth; hierarchy comes from type contrast + whitespace; accent is sparse.
3. **One signature moment per surface:** One hero, one stat treatment, one memorable hover, or one scroll reveal — native to the theme, not a foreign UI kit.
4. **Interaction contract:** Every action gets immediate feedback; async actions show in-flight state; forms validate without shouting.

## Phase 4 — Delivery format

When the user expects a deliverable (not a tiny one-line fix), structure the reply as:

1. **Design rationale** (3–5 sentences): decisions tied to user goals and hierarchy.
2. **What changed:** Bullets mapping each change to the UX problem it solves.
3. **Code:** Production-ready; comment only non-obvious choices; no TODOs or lorem ipsum; all states implemented.
4. **Follow-ups** (optional): Adjacent inconsistencies spotted, one line each.

## Hard rules

- Do not contradict the established theme or invent a parallel design system.
- No placeholder copy; write real, contextual strings for this product.
- No component shipped without default, hover, focus, loading, error, empty, and disabled coverage where applicable.
- Usability over novelty; evolution over rebrand.
- Optimize for a tired, rushed, or new user.

## Tech notes (Shopify / Liquid)

- Prefer scoped CSS in the same section file or existing asset patterns; avoid global pollution.
- Respect `prefers-reduced-motion` when adding transitions.
- Keep Liquid readable: assign variables at top, avoid deep nesting without reason.
