// =====================================================
// API: LINK SOCIAL ACCOUNT (MOCK OAUTH)
// =====================================================
// [ANTI-HALLUCINATION GUARDRAIL]: This is a mock implementation
// In production, this would integrate with real Instagram/YouTube OAuth

import { NextRequest, NextResponse } from 'next/server';
import { mockCreators, COMMISSION_TIERS } from '@/lib/data';
import { CommissionTier } from '@/lib/types';

export async function POST(request: NextRequest) {
  // MOCK - Simulates OAuth token exchange
  // In production: Use real OAuth 2.0 flow with Instagram Basic Display API / YouTube Data API

  try {
    const body = await request.json();
    const { user_id, platform, handle, followers } = body;

    if (!user_id || !platform || !handle || !followers) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id, platform, handle, followers' },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = ['instagram', 'youtube', 'twitter', 'linkedin'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid platform. Must be one of: instagram, youtube, twitter, linkedin' },
        { status: 400 }
      );
    }

    const followerCount = parseInt(followers);

    // Determine commission tier based on followers and platform
    let newTier: CommissionTier = 'standard';
    let newRate = COMMISSION_TIERS.standard.rate;
    let message = 'Account linked successfully!';

    // Check thresholds
    const platformThresholds = {
      instagram: { mega: 500000, micro: 100000 },
      youtube: { mega: 250000, micro: 50000 },
      twitter: { mega: 150000, micro: 50000 },
      linkedin: { mega: 75000, micro: 25000 },
    };

    const thresholds = platformThresholds[platform as keyof typeof platformThresholds];

    if (followerCount >= thresholds.mega) {
      newTier = 'mega_influencer';
      newRate = COMMISSION_TIERS.mega_influencer.rate;
      message = `Mega-Influencer status unlocked! Your commission rate is now ${newRate}%`;
    } else if (followerCount >= thresholds.micro) {
      newTier = 'micro_influencer';
      newRate = COMMISSION_TIERS.micro_influencer.rate;
      message = `Micro-Influencer status unlocked! Your commission rate is now ${newRate}%`;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, this would:
    // 1. Validate OAuth token with the platform
    // 2. Fetch user profile and follower count
    // 3. Update database with connected account
    // 4. Recalculate commission tier

    return NextResponse.json({
      success: true,
      data: {
        platform,
        handle,
        followers: followerCount,
        tier: newTier,
        commission_rate: newRate,
        is_verified: followerCount >= 100000,
        linked_at: new Date().toISOString(),
        message,
        // Mock OAuth tokens - in production these would be real tokens
        mock_tokens: {
          access_token: `mock_${platform}_token_${Date.now()}`,
          refresh_token: `mock_refresh_${Date.now()}`,
          expires_in: 3600,
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