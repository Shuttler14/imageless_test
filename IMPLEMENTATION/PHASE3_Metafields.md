# Phase 3: Metafields Configuration

## Step 3.1: Product Metafields

### Create Product Metafields

1. Go to **Shopify Admin** → **Settings** → **Custom data** → **Products**
2. Click **Add definition**
3. Fill in:

#### Metafield 1: Creator Username
| Field | Value |
|-------|-------|
| **Name** | Creator Username |
| **Namespace** | creator |
| **Key** | username |
| **Type** | Single line text |
| **Description** | (optional) The creator's username |

#### Metafield 2: Creator Avatar
| Field | Value |
|-------|-------|
| **Name** | Creator Avatar |
| **Namespace** | creator |
| **Key** | avatar |
| **Type** | Image |
| **Description** | (optional) The creator's profile image |

---

## Step 3.2: Customer Metafields

### Create Customer Metafields

1. Go to **Shopify Admin** → **Settings** → **Custom data** → **Customers**
2. Click **Add definition**

#### Metafield 1: Creator Registered
| Field | Value |
|-------|-------|
| **Name** | Creator Registered |
| **Namespace** | creator |
| **Key** | registered |
| **Type** | True/False |
| **Description** | Is this customer a creator? |

#### Metafield 2: Creator Tier
| Field | Value |
|-------|-------|
| **Name** | Creator Tier |
| **Namespace** | creator |
| **Key** | tier |
| **Type** | Single line text |
| **Description** | standard, micro, mega |

#### Metafield 3: Creator Username
| Field | Value |
|-------|-------|
| **Name** | Creator Username |
| **Namespace** | creator |
| **Key** | username |
| **Type** | Single line text |
| **Description** | The creator's handle |

---

## Step 3.3: Bulk Edit Products

### Option A: Manual (For Testing)
1. Go to **Products**
2. Select a product
3. Scroll to **Metafields** section
4. Fill in:
   - `creator.username`: e.g., "fashionista_raj"
   - `creator.avatar`: Upload image

### Option B: CSV Import (For Bulk)
1. Export products via **Products** → **Export**
2. Add columns: `creator.username`, `creator.avatar`
3. Fill in creator info
4. Import back

### Option C: API Automation (Recommended)
The creator dashboard can auto-assign metafields when a design is approved.

---

## Step 3.4: Verify Metafields Work

Test by visiting a product page:
1. Add metafield to a product
2. Refresh the product page
3. Verify the "Designed by @username" badge appears

---

## Metafield Checklist

| Metafield | Namespace | Key | Type | Products | Customers |
|-----------|-----------|-----|------|----------|-----------|
| Creator Username | creator | username | text | [ ] | [ ] |
| Creator Avatar | creator | avatar | image | [ ] | [ ] |
| Creator Registered | creator | registered | boolean | - | [ ] |
| Creator Tier | creator | tier | text | - | [ ] |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Metafields not saving | Check namespace.key format is correct |
| Not showing on product page | Add section to product template |
| API can't read metafields | Check metafield definitions are public |
| Bulk import failed | Ensure CSV headers match exactly |
