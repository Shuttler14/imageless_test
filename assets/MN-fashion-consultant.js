/**
 * MY NARRATIVE — AI STYLIST WIDGET v3.0 (Main Character Flow)
 * ============================================================
 * The full 5-step "Main Character" onboarding flow inside the
 * existing floating widget shell.
 *
 * FLOW:
 *   Step 1  — Hook ("Don't just get dressed. Let's curate your story.")
 *   Step 2  — Aesthetic Grid (8 cards, 50/50 Men/Women)
 *   Step 3  — Occasion Chips (8 occasions)
 *   Step 4  — Canvas / Selfie Upload
 *   Step 5A — Curated look (stylist pipeline)
 *   Step 5B — Wardrobe scanning animation
 *   Step 5C — Dopamine hook ("Damn, those jeans are a vibe")
 *   Step 5D — Red Gap upsell + Bank discount affiliate link
 *
 * Persistent UI (floats above all steps):
 *   Profile Ring (top-left) · My Closet Chip (top-right) · Gift FAB (bottom-right)
 *
 * ANTI-HALLUCINATION GUARDRAILS:
 *   - All AI generation/scanning uses setTimeout (no real ML)
 *   - Affiliate data is hardcoded mock JSON (no Myntra scraping)
 *
 * API: window.MN_CONFIG.apiUrl → /api/stylist_pipeline
 */

const MNAIStylist = (() => {

  // NOTE: Stylist pipeline stays on mynarrative-ai.vercel.app (separate project, 10+ functions)
// Creator economy endpoints use creator-economy-e5xehp13q-aryans-projects-af8c9a95.vercel.app
const API_URL = window.MN_CONFIG?.apiUrl || 'https://drishti-api-blond.vercel.app/api/stylist_pipeline';
const FASHION_CONSULTANT_URL = window.MN_CONFIG?.fashionConsultantUrl || 'https://drishti-api-blond.vercel.app/api/fashion_consultant';
const CREATOR_API_URL = window.MN_CONFIG?.creatorApiUrl || 'https://drishti-api-blond.vercel.app';

  // ── STATE ──────────────────────────────────────────────────────────────
  const state = {
    isExpanded: false,
    step: 1,           // 0|1|2|3|4|5
    step5State: null,  // 'A'|'B'|'C'|'D'
    gender: null,      // 'men'|'women'|null
    // Step 2
    selectedAesthetics: [],
    // Step 3
    selectedOccasions: [],
    // Step 4
    selfieBase64: null,
    skinTone: null,    // 'Fair'|'Medium'|'Olive'|'Brown'|'Dark'|'Deep'
    bodyShape: null,  // 'slim_athletic'|'average'|'muscular'|'plus_size'|'tall_lean'|'short_stocky'
    sourcePreference: null, // 'my_narrative'|'global_market'
    // Step 5
    wardrobeBase64: null,
    closetItems: [],
    closetCount: 0,
    showAffiliate: false,
    brandInput: '',
    passionInput: '',
    bankInput: '',
    // Profile
    profileHeight: 172,
    profileFit: 'regular',
    profileCompletion: 0,
    // Gift mode
    giftMode: false,
    currentContext: null,
    selectedSlogan: null,
    // Scanning
    scanVisibleItems: 0,
  };

  const GIFT_RECIPIENTS = ['Boyfriend', 'Girlfriend', 'Husband', 'Wife', 'Brother', 'Sister', 'Best Friend', 'Parent'];
  const GIFT_OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Valentine', 'Festive', 'Thank You', 'Long Distance', 'Just Because'];

  
  // DATA: AESTHETICS (50/50 Men/Women)
  // 8 Men (_m) + 8 Women (_f) — 16 total styles
  const AESTHETICS = [
    // MEN (8) — upload your image to Shopify Files with the exact filename shown in img path
    // e.g. go to Shopify Admin → Content → Files → Upload → name it "style-old-money-m.jpg"
    { id: 'old_money_m',    style: 'Old Money',           name: 'The Heritage Edit',    gender: 'M', accent: '#a8916e', img: window.MN_STYLE_IMGS?.old_money_m    || '' },
    { id: 'street_m',       style: 'Street Style',        name: 'Urban Architect',      gender: 'M', accent: '#f59e0b', img: window.MN_STYLE_IMGS?.street_m        || '' },
    { id: 'indo_western_m', style: 'Indo-Western Fusion', name: 'Desi Modernist',       gender: 'M', accent: '#ef4444', img: window.MN_STYLE_IMGS?.indo_western_m   || '' },
    { id: 'corporate_m',    style: 'Corporate Core',      name: 'Power Suit Era',       gender: 'M', accent: '#6366f1', img: window.MN_STYLE_IMGS?.corporate_m      || '' },
    { id: 'athleisure_m',   style: 'Athleisure',          name: 'Functional Minimal',   gender: 'M', accent: '#22c55e', img: window.MN_STYLE_IMGS?.athleisure_m     || '' },
    { id: 'denimcore_m',    style: 'Denimcore',           name: 'Indigo Standard',      gender: 'M', accent: '#60a5fa', img: window.MN_STYLE_IMGS?.denimcore_m      || '' },
    { id: 'resort_m',       style: 'Resort Casual',       name: 'Coastal Light',        gender: 'M', accent: '#fbbf24', img: window.MN_STYLE_IMGS?.resort_m         || '' },
    { id: 'techwear_m',     style: 'Techwear',            name: 'Utility Future',       gender: 'M', accent: '#94a3b8', img: window.MN_STYLE_IMGS?.techwear_m       || '' },

    // WOMEN (8) — upload your image to Shopify Files with the exact filename shown in img path
    // e.g. go to Shopify Admin → Content → Files → Upload → name it "style-minimalist-f.jpg"
    { id: 'minimalist_f',   style: 'Minimalist',          name: 'The Edit',             gender: 'F', accent: '#e4e4e4', img: window.MN_STYLE_IMGS?.minimalist_f     || '' },
    { id: 'y2k_f',          style: 'Y2K Chrome',          name: 'Millennial Glitch',    gender: 'F', accent: '#c0c0c0', img: window.MN_STYLE_IMGS?.y2k_f            || '' },
    { id: 'cyberpunk_f',    style: 'Cyberpunk',           name: 'Neon Manifesto',       gender: 'F', accent: '#00ff87', img: window.MN_STYLE_IMGS?.cyberpunk_f      || '' },
    { id: 'casual_f',       style: 'Casual Essentials',   name: 'The Daily Uniform',    gender: 'F', accent: '#fb923c', img: window.MN_STYLE_IMGS?.casual_f         || '' },
    { id: 'quietlux_f',     style: 'Quiet Luxury',        name: 'Soft Power',           gender: 'F', accent: '#a3a3a3', img: window.MN_STYLE_IMGS?.quietlux_f       || '' },
    { id: 'coquette_f',     style: 'Coquette',            name: 'Sugar & Satin',        gender: 'F', accent: '#f472b6', img: window.MN_STYLE_IMGS?.coquette_f       || '' },
    { id: 'boho_f',         style: 'Boho',                name: 'Free Stitch',          gender: 'F', accent: '#f59e0b', img: window.MN_STYLE_IMGS?.boho_f           || '' },
    { id: 'power_suit_f',   style: 'Power Suit',          name: 'Boardroom Royale',     gender: 'F', accent: '#6366f1', img: window.MN_STYLE_IMGS?.power_suit_f     || '' },
  ];
  // ── DATA: OCCASIONS ────────────────────────────────────────────────────
  const OCCASIONS = [
    { id: 'college',  label: 'College Fest / Campus',     emoji: '🎓' },
    { id: 'office',   label: 'Office / Corporate',        emoji: '💼' },
    { id: 'pooja',    label: 'Pooja / Ethnic Event',      emoji: '🪔' },
    { id: 'sangeet',  label: 'Sangeet / Family Function', emoji: '💃' },
    { id: 'date',     label: 'Date Night',                emoji: '🌙' },
    { id: 'airport',  label: 'Airport Look',              emoji: '✈️' },
    { id: 'gym',      label: 'Gym / Activewear',          emoji: '🏋️' },
    { id: 'casual',   label: 'Just Casual Daily Wear',    emoji: '☕' },
  ];

  // ── DATA: MOCK WARDROBE (simulated CV extraction) ──────────────────────
  const MOCK_WARDROBE = [
    { label: 'Denim Jeans',      img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&h=200&fit=crop' },
    { label: 'White Tee',        img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=200&fit=crop' },
    { label: 'Oversized Jacket', img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=150&h=200&fit=crop' },
    { label: 'Sneakers',         img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=200&fit=crop' },
  ];

  // ── DATA: AFFILIATE CATALOGUE (hardcoded mock — no scraping) ──────────
  const AFFILIATE_RECS = {
    default: { item: 'White sneakers', brand: 'Nike', platform: 'Myntra',
      price: 8999, original: 12999, off: 31,
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop',
      url: 'https://www.myntra.com/casual-shoes/nike/nike-men-white-court-vision-low-sneakers/19529524/buy',
      offer: 'Myntra · from ₹8,999' },
    HDFC: { item: 'White sneakers', brand: 'Nike', platform: 'Myntra',
      price: 8499, original: 12999, off: 35,
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop',
      url: 'https://www.myntra.com/casual-shoes/nike/nike-men-white-court-vision-low-sneakers/19529524/buy',
      offer: 'HDFC · extra ₹500 off' },
    SBI:  { item: 'White sneakers', brand: 'Adidas', platform: 'Amazon',
      price: 7999, original: 11999, off: 33,
      img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=250&fit=crop',
      url: 'https://www.amazon.in/dp/B09QW5V7V6',
      offer: 'Amazon · SBI cashback' },
    ICICI:{ item: 'Platform sneakers', brand: 'Puma', platform: 'Myntra',
      price: 6999, original: 9999, off: 30,
      img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=250&fit=crop',
      url: 'https://www.myntra.com/sports-shoes/puma/puma-unisex-white-smashic-sneakers/18252620/buy',
      offer: 'ICICI · cashback eligible' },
  };

  // ── UTILITIES ──────────────────────────────────────────────────────────
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const INR = (n)  => '₹' + n.toLocaleString('en-IN');

  const setContent = (html) => {
    const c = $('#mn-content-container');
    if (c) c.innerHTML = html;
    updateProgress();
    // TASK 3: Scroll wrapper to top on every step transition
    const wrapper = document.querySelector('.mn-ai-studio-wrapper');
    if(wrapper) wrapper.scrollTo({top: 0, behavior: 'smooth'});
  };

  const updateProgress = () => {
    const pct = { 0: 5, 1: 15, 2: 35, 3: 55, 4: 75, 5: 95 };
    const fill = $('.mn-progress-fill');
    if (fill) fill.style.width = (pct[state.step] || 10) + '%';
  };

  const getGeneratedImg = () => {
    const hasMale   = state.selectedAesthetics.some(id => id.endsWith('_m'));
    const hasFemale = state.selectedAesthetics.some(id => id.endsWith('_f'));
    if (hasMale && !hasFemale)
      return 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=480&h=640&fit=crop&crop=top';
    if (hasFemale && !hasMale)
      return 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=480&h=640&fit=crop&crop=top';
    return 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=480&h=640&fit=crop&crop=top';
  };

  return {
    state, AESTHETICS, OCCASIONS, MOCK_WARDROBE, AFFILIATE_RECS,
    $, $$, INR, setContent, updateProgress, getGeneratedImg,
    expandWidget, API_URL, FASHION_CONSULTANT_URL
  };
})();

// Expose MNAIStylist globally for navbar access
window.MNAIStylist = MNAIStylist;

// ═══════════════════════════════════════════════════════════
// STEP RENDERERS
// ═══════════════════════════════════════════════════════════
const { state, AESTHETICS, OCCASIONS, MOCK_WARDROBE, AFFILIATE_RECS, $, $$, INR, setContent, updateProgress, getGeneratedImg, API_URL, FASHION_CONSULTANT_URL } = MNAIStylist;

function mnNormalizeProductLink(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  if (rawUrl.startsWith('/')) return rawUrl;
  let parsed;
  try { parsed = new URL(rawUrl); } catch (e) { return ''; }
  const host = parsed.hostname.toLowerCase();
  const path = (parsed.pathname || '/').toLowerCase();
  const isHome = path === '/' || path === '';
  if (isHome) return '';

  if (host.includes('amazon.')) return (path.includes('/dp/') || path.includes('/gp/product/')) ? parsed.toString() : '';
  if (host.includes('myntra.')) return (path.includes('/buy') || path.includes('/p/')) ? parsed.toString() : '';
  if (host.includes('flipkart.')) return (path.includes('/p/') || parsed.searchParams.has('pid')) ? parsed.toString() : '';
  if (host.includes('ajio.')) return path.includes('/p/') ? parsed.toString() : '';
  if (host.includes('meesho.')) return path.includes('/product/') ? parsed.toString() : '';
  if (host.includes('nykaafashion.')) return path.includes('/p/') ? parsed.toString() : '';

  // Generic marketplaces: require a deeper path (not section/home listing).
  const depth = path.split('/').filter(Boolean).length;
  return depth >= 2 ? parsed.toString() : '';
}

function mnPickProductUrl(record) {
  if (!record) return '';
  const candidates = [record.add_to_cart_url, record.exact_product_url, record.product_url, record.affiliate_url, record.url];
  for (let i = 0; i < candidates.length; i += 1) {
    const normalized = mnNormalizeProductLink(candidates[i]);
    if (normalized) return normalized;
  }
  return '';
}

function mnNormalizePipelineResponse(data) {
  const payload = data || {};
  const rec = payload.recommendation || {};
  let outfitPieces = payload.outfit_pieces || rec.outfit_pieces || [];
  if (!Array.isArray(outfitPieces) || !outfitPieces.length) {
    const mapped = [];
    if (rec.top && rec.top.name) mapped.push({ slot: 'top', name: rec.top.name, type: 'top', color: rec.top.hex || '#39A596', owned: false, why: 'Core styling anchor', shop_links: [] });
    if (rec.bottom && rec.bottom.name) mapped.push({ slot: 'bottom', name: rec.bottom.name, type: 'bottom', color: rec.bottom.hex || '#5f6368', owned: false, why: 'Balances the silhouette', shop_links: [] });
    if (rec.footwear && rec.footwear.name) mapped.push({ slot: 'footwear', name: rec.footwear.name, type: 'footwear', color: rec.footwear.hex || '#ffffff', owned: false, why: 'Completes the look', shop_links: [] });
    if (rec.accessory && rec.accessory.name) mapped.push({ slot: 'accessory', name: rec.accessory.name, type: 'accessory', color: rec.accessory.hex || '#c0c0c0', owned: false, why: 'Adds polish', shop_links: [] });
    outfitPieces = mapped;
  }

  return {
    direction: payload.direction || rec.direction || rec.outfit_description || 'Styled for you.',
    outfit_pieces: outfitPieces,
    suggestions: payload.suggestions || rec.suggestions || rec.styling_tips || [],
    styling_tips: payload.styling_tips || rec.styling_tips || rec.suggestions || [],
    color_science: payload.color_science || rec.color_science || rec.color_science_note || '',
    archetype_note: payload.archetype_note || rec.archetype_note || '',
  };
}

function buildGiftIdentityPayload() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('mn_identity') || '{}') || {}; } catch (e) { saved = {}; }
  return {
    coreExpression: saved.coreExpression || state.selectedAesthetics.map(id => AESTHETICS.find(a => a.id === id)?.style || id).join(' / ') || 'Thoughtful',
    presence: saved.presence || 'Adaptive',
    signal: saved.signal || 'Care',
    archetype: saved.archetype || { name: 'Gift Curator' },
    height: saved.height || state.profileHeight || 'Not provided',
    build: saved.build || (state.bodyShape || 'average').replace(/_/g, ' '),
    gender: saved.gender || state.gender || 'unisex',
    skinTone: saved.skinTone || state.skinTone || 'Not provided',
    undertone: saved.undertone || 'Not provided',
    region: saved.region || 'Not provided',
    climate: saved.climate || 'Not provided',
    budget: saved.budget || 'Not provided',
    closet: Array.isArray(saved.closet) ? saved.closet : [],
  };
}

// ── STEP 0: GENDER SELECTOR ──────────────────────────────────
function renderStep0() {
  state.step = 0;
  setContent(`
    <div class="mnw-step mnw-step-gender">
      <div class="mnw-orb mnw-orb1"></div>
      <div class="mnw-orb mnw-orb2"></div>
      <div class="mnw-step1-inner" style="padding-top:20px">
        <span class="mnw-badge">✦ MY NARRATIVE</span>
        <h2 class="mnw-hook-title" style="font-size:26px;margin-bottom:8px">
          Who are we <span class="mnw-gradient-text">styling today?</span>
        </h2>
        <p class="mnw-hook-sub" style="margin-bottom:32px">Pick who we’re styling.</p>
        <div class="mnw-gender-cards">
          <button class="mnw-gender-card" data-gender="men" id="mnw-gender-men">
            <span class="mnw-gender-emoji">👔</span>
            <span class="mnw-gender-label">Men</span>
            <span class="mnw-gender-tagline">Tailored. Bold. Unapologetic.</span>
          </button>
          <button class="mnw-gender-card" data-gender="women" id="mnw-gender-women">
            <span class="mnw-gender-emoji">👗</span>
            <span class="mnw-gender-label">Women</span>
            <span class="mnw-gender-tagline">Expressive. Elevated. Iconic.</span>
          </button>
        </div>
        <button class="mnw-cta" id="mnw-step0-cta" disabled style="width:100%;justify-content:center;margin-top:24px">
          Let's Style You
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
      <div class="mnw-step-dots">
        <span class="mnw-dot mnw-dot-active"></span>
        <span class="mnw-dot"></span><span class="mnw-dot"></span>
        <span class="mnw-dot"></span>
      </div>
    </div>
  `);

  // Gender card click handlers
  $$('.mnw-gender-card').forEach(card => {
    card.addEventListener('click', () => {
      $$('.mnw-gender-card').forEach(c => c.classList.remove('mnw-gender-selected'));
      card.classList.add('mnw-gender-selected');
      state.gender = card.dataset.gender;
      const cta = $('#mnw-step0-cta');
      if (cta) {
        cta.disabled = false;
        cta.textContent = state.gender === 'men' ? "Style the Men's Look →" : "Style the Women's Look →";
      }
    });
  });

  $('#mnw-step0-cta').addEventListener('click', () => {
    if (state.gender) renderStep2();
  });
}

// ── STEP 1: HOOK ──────────────────────────────────────────
function renderStep1() {
  state.step = 1;
  setContent(`
    <div class="mnw-step mnw-step1">
      <div class="mnw-orb mnw-orb1"></div>
      <div class="mnw-orb mnw-orb2"></div>
      <div class="mnw-step1-inner">
        <span class="mnw-badge">✦ MY NARRATIVE</span>
        <h2 class="mnw-hook-title">
          Don't just get dressed.<br>
          <span class="mnw-gradient-text">Let's curate your story.</span>
        </h2>
        <p class="mnw-hook-sub">Your look, your story.</p>
        <button class="mnw-cta" id="mnw-step1-cta">
          Curate My Look
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
      <div class="mnw-step-dots">
        <span class="mnw-dot mnw-dot-active"></span>
        <span class="mnw-dot"></span><span class="mnw-dot"></span>
        <span class="mnw-dot"></span><span class="mnw-dot"></span>
      </div>
    </div>
  `);
  $('#mnw-step1-cta').addEventListener('click', renderStep2);
}

// ── STEP 2: AESTHETIC GRID (50/50 Men/Women) ──────────────
function renderStep2() {
  state.step = 2;
  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <p class="mnw-step-num">02 / 06</p>
        <h2 class="mnw-step-title">Your vibe</h2>
        <p class="mnw-step-sub">Tap one or more.</p>
      </div>
      <div class="mnw-aesthetic-grid" id="mnw-aesthetic-grid">
        ${(() => {
          const visibleAesthetics = state.gender ? AESTHETICS.filter(a => state.gender === 'men' ? a.gender === 'M' : a.gender === 'F') : AESTHETICS;
          return visibleAesthetics.map(a => `
          <button class="mnw-aesthetic-card" data-id="${a.id}" aria-label="${a.style}">
            ${a.img
              ? `<img class="mnw-aesthetic-img" src="${a.img}" alt="${a.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
                 <div class="mnw-aesthetic-placeholder" style="display:none;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)">
                   <span class="mnw-placeholder-icon">${a.gender === 'M' ? '♂' : '♀'}</span>
                   <span class="mnw-placeholder-label">${a.style}</span>
                   <span class="mnw-placeholder-hint">Image coming soon</span>
                 </div>`
              : `<div class="mnw-aesthetic-placeholder" style="background:linear-gradient(135deg,${a.accent}22 0%,#0a0a0a 100%)">
                   <span class="mnw-placeholder-icon">${a.gender === 'M' ? '♂' : '♀'}</span>
                   <span class="mnw-placeholder-label">${a.style}</span>
                   <span class="mnw-placeholder-hint">Upload image in Shopify Files<br>Filename: style-${a.id.replace(/_/g,'-')}.jpg</span>
                 </div>`
            }
            <div class="mnw-aesthetic-overlay">
              <p class="mnw-aesthetic-style" style="color:${a.accent}">${a.style}</p>
              <p class="mnw-aesthetic-name">${a.name}</p>
            </div>
            <span class="mnw-gender-badge ${a.gender === 'M' ? 'mnw-gender-m' : 'mnw-gender-f'}">
              ${a.gender === 'M' ? '♂ Men' : '♀ Women'}
            </span>
            <span class="mnw-check" style="display:none">✓</span>
          </button>
        `).join('');
        })()}
      </div>
      <div class="mnw-step-footer">
        <button class="mnw-btn-ghost" id="mnw-s2-back">← Back</button>
        <span class="mnw-sel-count" id="mnw-aesthetic-count">Select at least one</span>
        <button class="mnw-cta mnw-cta-sm" id="mnw-s2-next" disabled>Next →</button>
      </div>
    </div>
  `);

  $$('.mnw-aesthetic-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const check = card.querySelector('.mnw-check');
      if (state.selectedAesthetics.includes(id)) {
        state.selectedAesthetics = state.selectedAesthetics.filter(x => x !== id);
        card.classList.remove('mnw-selected');
        if (check) check.style.display = 'none';
      } else {
        state.selectedAesthetics.push(id);
        card.classList.add('mnw-selected');
        if (check) check.style.display = 'flex';
      }
      const n = state.selectedAesthetics.length;
      const countEl = $('#mnw-aesthetic-count');
      const nextBtn = $('#mnw-s2-next');
      if (countEl) countEl.textContent = n === 0 ? 'Select at least one' : `${n} selected`;
      if (nextBtn) nextBtn.disabled = n === 0;
    });
  });

  $('#mnw-s2-back').addEventListener('click', renderStep0);
  $('#mnw-s2-next').addEventListener('click', renderStep3);
}

// ── STEP 3: OCCASION CHIPS ────────────────────────────────
function renderStep3() {
  state.step = 3;
  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <p class="mnw-step-num">03 / 06</p>
        <h2 class="mnw-step-title">Where to?</h2>
        <p class="mnw-step-sub">Pick what fits.</p>
      </div>
      <div class="mnw-occasion-chips">
        ${OCCASIONS.map(o => `
          <button class="mnw-occ-chip" data-id="${o.id}">
            <span>${o.emoji}</span><span>${o.label}</span>
          </button>
        `).join('')}
      </div>
      <div class="mnw-step-footer">
        <button class="mnw-btn-ghost" id="mnw-s3-back">← Back</button>
        <button class="mnw-cta mnw-cta-sm" id="mnw-s3-next" disabled>Next →</button>
      </div>
      <div class="mnw-step-dots">
        <span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-active"></span>
        <span class="mnw-dot"></span><span class="mnw-dot"></span>
      </div>
    </div>
  `);

  $$('.mnw-occ-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.id;
      if (state.selectedOccasions.includes(id)) {
        state.selectedOccasions = state.selectedOccasions.filter(x => x !== id);
        chip.classList.remove('mnw-occ-active');
      } else {
        state.selectedOccasions.push(id);
        chip.classList.add('mnw-occ-active');
      }
      const nextBtn = $('#mnw-s3-next');
      if (nextBtn) nextBtn.disabled = state.selectedOccasions.length === 0;
    });
  });

  $('#mnw-s3-back').addEventListener('click', renderStep2);
  $('#mnw-s3-next').addEventListener('click', renderStep35);
}

// ── STEP 3.5: SKIN TONE + BODY SHAPE ─────────────────────
function renderStep35() {
  state.step = 3.5;
  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <p class="mnw-step-num">04 / 06</p>
        <h2 class="mnw-step-title">Quick fit</h2>
        <p class="mnw-step-sub">Better color &amp; fit picks.</p>
      </div>

      <div class="mnw-skin-tone-section" style="margin-bottom:28px">
        <p class="mnw-field-label" style="color:#a3a3a3;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px">Skin Tone</p>
        <div class="mnw-option-chips" id="mnw-skin-tone-chips">
          ${['Fair','Medium','Olive','Brown','Dark','Deep'].map(tone => `
            <button class="mnw-occ-chip mnw-tone-chip" data-tone="${tone}">${tone}</button>
          `).join('')}
        </div>
      </div>

      <div class="mnw-body-shape-section">
        <p class="mnw-field-label" style="color:#a3a3a3;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px">Body Shape &amp; Fitness</p>
        <div class="mnw-body-shape-grid" id="mnw-body-shape-grid">
          ${[
            { id: 'slim_athletic', label: 'Slim / Athletic', icon: '🏃' },
            { id: 'average',      label: 'Average / Medium', icon: '⚖️' },
            { id: 'muscular',      label: 'Muscular / Broad', icon: '💪' },
            { id: 'plus_size',     label: 'Plus Size / Curvy', icon: '✨' },
            { id: 'tall_lean',     label: 'Tall &amp; Lean', icon: '📏' },
            { id: 'short_stocky',  label: 'Short &amp; Stocky', icon: '🔳' },
          ].map(shape => `
            <button class="mnw-body-shape-btn" data-shape="${shape.id}">
              <span class="mnw-body-shape-icon">${shape.icon}</span>
              <span class="mnw-body-shape-label">${shape.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="mnw-step-footer">
        <button class="mnw-btn-ghost" id="mnw-s35-back">← Back</button>
        <span class="mnw-sel-count" id="mnw-body-count">Both fields required</span>
        <button class="mnw-cta mnw-cta-sm" id="mnw-s35-next" disabled>Next →</button>
      </div>
      <div class="mnw-step-dots">
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-active"></span><span class="mnw-dot mnw-dot-active"></span>
        <span class="mnw-dot mnw-dot-active"></span>
      </div>
    </div>
  `);

  $$('.mnw-tone-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.mnw-tone-chip').forEach(c => c.classList.remove('mnw-occ-active'));
      chip.classList.add('mnw-occ-active');
      state.skinTone = chip.dataset.tone;
      validateStep35();
    });
  });

  $$('.mnw-body-shape-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.mnw-body-shape-btn').forEach(b => b.classList.remove('mnw-shape-active'));
      btn.classList.add('mnw-shape-active');
      state.bodyShape = btn.dataset.shape;
      validateStep35();
    });
  });

  function validateStep35() {
    const countEl = $('#mnw-body-count');
    const nextBtn = $('#mnw-s35-next');
    const ready = !!(state.skinTone && state.bodyShape);
    if (countEl) countEl.textContent = ready ? 'Looking good!' : 'Both fields required';
    if (nextBtn) nextBtn.disabled = !ready;
  }

  $('#mnw-s35-back').addEventListener('click', renderStep3);
  $('#mnw-s35-next').addEventListener('click', renderStep36);
}

// ── STEP 3.6: SOURCE PREFERENCE ──────────────────────────
function renderStep36() {
  state.step = 3.6;
  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <p class="mnw-step-num">04 / 06</p>
        <h2 class="mnw-step-title">Shop from</h2>
        <p class="mnw-step-sub">My Narrative or open market.</p>
      </div>

      <div class="mnw-source-grid" id="mnw-source-grid">
        <button class="mnw-source-card" data-source="my_narrative" id="mnw-src-mn">
          <div class="mnw-source-icon-wrap" style="background:linear-gradient(135deg,#39A59622,#0a0a0a)">
            <span style="font-size:32px">✦</span>
          </div>
          <div class="mnw-source-info">
            <p class="mnw-source-title">MY NARRATIVE</p>
            <p class="mnw-source-sub">Exclusive Streetwear · Direct to You</p>
          </div>
          <div class="mnw-source-check" style="display:none">✓</div>
        </button>

        <button class="mnw-source-card" data-source="global_market" id="mnw-src-global">
          <div class="mnw-source-icon-wrap" style="background:linear-gradient(135deg,#f59e0b22,#0a0a0a)">
            <span style="font-size:28px">🌍</span>
          </div>
          <div class="mnw-source-info">
            <p class="mnw-source-title">GLOBAL MARKET</p>
            <p class="mnw-source-sub">Myntra · Zara · Amazon · Ajio</p>
          </div>
          <div class="mnw-source-check" style="display:none">✓</div>
        </button>
      </div>

      <div class="mnw-step-footer">
        <button class="mnw-btn-ghost" id="mnw-s36-back">← Back</button>
        <span class="mnw-sel-count" id="mnw-source-count">Choose one to continue</span>
        <button class="mnw-cta mnw-cta-sm" id="mnw-s36-next" disabled>Next →</button>
      </div>
      <div class="mnw-step-dots">
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-active"></span>
        <span class="mnw-dot"></span>
      </div>
    </div>
  `);

  $$('.mnw-source-card').forEach(card => {
    card.addEventListener('click', () => {
      $$('.mnw-source-card').forEach(c => {
        c.classList.remove('mnw-source-selected');
        const check = c.querySelector('.mnw-source-check');
        if (check) check.style.display = 'none';
      });
      card.classList.add('mnw-source-selected');
      const check = card.querySelector('.mnw-source-check');
      if (check) check.style.display = 'flex';
      state.sourcePreference = card.dataset.source;
      const countEl = $('#mnw-source-count');
      const nextBtn = $('#mnw-s36-next');
      if (countEl) countEl.textContent = 'Looking good!';
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  $('#mnw-s36-back').addEventListener('click', renderStep35);
  $('#mnw-s36-next').addEventListener('click', renderStep4);
}

// ── STEP 4: CANVAS / SELFIE UPLOAD ───────────────────────
function renderStep4() {
  state.step = 4;
  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <p class="mnw-step-num">05 / 06</p>
        <h2 class="mnw-step-title">Your photo</h2>
        <p class="mnw-step-sub">One clear selfie — we’ll match tone &amp; fit.</p>
      </div>
      <div class="mnw-upload-zone" id="mnw-canvas-zone">
        <div class="mnw-upload-cam">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <p class="mnw-upload-main">Tap to activate camera or drop selfie</p>
        <p class="mnw-upload-hint">JPG, PNG, WebP · Max 10MB · Full body works best</p>
        <input type="file" id="mnw-selfie-input" accept="image/*" style="display:none">
      </div>
      <div id="mnw-selfie-preview" style="display:none" class="mnw-selfie-preview">
        <img id="mnw-selfie-img" class="mnw-selfie-img" alt="Your selfie"/>
        <button class="mnw-retake-btn" id="mnw-retake">↺ Retake</button>
      </div>
      <div class="mnw-step-footer">
        <button class="mnw-btn-ghost" id="mnw-s4-back">← Back</button>
        <button class="mnw-cta mnw-cta-sm" id="mnw-s4-next" disabled>Generate My Look →</button>
      </div>
      <div class="mnw-step-dots">
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-active"></span>
        <span class="mnw-dot"></span>
      </div>
    </div>
  `);

  const zone = $('#mnw-canvas-zone');
  const inp  = $('#mnw-selfie-input');
  const prev = $('#mnw-selfie-preview');
  const img  = $('#mnw-selfie-img');
  const next = $('#mnw-s4-next');

  const loadSelfie = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = (e) => {
      state.selfieBase64 = e.target.result;
      img.src = e.target.result;
      zone.style.display = 'none';
      prev.style.display = 'block';
      if (next) next.disabled = false;
    };
    r.readAsDataURL(file);
  };

  zone.addEventListener('click', () => inp.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('mnw-dragging'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('mnw-dragging'));
  zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('mnw-dragging'); if (e.dataTransfer.files[0]) loadSelfie(e.dataTransfer.files[0]); });
  inp.addEventListener('change', () => { if (inp.files[0]) loadSelfie(inp.files[0]); });
  $('#mnw-retake').addEventListener('click', () => { state.selfieBase64 = null; zone.style.display = 'flex'; prev.style.display = 'none'; if (next) next.disabled = true; });
  $('#mnw-s4-back').addEventListener('click', renderStep36);
  if (next) next.addEventListener('click', renderStep5A);
}

// ── STEP 5A: Generated look (pipeline) ─────────────
function renderStep5A() {
  // Hide ALL back buttons when first design starts generating
  // (user cannot go back mid-generation — would lose context)
  // Back buttons reappear in renderStep5B/5C (second design phase)
  ['mnw-s2-back','mnw-s3-back','mnw-s4-back'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // Add a CSS rule to suppress any .mnw-btn-ghost back buttons during step5A
  if (!document.getElementById('mn-hide-back-style')) {
    var s = document.createElement('style');
    s.id  = 'mn-hide-back-style';
    s.textContent = '.mn-step5a-active .mnw-btn-ghost { display: none !important; }';
    document.head.appendChild(s);
  }
  var content = document.getElementById('mn-content-container') || document.querySelector('.mnw-content');
  if (content) content.classList.add('mn-step5a-active');
  state.step = 5; state.step5State = 'A';
  const selectedLabels = state.selectedAesthetics.map(id => AESTHETICS.find(a => a.id === id)?.style || id).join(' / ');

  // Map aesthetic -> vibe_id for Vercel pipeline
  const vibeMap = {
    old_money_m: 'quiet_luxury', street_m: 'sarcastic_rizzler',
    indo_western_m: 'main_character', corporate_m: 'caffeine_survivor',
    athleisure_m: 'caffeine_survivor', denimcore_m: 'sarcastic_rizzler',
    resort_m: 'main_character', techwear_m: 'main_character',
    minimalist_f: 'quiet_luxury', y2k_f: 'sarcastic_rizzler',
    cyberpunk_f: 'main_character', casual_f: 'caffeine_survivor',
    quietlux_f: 'quiet_luxury', coquette_f: 'main_character',
    boho_f: 'main_character', power_suit_f: 'caffeine_survivor',
  };
  const vibeId = vibeMap[state.selectedAesthetics[0]] || 'caffeine_survivor';

  // Map occasion -> occasion_id for Vercel pipeline
  const occMap = {
    office: 'office', date: 'date_night', sangeet: 'sangeet',
    airport: 'airport_look', gym: 'office', college: 'date_night',
    pooja: 'sangeet', casual: 'date_night',
  };
  const occasionId = occMap[state.selectedOccasions[0]] || 'date_night';

  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <p class="mnw-step-num">06 / 06</p>
        <h2 class="mnw-step-title">Curating your look</h2>
        <p class="mnw-step-sub">Hang tight — this runs behind the scenes.</p>
      </div>
      <div class="mnw-result-wrap" id="mnw-result-wrap">
        <div id="mnw-loading-state" class="mnw-cinema-loader">
          <div class="mnw-cl-orb mnw-cl-orb1"></div>
          <div class="mnw-cl-orb mnw-cl-orb2"></div>
          <div class="mnw-cl-orb mnw-cl-orb3"></div>
          <div class="mnw-cl-frame">
            <span class="mnw-cl-corner mnw-cl-tl"></span>
            <span class="mnw-cl-corner mnw-cl-tr"></span>
            <span class="mnw-cl-corner mnw-cl-bl"></span>
            <span class="mnw-cl-corner mnw-cl-br"></span>
            <div class="mnw-cl-rings">
              <div class="mnw-cl-ring mnw-cl-ring1"></div>
              <div class="mnw-cl-ring mnw-cl-ring2"></div>
              <div class="mnw-cl-ring mnw-cl-ring3"></div>
              <div class="mnw-cl-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#39A596" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
            </div>
            <div class="mnw-cl-scanline"></div>
          </div>
          <div class="mnw-cl-progress-wrap">
            <div class="mnw-cl-progress-bar" id="mnw-cl-progress"></div>
          </div>
          <p class="mnw-cl-label mnw-cl-label--silent" id="mnw-loading-text" aria-hidden="true">&nbsp;</p>
          <div class="mnw-cl-steps">
            <span class="mnw-cl-step mnw-cl-step-active" id="mnw-cls-0">Scan</span>
            <span class="mnw-cl-sep">·</span>
            <span class="mnw-cl-step" id="mnw-cls-1">Align</span>
            <span class="mnw-cl-sep">·</span>
            <span class="mnw-cl-step" id="mnw-cls-2">Curate</span>
            <span class="mnw-cl-sep">·</span>
            <span class="mnw-cl-step" id="mnw-cls-3">Done</span>
          </div>
        </div>
        <img class="mnw-result-img" id="mnw-result-img" alt="AI Generated Look" style="display:none"/>
        <span class="mnw-result-badge" id="mnw-result-badge" style="display:none">AI Generated</span>
      </div>
      <div class="mnw-dopamine-box" id="mnw-result-info" style="display:none">
        <p style="font-size:10px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px">${selectedLabels || 'Your look'}</p>
        <p class="mnw-dopamine-title" id="mnw-result-title">Ready when you are.</p>
        <p class="mnw-dopamine-sub">Add a wardrobe snap to go further.</p>
      </div>
      <button class="mnw-upload-wardrobe-btn" id="mnw-upload-wardrobe" style="display:none">Upload Wardrobe Pic</button>
      <input type="file" id="mnw-wardrobe-input" accept="image/*" style="display:none"/>
      <div id="mnw-api-error" style="display:none;margin-top:12px;padding:12px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;font-size:12px;color:#fca5a5;text-align:center"></div>
      <div class="mnw-step-dots">
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-active"></span>
      </div>
    </div>
  `);

  // Cinematic loader: progress + step dots only (no status copy — API runs in background)
  const loaderTicks = [
    { step: 0, pct: 18 },
    { step: 0, pct: 32 },
    { step: 1, pct: 48 },
    { step: 1, pct: 58 },
    { step: 2, pct: 72 },
    { step: 2, pct: 84 },
    { step: 3, pct: 94 },
  ];
  let li = 0;
  var setLoaderProgress = function(idx) {
    var m = loaderTicks[Math.min(idx, loaderTicks.length - 1)];
    var pb = $('#mnw-cl-progress');
    if (pb) pb.style.width = m.pct + '%';
    [0, 1, 2, 3].forEach(function(i) {
      var s = document.getElementById('mnw-cls-' + i);
      if (!s) return;
      s.classList.remove('mnw-cl-step-done', 'mnw-cl-step-active');
      if (i < m.step) s.classList.add('mnw-cl-step-done');
      if (i === m.step) s.classList.add('mnw-cl-step-active');
    });
  };
  setLoaderProgress(0);
  const loaderInt = setInterval(function() {
    if (li < loaderTicks.length - 1) setLoaderProgress(++li);
    else clearInterval(loaderInt);
  }, 2200);

  const rawBase64 = state.selfieBase64 ? state.selfieBase64.replace(/^data:image\/\w+;base64,/, '') : null;
  if (!rawBase64) {
    clearInterval(loaderInt);
    const e = $('#mnw-api-error'); if (e) { e.style.display='block'; e.textContent='No photo found. Please go back and upload your selfie.'; }
    const ls = $('#mnw-loading-state'); if (ls) ls.style.display='none';
    return;
  }

  const userId = (window.MN_CONFIG && window.MN_CONFIG.customerId) ? String(window.MN_CONFIG.customerId) : 'guest_' + Math.random().toString(36).slice(2,9);

  const abortCtrl = new AbortController();
  const timeoutId = setTimeout(() => abortCtrl.abort(), 90000);
  console.log('[MN] Sending stylist_pipeline request:', { occasionId, vibeId, skinTone: state.skinTone, bodyShape: state.bodyShape, sourcePreference: state.sourcePreference, imageSize: rawBase64 ? rawBase64.length : 0 });

  fetch(API_URL, {
    method: 'POST',
    signal: abortCtrl.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'full_pipeline',
      user_id: userId,
      occasion: occasionId,
      vibe_id: vibeId,
      user_image: rawBase64 || '',
      user_image_data_url: state.selfieBase64 || '',
      skin_tone: state.skinTone,
      body_shape: state.bodyShape,
      gender: state.gender,
      source_preference: state.sourcePreference || 'global_market',
      sourcePreference: state.sourcePreference || 'global_market',
      shot_preference: 'full_body',
      framing: 'head_to_toe',
    }),
  })
  .then(r => { clearTimeout(timeoutId); console.log('[MN] Response received:', r.status, r.ok); return r.ok ? r.json() : r.json().then(d => Promise.reject(d.error || ('Server error ' + r.status))); })
  .then(data => {
    clearInterval(loaderInt);
    if (!data || data.success === false) throw new Error((data && data.error) || 'Pipeline failed');
    const recommendations = mnNormalizePipelineResponse(data);
    console.log('[MN] Pipeline data success:', recommendations.direction ? 'present' : 'MISSING');
    state.pipelineResult = recommendations;
    state.pipelineRaw = data;

    // Save to localStorage
    try {
      localStorage.setItem('mn_ai_context', JSON.stringify({
        direction: recommendations.direction,
        suggestions: recommendations.suggestions,
        context: {
          mode: 'self',
          contexts: state.selectedOccasions.map(id => OCCASIONS.find(o => o.id === id)?.label || id),
          loudness: 'Balanced',
          sourcePreference: state.sourcePreference || 'global_market',
        },
        identity: {
          coreExpression: state.selectedAesthetics.map(id => AESTHETICS.find(a => a.id === id)?.style || id).join(' / '),
          build: (state.bodyShape || 'average').replace(/_/g, ' '),
          skinTone: state.skinTone || 'Not provided',
          gender: state.gender || 'men',
        },
        mode: 'self',
        timestamp: Date.now()
      }));
    } catch(e) {}

    // Save to outfit history
    try {
      const history = JSON.parse(localStorage.getItem('mn_outfit_history') || '[]');
      history.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        direction: recommendations.direction,
        outfit_pieces: recommendations.outfit_pieces || [],
        suggestions: recommendations.suggestions || [],
        context: (state.selectedOccasions || []).map(id => OCCASIONS.find(o => o.id === id)?.label || id).join(', '),
        occasion: (state.selectedOccasions || []).map(id => OCCASIONS.find(o => o.id === id)?.label || id).join(', '),
        loudness: 'Balanced',
        mode: state.sourcePreference || 'self',
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('mn_outfit_history', JSON.stringify(history.slice(0, 30)));
    } catch(e) {}

    // ── INTENT-BASED ROUTING HOOK ──────────────────────────
    const _urlParams   = new URLSearchParams(window.location.search);
    const _intent      = _urlParams.get('intent') || '';
    const _isCreator   = _intent.indexOf('creator') !== -1;
    const _designUuid  = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const _designTitle = selectedLabels || 'My Narrative Design';

    if (_isCreator) {
      if (typeof window.mnMarkFirstDesignComplete === 'function') {
        window.mnMarkFirstDesignComplete(_designUuid, getGeneratedImg(), _designTitle);
      }
      if (typeof window.mnShowSecondDesignPrompt === 'function') {
        window.mnShowSecondDesignPrompt();
      } else if (typeof window.mnRenderSecondDesignPrompt === 'function') {
        window.mnRenderSecondDesignPrompt();
      }
    }

    if (typeof window.mnMarkFirstDesignComplete === 'function') {
      window.mnMarkFirstDesignComplete(_designUuid, getGeneratedImg(), _designTitle);
    }
    // ── END INTENT HOOK ────────────────────────────────────

    // Render results with source-aware payload (single API response).
    renderAvatarStyleResults(recommendations, selectedLabels, occasionId, vibeId, data);
  })
  .catch(err => {
    clearTimeout(timeoutId);
    clearInterval(loaderInt);
    const isTimeout = err && (err.name === 'AbortError' || String(err).includes('abort'));
    if (isTimeout) err = 'Request timed out. The AI is taking too long - please try again.';
    console.error('[MN] Pipeline error:', err);
    const ls = $('#mnw-loading-state'), errEl = $('#mnw-api-error');
    if (ls) ls.style.display = 'none';
    if (errEl) { errEl.style.display='block'; errEl.innerHTML='Something went wrong: ' + err + '. <button onclick="renderStep5A()" style="color:#39A596;background:none;border:none;cursor:pointer;font-weight:700">Retry</button>'; }
  });

// ═══════════════════════════════════════════════════════════
// AVATAR-STYLE RESULTS — Matches old working theme's renderAvatarResults
// ═══════════════════════════════════════════════════════════
function renderAvatarStyleResults(recommendations, selectedLabels, occasionId, vibeId, pipelineData) {
  const shortText = (s, n) => {
    const t = (s == null ? '' : String(s)).trim();
    if (!t) return '';
    return t.length <= n ? t : t.slice(0, Math.max(0, n - 1)).trim() + '\u2026';
  };
  const outfitItems = recommendations.outfit_pieces || [];
  const profile = state;
  const closetItems = profile.closetItems || [];

  // Mark owned items
  const categorized = outfitItems.map(item => ({
    ...item,
    owned: item.owned === true || (() => {
      const richCloset = (() => { try { return JSON.parse(localStorage.getItem('mn_digital_closet') || '[]'); } catch(e) { return []; } })();
      const itemName = (item.name || '').toLowerCase();
      const itemType = (item.type || '').toLowerCase();
      if (richCloset.some(c => {
        const cName = (c.name || c.original_name || '').toLowerCase();
        return cName && (itemName.includes(cName) || cName.includes(itemType));
      })) return true;
      return closetItems.some(owned => owned.toLowerCase().includes(itemType) || itemName.includes(owned.toLowerCase()));
    })()
  }));

  const missingItems = categorized.filter(item => !item.owned);
  const missingWithLinks = missingItems.map(item => ({
    ...item,
    exactLinks: (item.shop_links || []).map(link => ({
      ...link,
      exactUrl: mnPickProductUrl(link),
    })).filter(link => link.exactUrl),
  }));
  const tipsPick = (recommendations.styling_tips || []).slice(0, 2).map(t => shortText(t, 72));

  const html = `
    <div class="mnw-step mn-fade-in" style="animation:fadeIn .4s ease">
      <div class="mn-avatar-container" style="position:relative;margin-bottom:16px;border-radius:14px;overflow:hidden">
        <div id="mn-flux-canvas" class="mn-preview-panel">
          <div id="mn-flux-inner">
            <div class="mn-preview-loading">
              <div class="mnw-cl-orb mnw-cl-orb1" style="opacity:0.45"></div>
              <div class="mnw-cl-orb mnw-cl-orb2" style="opacity:0.4"></div>
              <div class="mnw-cl-frame" style="width:112px;height:112px;margin:0 auto">
                <span class="mnw-cl-corner mnw-cl-tl"></span>
                <span class="mnw-cl-corner mnw-cl-tr"></span>
                <span class="mnw-cl-corner mnw-cl-bl"></span>
                <span class="mnw-cl-corner mnw-cl-br"></span>
                <div class="mnw-cl-rings">
                  <div class="mnw-cl-ring mnw-cl-ring1"></div>
                  <div class="mnw-cl-ring mnw-cl-ring2"></div>
                  <div class="mnw-cl-ring mnw-cl-ring3"></div>
                  <div class="mnw-cl-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39A596" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  </div>
                </div>
                <div class="mnw-cl-scanline"></div>
              </div>
              <div class="mnw-cl-progress-wrap"><div class="mnw-cl-progress-bar" id="mn-preview-pb" style="width:28%"></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="mn-outfit-items" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
        ${categorized.map(item => `
          <div class="mn-outfit-item" style="background:rgba(255,255,255,0.04);border:1px solid ${item.owned ? 'rgba(57,165,150,0.3)' : 'rgba(255,255,255,0.08)'};border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:4px">
            <div style="width:28px;height:28px;border-radius:6px;background:${item.color || '#333'};margin-bottom:4px"></div>
            <div style="font-size:12px;font-weight:700;color:#fff">${shortText(item.name, 36)}</div>
            <div style="font-size:10px;color:${item.owned ? '#39A596' : 'rgba(255,255,255,0.4)'}">${item.owned ? 'Yours' : 'Shop'}</div>
            ${item.why ? `<div style="font-size:10px;opacity:0.55;color:rgba(255,255,255,0.65)">${shortText(item.why, 56)}</div>` : ''}
          </div>
        `).join('')}
      </div>

      ${recommendations.color_science ? `
        <div style="background:rgba(57,165,150,0.06);border:1px solid rgba(57,165,150,0.18);border-radius:10px;padding:10px 12px;margin-bottom:12px;backdrop-filter:blur(8px)">
          <p style="font-size:9px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px">Palette</p>
          <p style="font-size:11px;color:rgba(255,255,255,0.72);margin:0;line-height:1.45">${shortText(recommendations.color_science, 140)}</p>
        </div>
      ` : ''}

      ${tipsPick.length ? `
        <div style="margin-bottom:14px">
          <p style="font-size:9px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Quick tips</p>
          <ul style="list-style:none;padding:0;margin:0">
            ${tipsPick.map(tip => `<li style="font-size:11px;color:rgba(255,255,255,0.58);padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05)">${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${missingWithLinks.length > 0 ? `
        <div style="margin-bottom:16px">
          <p style="font-size:9px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2px">Fill the gap</p>
          <p style="font-size:10px;color:rgba(255,255,255,0.38);margin-bottom:8px">One tap per piece</p>
          ${missingWithLinks.map(item => `
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px;margin-bottom:8px;backdrop-filter:blur(6px)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">
                <div style="min-width:0;flex:1">
                  <p style="font-size:12px;font-weight:700;color:#fff;margin:0">${shortText(item.name, 40)}</p>
                  <p style="font-size:10px;color:rgba(255,255,255,0.38);margin:4px 0 0">${shortText(item.why || 'Finishes the outfit', 64)}</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;align-items:stretch">
                  ${item.exactLinks.slice(0, 1).map(link => `
                    <a href="${link.exactUrl}" target="_blank" rel="noopener noreferrer" style="background:rgba(57,165,150,0.15);border:1px solid rgba(57,165,150,0.3);border-radius:8px;padding:8px 12px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px">
                      <span style="font-size:11px;font-weight:700;color:#fff">${link.platform || 'Shop'}</span>
                      ${link.price ? `<span style="font-size:10px;color:#4fffd9;font-weight:600">${link.price}</span>` : ''}
                    </a>
                  `).join('')}
                  ${!item.exactLinks.length ? `<span style="font-size:9px;color:rgba(255,255,255,0.35)">Exact product link unavailable</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `<div style="text-align:center;padding:10px;background:rgba(57,165,150,0.06);border:1px solid rgba(57,165,150,0.15);border-radius:10px;margin-bottom:14px"><p style="font-size:12px;color:#39A596;font-weight:700;margin:0">You’re set — closet covers this look.</p></div>`}

      <div id="mn-affiliate-upsells" style="margin-bottom:16px"></div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <button id="btn-regenerate" type="button" class="mnw-cta" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);font-size:12px;padding:10px 16px;border-radius:10px;cursor:pointer">Regenerate look</button>
        <button id="btn-save-look" type="button" class="mnw-cta" style="background:rgba(57,165,150,0.15);border:1px solid rgba(57,165,150,0.3);color:#39A596;font-size:12px;padding:10px 16px;border-radius:10px;cursor:pointer">Save</button>
      </div>

      <div class="mnw-step-dots">
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-active"></span>
      </div>
    </div>
  `;

  setContent(html);

  const renderAffiliateUpsells = function(affiliateRecs) {
    const root = document.getElementById('mn-affiliate-upsells');
    if (!root) return;
    if (!affiliateRecs || !affiliateRecs.length) {
      root.innerHTML = '';
      return;
    }
    root.innerHTML = `
      <div style="margin-bottom:8px">
        <p style="font-size:9px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.1em;margin:0">Pairs well</p>
      </div>
      ${affiliateRecs.slice(0, 2).map(rec => `
        ${(() => {
          const exactUrl = mnPickProductUrl(rec);
          return `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 12px;margin-bottom:8px;backdrop-filter:blur(6px)">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="min-width:0;flex:1">
              <p style="font-size:12px;font-weight:700;color:#fff;margin:0">${shortText(rec.product_name || rec.name || 'Pick', 42)}</p>
              <p style="font-size:10px;color:rgba(255,255,255,0.4);margin:2px 0 0">${shortText(rec.brand || rec.platform || '', 28)}</p>
            </div>
            ${exactUrl ? `
              <a href="${exactUrl}" target="_blank" rel="noopener noreferrer" style="background:rgba(57,165,150,0.15);border:1px solid rgba(57,165,150,0.3);border-radius:8px;padding:8px 12px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;flex-shrink:0">
                <span style="font-size:11px;font-weight:700;color:#fff">${rec.platform || 'Shop'}</span>
                ${rec.price ? `<span style="font-size:10px;color:#4fffd9;font-weight:700">₹${Number(rec.price).toLocaleString('en-IN')}</span>` : ''}
              </a>
            ` : `<span style="font-size:9px;color:rgba(255,255,255,0.35)">Exact product link unavailable</span>`}
          </div>
        </div>
      `; })()}
      `).join('')}
    `;
  };

  const inner = document.getElementById('mn-flux-inner');
  const imgUrl =
    (pipelineData && pipelineData.editorial && (
      pipelineData.editorial.vton_image_url ||
      pipelineData.editorial.full_body_image_url ||
      pipelineData.editorial.final_image_url ||
      pipelineData.editorial.flux_image_url
    )) || '';
  if (inner) {
    if (imgUrl) {
      state.currentLookImage = imgUrl;
      inner.innerHTML =
        '<img src="' +
        imgUrl +
        '" alt="Your look" class="mn-preview-result-img" onerror="this.src=\'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=480&h=640&fit=crop\'" />';
    } else {
      inner.innerHTML =
        '<div class="mn-preview-loading" style="min-height:180px"><p style="color:#f87171;font-size:12px;margin:0">Preview unavailable</p><p style="color:rgba(255,255,255,0.4);font-size:10px;margin:8px 0 0;max-width:240px;text-align:center">Image was not returned by pipeline.</p></div>';
    }
  }
  renderAffiliateUpsells((pipelineData && pipelineData.affiliate_upsells) || []);

  document.getElementById('btn-regenerate')?.addEventListener('click', renderStep5A);
  document.getElementById('btn-save-look')?.addEventListener('click', () => {
    try {
      const nowIso = new Date().toISOString();
      const imageSrc = state.currentLookImage || document.querySelector('#mn-flux-inner img')?.src || getGeneratedImg();
      const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        direction: recommendations.direction || 'AI Generated Outfit',
        outfit_pieces: categorized,
        suggestions: recommendations.suggestions || [],
        context: (state.selectedOccasions || []).map(id => OCCASIONS.find(o => o.id === id)?.label || id).join(', '),
        occasion: (state.selectedOccasions || []).map(id => OCCASIONS.find(o => o.id === id)?.label || id).join(', '),
        loudness: 'Balanced',
        mode: 'self',
        look_image_url: imageSrc,
        savedAt: nowIso,
        saved_manually: true,
      };
      const history = JSON.parse(localStorage.getItem('mn_outfit_history') || '[]');
      history.unshift(entry);
      localStorage.setItem('mn_outfit_history', JSON.stringify(history.slice(0, 50)));
      localStorage.setItem('mn_saved_looks', JSON.stringify(history.slice(0, 50)));
    } catch(e) {}
    alert('✅ Saved to your profile looks.');
  });
}

// ═══════════════════════════════════════════════════════════
// TEXT-ONLY RESULTS — Fallback when no outfit_pieces returned
// ═══════════════════════════════════════════════════════════
function renderTextResults(recommendations, selectedLabels) {
  const clip = (s, n) => {
    const t = (s == null ? '' : String(s)).trim();
    return !t ? '' : t.length <= n ? t : t.slice(0, n - 1).trim() + '\u2026';
  };
  const sug = (recommendations.suggestions || []).slice(0, 3).map(x => clip(x, 72));
  const tips = (recommendations.styling_tips || []).slice(0, 2).map(x => clip(x, 72));
  const html = `
    <div class="mnw-step mn-fade-in" style="animation:fadeIn .4s ease">
      <div class="mnw-step-hdr">
        <p class="mnw-step-num" style="color:#39A596">Direction</p>
        <h2 class="mnw-step-title" style="font-size:17px">"${clip(recommendations.direction || 'Curated for you.', 80)}"</h2>
      </div>

      ${sug.length ? `
        <div style="margin-bottom:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px;backdrop-filter:blur(8px)">
          <p style="font-size:9px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px">Ideas</p>
          <ul style="list-style:none;padding:0;margin:0">
            ${sug.map(s => `<li style="font-size:11px;color:rgba(255,255,255,0.65);padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05)">${s}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${tips.length ? `
        <div style="margin-bottom:14px">
          <p style="font-size:9px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Tips</p>
          <ul style="list-style:none;padding:0;margin:0">
            ${tips.map(tip => `<li style="font-size:11px;color:rgba(255,255,255,0.55);padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.05)">${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <button type="button" id="btn-regenerate" class="mnw-cta" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);font-size:12px;padding:10px 16px;border-radius:10px;cursor:pointer">Start over</button>
        <button type="button" id="btn-design" class="mnw-cta" style="background:rgba(57,165,150,0.15);border:1px solid rgba(57,165,150,0.3);color:#39A596;font-size:12px;padding:10px 16px;border-radius:10px;cursor:pointer">Design</button>
      </div>

      <div class="mnw-step-dots">
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-done"></span><span class="mnw-dot mnw-dot-done"></span>
        <span class="mnw-dot mnw-dot-active"></span>
      </div>
    </div>
  `;

  setContent(html);
  document.getElementById('btn-regenerate')?.addEventListener('click', renderStep5A);
  document.getElementById('btn-design')?.addEventListener('click', () => {
    const studioUrl = window.MN_CONFIG?.studioUrl || '/pages/ai-studio';
    window.location.href = studioUrl;
  });
}

function renderGiftContext() {
  state.giftMode = true;
  state.currentContext = null;
  state.selectedSlogan = null;
  state.step = 3;
  setContent(`
    <div class="mn-context-flow mn-fade-in">
      <div class="mnw-step-hdr" style="margin-bottom:8px">
        <p class="mnw-step-num">Gift Mode</p>
        <h2 class="mnw-step-title" style="font-size:18px">Who is this gift for?</h2>
      </div>
      <div class="mn-context-chips" id="mn-gift-recipient-chips">
        ${GIFT_RECIPIENTS.map(rec => `<button type="button" class="mn-context-chip mn-recipient-chip" data-value="${rec}">${rec}</button>`).join('')}
      </div>
      <div class="mn-divider"></div>
      <h3 class="mn-context-heading">What's the occasion?</h3>
      <div class="mn-context-chips" id="mn-gift-occasion-chips">
        ${GIFT_OCCASIONS.map(occ => `<button type="button" class="mn-context-chip mn-occasion-chip" data-value="${occ}">${occ}</button>`).join('')}
      </div>
      <div class="mn-divider"></div>
      <h3 class="mn-context-heading">Unspoken Message (optional)</h3>
      <input type="text" id="mn-gift-unspoken" class="mn-text-input" placeholder="What should this gift say?" />
      <div class="mn-action-bar mn-action-bar-grid">
        <button type="button" id="btn-gift-back" class="mn-btn-secondary">← Back</button>
        <button type="button" id="btn-gift-generate" class="mn-btn-primary">✨ Get AI Recommendations</button>
      </div>
    </div>
  `);

  let selectedRecipient = '';
  let selectedOccasion = '';
  document.querySelectorAll('.mn-recipient-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.mn-recipient-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedRecipient = chip.dataset.value || '';
    });
  });
  document.querySelectorAll('.mn-occasion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.mn-occasion-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedOccasion = chip.dataset.value || '';
    });
  });

  document.getElementById('btn-gift-back')?.addEventListener('click', () => {
    state.giftMode = false;
    const banner = document.getElementById('mnw-gift-banner');
    if (banner) banner.style.display = 'none';
    renderStep0();
  });

  document.getElementById('btn-gift-generate')?.addEventListener('click', () => {
    if (!selectedRecipient || !selectedOccasion) {
      alert('Please select both recipient and occasion.');
      return;
    }
    state.currentContext = {
      mode: 'gift',
      recipient: selectedRecipient,
      occasion: selectedOccasion,
      unspoken: (document.getElementById('mn-gift-unspoken')?.value || '').trim(),
      contexts: [selectedOccasion],
      loudness: 'Balanced',
    };
    generateGiftRecommendations();
  });
}

function renderGiftResults(recommendations) {
  const slogans = (recommendations.suggestions || []).filter(Boolean);
  state.selectedSlogan = slogans[0] || recommendations.direction || 'For you.';
  const tipLine = Array.isArray(recommendations.styling_tips) && recommendations.styling_tips[0] ? recommendations.styling_tips[0] : '';
  const subtitle = 'Pick one message. First is AI-recommended.';

  setContent(`
    <div class="mn-results mn-fade-in">
      <div class="mn-results-header">
        <div class="mn-results-icon">🎁</div>
        <div>
          <h3 class="mn-results-title">Choose Their Message</h3>
          <p class="mn-results-subtitle" style="font-size:12px;color:var(--mn-text-muted)">${subtitle}</p>
        </div>
      </div>
      <div class="mn-slogan-grid">
        ${(slogans.length ? slogans : [state.selectedSlogan]).map((slogan, index) => `
          <button type="button" class="mn-slogan-card ${index === 0 ? 'recommended active' : ''}" data-slogan="${String(slogan).replace(/"/g, '&quot;')}">
            ${index === 0 ? '<div class="mn-badge-recommended">Recommended</div>' : ''}
            <div class="mn-slogan-content"><span class="mn-slogan-text">"${slogan}"</span></div>
            <div class="mn-checkbox"></div>
          </button>
        `).join('')}
      </div>
      ${tipLine ? `<p class="mn-tips-text" style="margin-top:12px">💡 <b>Stylist tip:</b> ${tipLine}</p>` : ''}
      <div class="mn-action-bar mn-action-bar-grid">
        <button type="button" id="btn-gift-start-over" class="mn-btn-secondary">🔄 Start Over</button>
        <button type="button" id="btn-gift-design" class="mn-btn-primary">🎨 Design This Slogan</button>
      </div>
    </div>
  `);

  document.querySelectorAll('.mn-slogan-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mn-slogan-card').forEach(card => card.classList.remove('active'));
      btn.classList.add('active');
      state.selectedSlogan = btn.dataset.slogan || state.selectedSlogan;
    });
  });
  document.getElementById('btn-gift-start-over')?.addEventListener('click', renderGiftContext);
  document.getElementById('btn-gift-design')?.addEventListener('click', () => {
    if (state.selectedSlogan) {
      localStorage.setItem('mn_pending_design', JSON.stringify({
        slogan: state.selectedSlogan,
        context: state.currentContext,
        timestamp: Date.now(),
      }));
    }
    window.location.href = window.MN_CONFIG?.studioUrl || '/pages/ai-studio';
  });
}

function generateGiftRecommendations() {
  setContent(`
    <div class="mn-transition">
      <div class="mn-spinner"></div>
      <p class="mn-transition-text">Creating gift recommendations...</p>
    </div>
  `);

  const identityPayload = buildGiftIdentityPayload();
  const contextPayload = state.currentContext || { mode: 'gift', contexts: ['Gift'], loudness: 'Balanced' };

  fetch(FASHION_CONSULTANT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: identityPayload, currentContext: contextPayload }),
  })
    .then(r => (r.ok ? r.json() : r.json().then(d => Promise.reject(d.error || ('Server error ' + r.status)))))
    .then(recommendations => {
      try {
        localStorage.setItem('mn_ai_context', JSON.stringify({
          direction: recommendations.direction,
          suggestions: recommendations.suggestions,
          context: contextPayload,
          identity: identityPayload,
          mode: 'gift',
          timestamp: Date.now(),
        }));
      } catch (e) {}

      try {
        const history = JSON.parse(localStorage.getItem('mn_outfit_history') || '[]');
        history.unshift({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
          direction: recommendations.direction || (recommendations.suggestions || [])[0] || 'Gift style recommendation',
          outfit_pieces: recommendations.outfit_pieces || [],
          suggestions: recommendations.suggestions || [],
          context: contextPayload?.occasion || contextPayload?.contexts?.[0] || 'Gift',
          occasion: contextPayload?.occasion || contextPayload?.contexts?.[0] || 'Gift',
          loudness: contextPayload?.loudness || 'Balanced',
          mode: 'gift',
          recipient: contextPayload?.recipient || '',
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem('mn_outfit_history', JSON.stringify(history.slice(0, 50)));
      } catch (e) {}

      renderGiftResults(recommendations);
    })
    .catch(err => {
      console.error('[MN] Gift mode error:', err);
      setContent(`
        <div class="mn-transition">
          <p class="mn-transition-text" style="color:#f87171">Could not fetch gift recommendations.</p>
          <p style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:10px">${String(err)}</p>
          <div class="mn-action-bar" style="margin-top:14px">
            <button type="button" id="btn-gift-retry" class="mn-btn-primary">Retry</button>
          </div>
        </div>
      `);
      document.getElementById('btn-gift-retry')?.addEventListener('click', renderGiftContext);
    });
}

  setTimeout(() => {
    const wb = $('#mnw-upload-wardrobe'), wi = $('#mnw-wardrobe-input');
    if (wb && wi) {
      wb.addEventListener('click', () => wi.click());
      wi.addEventListener('change', function() {
        if (!this.files[0]) return;
        const r = new FileReader();
        r.onload = (e) => { state.wardrobeBase64 = e.target.result; renderStep5B(); };
        r.readAsDataURL(this.files[0]);
      });
    }
  }, 300);
}

// ──────────────────────────────────────────────────────────────────────────────
// GLOBAL MARKET PATH A: Render affiliate upsell results
// Called after API returns affiliate_upsells[] in global_market mode
// ──────────────────────────────────────────────────────────────────────────────
function renderAffiliateResults(data) {
  const affiliateRecs = data.affiliate_upsells || [];
  if (!affiliateRecs.length) return;

  const snip = (s, n) => {
    const t = (s == null ? '' : String(s)).trim();
    return !t ? '' : t.length <= n ? t : t.slice(0, n - 1).trim() + '\u2026';
  };
  const colorTheory = data.color_theory || {};
  const mstLabel = colorTheory.mst_label || '';
  const bestColors = snip((colorTheory.best_colors || []).slice(0, 4).join(', '), 48);

  const occData = OCCASIONS.find(o => o.id === state.selectedOccasions[0]) || {};
  const vibeLabel = snip(state.selectedAesthetics.map(id => AESTHETICS.find(a => a.id === id)?.style || id).join(' · '), 36);

  const html = `
    <div class="mn-shopping-section mn-fade-in" style="margin-top:14px;">
      ${colorTheory.mst_value ? `
      <div style="background:rgba(57,165,150,0.06);border:1px solid rgba(57,165,150,0.18);border-radius:10px;padding:10px 12px;margin-bottom:12px;backdrop-filter:blur(8px)">
        <p style="font-size:9px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px">Colors</p>
        <p style="font-size:11px;color:rgba(255,255,255,0.75);margin:0;line-height:1.4"><span style="color:#39A596;font-weight:700">${snip(mstLabel, 24)}</span>${bestColors ? ' · ' + bestColors : ''}</p>
      </div>
      ` : ''}

      <h4 style="font-size:12px;font-weight:800;color:#fff;margin:0 0 2px">Shop</h4>
      <p class="mn-shopping-subtitle" style="margin-bottom:10px;font-size:10px">${snip(vibeLabel + ' · ' + (occData.label || 'anywhere'), 64)}</p>

      ${affiliateRecs.slice(0, 3).map(rec => `
        ${(() => {
          const exactUrl = mnPickProductUrl(rec);
          return `
        <div class="mn-shopping-card" style="margin-bottom:8px;">
          <div style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0">
            <span class="mn-shopping-item-name" style="font-size:12px;font-weight:700;color:#fff;white-space:normal;word-break:break-word">${snip(rec.product_name || rec.name || 'Product', 44)}</span>
            <span style="font-size:10px;color:rgba(255,255,255,0.4)">${snip(rec.brand || rec.platform || 'Style', 28)}</span>
            ${rec.why || rec.gap_reason ? `<span class="mn-shopping-item-reason" style="-webkit-line-clamp:1;font-size:10px">${snip(rec.why || rec.gap_reason, 56)}</span>` : ''}
            ${rec.bank_offer ? `<span style="font-size:9px;color:#4fffd9;margin-top:2px">${snip(rec.bank_offer, 40)}</span>` : ''}
          </div>
          <div class="mn-shopping-links" style="flex-direction:column;align-items:flex-end;gap:6px">
            ${exactUrl ? `
              <a href="${exactUrl}" target="_blank" rel="noopener noreferrer" class="mn-shop-link" style="background:rgba(57,165,150,0.15);border:1px solid rgba(57,165,150,0.3);border-radius:8px;padding:8px 12px;display:flex;align-items:center;gap:5px;text-decoration:none;min-width:88px;justify-content:center">
                <span style="font-size:11px;font-weight:800;color:#fff">${rec.platform || 'Shop'}</span>
                ${rec.price ? `<span style="font-size:10px;color:#4fffd9;font-weight:600">₹${Number(rec.price).toLocaleString('en-IN')}</span>` : ''}
              </a>
            ` : `<span style="font-size:9px;color:rgba(255,255,255,0.35)">Exact product link unavailable</span>`}
            ${rec.original_price && rec.discount_pct ? `
              <div style="display:flex;align-items:center;gap:4px;padding:3px 6px;background:rgba(239,68,68,0.1);border-radius:6px">
                <span style="font-size:9px;color:rgba(255,255,255,0.35);text-decoration:line-through">₹${Number(rec.original_price).toLocaleString('en-IN')}</span>
                <span style="font-size:10px;color:#ef4444;font-weight:800">${rec.discount_pct}%</span>
              </div>
            ` : ''}
          </div>
        </div>
      `; })()}
      `).join('')}
    </div>
  `;

  // Append after the upload wardrobe button
  const ub = document.getElementById('mnw-upload-wardrobe');
  if (ub) {
    ub.insertAdjacentHTML('afterend', html);
  } else {
    // Fallback: append after dopamine box
    const info = document.getElementById('mnw-result-info');
    if (info) info.insertAdjacentHTML('afterend', html);
  }
}

// ── STEP 5B: SCANNING ANIMATION ──────────────────────────
function renderStep5B() {
  // First design complete — remove back suppression so back IS visible again
  var content = document.getElementById('mn-content-container') || document.querySelector('.mnw-content');
  if (content) content.classList.remove('mn-step5a-active');
  state.step5State = 'B'; state.scanVisibleItems = 0;
  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <h2 class="mnw-step-title">Scanning your wardrobe…</h2>
      </div>
      <div class="mnw-scan-wrap">
        <img class="mnw-result-img" src="${state.wardrobeBase64}" alt="Wardrobe"
             onerror="this.src='https://images.unsplash.com/photo-1542272604-787c3835535d?w=480&h=640&fit=crop'"/>
        <div class="mnw-scan-overlay">
          <div class="mnw-scan-line"></div>
          <div class="mnw-scan-corner mnw-sc-tl"></div>
          <div class="mnw-scan-corner mnw-sc-tr"></div>
          <div class="mnw-scan-corner mnw-sc-bl"></div>
          <div class="mnw-scan-corner mnw-sc-br"></div>
        </div>
        <span class="mnw-result-badge">🔍 Extracting Items…</span>
      </div>
      <p class="mnw-scan-label">Digitizing into your closet…</p>
      <div class="mnw-mini-closet" id="mnw-mini-closet"></div>
    </div>
  `);
  const row = $('#mnw-mini-closet');
  MOCK_WARDROBE.forEach((item, i) => {
    setTimeout(() => {
      if (!row) return;
      const div = document.createElement('div');
      div.className = 'mnw-closet-item mnw-pop-in';
      div.innerHTML = `<img class="mnw-closet-item-img" src="${item.img}" alt="${item.label}" onerror="this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=150&h=200&fit=crop'"/><p class="mnw-closet-item-lbl">${item.label}</p>`;
      row.appendChild(div);
      state.closetCount++;
      updateClosetCount();
    }, (i + 1) * 900);
  });
  setTimeout(renderStep5C, MOCK_WARDROBE.length * 900 + 1200);
}

// ── STEP 5C: DOPAMINE HOOK ────────────────────────────────
function renderStep5C() {
  state.step5State = 'C';
  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <h2 class="mnw-step-title">Your closet is alive. 🔥</h2>
      </div>
      <div class="mnw-mini-closet">
        ${MOCK_WARDROBE.map(i => `
          <div class="mnw-closet-item">
            <img class="mnw-closet-item-img" src="${i.img}" alt="${i.label}" onerror="this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=150&h=200&fit=crop'"/>
            <p class="mnw-closet-item-lbl">${i.label}</p>
          </div>
        `).join('')}
      </div>
      <div class="mnw-dopamine-box">
        <p style="font-size:26px;margin-bottom:8px">😍</p>
        <p class="mnw-dopamine-title">Damn, those jeans are a vibe.</p>
        <p class="mnw-dopamine-sub">Our AI just unlocked <strong style="color:#39A596">4 new ways</strong> to style them.</p>
        <p class="mnw-dopamine-sub" style="margin-top:6px">Upload 3 more items to unlock your <strong style="color:#fff">'Deep Style Archetype'</strong> &amp; <strong style="color:#f59e0b">5% Store Credit</strong>.</p>
      </div>
      <button class="mnw-upload-wardrobe-btn" id="mnw-upload-more">📸 Upload More Items</button>
      <input type="file" id="mnw-more-input" accept="image/*" style="display:none"/>
      <button class="mnw-cta" id="mnw-see-look" style="width:100%;justify-content:center;margin-top:8px">See My Complete Look →</button>
    </div>
  `);
  $('#mnw-upload-more').addEventListener('click', () => $('#mnw-more-input').click());
  $('#mnw-more-input').addEventListener('change', function() {
    if (this.files[0]) { state.closetCount++; updateClosetCount(); }
  });
  $('#mnw-see-look').addEventListener('click', renderStep5D);
}

// ── STEP 5D: RED GAP + AFFILIATE UPSELL ──────────────────
function renderStep5D() {
  state.step5State = 'D';
  const assembled = state.wardrobeBase64 || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=480&h=640&fit=crop';
  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <h2 class="mnw-step-title">Almost perfect. One gap to fill. 👟</h2>
      </div>
      <div class="mnw-assembled-wrap">
        <img class="mnw-result-img" src="${assembled}" alt="Assembled Look"
             onerror="this.src='https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=480&h=640&fit=crop'"/>
        <div class="mnw-red-gap" title="Missing: Shoes">
          <span class="mnw-red-gap-lbl">⚠ Missing: Shoes</span>
        </div>
        <span class="mnw-result-badge">My Narrative Anchor Top ✦</span>
      </div>
      <div class="mnw-upsell-fields">
        <div class="mnw-field">
          <label class="mnw-field-lbl">Any specific brands you love?</label>
          <input class="mnw-field-input" id="mnw-brands" type="text" placeholder="e.g. Nike, Zara, H&amp;M…"/>
        </div>
        <div class="mnw-field">
          <label class="mnw-field-lbl">Current passions?</label>
          <select class="mnw-field-select" id="mnw-passion">
            <option value="">— Pick your vibe —</option>
            <option value="gym">🏋️ Gym &amp; Fitness</option>
            <option value="caffeine">☕ Caffeine &amp; Cafes</option>
            <option value="cars">🚗 Cars &amp; Motorsport</option>
            <option value="tech">💻 Tech &amp; Startups</option>
          </select>
        </div>
        <div class="mnw-field">
          <label class="mnw-field-lbl">Bank Cards you own? (for hidden discounts)</label>
          <select class="mnw-field-select" id="mnw-bank">
            <option value="">— Select your bank —</option>
            <option value="HDFC">🏦 HDFC Bank</option>
            <option value="SBI">🏦 SBI</option>
            <option value="ICICI">🏦 ICICI Bank</option>
          </select>
        </div>
      </div>
      <button class="mnw-cta" id="mnw-show-results" style="width:100%;justify-content:center">Show Final Results 🎯</button>
      <div id="mnw-affiliate-result" style="display:none"></div>
    </div>
  `);

  $('#mnw-show-results').addEventListener('click', () => {
    const bank = $('#mnw-bank')?.value || 'default';
    state.brandInput   = $('#mnw-brands')?.value || '';
    state.passionInput = $('#mnw-passion')?.value || '';
    state.bankInput    = bank;
    renderAffiliateCard(bank || 'default');
    const btn = $('#mnw-show-results');
    if (btn) { btn.disabled = true; btn.textContent = '✓ Results Locked In'; }
  });
}

// ── AFFILIATE CARD ────────────────────────────────────────
function renderAffiliateCard(bank) {
  const rec = AFFILIATE_RECS[bank] || AFFILIATE_RECS['default'];
  const exactUrl = mnPickProductUrl(rec);
  const el  = $('#mnw-affiliate-result');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `
    <div class="mnw-affiliate-card">
      <div class="mnw-aff-header">
        <span class="mnw-gap-dot"></span>Gap Item Found — ${rec.platform} Pick
      </div>
      <div class="mnw-aff-body">
        <img class="mnw-aff-img" src="${rec.img}" alt="${rec.item}"
             onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop'"/>
        <div class="mnw-aff-info">
          <p class="mnw-aff-brand">${rec.brand}</p>
          <p class="mnw-aff-name">${rec.item}</p>
          <div class="mnw-aff-prices">
            <span class="mnw-price-now">${INR(rec.price)}</span>
            <span class="mnw-price-was">${INR(rec.original)}</span>
            <span class="mnw-price-off">${rec.off}% OFF</span>
          </div>
          <span class="mnw-bank-pill">${rec.offer}</span>
        </div>
      </div>
      ${exactUrl ? `<a href="${exactUrl}" target="_blank" rel="noopener noreferrer" class="mnw-aff-cta">
        Shop on ${rec.platform} ↗
      </a>` : `<div class="mnw-aff-cta" style="opacity:0.75;cursor:default">Exact product link unavailable</div>`}
    </div>
    <div class="mnw-dopamine-box" style="margin-top:12px;text-align:center">
      <p style="font-size:24px;margin-bottom:6px">🎉</p>
      <p class="mnw-dopamine-title">Your Main Character Look is complete.</p>
      ${state.brandInput ? `<p class="mnw-dopamine-sub">Brands noted: <strong style="color:#39A596">${state.brandInput}</strong></p>` : ''}
    </div>
    <button class="mnw-cta" onclick="window.location.href='/pages/ai-studio'" style="width:100%;justify-content:center;margin-top:8px">
      Save to My Narrative →
    </button>
  `;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── PERSISTENT UI HELPERS ─────────────────────────────────
function updateClosetCount() {
  const el = document.getElementById('mnw-closet-count');
  if (el) el.textContent = state.closetCount;
}

function updateRing(pct) {
  const safePct = Math.max(0, Math.min(100, Number(pct) || 0));
  const fill = document.querySelector('.mnw-ring-fill');
  const label = document.getElementById('mnw-ring-pct');
  if (fill) fill.style.strokeDashoffset = Math.round(113 - (safePct / 100) * 113);
  if (label) label.textContent = safePct + '%';
}

function syncWidgetProfileFromIdentity() {
  try {
    const saved = window.MN_IDENTITY || JSON.parse(localStorage.getItem('mn_identity') || '{}');
    const pct = Number(saved.completion_pct || 0);
    state.profileCompletion = pct;
    updateRing(pct);
    const closetCount = Number(saved.closet_count || (Array.isArray(saved.closet_items) ? saved.closet_items.length : 0) || 0);
    state.closetCount = closetCount;
    updateClosetCount();
  } catch (e) {
    updateRing(state.profileCompletion || 0);
  }
}

// ── WIDGET EXPAND / COLLAPSE ──────────────────────────────
function expandWidget() {
  state.isExpanded = true;
  const expanded  = document.getElementById('mn-widget-expanded');
  const minimized = document.getElementById('mn-widget-minimized');

  if (expanded) {
    // Smooth entrance animation — fade + slide up
    expanded.style.display    = 'flex';
    expanded.style.opacity    = '0';
    expanded.style.transform  = 'translateY(20px) scale(0.97)';
    expanded.style.transition = 'opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)';
    expanded.removeAttribute('aria-hidden');
    // Trigger reflow so transition plays
    expanded.getBoundingClientRect();
    expanded.style.opacity   = '1';
    expanded.style.transform = 'translateY(0) scale(1)';
  }
  if (minimized) {
    minimized.style.display = 'none';
    minimized.classList.remove('mn-widget-attention');
  }
  if (state.step <= 1 && !$('#mnw-step0-cta')) renderStep0();
}

function collapseWidget() {
  state.isExpanded = false;
  const expanded  = document.getElementById('mn-widget-expanded');
  const minimized = document.getElementById('mn-widget-minimized');
  if (expanded)  { expanded.style.display = 'none'; expanded.setAttribute('aria-hidden', 'true'); }
  if (minimized) minimized.style.display = 'flex';
}

// ── PERSISTENT NAV (Profile Ring, Closet Chip, Gift FAB) ──
function initPersistentNav() {
  // Profile ring modal
  const ringBtn  = document.getElementById('mnw-profile-ring');
  const modal    = document.getElementById('mnw-profile-modal');
  const modalClose = document.getElementById('mnw-modal-close');
  const slider   = document.getElementById('mnw-height-slider');
  const sliderVal = document.getElementById('mnw-height-val');

  if (ringBtn) {
    ringBtn.addEventListener('click', () => {
      // Read stored profile to check if photo has been uploaded
      let hasPhoto = false;
      try {
        const saved = JSON.parse(localStorage.getItem('mn_identity') || '{}');
        hasPhoto = !!(saved.profile_photo_b64 || saved.profile_photo_url);
      } catch(e) {}
      // Redirect to the full Style Dashboard — ?mn_focus=profile tells dashboard to highlight upload
      window.location.href = '/account?mn_focus=profile#style-profile';
    });
    // Keep modal close handlers in case modal is triggered elsewhere
    if (modal && modalClose) {
      modalClose.addEventListener('click', () => { modal.style.display = 'none'; });
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }
  }
  if (slider && sliderVal) {
    slider.addEventListener('input', () => { state.profileHeight = slider.value; sliderVal.textContent = slider.value + ' cm'; });
  }
  document.querySelectorAll('.mnw-fit-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.mnw-fit-chip').forEach(c => c.classList.remove('mnw-fit-active'));
      chip.classList.add('mnw-fit-active');
      state.profileFit = chip.dataset.fit;
    });
  });
  const saveBtn = document.getElementById('mnw-save-profile');
  if (saveBtn) saveBtn.addEventListener('click', () => {
    state.profileCompletion = Math.min(100, state.profileCompletion + 10);
    updateRing(state.profileCompletion);
    if (modal) modal.style.display = 'none';
  });

  // Closet chip drawer
  const closetChip   = document.getElementById('mnw-closet-chip');
  const closetDrawer = document.getElementById('mnw-closet-drawer');
  const drawerClose  = document.getElementById('mnw-drawer-close');
  const snapBtn      = document.getElementById('mnw-snap-pic');

  if (closetChip) {
    closetChip.addEventListener('click', () => {
      window.location.href = '/pages/my-closet';
    });
    if (closetDrawer && drawerClose) {
      drawerClose.addEventListener('click', () => { closetDrawer.style.display = 'none'; });
      closetDrawer.addEventListener('click', (e) => { if (e.target === closetDrawer) closetDrawer.style.display = 'none'; });
    }
  }
  if (snapBtn) {
    snapBtn.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*'; inp.capture = 'environment';
      inp.onchange = () => { if (inp.files[0]) { state.closetCount++; updateClosetCount(); } };
      inp.click();
    });
  }

  // Ghost Mode
  const ghostBtn = document.getElementById('mnw-ghost-mode');
  if (ghostBtn) ghostBtn.addEventListener('click', () => {
    if (closetDrawer) closetDrawer.style.display = 'none';
    alert('Ghost Mode: Browse styles anonymously without saving. Coming soon!');
  });

  // Gift FAB
  const giftFab = document.getElementById('mnw-gift-fab');
  if (giftFab) giftFab.addEventListener('click', () => {
    state.giftMode = true;
    const banner = document.getElementById('mnw-gift-banner');
    if (banner) banner.style.display = 'flex';
    renderGiftContext();
  });
  const exitGift = document.getElementById('mnw-exit-gift');
  if (exitGift) exitGift.addEventListener('click', () => {
    state.giftMode = false;
    state.currentContext = null;
    state.selectedSlogan = null;
    const banner = document.getElementById('mnw-gift-banner');
    if (banner) banner.style.display = 'none';
    renderStep0();
  });
}

// ── INIT ──────────────────────────────────────────────────
function initWidget() {
  const minimized = document.getElementById('mn-widget-minimized');
  const closeBtn  = document.getElementById('mn-close-btn');

  if (minimized) minimized.addEventListener('click', expandWidget);
  if (closeBtn)  closeBtn.addEventListener('click', collapseWidget);

  initPersistentNav();
  syncWidgetProfileFromIdentity();
  window.addEventListener('mn-identity-updated', syncWidgetProfileFromIdentity);
  window.addEventListener('storage', (e) => { if (e.key === 'mn_identity') syncWidgetProfileFromIdentity(); });

  // Auto-open after 15s on first visit — smooth animated entrance
  if (!sessionStorage.getItem('mn_widget_seen')) {
    setTimeout(() => {
      // 1. Give the minimized bubble a "attention" pulse before expanding
      if (minimized) {
        minimized.style.display = 'flex';
        minimized.classList.add('mn-widget-attention');
      }
      // 2. Brief pause so user sees the bubble, then smoothly expand
      setTimeout(() => {
        expandWidget();
        sessionStorage.setItem('mn_widget_seen', '1');
      }, 800);
    }, 15000);
  } else {
    if (minimized) minimized.style.display = 'flex';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MY NARRATIVE â€” Chatbot â†” Dashboard Bidirectional Sync Bridge
// Every chatbot conversation that reveals user preferences
// is automatically stored in the Style Dashboard.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

(function() {
  'use strict';

  const MN_STORE_KEY  = 'mn_identity';
  const MN_CLOSET_KEY = 'mn_digital_closet';

  // â”€â”€ Read/write profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function getProfile() {
    try { return JSON.parse(localStorage.getItem(MN_STORE_KEY) || '{}'); } catch(e) { return {}; }
  }
  function saveProfile(p) {
    p.chatbot_synced_at = new Date().toISOString();
    localStorage.setItem(MN_STORE_KEY, JSON.stringify(p));
    // Fire event so the dashboard (if open in same tab) re-renders
    window.dispatchEvent(new CustomEvent('mn-chatbot-save', { detail: p }));
    window.dispatchEvent(new CustomEvent('mn-identity-updated', { detail: p }));
  }

  // â”€â”€ NLP extraction â€” parse user messages for style data â”€â”€â”€â”€
  // Called on every user message sent to the chatbot
  function mnExtractFromMessage(message) {
    if (!message || typeof message !== 'string') return;
    const p   = getProfile();
    const msg = message.toLowerCase();
    let changed = false;

    // Height extraction (e.g. "I am 5'8" or "170cm" or "172 cm")
    const htCm  = msg.match(/(\d{3})\s*cm/);
    const htFt  = msg.match(/(\d)\s*[''']\s*(\d{1,2})/);
    if (htCm) {
      const cm = parseInt(htCm[1]);
      if (cm >= 140 && cm <= 220) { p.height_cm = cm; changed = true; }
    } else if (htFt) {
      const cm = Math.round((parseInt(htFt[1]) * 12 + parseInt(htFt[2])) * 2.54);
      if (cm >= 140 && cm <= 220) { p.height_cm = cm; changed = true; }
    }

    // Gender
    if (/\b(i am a (man|guy|male)|i'm a (man|guy|male))\b/.test(msg)) { p.gender = 'men'; changed = true; }
    if (/\b(i am a (woman|girl|female|lady)|i'm a (woman|girl|female|lady))\b/.test(msg)) { p.gender = 'women'; changed = true; }

    // Skin tone keywords â†’ MST scale
    const skinMap = { 'very fair':1,'fair skin':1,'light skin':2,'wheatish':4,'medium skin':5,'dusky':6,'dark skin':7,'deep skin':9 };
    Object.entries(skinMap).forEach(([kw, mst]) => {
      if (msg.includes(kw)) { p.skin_mst = mst; p.skin_label = kw; changed = true; }
    });

    // Preferred fit
    const fitKeywords = ['slim','regular','oversized','baggy','tailored'];
    fitKeywords.forEach(fit => {
      if (msg.includes('prefer ' + fit) || msg.includes('like ' + fit) || msg.includes('wear ' + fit)) {
        p.preferred_fit = fit.charAt(0).toUpperCase() + fit.slice(1); changed = true;
      }
    });

    // Occasions
    const occasionMap = {
      'office':'Office','work':'Office','gym':'Gym','workout':'Gym','college':'College',
      'cafe':'Cafe','coffee shop':'Cafe','club':'Club','temple':'Temple/Pooja',
      'pooja':'Temple/Pooja','travel':'Travel','airport':'Travel','mall':'Mall','date':'Date Night'
    };
    if (!Array.isArray(p.occasions)) p.occasions = [];
    Object.entries(occasionMap).forEach(([kw, val]) => {
      if (msg.includes(kw) && !p.occasions.includes(val)) { p.occasions.push(val); changed = true; }
    });

    // Budget / price range
    const budgetMatch = msg.match(/budget\s*(is|of|around|under|below|above|over)?\s*[â‚¹rs]?\s*(\d[\d,]*)/i);
    if (budgetMatch) {
      const amt = parseInt(budgetMatch[2].replace(/,/g, ''));
      if (amt > 0) {
        p.price_max = amt;
        p.price_min = Math.max(500, Math.round(amt * 0.3));
        changed = true;
      }
    }

    // Style vibes
    const vibeMap = {
      'old money':'old_money','quiet luxury':'old_money','streetwear':'street_style','street style':'street_style',
      'indo western':'indo_western','fusion':'indo_western','corporate':'corporate_core','formal':'corporate_core',
      'minimalist':'minimalist','minimal':'minimalist','y2k':'y2k_chrome','cyberpunk':'cyberpunk',
      'casual':'casual_essentials'
    };
    if (!Array.isArray(p.style_vibes)) p.style_vibes = [];
    Object.entries(vibeMap).forEach(([kw, vibe]) => {
      if (msg.includes(kw) && !p.style_vibes.includes(vibe)) { p.style_vibes.push(vibe); changed = true; }
    });

    // Hair style
    const hairMap = { 'short hair':'Short','medium hair':'Medium','long hair':'Long','curly':'Curly',
      'straight hair':'Straight','fade':'Fade','buzz cut':'Buzzcut','buzzcut':'Buzzcut','hijab':'Hijab/Covered','bald':'Bald' };
    Object.entries(hairMap).forEach(([kw, val]) => {
      if (msg.includes(kw)) { p.hair_style = val; changed = true; }
    });

    // Interests / narratives
    const interestMap = {
      'gym':'Gym & Fitness','fitness':'Gym & Fitness','coffee':'Surviving on Caffeine',
      'tech':'Technologist on Toes','cars':'Mad About Cars','dance':'Live To Dance',
      'sarcastic':'The Sarcastic Rizzler','ceo':'The CEO Edit','travel':'Wanderlust'
    };
    if (!Array.isArray(p.interests)) p.interests = [];
    Object.entries(interestMap).forEach(([kw, val]) => {
      if (msg.includes(kw) && !p.interests.includes(val)) { p.interests.push(val); changed = true; }
    });

    if (changed) saveProfile(p);
    return changed;
  }

  // â”€â”€ Extract from AI response messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // When the AI recommends something, track what the user accepted
  function mnExtractFromAIResponse(responseText, userAccepted) {
    if (!userAccepted || !responseText) return;
    const p   = getProfile();
    const txt = responseText.toLowerCase();
    let changed = false;

    // If AI recommended a vibe and user said yes/love it/great
    const positiveReply = /\b(yes|yep|love it|great|perfect|exactly|that'?s me|sounds good|agree)\b/i.test(userAccepted);
    if (positiveReply) {
      const vibeMap2 = {
        'old money':'old_money','quiet luxury':'old_money','streetwear':'street_style',
        'minimalist':'minimalist','corporate':'corporate_core','indo-western':'indo_western',
        'y2k':'y2k_chrome','cyberpunk':'cyberpunk','casual':'casual_essentials'
      };
      if (!Array.isArray(p.style_vibes)) p.style_vibes = [];
      Object.entries(vibeMap2).forEach(([kw, vibe]) => {
        if (txt.includes(kw) && !p.style_vibes.includes(vibe)) { p.style_vibes.push(vibe); changed = true; }
      });
    }

    // Track closet item if AI references a product the user liked
    const productMatch = responseText.match(/[""]([^""]+)[""]/g);
    if (productMatch && positiveReply) {
      try {
        const closet = JSON.parse(localStorage.getItem(MN_CLOSET_KEY) || '[]');
        productMatch.forEach(match => {
          const name = match.replace(/[""]/g, '').trim();
          if (name.length > 3 && !closet.some(c => c.name === name)) {
            closet.push({ name, ghost: true, emoji: 'ðŸ’¬', added_at: new Date().toISOString(), source: 'chatbot' });
            changed = true;
          }
        });
        if (changed) localStorage.setItem(MN_CLOSET_KEY, JSON.stringify(closet));
      } catch(e) {}
    }

    if (changed) saveProfile(p);
  }

  // â”€â”€ Inject profile as system context into chatbot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Called when chatbot is initialized or profile updates
  function mnBuildSystemContext() {
    const p = getProfile();
    const parts = [];
    if (p.gender)        parts.push('Gender: ' + p.gender);
    if (p.height_cm)     parts.push('Height: ' + p.height_cm + 'cm');
    if (p.skin_label)    parts.push('Skin Tone: MST-' + (p.skin_mst||'?') + ' (' + p.skin_label + ')');
    if (p.preferred_fit) parts.push('Preferred Fit: ' + p.preferred_fit);
    if (p.hair_style)    parts.push('Hair Style: ' + p.hair_style);
    if (Array.isArray(p.occasions) && p.occasions.length) parts.push('Go-to Places: ' + p.occasions.join(', '));
    if (p.price_min && p.price_max) parts.push('Budget: â‚¹' + p.price_min.toLocaleString('en-IN') + 'â€“â‚¹' + p.price_max.toLocaleString('en-IN'));
    if (Array.isArray(p.style_vibes) && p.style_vibes.length) parts.push('Style Preferences: ' + p.style_vibes.join(', '));
    if (Array.isArray(p.interests) && p.interests.length) parts.push('Interests: ' + p.interests.join(', '));
    if (Array.isArray(p.bank_cards) && p.bank_cards.length) parts.push('Bank Cards: ' + p.bank_cards.map(c => c.bank + ' ' + c.variant).join(', '));
    if (p.weather && p.weather.city) parts.push('Location: ' + p.weather.city + (p.weather.temp ? ', ' + Math.round(p.weather.temp) + 'Â°C' : ''));

    // AI biometrics (if available from Magic Upload)
    if (p.ai_metrics && Object.keys(p.ai_metrics).length) {
      const am = p.ai_metrics;
      if (am.ai_silhouette_volume)    parts.push('Body Silhouette: ' + am.ai_silhouette_volume);
      if (am.ai_undertone_temp)       parts.push('Colour Undertone: ' + am.ai_undertone_temp);
      if (am.ai_formality_baseline)   parts.push('Formality Baseline: ' + am.ai_formality_baseline);
      if (am.ai_trend_adoption_rate)  parts.push('Trend Adoption: ' + am.ai_trend_adoption_rate);
    }

    const closet = JSON.parse(localStorage.getItem(MN_CLOSET_KEY) || '[]');
    if (closet.length) parts.push('Closet Items: ' + closet.length + ' items including ' + closet.slice(0,3).map(i => i.name).join(', '));

    return parts.length ? '\n\n[USER PROFILE]\n' + parts.join('\n') + '\n[/USER PROFILE]\n' : '';
  }

  // â”€â”€ Hook into existing chatbot send mechanism â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Intercept the message send so we can extract profile data
  function mnPatchChatbot() {
    // Wait for chatbot to initialize, then patch its send function
    let attempts = 0;
    const patchInterval = setInterval(() => {
      attempts++;
      if (attempts > 30) { clearInterval(patchInterval); return; }

      // Patch the send button
      const sendBtn = document.getElementById('mn-send-btn') ||
                      document.querySelector('[id*="send"]') ||
                      document.querySelector('.mn-send-btn, .mnw-send-btn');
      const inputEl = document.getElementById('mn-user-input') ||
                      document.getElementById('mnw-user-input') ||
                      document.querySelector('.mn-user-input, .mnw-user-input');

      if (sendBtn && inputEl && !sendBtn._mnPatched) {
        sendBtn._mnPatched = true;

        // Intercept clicks
        sendBtn.addEventListener('click', function() {
          const userMsg = (inputEl.value || inputEl.textContent || '').trim();
          if (userMsg) mnExtractFromMessage(userMsg);
        }, true); // capture phase â€” fires before the chatbot's own handler

        // Also intercept Enter key
        inputEl.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            const userMsg = (this.value || this.textContent || '').trim();
            if (userMsg) mnExtractFromMessage(userMsg);
          }
        }, true);

        clearInterval(patchInterval);
      }
    }, 500);
  }

  // â”€â”€ Listen for profile updates to inject into chatbot context
  window.addEventListener('mn-identity-updated', function(e) {
    // Update chatbot system context variable if it exists globally
    const ctx = mnBuildSystemContext();
    if (typeof window.mnChatbotSystemContext !== 'undefined') {
      window.mnChatbotSystemContext = ctx;
    }
    // Also store for next chatbot session init
    try { sessionStorage.setItem('mn_chatbot_context', ctx); } catch(e) {}
  });

  // â”€â”€ Expose public API for the chatbot to call â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  window.MNDashboardSync = {
    // Call this with user's message text before sending to AI
    onUserMessage: function(msg) { mnExtractFromMessage(msg); },
    // Call this with AI response + user's reply to it
    onAIResponse:  function(aiText, userReply) { mnExtractFromAIResponse(aiText, userReply); },
    // Call this to get system context string to prepend to AI prompt
    getSystemContext: function() { return mnBuildSystemContext(); },
    // Call this to push arbitrary key-values into the dashboard
    pushData: function(data) { window.dispatchEvent(new CustomEvent('mn-chatbot-save', { detail: data })); },
    // Get full profile
    getProfile: function() { return getProfile(); }
  };

  // â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  document.addEventListener('DOMContentLoaded', function() {
    mnPatchChatbot();
    // Fire initial context build so chatbot has profile from page load
    window.dispatchEvent(new CustomEvent('mn-identity-updated', { detail: getProfile() }));
  });

  console.log('[MN Dashboard Sync] Chatbot â†” Dashboard bridge initialized.');

})();

