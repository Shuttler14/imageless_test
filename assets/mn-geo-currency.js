/**
 * MN Geo-Currency — Detects user location and formats prices accordingly.
 * Exposes window.MN_currency with:
 *   .detect()       — triggers geolocation (once), resolves with {country, city, currency}
 *   .format(amount) — formats a number in the detected currency
 *   .get()          — returns current {country, city, currency, locale} synchronously
 *   .onReady(fn)    — calls fn when detection completes
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mn_geo_currency';
  var CURRENCY_MAP = {
    IN: { code: 'INR', symbol: '₹', locale: 'en-IN', rate: 1 },
    US: { code: 'USD', symbol: '$', locale: 'en-US', rate: 0.012 },
    GB: { code: 'GBP', symbol: '£', locale: 'en-GB', rate: 0.0095 },
    EU: { code: 'EUR', symbol: '€', locale: 'de-DE', rate: 0.011 },
    AE: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE', rate: 0.044 },
    SA: { code: 'SAR', symbol: '﷼', locale: 'ar-SA', rate: 0.045 },
    SG: { code: 'SGD', symbol: 'S$', locale: 'en-SG', rate: 0.016 },
    AU: { code: 'AUD', symbol: 'A$', locale: 'en-AU', rate: 0.018 },
    CA: { code: 'CAD', symbol: 'C$', locale: 'en-CA', rate: 0.016 },
    DE: { code: 'EUR', symbol: '€', locale: 'de-DE', rate: 0.011 },
    FR: { code: 'EUR', symbol: '€', locale: 'fr-FR', rate: 0.011 },
    JP: { code: 'JPY', symbol: '¥', locale: 'ja-JP', rate: 1.8 },
    KR: { code: 'KRW', symbol: '₩', locale: 'ko-KR', rate: 16.5 },
    BR: { code: 'BRL', symbol: 'R$', locale: 'pt-BR', rate: 0.06 },
    NG: { code: 'NGN', symbol: '₦', locale: 'en-NG', rate: 18.5 },
    ZA: { code: 'ZAR', symbol: 'R', locale: 'en-ZA', rate: 0.22 },
  };
  var DEFAULT = { code: 'INR', symbol: '₹', locale: 'en-IN', country: 'IN', city: '', rate: 1 };

  var state = { country: null, city: null, currency: null, locale: null, rate: 1, ready: false };
  var callbacks = [];

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        country: state.country,
        city: state.city,
        ts: Date.now()
      }));
    } catch (e) {}
  }

  function loadCached() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var d = JSON.parse(raw);
      if (Date.now() - d.ts > 86400000) return false; // 24h cache
      if (d.country && CURRENCY_MAP[d.country]) {
        var c = CURRENCY_MAP[d.country];
        state.country = d.country;
        state.city = d.city || '';
        state.currency = c.code;
        state.symbol = c.symbol;
        state.locale = c.locale;
        state.rate = c.rate;
        state.ready = true;
        return true;
      }
    } catch (e) {}
    return false;
  }

  function applyCountry(country, city) {
    var c = CURRENCY_MAP[country] || DEFAULT;
    state.country = country;
    state.city = city || '';
    state.currency = c.code;
    state.symbol = c.symbol;
    state.locale = c.locale;
    state.rate = c.rate;
    state.ready = true;
    persist();
    callbacks.forEach(function (fn) {
      try { fn({ country: state.country, city: state.city, currency: state.currency, symbol: state.symbol, locale: state.locale }); } catch (e) {}
    });
  }

  function reverseGeocode(lat, lon) {
    // Use free nominatim API
    fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lon)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var cc = (d.address && d.address.country_code || '').toUpperCase();
        var city = (d.address && (d.address.city || d.address.town || d.address.village || d.address.county)) || '';
        applyCountry(cc, city);
      })
      .catch(function () {
        // Fallback: try IP-based geolocation
        fetchIpLocation();
      });
  }

  function fetchIpLocation() {
    fetch('https://ipapi.co/json/')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.country_code) applyCountry(d.country_code, d.city || '');
        else applyCountry('IN', '');
      })
      .catch(function () {
        applyCountry('IN', '');
      });
  }

  function detect() {
    if (state.ready) return Promise.resolve(get());
    return new Promise(function (resolve) {
      callbacks.push(function onReady(s) {
        callbacks = callbacks.filter(function (f) { return f !== onReady; });
        resolve({ country: state.country, city: state.city, currency: state.currency, symbol: state.symbol, locale: state.locale });
      });
      // Try cached first
      if (loadCached()) {
        callbacks.forEach(function (fn) {
          try { fn({ country: state.country, city: state.city, currency: state.currency, symbol: state.symbol, locale: state.locale }); } catch (e) {}
        });
        callbacks = [];
        return;
      }
      // Try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (pos) { reverseGeocode(pos.coords.latitude, pos.coords.longitude); },
          function () { fetchIpLocation(); },
          { timeout: 8000, maximumAge: 86400000 }
        );
      } else {
        fetchIpLocation();
      }
    });
  }

  function get() {
    return {
      country: state.country || 'IN',
      city: state.city || '',
      currency: state.currency || DEFAULT.code,
      symbol: state.symbol || DEFAULT.symbol,
      locale: state.locale || DEFAULT.locale,
      rate: state.rate || 1
    };
  }

  function format(amount) {
    var s = get();
    var num = Number(amount) || 0;
    // Convert from INR base price to local currency
    var converted = Math.round(num * s.rate);
    try {
      return new Intl.NumberFormat(s.locale, { style: 'currency', currency: s.currency, maximumFractionDigits: 0 }).format(converted);
    } catch (e) {
      return s.symbol + converted.toLocaleString(s.locale);
    }
  }

  // Auto-detect on load
  if (loadCached()) {
    state.ready = true;
  } else {
    // Defer detection until after page load
    if (document.readyState === 'complete') {
      detect();
    } else {
      window.addEventListener('load', detect);
    }
  }

  window.MN_currency = { detect: detect, format: format, get: get, onReady: function (fn) { if (state.ready) fn(get()); else callbacks.push(fn); } };
})();
