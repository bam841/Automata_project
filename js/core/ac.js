/* ac.js: Central AC namespace, core utilities, event bus, and seeded PRNG. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  // Utilities
  AC.util = AC.util || {};

  // Safe DOM selector
  AC.util.$ = (sel, r) => {
    const doc = r || (typeof document !== 'undefined' ? document : null);
    return doc ? doc.querySelector(sel) : null;
  };

  // Safe multi-selector
  AC.util.$$ = (sel, r) => {
    const doc = r || (typeof document !== 'undefined' ? document : null);
    return doc ? [...doc.querySelectorAll(sel)] : [];
  };

  // HTML entity escaper
  AC.util.esc = str => String(str).replace(/[&<>"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c]));

  // Numeric clamp [min, max]
  AC.util.clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Event bus (ARCHITECTURE.md §3)
  const listeners = Object.create(null);

  AC.bus = {
    on(evt, fn) {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(fn);
      return () => AC.bus.off(evt, fn);
    },
    off(evt, fn) {
      if (!listeners[evt]) return;
      listeners[evt] = listeners[evt].filter(f => f !== fn);
      if (listeners[evt].length === 0) delete listeners[evt];
    },
    emit(evt, payload) {
      if (!listeners[evt]) return;
      for (const fn of [...listeners[evt]]) {
        fn(payload);
      }
    },
    _clear() {
      for (const k of Object.keys(listeners)) {
        delete listeners[k];
      }
    }
  };

  // Seeded PRNG: Mulberry32 (ARCHITECTURE.md §3)
  AC.rng = function (seed = 0) {
    let a = seed | 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
