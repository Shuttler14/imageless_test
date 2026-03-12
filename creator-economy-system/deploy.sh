#!/bin/bash

# =====================================================
# MY NARRATIVE CREATOR ECONOMY - QUICK DEPLOY SCRIPT
# =====================================================

set -e

echo "============================================"
echo "🎨 My Narrative Creator Economy Deploy"
echo "============================================"

# Check for required environment variables
REQUIRED_VARS=(
  "SUPABASE_URL"
  "SUPABASE_KEY"
)

echo ""
echo "📋 Checking environment variables..."

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ $var is not set"
    exit 1
  else
    echo "✅ $var is configured"
  fi
done

echo ""
echo "📦 Setting up Vercel project..."

# Create or update Vercel configuration
echo '{
  "buildCommand": "pip install -r requirements.txt",
  "installCommand": "pip install -r requirements.txt",
  "framework": null,
  "outputDirectory": "."
}' > vercel.json

echo "✅ Vercel configuration created"

echo ""
echo "📝 Creating environment example..."

# Create example .env file
cat > .env.example << 'EOF'
# =====================================================
# MY NARRATIVE CREATOR ECONOMY - ENVIRONMENT VARIABLES
# =====================================================

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Stripe Connect (Optional - for real payouts)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_CONNECT_CLIENT_ID=ca_xxx

# API Base URL (for webhooks)
API_BASE_URL=https://api.your-domain.com

# Social Platform Thresholds
MEGA_INFLUENCER_INSTAGRAM=500000
MEGA_INFLUENCER_YOUTUBE=250000
MEGA_INFLUENCER_TWITTER=150000
MEGA_INFLUENCER_LINKEDIN=750000

# Payout Thresholds (in INR)
PAYOUT_THRESHOLD_STORE_CREDIT=2500
PAYOUT_THRESHOLD_CASH=5000

# Commission Rates (percentage)
CREATOR_COMMISSION_STANDARD=5
CREATOR_COMMISSION_MICRO=15
CREATOR_COMMISSION_MEGA=50

# Style Influence Rank Thresholds (lifetime earnings in INR)
RANK_ROOKIE=0
RANK_EMERGING=10000
RANK_TRENDSETTER=50000
RANK_ARCHITECT=150000
RANK_ICON=500000
EOF

echo "✅ Environment example created: .env.example"

echo ""
echo "📂 File structure created:"
echo ""
echo "creator-economy-system/"
echo "├── SETUP.md                 # Full setup guide"
echo "├── deploy.sh                # This script"
echo "├── .env.example            # Environment template"
echo "├── api/"
echo "│   └── creator_economy.py  # Main API"
echo "├── shopify-section/"
echo "│   ├── creator-dashboard.liquid"
echo "│   └── featured-creators.liquid"
echo "└── vercel.json             # Vercel config"
echo ""

echo "============================================"
echo "✅ Setup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and fill in values"
echo "2. Deploy to Vercel: vercel deploy --prod"
echo "3. Add creator-dashboard.liquid to your Shopify theme"
echo "4. Create Supabase tables using SETUP.md"
echo "5. Set up Shopify webhook for order creation"
echo ""