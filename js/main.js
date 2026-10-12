/* main.js: State machine controller, world loop coordinator, and Classic Mode switcher. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let currentMode = 'game'; // 'game' | 'classic'
  let currentState = 'boot'; // 'boot' | 'title' | 'world' | 'lecture' | 'dialogue' | 'paused'

  const VALID_TRANSITIONS = {
    boot: ['title', 'world'],
    title: ['world'],
    world: ['lecture', 'dialogue', 'paused', 'title'],
    lecture: ['world'],
    dialogue: ['world'],
    paused: ['world', 'title']
  };

  AC.setState = function (newState) {
    if (newState === currentState) return;

    const allowed = VALID_TRANSITIONS[currentState] || [];
    if (!allowed.includes(newState)) {
      throw new Error(`Illegal state transition from "${currentState}" to "${newState}"`);
    }

    const previousState = currentState;
    currentState = newState;

    if (currentState === 'lecture' || currentState === 'dialogue') {
      if (AC.input) AC.input.setEnabled(false);
    } else if (currentState === 'world') {
      if (AC.input) AC.input.setEnabled(true);
    }

    if (AC.bus && typeof AC.bus.emit === 'function') {
      AC.bus.emit('state', { from: previousState, to: currentState });
    }
  };

  AC.getState = function () {
    return currentState;
  };

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
        AC.setState('world');
        AC.loop.start(
          dt => {
            // Only update world physics/movement when in 'world' state
            if (currentState === 'world') {
              AC.game.update(dt);
            }
          },
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
