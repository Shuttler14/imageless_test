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
 *   Step 5A — FLUX-generated look (simulated)
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

  const API_URL = window.MN_CONFIG?.apiUrl || 'https://mynarrative-ai.vercel.app/api/stylist_pipeline';

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
    profileCompletion: 60,
    // Gift mode
    giftMode: false,
    // Scanning
    scanVisibleItems: 0,
  };

  // ── DATA: AESTHETICS (50/50 Men/Women) ────────────────────────────────
  // 4 Men (_m) + 4 Women (_f) — 8 distinct styles as per brief
  const AESTHETICS = [
  // DATA: AESTHETICS (50/50 Men/Women)
  // 8 Men (_m) + 8 Women (_f) — 16 total styles
  const AESTHETICS = [
    // MEN (8)
    { id: 'old_money_m',    style: 'Old Money',           name: 'The Heritage Edit',    gender: 'M', accent: '#a8916e', img: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=533&fit=crop&crop=top' },
    { id: 'street_m',       style: 'Street Style',        name: 'Urban Architect',      gender: 'M', accent: '#f59e0b', img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=533&fit=crop&crop=top' },
    { id: 'indo_western_m', style: 'Indo-Western Fusion', name: 'Desi Modernist',       gender: 'M', accent: '#ef4444', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=533&fit=crop&crop=top' },
    { id: 'corporate_m',    style: 'Corporate Core',      name: 'Power Suit Era',       gender: 'M', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&fit=crop&crop=top' },
    { id: 'athleisure_m',   style: 'Athleisure',          name: 'Functional Minimal',   gender: 'M', accent: '#22c55e', img: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&h=533&fit=crop&crop=top' },
    { id: 'denimcore_m',    style: 'Denimcore',           name: 'Indigo Standard',      gender: 'M', accent: '#60a5fa', img: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&h=533&fit=crop&crop=top' },
    { id: 'resort_m',       style: 'Resort Casual',       name: 'Coastal Light',        gender: 'M', accent: '#fbbf24', img: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?w=400&h=533&fit=crop&crop=top' },
    { id: 'techwear_m',     style: 'Techwear',            name: 'Utility Future',       gender: 'M', accent: '#94a3b8', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=533&fit=crop&crop=top' },

    // WOMEN (8)
    { id: 'minimalist_f',   style: 'Minimalist',          name: 'The Edit',             gender: 'F', accent: '#e4e4e4', img: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=533&fit=crop&crop=top' },
    { id: 'y2k_f',          style: 'Y2K Chrome',          name: 'Millennial Glitch',    gender: 'F', accent: '#c0c0c0', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=533&fit=crop&crop=top' },
    { id: 'cyberpunk_f',    style: 'Cyberpunk',           name: 'Neon Manifesto',       gender: 'F', accent: '#00ff87', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=533&fit=crop&crop=top' },
    { id: 'casual_f',       style: 'Casual Essentials',   name: 'The Daily Uniform',    gender: 'F', accent: '#fb923c', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=533&fit=crop&crop=top' },
    { id: 'quietlux_f',     style: 'Quiet Luxury',        name: 'Soft Power',           gender: 'F', accent: '#a3a3a3', img: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&h=533&fit=crop&crop=top' },
    { id: 'coquette_f',     style: 'Coquette',            name: 'Sugar & Satin',        gender: 'F', accent: '#f472b6', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=533&fit=crop&crop=top' },
    { id: 'boho_f',         style: 'Boho',                name: 'Free Stitch',          gender: 'F', accent: '#f59e0b', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=533&fit=crop&crop=top' },
    { id: 'power_suit_f',   style: 'Power Suit',          name: 'Boardroom Royale',     gender: 'F', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&h=533&fit=crop&crop=top' },
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
    default: { item: 'White Chunky Sneakers', brand: 'Nike',   platform: 'Myntra',
      price: 8999, original: 12999, off: 31,
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop',
      url: 'https://www.myntra.com/nike-chunky-sneakers?aff=mynarrative',
      offer: 'No card offer. Flat ₹200 off on Myntra Pay.' },
    HDFC: { item: 'White Chunky Sneakers',   brand: 'Nike',   platform: 'Myntra',
      price: 8499, original: 12999, off: 35,
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop',
      url: 'https://www.myntra.com/nike-chunky-sneakers?aff=mynarrative&bank=hdfc',
      offer: '🏦 Save ₹500 extra with HDFC Credit Card. Code: HDFC500' },
    SBI:  { item: 'White Chunky Sneakers',   brand: 'Adidas', platform: 'Amazon',
      price: 7999, original: 11999, off: 33,
      img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=250&fit=crop',
      url: 'https://www.amazon.in/adidas-chunky-sneakers?tag=mynarrative-21',
      offer: '🏦 10% cashback with SBI SimplyCLICK card. Max ₹1500.' },
    ICICI:{ item: 'White Platform Sneakers', brand: 'Puma',   platform: 'Myntra',
      price: 6999, original: 9999, off: 30,
      img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=250&fit=crop',
      url: 'https://www.myntra.com/puma-platform?aff=mynarrative&bank=icici',
      offer: '🏦 5% cashback with ICICI Amazon Pay card. No min spend.' },
  };

  // ── UTILITIES ──────────────────────────────────────────────────────────
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const INR = (n)  => '₹' + n.toLocaleString('en-IN');

  const setContent = (html) => {
    const c = $('#mn-content-container');
    if (c) c.innerHTML = html;
    updateProgress();
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
  };
})();

// ═══════════════════════════════════════════════════════════
// STEP RENDERERS
// ═══════════════════════════════════════════════════════════
const { state, AESTHETICS, OCCASIONS, MOCK_WARDROBE, AFFILIATE_RECS, $, $$, INR, setContent, updateProgress, getGeneratedImg } = MNAIStylist;

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
        <p class="mnw-hook-sub" style="margin-bottom:32px">Choose your style universe — we'll show the right looks.</p>
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
        <span class="mnw-dot"></span><span class="mnw-dot"></span><span class="mnw-dot"></span>
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
    if (state.gender) renderStep1();
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
        <p class="mnw-hook-sub">Step into your main character energy today.</p>
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
        <p class="mnw-step-num">02 / 05</p>
        <h2 class="mnw-step-title">What kind of energy are we projecting?</h2>
        <p class="mnw-step-sub">Choose your favorites — pick as many as feel right.</p>
      </div>
      <div class="mnw-aesthetic-grid" id="mnw-aesthetic-grid">
        ${(() => {
          const visibleAesthetics = state.gender ? AESTHETICS.filter(a => state.gender === 'men' ? a.gender === 'M' : a.gender === 'F') : AESTHETICS;
          return visibleAesthetics.map(a => `
          <button class="mnw-aesthetic-card" data-id="${a.id}" aria-label="${a.style}">
            <img class="mnw-aesthetic-img" src="${a.img}" alt="${a.name}"
                 onerror="this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=533&fit=crop'"/>
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
        <p class="mnw-step-num">03 / 05</p>
        <h2 class="mnw-step-title">Where are we taking this look?</h2>
        <p class="mnw-step-sub">Select all that apply to your lifestyle.</p>
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
  $('#mnw-s3-next').addEventListener('click', renderStep4);
}

// ── STEP 4: CANVAS / SELFIE UPLOAD ───────────────────────
function renderStep4() {
  state.step = 4;
  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <p class="mnw-step-num">04 / 05</p>
        <h2 class="mnw-step-title">Let's see the canvas.</h2>
        <p class="mnw-step-sub">Upload a quick selfie to ensure the fit and colors perfectly match your unique skin tone and proportions.</p>
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
  $('#mnw-s4-back').addEventListener('click', renderStep3);
  if (next) next.addEventListener('click', renderStep5A);
}

// ── STEP 5A: FLUX-GENERATED LOOK (simulated) ─────────────
function renderStep5A() {
  state.step = 5; state.step5State = 'A';
  const selectedLabels = state.selectedAesthetics.map(id => AESTHETICS.find(a => a.id === id)?.style || id).join(' / ');

  // Map aesthetic -> vibe_id for Vercel pipeline
  const vibeMap = {
    old_money_m:'quiet_luxury', street_m:'sarcastic_rizzler',
    indo_western_m:'main_character', corporate_m:'caffeine_survivor',
    minimalist_f:'quiet_luxury', y2k_f:'sarcastic_rizzler',
    cyberpunk_f:'main_character', casual_f:'caffeine_survivor',
  };
  const vibeId = vibeMap[state.selectedAesthetics[0]] || 'caffeine_survivor';

  // Map occasion -> occasion_id for Vercel pipeline
  const occMap = {
    office:'office', date:'date_night', sangeet:'sangeet',
    airport:'airport_look', gym:'date_night', college:'office',
    pooja:'sangeet', casual:'date_night',
  };
  const occasionId = occMap[state.selectedOccasions[0]] || 'date_night';

  setContent(`
    <div class="mnw-step">
      <div class="mnw-step-hdr">
        <p class="mnw-step-num">05 / 05</p>
        <h2 class="mnw-step-title">Generating your main character look</h2>
        <p class="mnw-step-sub">AI is crafting a look for your skin tone, body type &amp; vibe.</p>
      </div>
      <div class="mnw-result-wrap" id="mnw-result-wrap">
        <div id="mnw-loading-state" style="height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(255,255,255,0.03);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
          <div style="width:40px;height:40px;border:3px solid rgba(57,165,150,0.2);border-top-color:#39A596;border-radius:50%;animation:mnw-spin 0.8s linear infinite"></div>
          <p id="mnw-loading-text" style="font-size:13px;color:rgba(255,255,255,0.5);text-align:center;max-width:220px">Reading your style DNA...</p>
        </div>
        <img class="mnw-result-img" id="mnw-result-img" alt="AI Generated Look" style="display:none"/>
        <span class="mnw-result-badge" id="mnw-result-badge" style="display:none">AI Generated</span>
      </div>
      <div class="mnw-dopamine-box" id="mnw-result-info" style="display:none">
        <p style="font-size:10px;font-weight:800;color:#39A596;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px">Based on: ${selectedLabels || 'Your Aesthetic'}</p>
        <p class="mnw-dopamine-title" id="mnw-result-title">Your look is ready.</p>
        <p class="mnw-dopamine-sub">Want to style this with clothes you already own?</p>
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

  // Rotating loading messages
  const msgs = ['Reading your style DNA...','Analysing skin tone & body type...','Matching your vibe...','FLUX is painting your outfit...','Final touches...'];
  let mi = 0;
  const msgInt = setInterval(() => { const el = $('#mnw-loading-text'); if (el && msgs[++mi]) el.textContent = msgs[mi]; }, 4000);

  const rawBase64 = state.selfieBase64 ? state.selfieBase64.replace(/^data:image\/\w+;base64,/, '') : null;
  if (!rawBase64) {
    clearInterval(msgInt);
    const e = $('#mnw-api-error'); if (e) { e.style.display='block'; e.textContent='No photo found. Please go back and upload your selfie.'; }
    const ls = $('#mnw-loading-state'); if (ls) ls.style.display='none';
    return;
  }

  const userId = (window.MN_CONFIG && window.MN_CONFIG.customerId) ? String(window.MN_CONFIG.customerId) : 'guest_' + Math.random().toString(36).slice(2,9);

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action:'full_pipeline', user_id:userId, occasion:occasionId, vibe_id:vibeId, user_image:rawBase64 }),
  })
  .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error || ('Server error ' + r.status))))
  .then(data => {
    clearInterval(msgInt);
    if (!data.success) throw new Error(data.error || 'Pipeline failed');
    state.pipelineResult = data;
    state.affiliateRecs = data.affiliate_upsells || [];

    const imgUrl = (data.editorial && data.editorial.final_image_url) ||
                   (data.final_image_base64 ? 'data:image/jpeg;base64,' + data.final_image_base64 : null);

    const ls = $('#mnw-loading-state'), imgEl = $('#mnw-result-img'), badge = $('#mnw-result-badge');
    const info = $('#mnw-result-info'), ub = $('#mnw-upload-wardrobe'), title = $('#mnw-result-title');

    if (imgUrl && imgEl) {
      imgEl.src = imgUrl;
      imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=480&h=640&fit=crop'; };
      imgEl.onload = () => {
        if (ls) ls.style.display = 'none';
        imgEl.style.display = 'block';
        if (badge) badge.style.display = 'block';
        if (info) info.style.display = 'block';
        if (ub) ub.style.display = 'flex';
        if (title && data.biometrics) {
          const bt = data.biometrics.body_type || 'your build';
          const vl = (data.editorial && data.editorial.vibe && data.editorial.vibe.label) || selectedLabels || 'your vibe';
          title.textContent = 'This is your ' + bt + ' in ' + vl + ' energy.';
        }
      };
    } else {
      if (ls) ls.style.display = 'none';
      if (info) info.style.display = 'block';
      if (ub) ub.style.display = 'flex';
    }
  })
  .catch(err => {
    clearInterval(msgInt);
    console.error('[MN] Pipeline error:', err);
    const ls = $('#mnw-loading-state'), errEl = $('#mnw-api-error');
    if (ls) ls.style.display = 'none';
    if (errEl) { errEl.style.display='block'; errEl.innerHTML='Something went wrong: ' + err + '. <button onclick="renderStep5A()" style="color:#39A596;background:none;border:none;cursor:pointer;font-weight:700">Retry</button>'; }
  });

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
// ── STEP 5B: SCANNING ANIMATION ──────────────────────────
function renderStep5B() {
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
      <a href="${rec.url}" target="_blank" rel="noopener noreferrer" class="mnw-aff-cta">
        Shop on ${rec.platform} ↗
      </a>
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
  const fill = document.querySelector('.mnw-ring-fill');
  const label = document.getElementById('mnw-ring-pct');
  if (fill) fill.style.strokeDashoffset = Math.round(113 - (pct / 100) * 113);
  if (label) label.textContent = pct + '%';
}

// ── WIDGET EXPAND / COLLAPSE ──────────────────────────────
function expandWidget() {
  state.isExpanded = true;
  const expanded  = document.getElementById('mn-widget-expanded');
  const minimized = document.getElementById('mn-widget-minimized');
  if (expanded)  { expanded.style.display = 'flex'; expanded.removeAttribute('aria-hidden'); }
  if (minimized) minimized.style.display = 'none';
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

  if (ringBtn && modal) {
    ringBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
    if (modalClose) modalClose.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
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

  if (closetChip && closetDrawer) {
    closetChip.addEventListener('click', () => { closetDrawer.style.display = 'flex'; });
    if (drawerClose) drawerClose.addEventListener('click', () => { closetDrawer.style.display = 'none'; });
    closetDrawer.addEventListener('click', (e) => { if (e.target === closetDrawer) closetDrawer.style.display = 'none'; });
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
  });
  const exitGift = document.getElementById('mnw-exit-gift');
  if (exitGift) exitGift.addEventListener('click', () => {
    state.giftMode = false;
    const banner = document.getElementById('mnw-gift-banner');
    if (banner) banner.style.display = 'none';
  });
}

// ── INIT ──────────────────────────────────────────────────
function initWidget() {
  const minimized = document.getElementById('mn-widget-minimized');
  const closeBtn  = document.getElementById('mn-close-btn');

  if (minimized) minimized.addEventListener('click', expandWidget);
  if (closeBtn)  closeBtn.addEventListener('click', collapseWidget);

  initPersistentNav();
  updateRing(state.profileCompletion);

  // Auto-open after 3s on first visit
  if (!sessionStorage.getItem('mn_widget_seen')) {
    setTimeout(() => { expandWidget(); sessionStorage.setItem('mn_widget_seen', '1'); }, 3000);
  } else {
    if (minimized) minimized.style.display = 'flex';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}
