/**
 * MY NARRATIVE — Main Character Onboarding v1.0
 * ===============================================
 * 5-Step Flow: Hook → Aesthetic → Occasion → Canvas → Results
 * Persistent UI: Profile Ring, Closet Chip, Gift FAB
 *
 * ANTI-HALLUCINATION GUARDRAILS:
 *   - All AI scanning/generation uses setTimeout to simulate delays
 *   - Affiliate data is hardcoded mock JSON (no real-time scraping)
 *   - No actual ML models — pure UX state simulation
 */

const MNOnboarding = (() => {

  // ── STATE ────────────────────────────────────────────────
  const state = {
    currentStep: 1,
    selectedAesthetics: [],   // Step 2: array of aesthetic ids
    selectedOccasions: [],    // Step 3: array of occasion ids
    selfieBase64: null,       // Step 4: uploaded selfie
    wardrobeBase64: null,     // Step 5: wardrobe upload
    closetItems: [],          // digitized closet items
    step5State: 'A',          // A=initial | B=scanning | C=dopamine | D=upsell
    profileHeight: 172,
    profileFit: 'regular',
    brandInput: '',
    passionInput: '',
    bankInput: '',
  };

  // ── DATA: AESTHETICS (50/50 Men / Women) ────────────────
  // 4 Men (indices 0,1,2,3) + 4 Women (indices 4,5,6,7)
  // Unsplash editorial-quality placeholder images
  const AESTHETICS = [
    // ── MEN ──
    {
      id: 'old_money_m',
      style: 'Old Money',
      name: 'The Heritage Edit',
      gender: 'M',
      img: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=533&fit=crop&crop=top',
    },
    {
      id: 'street_m',
      style: 'Street Style',
      name: 'Urban Architect',
      gender: 'M',
      img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=533&fit=crop&crop=top',
    },
    {
      id: 'indo_western_m',
      style: 'Indo-Western',
      name: 'Desi Modernist',
      gender: 'M',
      img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=533&fit=crop&crop=top',
    },
    {
      id: 'corporate_m',
      style: 'Corporate Core',
      name: 'Power Suit Era',
      gender: 'M',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&fit=crop&crop=top',
    },
    // ── WOMEN ──
    {
      id: 'minimalist_f',
      style: 'Minimalist',
      name: 'The Edit',
      gender: 'F',
      img: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=533&fit=crop&crop=top',
    },
    {
      id: 'y2k_f',
      style: 'Y2K Chrome',
      name: 'Millennial Glitch',
      gender: 'F',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=533&fit=crop&crop=top',
    },
    {
      id: 'cyberpunk_f',
      style: 'Cyberpunk',
      name: 'Neon Manifesto',
      gender: 'F',
      img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=533&fit=crop&crop=top',
    },
    {
      id: 'casual_f',
      style: 'Casual Essentials',
      name: 'The Daily Uniform',
      gender: 'F',
      img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=533&fit=crop&crop=top',
    },
  ];

  // ── DATA: OCCASIONS ──────────────────────────────────────
  const OCCASIONS = [
    { id: 'college',   label: 'College Fest / Campus',       emoji: '🎓' },
    { id: 'office',    label: 'Office / Corporate',          emoji: '💼' },
    { id: 'pooja',     label: 'Pooja / Ethnic Event',        emoji: '🪔' },
    { id: 'sangeet',   label: 'Sangeet / Family Function',   emoji: '💃' },
    { id: 'date',      label: 'DATE',                  emoji: '&#x1F495;' },
    { id: 'airport',   label: 'Airport Look',                emoji: '✈️' },
    { id: 'gym',       label: 'Gym / Activewear',            emoji: '🏋️' },
    { id: 'casual',    label: 'Just Casual Daily Wear',      emoji: '☕' },
  ];

  // ── DATA: MOCK WARDROBE ITEMS (simulated CV extraction) ──
  const MOCK_WARDROBE_ITEMS = [
    { label: 'Denim Jeans',   img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&h=200&fit=crop' },
    { label: 'White Tee',     img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=200&fit=crop' },
    { label: 'Oversized Jacket', img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=150&h=200&fit=crop' },
    { label: 'Sneakers',      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=200&fit=crop' },
  ];

  // ── DATA: MOCK AFFILIATE CATALOGUE (anti-hallucination — no scraping) ──
  // Hardcoded affiliate recs keyed by bank card selection
  const AFFILIATE_RECS = {
    default: {
      item: 'White Chunky Sneakers',
      brand: 'Nike',
      platform: 'Myntra',
      price: 8999,
      original_price: 12999,
      discount_pct: 31,
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop',
      url: 'https://www.myntra.com/nike-chunky-sneakers?aff=mynarrative',
      bank_offer: 'No card offer active. Flat ₹200 off on Myntra Pay.',
    },
    HDFC: {
      item: 'White Chunky Sneakers',
      brand: 'Nike',
      platform: 'Myntra',
      price: 8499,
      original_price: 12999,
      discount_pct: 35,
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop',
      url: 'https://www.myntra.com/nike-chunky-sneakers?aff=mynarrative&bank=hdfc',
      bank_offer: '🏦 Save ₹500 extra with HDFC Credit Card. Code: HDFC500',
    },
    SBI: {
      item: 'White Chunky Sneakers',
      brand: 'Adidas',
      platform: 'Amazon',
      price: 7999,
      original_price: 11999,
      discount_pct: 33,
      img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=250&fit=crop',
      url: 'https://www.amazon.in/adidas-chunky-sneakers?tag=mynarrative-21',
      bank_offer: '🏦 10% cashback with SBI SimplyCLICK card. Max ₹1500.',
    },
    ICICI: {
      item: 'White Platform Sneakers',
      brand: 'Puma',
      platform: 'Myntra',
      price: 6999,
      original_price: 9999,
      discount_pct: 30,
      img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=250&fit=crop',
      url: 'https://www.myntra.com/puma-platform?aff=mynarrative&bank=icici',
      bank_offer: '🏦 5% cashback with ICICI Amazon Pay card. No min spend.',
    },
  };

  // ── UTILITIES ─────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const showStep = (n) => {
    for (let i = 1; i <= 5; i++) {
      const el = $(`#mn-step-${i}`);
      if (el) el.style.display = i === n ? 'flex' : 'none';
    }
    state.currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatINR = (n) => '₹' + n.toLocaleString('en-IN');

  return { state, AESTHETICS, OCCASIONS, MOCK_WARDROBE_ITEMS, AFFILIATE_RECS, $, $$, showStep, formatINR };

})();

// ═══════════════════════════════════════════════════════════
// PERSISTENT GLOBAL UI
// ═══════════════════════════════════════════════════════════
const MNPersistent = (() => {
  const { $, $$, state } = MNOnboarding;

  const initProfileRing = () => {
    const btn = $('#mn-profile-ring');
    const modal = $('#mn-profile-modal');
    const close = $('#mn-profile-modal-close');
    const slider = $('#mn-height-slider');
    const valEl = $('#mn-height-val');
    const saveBtn = $('#mn-save-profile');
    if (!btn) return;

    btn.addEventListener('click', () => { modal.style.display = 'flex'; });
    close.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    slider.addEventListener('input', () => {
      state.profileHeight = slider.value;
      valEl.textContent = slider.value + ' cm';
    });

    $$('.mn-fit-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.mn-fit-chip').forEach(c => c.classList.remove('mn-fit-active'));
        chip.classList.add('mn-fit-active');
        state.profileFit = chip.dataset.fit;
      });
    });

    saveBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      // Animate ring to reflect completion
      const fill = document.querySelector('.mn-ring-fill');
      if (fill) fill.style.strokeDashoffset = '35'; // ~69% complete after profile save
    });
  };

  const initClosetChip = () => {
    const chip = $('#mn-closet-chip');
    const drawer = $('#mn-closet-drawer');
    const close = $('#mn-closet-drawer-close');
    const snapBtn = $('#mn-snap-pic');
    const ghostBtn = $('#mn-ghost-mode');
    if (!chip) return;

    chip.addEventListener('click', () => {
      drawer.style.display = 'flex';
      renderClosetGrid();
    });
    close.addEventListener('click', () => { drawer.style.display = 'none'; });
    drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.style.display = 'none'; });

    if (snapBtn) {
      snapBtn.addEventListener('click', () => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*'; inp.capture = 'environment';
        inp.onchange = () => { if (inp.files[0]) addToCloset(inp.files[0]); };
        inp.click();
      });
    }
    if (ghostBtn) {
      ghostBtn.addEventListener('click', () => {
        drawer.style.display = 'none';
        alert('Ghost Mode: Browse styles anonymously without saving to your profile. Coming soon!');
      });
    }
  };

  const addToCloset = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      MNOnboarding.state.closetItems.push({ img: e.target.result, label: 'New Item' });
      updateClosetCount();
      renderClosetGrid();
    };
    reader.readAsDataURL(file);
  };

  const updateClosetCount = () => {
    const countEl = $('#mn-closet-count');
    if (countEl) countEl.textContent = MNOnboarding.state.closetItems.length;
    const subEl = $('#mn-closet-items-count');
    if (subEl) subEl.textContent = MNOnboarding.state.closetItems.length + ' items digitized';
  };

  const renderClosetGrid = () => {
    const grid = $('#mn-closet-grid');
    if (!grid) return;
    grid.innerHTML = MNOnboarding.state.closetItems.length === 0
      ? '<p style="font-size:12px;color:rgba(244,244,244,0.3);grid-column:1/-1;text-align:center;padding:20px 0">No items yet. Snap a pic to start!</p>'
      : MNOnboarding.state.closetItems.map(item => `
          <div class="mn-drawer-item">
            <img src="${item.img}" alt="${item.label}" loading="lazy" />
          </div>
        `).join('');
  };

  const initGiftFAB = () => {
    const fab = $('#mn-gift-fab');
    if (!fab) return;
    fab.addEventListener('click', () => {
      alert('Gift Mode activated! You can now style a look for someone else. Their measurements and preferences will be used.');
    });
  };

  const init = () => {
    initProfileRing();
    initClosetChip();
    initGiftFAB();
  };

  return { init, updateClosetCount };
})();

// ═══════════════════════════════════════════════════════════
// STEP 1: THE HOOK
// ═══════════════════════════════════════════════════════════
const MNStep1 = (() => {
  const init = () => {
    const cta = document.getElementById('mn-step1-cta');
    if (!cta) return;
    cta.addEventListener('click', () => {
      MNOnboarding.showStep(2);
      MNStep2.init();
    });
  };
  return { init };
})();

// ═══════════════════════════════════════════════════════════
// STEP 2: AESTHETIC SELECTION (50/50 Men / Women)
// ═══════════════════════════════════════════════════════════
const MNStep2 = (() => {
  const { AESTHETICS, state, $ } = MNOnboarding;

  const renderGrid = () => {
    const grid = $('#mn-aesthetic-grid');
    if (!grid) return;
    grid.innerHTML = AESTHETICS.map(a => `
      <div class="mn-aesthetic-card" data-id="${a.id}" role="button" tabindex="0"
           aria-label="${a.style} — ${a.name}">
        <img class="mn-aesthetic-img" src="${a.img}" alt="${a.name}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=533&fit=crop'" />
        <div class="mn-aesthetic-overlay">
          <p class="mn-aesthetic-style">${a.style}</p>
          <p class="mn-aesthetic-name">${a.name}</p>
        </div>
        <span class="mn-aesthetic-gender ${a.gender === 'M' ? 'mn-gender-m' : 'mn-gender-f'}">
          ${a.gender === 'M' ? '♂ Men' : '♀ Women'}
        </span>
      </div>
    `).join('');

    // Attach click listeners
    document.querySelectorAll('.mn-aesthetic-card').forEach(card => {
      const toggle = () => {
        const id = card.dataset.id;
        if (state.selectedAesthetics.includes(id)) {
          state.selectedAesthetics = state.selectedAesthetics.filter(x => x !== id);
          card.classList.remove('mn-selected');
        } else {
          state.selectedAesthetics.push(id);
          card.classList.add('mn-selected');
        }
        updateCount();
      };
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') toggle(); });
    });
  };

  const updateCount = () => {
    const countEl = $('#mn-aesthetic-count');
    const cta = $('#mn-step2-cta');
    const n = MNOnboarding.state.selectedAesthetics.length;
    if (countEl) countEl.textContent = n === 0 ? '0 selected' : `${n} selected`;
    if (cta) cta.disabled = n === 0;
  };

  const init = () => {
    renderGrid();
    updateCount();
    const cta = $('#mn-step2-cta');
    if (cta) cta.addEventListener('click', () => {
      MNOnboarding.showStep(3);
      MNStep3.init();
    });
  };

  return { init };
})();

// ═══════════════════════════════════════════════════════════
// STEP 3: OCCASION PROTOCOL
// ═══════════════════════════════════════════════════════════
const MNStep3 = (() => {
  const { OCCASIONS, state, $ } = MNOnboarding;

  const renderChips = () => {
    const container = $('#mn-occasion-chips');
    if (!container) return;
    container.innerHTML = OCCASIONS.map(o => `
      <button class="mn-occasion-chip" data-id="${o.id}">
        <span>${o.emoji}</span>
        <span>${o.label}</span>
      </button>
    `).join('');

    container.querySelectorAll('.mn-occasion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.id;
        if (state.selectedOccasions.includes(id)) {
          state.selectedOccasions = state.selectedOccasions.filter(x => x !== id);
          chip.classList.remove('mn-occ-selected');
        } else {
          state.selectedOccasions.push(id);
          chip.classList.add('mn-occ-selected');
        }
        const cta = $('#mn-step3-cta');
        if (cta) cta.disabled = state.selectedOccasions.length === 0;
      });
    });
  };

  const init = () => {
    renderChips();
    const cta = $('#mn-step3-cta');
    const back = $('#mn-step3-back');
    if (cta) cta.addEventListener('click', () => { MNOnboarding.showStep(4); MNStep4.init(); });
    if (back) back.addEventListener('click', () => { MNOnboarding.showStep(2); });
  };

  return { init };
})();

// ═══════════════════════════════════════════════════════════
// STEP 4: THE CANVAS UPLOAD
// ═══════════════════════════════════════════════════════════
const MNStep4 = (() => {
  const { state, $ } = MNOnboarding;

  const init = () => {
    const zone = $('#mn-canvas-upload');
    const fileInput = $('#mn-selfie-input');
    const preview = $('#mn-canvas-preview');
    const previewImg = $('#mn-canvas-img');
    const redoBtn = $('#mn-redo-selfie');
    const cta = $('#mn-step4-cta');
    const back = $('#mn-step4-back');
    if (!zone) return;

    const handleFile = (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        state.selfieBase64 = e.target.result;
        previewImg.src = e.target.result;
        zone.style.display = 'none';
        preview.style.display = 'block';
        if (cta) cta.disabled = false;
      };
      reader.readAsDataURL(file);
    };

    zone.addEventListener('click', () => fileInput.click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('mn-dragging'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('mn-dragging'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.classList.remove('mn-dragging');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

    if (redoBtn) redoBtn.addEventListener('click', () => {
      state.selfieBase64 = null;
      zone.style.display = 'flex';
      preview.style.display = 'none';
      if (cta) cta.disabled = true;
    });

    if (cta) cta.addEventListener('click', () => { MNOnboarding.showStep(5); MNStep5.init(); });
    if (back) back.addEventListener('click', () => { MNOnboarding.showStep(3); });
  };

  return { init };
})();

// ═══════════════════════════════════════════════════════════
// STEP 5: THE MAGIC CLOSET & AGGREGATOR
// States: A=Initial | B=Scanning | C=Dopamine | D=Red Gap+Upsell
// ═══════════════════════════════════════════════════════════
const MNStep5 = (() => {
  const { state, $, MOCK_WARDROBE_ITEMS, AFFILIATE_RECS, formatINR } = MNOnboarding;

  const getGeneratedImage = () => {
    const hasMale = state.selectedAesthetics.some(id => id.endsWith('_m'));
    const hasFemale = state.selectedAesthetics.some(id => id.endsWith('_f'));
    if (hasMale && !hasFemale) return 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=480&h=640&fit=crop&crop=top';
    if (hasFemale && !hasMale) return 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=480&h=640&fit=crop&crop=top';
    return 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=480&h=640&fit=crop&crop=top';
  };

  // ── STATE A: INITIAL GENERATION ─────────────────────────
  const renderStateA = () => {
    state.step5State = 'A';
    const titleEl = $('#mn-step5-title');
    if (titleEl) titleEl.textContent = 'Your main character look, generated. ✦';
    const content = $('#mn-step5-content');
    if (!content) return;
    const selectedLabels = state.selectedAesthetics.map(id => MNOnboarding.AESTHETICS.find(a => a.id === id)?.style || id).join(' · ');
    content.innerHTML = `
      <div class="mn-result-img-wrap">
        <img class="mn-result-img" src="${getGeneratedImage()}" alt="FLUX-generated look"
             onerror="this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=480&h=640&fit=crop'" />
        <span class="mn-result-badge">✦ AI Generated</span>
      </div>
      <div class="mn-dopamine-box" style="text-align:center">
        <p style="font-size:11px;font-weight:700;color:var(--mn-teal);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px">Based on: ${selectedLabels || 'Your Aesthetic'}</p>
        <p class="mn-dopamine-text">Want to style this with clothes you already own?</p>
        <p class="mn-dopamine-sub">Upload a wardrobe pic and we'll extract your existing items and remix them into the look.</p>
      </div>
      <button class="mn-upload-wardrobe-btn" id="mn-upload-wardrobe-btn">📸 Upload Wardrobe Pic</button>
      <input type="file" id="mn-wardrobe-input" accept="image/*" style="display:none" />
    `;
    $('#mn-upload-wardrobe-btn').addEventListener('click', () => $('#mn-wardrobe-input').click());
    $('#mn-wardrobe-input').addEventListener('change', function() {
      if (this.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { state.wardrobeBase64 = e.target.result; renderStateB(); };
        reader.readAsDataURL(this.files[0]);
      }
    });
  };

  // ── STATE B: SCANNING ANIMATION ─────────────────────────
  const renderStateB = () => {
    state.step5State = 'B';
    $('#mn-step5-title').textContent = 'Scanning your wardrobe…';
    const content = $('#mn-step5-content');
    content.innerHTML = `
      <div class="mn-result-img-wrap">
        <img class="mn-result-img" src="${state.wardrobeBase64}" alt="Your wardrobe" />
        <div class="mn-scan-overlay">
          <div class="mn-scan-line"></div>
          <div class="mn-scan-corner mn-scan-corner-tl"></div>
          <div class="mn-scan-corner mn-scan-corner-tr"></div>
          <div class="mn-scan-corner mn-scan-corner-bl"></div>
          <div class="mn-scan-corner mn-scan-corner-br"></div>
        </div>
        <span class="mn-result-badge">🔍 Extracting Items…</span>
      </div>
      <p style="font-size:13px;font-weight:700;color:var(--mn-teal);margin-bottom:12px">Digitizing into your closet…</p>
      <div class="mn-mini-closet" id="mn-mini-closet-row"></div>
    `;
    const row = $('#mn-mini-closet-row');
    MOCK_WARDROBE_ITEMS.forEach((item, i) => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'mn-closet-item mn-closet-item-entering';
        div.innerHTML = `<img class="mn-closet-item-img" src="${item.img}" alt="${item.label}" /><p class="mn-closet-item-label">${item.label}</p>`;
        if (row) row.appendChild(div);
        state.closetItems.push(item);
        MNPersistent.updateClosetCount();
      }, (i + 1) * 900);
    });
    setTimeout(() => renderStateC(), MOCK_WARDROBE_ITEMS.length * 900 + 1200);
  };

  // ── STATE C: DOPAMINE HOOK ───────────────────────────────
  const renderStateC = () => {
    state.step5State = 'C';
    $('#mn-step5-title').textContent = 'Your closet is alive. 🔥';
    const content = $('#mn-step5-content');
    content.innerHTML = `
      <div class="mn-mini-closet" style="margin-bottom:20px">
        ${MOCK_WARDROBE_ITEMS.map(i => `<div class="mn-closet-item"><img class="mn-closet-item-img" src="${i.img}" alt="${i.label}" /><p class="mn-closet-item-label">${i.label}</p></div>`).join('')}
      </div>
      <div class="mn-dopamine-box">
        <p class="mn-dopamine-emoji">😍</p>
        <p class="mn-dopamine-text">Damn, those jeans are a vibe.</p>
        <p class="mn-dopamine-sub">Our AI just unlocked <strong style="color:var(--mn-teal)">4 new ways</strong> to style them.</p>
        <p class="mn-dopamine-sub" style="margin-top:8px">Upload 3 more items to unlock your <strong style="color:#fff">'Deep Style Archetype'</strong> &amp; <strong style="color:var(--mn-gold)">5% Store Credit</strong>.</p>
      </div>
      <button class="mn-upload-wardrobe-btn" id="mn-upload-more-btn">📸 Upload More Items</button>
      <input type="file" id="mn-more-wardrobe-input" accept="image/*" style="display:none" />
      <button class="mn-cta-primary" id="mn-see-the-look" style="width:100%;justify-content:center;margin-top:8px">See My Complete Look →</button>
    `;
    $('#mn-upload-more-btn').addEventListener('click', () => $('#mn-more-wardrobe-input').click());
    $('#mn-see-the-look').addEventListener('click', () => renderStateD());
  };

  // ── STATE D: RED GAP + UPSELL ────────────────────────────
  const renderStateD = () => {
    state.step5State = 'D';
    $('#mn-step5-title').textContent = 'Almost perfect. One gap to fill. 👟';
    const content = $('#mn-step5-content');
    content.innerHTML = `
      <div class="mn-look-assembled">
        <img class="mn-look-assembled-img" src="${state.wardrobeBase64 || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=480&h=640&fit=crop'}" alt="Assembled look" />
        <div class="mn-red-gap-hotspot" style="bottom:8%;left:15%;right:15%;height:14%">
          <span class="mn-red-gap-label" style="top:-22px;left:50%;transform:translateX(-50%)">⚠ Missing: Shoes</span>
        </div>
        <span class="mn-result-badge">My Narrative Anchor Top ✦</span>
      </div>
      <div class="mn-upsell-fields">
        <div>
          <label class="mn-field-label">Any specific brands you love?</label>
          <input class="mn-field-input" id="mn-brands-input" type="text" placeholder="e.g. Nike, Zara, H&amp;M…" />
        </div>
        <div>
          <label class="mn-field-label">Current passions?</label>
          <select class="mn-field-select" id="mn-passion-select">
            <option value="">— Pick your vibe —</option>
            <option value="gym">🏋️ Gym &amp; Fitness</option>
            <option value="caffeine">☕ Caffeine &amp; Cafes</option>
            <option value="cars">🚗 Cars &amp; Motorsport</option>
            <option value="tech">💻 Tech &amp; Startups</option>
          </select>
        </div>
        <div>
          <label class="mn-field-label">Bank Cards you own? (for hidden discounts)</label>
          <select class="mn-field-select" id="mn-bank-select">
            <option value="">— Select your bank —</option>
            <option value="HDFC">🏦 HDFC Bank</option>
            <option value="SBI">🏦 SBI</option>
            <option value="ICICI">🏦 ICICI Bank</option>
          </select>
        </div>
      </div>
      <button class="mn-cta-primary" id="mn-show-final" style="width:100%;justify-content:center;margin-bottom:20px">Show Final Results 🎯</button>
      <div id="mn-affiliate-result" style="display:none"></div>
    `;

    $('#mn-show-final').addEventListener('click', () => {
      const bank = $('#mn-bank-select')?.value || 'default';
      state.brandInput = $('#mn-brands-input')?.value || '';
      state.passionInput = $('#mn-passion-select')?.value || '';
      renderAffiliateResult(bank || 'default');
      const btn = $('#mn-show-final');
      if (btn) { btn.disabled = true; btn.textContent = '✓ Results Locked In'; }
    });
  };

  // ── AFFILIATE RESULT ─────────────────────────────────────
  const renderAffiliateResult = (bank) => {
    const rec = AFFILIATE_RECS[bank] || AFFILIATE_RECS['default'];
    const el = $('#mn-affiliate-result');
    if (!el) return;
    el.style.display = 'block';
    el.innerHTML = `
      <div class="mn-affiliate-card">
        <div class="mn-affiliate-header"><span class="mn-gap-dot-red"></span> Gap Item Found — ${rec.platform} Pick</div>
        <div class="mn-affiliate-body">
          <img class="mn-affiliate-img" src="${rec.img}" alt="${rec.item}" onerror="this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop'" />
          <div class="mn-affiliate-info">
            <p class="mn-affiliate-brand">${rec.brand}</p>
            <p class="mn-affiliate-name">${rec.item}</p>
            <div class="mn-affiliate-prices">
              <span class="mn-price-now">${formatINR(rec.price)}</span>
              <span class="mn-price-was">${formatINR(rec.original_price)}</span>
              <span class="mn-price-off">${rec.discount_pct}% OFF</span>
            </div>
            <span class="mn-bank-offer-pill">${rec.bank_offer}</span>
          </div>
        </div>
        <a href="${rec.url}" target="_blank" rel="noopener noreferrer" class="mn-affiliate-cta">Shop on ${rec.platform} ↗</a>
      </div>
      <div class="mn-dopamine-box" style="margin-top:12px">
        <p class="mn-dopamine-emoji">🎉</p>
        <p class="mn-dopamine-text">Your Main Character Look is complete.</p>
        <p class="mn-dopamine-sub">Save this look to your Digital Closet and share it with the community.
          ${state.brandInput ? `<br>Brands noted: <strong style="color:var(--mn-teal)">${state.brandInput}</strong>` : ''}
        </p>
      </div>
      <button class="mn-cta-primary" onclick="window.location.href='/pages/ai-studio'" style="width:100%;justify-content:center;margin-top:4px">Save to My Narrative →</button>
    `;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const init = () => {
    const titleEl = $('#mn-step5-title');
    if (titleEl) titleEl.textContent = 'Generating your main character look…';
    setTimeout(() => renderStateA(), 2200);
  };

  return { init };
})();

// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════
const MNBoot = () => {
  MNPersistent.init();
  MNStep1.init();
  MNOnboarding.showStep(1);
  const step1 = document.getElementById('mn-step-1');
  if (step1) step1.style.display = 'flex';
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', MNBoot);
} else {
  MNBoot();
}
