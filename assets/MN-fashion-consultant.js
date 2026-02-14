(function () {
  // Global State Management
  const APP_STATE = {
    identity: null,
    dataCollection: {},
    currentContext: {},
    currentStep: 'welcome',
    closet: []
  };

  const STORAGE_KEY = 'myNarrative_userData';

  // Load saved data on start
  function loadUserData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        APP_STATE.identity = data;
        APP_STATE.closet = data.closet || [];
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    }
  }

  // Save user data
  function saveUserData(data) {
    const merged = { ...APP_STATE.identity, ...data, lastUpdated: Date.now() };
    APP_STATE.identity = merged;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  // DOM Helper
  function render(html) {
    const root = document.getElementById('app-root');
    if (root) root.innerHTML = html;
  }

  // ARCHETYPE MAPPING
  const ARCHETYPES = {
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

  const CALIBRATION_QUESTIONS = [
    {
      id: 'coreExpression',
      title: 'Your Core Expression',
      subtitle: 'How do you naturally show up?',
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
      title: 'Your Presence',
      subtitle: 'How do you want to be perceived?',
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
      title: 'Your Signal',
      subtitle: 'What message do your clothes send?',
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

  // WELCOME SCREEN
  window.renderWelcome = function () {
    const html = `
      <div class="fade-in">
        <div class="glass-card">
          <div class="step-header">
            <h1 class="section-title">Welcome to MY NARRATIVE</h1>
            <p class="section-subtitle">
              Your AI Fashion Consultant that understands your unique style identity.
              <br>Let's discover who you are, so we can design what you wear.
            </p>
          </div>
          
          <div style="text-align: center; margin: 60px 0;">
            <div style="font-size: 80px; margin-bottom: 30px; animation: mnFloat 3s ease-in-out infinite;">✨</div>
            <p style="font-size: 18px; color: var(--text-muted); margin-bottom: 40px;">
              This journey takes 3 minutes.<br>
              But what you discover will change how you dress forever.
            </p>
            <button class="btn-primary" onclick="startCalibration()">
              Begin Your Style Journey →
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);
  }

  // START CALIBRATION
  let currentQuestionIndex = 0;
  const calibrationAnswers = {};

  window.startCalibration = function () {
    currentQuestionIndex = 0;
    renderCalibrationQuestion();
  }

  function renderCalibrationQuestion() {
    const question = CALIBRATION_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / CALIBRATION_QUESTIONS.length) * 100;

    const html = `
      <div class="fade-in">
        <div class="glass-card">
          ${currentQuestionIndex > 0 ? '<button class="back-btn" onclick="previousQuestion()">← Back</button>' : ''}
          
          <div style="height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 40px;">
            <div style="height: 100%; width: ${progress}%; background: var(--brand-teal); border-radius: 2px; transition: width 0.3s ease;"></div>
          </div>
          
          <div class="step-header">
            <h2 class="context-heading">${question.title}</h2>
            <p class="context-subtitle">"${question.subtitle}"</p>
          </div>
          
          <div class="chip-grid">
            ${question.options.map(option => `
              <button class="chip ${calibrationAnswers[question.id] === option.value ? 'active' : ''}" 
                      onclick="selectCalibrationAnswer('${question.id}', '${option.value.replace(/'/g, "\\'")}')">
                <span class="chip-label">${option.label}</span>
                <span class="chip-description">${option.description}</span>
              </button>
            `).join('')}
          </div>
          
          <div class="action-bar">
            <button class="btn-primary" 
                    ${calibrationAnswers[question.id] ? '' : 'disabled'}
                    onclick="nextQuestion()">
              ${currentQuestionIndex === CALIBRATION_QUESTIONS.length - 1 ? 'Reveal My Archetype ✨' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);
  }

  window.selectCalibrationAnswer = function (questionId, value) {
    calibrationAnswers[questionId] = value;
    renderCalibrationQuestion();
  }

  window.previousQuestion = function () {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderCalibrationQuestion();
    }
  }

  window.nextQuestion = function () {
    const question = CALIBRATION_QUESTIONS[currentQuestionIndex];
    if (!calibrationAnswers[question.id]) return;

    if (currentQuestionIndex < CALIBRATION_QUESTIONS.length - 1) {
      currentQuestionIndex++;
      renderCalibrationQuestion();
    } else {
      showArchetypeCard();
    }
  }

  function showArchetypeCard() {
    const combo = `${calibrationAnswers.coreExpression}|${calibrationAnswers.presence}|${calibrationAnswers.signal}`;

    // Find matching archetype or use a default
    let archetype = ARCHETYPES[combo];
    if (!archetype) {
      // Find closest match based on first answer
      const firstAnswer = calibrationAnswers.coreExpression;
      archetype = Object.values(ARCHETYPES).find(a =>
        Object.keys(ARCHETYPES).find(k => k.startsWith(firstAnswer) || k.includes(firstAnswer))
      ) || ARCHETYPES[Object.keys(ARCHETYPES)[0]];
    }

    const html = `
      <div class="fade-in">
        <div class="glass-card">
          <div class="step-header">
            <h2 class="context-heading">Your Style Archetype</h2>
          </div>
          
          <div class="archetype-card scale-in">
            <div class="archetype-icon">${archetype.icon}</div>
            <h3 class="archetype-name">${archetype.name}</h3>
            
            <div class="archetype-combo">
              ${calibrationAnswers.coreExpression} ×<br>
              ${calibrationAnswers.presence} ×<br>
              ${calibrationAnswers.signal}
            </div>
            
            <div class="archetype-tagline">
              "${archetype.tagline}"
            </div>
            
            <div class="archetype-palette">
              ${archetype.palette.map(color =>
      `<div class="palette-swatch" style="background-color: ${color};"></div>`
    ).join('')}
            </div>
          </div>
          
          <div class="action-bar">
            <button class="btn-primary" onclick="lockIdentity()">
              🔒 Lock This Identity
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);
  }

  window.lockIdentity = function () {
    // Save identity to state and storage
    const identityData = {
      ...calibrationAnswers,
      timestamp: Date.now()
    };
    saveUserData(identityData);

    // Show transition
    const html = `
      <div class="fade-in">
        <div class="glass-card" style="text-align: center; padding: 100px 40px;">
          <div style="font-size: 80px; margin-bottom: 30px; animation: mnScaleIn 0.5s ease-out;">✨</div>
          <h2 class="section-title" style="margin-bottom: 20px;">Identity Locked</h2>
          <p class="section-subtitle">Now let's design something amazing...</p>
        </div>
      </div>
    `;
    render(html);

    setTimeout(() => {
      renderDashboard();
    }, 2000);
  }

  // DASHBOARD
  window.renderDashboard = function () {
    const html = `
      <div class="fade-in">
        <div class="glass-card">
          <div class="step-header">
            <h1 class="section-title">What would you like to do?</h1>
            <p class="section-subtitle">Choose your path</p>
          </div>
          
          <div class="chip-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            <button class="chip" onclick="startDesignForMyself()" style="padding: 40px;">
              <span class="chip-label" style="font-size: 20px; margin-bottom: 10px;">👤 Designing for Myself</span>
              <span class="chip-description">Get AI recommendations for your personal style</span>
            </button>
            
            <button class="chip" onclick="startGiftMode()" style="padding: 40px;">
              <span class="chip-label" style="font-size: 20px; margin-bottom: 10px;">🎁 Gift for Someone</span>
              <span class="chip-description">Design the perfect gift with meaning</span>
            </button>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <button class="btn-secondary" onclick="resetIdentity()">
              Reset My Identity
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);
  }

  window.resetIdentity = function () {
    if (confirm('Are you sure you want to reset your style identity? This will erase all your data.')) {
      localStorage.removeItem(STORAGE_KEY);
      APP_STATE.identity = null;
      APP_STATE.dataCollection = {};
      APP_STATE.closet = [];
      renderWelcome();
    }
  }

  window.startGiftMode = function () {
    alert('🎁 Gift mode coming soon! This will help you design meaningful gifts for loved ones.');
  }

  // PHASE 1: CONTEXT SELECTION & LOUDNESS
  const CONTEXT_OPTIONS = [
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
  ];

  const LOUDNESS_OPTIONS = [
    { value: 'Subtle', label: 'Subtle', description: 'Whisper, don\'t shout' },
    { value: 'Balanced', label: 'Balanced', description: 'Present but not loud' },
    { value: 'Statement', label: 'Statement', description: 'Bold and memorable' }
  ];

  window.startDesignForMyself = function () {
    APP_STATE.dataCollection = {}; // Reset data collection
    renderContextSelection();
  }

  window.renderContextSelection = function () {
    const html = `
      <div class="fade-in">
        <div class="glass-card">
          <button class="back-btn" onclick="renderDashboard()">← Back</button>
          
          <div class="step-header">
            <h2 class="context-heading">What's the occasion?</h2>
            <p class="context-subtitle">"Context shapes everything"</p>
          </div>
          
          <div class="chip-grid">
            ${CONTEXT_OPTIONS.map(ctx => `
              <button class="chip ${APP_STATE.dataCollection.context === ctx.value ? 'active' : ''}" 
                      onclick="selectContext('${ctx.value.replace(/'/g, "\\'")}')">
                <span class="chip-label">${ctx.emoji} ${ctx.value}</span>
                <span class="chip-description">${ctx.description}</span>
              </button>
            `).join('')}
          </div>
          
          ${APP_STATE.dataCollection.context ? `
            <div class="fade-in" style="margin-top: 40px;">
              <div class="step-header">
                <h3 class="context-heading" style="font-size: 24px;">How loud do you want to be?</h3>
              </div>
              
              <div class="chip-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
                ${LOUDNESS_OPTIONS.map(loud => `
                  <button class="chip ${APP_STATE.dataCollection.loudness === loud.value ? 'active' : ''}" 
                          onclick="selectLoudness('${loud.value}')">
                    <span class="chip-label">${loud.label}</span>
                    <span class="chip-description">${loud.description}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="action-bar">
            <button class="btn-primary" 
                    ${APP_STATE.dataCollection.context && APP_STATE.dataCollection.loudness ? '' : 'disabled'}
                    onclick="proceedToBodyData()">
              Continue to Your Details →
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);
  }

  window.selectContext = function (value) {
    APP_STATE.dataCollection.context = value;
    renderContextSelection();
  }

  window.selectLoudness = function (value) {
    APP_STATE.dataCollection.loudness = value;
    renderContextSelection();
  }

  window.proceedToBodyData = function () {
    if (!APP_STATE.dataCollection.context || !APP_STATE.dataCollection.loudness) return;
    renderSilhouetteStep();
  }

  // PHASE 2A: SILHOUETTE STEP (Height + Build)
  const BUILD_OPTIONS = [
    { id: 'lean', label: 'Lean', icon: '│', description: 'Slim frame, narrow shoulders' },
    { id: 'athletic', label: 'Athletic', icon: '▽', description: 'Defined, proportional' },
    { id: 'broad', label: 'Broad', icon: '█', description: 'Wide shoulders, sturdy' },
    { id: 'slim', label: 'Slim', icon: '╎', description: 'Thin, elongated' },
    { id: 'regular', label: 'Regular', icon: '▌', description: 'Average, balanced' },
    { id: 'heavy', label: 'Heavy', icon: '▓', description: 'Full, solid build' }
  ];

  function renderSilhouetteStep() {
    const currentHeight = APP_STATE.dataCollection.height || 170;
    const currentBuild = APP_STATE.dataCollection.build || '';

    const html = `
      <div class="fade-in">
        <div class="glass-card">
          <button class="back-btn" onclick="renderContextSelection()">← Back</button>
          
          <div class="step-header">
            <h2 class="context-heading">Your Silhouette</h2>
            <p class="context-subtitle">"Clothes are architecture. Let's get your blueprint right."</p>
          </div>
          
          <div class="height-selector">
            <label class="input-label">How tall are you?</label>
            <div class="height-visual">
              <div class="silhouette-figure" id="silhouette-figure"></div>
              <input type="range" 
                     id="height-slider" 
                     min="150" 
                     max="195" 
                     value="${currentHeight}" 
                     class="range-slider" />
              <div class="height-display" id="height-display">${currentHeight} cm / ${cmToFeet(currentHeight)}</div>
            </div>
          </div>
          
          <div class="build-selector">
            <label class="input-label">What's your build?</label>
            <div class="build-grid">
              ${BUILD_OPTIONS.map(build => `
                <button class="build-card ${currentBuild === build.id ? 'active' : ''}" 
                        onclick="selectBuild('${build.id}')">
                  <div class="build-icon">${build.icon}</div>
                  <div class="build-label">${build.label}</div>
                  <div class="build-description">${build.description}</div>
                </button>
              `).join('')}
            </div>
          </div>
          
          <p class="trust-note">
            🔒 This helps us recommend cuts and proportions. Never shared.
          </p>
          
          <div class="action-bar">
            <button class="btn-primary" 
                    ${currentBuild ? '' : 'disabled'}
                    onclick="proceedToToneStep()">
              Continue →
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);

    // Setup height slider after render
    setupHeightSlider();
  }

  function setupHeightSlider() {
    const slider = document.getElementById('height-slider');
    const display = document.getElementById('height-display');
    const figure = document.getElementById('silhouette-figure');

    if (!slider) return;

    slider.addEventListener('input', () => {
      const cm = parseInt(slider.value);
      display.textContent = `${cm} cm / ${cmToFeet(cm)}`;
      APP_STATE.dataCollection.height = cm;

      // Animate silhouette figure height
      const scale = 0.7 + ((cm - 150) / 45) * 0.6;
      figure.style.transform = `scaleY(${scale})`;
    });

    // Set initial scale
    const cm = parseInt(slider.value);
    const scale = 0.7 + ((cm - 150) / 45) * 0.6;
    figure.style.transform = `scaleY(${scale})`;
  }

  function cmToFeet(cm) {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }

  window.selectBuild = function (buildId) {
    APP_STATE.dataCollection.build = buildId;
    renderSilhouetteStep();
  }

  window.proceedToToneStep = function () {
    if (!APP_STATE.dataCollection.build) {
      alert('Please select your build type');
      return;
    }
    APP_STATE.dataCollection.height = APP_STATE.dataCollection.height || 170;
    renderToneStep();
  }

  // PHASE 2B: TONE STEP
  const TONE_OPTIONS = [
    { id: 'fair', label: 'Fair', color: '#FDEBD3' },
    { id: 'wheatish', label: 'Wheatish', color: '#E8C99B' },
    { id: 'medium', label: 'Medium', color: '#C6956A' },
    { id: 'dusky', label: 'Dusky', color: '#8D6346' },
    { id: 'deep', label: 'Deep', color: '#5C3A21' }
  ];

  const UNDERTONE_OPTIONS = [
    { id: 'warm', label: '🥇 Gold looks best', description: 'Warm undertone' },
    { id: 'cool', label: '🥈 Silver looks best', description: 'Cool undertone' },
    { id: 'neutral', label: '✨ Both work equally', description: 'Neutral undertone' }
  ];

  function renderToneStep() {
    const currentTone = APP_STATE.dataCollection.skinTone || '';
    const currentUndertone = APP_STATE.dataCollection.undertone || '';

    const html = `
      <div class="fade-in">
        <div class="glass-card">
          <button class="back-btn" onclick="renderSilhouetteStep()">← Back</button>
          
          <div class="step-header">
            <h2 class="context-heading">Your Palette</h2>
            <p class="context-subtitle">"Every skin tells a story. Let's find the colors made for yours."</p>
          </div>
          
          <div class="tone-section">
            <label class="input-label">Which feels closest to you?</label>
            <div class="tone-swatches">
              ${TONE_OPTIONS.map(tone => `
                <button class="tone-swatch ${currentTone === tone.id ? 'active' : ''}" 
                        data-tone="${tone.id}"
                        onclick="selectTone('${tone.id}')">
                  <span class="tone-label">${tone.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="undertone-section">
            <label class="input-label">Quick test — what jewelry makes you glow?</label>
            <div class="undertone-options">
              ${UNDERTONE_OPTIONS.map(ut => `
                <button class="undertone-btn ${currentUndertone === ut.id ? 'active' : ''}" 
                        onclick="selectUndertone('${ut.id}')">
                  ${ut.label}
                </button>
              `).join('')}
            </div>
          </div>
          
          <p class="trust-note">
            🎨 This determines which color palettes will complement you naturally
          </p>
          
          <div class="action-bar">
            <button class="btn-primary" 
                    ${currentTone && currentUndertone ? '' : 'disabled'}
                    onclick="proceedToLifestyleStep()">
              Continue →
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);
  }

  window.selectTone = function (toneId) {
    APP_STATE.dataCollection.skinTone = toneId;
    renderToneStep();
  }

  window.selectUndertone = function (undertoneId) {
    APP_STATE.dataCollection.undertone = undertoneId;
    renderToneStep();
  }

  window.proceedToLifestyleStep = function () {
    if (!APP_STATE.dataCollection.skinTone || !APP_STATE.dataCollection.undertone) {
      alert('Please complete both selections');
      return;
    }
    renderLifestyleStep();
  }

  // PHASE 2C: LIFESTYLE STEP
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

  function renderLifestyleStep() {
    const currentRegion = APP_STATE.dataCollection.region || '';
    const currentClimate = APP_STATE.dataCollection.climate || '';
    const currentBudget = APP_STATE.dataCollection.budget || '';

    const html = `
      <div class="fade-in">
        <div class="glass-card">
          <button class="back-btn" onclick="renderToneStep()">← Back</button>
          
          <div class="step-header">
            <h2 class="context-heading">Your World</h2>
            <p class="context-subtitle">"Fashion lives in context. Let's understand yours."</p>
          </div>
          
          <div class="tone-section">
            <label class="input-label">Your style roots?</label>
            <div class="chip-grid">
              ${LIFESTYLE_OPTIONS.regions.map(r => `
                <button class="chip ${currentRegion === r.id ? 'active' : ''}" 
                        onclick="selectRegion('${r.id}')"
                        title="${r.context}">
                  <span class="chip-label">${r.emoji} ${r.label}</span>
                  <span class="chip-description">${r.context}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="tone-section">
            <label class="input-label">Your weather most days?</label>
            <div class="chip-grid">
              ${LIFESTYLE_OPTIONS.climates.map(c => `
                <button class="chip ${currentClimate === c.id ? 'active' : ''}" 
                        onclick="selectClimate('${c.id}')">
                  <span class="chip-label">${c.label}</span>
                  <span class="chip-description">${c.fabrics}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="tone-section">
            <label class="input-label">Your comfort range for a single statement piece?</label>
            <div class="chip-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
              ${LIFESTYLE_OPTIONS.budgets.map(b => `
                <button class="chip ${currentBudget === b.id ? 'active' : ''}" 
                        onclick="selectBudget('${b.id}')">
                  <span class="chip-label">${b.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="action-bar">
            <button class="btn-primary" 
                    ${currentRegion && currentClimate && currentBudget ? '' : 'disabled'}
                    onclick="proceedToClosetStep()">
              Almost there... →
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);
  }

  window.selectRegion = function (regionId) {
    APP_STATE.dataCollection.region = regionId;
    renderLifestyleStep();
  }

  window.selectClimate = function (climateId) {
    APP_STATE.dataCollection.climate = climateId;
    renderLifestyleStep();
  }

  window.selectBudget = function (budgetId) {
    APP_STATE.dataCollection.budget = budgetId;
    renderLifestyleStep();
  }

  window.proceedToClosetStep = function () {
    const { region, climate, budget } = APP_STATE.dataCollection;
    if (!region || !climate || !budget) {
      alert('Please complete all three selections');
      return;
    }
    renderClosetStep();
  }

  // PHASE 3: DIGITAL CLOSET (Ghost Mode)
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

  function renderClosetStep() {
    APP_STATE.closet = APP_STATE.closet || [];

    const html = `
      <div class="fade-in">
        <div class="glass-card">
          <button class="back-btn" onclick="renderLifestyleStep()">← Back</button>
          
          <div class="step-header">
            <h2 class="context-heading">Your Closet</h2>
            <p class="context-subtitle">"Show us what you already own. We'll build from there."</p>
          </div>
          
          <div class="closet-upload" onclick="document.getElementById('closet-photos').click()">
            <div class="upload-icon">📸</div>
            <div class="upload-title">Snap Your Wardrobe</div>
            <div class="upload-subtitle">Take photos — we auto-detect items</div>
            <input type="file" id="closet-photos" multiple accept="image/*" style="display:none" />
          </div>
          
          <div class="divider-text">
            <span>or use Ghost Mode</span>
          </div>
          
          <div class="ghost-mode">
            <div class="ghost-category">
              <h4 class="ghost-label">👕 Tops</h4>
              <div class="ghost-chips" id="tops-chips">
                ${GHOST_MODE_ITEMS.tops.slice(0, 8).map(item => `
                  <button class="ghost-chip ${APP_STATE.closet.includes(item) ? 'active' : ''}" 
                          onclick="toggleClosetItem('${item.replace(/'/g, "\\'")}')">
                    ${item}
                  </button>
                `).join('')}
                <button class="ghost-more" onclick="expandCategory('tops')">
                  +${GHOST_MODE_ITEMS.tops.length - 8} more
                </button>
              </div>
            </div>
            
            <div class="ghost-category">
              <h4 class="ghost-label">👖 Bottoms</h4>
              <div class="ghost-chips" id="bottoms-chips">
                ${GHOST_MODE_ITEMS.bottoms.slice(0, 6).map(item => `
                  <button class="ghost-chip ${APP_STATE.closet.includes(item) ? 'active' : ''}" 
                          onclick="toggleClosetItem('${item.replace(/'/g, "\\'")}')">
                    ${item}
                  </button>
                `).join('')}
                <button class="ghost-more" onclick="expandCategory('bottoms')">
                  +${GHOST_MODE_ITEMS.bottoms.length - 6} more
                </button>
              </div>
            </div>
            
            <div class="ghost-category">
              <h4 class="ghost-label">👟 Footwear</h4>
              <div class="ghost-chips" id="footwear-chips">
                ${GHOST_MODE_ITEMS.footwear.slice(0, 6).map(item => `
                  <button class="ghost-chip ${APP_STATE.closet.includes(item) ? 'active' : ''}" 
                          onclick="toggleClosetItem('${item.replace(/'/g, "\\'")}')">
                    ${item}
                  </button>
                `).join('')}
              </div>
            </div>
            
            <div class="custom-item-input">
              <input type="text" 
                     id="custom-item" 
                     class="text-input" 
                     placeholder="Or type: Maroon Kurta, Grey Joggers..." 
                     onkeydown="handleCustomItemEnter(event)" />
              <button class="btn-icon" onclick="addCustomItem()">+ Add</button>
            </div>
          </div>
          
          <div class="selected-closet" id="selected-closet">
            <h4 class="ghost-label">
              Your Items (<span id="closet-count">${APP_STATE.closet.length}</span>)
            </h4>
            <div class="selected-items" id="selected-items">
              ${APP_STATE.closet.map(item => `
                <div class="closet-item-tag">
                  <span>${item}</span>
                  <button class="remove-item" onclick="removeClosetItem('${item.replace(/'/g, "\\'")}')">✕</button>
                </div>
              `).join('')}
            </div>
          </div>
          
          <p class="trust-note">
            ⓘ Add at least 3 items for best results
          </p>
          
          <div class="action-bar">
            <button class="btn-secondary" onclick="skipCloset()">
              Skip for now
            </button>
            <button class="btn-primary" 
                    ${APP_STATE.closet.length >= 1 ? '' : 'disabled'}
                    onclick="generateRecommendations()">
              ✨ Generate My Look
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);

    // Setup photo upload
    const photoInput = document.getElementById('closet-photos');
    if (photoInput) {
      photoInput.addEventListener('change', handlePhotoUpload);
    }
  }

  window.toggleClosetItem = function (item) {
    if (APP_STATE.closet.includes(item)) {
      APP_STATE.closet = APP_STATE.closet.filter(i => i !== item);
    } else {
      APP_STATE.closet.push(item);
    }
    renderClosetStep();
  }

  window.removeClosetItem = function (item) {
    APP_STATE.closet = APP_STATE.closet.filter(i => i !== item);
    renderClosetStep();
  }

  window.addCustomItem = function () {
    const input = document.getElementById('custom-item');
    const value = input.value.trim();
    if (value) {
      const items = value.split(',').map(i => i.trim()).filter(Boolean);
      APP_STATE.closet.push(...items);
      input.value = '';
      renderClosetStep();
    }
  }

  window.handleCustomItemEnter = function (event) {
    if (event.key === 'Enter') {
      addCustomItem();
    }
  }

  window.expandCategory = function (category) {
    const container = document.getElementById(`${category}-chips`);
    const allItems = GHOST_MODE_ITEMS[category];
    const startIndex = category === 'tops' ? 8 : 6;

    // Remove the "more" button
    const moreBtn = container.querySelector('.ghost-more');
    if (moreBtn) moreBtn.remove();

    // Add remaining items
    allItems.slice(startIndex).forEach(item => {
      const chip = document.createElement('button');
      chip.className = `ghost-chip ${APP_STATE.closet.includes(item) ? 'active' : ''} fade-in`;
      chip.textContent = item;
      chip.onclick = () => toggleClosetItem(item);
      container.appendChild(chip);
    });
  }

  window.handlePhotoUpload = function (event) {
    alert('📸 Photo upload feature coming soon! This will use AI to detect clothing items from your photos.');
  }

  window.skipCloset = function () {
    APP_STATE.closet = [];
    generateRecommendations();
  }

  window.generateRecommendations = function () {
    // Save all collected data
    const fullProfile = {
      ...APP_STATE.identity,
      ...APP_STATE.dataCollection,
      closet: APP_STATE.closet,
      lastUpdated: Date.now()
    };
    saveUserData(fullProfile);

    // Show loading and then results
    showLoadingScreen();
  }

  // PHASE 4 & 5: LOADING & RESULTS
  function showLoadingScreen() {
    const html = `
      <div class="fade-in">
        <div class="glass-card loading-screen">
          <div class="spinner"></div>
          <h2 class="context-heading">Crafting Your Perfect Look</h2>
          <p class="context-subtitle">Analyzing your style profile, body data, and wardrobe...</p>
        </div>
      </div>
    `;
    render(html);

    // Simulate AI processing
    setTimeout(() => {
      const recommendations = generateAIRecommendations();
      renderResults(recommendations);
    }, 2500);
  }

  function generateAIRecommendations() {
    const profile = APP_STATE.identity;
    const data = APP_STATE.dataCollection;
    const closet = APP_STATE.closet || [];

    const outfitItems = [
      {
        name: 'Navy Oxford Shirt',
        icon: '👔',
        type: 'top',
        owned: closet.some(item => item.toLowerCase().includes('navy') || item.toLowerCase().includes('oxford') || item.toLowerCase().includes('blue'))
      },
      {
        name: 'Khaki Chinos',
        icon: '👖',
        type: 'bottom',
        owned: closet.some(item => item.toLowerCase().includes('khaki') || item.toLowerCase().includes('chino'))
      },
      {
        name: 'Brown Leather Shoes',
        icon: '👞',
        type: 'footwear',
        owned: closet.some(item => item.toLowerCase().includes('brown') && (item.toLowerCase().includes('shoe') || item.toLowerCase().includes('formal')))
      },
      {
        name: 'Minimal Watch',
        icon: '⌚',
        type: 'accessory',
        owned: closet.some(item => item.toLowerCase().includes('watch'))
      }
    ];

    const direction = generateDirection(data.context, data.loudness, profile.coreExpression);
    const tips = generateTips(data.skinTone, data.undertone, data.build);
    const colorScience = generateColorScience(data.skinTone, data.undertone);

    return {
      outfitItems,
      direction,
      tips,
      colorScience
    };
  }

  function generateDirection(context, loudness, archetype) {
    const directions = {
      'First Day at Work': `Go with a structured navy oxford, tucked into khaki chinos. The brown leather shoes ground the look. Skip the tie — roll the sleeves once. It says "I belong here" without trying too hard.`,
      'Date Night': `Sharp but approachable. A fitted shirt, well-tailored chinos, and clean footwear. Let the fit do the talking — confidence comes from comfort, not flash.`,
      'Wedding Guest': `Elevated ethnic or smart formal. Think rich fabrics, subtle embellishments. You're there to celebrate, not compete with the couple.`,
      'Festival/Pooja': `Traditional with intention. Choose fabrics that breathe, colors that honor the occasion. Comfort meets devotion.`,
      'College/Campus': `Effortlessly put-together. Clean basics, layered right. You're studying, not performing — but you still show up with purpose.`
    };

    return directions[context] || `Dress with intention. Every piece should serve the moment you're stepping into.`;
  }

  function generateTips(skinTone, undertone, build) {
    const tips = [];

    if (build === 'athletic' || build === 'broad') {
      tips.push('Roll sleeves to mid-forearm to balance proportions and add relaxed confidence');
    }

    if (undertone === 'cool') {
      tips.push('Add a minimal silver watch — your cool undertone makes silver metals shine against your skin');
    } else if (undertone === 'warm') {
      tips.push('Gold-toned accessories will complement your warm undertone beautifully');
    }

    if (skinTone === 'wheatish' || skinTone === 'medium') {
      tips.push('Avoid pure black shoes with khaki — brown leather adds warmth that complements your skin tone better');
    }

    tips.push('Ensure your shirt collar sits properly — it frames your face and sets the tone for the entire outfit');
    tips.push('The fit matters more than the brand — prioritize how clothes sit on your body over labels');

    return tips;
  }

  function generateColorScience(skinTone, undertone) {
    const science = {
      'fair-warm': 'Your fair, warm-toned skin glows with earthy neutrals and warm colors. Navy and khaki create a grounded, approachable palette.',
      'wheatish-warm': 'Navy + Khaki on wheatish/warm skin creates a grounded, approachable palette. The brown leather adds warmth without competing.',
      'medium-cool': 'Your medium, cool-toned skin works beautifully with blues and grays. Silver accents will pop.',
      'dusky-warm': 'Rich, warm colors enhance your dusky tone. Deep blues, burgundy, and forest greens are your power colors.',
      'deep-cool': 'Bold contrasts work on your deep, cool-toned skin. Don\'t shy away from bright whites and deep jewel tones.'
    };

    const key = `${skinTone}-${undertone}`;
    return science[key] || `Your unique skin tone and undertone combination creates opportunities for distinctive color choices.`;
  }

  function renderResults(recommendations) {
    const profile = APP_STATE.identity;
    const data = APP_STATE.dataCollection;
    const { outfitItems, direction, tips, colorScience } = recommendations;

    const missingItems = outfitItems.filter(item => !item.owned);
    const budgetRange = LIFESTYLE_OPTIONS.budgets.find(b => b.id === data.budget);

    const html = `
      <div class="fade-in">
        <div class="glass-card">
          <button class="back-btn" onclick="renderDashboard()">← Back to Dashboard</button>
          
          <div class="step-header">
            <h1 class="section-title">✨ Your Look: "${data.context}"</h1>
            <p class="section-subtitle">
              ${data.loudness} • ${profile.coreExpression} Archetype
            </p>
          </div>
          
          <div class="result-outfit">
            ${outfitItems.map(item => `
              <div class="outfit-item ${item.owned ? 'owned' : 'missing'} scale-in">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-status ${item.owned ? 'owned' : 'missing'}">
                  ${item.owned ? '✅ Owned' : '🔴 Shop'}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="direction-card">
            "${direction}"
          </div>
          
          <div class="tips-section">
            <h4 class="ghost-label">🎨 Why These Colors Work On You</h4>
            <p style="font-size: 15px; line-height: 1.8; color: var(--text-muted);">
              ${colorScience}
            </p>
          </div>
          
          <div class="tips-section">
            <h4 class="ghost-label">💡 Styling Tips</h4>
            <ul class="tips-list">
              ${tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
          
          ${missingItems.length > 0 ? `
            <div class="shopping-section">
              <h4 class="ghost-label">🛒 Complete This Look</h4>
              <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">
                Items you don't have yet (within your ${budgetRange ? budgetRange.label : ''} range)
              </p>
              
              ${missingItems.map(item => `
                <div class="shopping-card scale-in">
                  <span class="shopping-item-name">🔴 ${item.name}</span>
                  <div class="shopping-links">
                    <a href="https://www.myntra.com/search?q=${encodeURIComponent(item.name)}" 
                       target="_blank" 
                       class="shop-link">
                      🛒 Myntra
                    </a>
                    <a href="https://www.ajio.com/search/?text=${encodeURIComponent(item.name)}" 
                       target="_blank" 
                       class="shop-link">
                      🛒 Ajio
                    </a>
                    <a href="https://www.amazon.in/s?k=${encodeURIComponent(item.name)}" 
                       target="_blank" 
                       class="shop-link">
                      🛒 Amazon
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="action-bar">
            <button class="btn-secondary" onclick="startDesignForMyself()">
              🔄 Try Different Look
            </button>
            <button class="btn-primary" onclick="saveAndShare()">
              💾 Save This Look
            </button>
          </div>
        </div>
      </div>
    `;
    render(html);
  }

  window.saveAndShare = function () {
    alert('💾 Look saved to your profile!\\n\\n📤 Share feature coming soon — you\\'ll be able to share your curated looks with friends or save them for later reference.');
  }

  // Start the app
  window.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    loadUserData();
    if (APP_STATE.identity) {
      renderDashboard();
    } else {
      renderWelcome();
    }
  }
})();