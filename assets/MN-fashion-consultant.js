/**
 * MY NARRATIVE — ZERO-FRICTION AI STYLIST WIDGET v2.0
 * =====================================================
 * 5-Step Flow:
 *   1A. Occasion Selector → 1B. Vibe Check →
 *   2. Magic Image Upload → 3. Dopamine Loading →
 *   4. Editorial Result + MST tooltip + RED gap upsell →
 *   5. Gamification (Mascot Quest + Style Graph)
 *
 * API: window.MN_CONFIG.apiUrl → /api/stylist_pipeline
 */

const MNAIStylist = (() => {

  const API_URL = window.MN_CONFIG?.apiUrl || 'https://mynarrative-ai.vercel.app/api/stylist_pipeline';

  // ── STATE ──────────────────────────────────────────────────
  const state = {
    isExpanded: false,
    step: '1A',
    occasion: null, occasionLabel: null,
    vibeId: null, vibeLabel: null, vibeIndex: 0,
    userImageBase64: null, isDragging: false,
    pipelineResult: null, isLoading: false,
    error: null, mstTooltipOpen: false,
  };

  // ── DATA: OCCASIONS ────────────────────────────────────────
  const OCCASIONS = [
    { id: 'date_night',   label: 'Date Night',   emoji: '🌙', description: 'Romantic vibes, elevated style' },
    { id: 'office',       label: 'Office',       emoji: '💼', description: 'Sharp, smart, ready to lead' },
    { id: 'sangeet',      label: 'Sangeet',      emoji: '💃', description: 'Festive, bold, unapologetically desi' },
    { id: 'airport_look', label: 'Airport Look', emoji: '✈️', description: 'Comfort that still serves looks' },
  ];

  // ── DATA: VIBE CARDS ───────────────────────────────────────
  const VIBE_CARDS = [
    { id: 'caffeine_survivor', label: 'Surviving on Caffeine', emoji: '☕', tagline: 'Too tired to care, too stylish to ignore',  persona: 'Effortlessly unbothered',  bg: '#3d2a00', accent: '#f59e0b' },
    { id: 'sarcastic_rizzler', label: 'The Sarcastic Rizzler', emoji: '😏', tagline: 'Your outfit speaks before you do',          persona: 'Sharp-witted trendsetter', bg: '#1e0038', accent: '#a855f7' },
    { id: 'main_character',    label: 'Main Character Energy', emoji: '✨', tagline: 'The spotlight was built for you',            persona: 'Protagonist of every scene', bg: '#3d0018', accent: '#ec4899' },
    { id: 'quiet_luxury',      label: 'Quiet Luxury',          emoji: '🤫', tagline: 'If you know, you know',                     persona: 'Old-money minimalist',      bg: '#1a1a1a', accent: '#a8a29e' },
  ];

  // ── DATA: LOADING MESSAGES ─────────────────────────────────
  const LOADING_MESSAGES = [
    { text: 'Analyzing Skin Tone…',        emoji: '🎨', delay: 0   },
    { text: 'Mapping Your Wardrobe…',      emoji: '👔', delay: 1.8 },
    { text: 'Detecting Body Proportions…', emoji: '📐', delay: 3.6 },
    { text: 'Matching Colour Theory…',     emoji: '🌈', delay: 5.4 },
    { text: 'Generating Editorial Look…',  emoji: '📸', delay: 7.2 },
    { text: 'Applying Your Identity…',     emoji: '🪄', delay: 9.0 },
    { text: 'Almost there…',               emoji: '✨', delay: 11  },
  ];

  // ── UTILITIES ──────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);

  const setContent = (html) => {
    const c = $('#mn-content-container');
    if (c) c.innerHTML = html;
    updateProgress();
  };

  const updateProgress = () => {
    const pct = { '1A': 10, '1B': 25, '2': 45, '3': 70, '4': 90, '5': 100 };
    const fill = $('.mn-progress-fill');
    if (fill) fill.style.width = (pct[state.step] || 10) + '%';
  };

  // ── STEP 1A: OCCASION SELECTOR ─────────────────────────────
  const renderStep1A = () => {
    state.step = '1A';
    setContent(`
      <div class="mn-step">
        <div class="mn-step-header">
          <p class="mn-step-label">Step 1 of 5</p>
          <h2 class="mn-step-title">Where are we heading?</h2>
          <p class="mn-step-subtitle">Pick the scene. We'll style the look.</p>
        </div>
        <div class="mn-occasion-grid">
          ${OCCASIONS.map(o => `
            <button class="mn-occasion-card" data-id="${o.id}" data-label="${o.label}">
              <span class="mn-occasion-emoji">${o.emoji}</span>
              <span class="mn-occasion-label">${o.label}</span>
              <span class="mn-occasion-desc">${o.description}</span>
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
        state.occasion = btn.dataset.id;
        state.occasionLabel = btn.dataset.label;
        renderStep1B();
      });
    });
  };

  // ── STEP 1B: VIBE CHECK ────────────────────────────────────
  const renderStep1B = () => {
    state.step = '1B';
    const vibe = VIBE_CARDS[state.vibeIndex];
    const isLast = state.vibeIndex >= VIBE_CARDS.length - 1;
    setContent(`
      <div class="mn-step">
        <div class="mn-step-header">
          <p class="mn-step-label mn-label-purple">Vibe Check</p>
          <h2 class="mn-step-title">What's the energy today?</h2>
          <p class="mn-step-subtitle">Swipe right to pick or left to skip</p>
        </div>
        <div class="mn-vibe-stack">
          <div class="mn-vibe-card" id="mn-active-vibe"
               style="background:${vibe.bg};border-color:${vibe.accent}44">
            <div class="mn-vibe-glow" style="background:${vibe.accent}18;position:absolute;inset:0;border-radius:24px;"></div>
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
          <button class="mn-btn-select" id="mn-select-vibe"
                  style="background:${vibe.accent};color:#000">♥ This is me</button>
        </div>
        <div class="mn-step-dots">
          <span class="mn-dot mn-dot-done"></span>
          <span class="mn-dot mn-dot-active"></span>
          <span class="mn-dot"></span><span class="mn-dot"></span><span class="mn-dot"></span>
        </div>
      </div>
    `);

    const selectVibe = () => {
      state.vibeId = vibe.id;
      state.vibeLabel = vibe.label;
      renderStep2();
    };
    const skipVibe = () => {
      if (!isLast) { state.vibeIndex++; renderStep1B(); }
    };

    $('#mn-select-vibe').addEventListener('click', selectVibe);
    $('#mn-skip-vibe').addEventListener('click', skipVibe);

    // Touch + mouse swipe
    let startX = 0;
    const card = $('#mn-active-vibe');
    card.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    card.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > 80) selectVibe();
      else if (dx < -80) skipVibe();
    });
    card.addEventListener('mousedown', e => { startX = e.clientX; });
    card.addEventListener('mouseup', e => {
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { if (dx > 80) selectVibe(); else if (dx < -80) skipVibe(); }
    });
  };

  // ── STEP 2: IMAGE UPLOAD ───────────────────────────────────
  const renderStep2 = () => {
    state.step = '2';
    const occ = OCCASIONS.find(o => o.id === state.occasion);
    const vib = VIBE_CARDS.find(v => v.id === state.vibeId);
    setContent(`
      <div class="mn-step">
        <div class="mn-recap-bar">
          <span>${occ ? occ.emoji + ' ' + occ.label : ''}</span>
          <span class="mn-recap-arrow">→</span>
          <span class="mn-recap-vibe">${vib ? vib.emoji + ' ' + vib.label : ''}</span>
        </div>
        <div class="mn-step-header">
          <h2 class="mn-step-title">Now, the magic photo ✨</h2>
          <p class="mn-step-subtitle">Upload a recent photo of yourself in a full outfit.<br>We'll extract your fit and generate your editorial look.</p>
        </div>
        <div class="mn-upload-zone" id="mn-upload-zone">
          <div class="mn-upload-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
            </svg>
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
      e.preventDefault(); zone.classList.remove('mn-dragging');
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
    reader.onload = () => { state.userImageBase64 = reader.result; runPipeline(); };
    reader.onerror = () => { state.error = 'Failed to read image. Please try again.'; renderStep2(); };
    reader.readAsDataURL(file);
  };

  // ── STEP 3: DOPAMINE LOADING ───────────────────────────────
  const renderStep3 = () => {
    state.step = '3';
    setContent(`
      <div class="mn-step mn-step-3">
        <div class="mn-loading-orb">
          <div class="mn-orb-glow"></div>
          <div class="mn-orb-inner">🪄</div>
        </div>
        <div class="mn-loading-messages">
          ${LOADING_MESSAGES.map((msg, i) => `
            <div class="mn-loading-row" style="animation-delay:${msg.delay}s">
              <span class="mn-loading-emoji">${msg.emoji}</span>
              <span class="mn-loading-text">${msg.text}</span>
              <div class="mn-loading-bar">
                <div class="mn-loading-bar-fill" style="animation-delay:${msg.delay + 0.3}s"></div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="mn-overall-bar"><div class="mn-overall-fill"></div></div>
      </div>
    `);
    updateProgress();
  };

  // ── API CALL ───────────────────────────────────────────────
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

  // ── STEP 4: RESULT + UPSELL ────────────────────────────────
  const renderStep4 = () => {
    state.step = '4';
    const r = state.pipelineResult;
    const { wardrobe, editorial, color_theory, affiliate_upsells, outfit_completion_pct, gamification } = r;

    const wardrobeHTML = (wardrobe.items || []).map(item => `
      <div class="mn-outfit-row">
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
          <p class="mn-upsell-name">${u.product_name}</p>
          <p class="mn-upsell-brand">${u.brand}</p>
          <div class="mn-upsell-price">
            <span class="mn-price-now">₹${u.price.toLocaleString('en-IN')}</span>
            <span class="mn-price-was">₹${u.original_price.toLocaleString('en-IN')}</span>
            <span class="mn-price-off">${u.discount_pct}% OFF</span>
          </div>
        </div>
        <div class="mn-upsell-completion">⚡ Your look is ${outfit_completion_pct}% complete. Buy these to hit 100%.</div>
        <div class="mn-bank-offer">🏦 ${u.bank_offer}</div>
        <a href="${u.affiliate_url}" target="_blank" rel="noopener noreferrer" class="mn-upsell-cta">
          Shop on ${u.platform} ↗
        </a>
      </div>
    `).join('');

    const mstColors = (color_theory.best_colors || []).map(c =>
      `<span class="mn-color-pill mn-color-good">${c}</span>`).join('');
    const avoidColors = (color_theory.avoid_colors || []).map(c =>
      `<span class="mn-color-pill mn-color-avoid">${c}</span>`).join('');

    setContent(`
      <div class="mn-step">
        <div class="mn-step-header">
          <p class="mn-step-label">Your Editorial Look</p>
          <h2 class="mn-step-title">${state.vibeLabel}</h2>
          <p class="mn-step-subtitle">${state.occasionLabel} · crafted for your tone &amp; build</p>
        </div>

        <div class="mn-result-image-wrap">
          <img src="${editorial.final_image_url}" alt="AI Editorial Look" class="mn-result-image"
               onerror="this.style.display='none'"/>
          <div class="mn-result-overlay">
            <span class="mn-result-vibe-badge">${state.vibeLabel}</span>
            <button class="mn-mst-badge" id="mn-mst-toggle">
              MST ${color_theory.mst_value} · Why this works ↗
            </button>
          </div>
        </div>

        <div class="mn-mst-tooltip" id="mn-mst-tooltip" style="display:none">
          <p class="mn-tooltip-title">🎨 Colour Theory · Monk Skin Tone ${color_theory.mst_value}</p>
          <p class="mn-tooltip-body">${color_theory.tooltip_text || ''}</p>
          <p class="mn-tooltip-label">✓ Best Colours</p>
          <div class="mn-color-pills">${mstColors}</div>
          <p class="mn-tooltip-label">✕ Avoid</p>
          <div class="mn-color-pills">${avoidColors}</div>
          <p class="mn-tooltip-note">💡 ${color_theory.undertone_note || ''}</p>
        </div>

        <p class="mn-section-title">👔 Outfit Breakdown</p>
        <div class="mn-outfit-list">${wardrobeHTML}</div>

        ${upsellHTML ? `<p class="mn-section-title">🛍️ Complete Your Look</p>${upsellHTML}` : ''}

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
      state.mstTooltipOpen = !state.mstTooltipOpen;
      $('#mn-mst-tooltip').style.display = state.mstTooltipOpen ? 'block' : 'none';
    });
    $('#mn-open-gamification').addEventListener('click', renderStep5);
    $('#mn-retry').addEventListener('click', resetFlow);
  };

  // ── STEP 5: GAMIFICATION ───────────────────────────────────
  const renderStep5 = () => {
    state.step = '5';
    const g = state.pipelineResult?.gamification;
    if (!g) return;
    const { mascot_quest, style_graph } = g;
    const mascotPct = Math.round((mascot_quest.cards_collected / mascot_quest.cards_total) * 100);

    setContent(`
      <div class="mn-step">
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
            <button class="mn-checkout-cta">
              ${mascot_quest.checkout_cta || 'Checkout to unlock physical card'}
            </button>
          </div>
        </div>

        <div class="mn-gamification-card mn-style-graph-card">
          <h3 class="mn-game-title">📊 Style Graph Builder</h3>
          <p class="mn-game-subtitle">
            Upload 3 more Outfit of the Day photos to train your AI and unlock 5% Store Credit.
          </p>
          <div class="mn-game-progress-track">
            <div class="mn-game-progress-fill mn-green-fill"
                 style="width:${style_graph.progress_pct}%"></div>
          </div>
          <p class="mn-game-progress-label">
            <strong>${style_graph.photos_uploaded || 1}/${style_graph.photos_required || 4}</strong> OOTD photos uploaded
          </p>
          <p class="mn-reward-desc">${style_graph.reward_description || ''}</p>
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

  // ── FLOW CONTROL ───────────────────────────────────────────
  const resetFlow = () => {
    Object.assign(state, {
      step: '1A', occasion: null, occasionLabel: null,
      vibeId: null, vibeLabel: null, vibeIndex: 0,
      userImageBase64: null, pipelineResult: null,
      isLoading: false, error: null, mstTooltipOpen: false,
    });
    renderStep1A();
  };

  // ── WIDGET EXPAND / COLLAPSE ───────────────────────────────
  const expandWidget = () => {
    state.isExpanded = true;
    const expanded = document.getElementById('mn-widget-expanded');
    const minimized = document.getElementById('mn-widget-minimized');
    if (expanded) { expanded.style.display = 'flex'; expanded.removeAttribute('aria-hidden'); }
    if (minimized) minimized.style.display = 'none';
    if (!state.pipelineResult && state.step === '1A') renderStep1A();
  };

  const collapseWidget = () => {
    state.isExpanded = false;
    const expanded = document.getElementById('mn-widget-expanded');
    const minimized = document.getElementById('mn-widget-minimized');
    if (expanded) { expanded.style.display = 'none'; expanded.setAttribute('aria-hidden', 'true'); }
    if (minimized) minimized.style.display = 'flex';
  };

  // ── INIT ───────────────────────────────────────────────────
  const init = () => {
    const minimized = document.getElementById('mn-widget-minimized');
    const closeBtn  = document.getElementById('mn-close-btn');

    if (minimized) minimized.addEventListener('click', expandWidget);
    if (closeBtn)  closeBtn.addEventListener('click', collapseWidget);

    // First visit: auto-open after 3 s; returning visit: show bubble
    if (!sessionStorage.getItem('mn_widget_seen')) {
      setTimeout(() => {
        expandWidget();
        sessionStorage.setItem('mn_widget_seen', '1');
      }, 3000);
    } else {
      if (minimized) minimized.style.display = 'flex';
    }
  };

  return { init, expandWidget, collapseWidget, resetFlow };

})();

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MNAIStylist.init());
} else {
  MNAIStylist.init();
}
