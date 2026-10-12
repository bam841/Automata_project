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

  const harness = { test, assert, runAll, tests };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = harness;
  }
  root.AC_TEST = harness;
})(typeof globalThis !== 'undefined' ? globalThis : window);
