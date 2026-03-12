import { Creator, DesignListing, CampusFest, EarningsDataPoint, StyleInfluenceRank } from './types';

// =====================================================
// STYLE INFLUENCE RANK THRESHOLDS
// =====================================================
export const RANK_THRESHOLDS: Record<StyleInfluenceRank, number> = {
  rookie_designer: 0,
  emerging_talent: 10000,
  trendsetter: 50000,
  style_architect: 150000,
  platform_icon: 500000,
};

export const RANK_LABELS: Record<StyleInfluenceRank, { title: string; emoji: string; description: string }> = {
  rookie_designer: { title: 'Rookie Designer', emoji: '🌱', description: 'Just starting your style journey' },
  emerging_talent: { title: 'Emerging Talent', emoji: '⭐', description: 'Building your fashion presence' },
  trendsetter: { title: 'Trendsetter', emoji: '🔥', description: 'Setting trends in the community' },
  style_architect: { title: 'Style Architect', emoji: '🏛️', description: 'Defining the future of fashion' },
  platform_icon: { title: 'Platform Icon', emoji: '👑', description: 'A legendary voice in style' },
};

// =====================================================
// COMMISSION RULES
// =====================================================
export const COMMISSION_TIERS = {
  standard: { rate: 5, label: 'Standard User', minFollowers: 0 },
  micro_influencer: { rate: 15, label: 'Micro-Influencer', minFollowers: 10000 },
  mega_influencer: { rate: 50, label: 'Mega-Influencer', minFollowers: 500000 },
};

export const SOCIAL thresholds = {
  instagram: 500000,
  youtube: 250000,
  twitter: 150000,
  linkedin: 750000,
};

// =====================================================
// PAYOUT THRESHOLDS
// =====================================================
export const PAYOUT_THRESHOLDS = {
  STORE_CREDIT: 2500,
  CASH_WITHDRAWAL: 5000,
};

// =====================================================
// MOCK CREATORS
// =====================================================
export const mockCreators: Creator[] = [
  {
    id: 'creator_001',
    username: 'fashion_vaidya',
    email: 'vaidya@fashion.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    is_mega_influencer: true,
    is_campus_ambassador: false,
    commission_tier: 'mega_influencer',
    commission_rate: 50,
    social_links: {
      instagram: { handle: '@fashion_vaidya', followers: 650000, verified: true, linked_at: '2024-01-15' },
      youtube: { handle: 'FashionVaidya', followers: 280000, verified: true, linked_at: '2024-01-15' },
    },
    balance: 8500,
    lifetime_earnings: 125000,
    active_listings: 12,
    total_items_sold: 342,
    style_influence_rank: 'platform_icon',
    created_at: '2023-06-01',
  },
  {
    id: 'creator_002',
    username: 'style_surfer',
    email: 'surfer@style.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    is_mega_influencer: true,
    is_campus_ambassador: true,
    commission_tier: 'mega_influencer',
    commission_rate: 45,
    social_links: {
      instagram: { handle: '@style_surfer', followers: 520000, verified: true, linked_at: '2024-02-01' },
      twitter: { handle: '@stylesurfer', followers: 180000, verified: false, linked_at: '2024-02-01' },
    },
    balance: 3200,
    lifetime_earnings: 78000,
    active_listings: 8,
    total_items_sold: 156,
    style_influence_rank: 'trendsetter',
    created_at: '2023-08-15',
  },
  {
    id: 'creator_003',
    username: 'urban_threads',
    email: 'urban@threads.com',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    is_mega_influencer: false,
    is_campus_ambassador: true,
    commission_tier: 'micro_influencer',
    commission_rate: 15,
    social_links: {
      instagram: { handle: '@urban_threads', followers: 45000, verified: false, linked_at: '2024-03-01' },
    },
    balance: 1800,
    lifetime_earnings: 18500,
    active_listings: 5,
    total_items_sold: 42,
    style_influence_rank: 'emerging_talent',
    created_at: '2024-01-10',
  },
  {
    id: 'creator_004',
    username: 'retro_vibes_only',
    email: 'retro@vibes.com',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    is_mega_influencer: false,
    is_campus_ambassador: false,
    commission_tier: 'standard',
    commission_rate: 5,
    social_links: {},
    balance: 800,
    lifetime_earnings: 3200,
    active_listings: 3,
    total_items_sold: 12,
    style_influence_rank: 'rookie_designer',
    created_at: '2024-06-01',
  },
];

// =====================================================
// MOCK DESIGN LISTINGS
// =====================================================
export const mockDesignListings: DesignListing[] = [
  {
    id: 'design_001',
    creator_id: 'creator_001',
    title: 'Neon Dreams T-Shirt',
    description: 'Cyberpunk-inspired neon graphic tee with reflective elements',
    flux_editorial_image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
    price: 1899,
    commission_rate: 50,
    estimated_earnings: 949,
    total_sales: 89,
    status: 'active',
    created_at: '2024-01-10',
  },
  {
    id: 'design_002',
    creator_id: 'creator_001',
    title: 'Old Money Oversized Hoodie',
    description: 'Premium cotton oversized hoodie in classic beige tones',
    flux_editorial_image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop',
    price: 2499,
    commission_rate: 50,
    estimated_earnings: 1249,
    total_sales: 67,
    status: 'active',
    created_at: '2024-01-15',
  },
  {
    id: 'design_003',
    creator_id: 'creator_001',
    title: 'Street Culture Graphic Tee',
    description: 'Bold street art inspired design for the urban explorer',
    flux_editorial_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    price: 1499,
    commission_rate: 50,
    estimated_earnings: 749,
    total_sales: 124,
    status: 'active',
    created_at: '2024-02-01',
  },
  {
    id: 'design_004',
    creator_id: 'creator_002',
    title: 'Minimalist Mono Hoodie',
    description: 'Clean black hoodie with subtle tonal branding',
    flux_editorial_image_url: 'https://images.unsplash.com/photo-1551028919-ac66e9a1d4fe?w=600&h=800&fit=crop',
    price: 2199,
    commission_rate: 45,
    estimated_earnings: 989,
    total_sales: 45,
    status: 'active',
    created_at: '2024-02-10',
  },
  {
    id: 'design_005',
    creator_id: 'creator_002',
    title: 'Indo-Western Fusion Kurta',
    description: 'Contemporary take on traditional wear with modern silhouettes',
    flux_editorial_image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=800&fit=crop',
    price: 3299,
    commission_rate: 45,
    estimated_earnings: 1484,
    total_sales: 28,
    status: 'active',
    created_at: '2024-02-20',
  },
  {
    id: 'design_006',
    creator_id: 'creator_003',
    title: 'Campus Crew Oversized',
    description: 'Perfect college essentials oversized tee',
    flux_editorial_image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop',
    price: 1199,
    commission_rate: 15,
    estimated_earnings: 179,
    total_sales: 18,
    status: 'active',
    created_at: '2024-03-01',
  },
  {
    id: 'design_007',
    creator_id: 'creator_003',
    title: 'Cafe Racer Jacket',
    description: 'Vintage-inspired motorcycle jacket design',
    flux_editorial_image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
    price: 3999,
    commission_rate: 15,
    estimated_earnings: 599,
    total_sales: 8,
    status: 'active',
    created_at: '2024-03-10',
  },
  {
    id: 'design_008',
    creator_id: 'creator_004',
    title: 'Basic White Tee',
    description: 'Essential everyday white t-shirt',
    flux_editorial_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    price: 799,
    commission_rate: 5,
    estimated_earnings: 39,
    total_sales: 5,
    status: 'active',
    created_at: '2024-06-01',
  },
];

// =====================================================
// MOCK CAMPUS FESTS
// =====================================================
export const mockCampusFests: CampusFest[] = [
  {
    id: 'fest_001',
    name: 'UVCE Tech Fest 2024',
    date: '2024-03-15',
    location: 'Bangalore',
    collective_pool: 50000,
    creator_contribution: 8500,
    is_active: true,
  },
  {
    id: 'fest_002',
    name: 'NITK Spring Fest',
    date: '2024-03-22',
    location: 'Mangalore',
    collective_pool: 35000,
    creator_contribution: 5200,
    is_active: true,
  },
  {
    id: 'fest_003',
    name: 'BMS College Cultural Fest',
    date: '2024-02-28',
    location: 'Bangalore',
    collective_pool: 25000,
    creator_contribution: 3800,
    is_active: false,
  },
];

// =====================================================
// MOCK EARNINGS HISTORY
// =====================================================
export const mockEarningsHistory: EarningsDataPoint[] = [
  { date: '2024-01', amount: 2500 },
  { date: '2024-02', amount: 4800 },
  { date: '2024-03', amount: 7200 },
  { date: '2024-04', amount: 8500 },
  { date: '2024-05', amount: 11000 },
  { date: '2024-06', amount: 12500 },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================
export function calculateStyleInfluenceRank(lifetimeEarnings: number): StyleInfluenceRank {
  if (lifetimeEarnings >= RANK_THRESHOLDS.platform_icon) return 'platform_icon';
  if (lifetimeEarnings >= RANK_THRESHOLDS.style_architect) return 'style_architect';
  if (lifetimeEarnings >= RANK_THRESHOLDS.trendsetter) return 'trendsetter';
  if (lifetimeEarnings >= RANK_THRESHOLDS.emerging_talent) return 'emerging_talent';
  return 'rookie_designer';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateProgressPercentage(current: number, target: number): number {
  return Math.min(100, Math.max(0, (current / target) * 100));
}