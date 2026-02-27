// ============================================================
// MY NARRATIVE — Design-to-Earn Creator Dashboard
// TypeScript Interfaces & Type Definitions
// ============================================================

// ----- Enums ------------------------------------------------

export type PayoutStatus = "LOCKED" | "STORE_CREDIT_ONLY" | "CASH_AVAILABLE";

export type StyleInfluenceRank =
  | "Rookie Designer"
  | "Street Scout"
  | "Trendsetter"
  | "Style Authority"
  | "Platform Icon";

export type CommissionTier =
  | "STANDARD"
  | "MICRO_INFLUENCER"
  | "CAMPUS_AMBASSADOR"
  | "MEGA_INFLUENCER";

export type SocialPlatform = "instagram" | "youtube" | "twitter" | "linkedin";

// ----- Social Account ---------------------------------------

export interface SocialAccount {
  platform: SocialPlatform;
  handle: string;
  follower_count: number;
  verified: boolean;
  connected_at: string; // ISO datetime
}

// ----- Commission Tier Rules --------------------------------

export interface CommissionTierConfig {
  tier: CommissionTier;
  rate: number; // percentage e.g. 5, 15, 30, 50
  label: string;
  description: string;
}

// The thresholds that trigger Mega-Influencer status
export const MEGA_INFLUENCER_THRESHOLDS: Record<SocialPlatform, number> = {
  instagram: 500_000,
  youtube: 250_000,
  twitter: 150_000,
  linkedin: 75_000,
};

// Payout thresholds (in INR ₹)
export const PAYOUT_THRESHOLDS = {
  STORE_CREDIT: 2500,
  CASH_WITHDRAWAL: 5000,
} as const;

// Style Influence Rank ladder (keyed by lifetime earnings in ₹)
export const RANK_LADDER: Array<{
  min: number;
  rank: StyleInfluenceRank;
  emoji: string;
  color: string;
}> = [
  { min: 0, rank: "Rookie Designer", emoji: "🪡", color: "text-zinc-400" },
  { min: 2500, rank: "Street Scout", emoji: "🧢", color: "text-sky-400" },
  { min: 10000, rank: "Trendsetter", emoji: "🔥", color: "text-orange-400" },
  { min: 50000, rank: "Style Authority", emoji: "⚡", color: "text-purple-400" },
  { min: 200000, rank: "Platform Icon", emoji: "👑", color: "text-yellow-400" },
];

// ----- Design Listing ---------------------------------------

export interface DesignListing {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  /**
   * CRITICAL: This is the FLUX-generated editorial VTO image URL.
   * Never use flat_tshirt_image. Always use this field for display.
   */
  flux_editorial_image_url: string;
  /**
   * Optional second shot (back/detail) — also FLUX-generated
   */
  flux_secondary_image_url?: string;
  tags: string[];
  base_price: number; // INR
  is_active: boolean;
  units_sold: number;
  total_revenue_generated: number; // INR
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

// ----- Campus / Fest Tracking ------------------------------

export interface FestPool {
  fest_name: string;
  institution: string;
  pool_balance: number; // INR — collective earnings from the fest campaign
  active_ambassadors: number;
  campaign_start: string; // ISO datetime
  campaign_end: string; // ISO datetime
  is_active: boolean;
}

// ----- Earnings Tracker ------------------------------------

export interface EarningsTracker {
  current_balance: number; // INR — withdrawable / redeemable now
  lifetime_earnings: number; // INR — all-time gross
  pending_earnings: number; // INR — in transit / not yet cleared
  last_payout_amount: number; // INR
  last_payout_date: string | null; // ISO datetime
  payout_status: PayoutStatus;
  commission_rate: number; // percentage
  earnings_by_month: Array<{
    month: string; // e.g. "Jan 2025"
    earnings: number; // INR
    units_sold: number;
  }>;
}

// ----- Creator (Full Profile) ------------------------------

export interface Creator {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  email: string; // private — never expose on public profile
  commission_tier: CommissionTier;
  commission_rate: number; // percentage
  is_mega_influencer: boolean;
  is_campus_ambassador: boolean;
  is_verified: boolean;
  social_accounts: SocialAccount[];
  earnings: EarningsTracker;
  listings: DesignListing[];
  fest_pools: FestPool[]; // populated only if is_campus_ambassador === true
  style_rank: StyleInfluenceRank;
  total_units_sold: number;
  joined_at: string; // ISO datetime
}

// ----- API Responses ----------------------------------------

export interface PayoutStatusResponse {
  user_id: string;
  current_balance: number;
  payout_status: PayoutStatus;
  store_credit_unlocked: boolean;
  cash_withdrawal_unlocked: boolean;
  amount_to_store_credit_unlock: number; // how many ₹ more needed
  amount_to_cash_unlock: number; // how many ₹ more needed
  message: string;
}

export interface TierUpgradeResponse {
  upgraded: boolean;
  new_tier: CommissionTier;
  new_rate: number;
  message: string;
}

export interface SocialConnectResponse {
  success: boolean;
  platform: SocialPlatform;
  follower_count: number;
  tier_upgraded: boolean;
  new_tier?: CommissionTier;
  new_rate?: number;
  message: string;
}
