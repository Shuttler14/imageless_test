// =====================================================
// API: INITIATE PAYOUT (MOCK STRIPE INTEGRATION)
// =====================================================
// [ANTI-HALLUCINATION GUARDRAIL]: This is a mock implementation
// In production, this would integrate with Stripe Connect for real payouts

import { NextRequest, NextResponse } from 'next/server';
import { mockCreators, PAYOUT_THRESHOLDS } from '@/lib/data';

export async function POST(request: NextRequest) {
  // MOCK - Simulates Stripe Connect payout processing
  // In production: Use Stripe Connect APIs for real bank transfers

  try {
    const body = await request.json();
    const { user_id, amount, type, bank_details } = body;

    if (!user_id || !amount || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id, amount, type' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['store_credit', 'cash'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be store_credit or cash' },
        { status: 400 }
      );
    }

    const creator = mockCreators.find(c => c.id === user_id);

    if (!creator) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Validate balance
    if (amount > creator.balance) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Validate thresholds
    if (type === 'store_credit' && creator.balance < PAYOUT_THRESHOLDS.STORE_CREDIT) {
      return NextResponse.json(
        {
          success: false,
          error: `Store credit redemption requires minimum ₹${PAYOUT_THRESHOLDS.STORE_CREDIT} balance`,
          current_balance: creator.balance,
          required: PAYOUT_THRESHOLDS.STORE_CREDIT,
        },
        { status: 400 }
      );
    }

    if (type === 'cash' && creator.balance < PAYOUT_THRESHOLDS.CASH_WITHDRAWAL) {
      return NextResponse.json(
        {
          success: false,
          error: `Cash withdrawal requires minimum ₹${PAYOUT_THRESHOLDS.CASH_WITHDRAWAL} balance`,
          current_balance: creator.balance,
          required: PAYOUT_THRESHOLDS.CASH_WITHDRAWAL,
        },
        { status: 400 }
      );
    }

    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In production, this would:
    // 1. Create Stripe Connect transfer
    // 2. Validate bank account with Stripe
    // 3. Process the payout
    // 4. Send notification to user

    const isStoreCredit = type === 'store_credit';

    return NextResponse.json({
      success: true,
      data: {
        transaction_id: transactionId,
        amount: amount,
        type: type,
        status: 'processing',
        // Mock Stripe response
        stripe_response: {
          id: `py_${Date.now()}`,
          object: 'payout',
          amount: amount * 100, // Stripe uses cents
          currency: 'inr',
          arrival_date: Math.floor(Date.now() / 1000) + (isStoreCredit ? 0 : 3 * 24 * 60 * 60), // 3 days for bank
          status: 'pending',
          destination: bank_details?.account_number ? 'bank_account' : 'store_credit',
        },
        estimated_arrival: isStoreCredit ? 'Instant' : '3-5 business days',
        message: isStoreCredit
          ? `Store credit of ₹${amount} has been added to your account`
          : `Payout of ₹${amount} initiated to your bank account`,
        // Mock receipt
        receipt: {
          created_at: new Date().toISOString(),
          description: isStoreCredit
            ? 'My Narrative Store Credit Redemption'
            : 'My Narrative Creator Payout',
          creator_name: creator.username,
          breakdown: {
            gross_amount: amount,
            platform_fee: 0, // No fees for creators
            net_amount: amount,
          },
        },
      },
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}