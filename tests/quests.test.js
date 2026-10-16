/* quests.test.js: Unit and integration tests for station prerequisite quests, road gates, and item collections. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('Quests: All 4 prerequisite quests are defined with required metadata', function () {
    assert(AC.quests, 'AC.quests module must exist');
    const all = AC.quests.getAll();
    assert.equal(all.length, 4, 'Must have exactly 4 prerequisite quests');

    const expectedIds = ['str', 'set', 'tree', 'dfa'];
    for (const id of expectedIds) {
      const q = AC.quests.get(id);
      assert(q, `Quest for ${id} must exist`);
      assert(q.itemName && q.itemName.length > 0, `Quest ${id} must have an itemName`);
      assert(q.symbol && q.symbol.length > 0, `Quest ${id} must have a symbol`);
      assert(q.color && q.color.startsWith('#'), `Quest ${id} must have a valid color`);
      assert(q.theoryText && q.theoryText.length > 10, `Quest ${id} must have theory explanation`);
      assert(q.gate && q.gate.label, `Quest ${id} must define its gate`);
    }
  });

  test('Quests: All 4 quest resources are located inside Central Hub plaza', function () {
    const all = AC.quests.getAll();
    for (const q of all) {
      // Hub region is x: 24..40, y: 24..40
      assert(q.tx >= 24 && q.tx <= 40, `Item ${q.id} tx=${q.tx} must be within Hub [24..40]`);
      assert(q.ty >= 24 && q.ty <= 40, `Item ${q.id} ty=${q.ty} must be within Hub [24..40]`);
    }
  });

  test('Quests: Locked road gates are solid, and unlocking makes them walkable', function () {
    AC.progress.reset();

    // Verify initial locked state
    for (const q of AC.quests.getAll()) {
      assert.equal(AC.quests.isGateUnlocked(q.id), false, `Gate ${q.id} must initially be locked`);
      const g = q.gate;
      const testTx = g.axis === 'x' ? g.coord : g.min;
      const testTy = g.axis === 'x' ? g.min : g.coord;
      assert.equal(AC.quests.isSolid(testTx, testTy), true, `Gate tile (${testTx}, ${testTy}) must be solid when locked`);
    }

    // Collect String Street resource
    AC.progress.addItem('str');
    assert.equal(AC.progress.hasItem('str'), true);
    assert.equal(AC.quests.isGateUnlocked('str'), true, 'String gate must be unlocked after item collection');

    const strGate = AC.quests.get('str').gate;
    assert.equal(AC.quests.isSolid(strGate.coord, strGate.min), false, 'String gate tile must no longer be solid');

    // Other gates remain solid
    const setGate = AC.quests.get('set').gate;
    assert.equal(AC.quests.isSolid(setGate.coord, setGate.min), true, 'Set gate tile must still be solid');
  });

  test('Quests: Presentation unlockAllGates unlocks all 4 station gates instantly', function () {
    AC.progress.reset();
    assert.equal(AC.quests.isGateUnlocked('tree'), false);
    assert.equal(AC.quests.isGateUnlocked('dfa'), false);

    AC.progress.unlockAllGates();
    for (const q of AC.quests.getAll()) {
      assert.equal(AC.quests.isGateUnlocked(q.id), true, `Gate ${q.id} must be unlocked via unlockAllGates`);
      const g = q.gate;
      const testTx = g.axis === 'x' ? g.coord : g.min;
      const testTy = g.axis === 'x' ? g.min : g.coord;
      assert.equal(AC.quests.isSolid(testTx, testTy), false, 'Tile must be non-solid after unlockAllGates');
    }
  });

  test('Quests: Proximity detection and discovery card display', function () {
    AC.progress.reset();
    const strQuest = AC.quests.get('str');
    const px = strQuest.tx * 16 + 8;
    const py = strQuest.ty * 16 + 8;

    const detected = AC.quests.getNearestItem(px, py, 20);
    assert(detected, 'Should detect nearest quest item in range');
    assert.equal(detected.id, 'str');

    // Show card
    AC.quests.showCard(strQuest);
    const card = AC.quests.getActiveCard();
    assert(card, 'Card must be active');
    assert.equal(card.itemName, strQuest.itemName);
    assert.equal(card.symbol, 'Σ');
    assert(card.timer > 0);

    // Dismiss card
    AC.quests.dismissCard();
    assert.equal(AC.quests.getActiveCard(), null);
  });

  test('Quests: Having a district stamp inherently unlocks its gate', function () {
    AC.progress.reset();
    assert.equal(AC.quests.isGateUnlocked('tree'), false);

    AC.progress.setStamp('tree');
    assert.equal(AC.quests.isGateUnlocked('tree'), true, 'Earning tree stamp must automatically unlock tree gate');
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
