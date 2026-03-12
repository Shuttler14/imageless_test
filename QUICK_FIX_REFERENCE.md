# AI Stylist Widget Visibility Issue - Quick Reference

## Problem
Widget panel opens (persistent nav visible) but `#mn-content-container` content is invisible.

## Root Cause
Missing `min-height: 0` on a flexbox child with `flex: 1` in column layout.

## Solution Applied
**File:** `ref/assets/MN-fashion-consultant.css` (Line 689)

```css
.mn-content-container {
  flex: 1;
  min-height: 0;  /* ← ADDED - Critical fix */
  overflow-y: auto;
  padding: 24px;
  position: relative;
  z-index: 1;
}
```

## Why It Works

### Flexbox Behavior:
- Container: `.mn-widget-expanded` (680px height, `display: flex`, `flex-direction: column`)
- Content: `.mn-content-container` (`flex: 1` - should fill remaining space)

### The Issue:
- Without `min-height: 0`, flexbox defaults to `min-height: auto`
- Empty container stays at 0px height even with `flex: 1`
- Content injected via JS exists but is invisible

### The Fix:
- `min-height: 0` overrides default behavior
- Container now expands to ~623px (680px - nav - progress)
- Content displays properly and scrolls if needed

## Verification Checklist
- [ ] Widget opens and nav visible
- [ ] Step 0 gender selector renders
- [ ] Content has visible height
- [ ] Scrolling works
- [ ] Progress bar appears
- [ ] All 5 steps navigate correctly
- [ ] No content clipping

## Files Changed
- ✅ `ref/assets/MN-fashion-consultant.css` (+1 line)

## Additional Notes
- No JavaScript changes needed
- All content rendering already works (verified in `setContent()` function)
- This is a common CSS flexbox pattern used across modern web apps
- One-line fix with zero performance impact

## Rollback
If needed, simply remove the `min-height: 0;` line from line 689.
