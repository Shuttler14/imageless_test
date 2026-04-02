# My Narrative Store - Creator Program Documentation
## Complete Reference Guide

---

## 📋 Table of Contents

1. [Quick Overview](#quick-overview)
2. [File Organization](#file-organization)
3. [Creator Program Pages](#creator-program-pages)
4. [Key Features Summary](#key-features-summary)
5. [How to Access](#how-to-access)
6. [Document Files Created](#document-files-created)
7. [Getting Started for Developers](#getting-started-for-developers)

---

## Quick Overview

The My Narrative Shopify store features a **comprehensive creator monetization platform** that enables users to:

- 🎨 **Design & Create** - Upload custom apparel designs
- 💰 **Earn Commissions** - 15% per sale with instant payouts
- 📈 **Track Performance** - Real-time dashboard with metrics
- 🌐 **Build Audience** - Social media integration (Instagram, YouTube, Twitter, LinkedIn)
- ⭐ **Progress Through Tiers** - Bronze → Silver → Gold → Diamond

### Key Statistics
- **Base Commission**: 15% per design sale
- **Payment**: Instant (no minimum balance)
- **Earning Range**: ₹25K - ₹2L+ monthly
- **Entry Cost**: FREE (zero investment)
- **Approval Time**: 3-5 business days

---

## File Organization

```
C:/Users/Admin/current/
│
├─── 📄 DOCUMENTATION FILES (Created)
│    ├── README_CREATOR_PROGRAM.md (This file)
│    ├── CREATOR_PROGRAM_SUMMARY.md (Comprehensive overview)
│    ├── CREATOR_FILES_QUICK_REFERENCE.md (File paths & structure)
│    ├── CREATOR_PROGRAM_ARCHITECTURE.md (Diagrams & flows)
│    └── CREATOR_CODE_SNIPPETS.md (Implementation details)
│
├─── 📁 TEMPLATES (Page Templates)
│    ├── page.become-creator.liquid
│    ├── page.creator-dashboard.liquid
│    ├── page.creator-onboarding.liquid
│    ├── page.creator-verification.liquid
│    ├── page.affiliate-program.json
│    └── page.featured-creators.liquid
│
├─── 📁 SECTIONS (Reusable Components)
│    ├── become-creator-enhanced.liquid (1043 lines)
│    ├── creator-dashboard-enhanced.liquid (1326 lines)
│    ├── creator-dashboard.liquid (1920 lines)
│    ├── creator-onboarding-flow.liquid (924 lines)
│    ├── creator-account-portal.liquid (255 lines)
│    ├── creator-verification-admin.liquid (897 lines)
│    ├── featured-creators-enhanced.liquid (593 lines)
│    ├── featured-creators.liquid
│    ├── creator-post-purchase-cta.liquid
│    ├── product-creator-badge.liquid
│    ├── trending-creator-designs.liquid
│    └── creator-utility-nav.liquid
│
└─── 🔧 CONFIG
     └── settings_data.json
```

---

## Creator Program Pages

### 1. 🚀 Become a Creator (`/pages/become-creator`)
**File**: `sections/become-creator-enhanced.liquid`

**Purpose**: Landing page to recruit new creators

**Key Sections**:
- Hero with value proposition
- Earnings preview (₹25K / ₹75K / ₹2L+)
- Commission structure (15% per sale, instant payouts)
- Why join benefits
- Elite creator tier showcase
- How it works (2 simple steps)

**CTA**: "Start Creating Today" → `/account/register`

---

### 2. 📊 Creator Dashboard (`/pages/creator-dashboard`)
**Files**: 
- `creator-dashboard-enhanced.liquid` (Enhanced UI)
- `creator-dashboard.liquid` (Standard, V3.0)

**Purpose**: Main creator workspace for managing earnings and designs

**Key Metrics**:
- Current Balance 💰
- Lifetime Earnings 💵
- Active Listings 📦
- Total Sales ✅

**Features**:
- Social media connection (Instagram, YouTube, Twitter, LinkedIn)
- Tier badge display
- Upload design button
- View analytics
- Payment history
- Tier upgrade path

**Auth**: Required (customer.id must exist)

---

### 3. 🎯 Creator Onboarding (`/pages/creator-onboarding`)
**File**: `sections/creator-onboarding-flow.liquid`

**Purpose**: Convert signed-in users to active creators

**3-Step Process**:
1. **Brand Setup** - Name, bio, profile
2. **Social Verification** - Connect social platforms
3. **Completion** - Terms acceptance, dashboard access

**Auth**: Required (signed-in users only)

---

### 4. 💼 Affiliate Program (`/pages/affiliate-program`)
**File**: `page.affiliate-program.json`

**Purpose**: Alternative earning path for influencers and partners

**Commission Tiers**:
- **Tier 1**: ₹0-₹50K monthly sales → 10% commission
- **Tier 2**: ₹50K-₹2.5L monthly sales → 12% commission
- **Tier 3**: ₹2.5L+ monthly sales → 15% + early access

**Integration**: Collabs App (Shopify third-party)

---

### 5. ✅ Creator Verification (`/pages/creator-verification`)
**File**: `sections/creator-verification-admin.liquid`

**Purpose**: Admin dashboard for reviewing creator applications

**Features**:
- Application statistics
- Filter by status (Pending, Approved, Rejected)
- Approve/Reject actions
- View application details

**Access**: Admin only (requires `admin` tag)

---

### 6. ⭐ Featured Creators (`/pages/featured-creators`)
**File**: `sections/featured-creators-enhanced.liquid`

**Purpose**: Showcase top-performing creators

**Content**:
- Featured creator profiles
- Sales metrics
- Shop this creator links
- Success stories

---

## Key Features Summary

### 💰 Commission Structure
```
Design Sale Commission: 15% per sale
Affiliate Commission:   10-15% (tiered)
Payment Method:         Instant to UPI/Bank
Minimum Balance:        None (V3.0 removed thresholds)
Hidden Fees:           None
```

### 🎯 Creator Tiers
```
BRONZE      Entry level, ₹25K avg monthly
SILVER      Top 25%, ₹75K avg monthly
GOLD        Top creators, ₹2L+ avg monthly
DIAMOND     Elite status, special benefits
```

### 🌐 Social Integration
- **Instagram** - Follower count sync
- **YouTube** - Subscriber count sync
- **Twitter** - Engagement metrics
- **LinkedIn** - Professional connections

### 🎨 Design Features
- Dark gradient theme (modern aesthetic)
- Animated background shapes
- Montserrat font family
- Glassmorphism card effects
- Gradient text highlights
- Mobile-optimized sticky CTAs

---

## How to Access

### Public Pages (Anyone)
- Become Creator: `https://store.com/pages/become-creator`
- Featured Creators: `https://store.com/pages/featured-creators`
- Affiliate Program: `https://store.com/pages/affiliate-program`

### Creator Pages (Login Required)
- Creator Dashboard: `https://store.com/pages/creator-dashboard`
- Creator Onboarding: `https://store.com/pages/creator-onboarding`

### Admin Pages (Admin Only)
- Creator Verification: `https://store.com/pages/creator-verification`

### Integration Point
- Account Page Banner: Shows in customer account sidebar
  - For creators: "Creator Studio" link
  - For non-creators: "Join Creator Program" link

---

## Document Files Created

### 1. **CREATOR_PROGRAM_SUMMARY.md** (Main Reference)
Comprehensive overview of all creator-related features:
- 13 major sections
- Complete feature descriptions
- Earnings & commission details
- Technical integration info
- Tier progression system
- Responsive design notes

### 2. **CREATOR_FILES_QUICK_REFERENCE.md** (Quick Lookup)
Organized file reference guide:
- File structure diagram
- Individual file breakdown
- Lines of code
- Key CSS classes
- JavaScript functions
- Color palette
- Responsive breakpoints
- Summary table

### 3. **CREATOR_PROGRAM_ARCHITECTURE.md** (Visual Diagrams)
Flow diagrams and system architecture:
- User journey flowchart
- Tier progression diagram
- Page structure dependencies
- Creator dashboard architecture
- Affiliate program flow
- Admin verification workflow
- Data flow & API integration

### 4. **CREATOR_CODE_SNIPPETS.md** (Implementation)
Code examples and technical details:
- HTML structure examples
- Liquid template configuration
- JavaScript functions
- JSON configuration
- CSS custom properties
- Responsive design code
- Metafield structure

---

## Getting Started for Developers

### Step 1: Review the Ecosystem
Start with **CREATOR_PROGRAM_SUMMARY.md** to understand:
- What the creator program does
- How users interact with it
- What each page contains

### Step 2: Understand the Architecture
Check **CREATOR_PROGRAM_ARCHITECTURE.md** to see:
- User flows and journeys
- Data relationships
- Page dependencies
- Admin workflows

### Step 3: Find Specific Files
Use **CREATOR_FILES_QUICK_REFERENCE.md** to:
- Locate specific files
- Understand file purposes
- Find line numbers for specific features
- Reference CSS classes and functions

### Step 4: Implement or Modify
Reference **CREATOR_CODE_SNIPPETS.md** for:
- HTML structure examples
- JavaScript implementations
- API payload structures
- Styling patterns

### Step 5: Access in Shopify Admin
```
1. Go to Online Store → Themes
2. Click "Edit Code" on live theme
3. Navigate to:
   - Sections/ folder (for .liquid components)
   - Templates/ folder (for page templates)
4. Search by filename (e.g., "become-creator-enhanced")
```

---

## Key Color Scheme

### Primary Colors
- **Teal**: `#39A596` (Primary action)
- **Light Teal**: `#4ECDC4` (Hover/highlight)
- **Gold**: `#FFD700` (Earnings/premium)
- **Purple**: `#A855F7` (Secondary action)
- **Dark**: `#0a0a0a` (Background)

### Tier Colors
- **Bronze**: `#CD7F32` (Entry creators)
- **Silver**: `#C0C0C0` (Growing creators)
- **Gold**: `#FFD700` (Top creators)
- **Diamond**: `#00FFFF` (Elite creators)

### Status Colors
- **Success**: `#22c55e` (Approved/Active)
- **Warning**: `#f59e0b` (Pending)
- **Danger**: `#ef4444` (Rejected/Error)

---

## Important Version Notes

### Creator Dashboard V3.0
- ✅ **Removed** minimum payout thresholds (₹2,500/₹5,000)
- ✅ **Added** 2-step onboarding modal
- ✅ **Added** Products/My Drops tab with empty state
- ✅ **Feature** Smart profile with auto-generated avatar

### Become Creator Page
- ✅ Mobile-first optimization
- ✅ Sticky CTA bar on mobile devices
- ✅ Elite creator social platform showcase
- ✅ Clear earning previews above fold

---

## API Integration

### Base URL
```
https://mynarrative-ai.vercel.app
```

### Configurable Per Section
```liquid
{% assign api_base_url = section.settings.api_base_url | 
  default: 'https://mynarrative-ai.vercel.app' %}
```

### Key Endpoints
- `POST /api/creators/register` - New creator signup
- `POST /api/creators/onboarding` - Complete onboarding
- `GET /api/creators/{id}/dashboard` - Fetch dashboard data
- `POST /api/creators/{id}/social-connect` - Connect social
- `GET /api/affiliates/{id}/stats` - Affiliate statistics
- `POST /api/admin/verify-creator` - Admin approval

---

## Customer Metafields

### Creator Status Tracking
```json
customer.metafields.creator {
  registered: boolean,
  tier: string (bronze|silver|gold|diamond),
  brand_name: string,
  social_links: object
}
```

### Role Tags
```
'admin'     → Admin/verification access
'creator'   → Active creator status
'verified'  → Verified creator
'elite'     → Elite tier creator
```

---

## Support & Troubleshooting

### Common Questions

**Q: How do creators sign up?**
A: Visit `/pages/become-creator`, click "Start Creating Today", register, complete onboarding, wait for admin approval (3-5 days).

**Q: What's the commission rate?**
A: 15% per design sale, instant payout to UPI or bank account.

**Q: Can creators earn without a minimum balance?**
A: Yes! Version 3.0 removed all minimum payout thresholds.

**Q: How are creators verified?**
A: Admin reviews their onboarding application at `/pages/creator-verification` and approves/rejects.

**Q: What social platforms are supported?**
A: Instagram, YouTube, Twitter, and LinkedIn.

**Q: How often are creators paid?**
A: Instant payouts (no waiting period).

---

## Next Steps

### For Content Team
- Review `/pages/become-creator` messaging
- Update earnings claim disclaimers
- Create creator success stories

### For Development Team
- Set up API endpoints
- Configure Shopify metafields
- Integrate payment processing
- Test user flows

### For Marketing Team
- Create promotional materials
- Email campaigns for creator recruitment
- Affiliate program outreach
- Featured creator showcases

### For Admin Team
- Set up verification process
- Create approval workflow
- Monitor creator applications
- Handle disputes/rejections

---

## Document Versions

| Document | Lines | Purpose | Last Updated |
|----------|-------|---------|--------------|
| README_CREATOR_PROGRAM.md | This file | Overview & index | 2024 |
| CREATOR_PROGRAM_SUMMARY.md | ~400 | Comprehensive guide | 2024 |
| CREATOR_FILES_QUICK_REFERENCE.md | ~500 | File reference | 2024 |
| CREATOR_PROGRAM_ARCHITECTURE.md | ~300 | Diagrams & flows | 2024 |
| CREATOR_CODE_SNIPPETS.md | ~600 | Code examples | 2024 |

---

## Quick Links to Key Files

### Main Creator Files
- 🎨 **Become Creator**: `sections/become-creator-enhanced.liquid`
- 📊 **Dashboard**: `sections/creator-dashboard-enhanced.liquid`
- 🎯 **Onboarding**: `sections/creator-onboarding-flow.liquid`
- ✅ **Verification**: `sections/creator-verification-admin.liquid`
- 💼 **Affiliate**: `templates/page.affiliate-program.json`

### Configuration
- 📋 **Settings**: `config/settings_data.json`
- 🎨 **Account Portal**: `sections/creator-account-portal.liquid`

### Supporting Pages
- ⭐ **Featured**: `sections/featured-creators-enhanced.liquid`
- 🏷️ **Product Badge**: `sections/product-creator-badge.liquid`
- 📈 **Trending**: `sections/trending-creator-designs.liquid`

---

## Summary

The My Narrative creator program is a **fully-featured monetization platform** that:

✅ Recruits creators with compelling value proposition  
✅ Onboards with social verification  
✅ Tracks earnings in real-time  
✅ Rewards with tier progression  
✅ Provides instant payouts (no minimums)  
✅ Integrates with 4 major social platforms  
✅ Supports affiliate model  
✅ Offers admin verification workflow  

All powered by a **modern dark-theme design** optimized for mobile and desktop.

---

## Questions?

Refer to the comprehensive documentation files created:
1. `CREATOR_PROGRAM_SUMMARY.md` - Full feature details
2. `CREATOR_FILES_QUICK_REFERENCE.md` - File locations & organization
3. `CREATOR_PROGRAM_ARCHITECTURE.md` - System flows & diagrams
4. `CREATOR_CODE_SNIPPETS.md` - Code examples & implementation

**All files located in**: `C:/Users/Admin/current/`
