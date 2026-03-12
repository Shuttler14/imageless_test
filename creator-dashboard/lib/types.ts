// =====================================================
// CREATOR DASHBOARD TYPES
// =====================================================

export type CommissionTier = 'standard' | 'micro_influencer' | 'mega_influencer';

export type PayoutStatus = 'LOCKED' | 'STORE_CREDIT_ONLY' | 'CASH_AVAILABLE';

export type StyleInfluenceRank =
  | 'rookie_designer'
  | 'emerging_talent'
  | 'trendsetter'
  | 'style_architect'
  | 'platform_icon';

export interface Creator {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  is_mega_influencer: boolean;
  is_campus_ambassador: boolean;
  commission_tier: CommissionTier;
  commission_rate: number;
  social_links: {
    instagram?: SocialAccount;
    youtube?: SocialAccount;
    twitter?: SocialAccount;
    linkedin?: SocialAccount;
  };
  balance: number;
  lifetime_earnings: number;
  active_listings: number;
  total_items_sold: number;
  style_influence_rank: StyleInfluenceRank;
  created_at: string;
}

export interface SocialAccount {
  handle: string;
  followers: number;
  verified: boolean;
  linked_at: string;
}

export interface DesignListing {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  flux_editorial_image_url: string;
  price: number;
  commission_rate: number;
  estimated_earnings_per_sale: number;
  total_sales: number;
  status: 'active' | 'paused' | 'sold_out';
  created_at: string;
}

export interface PayoutThreshold {
  amount: number;
  label: string;
  action: string;
}

export interface CampusFest {
  id: string;
  name: string;
  date: string;
  location: string;
  collective_pool: number;
  creator_contribution: number;
  is_active: boolean;
}

export interface EarningsDataPoint {
  date: string;
  amount: number;
}

export interface PayoutCalculation {
  status: PayoutStatus;
  current_balance: number;
  store_credit_unlocked: boolean;
  cash_withdrawal_unlocked: boolean;
  amount_to_store_credit: number;
  amount_to_cash: number;
  next_threshold: number;
  next_threshold_type: 'store_credit' | 'cash' | null;
}