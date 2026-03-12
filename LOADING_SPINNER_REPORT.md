# AI STYLIST LOADING/SPINNER ANIMATION REPORT
## Complete Documentation with Exact Line Numbers

---

## 1. LOADING SCREEN RENDER FUNCTION (Step 5A)
**File:** `MN-fashion-consultant.js`
**Function:** `renderStep5A()`
**Lines:** 441-566

### Full Loading State HTML (Lines 462-490):
```javascript
setContent(`
  <div class="mnw-step">
    <div class="mnw-step-hdr">
      <p class="mnw-step-num">04 / 04</p>
      <h2 class="mnw-step-title">Generating your main character look</h2>
      <p class="mnw-step-sub">AI is crafting a look for your skin tone, body type &amp; vibe.</p>
    </div>
    <div class="mnw-result-wrap" id="mnw-result-wrap">
      <div id="mnw-loading-state" style="height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(255,255,255,0.03);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
        <div style="width:40px;height:40px;border:3px solid rgba(57,165,150,0.2);border-top-color:#39A596;border-radius:50%;animation:mnw-spin 0.8s linear infinite"></div>
        <p id="mnw-loading-text" style="font-size:13px;color:rgba(255,255,255,0.5);text-align:center;max-width:220px">Reading your style DNA...</p>
      </div>
      <img class="mnw-result-img" id="mnw-result-img" alt="AI Generated Look" style="display:none"/>
      <span class="mnw-result-badge" id="mnw-result-badge" style="display:none">AI Generated</span>
    </div>
    <div class="mnw-dopamine-box" id="mnw-result-info" style="display:none">
      <p style="font-size:10px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px">Based on: ${selectedLabels || 'Your Aesthetic'}</p>
      <p class="mnw-dopamine-title" id="mnw-result-title">Your look is ready.</p>
      <p class="mnw-dopamine-sub">Want to style this with clothes you already own?</p>
    </div>
    <button class="mnw-upload-wardrobe-btn" id="mnw-upload-wardrobe" style="display:none">Upload Wardrobe Pic</button>
    <input type="file" id="mnw-wardrobe-input" accept="image/*" style="display:none"/>
    <div id="mnw-api-error" style="display:none;margin-top:12px;padding:12px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;font-size:12px;color:#fca5a5;text-align:center"></div>
    <div class="mnw-step-dots">
      <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
      <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-active"></span>
    </div>
  </div>
`);
```

### Loading Container Details (Line 470):
- **ID:** `mnw-loading-state`
- **Height:** 300px
- **Display:** flex (column)
- **Background:** `rgba(255,255,255,0.03)` (glass morphism)
- **Border:** 1px solid `rgba(255,255,255,0.08)`
- **Border-radius:** 16px
- **Gap:** 16px

---

## 2. SPINNER ELEMENT (Line 471)
### Complete Spinner HTML Structure:
```html
<div style="width:40px;height:40px;border:3px solid rgba(57,165,150,0.2);border-top-color:#39A596;border-radius:50%;animation:mnw-spin 0.8s linear infinite"></div>
```

### Spinner Specifications:
| Property | Value |
|----------|-------|
| **Size** | 40px × 40px |
| **Border Width** | 3px |
| **Border Style** | solid |
| **Border Color (track)** | `rgba(57,165,150,0.2)` (light teal, semi-transparent) |
| **Border-Top Color (fill)** | `#39A596` (brand teal - ANIMATED) |
| **Border Radius** | 50% (perfect circle) |
| **Animation** | `mnw-spin 0.8s linear infinite` |
| **Animation Duration** | 0.8 seconds |
| **Animation Timing** | linear (constant speed) |
| **Animation Iteration** | infinite loop |

### Color Reference:
- **Brand Teal:** `#39A596`
- **Track (background):** `rgba(57,165,150,0.2)` ≈ 20% opacity teal
- **Spinner (fill):** `#39A596` (100% opacity)

---

## 3. LOADING TEXT (Line 472)
```html
<p id="mnw-loading-text" style="font-size:13px;color:rgba(255,255,255,0.5);text-align:center;max-width:220px">Reading your style DNA...</p>
```

### Text Styling:
| Property | Value |
|----------|-------|
| **Font Size** | 13px |
| **Color** | `rgba(255,255,255,0.5)` (50% white) |
| **Text Align** | center |
| **Max Width** | 220px |
| **Margin** | 0 (default) |

### Dynamic Loading Messages (Lines 493-495):
The text rotates through 5 messages every 4 seconds:
```javascript
const msgs = [
  'Reading your style DNA...',
  'Analysing skin tone & body type...',
  'Matching your vibe...',
  'FLUX is painting your outfit...',
  'Final touches...'
];
let mi = 0;
const msgInt = setInterval(() => { 
  const el = $('#mnw-loading-text'); 
  if (el && msgs[++mi]) el.textContent = msgs[mi]; 
}, 4000);
```

---

## 4. CSS ANIMATIONS - COMPLETE DEFINITIONS

### Missing CSS Animation Definition
**IMPORTANT:** The `@keyframes mnw-spin` animation **REFERENCED IN HTML IS NOT DEFINED IN THE CSS FILE**

The spinner animation is called but not declared. Here's what needs to be added to CSS:

### Required @keyframes Definition:
```css
@keyframes mnw-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

OR (more concise):
```css
@keyframes mnw-spin { 
  to { transform: rotate(360deg); } 
}
```

---

## 5. RELATED CSS ANIMATIONS FOUND IN FILE

### 5A. Pop-in Animation (Line 164-165)
```css
.mnw-pop-in { 
  animation: mnw-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; 
  opacity: 0; 
  transform: scale(0.7); 
}
@keyframes mnw-pop { 
  to{opacity:1;transform:scale(1)} 
}
```
**Used for:** Wardrobe items appearing during Step 5B scanning

### 5B. Scanning Line Animation (Line 152-153)
```css
.mnw-scan-line { 
  position: absolute; 
  left: 0; 
  right: 0; 
  height: 2px; 
  background: linear-gradient(90deg, transparent, #39A596, transparent); 
  animation: mnw-scan 1.8s linear infinite; 
  box-shadow: 0 0 10px #39A596; 
}
@keyframes mnw-scan { 
  0%{top:0%} 
  100%{top:100%} 
}
```
**Used for:** Vertical scanning line in wardrobe scan (Step 5B)

### 5C. Gap Pulse Animation (Line 168-169)
```css
.mnw-red-gap { 
  position: absolute; 
  border: 2px solid #ef4444; 
  border-radius: 7px; 
  background: rgba(239,68,68,0.14); 
  bottom: 8%; 
  left: 15%; 
  right: 15%; 
  height: 13%; 
  animation: mnw-gap-pulse 2s ease-in-out infinite; 
}
@keyframes mnw-gap-pulse { 
  0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 
  50%{box-shadow:0 0 0 8px rgba(239,68,68,0)} 
}
```
**Used for:** Red gap highlight in Step 5D (missing shoes indicator)

### 5D. Fade-In Animation (Line 73-74)
```css
.mnw-step { 
  padding: 14px 14px 70px; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  animation: mnw-fade-in 0.35s ease forwards; 
}
@keyframes mnw-fade-in { 
  from{opacity:0;transform:translateY(14px)} 
  to{opacity:1;transform:translateY(0)} 
}
```
**Used for:** All step transitions

### 5E. Drift Animation (Line 87-90)
```css
.mnw-orb { 
  position: absolute; 
  border-radius: 50%; 
  filter: blur(60px); 
  opacity: 0.25; 
  pointer-events: none; 
  animation: mnw-drift 8s ease-in-out infinite; 
}
@keyframes mnw-drift { 
  0%,100%{transform:translate(0,0)} 
  50%{transform:translate(20px,15px)} 
}
```
**Used for:** Background orb glow in Step 1

---

## 6. LOADING STATE FLOW (Step 5A - Lines 441-566)

### Phase 1: Initial Render (Lines 462-490)
- Shows loading spinner container
- Displays first loading message: "Reading your style DNA..."
- Fetches AI result from Vercel pipeline

### Phase 2: Message Rotation (Lines 493-495)
- Every 4 seconds, message updates
- 5 total messages cycle through
- Continues until API response received

### Phase 3: Success (Lines 513-544)
- API returns image URL
- `mnw-loading-state` hidden (`display:none`)
- Result image displayed
- Badge shown
- Info box revealed
- "Upload Wardrobe Pic" button enabled

### Phase 4: Error Handling (Lines 546-552)
- If API fails, loading state hidden
- Error message displayed
- Retry button provided

---

## 7. STEP 5B: SCANNING ANIMATION

**Function:** `renderStep5B()`
**Lines:** 568-604

### Scanning Screen HTML Structure:
```html
<div class="mnw-step">
  <div class="mnw-step-hdr">
    <h2 class="mnw-step-title">Scanning your wardrobe…</h2>
  </div>
  <div class="mnw-scan-wrap">
    <img class="mnw-result-img" src="${state.wardrobeBase64}" alt="Wardrobe"
         onerror="this.src='https://images.unsplash.com/photo-1542272604-787c3835535d?w=480&h=640&fit=crop'"/>
    <div class="mnw-scan-overlay">
      <div class="mnw-scan-line"></div>
      <div class="mnw-scan-corner mnw-sc-tl"></div>
      <div class="mnw-scan-corner mnw-sc-tr"></div>
      <div class="mnw-scan-corner mnw-sc-bl"></div>
      <div class="mnw-scan-corner mnw-sc-br"></div>
    </div>
    <span class="mnw-result-badge">🔍 Extracting Items…</span>
  </div>
  <p class="mnw-scan-label">Digitizing into your closet…</p>
  <div class="mnw-mini-closet" id="mnw-mini-closet"></div>
</div>
```

### Scanning Overlay Components:
| Element | Purpose | Animation |
|---------|---------|-----------|
| `.mnw-scan-line` | Vertical scanning beam | `mnw-scan` (1.8s) - travels top to bottom |
| `.mnw-scan-corner` (4x) | Corner brackets | Static (positioned) |
| `.mnw-result-badge` | "🔍 Extracting Items…" | None |

### Closet Items Pop-In (Lines 592-602):
```javascript
MOCK_WARDROBE.forEach((item, i) => {
  setTimeout(() => {
    if (!row) return;
    const div = document.createElement('div');
    div.className = 'mnw-closet-item mnw-pop-in';
    div.innerHTML = `<img class="mnw-closet-item-img" src="${item.img}" alt="${item.label}" onerror="this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=150&h=200&fit=crop'"/><p class="mnw-closet-item-lbl">${item.label}</p>`;
    row.appendChild(div);
    state.closetCount++;
    updateClosetCount();
  }, (i + 1) * 900);  // Each item appears 900ms apart
});
```

**Items added at:** 900ms, 1800ms, 2700ms, 3600ms (4 items total)
**Animation class:** `.mnw-pop-in` (0.4s scale + fade)

---

## 8. SUMMARY TABLE

| Component | File | Lines | Animation | Duration | Notes |
|-----------|------|-------|-----------|----------|-------|
| **Loading Spinner** | JS | 471 | `mnw-spin` | 0.8s | **MISSING CSS DEFINITION** |
| **Loading Text** | JS | 472 | fade (via display) | varies | Rotates messages every 4s |
| **Scan Line** | CSS | 152-153 | `mnw-scan` | 1.8s | Vertical beam travels top→bottom |
| **Pop-In Items** | CSS | 164-165 | `mnw-pop` | 0.4s | Scale 0.7→1, opacity 0→1 |
| **Gap Pulse** | CSS | 168-169 | `mnw-gap-pulse` | 2s | Box-shadow expansion (red) |
| **Step Fade-In** | CSS | 73-74 | `mnw-fade-in` | 0.35s | All steps fade in on load |
| **Background Orb** | CSS | 87-90 | `mnw-drift` | 8s | Floating background glow |

---

## 9. REQUIRED FIX

**Add this CSS rule to the stylesheet:**

```css
@keyframes mnw-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

**Location:** Can be added anywhere in `MN-fashion-consultant.css`, recommend near other animation definitions (around line 165 after `@keyframes mnw-pop`)

---

## 10. COLOR PALETTE

| Element | Color | Usage |
|---------|-------|-------|
| **Spinner Fill** | `#39A596` | Brand teal (animated border-top) |
| **Spinner Track** | `rgba(57,165,150,0.2)` | Light teal border |
| **Loading Text** | `rgba(255,255,255,0.5)` | 50% white |
| **Container BG** | `rgba(255,255,255,0.03)` | Glass morphism background |
| **Container Border** | `rgba(255,255,255,0.08)` | Glass morphism border |
| **Gap (error)** | `#ef4444` | Red for "Missing" indicator |

---

## File References
- **JavaScript:** `C:/Users/Admin/ref/assets/MN-fashion-consultant.js`
- **CSS:** `C:/Users/Admin/ref/assets/MN-fashion-consultant.css`

---

**Generated:** Complete documentation of AI Stylist loading animations
**Status:** Missing `@keyframes mnw-spin` CSS definition - requires addition for spinner to animate properly
