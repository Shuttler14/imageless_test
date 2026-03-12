# AI STYLIST - "Generating your main character look" Investigation Report

## ISSUE SUMMARY
The "Generating your main character look" feature (Step 5A) makes an API call to the `/api/stylist_pipeline` endpoint but likely fails due to missing or unreachable backend implementation.

---

## 1. FRONTEND API CONFIGURATION

### File: `ref/sections/MN-fashion-consultant.liquid` (Lines 116-119)
```javascript
window.MN_CONFIG = {
  apiUrl: "https://mynarrative-ai.vercel.app/api/stylist_pipeline",
  studioUrl: "/pages/ai-studio"
};
```

**Configuration Details:**
- **API URL:** `https://mynarrative-ai.vercel.app/api/stylist_pipeline`
- **Method:** POST
- **Expected Response Format:** JSON with `success` flag and image/editorial data

---

## 2. FETCH/GENERATION FUNCTION - COMPLETE CODE

### File: `ref/assets/MN-fashion-consultant.js`
### Function: `renderStep5A()` (Lines 441-566)

#### Part A: Setup & HTML Rendering (Lines 441-490)
```javascript
function renderStep5A() {
  state.step = 5; state.step5State = 'A';
  const selectedLabels = state.selectedAesthetics.map(id => AESTHETICS.find(a => a.id === id)?.style || id).join(' / ');

  // Map aesthetic -> vibe_id for Vercel pipeline
  const vibeMap = {
    old_money_m:'quiet_luxury', street_m:'sarcastic_rizzler',
    indo_western_m:'main_character', corporate_m:'caffeine_survivor',
    minimalist_f:'quiet_luxury', y2k_f:'sarcastic_rizzler',
    cyberpunk_f:'main_character', casual_f:'caffeine_survivor',
  };
  const vibeId = vibeMap[state.selectedAesthetics[0]] || 'caffeine_survivor';

  // Map occasion -> occasion_id for Vercel pipeline
  const occMap = {
    office:'office', date:'date_night', sangeet:'sangeet',
    airport:'airport_look', gym:'date_night', college:'office',
    pooja:'sangeet', casual:'date_night',
  };
  const occasionId = occMap[state.selectedOccasions[0]] || 'date_night';

  // Renders loading UI with rotating messages
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

#### Part B: Loading State & Base64 Conversion (Lines 492-503)
```javascript
  // Rotating loading messages
  const msgs = ['Reading your style DNA...','Analysing skin tone & body type...','Matching your vibe...','FLUX is painting your outfit...','Final touches...'];
  let mi = 0;
  const msgInt = setInterval(() => { const el = $('#mnw-loading-text'); if (el && msgs[++mi]) el.textContent = msgs[mi]; }, 4000);

  // Extract raw base64 (remove data: URI prefix)
  const rawBase64 = state.selfieBase64 ? state.selfieBase64.replace(/^data:image\/\w+;base64,/, '') : null;
  if (!rawBase64) {
    clearInterval(msgInt);
    const e = $('#mnw-api-error'); if (e) { e.style.display='block'; e.textContent='No photo found. Please go back and upload your selfie.'; }
    const ls = $('#mnw-loading-state'); if (ls) ls.style.display='none';
    return;
  }

  const userId = (window.MN_CONFIG && window.MN_CONFIG.customerId) ? String(window.MN_CONFIG.customerId) : 'guest_' + Math.random().toString(36).slice(2,9);
```

#### Part C: THE CRITICAL FETCH CALL (Lines 507-552)
```javascript
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action:'full_pipeline', user_id:userId, occasion:occasionId, vibe_id:vibeId, user_image:rawBase64 }),
  })
  .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error || ('Server error ' + r.status))))
  .then(data => {
    clearInterval(msgInt);
    if (!data.success) throw new Error(data.error || 'Pipeline failed');
    state.pipelineResult = data;
    state.affiliateRecs = data.affiliate_upsells || [];

    const imgUrl = (data.editorial && data.editorial.final_image_url) ||
                   (data.final_image_base64 ? 'data:image/jpeg;base64,' + data.final_image_base64 : null);

    const ls = $('#mnw-loading-state'), imgEl = $('#mnw-result-img'), badge = $('#mnw-result-badge');
    const info = $('#mnw-result-info'), ub = $('#mnw-upload-wardrobe'), title = $('#mnw-result-title');

    if (imgUrl && imgEl) {
      imgEl.src = imgUrl;
      imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=480&h=640&fit=crop'; };
      imgEl.onload = () => {
        if (ls) ls.style.display = 'none';
        imgEl.style.display = 'block';
        if (badge) badge.style.display = 'block';
        if (info) info.style.display = 'block';
        if (ub) ub.style.display = 'flex';
        if (title && data.biometrics) {
          const bt = data.biometrics.body_type || 'your build';
          const vl = (data.editorial && data.editorial.vibe && data.editorial.vibe.label) || selectedLabels || 'your vibe';
          title.textContent = 'This is your ' + bt + ' in ' + vl + ' energy.';
        }
      };
    } else {
      if (ls) ls.style.display = 'none';
      if (info) info.style.display = 'block';
      if (ub) ub.style.display = 'flex';
    }
  })
  .catch(err => {
    clearInterval(msgInt);
    console.error('[MN] Pipeline error:', err);
    const ls = $('#mnw-loading-state'), errEl = $('#mnw-api-error');
    if (ls) ls.style.display = 'none';
    if (errEl) { errEl.style.display='block'; errEl.innerHTML='Something went wrong: ' + err + '. <button onclick="renderStep5A()" style="color:#39A596;background:none;border:none;cursor:pointer;font-weight:700">Retry</button>'; }
  });
```

#### Part D: Wardrobe Upload Handler (Lines 554-565)
```javascript
  setTimeout(() => {
    const wb = $('#mnw-upload-wardrobe'), wi = $('#mnw-wardrobe-input');
    if (wb && wi) {
      wb.addEventListener('click', () => wi.click());
      wi.addEventListener('change', function() {
        if (!this.files[0]) return;
        const r = new FileReader();
        r.onload = (e) => { state.wardrobeBase64 = e.target.result; renderStep5B(); };
        r.readAsDataURL(this.files[0]);
      });
    }
  }, 300);
}
```

---

## 3. DATA SENT TO API

### Request Format:
```json
{
  "action": "full_pipeline",
  "user_id": "guest_[random_string]",  // or customerId from window.MN_CONFIG
  "occasion": "[mapped_occasion_id]",
  "vibe_id": "[mapped_vibe_id]",
  "user_image": "[base64_jpeg_without_data_uri_prefix]"
}
```

### Field Details:

| Field | Type | Source | Example |
|-------|------|--------|---------|
| `action` | string | Hardcoded | `"full_pipeline"` |
| `user_id` | string | Generated or from config | `"guest_abc12345"` |
| `occasion` | string | Mapped from Step 3 selection | `"office"`, `"date_night"`, `"sangeet"` |
| `vibe_id` | string | Mapped from Step 2 aesthetic | `"quiet_luxury"`, `"main_character"` |
| `user_image` | string (base64) | Step 4 selfie (no prefix) | `"iVBORw0KGgoAAAANSUhEUgAAAAEA..."` |

### Occasion Mapping (Line 455-460):
```
college  → office
office   → office
pooja    → sangeet
sangeet  → sangeet
date     → date_night
airport  → airport_look
gym      → date_night
casual   → date_night
```

### Vibe ID Mapping (Line 446-451):
```
old_money_m      → quiet_luxury
street_m         → sarcastic_rizzler
indo_western_m   → main_character
corporate_m      → caffeine_survivor
minimalist_f     → quiet_luxury
y2k_f            → sarcastic_rizzler
cyberpunk_f      → main_character
casual_f         → caffeine_survivor
(default)        → caffeine_survivor
```

---

## 4. EXPECTED RESPONSE FORMAT

### Success Response Structure:
```json
{
  "success": true,
  "editorial": {
    "final_image_url": "https://...",
    "vibe": {
      "label": "Your Aesthetic Label"
    }
  },
  "final_image_base64": null,  // Alternative to final_image_url
  "biometrics": {
    "body_type": "Athletic / Curvy / Petite / etc"
  },
  "affiliate_upsells": [
    // Array of product recommendations
  ]
}
```

### Response Handling (Lines 519-544):
1. Checks `data.success === true`
2. Extracts image URL from either:
   - `data.editorial.final_image_url` (preferred), OR
   - `data.final_image_base64` (converted to data URI)
3. Extracts body type from `data.biometrics.body_type`
4. Extracts vibe label from `data.editorial.vibe.label`
5. Falls back to Unsplash image if both URLs are missing

### Error Handling (Lines 546-552):
- HTTP errors: Attempts to extract error message from response
- Network/parse errors: Caught by `.catch()` block
- Displays error message in `#mnw-api-error` element
- Provides "Retry" button via `onclick="renderStep5A()"`

---

## 5. BACKEND IMPLEMENTATION STATUS

### Current Status: **NOT FOUND**
- **Expected Location:** `https://mynarrative-ai.vercel.app/api/stylist_pipeline`
- **Fallback Location:** `/api/stylist_pipeline` (relative to Shopify theme)
- **Found in Workspace:** ❌ No backend implementation exists in `ref/` directory

### API Contract Expected by Frontend:
1. **Endpoint:** `POST /api/stylist_pipeline`
2. **Required Inputs:** `action`, `user_id`, `occasion`, `vibe_id`, `user_image`
3. **Required Outputs:** `success`, `editorial`, `biometrics`, optional `final_image_base64`

---

## 6. OBVIOUS BUGS & ISSUES

### 🔴 CRITICAL ISSUES:

#### Issue #1: Backend API Not Implemented
- **Severity:** BLOCKING
- **Location:** Lines 507-511
- **Problem:** The frontend calls `https://mynarrative-ai.vercel.app/api/stylist_pipeline` but no backend code exists
- **Evidence:** No `api/stylist_pipeline.py` or similar found in workspace
- **Impact:** Feature is completely non-functional
- **Fix Required:** Implement backend API or provide correct endpoint

#### Issue #2: Incomplete Vibe ID Mapping
- **Severity:** MEDIUM
- **Location:** Lines 446-451
- **Problem:** Only 8 aesthetics mapped; 16 total aesthetics exist (8 men + 8 women)
- **Missing Mappings:**
  - `athleisure_m`, `denimcore_m`, `resort_m`, `techwear_m` (men)
  - `power_suit_f`, `boho_f`, `coquette_f`, `quietlux_f` (women)
- **Impact:** If user selects unmapped aesthetic, defaults to `caffeine_survivor`
- **Fix Required:** Complete the vibe mapping for all 16 aesthetics

#### Issue #3: No Fallback for Missing Images
- **Severity:** LOW
- **Location:** Lines 525-527
- **Problem:** If API returns no image URL, code silently hides loading and shows empty container
- **Expected Behavior:** Should display fallback message or retry button
- **Current Behavior:** Results UI shows but no image loads

---

### 🟡 POTENTIAL ISSUES:

#### Issue #4: Base64 Image Size Not Validated
- **Location:** Lines 497-502
- **Problem:** No check for base64 string length before sending
- **Risk:** Large images (>10MB) converted to base64 could exceed request size limits
- **Recommendation:** Add size validation before fetch

#### Issue #5: No Request Timeout
- **Location:** Lines 507-511
- **Problem:** Fetch has no timeout; could hang indefinitely if API doesn't respond
- **Recommendation:** Add `AbortController` with 30s timeout

#### Issue #6: Biometrics Data Assumed in Response
- **Location:** Lines 534-537
- **Problem:** Code assumes `data.biometrics.body_type` exists; will crash if missing
- **Safe Path:** Already has fallback: `data.biometrics.body_type || 'your build'`
- **Status:** ✅ This is already safe

#### Issue #7: Editorial Data Structure Assumption
- **Location:** Lines 519-536
- **Problem:** Assumes `data.editorial.vibe.label` exists but doesn't validate
- **Current Code:** Falls back to `selectedLabels || 'your vibe'` ✅
- **Status:** ✅ This is already safe

---

## 7. DEBUGGING CHECKLIST

### To Verify the Issue:
1. **Check Network Tab:**
   - Does the fetch request reach the API endpoint?
   - What is the response status? (200, 404, 500, etc.)
   - What is the response body?

2. **Check Browser Console:**
   - Any CORS errors?
   - Any JavaScript errors in the `.catch()` block?
   - Is `console.error('[MN] Pipeline error:', err)` logged? (Line 548)

3. **Verify Frontend is Correct:**
   - Can you upload a selfie (Step 4)?
   - Does loading state animation start?
   - Does error message appear after ~5 seconds?

4. **Verify API Endpoint:**
   - Is `https://mynarrative-ai.vercel.app/api/stylist_pipeline` accessible?
   - Test with `curl -X POST https://mynarrative-ai.vercel.app/api/stylist_pipeline -H "Content-Type: application/json" -d '{"action":"full_pipeline"}'`
   - What error do you get? (404, 500, timeout, etc.)

---

## 8. RECOMMENDATIONS

### Immediate Actions:
1. **Implement Backend API** - Create the `/api/stylist_pipeline` endpoint to accept the documented request format
2. **Complete Vibe Mapping** - Add mappings for all 16 aesthetics (not just 8)
3. **Add Request Timeout** - Use `AbortController` with 30-second timeout
4. **Validate Image Size** - Reject selfies >5MB before sending

### Backend Implementation Checklist:
- [ ] Accept POST request with JSON body
- [ ] Validate all required fields present
- [ ] Process user image (base64 JPEG)
- [ ] Generate or fetch outfit image based on vibe + occasion
- [ ] Extract biometrics (body type detection)
- [ ] Return JSON with success flag and image data
- [ ] Handle errors gracefully with descriptive messages
- [ ] Log requests for debugging

### Testing Plan:
1. Upload selfie image
2. Select vibe and occasion
3. Monitor Network tab for API response
4. Verify image loads in Step 5A
5. Test with various vibes and occasions
6. Test error scenarios (no image, bad API, timeout)

---

## 9. FILES MODIFIED

**None yet** - This is a report of the current state. Implementation will require:
1. Backend API creation (`/api/stylist_pipeline` or equivalent)
2. Frontend fix to complete vibe mapping
3. Frontend enhancement for better error handling

---

**Report Generated:** Investigation Complete
**Status:** Issue Identified - Backend Not Implemented
**Priority:** 🔴 CRITICAL - Feature Blocked
