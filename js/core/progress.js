/* progress.js: Manages persistent player progress, stamps, shards, and settings in localStorage. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  const STORAGE_KEY = 'automataCity.v1';

  function defaultState() {
    return {
      v: 1,
      name: '',
      sprite: 0,
      stamps: { str: false, set: false, tree: false, dfa: false },
      lessons: { str: false, set: false, tree: false, dfa: false },
      items: [],
      shards: [],
      exam: { passed: false, best: 0 },
      player: { tx: 32, ty: 34 },
      settings: { muted: false, theme: 'auto', reducedMotion: 'auto' }
    };
  }

  let state = defaultState();

  function getStorage() {
    try {
      if (typeof root.localStorage !== 'undefined') {
        return root.localStorage;
      }
    } catch (_) {}
    return null;
  }

  AC.progress = {
    load() {
      const storage = getStorage();
      if (!storage) {
        state = defaultState();
        return state;
      }
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) {
          state = defaultState();
          return state;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.v !== 1) {
          state = defaultState();
          return state;
        }
        state = {
          v: 1,
          name: typeof parsed.name === 'string' ? parsed.name : '',
          sprite: typeof parsed.sprite === 'number' ? parsed.sprite : 0,
          stamps: Object.assign({ str: false, set: false, tree: false, dfa: false }, parsed.stamps),
          lessons: Object.assign({ str: false, set: false, tree: false, dfa: false }, parsed.lessons),
          items: Array.isArray(parsed.items) ? [...parsed.items] : [],
          shards: Array.isArray(parsed.shards) ? [...parsed.shards] : [],
          exam: Object.assign({ passed: false, best: 0 }, parsed.exam),
          player: Object.assign({ tx: 32, ty: 34 }, parsed.player),
          settings: Object.assign({ muted: false, theme: 'auto', reducedMotion: 'auto' }, parsed.settings)
        };
      } catch (_) {
        state = defaultState();
      }
      return state;
    },

    save() {
      const storage = getStorage();
      if (!storage) return;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (_) {}
    },

    reset() {
      state = defaultState();
      this.save();
      return state;
    },

    get() {
      return state;
    },

    setStamp(id) {
      if (typeof state.stamps[id] !== 'undefined') {
        state.stamps[id] = true;
        this.save();
        if (AC.bus && typeof AC.bus.emit === 'function') {
          AC.bus.emit('stamp', { id });
        }
      }
    },

    hasStamp(id) {
      return Boolean(state.stamps[id]);
    },

    stampCount() {
      return Object.values(state.stamps).filter(Boolean).length;
    },

    addShard(id) {
      if (!state.shards.includes(id)) {
        state.shards.push(id);
        this.save();
        if (AC.bus && typeof AC.bus.emit === 'function') {
          AC.bus.emit('shard', { id });
        }
      }
    },

    hasShard(id) {
      return state.shards.includes(id);
    },

    addItem(id) {
      if (!state.items) state.items = [];
      if (!state.items.includes(id)) {
        state.items.push(id);
        this.save();
        if (AC.bus && typeof AC.bus.emit === 'function') {
          AC.bus.emit('item:collected', { id });
        }
      }
    },

    hasItem(id) {
      return Boolean(state.items && state.items.includes(id));
    },

    isGateUnlocked(districtId) {
      if (this.hasStamp(districtId)) return true;
      return this.hasItem(districtId) || this.hasItem('quest-' + districtId);
    },

    unlockAllGates() {
      if (!state.items) state.items = [];
      const districts = ['str', 'set', 'tree', 'dfa'];
      for (const d of districts) {
        if (!state.items.includes(d)) state.items.push(d);
      }
      this.save();
      if (AC.bus && typeof AC.bus.emit === 'function') {
        AC.bus.emit('gates:unlocked_all');
      }
    },

    setLessonSeen(id) {
      if (!state.lessons) state.lessons = { str: false, set: false, tree: false, dfa: false };
      if (typeof state.lessons[id] !== 'undefined') {
        state.lessons[id] = true;
        this.save();
        if (AC.bus && typeof AC.bus.emit === 'function') {
          AC.bus.emit('lesson:seen', { id });
        }
      }
    },

    hasSeenLesson(id) {
      return state.lessons ? Boolean(state.lessons[id]) : false;
    }
  };

  // Initial load
  AC.progress.load();

})(typeof globalThis !== 'undefined' ? globalThis : window);
