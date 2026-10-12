/* input.js: Keyboard & touch input manager with normalized movement and form field protection. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  const KEY_MAP = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    KeyE: 'interact',
    Space: 'interact',
    Enter: 'interact',
    Escape: 'cancel',
    KeyM: 'map',
    KeyJ: 'journal',
    KeyU: 'mute',
    KeyH: 'hint',
    F3: 'debug'
  };

  const downState = Object.create(null);
  const pressedQueue = Object.create(null);
  let isEnabled = true;

  function isFormFocused() {
    if (typeof document === 'undefined') return false;
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || active.isContentEditable;
  }

  function handleKeyDown(e) {
    if (isFormFocused()) return;
    const action = KEY_MAP[e.code];
    if (!action) return;

    if (action === 'debug' || action === 'up' || action === 'down' || action === 'left' || action === 'right') {
      if (e.cancelable && !isFormFocused()) {
        // Prevent scrolling with arrows/space
        if (action !== 'debug') e.preventDefault();
      }
    }

    if (!downState[action]) {
      pressedQueue[action] = true;
    }
    downState[action] = true;
  }

  function handleKeyUp(e) {
    const action = KEY_MAP[e.code];
    if (!action) return;
    downState[action] = false;
  }

  if (typeof root.addEventListener !== 'undefined') {
    root.addEventListener('keydown', handleKeyDown);
    root.addEventListener('keyup', handleKeyUp);
  }

  AC.input = {
    isDown(action) {
      if (!isEnabled) return false;
      return Boolean(downState[action]);
    },

    pressed(action) {
      if (!isEnabled) return false;
      if (pressedQueue[action]) {
        pressedQueue[action] = false;
        return true;
      }
      return false;
    },

    clearPressed() {
      for (const k of Object.keys(pressedQueue)) {
        pressedQueue[k] = false;
      }
    },

    setEnabled(enabled) {
      isEnabled = Boolean(enabled);
      if (!isEnabled) {
        for (const k of Object.keys(downState)) {
          downState[k] = false;
        }
        this.clearPressed();
      }
    },

    isEnabled() {
      return isEnabled;
    },

    /**
     * Returns normalized movement vector { dx, dy } where magnitude <= 1.0.
     */
    getVector() {
      if (!isEnabled) return { dx: 0, dy: 0 };

      let x = 0;
      let y = 0;

      if (this.isDown('left')) x -= 1;
      if (this.isDown('right')) x += 1;
      if (this.isDown('up')) y -= 1;
      if (this.isDown('down')) y += 1;

      if (x !== 0 && y !== 0) {
        // Diagonal normalization: 1 / sqrt(2) ≈ 0.70710678
        const inv = 0.7071067811865475;
        return { dx: x * inv, dy: y * inv };
      }

      return { dx: x, dy: y };
    },

    // Synthetic injection for testing
    _setDown(action, isDown) {
      if (isDown && !downState[action]) {
        pressedQueue[action] = true;
      }
      downState[action] = Boolean(isDown);
    },

    bindTouch(el) {
      // Touch / virtual joystick stub for M6 mobile controls
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
