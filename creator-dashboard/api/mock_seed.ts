/**
 * MY NARRATIVE — Mock Data Seed
 * ==============================
 * Provides realistic test fixtures for the Creator Dashboard system.
 * Use these in development / Storybook / Jest tests.
 *
 * Replace with real DB queries (Prisma / PostgreSQL) in production.
 */

import { Creator, DesignListing, EarningsTracker } from "../types";

// ─── Shared mock earnings chart data ─────────────────────────────────────────

const sampleMonthlyEarnings = [
  { month: "Aug '24", earnings: 320, units_sold: 6 },
  { month: "Sep '24", earnings: 580, units_sold: 11 },
  { month: "Oct '24", earnings: 940, units_sold: 18 },
  { month: "Nov '24", earnings: 1420, units_sold: 27 },
  { month: "Dec '24", earnings: 2100, units_sold: 40 },
  { month: "Jan '25", earnings: 3400, units_sold: 65 },
  { month: "Feb '25", earnings: 4800, units_sold: 91 },
];

// ─── Mock Listings ────────────────────────────────────────────────────────────
// flux_editorial_image_url fields point to placeholder editorial images.
// In production these are FLUX AI-generated Virtual Try-On shots.

const mockListings_aryan: DesignListing[] = [
  {
    id: "lst_001",
    creator_id: "usr_aryan",
    title: "Noir Cosmos Hoodie",
    description: "Deep space editorial — black on black embroidered galaxy motif.",
    flux_editorial_image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=90",
    flux_secondary_image_url: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=90",
    tags: ["streetwear", "noir", "hoodie"],
    base_price: 2499,
    is_active: true,
    units_sold: 143,
    total_revenue_generated: 357357,
    created_at: "2024-11-01T10:00:00Z",
    updated_at: "2025-02-10T14:30:00Z",
  },
  {
    id: "lst_002",
    creator_id: "usr_aryan",
    title: "Acid Wash Rebellion Tee",
    description: "Washed-out grunge editorial shot on rooftop. Limited run.",
    flux_editorial_image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=90",
    tags: ["grunge", "limited", "tee"],
    base_price: 1299,
    is_active: true,
    units_sold: 89,
    total_revenue_generated: 115611,
    created_at: "2024-12-15T08:00:00Z",
    updated_at: "2025-01-20T11:00:00Z",
  },
  {
    id: "lst_003",
    creator_id: "usr_aryan",
    title: "Chrome Silhouette Bomber",
    description: "Reflective chrome bomber — shot at golden hour in industrial district.",
    flux_editorial_image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=90",
    tags: ["bomber", "chrome", "luxury"],
    base_price: 3999,
    is_active: true,
    units_sold: 56,
    total_revenue_generated: 223944,
    created_at: "2025-01-05T12:00:00Z",
    updated_at: "2025-02-01T09:00:00Z",
  },
  {
    id: "lst_004",
    creator_id: "usr_aryan",
    title: "Monochrome Manifesto Cargo",
    description: "All-black tactical cargo editorial — utility meets runway.",
    flux_editorial_image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=90",
    tags: ["cargo", "tactical", "monochrome"],
    base_price: 2999,
    is_active: true,
    units_sold: 34,
    total_revenue_generated: 101966,
    created_at: "2025-01-22T16:00:00Z",
    updated_at: "2025-02-18T10:00:00Z",
  },
];

const mockListings_zara: DesignListing[] = [
  {
    id: "lst_101",
    creator_id: "usr_zara",
    title: "Editorial Rose Corset",
    description: "Pastel rose editorial against white concrete. Feminine power.",
    flux_editorial_image_url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=90",
    tags: ["corset", "feminine", "editorial"],
    base_price: 1899,
    is_active: true,
    units_sold: 211,
    total_revenue_generated: 400689,
    created_at: "2024-10-10T09:00:00Z",
    updated_at: "2025-02-14T12:00:00Z",
  },
  {
    id: "lst_102",
    creator_id: "usr_zara",
    title: "Y2K Mesh Overlay Set",
    description: "Y2K comeback — electric blue mesh editorial in neon-lit studio.",
    flux_editorial_image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=90",
    tags: ["y2k", "mesh", "set"],
    base_price: 2199,
    is_active: true,
    units_sold: 178,
    total_revenue_generated: 391422,
    created_at: "2024-11-20T11:00:00Z",
    updated_at: "2025-01-30T15:00:00Z",
  },
  {
    id: "lst_103",
    creator_id: "usr_zara",
    title: "Midnight Velvet Blazer",
    description: "Deep midnight velvet tailored blazer — boardroom to runway.",
    flux_editorial_image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=90",
    tags: ["blazer", "velvet", "luxury"],
    base_price: 4599,
    is_active: true,
    units_sold: 97,
    total_revenue_generated: 446103,
    created_at: "2025-01-08T14:00:00Z",
    updated_at: "2025-02-20T10:00:00Z",
  },
];

// ─── Standard Creator (₹3,100 balance → STORE_CREDIT_ONLY) ───────────────────

export const mockStandardCreator: Creator = {
  id: "usr_standard_01",
  username: "karan.designs",
  display_name: "Karan Mehta",
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  bio: "Streetwear enthusiast. Every drop tells a story.",
  email: "karan@example.com",
  commission_tier: "STANDARD",
  commission_rate: 5,
  is_mega_influencer: false,
  is_campus_ambassador: false,
  is_verified: false,
  social_accounts: [],
  earnings: {
    current_balance: 3100,
    lifetime_earnings: 8400,
    pending_earnings: 250,
    last_payout_amount: 2500,
    last_payout_date: "2025-01-15T10:00:00Z",
    payout_status: "STORE_CREDIT_ONLY",
    commission_rate: 5,
    earnings_by_month: sampleMonthlyEarnings.slice(0, 5),
  },
  listings: mockListings_aryan.slice(0, 2),
  fest_pools: [],
  style_rank: "Street Scout",
  total_units_sold: 232,
  joined_at: "2024-08-01T00:00:00Z",
};

// ─── Campus Ambassador (with Fest Pool) ───────────────────────────────────────

export const mockCampusCreator: Creator = {
  id: "usr_campus_01",
  username: "nitk.aryan",
  display_name: "Aryan Verma",
  avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  bio: "NITK '26 · Fashion Forward · Campus Style Lead",
  email: "aryan.nitk@example.com",
  commission_tier: "CAMPUS_AMBASSADOR",
  commission_rate: 10,
  is_mega_influencer: false,
  is_campus_ambassador: true,
  is_verified: true,
  social_accounts: [
    {
      platform: "instagram",
      handle: "@aryan.nitk",
      follower_count: 24_500,
      verified: false,
      connected_at: "2024-09-01T00:00:00Z",
    },
  ],
  earnings: {
    current_balance: 1800,
    lifetime_earnings: 12_600,
    pending_earnings: 400,
    last_payout_amount: 2500,
    last_payout_date: "2024-12-20T10:00:00Z",
    payout_status: "LOCKED",
    commission_rate: 10,
    earnings_by_month: sampleMonthlyEarnings,
  },
  listings: mockListings_aryan,
  fest_pools: [
    {
      fest_name: "Incident 2025",
      institution: "NITK Surathkal",
      pool_balance: 18_450,
      active_ambassadors: 12,
      campaign_start: "2025-02-01T00:00:00Z",
      campaign_end: "2025-03-15T23:59:00Z",
      is_active: true,
    },
    {
      fest_name: "Engineer 2024",
      institution: "NITK Surathkal",
      pool_balance: 42_800,
      active_ambassadors: 20,
      campaign_start: "2024-10-01T00:00:00Z",
      campaign_end: "2024-11-01T23:59:00Z",
      is_active: false,
    },
  ],
  style_rank: "Trendsetter",
  total_units_sold: 322,
  joined_at: "2024-07-15T00:00:00Z",
};

// ─── Mega-Influencer (₹7,200 balance → CASH_AVAILABLE) ───────────────────────

export const mockMegaCreator: Creator = {
  id: "usr_mega_01",
  username: "zara.narrative",
  display_name: "Zara Kapoor",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
  bio: "Platform Icon. My designs wear the culture. 🔥",
  email: "zara@example.com",
  commission_tier: "MEGA_INFLUENCER",
  commission_rate: 45,
  is_mega_influencer: true,
  is_campus_ambassador: false,
  is_verified: true,
  social_accounts: [
    {
      platform: "instagram",
      handle: "@zara.narrative",
      follower_count: 682_000,
      verified: true,
      connected_at: "2024-06-01T00:00:00Z",
    },
    {
      platform: "youtube",
      handle: "ZaraKapoorStyle",
      follower_count: 310_000,
      verified: true,
      connected_at: "2024-06-01T00:00:00Z",
    },
  ],
  earnings: {
    current_balance: 7200,
    lifetime_earnings: 284_000,
    pending_earnings: 1200,
    last_payout_amount: 12_500,
    last_payout_date: "2025-01-28T10:00:00Z",
    payout_status: "CASH_AVAILABLE",
    commission_rate: 45,
    earnings_by_month: sampleMonthlyEarnings,
  },
  listings: mockListings_zara,
  fest_pools: [],
  style_rank: "Platform Icon",
  total_units_sold: 486,
  joined_at: "2024-05-01T00:00:00Z",
};

// ─── Second Mega Creator (for FeaturedMarketplace grid) ──────────────────────

export const mockMegaCreator2: Creator = {
  id: "usr_mega_02",
  username: "riyaz.drops",
  display_name: "Riyaz Khan",
  avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
  bio: "Curator of chaos. 750k strong. 🧢",
  email: "riyaz@example.com",
  commission_tier: "MEGA_INFLUENCER",
  commission_rate: 50,
  is_mega_influencer: true,
  is_campus_ambassador: false,
  is_verified: true,
  social_accounts: [
    {
      platform: "instagram",
      handle: "@riyaz.drops",
      follower_count: 750_000,
      verified: true,
      connected_at: "2024-04-01T00:00:00Z",
    },
    {
      platform: "twitter",
      handle: "@riyaz_drops",
      follower_count: 195_000,
      verified: true,
      connected_at: "2024-04-15T00:00:00Z",
    },
  ],
  earnings: {
    current_balance: 23_400,
    lifetime_earnings: 512_000,
    pending_earnings: 3200,
    last_payout_amount: 25_000,
    last_payout_date: "2025-02-01T10:00:00Z",
    payout_status: "CASH_AVAILABLE",
    commission_rate: 50,
    earnings_by_month: sampleMonthlyEarnings,
  },
  listings: [
    {
      id: "lst_201",
      creator_id: "usr_mega_02",
      title: "Concrete Jungle Utility Vest",
      description: "Urban editorial — tactical vest on midnight skyline backdrop.",
      flux_editorial_image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=90",
      tags: ["utility", "urban", "vest"],
      base_price: 3299,
      is_active: true,
      units_sold: 301,
      total_revenue_generated: 992_499,
      created_at: "2024-09-01T10:00:00Z",
      updated_at: "2025-02-22T09:00:00Z",
    },
    {
      id: "lst_202",
      creator_id: "usr_mega_02",
      title: "Phantom Oversized Coach Jacket",
      description: "All-black oversized coach jacket — shot against brutalist architecture.",
      flux_editorial_image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=90",
      tags: ["coach", "oversized", "phantom"],
      base_price: 4199,
      is_active: true,
      units_sold: 188,
      total_revenue_generated: 789_412,
      created_at: "2024-11-10T08:00:00Z",
      updated_at: "2025-01-18T11:00:00Z",
    },
  ],
  fest_pools: [],
  style_rank: "Platform Icon",
  total_units_sold: 489,
  joined_at: "2024-03-15T00:00:00Z",
};

// ─── Convenience export: all mock creators ────────────────────────────────────

export const ALL_MOCK_CREATORS: Creator[] = [
  mockStandardCreator,
  mockCampusCreator,
  mockMegaCreator,
  mockMegaCreator2,
];

/** Only mega-influencers — for FeaturedMarketplace */
export const MEGA_MOCK_CREATORS: Creator[] = ALL_MOCK_CREATORS.filter(
  (c) => c.is_mega_influencer
);
