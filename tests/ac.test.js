/* ac.test.js: Tests for core AC namespace, util, bus, and rng. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('AC.util.esc sanitizes HTML characters', function () {
    assert.equal(AC.util.esc('Hello & <World> "Test"'), 'Hello &amp; &lt;World&gt; &quot;Test&quot;');
    assert.equal(AC.util.esc('Clean string 123'), 'Clean string 123');
    assert.equal(AC.util.esc(''), '');
  });

  test('AC.util.clamp constrains values within bounds', function () {
    assert.equal(AC.util.clamp(5, 0, 10), 5);
    assert.equal(AC.util.clamp(-5, 0, 10), 0);
    assert.equal(AC.util.clamp(15, 0, 10), 10);
    assert.equal(AC.util.clamp(0, 0, 10), 0);
    assert.equal(AC.util.clamp(10, 0, 10), 10);
  });

  test('AC.bus.on / emit delivers payloads to listeners', function () {
    let received = null;
    const unsub = AC.bus.on('stamp', payload => {
      received = payload;
    });

    AC.bus.emit('stamp', { id: 'str' });
    assert.deepEqual(received, { id: 'str' });

    // Test unsubscribe
    unsub();
    AC.bus.emit('stamp', { id: 'set' });
    assert.deepEqual(received, { id: 'str' }); // Unchanged after unsub
  });

  test('AC.bus.off removes listener', function () {
    let count = 0;
    const handler = () => { count++; };
    AC.bus.on('test-event', handler);
    AC.bus.emit('test-event');
    assert.equal(count, 1);

    AC.bus.off('test-event', handler);
    AC.bus.emit('test-event');
    assert.equal(count, 1);
  });

  test('AC.rng produces deterministic sequence for given seed', function () {
    const rng1 = AC.rng(42);
    const rng2 = AC.rng(42);

    const seq1 = [rng1(), rng1(), rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2(), rng2(), rng2()];

    assert.equal(seq1.length, 5);
    for (let i = 0; i < 5; i++) {
      assert(seq1[i] >= 0 && seq1[i] < 1, `Value ${seq1[i]} must be in [0, 1)`);
      assert.equal(seq1[i], seq2[i], `Item ${i} must match between identical seeds`);
    }

    // Different seed should produce different sequence
    const rng3 = AC.rng(999);
    const seq3 = [rng3(), rng3(), rng3(), rng3(), rng3()];
    assert(seq1[0] !== seq3[0], 'Different seeds should produce different numbers');
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
