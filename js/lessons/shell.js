/* shell.js: Modal lecture shell with blackboard tabs, focus trap, and view mounting. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  AC.lessons = AC.lessons || {};

  let shellEl = null;
  let activeDistrictId = null;
  let activeTab = 'practice';
  let previousFocus = null;
  let mountedModule = null;

  function getShell() {
    if (shellEl) return shellEl;
    if (typeof document === 'undefined') return null;

    let el = document.getElementById('lecture');
    if (!el) {
      el = document.createElement('div');
      el.id = 'lecture';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-labelledby', 'lecture-title');
      el.hidden = true;
      document.body.appendChild(el);
    }
    shellEl = el;
    return shellEl;
  }

  function mountActiveTab() {
    const el = getShell();
    if (!el || !activeDistrictId) return;

    const bodyEl = el.querySelector('#lecture-body');
    if (!bodyEl) return;

    if (mountedModule && typeof mountedModule.unmount === 'function') {
      mountedModule.unmount();
      mountedModule = null;
    }

    const lesson = AC.lessons[activeDistrictId];
    if (!lesson) return;

    const ctx = {
      onStamp(id) {
        AC.progress.setStamp(id);
      },
      close() {
        AC.lessons.shell.close();
      },
      theme: 'dark',
      reducedMotion: false,
      rng: AC.rng ? AC.rng(Date.now()) : Math.random
    };

    if (activeTab === 'learn') {
      bodyEl.innerHTML = `
        <div class="chalk-board">
          <h3>${lesson.title} — Guided Lesson</h3>
          <p>Full 6–8 step blackboard animations are scheduled for <b>Milestone 3</b>.</p>
          <p>Switch to the <b>Practice</b> or <b>Challenge</b> tab above to interact with the station right now!</p>
          <button class="pri" data-tab-switch="practice">Go to Practice</button>
        </div>
      `;
      const btn = bodyEl.querySelector('[data-tab-switch]');
      if (btn) {
        btn.addEventListener('click', () => switchTab('practice'));
      }
    } else if (activeTab === 'practice') {
      mountedModule = lesson.practice;
      if (mountedModule && typeof mountedModule.mount === 'function') {
        mountedModule.mount(bodyEl, ctx);
      }
    } else if (activeTab === 'challenge') {
      mountedModule = lesson.challenge;
      if (mountedModule && typeof mountedModule.mount === 'function') {
        mountedModule.mount(bodyEl, ctx);
      }
    }
  }

  function switchTab(newTab) {
    activeTab = newTab;
    const el = getShell();
    if (!el) return;

    const tabs = el.querySelectorAll('[role="tab"]');
    for (const t of tabs) {
      const isSelected = t.dataset.tab === newTab;
      t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      if (isSelected) t.classList.add('active');
      else t.classList.remove('active');
    }

    mountActiveTab();
  }

  function handleKeyDown(e) {
    const el = getShell();
    if (!el || el.hidden) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      AC.lessons.shell.close();
      return;
    }

    // Focus Trap
    if (e.key === 'Tab') {
      const focusables = el.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  AC.lessons.shell = {
    open(districtId) {
      const district = AC.getDistrict ? AC.getDistrict(districtId) : null;
      if (!district) return;

      activeDistrictId = districtId;
      activeTab = 'practice';
      previousFocus = typeof document !== 'undefined' ? document.activeElement : null;

      if (AC.setState) {
        AC.setState('lecture');
      }

      const el = getShell();
      if (!el) {
        if (AC.bus && typeof AC.bus.emit === 'function') {
          AC.bus.emit('lecture:open', { id: districtId });
        }
        return;
      }

      const color = district.color || '#2f5fd0';

      el.innerHTML = `
        <div class="lecture-content" style="--district-accent: ${color};">
          <div class="lecture-header">
            <h2 id="lecture-title">${district.name}</h2>
            <div class="lecture-tabs" role="tablist">
              <button role="tab" aria-selected="false" data-tab="learn">Learn</button>
              <button role="tab" aria-selected="true" class="active" data-tab="practice">Practice</button>
              <button role="tab" aria-selected="false" data-tab="challenge">Challenge</button>
            </div>
            <button class="lecture-close-btn" aria-label="Close" data-act="close">✕</button>
          </div>
          <div id="lecture-body" class="lecture-body"></div>
        </div>
      `;

      el.hidden = false;

      // Tab switcher event delegation
      const tabList = el.querySelector('.lecture-tabs');
      if (tabList) {
        tabList.addEventListener('click', e => {
          const btn = e.target.closest('[role="tab"]');
          if (btn) switchTab(btn.dataset.tab);
        });
      }

      // Close button
      const closeBtn = el.querySelector('[data-act="close"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }

      if (typeof root.addEventListener !== 'undefined') {
        root.addEventListener('keydown', handleKeyDown);
      }

      mountActiveTab();

      // Focus first tab
      const practiceTab = el.querySelector('[data-tab="practice"]');
      if (practiceTab) practiceTab.focus();

      if (AC.bus && typeof AC.bus.emit === 'function') {
        AC.bus.emit('lecture:open', { id: districtId });
      }
    },

    close() {
      if (mountedModule && typeof mountedModule.unmount === 'function') {
        mountedModule.unmount();
        mountedModule = null;
      }

      const el = getShell();
      if (el) {
        el.hidden = true;
        el.innerHTML = '';
      }

      if (typeof root.removeEventListener !== 'undefined') {
        root.removeEventListener('keydown', handleKeyDown);
      }

      const closedId = activeDistrictId;
      activeDistrictId = null;

      if (AC.setState) {
        AC.setState('world');
      }

      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }

      if (AC.bus && typeof AC.bus.emit === 'function') {
        AC.bus.emit('lecture:close', { id: closedId });
      }
    },

    isOpen() {
      if (shellEl) return !shellEl.hidden;
      return activeDistrictId !== null;
    },

    getActiveDistrict() {
      return activeDistrictId;
    },

    getActiveTab() {
      return activeTab;
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
