/**
 * MyNarrative AI Stylist — Embeddable Widget Bootstrapper
 * Brands paste this snippet on their website to enable AI outfit recommendations.
 *
 * Usage:
 * <script src="https://widget.mynarrative.store/embed.js"
 *         data-api-key="mn_live_xxxxx"
 *         async defer></script>
 */
(function() {
  'use strict';

  var WIDGET_VERSION = '1.0.0';
  var WIDGET_CDN = 'https://widget.mynarrative.store';
  var API_BASE = 'https://api.mynarrative.store';

  // ── Read config from script tag ────────────────────────────────────────
  var scriptTag = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1) {
        return scripts[i];
      }
    }
    return null;
  })();

  if (!scriptTag) {
    console.error('[MN-Embed] Could not find script tag');
    return;
  }

  var API_KEY = scriptTag.getAttribute('data-api-key');
  var POSITION = scriptTag.getAttribute('data-position') || 'bottom-right';
  var THEME = scriptTag.getAttribute('data-theme') || 'dark';
  var GREETING = scriptTag.getAttribute('data-greeting') || '';

  if (!API_KEY) {
    console.error('[MN-Embed] data-api-key is required');
    return;
  }

  // ── Browser Fingerprint ────────────────────────────────────────────────
  function generateFingerprint() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('MyNarrative', 2, 2);
    var canvasData = canvas.toDataURL();

    var components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      canvasData.length,
      canvasData.substring(0, 100)
    ];

    // Simple hash
    var str = components.join('|||');
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return 'fp_' + Math.abs(hash).toString(36);
  }

  // ── State ──────────────────────────────────────────────────────────────
  var state = {
    userId: null,
    sessionId: null,
    widgetConfig: null,
    iframe: null,
    container: null,
    isOpen: false,
    subscriptionActive: true
  };

  // ── localStorage helpers ───────────────────────────────────────────────
  function getStoredUserId() {
    try { return localStorage.getItem('mn_user_id'); } catch(e) { return null; }
  }
  function setStoredUserId(id) {
    try { localStorage.setItem('mn_user_id', id); } catch(e) {}
  }
  function getStoredSessionToken() {
    try { return sessionStorage.getItem('mn_session_token'); } catch(e) { return null; }
  }
  function setStoredSessionToken(token) {
    try { sessionStorage.setItem('mn_session_token', token); } catch(e) {}
  }

  // ── API calls ──────────────────────────────────────────────────────────
  function apiPost(path, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API_BASE + path, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        try {
          callback(null, JSON.parse(xhr.responseText));
        } catch(e) {
          callback(e, null);
        }
      }
    };
    xhr.timeout = 10000;
    xhr.ontimeout = function() { callback(new Error('timeout'), null); };
    xhr.send(JSON.stringify(data));
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────
  function bootstrap() {
    var fingerprint = generateFingerprint();
    var storedUserId = getStoredUserId();

    apiPost('/api/widget/bootstrap', {
      api_key: API_KEY,
      fingerprint: fingerprint,
      user_id: storedUserId,
      brand_domain: window.location.hostname,
      referrer: window.location.href,
      version: WIDGET_VERSION
    }, function(err, response) {
      if (err || !response || response.error) {
        if (response && response.error === 'subscription_expired') {
          state.subscriptionActive = false;
          showExpiredOverlay(response.redirect_url);
        }
        console.error('[MN-Embed] Bootstrap failed:', err || response);
        return;
      }

      state.userId = response.user_id;
      state.sessionId = response.session_token;
      state.widgetConfig = response.widget_config || {};

      setStoredUserId(response.user_id);
      setStoredSessionToken(response.session_token);

      createWidget();
    });
  }

  // ── Create Widget UI ───────────────────────────────────────────────────
  function createWidget() {
    // Container
    state.container = document.createElement('div');
    state.container.id = 'mn-widget-container';
    state.container.style.cssText = 'position:fixed;z-index:999999;' + getPositionCSS();

    // Floating button
    var btn = document.createElement('div');
    btn.id = 'mn-widget-btn';
    btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2z" fill="' + (state.widgetConfig.primary_color || '#39A596') + '"/>'
      + '<path d="M9 11.5C9 10.672 9.672 10 10.5 10h7c.828 0 1.5.672 1.5 1.5v5c0 .828-.672 1.5-1.5 1.5H14l-2.5 2v-2h-1c-.828 0-1.5-.672-1.5-1.5v-5z" fill="white"/>'
      + '</svg>';
    btn.style.cssText = 'width:56px;height:56px;border-radius:50%;cursor:pointer;'
      + 'box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;'
      + 'transition:transform 0.2s;background:' + (state.widgetConfig.primary_color || '#39A596') + ';';
    btn.onmouseenter = function() { btn.style.transform = 'scale(1.1)'; };
    btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };
    btn.onclick = toggleWidget;

    state.container.appendChild(btn);
    document.body.appendChild(state.container);

    // Iframe (hidden initially)
    createIframe();

    // Track load event
    trackEvent('load', { page: window.location.href });
  }

  function getPositionCSS() {
    var pos = POSITION;
    if (pos === 'bottom-left') return 'bottom:20px;left:20px;';
    if (pos === 'top-right') return 'top:20px;right:20px;';
    if (pos === 'top-left') return 'top:20px;left:20px;';
    return 'bottom:20px;right:20px;'; // default bottom-right
  }

  function createIframe() {
    var iframe = document.createElement('iframe');
    iframe.id = 'mn-widget-iframe';
    iframe.src = WIDGET_CDN + '/widget.html'
      + '?session=' + encodeURIComponent(state.sessionId)
      + '&user=' + encodeURIComponent(state.userId)
      + '&theme=' + THEME
      + '&api=' + encodeURIComponent(API_BASE);
    iframe.style.cssText = 'position:fixed;display:none;border:none;'
      + 'width:380px;height:600px;border-radius:12px;'
      + 'box-shadow:0 8px 32px rgba(0,0,0,0.25);'
      + 'z-index:1000000;'
      + getPositionIFrameCSS();

    iframe.onload = function() {
      // Send config to iframe
      iframe.contentWindow.postMessage({
        type: 'SET_CONFIG',
        payload: {
          session_token: state.sessionId,
          user_id: state.userId,
          widget_config: state.widgetConfig,
          api_base: API_BASE,
          currency_symbol: state.widgetConfig.currency_symbol || '₹',
          currency_code: state.widgetConfig.currency_code || 'INR'
        }
      }, WIDGET_CDN);
    };

    document.body.appendChild(iframe);
    state.iframe = iframe;
  }

  function getPositionIFrameCSS() {
    var pos = POSITION;
    if (pos === 'bottom-left') return 'bottom:90px;left:20px;';
    if (pos === 'top-right') return 'top:90px;right:20px;';
    if (pos === 'top-left') return 'top:90px;left:20px;';
    return 'bottom:90px;right:20px;';
  }

  // ── Toggle Widget ──────────────────────────────────────────────────────
  function toggleWidget() {
    if (!state.subscriptionActive) {
      showExpiredOverlay();
      return;
    }

    state.isOpen = !state.isOpen;
    if (state.iframe) {
      state.iframe.style.display = state.isOpen ? 'block' : 'none';
    }
    trackEvent(state.isOpen ? 'open' : 'close');
  }

  // ── Subscription Expired Overlay ───────────────────────────────────────
  function showExpiredOverlay(redirectUrl) {
    var overlay = document.createElement('div');
    overlay.id = 'mn-expired-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:1000001;'
      + 'background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;';

    var card = document.createElement('div');
    card.style.cssText = 'background:white;border-radius:16px;padding:40px;max-width:400px;text-align:center;';

    card.innerHTML = '<div style="font-size:48px;margin-bottom:16px;">✨</div>'
      + '<h3 style="margin:0 0 12px;font-family:system-ui;font-size:20px;">AI Stylist is taking a break</h3>'
      + '<p style="margin:0 0 24px;color:#666;font-family:system-ui;font-size:14px;">'
      + 'Visit MyNarrative to continue styling your outfits.</p>'
      + '<a href="' + (redirectUrl || 'https://mynarrative.store') + '" '
      + 'style="display:inline-block;padding:12px 24px;background:#39A596;color:white;'
      + 'text-decoration:none;border-radius:8px;font-family:system-ui;font-weight:600;">'
      + 'Go to MyNarrative</a>';

    overlay.appendChild(card);
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  // ── Analytics ──────────────────────────────────────────────────────────
  function trackEvent(eventType, data) {
    if (!state.sessionId) return;
    apiPost('/api/widget/event', {
      session_token: state.sessionId,
      event_type: eventType,
      event_data: data || {}
    }, function() {});
  }

  // ── Listen for messages from iframe ────────────────────────────────────
  window.addEventListener('message', function(event) {
    if (!event.data || typeof event.data !== 'object') return;

    var type = event.data.type;
    var payload = event.data.payload;

    if (type === 'WIDGET_EVENT') {
      trackEvent(payload.event, payload.data);
    }

    if (type === 'CLOSE_WIDGET') {
      state.isOpen = false;
      if (state.iframe) state.iframe.style.display = 'none';
    }

    if (type === 'SUBSCRIPTION_EXPIRED') {
      state.subscriptionActive = false;
      showExpiredOverlay(payload && payload.redirect_url);
    }

    if (type === 'CLOSET_UPLOAD') {
      // Closet item uploaded - could trigger refresh
      trackEvent('upload_closet', payload);
    }
  });

  // ── Initialize ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
