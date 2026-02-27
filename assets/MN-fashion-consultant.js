/**
 * ═══════════════════════════════════════════════════════════
 * MY NARRATIVE — ZERO-FRICTION AI STYLIST WIDGET v2.0
 * ═══════════════════════════════════════════════════════════
 *
 * NEW 5-STEP FLOW (replaces old calibration/gift flow):
 *   Step 1A — Occasion Selector  ("Where are we heading?")
 *   Step 1B — Vibe Check         (Tinder-style swipeable cards)
 *   Step 2  — Magic Image Upload (Drag & drop full-outfit photo)
 *   Step 3  — Dopamine Loading   (Animated AI processing theater)
 *   Step 4  — Vibe Card Result   (Editorial image + MST tooltip + Affiliate upsell)
 *   Step 5  — Gamified Hooks     (Mascot Quest + Style Graph OOTD trainer)
 *
 * ANTI-HALLUCINATION GUARDRAILS:
 *   ✅ No recommendation algorithm — just state management + API calls
 *   ✅ All AI processing delegated to /api/stylist_pipeline
 *   ✅ Affiliate data served from backend mock (no real-time scraping)
 *
 * API ENDPOINT: window.MN_CONFIG.apiUrl (set in MN-fashion-consultant.liquid)
 * ═══════════════════════════════════════════════════════════
 */

const MNAIStylist = (() => {

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════

  const API_URL = window.MN_CONFIG?.apiUrl || 'https://mynarrative-ai.vercel.app/api/stylist_pipeline';

  // ═══════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Single source of truth for the entire 5-step flow.
   * Reset completely on retry.
   */
  const state = {
    isExpanded: false,      // Widget bubble visibility
    step: '1A',             // '1A' | '1B' | '2' | '3' | '4' | '5'
    occasion: null,         // Step 1A selected occasion id
    occasionLabel: null,    // Human-readable label
    vibeId: null,           // Step 1B selected vibe id
    vibeLabel: null,        // Human-readable vibe label
    vibeIndex: 0,           // Current vibe card index for swiper
    userImageBase64: null,  // Step 2 uploaded image (base64)
    isDragging: false,      // Drag state for upload zone
    pipelineResult: null,   // Step 3 API response
    isLoading: false,       // API call in-flight flag
    error: null,            // Error message string
    mstTooltipOpen: false,  // Step 4 MST tooltip toggle
    gamificationOpen: false // Step 5 modal toggle
  };

  // ═══════════════════════════════════════════════════════════
  // DATA: OCCASIONS (Step 1A)
  // ═══════════════════════════════════════════════════════════

  const OCCASIONS = [
    { id: 'date_night',   label: 'Date Night',   emoji: '🌙', description: 'Romantic vibes, elevated style',          gradient: 'from-rose-600 to-purple-700' },
    { id: 'office',       label: 'Office',       emoji: '💼', description: 'Sharp, smart, ready to lead',            gradient: 'from-slate-600 to-indigo-800' },
    { id: 'sangeet',      label: 'Sangeet',      emoji: '💃', description: 'Festive, bold, unapologetically desi',   gradient: 'from-amber-500 to-red-700'   },
    { id: 'airport_look', label: 'Airport Look', emoji: '✈️', description: 'Comfort that still serves looks',        gradient: 'from-cyan-500 to-emerald-700' },
  ];

  // ═══════════════════════════════════════════════════════════
  // DATA: VIBE CARDS (Step 1B — Tinder swiper)
  // ═══════════════════════════════════════════════════════════

  const VIBE_CARDS = [
    { id: 'caffeine_survivor', label: 'Surviving on Caffeine', emoji: '☕', tagline: 'Too tired to care, too stylish to ignore',  persona: 'Effortlessly unbothered', bg: '#3d2a00', accent: '#f59e0b' },
    { id: 'sarcastic_rizzler', label: 'The Sarcastic Rizzler', emoji: '😏', tagline: 'Your outfit speaks before you do',          persona: 'Sharp-witted trendsetter', bg: '#1e0038', accent: '#a855f7' },
    { id: 'main_character',    label: 'Main Character Energy', emoji: '✨', tagline: 'The spotlight was built for you',            persona: 'Protagonist of every scene', bg: '#3d0018', accent: '#ec4899' },
    { id: 'quiet_luxury',      label: 'Quiet Luxury',          emoji: '🤫', tagline: 'If you know, you know',                    persona: 'Old-money minimalist',     bg: '#1a1a1a', accent: '#a8a29e' },
  ];

  // ═══════════════════════════════════════════════════════════
  // DATA: LOADING MESSAGES (Step 3 — Dopamine theater)
  // ═══════════════════════════════════════════════════════════

  const LOADING_MESSAGES = [
    { text: 'Analyzing Skin Tone…',          emoji: '🎨', delay: 0   },
    { text: 'Mapping Your Wardrobe…',        emoji: '👔', delay: 1.8 },
    { text: 'Detecting Body Proportions…',   emoji: '📐', delay: 3.6 },
    { text: 'Matching Colour Theory…',       emoji: '🌈', delay: 5.4 },
    { text: 'Generating Editorial Look…',    emoji: '📸', delay: 7.2 },
    { text: 'Applying Your Identity…',       emoji: '🪄', delay: 9.0 },
    { text: 'Almost there…',                 emoji: '✨', delay: 11  },
  ];

  // ═══════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const el = (tag, attrs, ...children) => {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') e.className = v;
      else if (k === 'onClick') e.addEventListener('click', v);
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else e.setAttribute(k, v);
    });
    children.forEach(c => c && e.append(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  };

  const setContent = (html) => {
    const container = $('#mn-content-container');
    if (container) container.innerHTML = html;
    updateProgress();
  };

  const updateProgress = () => {
    const steps = { '1A': 10, '1B': 25, '2': 45, '3': 70, '4': 90, '5': 100 };
    const fill = $('.mn-progress-fill');
    if (fill) fill.style.width = (steps[state.step] || 10) + '%';
  };

  const formatINR = (n) => '₹' + n.toLocaleString('en-IN');

  // ═══════════════════════════════════════════════════════════
  // RENDER: STEP 1A — Occasion Selector ("Where are we heading?")
  // ═══════════════════════════════════════════════════════════

  const renderStep1A = () => {
    state.step = '1A';
    setContent(`
      <div class="mn-step mn-step-1a">
        <div class="mn-step-header">
          <p class="mn-step-label">Step 1 of 5</p>
          <h2 class="mn-step-title">Where are we heading?</h2>
          <p class="mn-step-subtitle">Pick the scene. We'll style the look.</p>
        </div>
        <div class="mn-occasion-grid">
          ${OCCASIONS.map(occ => `
            <button class="mn-occasion-card" data-occasion="${occ.id}" data-label="${occ.label}">
              <span class="mn-occasion-emoji">${occ.emoji}</span>
              <span class="mn-occasion-label">${occ.label}</span>
              <span class="mn-occasion-desc">${occ.description}</span>
            </button>
          `).join('')}
        </div>
        <div class="mn-step-dots">
          <span class="mn-dot mn-dot-active"></span>
          <span class="mn-dot"></span><span class="mn-dot"></span>
          <span class="mn-dot"></span><span class="mn-dot"></span>
        </div>
      </div>
    `);

    document.querySelectorAll('.mn-occasion-card').forEach(btn => {
      btn.addEventListener('click', () => {
        state.occasion = btn.dataset.occasion;
        state.occasionLabel = btn.dataset.label;
        renderStep1B();
      });
    });
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER: STEP 1B — Vibe Check (Tinder swiper)
  // ═══════════════════════════════════════════════════════════

  const renderStep1B = () => {
    state.step = '1B';
    const vibe = VIBE_CARDS[state.vibeIndex];
    const isLast = state.vibeIndex >= VIBE_CARDS.length - 1;
    setContent(`
      <div class="mn-step mn-step-1b">
        <div class="mn-step-header">
          <p class="mn-step-label mn-label-purple">Vibe Check</p>
          <h2 class="mn-step-title">What's the energy today?</h2>
          <p class="mn-step-subtitle">Swipe right to pick → or left to skip</p>
        </div>
        <div class="mn-vibe-stack">
          <div class="mn-vibe-card" id="mn-active-vibe" style="background:${vibe.bg};border-color:${vibe.accent}33">
            <div class="mn-vibe-glow" style="background:${vibe.accent}22"></div>
            <span class="mn-vibe-emoji">${vibe.emoji}</span>
            <h3 class="mn-vibe-name">${vibe.label}</h3>
            <p class="mn-vibe-tagline">"${vibe.tagline}"</p>
            <span class="mn-vibe-persona">${vibe.persona}</span>
            <div class="mn-swipe-hints">
              <span class="mn-hint-left">← Skip</span>
              <span class="mn-hint-right" style="color:${vibe.accent}">Choose →</span>
            </div>
          </div>
          <p class="mn-vibe-counter">${state.vibeIndex + 1} / ${VIBE_CARDS.length}</p>
        </div>
        <div class="mn-vibe-actions">
          <button class="mn-btn-skip" id="mn-skip-vibe" ${isLast ? 'disabled' : ''}>✕ Skip</button>
          <button class="mn-btn-select" id="mn-select-vibe" style="background:${vibe.accent}">♥ This is me</button>
        </div>
        <div class="mn-step-dots">
          <span class="mn-dot mn-dot-done"></span>
          <span class="mn-dot mn-dot-active"></span>
          <span class="mn-dot"></span><span class="mn-dot"></span><span class="mn-dot"></span>
        </div>
      </div>
    `);

    $('#mn-select-vibe').addEventListener('click', () => {
      state.vibeId = vibe.id;
      state.vibeLabel = vibe.label;
      renderStep2();
    });
    $('#mn-skip-vibe').addEventListener('click', () => {
      if (!isLast) { state.vibeIndex++; renderStep1B(); }
    });

    // Touch/drag swipe support
    let startX = 0;
    const card = $('#mn-active-vibe');
    card.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    card.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > 80) { state.vibeId = vibe.id; state.vibeLabel = vibe.label; renderStep2(); }
      else if (dx < -80 && !isLast) { state.vibeIndex++; renderStep1B(); }
    });
    card.addEventListener('mousedown', e => { startX = e.clientX; });
    card.addEventListener('mouseup', e => {
      const dx = e.clientX - startX;
      if (dx > 80) { state.vibeId = vibe.id; state.vibeLabel = vibe.label; renderStep2(); }
      else if (dx < -80 && !isLast) { state.vibeIndex++; renderStep1B(); }
    });
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER: STEP 2 — Magic Image Upload
  // ═══════════════════════════════════════════════════════════

  const renderStep2 = () => {
    state.step = '2';
    const occasionEmoji = OCCASIONS.find(o => o.id === state.occasion)?.emoji || '';
    setContent(`
      <div class="mn-step mn-step-2">
        <div class="mn-recap-bar">
          <span>${occasionEmoji} ${state.occasionLabel}</span>
          <span class="mn-recap-arrow">→</span>
          <span class="mn-recap-vibe">${VIBE_CARDS.find(v=>v.id===state.vibeId)?.emoji} ${state.vibeLabel}</span>
        </div>
        <div class="mn-step-header">
          <h2 class="mn-step-title">Now, the magic photo ✨</h2>
          <p class="mn-step-subtitle">Upload a recent photo of yourself in a full outfit.<br>We'll extract your fit and generate your editorial look.</p>
        </div>
        <div class="mn-upload-zone" id="mn-upload-zone">
          <div class="mn-upload-glow"></div>
          <div class="mn-upload-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
          </div>
          <p class="mn-upload-main">Drop your photo here</p>
          <p class="mn-upload-sub">or click to browse · Full outfit photo works best</p>
          <p class="mn-upload-hint">JPG, PNG, WebP · Max 10MB</p>
          <input type="file" id="mn-file-input" accept="image/jpeg,image/png,image/webp" style="display:none">
        </div>
        ${state.error ? `<p class="mn-error">⚠ ${state.error}</p>` : ''}
        <div class="mn-step-dots">
          <span class="mn-dot mn-dot-done"></span><span class="mn-dot mn-dot-done"></span>
          <span class="mn-dot mn-dot-active"></span>
          <span class="mn-dot"></span><span class="mn-dot"></span>
        </div>
      </div>
    `);

    const zone = $('#mn-upload-zone');
    const fileInput = $('#mn-file-input');

    zone.addEventListener('click', () => fileInput.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('mn-dragging'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('mn-dragging'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('mn-dragging');
      if (e.dataTransfer.files[0]) processImage(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) processImage(fileInput.files[0]);
    });
  };

  const processImage = (file) => {
    if (!file.type.startsWith('image/')) { state.error = 'Please upload an image file.'; renderStep2(); return; }
    if (file.size > 10 * 1024 * 1024) { state.error = 'Image too large. Max 10MB.'; renderStep2(); return; }
    state.error = null;
    const reader = new FileReader();
    reader.onload = () => {
      state.userImageBase64 = reader.result;
      runPipeline();
    };
    reader.onerror = () => { state.error = 'Failed to read image. Please try again.'; renderStep2(); };
    reader.readAsDataURL(file);
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER: STEP 3 — Dopamine Loading Screen
  // ═══════════════════════════════════════════════════════════

  const renderStep3 = () => {
    state.step = '3';
    setContent(`
      <div class="mn-step mn-step-3">
        <div class="mn-loading-orb">
          <div class="mn-orb-glow"></div>
          <div class="mn-orb-inner">🪄</div>
        </div>
        <div class="mn-loading-messages" id="mn-loading-msgs">
          ${LOADING_MESSAGES.map((msg, i) => `
            <div class="mn-loading-row" style="animation-delay:${msg.delay}s" id="mn-msg-${i}">
              <span class="mn-loading-emoji">${msg.emoji}</span>
              <span class="mn-loading-text">${msg.text}</span>
              <div class="mn-loading-bar"><div class="mn-loading-bar-fill" style="animation-delay:${msg.delay + 0.3}s"></div></div>
            </div>
          `).join('')}
        </div>
        <div class="mn-overall-bar"><div class="mn-overall-fill"></div></div>
      </div>
    `);
    updateProgress();
  };

  // ═══════════════════════════════════════════════════════════
  // API: Run Full Pipeline (Step 2 → Step 3 → Step 4)
  // ═══════════════════════════════════════════════════════════

  const runPipeline = async () => {
    renderStep3();
    state.isLoading = true;
    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'full_pipeline',
          user_id: 'guest_' + Date.now(),
          occasion: state.occasion,
          vibe_id: state.vibeId,
          user_image: state.userImageBase64,
        }),
      });
      if (!resp.ok) throw new Error('Server error ' + resp.status);
      const data = await resp.json();
      if (!data.success) throw new Error(data.error || 'Pipeline failed');
      state.pipelineResult = data;
      renderStep4();
    } catch (err) {
      console.error('[MN Stylist] Pipeline error:', err);
      state.error = err.message || 'Something went wrong. Please try again.';
      renderStep2();
    } finally {
      state.isLoading = false;
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER: STEP 4 — Vibe Card Result + Affiliate Upsell
  // ═══════════════════════════════════════════════════════════

  const renderStep4 = () => {
    state.step = '4';
    const r = state.pipelineResult;
    const { biometrics, wardrobe, editorial, color_theory, affiliate_upsells, outfit_completion_pct, gamification } = r;

    const wardrobeHTML = (wardrobe.items || []).map(item => `
      <div class="mn-outfit-row mn-outfit-owned">
        <span class="mn-outfit-check">✓</span>
        <div class="mn-outfit-info">
          <p class="mn-outfit-cat">${item.slot}</p>
          <p class="mn-outfit-name">${item.sub_category} · ${item.color}</p>
        </div>
        <span class="mn-in-closet-badge">In Closet</span>
      </div>
    `).join('');

    const upsellHTML = (affiliate_upsells || []).map(u => `
      <div class="mn-upsell-card">
        <div class="mn-upsell-gap-bar">
          <span class="mn-gap-dot"></span>
          <span>Missing from your closet</span>
        </div>
        <div class="mn-upsell-body">
          <div class="mn-upsell-info">
            <p class="mn-upsell-name">${u.product_name}</p>
            <p class="mn-upsell-brand">${u.brand}</p>
            <div class="mn-upsell-price">
              <span class="mn-price-now">₹${u.price.toLocaleString('en-IN')}</span>
              <span class="mn-price-was">₹${u.original_price.toLocaleString('en-IN')}</span>
              <span class="mn-price-off">${u.discount_pct}% OFF</span>
            </div>
          </div>
        </div>
        <div class="mn-upsell-completion">⚡ Your look is ${outfit_completion_pct}% complete. Buy these to hit 100%.</div>
        <div class="mn-bank-offer">🏦 ${u.bank_offer}</div>
        <a href="${u.affiliate_url}" target="_blank" rel="noopener noreferrer" class="mn-upsell-cta">Shop on ${u.platform} ↗</a>
      </div>
    `).join('');

    const mstColors = (color_theory.best_colors || []).map(c => `<span class="mn-color-pill mn-color-good">${c}</span>`).join('');
    const avoidColors = (color_theory.avoid_colors || []).map(c => `<span class="mn-color-pill mn-color-avoid">${c}</span>`).join('');

    setContent(`
      <div class="mn-step mn-step-4">
        <div class="mn-result-header">
          <p class="mn-step-label">Your Editorial Look</p>
          <h2 class="mn-step-title">${state.vibeLabel}</h2>
          <p class="mn-step-subtitle">${state.occasionLabel} · crafted for your tone & build</p>
        </div>

        <div class="mn-result-image-wrap">
          <img src="${editorial.final_image_url}" alt="AI Editorial Look" class="mn-result-image" />
          <div class="mn-result-overlay">
            <span class="mn-result-vibe-badge">${state.vibeLabel}</span>
            <button class="mn-mst-badge" id="mn-mst-toggle">MST ${color_theory.mst_value} · Why this works ↗</button>
          </div>
        </div>

        <div class="mn-mst-tooltip" id="mn-mst-tooltip" style="display:none">
          <p class="mn-tooltip-title">🎨 Colour Theory · Monk Skin Tone ${color_theory.mst_value}</p>
          <p class="mn-tooltip-body">${color_theory.tooltip_text}</p>
          <p class="mn-tooltip-label">✓ Best Colours</p>
          <div class="mn-color-pills">${mstColors}</div>
          <p class="mn-tooltip-label">✕ Avoid</p>
          <div class="mn-color-pills">${avoidColors}</div>
          <p class="mn-tooltip-note">💡 ${color_theory.undertone_note}</p>
        </div>

        <div class="mn-section-title">👔 Outfit Breakdown</div>
        <div class="mn-outfit-list">${wardrobeHTML}</div>

        ${upsellHTML ? `<div class="mn-section-title">🛍️ Complete Your Look</div>${upsellHTML}` : ''}

        <button class="mn-gamification-btn" id="mn-open-gamification">
          <span>🎴 ${gamification.mascot_quest.cards_collected}/${gamification.mascot_quest.cards_total} Mascot Cards · Tap to unlock</span>
          <span>›</span>
        </button>

        <div class="mn-result-actions">
          <button class="mn-btn-retry" id="mn-retry">↺ Try Another Look</button>
        </div>

        <div class="mn-step-dots">
          <span class="mn-dot mn-dot-done"></span><span class="mn-dot mn-dot-done"></span>
          <span class="mn-dot mn-dot-done"></span><span class="mn-dot mn-dot-active"></span>
          <span class="mn-dot"></span>
        </div>
      </div>
    `);

    $('#mn-mst-toggle').addEventListener('click', () => {
      const tip = $('#mn-mst-tooltip');
      state.mstTooltipOpen = !state.mstTooltipOpen;
      tip.style.display = state.mstTooltipOpen ? 'block' : 'none';
    });

    $('#mn-open-gamification').addEventListener('click', renderStep5);
    $('#mn-retry').addEventListener('click', resetFlow);
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER: STEP 5 — Gamified Hooks Modal
  // ═══════════════════════════════════════════════════════════

  const renderStep5 = () => {
    state.step = '5';
    const g = state.pipelineResult?.gamification;
    if (!g) return;
    const { mascot_quest, style_graph } = g;
    const mascotPct = Math.round((mascot_quest.cards_collected / mascot_quest.cards_total) * 100);

    setContent(`
      <div class="mn-step mn-step-5">
        <div class="mn-step-header">
          <p class="mn-step-label">Step 5 of 5 · Rewards</p>
          <h2 class="mn-step-title">Your Narrative Unlocks</h2>
        </div>

        <div class="mn-gamification-card">
          <h3 class="mn-game-title">🎴 Mascot Quest</h3>
          <div class="mn-game-progress-track">
            <div class="mn-game-progress-fill" style="width:${mascotPct}%"></div>
          </div>
          <p class="mn-game-progress-label">
            <strong>${mascot_quest.cards_collected}/${mascot_quest.cards_total}</strong> Mascot Cards Collected
          </p>
          <div class="mn-current-card">
            <div class="mn-card-art">🃏</div>
            <div>
              <p class="mn-card-name">${mascot_quest.current_card?.name || 'Starter Card'}</p>
              <p class="mn-card-rarity">${mascot_quest.current_card?.rarity || 'Common'}</p>
            </div>
          </div>
          <div class="mn-next-card-box">
            <p class="mn-next-label">🔮 Next: <strong>${mascot_quest.next_card?.name || 'Mystery Card'}</strong>
              <span class="mn-next-rarity">(${mascot_quest.next_card?.rarity || 'Rare'})</span>
            </p>
            <button class="mn-checkout-cta">${mascot_quest.checkout_cta || 'Checkout to unlock physical card'}</button>
          </div>
        </div>

        <div class="mn-gamification-card mn-style-graph-card">
          <h3 class="mn-game-title">📊 Style Graph Builder</h3>
          <p class="mn-game-subtitle">Upload 3 more Outfit of the Day photos to train your AI and unlock 5% Store Credit.</p>
          <div class="mn-game-progress-track">
            <div class="mn-game-progress-fill mn-green-fill" style="width:${style_graph.progress_pct}%"></div>
          </div>
          <p class="mn-game-progress-label"><strong>${style_graph.photos_uploaded || 1}/${style_graph.photos_required || 4}</strong> OOTD photos uploaded</p>
          <p class="mn-reward-desc">${style_graph.reward_description}</p>
          <button class="mn-upload-ootd-btn" id="mn-upload-ootd">📸 Upload Outfit of the Day</button>
        </div>

        <button class="mn-btn-retry" id="mn-back-to-result">← Back to your look</button>

        <div class="mn-step-dots">
          <span class="mn-dot mn-dot-done"></span><span class="mn-dot mn-dot-done"></span>
          <span class="mn-dot mn-dot-done"></span><span class="mn-dot mn-dot-done"></span>
          <span class="mn-dot mn-dot-active"></span>
        </div>
      </div>
    `);

    $('#mn-back-to-result').addEventListener('click', renderStep4);
    $('#mn-upload-ootd').addEventListener('click', () => {
      alert('OOTD upload coming soon! Your AI is getting smarter with each look.');
    });
  };

  // ═══════════════════════════════════════════════════════════
  // FLOW CONTROL
  // ═══════════════════════════════════════════════════════════

  const resetFlow = () => {
    Object.assign(state, {
      step: '1A', occasion: null, occasionLabel: null,
      vibeId: null, vibeLabel: null, vibeIndex: 0,
      userImageBase64: null, pipelineResult: null,
      isLoading: false, error: null,
      mstTooltipOpen: false, gamificationOpen: false,
    });
    renderStep1A();
  };

  // ═══════════════════════════════════════════════════════════
  // WIDGET SHELL: EXPAND / COLLAPSE
  // ═══════════════════════════════════════════════════════════

  const expandWidget = () => {
    state.isExpanded = true;
    const expanded = $('#mn-widget-expanded');
    const minimized = $('#mn-widget-minimized');
    if (expanded) { expanded.style.display = 'flex'; expanded.removeAttribute('aria-hidden'); }
    if (minimized) minimized.style.display = 'none';
    if (!state.pipelineResult && state.step === '1A') renderStep1A();
  };

  const collapseWidget = () => {
    state.isExpanded = false;
    const expanded = $('#mn-widget-expanded');
    const minimized = $('#mn-widget-minimized');
    if (expanded) { expanded.style.display = 'none'; expanded.setAttribute('aria-hidden', 'true'); }
    if (minimized) minimized.style.display = 'flex';
  };

  // ═══════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════

  const init = () => {
    const minimized = $('#mn-widget-minimized');
    const closeBtn = $('#mn-close-btn');

    if (minimized) minimized.addEventListener('click', expandWidget);
    if (closeBtn) closeBtn.addEventListener('click', collapseWidget);

    // Auto-open after 3 seconds on first visit
    const hasSeenWidget = sessionStorage.getItem('mn_widget_seen');
    if (!hasSeenWidget) {
      setTimeout(() => {
        expandWidget();
        sessionStorage.setItem('mn_widget_seen', '1');
      }, 3000);
    } else {
      // Show minimized bubble
      if (minimized) minimized.style.display = 'flex';
    }
  };

  // Public API
  return { init, expandWidget, collapseWidget, resetFlow };

})();

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => MNAIStylist.init());

// ── END OF FILE — MN-fashion-consultant.js v2.0 (Zero-Friction Flow) ──
// Old code (calibration questions, gift mode, archetype map, silhouette, lifestyle)
// has been completely removed and replaced with the 5-step zero-friction flow above.
// DO NOT re-add the old CALIBRATION_FLOW, GIFT_MODE, or ARCHETYPE_MAP sections.
/* REMOVED_PLACEHOLDER = {
    regions: [
      { id: 'north', label: 'North', emoji: '🏔️', context: 'Lucknowi, Patiala, layered styles' },
      { id: 'south', label: 'South', emoji: '🌴', context: 'Silk traditions, lighter fabrics' },
      { id: 'west', label: 'West', emoji: '🏜️', context: 'Bandhani, mirror work, vibrant' },
      { id: 'east', label: 'East', emoji: '🌊', context: 'Tant, Baluchari, elegant draping' },
      { id: 'metro', label: 'Metro / Global', emoji: '🌆', context: 'Contemporary fusion, no regional lock' }
    ],
    climates: [
      { id: 'hot_dry', label: '☀️ Hot & Dry', fabrics: 'cotton, linen, khadi' },
      { id: 'humid', label: '🌧️ Humid', fabrics: 'breathable cotton, rayon' },
      { id: 'cold', label: '❄️ Cold', fabrics: 'wool, layering pieces' },
      { id: 'moderate', label: '🌤️ Moderate', fabrics: 'versatile blend' },
      { id: 'mixed', label: '🌀 Travels a lot', fabrics: 'packable, versatile' }
    ],
    budgets: [
      { id: 'budget', label: 'Under ₹1,500', range: [0, 1500] },
      { id: 'mid', label: '₹1,500 — ₹4,000', range: [1500, 4000] },
      { id: 'premium', label: '₹4,000 — ₹10,000', range: [4000, 10000] },
      { id: 'luxury', label: '₹10,000+', range: [10000, 999999] }
    ]
  };

  const GHOST_MODE_ITEMS = {
    tops: [
      'Black T-Shirt', 'White T-Shirt', 'Navy T-Shirt',
      'White Formal Shirt', 'Blue Oxford Shirt', 'Black Shirt',
      'Grey Hoodie', 'Denim Jacket', 'Navy Blazer',
      'Leather Jacket', 'Bomber Jacket', 'Kurta (White)',
      'Kurta (Black)', 'Printed Shirt', 'Polo T-Shirt',
      'Linen Shirt', 'Flannel Shirt', 'Nehru Jacket'
    ],
    bottoms: [
      'Blue Jeans', 'Black Jeans', 'Khaki Chinos',
      'Navy Chinos', 'Formal Trousers (Black)', 'Formal Trousers (Grey)',
      'Joggers', 'Cargo Pants', 'Shorts (Khaki)',
      'Churidar', 'Patiala', 'Dhoti Pants'
    ],
    footwear: [
      'White Sneakers', 'Black Sneakers', 'Brown Formal Shoes',
      'Black Formal Shoes', 'Kolhapuri Chappals', 'Loafers',
      'Chelsea Boots', 'Slides', 'Running Shoes', 'Mojaris'
    ],
    accessories: [
      'Analog Watch', 'Digital Watch', 'Sunglasses',
      'Silver Chain', 'Gold Chain', 'Bracelet',
      'Stole/Scarf', 'Cap', 'Belt (Brown)', 'Belt (Black)',
      'Backpack', 'Tote Bag', 'Messenger Bag'
    ]
  };

  const hasBodyData = () => {
    return state.identity &&
      state.identity.build &&
      state.identity.skinTone &&
      state.identity.undertone &&
      state.identity.climate &&
      state.identity.budget;
  };

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!state.identity) return { percentage: 0, fields: [] };
    const fields = [
      { key: 'gender', label: 'Gender', filled: !!state.identity.gender },
      { key: 'build', label: 'Body Build', filled: !!state.identity.build },
      { key: 'skinTone', label: 'Skin Tone', filled: !!state.identity.skinTone },
      { key: 'undertone', label: 'Undertone', filled: !!state.identity.undertone },
      { key: 'climate', label: 'Climate', filled: !!state.identity.climate },
      { key: 'budget', label: 'Budget', filled: !!state.identity.budget },
      { key: 'coreExpression', label: 'Style Expression', filled: !!state.identity.coreExpression },
      { key: 'closet', label: 'Closet Items', filled: !!(state.identity.closet && state.identity.closet.length > 0) || !!((() => { try { return JSON.parse(localStorage.getItem('mn_digital_closet') || '[]').length > 0; } catch (e) { return false; } })()) },
    ];
    const filled = fields.filter(f => f.filled).length;
    return { percentage: Math.round((filled / fields.length) * 100), fields, filled, total: fields.length };
  };

  const CONTEXT_DATA = {
    selfContexts: [
      { value: 'Y2K Grunge', emoji: '🔗', description: 'Low-rise, baby tees, chaos' },
      { value: 'Opium / Darkwear', emoji: '🖤', description: 'All black everything, avant-garde' },
      { value: 'Old Money Minimal', emoji: '🏛️', description: 'Quiet luxury, no logos' },
      { value: 'Techwear / Gorpcore', emoji: '🧬', description: 'Utility meets the trail' },
      { value: 'Streetwear / Hypebeast', emoji: '🔥', description: 'Drip culture, drops, grails' },
      { value: 'Cottagecore / Boho', emoji: '🌿', description: 'Earthy, layered, free' },
      { value: 'Date Night', emoji: '💕', description: 'Romance and confidence' },
      { value: 'Festival / Concert', emoji: '🎶', description: 'Main character energy' },
      { value: 'Wedding Guest', emoji: '💍', description: 'Celebrate in style' },
      { value: 'Daily Rotation', emoji: '🔄', description: 'Your everyday signatures' }
    ],
    recipients: [
      '👥 Friend',
      '💑 Partner',
      '👨‍👩‍👧 Family',
      '💼 Colleague',
      '💫 Someone Special'
    ],
    occasions: [
      '🎂 Birthday',
      '💝 First Date',
      '💍 Anniversary',
      '🎉 New Job',
      '💔 Breakup Support',
      '💪 Motivation Gift',
      '😄 Inside Joke',
      '👕 Everyday Wear'
    ]
  };

  const DOM = {};

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  const init = () => {
    cacheDOM();
    bindEvents();
    loadIdentityFromStorage();
    console.log('🎨 AI Fashion Consultant v6.1 — mini bubble appears after 5s, click to expand');

    // Widget starts completely hidden on page load
    if (DOM.minimized) DOM.minimized.style.display = 'none';
    if (DOM.expanded) {
      DOM.expanded.style.display = 'none';
      DOM.expanded.setAttribute('aria-hidden', 'true');
    }
    if (DOM.widget) DOM.widget.classList.remove('is-expanded');
    state.isExpanded = false;

    // After 5 seconds (page fully loaded), show the mini avatar bubble with a smooth fade-in
    setTimeout(() => {
      if (DOM.minimized) {
        DOM.minimized.style.display = 'flex';
        DOM.minimized.style.opacity = '0';
        DOM.minimized.style.transform = 'scale(0.6)';
        DOM.minimized.style.transition = 'opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        // Trigger animation on next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            DOM.minimized.style.opacity = '1';
            DOM.minimized.style.transform = 'scale(1)';
          });
        });
      }
    }, 5000);

    // Expose expandWidget globally so hamburger menu and other external callers can open the widget
    window.MNAIStylist = window.MNAIStylist || {};
    window.MNAIStylist.expandWidget = expandWidget;
    window.MNAIStylist.minimizeWidget = minimizeWidget;
  };

  // INFO5: Auto-expansion with message bubble
  let autoCollapseTimer = null;

  const autoExpandWidget = () => {
    state.isExpanded = true;
    DOM.widget.classList.add('is-expanded');
    DOM.widget.classList.add('auto-expanded'); // Mark as auto-expanded
    DOM.expanded.setAttribute('aria-hidden', 'false');

    // Show message bubble instead of full dashboard
    renderMessageBubble();

    // INFO5: Auto-collapse after 6-8 seconds if no interaction
    autoCollapseTimer = setTimeout(() => {
      if (DOM.widget.classList.contains('auto-expanded')) {
        minimizeWidget();
        sessionStorage.setItem('mn_widget_dismissed', 'true'); // Don't auto-expand again this session
      }
    }, 7000); // 7 seconds
  };

  // Render message bubble (INFO5 spec)
  const renderMessageBubble = () => {
    const messages = [
      "Let me plan your outfit of the day.",
      "Ready to style something special?",
      "Let's design your vibe.",
      "Date night or casual drip?"
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];

    // We make the whole bubble a clickable trigger
    const html = `
      <div class="mn-message-bubble" id="mn-bubble-trigger">
        <div class="mn-bubble-content" style="display: flex; align-items: center; gap: 12px;">
          <div class="mn-avatar-small" style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 1px solid #39A596;">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" style="width: 100%; height: 100%; object-fit: cover;" alt="AI" />
          </div>
          <div class="mn-bubble-text" style="color: white; font-size: 14px;">
            <span class="mn-typing-effect">${message}</span>
          </div>
        </div>
      </div>
    `;

    DOM.container.innerHTML = html;

    // 4. ON CLICK -> FULL CHAT PANEL
    document.getElementById('mn-bubble-trigger')?.addEventListener('click', () => {
      clearTimeout(autoCollapseTimer);
      // Remove the restrictive bubble state, allowing the full UI to expand
      DOM.widget.classList.remove('auto-expanded');

      // Render the actual full dashboard
      if (!state.identity) renderWelcomeScreen();
      else renderContextDashboard();
    });
  };

  const cacheDOM = () => {
    DOM.widget = document.getElementById('mn-ai-widget');
    DOM.minimized = document.getElementById('mn-widget-minimized');
    DOM.expanded = document.getElementById('mn-widget-expanded');
    DOM.minimizeBtn = document.getElementById('mn-close-btn'); // Fixed: changed from mn-minimize-btn to mn-close-btn
    DOM.container = document.getElementById('mn-content-container');
    DOM.progressBar = document.getElementById('mn-progress-bar');
  };

  const bindEvents = () => {
    // Click anywhere on the minimized widget to expand
    if (DOM.minimized) {
      DOM.minimized.addEventListener('click', (e) => {
        console.log('🎨 Static widget clicked - expanding...');
        // Clear any auto-dismiss flags
        sessionStorage.removeItem('mn_widget_dismissed');
        expandWidget();
      });
    }

    // Close button
    if (DOM.minimizeBtn) {
      DOM.minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('❌ Close button clicked - minimizing...');
        minimizeWidget();
      });
    }

    // Click outside expanded panel to close
    if (DOM.expanded) {
      // Backdrop click no longer minimizes — only the × button does
      // DOM.expanded.addEventListener('click', (e) => {
      //   if (e.target === DOM.expanded) minimizeWidget();
      // });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      // Escape key no longer minimizes — only the × button does
      // if (e.key === 'Escape' && state.isExpanded) minimizeWidget();
    });
  };

  const updateProgressBar = (percentage) => {
    if (!DOM.progressBar) return;
    if (percentage > 0) {
      DOM.progressBar.classList.add('active');
      const progressFill = DOM.progressBar.querySelector('.mn-progress-fill');
      if (progressFill) progressFill.style.width = `${percentage}%`;
    } else {
      DOM.progressBar.classList.remove('active');
    }
  };

  // ═══════════════════════════════════════════════════════════
  // IDENTITY MANAGER
  // ═══════════════════════════════════════════════════════════

  const loadIdentityFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        state.identity = JSON.parse(stored);
        if (state.identity.coreExpression && !state.identity.archetype) {
          state.identity.archetype = deriveArchetype(state.identity);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.identity));
        }
      }
    } catch (error) {
      console.error('❌ Error loading identity:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const saveIdentityToStorage = () => {
    try {
      state.identity = { ...state.tempCalibration };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.identity));
      // Dispatch custom event for dashboard to listen
      window.dispatchEvent(new CustomEvent('mn-identity-updated'));
    } catch (error) {
      console.error('❌ Error saving identity:', error);
    }
  };

  const clearIdentity = () => {
    localStorage.removeItem(STORAGE_KEY);
    state.identity = null;
    state.tempCalibration = {};
    state.dataCollection = {};
  };

  // ═══════════════════════════════════════════════════════════
  // WIDGET STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  const expandWidget = () => {
    state.isExpanded = true;
    DOM.widget.classList.add('is-expanded');
    if (DOM.minimized) DOM.minimized.style.display = 'none';
    if (DOM.expanded) {
      DOM.expanded.style.display = 'flex';
      DOM.expanded.setAttribute('aria-hidden', 'false');
      DOM.expanded.style.opacity = '0';
      DOM.expanded.style.transform = 'scale(0.92) translateY(12px)';
      DOM.expanded.style.transition = 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          DOM.expanded.style.opacity = '1';
          DOM.expanded.style.transform = 'scale(1) translateY(0)';
        });
      });
    }
    if (!state.identity) renderWelcomeScreen();
    else renderContextDashboard();
  };

  const minimizeWidget = () => {
    state.isExpanded = false;
    if (DOM.expanded) {
      DOM.expanded.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        DOM.widget.classList.remove('is-expanded');
        DOM.expanded.style.display = 'none';
        DOM.expanded.setAttribute('aria-hidden', 'true');
        DOM.container.innerHTML = '';
        updateProgressBar(0);
        DOM.expanded.style.animation = '';
        // Show avatar bubble
        if (DOM.minimized) DOM.minimized.style.display = 'flex';
      }, 300);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // INFO52 — STEP 1: THE HOOK (Zero-Friction Entry)
  // Show aesthetics grid first. NO photo ask yet.
  // ═══════════════════════════════════════════════════════════

  const INFO52_AESTHETICS = [
    { value: 'Opium / Darkwear', emoji: '🖤', label: 'OPIUM', sub: 'Darkwear', bg: 'linear-gradient(135deg,#0a0a0a,#1a0a0a)', accent: '#ff2d55' },
    { value: 'Y2K Grunge', emoji: '🔗', label: 'Y2K', sub: 'Grunge Revival', bg: 'linear-gradient(135deg,#0d0018,#1a0030)', accent: '#bf5fff' },
    { value: 'Old Money Minimal', emoji: '🏛️', label: 'OLD MONEY', sub: 'Quiet Luxury', bg: 'linear-gradient(135deg,#0a0800,#1a1400)', accent: '#c9a84c' },
    { value: 'Cyber Streetwear', emoji: '🧬', label: 'CYBER', sub: 'Street / Tech', bg: 'linear-gradient(135deg,#001a12,#002a1a)', accent: '#39A596' },
    { value: 'Streetwear / Hypebeast', emoji: '🔥', label: 'HYPEBEAST', sub: 'Drip Culture', bg: 'linear-gradient(135deg,#0a0500,#1a0c00)', accent: '#ff6b00' },
    { value: 'Cottagecore / Boho', emoji: '🌿', label: 'BOHO', sub: 'Cottagecore', bg: 'linear-gradient(135deg,#030d00,#061a00)', accent: '#7bc67e' }
  ];

  const renderWelcomeScreen = () => {
    updateProgressBar(0);
    // INFO52 Step 1: Hook with identity & aesthetic — NO photo yet
    const html = `
      <div class="mn-hook-screen mn-fade-in">
        <!-- Kinetic Typography Intro -->
        <div class="mn-kinetic-header">
          <div class="mn-kinetic-line1">Define your</div>
          <div class="mn-kinetic-line2">Narrative.</div>
          <div class="mn-kinetic-sub">What's the vibe today?</div>
        </div>

        <!-- Aesthetic Grid (Core aesthetics) -->
        <div class="mn-aesthetic-grid">
          ${INFO52_AESTHETICS.map((a, i) => `
            <button class="mn-aesthetic-tile" data-value="${a.value}" data-accent="${a.accent}"
              style="background:${a.bg};animation-delay:${i * 0.07}s">
              <div class="mn-aesthetic-emoji">${a.emoji}</div>
              <div class="mn-aesthetic-label">${a.label}</div>
              <div class="mn-aesthetic-sub">${a.sub}</div>
              <div class="mn-aesthetic-glow" style="background:radial-gradient(ellipse at center,${a.accent}22 0%,transparent 70%)"></div>
            </button>
          `).join('')}
        </div>

        <!-- Divider -->
        <div style="display:flex;align-items:center;gap:10px;margin:16px 0;">
          <div style="height:1px;flex:1;background:rgba(255,255,255,0.08);"></div>
          <span style="color:#555;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;">or</span>
          <div style="height:1px;flex:1;background:rgba(255,255,255,0.08);"></div>
        </div>

        <!-- 3-tap calibration fallback -->
        <button id="btn-start-journey" class="mn-btn-secondary" style="width:100%;font-size:13px;opacity:0.7;">⚡ Quick 3-Tap Calibration</button>
      </div>
    `;
    DOM.container.innerHTML = html;

    // Aesthetic tile tap → haptic + expand → Step 2 (earn the photo)
    DOM.container.querySelectorAll('.mn-aesthetic-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const value = tile.dataset.value;
        const accent = tile.dataset.accent;
        // Haptic feedback (mobile)
        if (navigator.vibrate) navigator.vibrate(12);
        // Save selected aesthetic to temp calibration
        state.tempCalibration.coreExpression = value;
        state.tempCalibration.selectedAesthetic = value;
        // Expand tile animation
        tile.classList.add('mn-aesthetic-selected');
        tile.style.border = `2px solid ${accent}`;
        tile.style.boxShadow = `0 0 24px ${accent}44`;
        // Transition to Step 2 after brief delay
        setTimeout(() => renderEarnThePhoto(value, accent), 450);
      });
    });

    document.getElementById('btn-start-journey').addEventListener('click', () => renderCalibrationFlow(0));
  };

  // ═══════════════════════════════════════════════════════════
  // INFO52 — STEP 2: EARNING THE PHOTO
  // Now that they're hooked, introduce the upload
  // ═══════════════════════════════════════════════════════════

  const renderEarnThePhoto = (aesthetic, accent) => {
    updateProgressBar(20);
    const accentColor = accent || '#39A596';
    const html = `
      <div class="mn-earn-photo-screen mn-fade-in">
        <button class="mn-back-btn" id="btn-back-to-hook">← Back</button>

        <div class="mn-earn-header">
          <p class="mn-earn-vibe-label" style="color:${accentColor};">// ${aesthetic}</p>
          <h2 class="mn-earn-title">Let's put you<br>in the fit.</h2>
          <p class="mn-earn-sub">Drop a fit pic or selfie. The AI will build your look around it.</p>
        </div>

        <!-- Vault Upload Zone (INFO52 spec: glowing #39A596 pulsing bounding box) -->
        <div class="mn-vault-zone" id="mn-vault-zone" style="--vault-accent:${accentColor};">
          <div class="mn-vault-pulse-border"></div>
          <div class="mn-vault-inner">
            <div class="mn-vault-icon">🔓</div>
            <div class="mn-vault-text">Drop a fit pic or selfie</div>
            <div class="mn-vault-sub">Tap to unlock your personalised aesthetic</div>
          </div>
          <input type="file" id="earn-photo-input" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;" />
        </div>

        <!-- Teaser of what they'll get -->
        <div class="mn-earn-teaser">
          <div class="mn-teaser-item"><span class="mn-teaser-dot" style="background:${accentColor};"></span>Skin tone matched palette</div>
          <div class="mn-teaser-item"><span class="mn-teaser-dot" style="background:${accentColor};"></span>Body silhouette analysis</div>
          <div class="mn-teaser-item"><span class="mn-teaser-dot" style="background:${accentColor};"></span>Curated from My Narrative vault</div>
        </div>
      </div>
    `;
    DOM.container.innerHTML = html;

    document.getElementById('btn-back-to-hook').addEventListener('click', () => renderWelcomeScreen());

    const photoInput = document.getElementById('earn-photo-input');
    photoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        renderBiometricScan(e.target.files[0], aesthetic, accentColor);
      }
    });

    // Drag-and-drop
    const vaultZone = document.getElementById('mn-vault-zone');
    vaultZone.addEventListener('dragover', (e) => { e.preventDefault(); vaultZone.classList.add('mn-vault-drag'); });
    vaultZone.addEventListener('dragleave', () => vaultZone.classList.remove('mn-vault-drag'));
    vaultZone.addEventListener('drop', (e) => {
      e.preventDefault();
      vaultZone.classList.remove('mn-vault-drag');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) renderBiometricScan(file, aesthetic, accentColor);
    });
  };

  // ═══════════════════════════════════════════════════════════
  // INFO52 — STEP 3: THE MAGIC (Biometric Scan Processing Flex)
  // Terminal-style hacker-aesthetic overlay with laser scan
  // ═══════════════════════════════════════════════════════════

  const renderBiometricScan = (file, aesthetic, accentColor) => {
    updateProgressBar(50);
    const objectUrl = URL.createObjectURL(file);
    const accent = accentColor || '#39A596';

    const scanLines = [
      '> Initializing biometric scan...',
      '> Detecting face geometry...',
      '> Analyzing body proportions...',
      '> Color-matching skin tone to palette...',
      '> Cross-referencing aesthetic: ' + aesthetic + '...',
      '> Curating My Narrative vault...',
      '> Generating fit...',
      '> ✓ Profile locked.'
    ];

    const html = `
      <div class="mn-biometric-screen">
        <!-- Blurred silhouette of uploaded photo -->
        <div class="mn-scan-image-wrap">
          <img src="${objectUrl}" class="mn-scan-img-blur" alt="Scanning..." />
          <!-- Laser line sweep -->
          <div class="mn-laser-line" style="background:linear-gradient(90deg,transparent,${accent},transparent);box-shadow:0 0 16px ${accent};"></div>
          <!-- Bounding box corners -->
          <div class="mn-scan-corner mn-corner-tl" style="border-color:${accent};"></div>
          <div class="mn-scan-corner mn-corner-tr" style="border-color:${accent};"></div>
          <div class="mn-scan-corner mn-corner-bl" style="border-color:${accent};"></div>
          <div class="mn-scan-corner mn-corner-br" style="border-color:${accent};"></div>
          <div class="mn-scan-overlay-text" style="color:${accent};">SCANNING</div>
        </div>

        <!-- Terminal output (fast typing) -->
        <div class="mn-terminal-box" id="mn-terminal-output">
          <div class="mn-terminal-cursor" style="color:${accent};">_</div>
        </div>
      </div>
    `;
    DOM.container.innerHTML = html;

    const terminal = document.getElementById('mn-terminal-output');
    let lineIndex = 0;

    const typeNextLine = () => {
      if (lineIndex >= scanLines.length) {
        // All lines typed — proceed to reveal
        updateProgressBar(100);
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
          // Save photo to state for downstream use
          state.tempCalibration.photoFile = file;
          // Now trigger the actual magic mirror upload logic then go to reveal
          handleMagicMirrorUploadFromFile(file, aesthetic, accentColor);
        }, 600);
        return;
      }
      const line = scanLines[lineIndex];
      const div = document.createElement('div');
      div.className = 'mn-terminal-line';
      div.style.color = lineIndex === scanLines.length - 1 ? accent : 'rgba(255,255,255,0.75)';
      terminal.insertBefore(div, terminal.querySelector('.mn-terminal-cursor'));

      let charIdx = 0;
      const typeChar = () => {
        if (charIdx < line.length) {
          div.textContent += line[charIdx];
          charIdx++;
          setTimeout(typeChar, 18 + Math.random() * 14);
        } else {
          lineIndex++;
          setTimeout(typeNextLine, 220 + Math.random() * 180);
        }
      };
      typeChar();
    };

    setTimeout(typeNextLine, 400);
  };

  // Wrapper that fires the existing magic mirror upload then transitions to editorial reveal
  const handleMagicMirrorUploadFromFile = (file, aesthetic, accentColor) => {
    // Re-use existing upload event machinery via a fake event object
    const fakeEvent = { target: { files: [file] } };
    // Save aesthetic context for the reveal step
    state.tempCalibration.selectedAesthetic = aesthetic;
    state.tempCalibration.accentColor = accentColor;
    // Mark that we came from the biometric scan so we intercept after upload
    state._info52ScanMode = true;
    handleMagicMirrorUpload(fakeEvent);
  };

  // ═══════════════════════════════════════════════════════════
  // INFO52 — STEP 4: THE REVEAL & UPSELL
  // Magazine editorial layout + existing items retention loop
  // Called after magic mirror analysis completes in scan mode
  // ═══════════════════════════════════════════════════════════

  const renderEditorialReveal = (analysisData) => {
    updateProgressBar(0);
    state._info52ScanMode = false;
    const aesthetic = state.tempCalibration?.selectedAesthetic || 'Your Aesthetic';
    const accent = state.tempCalibration?.accentColor || '#39A596';
    const skinTone = analysisData?.skinTone || state.identity?.skinTone || '';
    const build = analysisData?.build || state.identity?.build || '';

    // Build outfit recommendations from analysis
    const closetItems = (() => {
      try { return JSON.parse(localStorage.getItem('mn_digital_closet') || '[]'); } catch (e) { return []; }
    })();
    const jewels = analysisData?.jewelryRecommendations || state.identity?.jewelryRecommendations || [];

    const html = `
      <div class="mn-editorial-screen mn-fade-in">
        <button class="mn-back-btn" id="btn-editorial-back">← Back</button>

        <!-- Editorial Header -->
        <div class="mn-editorial-header">
          <p class="mn-editorial-tag" style="color:${accent};">// THE ALGORITHM DOESN'T MISS</p>
          <h2 class="mn-editorial-title">Your Fit<br>is Ready.</h2>
          ${build ? `<p class="mn-editorial-sub" style="color:#888;">Heavyweight silhouette matched to your ${build} build.</p>` : ''}
        </div>

        <!-- Primary Look: Magazine Editorial Card -->
        <div class="mn-editorial-look-card" style="border-color:${accent}33;">
          <div class="mn-editorial-look-meta">
            <span class="mn-editorial-aesthetic-tag" style="background:${accent}22;color:${accent};border:1px solid ${accent}44;">${aesthetic}</span>
            ${skinTone ? `<span class="mn-editorial-skintone-tag">🎨 ${skinTone} palette</span>` : ''}
          </div>
          <div class="mn-editorial-look-body">
            ${analysisData?.outfitRecommendations?.length ? analysisData.outfitRecommendations.slice(0, 3).map(item => `
              <div class="mn-editorial-outfit-row">
                <span class="mn-editorial-outfit-icon">${item.emoji || '👕'}</span>
                <div class="mn-editorial-outfit-info">
                  <div class="mn-editorial-outfit-name">${item.name || item}</div>
                  ${item.reason ? `<div class="mn-editorial-outfit-reason">${item.reason}</div>` : ''}
                </div>
                ${item.shopUrl ? `<a href="${item.shopUrl}" class="mn-editorial-shop-btn" style="color:${accent};" target="_blank">Shop →</a>` : ''}
              </div>
            `).join('') : `
              <div class="mn-editorial-outfit-row">
                <span class="mn-editorial-outfit-icon">✨</span>
                <div class="mn-editorial-outfit-info">
                  <div class="mn-editorial-outfit-name">Curated look building...</div>
                  <div class="mn-editorial-outfit-reason">Your profile has been saved. Explore My Locker Room for full recommendations.</div>
                </div>
              </div>
            `}
          </div>
          ${jewels.length ? `
            <div class="mn-editorial-jewels">
              <p class="mn-editorial-jewels-label">💎 Jewels that will suit you</p>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${jewels.slice(0, 3).map(j => `<span class="mn-editorial-jewel-chip" style="border-color:${accent}44;color:${accent};">${j.type || j}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- INFO52 Killer Retention Loop: Existing Items Upload -->
        <div class="mn-existing-items-section">
          <p class="mn-existing-items-title">Got your own pieces?</p>
          <p class="mn-existing-items-sub">Upload your cargos, sneakers or any item — we'll build the rest of the fit around it.</p>
          <div class="mn-existing-items-grid">
            <button class="mn-existing-item-btn" id="btn-upload-top" data-category="top">
              <span>👕</span><span>My Top</span>
            </button>
            <button class="mn-existing-item-btn" id="btn-upload-bottom" data-category="bottom">
              <span>👖</span><span>My Bottoms</span>
            </button>
            <button class="mn-existing-item-btn" id="btn-upload-shoes" data-category="footwear">
              <span>👟</span><span>My Shoes</span>
            </button>
            <button class="mn-existing-item-btn" id="btn-upload-accessory" data-category="accessory">
              <span>🧣</span><span>Accessory</span>
            </button>
          </div>
          <input type="file" id="existing-item-input" accept="image/*" style="display:none;" />
          <p id="mn-existing-feedback" class="mn-existing-feedback" style="display:none;color:${accent};">✓ Item added! Rebuilding your top half...</p>
        </div>

        <!-- CTA: Go to Locker Room -->
        <button id="btn-go-locker-room" class="mn-btn-primary" style="width:100%;margin-top:16px;background:linear-gradient(135deg,${accent},${accent}bb);">
          🔒 Enter My Locker Room
        </button>
      </div>
    `;
    DOM.container.innerHTML = html;
    DOM.container.style.opacity = '1';
    DOM.container.style.transform = 'translateY(0)';

    document.getElementById('btn-editorial-back').addEventListener('click', () => renderContextDashboard());
    document.getElementById('btn-go-locker-room').addEventListener('click', () => renderLockerRoom());

    // Existing items upload loop
    const existingInput = document.getElementById('existing-item-input');
    let activeCategory = 'bottom';
    ['btn-upload-top', 'btn-upload-bottom', 'btn-upload-shoes', 'btn-upload-accessory'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        existingInput.click();
      });
    });
    existingInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const feedback = document.getElementById('mn-existing-feedback');
        if (feedback) {
          const msgs = {
            top: '✓ Top uploaded! Rebuilding your bottom half...',
            bottom: '✓ Bottoms uploaded! Rebuilding your top half...',
            footwear: '✓ Shoes locked in! Matching your outfit from the ground up...',
            accessory: '✓ Accessory added! Pulling complementary pieces...'
          };
          feedback.textContent = msgs[activeCategory] || '✓ Item added! Rebuilding your look...';
          feedback.style.display = 'block';
          // Save to closet via existing handler
          handleClothUpload({ target: { files: e.target.files } });
          setTimeout(() => { feedback.style.display = 'none'; }, 3500);
        }
      }
    });
  };

  // ═══════════════════════════════════════════════════════════
  // INFO52 — STEP 5: MY LOCKER ROOM (Gamified Dashboard)
  // Replaces old "Dashboard" branding — gamified style stats
  // ═══════════════════════════════════════════════════════════

  const getStyleStats = () => {
    // Derive style stats from closet items + calibration history
    const closet = (() => { try { return JSON.parse(localStorage.getItem('mn_digital_closet') || '[]'); } catch (e) { return []; } })();
    const history = (() => { try { return JSON.parse(localStorage.getItem('mn_outfit_history') || '[]'); } catch (e) { return []; } })();
    const identity = state.identity || {};

    // Map aesthetic selections to style DNA stats
    const aestheticMap = {
      'Y2K Grunge': 'Y2K',
      'Opium / Darkwear': 'Darkwear',
      'Old Money Minimal': 'Minimalist',
      'Cyber Streetwear': 'Techwear',
      'Streetwear / Hypebeast': 'Streetwear',
      'Cottagecore / Boho': 'Boho',
      'Calm & Minimal': 'Minimalist',
      'Bold & Expressive': 'Avant-Garde',
      'Experimental': 'Avant-Garde',
      'Elegant & Refined': 'Classic',
      'Traditional & Rooted': 'Heritage'
    };

    const primary = aestheticMap[identity.selectedAesthetic || identity.coreExpression] || identity.coreExpression || 'Original';
    const secondary = identity.presence ? (identity.presence.includes('Creative') ? 'Eclectic' : 'Refined') : 'Refined';

    return {
      primary,
      secondary,
      closetCount: closet.length,
      looksGenerated: history.length,
      skinTone: identity.skinTone || null,
      build: identity.build || null,
      archetype: identity.archetype?.name || 'The Original'
    };
  };

  const renderLockerRoom = () => {
    updateProgressBar(0);
    const stats = getStyleStats();
    const completion = getProfileCompletion();
    const closet = (() => { try { return JSON.parse(localStorage.getItem('mn_digital_closet') || '[]'); } catch (e) { return []; } })();
    const jewels = state.identity?.jewelryRecommendations || [];
    const returningUser = stats.closetCount > 0 || stats.looksGenerated > 0;

    const html = `
      <div class="mn-locker-room mn-fade-in">
        <!-- Header -->
        <div class="mn-locker-header">
          <div>
            <div class="mn-locker-tag">🔒 MY LOCKER ROOM</div>
            ${returningUser
        ? `<h2 class="mn-locker-welcome">Welcome back.<br><span style="color:#39A596;">We found ${Math.max(1, Math.floor(Math.random() * 4) + 1)} new fits that match your skin tone.</span></h2>`
        : `<h2 class="mn-locker-welcome">Your style<br>universe starts here.</h2>`
      }
          </div>
          <button id="btn-locker-back" class="mn-back-btn" style="position:relative;top:0;left:0;">← Back</button>
        </div>

        <!-- Style DNA Stats (gamified) -->
        <div class="mn-style-dna">
          <div class="mn-dna-label">🧬 STYLE DNA</div>
          <div class="mn-dna-bars">
            <div class="mn-dna-bar-row">
              <span class="mn-dna-name">${stats.primary}</span>
              <div class="mn-dna-bar-track">
                <div class="mn-dna-bar-fill" style="width:80%;background:linear-gradient(90deg,#39A596,#4fffd9);"></div>
              </div>
              <span class="mn-dna-pct">80%</span>
            </div>
            <div class="mn-dna-bar-row">
              <span class="mn-dna-name">${stats.secondary}</span>
              <div class="mn-dna-bar-track">
                <div class="mn-dna-bar-fill" style="width:20%;background:linear-gradient(90deg,#7c3aed,#a78bfa);"></div>
              </div>
              <span class="mn-dna-pct">20%</span>
            </div>
          </div>
        </div>

        <!-- Stat Pills -->
        <div class="mn-locker-stats-grid">
          <div class="mn-locker-stat-card">
            <div class="mn-locker-stat-num">${stats.closetCount}</div>
            <div class="mn-locker-stat-label">Closet Items</div>
          </div>
          <div class="mn-locker-stat-card">
            <div class="mn-locker-stat-num">${stats.looksGenerated}</div>
            <div class="mn-locker-stat-label">Looks Generated</div>
          </div>
          <div class="mn-locker-stat-card" style="grid-column:span 2;">
            <div class="mn-locker-stat-num" style="font-size:14px;">${stats.archetype}</div>
            <div class="mn-locker-stat-label">Your Archetype</div>
          </div>
        </div>

        ${stats.skinTone || stats.build ? `
        <!-- Saved Biometric Profile -->
        <div class="mn-locker-biometric">
          <div class="mn-locker-bio-label">📊 SAVED PROFILE</div>
          <div class="mn-locker-bio-chips">
            ${stats.skinTone ? `<span class="mn-locker-bio-chip">🎨 ${stats.skinTone} skin tone</span>` : ''}
            ${stats.build ? `<span class="mn-locker-bio-chip">📏 ${stats.build} build</span>` : ''}
          </div>
        </div>
        ` : ''}

        ${jewels.length > 0 ? `
        <!-- Jewelry that suits -->
        <div class="mn-locker-jewels">
          <div class="mn-locker-bio-label">💎 JEWELS THAT SUIT YOU</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
            ${jewels.slice(0, 4).map(j => `<span style="font-size:11px;padding:4px 12px;border-radius:20px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.25);color:#ffd700;font-weight:600;">${j.type || j}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Action Buttons -->
        <div class="mn-locker-actions">
          <button id="btn-locker-closet" class="mn-locker-action-btn">
            <span>👗</span> My Digital Closet
            ${stats.closetCount > 0 ? `<span class="mn-locker-badge">${stats.closetCount}</span>` : ''}
          </button>
          <button id="btn-locker-looks" class="mn-locker-action-btn" style="border-color:rgba(139,92,246,0.4);background:rgba(139,92,246,0.08);">
            <span>✨</span> Past Looks
            ${stats.looksGenerated > 0 ? `<span class="mn-locker-badge" style="background:#7c3aed;">${stats.looksGenerated}</span>` : ''}
          </button>
          <button id="btn-locker-new-fit" class="mn-locker-action-btn" style="border-color:rgba(57,165,150,0.5);background:rgba(57,165,150,0.1);grid-column:span 2;">
            <span>⚡</span> Generate New Fit
          </button>
        </div>

        <!-- Recalibrate -->
        <button id="btn-locker-recalibrate" class="mn-text-link" style="width:100%;text-align:center;margin-top:12px;">🔄 Recalibrate Style Profile</button>
      </div>
    `;
    DOM.container.innerHTML = html;

    document.getElementById('btn-locker-back').addEventListener('click', () => renderContextDashboard());
    document.getElementById('btn-locker-closet').addEventListener('click', () => renderMyCloset());
    document.getElementById('btn-locker-looks').addEventListener('click', () => renderPastLooks());
    document.getElementById('btn-locker-new-fit').addEventListener('click', () => renderSelfContext());
    document.getElementById('btn-locker-recalibrate').addEventListener('click', () => {
      if (confirm('Recalibrate your style profile? This will restart the process.')) {
        clearIdentity();
        renderWelcomeScreen();
      }
    });

    // Animate DNA bars after render
    setTimeout(() => {
      DOM.container.querySelectorAll('.mn-dna-bar-fill').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0%';
        bar.style.transition = 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)';
        setTimeout(() => { bar.style.width = w; }, 50);
      });
    }, 100);
  };

  // ═══════════════════════════════════════════════════════════
  // CALIBRATION FLOW
  // ═══════════════════════════════════════════════════════════

  const renderCalibrationFlow = (stepIndex) => {
    const step = CALIBRATION_FLOW[stepIndex];
    const progress = ((stepIndex + 1) / CALIBRATION_FLOW.length) * 100;
    updateProgressBar(progress);

    if (!step) {
      updateProgressBar(100);
      saveIdentityToStorage();
      setTimeout(() => {
        updateProgressBar(0);
        renderArchetypeCard();
      }, 500);
      return;
    }

    const html = `
      <div class="mn-calibration-step mn-fade-in">
        ${stepIndex > 0 ? '<button class="mn-back-btn" id="btn-back-cal">← Back</button>' : ''}
        <div class="mn-progress-text">
          <span class="mn-step-label">${step.label}</span>
          <span class="mn-step-progress">Step ${stepIndex + 1} of ${CALIBRATION_FLOW.length}</span>
        </div>
        <div class="mn-step-header">
          <h2 class="mn-context-heading">${step.question}</h2>
          <p class="mn-context-subtitle">"${step.subtitle}"</p>
        </div>
        <div class="mn-chip-grid">
          ${step.options.map((option, idx) => `
            <button class="mn-chip" data-value="${option.value}" style="animation-delay: ${idx * 0.05}s">
              <span class="mn-chip-label">${option.label}</span>
              <span class="mn-chip-description">${option.description}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    DOM.container.innerHTML = html;

    DOM.container.querySelectorAll('.mn-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('selected')) return;
        state.tempCalibration[step.id] = btn.dataset.value;
        btn.classList.add('active');
        DOM.container.querySelectorAll('.mn-chip').forEach(b => { if (b !== btn) { b.style.opacity = '0.3'; b.style.pointerEvents = 'none'; } });
        setTimeout(() => {
          DOM.container.style.opacity = '0';
          DOM.container.style.transform = 'translateY(-20px)';
          setTimeout(() => {
            DOM.container.style.opacity = '1';
            DOM.container.style.transform = 'translateY(0)';
            renderCalibrationFlow(stepIndex + 1);
          }, 300);
        }, 400);
      });
    });

    if (stepIndex > 0) document.getElementById('btn-back-cal')?.addEventListener('click', () => renderCalibrationFlow(stepIndex - 1));
  };

  // ═══════════════════════════════════════════════════════════
  // CONTEXT DASHBOARD
  // ═══════════════════════════════════════════════════════════

  const renderContextDashboard = () => {
    updateProgressBar(0);
    const html = `
      <div class="mn-dashboard mn-fade-in" style="background:#050505;">
        <!-- Top Nav: Gift Mode Toggle (STATE 1 spec) -->
        <div style="display:flex;align-items:center;background:rgba(255,255,255,0.04);border-radius:30px;padding:3px;border:1px solid rgba(255,255,255,0.08);margin-bottom:20px;">
          <button id="mn-toggle-self" class="mn-mode-toggle active">👤 Styling Me</button>
          <button id="mn-toggle-gift" class="mn-mode-toggle">🎁 Gift a Friend</button>
        </div>

        <!-- Premium Header -->
        <div class="mn-premium-header">
          <div class="mn-header-top">
            <div class="mn-orb-icon">
              <div class="mn-orb-glow"></div>
              <div class="mn-orb-core"></div>
            </div>
            <h2 class="mn-premium-title">AI Fashion Consultant</h2>
          </div>
          
          <!-- AI Avatar Section with Photo -->
          <div class="mn-ai-avatar-section">
            <div class="mn-avatar-photo">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop" alt="AI Consultant" class="mn-avatar-img" />
            </div>
            <div class="mn-greeting-text">
              <p class="mn-premium-greeting">Hey! I just analyzed the latest drops. What vibe are we going for today?</p>
            </div>
          </div>
        </div>

        <!-- HERO: Magic Mirror Upload (Camera-first) -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:24px;margin-bottom:20px;text-align:center;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(57,165,150,0.06) 0%,transparent 70%);pointer-events:none;"></div>
          <div style="font-size:44px;margin-bottom:12px;animation:float 3s ease-in-out infinite;position:relative;">📸</div>
          <p style="color:#fff;font-size:15px;font-weight:800;margin-bottom:4px;position:relative;">Don't tell us your style.</p>
          <p style="color:#39A596;font-size:16px;font-weight:800;margin-bottom:8px;position:relative;">Show us.</p>
          <p style="color:#666;font-size:11px;margin-bottom:18px;line-height:1.5;position:relative;">Drop one mirror selfie. Our AI will read your vibe, digitize your closet, and level up your aesthetic — in 10 seconds flat.</p>
          <button id="btn-hero-upload" class="mn-btn-primary mn-btn-glow" style="width:100%;padding:16px;font-size:15px;font-weight:800;position:relative;">📸 Snap / Upload Fit Check</button>
          <input type="file" id="hero-upload-input" accept="image/*" style="display:none" />
        </div>
        
        <!-- Identity Bar -->
        <div class="mn-identity-bar" style="flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
            <div class="mn-identity-info">
              <span class="mn-identity-dot"></span>
              <span class="mn-identity-label">Style Profile:</span>
              <span class="mn-identity-value">${state.identity.coreExpression}</span>
            </div>
            <button id="mn-recalibrate-btn" class="mn-text-link">🔄 Recalibrate</button>
          </div>
        </div>
        
        <!-- Profile Completion Progress Bar -->
        ${(() => {
        const completion = getProfileCompletion();
        const jewels = state.identity.jewelryRecommendations || [];
        return `
          <div class="mn-profile-completion" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 20px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <span style="color:#fff;font-size:13px;font-weight:700;">Profile Completion</span>
              <span style="color:${completion.percentage === 100 ? '#4fffd9' : '#39A596'};font-size:13px;font-weight:800;">${completion.percentage}%</span>
            </div>
            <div class="mn-completion-bar" style="width:100%;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;margin-bottom:12px;">
              <div class="mn-completion-fill" style="width:${completion.percentage}%;height:100%;background:${completion.percentage === 100 ? 'linear-gradient(90deg,#4fffd9,#39A596)' : 'linear-gradient(90deg,#39A596,#4fffd9)'};border-radius:3px;transition:width 1s cubic-bezier(0.34,1.56,0.64,1);"></div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
              ${completion.fields.map(f => `
                <span style="font-size:10px;padding:3px 10px;border-radius:20px;font-weight:600;letter-spacing:0.3px;
                  ${f.filled
            ? 'background:rgba(57,165,150,0.15);color:#4fffd9;border:1px solid rgba(57,165,150,0.3);'
            : 'background:rgba(255,255,255,0.05);color:#666;border:1px solid rgba(255,255,255,0.08);'
          }">${f.filled ? '✓' : '○'} ${f.label}</span>
              `).join('')}
            </div>
            ${jewels.length > 0 ? `
              <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;margin-top:6px;">
                <p style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">💎 AI Jewelry Suggestions</p>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                  ${jewels.slice(0, 4).map(j => `
                    <span style="font-size:10px;padding:4px 10px;border-radius:20px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);color:#ffd700;font-weight:600;">${j.type}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            ${completion.percentage < 100 ? `
              <p style="color:#888;font-size:11px;text-align:center;margin-top:10px;line-height:1.5;font-style:italic;">✨ Complete the profile to get the best results and optimization</p>
            ` : `
              <p style="color:#4fffd9;font-size:11px;text-align:center;margin-top:10px;line-height:1.5;font-weight:700;">🎉 Profile complete! You'll get the most accurate recommendations.</p>
            `}
          </div>`;
      })()}
        
        <!-- Suggestion Chips -->
        <div class="mn-suggestion-chips">
          <button class="mn-suggestion-chip" data-fill="Opium darkwear aesthetic">🖤 Opium Darkwear</button>
          <button class="mn-suggestion-chip" data-fill="Old money quiet luxury">🏛️ Old Money</button>
          <button class="mn-suggestion-chip" data-fill="Y2K grunge revival">🔗 Y2K Grunge</button>
          <button class="mn-suggestion-chip" data-fill="Gorpcore techwear utility">🧬 Gorpcore</button>
        </div>
        
        <!-- Cloth Upload + My Closet Section -->
        <div class="mn-cloth-upload-section">
          <button id="btn-upload-cloth" class="mn-upload-btn">
            <span class="mn-upload-icon">📸</span>
            <span class="mn-upload-text">Upload Clothing Photo</span>
            <span class="mn-upload-subtitle">AI will detect &amp; save to your closet</span>
          </button>
          <button id="btn-my-closet" class="mn-my-closet-btn">
            <span class="mn-upload-icon">👗</span>
            <span class="mn-upload-text">My Digital Closet</span>
            <span id="mn-closet-badge" class="mn-closet-badge" style="display:none">0</span>
          </button>
          <button id="btn-past-looks" class="mn-my-closet-btn" style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(167,139,250,0.08));border-color:rgba(139,92,246,0.4);">
            <span class="mn-upload-icon">✨</span>
            <span class="mn-upload-text">Past Looks</span>
            <span id="mn-history-badge" class="mn-closet-badge" style="display:none;background:linear-gradient(135deg,#7c3aed,#a78bfa);">0</span>
          </button>
          <button id="btn-locker-room" class="mn-my-closet-btn" style="background:linear-gradient(135deg,rgba(57,165,150,0.12),rgba(57,165,150,0.05));border-color:rgba(57,165,150,0.35);grid-column:span 2;">
            <span class="mn-upload-icon">🔒</span>
            <span class="mn-upload-text">My Locker Room</span>
          </button>
          <input type="file" id="cloth-upload-input" accept="image/*" style="display:none" multiple />
        </div>

        <!-- Premium Input Bar -->
        <div class="mn-generate-bar">
          <input type="text" id="mn-generate-input" class="mn-generate-input" placeholder="Generate a new design..." autocomplete="off" />
          <button id="mn-generate-btn" class="mn-generate-btn" aria-label="Generate">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <!-- Mode Selection -->
        <h3 class="mn-dashboard-subtitle">or choose your mode:</h3>
        <div class="mn-mode-grid">
          <button id="btn-mode-self" class="mn-mode-card" style="animation-delay: 0.1s">
            <div class="mn-mode-icon">👤</div>
            <div class="mn-mode-title">Designing for Myself</div>
            <div class="mn-mode-description">Get personalized outfit recommendations</div>
          </button>
          <button id="btn-mode-gift" class="mn-mode-card" style="animation-delay: 0.2s">
            <div class="mn-mode-icon">🎁</div>
            <div class="mn-mode-title">Gift for Someone</div>
            <div class="mn-mode-description">Find the perfect style for them</div>
          </button>
        </div>
      </div>
    `;

    DOM.container.innerHTML = html;
    DOM.container.style.opacity = '1';
    DOM.container.style.transform = 'translateY(0)';

    const generateInput = document.getElementById('mn-generate-input');
    const generateBtn = document.getElementById('mn-generate-btn');

    // Hero upload button (Magic Mirror from Dashboard)
    const heroUploadBtn = document.getElementById('btn-hero-upload');
    const heroUploadInput = document.getElementById('hero-upload-input');
    if (heroUploadBtn && heroUploadInput) {
      heroUploadBtn.addEventListener('click', () => heroUploadInput.click());
      heroUploadInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleMagicMirrorUpload(e);
      });
    }

    // Chip click → autofill input
    DOM.container.querySelectorAll('.mn-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const fillText = chip.dataset.fill;
        if (fillText && generateInput) {
          generateInput.value = fillText;
          generateInput.focus();
          // Brief visual feedback on chip
          chip.classList.add('mn-chip-selected');
          setTimeout(() => chip.classList.remove('mn-chip-selected'), 600);
        }
      });
    });

    // Generate button click → route as self context
    generateBtn.addEventListener('click', () => {
      const query = generateInput.value.trim();
      if (query) {
        state.currentContext = { mode: 'self', contexts: [query], loudness: 'Balanced' };
        if (hasBodyData()) generateAIRecommendations();
        else renderSelfContext();
      } else {
        renderSelfContext();
      }
    });

    // Enter key on input
    generateInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') generateBtn.click();
    });

    document.getElementById('btn-mode-self').addEventListener('click', renderSelfContext);
    document.getElementById('btn-mode-gift').addEventListener('click', renderGiftContext);

    // Gift mode toggle at top of dashboard
    const toggleSelf = document.getElementById('mn-toggle-self');
    const toggleGift = document.getElementById('mn-toggle-gift');
    if (toggleSelf && toggleGift) {
      toggleSelf.addEventListener('click', () => {
        toggleSelf.style.background = 'linear-gradient(135deg,#39A596,#2d8a7a)';
        toggleSelf.style.color = '#fff';
        toggleGift.style.background = 'transparent';
        toggleGift.style.color = '#888';
      });
      toggleGift.addEventListener('click', () => {
        toggleGift.style.background = 'linear-gradient(135deg,#39A596,#2d8a7a)';
        toggleGift.style.color = '#fff';
        toggleSelf.style.background = 'transparent';
        toggleSelf.style.color = '#888';
        renderGiftContext();
      });
    }

    document.getElementById('mn-recalibrate-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to recalibrate your identity? This will restart the calibration process.')) {
        clearIdentity();
        renderCalibrationFlow(0);
      }
    });

    // Cloth Upload Handler
    const clothUploadBtn = document.getElementById('btn-upload-cloth');
    const clothUploadInput = document.getElementById('cloth-upload-input');
    if (clothUploadBtn && clothUploadInput) {
      clothUploadBtn.addEventListener('click', () => clothUploadInput.click());
      clothUploadInput.addEventListener('change', handleClothUpload);
    }

    // My Closet Button + Badge Count
    const myClosetBtn = document.getElementById('btn-my-closet');
    const closetBadge = document.getElementById('mn-closet-badge');
    try {
      const richCloset = JSON.parse(localStorage.getItem('mn_digital_closet') || '[]');
      if (closetBadge && richCloset.length > 0) {
        closetBadge.textContent = richCloset.length;
        closetBadge.style.display = 'inline-flex';
      }
    } catch (e) { }
    if (myClosetBtn) myClosetBtn.addEventListener('click', renderMyCloset);

    // Past Looks Button + Badge Count
    const pastLooksBtn = document.getElementById('btn-past-looks');
    const historyBadge = document.getElementById('mn-history-badge');
    try {
      const history = JSON.parse(localStorage.getItem('mn_outfit_history') || '[]');
      if (historyBadge && history.length > 0) {
        historyBadge.textContent = history.length;
        historyBadge.style.display = 'inline-flex';
      }
    } catch (e) { }
    if (pastLooksBtn) pastLooksBtn.addEventListener('click', renderPastLooks);

    // My Locker Room Button
    const lockerRoomBtn = document.getElementById('btn-locker-room');
    if (lockerRoomBtn) lockerRoomBtn.addEventListener('click', renderLockerRoom);
  };

  // ═══════════════════════════════════════════════════════════
  // MY DIGITAL CLOSET VIEW
  // ═══════════════════════════════════════════════════════════

  const CLOSET_CATEGORY_EMOJI = {
    // ── Broad sections ──
    'Topwear': '👕', 'Bottomwear': '👖', 'Footwear': '👟', 'Outerwear': '🧥',
    'Ethnic Wear': '👘', 'Ethnic': '👘', 'Accessories': '🧣', 'Innerwear': '🩲',
    'Sportswear': '🏃', 'Sleepwear': '😴', 'Swimwear': '🩱',
    'Bags': '👜', 'Jewellery': '💍', 'Unknown': '👔',
    // ── Ethnic / Indian ── (from generative-ui-demo.html)
    'Kurta': '👘', 'Kurti': '👘', 'Kurta Pyjama': '👘', 'Sherwani': '🤵',
    'Saree': '🥻', 'Sari': '🥻', 'Half Saree': '🥻',
    'Lehenga': '👗', 'Lehenga Choli': '👗', 'Anarkali': '👗',
    'Salwar Kameez': '👗', 'Churidar': '👗', 'Palazzo': '👗', 'Sharara': '👗',
    'Dupatta': '🧣', 'Stole': '🧣', 'Scarf': '🧣', 'Shawl': '🧣',
    'Dhoti': '🩱', 'Lungi': '🩱', 'Veshti': '🩱',
    // ── Tops ──
    'T-Shirt': '👕', 'Tshirt': '👕', 'Crop Top': '👕', 'Tank Top': '👕', 'Halter Top': '👕',
    'Shirt': '👔', 'Formal Shirt': '👔', 'Oxford Shirt': '👔',
    'Sweater': '🧶', 'Pullover': '🧶', 'Knitwear': '🧶', 'Cardigan': '🧶',
    // ── Outerwear ──
    'Blazer': '🧥', 'Suit': '🤵', 'Waistcoat': '🦺', 'Vest': '🦺',
    'Jacket': '🧥', 'Bomber Jacket': '🧥', 'Denim Jacket': '🧥',
    'Hoodie': '🧥', 'Sweatshirt': '🧥', 'Coat': '🧥', 'Overcoat': '🧥',
    'Trench Coat': '🧥',
    // ── Dresses / Skirts ──
    'Dress': '👗', 'Maxi Dress': '👗', 'Mini Dress': '👗', 'Midi Dress': '👗', 'Wrap Dress': '👗',
    'Skirt': '👗', 'Mini Skirt': '👗', 'Maxi Skirt': '👗', 'Pencil Skirt': '👗',
    // ── Bottoms ──
    'Jeans': '👖', 'Denim': '👖', 'Skinny Jeans': '👖', 'Slim Jeans': '👖', 'Bootcut Jeans': '👖',
    'Trousers': '👖', 'Chinos': '👖', 'Pants': '👖', 'Formal Trousers': '👖', 'Slacks': '👖',
    'Shorts': '🩳', 'Bermuda Shorts': '🩳', 'Cargo Shorts': '🩳',
    'Track Pants': '🏃', 'Joggers': '🏃', 'Sweatpants': '🏃', 'Leggings': '🏃',
    // ── Footwear ──
    'Sneakers': '👟', 'Running Shoes': '👟', 'Sports Shoes': '👟', 'Canvas Shoes': '👟',
    'Loafers': '🥿', 'Moccasins': '🥿', 'Slip-Ons': '🥿',
    'Formal Shoes': '👞', 'Oxford Shoes': '👞', 'Derby Shoes': '👞', 'Brogues': '👞',
    'Boots': '👢', 'Chelsea Boots': '👢', 'Ankle Boots': '👢', 'Knee Boots': '👢',
    'Sandals': '👡', 'Heels': '👠', 'Stilettos': '👠', 'Wedges': '👠', 'Block Heels': '👠',
    'Juttis': '🥿', 'Kolhapuri': '🥿', 'Mojaris': '🥿', 'Chappal': '🥿', 'Slippers': '🩴',
    // ── Accessories ──
    'Watch': '⌚', 'Smartwatch': '⌚',
    'Belt': '🪢', 'Tie': '👔', 'Bow Tie': '🎀',
    'Hat': '🎩', 'Cap': '🧢', 'Beanie': '🧢', 'Beret': '🎩', 'Turban': '🧢',
    'Sunglasses': '🕶️', 'Glasses': '👓',
    'Handbag': '👜', 'Purse': '👛', 'Clutch': '👛', 'Tote Bag': '👜',
    'Backpack': '🎒', 'Sling Bag': '👜',
    'Necklace': '📿', 'Earrings': '💎', 'Bracelet': '💎',
    'Ring': '💍', 'Bangle': '💍', 'Anklet': '💎',
    'Mangalsutra': '📿', 'Maang Tikka': '💎', 'Nose Pin': '💎',
    // ── Swimwear / Innerwear / Sleepwear ──
    'Swimsuit': '🩱', 'Bikini': '👙', 'Trunks': '🩲',
    'Pyjama': '😴', 'Nightgown': '😴', 'Robe': '😴'
  };

  // Case-insensitive lookup into CLOSET_CATEGORY_EMOJI
  const emojiLookup = (key) => {
    if (!key) return null;
    // Direct match
    if (CLOSET_CATEGORY_EMOJI[key]) return CLOSET_CATEGORY_EMOJI[key];
    // Title-case match (e.g. "shirt" → "Shirt")
    const titled = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    if (CLOSET_CATEGORY_EMOJI[titled]) return CLOSET_CATEGORY_EMOJI[titled];
    // Case-insensitive scan through all keys
    const lk = key.toLowerCase();
    const found = Object.keys(CLOSET_CATEGORY_EMOJI).find(k => k.toLowerCase() === lk);
    if (found) return CLOSET_CATEGORY_EMOJI[found];
    return null;
  };

  // Get the best emoji for an item — checks specific name first, then section
  const getItemEmoji = (item) => {
    const name = (item.original_name || item.name || '').trim();
    // Try exact name match (case-insensitive)
    const exact = emojiLookup(name);
    if (exact) return exact;
    // Try each word in the name
    const words = name.split(/\s+/);
    for (const word of words) {
      const wordMatch = emojiLookup(word);
      if (wordMatch) return wordMatch;
    }
    // Try type field (e.g. "shirt", "jeans" from outfit_pieces)
    if (item.type) { const t = emojiLookup(item.type); if (t) return t; }
    // Try slot field (e.g. "top", "bottom", "footwear")
    if (item.slot) { const s = emojiLookup(item.slot); if (s) return s; }
    // Try category/sub_category
    if (item.category) { const c = emojiLookup(item.category); if (c) return c; }
    if (item.sub_category) { const sc = emojiLookup(item.sub_category); if (sc) return sc; }
    // Fall back to broad section
    const section = item.closet_section || item.category || 'Unknown';
    return emojiLookup(section) || '👔';
  };

  const renderMyCloset = () => {
    let closetItems = [];
    try { closetItems = JSON.parse(localStorage.getItem('mn_digital_closet') || '[]'); } catch (e) { }

    // Group items by closet_section / category
    const grouped = {};
    closetItems.forEach(item => {
      const section = item.closet_section || item.category || 'Unknown';
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(item);
    });
    const sections = Object.keys(grouped);

    const emptyState = `
      <div style="text-align:center; padding:60px 20px;">
        <div style="font-size:80px; margin-bottom:20px; animation: float 3s ease-in-out infinite;">👗</div>
        <h3 style="font-family:'Playfair Display',serif; font-size:24px; margin-bottom:12px; color:#fff;">Your closet is empty</h3>
        <p style="color:#aaa; font-size:14px; line-height:1.6; margin-bottom:30px;">Upload clothing photos and our AI will detect &amp; organise each item automatically.</p>
        <button id="btn-closet-upload-empty" class="mn-upload-btn" style="margin:0 auto; max-width:260px;">
          <span class="mn-upload-icon">📸</span>
          <span class="mn-upload-text">Upload Your First Photo</span>
        </button>
        <input type="file" id="cloth-upload-input-closet" accept="image/*" style="display:none" multiple />
      </div>`;

    const html = `
      <div class="mn-my-closet-view mn-fade-in">

        <!-- Back + Header -->
        <div class="mn-closet-view-header">
          <button class="mn-back-btn" id="btn-back-closet">← Back</button>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <h2 class="mn-closet-view-title">Your Digital Closet</h2>
              <p class="mn-closet-view-subtitle">${closetItems.length} item${closetItems.length !== 1 ? 's' : ''} · Click ✨ to style any piece</p>
            </div>
            ${closetItems.length > 0 ? `
              <button id="btn-closet-add-more" class="mn-my-closet-btn" style="width:auto; padding:10px 18px; gap:6px;">
                <span>📸</span><span style="font-size:13px; font-weight:700;">Add More</span>
              </button>
              <input type="file" id="cloth-upload-input-closet" accept="image/*" style="display:none" multiple />
            ` : ''}
          </div>

          ${closetItems.length > 0 ? `
          <!-- Search + Filter Bar -->
          <div class="mn-closet-search-bar">
            <div class="mn-closet-search-input-wrap">
              <span class="mn-closet-search-icon">🔍</span>
              <input type="text" id="mn-closet-search" class="mn-closet-search-input" placeholder="Search your closet…" autocomplete="off" />
              <button id="mn-closet-search-clear" class="mn-closet-search-clear" style="display:none">✕</button>
            </div>
          </div>
          <!-- Filter Pills -->
          <div class="mn-closet-filter-pills" id="mn-closet-filters">
            <button class="mn-filter-pill active" data-filter="all">All <span class="mn-filter-count">${closetItems.length}</span></button>
            ${sections.map(s => `<button class="mn-filter-pill" data-filter="${s}">${CLOSET_CATEGORY_EMOJI[s] || '👔'} ${s} <span class="mn-filter-count">${grouped[s].length}</span></button>`).join('')}
            ${closetItems.some(i => i.occasion === 'Casual') ? `<button class="mn-filter-pill" data-filter-occasion="Casual">☀️ Casual</button>` : ''}
            ${closetItems.some(i => i.occasion === 'Festive' || i.occasion === 'Party') ? `<button class="mn-filter-pill" data-filter-occasion="Festive">🎉 Festive</button>` : ''}
            ${closetItems.some(i => i.occasion === 'Formal' || i.occasion === 'Workwear') ? `<button class="mn-filter-pill" data-filter-occasion="Formal">💼 Formal</button>` : ''}
            ${closetItems.some(i => i.season === 'Summer') ? `<button class="mn-filter-pill" data-filter-season="Summer">🌤 Summer</button>` : ''}
            ${closetItems.some(i => i.season === 'Winter') ? `<button class="mn-filter-pill" data-filter-season="Winter">❄️ Winter</button>` : ''}
          </div>
          ` : ''}
        </div>

        ${closetItems.length === 0 ? emptyState : sections.map(section => `
          <!-- Section: ${section} -->
          <div class="mn-closet-section-block mn-fade-in">
            <div class="mn-closet-section-label">
              <span>${CLOSET_CATEGORY_EMOJI[section] || '👔'}</span>
              <span style="text-transform:capitalize;">${section}</span>
              <span class="mn-closet-section-count">${grouped[section].length}</span>
            </div>
            <div class="mn-closet-grid">
              ${grouped[section].map((item, idx) => `
                <div class="mn-closet-card scale-in" style="animation-delay:${idx * 40}ms;" data-item-id="${item.item_id || ''}">
                  <div class="mn-closet-card-content">
                    <!-- Color Swatch -->
                    <div class="mn-closet-color-swatch" style="background:${item.hex_color || item.color_hex || getColorHex(item.color)}"></div>
                    <!-- Emoji -->
                    <div class="mn-closet-card-emoji">${getItemEmoji(item)}</div>
                    <!-- Name -->
                    <div class="mn-closet-card-title">${item.original_name || item.name || 'Item'}</div>
                    <!-- Meta chips -->
                    <div class="mn-closet-card-meta">
                      ${item.color ? `<span class="mn-closet-meta-chip">${item.color}</span>` : ''}
                      ${item.fabric ? `<span class="mn-closet-meta-chip">${item.fabric}</span>` : ''}
                      ${item.fit ? `<span class="mn-closet-meta-chip">${item.fit}</span>` : ''}
                    </div>
                    <!-- Occasion + Season -->
                    <div class="mn-closet-card-tags">
                      ${item.occasion ? `<span class="mn-closet-tag-pill">📅 ${item.occasion}</span>` : ''}
                      ${item.season ? `<span class="mn-closet-tag-pill">🌤 ${item.season}</span>` : ''}
                    </div>
                    <!-- Style tags -->
                    ${item.style_tags && item.style_tags.length ? `
                      <div class="mn-closet-style-tags">
                        ${item.style_tags.slice(0, 3).map(t => `<span class="mn-closet-style-tag">${t}</span>`).join('')}
                      </div>` : ''}
                    <!-- Category badge -->
                    <div class="mn-closet-card-badge">${section}</div>
                    <!-- Style action button -->
                    <div class="mn-closet-card-action" data-item-name="${(item.original_name || item.name || '').replace(/"/g, '&quot;')}" title="Style this item">✨</div>
                    <!-- Delete button -->
                    <div class="mn-closet-card-delete" data-item-id="${item.item_id || item.id || ''}" title="Remove">✕</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

        ${closetItems.length > 0 ? `
          <div style="text-align:center; margin-top:30px; padding-bottom:20px;">
            <button id="btn-clear-closet" style="background:transparent; border:1px solid rgba(255,100,100,0.4); color:rgba(255,100,100,0.7); padding:8px 20px; border-radius:20px; font-size:12px; cursor:pointer; font-family:inherit; transition:all 0.3s;">🗑 Clear All Items</button>
          </div>
        ` : ''}
      </div>
    `;

    DOM.container.innerHTML = html;

    // Back button
    document.getElementById('btn-back-closet').addEventListener('click', renderContextDashboard);

    // ── Search + Filter logic ──────────────────────────────────
    const searchInput = document.getElementById('mn-closet-search');
    const searchClear = document.getElementById('mn-closet-search-clear');
    const filterPills = document.querySelectorAll('.mn-filter-pill');
    let activeSection = 'all', activeOccasion = null, activeSeason = null;

    const applyFilters = () => {
      const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
      DOM.container.querySelectorAll('.mn-closet-card').forEach(card => {
        const id = card.dataset.itemId;
        const item = closetItems.find(i => (i.item_id || i.id || '') == id) || {};
        const name = (item.original_name || item.name || '').toLowerCase();
        const color = (item.color || '').toLowerCase();
        const fabric = (item.fabric || '').toLowerCase();
        const tags = (item.style_tags || []).join(' ').toLowerCase();
        const sec = item.closet_section || item.category || 'Unknown';
        const matchSearch = !q || name.includes(q) || color.includes(q) || fabric.includes(q) || tags.includes(q);
        const matchSection = activeSection === 'all' || sec === activeSection;
        const matchOccasion = !activeOccasion || (item.occasion || '').toLowerCase().includes(activeOccasion.toLowerCase());
        const matchSeason = !activeSeason || (item.season || '').toLowerCase().includes(activeSeason.toLowerCase());
        const visible = matchSearch && matchSection && matchOccasion && matchSeason;
        card.style.display = visible ? '' : 'none';
      });
      // Hide section headers if all cards in that section are hidden
      DOM.container.querySelectorAll('.mn-closet-section-block').forEach(block => {
        const anyVisible = [...block.querySelectorAll('.mn-closet-card')].some(c => c.style.display !== 'none');
        block.style.display = anyVisible ? '' : 'none';
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (searchClear) searchClear.style.display = searchInput.value ? 'block' : 'none';
        applyFilters();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        applyFilters();
      });
    }

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        // Section filters
        if (pill.dataset.filter !== undefined) {
          activeSection = pill.dataset.filter;
          activeOccasion = null; activeSeason = null;
          filterPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
        }
        // Occasion filters
        if (pill.dataset.filterOccasion !== undefined) {
          if (activeOccasion === pill.dataset.filterOccasion) {
            activeOccasion = null; pill.classList.remove('active');
          } else {
            activeOccasion = pill.dataset.filterOccasion;
            filterPills.forEach(p => { if (p.dataset.filterOccasion) p.classList.remove('active'); });
            pill.classList.add('active');
          }
        }
        // Season filters
        if (pill.dataset.filterSeason !== undefined) {
          if (activeSeason === pill.dataset.filterSeason) {
            activeSeason = null; pill.classList.remove('active');
          } else {
            activeSeason = pill.dataset.filterSeason;
            filterPills.forEach(p => { if (p.dataset.filterSeason) p.classList.remove('active'); });
            pill.classList.add('active');
          }
        }
        applyFilters();
      });
    });

    // Add more upload
    const addMoreBtn = document.getElementById('btn-closet-add-more');
    const addMoreInput = document.getElementById('cloth-upload-input-closet');
    if (addMoreBtn && addMoreInput) {
      addMoreBtn.addEventListener('click', () => addMoreInput.click());
      addMoreInput.addEventListener('change', handleClothUpload);
    }
    // Empty state upload
    const emptyUploadBtn = document.getElementById('btn-closet-upload-empty');
    const emptyUploadInput = document.getElementById('cloth-upload-input-closet');
    if (emptyUploadBtn && emptyUploadInput) {
      emptyUploadBtn.addEventListener('click', () => emptyUploadInput.click());
      emptyUploadInput.addEventListener('change', handleClothUpload);
    }

    // Style item action (✨ button) — pre-fills AI with color + name + occasion
    DOM.container.querySelectorAll('.mn-closet-card-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('.mn-closet-card')?.dataset.itemId;
        const item = id ? closetItems.find(i => (i.item_id || i.id || '') == id) : null;
        const itemName = item ? (item.original_name || item.name) : btn.dataset.itemName;
        const color = item?.color ? item.color + ' ' : '';
        const occasion = item?.occasion ? ` for ${item.occasion}` : '';
        const prompt = `Create a complete outfit around my ${color}${itemName}${occasion}`;
        state.currentContext = { mode: 'self', contexts: [prompt], loudness: 'Balanced', anchorItem: item };
        if (hasBodyData()) generateAIRecommendations();
        else renderSelfContext();
      });
    });

    // Delete item
    DOM.container.querySelectorAll('.mn-closet-card-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.itemId;
        if (!itemId) return;
        try {
          let closet = JSON.parse(localStorage.getItem('mn_digital_closet') || '[]');
          closet = closet.filter(i => (i.item_id || i.id || '') != itemId);
          localStorage.setItem('mn_digital_closet', JSON.stringify(closet));
          // Animate card out then re-render
          const card = btn.closest('.mn-closet-card');
          if (card) { card.style.transition = 'all 0.3s'; card.style.opacity = '0'; card.style.transform = 'scale(0.8)'; }
          setTimeout(() => renderMyCloset(), 320);
        } catch (e2) { console.error(e2); }
      });
    });

    // Clear all
    const clearBtn = document.getElementById('btn-clear-closet');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Remove all items from your digital closet?')) {
          localStorage.removeItem('mn_digital_closet');
          renderMyCloset();
        }
      });
    }
  };

  // Helper: map color name to approximate hex
  const getColorHex = (colorName) => {
    const map = {
      'black': '#1a1a1a', 'white': '#f5f5f5', 'navy': '#1b2a4a', 'blue': '#2563eb',
      'red': '#dc2626', 'green': '#16a34a', 'yellow': '#ca8a04', 'orange': '#ea580c',
      'pink': '#ec4899', 'purple': '#7c3aed', 'grey': '#6b7280', 'gray': '#6b7280',
      'brown': '#92400e', 'beige': '#d4b896', 'maroon': '#7f1d1d', 'teal': '#0d9488',
      'cream': '#fef3c7', 'gold': '#b45309', 'silver': '#94a3b8', 'olive': '#4d7c0f',
      'mustard': '#b45309', 'coral': '#f97316', 'lavender': '#a78bfa', 'khaki': '#a3883f',
      'indigo': '#4338ca', 'cyan': '#0891b2', 'mint': '#34d399', 'peach': '#fbbf24',
    };
    const key = (colorName || '').toLowerCase().split(' ')[0];
    return map[key] || '#39A596';
  };

  // ═══════════════════════════════════════════════════════════
  // PAST LOOKS (Outfit History)
  // ═══════════════════════════════════════════════════════════

  const renderPastLooks = () => {
    let history = [];
    try { history = JSON.parse(localStorage.getItem('mn_outfit_history') || '[]'); } catch (e) { }

    const formatDate = (iso) => {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const modeIcon = (mode) => mode === 'gift' ? '🎁' : '👤';

    const emptyState = `
      <div style="text-align:center;padding:60px 20px;">
        <div style="font-size:80px;margin-bottom:20px;animation:float 3s ease-in-out infinite;">✨</div>
        <h3 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:12px;color:#fff;">No looks yet</h3>
        <p style="color:#aaa;font-size:14px;line-height:1.6;margin-bottom:30px;">Every outfit the AI creates for you is saved here automatically.</p>
        <button id="btn-create-first-look" class="mn-btn-primary" style="margin:0 auto;max-width:240px;">✨ Create Your First Look</button>
      </div>`;

    const html = `
      <div class="mn-past-looks-view mn-fade-in">
        <div class="mn-closet-view-header">
          <button class="mn-back-btn" id="btn-back-history">← Back</button>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <div>
              <h2 class="mn-closet-view-title">Past Looks</h2>
              <p class="mn-closet-view-subtitle">${history.length} outfit${history.length !== 1 ? 's' : ''} saved · AI-generated for you</p>
            </div>
            ${history.length > 0 ? `<button id="btn-clear-history" style="background:transparent;border:1px solid rgba(255,100,100,0.4);color:rgba(255,100,100,0.7);padding:7px 14px;border-radius:20px;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.3s;">🗑 Clear All</button>` : ''}
          </div>
        </div>

        ${history.length === 0 ? emptyState : history.map((look, idx) => {
      const ownedPieces = (look.outfit_pieces || []).filter(p => p.owned);
      const buyPieces = (look.outfit_pieces || []).filter(p => !p.owned);
      return `
          <div class="mn-look-card mn-fade-in" style="animation-delay:${idx * 60}ms;" data-look-id="${look.id}">
            <!-- Header -->
            <div class="mn-look-card-header">
              <div class="mn-look-meta">
                <span class="mn-look-mode-badge">${modeIcon(look.mode)} ${look.mode === 'gift' ? 'Gift' : 'Personal'}</span>
                <span class="mn-look-date">${formatDate(look.savedAt)}</span>
              </div>
              <button class="mn-look-delete" data-look-id="${look.id}" title="Remove">✕</button>
            </div>
            <!-- Direction -->
            <p class="mn-look-direction">"${look.direction || look.context || 'AI Outfit'}"</p>
            <!-- Outfit pieces strip -->
            <div class="mn-look-pieces-strip">
              ${(look.outfit_pieces || []).map(piece => `
                <div class="mn-look-piece-dot" title="${piece.name}" style="background:${piece.color || '#39A596'};">
                  <span class="mn-look-piece-emoji">${getItemEmoji({ name: piece.type || piece.name, closet_section: piece.slot })}</span>
                  ${piece.owned ? '<span class="mn-look-owned-dot">✓</span>' : ''}
                </div>
              `).join('')}
            </div>
            <!-- Piece names -->
            <div class="mn-look-piece-names">
              ${(look.outfit_pieces || []).map(p => `<span class="mn-look-piece-name ${p.owned ? 'owned' : ''}">${p.name}</span>`).join('')}
            </div>
            <!-- Stats row -->
            <div class="mn-look-stats">
              ${ownedPieces.length > 0 ? `<span class="mn-look-stat owned">✅ ${ownedPieces.length} owned</span>` : ''}
              ${buyPieces.length > 0 ? `<span class="mn-look-stat buy">🛍️ ${buyPieces.length} to buy</span>` : ''}
              <span class="mn-look-stat occasion">📅 ${look.occasion || look.context || 'Outfit'}</span>
            </div>
            <!-- Actions -->
            <div class="mn-look-actions">
              <button class="mn-look-btn-recreate" data-look-idx="${idx}">🔄 Recreate This Look</button>
              <button class="mn-look-btn-complete" data-look-idx="${idx}">👗 Complete From Closet</button>
            </div>
          </div>`;
    }).join('')}

        ${history.length > 0 ? `<div style="height:20px;"></div>` : ''}
      </div>`;

    DOM.container.innerHTML = html;

    document.getElementById('btn-back-history').addEventListener('click', renderContextDashboard);

    // Create first look CTA
    const firstLookBtn = document.getElementById('btn-create-first-look');
    if (firstLookBtn) firstLookBtn.addEventListener('click', () => { renderContextDashboard(); });

    // Clear all history
    const clearHistBtn = document.getElementById('btn-clear-history');
    if (clearHistBtn) clearHistBtn.addEventListener('click', () => {
      if (confirm('Remove all saved looks?')) {
        localStorage.removeItem('mn_outfit_history');
        renderPastLooks();
      }
    });

    // Delete single look
    DOM.container.querySelectorAll('.mn-look-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.lookId;
        let hist = JSON.parse(localStorage.getItem('mn_outfit_history') || '[]');
        hist = hist.filter(l => l.id !== id);
        localStorage.setItem('mn_outfit_history', JSON.stringify(hist));
        const card = btn.closest('.mn-look-card');
        if (card) { card.style.transition = 'all 0.3s'; card.style.opacity = '0'; card.style.transform = 'scale(0.9)'; }
        setTimeout(() => renderPastLooks(), 300);
      });
    });

    // Recreate look — re-run same context through AI
    DOM.container.querySelectorAll('.mn-look-btn-recreate').forEach(btn => {
      btn.addEventListener('click', () => {
        const look = history[parseInt(btn.dataset.lookIdx)];
        if (!look) return;
        state.currentContext = { mode: look.mode || 'self', contexts: [look.context || look.occasion || 'Casual'], loudness: look.loudness || 'Balanced' };
        if (hasBodyData()) generateAIRecommendations();
        else renderSelfContext();
      });
    });

    // Complete from closet — run local matching algorithm
    DOM.container.querySelectorAll('.mn-look-btn-complete').forEach(btn => {
      btn.addEventListener('click', () => {
        const look = history[parseInt(btn.dataset.lookIdx)];
        if (!look) return;
        renderCompleteThisOutfit(look.outfit_pieces || [], look.direction || look.context);
      });
    });
  };

  // ═══════════════════════════════════════════════════════════
  // COMPLETE THIS OUTFIT — Local Closet Matching (no GPT)
  // ═══════════════════════════════════════════════════════════

  const renderCompleteThisOutfit = (outfitPieces, outfitTitle) => {
    let closetItems = [];
    try { closetItems = JSON.parse(localStorage.getItem('mn_digital_closet') || '[]'); } catch (e) { }

    // ── Matching Algorithm ─────────────────────────────────────
    // For each outfit piece, try to find best match in user's closet
    const SLOT_TO_SECTION = {
      'top': ['Topwear'], 'shirt': ['Topwear'], 'tshirt': ['Topwear'],
      'bottom': ['Bottomwear'], 'jeans': ['Bottomwear'], 'trousers': ['Bottomwear'],
      'footwear': ['Footwear'], 'shoes': ['Footwear'], 'sneakers': ['Footwear'],
      'outerwear': ['Outerwear'], 'jacket': ['Outerwear'], 'blazer': ['Outerwear'],
      'accessory': ['Accessories', 'Jewellery'], 'watch': ['Accessories'],
      'ethnic': ['Ethnic Wear', 'Ethnic'], 'kurta': ['Ethnic Wear'],
      'bag': ['Bags'], 'scarf': ['Accessories']
    };

    const scoreMatch = (closetItem, outfitPiece) => {
      let score = 0;
      const cName = (closetItem.original_name || closetItem.name || '').toLowerCase();
      const cSection = (closetItem.closet_section || closetItem.category || '').toLowerCase();
      const cColor = (closetItem.color || '').toLowerCase();
      const cOccasion = (closetItem.occasion || '').toLowerCase();
      const pSlot = (outfitPiece.slot || outfitPiece.type || '').toLowerCase();
      const pName = (outfitPiece.name || '').toLowerCase();
      const pColor = (outfitPiece.color || '').toLowerCase().replace('#', '');
      const pType = (outfitPiece.type || '').toLowerCase();

      // Name similarity — if piece name words appear in closet item name
      const pWords = pName.split(/\s+/).filter(w => w.length > 3);
      pWords.forEach(w => { if (cName.includes(w)) score += 30; });

      // Type/slot section match
      const matchSections = SLOT_TO_SECTION[pSlot] || SLOT_TO_SECTION[pType] || [];
      const cSectionFull = closetItem.closet_section || closetItem.category || '';
      if (matchSections.some(s => cSectionFull.toLowerCase().includes(s.toLowerCase()))) score += 40;

      // Color proximity — same color family
      const COLOR_FAMILIES = [
        ['black', 'charcoal', 'dark', 'graphite', 'onyx'],
        ['white', 'cream', 'ivory', 'off-white', 'pearl'],
        ['navy', 'blue', 'cobalt', 'royal', 'denim', 'indigo'],
        ['red', 'crimson', 'maroon', 'burgundy', 'wine'],
        ['green', 'olive', 'sage', 'emerald', 'mint', 'forest'],
        ['beige', 'khaki', 'tan', 'camel', 'sand', 'nude'],
        ['grey', 'gray', 'silver', 'ash'],
        ['pink', 'blush', 'rose', 'mauve', 'coral'],
        ['purple', 'violet', 'lavender', 'plum'],
        ['yellow', 'mustard', 'gold', 'amber'],
        ['orange', 'rust', 'burnt', 'terracotta']
      ];
      const pFam = COLOR_FAMILIES.findIndex(f => f.some(c => pColor.includes(c)));
      const cFam = COLOR_FAMILIES.findIndex(f => f.some(c => cColor.includes(c)));
      if (pFam !== -1 && pFam === cFam) score += 20;

      // Occasion match
      if (cOccasion && outfitPiece.occasion && cOccasion.toLowerCase().includes(outfitPiece.occasion.toLowerCase())) score += 15;

      return score;
    };

    // For each outfit slot find the best closet match
    const matched = outfitPieces.map(piece => {
      if (piece.owned) return { piece, match: null, score: 0, alreadyOwned: true };
      const candidates = closetItems
        .map(ci => ({ item: ci, score: scoreMatch(ci, piece) }))
        .filter(c => c.score > 20)
        .sort((a, b) => b.score - a.score);
      return { piece, match: candidates[0]?.item || null, score: candidates[0]?.score || 0, alreadyOwned: false };
    });

    const fullyMatched = matched.filter(m => m.alreadyOwned || m.match).length;
    const totalPieces = matched.length;
    const pct = Math.round((fullyMatched / totalPieces) * 100);

    const html = `
      <div class="mn-complete-outfit-view mn-fade-in">
        <button class="mn-back-btn" id="btn-back-complete">← Back</button>
        <h2 class="mn-closet-view-title">Complete This Outfit</h2>
        <p class="mn-closet-view-subtitle" style="margin-bottom:20px;">"${outfitTitle || 'AI Outfit'}"</p>

        <!-- Completion meter -->
        <div class="mn-completion-meter">
          <div class="mn-completion-bar-wrap">
            <div class="mn-completion-bar" style="width:${pct}%;"></div>
          </div>
          <div class="mn-completion-label">
            <span>${pct}% completable from your closet</span>
            <span>${fullyMatched}/${totalPieces} pieces</span>
          </div>
        </div>

        <!-- Piece matching cards -->
        <div class="mn-piece-match-list">
          ${matched.map(({ piece, match, alreadyOwned }) => `
            <div class="mn-piece-match-card ${alreadyOwned ? 'owned' : match ? 'matched' : 'missing'}">
              <div class="mn-piece-match-left">
                <div class="mn-piece-match-emoji" style="background:${piece.color || '#39A596'}20;">
                  ${getItemEmoji({ name: piece.type || piece.name, closet_section: piece.slot })}
                </div>
                <div class="mn-piece-match-info">
                  <strong>${piece.name}</strong>
                  <span>${piece.slot || piece.type || ''}</span>
                </div>
              </div>
              <div class="mn-piece-match-right">
                ${alreadyOwned ? `
                  <div class="mn-match-result owned">
                    <span class="mn-match-icon">✅</span>
                    <span class="mn-match-text">Already owned</span>
                  </div>
                ` : match ? `
                  <div class="mn-match-result found">
                    <span class="mn-match-icon">${getItemEmoji(match)}</span>
                    <div class="mn-match-details">
                      <strong>${match.original_name || match.name}</strong>
                      <span>${match.color || ''} ${match.fabric || ''}</span>
                    </div>
                    <span class="mn-match-tag">From your closet</span>
                  </div>
                ` : `
                  <div class="mn-match-result missing">
                    <span class="mn-match-icon">🛍️</span>
                    <span class="mn-match-text">Not in closet yet</span>
                    ${piece.shop_links && piece.shop_links[0] ? `<a href="${piece.shop_links[0].url}" target="_blank" class="mn-match-buy-link">Buy ${piece.shop_links[0].price || ''}</a>` : ''}
                  </div>
                `}
              </div>
            </div>
          `).join('')}
        </div>

        ${pct < 100 ? `
        <div style="text-align:center;margin-top:24px;">
          <p style="color:#aaa;font-size:13px;margin-bottom:14px;">Missing ${totalPieces - fullyMatched} piece${totalPieces - fullyMatched !== 1 ? 's' : ''}? Upload more photos to complete this look.</p>
          <button id="btn-upload-missing" class="mn-btn-primary" style="max-width:260px;margin:0 auto;">📸 Upload More Photos</button>
          <input type="file" id="cloth-upload-missing-input" accept="image/*" style="display:none" multiple />
        </div>` : `
        <div style="text-align:center;margin-top:24px;">
          <div style="font-size:48px;margin-bottom:12px;">🎉</div>
          <p style="color:#4fffd9;font-size:16px;font-weight:700;">Your closet has everything for this look!</p>
        </div>`}
      </div>`;

    DOM.container.innerHTML = html;
    document.getElementById('btn-back-complete').addEventListener('click', renderPastLooks);

    const uploadMissingBtn = document.getElementById('btn-upload-missing');
    const uploadMissingInput = document.getElementById('cloth-upload-missing-input');
    if (uploadMissingBtn && uploadMissingInput) {
      uploadMissingBtn.addEventListener('click', () => uploadMissingInput.click());
      uploadMissingInput.addEventListener('change', handleClothUpload);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // SELF CONTEXT
  // ═══════════════════════════════════════════════════════════

  const renderSelfContext = () => {
    const html = `
      <div class="mn-context-flow mn-fade-in">
        <button class="mn-back-btn" id="btn-back">← Back</button>
        <div class="mn-step-header">
          <h3 class="mn-context-heading">What vibe are we going for?</h3>
          <p class="mn-context-subtitle">"Pick your aesthetic. We'll handle the rest."</p>
        </div>
        <div class="mn-chip-grid" id="context-chips">
          ${CONTEXT_DATA.selfContexts.map(ctx => `
            <button class="mn-chip" data-value="${ctx.value}">
              <span class="mn-chip-label">${ctx.emoji} ${ctx.value}</span>
              <span class="mn-chip-description">${ctx.description}</span>
            </button>
          `).join('')}
        </div>
        <div id="loudness-section" class="mn-loudness-section" style="display: none;">
          <div class="mn-step-header" style="margin-top: 40px;">
            <h3 class="mn-context-heading" style="font-size: 24px;">How loud do you want to be?</h3>
          </div>
          <div class="mn-chip-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
            <button class="mn-chip" data-loudness="Subtle">
              <span class="mn-chip-label">Subtle</span><span class="mn-chip-description">Whisper, don't shout</span>
            </button>
            <button class="mn-chip" data-loudness="Balanced">
              <span class="mn-chip-label">Balanced</span><span class="mn-chip-description">Present but not loud</span>
            </button>
            <button class="mn-chip" data-loudness="Statement">
              <span class="mn-chip-label">Statement</span><span class="mn-chip-description">Bold and memorable</span>
            </button>
          </div>
        </div>
        <div class="mn-action-bar">
          <button id="btn-generate-self" class="mn-btn-primary" disabled>Continue to Your Details →</button>
        </div>
      </div>
    `;

    DOM.container.innerHTML = html;
    let selectedContext = null;
    let selectedLoudness = null;

    DOM.container.querySelectorAll('.mn-chip[data-value]').forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.container.querySelectorAll('.mn-chip[data-value]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedContext = chip.dataset.value;
        document.getElementById('loudness-section').style.display = 'block';
        if (selectedLoudness) document.getElementById('btn-generate-self').disabled = false;
      });
    });

    DOM.container.querySelectorAll('.mn-chip[data-loudness]').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.container.querySelectorAll('.mn-chip[data-loudness]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLoudness = btn.dataset.loudness;
        if (selectedContext) document.getElementById('btn-generate-self').disabled = false;
      });
    });

    document.getElementById('btn-back').addEventListener('click', renderContextDashboard);
    document.getElementById('btn-generate-self').addEventListener('click', () => {
      if (!selectedContext || !selectedLoudness) return alert('⚠️ Please select both context and loudness level');
      state.currentContext = { mode: 'self', contexts: [selectedContext], loudness: selectedLoudness };
      if (hasBodyData()) generateAIRecommendations();
      else { state.dataCollection = state.dataCollection || {}; renderSilhouetteStep(); }
    });
  };

  // ═══════════════════════════════════════════════════════════
  // ARCHETYPE CARD
  // ═══════════════════════════════════════════════════════════

  const renderArchetypeCard = () => {
    const archetype = deriveArchetype(state.identity);
    state.identity.archetype = archetype;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.identity));
    // Dispatch custom event for dashboard to listen
    window.dispatchEvent(new CustomEvent('mn-identity-updated'));

    const html = `
      <div class="mn-archetype-reveal mn-fade-in">
        <div class="mn-step-header"><h2 class="mn-context-heading">Your Style Archetype</h2></div>
        <div class="mn-archetype-card mn-scale-in">
          <div class="mn-archetype-icon">${archetype.icon}</div>
          <h3 class="mn-archetype-name">${archetype.name}</h3>
          <div class="mn-archetype-combo">
            ${state.identity.coreExpression} ×<br>${state.identity.presence} ×<br>${state.identity.signal}
          </div>
          <div class="mn-archetype-tagline">"${archetype.tagline}"</div>
          <div class="mn-archetype-palette">
            ${archetype.palette.map(color => `<div class="mn-palette-swatch" style="background-color: ${color};"></div>`).join('')}
          </div>
        </div>
        <div class="mn-action-bar"><button id="btn-lock-identity" class="mn-btn-primary">🔒 Lock This Identity</button></div>
      </div>
    `;

    DOM.container.innerHTML = html;
    document.getElementById('btn-lock-identity').addEventListener('click', () => {
      renderTransition('✨ Identity Locked', () => renderContextDashboard());
    });
  };

  // ═══════════════════════════════════════════════════════════
  // SILHOUETTE STEP
  // ═══════════════════════════════════════════════════════════

  const renderSilhouetteStep = () => {
    state.dataCollection = state.dataCollection || {};
    const html = `
      <div class="mn-silhouette-step mn-fade-in">
        <button class="mn-back-btn" id="btn-back">← Back</button>
        <div class="mn-step-header">
          <h3 class="mn-context-heading">Your Silhouette</h3>
          <p class="mn-context-subtitle">"Clothes are architecture. Let's get your blueprint right."</p>
        </div>
        <div class="mn-face-upload-section" style="margin-bottom: 30px;">
          <label class="mn-input-label">See yourself in the outfit (Optional)</label>
          <div class="mn-face-uploader" id="face-uploader">
             <div class="mn-face-preview" id="face-preview">
               <span class="mn-face-icon">📸</span>
             </div>
             <div class="mn-face-text">
               <span class="mn-face-title">Upload Selfie</span>
               <span class="mn-face-subtitle">For AI Face Swap</span>
             </div>
             <input type="file" id="face-input" accept="image/*" capture="user" style="display:none" />
             <button id="btn-clear-face" class="mn-btn-icon" style="display:none; margin-left:auto;">✕</button>
          </div>
        </div>
        <div class="mn-gender-selector" style="margin-bottom: 30px;">
          <label class="mn-input-label">I identify as:</label>
          <div class="mn-build-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));">
            <button class="mn-build-card" data-gender="man">
              <div class="mn-build-icon">👨</div>
              <div class="mn-build-label">Man</div>
            </button>
            <button class="mn-build-card" data-gender="woman">
              <div class="mn-build-icon">👩</div>
              <div class="mn-build-label">Woman</div>
            </button>
            <button class="mn-build-card" data-gender="person">
              <div class="mn-build-icon">⚧</div>
              <div class="mn-build-label">Non-binary</div>
            </button>
          </div>
        </div>
        <div class="mn-build-selector">
          <label class="mn-input-label">What's your build?</label>
          <div class="mn-build-grid">
            ${SILHOUETTE_OPTIONS.builds.map(build => `
              <button class="mn-build-card" data-build="${build.id}">
                <div class="mn-build-icon">${build.icon}</div>
                <div class="mn-build-label">${build.label}</div>
              </button>
            `).join('')}
          </div>
        </div>
        <p class="mn-trust-note">🔒 This helps us recommend cuts and proportions. Never shared.</p>
        <div class="mn-action-bar"><button id="btn-next-tone" class="mn-btn-primary">Continue →</button></div>
      </div>
    `;

    DOM.container.innerHTML = html;

    // FACE UPLOAD LOGIC
    const faceInput = document.getElementById('face-input');
    const faceUploader = document.getElementById('face-uploader');
    const facePreview = document.getElementById('face-preview');
    const btnClearFace = document.getElementById('btn-clear-face');

    // Load existing face if avail
    if (state.dataCollection.faceImage) {
      facePreview.innerHTML = `<img src="${state.dataCollection.faceImage}" class="mn-face-img" />`;
      faceUploader.classList.add('has-file');
      btnClearFace.style.display = 'block';
    }

    faceUploader.addEventListener('click', (e) => {
      if (e.target !== btnClearFace) faceInput.click();
    });

    faceInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target.result;
          state.dataCollection.faceImage = base64;
          facePreview.innerHTML = `<img src="${base64}" class="mn-face-img" />`;
          faceUploader.classList.add('has-file');
          btnClearFace.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    btnClearFace.addEventListener('click', (e) => {
      e.stopPropagation();
      state.dataCollection.faceImage = null;
      faceInput.value = '';
      facePreview.innerHTML = '<span class="mn-face-icon">📸</span>';
      faceUploader.classList.remove('has-file');
      btnClearFace.style.display = 'none';
    });



    DOM.container.querySelectorAll('[data-gender]').forEach(card => {
      card.addEventListener('click', () => {
        DOM.container.querySelectorAll('[data-gender]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.dataCollection.gender = card.dataset.gender;
      });
    });

    DOM.container.querySelectorAll('[data-build]').forEach(card => {
      card.addEventListener('click', () => {
        DOM.container.querySelectorAll('[data-build]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.dataCollection.build = card.dataset.build;
      });
    });

    document.getElementById('btn-back').addEventListener('click', renderSelfContext);
    document.getElementById('btn-next-tone').addEventListener('click', () => {
      if (!state.dataCollection.gender) return alert('Please select your gender identity');
      if (!state.dataCollection.build) return alert('Please select your build type');
      renderToneStep();
    });
  };

  // ═══════════════════════════════════════════════════════════
  // TONE STEP
  // ═══════════════════════════════════════════════════════════

  const renderToneStep = () => {
    const html = `
      <div class="mn-tone-step mn-fade-in">
        <button class="mn-back-btn" id="btn-back">← Back</button>
        <div class="mn-step-header">
          <h3 class="mn-context-heading">Your Palette</h3>
          <p class="mn-context-subtitle">"Every skin tells a story. Let's find the colors made for yours."</p>
        </div>
        <div class="mn-tone-section">
          <label class="mn-input-label">Which feels closest to you?</label>
          <div class="mn-tone-swatches">
            ${TONE_OPTIONS.skinTones.map(tone => `
              <button class="mn-tone-swatch" data-tone="${tone.id}" style="background:${tone.color}; color:${tone.textColor}">
                <span class="mn-tone-label">${tone.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="mn-undertone-section">
          <label class="mn-input-label">Quick test — what jewelry makes you glow?</label>
          <div class="mn-undertone-options">
            ${TONE_OPTIONS.undertones.map(ut => `
              <button class="mn-undertone-btn" data-undertone="${ut.value}">${ut.label}</button>
            `).join('')}
          </div>
        </div>
        <div class="mn-action-bar"><button id="btn-next-lifestyle" class="mn-btn-primary">Continue →</button></div>
      </div>
    `;

    DOM.container.innerHTML = html;

    DOM.container.querySelectorAll('.mn-tone-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        DOM.container.querySelectorAll('.mn-tone-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        state.dataCollection.skinTone = swatch.dataset.tone;
      });
    });

    DOM.container.querySelectorAll('.mn-undertone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.container.querySelectorAll('.mn-undertone-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.dataCollection.undertone = btn.dataset.undertone;
      });
    });

    document.getElementById('btn-back').addEventListener('click', renderSilhouetteStep);
    document.getElementById('btn-next-lifestyle').addEventListener('click', () => {
      if (!state.dataCollection.skinTone || !state.dataCollection.undertone) return alert('Please complete both selections');
      renderLifestyleStep();
    });
  };

  // ═══════════════════════════════════════════════════════════
  // LIFESTYLE STEP
  // ═══════════════════════════════════════════════════════════

  const renderLifestyleStep = () => {
    const html = `
      <div class="mn-lifestyle-step mn-fade-in">
        <button class="mn-back-btn" id="btn-back">← Back</button>
        <div class="mn-step-header">
          <h3 class="mn-context-heading">Your World</h3>
          <p class="mn-context-subtitle">"Fashion lives in context. Let's understand yours."</p>
        </div>
        <div class="mn-lifestyle-section"><label class="mn-input-label">Your weather most days?</label>
          <div class="mn-climate-grid">${LIFESTYLE_OPTIONS.climates.map(c => `<button class="mn-climate-chip" data-climate="${c.id}">${c.label}</button>`).join('')}</div>
        </div>
        <div class="mn-lifestyle-section"><label class="mn-input-label">Your comfort range for a single statement piece?</label>
          <div class="mn-budget-grid">${LIFESTYLE_OPTIONS.budgets.map(b => `<button class="mn-budget-chip" data-budget="${b.id}">${b.label}</button>`).join('')}</div>
        </div>
        <div class="mn-action-bar"><button id="btn-next-closet" class="mn-btn-primary">Almost there... →</button></div>
      </div>
    `;

    DOM.container.innerHTML = html;

    const setupSingleSelect = (selector, stateKey, dataAttr) => {
      DOM.container.querySelectorAll(selector).forEach(chip => {
        chip.addEventListener('click', () => {
          DOM.container.querySelectorAll(selector).forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          state.dataCollection[stateKey] = chip.dataset[dataAttr];
        });
      });
    };

    setupSingleSelect('.mn-climate-chip', 'climate', 'climate');
    setupSingleSelect('.mn-budget-chip', 'budget', 'budget');

    document.getElementById('btn-back').addEventListener('click', renderToneStep);
    document.getElementById('btn-next-closet').addEventListener('click', () => {
      const { climate, budget } = state.dataCollection;
      if (!climate || !budget) return alert('Please complete both selections');
      renderClosetStep();
    });
  };

  // ═══════════════════════════════════════════════════════════
  // CLOSET STEP
  // ═══════════════════════════════════════════════════════════

  const renderClosetStep = () => {
    state.dataCollection.closet = state.dataCollection.closet || [];
    const html = `
      <div class="mn-closet-step mn-fade-in">
        <button class="mn-back-btn" id="btn-back">← Back</button>
        <div class="mn-step-header">
          <h3 class="mn-context-heading">Your Closet</h3>
          <p class="mn-context-subtitle">"Show us what you already own. We'll build from there."</p>
        </div>
        <div class="mn-closet-upload">
          <label for="closet-photos" class="mn-upload-area" id="upload-area">
            <div class="mn-upload-icon">📸</div>
            <div class="mn-upload-title">Upload Wardrobe Photos</div>
            <div class="mn-upload-subtitle">💡 Full body photos give better AI detection results</div>
            <div class="mn-upload-actions">
              <button type="button" class="mn-upload-btn" id="btn-upload-file">
                📁 Choose Files
              </button>
              <button type="button" class="mn-upload-btn" id="btn-take-photo">
                📷 Take Photo
              </button>
            </div>
            <input type="file" id="closet-photos" multiple accept="image/*" style="display:none" />
            <input type="file" id="closet-camera" accept="image/*" capture="environment" style="display:none" />
          </label>
          <div id="upload-preview" class="mn-upload-preview"></div>
        </div>
        <div class="mn-divider-text"><span>or use Ghost Mode</span></div>
        <div class="mn-ghost-mode">
          ${['tops', 'bottoms', 'footwear', 'accessories'].map(cat => `
            <div class="mn-ghost-category" data-category="${cat}">
              <h4 class="mn-ghost-label">${cat === 'tops' ? '👕 Tops' : cat === 'bottoms' ? '👖 Bottoms' : cat === 'footwear' ? '👟 Footwear' : '💎 Accessories'}</h4>
              <div class="mn-ghost-chips">
                ${GHOST_MODE_ITEMS[cat].slice(0, cat === 'tops' ? 8 : 6).map(item => `<button class="mn-ghost-chip" data-item="${item}">${item}</button>`).join('')}
                ${cat === 'tops' || cat === 'bottoms' || cat === 'accessories' ? `<button class="mn-ghost-more" data-category="${cat}">+${GHOST_MODE_ITEMS[cat].length - (cat === 'tops' ? 8 : 6)} more</button>` : ''}
              </div>
            </div>
          `).join('')}
          <div class="mn-custom-item-input">
            <input type="text" id="custom-item" class="mn-text-input" placeholder="Or type: Maroon Kurta, Grey Joggers..." />
            <button id="btn-add-custom" class="mn-btn-icon">+ Add</button>
          </div>
        </div>
        <div class="mn-selected-closet" id="selected-closet">
          <h4 class="mn-ghost-label">Your Items (<span id="closet-count">0</span>)</h4>
          <div class="mn-selected-items" id="selected-items"></div>
        </div>
        <div class="mn-action-bar">
          <button id="btn-skip-closet" class="mn-btn-secondary">Skip for now</button>
          <button id="btn-generate-final" class="mn-btn-primary" disabled>✨ Generate My Look</button>
        </div>
      </div>
    `;

    DOM.container.innerHTML = html;

    // Upload button handlers
    document.getElementById('btn-upload-file').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('closet-photos').click();
    });

    document.getElementById('btn-take-photo').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('closet-camera').click();
    });

    document.getElementById('closet-photos').addEventListener('change', handlePhotoUpload);
    document.getElementById('closet-camera').addEventListener('change', handlePhotoUpload);

    DOM.container.querySelectorAll('.mn-ghost-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const item = chip.dataset.item;
        chip.classList.toggle('active');
        if (chip.classList.contains('active')) state.dataCollection.closet.push(item);
        else state.dataCollection.closet = state.dataCollection.closet.filter(i => i !== item);
        updateClosetDisplay();
      });
    });

    document.getElementById('btn-add-custom').addEventListener('click', () => {
      const input = document.getElementById('custom-item');
      const value = input.value.trim();
      if (value) {
        const items = value.split(',').map(i => i.trim()).filter(Boolean);
        state.dataCollection.closet.push(...items);
        input.value = '';
        updateClosetDisplay();
      }
    });

    document.getElementById('custom-item').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-add-custom').click();
    });

    DOM.container.querySelectorAll('.mn-ghost-more').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        const allItems = GHOST_MODE_ITEMS[category];
        const container = btn.parentElement;
        const sliceStart = category === 'tops' ? 8 : 6;
        btn.remove();
        allItems.slice(sliceStart).forEach(item => {
          const chip = document.createElement('button');
          chip.className = 'mn-ghost-chip mn-fade-in';
          chip.dataset.item = item;
          chip.textContent = item;
          chip.addEventListener('click', () => {
            chip.classList.toggle('active');
            if (chip.classList.contains('active')) state.dataCollection.closet.push(item);
            else state.dataCollection.closet = state.dataCollection.closet.filter(i => i !== item);
            updateClosetDisplay();
          });
          container.appendChild(chip);
        });
      });
    });

    document.getElementById('btn-back').addEventListener('click', renderLifestyleStep);
    document.getElementById('btn-skip-closet').addEventListener('click', () => saveAllDataAndGenerate());
    document.getElementById('btn-generate-final').addEventListener('click', () => saveAllDataAndGenerate());
  };

  const updateClosetDisplay = () => {
    const items = state.dataCollection.closet;
    const container = document.getElementById('selected-items');
    document.getElementById('closet-count').textContent = items.length;
    document.getElementById('btn-generate-final').disabled = items.length < 1;
    container.innerHTML = items.map(item => `
      <div class="mn-closet-item">
        <span>${item}</span>
        <button class="mn-remove-item" data-remove="${item}">✕</button>
      </div>
    `).join('');
    container.querySelectorAll('.mn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.dataset.remove;
        state.dataCollection.closet = state.dataCollection.closet.filter(i => i !== item);
        const chip = DOM.container.querySelector(`.mn-ghost-chip[data-item="${item}"]`);
        if (chip) chip.classList.remove('active');
        updateClosetDisplay();
      });
    });
  };

  const handlePhotoUpload = (event) => {
    const files = event.target.files;
    const preview = document.getElementById('upload-preview');
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('div');
        img.className = 'mn-upload-thumb mn-fade-in';
        img.innerHTML = `<img src="${e.target.result}" alt="Closet item" /><div class="mn-upload-detecting"><div class="mn-mini-spinner"></div>Detecting...</div>`;
        preview.appendChild(img);
        setTimeout(() => {
          const detected = simulateClothingDetection(file.name);
          img.querySelector('.mn-upload-detecting').innerHTML = `✅ ${detected}`;
          state.dataCollection.closet.push(detected);
          updateClosetDisplay();
        }, 1500);
      };
      reader.readAsDataURL(file);
    });
  };

  const simulateClothingDetection = (filename) => {
    const detections = ['Blue Denim Shirt', 'Black T-Shirt', 'White Sneakers', 'Grey Hoodie', 'Navy Chinos', 'Brown Belt'];
    return detections[Math.floor(Math.random() * detections.length)];
  };

  const saveAllDataAndGenerate = () => {
    const fullProfile = { ...state.identity, ...state.dataCollection, lastUpdated: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullProfile));
    state.identity = fullProfile;
    console.log('💾 Full profile saved:', fullProfile);
    // Dispatch custom event for dashboard to listen
    window.dispatchEvent(new CustomEvent('mn-identity-updated'));
    generateAIRecommendations();
  };

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: AVATAR RESULTS SCREEN (WITH FLUX INTEGRATION)
  // ═══════════════════════════════════════════════════════════

  const renderAvatarResults = (recommendations) => {
    const profile = state.identity;
    const closetItems = profile.closet || [];
    const outfitItems = recommendations.outfit_pieces || [];
    const categorized = outfitItems.map(item => ({
      ...item,
      // Use GPT's own owned flag first; fallback to local matching against both simple closet and rich digital closet
      owned: item.owned === true || (() => {
        const richCloset = (() => { try { return JSON.parse(localStorage.getItem('mn_digital_closet') || '[]'); } catch (e) { return []; } })();
        const itemName = (item.name || '').toLowerCase();
        const itemType = (item.type || '').toLowerCase();
        // Match against rich closet
        if (richCloset.some(c => {
          const cName = (c.name || c.original_name || '').toLowerCase();
          return cName && (itemName.includes(cName) || cName.includes(itemType));
        })) return true;
        // Match against simple closet strings
        return closetItems.some(owned => owned.toLowerCase().includes(itemType) || itemName.includes(owned.toLowerCase()));
      })()
    }));

    const missingItems = categorized.filter(item => !item.owned);
    const archetypeName = profile.archetype?.name || profile.coreExpression;

    // --- GAP 2 FIX: CONSTRUCT PROMPT FOR FLUX ---
    const missingDesc = missingItems.map(i => i.name).join(", ");
    const gender = state.identity.gender || 'person';
    const faceImage = state.identity.faceImage || state.dataCollection?.faceImage || null;
    const fluxPrompt = `A photorealistic shot of an Indian ${gender} (${profile.build} build, ${profile.skinTone} skin) wearing ${missingDesc}. Cinematic lighting, high fashion street style.`;

    const html = `
      <div class="mn-avatar-results mn-fade-in">
        <button class="mn-back-btn" id="btn-back">← Back</button>
        <div class="mn-results-header">
          <h3 class="mn-results-title">✨ Your Look: "${state.currentContext.contexts?.[0] || 'Custom'}"</h3>
          <p class="mn-results-meta">${state.currentContext.loudness} • ${archetypeName} Archetype</p>
        </div>

        <div class="mn-avatar-container" id="mn-avatar-container" style="position: relative; min-height: 450px; background: radial-gradient(circle, #2a2a2a, #000); border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
          
          <div id="mn-flux-canvas" style="width: 100%; height: 450px; display:flex; align-items:center; justify-content:center; flex-direction:column;">
             <div style="text-align:center; background:rgba(0,0,0,0.4); padding:20px; border-radius:16px; backdrop-filter:blur(4px);">
                <p style="color:#fff; font-size:14px; margin-bottom:12px;">✨ Want to see this exact vibe on you?</p>
                <button class="mn-btn-primary" 
                  onclick="window.generateFluxLook('${fluxPrompt.replace(/'/g, "\\'")}', 'mn-flux-canvas', ${faceImage ? `'${faceImage}'` : 'null'})"
                  style="padding:10px 20px; font-size:12px;">
                  🎨 VISUALIZE STYLE ${faceImage ? '(With Your Face)' : ''}
                </button>
                <p style="color:#999; font-size:10px; margin-top:8px;">AI-powered photorealistic preview</p>
             </div>
          </div>

        </div>

        <div class="mn-outfit-items">
          ${categorized.map(item => `
            <div class="mn-outfit-item ${item.owned ? 'owned' : 'missing'}">
              <div class="mn-item-preview" style="background:${item.color || '#333'}"></div>
              <div class="mn-item-name">${item.name}</div>
              <div class="mn-item-status">${item.owned ? '✅ In Your Closet' : '🛍️ To Buy'}</div>
              ${item.owned && item.why ? `<div class="mn-item-why" style="font-size:0.7em;opacity:0.8;padding:2px 4px;">${item.why}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="mn-direction-card"><p class="mn-direction-text">"${recommendations.direction}"</p></div>
        ${recommendations.color_science ? `<div class="mn-color-science"><h4>🎨 Why These Colors Work On You</h4><p>${recommendations.color_science}</p></div>` : ''}
        ${recommendations.styling_tips?.length ? `<div class="mn-tips-section"><h4>💡 Styling Tips</h4><ul class="mn-tips-list">${recommendations.styling_tips.map(tip => `<li>${tip}</li>`).join('')}</ul></div>` : ''}
        
        ${missingItems.length > 0 ? `
          <div class="mn-shopping-section">
            <h4>🛒 Complete This Look</h4>
            <p class="mn-shopping-subtitle">Items you don't have yet (within your ${LIFESTYLE_OPTIONS.budgets.find(b => b.id === profile.budget)?.label || 'selected'} range)</p>
            ${missingItems.map(item => `
              <div class="mn-shopping-card">
                <div class="mn-shopping-item-info">
                  <span class="mn-shopping-item-name">🛍️ ${item.name}</span>
                  <span class="mn-shopping-item-reason">${item.why || 'Completes the look'}</span>
                </div>
                <div class="mn-shopping-links">
                  ${(item.shop_links || []).filter(l => l && l.url).map(link => `<a href="${link.url}" target="_blank" class="mn-shop-link">🛒 ${link.platform} ${link.price || ''}</a>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `<div class="mn-complete-badge">✅ You own everything needed for this look!</div>`}

        <div class="mn-action-bar mn-action-bar-grid">
          <button id="btn-regenerate" class="mn-btn-secondary">🔄 Different Look</button>
          <button id="btn-save-look" class="mn-btn-primary">💾 Save This Look</button>
        </div>

        <!-- STATE 4: Reaction Chips (Progressive Profiling) -->
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="color:#555;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;text-align:center;margin-bottom:10px;">Direct the AI</p>
          <div class="mn-reaction-chips">
            <button class="mn-reaction-chip" data-pref="budget:low" data-regen="Make it cheaper">💸 Make it cheaper</button>
            <button class="mn-reaction-chip" data-pref="color:dark" data-regen="Darker aesthetic">🖤 Darker aesthetic</button>
            <button class="mn-reaction-chip" data-pref="formality:formal" data-regen="Dress it up">👔 Dress it up</button>
            <button class="mn-reaction-chip" data-pref="style:y2k" data-regen="More Y2K vibe">🔥 More Y2K</button>
            <button class="mn-reaction-chip" data-pref="style:minimal" data-regen="Minimal and clean">🤍 Keep it minimal</button>
            <button class="mn-reaction-chip" data-pref="style:streetwear" data-regen="Street style drip">🔫 Street drip</button>
          </div>
        </div>

        <!-- STATE 5: Viral Try-On Bridge -->
        <div style="margin-top:16px;">
          <button id="btn-tryon-result" class="mn-btn-primary mn-btn-glow" style="width:100%;padding:16px;font-size:15px;font-weight:800;letter-spacing:0.3px;">
            ✨ Try this entire look on ME
          </button>
        </div>
      </div>
    `;

    DOM.container.innerHTML = html;

    // Event handlers
    document.getElementById('btn-back').addEventListener('click', renderContextDashboard);
    document.getElementById('btn-regenerate').addEventListener('click', generateAIRecommendations);
    document.getElementById('btn-save-look').addEventListener('click', () => {
      localStorage.setItem('mn_saved_looks', JSON.stringify({ recommendations, context: state.currentContext, timestamp: Date.now() }));
      alert('✅ Look saved!');
    });

    // Reaction Chips — stealth profiling in results page
    DOM.container.querySelectorAll('.mn-reaction-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const pref = chip.dataset.pref;
        const regenContext = chip.dataset.regen;
        chip.style.transform = 'scale(0.92)';
        chip.style.borderColor = '#39A596';
        chip.style.background = 'rgba(57,165,150,0.2)';
        setTimeout(() => { chip.style.transform = ''; }, 150);
        try {
          const prefs = JSON.parse(localStorage.getItem('mn_user_preferences') || '{}');
          const [category, value] = pref.split(':');
          if (!prefs[category]) prefs[category] = [];
          if (!prefs[category].includes(value)) prefs[category].push(value);
          prefs.lastInteraction = new Date().toISOString();
          localStorage.setItem('mn_user_preferences', JSON.stringify(prefs));
        } catch (e) { }
        try {
          fetch('https://mynarrative-ai.vercel.app/api/profile_manager', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_preferences', user_id: localStorage.getItem('mn_user_id') || 'anonymous', preference: pref, timestamp: new Date().toISOString() })
          }).catch(() => { });
        } catch (e) { }
        state.currentContext = { mode: 'self', contexts: [regenContext], loudness: 'Balanced' };
        generateAIRecommendations();
      });
    });

    // Try-On CTA in results
    document.getElementById('btn-tryon-result').addEventListener('click', () => {
      const faceImage = state.identity?.faceImage || state.dataCollection?.faceImage || null;
      const avatarArea = document.getElementById('mn-avatar-container');
      if (avatarArea) {
        avatarArea.innerHTML = `
          <div id="mn-tryon-result-canvas" style="width:100%;height:450px;display:flex;align-items:center;justify-content:center;">
            <div style="text-align:center;">
              <div class="mn-spinner" style="margin:0 auto 16px;"></div>
              <p style="color:#fff;font-size:14px;">🎨 AI is styling this look on you...</p>
              <p style="color:#666;font-size:11px;margin-top:4px;">This may take 20-30 seconds</p>
            </div>
          </div>
        `;
        window.generateFluxLook(fluxPrompt, 'mn-tryon-result-canvas', faceImage);
      }
    });
  };

  const renderGiftContext = () => {
    const html = `
      <div class="mn-context-flow mn-fade-in">
        <button class="mn-back-btn" id="btn-back">← Back</button>
        <h3 class="mn-context-heading">Who is this gift for?</h3>
        <div class="mn-context-chips" id="recipient-chips">
          ${CONTEXT_DATA.recipients.map(rec => `<button class="mn-context-chip mn-recipient-chip" data-value="${rec}">${rec}</button>`).join('')}
        </div>
        <div class="mn-divider"></div>
        <h3 class="mn-context-heading">What's the occasion?</h3>
        <div class="mn-context-chips" id="occasion-chips">
          ${CONTEXT_DATA.occasions.map(occ => `<button class="mn-context-chip mn-occasion-chip" data-value="${occ}">${occ}</button>`).join('')}
        </div>
        <div class="mn-divider"></div>
        <h3 class="mn-context-heading">Unspoken Message (Optional)</h3>
        <input type="text" id="unspoken-message" class="mn-text-input" placeholder="What should this design say to them?" />
        <div class="mn-action-bar"><button id="btn-generate-gift" class="mn-btn-primary">✨ Get AI Recommendations</button></div>
      </div>
    `;

    DOM.container.innerHTML = html;
    let selectedRecipient = null;
    let selectedOccasion = null;

    DOM.container.querySelectorAll('.mn-recipient-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.container.querySelectorAll('.mn-recipient-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedRecipient = chip.dataset.value;
      });
    });

    DOM.container.querySelectorAll('.mn-occasion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.container.querySelectorAll('.mn-occasion-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedOccasion = chip.dataset.value;
      });
    });

    document.getElementById('btn-back').addEventListener('click', renderContextDashboard);
    document.getElementById('btn-generate-gift').addEventListener('click', () => {
      if (!selectedRecipient || !selectedOccasion) return alert('⚠️ Please select both recipient and occasion');
      state.currentContext = { mode: 'gift', recipient: selectedRecipient, occasion: selectedOccasion, unspoken: document.getElementById('unspoken-message').value };
      generateAIRecommendations();
    });
  };

  const generateAIRecommendations = async () => {
    renderTransition('🧠 Baking Your Uniqueness...', () => { });
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: {
            ...state.identity,
            // Merge rich digital closet items from localStorage into identity payload
            digital_closet: (() => {
              try {
                const richCloset = JSON.parse(localStorage.getItem('mn_digital_closet') || '[]');
                // Send only metadata fields — no images — limit to 50 most recent
                return richCloset.slice(-50).map(item => ({
                  name: item.name,
                  original_name: item.original_name,
                  category: item.category,
                  sub_category: item.sub_category,
                  closet_section: item.closet_section,
                  color: item.color,
                  pattern: item.pattern,
                  fabric: item.fabric,
                  fit: item.fit,
                  style: item.style,
                  gender: item.gender,
                  occasion: item.occasion,
                  season: item.season,
                  style_tags: item.style_tags,
                  item_id: item.item_id,
                  addedAt: item.addedAt
                }));
              } catch (e) { return []; }
            })()
          },
          currentContext: state.currentContext
        })
      });
      if (!response.ok) throw new Error("Consultant Service Unavailable");
      const recommendations = await response.json();
      if (recommendations.error) console.warn('⚠️ AI returned fallback:', recommendations.error);
      localStorage.setItem(CONTEXT_KEY, JSON.stringify({ direction: recommendations.direction, suggestions: recommendations.suggestions, context: state.currentContext, identity: state.identity, mode: state.currentContext.mode, timestamp: Date.now() }));

      // ── Append to outfit history (mn_outfit_history) ──────────
      try {
        const history = JSON.parse(localStorage.getItem('mn_outfit_history') || '[]');
        history.unshift({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
          direction: recommendations.direction,
          outfit_pieces: recommendations.outfit_pieces || [],
          suggestions: recommendations.suggestions || [],
          context: state.currentContext?.contexts?.[0] || '',
          occasion: state.currentContext?.contexts?.[0] || '',
          loudness: state.currentContext?.loudness || 'Balanced',
          mode: state.currentContext?.mode || 'self',
          savedAt: new Date().toISOString()
        });
        // Keep last 30 looks
        localStorage.setItem('mn_outfit_history', JSON.stringify(history.slice(0, 30)));
      } catch (e) { console.warn('Could not save outfit to history:', e); }
      const isGiftMode = state.currentContext?.mode === 'gift';
      if (isGiftMode) renderResults(recommendations);
      else {
        if (recommendations.outfit_pieces) renderAvatarResults(recommendations);
        else renderResults(recommendations);
      }
    } catch (error) {
      console.error("AI Error:", error);
      DOM.container.innerHTML = `
        <div class="mn-transition">
          <p class="mn-transition-text" style="color: #ff6b6b;">⚠️ AI Connection Failed</p>
          <p style="color: #888; font-size: 12px; margin-top: 10px;">${error.message}</p>
          <button class="mn-btn-secondary" id="btn-retry" style="margin-top: 20px;">🔄 Try Again</button>
          <button class="mn-btn-secondary" id="btn-back-err" style="margin-top: 10px;">← Go Back</button>
        </div>
      `;
      document.getElementById('btn-retry').addEventListener('click', generateAIRecommendations);
      document.getElementById('btn-back-err').addEventListener('click', renderContextDashboard);
    }
  };

  const renderResults = (recommendations) => {
    const isGiftMode = state.currentContext?.mode === 'gift';
    const title = isGiftMode ? "Choose Their Message" : "Your AI-Curated Direction";
    const subtitle = isGiftMode ? "We recommend the first one based on your profile." : `"${recommendations.direction}"`;
    let contentHtml = '';

    if (isGiftMode) {
      if (recommendations.suggestions?.length > 0) state.selectedSlogan = recommendations.suggestions[0];
      contentHtml = `
        <div class="mn-slogan-grid">
          ${recommendations.suggestions.map((slogan, index) => `
            <button class="mn-slogan-card ${index === 0 ? 'recommended active' : ''}" onclick="MNAIStylist.selectSlogan(this, '${slogan.replace(/'/g, "\\'")}')">
              ${index === 0 ? '<div class="mn-badge-recommended">✨ RECOMMENDED</div>' : ''}
              <div class="mn-slogan-content"><span class="mn-slogan-text">"${slogan}"</span></div>
              <div class="mn-checkbox"></div>
            </button>
          `).join('')}
        </div>
        ${recommendations.styling_tips ? `<p class="mn-tips-text">💡 <b>Stylist Tip:</b> ${recommendations.styling_tips[0]}</p>` : ''}
      `;
    } else {
      contentHtml = `
        <div class="mn-direction-card"><p class="mn-direction-text">"${recommendations.direction}"</p></div>
        <div class="mn-divider"></div>
        <h4 class="mn-suggestions-heading">Tactical Suggestions</h4>
        <ul class="mn-suggestions-list">${recommendations.suggestions.map(suggestion => `<li class="mn-suggestion-item">${suggestion}</li>`).join('')}</ul>
      `;
    }

    const html = `
      <div class="mn-results mn-fade-in">
        <div class="mn-results-header"><div class="mn-results-icon">${isGiftMode ? '🎁' : '✨'}</div><div><h3 class="mn-results-title">${title}</h3><p class="mn-results-subtitle" style="font-size:12px; color:var(--mn-text-muted);">${subtitle}</p></div></div>
        ${contentHtml}
        <div class="mn-action-bar">
          <button id="btn-new-consultation" class="mn-btn-secondary">🔄 Start Over</button>
          <button id="btn-close-widget" class="mn-btn-primary">${isGiftMode ? '🎨 Design This Slogan' : '🎨 Start Designing'}</button>
        </div>
      </div>
    `;

    DOM.container.innerHTML = html;
    document.getElementById('btn-new-consultation').addEventListener('click', renderContextDashboard);
    document.getElementById('btn-close-widget').addEventListener('click', () => {
      if (isGiftMode && state.selectedSlogan) localStorage.setItem('mn_pending_design', JSON.stringify({ slogan: state.selectedSlogan, context: state.currentContext, timestamp: Date.now() }));
      DOM.container.innerHTML = `<div class="mn-transition"><div class="mn-spinner"></div><p class="mn-transition-text">Opening Design Studio...</p></div>`;
      setTimeout(() => {
        const studioUrl = window.MN_CONFIG?.studioUrl || "/pages/ai-studio";
        window.location.href = studioUrl;
      }, 800);
    });
  };

  const renderTransition = (message, callback) => {
    const loadingPhrases = [
      '> Analyzing your aesthetic profile...',
      '> Cross-referencing micro-trends in your city...',
      '> Matching closet items to store inventory...',
      '> Weaving reality...'
    ];
    const html = `
      <div class="mn-transition" style="padding:30px;">
        <div class="mn-spinner"></div>
        <p class="mn-transition-text" style="margin-bottom:16px;">${message}</p>
        <div id="mn-loading-terminal" style="background:rgba(0,0,0,0.4);border:1px solid rgba(57,165,150,0.2);border-radius:10px;padding:12px;text-align:left;font-family:'Space Mono','Courier New',monospace;font-size:11px;color:#888;min-height:60px;"></div>
      </div>
    `;
    DOM.container.innerHTML = html;
    const terminal = document.getElementById('mn-loading-terminal');
    let idx = 0;
    const typeTimer = setInterval(() => {
      if (idx < loadingPhrases.length && terminal) {
        const line = document.createElement('div');
        line.textContent = loadingPhrases[idx];
        line.style.opacity = '0';
        line.style.transition = 'opacity 0.3s';
        terminal.appendChild(line);
        requestAnimationFrame(() => line.style.opacity = '1');
        idx++;
      } else clearInterval(typeTimer);
    }, 600);
    setTimeout(callback, 1800);
  };

  const selectSlogan = (btn, text) => {
    const allCards = DOM.container.querySelectorAll('.mn-slogan-card');
    allCards.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedSlogan = text;
  };

  const detectColorFromName = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('navy') || nameLower.includes('blue')) return '#000080';
    if (nameLower.includes('black')) return '#1a1a1a';
    if (nameLower.includes('white') || nameLower.includes('cream')) return '#f5f5f5';
    if (nameLower.includes('khaki') || nameLower.includes('beige')) return '#c3b091';
    if (nameLower.includes('brown')) return '#8b4513';
    if (nameLower.includes('grey') || nameLower.includes('gray')) return '#808080';
    return '#333333';
  };

  // ═══════════════════════════════════════════════════════════
  // CLOTH DETECTION & UPLOAD
  // ═══════════════════════════════════════════════════════════

  // Resize image before sending — prevents Vercel 10s timeout on large phones photos
  const resizeImageForUpload = (dataUrl) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1024;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

  const handleClothUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Show processing UI
    renderClothProcessing(files.length);

    const detectedItems = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Convert to base64
        const base64 = await fileToBase64(file);

        // Call cloth detection API
        // Resize before sending — prevents Vercel 10s timeout on large phone photos
        const resized = await resizeImageForUpload(base64);
        const result = await detectCloth(resized);

        if (result.success && result.detected_items && result.detected_items.length > 0) {
          detectedItems.push({
            image: base64,
            detected_items: result.detected_items,
            summary: result.summary,
            count: result.count,
            sections: result.sections
          });
        }
      } catch (error) {
        console.error('Error detecting cloth for file:', file.name, error);
      }
    }

    // Show save to closet confirmation
    if (detectedItems.length > 0) {
      renderSaveToClosetModal(detectedItems);
    } else {
      alert('⚠️ No clothing items detected.\n\nTips:\n• Use a photo where clothing is clearly visible\n• Avoid very dark or blurry images\n• Try a full-body or flat-lay shot');
      renderContextDashboard();
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const detectCloth = async (base64Image) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch('https://mynarrative-ai.vercel.app/api/cloth_detection', {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`API error ${response.status}`);
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('Cloth detection timeout — image may be too large or network too slow');
        return { success: false, detected_items: [], error: 'Detection timed out. Try a smaller or clearer photo.' };
      }
      console.error('Cloth detection error:', error);
      return { success: false, detected_items: [], error: error.message };
    }
  };

  const renderClothProcessing = (count) => {
    const html = `
      <div class="mn-processing mn-fade-in">
        <div class="mn-processing-icon">
          <div class="mn-spinner"></div>
        </div>
        <h3 class="mn-processing-title">Analyzing your ${count} photo${count > 1 ? 's' : ''}...</h3>
        <p class="mn-processing-subtitle">AI is detecting clothing items</p>
      </div>
    `;
    DOM.container.innerHTML = html;
  };

  const renderSaveToClosetModal = (detectedItems) => {
    const html = `
      <div class="mn-closet-modal mn-fade-in">
        <div class="mn-modal-header">
          <h3 class="mn-modal-title">🎉 ${detectedItems.reduce((acc, d) => acc + d.detected_items.length, 0)} Item${detectedItems.reduce((acc, d) => acc + d.detected_items.length, 0) !== 1 ? 's' : ''} Detected!</h3>
          <p class="mn-modal-subtitle">Would you like to save these to your digital closet?</p>
        </div>
        
        <div class="mn-detected-items">
          ${detectedItems.map((entry, idx) => entry.detected_items.map(item => `
            <div class="mn-detected-item">
              <img src="${entry.image}" class="mn-detected-img" alt="Photo ${idx + 1}" />
              <div class="mn-detected-info">
                <strong>${item.original_name || item.name}</strong>
                <span class="mn-item-section">${item.closet_section}${item.sub_category ? ' · ' + item.sub_category : ''}</span>
                <p style="margin:2px 0;">${[item.color, item.pattern, item.fabric].filter(Boolean).join(' · ') || 'Details pending'}</p>
                <p style="margin:2px 0; font-size:0.75em; opacity:0.8;">${[item.fit ? item.fit + ' fit' : null, item.style, item.gender].filter(Boolean).join(' · ')}</p>
                <p style="margin:2px 0; font-size:0.75em; opacity:0.75;">📅 ${item.occasion || 'Casual'} &nbsp;|&nbsp; 🌤 ${item.season || 'All Season'}</p>
                ${item.style_tags && item.style_tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px;">${item.style_tags.map(t => `<span style="background:rgba(255,255,255,0.15);border-radius:20px;padding:1px 7px;font-size:0.7em;">${t}</span>`).join('')}</div>` : ''}
              </div>
            </div>
          `).join('')).join('')}
        </div>
        
        <div class="mn-modal-actions">
          <button id="btn-save-closet" class="mn-btn-primary">💾 Save to My Closet</button>
          <button id="btn-skip-closet" class="mn-btn-secondary">Skip for Now</button>
        </div>
      </div>
    `;

    DOM.container.innerHTML = html;

    document.getElementById('btn-save-closet').addEventListener('click', () => {
      saveToDigitalCloset(detectedItems);
    });

    document.getElementById('btn-skip-closet').addEventListener('click', () => {
      renderContextDashboard();
    });
  };

  const saveToDigitalCloset = (items) => {
    try {
      // Get existing closet items
      const existingCloset = JSON.parse(localStorage.getItem('mn_digital_closet') || '[]');

      // Add new items with timestamp
      // Flatten: each entry has { image, detected_items[], summary, count, sections }
      const allDetected = items.flatMap(entry =>
        (entry.detected_items || []).map(item => ({ ...item })) // NO base64 image — too large for localStorage
      );
      const newItems = allDetected.map(item => ({
        item_id: item.item_id || Math.random().toString(36).substr(2, 8),
        ...item,
        id: Date.now() + Math.random(),
        addedAt: new Date().toISOString()
      }));

      // Save to localStorage
      const updatedCloset = [...existingCloset, ...newItems];
      // Trim to last 100 items to prevent localStorage QuotaExceededError
      const trimmedCloset = updatedCloset.slice(-100);
      localStorage.setItem('mn_digital_closet', JSON.stringify(trimmedCloset));

      // Show success message
      const savedCount = newItems.length;
      renderTransition(`✨ ${savedCount} clothing item${savedCount !== 1 ? 's' : ''} saved to your closet!`, () => renderContextDashboard());
    } catch (error) {
      console.error('Error saving to closet:', error);
      if (error && error.name === 'QuotaExceededError') {
        // localStorage is full — wipe old closet and save only new items
        try {
          const freshItems = items.flatMap(entry => (entry.detected_items || []).map(item => ({
            item_id: item.item_id || Math.random().toString(36).substr(2, 8),
            name: item.name || 'Unknown Item',
            closet_section: item.closet_section || item.category || 'Topwear',
            category: item.category || 'Unknown',
            color: item.color || null,
            fabric: item.fabric || null,
            occasion: item.occasion || 'Casual',
            season: item.season || 'All Season',
            style_tags: item.style_tags || [],
            addedAt: new Date().toISOString()
          })));
          localStorage.setItem('mn_digital_closet', JSON.stringify(freshItems));
          renderTransition('✨ Closet cleared & new items saved!', () => renderContextDashboard());
        } catch (e2) {
          alert('⚠️ Browser storage is full. Please clear site data and try again.');
          renderContextDashboard();
        }
      } else {
        alert('⚠️ Could not save to closet: ' + (error.message || 'Unknown error. Check console.'));
        renderContextDashboard();
      }
    }
  };

  // ═══════════════════════════════════════════════════════════
  // MAGIC MIRROR — THE MASTER FLOW (Zero-Step Onboarding)
  // ═══════════════════════════════════════════════════════════

  // STATE 2: Processing Theater — Photo + Laser Scanner + Item-Specific Terminal
  const handleMagicMirrorUpload = async (event) => {
    const _scanModeActive = state._info52ScanMode;
    state._info52ScanMode = false; // reset flag immediately
    // INFO52: wrap renderContextDashboard to intercept when scan mode active
    // INFO52: after analysis success, redirect to editorial reveal if coming from scan
    const _postAnalysisNavigate = (analysisResult) => {
      if (_scanModeActive) {
        renderEditorialReveal(analysisResult || state.identity || {});
      } else {
        renderContextDashboard();
      }
    };
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Get a preview URL for the uploaded photo
    const previewUrl = URL.createObjectURL(files[0]);

    // Render the Processing Theater with photo + scanner
    DOM.container.innerHTML = `
      <div class="mn-magic-processing mn-fade-in" style="padding:0;">
        <!-- Photo with scanning laser -->
        <div class="mn-scan-viewport" style="position:relative;width:100%;height:280px;overflow:hidden;border-radius:16px 16px 0 0;background:#050505;">
          <img src="${previewUrl}" alt="Your fit" style="width:100%;height:100%;object-fit:cover;opacity:0.85;filter:saturate(0.7);" />
          <div class="mn-laser-line"></div>
          <div style="position:absolute;top:12px;left:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);border:1px solid rgba(57,165,150,0.3);border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#39A596;animation:pulse 1s infinite;"></div>
            <span style="font-family:'Space Mono','Courier New',monospace;font-size:11px;color:#888;font-weight:700;letter-spacing:0.5px;">SCANNING</span>
          </div>
        </div>

        <!-- Terminal readout -->
        <div style="background:#050505;padding:20px;border-radius:0 0 16px 16px;border:1px solid rgba(255,255,255,0.06);border-top:none;">
          <div id="mn-terminal" style="background:rgba(0,0,0,0.8);border:1px solid rgba(57,165,150,0.2);border-radius:10px;padding:14px;font-family:'Space Mono','Courier New',monospace;font-size:11px;color:#888;min-height:100px;max-height:160px;overflow-y:auto;">
            <div id="mn-terminal-lines"></div>
            <span class="mn-terminal-cursor"></span>
          </div>
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:16px;">
            <div class="mn-spinner" style="width:20px;height:20px;border-width:2px;"></div>
            <span style="color:#888;font-size:11px;font-weight:600;">Extracting style DNA...</span>
          </div>
        </div>
      </div>
    `;

    const terminalEl = document.getElementById('mn-terminal-lines');
    const addTerminalLine = (text, color = '#888') => {
      if (!terminalEl) return;
      const line = document.createElement('div');
      line.textContent = text;
      line.style.cssText = `opacity:0;transition:opacity 0.3s;color:${color};margin-bottom:3px;`;
      terminalEl.appendChild(line);
      requestAnimationFrame(() => line.style.opacity = '1');
      // Auto-scroll
      terminalEl.parentElement.scrollTop = terminalEl.parentElement.scrollHeight;
    };

    // Phase 1: Iron Man HUD-style terminal readout
    addTerminalLine('> Booting MNCV-2 vision engine...');
    await new Promise(r => setTimeout(r, 500));
    addTerminalLine('> Loading fashion ontology — 14,000 garment types...');
    await new Promise(r => setTimeout(r, 400));
    addTerminalLine('> Extracting objects from image...');

    // Run the actual detection
    const detectedItems = [];
    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);
        const resized = await resizeImageForUpload(base64);

        addTerminalLine('> Running cloth detection pipeline...');
        const result = await detectCloth(resized);

        if (result.success && result.detected_items && result.detected_items.length > 0) {
          detectedItems.push({ image: base64, detected_items: result.detected_items, summary: result.summary, count: result.count, sections: result.sections, person_analysis: result.person_analysis });

          // ── Person Analysis: Auto-detect gender, build, skin tone, jewelry ──
          if (result.person_analysis) {
            const pa = result.person_analysis;
            addTerminalLine('> 👤 Analyzing person in frame...', '#4fffd9');
            await new Promise(r => setTimeout(r, 400));
            if (pa.gender) addTerminalLine(`> Gender detected: ${pa.gender}`);
            if (pa.body_build) addTerminalLine(`> Body build: ${pa.body_build}`);
            if (pa.skin_tone) addTerminalLine(`> Skin tone: ${pa.skin_tone}`);
            if (pa.undertone) addTerminalLine(`> Undertone: ${pa.undertone}`);
            await new Promise(r => setTimeout(r, 300));
            if (pa.jewelry_recommendations && pa.jewelry_recommendations.length > 0) {
              addTerminalLine(`> 💎 Jewelry analysis: ${pa.jewelry_recommendations.length} recommendations`, '#4fffd9');
              for (const jewel of pa.jewelry_recommendations.slice(0, 3)) {
                await new Promise(r => setTimeout(r, 200));
                addTerminalLine(`>   → ${jewel.type} (${jewel.metal}) — ${jewel.reason}`);
              }
            }
            await new Promise(r => setTimeout(r, 250));

            // Auto-populate profile from person analysis
            if (!state.identity) state.identity = {};
            if (!state.dataCollection) state.dataCollection = {};
            if (pa.gender) { state.identity.gender = pa.gender; state.dataCollection.gender = pa.gender; }
            if (pa.body_build) { state.identity.build = pa.body_build; state.dataCollection.build = pa.body_build; }
            if (pa.skin_tone) { state.identity.skinTone = pa.skin_tone; state.dataCollection.skinTone = pa.skin_tone; }
            if (pa.undertone) { state.identity.undertone = pa.undertone; state.dataCollection.undertone = pa.undertone; }
            if (pa.jewelry_recommendations) { state.identity.jewelryRecommendations = pa.jewelry_recommendations; }
          }

          // Phase 2: Item-specific readouts (the flex — Iron Man HUD)
          addTerminalLine(`> Detected ${result.detected_items.length} objects in frame.`, '#4fffd9');
          for (const item of result.detected_items) {
            await new Promise(r => setTimeout(r, 350));
            const itemName = item.original_name || item.name || 'Unknown';
            const color = item.color ? ` (${item.color}` : '';
            const fit = item.fit ? `, ${item.fit} Fit` : '';
            addTerminalLine(`> Classifying: ${itemName}${color}${fit}${item.color ? ')' : ''}`);
          }
          await new Promise(r => setTimeout(r, 300));
          // Derive aesthetic in terminal
          const preAesthetic = deriveAestheticFromItems(result.detected_items);
          addTerminalLine(`> Aesthetic profile: ${preAesthetic.darkPct}% Dark / ${preAesthetic.aesthetic}`, '#4fffd9');
          await new Promise(r => setTimeout(r, 250));
          addTerminalLine('> Syncing to Digital Closet...');
        }
      } catch (err) {
        console.error('Magic mirror detection error:', err);
        addTerminalLine('> ⚠ Detection error — retrying...', '#ff6b6b');
      }
    }

    if (detectedItems.length > 0) {
      addTerminalLine('> Calculating complementary pieces from store inventory...', '#4fffd9');
      await new Promise(r => setTimeout(r, 400));
      addTerminalLine('> Generating "Level Up" sequence...', '#4fffd9');
      await new Promise(r => setTimeout(r, 500));
      addTerminalLine('> ✅ Analysis complete. Rendering results.', '#4fffd9');

      saveToDigitalCloset(detectedItems);
      const allItems = detectedItems.flatMap(e => e.detected_items);
      const aesthetic = deriveAestheticFromItems(allItems);

      if (!state.identity) state.identity = {};
      state.identity.coreExpression = aesthetic.gender || 'Androgynous';
      state.identity.presence = aesthetic.aesthetic || 'Streetwear / Hypebeast';
      state.identity.signal = aesthetic.fit || 'Tailored / Slim';
      state.identity.archetype = deriveArchetype(state.identity);
      state.identity.detectedFromPhoto = true;
      state.identity._uploadedPhoto = previewUrl;
      // Persist person analysis data from magic mirror
      const personData = detectedItems[0]?.person_analysis;
      if (personData) {
        if (personData.gender) state.identity.gender = personData.gender;
        if (personData.body_build) state.identity.build = personData.body_build;
        if (personData.skin_tone) state.identity.skinTone = personData.skin_tone;
        if (personData.undertone) state.identity.undertone = personData.undertone;
        if (personData.jewelry_recommendations) state.identity.jewelryRecommendations = personData.jewelry_recommendations;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.identity));

      await new Promise(r => setTimeout(r, 800));
      // INFO52: Route to editorial reveal if coming from biometric scan, otherwise show original magic mirror results
      if (_scanModeActive) {
        _postAnalysisNavigate({
          skinTone: state.identity.skinTone,
          build: state.identity.build,
          gender: state.identity.gender,
          undertone: state.identity.undertone,
          jewelryRecommendations: state.identity.jewelryRecommendations,
          outfitRecommendations: [],
          detectedItems,
          aesthetic
        });
      } else {
        renderMagicMirrorResults(detectedItems, aesthetic);
      }
    } else {
      DOM.container.innerHTML = `
        <div class="mn-fade-in" style="text-align:center;padding:40px 20px;background:#050505;">
          <div style="font-size:56px;margin-bottom:16px;animation:float 3s ease-in-out infinite;">🤔</div>
          <h3 style="color:#fff;font-size:18px;font-weight:800;margin-bottom:8px;">Couldn't detect items clearly</h3>
          <p style="color:#666;font-size:13px;margin-bottom:28px;line-height:1.5;">Try a full-body photo with better lighting, or use the quick calibration instead.</p>
          <button id="btn-retry-magic" class="mn-btn-primary" style="width:100%;margin-bottom:10px;padding:14px;box-shadow:0 0 20px rgba(57,165,150,0.4);">📸 Try Another Photo</button>
          <button id="btn-fallback-cal" class="mn-btn-secondary" style="width:100%;opacity:0.7;">⚡ 3-Tap Calibration</button>
          <input type="file" id="retry-magic-input" accept="image/*" style="display:none" />
        </div>
      `;
      const retryInput = document.getElementById('retry-magic-input');
      document.getElementById('btn-retry-magic').addEventListener('click', () => retryInput.click());
      retryInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleMagicMirrorUpload(e); });
      document.getElementById('btn-fallback-cal').addEventListener('click', () => renderCalibrationFlow(0));
    }
    // Clean up object URL
    URL.revokeObjectURL(previewUrl);
  };

  const deriveAestheticFromItems = (items) => {
    const colors = items.map(i => (i.color || '').toLowerCase()).filter(Boolean);
    const fits = items.map(i => (i.fit || '').toLowerCase()).filter(Boolean);
    const genders = items.map(i => (i.gender || '').toLowerCase()).filter(Boolean);
    let gender = 'Androgynous';
    if (genders.filter(g => g.includes('men') || g.includes('male')).length > genders.length / 2) gender = 'Menswear';
    if (genders.filter(g => g.includes('women') || g.includes('female')).length > genders.length / 2) gender = 'Womenswear';
    let aesthetic = 'Streetwear / Hypebeast';
    const allTags = items.flatMap(i => i.style_tags || []).join(' ').toLowerCase();
    if (allTags.includes('formal') || allTags.includes('classic')) aesthetic = 'Old Money Minimal';
    else if (allTags.includes('grunge') || allTags.includes('vintage')) aesthetic = 'Y2K Grunge';
    else if (allTags.includes('dark') || allTags.includes('goth')) aesthetic = 'Opium / Darkwear';
    else if (allTags.includes('tech') || allTags.includes('utility')) aesthetic = 'Techwear / Gorpcore';
    else if (allTags.includes('boho') || allTags.includes('earthy')) aesthetic = 'Cottagecore / Boho';
    let fit = 'Tailored / Slim';
    if (fits.some(f => f.includes('oversized') || f.includes('loose') || f.includes('baggy'))) fit = 'Oversized / Baggy';
    if (fits.some(f => f.includes('crop'))) fit = 'Cropped Proportions';
    const darkColors = colors.filter(c => c.includes('black') || c.includes('dark') || c.includes('navy') || c.includes('charcoal'));
    const darkPct = colors.length > 0 ? Math.round((darkColors.length / colors.length) * 100) : 0;
    return { gender, aesthetic, fit, darkPct, itemCount: items.length };
  };

  // STATE 3: The Prestige — Split-Screen Reveal
  const renderMagicMirrorResults = (detectedItems, aesthetic) => {
    const allItems = detectedItems.flatMap(e => e.detected_items);
    const archetype = state.identity?.archetype || deriveArchetype({ coreExpression: aesthetic.gender, presence: aesthetic.aesthetic, signal: aesthetic.fit });
    const itemDescriptions = allItems.map(i => i.original_name || i.name).join(', ');

    const html = `
      <div class="mn-magic-results mn-fade-in" style="padding:0;background:#050505;">

        <!-- TOP SECTION: "The Level Up Vision" -->
        <div class="mn-levelup-section" style="position:relative;padding:28px 20px 24px;background:linear-gradient(180deg,rgba(57,165,150,0.08) 0%,#050505 100%);border-bottom:1px solid rgba(255,255,255,0.06);">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:14px;color:#39A596;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Your vibe, elevated ${archetype.icon}</div>
            <h2 style="font-size:22px;font-weight:800;color:#fff;margin-bottom:6px;letter-spacing:-0.3px;">${archetype.name}</h2>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;font-style:italic;">"${archetype.tagline}"</p>
          </div>

          <!-- Aesthetic Stats Bar -->
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;">
            <div class="mn-stat-pill">${aesthetic.darkPct}% Dark Palette</div>
            <div class="mn-stat-pill">${aesthetic.fit}</div>
            <div class="mn-stat-pill">${aesthetic.aesthetic}</div>
          </div>

          <!-- Auto-Detected Profile -->
          ${state.identity?.gender || state.identity?.build || state.identity?.skinTone ? `
          <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(57,165,150,0.15);border-radius:12px;padding:16px;margin-bottom:16px;backdrop-filter:blur(12px);">
            <p style="color:#39A596;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:700;">👤 Auto-Detected Profile</p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${state.identity.gender ? `<span style="font-size:11px;padding:5px 12px;border-radius:20px;background:rgba(57,165,150,0.12);border:1px solid rgba(57,165,150,0.25);color:#4fffd9;font-weight:600;">👤 ${state.identity.gender}</span>` : ''}
              ${state.identity.build ? `<span style="font-size:11px;padding:5px 12px;border-radius:20px;background:rgba(57,165,150,0.12);border:1px solid rgba(57,165,150,0.25);color:#4fffd9;font-weight:600;">💪 ${state.identity.build}</span>` : ''}
              ${state.identity.skinTone ? `<span style="font-size:11px;padding:5px 12px;border-radius:20px;background:rgba(57,165,150,0.12);border:1px solid rgba(57,165,150,0.25);color:#4fffd9;font-weight:600;">🎨 ${state.identity.skinTone}</span>` : ''}
              ${state.identity.undertone ? `<span style="font-size:11px;padding:5px 12px;border-radius:20px;background:rgba(57,165,150,0.12);border:1px solid rgba(57,165,150,0.25);color:#4fffd9;font-weight:600;">${state.identity.undertone === 'warm' ? '🥇' : state.identity.undertone === 'cool' ? '🥈' : '✨'} ${state.identity.undertone} undertone</span>` : ''}
            </div>
          </div>
          ` : ''}

          <!-- Jewelry Recommendations -->
          ${state.identity?.jewelryRecommendations && state.identity.jewelryRecommendations.length > 0 ? `
          <div style="background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.12);border-radius:12px;padding:16px;margin-bottom:16px;">
            <p style="color:#ffd700;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:700;">💎 Jewelry That Suits You</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${state.identity.jewelryRecommendations.slice(0, 4).map(j => `
                <div style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.3);border-radius:10px;padding:10px 12px;">
                  <span style="font-size:16px;">${j.metal === 'gold' ? '🥇' : j.metal === 'silver' ? '🥈' : j.metal === 'rose_gold' ? '🌹' : '⛓️'}</span>
                  <div>
                    <div style="color:#fff;font-size:12px;font-weight:700;">${j.type}</div>
                    <div style="color:#888;font-size:10px;">${j.reason}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Level Up CTA — generates an AI outfit using their items -->
          <div id="mn-levelup-preview" style="background:rgba(0,0,0,0.5);border:1px solid rgba(57,165,150,0.15);border-radius:16px;padding:24px;text-align:center;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);">
            <div style="font-size:40px;margin-bottom:12px;">✨</div>
            <p style="color:#fff;font-size:14px;font-weight:700;margin-bottom:6px;">Ready to see your level-up look?</p>
            <p style="color:#666;font-size:11px;margin-bottom:16px;">AI will combine your wardrobe items with premium pieces</p>
            <button id="btn-generate-levelup" class="mn-btn-primary mn-btn-glow" style="width:100%;padding:14px;font-size:14px;font-weight:800;">⚡ Generate "Level Up" Outfit</button>
          </div>

          <!-- STATE 4: Reaction Chips (Stealth Profiling) -->
          <div style="margin-top:20px;">
            <p style="color:#555;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;text-align:center;margin-bottom:10px;">Direct the AI</p>
            <div class="mn-reaction-chips">
              <button class="mn-reaction-chip" data-pref="budget:low" data-regen="Make it cheaper">💸 Make it cheaper</button>
              <button class="mn-reaction-chip" data-pref="color:dark" data-regen="Darker aesthetic">🖤 Darker aesthetic</button>
              <button class="mn-reaction-chip" data-pref="formality:formal" data-regen="Dress it up">👔 Dress it up</button>
              <button class="mn-reaction-chip" data-pref="style:y2k" data-regen="More Y2K vibe">🔥 More Y2K</button>
              <button class="mn-reaction-chip" data-pref="style:minimal" data-regen="Minimal and clean">🤍 Keep it minimal</button>
              <button class="mn-reaction-chip" data-pref="style:streetwear" data-regen="Street style drip">🔫 Street drip</button>
            </div>
          </div>
        </div>

        <!-- BOTTOM SECTION: "Digital Closet Proof" -->
        <div style="padding:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <h3 style="font-size:14px;color:#fff;font-weight:700;">🔓 Added to your Closet</h3>
            <span style="background:rgba(57,165,150,0.15);color:#39A596;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;">${allItems.length} items</span>
          </div>

          <!-- Horizontal Swipeable Carousel -->
          <div class="mn-closet-carousel" style="display:flex;gap:12px;overflow-x:auto;padding-bottom:14px;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;">
            ${allItems.map(item => `
              <div class="mn-closet-reveal-card" style="scroll-snap-align:start;">
                <div class="mn-reveal-emoji">${getItemEmoji(item)}</div>
                <div class="mn-reveal-name">${item.original_name || item.name}</div>
                <div class="mn-reveal-meta">${[item.color, item.fabric].filter(Boolean).join(' · ') || 'Detected'}</div>
                ${item.closet_section ? `<div class="mn-reveal-section">${item.closet_section}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- STATE 5: Viral Conversion — Anchored Try-On CTA -->
        <div class="mn-tryon-cta-bar" style="position:sticky;bottom:0;padding:16px 20px;background:linear-gradient(180deg,transparent 0%,#050505 20%,#050505 100%);">
          <button id="btn-tryon-look" class="mn-btn-primary mn-btn-glow" style="width:100%;padding:16px;font-size:15px;font-weight:800;letter-spacing:0.3px;">
            ✨ Try this entire look on ME
          </button>

          <!-- STATE 6: Viral Loop CTAs -->
          <div class="mn-viral-cta">
            <button id="btn-roast-fit" class="mn-viral-btn mn-viral-roast">🔥 Roast My Fit</button>
            <button id="btn-generate-more" class="mn-viral-btn mn-viral-generate">✨ 5 More Outfits</button>
          </div>

          <div style="display:flex;gap:8px;margin-top:10px;">
            <button id="btn-go-dashboard-mm" class="mn-btn-secondary" style="flex:1;font-size:12px;opacity:0.6;">→ Dashboard</button>
            <button id="btn-upload-another" class="mn-btn-secondary" style="flex:1;font-size:12px;opacity:0.6;">📸 Scan Another Fit</button>
            <input type="file" id="rescan-input" accept="image/*" style="display:none" />
          </div>
        </div>

      </div>
    `;

    DOM.container.innerHTML = html;

    // --- Event Handlers ---

    // Level Up generation
    document.getElementById('btn-generate-levelup').addEventListener('click', () => {
      state.currentContext = { mode: 'self', contexts: ['Level up my current aesthetic using my closet items'], loudness: 'Statement' };
      if (hasBodyData()) generateAIRecommendations();
      else renderSelfContext();
    });

    // Reaction Chips — stealth profiling + re-generation
    DOM.container.querySelectorAll('.mn-reaction-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const pref = chip.dataset.pref;
        const regenContext = chip.dataset.regen;

        // Visual feedback — snap + glow
        chip.style.transform = 'scale(0.92)';
        chip.style.borderColor = '#39A596';
        chip.style.background = 'rgba(57,165,150,0.2)';
        setTimeout(() => { chip.style.transform = ''; }, 150);

        // Silent profile logging (localStorage for now, Supabase PATCH when available)
        try {
          const prefs = JSON.parse(localStorage.getItem('mn_user_preferences') || '{}');
          const [category, value] = pref.split(':');
          if (!prefs[category]) prefs[category] = [];
          if (!prefs[category].includes(value)) prefs[category].push(value);
          prefs.lastInteraction = new Date().toISOString();
          localStorage.setItem('mn_user_preferences', JSON.stringify(prefs));
        } catch (e) { console.error('Pref save error:', e); }

        // Silent PATCH to profile_manager (fire-and-forget)
        try {
          fetch('https://mynarrative-ai.vercel.app/api/profile_manager', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_preferences',
              user_id: localStorage.getItem('mn_user_id') || 'anonymous',
              preference: pref,
              timestamp: new Date().toISOString()
            })
          }).catch(() => { }); // Silent — never block UI
        } catch (e) { /* swallow */ }

        // Trigger re-generation with the new context
        state.currentContext = { mode: 'self', contexts: [regenContext], loudness: 'Balanced' };
        if (hasBodyData()) generateAIRecommendations();
        else renderSelfContext();
      });
    });

    // Try-On CTA — routes to virtual try-on pipeline
    document.getElementById('btn-tryon-look').addEventListener('click', () => {
      const faceImage = state.identity?.faceImage || state.dataCollection?.faceImage || null;
      const fluxPrompt = `A photorealistic shot of a person wearing ${itemDescriptions}. Premium styling, cinematic lighting, high fashion.`;

      // Render a try-on loading state in the levelup preview area
      const previewArea = document.getElementById('mn-levelup-preview');
      if (previewArea) {
        previewArea.innerHTML = `
          <div style="text-align:center;padding:20px;">
            <div class="mn-spinner" style="margin:0 auto 16px;"></div>
            <p style="color:#fff;font-size:14px;margin-bottom:4px;">🎨 AI is styling this look on you...</p>
            <p style="color:#666;font-size:11px;">This may take 20-30 seconds</p>
          </div>
        `;
        previewArea.id = 'mn-tryon-canvas';
        window.generateFluxLook(fluxPrompt, 'mn-tryon-canvas', faceImage);
      }
    });

    // Dashboard nav
    document.getElementById('btn-go-dashboard-mm').addEventListener('click', renderContextDashboard);

    // Rescan
    const rescanInput = document.getElementById('rescan-input');
    document.getElementById('btn-upload-another').addEventListener('click', () => rescanInput.click());
    rescanInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleMagicMirrorUpload(e); });

    // Viral Loop: Roast My Fit
    document.getElementById('btn-roast-fit')?.addEventListener('click', () => {
      state.currentContext = { mode: 'self', contexts: [`Roast and critique my current outfit: ${itemDescriptions}. Be brutally honest but funny, then suggest how to fix it.`], loudness: 'Statement' };
      if (hasBodyData()) generateAIRecommendations();
      else renderSelfContext();
    });

    // Viral Loop: Generate 5 More Outfits
    document.getElementById('btn-generate-more')?.addEventListener('click', () => {
      state.currentContext = { mode: 'self', contexts: [`Generate 5 completely different outfit combinations using these items from my closet: ${itemDescriptions}. Make each one a different aesthetic.`], loudness: 'Statement' };
      if (hasBodyData()) generateAIRecommendations();
      else renderSelfContext();
    });
  };

  return { init, expandWidget, minimizeWidget, clearIdentity, selectSlogan };

})();

// ═══════════════════════════════════════════════════════════
// GAP 1 FIX: NEW HELPER - GENERATE FLUX LOOK
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// GAP 1 FIX: NEW HELPER - GENERATE FLUX LOOK
// ═══════════════════════════════════════════════════════════
window.generateFluxLook = async (prompt, containerId, userImage = null) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div style="background:rgba(0,0,0,0.8); padding:30px; border-radius:12px; text-align:center;">
      <div class="mn-spinner" style="margin:0 auto 16px;"></div>
      <p style="color:#fff; font-size:14px; margin-bottom:8px;">🎨 AI is styling this look...</p>
      <p style="color:#999; font-size:11px;">This may take 20-30 seconds</p>
    </div>
  `;

  try {
    const res = await fetch("https://mynarrative-ai.vercel.app/api/virtual_try_on", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'flux', prompt: prompt, user_image: userImage })
    });

    const data = await res.json();

    if (data.success && data.image) {
      // Replace entire avatar container with the generated image
      const avatarContainer = document.getElementById('mn-avatar-container');
      if (avatarContainer) {
        avatarContainer.innerHTML = `
          <img src="${data.image}" 
               style="width:100%; height:100%; object-fit:cover; border-radius:12px; animation: mnFadeIn 1s;" 
               alt="AI Generated Look">
          <div style="position:absolute; bottom:16px; right:16px; background:rgba(0,0,0,0.7); color:#fff; font-size:11px; padding:8px 12px; border-radius:8px; backdrop-filter:blur(4px);">
            ✨ AI Generated Preview
          </div>
          <button onclick="window.regenerateFluxLook('${prompt.replace(/'/g, "\\'")}', '${containerId}', ${userImage ? `'${userImage}'` : 'null'})" 
                  style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.2); color:#fff; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:11px; backdrop-filter:blur(4px);">
            🔄 Regenerate
          </button>
        `;
      }
    } else {
      throw new Error(data.error || "Generation failed");
    }
  } catch (e) {
    console.error("❌ FLUX Error:", e);
    container.innerHTML = `
      <div style="text-align:center; padding:30px; background:rgba(0,0,0,0.8); border-radius:12px;">
        <p style="color:#ff6b6b; font-size:14px; margin-bottom:12px;">⚠️ Could not generate look</p>
        <p style="color:#999; font-size:11px; margin-bottom:16px;">${e.message || 'Please try again'}</p>
        <button class="mn-btn-secondary" 
                onclick="window.generateFluxLook('${prompt.replace(/'/g, "\\'")}', '${containerId}', ${userImage ? `'${userImage}'` : 'null'})" 
                style="padding:8px 16px; font-size:12px;">
          🔄 Try Again
        </button>
      </div>
    `;
  }
};

// Helper function to regenerate
window.regenerateFluxLook = (prompt, containerId, userImage = null) => {
  const container = document.getElementById(containerId);
  const avatarContainer = document.getElementById('mn-avatar-container');
  if (avatarContainer) {
    avatarContainer.innerHTML = `<div id="${containerId}" style="width: 100%; height: 450px; display:flex; align-items:center; justify-content:center;"></div>`;
    window.generateFluxLook(prompt, containerId, userImage);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', MNAIStylist.init);
} else {
  MNAIStylist.init();
}