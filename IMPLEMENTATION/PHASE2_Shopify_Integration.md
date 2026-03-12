# Phase 2: Shopify Theme Integration

## Step 2.1: Upload Section Files

### Option A: Manual Upload (Recommended)

Go to your Shopify Admin → **Online Store** → **Themes** → **Edit code**

Create new sections for each file:

| Section Name | File to Create | Key Code to Add |
|--------------|----------------|-----------------|
| `trending-creator-designs` | trending-creator-designs.liquid | Copy from `C:\Users\Admin\ref - Copy (2)\creator-economy-system\shopify-section\` |
| `creator-drops-nav` | creator-drops-nav.liquid | Copy from same folder |
| `product-creator-badge` | product-creator-badge.liquid | Copy from same folder |
| `creator-dashboard` | creator-dashboard.liquid | Copy from same folder |
| `creator-utility-nav` | creator-utility-nav.liquid | Copy from same folder |
| `creator-account-portal` | creator-account-portal.liquid | Copy from same folder |
| `creator-post-purchase-cta` | creator-post-purchase-cta.liquid | Copy from same folder |

### Option B: Using Theme Kit (Advanced)

```bash
# Install Theme Kit first
# Then upload sections
theme download --section trending-creator-designs
# Edit locally, then:
theme upload sections/trending-creator-designs.liquid
```

---

## Step 2.2: Integration Placements

### 2.2.1 Homepage - Trending Creator Carousel

**File**: `sections/index.liquid` or `sections/home.liquid`

**Add after hero section:**
```liquid
{% section 'trending-creator-designs' %}
```

**Location**: Right below `{% section 'hero-slider' %}` or similar

---

### 2.2.2 Header Navigation - Creator Drops

**File**: `sections/navbar.liquid`

**Add after main nav links:**
```liquid
{% section 'creator-drops-nav' %}
```

**Example placement** (around line 200-250):
```liquid
<li>
  {% section 'creator-drops-nav' %}
</li>
```

---

### 2.2.3 Product Pages - Creator Badge

**File**: `sections/product.liquid` or `snippets/product-info.liquid`

**Add below product title/price:**
```liquid
{% section 'product-creator-badge' %}
```

**Typical location**: After `product.title` and `product.price`

---

### 2.2.4 Customer Account - Creator Dashboard

**File**: `templates/customers/account.liquid`

**Add at the top (after opening `<div>`):**
```liquid
<div class="account-page-wrapper">
  {% section 'creator-account-portal' %}
  
  <!-- Existing account content below -->
```

**Also add tab for dashboard**:
```liquid
{% section 'creator-dashboard' %}
```

---

### 2.2.5 Utility Navigation - Earn with Us

**File**: `sections/navbar.liquid` or `sections/footer.liquid`

**Add in header utility bar**:
```liquid
{% section 'creator-utility-nav' %}
```

---

### 2.2.6 Post-Purchase - Thank You Page

**File**: `templates/page.thankyou-custom.liquid` or `templates/order.liquid`

**Add after "Thank you" message**:
```liquid
{% section 'creator-post-purchase-cta' %}
```

---

## Step 2.3: Configure Section Settings

After uploading each section, go to **Theme Editor** ( Customize ):

1. Go to **Homepage** → **Theme settings**
2. Find each section:
   - **Trending Creator Designs**: Set API URL
   - **Creator Drops Nav**: Set dropdown options
   - **Product Creator Badge**: Set default creator
   - **Creator Dashboard**: Set API base URL
   - **Creator Utility Nav**: Choose style variant

---

## Step 2.4: Required API Configuration

In each section, update the API base URL:

```liquid
{% assign api_base_url = 'https://YOUR-VERCEL-URL.vercel.app' %}
```

Replace `YOUR-VERCEL-URL` with your actual Vercel deployment URL.

---

## Integration Checklist

| Component | Section File | Page | Status |
|-----------|--------------|------|--------|
| Homepage Carousel | trending-creator-designs | index | [ ] |
| Header Nav | creator-drops-nav | navbar | [ ] |
| Product Badge | product-creator-badge | product | [ ] |
| Account Portal | creator-account-portal | customers/account | [ ] |
| Creator Dashboard | creator-dashboard | customers/account | [ ] |
| Utility Nav | creator-utility-nav | navbar/footer | [ ] |
| Post-Purchase | creator-post-purchase-cta | thankyou | [ ] |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Section not showing | Check if section name matches exactly |
| API errors | Verify API URL in section settings |
| 404 on creator pages | Ensure `/creator/username` route exists |
| Styles broken | Check CSS is not conflicting with theme |
| Mobile issues | Test responsive behavior in Theme Editor |
