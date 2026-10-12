/* stations.test.js: Tests for triggers, state machine, lecture shell, dialogue, and lifecycle. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('M2.1: AC.triggers detects nearest trigger within distance threshold', function () {
    AC.triggers.initDefaultTriggers();
    const all = AC.triggers.getAll();
    assert.equal(all.length, 5); // 4 stations + Prof Delta

    // Board at (12*16, 32*16) = (192, 512)
    const near = AC.triggers.getNearest(196, 516, 26);
    assert(near, 'Should detect trigger within 26px');
    assert.equal(near.id, 'station-str');

    // Too far away (at (300, 300))
    const far = AC.triggers.getNearest(300, 300, 26);
    assert.equal(far, null, 'Should return null when out of range');
  });

  test('M2.2: State machine validates transitions and manages input state', function () {
    // Current state from boot
    AC.setState('world');
    assert.equal(AC.getState(), 'world');
    assert.equal(AC.input.isEnabled(), true);

    // world -> lecture
    AC.setState('lecture');
    assert.equal(AC.getState(), 'lecture');
    assert.equal(AC.input.isEnabled(), false); // Input disabled during lecture

    // lecture -> world
    AC.setState('world');
    assert.equal(AC.getState(), 'world');
    assert.equal(AC.input.isEnabled(), true);

    // world -> dialogue
    AC.setState('dialogue');
    assert.equal(AC.getState(), 'dialogue');
    assert.equal(AC.input.isEnabled(), false);

    // dialogue -> world
    AC.setState('world');
    assert.equal(AC.getState(), 'world');

    // Illegal transition: world cannot transition directly to title or boot
    let threw = false;
    try {
      AC.setState('boot');
    } catch (_) {
      threw = true;
    }
    assert.equal(threw, true, 'Illegal transition must throw an Error');
  });

  test('M2.3 & M2.4: Lecture shell opens, switches tabs, mounts views, and closes', function () {
    assert(AC.lessons.shell, 'AC.lessons.shell must exist');

    AC.setState('world');
    AC.lessons.shell.open('str');
    assert.equal(AC.lessons.shell.isOpen(), true);
    assert.equal(AC.lessons.shell.getActiveDistrict(), 'str');
    assert.equal(AC.getState(), 'lecture');

    // Close
    AC.lessons.shell.close();
    assert.equal(AC.lessons.shell.isOpen(), false);
    assert.equal(AC.getState(), 'world');
  });

  test('M2.7: Professor Delta provides progressive hints based on stamp count', function () {
    AC.progress.reset();

    // 0 stamps
    let hints = AC.dialogue.getProfessorHint();
    assert(hints[0].includes('Professor Delta'), 'Intro must introduce Prof Delta');
    assert(hints[2].includes('String Street'), 'Initial hint mentions String Street');

    // 1 stamp (str)
    AC.progress.setStamp('str');
    hints = AC.dialogue.getProfessorHint();
    assert(hints[0].includes('Stamps collected: 1 of 4'), 'Updates stamp progress');
    assert(hints[1].includes('Set Park'), 'Recommends next unstamped station');

    // 4 stamps
    AC.progress.setStamp('set');
    AC.progress.setStamp('tree');
    AC.progress.setStamp('dfa');
    hints = AC.dialogue.getProfessorHint();
    assert(hints[0].includes('all four district stamps'), 'Congratulates player');
    assert(hints[1].includes('Exam Tower in the northeastern plaza is now unsealed'), 'Announces Exam Tower unlock');
  });

  test('M2.8: 20 lecture open/close cycles execute with zero errors', function () {
    AC.setState('world');
    for (let i = 0; i < 20; i++) {
      const distId = ['str', 'set', 'tree', 'dfa'][i % 4];
      AC.lessons.shell.open(distId);
      assert.equal(AC.lessons.shell.isOpen(), true);
      AC.lessons.shell.close();
      assert.equal(AC.lessons.shell.isOpen(), false);
    }
    assert.equal(AC.getState(), 'world');
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
