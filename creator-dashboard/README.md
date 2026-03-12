# My Narrative - Design-to-Earn Creator Dashboard

A production-ready Next.js application for the My Narrative Creator Economy platform.

## Project Structure

```
creator-dashboard/
├── app/
│   ├── api/
│   │   ├── creators/route.ts           # Creator CRUD endpoints
│   │   ├── payout/status/route.ts      # Payout status calculation
│   │   ├── payout/initiate/route.ts    # Mock Stripe payout
│   │   └── social/link/route.ts        # Mock OAuth for social linking
│   ├── creator-dashboard/page.tsx       # Private creator dashboard
│   ├── featured-creators/page.tsx       # Public marketplace (mega influencers)
│   ├── creator/[id]/page.tsx            # Public creator profile
│   ├── layout.tsx                       # Root layout
│   └── globals.css                      # Global styles
├── components/
│   ├── CreatorDashboard.tsx            # Private "Money Center" dashboard
│   ├── CreatorProfile.tsx               # Public gamified portfolio
│   └── FeaturedMarketplace.tsx          # VIP discover page
├── lib/
│   ├── types.ts                        # TypeScript interfaces
│   └── data.ts                         # Mock data & utilities
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Business Logic

### Commission Tiers

| Tier | Rate | Threshold |
|------|------|-----------|
| Standard | 5% | 0 followers |
| Micro-Influencer | 15% | 10k+ followers |
| Mega-Influencer | 50% | 500k+ IG / 250k+ YT / 150k+ Twitter / 75k+ LinkedIn |

### Redemption Thresholds

| Balance | Available Action |
|---------|------------------|
| < ₹2,500 | LOCKED |
| ₹2,500 - ₹4,999 | Store Credit Only |
| ₹5,000+ | Cash Withdrawal Available |

### Style Influence Ranks

| Rank | Lifetime Earnings |
|------|-------------------|
| 🌱 Rookie Designer | ₹0 |
| ⭐ Emerging Talent | ₹10,000+ |
| 🔥 Trendsetter | ₹50,000+ |
| 🏛️ Style Architect | ₹150,000+ |
| 👑 Platform Icon | ₹500,000+ |

## Components

### 1. CreatorDashboard (Private)
- **Metrics Row**: Current Balance, Lifetime Earnings, Active Listings
- **Progress Bar**: Journey to ₹2,500 (Store Credit) and ₹5,000 (Cash)
- **Social Connect Modal**: Link Instagram/YouTube to upgrade tier
- **Campus Fests**: For campus ambassadors

### 2. CreatorProfile (Public)
- Username, Style Influence Rank badge, total items sold
- Masonry grid of designs using FLUX editorial images
- Fashion magazine aesthetic

### 3. FeaturedMarketplace (Public)
- Only shows mega-influencer creators
- Premium dark mode with gold/chrome accents

## API Endpoints

### GET /api/payout/status?user_id={id}
```json
{
  "status": "CASH_AVAILABLE",
  "current_balance": 8500,
  "store_credit_unlocked": true,
  "cash_withdrawal_unlocked": true,
  "amount_to_store_credit": 5000,
  "amount_to_cash": 3500,
  "next_threshold": 0,
  "next_threshold_type": null
}
```

### POST /api/social/link
```json
{
  "user_id": "creator_001",
  "platform": "instagram",
  "handle": "@fashion_vaidya",
  "followers": 650000
}
```

### POST /api/payout/initiate
```json
{
  "user_id": "creator_001",
  "amount": 5000,
  "type": "cash"
}
```

## Running the Application

```bash
# Install dependencies
cd creator-dashboard
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Routes

- `/creator-dashboard` - Private creator dashboard
- `/featured-creators` - Public marketplace (mega influencers only)
- `/creator/[username]` - Public creator profile

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Recharts (earnings graphs)
- Lucide React (icons)