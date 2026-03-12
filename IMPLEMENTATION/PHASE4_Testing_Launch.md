# Phase 4: Testing & Launch Checklist

## Pre-Launch Testing

### 4.1 API & Backend

```bash
# Test 1: API Health
curl https://your-vercel-url.com/api/creator_economy

# Test 2: Featured Creators (public)
curl https://your-vercel-url.com/api/creators/featured

# Test 3: Creator Profile (will return empty/error for non-existent)
curl https://your-vercel-url.com/api/creator/profile?user_id=test123
```

| Test | Expected | Status |
|------|----------|--------|
| Health check | 200 OK | [ ] |
| Featured creators | JSON array | [ ] |
| Profile (no user) | Error/No data | [ ] |

---

### 4.2 Shopify Sections

| Section | Test | Expected | Status |
|---------|------|----------|--------|
| trending-creator-designs | Visit homepage | Carousel shows | [ ] |
| creator-drops-nav | Visit any page | Nav item in header | [ ] |
| product-creator-badge | Visit product page | Badge shows | [ ] |
| creator-account-portal | Visit /account | Banner shows | [ ] |
| creator-dashboard | Visit /account (logged in) | Dashboard loads | [ ] |
| creator-utility-nav | Visit homepage | Link in header/footer | [ ] |
| creator-post-purchase-CTA | Complete purchase | CTA on thank you | [ ] |

---

### 4.3 Creator Flow Tests

#### Test: Register as Creator
1. Go to /account → Login/Register new account
2. Look for "Creator Studio" or "Earn with Us"
3. Click to register
4. Fill in creator profile
5. Verify in database

#### Test: Link Social Media
1. In creator dashboard, find "Link Socials"
2. Enter Instagram/YouTube handle
3. Verify commission tier updates

#### Test: View Earnings
1. Create test order (use discount)
2. Verify commission credited
3. Check balance in dashboard

---

### 4.4 UX & Performance

| Check | Criteria | Status |
|-------|----------|--------|
| Mobile responsive | All sections work on mobile | [ ] |
| Load speed | < 3 seconds | [ ] |
| No JS errors | Console clean | [ ] |
| Images load | All images visible | [ ] |
| API latency | < 1 second | [ ] |

---

## Launch Checklist

### Day of Launch

- [ ] Supabase tables created & verified
- [ ] Vercel API deployed & responding
- [ ] All 7 sections uploaded to theme
- [ ] Metafields defined for products & customers
- [ ] Test creator registration works
- [ ] Test social linking works
- [ ] Test payout display works
- [ ] Mobile responsive verified
- [ ] Backup theme saved

### Post-Launch (Week 1)

- [ ] Monitor API error logs
- [ ] Check creator signups
- [ ] Verify first commissions
- [ ] Collect user feedback

---

## Rollback Plan

If issues occur:
1. Disable sections in Theme Editor (not delete)
2. Revert to backup theme
3. Check Vercel function logs
4. Verify Supabase query logs
