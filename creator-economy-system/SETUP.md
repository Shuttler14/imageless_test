# My Narrative - Design-to-Earn Creator Dashboard
## Production Setup Guide

### Prerequisites
1. **Shopify Store** - Your existing store at mynarrative.store
2. **Vercel Account** - For hosting the API
3. **Supabase Account** - For database
4. **Stripe Account** - For payouts (Connect)

---

## Step 1: Supabase Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- =====================================================
-- CREATORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shopify_customer_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
    commission_tier TEXT DEFAULT 'standard',
    commission_rate INTEGER DEFAULT 5,
    balance INTEGER DEFAULT 0,
    lifetime_earnings INTEGER DEFAULT 0,
    active_listings INTEGER DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    style_influence_rank TEXT DEFAULT 'rookie_designer',
    is_mega_influencer BOOLEAN DEFAULT FALSE,
    is_campus_ambassador BOOLEAN DEFAULT FALSE,
    stripe_account_id TEXT,
    social_links JSONB DEFAULT '{}',
    earnings_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_creators_shopify ON creators(shopify_customer_id);
CREATE INDEX idx_creators_username ON creators(username);
CREATE INDEX idx_creators_mega ON creators(is_mega_influencer) WHERE is_mega_influencer = true;

-- =====================================================
-- CREATOR DESIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    flux_editorial_image_url TEXT NOT NULL,
    price INTEGER NOT NULL,
    commission_rate INTEGER DEFAULT 5,
    estimated_earnings_per_sale INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    shopify_product_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_designs_creator ON creator_designs(creator_id);
CREATE INDEX idx_designs_status ON creator_designs(status);

-- =====================================================
-- CREATOR PAYOUTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'processing',
    stripe_payout_id TEXT,
    bank_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payouts_creator ON creator_payouts(creator_id);
CREATE INDEX idx_payouts_status ON creator_payouts(status);

-- =====================================================
-- CREATOR COMMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    shopify_order_id TEXT,
    amount INTEGER NOT NULL,
    type TEXT DEFAULT 'sale_commission',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_commissions_creator ON creator_commissions(creator_id);

-- =====================================================
-- CAMPUS FESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campus_fests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    collective_pool INTEGER DEFAULT 0,
    creator_contributions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATOR GHOST ITEMS (Embedding Cache)
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_ghost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    embedding JSONB,
    type TEXT DEFAULT 'ghost',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_fests ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_ghost_items ENABLE ROW LEVEL SECURITY;

-- Public read access (for featured creators)
CREATE POLICY "Public creators read" ON creators
    FOR SELECT USING (is_mega_influencer = true);

-- Service role full access (for API)
CREATE POLICY "Service role full access" ON creators
    FOR ALL USING (true) WITH CHECK (true);
-- Repeat for other tables...
```

---

## Step 2: Vercel Environment Variables

Configure these in your Vercel project settings:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key

# Stripe Connect
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_CONNECT_CLIENT_ID=ca_xxx

# Creator Economy Settings
MEGA_INFLUENCER_INSTAGRAM=500000
MEGA_INFLUENCER_YOUTUBE=250000
MEGA_INFLUENCER_TWITTER=150000
MEGA_INFLUENCER_LINKEDIN=750000

PAYOUT_THRESHOLD_STORE_CREDIT=2500
PAYOUT_THRESHOLD_CASH=5000

CREATOR_COMMISSION_STANDARD=5
CREATOR_COMMISSION_MICRO=15
CREATOR_COMMISSION_MEGA=50

RANK_ROOKIE=0
RANK_EMERGING=10000
RANK_TRENDSETTER=50000
RANK_ARCHITECT=150000
RANK_ICON=500000
```

---

## Step 3: Shopify Integration

### Option A: Using the Liquid Section
Add to any page (e.g., `/pages/creator-dashboard`):
```liquid
{% section 'creator-dashboard' %}
```

### Option B: Using Shopify Application Embed
Add the section to your theme and it will automatically load the dashboard for logged-in customers.

---

## Step 4: Webhook Setup (Commission Tracking)

Set up a Shopify webhook for order creation:

1. Go to Settings > Notifications > Webhooks
2. Create webhook: `orders/create` → `https://your-api.vercel.app/api/webhook/shopify-order`
3. The webhook will automatically credit commissions to creators when orders are placed

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/creator/profile` | GET | Get creator profile with payout status |
| `/api/creator/register` | POST | Register as a creator |
| `/api/creator/payout-status` | GET | Get current payout eligibility |
| `/api/creator/social/link` | POST | Link social media account |
| `/api/creator/payout/initiate` | POST | Initiate payout (cash/store credit) |
| `/api/creator/design/add` | POST | Add a new design listing |
| `/api/creators/featured` | GET | Get mega influencers (public) |
| `/api/webhook/shopify-order` | POST | Handle order webhooks |

---

## Testing Checklist

- [ ] Supabase tables created
- [ ] Environment variables set in Vercel
- [ ] API responding at `/api/creator/profile`
- [ ] Creator dashboard loads in Shopify
- [ ] Social linking updates commission tier correctly
- [ ] Payout initiation works
- [ ] Order webhook credits commissions

---

---

## Step 5: Integration Blueprint (DEMAND SIDE vs SUPPLY SIDE)

### THE DEMAND SIDE: featured-creators.liquid (Public Marketplace)

**This page is for standard customers to buy products—high-intent shopping destination.**

#### 5.1 Main Navigation (Header)
Create a new section or add to your header/nav:
```
Section: creator-drops-nav.liquid
Placement: Top-level navigation item next to "Men's" and "Women's"
Title: "Creator Drops" or "Featured Collaborations"
```

#### 5.2 Homepage Integration (Below Hero)
Add the trending carousel section:
```
Section: trending-creator-designs.liquid
Placement: Immediately below the hero section on homepage
```

#### 5.3 Product Page Cross-Selling
Add the creator badge to product pages:
```
Section: product-creator-badge.liquid
Placement: On product-template.liquid, below product title/price
Metafields required:
- product.creator.username (text)
- product.creator.avatar (image)
```

---

### THE SUPPLY SIDE: creator-dashboard.liquid (Creator Acquisition)

**This is an acquisition/retention engine—hidden inside authenticated user flow.**

#### 5.4 Customer Account Portal (PRIMARY PLACEMENT)
The dashboard already integrates with `/account` via customer authentication.
- When logged in users visit /account, they see the dashboard
- Add a prominent "Creator Studio" tab/banner link

#### 5.5 Utility Navigation
Add subtle "Earn with Us" link:
```
Section: creator-utility-nav.liquid
Placement: Top utility bar (above main header) OR footer
```

#### 5.6 Post-Purchase Flow (CRITICAL)
Add to order confirmation/thank-you page:
```
Section: creator-post-purchase-cta.liquid
Placement: Order confirmation page, below "Thank you" message
This converts engaged buyers into instant creators!
```

---

### Integration Checklist

| Component | File | Placement | Purpose |
|-----------|------|-----------|---------|
| Main Nav | creator-drops-nav.liquid | Header | Top-level "Creator Drops" |
| Homepage Carousel | trending-creator-designs.liquid | Below hero | Trending creator designs |
| Product Badge | product-creator-badge.liquid | Product page | Cross-selling to creator |
| Dashboard | creator-dashboard.liquid | /account | Creator management |
| Utility Nav | creator-utility-nav.liquid | Top bar/Footer | Subtle creator links |
| Post-Purchase | creator-post-purchase-cta.liquid | Thank you page | Buyer conversion |

---

### Critical Architecture Notes

#### The Cold Start Problem
Your dashboard prompts users to link Instagram/YouTube/Twitter to unlock tiers.
- **CRITICAL:** Ensure the API response for social linking is near-instantaneous
- Mega-influencers have zero patience for delays

#### Dashboard Redundancy
- Ensure `/pages/my-closet` is functional (theme.liquid already has scripts)
- Ensure `/featured-creators` loads correctly

#### Payout Clarity
The progress bar (₹2,500 store credit → ₹5,000 cash) is excellent gamification.
- **MUST** display payout terms clearly (Net-30, UPI, etc.)
- If creators don't know how they'll receive money, trust evaporates

---

## Support

For issues, check:
1. Vercel function logs
2. Supabase query logs
3. Shopify webhook delivery status