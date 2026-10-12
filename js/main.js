/* main.js: Boots the game world loop and manages top-level modes. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let currentMode = 'game'; // 'game' | 'classic'

  function setMode(mode) {
    currentMode = mode;
    const body = document.body;
    const toggleBtn = document.getElementById('mode-toggle-btn');

    if (mode === 'game') {
      body.classList.remove('classic-active');
      body.classList.add('game-active');
      if (toggleBtn) toggleBtn.textContent = 'Classic Mode';
      if (AC.classic) AC.classic.unmount();

      const canvas = document.getElementById('game');
      if (canvas && AC.game) {
        AC.game.init(canvas);
        AC.loop.start(
          dt => AC.game.update(dt),
          alpha => AC.game.render()
        );
      }
    } else {
      body.classList.remove('game-active');
      body.classList.add('classic-active');
      if (toggleBtn) toggleBtn.textContent = 'Explore City World';
      if (AC.loop) AC.loop.stop();

      const appEl = document.getElementById('app');
      if (appEl && AC.classic) {
        AC.classic.mount(appEl);
      }
    }
  }

  function init() {
    const toggleBtn = document.getElementById('mode-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        setMode(currentMode === 'game' ? 'classic' : 'game');
      });
    }

    setMode('game');
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  AC.setMode = setMode;
  AC.getMode = () => currentMode;

})(typeof globalThis !== 'undefined' ? globalThis : window);
