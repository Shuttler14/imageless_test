// =====================================================
// API ROUTES - CREATOR FINANCE LOGIC
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  mockCreators,
  mockDesignListings,
  mockCampusFests,
  PAYOUT_THRESHOLDS
} from '@/lib/data';
import { PayoutCalculation, PayoutStatus } from '@/lib/types';

/**
 * =====================================================
 * CALCULATE PAYOUT STATUS
 * =====================================================
 * Returns the available action based on user's balance:
 * - LOCKED: Earnings under ₹2,500
 * - STORE_CREDIT_ONLY: Earnings between ₹2,500 and ₹5,000
 * - CASH_AVAILABLE: Earnings at ₹5,000+
 */
export function calculatePayoutStatus(userId: string): PayoutCalculation {
  const creator = mockCreators.find(c => c.id === userId);

  if (!creator) {
    return {
      status: 'LOCKED',
      current_balance: 0,
      store_credit_unlocked: false,
      cash_withdrawal_unlocked: false,
      amount_to_store_credit: 0,
      amount_to_cash: 0,
      next_threshold: PAYOUT_THRESHOLDS.STORE_CREDIT,
      next_threshold_type: 'store_credit',
    };
  }

  const balance = creator.balance;
  let status: PayoutStatus;
  let storeCreditUnlocked = false;
  let cashWithdrawalUnlocked = false;
  let amountToStoreCredit = 0;
  let amountToCash = 0;
  let nextThreshold: number;
  let nextThresholdType: 'store_credit' | 'cash' | null = null;

  if (balance < PAYOUT_THRESHOLDS.STORE_CREDIT) {
    status = 'LOCKED';
    nextThreshold = PAYOUT_THRESHOLDS.STORE_CREDIT;
    nextThresholdType = 'store_credit';
  } else if (balance < PAYOUT_THRESHOLDS.CASH_WITHDRAWAL) {
    status = 'STORE_CREDIT_ONLY';
    storeCreditUnlocked = true;
    amountToStoreCredit = balance;
    nextThreshold = PAYOUT_THRESHOLDS.CASH_WITHDRAWAL;
    nextThresholdType = 'cash';
  } else {
    status = 'CASH_AVAILABLE';
    storeCreditUnlocked = true;
    cashWithdrawalUnlocked = true;
    amountToStoreCredit = Math.min(balance, PAYOUT_THRESHOLDS.CASH_WITHDRAWAL);
    amountToCash = balance - amountToStoreCredit;
    nextThreshold = 0;
    nextThresholdType = null;
  }

  return {
    status,
    current_balance: balance,
    store_credit_unlocked: storeCreditUnlocked,
    cash_withdrawal_unlocked: cashWithdrawalUnlocked,
    amount_to_store_credit: amountToStoreCredit,
    amount_to_cash: amountToCash,
    next_threshold: nextThreshold,
    next_threshold_type: nextThresholdType,
  };
}

/**
 * =====================================================
 * GET ALL CREATORS (for marketplace)
 * =====================================================
 */
export async function GETCreators(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const megaInfluencerOnly = searchParams.get('mega_influencer') === 'true';

  let creators = mockCreators;

  if (megaInfluencerOnly) {
    creators = mockCreators.filter(c => c.is_mega_influencer);
  }

  // Enrich with listing counts
  const enrichedCreators = creators.map(creator => {
    const listings = mockDesignListings.filter(l => l.creator_id === creator.id);
    return {
      ...creator,
      total_listings: listings.length,
      featured_listings: listings.slice(0, 4),
    };
  });

  return NextResponse.json({
    success: true,
    data: enrichedCreators,
    count: enrichedCreators.length,
  });
}

/**
 * =====================================================
 * GET SINGLE CREATOR
 * =====================================================
 */
export async function GETCreator(request: NextRequest, { params }: { params: { id: string } }) {
  const creator = mockCreators.find(c => c.id === params.id || c.username === params.id);

  if (!creator) {
    return NextResponse.json(
      { success: false, error: 'Creator not found' },
      { status: 404 }
    );
  }

  const listings = mockDesignListings.filter(l => l.creator_id === creator.id);
  const payoutInfo = calculatePayoutStatus(creator.id);

  return NextResponse.json({
    success: true,
    data: {
      ...creator,
      listings,
      payout_info: payoutInfo,
    },
  });
}

/**
 * =====================================================
 * GET CREATOR'S DESIGNS
 * =====================================================
 */
export async function GETCreatorDesigns(request: NextRequest, { params }: { params: { id: string } }) {
  const listings = mockDesignListings.filter(l => l.creator_id === params.id);

  return NextResponse.json({
    success: true,
    data: listings,
    count: listings.length,
  });
}

/**
 * =====================================================
 * GET CAMPUS FESTS FOR CREATOR
 * =====================================================
 */
export async function GETCampusFests(request: NextRequest, { params }: { params: { id: string } }) {
  // In production, filter by creator's campus ambassador status
  const creator = mockCreators.find(c => c.id === params.id);

  if (!creator || !creator.is_campus_ambassador) {
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
    });
  }

  return NextResponse.json({
    success: true,
    data: mockCampusFests,
    count: mockCampusFests.length,
  });
}

/**
 * =====================================================
 * LINK SOCIAL ACCOUNT (MOCK)
 * =====================================================
 */
export async function POSTLinkSocial(request: NextRequest) {
  // MOCK - In production, this would use real OAuth
  const body = await request.json();
  const { user_id, platform, handle, followers } = body;

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Determine commission tier based on followers
  let newTier = 'standard';
  let newRate = 5;

  if (platform === 'instagram' && followers >= 500000) {
    newTier = 'mega_influencer';
    newRate = 50;
  } else if (platform === 'instagram' && followers >= 100000) {
    newTier = 'micro_influencer';
    newRate = 15;
  } else if (platform === 'youtube' && followers >= 250000) {
    newTier = 'mega_influencer';
    newRate = 50;
  } else if (platform === 'youtube' && followers >= 50000) {
    newTier = 'micro_influencer';
    newRate = 15;
  } else if (platform === 'twitter' && followers >= 150000) {
    newTier = 'mega_influencer';
    newRate = 50;
  } else if (platform === 'linkedin' && followers >= 750000) {
    newTier = 'mega_influencer';
    newRate = 50;
  }

  return NextResponse.json({
    success: true,
    data: {
      platform,
      handle,
      followers,
      tier: newTier,
      commission_rate: newRate,
      message: `Successfully linked ${platform} account! Your commission rate is now ${newRate}%`,
    },
  });
}

/**
 * =====================================================
 * INITIATE PAYOUT (MOCK STRIPE INTEGRATION)
 * =====================================================
 */
export async function POSTPayout(request: NextRequest) {
  // MOCK - In production, this would integrate with Stripe
  const body = await request.json();
  const { user_id, amount, type } = body; // type: 'store_credit' | 'cash'

  // Calculate payout status
  const payoutInfo = calculatePayoutStatus(user_id);

  if (type === 'cash' && !payoutInfo.cash_withdrawal_unlocked) {
    return NextResponse.json(
      {
        success: false,
        error: 'Cash withdrawal requires minimum ₹5,000 balance'
      },
      { status: 400 }
    );
  }

  if (type === 'store_credit' && !payoutInfo.store_credit_unlocked) {
    return NextResponse.json(
      {
        success: false,
        error: 'Store credit redemption requires minimum ₹2,500 balance'
      },
      { status: 400 }
    );
  }

  // Simulate Stripe payout processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  return NextResponse.json({
    success: true,
    data: {
      transaction_id: `txn_${Date.now()}`,
      amount,
      type,
      status: 'processing',
      estimated_arrival: type === 'cash' ? '3-5 business days' : 'instant',
      message: type === 'cash'
        ? `Payout of ₹${amount} initiated to your bank account`
        : `Store credit of ₹${amount} added to your account`,
    },
  });
}

/**
 * =====================================================
 * GET FEATURED CREATORS (Mega Influencers Only)
 * =====================================================
 */
export async function GETFeaturedCreators(request: NextRequest) {
  const megaCreators = mockCreators.filter(c => c.is_mega_influencer);

  const enriched = megaCreators.map(creator => {
    const listings = mockDesignListings.filter(l => l.creator_id === creator.id);
    return {
      ...creator,
      total_listings: listings.length,
      featured_listings: listings.slice(0, 4),
      total_sales_value: listings.reduce((sum, l) => sum + (l.price * l.total_sales), 0),
    };
  });

  return NextResponse.json({
    success: true,
    data: enriched,
    count: enriched.length,
  });
}