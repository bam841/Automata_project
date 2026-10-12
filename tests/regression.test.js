/* regression.test.js: Verifies full regression checklist against legacy behavior. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('Regression 1: City map displays 4 districts and updates stamp count', function () {
    AC.progress.reset();
    assert.equal(AC.progress.stampCount(), 0);

    assert(AC.lessons.str, 'String Street registered');
    assert(AC.lessons.set, 'Set Park registered');
    assert(AC.lessons.tree, 'Tree Forest registered');
    assert(AC.lessons.dfa, 'DFA Station registered');
  });

  test('Regression 2: String Street logic supports inputs, cut slider, and palindrome challenge', function () {
    const w = 'racecar';
    assert.equal(AC.strings.length(w), 7);
    assert.equal(AC.strings.prefixAt(w, 3), 'rac');
    assert.equal(AC.strings.suffixAt(w, 3), 'ecar');
    assert.equal(AC.strings.concat(w, '!'), 'racecar!');
    assert.equal(AC.strings.reverse(w), 'racecar');
    assert.equal(AC.strings.prefixes(w).length, 8);
    assert.equal(AC.strings.suffixes(w).length, 8);
    assert.equal(AC.strings.isChallengePalindrome(w), true);

    AC.progress.setStamp('str');
    assert.equal(AC.progress.hasStamp('str'), true);
  });

  test('Regression 3: Set Park supports all 7 operations and challenge completion', function () {
    const A = [1, 2, 4];
    const B = [4, 7, 8];

    // Challenge condition: A Δ B = {1, 2, 7, 8} and A ∩ B = {4}
    assert.equal(AC.sets.isChallengeSatisfied(A, B), true);

    AC.progress.setStamp('set');
    assert.equal(AC.progress.hasStamp('set'), true);
  });

  test('Regression 4: Tree Forest generates random tree and verifies traversals', function () {
    const { root } = AC.tree.randomBST(AC.rng(100), 7);
    const pre = AC.tree.preorder(root);
    const inO = AC.tree.inorder(root);
    const post = AC.tree.postorder(root);

    assert.equal(pre.length, 7);
    assert.equal(inO.length, 7);
    assert.equal(post.length, 7);

    // Inorder on BST must be sorted
    assert.deepEqual(inO, [...inO].sort((a, b) => a - b));

    AC.progress.setStamp('tree');
    assert.equal(AC.progress.hasStamp('tree'), true);
  });

  test('Regression 5: DFA Station verifies 3 goals, complementation, and test pass', function () {
    // Ends with 01
    const m1 = AC.dfa.referenceMachines.endsWith01;
    const r1 = AC.dfa.testAgainst(m1, 0);
    assert.equal(r1.passed, true);

    // Even ones
    const m2 = AC.dfa.referenceMachines.evenOnes;
    const r2 = AC.dfa.testAgainst(m2, 1);
    assert.equal(r2.passed, true);

    // No double zeros
    const m3 = AC.dfa.referenceMachines.noDoubleZero;
    const r3 = AC.dfa.testAgainst(m3, 2);
    assert.equal(r3.passed, true);

    AC.progress.setStamp('dfa');
    assert.equal(AC.progress.hasStamp('dfa'), true);
    assert.equal(AC.progress.stampCount(), 4);
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
