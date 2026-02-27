/**
 * MY NARRATIVE — Creator API Routes (Mocked)
 * ============================================
 * Express / Next.js API Route handlers for the Design-to-Earn system.
 *
 * ANTI-HALLUCINATION GUARDRAIL:
 *   - Social OAuth (Instagram / YouTube / Twitter / LinkedIn) is MOCKED.
 *   - Bank payout (Stripe / Razorpay) is MOCKED.
 *   - Database calls use an in-memory mock store for demonstration.
 *   - In production, replace mock* functions with real DB queries & SDK calls.
 *
 * Business Rules Encoded:
 *   1. Standard commission: 5%
 *   2. Mega-Influencer thresholds: IG 500k | YT 250k | TW 150k | LI 75k
 *   3. Mega-Influencer commission: up to 50% (scales with total reach)
 *   4. Payout LOCKED < ₹2,500 | STORE_CREDIT_ONLY ₹2,500–₹4,999 | CASH_AVAILABLE ₹5,000+
 */

import {
  Creator,
  CommissionTier,
  CommissionTierConfig,
  PayoutStatus,
  PayoutStatusResponse,
  SocialConnectResponse,
  TierUpgradeResponse,
  SocialPlatform,
  MEGA_INFLUENCER_THRESHOLDS,
  PAYOUT_THRESHOLDS,
} from "../types";

// ─── Commission Tier Configs ─────────────────────────────────────────────────

export const TIER_CONFIGS: Record<CommissionTier, CommissionTierConfig> = {
  STANDARD: {
    tier: "STANDARD",
    rate: 5,
    label: "Standard Creator",
    description: "5% commission on every sale.",
  },
  MICRO_INFLUENCER: {
    tier: "MICRO_INFLUENCER",
    rate: 15,
    label: "Micro-Influencer",
    description: "15% commission. Verified smaller creator with engaged audience.",
  },
  CAMPUS_AMBASSADOR: {
    tier: "CAMPUS_AMBASSADOR",
    rate: 10,
    label: "Campus Ambassador",
    description: "10% commission + access to collective Fest Pool earnings.",
  },
  MEGA_INFLUENCER: {
    tier: "MEGA_INFLUENCER",
    rate: 50, // maximum — actual rate may be lower depending on reach
    label: "Mega-Influencer",
    description: "Up to 50% commission. Unlocked by linking socials with 500k+ IG followers.",
  },
};

// ─── Mock Database ────────────────────────────────────────────────────────────
// Replace with Prisma / PostgreSQL queries in production.

const mockCreatorStore: Map<string, Creator> = new Map();

function getMockCreator(userId: string): Creator | null {
  return mockCreatorStore.get(userId) ?? null;
}

function saveMockCreator(creator: Creator): void {
  mockCreatorStore.set(creator.id, creator);
}

// ─── Business Logic: Payout Status ───────────────────────────────────────────

/**
 * calculate_payout_status
 * -----------------------
 * Reads the user's current balance and returns:
 *   - LOCKED            → balance < ₹2,500
 *   - STORE_CREDIT_ONLY → ₹2,500 ≤ balance < ₹5,000
 *   - CASH_AVAILABLE    → balance ≥ ₹5,000
 *
 * Also returns helper fields for the UI progress bar.
 */
export function calculate_payout_status(userId: string): PayoutStatusResponse {
  const creator = getMockCreator(userId);

  if (!creator) {
    throw new Error(`Creator not found: ${userId}`);
  }

  const balance = creator.earnings.current_balance;

  let payout_status: PayoutStatus;
  let message: string;

  if (balance >= PAYOUT_THRESHOLDS.CASH_WITHDRAWAL) {
    payout_status = "CASH_AVAILABLE";
    message = `You have ${formatINR(balance)} available. You can withdraw cash to your bank account or redeem as Store Credit.`;
  } else if (balance >= PAYOUT_THRESHOLDS.STORE_CREDIT) {
    payout_status = "STORE_CREDIT_ONLY";
    message = `You have ${formatINR(balance)} in Store Credit. Earn ${formatINR(
      PAYOUT_THRESHOLDS.CASH_WITHDRAWAL - balance
    )} more to unlock Cash Withdrawal.`;
  } else {
    payout_status = "LOCKED";
    message = `Your balance of ${formatINR(balance)} is locked. Earn ${formatINR(
      PAYOUT_THRESHOLDS.STORE_CREDIT - balance
    )} more to unlock Store Credit redemption.`;
  }

  return {
    user_id: userId,
    current_balance: balance,
    payout_status,
    store_credit_unlocked: balance >= PAYOUT_THRESHOLDS.STORE_CREDIT,
    cash_withdrawal_unlocked: balance >= PAYOUT_THRESHOLDS.CASH_WITHDRAWAL,
    amount_to_store_credit_unlock: Math.max(0, PAYOUT_THRESHOLDS.STORE_CREDIT - balance),
    amount_to_cash_unlock: Math.max(0, PAYOUT_THRESHOLDS.CASH_WITHDRAWAL - balance),
    message,
  };
}

// ─── Business Logic: Commission Tier Calculation ─────────────────────────────

/**
 * calculate_commission_rate
 * --------------------------
 * Determines the commission rate based on the creator's tier and
 * total social following. Mega-Influencers get up to 50%, scaled
 * by their total cross-platform reach.
 *
 * Rate scale for Mega-Influencer:
 *   Base: 30%
 *   +5% per 500k additional followers (capped at 50%)
 */
export function calculate_commission_rate(creator: Creator): number {
  if (creator.commission_tier !== "MEGA_INFLUENCER") {
    return TIER_CONFIGS[creator.commission_tier].rate;
  }

  const totalFollowers = creator.social_accounts.reduce(
    (sum, s) => sum + s.follower_count,
    0
  );

  // Base mega rate: 30%. Every 500k adds 5%, max 50%.
  const bonus = Math.floor(totalFollowers / 500_000) * 5;
  const rate = Math.min(30 + bonus, 50);
  return rate;
}

/**
 * check_mega_influencer_eligibility
 * -----------------------------------
 * Returns true if any of the creator's connected social accounts
 * meets or exceeds the platform-specific follower threshold.
 */
export function check_mega_influencer_eligibility(creator: Creator): boolean {
  return creator.social_accounts.some(
    (account) =>
      account.follower_count >= MEGA_INFLUENCER_THRESHOLDS[account.platform]
  );
}

/**
 * upgrade_tier_if_eligible
 * -------------------------
 * Checks and upgrades the creator's commission tier.
 * Returns a TierUpgradeResponse describing the result.
 */
export function upgrade_tier_if_eligible(userId: string): TierUpgradeResponse {
  const creator = getMockCreator(userId);
  if (!creator) throw new Error(`Creator not found: ${userId}`);

  const previousTier = creator.commission_tier;

  if (check_mega_influencer_eligibility(creator)) {
    creator.commission_tier = "MEGA_INFLUENCER";
    creator.is_mega_influencer = true;
    creator.commission_rate = calculate_commission_rate(creator);
    saveMockCreator(creator);

    return {
      upgraded: previousTier !== "MEGA_INFLUENCER",
      new_tier: "MEGA_INFLUENCER",
      new_rate: creator.commission_rate,
      message: `Congratulations! You've been upgraded to Mega-Influencer with a ${creator.commission_rate}% commission rate.`,
    };
  }

  return {
    upgraded: false,
    new_tier: previousTier,
    new_rate: creator.commission_rate,
    message: "Tier unchanged. Connect socials with sufficient reach to upgrade.",
  };
}

// ─── Mocked Social OAuth ──────────────────────────────────────────────────────
// In production: replace with real OAuth 2.0 flows for each platform.

/**
 * mock_connect_social
 * --------------------
 * Simulates linking a social account.
 * Generates a randomised follower count for demonstration.
 * Automatically checks tier upgrade after connecting.
 */
export async function mock_connect_social(
  userId: string,
  platform: SocialPlatform,
  handle: string
): Promise<SocialConnectResponse> {
  const creator = getMockCreator(userId);
  if (!creator) throw new Error(`Creator not found: ${userId}`);

  // ── MOCK: Simulate OAuth token exchange & profile fetch ──────────────────
  // In production this would be:
  //   const token = await exchangeCodeForToken(code, platform);
  //   const profile = await fetchPlatformProfile(token, platform);
  //   const follower_count = profile.followers_count;
  // ─────────────────────────────────────────────────────────────────────────

  // Simulate variable follower counts (seeded by handle length for consistency)
  const seed = handle.length * 73_821;
  const MOCK_FOLLOWER_RANGES: Record<SocialPlatform, [number, number]> = {
    instagram: [10_000, 800_000],
    youtube: [5_000, 400_000],
    twitter: [2_000, 300_000],
    linkedin: [1_000, 120_000],
  };
  const [min, max] = MOCK_FOLLOWER_RANGES[platform];
  const mock_follower_count = Math.floor(min + (seed % (max - min)));

  // Remove existing entry for the same platform (re-connect)
  creator.social_accounts = creator.social_accounts.filter(
    (s) => s.platform !== platform
  );

  creator.social_accounts.push({
    platform,
    handle,
    follower_count: mock_follower_count,
    verified: mock_follower_count > 50_000,
    connected_at: new Date().toISOString(),
  });

  saveMockCreator(creator);

  // Check for tier upgrade
  const tierResult = upgrade_tier_if_eligible(userId);

  return {
    success: true,
    platform,
    follower_count: mock_follower_count,
    tier_upgraded: tierResult.upgraded,
    new_tier: tierResult.upgraded ? tierResult.new_tier : undefined,
    new_rate: tierResult.upgraded ? tierResult.new_rate : undefined,
    message: tierResult.upgraded
      ? tierResult.message
      : `${platform} connected with ${formatCompact(mock_follower_count)} followers. Keep growing to unlock Mega-Influencer tier!`,
  };
}

// ─── Mocked Payout Actions ────────────────────────────────────────────────────
// In production: replace with Razorpay / Stripe / bank transfer SDK calls.

export interface PayoutActionResult {
  success: boolean;
  amount: number;
  method: "STORE_CREDIT" | "BANK_TRANSFER";
  reference_id: string;
  message: string;
}

/**
 * mock_redeem_store_credit
 * -------------------------
 * Deducts the balance and issues a store credit coupon code.
 * Only available when balance ≥ ₹2,500.
 */
export async function mock_redeem_store_credit(
  userId: string
): Promise<PayoutActionResult> {
  const creator = getMockCreator(userId);
  if (!creator) throw new Error(`Creator not found: ${userId}`);

  const status = calculate_payout_status(userId);
  if (!status.store_credit_unlocked) {
    throw new Error(
      `Store credit not yet available. Need ₹${status.amount_to_store_credit_unlock} more.`
    );
  }

  const amount = creator.earnings.current_balance;

  // ── MOCK: In production, call Shopify / internal store credit API ─────────
  const mock_coupon_code = `MN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  // ─────────────────────────────────────────────────────────────────────────

  // Deduct balance
  creator.earnings.current_balance = 0;
  creator.earnings.last_payout_amount = amount;
  creator.earnings.last_payout_date = new Date().toISOString();
  creator.earnings.payout_status = "LOCKED";
  saveMockCreator(creator);

  return {
    success: true,
    amount,
    method: "STORE_CREDIT",
    reference_id: mock_coupon_code,
    message: `₹${amount.toLocaleString("en-IN")} redeemed as Store Credit. Coupon code: ${mock_coupon_code}`,
  };
}

/**
 * mock_withdraw_cash
 * -------------------
 * Initiates a bank transfer payout.
 * Only available when balance ≥ ₹5,000.
 */
export async function mock_withdraw_cash(
  userId: string,
  bank_account_number: string,
  ifsc_code: string
): Promise<PayoutActionResult> {
  const creator = getMockCreator(userId);
  if (!creator) throw new Error(`Creator not found: ${userId}`);

  const status = calculate_payout_status(userId);
  if (!status.cash_withdrawal_unlocked) {
    throw new Error(
      `Cash withdrawal not yet available. Need ₹${status.amount_to_cash_unlock} more.`
    );
  }

  const amount = creator.earnings.current_balance;

  // ── MOCK: In production, call Razorpay Payout API or Stripe Connect ───────
  // const razorpay = new Razorpay({ key_id, key_secret });
  // const payout = await razorpay.payouts.create({ amount: amount * 100, ... });
  const mock_transfer_id = `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  // ─────────────────────────────────────────────────────────────────────────

  // Deduct balance
  creator.earnings.current_balance = 0;
  creator.earnings.last_payout_amount = amount;
  creator.earnings.last_payout_date = new Date().toISOString();
  creator.earnings.payout_status = "LOCKED";
  saveMockCreator(creator);

  return {
    success: true,
    amount,
    method: "BANK_TRANSFER",
    reference_id: mock_transfer_id,
    message: `₹${amount.toLocaleString("en-IN")} transferred to account ending ${bank_account_number.slice(-4)}. Ref: ${mock_transfer_id}. Allow 1–2 business days.`,
  };
}

// ─── Utility Helpers ─────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── Route Handler Wrappers (Next.js App Router style) ───────────────────────
// Wire these into your app/api/creator/[...route]/route.ts

export async function GET_payout_status(
  req: Request,
  { params }: { params: { userId: string } }
): Promise<Response> {
  try {
    const result = calculate_payout_status(params.userId);
    return Response.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 404 });
  }
}

export async function POST_connect_social(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { user_id, platform, handle } = body as {
      user_id: string;
      platform: SocialPlatform;
      handle: string;
    };

    if (!user_id || !platform || !handle) {
      return Response.json({ error: "user_id, platform, and handle are required." }, { status: 400 });
    }

    const result = await mock_connect_social(user_id, platform, handle);
    return Response.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST_redeem_store_credit(req: Request): Promise<Response> {
  try {
    const { user_id } = await req.json();
    const result = await mock_redeem_store_credit(user_id);
    return Response.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function POST_withdraw_cash(req: Request): Promise<Response> {
  try {
    const { user_id, bank_account_number, ifsc_code } = await req.json();
    const result = await mock_withdraw_cash(user_id, bank_account_number, ifsc_code);
    return Response.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }
}
