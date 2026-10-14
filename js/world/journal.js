/* journal.js: In-game Journal modal displaying 12 collectible symbol shards and theory definitions. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let journalEl = null;
  let isOpen = false;
  let previousFocus = null;

  function getJournalEl() {
    if (journalEl) return journalEl;
    if (typeof document === 'undefined') return null;

    let el = document.getElementById('journal-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'journal-modal';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-labelledby', 'journal-title');
      el.hidden = true;
      document.body.appendChild(el);
    }
    journalEl = el;
    return journalEl;
  }

  function renderCards() {
    const el = getJournalEl();
    if (!el) return;

    const allShards = AC.shards ? AC.shards.getAll() : [];
    const collectedCount = AC.progress ? AC.progress.get().shards.length : 0;

    const districtColors = {
      str: '#e0663f',
      set: '#1f9d8a',
      tree: '#4c8c3a',
      dfa: '#6f55e0'
    };

    const districtNames = {
      str: 'String Street',
      set: 'Set Park',
      tree: 'Tree Forest',
      dfa: 'DFA Station'
    };

    let cardsHtml = '';
    for (const s of allShards) {
      const isCollected = AC.progress ? AC.progress.hasShard(s.id) : false;
      const color = districtColors[s.district] || '#7aa7ff';

      if (isCollected) {
        cardsHtml += `
          <div class="journal-card collected" style="--card-accent: ${color};">
            <div class="journal-symbol">${AC.util.esc(s.symbol)}</div>
            <div class="journal-name">${AC.util.esc(s.name)}</div>
            <div class="journal-district" style="color: ${color};">${districtNames[s.district]}</div>
            <div class="journal-def">${AC.util.esc(s.definition)}</div>
          </div>
        `;
      } else {
        cardsHtml += `
          <div class="journal-card locked">
            <div class="journal-symbol">?</div>
            <div class="journal-name">Undiscovered</div>
            <div class="journal-district" style="color: ${color};">${districtNames[s.district]}</div>
            <div class="journal-def">Search ${districtNames[s.district]} to reveal this theory shard.</div>
          </div>
        `;
      }
    }

    el.innerHTML = `
      <div class="journal-dialog">
        <div class="journal-header">
          <div>
            <h2 id="journal-title">Theory Journal</h2>
            <span class="journal-counter">Shards Discovered: ${collectedCount} of 12</span>
          </div>
          <button class="journal-close-btn" data-act="close-journal" aria-label="Close Journal">✕</button>
        </div>
        <div class="journal-grid">
          ${cardsHtml}
        </div>
        <div class="journal-footer">
          <small>Press [J] or [Esc] to return to Automata City</small>
        </div>
      </div>
    `;

    const closeBtn = el.querySelector('[data-act="close-journal"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => AC.journal.close());
    }
  }

  function handleKeydown(e) {
    if (!isOpen) return;
    if (e.key === 'Escape' || e.key === 'j' || e.key === 'J') {
      e.preventDefault();
      AC.journal.close();
    }
  }

  AC.journal = {
    open() {
      const el = getJournalEl();
      if (!el) return;

      isOpen = true;
      previousFocus = typeof document !== 'undefined' ? document.activeElement : null;

      if (AC.setState && AC.getState() === 'world') {
        AC.setState('dialogue'); // Pauses world input
      }

      renderCards();
      el.hidden = false;

      if (typeof root.addEventListener !== 'undefined') {
        root.addEventListener('keydown', handleKeydown);
      }

      if (AC.audio && typeof AC.audio.play === 'function') {
        AC.audio.play('open');
      }

      const closeBtn = el.querySelector('[data-act="close-journal"]');
      if (closeBtn) closeBtn.focus();
    },

    close() {
      const el = getJournalEl();
      if (!el || !isOpen) return;

      isOpen = false;
      el.hidden = true;
      el.innerHTML = '';

      if (typeof root.removeEventListener !== 'undefined') {
        root.removeEventListener('keydown', handleKeydown);
      }

      if (AC.setState && AC.getState() === 'dialogue') {
        AC.setState('world');
      }

      if (AC.audio && typeof AC.audio.play === 'function') {
        AC.audio.play('close');
      }

      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    },

    toggle() {
      if (isOpen) this.close();
      else this.open();
    },

    isOpen() {
      return isOpen;
    }
  };

  // Keyboard shortcut J in world
  if (typeof root.addEventListener !== 'undefined') {
    root.addEventListener('keydown', e => {
      if (e.key === 'j' || e.key === 'J') {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (AC.getState && AC.getState() === 'world') {
          e.preventDefault();
          AC.journal.open();
        }
      }
    });
  }

})(typeof globalThis !== 'undefined' ? globalThis : window);
