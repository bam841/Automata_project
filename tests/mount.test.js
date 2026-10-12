/* mount.test.js: Verifies mount/unmount lifecycle and listener leak prevention. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  // Tiny mock DOM node for testing listener additions/removals in Node
  function createMockHost() {
    let added = 0;
    let removed = 0;
    const listeners = [];

    return {
      innerHTML: '',
      addEventListener(type, fn) {
        added++;
        listeners.push({ type, fn });
      },
      removeEventListener(type, fn) {
        removed++;
        const idx = listeners.findIndex(l => l.type === type && l.fn === fn);
        if (idx !== -1) listeners.splice(idx, 1);
      },
      querySelector(sel) { return null; },
      querySelectorAll(sel) { return []; },
      get listenerBalance() { return added - removed; },
      get activeListeners() { return listeners.length; }
    };
  }

  const districts = ['str', 'set', 'tree', 'dfa'];

  for (const id of districts) {
    test(`AC.lessons.${id} mounts and unmounts twice with zero listener leaks`, function () {
      const lesson = AC.lessons[id];
      assert(lesson, `Lesson ${id} must be defined`);
      assert(lesson.practice, `Lesson ${id}.practice must be defined`);

      const host = createMockHost();
      const ctx = {
        onStamp() {},
        close() {},
        rng: AC.rng(42)
      };

      // Cycle 1: Mount
      lesson.practice.mount(host, ctx);
      assert(host.innerHTML.length > 0, `${id} should populate host.innerHTML`);

      // Cycle 1: Unmount
      lesson.practice.unmount();
      assert.equal(host.activeListeners, 0, `${id} must have 0 active listeners after unmount`);
      assert.equal(host.listenerBalance, 0, `${id} addEventListener must equal removeEventListener`);

      // Cycle 2: Mount again
      lesson.practice.mount(host, ctx);
      assert(host.innerHTML.length > 0, `${id} should populate host.innerHTML on second mount`);

      // Cycle 2: Unmount again
      lesson.practice.unmount();
      assert.equal(host.activeListeners, 0, `${id} must have 0 active listeners after second unmount`);
      assert.equal(host.listenerBalance, 0, `${id} addEventListener must equal removeEventListener on second unmount`);
      assert.equal(host.innerHTML, '', `${id} host.innerHTML must be cleared after unmount`);
    });
  }

})(typeof globalThis !== 'undefined' ? globalThis : window);
