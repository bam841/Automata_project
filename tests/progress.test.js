/* progress.test.js: Tests for AC.progress persistence and corruption fallback. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  // Mock localStorage for Node environment
  const mockStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };
  root.localStorage = mockStorage;

  test('AC.progress resets and returns valid default schema', function () {
    mockStorage.clear();
    const state = AC.progress.reset();
    assert.equal(state.v, 1);
    assert.equal(state.name, '');
    assert.deepEqual(state.stamps, { str: false, set: false, tree: false, dfa: false });
    assert.equal(state.shards.length, 0);
    assert.equal(state.player.tx, 32);
    assert.equal(state.player.ty, 34);
    assert.equal(AC.progress.stampCount(), 0);
  });

  test('AC.progress.setStamp updates state, persists, and emits bus event', function () {
    mockStorage.clear();
    AC.progress.reset();

    let emitted = null;
    const unsub = AC.bus.on('stamp', p => { emitted = p; });

    AC.progress.setStamp('str');
    assert.equal(AC.progress.hasStamp('str'), true);
    assert.equal(AC.progress.hasStamp('set'), false);
    assert.equal(AC.progress.stampCount(), 1);
    assert.deepEqual(emitted, { id: 'str' });

    // Verify localStorage has persisted JSON
    const stored = JSON.parse(mockStorage.getItem('automataCity.v1'));
    assert.equal(stored.stamps.str, true);

    unsub();
  });

  test('AC.progress.addShard adds unique shards and emits bus event', function () {
    mockStorage.clear();
    AC.progress.reset();

    let emitted = null;
    const unsub = AC.bus.on('shard', p => { emitted = p; });

    AC.progress.addShard('epsilon');
    assert.equal(AC.progress.hasShard('epsilon'), true);
    assert.deepEqual(emitted, { id: 'epsilon' });

    // Duplicate add should be ignored
    emitted = null;
    AC.progress.addShard('epsilon');
    assert.equal(emitted, null);

    unsub();
  });

  test('AC.progress recovers gracefully from corrupt storage data without throwing', function () {
    mockStorage.setItem('automataCity.v1', '{corrupt json!!!');
    const state = AC.progress.load();
    assert.equal(state.v, 1);
    assert.equal(state.stamps.str, false);
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
