# MY NARRATIVE SHOPIFY THEME — COMPREHENSIVE AUDIT

**Theme:** My Narrative v1.0.0  
**Author:** Rahul Prasad  
**Store:** mynarrative.store  
**Brand Color:** `#39A596` (Teal)  
**Audit Date:** September 2026  

---

## 1. EXECUTIVE SUMMARY

This is an **AI-powered fashion e-commerce platform** built as a Shopify theme. It's not a typical retail theme — it's a full creator economy platform with:

- **AI Design Studio** with token gating
- **Virtual Try-On (VTON)** capabilities
- **Creator Economy** with onboarding, dashboards, earnings, and payouts
- **Print-on-Demand** product pipeline
- **Ad Network** (Narrative Ad Network) for brands
- **AI Stylist** with 5-step onboarding flow
- **Weather-aware** outfit recommendations
- **Multi-currency** geo-detection (16 countries)
- **Embeddable widgets** for external brand integration

---

## 2. FILE INVENTORY

### 2.1 Root Files

| File | Purpose |
|------|---------|
| `_scope_studio_css.py` | CSS scoping tool for AI studio |
| `studio-page-content-scoped.html` | Pre-scoped HTML for AI studio |
| `CREATOR_CODE_SNIPPETS.md` | Creator program code examples |
| `CREATOR_FILES_QUICK_REFERENCE.md` | File lookup guide |
| `CREATOR_PROGRAM_ARCHITECTURE.md` | System architecture diagrams |
| `CREATOR_PROGRAM_SUMMARY.md` | Complete feature documentation |
| `INDEX.md` | Documentation index |
| `README_CREATOR_PROGRAM.md` | Creator program README |

### 2.2 Assets Directory (33 files)

#### JavaScript (17 files)

| File | Lines | Size | Purpose | APIs/Services |
|------|-------|------|---------|---------------|
| `application.js` | 533 | 19KB | Core app: Cart CRUD, wishlist, predictive search, navbar, DTF design properties | `cart/add.js`, `cart/update.js`, `cart/change.js`, `cart.js`, `recommendations/products`, `search/suggest` |
| `brand-dashboard.js` | 2,358 | 113KB | Narrative Ad Network brand dashboard (campaigns, products, analytics, wallet) | `drishti-api-blond.vercel.app/api/network/report`, `/api/sponsored/campaigns`, Chart.js |
| `collection.js` | 161 | 7.6KB | Collection page: infinite scroll, sort, filter | Shopify collection HTML (client-side rendering) |
| `MN-fashion-consultant.js` | 2,193 | 113KB | AI Stylist Widget v3.0 — 5-step onboarding (aesthetic→occasion→canvas→results→upsell) | `drishti-api-blond.vercel.app/api/stylist_pipeline`, `/api/fashion_consultant` |
| `MN-stylist-wizard-v4.js` | 1,361 | 64KB | AI Stylist Wizard v5.0 — new/returning user flows, VTON, weather, recommendations | `drishti-api.fly.dev/api/reco/outfits`, `/api/vton/try-on`, `/api/weather/current`, `/api/user/send-otp`, `/api/user/verify-otp`, `/api/user/me` |
| `MN-main-character-onboarding.js` | 689 | 32KB | Main Character 5-step onboarding flow (hook→aesthetic→occasion→canvas→results) | Mock data only (anti-hallucination guardrails) |
| `MN-weather.js` | 49 | 1.7KB | OpenWeatherMap weather singleton | `api.openweathermap.org/data/2.5/weather` |
| `mn-embed.js` | 314 | 12KB | Embeddable widget bootstrapper for 3rd-party sites | `api.mynarrative.store/api/widget/bootstrap`, `/api/widget/event` |
| `mn-geo-currency.js` | 173 | 6.3KB | Geo-detection + multi-currency formatting (16 countries) | `nominatim.openstreetmap.org/reverse`, `ipapi.co/json/` |
| `wishlist.js` | 85 | 3.9KB | Wishlist page: fetch + render saved products | `/products/{handle}.js` |
| `product-slider.js` | 71 | 2.9KB | Swiper.js product carousel wrapper | None |
| `announcement-slider.js` | 71 | 2.9KB | Swiper.js announcement bar | None |
| `swiper.js` | 13 | 153KB | Swiper.js 11.2.2 library (minified) | None |
| `sw.js` | 45 | 1.4KB | Service worker: image/script caching | Cache API |
| `aos.js` | 0 | 14KB | AOS (Animate On Scroll) library (minified) | None |
| `cloth-detection-basic.js` | 0 | 65B | Placeholder/stub | None |
| `cloth-detection-integration.js` | 0 | 65B | Placeholder/stub | None |

#### CSS (12 files)

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| `application.css` | 245 | 5.6KB | Core app styles |
| `application.css.liquid` | 245 | 5.6KB | Core styles with Liquid variables |
| `output.css` | 3,871 | 87KB | Tailwind/CSS output |
| `brand-dashboard.css` | 2,598 | 54KB | Ad network dashboard styles |
| `MN-fashion-consultant.css` | 6,966 | 196KB | AI stylist widget styles |
| `MN-stylist-wizard-v4.css` | 1,970 | 52KB | Stylist wizard v5 styles |
| `MN-main-character-onboarding.css` | 318 | 22KB | Onboarding flow styles |
| `MN-price-comparison.css` | 15 | 1.5KB | Price comparison widget styles |
| `collab.css` | 21 | 543B | Collab page styles |
| `narrative-wizard.css` | 457 | 14KB | Narrative wizard styles |
| `collection.css` | 45 | 974B | Collection page styles |
| `product.css` | 11 | 219B | Product page styles |
| `swiper.css` | 12 | 18KB | Swiper styles |
| `aos.css` | 0 | 26KB | AOS animation styles |

#### Other Assets (1 file)

| File | Size | Purpose |
|------|------|---------|
| `mn-widget-iframe.html` | 38KB | Widget iframe template for embedding |

### 2.3 Layout Files (2 files)

| File | Lines | Purpose |
|------|-------|---------|
| `theme.liquid` | 244 | Main layout: Loads application.js, application.css, output.css, Swiper, AOS, Bootstrap Icons, ContentSquare analytics, Service Worker, MN identity bootstrap, wishlist init, preloader, MN-fashion-consultant section, mn-geo-currency.js |
| `password.liquid` | 0 | Password-protected store page (empty/minimal) |

**External resources loaded by theme.liquid:**
- `cdn.shopify.com` — Shopify CDN
- `fonts.shopifycdn.com` — Shopify fonts
- `fonts.googleapis.com` — Google Fonts (Montserrat, Playfair Display)
- `unpkg.com` — NPM packages
- `cdn.jsdelivr.net/npm/bootstrap-icons` — Bootstrap Icons
- `t.contentsquare.net` — ContentSquare analytics

### 2.4 Config Files (3 files)

| File | Lines | Purpose |
|------|-------|---------|
| `settings_schema.json` | 118 | Theme settings schema: logos, social links (WhatsApp, Instagram, Facebook, LinkedIn, X), Creator Pipeline settings (t-shirt/hoodie variant IDs), Supabase URL/key |
| `settings_data.json` | 0 | Active settings values, section configurations, Judge.me reviews, EcomSend, SG Notify Me |
| `markets.json` | 1 | Shopify Markets config (empty object) |

**Referenced environment variables / API keys:**
- `settings.supabase_url` — Supabase project URL
- `settings.supabase_anon_key` — Supabase anonymous key
- `settings.default_tshirt_variant_id` — Print-on-demand variant
- `settings.default_hoodie_variant_id` — Hoodie variant

### 2.5 Templates (42 + 7 customers)

#### JSON Templates (22 files)

| File | Lines | Purpose |
|------|-------|---------|
| `index.json` | 0 | Homepage (empty) |
| `product.json` | 0 | Product page (empty) |
| `collection.json` | 26 | Collection page |
| `collection.list.liquid` | 17 | Collection list view |
| `cart.json` | 34 | Cart page |
| `search.json` | 26 | Search results |
| `blog.json` | 20 | Blog listing |
| `article.json` | 20 | Blog article |
| `404.json` | 20 | 404 error page |
| `page.json` | 26 | Generic page |
| `page.about-us.json` | 88 | About us |
| `page.contact-us.json` | 67 | Contact us |
| `page.frequently-asked-question.json` | 21 | FAQ |
| `page.pricing-policy.json` | 116 | Pricing policy |
| `page.affiliate-program.json` | 90 | Affiliate program |
| `page.collabs.json` | 31 | Collaborations |
| `page.discover.json` | 14 | Discover page |
| `page.hoodies.json` | 591 | Hoodies collection |
| `page.t-shirts.json` | 533 | T-shirts collection |
| `page.wishlist.json` | 26 | Wishlist page |
| `page.thank-you.json` | 32 | Thank you page |
| `page.my-closet.json` | 1 | My Closet (digital wardrobe) |
| `page.men-s-narratives.json` | 35 | Men's narratives |
| `page.women-s-narratives.json` | 35 | Women's narratives |
| `page.narrative-tokens.json` | 9 | Token purchase page |
| `page.stylist.json` | 9 | AI Stylist page |

#### Liquid Templates (15 files)

| File | Lines | Purpose | APIs/Services |
|------|-------|---------|---------------|
| `page.ai-studio.liquid` | 2,137 | **AI Design Studio** — Token gate, upload flow, Supabase storage, creator routing, consumer cart flow | `drishti-api-blond.vercel.app/api/creator/earnings/summary`, Supabase Storage (`/storage/v1/object/creator_assets/`), Shopify `/cart/add.js` |
| `page.placement-editor.liquid` | 2,039 | **Placement Editor** — Clone of ai-studio for upload mode, forces `intent=creator_upload` | Same as ai-studio |
| `page.brand-dashboard.liquid` | 102 | **Narrative Ads** brand dashboard (standalone layout) | `drishti-api-blond.vercel.app` |
| `page.creator-dashboard.liquid` | 53 | Creator dashboard with stats + listing | Sections: `creator-stats-dashboard`, `creator-dashboard-enhanced`, `creator-listing-dashboard` |
| `page.creator-onboarding.liquid` | 11 | Creator onboarding flow | Section: `creator-onboarding-flow` |
| `page.creator-profile.liquid` | 118 | Public creator profile | `drishti-api-blond.vercel.app/api/creator/profile`, `/api/designs/creator` |
| `page.creator-verification.liquid` | 12 | Creator verification | — |
| `page.become-creator.liquid` | 11 | Creator signup landing | Section: `become-creator-enhanced` |
| `page.brand-onboarding.liquid` | 381 | Brand onboarding | — |
| `page.checkout.liquid` | 285 | Custom checkout | — |
| `page.featured-creators.liquid` | 11 | Featured creators page | — |
| `page.order-confirmation.liquid` | 45 | Order confirmation | — |
| `page.thankyou-custom.liquid` | 195 | Custom thank you | — |
| `gift_card.liquid` | 27 | Gift card page | — |
| `list-collections.liquid` | 20 | All collections | — |

#### Customer Templates (7 files)

| File | Lines | Purpose |
|------|-------|---------|
| `customers/account.json` | 31 | Customer account |
| `customers/login.json` | 26 | Login |
| `customers/register.json` | 26 | Registration |
| `customers/addresses.json` | 20 | Address management |
| `customers/order.liquid` | 354 | Order details |
| `customers/reset_password.json` | 26 | Password reset |
| `customers/activate_account.liquid` | 15 | Account activation |

### 2.6 Sections (57 files)

| Section | Lines | Size | Purpose |
|---------|-------|------|---------|
| `navbar.liquid` | 659 | 24KB | Main navigation |
| `footer.liquid` | 231 | 8.3KB | Footer |
| `header-group.json` | 540 | 20KB | Header group config |
| `hero-slider.liquid` | 387 | 17KB | Homepage hero slider |
| `announcement-slider.liquid` | 103 | 3.2KB | Top announcement bar |
| `product.liquid` | 602 | 24KB | Product page main |
| `product-slider.liquid` | 241 | 11KB | Product carousel |
| `product-recommendations.liquid` | 58 | 1.8KB | AI product recommendations |
| `product-creator-badge.liquid` | 167 | 5KB | Creator badge on products |
| `collection.liquid` | 49 | 1.8KB | Collection page |
| `collection-list.liquid` | 157 | 6.7KB | Collection grid |
| `collection-narrative.liquid` | 83 | 3.4KB | Narrative collection |
| `cart.liquid` | 253 | 11KB | Cart page |
| `search.liquid` | 86 | 3.2KB | Search page |
| `MN-fashion-consultant.liquid` | 150 | 6.5KB | **AI Stylist floating widget** (loaded on all pages except /pages/stylist) |
| `MN-main-character-onboarding.liquid` | 204 | 8.7KB | Main Character onboarding |
| `stylist-hero.liquid` | 118 | 3.1KB | Stylist hero section |
| `stylist-page.liquid` | 32 | 1KB | Stylist page content |
| `narrative-wizard.liquid` | 507 | 15KB | Narrative wizard |
| `narrative-stories.liquid` | 726 | 32KB | Stories section |
| `narrative-cta.liquid` | 586 | 26KB | Call-to-action |
| `my-narrative.liquid` | 53 | 1.6KB | My Narrative section |
| `my-closet.liquid` | 851 | 57KB | Digital closet |
| `my_closet.liquid` | 997 | 44KB | Digital closet (alt) |
| `wishlist.liquid` | 225 | 6.2KB | Wishlist section |
| `creator-dashboard.liquid` | 1,933 | 60KB | Creator dashboard (standard) |
| `creator-dashboard-enhanced.liquid` | 2,110 | 78KB | Enhanced creator dashboard |
| `creator-stats-dashboard.liquid` | 797 | 22KB | Creator financial stats |
| `creator-listing-dashboard.liquid` | 1,657 | 53KB | Design listing pipeline |
| `creator-upload-studio.liquid` | 437 | 16KB | Creator upload studio |
| `creator-onboarding-flow.liquid` | 1,566 | 60KB | Creator onboarding steps |
| `creator-account-portal.liquid` | 255 | 7.2KB | Creator account portal |
| `creator-utility-nav.liquid` | 135 | 3.7KB | Creator utility nav |
| `creator-verification-admin.liquid` | 996 | 25KB | Admin verification |
| `creator-post-purchase-cta.liquid` | 254 | 6.4KB | Post-purchase CTA |
| `brand-dashboard.liquid` | 127 | 3.9KB | Brand dashboard section |
| `become-creator-enhanced.liquid` | 1,821 | 57KB | Enhanced creator landing |
| `featured-creators.liquid` | 298 | 8.1KB | Featured creators |
| `featured-creators-enhanced.liquid` | 593 | 19KB | Enhanced featured creators |
| `trending-creator-designs.liquid` | 301 | 8KB | Trending designs |
| `social-design-feed.liquid` | 850 | 22KB | Social design feed |
| `thank-you.liquid` | 209 | 7.6KB | Thank you section |
| `account.liquid` | 4,576 | 168KB | Account section |
| `addresses.liquid` | 388 | 21KB | Addresses section |
| `login.liquid` | 159 | 6.2KB | Login section |
| `register.liquid` | 99 | 3.7KB | Register section |
| `reset-password.liquid` | 32 | 1.3KB | Password reset |
| `badges-navigation.liquid` | 131 | 4.9KB | Badge navigation |
| `card-grid.liquid` | 65 | 2KB | Card grid |
| `circle-navigation.liquid` | 87 | 2.8KB | Circle navigation |
| `comming-soon.liquid` | 67 | 2.4KB | Coming soon |
| `image-slider.liquid` | 340 | 15KB | Image slider |
| `placeholder.liquid` | 10 | 123B | Placeholder |
| `rich-text-content.liquid` | 66 | 1.9KB | Rich text |
| `title.liquid` | 44 | 1.1KB | Title section |
| `filter-and-sort.liquid` | 236 | — | Filter and sort (referenced in snippets) |
| `narrative-tokens-topup.liquid` | 593 | 22KB | Token top-up |
| `user_dashboard.liquid` | 1,906 | 107KB | User dashboard (alternative) |

### 2.7 Snippets (10 files)

| Snippet | Lines | Purpose |
|---------|-------|---------|
| `mn-virtual-try-on.liquid` | 361 | **Virtual Try-On widget** — Upload photo → API call → see garment on you |
| `mn-price-comparison.liquid` | 38 | Price comparison widget (multi-platform) |
| `preloader-narrative.liquid` | 590 | Animated brand intro preloader (particle animation, 7s sequence) |
| `product-card.liquid` | 114 | Product card component with wishlist, lazy loading, discount display |
| `product-description.liquid` | 78 | Product description with collapsible sections (product highlights, fabric highlights) |
| `offers.liquid` | 38 | Offers display (₹100/₹200/₹300 off tiers) |
| `filter-and-sort.liquid` | 236 | Collection filters with slide-out panels |
| `icons.liquid` | 91 | SVG icons (delete, add, remove, cash, order, shipping, return, menu, close, arrows, safe, wishlist, search, profile, cart, heart, phone, email, facebook, instagram, twitter, linkedin) |
| `pagination.liquid` | 30 | Pagination component |
| `trust-badges.liquid` | 72 | Trust badges (delivery estimate, free shipping, easy returns, hassle-free handling) |

---

## 3. EXTERNAL SERVICES & APIs

### 3.1 Core Backend Services

| Service | URL | Used By | Purpose |
|---------|-----|---------|---------|
| **Drishti API (Vercel)** | `https://drishti-api-blond.vercel.app` | Brand dashboard, AI stylist, creator APIs, VTON, fashion consultant, profile manager | Primary backend |
| **Drishti API (Fly.io)** | `https://drishti-api.fly.dev` | Stylist wizard v5 | Product recommendations, auth, VTON, weather |
| **MyNarrative Widget CDN** | `https://widget.mynarrative.store` | Embeddable widget | Widget hosting |
| **MyNarrative API** | `https://api.mynarrative.store` | Widget bootstrap, events | External brand integration |
| **Supabase** | Via `settings.supabase_url` | AI studio, creator assets | File storage, auth |

### 3.2 Shopify APIs

| API Endpoint | Used By | Purpose |
|--------------|---------|---------|
| `/cart/add.js` | application.js, ai-studio | Add items to cart |
| `/cart/update.js` | application.js | Update cart items |
| `/cart/change.js` | application.js | Change cart item quantities |
| `/cart.js` | application.js | Get cart contents |
| `/recommendations/products` | application.js | Product recommendations |
| `/search/suggest` | application.js | Predictive search |
| `/products/{handle}.js` | wishlist.js | Get product data |

### 3.3 Third-Party APIs

| Service | URL | Used By | Purpose |
|---------|-----|---------|---------|
| **OpenWeatherMap** | `api.openweathermap.org` | MN-weather.js | Weather data for outfit recommendations |
| **Nominatim (OSM)** | `nominatim.openstreetmap.org` | mn-geo-currency.js | Reverse geocoding for location |
| **ipapi** | `ipapi.co/json/` | mn-geo-currency.js | IP-based geolocation |
| **ContentSquare** | `t.contentsquare.net` | theme.liquid | Analytics |
| **Chart.js** | `cdn.jsdelivr.net/npm/chart.js` | brand-dashboard.js | Dashboard charts |
| **Bootstrap Icons** | `cdn.jsdelivr.net/npm/bootstrap-icons` | theme.liquid | Icons |
| **Google Fonts** | `fonts.googleapis.com` | theme.liquid | Montserrat, Playfair Display |
| **Unsplash** | `images.unsplash.com` | Various | Placeholder images |

### 3.4 Drishti API Endpoints

| Endpoint | Used By | Purpose |
|----------|---------|---------|
| `/api/network/report` | brand-dashboard.js | Network performance report |
| `/api/sponsored/campaigns` | brand-dashboard.js | Campaign management |
| `/api/stylist_pipeline` | MN-fashion-consultant.js | AI stylist pipeline |
| `/api/fashion_consultant` | MN-fashion-consultant.js | Fashion consultation |
| `/api/reco/outfits` | MN-stylist-wizard-v4.js | Outfit recommendations |
| `/api/vton/try-on` | MN-stylist-wizard-v4.js | Virtual try-on |
| `/api/weather/current` | MN-stylist-wizard-v4.js | Current weather |
| `/api/user/send-otp` | MN-stylist-wizard-v4.js | Send OTP for auth |
| `/api/user/verify-otp` | MN-stylist-wizard-v4.js | Verify OTP |
| `/api/user/me` | MN-stylist-wizard-v4.js | Get current user |
| `/api/creator/earnings/summary` | page.ai-studio.liquid | Creator earnings |
| `/api/creator/profile` | page.creator-profile.liquid | Creator profile |
| `/api/designs/creator` | page.creator-profile.liquid | Creator designs |
| `/api/widget/bootstrap` | mn-embed.js | Widget initialization |
| `/api/widget/event` | mn-embed.js | Widget events |

---

## 4. HARDCODED API KEYS (Security Concern)

**⚠️ EXPOSED IN CLIENT-SIDE JS:**

```javascript
// brand-dashboard.js:10
const API_KEY = 'mn_test_62e9df6e8017487a482b82568de935e02166dce90b3942a4';
```

This key is passed via `X-API-Key` header to the Drishti API.

---

## 5. KEY ARCHITECTURE OBSERVATIONS

### 5.1 Platform Type
This is NOT a typical Shopify theme — it's an **AI-powered fashion platform** with:
- Virtual Try-On (VTON)
- Style recommendations
- Creator economy
- Ad network

### 5.2 Dual Backend Architecture
- **Fly.io** (`drishti-api.fly.dev`): Product recommendations, auth, VTON, weather
- **Vercel** (`drishti-api-blond.vercel.app`): Creator dashboard, VTON, fashion consultant, brand dashboard

### 5.3 Creator Economy Pipeline
```
AI Studio → Token Gate → Onboarding → Listing → Earnings Dashboard → Payout
```

### 5.4 Consumer + Creator Flows
Auth-first interceptor in `page.ai-studio.liquid` routes users between:
- **Consumer flow**: Add to cart
- **Creator flow**: Publish design

Based on URL intent parameter.

### 5.5 Print-on-Demand
Custom designs applied to t-shirts/hoodies via variant IDs in theme settings.

### 5.6 Anti-Hallucination Guardrails
`MN-main-character-onboarding.js` explicitly documents mock data for:
- Wardrobe scanning
- Affiliate recommendations

### 5.7 Service Worker
Precaches after 15s idle:
- Hero images
- Stories
- Product images

### 5.8 Geo-Currency System
Auto-detects user country (16 supported) and converts INR base prices:
- India (IN)
- United States (US)
- United Kingdom (GB)
- Eurozone (EU)
- UAE (AE)
- Saudi Arabia (SA)
- Singapore (SG)
- Australia (AU)
- Canada (CA)
- Germany (DE)
- France (FR)
- Japan (JP)
- South Korea (KR)
- Brazil (BR)
- Nigeria (NG)
- South Africa (ZA)

### 5.9 Performance Optimizations
- Speculation rules for prerendering
- Deferred script loading
- Preloader animation (one-time per session)
- Lazy loading with IntersectionObserver
- Eager loading for LCP images

### 5.10 Scale
- **42 templates** + **57 sections** = Enterprise-grade complexity
- **33 asset files** (17 JS, 12 CSS, 1 HTML, 3 other)
- **10 snippets** for reusable components

---

## 6. CRITICAL FILES REFERENCE

### Largest Files by Size
1. `account.liquid` — 168KB (4,576 lines)
2. `MN-fashion-consultant.css` — 196KB (6,966 lines)
3. `output.css` — 87KB (3,871 lines)
4. `creator-dashboard-enhanced.liquid` — 78KB (2,110 lines)
5. `MN-fashion-consultant.js` — 113KB (2,193 lines)
6. `brand-dashboard.js` — 113KB (2,358 lines)
7. `user_dashboard.liquid` — 107KB (1,906 lines)
8. `creator-dashboard.liquid` — 60KB (1,933 lines)
9. `creator-onboarding-flow.liquid` — 60KB (1,566 lines)
10. `my-closet.liquid` — 57KB (851 lines)

### Most Complex Files (by line count)
1. `account.liquid` — 4,576 lines
2. `MN-fashion-consultant.css` — 6,966 lines
3. `output.css` — 3,871 lines
4. `page.ai-studio.liquid` — 2,137 lines
5. `creator-dashboard-enhanced.liquid` — 2,110 lines
6. `page.placement-editor.liquid` — 2,039 lines
7. `brand-dashboard.js` — 2,358 lines
8. `creator-dashboard.liquid` — 1,933 lines
9. `user_dashboard.liquid` — 1,906 lines
10. `creator-onboarding-flow.liquid` — 1,566 lines

---

## 7. ENVIRONMENT VARIABLES

| Variable | Source | Purpose |
|----------|--------|---------|
| `settings.supabase_url` | Theme settings | Supabase project URL |
| `settings.supabase_anon_key` | Theme settings | Supabase anonymous key |
| `settings.default_tshirt_variant_id` | Theme settings | Print-on-demand t-shirt variant |
| `settings.default_hoodie_variant_id` | Theme settings | Print-on-demand hoodie variant |
| `window.MN_CONFIG.apiUrl` | Templates | Drishti API URL |
| `window.MN_CONFIG.fashionConsultantUrl` | Templates | Fashion consultant URL |
| `window.MN_CONFIG.creatorApiUrl` | Templates | Creator API URL |
| `window.ENV.SUPABASE_URL` | Templates | Supabase URL (client-side) |
| `window.ENV.SUPABASE_ANON_KEY` | Templates | Supabase key (client-side) |
| OpenWeatherMap API key | Via `MNWeather.init(key)` | Weather data |

---

## 8. THIRD-PARTY INTEGRATIONS

| Service | Type | Purpose |
|---------|------|---------|
| Judge.me Reviews | App block | Product reviews |
| EcomSend | App block | Restock notifications |
| SG Notify Me | App block | Back-in-stock notifications |
| ContentSquare | Script | Analytics |
| Chart.js | Library | Dashboard charts |
| Swiper.js | Library | Carousels/sliders |
| AOS | Library | Scroll animations |
| Bootstrap Icons | Library | Icons |

---

## 9. SECURITY OBSERVATIONS

1. **Exposed API Key**: `brand-dashboard.js` contains hardcoded API key in client-side code
2. **Supabase Credentials**: Exposed in `window.ENV` object (visible in page source)
3. **No Rate Limiting**: Client-side API calls appear unprotected
4. **Token-Based Auth**: Uses OTP-based auth (send-otp/verify-otp pattern)

---

## 10. RECOMMENDATIONS

### Immediate
1. **Rotate API key** exposed in `brand-dashboard.js`
2. **Move Supabase credentials** to server-side only
3. **Add rate limiting** to API endpoints

### Architecture
1. **Consolidate backends**: Consider merging Fly.io and Vercel services
2. **Add API gateway**: Centralize auth and rate limiting
3. **Implement proper auth**: Replace OTP with JWT/OAuth

### Performance
1. **Split large files**: `account.liquid` (4,576 lines) and `MN-fashion-consultant.css` (6,966 lines) should be modularized
2. **Add CDN caching**: Static assets should be cached aggressively
3. **Implement code splitting**: Load JS on demand

### Monitoring
1. **Add error tracking**: Sentry or similar
2. **Monitor API usage**: Track Drishti API consumption
3. **Set up alerts**: For API failures

---

---

## 11. BACKEND API REPOSITORY

**Location:** `/Users/shuttler/Downloads/Transfer 2/mynarrative-ai - Copy (3)/`

### 11.1 Overview
This is the **Python/Vercel backend** that powers the My Narrative AI platform. It provides the API endpoints that the Shopify theme calls.

### 11.2 Directory Structure
```
mynarrative-ai/
├── api/                          # Backend API endpoints (Python/Vercel)
│   ├── creator_verification.py   # Creator verification & commission tiers
│   ├── creator_register.py       # Creator registration & social linking
│   ├── creator_economy.py        # Commission calculations & tier management
│   ├── test_auth.py              # Shopify API authentication test
│   ├── classify_item.py          # Item classification
│   ├── cloth_detection.py        # Cloth detection
│   ├── generate_design.py        # AI design generation
│   ├── generate_slogans.py       # Slogan generation
│   ├── fashion_consultant.py     # Fashion consultation
│   ├── physique_analyze.py       # Physique analysis
│   ├── profile_manager.py        # Profile management
│   ├── secure_image.py           # Secure image handling
│   ├── shopify_product.py        # Shopify product integration
│   ├── stylist_pipeline.py       # Stylist pipeline
│   ├── virtual_try_on.py         # Virtual try-on
│   └── webhook_save.py           # Webhook handling
├── components/                   # React components
│   ├── AIStylistFlow.tsx         # Main 5-step AI stylist orchestrator
│   └── VibeCardResult.tsx        # Editorial result + upsell component
├── supabase_schema.sql           # Database schema (creators table with verification fields)
├── supabase_setup.sql            # Initial database setup
├── vercel.json                   # Routes & CORS configuration
├── .env.example                  # Environment variables (all OAuth configs)
├── .env.local                    # Local credentials (API keys, tokens)
└── requirements.txt              # Python dependencies
```

### 11.3 Environment Variables (OAuth & API Keys)

#### Instagram OAuth
- `INSTAGRAM_CLIENT_ID`
- `INSTAGRAM_CLIENT_SECRET`
- `INSTAGRAM_REDIRECT_URI` = `https://api.mynarrative.store/oauth/instagram/callback`

#### YouTube API
- `YOUTUBE_API_KEY`

#### Twitter OAuth
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_BEARER_TOKEN`

#### LinkedIn OAuth
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI` = `https://api.mynarrative.store/oauth/linkedin/callback`

#### Creator Commission Settings
- `CREATOR_COMMISSION_STANDARD` = 5%
- `CREATOR_COMMISSION_MICRO` = 15%
- `CREATOR_COMMISSION_MEGA` = 50%

#### Mega Influencer Thresholds (Followers)
- `MEGA_INFLUENCER_INSTAGRAM` = 500,000
- `MEGA_INFLUENCER_YOUTUBE` = 250,000
- `MEGA_INFLUENCER_TWITTER` = 150,000
- `MEGA_INFLUENCER_LINKEDIN` = 750,000

#### Payout Thresholds (INR)
- `PAYOUT_THRESHOLD_STORE_CREDIT` = ₹2,500
- `PAYOUT_THRESHOLD_CASH` = ₹5,000

### 11.4 Database Schema (Supabase)
The backend uses Supabase PostgreSQL with tables for:
- `creators` — Creator profiles with verification fields
- `designs` — Creator designs
- `transactions` — Earnings and payouts
- `campaigns` — Brand campaigns
- `products` — Print-on-demand products

### 11.5 API Endpoints (Backend)

| Endpoint | Purpose |
|----------|---------|
| `/api/creator_verification.py` | Creator verification & commission tiers |
| `/api/creator_register.py` | Creator registration & social linking |
| `/api/creator_economy.py` | Commission calculations & tier management |
| `/api/fashion_consultant.py` | Fashion consultation |
| `/api/stylist_pipeline.py` | Stylist pipeline |
| `/api/virtual_try_on.py` | Virtual try-on |
| `/api/generate_design.py` | AI design generation |
| `/api/generate_slogans.py` | Slogan generation |
| `/api/classify_item.py` | Item classification |
| `/api/cloth_detection.py` | Cloth detection |
| `/api/physique_analyze.py` | Physique analysis |
| `/api/profile_manager.py` | Profile management |
| `/api/secure_image.py` | Secure image handling |
| `/api/shopify_product.py` | Shopify product integration |
| `/api/webhook_save.py` | Webhook handling |

### 11.6 Relationship to Shopify Theme
- The Shopify theme calls these API endpoints via `drishti-api-blond.vercel.app` and `drishti-api.fly.dev`
- The backend handles all AI/ML processing (design generation, VTON, recommendations)
- The backend manages creator economy (commissions, tiers, payouts)
- The backend integrates with Shopify for product/cart operations

---

**Audit Complete** ✅  
**Total Files Analyzed**: 150+  
**Total Lines of Code**: 60,000+  
**External Services**: 20+  
**API Endpoints**: 35+  
**Backend Repositories**: 2 (Shopify Theme + Python/Vercel API)