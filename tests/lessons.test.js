/* lessons.test.js: Unit and integration tests for Milestone 3 blackboard lessons, quiz engine, and player. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  // Helper to count words
  function wordCount(str) {
    if (!str || typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  // Helper mock container
  function createMockHost() {
    const listeners = [];
    const elementsById = {};
    const mockHost = {
      innerHTML: '',
      dataset: {},
      addEventListener(t, fn) { listeners.push({ t, fn }); },
      removeEventListener(t, fn) {
        const idx = listeners.findIndex(l => l.t === t && l.fn === fn);
        if (idx !== -1) listeners.splice(idx, 1);
      },
      querySelector(sel) {
        if (sel === '#lesson-board') return createMockHost();
        if (sel === '#lesson-controls') return createMockHost();
        if (sel === '#lesson-canvas-container') return createMockHost();
        return null;
      },
      querySelectorAll() { return []; },
      closest() { return null; },
      focus() {},
      get listenerCount() { return listeners.length; }
    };
    return mockHost;
  }

  // --- M3.4 Content & Word Limit Tests ---
  test('M3.4: All four lessons exist with required step counts within 6–9 steps', function () {
    assert(AC.lessons.data, 'AC.lessons.data must be defined');
    const districts = ['str', 'set', 'tree', 'dfa'];

    const expectedCounts = {
      str: 7,
      set: 9,
      tree: 8,
      dfa: 8
    };

    for (const distId of districts) {
      const lesson = AC.lessons.data[distId];
      assert(lesson, `Lesson ${distId} must be registered`);
      assert(lesson.steps && Array.isArray(lesson.steps), `Lesson ${distId} must have steps array`);

      const count = lesson.steps.length;
      assert(count >= 6 && count <= 9, `Lesson ${distId} step count (${count}) must be in range [6, 9]`);
      assert.equal(count, expectedCounts[distId], `Lesson ${distId} step count matches specification`);
    }
  });

  test('M3.4: Strict word count validation — no step say text exceeds 30 words', function () {
    const districts = ['str', 'set', 'tree', 'dfa'];

    for (const distId of districts) {
      const lesson = AC.lessons.data[distId];
      for (let i = 0; i < lesson.steps.length; i++) {
        const step = lesson.steps[i];
        const words = wordCount(step.say);
        assert(words > 0, `${distId} step ${i + 1} say text must not be empty`);
        assert(
          words <= 30,
          `${distId} step ${i + 1} ("${step.title}") exceeds 30 words: found ${words} words ("${step.say}")`
        );

        const titleWords = wordCount(step.title);
        assert(
          titleWords <= 6,
          `${distId} step ${i + 1} title ("${step.title}") exceeds 6 words: found ${titleWords} words`
        );
      }
    }
  });

  // --- M3.3 Drawing Helpers Tests ---
  test('M3.3: Drawing helpers generate valid markup without errors', function () {
    assert(AC.lessons.drawings, 'AC.lessons.drawings must exist');

    const host = createMockHost();

    // 1. Strings Train
    AC.lessons.drawings.renderStringTrain(host, { w: 'city', cut: 2, v: 'train' });
    assert(host.innerHTML.includes('chalk-train-track'), 'Strings train markup generated');
    assert(host.innerHTML.includes('Cut point k=2'), 'Cut indicator present');

    // 2. Venn Diagram
    AC.lessons.drawings.renderVenn(host, { A: [1, 2, 4], B: [4, 5], highlight: 'union' });
    assert(host.innerHTML.includes('venn-svg'), 'Venn SVG generated');
    assert(host.innerHTML.includes('circle-a'), 'Circle A present');

    // 3. Tree SVG
    AC.lessons.drawings.renderTree(host, { keys: [4, 2, 6, 1, 3, 5, 7], activeNode: 4 });
    assert(host.innerHTML.includes('tree-svg'), 'Tree SVG generated');
    assert(host.innerHTML.includes('node-active'), 'Active node highlighted');

    // 4. DFA SVG
    AC.lessons.drawings.renderDFA(host, {
      machine: AC.dfa.referenceMachines.endsWith01,
      activeState: 2,
      tape: '01',
      isAccepted: true
    });
    assert(host.innerHTML.includes('dfa-svg'), 'DFA SVG generated');
    assert(host.innerHTML.includes('ACCEPT'), 'Accept badge present');
  });

  // --- M3.1 Lesson Player Navigation & Clamping Tests ---
  test('M3.1: Lesson player mounts, navigates steps with strict clamping, and unmounts cleanly', function () {
    const player = AC.lessons.lessonPlayer;
    assert(player, 'AC.lessons.lessonPlayer must exist');

    const host = createMockHost();
    const lesson = AC.lessons.data.str;

    player.mount(host, lesson, { reducedMotion: true });
    assert.equal(player.getStep(), 0, 'Starts at step 0');

    // Clamping below 0
    player.setStep(-5);
    assert.equal(player.getStep(), 0, 'Clamps at step 0');

    // Advance steps
    player.setStep(3);
    assert.equal(player.getStep(), 3, 'Steps to step 3');

    // Clamping above max
    player.setStep(100);
    assert.equal(player.getStep(), lesson.steps.length - 1, 'Clamps at last step');

    // Unmount
    player.unmount();
    assert.equal(player.getStep(), 0, 'Reset on unmount');
  });

  // --- M3.5 Quick Check / Quiz Generator Tests (200 seeds) ---
  test('M3.5: Quick check generator produces unique options and valid answers across 200 seeds', function () {
    assert(AC.quiz, 'AC.quiz must exist');
    const topics = ['str', 'set', 'tree', 'dfa'];

    for (let seed = 1; seed <= 200; seed++) {
      const rng1 = AC.rng(seed);
      const rng2 = AC.rng(seed);

      for (const topic of topics) {
        const questions1 = AC.quiz.generateTopicQuestions(topic, rng1, 3);
        const questions2 = AC.quiz.generateTopicQuestions(topic, rng2, 3);

        assert.equal(questions1.length, 3, 'Always returns 3 questions per topic');

        // Determinism: same seed produces identical questions
        for (let q = 0; q < 3; q++) {
          const q1 = questions1[q];
          const q2 = questions2[q];
          assert.equal(q1.prompt, q2.prompt, `Deterministic prompt for seed ${seed}`);
          assert.equal(q1.answerIndex, q2.answerIndex, `Deterministic answerIndex for seed ${seed}`);

          // Exactly 4 options
          assert.equal(q1.options.length, 4, 'Must have exactly 4 options');

          // Exactly 4 unique options (no duplicates)
          const uniqueSet = new Set(q1.options);
          assert.equal(
            uniqueSet.size,
            4,
            `Seed ${seed} topic ${topic} question "${q1.prompt}" has duplicate options: ${JSON.stringify(q1.options)}`
          );

          // answerIndex within [0..3]
          assert(q1.answerIndex >= 0 && q1.answerIndex < 4, 'answerIndex must be in range [0..3]');

          // Explain text exists
          assert(q1.explain && q1.explain.length > 5, 'Explanation must be present');
        }
      }
    }
  });

  // --- M3.6 Full Integration with Lecture Shell ---
  test('M3.6: Learn tab integrates with lesson player and completes quick check', function () {
    AC.progress.reset();
    assert.equal(AC.progress.hasSeenLesson('str'), false);

    AC.setState('world');
    AC.lessons.shell.open('str');
    assert.equal(AC.lessons.shell.isOpen(), true);

    // Switch to Learn tab
    AC.lessons.shell.switchTab('learn');
    assert.equal(AC.lessons.shell.getActiveTab(), 'learn');

    // Trigger lesson completion
    AC.progress.setLessonSeen('str');
    assert.equal(AC.progress.hasSeenLesson('str'), true);

    // Close shell
    AC.lessons.shell.close();
    assert.equal(AC.lessons.shell.isOpen(), false);
    assert.equal(AC.getState(), 'world');
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
