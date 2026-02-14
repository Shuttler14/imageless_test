# 🎁 Gift Flow API Integration Guide

## Overview
The GIFT flow now mimics the **CREATE YOUR OWN DESIGN** experience by showing **editable slogans** instead of generic suggestions.

---

## 📡 Backend API Requirements

### **Endpoint**: `/api/fashion_consultant`

### **Request Payload** (Gift Mode)
```json
{
  "identity": {
    "coreExpression": "Calm & Minimal",
    "presence": "Thoughtful Introvert",
    "signal": "Healing Era"
  },
  "currentContext": {
    "mode": "gift",
    "recipient": "👨 Brother",
    "occasion": "🎂 Birthday",
    "unspoken": "You're my rock, always there for me"
  }
}
```

### **Response Format** (Gift Mode with Slogans)
```json
{
  "direction": "For a Birthday gift for your Brother, focus on meaningful designs that reflect strength, support, and brotherhood. Since your unspoken message is 'You're my rock, always there for me', consider slogans that celebrate resilience and loyalty.",
  
  "slogans": [
    "UNSHAKEABLE BOND",
    "BUILT DIFFERENT",
    "STRENGTH IN SILENCE",
    "ALWAYS YOUR ANCHOR"
  ],
  
  "suggestions": [
    "Choose neutral tones like charcoal, navy, or forest green",
    "Opt for minimalist typography with bold statement",
    "Consider premium fabric for lasting quality"
  ],
  
  "recommended_style": "Minimalist Bold",
  "primary_color": "#1a1a1a"
}
```

---

## 🔑 Key Changes from Previous Flow

### **BEFORE** (Generic Suggestions)
```json
{
  "direction": "Some generic advice...",
  "suggestions": ["Buy this", "Try that"]
}
```

### **AFTER** (Editable Slogans)
```json
{
  "direction": "Personalized gift advice based on recipient and occasion",
  "slogans": ["SLOGAN 1", "SLOGAN 2", "SLOGAN 3", "SLOGAN 4"],
  "suggestions": ["Design tips"],
  "recommended_style": "Style name",
  "primary_color": "#hexcolor"
}
```

---

## 🤖 GPT-4 Prompt Example for Gift Mode

```javascript
// In your /api/fashion_consultant endpoint:

if (currentContext.mode === 'gift') {
  const gptPrompt = `
You are an AI fashion design consultant specializing in personalized gift apparel.

USER PROFILE:
- Core Expression: ${identity.coreExpression}
- Presence: ${identity.presence}
- Current Signal: ${identity.signal}

GIFT DETAILS:
- Recipient: ${currentContext.recipient}
- Occasion: ${currentContext.occasion}
- Unspoken Message: ${currentContext.unspoken || 'Not specified'}

Create a thoughtful gift design recommendation with 4 edgy streetwear-style slogans 
that capture the essence of this relationship and occasion. 

The slogans should be:
- Short and impactful (2-5 words)
- Meaningful to the recipient
- Suitable for premium streetwear (think Supreme, Off-White style)
- Related to the occasion and unspoken message

Return ONLY this JSON structure:
{
  "direction": "A personalized paragraph about what design approach to take for this gift",
  "slogans": ["SLOGAN 1", "SLOGAN 2", "SLOGAN 3", "SLOGAN 4"],
  "suggestions": ["Tactical design tip 1", "Tactical design tip 2", "Tactical design tip 3"],
  "recommended_style": "Style name (e.g., Minimalist Bold, Vintage Grunge)",
  "primary_color": "#hexcolor"
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: gptPrompt }],
    temperature: 0.8
  });

  return JSON.parse(response.choices[0].message.content);
}
```

---

## 📋 Frontend Flow (Already Implemented)

1. ✅ User selects recipient + occasion + unspoken message
2. ✅ Clicks "Get AI Recommendations"
3. ✅ Backend returns `{ direction, slogans, suggestions }`
4. ✅ **NEW**: Frontend shows editable slogan input with first slogan
5. ✅ **NEW**: Shows 3 alternative slogans as clickable buttons
6. ✅ User can edit slogan or click alternative
7. ✅ Clicks "Generate Artwork"
8. ✅ Data saved to `localStorage` with key `mn_gift_design_data`
9. ✅ Redirects to `/pages/create-your-own-design`

---

## 🎨 Design Page Integration

The design page should check for gift data on load:

```javascript
// On /pages/create-your-own-design page load:

const giftData = localStorage.getItem('mn_gift_design_data');

if (giftData) {
  const data = JSON.parse(giftData);
  
  console.log('Gift Mode Detected!');
  console.log('Recipient:', data.recipient);
  console.log('Occasion:', data.occasion);
  console.log('Slogan:', data.slogan);
  console.log('Style:', data.aiProfile.recommended_style);
  
  // Pre-fill the design canvas with:
  // - Selected slogan
  // - Recommended color scheme
  // - Suggested style
  
  // Clear after 1 hour (optional)
  const age = Date.now() - data.timestamp;
  if (age > 3600000) { // 1 hour
    localStorage.removeItem('mn_gift_design_data');
  }
}
```

---

## 🧪 Testing the Complete Flow

### **Test Case 1: Birthday Gift for Brother**
```javascript
// Expected Input:
{
  mode: 'gift',
  recipient: '👨 Brother',
  occasion: '🎂 Birthday',
  unspoken: 'You inspire me every day'
}

// Expected Output (from API):
{
  direction: "Celebrate your brother's birthday with a design that honors his impact on your life...",
  slogans: [
    "LEGEND IN THE MAKING",
    "BROTHERHOOD FOREVER",
    "BUILT TO INSPIRE",
    "YOUR LEGACY LIVES"
  ],
  suggestions: [
    "Use bold typography with subtle texture",
    "Choose colors that match his personal style",
    "Consider adding a small symbolic graphic element"
  ],
  recommended_style: "Bold Modern",
  primary_color: "#000000"
}
```

### **Test Case 2: Anniversary Gift for Partner**
```javascript
// Expected Input:
{
  mode: 'gift',
  recipient: '💑 Partner',
  occasion: '💍 Anniversary',
  unspoken: 'Every moment with you is magic'
}

// Expected Output:
{
  direction: "Create an anniversary gift that captures the magic of your relationship...",
  slogans: [
    "TIMELESS LOVE",
    "FOREVER BEGINS TODAY",
    "MY SAFE PLACE",
    "WRITTEN IN THE STARS"
  ],
  recommended_style: "Romantic Minimal",
  primary_color: "#8B6F7E"
}
```

---

## 🚀 Deployment Checklist

- [ ] Update Vercel `/api/fashion_consultant` to detect `mode: 'gift'`
- [ ] Add GPT-4 prompt for gift-specific slogan generation
- [ ] Ensure API returns `slogans` array (4 items minimum)
- [ ] Test API response format matches expected structure
- [ ] Deploy updated Shopify theme files:
  - `MN-fashion-consultant.js` (✅ Already updated)
  - `MN-fashion-consultant.css` (✅ Already updated)
- [ ] Update `/pages/create-your-own-design` to read `mn_gift_design_data`
- [ ] Test complete flow: Gift selection → Slogan editing → Design page

---

## 📝 Notes

- The slogan input is **fully editable** - users can type anything
- Alternative slogans are **clickable** for quick selection
- Data persists in `localStorage` with 2 keys:
  - `mn_gift_design_data` (full gift context)
  - `mn_active_design_prompt` (legacy compatibility)
- The flow is now **identical** to CREATE YOUR OWN DESIGN
- Mobile-responsive styles already included

---

## ❓ Need Help?

If you need assistance updating your Vercel API, provide:
1. Your current API code structure
2. Which AI service you're using (OpenAI, Anthropic, etc.)
3. Any error messages you encounter

The frontend is **100% ready** - just update your backend to return `slogans`! 🎉
