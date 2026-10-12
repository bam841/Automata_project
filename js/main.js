/* main.js: Game bootstrapper and top-level lifecycle controller. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  function init() {
    const appEl = typeof document !== 'undefined' ? document.getElementById('app') : null;
    if (appEl && AC.classic) {
      AC.classic.mount(appEl);
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  AC.init = init;

})(typeof globalThis !== 'undefined' ? globalThis : window);
