# Gift Mode Main Logic Implementation Guide

## Overview
This guide shows exactly what code to add/update in your **Design Page** (the Shopify page that uses the `page.ai-studio.liquid` template). The receiver script is already updated in the template, but these changes need to be made in the page content itself.

---

## Part 1: Receiver Script ✅

**File:** `templates/page.ai-studio.liquid`

**Status:** ✅ Already updated with enhanced version

The receiver now:
- Sets `state.isGiftMode = true`
- Stores `state.giftContext` with full recipient/occasion data
- Changes psychological headers in Step 3
- Auto-skips to Step 3

---

## Part 2: Main Logic Updates (Required in Page Content)

These updates go in the main `<script>` tag of your design page content.

### Update 1: `checkAIReady()` Function

**Purpose:** Allow Gift Mode users to proceed without selecting a Vibe (it's derived from context instead)

**Find this function and replace it:**

```javascript
function checkAIReady() {
    // If Gift Mode: We only need Color & Placement (Vibe comes from context)
    if (state.isGiftMode) {
        if (state.aiColor && state.aiPlacement) {
            aiGenerateBtn.classList.add('ready');
        } else {
            aiGenerateBtn.classList.remove('ready');
        }
    } 
    // Standard Mode: We need all 3
    else {
        if (state.aiColor && state.aiPlacement && state.aiVibe) {
            aiGenerateBtn.classList.add('ready');
        } else {
            aiGenerateBtn.classList.remove('ready');
        }
    }
}
```

**What this does:**
- Gift Mode: Only requires Color + Placement (2 selections)
- Self Mode: Requires Color + Placement + Vibe (3 selections)

---

### Update 2: `aiChoice` Click Listener

**Purpose:** Hide the "Which vibe feels like you?" question for Gift Mode users

**Find this event listener and update it:**

```javascript
// AI Overlay Logic
aiChoice.addEventListener('click', () => { 
    aiOverlay.classList.add('active'); 
    preferencesDrawer.classList.remove('expanded'); 
    
    // HIDE VIBE QUESTION FOR GIFT MODE
    const allQuestions = document.querySelectorAll('.ai-question');
    if (state.isGiftMode && allQuestions.length >= 3) {
        allQuestions[2].style.display = 'none'; // Hides the 3rd question (Vibe)
        console.log("🎁 Hiding Vibe question for Gift Mode");
    } else if (allQuestions.length >= 3) {
        allQuestions[2].style.display = 'block'; // Show for normal users
    }
});
```

**What this does:**
- Hides the 3rd AI question (Vibe) when in Gift Mode
- Shows all questions for normal users

**Note:** This assumes your HTML has questions in this order:
1. Color (1st)
2. Placement (2nd)  
3. Vibe (3rd) ← Hidden for Gift Mode

---

### Update 3: `aiGenerateBtn` Click Listener

**Purpose:** Use gift context to generate style instead of user-selected vibe

**Find this event listener and update the style selection logic:**

```javascript
// AI GENERATE CLICK
aiGenerateBtn.addEventListener('click', () => {
  if(!aiGenerateBtn.classList.contains('ready')) return;
  aiOverlay.classList.remove('active');
  
  state.color = state.aiColor;
  if(state.aiPlacement === 'front') { 
    state.side1.placement = 'chest'; 
  } else { 
    state.side1.placement = 'back-full'; 
  }

  // ══════════════════════════════════════════════
  // NEW LOGIC: PREPARE STYLE STRING
  // ══════════════════════════════════════════════
  
  if (state.isGiftMode && state.giftContext) {
      // 🎁 GIFT MODE: Construct detailed prompt from context
      const ctx = state.giftContext;
      // Example: "Birthday gift for Partner. Unspoken: I love you. Vibe: Romantic"
      state.selectedStyle = `Gift Design for ${ctx.recipient} on ${ctx.occasion}. Context: ${ctx.unspoken || 'None'}. Style: Emotionally resonant and visually premium.`;
      state.toneKey = "emotionally real"; // Default tone for gifts
      
      console.log("🎁 Gift Mode Style:", state.selectedStyle);
  } else {
      // 👤 SELF MODE: Map Vibe (Your existing switch case)
      switch(state.aiVibe) {
          case 'calm': 
            state.selectedStyle = "Minimalist Type"; 
            state.toneKey = "stoic"; 
            break;
          case 'bold': 
            state.selectedStyle = "Cyberpunk Neon"; 
            state.toneKey = "unapologetic"; 
            break;
          case 'disciplined': 
            state.selectedStyle = "Minimalist Type"; 
            state.toneKey = "hustle"; 
            break;
          case 'free': 
            state.selectedStyle = "Vintage 90s"; 
            state.toneKey = "retro"; 
            break;
          case 'dark': 
            state.selectedStyle = "Cyberpunk Neon"; 
            state.toneKey = "darkhumour"; 
            break;
          case 'light': 
            state.selectedStyle = "Y2K Chrome"; 
            state.toneKey = "healing"; 
            break;
          default: 
            state.selectedStyle = "Minimalist Type"; 
            state.toneKey = "stoic";
      }
      
      console.log("👤 Self Mode Style:", state.selectedStyle);
  }
  
  autoGenerate(); 
});
```

**What this does:**
- Gift Mode: Creates rich prompt from recipient, occasion, and message
- Self Mode: Uses the traditional vibe-to-style mapping

---

## HTML Verification

Make sure your AI questions are in this order in the HTML:

```html
<!-- 1st question - COLOR -->
<div class="ai-question" id="color-question">
  <h3>What color feels right?</h3>
  <!-- color options -->
</div>

<!-- 2nd question - PLACEMENT -->
<div class="ai-question" id="placement-question">
  <h3>Where should it live?</h3>
  <!-- placement options -->
</div>

<!-- 3rd question - VIBE (will be hidden for Gift Mode) -->
<div class="ai-question" id="vibe-question">
  <h3>Which of these feels like you?</h3>
  <!-- vibe options -->
</div>
```

---

## Testing Checklist

### Gift Mode Flow:
1. ✅ Select slogan in widget → Click "Design This Slogan"
2. ✅ Design page loads with changed headers
3. ✅ Auto-skips to Step 3
4. ✅ Vibe question is hidden
5. ✅ Can generate with just Color + Placement
6. ✅ AI uses gift context in prompt

### Self Mode Flow:
1. ✅ Normal page load without gift data
2. ✅ All 3 questions visible (Color, Placement, Vibe)
3. ✅ Requires all 3 to generate
4. ✅ AI uses vibe-to-style mapping

---

## Where to Make These Changes

**Option 1: Shopify Admin**
1. Go to **Pages** → **create-your-design**
2. Edit the page content
3. Find the `<script>` tag with your main logic
4. Update the 3 functions as shown above

**Option 2: Theme Files** (if logic is in a section)
1. Check `sections/` folder for design page logic
2. Update the functions in the appropriate section file

---

## Summary of Changes

| Function | Change | Why |
|----------|--------|-----|
| `checkAIReady()` | Gift Mode only needs 2 selections | Vibe comes from context |
| `aiChoice` listener | Hide Vibe question for gifts | Not relevant for gifts |
| `aiGenerateBtn` listener | Use gift context for prompt | Personalized for recipient |

---

## Example Gift Context Prompt

**Input:**
- Recipient: "👨 Brother"
- Occasion: "🎂 Birthday"  
- Unspoken: "You inspire me every day"

**Generated Prompt:**
```
"Gift Design for 👨 Brother on 🎂 Birthday. Context: You inspire me every day. Style: Emotionally resonant and visually premium."
```

This gives the AI much richer context than just a generic vibe!
