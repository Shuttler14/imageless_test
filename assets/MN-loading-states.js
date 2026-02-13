/**
 * ═══════════════════════════════════════════════════════════
 * MY NARRATIVE - LOADING STATES & UI FEEDBACK
 * Reusable loading spinners, toasts, and error components
 * ═══════════════════════════════════════════════════════════
 */

const MNLoadingStates = (() => {
  
  const CONFIG = window.MNConfig || { UI: { TOAST_DURATION: 3000, BRAND_COLOR: '#39A596' } };

  // ═══════════════════════════════════════════════════════════
  // LOADING SPINNER
  // ═══════════════════════════════════════════════════════════
  
  const createSpinner = (options = {}) => {
    const {
      size = 40,
      color = CONFIG.UI.BRAND_COLOR,
      message = 'Loading...',
      container = null
    } = options;

    const spinnerHTML = `
      <div class="mn-loading-overlay" style="
        position: ${container ? 'absolute' : 'fixed'};
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(4px);
      ">
        <div class="mn-spinner" style="
          width: ${size}px;
          height: ${size}px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: ${color};
          border-radius: 50%;
          animation: mn-spin 0.8s linear infinite;
        "></div>
        <p style="
          color: white;
          margin-top: 20px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.5px;
        ">${message}</p>
      </div>
      
      <style>
        @keyframes mn-spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    if (container) {
      const containerEl = typeof container === 'string' 
        ? document.getElementById(container) 
        : container;
      
      if (containerEl) {
        containerEl.style.position = 'relative';
        containerEl.insertAdjacentHTML('beforeend', spinnerHTML);
        return containerEl.querySelector('.mn-loading-overlay');
      }
    } else {
      document.body.insertAdjacentHTML('beforeend', spinnerHTML);
      return document.querySelector('.mn-loading-overlay');
    }
  };

  const removeSpinner = (spinner) => {
    if (spinner && spinner.parentNode) {
      spinner.parentNode.removeChild(spinner);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // TOAST NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════
  
  let toastQueue = [];
  let activeToast = null;

  const showToast = (message, options = {}) => {
    const {
      type = 'info',        // 'success', 'error', 'warning', 'info'
      duration = CONFIG.UI.TOAST_DURATION,
      position = 'top',     // 'top', 'bottom'
      action = null         // { label: 'Retry', callback: () => {} }
    } = options;

    const colors = {
      success: '#51cf66',
      error: '#ff6b6b',
      warning: '#ffd43b',
      info: CONFIG.UI.BRAND_COLOR
    };

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: '✨'
    };

    const toastHTML = `
      <div class="mn-toast mn-toast-${type}" style="
        position: fixed;
        ${position === 'top' ? 'top: 20px;' : 'bottom: 20px;'}
        left: 50%;
        transform: translateX(-50%) translateY(${position === 'top' ? '-100%' : '100%'});
        background: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 500px;
        font-family: 'Inter', sans-serif;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s;
        opacity: 0;
      ">
        <span style="font-size: 20px; flex-shrink: 0;">${icons[type]}</span>
        <span style="flex: 1; font-size: 14px; font-weight: 500;">${message}</span>
        ${action ? `
          <button class="mn-toast-action" style="
            background: rgba(255, 255, 255, 0.2);
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            color: white;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
          ">${action.label}</button>
        ` : ''}
        <button class="mn-toast-close" style="
          background: transparent;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          transition: opacity 0.2s;
        ">×</button>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHTML);
    const toast = document.querySelector('.mn-toast:last-child');

    // Animate in
    setTimeout(() => {
      toast.style.transform = `translateX(-50%) translateY(0)`;
      toast.style.opacity = '1';
    }, 10);

    // Action button handler
    if (action) {
      toast.querySelector('.mn-toast-action')?.addEventListener('click', () => {
        action.callback();
        hideToast(toast);
      });
    }

    // Close button handler
    toast.querySelector('.mn-toast-close')?.addEventListener('click', () => {
      hideToast(toast);
    });

    // Auto-hide
    if (duration > 0) {
      setTimeout(() => hideToast(toast), duration);
    }

    activeToast = toast;
    return toast;
  };

  const hideToast = (toast) => {
    if (!toast) return;
    
    const position = toast.style.top ? 'top' : 'bottom';
    toast.style.transform = `translateX(-50%) translateY(${position === 'top' ? '-100%' : '100%'})`;
    toast.style.opacity = '0';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      if (activeToast === toast) {
        activeToast = null;
      }
    }, 400);
  };

  // ═══════════════════════════════════════════════════════════
  // ERROR MODAL
  // ═══════════════════════════════════════════════════════════
  
  const showErrorModal = (options = {}) => {
    const {
      title = 'Something went wrong',
      message = 'Please try again later.',
      details = null,
      primaryAction = { label: 'Try Again', callback: () => {} },
      secondaryAction = { label: 'Cancel', callback: () => {} }
    } = options;

    const modalHTML = `
      <div class="mn-error-modal-backdrop" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        backdrop-filter: blur(4px);
        animation: mn-fade-in 0.3s;
      ">
        <div class="mn-error-modal" style="
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 16px;
          padding: 32px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          color: white;
          font-family: 'Inter', sans-serif;
          animation: mn-slide-up 0.3s;
        ">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="
              width: 64px;
              height: 64px;
              background: rgba(255, 107, 107, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px;
              font-size: 32px;
            ">⚠️</div>
            <h3 style="
              font-size: 24px;
              margin: 0 0 12px 0;
              font-weight: 700;
            ">${title}</h3>
            <p style="
              color: #aaa;
              font-size: 14px;
              line-height: 1.6;
              margin: 0;
            ">${message}</p>
            ${details ? `
              <details style="margin-top: 16px; text-align: left;">
                <summary style="
                  cursor: pointer;
                  color: #888;
                  font-size: 12px;
                  user-select: none;
                ">Show technical details</summary>
                <pre style="
                  background: rgba(0, 0, 0, 0.3);
                  padding: 12px;
                  border-radius: 8px;
                  font-size: 11px;
                  color: #ff6b6b;
                  overflow-x: auto;
                  margin-top: 8px;
                ">${details}</pre>
              </details>
            ` : ''}
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="mn-modal-primary" style="
              background: ${CONFIG.UI.BRAND_COLOR};
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              flex: 1;
            ">${primaryAction.label}</button>
            
            <button class="mn-modal-secondary" style="
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              padding: 12px 24px;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              flex: 1;
            ">${secondaryAction.label}</button>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes mn-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mn-slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .mn-modal-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(57, 165, 150, 0.4);
        }
        .mn-modal-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const backdrop = document.querySelector('.mn-error-modal-backdrop');

    const closeModal = () => {
      backdrop.style.animation = 'mn-fade-in 0.2s reverse';
      setTimeout(() => {
        if (backdrop.parentNode) {
          backdrop.parentNode.removeChild(backdrop);
        }
      }, 200);
    };

    backdrop.querySelector('.mn-modal-primary')?.addEventListener('click', () => {
      primaryAction.callback();
      closeModal();
    });

    backdrop.querySelector('.mn-modal-secondary')?.addEventListener('click', () => {
      secondaryAction.callback();
      closeModal();
    });

    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });

    return backdrop;
  };

  // ═══════════════════════════════════════════════════════════
  // PROGRESS BAR
  // ═══════════════════════════════════════════════════════════
  
  const createProgressBar = (containerId, options = {}) => {
    const {
      steps = [],
      currentStep = 0,
      color = CONFIG.UI.BRAND_COLOR
    } = options;

    const container = typeof containerId === 'string' 
      ? document.getElementById(containerId) 
      : containerId;

    if (!container) return null;

    const progressHTML = `
      <div class="mn-progress-bar" style="
        padding: 20px 0;
        font-family: 'Inter', sans-serif;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          position: relative;
          margin-bottom: 12px;
        ">
          ${steps.map((step, index) => `
            <div style="
              flex: 1;
              text-align: center;
              position: relative;
              z-index: 1;
            ">
              <div class="mn-step-indicator" style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${index <= currentStep ? color : 'rgba(255, 255, 255, 0.1)'};
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 8px;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s;
                ${index < currentStep ? 'box-shadow: 0 0 0 4px rgba(57, 165, 150, 0.2);' : ''}
              ">
                ${index < currentStep ? '✓' : index + 1}
              </div>
              <div style="
                font-size: 11px;
                color: ${index <= currentStep ? color : '#888'};
                font-weight: ${index === currentStep ? '600' : '400'};
              ">${step}</div>
            </div>
            ${index < steps.length - 1 ? `
              <div style="
                position: absolute;
                top: 16px;
                left: ${((index + 0.5) / steps.length) * 100}%;
                width: ${100 / steps.length}%;
                height: 2px;
                background: ${index < currentStep ? color : 'rgba(255, 255, 255, 0.1)'};
                transition: background 0.3s;
                transform: translateX(-50%);
              "></div>
            ` : ''}
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = progressHTML;
    return container;
  };

  // ═══════════════════════════════════════════════════════════
  // SKELETON LOADER
  // ═══════════════════════════════════════════════════════════
  
  const createSkeleton = (containerId, type = 'card') => {
    const container = typeof containerId === 'string' 
      ? document.getElementById(containerId) 
      : containerId;

    if (!container) return null;

    const skeletons = {
      card: `
        <div class="mn-skeleton-card" style="
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          animation: mn-pulse 1.5s ease-in-out infinite;
        ">
          <div style="width: 60%; height: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 12px;"></div>
          <div style="width: 100%; height: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 8px;"></div>
          <div style="width: 80%; height: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;"></div>
        </div>
      `,
      list: `
        <div class="mn-skeleton-list">
          ${[1,2,3].map(() => `
            <div style="
              display: flex;
              gap: 12px;
              padding: 12px 0;
              animation: mn-pulse 1.5s ease-in-out infinite;
            ">
              <div style="width: 48px; height: 48px; border-radius: 8px; background: rgba(255, 255, 255, 0.1);"></div>
              <div style="flex: 1;">
                <div style="width: 60%; height: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 8px;"></div>
                <div style="width: 40%; height: 14px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      `
    };

    const html = `
      ${skeletons[type] || skeletons.card}
      <style>
        @keyframes mn-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
    `;

    container.innerHTML = html;
    return container;
  };

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════
  
  return {
    spinner: {
      show: createSpinner,
      hide: removeSpinner
    },
    toast: {
      show: showToast,
      success: (msg, opts) => showToast(msg, { ...opts, type: 'success' }),
      error: (msg, opts) => showToast(msg, { ...opts, type: 'error' }),
      warning: (msg, opts) => showToast(msg, { ...opts, type: 'warning' }),
      info: (msg, opts) => showToast(msg, { ...opts, type: 'info' }),
      hide: hideToast
    },
    modal: {
      error: showErrorModal
    },
    progress: {
      create: createProgressBar
    },
    skeleton: {
      create: createSkeleton
    }
  };
})();

// Make available globally
window.MNLoadingStates = MNLoadingStates;
