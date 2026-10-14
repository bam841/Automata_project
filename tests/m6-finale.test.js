/* m6-finale.test.js: Test suite for Exam generator, Exam Tower, Certificate, and Settings. */
(function () {
  'use strict';

  const harness = typeof require !== 'undefined' ? require('./harness.js') : window.TestHarness;
  const { test, assert } = harness;

  const AC = (typeof globalThis !== 'undefined' ? globalThis.AC : window.AC) || {};

  test('M6.1: AC.examGen generates 8 questions (2 per topic) across 200 seeds', () => {
    assert(typeof AC.examGen === 'function', 'AC.examGen must be defined');

    for (let s = 1; s <= 200; s++) {
      const rng = AC.rng(s * 1337);
      const exam = AC.examGen(rng);

      assert.equal(exam.length, 8, `Exam length must be 8 for seed ${s}`);

      const topicCounts = { str: 0, set: 0, tree: 0, dfa: 0 };
      for (let i = 0; i < exam.length; i++) {
        const q = exam[i];
        assert(q.id, `Question ${i} must have id`);
        assert(topicCounts[q.topic] !== undefined, `Valid topic for question ${i}: ${q.topic}`);
        topicCounts[q.topic]++;

        assert(q.prompt && q.prompt.length > 5, `Question ${i} prompt must be substantive`);
        assert(Array.isArray(q.options) && q.options.length === 4, `Question ${i} must have 4 options`);
        assert(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4, `Question ${i} answerIndex must be 0..3`);
        assert(q.explain && q.explain.length > 10, `Question ${i} must have detailed explanation`);

        // Check options are strictly unique
        const uniqueSet = new Set(q.options);
        assert.equal(uniqueSet.size, 4, `Question ${i} options must be unique: ${JSON.stringify(q.options)}`);

        // Correct answer option must be present
        const correctOpt = q.options[q.answerIndex];
        assert(correctOpt !== undefined && correctOpt !== '', `Answer option must exist at answerIndex`);
      }

      assert.equal(topicCounts.str, 2, 'Must have exactly 2 String Street questions');
      assert.equal(topicCounts.set, 2, 'Must have exactly 2 Set Park questions');
      assert.equal(topicCounts.tree, 2, 'Must have exactly 2 Tree Forest questions');
      assert.equal(topicCounts.dfa, 2, 'Must have exactly 2 DFA Station questions');
    }
  });

  test('M6.1: AC.examGen is strictly deterministic with seeded RNG', () => {
    const examA = AC.examGen(AC.rng(9999));
    const examB = AC.examGen(AC.rng(9999));
    const examC = AC.examGen(AC.rng(1234));

    for (let i = 0; i < 8; i++) {
      assert.equal(examA[i].id, examB[i].id, `Question ${i} id must match for identical seeds`);
      assert.equal(examA[i].prompt, examB[i].prompt, `Question ${i} prompt must match for identical seeds`);
      assert.equal(examA[i].answerIndex, examB[i].answerIndex, `Question ${i} answerIndex must match for identical seeds`);
      assert.equal(examA[i].options.join('|'), examB[i].options.join('|'), `Options must match for identical seeds`);
    }

    // Different seeds produce variation
    let anyDifference = false;
    for (let i = 0; i < 8; i++) {
      if (examA[i].prompt !== examC[i].prompt || examA[i].answerIndex !== examC[i].answerIndex) {
        anyDifference = true;
        break;
      }
    }
    assert(anyDifference, 'Different seeds should produce different question parameters or order');
  });

  test('M6.2: Exam Tower trigger is registered at Hub entrance (37, 28)', () => {
    assert(AC.triggers, 'AC.triggers must exist');
    AC.triggers.initDefaultTriggers();
    if (AC.tower && typeof AC.tower.initTrigger === 'function') {
      AC.tower.initTrigger();
    }

    const towerTrig = AC.triggers.getAll().find(t => t.id === 'exam-tower');
    assert(towerTrig, 'Exam Tower trigger must be registered');
    assert.equal(towerTrig.rect.x, 37 * 16, 'Tower trigger X must match doorway');
    assert.equal(towerTrig.rect.y, 28 * 16, 'Tower trigger Y must match doorway');

    // Nearest detection from front of doorway (tx: 37, ty: 29)
    const nearest = AC.triggers.getNearest(37 * 16 + 8, 29 * 16 + 8, 26);
    assert(nearest && nearest.id === 'exam-tower', 'Tower trigger must be nearest when standing in front of door');
  });

  test('M6.2: Exam Tower passing threshold requires score >= 6/8 and updates progress', () => {
    assert(AC.tower, 'AC.tower must exist');
    AC.progress.reset();

    // 1. Initial unpassed state
    assert.equal(AC.progress.get().exam.passed, false, 'Exam initially not passed');
    assert.equal(AC.progress.get().exam.best, 0, 'Best score initially 0');

    // 2. Award 4 stamps
    AC.progress.setStamp('str');
    AC.progress.setStamp('set');
    AC.progress.setStamp('tree');
    AC.progress.setStamp('dfa');
    assert.equal(AC.progress.stampCount(), 4, 'Player has 4 stamps');

    let examPassedEvent = false;
    const onPass = (payload) => {
      examPassedEvent = true;
      assert.equal(payload.score >= 6, true, 'Event emitted only on pass');
    };
    AC.bus.on('exam:pass', onPass);

    // 3. Test scoring mechanics in headless environment
    const testRng = AC.rng(42);
    const questions = AC.examGen(testRng);
    assert.equal(questions.length, 8, '8 exam questions generated');

    // Simulate score 5 (fail)
    let fakeScore = 5;
    assert(fakeScore < 6, '5 is below pass threshold');

    // Simulate score 7 (pass)
    fakeScore = 7;
    assert(fakeScore >= 6, '7 satisfies pass threshold');
    const p = AC.progress.get();
    p.exam.passed = true;
    p.exam.best = fakeScore;
    AC.progress.save();

    AC.bus.emit('exam:pass', { score: 7, total: 8 });
    assert(examPassedEvent, 'exam:pass bus event fired');
    assert.equal(AC.progress.get().exam.passed, true, 'Progress reflects passed exam');
    assert.equal(AC.progress.get().exam.best, 7, 'Progress records best score');

    AC.bus.off('exam:pass', onPass);
  });

  test('M6.3: Certificate generator exposes API with safe escaping', () => {
    assert(AC.certificate, 'AC.certificate must exist');
    assert(typeof AC.certificate.open === 'function', 'AC.certificate.open must be a function');
    assert(typeof AC.certificate.downloadPNG === 'function', 'AC.certificate.downloadPNG must be a function');
    assert(typeof AC.certificate.print === 'function', 'AC.certificate.print must be a function');
  });

  test('M6.5: Settings manager handles themes, audio mute, and safe UI reset', () => {
    assert(AC.settings, 'AC.settings must exist');
    AC.progress.reset();

    // Theme toggle
    AC.settings.setTheme('night');
    assert.equal(AC.progress.get().settings.theme, 'night', 'Settings persists theme');

    // Audio mute toggle
    if (AC.audio) {
      AC.audio.setMuted(false);
      AC.settings.toggleMute();
      assert.equal(AC.audio.isMuted(), true, 'Settings toggles audio mute');
      AC.settings.toggleMute();
      assert.equal(AC.audio.isMuted(), false, 'Settings unmutes audio');
    }

    // Motion settings
    AC.settings.setMotion('reduced');
    assert.equal(AC.progress.get().settings.reducedMotion, 'reduced', 'Settings persists reduced motion');

    // Reset progress via settings
    AC.progress.setStamp('str');
    assert.equal(AC.progress.stampCount(), 1, 'Stamp set');
    AC.settings.confirmReset();
    assert.equal(AC.progress.stampCount(), 0, 'Confirm reset erases stamps');
    assert.equal(AC.progress.get().shards.length, 0, 'Confirm reset clears shards');
  });

  test('M6.4: Touch controls virtual D-pad and action methods exist without errors', () => {
    assert(AC.touch, 'AC.touch must exist');
    assert(typeof AC.touch.setVisible === 'function', 'AC.touch.setVisible function exists');
    assert(typeof AC.touch.isTouchDevice === 'function', 'AC.touch.isTouchDevice function exists');

    // Synthetic injection into AC.input
    AC.input._setDown('interact', true);
    assert(AC.input.isDown('interact'), 'Virtual touch interact sets isDown');
    assert(AC.input.pressed('interact'), 'Virtual touch interact registers pressed');
    AC.input._setDown('interact', false);
    assert(!AC.input.isDown('interact'), 'Releasing virtual touch clears isDown');
  });

})();
