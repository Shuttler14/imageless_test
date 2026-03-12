// =====================================================
// API: CALCULATE PAYOUT STATUS
// =====================================================
// Returns the available action based on user's balance:
// - LOCKED: Earnings under ₹2,500
// - STORE_CREDIT_ONLY: Earnings between ₹2,500 and ₹5,000
// - CASH_AVAILABLE: Earnings at ₹5,000+

import { NextRequest, NextResponse } from 'next/server';
import { mockCreators, PAYOUT_THRESHOLDS } from '@/lib/data';
import { PayoutCalculation, PayoutStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'user_id is required' },
      { status: 400 }
    );
  }

  const creator = mockCreators.find(c => c.id === userId);

  if (!creator) {
    return NextResponse.json(
      { success: false, error: 'Creator not found' },
      { status: 404 }
    );
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

  const payoutCalculation: PayoutCalculation = {
    status,
    current_balance: balance,
    store_credit_unlocked: storeCreditUnlocked,
    cash_withdrawal_unlocked: cashWithdrawalUnlocked,
    amount_to_store_credit: amountToStoreCredit,
    amount_to_cash: amountToCash,
    next_threshold: nextThreshold,
    next_threshold_type: nextThresholdType,
  };

  return NextResponse.json({
    success: true,
    data: payoutCalculation,
  });
}