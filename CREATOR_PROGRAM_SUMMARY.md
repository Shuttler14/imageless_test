# My Narrative Shopify Store - Creator Program Documentation

## Overview
The Shopify store features a comprehensive creator monetization platform with multiple entry points, tiers, and earning mechanisms. The program allows users to design, sell, and earn commissions on custom apparel.

---

## 1. BECOME A CREATOR PAGE

### File Path
- **Template**: `C:/Users/Admin/current/templates/page.become-creator.liquid`
- **Section**: `C:/Users/Admin/current/sections/become-creator-enhanced.liquid`
- **Access URL**: `/pages/become-creator`

### Key Features

#### Hero Section
- **Headline**: "Turn Your Creativity Into Income"
- **Tagline**: "Join India's fastest-growing fashion creator platform. Design, share, and earn – all in one place."
- **Limited Time Badge**: Yes
- **Quick Earnings Teaser**: "Earn up to ₹2L+ monthly"

#### Earnings Preview Section
Displays tiered earnings expectations:
- **Bronze Tier (🥉)**: ₹25K monthly average
- **Silver Tier (🥈)**: ₹75K (Top 25%)
- **Gold Tier (🥇)**: ₹2L+ (Top Creators)

#### Commission & Payment Structure
- **Base Commission**: 15% per sale
- **Payment Method**: 
  - Direct bank transfer or UPI
  - Instant payouts (no minimum balance required)
  - No hidden fees or deductions
  - Version 3.0 removed all minimum payout thresholds (previously ₹2,500 / ₹5,000)

#### Why Join Section (3 Key Benefits)
1. **Earn on Every Sale** - No hidden fees, transparent earnings
2. **Zero Investment** - Free to join, we handle printing, shipping, customer service
3. **Support & Community** - Access to resources and creator network

#### Elite Creator Section
Premium tier for high-performing creators with special social media incentives:

**Social Platform Integrations (with commission tiers):**
- **Instagram**: Special commission rate for influencers
- **YouTube**: Video creator focus
- **Twitter**: Social engagement focus
- **LinkedIn**: Professional network focus

**Elite Commission Bonus**: Gold-highlighted earnings amounts shown for qualified creators

**Elite Invite Bonus**: Special bonuses (gold-highlighted amounts) for bringing other creators to the platform

#### How It Works (2-Step Process)
1. **Complete Quick Setup** - Register and create your brand identity
2. **Start Designing & Earning** - Upload designs and begin earning immediately

#### Design Features
- **Background**: Dark gradient (black to dark gray)
- **Color Scheme**:
  - Primary Teal: #39A596
  - Gold Accent: #FFD700
  - Purple: #A855F7
  - Pink: #EC4899
  - Orange: #F97316
- **Mobile Optimized**: Sticky CTA bar on mobile devices
- **Animations**: Floating background shapes, gradient animations

#### Call-to-Action Elements
- Primary CTA: "🚀 Start Creating Today" (links to `/account/register`)
- Sticky Mobile CTA: Fixed bottom bar with earnings amount and quick access button

---

## 2. CREATOR DASHBOARD

### File Paths
- **Template**: `C:/Users/Admin/current/templates/page.creator-dashboard.liquid`
- **Enhanced Section**: `C:/Users/Admin/current/sections/creator-dashboard-enhanced.liquid`
- **Standard Section**: `C:/Users/Admin/current/sections/creator-dashboard.liquid`
- **Access URL**: `/pages/creator-dashboard` (requires login)

### Requirements
- **User Authentication**: Required (must be logged-in customer)
- **Customer Data**: Pulls from customer object (ID, email, name)

### Dashboard Metrics & Display

#### Main Statistics Displayed (4 Metric Cards)
1. **Balance** (Teal) - Current available earnings
2. **Lifetime Earnings** (Gold) - Total earned to date
3. **Active Listings** (Purple) - Number of designs live
4. **Total Sales** (Green) - Cumulative sales count

#### Creator Profile Section
- **Avatar**: Auto-generated from user initials or connected social profiles
- **Welcome Message**: Personalized greeting with creator name
- **Status Indicator**: Green online/active status badge

#### Creator Tier Badges
The dashboard displays tiered creator status:
- **Bronze**: Basic creator status
- **Silver**: Mid-tier performance
- **Gold**: High-performing creators
- **Diamond**: Elite creator status (special cyan badge)

**Badge Features:**
- Color-coded styling
- Visual distinction for each tier
- Special styling for "Mega" tier (gold gradient)

#### Social Media Connection Section
**Connected Platforms Display:**
- Instagram
- YouTube
- Twitter (X)
- LinkedIn

**Features:**
- Visual connection status (connected/disconnected)
- Follower count display
- Platform-specific icons and branding
- Social account input modal for onboarding

#### Creator Actions Menu
Primary buttons for:
- View/Upload Designs
- Check Sales Reports
- Manage Store
- Access Creator Studio
- View Payment History

#### Tier Upgrade Banner
- Shows path to next tier
- Displays benefits of upgrading
- Premium tier access information

#### Responsive Design
- **Mobile**: Single column metrics
- **Tablet**: 2-column layout
- **Desktop**: 4-column layout

---

## 3. CREATOR ONBOARDING FLOW

### File Path
- **Template**: `C:/Users/Admin/current/templates/page.creator-onboarding.liquid`
- **Section**: `C:/Users/Admin/current/sections/creator-onboarding-flow.liquid`
- **Access URL**: `/pages/creator-onboarding` (for signed-in users)

### Purpose
Converts signed-in users to active creators with:
- Brand name setup
- Social verification
- Profile completion

### Onboarding Steps

#### Progress Indicators
Multi-step progress bar with:
- Numbered steps (1, 2, 3...)
- Active/completed/pending states
- Step labels

#### Step-by-Step Process

**Step 1: Brand Setup**
- Brand name input field
- Brand bio/description
- Initial profile customization

**Step 2: Social Verification**
- Connect social media accounts
- Link Instagram, YouTube, Twitter, LinkedIn
- Fetch follower counts and profile data
- Account validation

**Step 3: Completion**
- Profile review
- Terms acceptance
- Dashboard access activation

#### Form Components
- Input groups with validation
- Social platform selector cards
- Account linking modals
- Confirmation screens

#### Completion Callback
`cofCompleteOnboarding()` - JavaScript function that:
- Validates all data
- Submits to backend API
- Redirects to creator dashboard
- Updates customer metafields

---

## 4. AFFILIATE PROGRAM

### File Path
- **Template**: `C:/Users/Admin/current/templates/page.affiliate-program.json`
- **Access URL**: `/pages/affiliate-program`

### Program Overview
**Title**: "Affiliate program"
**Subtitle**: "Become our affiliate and Earn money"
**Description**: "Become ambassador to a royal brand, let your influence speak!"

### Application Process
Integrated with **Collabs App** (Shopify third-party):
- Application form builder
- Partner showcase
- "Apply Now" button

### Affiliate Commission Structure (Tiered Model)

#### Tier 1: Entry Level
- **Monthly Sales Range**: ₹0 - ₹50,000
- **Commission Rate**: 10% on all qualifying orders

#### Tier 2: Growing Influencer
- **Monthly Sales Range**: ₹50,001 - ₹2,50,000
- **Commission Rate**: 12%

#### Tier 3: Elite Affiliate
- **Monthly Sales Range**: ₹2,50,000+
- **Commission Rate**: 15% + Early access to new product launches

**Important Note**: "Monthly sales" = purchases by first-time customers using the affiliate's code/link

### Affiliate Requirements & Guidelines

**Authentic Endorsement**
- Only promote to genuinely interested audiences
- No misleading or exaggerated claims

**Accurate Disclosures**
- Required: "#ad", "#affiliate", or written disclosure
- Transparency about affiliate relationship

### Affiliate Program Benefits
According to the rich text content:
- Partner with an authentic, creative brand
- Community-focused approach
- Tiered reward system
- Performance-based incentives
- Early product access at top tier

### Affiliate Application Form
- Contact information field
- Audience details section
- Social media links input
- Platform description (follower count, engagement rate, content type)
- 3-5 business day approval window

---

## 5. CREATOR VERIFICATION (ADMIN)

### File Path
- **Template**: `C:/Users/Admin/current/templates/page.creator-verification.liquid`
- **Section**: `C:/Users/Admin/current/sections/creator-verification-admin.liquid`
- **Access URL**: `/pages/creator-verification` (admin only)
- **Permission**: Requires `admin` or `Admin` customer tag

### Admin Interface Features

#### Header Section
- Title: "Creator Verification Dashboard"
- Admin-only interface for reviewing applications

#### Statistics Cards
- Number of pending applications
- Total approved creators
- Total rejected applications
- Active creators count

#### Filter System
Filter applications by status:
- Pending (new submissions)
- Approved (verified creators)
- Rejected (denied applications)
- All applications

#### Application Review Actions
For each submission:
- **Approve Button** - Verify and activate creator account
- **Reject Button** - Send rejection notice
- **View Details** - Review full application

#### Application Display Cards
Each card shows:
- Creator name/brand name
- Submission date
- Contact email
- Social media profiles linked
- Audience details
- Current status badge
- Action buttons

#### Background Design
- Dark gradient theme matching creator dashboard
- Admin-optimized layout
- Clear visual hierarchy for decision-making

---

## 6. CREATOR ACCOUNT PORTAL (Integration)

### File Path
- **Section**: `C:/Users/Admin/current/sections/creator-account-portal.liquid`
- **Integration Point**: Customers account page (`customers/account.json`)

### Purpose
Adds Creator Studio banner to customer account page for quick access to creator tools

### Banner Variants

#### For Active Creators
**Creator Studio Banner**
- Icon: Gradient teal-to-cyan box
- Title: "Creator Studio"
- Badge: "ACTIVE" (gold gradient)
- Description: Quick access text
- Arrow icon indicating click action
- Hover effect: Lift and glow

#### For Non-Creators
**Join Creator Program Banner**
- Icon: Gradient purple-to-gold box
- Title: "Join Creator Program"
- Description: Invitation to become creator
- Arrow icon
- Hover effect: Lift with purple glow

### Styling
- Gradient backgrounds (contextual)
- Border highlights
- Transition effects
- Mobile responsive

---

## 7. FEATURED CREATORS PAGE

### File Path
- **Template**: `C:/Users/Admin/current/templates/page.featured-creators.liquid`
- **Section**: `C:/Users/Admin/current/sections/featured-creators-enhanced.liquid`
- **Access URL**: `/pages/featured-creators`

### Page Structure

#### Hero Section
- Badge: Creator showcase announcement
- Large animated title with gradient text
- Subtitle explaining featured creator program
- Stats row (number of creators, total earnings, active designs, etc.)

#### Featured Creator Display
- Grid/carousel of top-performing creators
- Creator profiles with:
  - Avatar/photo
  - Name and brand
  - Bio/description
  - Follower count
  - Sales metrics
  - Link to creator's storefront

#### Design Features
- **Background**: Dark gradient with animated shapes
- **Animations**: Fade-in effects, floating elements
- **Color Scheme**: Teal primary, purple secondary, gold accents
- **Typography**: Montserrat font family (300-900 weights)

---

## 8. SUPPORTING SECTIONS

### Creator-Related Sections

#### `product-creator-badge.liquid`
Adds creator attribution badge to product pages:
- Shows which creator designed the product
- Links to creator profile
- "Shop This Creator" button

#### `trending-creator-designs.liquid`
Product carousel showing:
- Latest creator designs
- Top-selling creator products
- New creator launches

#### `creator-post-purchase-cta.liquid`
Post-purchase call-to-action:
- "Become a Creator" CTA on order confirmation
- Creator testimonials
- Success stories

#### `creator-utility-nav.liquid`
Navigation utility for creator tools:
- Quick links to creator dashboard
- Settings and profile management
- Help and support resources

---

## 9. COLOR SCHEME & BRANDING

### Primary Colors
```
--bc-primary:        #39A596 (Teal)
--bc-primary-light:  #4ECDC4 (Light Teal)
--bc-gold:           #FFD700 (Gold)
--bc-purple:         #A855F7 (Purple)
--bc-pink:           #EC4899 (Pink)
--bc-orange:         #F97316 (Orange)
--bc-dark:           #0a0a0a (Dark/Black)
```

### Theme
- Dark mode preferred across all creator pages
- Gradient backgrounds and accent colors
- Glassmorphism effects on cards
- Premium, modern aesthetic

---

## 10. KEY STATISTICS & EARNING CLAIMS

### Monthly Earning Ranges
- **Minimum**: ₹25,000 (average creator)
- **Mid-tier**: ₹75,000 (top 25%)
- **Maximum**: ₹2,00,000+ (top creators)

### Commission Rates
- **Creator (Design Sales)**: 15% per sale
- **Affiliate (Tier 1)**: 10%
- **Affiliate (Tier 2)**: 12%
- **Affiliate (Tier 3)**: 15% + perks

### Payment Details
- Instant payouts (no waiting period)
- No minimum balance threshold
- Direct to UPI or bank account
- No hidden deductions
- Transparent fee structure

---

## 11. TECHNICAL INTEGRATION

### API Integration
- Base URL: `https://mynarrative-ai.vercel.app`
- Configurable per section
- Debug mode available

### Customer Data Used
- `customer.id` - Creator identification
- `customer.email` - Contact information
- `customer.name` - Display name
- `customer.first_name` - Personalization
- `customer.metafields.creator.registered` - Creator status flag
- `customer.tags` - Role detection (admin, verified, etc.)

### Shopify Liquid Tags
- Condition checks for login status
- Customer object access
- Dynamic variable assignment

---

## 12. TIER PROGRESSION SYSTEM

### Visual Tier Indicators
Each tier has specific styling:

**Bronze** (Entry level)
- Color: #CD7F32
- Badge: Bronze medal emoji (🥉)

**Silver** (Growing)
- Color: #C0C0C0
- Badge: Silver medal emoji (🥈)

**Gold** (High performer)
- Color: #FFD700
- Badge: Gold medal emoji (🥇)

**Diamond/Elite**
- Color: #00FFFF (Cyan)
- Special gradient styling
- Premium benefits

---

## 13. RESPONSIVE DESIGN NOTES

### Mobile (< 768px)
- Single column layouts
- Sticky bottom CTA bar on Become Creator page
- Stacked metrics
- Touch-friendly buttons
- Optimized font sizes

### Tablet (768px - 1024px)
- 2-column grid layouts
- Adjusted spacing
- Navigation adjustments

### Desktop (> 1024px)
- Full multi-column layouts
- Enhanced animations
- Larger type sizes
- Side-by-side comparisons

---

## Summary

The My Narrative creator program is a sophisticated, multi-tier system designed to:
1. **Recruit creators** through compelling value proposition (Become Creator page)
2. **Onboard & verify** through structured flow and admin review
3. **Manage earnings** via transparent commission structure
4. **Provide tools** through creator dashboard with metrics and controls
5. **Drive affiliate growth** via tiered commission model
6. **Showcase success** through featured creators and testimonials

The program emphasizes:
- ✅ **No barriers to entry** (zero investment, instant payouts)
- ✅ **Transparency** (clear commission rates, no hidden fees)
- ✅ **Community** (social integration, creator showcase)
- ✅ **Scalability** (tiered earnings, performance rewards)
- ✅ **Modern UX** (dark theme, animations, responsive design)
