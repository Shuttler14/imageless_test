/**
 * ═══════════════════════════════════════════════════════════
 * MY NARRATIVE - PERSISTENT AI STYLIST
 * ═══════════════════════════════════════════════════════════
 */

const MNAIStylist = (() => {

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════

  const CONFIG = window.MNConfig || {
    STORAGE: {
      CORE_IDENTITY: 'mn_core_identity',
      ACTIVE_CONTEXT: 'mn_active_design_prompt'
    },
    UI: {
      ANIMATION_DURATION: 400
    },
    API: {
      FASHION_CONSULTANT_API: window.MN_CONFIG?.apiUrl || 'https://mynarrative-ai.vercel.app/api/fashion_consultant'
    },
    NETWORK: {
      API_TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3
    }
  };

  const STORAGE_KEY = CONFIG.STORAGE?.CORE_IDENTITY || 'mn_core_identity';
  const CONTEXT_KEY = CONFIG.STORAGE?.ACTIVE_CONTEXT || 'mn_active_design_prompt';
  const API_URL = CONFIG.API?.FASHION_CONSULTANT_API || 'https://mynarrative-ai.vercel.app/api/fashion_consultant';

  // ═══════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  const state = {
    isExpanded: false,
    identity: null,
    tempCalibration: {},
    dataCollection: {},
    currentContext: null,
    selectedSlogan: null
  };

  // ═══════════════════════════════════════════════════════════
  // DATA: CALIBRATION QUESTIONS
  // ═══════════════════════════════════════════════════════════

  const CALIBRATION_FLOW = [
    {
      id: 'coreExpression',
      question: 'Your Core Expression',
      subtitle: 'How do you naturally show up?',
      label: 'Q1: Core Expression',
      options: [
        { value: 'Calm & Minimal', label: 'Calm & Minimal', description: 'Quiet confidence, no excess' },
        { value: 'Bold & Expressive', label: 'Bold & Expressive', description: 'Unapologetically visible' },
        { value: 'Deep & Symbolic', label: 'Deep & Symbolic', description: 'Every choice has meaning' },
        { value: 'Playful & Light', label: 'Playful & Light', description: 'Fashion is fun, not serious' },
        { value: 'Minimalist', label: 'Minimalist', description: 'Function over decoration' },
        { value: 'Traditional & Rooted', label: 'Traditional & Rooted', description: 'Connected to heritage' },
        { value: 'Experimental', label: 'Experimental', description: 'Breaking the mold' },
        { value: 'Elegant & Refined', label: 'Elegant & Refined', description: 'Timeless sophistication' },
        { value: 'Casual & Approachable', label: 'Casual & Approachable', description: 'Comfort meets style' },
        { value: 'Edgy & Alternative', label: 'Edgy & Alternative', description: 'Against the grain' }
      ]
    },
    {
      id: 'presence',
      question: 'Your Presence',
      subtitle: 'How do you want to be perceived?',
      label: 'Q2: Presence',
      options: [
        { value: 'Confident but Reserved', label: 'Confident but Reserved', description: 'Strong, not loud' },
        { value: 'Creative Risk-Taker', label: 'Creative Risk-Taker', description: 'Willing to stand out' },
        { value: 'Thoughtful Introvert', label: 'Thoughtful Introvert', description: 'Depth over flash' },
        { value: 'Life of the Party', label: 'Life of the Party', description: 'Energy and warmth' },
        { value: 'Low-Key', label: 'Low-Key', description: 'Prefer to blend in' },
        { value: 'Cultural Pride', label: 'Cultural Pride', description: 'Honor your roots' },
        { value: 'Boundary-Pusher', label: 'Boundary-Pusher', description: 'Challenge norms' },
        { value: 'Graceful Authority', label: 'Graceful Authority', description: 'Command respect naturally' },
        { value: 'Friendly & Warm', label: 'Friendly & Warm', description: 'Easy to approach' },
        { value: 'Mysterious & Intriguing', label: 'Mysterious & Intriguing', description: 'Leave them curious' }
      ]
    },
    {
      id: 'signal',
      question: 'Your Signal',
      subtitle: 'What message do your clothes send?',
      label: 'Q3: Signal',
      options: [
        { value: 'Quiet Rebellion', label: 'Quiet Rebellion', description: 'Subtle defiance' },
        { value: 'Main Character Energy', label: 'Main Character Energy', description: 'Own the room' },
        { value: 'Seeing Beyond the Mask', label: 'Seeing Beyond the Mask', description: 'Layers and meaning' },
        { value: 'Joy & Lightness', label: 'Joy & Lightness', description: 'Spread positive vibes' },
        { value: 'Understated Confidence', label: 'Understated Confidence', description: 'No need to prove' },
        { value: 'Timeless Elegance', label: 'Timeless Elegance', description: 'Classic never fades' },
        { value: 'Fashion Forward', label: 'Fashion Forward', description: 'Ahead of the curve' },
        { value: 'Refined Luxury', label: 'Refined Luxury', description: 'Quality speaks' },
        { value: 'Relatable Authenticity', label: 'Relatable Authenticity', description: 'Real and genuine' },
        { value: 'Dark Romance', label: 'Dark Romance', description: 'Beauty in darkness' }
      ]
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // ARCHETYPE MAP
  // ═══════════════════════════════════════════════════════════

  const ARCHETYPE_MAP = {
    'Calm & Minimal|Confident but Reserved|Quiet Rebellion': {
      name: 'The Quiet Rebel',
      tagline: "You don't dress loud. You dress precise.",
      icon: '🎯',
      palette: ['#1a1a1a', '#f5f0e8', '#8b7355']
    },
    'Bold & Expressive|Creative Risk-Taker|Main Character Energy': {
      name: 'The Visual Poet',
      tagline: "Every outfit is a verse. Every color is a word.",
      icon: '🎨',
      palette: ['#ff4444', '#222222', '#ffd700']
    },
    'Deep & Symbolic|Thoughtful Introvert|Seeing Beyond the Mask': {
      name: 'The Silent Philosopher',
      tagline: "Your clothes think before they speak.",
      icon: '📚',
      palette: ['#2c3e50', '#ecf0f1', '#8e44ad']
    },
    'Minimalist|Low-Key|Understated Confidence': {
      name: 'The Essential',
      tagline: "Less noise. More meaning.",
      icon: '⚡',
      palette: ['#000000', '#ffffff', '#666666']
    },
    'Traditional & Rooted|Cultural Pride|Timeless Elegance': {
      name: 'The Heritage Keeper',
      tagline: "Modern by choice. Rooted by nature.",
      icon: '🕉️',
      palette: ['#8B4513', '#FFD700', '#800020']
    },
    'Experimental|Boundary-Pusher|Fashion Forward': {
      name: 'The Avant-Garde',
      tagline: "Trends follow you, not the other way around.",
      icon: '🚀',
      palette: ['#FF00FF', '#00FFFF', '#000000']
    }
  };

  const deriveArchetype = (calibration) => {
    const key = `${calibration.coreExpression}|${calibration.presence}|${calibration.signal}`;
    if (ARCHETYPE_MAP[key]) return ARCHETYPE_MAP[key];
    const expr = calibration.coreExpression;
    for (const [mapKey, archetype] of Object.entries(ARCHETYPE_MAP)) {
      if (mapKey.startsWith(expr)) return archetype;
    }
    return {
      name: 'The Original',
      tagline: "Your style writes its own rules.",
      icon: '✨',
      palette: ['#1a1a1a', '#f5f0e8', '#4a90d9']
    };
  };

  // ═══════════════════════════════════════════════════════════
  // DATA: SILHOUETTE & LIFESTYLE
  // ═══════════════════════════════════════════════════════════

  const SILHOUETTE_OPTIONS = {
    heights: { min: 150, max: 195, unit: 'cm', default: 170 },
    builds: [
      { id: 'lean', label: 'Lean', icon: '│', description: 'Slim frame, narrow shoulders' },
      { id: 'athletic', label: 'Athletic', icon: '▽', description: 'Defined, proportional' },
      { id: 'broad', label: 'Broad', icon: '█', description: 'Wide shoulders, sturdy' },
      { id: 'slim', label: 'Slim', icon: '╎', description: 'Thin, elongated' },
      { id: 'regular', label: 'Regular', icon: '▌', description: 'Average, balanced' },
      { id: 'heavy', label: 'Heavy', icon: '▊', description: 'Full, solid build' }
    ]
  };

  const TONE_OPTIONS = {
    skinTones: [
      { id: 'fair', label: 'Fair', color: '#FDEBD3', textColor: '#333' },
      { id: 'wheatish', label: 'Wheatish', color: '#E8C99B', textColor: '#333' },
      { id: 'medium', label: 'Medium', color: '#C6956A', textColor: '#fff' },
      { id: 'dusky', label: 'Dusky', color: '#8D6346', textColor: '#fff' },
      { id: 'deep', label: 'Deep', color: '#5C3A21', textColor: '#fff' }
    ],
    undertones: [
      { id: 'warm', label: '🥇 Gold looks best', value: 'warm' },
      { id: 'cool', label: '🥈 Silver looks best', value: 'cool' },
      { id: 'neutral', label: '✨ Both work equally', value: 'neutral' }
    ]
  };

  const LIFESTYLE_OPTIONS = {
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
      state.identity.height &&
      state.identity.build &&
      state.identity.skinTone &&
      state.identity.undertone &&
      state.identity.region &&
      state.identity.climate &&
      state.identity.budget;
  };

  const CONTEXT_DATA = {
    selfContexts: [
      { value: 'First Day at Work', emoji: '💼', description: 'Make the right first impression' },
      { value: 'Date Night', emoji: '💕', description: 'Romance and confidence' },
      { value: 'Wedding Guest', emoji: '💍', description: 'Celebrate in style' },
      { value: 'Festival/Pooja', emoji: '🪔', description: 'Traditional elegance' },
      { value: 'College/Campus', emoji: '🎓', description: 'Casual yet sharp' },
      { value: 'House Party', emoji: '🎉', description: 'Fun and approachable' },
      { value: 'Formal Meeting', emoji: '🤝', description: 'Command respect' },
      { value: 'Weekend Brunch', emoji: '☕', description: 'Relaxed sophistication' },
      { value: 'Travel/Airport', emoji: '✈️', description: 'Comfortable style' },
      { value: 'Gym/Active', emoji: '💪', description: 'Functional fashion' }
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
    console.log('🎨 MY NARRATIVE AI Stylist Initialized');
  };

  const cacheDOM = () => {
    DOM.widget = document.getElementById('mn-ai-widget');
    DOM.minimized = document.getElementById('mn-widget-minimized');
    DOM.expanded = document.getElementById('mn-widget-expanded');
    DOM.minimizeBtn = document.getElementById('mn-minimize-btn');
    DOM.container = document.getElementById('mn-content-container');
    DOM.progressBar = document.getElementById('mn-progress-bar');
  };

  const bindEvents = () => {
    DOM.minimized.addEventListener('click', expandWidget);
    DOM.minimizeBtn.addEventListener('click', minimizeWidget);
    DOM.expanded.addEventListener('click', (e) => {
      if (e.target === DOM.expanded) minimizeWidget();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isExpanded) minimizeWidget();
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
    DOM.expanded.setAttribute('aria-hidden', 'false');
    setTimeout(() => { DOM.expanded.style.animation = 'fadeIn 0.4s ease-out'; }, 10);
    if (!state.identity) renderWelcomeScreen();
    else renderContextDashboard();
  };

  const minimizeWidget = () => {
    state.isExpanded = false;
    DOM.expanded.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      DOM.widget.classList.remove('is-expanded');
      DOM.expanded.setAttribute('aria-hidden', 'true');
      DOM.container.innerHTML = '';
      updateProgressBar(0);
      DOM.expanded.style.animation = '';
    }, 300);
  };

  // ═══════════════════════════════════════════════════════════
  // WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════

  const renderWelcomeScreen = () => {
    updateProgressBar(0);
    const html = `
      <div class="mn-welcome-screen mn-fade-in">
        <div class="mn-welcome-header">
          <h1 class="mn-welcome-title">Welcome to MY NARRATIVE</h1>
          <p class="mn-welcome-subtitle">Your AI Fashion Consultant that understands your unique style identity.<br>Let's discover who you are, so we can design what you wear.</p>
        </div>
        <div class="mn-welcome-content">
          <div class="mn-welcome-icon">✨</div>
          <p class="mn-welcome-description">This journey takes 3 minutes.<br>But what you discover will change how you dress forever.</p>
          <button id="btn-start-journey" class="mn-btn-primary">Begin Your Style Journey →</button>
        </div>
      </div>
    `;
    DOM.container.innerHTML = html;
    document.getElementById('btn-start-journey').addEventListener('click', () => renderCalibrationFlow(0));
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
      <div class="mn-dashboard mn-fade-in">
        <div class="mn-identity-bar">
          <div class="mn-identity-info">
            <span class="mn-identity-dot"></span>
            <span class="mn-identity-label">Identity Profile:</span>
            <span class="mn-identity-value">${state.identity.coreExpression}</span>
          </div>
          <button id="mn-recalibrate-btn" class="mn-text-link">🔄 Recalibrate</button>
        </div>
        <h2 class="mn-dashboard-title">Welcome back.</h2>
        <p class="mn-dashboard-subtitle">Who are you designing for today?</p>
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

    document.getElementById('btn-mode-self').addEventListener('click', renderSelfContext);
    document.getElementById('btn-mode-gift').addEventListener('click', renderGiftContext);
    document.getElementById('mn-recalibrate-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to recalibrate your identity? This will restart the calibration process.')) {
        clearIdentity();
        renderCalibrationFlow(0);
      }
    });
  };

  // ═══════════════════════════════════════════════════════════
  // SELF CONTEXT
  // ═══════════════════════════════════════════════════════════

  const renderSelfContext = () => {
    const html = `
      <div class="mn-context-flow mn-fade-in">
        <button class="mn-back-btn" id="btn-back">← Back</button>
        <div class="mn-step-header">
          <h3 class="mn-context-heading">What's the occasion?</h3>
          <p class="mn-context-subtitle">"Context shapes everything"</p>
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
             <input type="file" id="face-input" accept="image/*" style="display:none" />
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
        <div class="mn-height-selector">
          <label class="mn-input-label">How tall are you?</label>
          <div class="mn-height-visual">
            <div class="mn-silhouette-figure" id="silhouette-figure"></div>
            <input type="range" id="height-slider" min="150" max="195" value="170" class="mn-range-slider" />
            <div class="mn-height-display" id="height-display">170 cm / 5'7"</div>
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

    const slider = document.getElementById('height-slider');
    const display = document.getElementById('height-display');
    slider.addEventListener('input', () => {
      const cm = parseInt(slider.value);
      const feet = Math.floor(cm / 30.48);
      const inches = Math.round((cm / 2.54) % 12);
      display.textContent = `${cm} cm / ${feet}'${inches}"`;
      state.dataCollection.height = cm;
      const figure = document.getElementById('silhouette-figure');
      const scale = 0.7 + ((cm - 150) / 45) * 0.6;
      figure.style.transform = `scaleY(${scale})`;
    });

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
      state.dataCollection.height = state.dataCollection.height || 170;
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
        <div class="mn-lifestyle-section"><label class="mn-input-label">Your style roots?</label>
          <div class="mn-region-grid">${LIFESTYLE_OPTIONS.regions.map(r => `<button class="mn-region-chip" data-region="${r.id}" title="${r.context}">${r.emoji} ${r.label}</button>`).join('')}</div>
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

    setupSingleSelect('.mn-region-chip', 'region', 'region');
    setupSingleSelect('.mn-climate-chip', 'climate', 'climate');
    setupSingleSelect('.mn-budget-chip', 'budget', 'budget');

    document.getElementById('btn-back').addEventListener('click', renderToneStep);
    document.getElementById('btn-next-closet').addEventListener('click', () => {
      const { region, climate, budget } = state.dataCollection;
      if (!region || !climate || !budget) return alert('Please complete all three selections');
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
      owned: closetItems.some(owned => owned.toLowerCase().includes(item.type?.toLowerCase() || '') || item.name.toLowerCase().includes(owned.toLowerCase()))
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
              <div class="mn-item-status">${item.owned ? '✅ Owned' : '🔴 Shop'}</div>
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
                <div class="mn-shopping-item-info"><span class="mn-shopping-item-name">🔴 ${item.name}</span><span class="mn-shopping-item-reason">${item.why || 'Completes the look'}</span></div>
                <div class="mn-shopping-links">
                  ${(item.shop_links || []).map(link => `<a href="${link.url}" target="_blank" class="mn-shop-link">🛒 ${link.platform} ${link.price || ''}</a>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `<div class="mn-complete-badge">✅ You own everything needed for this look!</div>`}

        <div class="mn-action-bar mn-action-bar-grid">
          <button id="btn-regenerate" class="mn-btn-secondary">🔄 Different Look</button>
          <button id="btn-save-look" class="mn-btn-primary">💾 Save This Look</button>
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
        body: JSON.stringify({ identity: state.identity, currentContext: state.currentContext })
      });
      if (!response.ok) throw new Error("Consultant Service Unavailable");
      const recommendations = await response.json();
      if (recommendations.error) console.warn('⚠️ AI returned fallback:', recommendations.error);
      localStorage.setItem(CONTEXT_KEY, JSON.stringify({ direction: recommendations.direction, suggestions: recommendations.suggestions, context: state.currentContext, identity: state.identity, mode: state.currentContext.mode, timestamp: Date.now() }));
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
    const html = `<div class="mn-transition"><div class="mn-spinner"></div><p class="mn-transition-text">${message}</p></div>`;
    DOM.container.innerHTML = html;
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