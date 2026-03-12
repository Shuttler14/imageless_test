# My Narrative Creator Economy - Quick Start Guide

## Estimated Setup Time: 1-2 hours

---

## Step 1: Supabase Setup (15 min)

1. Create project at https://supabase.com
2. Run `C:\Users\Admin\mynarrative-ai\supabase_schema.sql` in SQL Editor
3. Copy `SUPABASE_URL` and `service_role` key

---

## Step 2: Deploy API (10 min)

1. Go to https://vercel.com
2. Import `mynarrative-ai` project
3. Add environment variables:
   - `SUPABASE_URL` = your URL
   - `SUPABASE_KEY` = your service_role key
4. Redeploy

---

## Step 3: Upload Shopify Sections (30 min)

Create these 7 sections in Shopify Theme Editor → Add section → Create blank:

1. **trending-creator-designs** - Homepage carousel
2. **creator-drops-nav** - Header nav item
3. **product-creator-badge** - Product page badge
4. **creator-dashboard** - Account page dashboard
5. **creator-utility-nav** - Header/footer link
6. **creator-account-portal** - Account page banner
7. **creator-post-purchase-cta** - Thank you page

Copy code from: `C:\Users\Admin\ref - Copy (2)\creator-economy-system\shopify-section\`

---

## Step 4: Add to Templates (20 min)

| Section | Template | Where to Add |
|---------|----------|--------------|
| trending-creator-designs | index.liquid | Below hero |
| creator-drops-nav | navbar.liquid | In nav list |
| product-creator-badge | product.liquid | Below title |
| creator-account-portal | customers/account.liquid | Top of page |
| creator-dashboard | customers/account.liquid | After portal |
| creator-utility-nav | navbar.liquid | In utility bar |
| creator-post-purchase-cta | page.thankyou-custom.liquid | Below thank you |

---

## Step 5: Setup Metafields (10 min)

### Products:
- `creator.username` (text)
- `creator.avatar` (image)

### Customers:
- `creator.registered` (true/false)
- `creator.tier` (text)
- `creator.username` (text)

---

## Step 6: Test (15 min)

- [ ] Homepage shows trending creators
- [ ] Product pages show creator badge
- [ ] /account shows creator dashboard
- [ ] Can register as creator
- [ ] Social linking works

---

## Files Reference

| Purpose | Location |
|---------|----------|
| API Code | `C:\Users\Admin\mynarrative-ai\api\creator_economy.py` |
| DB Schema | `C:\Users\Admin\mynarrative-ai\supabase_schema.sql` |
| Shopify Sections | `C:\Users\Admin\ref - Copy (2)\creator-economy-system\shopify-section\` |
| Setup Guide | `C:\Users\Admin\ref - Copy (2)\IMPLEMENTATION\` |

---

## Support

- Vercel logs: Dashboard → Functions → View logs
- Supabase logs: Dashboard → SQL Editor → Query logs
- Shopify: Theme Editor → Preview → Check errors
