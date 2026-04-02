# Creator Program - Architecture & Flow Diagrams

## User Journey Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                    VISITOR LANDS ON STORE                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Sees Ad or  │
                    │   Link to    │
                    │ /become-     │
                    │ creator      │
                    └──────┬──────┘
                           │
        ┌──────────────────▼──────────────────┐
        │                                      │
   ┌────▼────┐                          ┌────▼────┐
   │ VISITOR │                          │ LOGGED  │
   │  (anon) │                          │  IN     │
   │         │                          │ USER    │
   └────┬────┘                          └────┬────┘
        │                                     │
        │ Click "Start Creating Today"        │ Click "Create"
        │ /account/register                   │
        │                                     │
   ┌────▼────────────────────────────────┬───▼──────┐
   │   REGISTRATION/LOGIN PAGE           │  ONBOARD │
   │   (/account/register)               │  FLOW    │
   │   - Email/Password                  │  (/pages/│
   │   - Account Creation                │  creator-│
   │                                      │  onboard)│
   └────┬────────────────────────────────┴───┬──────┘
        │                                     │
        └──────────────┬──────────────────────┘
                       │ User Authenticated
        ┌──────────────▼──────────────────┐
        │  CREATOR ONBOARDING FLOW        │
        │  /pages/creator-onboarding      │
        │  ─────────────────────────────  │
        │  Step 1: Brand Setup            │
        │  - Brand Name                   │
        │  - Bio/Description              │
        │                                  │
        │  Step 2: Social Verification    │
        │  - Connect Instagram            │
        │  - Connect YouTube              │
        │  - Connect Twitter              │
        │  - Connect LinkedIn             │
        │                                  │
        │  Step 3: Completion             │
        │  - Terms Acceptance             │
        │  - Profile Verification         │
        └──────────────┬──────────────────┘
                       │ Complete Onboarding
        ┌──────────────▼──────────────────┐
        │  ADMIN VERIFICATION (PENDING)   │
        │  /pages/creator-verification    │
        │  (Admin Only)                   │
        │                                  │
        │  Admin Reviews:                 │
        │  - Social Links                 │
        │  - Audience Size                │
        │  - Content Quality              │
        └──────────────┬──────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
       ┌────▼────┐          ┌────▼────┐
       │ APPROVED │          │ REJECTED │
       │          │          │          │
       └────┬─────┘          └────┬─────┘
            │                     │
            │ Creator Activated   │ Send Rejection
            │                     │ Email
       ┌────▼─────────────────────▼────┐
       │  CREATOR DASHBOARD              │
       │  /pages/creator-dashboard       │
       │  ─────────────────────────────  │
       │  - View Earnings                │
       │  - Upload Designs               │
       │  - Track Sales                  │
       │  - Manage Listings              │
       │  - Social Profile Status        │
       │  - Creator Studio Banner        │
       │    (in account page)            │
       └────┬─────────────────────────────┘
            │
            │ Design & Sell
            │
       ┌────▼─────────────────────┐
       │ CREATOR EARNS COMMISSION  │
       │ (15% per sale)            │
       │ Instant Payout via UPI    │
       │ or Bank Transfer          │
       └──────────────────────────┘
```

---

## Tier Progression System

```
                    CREATOR TIER PROGRESSION
                    
    START          ┌─────────────┐
      ↓            │   BRONZE    │
    REGISTER →     │   TIER      │
                   │ (Entry)     │
                   │  ₹25K avg   │
                   │   15% comm  │
                   └──────┬──────┘
                          │ Performance
                          │ Growth
                   ┌──────▼──────────┐
                   │    SILVER       │
                   │     TIER        │
                   │  (Top 25%)      │
                   │   ₹75K avg      │
                   │    15% comm     │
                   │ (Same as Bronze)│
                   └──────┬──────────┘
                          │ Sustained
                          │ High Sales
                   ┌──────▼──────────┐
                   │     GOLD        │
                   │     TIER        │
                   │  (Top Creators) │
                   │    ₹2L+ avg     │
                   │    15% comm     │
                   │  Elite Badge    │
                   │  Social Boost   │
                   └──────┬──────────┘
                          │ Exceptional
                          │ Performance
                   ┌──────▼──────────┐
                   │   DIAMOND       │
                   │   (ELITE)       │
                   │                 │
                   │  Cyan Badge     │
                   │  Max Benefits   │
                   │  VIP Support    │
                   │  Early Access   │
                   └─────────────────┘
```

---

## Page Structure & Dependencies

```
BECOME CREATOR PAGE
/pages/become-creator
│
└─ Template: page.become-creator.liquid
   └─ Section: become-creator-enhanced.liquid (1043 lines)
      ├─ CSS Styling (dark theme, animations)
      ├─ Hero Section
      │  ├─ Title: "Turn Your Creativity Into Income"
      │  ├─ Subtitle & Badge
      │  └─ CTA: "/account/register"
      │
      ├─ Earnings Preview Section
      │  ├─ Bronze: ₹25K
      │  ├─ Silver: ₹75K
      │  └─ Gold: ₹2L+
      │
      ├─ Commission Info Section
      │  ├─ 15% per sale
      │  ├─ Instant payouts
      │  └─ No minimums
      │
      ├─ Why Join Section (3 benefits)
      │  ├─ Earn on Every Sale
      │  ├─ Zero Investment
      │  └─ Community Support
      │
      ├─ Elite Creator Section
      │  ├─ Instagram Platform
      │  ├─ YouTube Platform
      │  ├─ Twitter Platform
      │  └─ LinkedIn Platform
      │
      └─ How It Works (2 steps)
         ├─ Step 1: Quick Setup
         └─ Step 2: Start Earning
```

---

## Creator Dashboard Architecture

```
CREATOR DASHBOARD PAGE
/pages/creator-dashboard
│
├─ Template: page.creator-dashboard.liquid
│  └─ Section: creator-dashboard-enhanced.liquid OR creator-dashboard.liquid
│
└─ Dashboard Components:
   │
   ├─ Welcome Header
   │  ├─ Avatar (auto-generated from socials)
   │  ├─ Welcome Text (personalized)
   │  └─ Tier Badge (bronze|silver|gold|diamond)
   │
   ├─ Metrics Section (4 cards)
   │  ├─ Current Balance 💰
   │  ├─ Lifetime Earnings 💵
   │  ├─ Active Listings 📦
   │  └─ Total Sales ✅
   │
   ├─ Social Integration Section
   │  ├─ Instagram [Connected/Disconnected]
   │  ├─ YouTube [Connected/Disconnected]
   │  ├─ Twitter [Connected/Disconnected]
   │  └─ LinkedIn [Connected/Disconnected]
   │
   ├─ Tier Upgrade Banner
   │  ├─ Current Tier Info
   │  ├─ Path to Next Tier
   │  └─ Benefits Info
   │
   ├─ Action Buttons
   │  ├─ Upload Designs
   │  ├─ View Sales
   │  ├─ Manage Store
   │  └─ Payment History
   │
   └─ Modals/Popups
      ├─ Social Connect Modal
      └─ Social Account Input Modal
```

---

## Affiliate Program Flow

```
AFFILIATE PROGRAM
/pages/affiliate-program
│
├─ Page Title & Description
│  ├─ "Become our affiliate and Earn money"
│  └─ "Become ambassador to a royal brand..."
│
├─ Collabs App Integration
│  └─ Application Form
│     ├─ Contact Info
│     ├─ Social Links
│     ├─ Audience Details
│     └─ Submit → Shopify Collabs
│
├─ Commission Structure Info
│  │
│  ├─ Tier 1: ₹0 - ₹50,000
│  │  └─ 10% commission
│  │
│  ├─ Tier 2: ₹50,001 - ₹2,50,000
│  │  └─ 12% commission
│  │
│  └─ Tier 3: ₹2,50,000+
│     ├─ 15% commission
│     └─ + Early access to new launches
│
├─ Requirements Section
│  ├─ Authentic Endorsement
│  ├─ Accurate Disclosures (#ad, #affiliate)
│  └─ Content Quality Standards
│
└─ 3-5 Business Day Approval Window
   ├─ Approved → Get Affiliate Link
   ├─ Tracking Dashboard
   └─ Earnings & Payouts
```

---

## Admin Verification Dashboard

```
CREATOR VERIFICATION ADMIN
/pages/creator-verification (Admin Only)
│
├─ Access Control: customer.tags contains 'admin'
│
├─ Statistics Section
│  ├─ Pending Applications (orange)
│  ├─ Approved Creators (green)
│  ├─ Rejected Applications (red)
│  └─ Total Active Creators (blue)
│
├─ Filter Controls
│  ├─ [Pending] [Approved] [Rejected] [All]
│  └─ Live filtering
│
├─ Application Cards (scrollable list)
│  ├─ Creator Name/Brand
│  ├─ Submission Date
│  ├─ Email Address
│  ├─ Social Profiles
│  │  ├─ Instagram followers
│  │  ├─ YouTube subscribers
│  │  ├─ Twitter followers
│  │  └─ LinkedIn connections
│  │
│  ├─ Audience Details
│  │  ├─ Total reach
│  │  ├─ Engagement rate
│  │  └─ Content type
│  │
│  ├─ Status Badge (pending|approved|rejected)
│  │
│  └─ Action Buttons
│     ├─ [APPROVE] → Activate Creator
│     ├─ [REJECT] → Send Rejection Email
│     └─ [VIEW DETAILS] → Full Application
│
└─ Color Coded Status
   ├─ Pending: Orange (#f59e0b)
   ├─ Approved: Green (#22c55e)
   └─ Rejected: Red (#ef4444)
```

---

## Data Flow & API Integration

```
                    DATA FLOW ARCHITECTURE
                    
FRONTEND (Shopify Liquid)
│
├─ Customer Object
│  ├─ customer.id
│  ├─ customer.email
│  ├─ customer.name
│  ├─ customer.first_name
│  ├─ customer.metafields
│  │  └─ creator.registered (boolean)
│  │     creator.tier (string)
│  │     creator.brand_name (string)
│  │     creator.social_links (object)
│  │
│  └─ customer.tags
│     ├─ 'admin'
│     ├─ 'creator'
│     ├─ 'verified'
│     └─ 'elite'
│
├─ Section Settings
│  └─ api_base_url = https://mynarrative-ai.vercel.app
│
└─ API Calls (JavaScript)
   │
   ├─ POST /api/creators/register
   │  └─ Payload: brand_name, email, user_id
   │
   ├─ POST /api/creators/onboarding
   │  └─ Payload: brand_setup, social_links, verification
   │
   ├─ GET /api/creators/{id}/dashboard
   │  └─ Response: balance, earnings, listings, sales
   │
   ├─ POST /api/creators/{id}/social-connect
   │  └─ Payload: platform, oauth_token
   │
   ├─ GET /api/affiliates/{id}/stats
   │  └─ Response: sales, commissions, tier
   │
   └─ POST /api/admin/verify-creator
      └─ Payload: creator_id, approve/reject decision
```

