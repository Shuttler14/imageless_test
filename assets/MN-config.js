/**
 * ═══════════════════════════════════════════════════════════
 * MY NARRATIVE - CENTRALIZED CONFIGURATION
 * Production-ready environment and API configuration
 * ═══════════════════════════════════════════════════════════
 */

const MNConfig = (() => {
  
  // ═══════════════════════════════════════════════════════════
  // ENVIRONMENT DETECTION
  // ═══════════════════════════════════════════════════════════
  
  const getEnvironment = () => {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('myshopify.com')) {
      return 'staging';
    } else {
      return 'production';
    }
  };

  // ═══════════════════════════════════════════════════════════
  // API ENDPOINTS CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  
  const API_CONFIGS = {
    development: {
      FASHION_CONSULTANT_API: 'http://localhost:3000/api/fashion_consultant',
      AFFILIATE_LINKS_API: 'http://localhost:3000/api/generate_affiliate_links',
      AVATAR_GENERATION_API: 'http://localhost:3000/api/generate_avatar',
      WARDROBE_SYNC_API: 'http://localhost:3000/api/wardrobe_sync'
    },
    staging: {
      FASHION_CONSULTANT_API: 'https://mynarrative-ai-staging.vercel.app/api/fashion_consultant',
      AFFILIATE_LINKS_API: 'https://mynarrative-ai-staging.vercel.app/api/generate_affiliate_links',
      AVATAR_GENERATION_API: 'https://mynarrative-ai-staging.vercel.app/api/generate_avatar',
      WARDROBE_SYNC_API: 'https://mynarrative-ai-staging.vercel.app/api/wardrobe_sync'
    },
    production: {
      // ═══════════════════════════════════════════
      // REPLACE WITH YOUR ACTUAL VERCEL URL
      // ═══════════════════════════════════════════
      FASHION_CONSULTANT_API: 'https://YOUR_VERCEL_APP.vercel.app/api/fashion_consultant',
      AFFILIATE_LINKS_API: 'https://YOUR_VERCEL_APP.vercel.app/api/generate_affiliate_links',
      AVATAR_GENERATION_API: 'https://YOUR_VERCEL_APP.vercel.app/api/generate_avatar',
      WARDROBE_SYNC_API: 'https://YOUR_VERCEL_APP.vercel.app/api/wardrobe_sync'
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FEATURE FLAGS
  // ═══════════════════════════════════════════════════════════
  
  const FEATURES = {
    ENABLE_3D_AVATAR: false,        // Set true when ready for 3D mesh
    ENABLE_GHOST_MODE: true,        // Physics-based wardrobe
    ENABLE_PHOTO_UPLOAD: true,      // User photo upload
    ENABLE_RED_GAP: true,           // Affiliate recommendations
    ENABLE_ANALYTICS: true,         // Track user interactions
    ENABLE_ERROR_REPORTING: true,   // Send errors to monitoring
    ENABLE_OFFLINE_MODE: true       // Fallback when API fails
  };

  // ═══════════════════════════════════════════════════════════
  // TIMEOUT & RETRY CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  
  const NETWORK_CONFIG = {
    API_TIMEOUT: 30000,             // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,              // 1 second
    CACHE_DURATION: 300000          // 5 minutes
  };

  // ═══════════════════════════════════════════════════════════
  // STORAGE KEYS
  // ═══════════════════════════════════════════════════════════
  
  const STORAGE_KEYS = {
    CORE_IDENTITY: 'mn_core_identity',
    ACTIVE_CONTEXT: 'mn_active_design_prompt',
    WARDROBE_DATA: 'mn_wardrobe_data',
    API_CACHE: 'mn_api_cache',
    USER_PREFERENCES: 'mn_user_preferences'
  };

  // ═══════════════════════════════════════════════════════════
  // ANIMATION & UI CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  
  const UI_CONFIG = {
    ANIMATION_DURATION: 400,
    TOAST_DURATION: 3000,
    TRANSITION_EASE: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BRAND_COLOR: '#39A596',
    ERROR_COLOR: '#ff6b6b',
    SUCCESS_COLOR: '#51cf66'
  };

  // ═══════════════════════════════════════════════════════════
  // AFFILIATE PROGRAM IDs (from environment or hardcoded)
  // ═══════════════════════════════════════════════════════════
  
  const AFFILIATE_IDS = {
    NIKE: window.MN_ENV?.NIKE_AFFILIATE_ID || '',
    ADIDAS: window.MN_ENV?.ADIDAS_AFFILIATE_ID || '',
    PUMA: window.MN_ENV?.PUMA_AFFILIATE_ID || '',
    AMAZON: window.MN_ENV?.AMAZON_AFFILIATE_ID || ''
  };

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════
  
  const currentEnv = getEnvironment();
  const currentConfig = API_CONFIGS[currentEnv];

  return {
    // Environment
    ENV: currentEnv,
    IS_DEV: currentEnv === 'development',
    IS_PROD: currentEnv === 'production',
    
    // API Endpoints
    API: currentConfig,
    
    // Feature Flags
    FEATURES,
    
    // Network Settings
    NETWORK: NETWORK_CONFIG,
    
    // Storage
    STORAGE: STORAGE_KEYS,
    
    // UI
    UI: UI_CONFIG,
    
    // Affiliates
    AFFILIATES: AFFILIATE_IDS,
    
    // Helper: Get API URL with fallback
    getApiUrl: (endpoint) => {
      return currentConfig[endpoint] || currentConfig.FASHION_CONSULTANT_API;
    },
    
    // Helper: Check if feature is enabled
    isFeatureEnabled: (featureName) => {
      return FEATURES[featureName] === true;
    },
    
    // Helper: Log with environment prefix
    log: (...args) => {
      if (currentEnv === 'development') {
        console.log(`[MN-${currentEnv}]`, ...args);
      }
    },
    
    // Helper: Error log (always enabled)
    error: (...args) => {
      console.error(`[MN-${currentEnv}]`, ...args);
      
      if (FEATURES.ENABLE_ERROR_REPORTING && currentEnv === 'production') {
        // Send to error tracking service (Sentry, etc.)
        // window.Sentry?.captureException(args[0]);
      }
    }
  };
})();

// Make available globally
window.MNConfig = MNConfig;

// Log initialization
MNConfig.log('Configuration loaded:', {
  env: MNConfig.ENV,
  features: MNConfig.FEATURES,
  apiBaseUrl: MNConfig.API.FASHION_CONSULTANT_API
});