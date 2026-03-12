# Phase 1: Supabase Database Setup

## Step 1.1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in details:
   - **Name**: `mynarrative-creator-economy`
   - **Database Password**: Save this securely!
   - **Region**: Select closest to India (Asia - Singapore)

4. Wait for project to provision (~2 minutes)

---

## Step 1.2: Get API Credentials

1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.supabase.co`
   - **service_role secret**: Click "Generate new key" → copy it

---

## Step 1.3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open file: `C:\Users\Admin\mynarrative-ai\supabase_schema.sql`
4. Copy ALL content and paste into SQL Editor
5. Click **Run**

Expected output: `Success. No rows returned`

---

## Step 1.4: Verify Tables Created

Go to **Table Editor** (left sidebar) and verify these tables exist:
- [ ] `creators`
- [ ] `creator_designs`
- [ ] `creator_ghost_items`
- [ ] `creator_payouts`
- [ ] `creator_commissions`
- [ ] `campus_fests`

---

## Step 1.5: Update Vercel Environment Variables

1. Go to https://vercel.com
2. Select your project (`mynarrative-ai`)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_KEY` | Your service_role secret |
| `STRIPE_SECRET_KEY` | (optional) sk_live_xxx |
| `STRIPE_CONNECT_CLIENT_ID` | (optional) ca_xxx |

5. Click **Save**
6. Go to **Deployments**
7. Click **Redeploy** on the latest deployment

---

## Verification Commands

After redeployment, test these endpoints:

```bash
# Test 1: Health check
curl https://your-vercel-url.com/api/creator_economy

# Test 2: Get featured creators (public)
curl https://your-vercel-url.com/api/creators/featured
```

Expected: JSON response (may be empty but not 404)

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "relation does not exist" | Run supabase_schema.sql again |
| API returns 401 | Check SUPABASE_KEY is service_role (not anon) |
| CORS errors | Verify vercel.json headers are correct |
| 404 on all routes | Redeploy the Vercel project |
