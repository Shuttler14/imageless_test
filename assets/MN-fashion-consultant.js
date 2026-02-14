/**
 * ═══════════════════════════════════════════════════════════
 * MY NARRATIVE - PERSISTENT AI STYLIST
 * ═══════════════════════════════════════════════════════════
 */

const MNAIStylist = (() => {

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════

  // Use centralized config
  const CONFIG = window.MNConfig || {
    STORAGE: {
      CORE_IDENTITY: 'mn_core_identity',
      ACTIVE_CONTEXT: 'mn_active_design_prompt'
    },
    UI: {
      ANIMATION_DURATION: 400
    },
    API: {
      // Replace with your Vercel deployment URL
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
    currentContext: null
  };

  // ═══════════════════════════════════════════════════════════
  // DATA: CALIBRATION QUESTIONS (Phase 1)
  // ═══════════════════════════════════════════════════════════

  const CALIBRATION_FLOW = [
    {
      id: 'coreExpression',
      question: 'How would you describe your core style expression?',
      label: 'Q1: Core Expression',
      options: [
        'Calm & Minimal',
        'Bold & Expressive',
        'Deep & Symbolic',
        'Disciplined & Structured',
        'Free & Experimental',
        'Dark & Mysterious',
        'Clean & Premium',
        'Emotional & Reflective',
        'Playful but Intentional',
        'Understated Confidence'
      ]
    },
    {
      id: 'presence',
      question: 'How do you show up in the world?',
      label: 'Q2: Presence',
      options: [
        'Quiet Observer',
        'Thoughtful Introvert',
        'Confident but Reserved',
        'Creative Risk-Taker',
        'Focused Builder',
        'Explorer Mindset',
        'Stoic & Composed',
        'Emotion-Driven',
        'Logic-Driven',
        'Balanced & Adaptive'
      ]
    },
    {
      id: 'signal',
      question: 'What is your current signal?',
      label: 'Q3: Signal',
      options: [
        'Quiet Rebellion',
        'Academic Burnout',
        'Main Character Energy',
        'Healing Era',
        'Organized Chaos',
        'Stoic Focus',
        'Digital Nomad',
        'Night Owl',
        'Emotionless',
        'Seeing Beyond the Mask'
      ]
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // DATA: CONTEXT OPTIONS (Phase 2)
  // ═══════════════════════════════════════════════════════════

  const CONTEXT_DATA = {
    selfContexts: [
      '📅 First Day at Work',
      '💝 First Date',
      '💪 Gym /Discipline Mode',
      '🌱 Healing Phase',
      '🌙 Late-Night Drives',
      '👕 Daily Minimal Wear',
      '👔 Public-Facing Outfit',
      '✈️ Travel /Wander Mode',
      '🏠 Quiet Personal Wear',
      '⚡ Statement Moment'
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

  // ═══════════════════════════════════════════════════════════
  // DOM REFERENCES
  // ═══════════════════════════════════════════════════════════

  const DOM = {};

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  const init = () => {
    cacheDOM();
    bindEvents();
    loadIdentityFromStorage();

    console.log('🎨 MY NARRATIVE AI Stylist Initialized');
    console.log('💾 Identity Found:', state.identity ? 'Yes (Returning User)' : 'No (New User)');
  };

  const cacheDOM = () => {
    DOM.widget = document.getElementById('mn-ai-widget');
    DOM.minimized = document.getElementById('mn-widget-minimized');
    DOM.expanded = document.getElementById('mn-widget-expanded');
    DOM.minimizeBtn = document.getElementById('mn-minimize-btn');
    DOM.container = document.getElementById('mn-content-container');
    DOM.progressBar = document.getElementById('mn-progress-bar');
    DOM.progressFill = null;
  };

  const bindEvents = () => {
    DOM.minimized.addEventListener('click', expandWidget);
    DOM.minimizeBtn.addEventListener('click', minimizeWidget);

    DOM.expanded.addEventListener('click', (e) => {
      if (e.target === DOM.expanded) {
        minimizeWidget();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isExpanded) {
        minimizeWidget();
      }
    });
  };

  // ═══════════════════════════════════════════════════════════
  // PROGRESS BAR UTILITY
  // ═══════════════════════════════════════════════════════════

  const updateProgressBar = (percentage) => {
    if (!DOM.progressBar) return;

    if (percentage > 0) {
      DOM.progressBar.classList.add('active');
      const progressFill = DOM.progressBar.querySelector('.mn-progress-fill');
      if (progressFill) {
        progressFill.style.width = `${percentage}%`;
      }
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
        console.log('✅ Identity loaded:', state.identity);
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
      console.log('💾 Identity saved:', state.identity);
    } catch (error) {
      console.error('❌ Error saving identity:', error);
    }
  };

  const clearIdentity = () => {
    localStorage.removeItem(STORAGE_KEY);
    state.identity = null;
    state.tempCalibration = {};
    console.log('🗑️ Identity cleared');
  };

  // ═══════════════════════════════════════════════════════════
  // WIDGET STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  const expandWidget = () => {
    state.isExpanded = true;
    DOM.widget.classList.add('is-expanded');
    DOM.expanded.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      DOM.expanded.style.animation = 'fadeIn 0.4s ease-out';
    }, 10);

    if (!state.identity) {
      renderCalibrationFlow(0);
    } else {
      renderContextDashboard();
    }
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
  // PHASE 1: IDENTITY CALIBRATION (First-Time Users)
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
        renderTransition('✨ Identity Calibrated Successfully', () => {
          renderContextDashboard();
        });
      }, 500);
      return;
    }

    const html = `
      <div class="mn-calibration-step mn-fade-in">
        <div class="mn-step-indicator">
          <span class="mn-step-label">${step.label}</span>
          <span class="mn-step-progress">Step ${stepIndex + 1} of ${CALIBRATION_FLOW.length}</span>
        </div>
        
        <h2 class="mn-step-question">${step.question}</h2>
        
        <div class="mn-options-grid">
          ${step.options.map((option, idx) => `
            <button class="mn-option-card" data-value="${option}" style="animation-delay: ${idx * 0.05}s">
              <span class="mn-option-text">${option}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    DOM.container.innerHTML = html;

    DOM.container.querySelectorAll('.mn-option-card').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('selected')) return;

        state.tempCalibration[step.id] = btn.dataset.value;

        btn.classList.add('selected');

        DOM.container.querySelectorAll('.mn-option-card').forEach(b => {
          if (b !== btn) {
            b.style.opacity = '0.3';
            b.style.pointerEvents = 'none';
          }
        });

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
  };

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: CONTEXT DASHBOARD (Returning Users)
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
          <button id="mn-recalibrate-btn" class="mn-text-link">
            🔄 Recalibrate
          </button>
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
  // PATH A: DESIGNING FOR MYSELF
  // ═══════════════════════════════════════════════════════════

  const renderSelfContext = () => {
    const html = `
      <div class="mn-context-flow mn-fade-in">
        
        <button class="mn-back-btn" id="btn-back">← Back</button>

        <h3 class="mn-context-heading">What's the context?</h3>
        <p class="mn-context-subtitle">Select one or more that resonate</p>

        <div class="mn-context-chips" id="context-chips">
          ${CONTEXT_DATA.selfContexts.map(ctx => `
            <button class="mn-context-chip" data-value="${ctx}">
              ${ctx}
            </button>
          `).join('')}
        </div>

        <div class="mn-divider"></div>

        <h3 class="mn-context-heading">How loud should it be?</h3>
        <div class="mn-loudness-selector">
          <button class="mn-loudness-btn active" data-value="Subtle">🤫 Subtle</button>
          <button class="mn-loudness-btn" data-value="Balanced">⚖️ Balanced</button>
          <button class="mn-loudness-btn" data-value="Statement">⚡ Statement</button>
        </div>

        <div class="mn-action-bar">
          <button id="btn-generate-self" class="mn-btn-primary">
            ✨ Get AI Recommendations
          </button>
        </div>

      </div>
    `;

    DOM.container.innerHTML = html;

    let selectedContext = null;
    let selectedLoudness = 'Subtle';  // ← Matches the default 'active' button

    DOM.container.querySelectorAll('.mn-context-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.container.querySelectorAll('.mn-context-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedContext = chip.dataset.value;
      });
    });

    DOM.container.querySelectorAll('.mn-loudness-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.container.querySelectorAll('.mn-loudness-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLoudness = btn.dataset.value;
      });
    });

    document.getElementById('btn-back').addEventListener('click', renderContextDashboard);

    document.getElementById('btn-generate-self').addEventListener('click', () => {
      if (!selectedContext) {
        alert('⚠️ Please select a context');
        return;
      }

      state.currentContext = {
        mode: 'self',
        contexts: [selectedContext],
        loudness: selectedLoudness
      };

      generateAIRecommendations();
    });
  };

  // ═══════════════════════════════════════════════════════════
  // PATH B: DESIGNING FOR GIFT
  // ═══════════════════════════════════════════════════════════

  const renderGiftContext = () => {
    const html = `
      <div class="mn-context-flow mn-fade-in">
        
        <button class="mn-back-btn" id="btn-back">← Back</button>

        <h3 class="mn-context-heading">Who is this gift for?</h3>
        <div class="mn-context-chips" id="recipient-chips">
          ${CONTEXT_DATA.recipients.map(rec => `
            <button class="mn-context-chip mn-recipient-chip" data-value="${rec}">
              ${rec}
            </button>
          `).join('')}
        </div>

        <div class="mn-divider"></div>

        <h3 class="mn-context-heading">What's the occasion?</h3>
        <div class="mn-context-chips" id="occasion-chips">
          ${CONTEXT_DATA.occasions.map(occ => `
            <button class="mn-context-chip mn-occasion-chip" data-value="${occ}">
              ${occ}
            </button>
          `).join('')}
        </div>

        <div class="mn-divider"></div>

        <h3 class="mn-context-heading">Unspoken Message (Optional)</h3>
        <input 
          type="text" 
          id="unspoken-message" 
          class="mn-text-input" 
          placeholder="What should this design say to them?"
        />

        <div class="mn-action-bar">
          <button id="btn-generate-gift" class="mn-btn-primary">
            ✨ Get AI Recommendations
          </button>
        </div>

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
      if (!selectedRecipient || !selectedOccasion) {
        alert('⚠️ Please select both recipient and occasion');
        return;
      }

      const unspokenMessage = document.getElementById('unspoken-message').value;

      state.currentContext = {
        mode: 'gift',
        recipient: selectedRecipient,
        occasion: selectedOccasion,
        unspoken: unspokenMessage
      };

      generateAIRecommendations();
    });
  };

  // ═══════════════════════════════════════════════════════════
  // AI INTEGRATION
  // ═══════════════════════════════════════════════════════════
  // CHANGE 2: Cleaned up — single function, real URL, 
  //           saves context for slogans page
  // ═══════════════════════════════════════════════════════════

  const generateAIRecommendations = async () => {
    // 1. Show Loading
    renderTransition('🧠 Baking Your Uniqueness...', () => { });

    try {
      // 2. Call your Vercel backend
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: state.identity,
          currentContext: state.currentContext
        })
      });

      if (!response.ok) throw new Error("Consultant Service Unavailable");

      const recommendations = await response.json();

      // ═══════════════════════════════════════════
      // CHANGE 3: Check for backend error in response
      // ═══════════════════════════════════════════
      if (recommendations.error) {
        console.warn('⚠️ AI returned fallback:', recommendations.error);
        // Still show the fallback recommendations — they're usable
      }

      // ═══════════════════════════════════════════
      // Save BOTH direction AND context so the slogans page can use them
      localStorage.setItem(CONTEXT_KEY, JSON.stringify({
        direction: recommendations.direction,
        suggestions: recommendations.suggestions,
        context: state.currentContext,
        identity: state.identity,
        mode: state.currentContext.mode,
        timestamp: Date.now()
      }));

      // 4. Show Results
      if (state.currentContext.mode === 'gift') {
        renderGiftResults(recommendations);
      } else {
        renderResults(recommendations);
      }

    } catch (error) {
      console.error("AI Error:", error);

      // ═══════════════════════════════════════════
      // CHANGE 5: Better error UX — don't just alert
      // ═══════════════════════════════════════════
      DOM.container.innerHTML = `
        <div class="mn-transition">
          <p class="mn-transition-text" style="color: #ff6b6b;">⚠️ AI Connection Failed</p>
          <p style="color: #888; font-size: 12px; margin-top: 10px;">${error.message}</p>
          <button class="mn-btn-secondary" id="btn-retry" style="margin-top: 20px;">
            🔄 Try Again
          </button>
          <button class="mn-btn-secondary" id="btn-back-err" style="margin-top: 10px;">
            ← Go Back
          </button>
        </div>
      `;

      document.getElementById('btn-retry').addEventListener('click', generateAIRecommendations);
      document.getElementById('btn-back-err').addEventListener('click', renderContextDashboard);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // GIFT MODE RESULTS (Slogans)
  // ═══════════════════════════════════════════════════════════

  const renderGiftResults = (recommendations) => {
    const slogans = recommendations.suggestions || [];

    // Ensure we have slogans
    if (slogans.length === 0) {
      renderTransition('⚠️ No slogans generated. Please try again.', () => {
        renderContextDashboard();
      });
      return;
    }

    const html = `
      <div class="mn-results mn-fade-in">
        
        <div class="mn-results-header">
          <div class="mn-results-icon">🎁</div>
          <h3 class="mn-results-title">AI-Curated Slogans</h3>
          <p class="mn-results-subtitle">Select the one that speaks to you</p>
        </div>

        <div class="mn-slogans-list">
          ${slogans.map((slogan, index) => `
            <button class="mn-slogan-card ${index === 0 ? 'recommended' : ''}" data-slogan="${slogan}" style="animation-delay: ${index * 0.1}s">
              ${index === 0 ? '<div class="mn-recommended-badge">✨ AI Recommended</div>' : ''}
              <p class="mn-slogan-text">"${slogan}"</p>
              <div class="mn-select-indicator">Select →</div>
            </button>
          `).join('')}
        </div>

        <div class="mn-action-bar">
          <button id="btn-back-gift" class="mn-btn-secondary">
            ← Back
          </button>
        </div>

      </div>
    `;

    DOM.container.innerHTML = html;

    // Add click handlers for slogans
    DOM.container.querySelectorAll('.mn-slogan-card').forEach(card => {
      card.addEventListener('click', () => {
        const selectedSlogan = card.dataset.slogan;
        handleSloganSelection(selectedSlogan);
      });
    });

    document.getElementById('btn-back-gift').addEventListener('click', renderContextDashboard);
  };

  const handleSloganSelection = (slogan) => {
    // 1. Update the stored context with the selected slogan
    try {
      const storedData = JSON.parse(localStorage.getItem(CONTEXT_KEY) || '{}');
      storedData.selectedSlogan = slogan;
      // Also update the 'direction' to match the slogan if needed, or keep provided direction
      // For now just appending it
      localStorage.setItem(CONTEXT_KEY, JSON.stringify(storedData));
    } catch (e) {
      console.error('Error saving slogan selection:', e);
    }

    // 2. Show transition
    renderTransition('✨ Excellent Choice! Redirecting to Studio...', () => {
      // 3. Redirect to Design Page
      window.location.href = window.MN_CONFIG?.studioUrl || "/pages/create-your-own-design";
    });
  };

  // ═══════════════════════════════════════════════════════════
  // RESULTS DISPLAY
  // ═══════════════════════════════════════════════════════════

  const renderResults = (recommendations) => {
    const html = `
      <div class="mn-results mn-fade-in">
        
        <div class="mn-results-header">
          <div class="mn-results-icon">✨</div>
          <h3 class="mn-results-title">Your AI-Curated Direction</h3>
        </div>

        <div class="mn-direction-card">
          <p class="mn-direction-text">"${recommendations.direction}"</p>
        </div>

        <div class="mn-divider"></div>

        <h4 class="mn-suggestions-heading">Tactical Suggestions</h4>
        <ul class="mn-suggestions-list">
          ${recommendations.suggestions.map(suggestion => `
            <li class="mn-suggestion-item">${suggestion}</li>
          `).join('')}
        </ul>

        <div class="mn-action-bar">
          <button id="btn-new-consultation" class="mn-btn-secondary">
            🔄 New Consultation
          </button>
          <button id="btn-close-widget" class="mn-btn-primary">
            🎨 Start Designing
          </button>
        </div>

      </div>
    `;

    DOM.container.innerHTML = html;

    document.getElementById('btn-new-consultation').addEventListener('click', renderContextDashboard);
    document.getElementById('btn-close-widget').addEventListener('click', () => {
      DOM.container.innerHTML = `
        <div class="mn-transition">
          <div class="mn-spinner"></div>
          <p class="mn-transition-text">Transferring to Studio...</p>
        </div>
      `;

      setTimeout(() => {
        window.location.href = window.MN_CONFIG?.studioUrl || "/pages/create-your-own-design";
      }, 800);
    });
  };

  // ═══════════════════════════════════════════════════════════
  // UTILITY: TRANSITION SCREEN
  // ═══════════════════════════════════════════════════════════

  const renderTransition = (message, callback) => {
    const html = `
      <div class="mn-transition">
        <div class="mn-spinner"></div>
        <p class="mn-transition-text">${message}</p>
      </div>
    `;

    DOM.container.innerHTML = html;
    setTimeout(callback, 1800);
  };

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════

  return {
    init,
    expandWidget,
    minimizeWidget,
    clearIdentity
  };

})();

// ═══════════════════════════════════════════════════════════
// AUTO-INITIALIZE ON DOM READY
// ═══════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', MNAIStylist.init);
} else {
  MNAIStylist.init();
}