/* harness.js: Browser and Node compatible micro test runner. */
(function (root) {
  'use strict';

  const tests = [];

  function assert(condition, message = 'Assertion failed') {
    if (!condition) {
      throw new Error(message);
    }
  }

  assert.equal = function (actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  };

  assert.deepEqual = function (actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error(message || `Expected ${e} but got ${a}`);
    }
  };

  function test(name, fn) {
    tests.push({ name, fn });
  }

  function runAll() {
    let passed = 0;
    let failed = 0;
    const results = [];
    for (const t of tests) {
      try {
        t.fn();
        passed++;
        results.push({ name: t.name, ok: true });
      } catch (err) {
        failed++;
        results.push({ name: t.name, ok: false, error: err });
      }
    }
    return { passed, failed, total: tests.length, results };
  }

  if (typeof document === 'undefined') {
    const elementsById = {};

    function createMockElement(tag) {
      const attrs = {};
      const classes = new Set();
      const listeners = [];
      const children = [];
      let _id = '';
      const el = {
        tagName: (tag || 'div').toUpperCase(),
        hidden: true,
        get id() { return _id; },
        set id(val) {
          _id = String(val);
          if (_id) elementsById[_id] = el;
        },
        innerHTML: '',
        dataset: {},
        classList: {
          add: c => classes.add(c),
          remove: c => classes.delete(c),
          contains: c => classes.has(c)
        },
        setAttribute: (k, v) => {
          attrs[k] = String(v);
          if (k === 'id') {
            _id = String(v);
            elementsById[_id] = el;
          }
        },
        getAttribute: k => attrs[k] || null,
        addEventListener: (t, fn) => listeners.push({ t, fn }),
        removeEventListener: (t, fn) => {
          const idx = listeners.findIndex(l => l.t === t && l.fn === fn);
          if (idx !== -1) listeners.splice(idx, 1);
        },
        appendChild: child => {
          children.push(child);
          if (child && child.id) elementsById[child.id] = child;
          return child;
        },
        querySelector: sel => {
          if (sel === '#lecture-body') return createMockElement('div');
          if (sel === '.lecture-tabs') return createMockElement('div');
          if (sel === '[data-act="close"]') return createMockElement('button');
          if (sel === '[data-tab="practice"]') return createMockElement('button');
          return null;
        },
        querySelectorAll: () => [],
        focus: () => {},
        closest: () => null,
        getContext: () => null
      };
      return el;
    }

    const mockDoc = {
      readyState: 'loading',
      getElementById: id => elementsById[id] || null,
      createElement: tag => createMockElement(tag),
      body: createMockElement('body'),
      activeElement: null,
      addEventListener: () => {},
      removeEventListener: () => {}
    };

    root.document = mockDoc;
  }

  const harness = { test, assert, runAll, tests };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = harness;
  }
  root.AC_TEST = harness;
})(typeof globalThis !== 'undefined' ? globalThis : window);
