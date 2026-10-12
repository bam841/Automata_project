/* touch.js: On-screen virtual D-Pad and action buttons for touch devices. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let containerEl = null;
  let isCoarse = false;

  function initTouchControls() {
    if (typeof document === 'undefined') return;

    containerEl = document.getElementById('touch-controls');
    if (!containerEl) return;

    // Detect touch / coarse pointer
    const media = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
    isCoarse = (media && media.matches) || ('ontouchstart' in window);

    if (isCoarse) {
      containerEl.classList.add('visible');
    }

    if (media && media.addEventListener) {
      media.addEventListener('change', e => {
        isCoarse = e.matches;
        if (isCoarse) containerEl.classList.add('visible');
        else containerEl.classList.remove('visible');
      });
    }

    // Bind pointer events on directional D-pad buttons
    const bindBtn = (sel, action) => {
      const btn = containerEl.querySelector(sel);
      if (!btn) return;

      const setDown = (down) => {
        if (AC.input && typeof AC.input._setDown === 'function') {
          AC.input._setDown(action, down);
        }
      };

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        setDown(true);
      });

      const release = (e) => {
        btn.classList.remove('pressed');
        setDown(false);
      };

      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
    };

    bindBtn('[data-touch="up"]', 'up');
    bindBtn('[data-touch="down"]', 'down');
    bindBtn('[data-touch="left"]', 'left');
    bindBtn('[data-touch="right"]', 'right');
    bindBtn('[data-touch="interact"]', 'interact');
    bindBtn('[data-touch="journal"]', 'journal');
    bindBtn('[data-touch="hint"]', 'hint');

    // Settings button
    const settingsBtn = containerEl.querySelector('[data-touch="settings"]');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (AC.settings) AC.settings.open();
      });
    }
  }

  AC.touch = {
    init: initTouchControls,
    setVisible(visible) {
      if (!containerEl) return;
      if (visible) containerEl.classList.add('visible');
      else containerEl.classList.remove('visible');
    },
    isTouchDevice() {
      return isCoarse;
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTouchControls);
    } else {
      initTouchControls();
    }
  }

})(typeof globalThis !== 'undefined' ? globalThis : window);
