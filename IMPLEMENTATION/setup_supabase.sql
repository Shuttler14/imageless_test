-- =====================================================
-- MY NARRATIVE - CREATOR ECONOMY DATABASE SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor
-- Safe to run multiple times - uses IF NOT EXISTS
-- =====================================================

-- =====================================================
-- CREATORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shopify_customer_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    first_name TEXT DEFAULT '',
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
    social_links JSONB DEFAULT '{}',
    earnings_history JSONB DEFAULT '[]',
    stripe_connect_id TEXT,
    bank_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATOR DESIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    flux_editorial_image_url TEXT NOT NULL,
    flat_image_url TEXT DEFAULT '',
    price INTEGER NOT NULL,
    commission_rate INTEGER DEFAULT 5,
    estimated_earnings_per_sale INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    category TEXT DEFAULT 'apparel',
    tags JSONB DEFAULT '[]',
    shopify_product_id TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATOR GHOST ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_ghost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    embedding JSONB,
    type TEXT DEFAULT 'ghost',
    name TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATOR PAYOUTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_payouts (
    id TEXT PRIMARY KEY,
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    bank_details JSONB,
    stripe_payout_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- =====================================================
-- CREATOR COMMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    shopify_order_id TEXT,
    amount INTEGER NOT NULL,
    type TEXT DEFAULT 'sale_commission',
    design_id UUID REFERENCES creator_designs(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_ghost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_fests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE POLICIES
-- =====================================================

-- Creators: Service role full access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_creators_all' AND tablename = 'creators') THEN
        CREATE POLICY "service_role_creators_all" ON creators FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_designs_all' AND tablename = 'creator_designs') THEN
        CREATE POLICY "service_role_designs_all" ON creator_designs FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_ghost_all' AND tablename = 'creator_ghost_items') THEN
        CREATE POLICY "service_role_ghost_all" ON creator_ghost_items FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_payouts_all' AND tablename = 'creator_payouts') THEN
        CREATE POLICY "service_role_payouts_all" ON creator_payouts FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_commissions_all' AND tablename = 'creator_commissions') THEN
        CREATE POLICY "service_role_commissions_all" ON creator_commissions FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_fests_all' AND tablename = 'campus_fests') THEN
        CREATE POLICY "service_role_fests_all" ON campus_fests FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Public read access for mega influencers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_mega_read' AND tablename = 'creators') THEN
        CREATE POLICY "public_mega_read" ON creators FOR SELECT USING (is_mega_influencer = true);
    END IF;
END $$;

-- Public read access for active designs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_designs_read' AND tablename = 'creator_designs') THEN
        CREATE POLICY "public_designs_read" ON creator_designs FOR SELECT USING (status = 'active');
    END IF;
END $$;

-- Public read access for active campus fests
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_fests_read' AND tablename = 'campus_fests') THEN
        CREATE POLICY "public_fests_read" ON campus_fests FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- =====================================================
-- CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_creators_shopify ON creators(shopify_customer_id);
CREATE INDEX IF NOT EXISTS idx_creators_username ON creators(username);
CREATE INDEX IF NOT EXISTS idx_creators_mega ON creators(is_mega_influencer) WHERE is_mega_influencer = true;
CREATE INDEX IF NOT EXISTS idx_designs_creator ON creator_designs(creator_id);
CREATE INDEX IF NOT EXISTS idx_designs_status ON creator_designs(status);
CREATE INDEX IF NOT EXISTS idx_payouts_creator ON creator_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON creator_payouts(status);
CREATE INDEX IF NOT EXISTS idx_commissions_creator ON creator_commissions(creator_id);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Creator Economy tables created successfully!' AS status;
