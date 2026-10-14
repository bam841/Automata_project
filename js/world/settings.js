/* settings.js: Settings dialog (audio, theme, motion, touch, in-UI reset confirmation). */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let modalEl = null;
  let confirmResetMode = false;

  function getModal() {
    if (!modalEl && typeof document !== 'undefined') {
      modalEl = document.getElementById('settings-modal');
    }
    return modalEl;
  }

  function render(host) {
    if (!host) return;

    if (confirmResetMode) {
      host.innerHTML = `
        <div class="settings-card settings-confirm-card">
          <div class="settings-header">
            <h2 class="settings-title" style="color:#ef4444;">⚠️ Reset All Progress?</h2>
            <button class="settings-close-btn" data-act="settings-cancel-reset" aria-label="Cancel">×</button>
          </div>
          <div class="settings-body">
            <p class="settings-danger-msg">
              Are you sure you want to reset all game data?
            </p>
            <ul class="settings-danger-list">
              <li>All 4 district stamps will be erased</li>
              <li>All 12 collected theory shards will be cleared</li>
              <li>Final exam scores and certificate status will be reset</li>
              <li>Player name and custom sprite choice will be cleared</li>
            </ul>
            <p class="settings-warning-note">This action cannot be undone.</p>
          </div>
          <div class="settings-footer">
            <button class="btn btn-danger" data-act="settings-confirm-reset">Yes, Reset Everything</button>
            <button class="btn btn-secondary" data-act="settings-cancel-reset">Cancel</button>
          </div>
        </div>
      `;
      return;
    }

    const progress = AC.progress ? AC.progress.get() : {};
    const settings = progress.settings || {};
    const isMuted = AC.audio ? AC.audio.isMuted() : !!settings.muted;
    const atmoMode = AC.atmosphere ? AC.atmosphere.getMode() : (settings.theme || 'auto');
    const motion = settings.reducedMotion || 'auto';

    host.innerHTML = `
      <div class="settings-card">
        <div class="settings-header">
          <h2 class="settings-title">⚙️ Game Settings</h2>
          <button class="settings-close-btn" data-act="settings-close" aria-label="Close dialog">×</button>
        </div>
        <div class="settings-body">
          <!-- Audio Section -->
          <div class="settings-row">
            <div class="setting-info">
              <span class="setting-label">Sound Effects</span>
              <span class="setting-sub">WebAudio synthesized sound cues</span>
            </div>
            <button class="btn ${isMuted ? 'btn-secondary' : 'btn-primary'}" data-act="toggle-mute">
              ${isMuted ? '🔇 Muted' : '🔊 Sound On'}
            </button>
          </div>

          <!-- Lighting / Theme -->
          <div class="settings-row">
            <div class="setting-info">
              <span class="setting-label">Atmosphere / Lighting</span>
              <span class="setting-sub">Day / Night world cycle [T]</span>
            </div>
            <div class="btn-group" role="group">
              <button class="btn btn-sm ${atmoMode === 'auto' ? 'btn-active' : ''}" data-act="set-theme" data-val="auto">Auto</button>
              <button class="btn btn-sm ${atmoMode === 'day' ? 'btn-active' : ''}" data-act="set-theme" data-val="day">Day</button>
              <button class="btn btn-sm ${atmoMode === 'night' ? 'btn-active' : ''}" data-act="set-theme" data-val="night">Night</button>
            </div>
          </div>

          <!-- Reduced Motion -->
          <div class="settings-row">
            <div class="setting-info">
              <span class="setting-label">Reduced Motion</span>
              <span class="setting-sub">Disables ambient floating and screen shake</span>
            </div>
            <div class="btn-group" role="group">
              <button class="btn btn-sm ${motion === 'auto' ? 'btn-active' : ''}" data-act="set-motion" data-val="auto">Auto</button>
              <button class="btn btn-sm ${motion === 'reduced' ? 'btn-active' : ''}" data-act="set-motion" data-val="reduced">On</button>
              <button class="btn btn-sm ${motion === 'normal' ? 'btn-active' : ''}" data-act="set-motion" data-val="normal">Off</button>
            </div>
          </div>

          <!-- Controls Reference -->
          <div class="settings-section">
            <h4 class="settings-section-title">Keyboard & Touch Controls</h4>
            <div class="controls-grid">
              <div class="ctrl-item"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or <kbd>Arrows</kbd> <span>Move Player</span></div>
              <div class="ctrl-item"><kbd>E</kbd> <span>Interact / Talk / Enter Board</span></div>
              <div class="ctrl-item"><kbd>J</kbd> <span>Theory Journal (12 Shards)</span></div>
              <div class="ctrl-item"><kbd>H</kbd> <span>Companion Eps Hint</span></div>
              <div class="ctrl-item"><kbd>T</kbd> <span>Toggle Day / Night</span></div>
              <div class="ctrl-item"><kbd>O</kbd> <span>Settings Menu</span></div>
              <div class="ctrl-item"><kbd>Esc</kbd> <span>Close Dialog / Menu</span></div>
              <div class="ctrl-item"><kbd>F3</kbd> <span>Debug Overlay</span></div>
            </div>
          </div>

          <!-- Mode switch & Reset -->
          <div class="settings-section">
            <h4 class="settings-section-title">Navigation & Data</h4>
            <div class="settings-nav-btns">
              <button class="btn btn-secondary" data-act="switch-classic">Switch to Classic Card Mode</button>
              <button class="btn btn-danger-outline" data-act="settings-ask-reset">Reset All Progress...</button>
            </div>
          </div>
        </div>
        <div class="settings-footer">
          <button class="btn btn-primary" data-act="settings-close">Done</button>
        </div>
      </div>
    `;
  }

  AC.settings = {
    isOpen() {
      const modal = getModal();
      return modal && modal.classList.contains('active');
    },

    open() {
      const modal = getModal();
      if (!modal) return;

      confirmResetMode = false;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');

      if (AC.setState) {
        AC.setState('settings');
      }

      if (AC.audio) AC.audio.play('open');
      render(modal);
    },

    close() {
      const modal = getModal();
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = '';
      }
      confirmResetMode = false;
      if (AC.audio) AC.audio.play('close');
      if (AC.setState) {
        AC.setState('world');
      }
      const canvas = document.getElementById('game');
      if (canvas) canvas.focus();
    },

    toggleMute() {
      if (AC.audio) {
        AC.audio.toggleMute();
      }
      render(getModal());
    },

    setTheme(val) {
      if (AC.atmosphere && typeof AC.atmosphere.setMode === 'function') {
        AC.atmosphere.setMode(val);
      }
      if (AC.progress) {
        const p = AC.progress.get();
        p.settings = p.settings || {};
        p.settings.theme = val;
        AC.progress.save();
      }
      render(getModal());
    },

    setMotion(val) {
      if (AC.progress) {
        const p = AC.progress.get();
        p.settings = p.settings || {};
        p.settings.reducedMotion = val;
        AC.progress.save();
      }
      if (typeof document !== 'undefined' && document.documentElement) {
        if (val === 'reduced') {
          document.documentElement.classList.add('reduced-motion');
        } else if (val === 'normal') {
          document.documentElement.classList.remove('reduced-motion');
        }
      }
      render(getModal());
    },

    askReset() {
      confirmResetMode = true;
      render(getModal());
    },

    cancelReset() {
      confirmResetMode = false;
      render(getModal());
    },

    confirmReset() {
      if (AC.progress) {
        AC.progress.reset();
      }
      this.close();
      if (AC.title && typeof AC.title.show === 'function') {
        AC.title.show();
      } else if (AC.setState) {
        AC.setState('title');
      }
    },

    initEvents() {
      const modal = getModal();
      if (!modal) return;

      modal.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;

        const act = btn.getAttribute('data-act');
        if (act === 'settings-close') {
          this.close();
        } else if (act === 'toggle-mute') {
          this.toggleMute();
        } else if (act === 'set-theme') {
          this.setTheme(btn.getAttribute('data-val'));
        } else if (act === 'set-motion') {
          this.setMotion(btn.getAttribute('data-val'));
        } else if (act === 'switch-classic') {
          this.close();
          if (AC.setMode) AC.setMode('classic');
        } else if (act === 'settings-ask-reset') {
          this.askReset();
        } else if (act === 'settings-cancel-reset') {
          this.cancelReset();
        } else if (act === 'settings-confirm-reset') {
          this.confirmReset();
        }
      });

      const quickBtn = document.getElementById('quick-settings-btn');
      if (quickBtn) {
        quickBtn.addEventListener('click', () => this.open());
      }
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => AC.settings.initEvents());
    } else {
      AC.settings.initEvents();
    }
  }

})(typeof globalThis !== 'undefined' ? globalThis : window);
