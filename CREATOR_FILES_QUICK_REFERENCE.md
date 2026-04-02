# Creator Program - Files Quick Reference Guide

## File Structure Overview

```
C:/Users/Admin/current/
├── templates/
│   ├── page.become-creator.liquid          ← Main signup page
│   ├── page.creator-dashboard.liquid       ← Creator workspace
│   ├── page.creator-onboarding.liquid      ← Onboarding flow
│   ├── page.creator-verification.liquid    ← Admin verification
│   ├── page.affiliate-program.json         ← Affiliate signup
│   └── page.featured-creators.liquid       ← Showcase page
│
├── sections/
│   ├── become-creator-enhanced.liquid          [1043 lines]
│   ├── creator-dashboard-enhanced.liquid       [1326 lines]
│   ├── creator-dashboard.liquid                [1920 lines]
│   ├── creator-onboarding-flow.liquid          [924 lines]
│   ├── creator-account-portal.liquid           [255 lines]
│   ├── creator-verification-admin.liquid       [897 lines]
│   ├── featured-creators-enhanced.liquid       [593 lines]
│   ├── featured-creators.liquid                [varies]
│   ├── creator-post-purchase-cta.liquid        [varies]
│   ├── product-creator-badge.liquid            [varies]
│   ├── trending-creator-designs.liquid         [varies]
│   └── creator-utility-nav.liquid              [varies]
│
└── config/
    └── settings_data.json                  ← Theme settings
```

---

## 1. BECOME A CREATOR PAGE

| Item | Details |
|------|---------|
| **Primary File** | `C:/Users/Admin/current/templates/page.become-creator.liquid` |
| **Section File** | `C:/Users/Admin/current/sections/become-creator-enhanced.liquid` |
| **Access URL** | `/pages/become-creator` |
| **Status** | ✅ Active |
| **Lines of Code** | 1043 |
| **Purpose** | Landing page to recruit new creators |

### Key Sections in become-creator-enhanced.liquid
```
Lines 0-790      → CSS Styling & Animations
Lines 790-817    → HTML Structure Start
Lines 798-817    → Hero Section
Lines 820-844    → Earnings Preview
Lines 847-879    → Payment Info Cards
Lines 882-899    → Why Join Features
Lines 911-1043   → Elite Section + Schema
```

### Content Breakdown
- **Hero**: Turn Your Creativity Into Income
- **Earnings Grid**: ₹25K / ₹75K / ₹2L+ (Bronze/Silver/Gold)
- **Commission**: 15% per sale, instant payouts
- **Elite Section**: Premium social platform tiers
- **Call-to-Action**: Register button linking to `/account/register`

### Important CSS Classes
- `.bc-hero` - Hero container
- `.bc-earnings` - Earnings preview section
- `.bc-payment-info` - Commission explanation
- `.bc-elite` - Elite creator section
- `.bc-sticky-cta` - Mobile sticky button
- `.bc-elite-platform-icon.instagram|youtube|twitter|linkedin` - Social platforms

---

## 2. CREATOR DASHBOARD

### Primary Version (Recommended)
| Item | Details |
|------|---------|
| **File** | `C:/Users/Admin/current/sections/creator-dashboard-enhanced.liquid` |
| **Template** | `C:/Users/Admin/current/templates/page.creator-dashboard.liquid` |
| **Access URL** | `/pages/creator-dashboard` |
| **Status** | ✅ Active (Enhanced UI) |
| **Lines** | 1326 |
| **Auth Required** | Yes (customer.id must exist) |

### Alternative Version (Legacy)
| Item | Details |
|------|---------|
| **File** | `C:/Users/Admin/current/sections/creator-dashboard.liquid` |
| **Status** | ✅ Active (Standard UI) |
| **Lines** | 1920 |
| **Features** | V3.0 - Buy-to-Publish model |
| **Version Notes** | Removed ₹2,500/₹5,000 minimum thresholds |

### Key Features (Both Versions)

#### Metrics Section
```liquid
{% comment %} 4 Metric Cards: Balance | Lifetime Earnings | Listings | Sales {% endcomment %}
- .mn-metric-card - Individual metric container
- .mn-metric-icon - Colored icon background
- .mn-metric-value - Display number
```

#### Creator Profile
```liquid
- .cd-avatar - Profile picture (auto-generated)
- .cd-avatar-status - Online indicator (green dot)
- .cd-welcome-text - Personalized greeting
- .cd-tier-badge - Current tier (bronze|silver|gold|diamond)
```

#### Social Integration
```liquid
- .mn-social-section - Social platforms container
- .mn-social-platform - Individual platform button
- .mn-social-platform.connected - Connected state
- .mn-social-platform-followers - Follower display
```

#### Creator Tiers
```javascript
// Tier Badge Classes:
.cd-tier-badge.bronze    // #CD7F32
.cd-tier-badge.silver    // #C0C0C0
.cd-tier-badge.gold      // #FFD700
.cd-tier-badge.diamond   // #00FFFF
.mn-creator-badge.mega   // Special premium badge
```

---

## 3. CREATOR ONBOARDING

| Item | Details |
|------|---------|
| **Template** | `C:/Users/Admin/current/templates/page.creator-onboarding.liquid` |
| **Section** | `C:/Users/Admin/current/sections/creator-onboarding-flow.liquid` |
| **Access URL** | `/pages/creator-onboarding` |
| **Auth Required** | Yes (signed-in users only) |
| **Lines** | 924 |
| **Completion Function** | `cofCompleteOnboarding()` |

### Steps Covered
1. Brand Setup (brand name, bio)
2. Social Verification (connect Instagram, YouTube, Twitter, LinkedIn)
3. Profile Completion (terms, verification)

### Key CSS Classes
```css
.cof-progress           → Progress indicator bar
.cof-progress-dot       → Step indicator (numbered)
.cof-progress-step.active/completed
.cof-card              → Form container
.cof-input-group       → Form field wrapper
.cof-header h1         → Step title
```

### JavaScript Functions
```javascript
cofCompleteOnboarding() {
  // 1. Validates all data
  // 2. Calls backend API
  // 3. Updates customer metafields
  // 4. Redirects to dashboard
}
```

### API Endpoint
- **Base URL**: `https://mynarrative-ai.vercel.app` (configurable)
- **Method**: POST to `/api/creators/onboarding`

---

## 4. AFFILIATE PROGRAM

| Item | Details |
|------|---------|
| **File** | `C:/Users/Admin/current/templates/page.affiliate-program.json` |
| **Access URL** | `/pages/affiliate-program` |
| **Status** | ✅ Active |
| **Format** | JSON (auto-generated by Shopify admin) |
| **Integration** | Collabs App (third-party) |

### Page Sections
```json
{
  "sections": {
    "title_cNyyM6": {           // Title section
      "type": "title",
      "settings": {
        "title": "Affiliate program",
        "subtitle": "Become our affiliate and Earn money",
        "description": "Become ambassador to a royal brand..."
      }
    },
    "collabs": {                 // Application form (Collabs App)
      "type": "apps",
      "blocks": {
        "483b3e93-...": {
          "type": "shopify://apps/collabs/..."
        }
      }
    },
    "rich_text_content_yWWL8N": { // Information sections
      "type": "rich-text-content",
      "blocks": {
        "text_block_yRGF7j": { "main_content": "Why Join..." },
        "text_block_hxMygc": { "main_content": "How It Works..." },
        "text_block_pPD47g": { "main_content": "Commission Structure..." },
        "text_block_bXArdh": { "main_content": "Requirements..." }
      }
    }
  }
}
```

### Commission Tiers (from page content)
```
Tier 1: ₹0 - ₹50,000          → 10% commission
Tier 2: ₹50,001 - ₹2,50,000   → 12% commission
Tier 3: ₹2,50,000+            → 15% + Early access to new launches
```

### Key Settings (Collabs Block)
- `button_text`: "Apply now"
- `button_background_color`: "#000000"
- `button_label_color`: "#ffffff"
- `link_color`: "#7ed957"

---

## 5. CREATOR VERIFICATION (ADMIN)

| Item | Details |
|------|---------|
| **Template** | `C:/Users/Admin/current/templates/page.creator-verification.liquid` |
| **Section** | `C:/Users/Admin/current/sections/creator-verification-admin.liquid` |
| **Access URL** | `/pages/creator-verification` |
| **Permission** | Admin only (requires customer tag: 'admin' or 'Admin') |
| **Lines** | 897 |
| **Purpose** | Review and approve creator applications |

### Access Control
```liquid
{% if customer.tags contains 'admin' or customer.tags contains 'Admin' %}
  {% assign is_admin = true %}
{% endif %}
```

### Admin Dashboard Features
```css
.cv-header           → Admin page title and stats
.cv-stats            → Statistics cards (pending, approved, rejected)
.cv-filters          → Filter buttons (Pending | Approved | Rejected | All)
.cv-applications     → List of applications
.cv-app-card         → Individual application card
.cv-actions          → Approve/Reject buttons
```

### JavaScript Functions
```javascript
cvFilter(filter) {
  // Filters applications by status: pending, approved, rejected, all
}

function approveCreator(creatorId) {
  // API call to approve application
}

function rejectCreator(creatorId) {
  // API call to reject application
}
```

### Color Coding
```
--cv-success: #22c55e  (Approved - Green)
--cv-danger:  #ef4444  (Rejected - Red)
--cv-warning: #f59e0b  (Pending - Orange)
```

---

## 6. CREATOR ACCOUNT PORTAL

| Item | Details |
|------|---------|
| **File** | `C:/Users/Admin/current/sections/creator-account-portal.liquid` |
| **Integration Point** | `C:/Users/Admin/current/templates/customers/account.json` |
| **Location** | Customer account page sidebar/section |
| **Lines** | 255 |
| **Purpose** | Quick access to Creator Studio from account |

### Banner Variants

#### For Active Creators
```liquid
<a class="mn-creator-studio-banner" href="/pages/creator-dashboard">
  <div class="mn-creator-studio-icon">🎨</div>
  <div class="mn-creator-studio-content">
    <div class="mn-creator-studio-title">
      Creator Studio
      <span class="mn-creator-badge-mini">ACTIVE</span>
    </div>
    <p class="mn-creator-studio-desc">Manage designs and earnings</p>
  </div>
  <div class="mn-creator-studio-arrow">→</div>
</a>
```

#### For Non-Creators
```liquid
<a class="mn-creator-join-banner" href="/pages/become-creator">
  <div class="mn-creator-join-icon">✨</div>
  <div class="mn-creator-join-content">
    <div class="mn-creator-join-title">Join Creator Program</div>
    <p class="mn-creator-join-desc">Start earning from your designs</p>
  </div>
  <div class="mn-creator-join-arrow">→</div>
</a>
```

### Conditional Logic
```liquid
{% if customer.metafields.creator.registered == true %}
  {% assign is_creator = true %}
{% endif %}

{% if is_creator %}
  <!-- Show Creator Studio Banner -->
{% else %}
  <!-- Show Join Creator Banner -->
{% endif %}
```

---

## 7. FEATURED CREATORS PAGE

| Item | Details |
|------|---------|
| **Template** | `C:/Users/Admin/current/templates/page.featured-creators.liquid` |
| **Enhanced Section** | `C:/Users/Admin/current/sections/featured-creators-enhanced.liquid` |
| **Access URL** | `/pages/featured-creators` |
| **Lines** | 593 (section) |
| **Purpose** | Showcase top-performing creators |

### Page Sections
```css
.fc-hero              → Hero with title and badge
.fc-hero-badge        → "Featured Creators" badge
.fc-hero-title        → Main headline
.fc-hero-subtitle     → Subheading
.fc-stats-row         → Creator statistics
.fc-creators-grid     → Creator card grid
.fc-creator-card      → Individual creator profile
```

### Creator Card Content
```
- Creator avatar/photo
- Creator name
- Brand name
- Bio/description
- Social platform followers
- Total designs published
- "Shop This Creator" link
```

---

## 8. SUPPORTING SECTIONS (Additional Creator Components)

### Product Creator Badge
| File | Purpose |
|------|---------|
| `product-creator-badge.liquid` | Displays creator attribution on product page |

**Features:**
- Creator name/brand
- Creator profile link
- "Shop This Creator" button
- Badge styling

### Trending Creator Designs
| File | Purpose |
|------|---------|
| `trending-creator-designs.liquid` | Product carousel of top designs |

**Features:**
- "Trending This Week" section
- Latest creator drops
- Best-selling designs
- Creator filter/sorting

### Creator Post-Purchase CTA
| File | Purpose |
|------|---------|
| `creator-post-purchase-cta.liquid` | Upsell on order confirmation |

**Features:**
- "Become a Creator" callout
- Success testimonials
- Creator earnings social proof
- Link to signup

### Creator Utility Navigation
| File | Purpose |
|------|---------|
| `creator-utility-nav.liquid` | Quick access navigation |

**Features:**
- Creator dashboard link
- Profile settings
- Help/support resources
- Documentation links

---

## 9. API & CONFIGURATION

### Base API Configuration
```liquid
{% assign api_base_url = section.settings.api_base_url | 
  default: 'https://mynarrative-ai.vercel.app' %}
```

### Available in All Creator Sections
- API base URL (configurable)
- Debug mode toggle
- Customer authentication checks

### Customer Metafields Used
```
customer.metafields.creator.registered  → Boolean (is creator)
customer.metafields.creator.tier        → String (bronze|silver|gold|diamond)
customer.metafields.creator.brand_name  → String (creator's brand)
customer.metafields.creator.social_links → Object (connected socials)
```

### Customer Tags
```
'admin'              → Admin/verification role
'creator'           → Active creator status
'verified'          → Verified creator
'elite'             → Elite tier creator
```

---

## 10. COLOR PALETTE REFERENCE

### Core Colors
```css
:root {
  --primary-teal:    #39A596
  --primary-light:   #4ECDC4
  --accent-gold:     #FFD700
  --accent-purple:   #A855F7
  --accent-pink:     #EC4899
  --accent-orange:   #F97316
  --dark-bg:         #0a0a0a
  
  /* Tier Colors */
  --tier-bronze:     #CD7F32
  --tier-silver:     #C0C0C0
  --tier-gold:       #FFD700
  --tier-diamond:    #00FFFF
}
```

### Component Background Colors
```css
--card-bg:    rgba(255, 255, 255, 0.03)
--border:     rgba(255, 255, 255, 0.08)
--hover-bg:   rgba(255, 255, 255, 0.05)
```

---

## 11. RESPONSIVE BREAKPOINTS

### Mobile First Approach
```css
/* Mobile: < 600px */
- Single column layouts
- Sticky CTAs
- Touch-friendly sizing

/* Tablet: 600px - 1024px */
- 2-column grids
- Adjusted padding
- Medium text sizes

/* Desktop: > 1024px */
- Full multi-column layouts
- Enhanced animations
- Larger typography
```

---

## 12. IMPORTANT VERSION NOTES

### Creator Dashboard v3.0
**File**: `creator-dashboard.liquid` (1920 lines)
- ✅ **Removed**: ₹2,500 / ₹5,000 minimum payout thresholds
- ✅ **Added**: 2-step onboarding modal
- ✅ **Added**: Products/My Drops tab with empty state
- ✅ **Feature**: Smart profile with auto-generated avatar from socials

### Become Creator Page (Enhanced)
**File**: `become-creator-enhanced.liquid` (1043 lines)
- ✅ Mobile-first design
- ✅ Sticky CTA on mobile
- ✅ Elite creator section with social platform tiers
- ✅ Clear payment info above the fold
- ✅ Earnings preview section

---

## 13. QUICK NAVIGATION LINKS

### For Developers
- Main creator landing: `/pages/become-creator`
- Creator workspace: `/pages/creator-dashboard`
- Onboarding: `/pages/creator-onboarding`
- Admin verification: `/pages/creator-verification`
- Featured creators: `/pages/featured-creators`
- Affiliate program: `/pages/affiliate-program`

### For Editing (Shopify Admin)
- Theme files: Customize → Edit Code
- Section files: Look in `Sections` folder
- Templates: Look in `Templates` folder
- Settings: `config/settings_data.json`

---

## Summary Table

| Feature | File | Lines | Type | Status |
|---------|------|-------|------|--------|
| Become Creator Landing | `become-creator-enhanced.liquid` | 1043 | Section | ✅ Active |
| Creator Dashboard (Enhanced) | `creator-dashboard-enhanced.liquid` | 1326 | Section | ✅ Active |
| Creator Dashboard (Standard) | `creator-dashboard.liquid` | 1920 | Section | ✅ Active |
| Onboarding Flow | `creator-onboarding-flow.liquid` | 924 | Section | ✅ Active |
| Affiliate Program | `page.affiliate-program.json` | JSON | Template | ✅ Active |
| Admin Verification | `creator-verification-admin.liquid` | 897 | Section | ✅ Active |
| Account Portal Banner | `creator-account-portal.liquid` | 255 | Section | ✅ Active |
| Featured Creators | `featured-creators-enhanced.liquid` | 593 | Section | ✅ Active |
