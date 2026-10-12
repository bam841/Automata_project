/* title.js: Title screen, character customization, and save manager. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let titleHost = null;
  let selectedSprite = 0;

  const SPRITE_OPTIONS = [
    { id: 0, name: 'Azure Scholar', color: '#38bdf8' },
    { id: 1, name: 'Emerald Scout', color: '#4ade80' },
    { id: 2, name: 'Amber Mechanist', color: '#fbbf24' },
    { id: 3, name: 'Violet Alchemist', color: '#c084fc' }
  ];

  function getTitleEl() {
    if (titleHost) return titleHost;
    if (typeof document === 'undefined') return null;

    let el = document.getElementById('title-screen');
    if (!el) {
      el = document.createElement('div');
      el.id = 'title-screen';
      el.className = 'title-overlay';
      el.hidden = true;
      document.body.appendChild(el);
    }
    titleHost = el;
    return titleHost;
  }

  AC.title = {
    show() {
      const el = getTitleEl();
      if (!el) return;

      if (AC.setState && AC.getState() !== 'title') {
        AC.setState('title');
      }

      const p = AC.progress ? AC.progress.get() : {};
      const savedName = p.name || 'Student';
      selectedSprite = typeof p.sprite === 'number' ? p.sprite : 0;
      const hasSave = AC.progress && (AC.progress.stampCount() > 0 || (p.shards && p.shards.length > 0));

      let spritePicks = '';
      SPRITE_OPTIONS.forEach(s => {
        const active = s.id === selectedSprite ? 'active' : '';
        spritePicks += `
          <button class="sprite-opt-btn ${active}" data-act="pick-sprite" data-sprite="${s.id}" style="--spr-color: ${s.color};">
            <span class="sprite-swatch" style="background: ${s.color};"></span>
            <span class="sprite-label">${s.name}</span>
          </button>
        `;
      });

      el.innerHTML = `
        <div class="title-card">
          <div class="title-logo-badge">🎓 FORMAL LANGUAGES & AUTOMATA</div>
          <h1 class="title-heading">AUTOMATA CITY</h1>
          <p class="title-tagline">An Open-World Theory Adventure</p>

          <div class="title-form">
            <label class="title-input-label">
              Student Name:
              <input type="text" id="player-name-input" maxlength="12" value="${AC.util.esc(savedName)}" placeholder="Your Name" />
            </label>

            <div class="title-sprite-picker">
              <span class="title-input-label">Select Character:</span>
              <div class="sprite-options-grid">${spritePicks}</div>
            </div>

            <div class="title-actions">
              <button class="pri btn-large" data-act="start-game">${hasSave ? '▶ Continue Journey' : '▶ Begin Journey'}</button>
              ${hasSave ? '<button class="sec" data-act="reset-save">Reset Progress</button>' : ''}
              <button class="sec" data-act="switch-classic">Switch to Classic Mode</button>
            </div>
          </div>
        </div>
      `;

      el.hidden = false;

      el.addEventListener('click', e => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const act = btn.dataset.act;

        if (act === 'pick-sprite') {
          selectedSprite = parseInt(btn.dataset.sprite, 10);
          el.querySelectorAll('.sprite-opt-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (AC.audio) AC.audio.play('select');
        } else if (act === 'start-game') {
          const input = el.querySelector('#player-name-input');
          const name = input ? input.value.trim().slice(0, 12) : 'Student';
          if (AC.progress) {
            const cur = AC.progress.get();
            cur.name = name || 'Student';
            cur.sprite = selectedSprite;
            AC.progress.save();
          }
          if (AC.audio) AC.audio.play('open');
          this.hide();
          if (AC.setState) AC.setState('world');
        } else if (act === 'reset-save') {
          if (AC.progress) AC.progress.reset();
          this.show();
        } else if (act === 'switch-classic') {
          this.hide();
          if (AC.main && typeof AC.main.setMode === 'function') {
            AC.main.setMode('classic');
          }
        }
      });
    },

    hide() {
      const el = getTitleEl();
      if (!el) return;
      el.hidden = true;
      el.innerHTML = '';
    },

    isOpen() {
      return titleHost ? !titleHost.hidden : false;
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
