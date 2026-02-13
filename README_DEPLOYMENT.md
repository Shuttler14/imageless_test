# 🚀 My Narrative - Production Deployment Guide

## Prerequisites

- [ ] Shopify store with theme development access
- [ ] Vercel account for backend hosting
- [ ] Node.js 16+ installed locally
- [ ] Shopify CLI installed (`npm install -g @shopify/cli @shopify/theme`)

---

## Part 1: Backend Deployment (Vercel)

### Step 1: Prepare Your Backend API

Ensure your Vercel project has these endpoints:
- `/api/fashion_consultant` - GPT-4o outfit analysis
- `/api/generate_affiliate_links` - Product recommendations
- `/api/generate_avatar` - Avatar generation (optional)
- `/api/wardrobe_sync` - User wardrobe data sync (optional)

### Step 2: Deploy to Vercel

```bash
# Navigate to your backend directory
cd path/to/your/backend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Note the deployment URL (e.g., https://mynarrative-ai.vercel.app)
```

### Step 3: Configure Environment Variables in Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
OPENAI_API_KEY=sk-...
STABILITY_API_KEY=... (if using avatar generation)
REPLICATE_API_KEY=... (if using avatar generation)
CORS_ALLOWED_ORIGINS=https://your-store.myshopify.com
```

---

## Part 2: Frontend Deployment (Shopify Theme)

### Step 4: Update Configuration Files

**Edit `fashionconsultant_theme/assets/MN-config.js`:**

Line 46-49, replace placeholder URL:
```javascript
production: {
  FASHION_CONSULTANT_API: 'https://YOUR-ACTUAL-VERCEL-APP.vercel.app/api/fashion_consultant',
  AFFILIATE_LINKS_API: 'https://YOUR-ACTUAL-VERCEL-APP.vercel.app/api/generate_affiliate_links',
  // ... other endpoints
}
```

### Step 5: Configure Theme Settings (Optional)

Create `config/settings_data.json` section for admin controls:

```json
{
  "current": {
    "mn_vercel_url": "https://your-vercel-app.vercel.app",
    "mn_enable_offline_mode": true,
    "mn_enable_gap_analyzer": true
  }
}
```

### Step 6: Upload Theme to Shopify

**Option A: Using Shopify CLI (Recommended)**

```bash
# Navigate to theme directory
cd fashionconsultant_theme

# Login to Shopify
shopify auth login

# Push theme to development store
shopify theme push --development

# Or push to live theme (BE CAREFUL!)
shopify theme push --live
```

**Option B: Manual Upload**

1. Zip the `fashionconsultant_theme` folder
2. Go to Shopify Admin → Online Store → Themes
3. Click "Add theme" → "Upload zip file"
4. Upload and publish

### Step 7: Verify Theme Assets Load

Check these files are loaded in the theme:

**In `layout/theme.liquid` (add if missing):**

```liquid
{{ 'MN-config.js' | asset_url | script_tag }}
{{ 'MN-fashion-consultant.js' | asset_url | script_tag }}
{{ 'MN-gap-analyzer.js' | asset_url | script_tag }}
{{ 'zero-gravity-closet.bundle.js' | asset_url | script_tag }}
```

---

## Part 3: Testing & Verification

### Step 8: Test API Connections

Open browser console on your Shopify store:

```javascript
// Check config loaded
console.log(window.MNConfig);

// Test fashion consultant API
fetch(MNConfig.API.FASHION_CONSULTANT_API, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identity: { presence: 'Test User' },
    currentContext: { mode: 'self', activity: 'Test' }
  })
}).then(r => r.json()).then(console.log);
```

### Step 9: Test User Flows

- [ ] Complete identity wizard (3-question flow)
- [ ] Select a context (self/gift)
- [ ] Generate AI recommendations
- [ ] Open Zero Gravity Closet
- [ ] Analyze outfit combination
- [ ] Test wardrobe gap analyzer

### Step 10: Mobile Testing

- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify touch interactions
- [ ] Check responsive layouts
- [ ] Test 3D closet physics on mobile

---

## Part 4: Performance Optimization

### Enable Caching

Add to `MN-config.js`:

```javascript
NETWORK_CONFIG: {
  API_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 300000, // 5 minutes
  ENABLE_CACHE: true
}
```

### Optimize Assets

```bash
# Minify JavaScript (if not using build tool)
npm install -g terser

terser fashionconsultant_theme/assets/MN-fashion-consultant.js \
  -o fashionconsultant_theme/assets/MN-fashion-consultant.min.js \
  -c -m

# Update theme.liquid to use .min.js version
```

---

## Part 5: Monitoring & Analytics

### Setup Error Tracking (Optional)

1. Create Sentry account: https://sentry.io
2. Get DSN from Sentry project
3. Add to Vercel environment variables:
   ```
   SENTRY_DSN=https://...@sentry.io/...
   ```

### Setup Analytics (Optional)

Add to `layout/theme.liquid`:

```liquid
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Part 6: Going Live Checklist

### Pre-Launch

- [ ] Replace all `YOUR_VERCEL_APP` placeholders with actual URLs
- [ ] Test all API endpoints in production
- [ ] Verify CORS settings allow your Shopify domain
- [ ] Test offline mode fallbacks
- [ ] Review error handling for all user flows
- [ ] Test on multiple devices (desktop, tablet, mobile)
- [ ] Verify affiliate links work correctly
- [ ] Check loading states display properly
- [ ] Test with slow 3G network simulation

### Security

- [ ] Ensure API keys are only in Vercel environment (not in frontend code)
- [ ] Verify CORS is restrictive (only your domain)
- [ ] Add rate limiting to backend APIs
- [ ] Enable HTTPS only for all API calls
- [ ] Sanitize user inputs before sending to AI

### Performance

- [ ] Enable Vercel Edge Caching
- [ ] Compress images (use WebP format)
- [ ] Lazy load Zero Gravity Closet
- [ ] Defer non-critical JavaScript
- [ ] Test Lighthouse score (target 90+ on mobile)

### Launch

- [ ] Backup current live theme
- [ ] Push to live theme during low-traffic hours
- [ ] Monitor error logs for first 24 hours
- [ ] Have rollback plan ready
- [ ] Prepare customer support for new features

---

## Troubleshooting

### Issue: "API Connection Failed"

**Solutions:**
1. Check VERCEL_APP_URL is correct in MN-config.js
2. Verify CORS allows your Shopify domain
3. Check Vercel function logs for errors
4. Test API directly with curl/Postman

### Issue: "Offline mode always triggers"

**Solutions:**
1. Check browser console for CORS errors
2. Verify API endpoint returns JSON (not HTML error page)
3. Test with longer timeout (increase API_TIMEOUT)

### Issue: "Zero Gravity Closet not loading"

**Solutions:**
1. Check `zero-gravity-closet.bundle.js` is properly built
2. Verify React dependencies are included
3. Check browser console for JavaScript errors
4. Ensure container element exists in DOM

### Issue: "Affiliate products not showing"

**Solutions:**
1. Check gap analyzer API is returning data
2. Verify affiliate IDs are configured
3. Test with offline fallback database
4. Check product image URLs are valid

---

## Maintenance

### Regular Updates

- **Weekly:** Check error logs in Vercel and Sentry
- **Monthly:** Review API usage and optimize caching
- **Quarterly:** Update AI prompts based on user feedback
- **As needed:** Update affiliate product database

### Scaling Considerations

If you get high traffic:
1. Enable Vercel Edge Functions (reduce latency)
2. Add Redis caching layer for AI responses
3. Implement request queuing for peak times
4. Consider CDN for static assets

---

## Support Resources

- **Shopify Docs:** https://shopify.dev/docs/themes
- **Vercel Docs:** https://vercel.com/docs
- **My Narrative GitHub:** [Link to your repo]
- **Support Email:** support@mynarrative.com

---

## Quick Commands Reference

```bash
# Development
shopify theme dev                    # Start local development server
shopify theme check                  # Lint theme files

# Deployment
shopify theme push --development     # Push to dev store
shopify theme push --live            # Push to production (careful!)

# Vercel
vercel dev                          # Test backend locally
vercel --prod                       # Deploy to production
vercel logs                         # View function logs
```

---

**Deployment completed?** Mark tasks complete and monitor for 24 hours! 🎉
