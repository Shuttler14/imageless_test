# Creator Program - Key Code Snippets & Implementation Details

## 1. BECOME CREATOR PAGE - Key HTML Structure

### Hero Section
```html
<section class="bc-hero">
  <div class="bc-hero-badge">
    <span>⚡</span> Limited Time Offer
  </div>
  <h1 class="bc-hero-title">
    Turn Your <span class="highlight">Creativity</span> Into Income
  </h1>
  <p class="bc-hero-subtitle">
    Join India's fastest-growing fashion creator platform. 
    Design, share, and earn – all in one place.
  </p>

  <!-- Quick Earnings Teaser -->
  <div class="bc-earnings-teaser">
    Earn up to <span class="amount">₹2L+</span> monthly
  </div>

  <!-- Main CTA -->
  <a href="/account/register" class="bc-main-cta">
    <span>🚀</span> Start Creating Today
  </a>
</section>
```

### Earnings Preview (3 Tiers)
```html
<section class="bc-earnings">
  <div class="bc-earnings-inner">
    <h2 class="bc-earnings-title">What Creators Earn</h2>
    <div class="bc-earnings-grid">
      <!-- Bronze -->
      <div class="bc-earnings-card">
        <div class="bc-earnings-icon">🥉</div>
        <div class="bc-earnings-amount">₹25K</div>
        <div class="bc-earnings-label">Monthly Avg</div>
      </div>
      <!-- Silver -->
      <div class="bc-earnings-card">
        <div class="bc-earnings-icon">🥈</div>
        <div class="bc-earnings-amount">₹75K</div>
        <div class="bc-earnings-label">Top 25%</div>
      </div>
      <!-- Gold -->
      <div class="bc-earnings-card">
        <div class="bc-earnings-icon">🥇</div>
        <div class="bc-earnings-amount">₹2L+</div>
        <div class="bc-earnings-label">Top Creators</div>
      </div>
    </div>
  </div>
</section>
```

### Commission Info Cards
```html
<section class="bc-payment-info">
  <div class="bc-payment-inner">
    <h2 class="bc-section-title">💰 How You Get Paid</h2>
    
    <div class="bc-payment-grid">
      <!-- Card 1: Commission Rate -->
      <div class="bc-payment-card">
        <div class="bc-payment-icon">📊</div>
        <div class="bc-payment-content">
          <h4>Keep <span class="bc-payment-highlight">15%</span> Per Sale</h4>
          <p>For every design sold, you earn 15% commission. 
             No hidden fees or deductions.</p>
        </div>
      </div>
      
      <!-- Card 2: Instant Payouts -->
      <div class="bc-payment-card">
        <div class="bc-payment-icon">📅</div>
        <div class="bc-payment-content">
          <h4>Instant <span class="bc-payment-highlight">Payouts</span></h4>
          <p>Get paid instantly to your bank or UPI. 
             No minimum balance required.</p>
        </div>
      </div>
      
      <!-- Card 3: Direct Transfer -->
      <div class="bc-payment-card">
        <div class="bc-payment-icon">🏦</div>
        <div class="bc-payment-content">
          <h4>Direct Bank Transfer</h4>
          <p>Money goes straight to your bank account or UPI. 
             Fast, secure, transparent.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Elite Creator Section
```html
<section class="bc-elite">
  <div class="bc-elite-inner">
    <div class="bc-elite-header">
      <div class="bc-elite-badge">
        <span>👑</span> ELITE CREATORS
      </div>
      <h2 class="bc-elite-title">Premium Creator Tier</h2>
      <p class="bc-elite-subtitle">
        Unlock exclusive benefits by reaching elite status
      </p>
    </div>

    <div class="bc-elite-grid">
      <!-- Instagram Elite Card -->
      <div class="bc-elite-card">
        <div class="bc-elite-platform">
          <div class="bc-elite-platform-icon instagram">📷</div>
          <div class="bc-elite-platform-info">
            <h4>Instagram Creator</h4>
            <p>50K+ followers</p>
          </div>
        </div>
        <div class="bc-elite-commission">
          <div class="bc-elite-commission-amount">₹5K</div>
          <div class="bc-elite-commission-label">monthly bonus</div>
        </div>
      </div>

      <!-- YouTube Elite Card -->
      <div class="bc-elite-card">
        <div class="bc-elite-platform">
          <div class="bc-elite-platform-icon youtube">▶️</div>
          <div class="bc-elite-platform-info">
            <h4>YouTube Creator</h4>
            <p>100K+ subscribers</p>
          </div>
        </div>
        <div class="bc-elite-commission">
          <div class="bc-elite-commission-amount">₹7K</div>
          <div class="bc-elite-commission-label">monthly bonus</div>
        </div>
      </div>

      <!-- Twitter Elite Card -->
      <div class="bc-elite-card">
        <div class="bc-elite-platform">
          <div class="bc-elite-platform-icon twitter">𝕏</div>
          <div class="bc-elite-platform-info">
            <h4>Twitter Influencer</h4>
            <p>20K+ followers</p>
          </div>
        </div>
        <div class="bc-elite-commission">
          <div class="bc-elite-commission-amount">₹3K</div>
          <div class="bc-elite-commission-label">monthly bonus</div>
        </div>
      </div>

      <!-- LinkedIn Elite Card -->
      <div class="bc-elite-card">
        <div class="bc-elite-platform">
          <div class="bc-elite-platform-icon linkedin">👔</div>
          <div class="bc-elite-platform-info">
            <h4>LinkedIn Professional</h4>
            <p>30K+ connections</p>
          </div>
        </div>
        <div class="bc-elite-commission">
          <div class="bc-elite-commission-amount">₹4K</div>
          <div class="bc-elite-commission-label">monthly bonus</div>
        </div>
      </div>
    </div>

    <!-- Elite Invite Bonus -->
    <div class="bc-elite-invite">
      <p>Invite another elite creator and earn</p>
      <div class="bc-elite-invite-amount">₹10K BONUS</div>
    </div>
  </div>
</section>
```

---

## 2. CREATOR DASHBOARD - Key Components

### Liquid Template Configuration
```liquid
{% comment %} =====================================================
SECTION CONFIGURATION
===================================================== {% endcomment %}

{% assign api_base_url = section.settings.api_base_url | 
  default: 'https://mynarrative-ai.vercel.app' %}
{% assign enable_debug = section.settings.enable_debug | default: false %}

{% assign creator_id = customer.id | default: '' %}
{% assign creator_email = customer.email | default: '' %}
{% assign creator_first_name = customer.first_name | default: '' %}
{% assign creator_name = customer.name | default: 'Creator' %}

{% assign is_logged_in = false %}
{% if customer.id != blank %}
  {% assign is_logged_in = true %}
{% endif %}
```

### Welcome Header with Avatar
```html
<div class="cd-welcome">
  <div class="cd-welcome-left">
    <!-- Avatar -->
    <div class="cd-avatar-wrapper">
      <div class="cd-avatar">
        {{ creator_first_name | slice: 0 }}
      </div>
      <div class="cd-avatar-status"></div> <!-- Green online dot -->
    </div>
    
    <!-- Welcome Text -->
    <div class="cd-welcome-text">
      <h1>Welcome back, <span>{{ creator_first_name }}</span>! 👋</h1>
      <p>Keep designing and earning</p>
    </div>
  </div>

  <!-- Tier Badge -->
  <div class="cd-tier-badge bronze">
    🥉 BRONZE CREATOR
  </div>
</div>
```

### Metrics Grid (4 Cards)
```html
<div class="cd-stats-grid">
  <!-- Card 1: Balance -->
  <div class="cd-stat-card">
    <div class="cd-stat-icon">💰</div>
    <div class="cd-stat-label">Available Balance</div>
    <div class="cd-stat-value teal">₹12,450</div>
    <p class="cd-stat-subtext">Ready to withdraw</p>
  </div>

  <!-- Card 2: Lifetime Earnings -->
  <div class="cd-stat-card">
    <div class="cd-stat-icon">💵</div>
    <div class="cd-stat-label">Lifetime Earnings</div>
    <div class="cd-stat-value gold">₹1,24,500</div>
    <p class="cd-stat-subtext">Total earned</p>
  </div>

  <!-- Card 3: Active Listings -->
  <div class="cd-stat-card">
    <div class="cd-stat-icon">📦</div>
    <div class="cd-stat-label">Active Listings</div>
    <div class="cd-stat-value purple">24</div>
    <p class="cd-stat-subtext">Live designs</p>
  </div>

  <!-- Card 4: Total Sales -->
  <div class="cd-stat-card">
    <div class="cd-stat-icon">✅</div>
    <div class="cd-stat-label">Total Sales</div>
    <div class="cd-stat-value green">342</div>
    <p class="cd-stat-subtext">Units sold</p>
  </div>
</div>
```

### Social Media Section
```html
<div class="mn-social-section">
  <h3 class="mn-social-title">🔗 Connected Platforms</h3>
  
  <div class="mn-social-platforms">
    <!-- Instagram -->
    <div class="mn-social-platform connected">
      <div class="mn-social-platform-icon">📷</div>
      <div class="mn-social-platform-name">Instagram</div>
      <div class="mn-social-platform-followers">45.2K followers</div>
    </div>

    <!-- YouTube -->
    <div class="mn-social-platform">
      <div class="mn-social-platform-icon">▶️</div>
      <div class="mn-social-platform-name">YouTube</div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.5);">
        Not connected
      </div>
    </div>

    <!-- Twitter -->
    <div class="mn-social-platform">
      <div class="mn-social-platform-icon">𝕏</div>
      <div class="mn-social-platform-name">Twitter</div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.5);">
        Not connected
      </div>
    </div>

    <!-- LinkedIn -->
    <div class="mn-social-platform">
      <div class="mn-social-platform-icon">👔</div>
      <div class="mn-social-platform-name">LinkedIn</div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.5);">
        Not connected
      </div>
    </div>
  </div>

  <button class="mn-connect-btn">
    + CONNECT MORE PLATFORMS
  </button>
</div>
```

### Tier Upgrade Banner
```html
<div class="mn-tier-banner">
  <div class="mn-tier-banner-icon">⭐</div>
  <div class="mn-tier-banner-content">
    <div class="mn-tier-banner-title">
      Level Up to Silver Tier
    </div>
    <div class="mn-tier-banner-desc">
      You're ₹5,550 away from 12% commission. 
      Keep designing!
    </div>
  </div>
</div>
```

### Action Buttons
```html
<div class="mn-actions-row">
  <button class="mn-action-btn mn-action-btn-primary">
    📤 Upload Design
  </button>
  <button class="mn-action-btn mn-action-btn-secondary">
    📊 View Analytics
  </button>
  <button class="mn-action-btn mn-action-btn-secondary">
    💸 Payment History
  </button>
</div>
```

---

## 3. CREATOR ONBOARDING - Key Functions

### Onboarding Complete Function
```javascript
async function cofCompleteOnboarding() {
  try {
    // Step 1: Collect form data
    const brandName = document.getElementById('brand-name').value;
    const brandBio = document.getElementById('brand-bio').value;
    
    // Step 2: Get social connections
    const socialLinks = {
      instagram: window.instagramData || null,
      youtube: window.youtubeData || null,
      twitter: window.twitterData || null,
      linkedin: window.linkedinData || null
    };

    // Step 3: Prepare payload
    const payload = {
      user_id: "{{ creator_id }}",
      email: "{{ creator_email }}",
      brand_name: brandName,
      brand_bio: brandBio,
      social_links: socialLinks,
      timestamp: new Date().toISOString()
    };

    // Step 4: Send to backend API
    const response = await fetch(
      '{{ api_base_url }}/api/creators/onboarding',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error('Onboarding failed');
    }

    const result = await response.json();

    // Step 5: Update customer metafields
    // (Shopify-side: would need additional API call)
    
    // Step 6: Redirect to dashboard
    window.location.href = '/pages/creator-dashboard';
    
  } catch (error) {
    console.error('Onboarding error:', error);
    showError('Oops! Something went wrong. Please try again.');
  }
}
```

### Progress Indicator
```html
<div class="cof-progress">
  <div class="cof-progress-step active">
    <div class="cof-progress-dot">1</div>
    <div class="cof-progress-label">Brand Setup</div>
  </div>
  <div class="cof-progress-line"></div>
  
  <div class="cof-progress-step">
    <div class="cof-progress-dot">2</div>
    <div class="cof-progress-label">Social Links</div>
  </div>
  <div class="cof-progress-line"></div>
  
  <div class="cof-progress-step">
    <div class="cof-progress-dot">3</div>
    <div class="cof-progress-label">Verify</div>
  </div>
</div>
```

---

## 4. AFFILIATE PROGRAM - Commission Tiers

### JSON Configuration
```json
{
  "sections": {
    "rich_text_content_yWWL8N": {
      "type": "rich-text-content",
      "blocks": {
        "text_block_pPD47g": {
          "type": "text_block",
          "settings": {
            "main_content": "<h2>Affiliate Commission Structure</h2><p>Our tiered commission model rewards you for building momentum:</p><ul><li>Tier 1 (0–₹50,000 in monthly sales): 10% commission on all qualifying orders</li><li>Tier 2 (₹50,001–₹2,50,000 in monthly sales): 12% commission</li><li>Tier 3 (₹2,50,000+ in monthly sales): 15% commission + early access to new launches</li></ul>"
          }
        }
      }
    }
  }
}
```

### Display Format
```
┌─────────────────────────────────────────────────────┐
│         AFFILIATE COMMISSION STRUCTURE              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TIER 1: ₹0 - ₹50,000 monthly sales               │
│  💰 Commission: 10% on all qualifying orders       │
│                                                     │
│  TIER 2: ₹50,001 - ₹2,50,000 monthly sales        │
│  💰 Commission: 12%                                │
│                                                     │
│  TIER 3: ₹2,50,000+ monthly sales                 │
│  💰 Commission: 15% + Early Access Perks          │
│                                                     │
└─────────────────────────────────────────────────────┘

Note: "Monthly sales" = purchases by first-time customers
      using the affiliate's unique code/link
```

---

## 5. ADMIN VERIFICATION - Filter Function

```javascript
function cvFilter(filter) {
  // Get all application cards
  const cards = document.querySelectorAll('.cv-app-card');
  
  // Filter logic
  cards.forEach(card => {
    const status = card.dataset.status; // pending|approved|rejected
    
    if (filter === 'all' || status === filter) {
      card.style.display = 'block';
      card.classList.add('fade-in');
    } else {
      card.style.display = 'none';
    }
  });

  // Update active filter button
  document.querySelectorAll('.cv-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}
```

### Application Card Structure
```html
<div class="cv-app-card" data-status="pending">
  <!-- Application Info -->
  <div class="cv-app-header">
    <h3>{{ creator.brand_name }}</h3>
    <span class="cv-status-badge pending">PENDING</span>
  </div>

  <!-- Creator Details -->
  <div class="cv-app-details">
    <p><strong>Email:</strong> {{ creator.email }}</p>
    <p><strong>Submitted:</strong> {{ creator.submission_date }}</p>
  </div>

  <!-- Social Profiles -->
  <div class="cv-social-summary">
    <div>📷 Instagram: {{ creator.instagram_followers }}K followers</div>
    <div>▶️ YouTube: {{ creator.youtube_subscribers }}K subs</div>
    <div>𝕏 Twitter: {{ creator.twitter_followers }}K followers</div>
    <div>👔 LinkedIn: {{ creator.linkedin_connections }}K connections</div>
  </div>

  <!-- Audience Info -->
  <div class="cv-audience-info">
    <p><strong>Total Reach:</strong> {{ creator.total_reach }}</p>
    <p><strong>Engagement Rate:</strong> {{ creator.engagement_rate }}%</p>
    <p><strong>Content Type:</strong> {{ creator.content_type }}</p>
  </div>

  <!-- Action Buttons -->
  <div class="cv-actions">
    <button class="cv-btn-approve" onclick="approveCreator('{{ creator.id }}')">
      ✅ APPROVE
    </button>
    <button class="cv-btn-reject" onclick="rejectCreator('{{ creator.id }}')">
      ❌ REJECT
    </button>
    <button class="cv-btn-details" onclick="viewDetails('{{ creator.id }}')">
      📋 DETAILS
    </button>
  </div>
</div>
```

---

## 6. CUSTOMER METAFIELDS - Creator Status

### Storing Creator Data
```liquid
{% comment %} Check if user is creator {% endcomment %}
{% if customer.metafields.creator.registered == true %}
  {% assign is_creator = true %}
{% endif %}

{% comment %} Get creator tier {% endcomment %}
{% assign creator_tier = customer.metafields.creator.tier | default: 'bronze' %}

{% comment %} Get brand name {% endcomment %}
{% assign brand_name = customer.metafields.creator.brand_name | default: customer.name %}
```

### Metafield Structure
```json
{
  "customer": {
    "id": "gid://shopify/Customer/123456",
    "metafields": {
      "creator": {
        "registered": {
          "type": "boolean",
          "value": true
        },
        "tier": {
          "type": "string",
          "value": "bronze"  // bronze|silver|gold|diamond
        },
        "brand_name": {
          "type": "string",
          "value": "My Brand Name"
        },
        "social_links": {
          "type": "json",
          "value": {
            "instagram": {
              "username": "handle",
              "followers": 45200,
              "connected": true,
              "token": "oauth_token"
            },
            "youtube": {
              "channel": "channel_name",
              "subscribers": 0,
              "connected": false
            }
          }
        }
      }
    }
  }
}
```

---

## 7. ACCOUNT PORTAL - Creator Banner Integration

### Non-Creator Banner
```html
<a href="/pages/become-creator" class="mn-creator-join-banner">
  <div class="mn-creator-join-icon">✨</div>
  <div class="mn-creator-join-content">
    <div class="mn-creator-join-title">Join Creator Program</div>
    <p class="mn-creator-join-desc">
      Start earning from your designs today. 
      Zero investment, instant payouts.
    </p>
  </div>
  <div class="mn-creator-join-arrow">→</div>
</a>
```

### Active Creator Banner
```html
<a href="/pages/creator-dashboard" class="mn-creator-studio-banner">
  <div class="mn-creator-studio-icon">🎨</div>
  <div class="mn-creator-studio-content">
    <div class="mn-creator-studio-title">
      Creator Studio
      <span class="mn-creator-badge-mini">ACTIVE</span>
    </div>
    <p class="mn-creator-studio-desc">
      Manage designs, track earnings, and more
    </p>
  </div>
  <div class="mn-creator-studio-arrow">→</div>
</a>
```

---

## 8. COLOR & STYLING Reference

### CSS Custom Properties
```css
:root {
  /* Primary Colors */
  --primary-teal:     #39A596;
  --primary-teal-rgb: 57, 165, 150;
  --primary-light:    #4ECDC4;
  
  /* Accent Colors */
  --accent-gold:      #FFD700;
  --accent-purple:    #A855F7;
  --accent-pink:      #EC4899;
  --accent-orange:    #F97316;
  
  /* Tier Colors */
  --tier-bronze:      #CD7F32;
  --tier-silver:      #C0C0C0;
  --tier-gold:        #FFD700;
  --tier-diamond:     #00FFFF;
  
  /* Dark Theme */
  --dark-bg:          #0a0a0a;
  --card-bg:          rgba(255, 255, 255, 0.03);
  --border:           rgba(255, 255, 255, 0.08);
  
  /* Status Colors */
  --success:          #22c55e;
  --warning:          #f59e0b;
  --danger:           #ef4444;
}
```

### Gradient Examples
```css
/* Hero Gradient */
background: linear-gradient(180deg, #050505 0%, #0a0a0a 50%, #0f0f0f 100%);

/* Text Gradient */
background: linear-gradient(135deg, #39A596, #2dd4bf);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;

/* Card Gradient */
background: linear-gradient(135deg, rgba(57,165,150,0.15), rgba(168,85,247,0.1));
border: 1px solid rgba(57,165,150,0.3);
```

---

## 9. Responsive Design Breakpoints

```javascript
/* Mobile: < 600px */
const isMobile = window.innerWidth < 600;

/* Tablet: 600px - 1024px */
const isTablet = window.innerWidth >= 600 && window.innerWidth < 1024;

/* Desktop: >= 1024px */
const isDesktop = window.innerWidth >= 1024;
```

### Mobile-Specific Elements
```css
/* Hide on mobile, show on desktop */
@media (max-width: 768px) {
  .desktop-only { display: none; }
  .bc-sticky-cta { display: block; } /* Show sticky CTA */
}

@media (min-width: 769px) {
  .mobile-only { display: none; }
  .bc-sticky-cta { display: none; } /* Hide sticky CTA */
}
```

---

## Summary

This creator program implementation includes:

✅ **Recruitment** - Compelling "Become Creator" landing page
✅ **Onboarding** - Multi-step verification with social integration
✅ **Dashboard** - Real-time metrics and earnings tracking
✅ **Affiliate Program** - Tiered commission structure
✅ **Admin Verification** - Review and approval system
✅ **Social Integration** - Instagram, YouTube, Twitter, LinkedIn
✅ **Tier System** - Bronze → Silver → Gold → Diamond progression
✅ **Instant Payouts** - No minimum balance requirements
✅ **Dark Theme** - Modern, premium aesthetic
✅ **Mobile Optimized** - Responsive across all devices
