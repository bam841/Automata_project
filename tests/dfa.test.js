/* dfa.test.js: Golden tests and property checks for AC.dfa */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('AC.dfa.allStrings generates exactly 127 binary strings of length 0 to 6', function () {
    const all = AC.dfa.allStrings(6);
    assert.equal(all.length, 127);
    assert.equal(all[0], ''); // Empty string ε
    assert.equal(all[1], '0');
    assert.equal(all[2], '1');
    assert.equal(all[all.length - 1], '111111');
  });

  test('Reference DFA 1 (Ends in 01) matches predicate on all 127 strings', function () {
    const machine = AC.dfa.referenceMachines.endsWith01;
    const res = AC.dfa.testAgainst(machine, 0);
    assert.equal(res.passed, true);
    assert.equal(res.failures.length, 0);
    assert.equal(res.passedCount, 127);
  });

  test('Reference DFA 2 (Even number of 1s) matches predicate on all 127 strings', function () {
    const machine = AC.dfa.referenceMachines.evenOnes;
    const res = AC.dfa.testAgainst(machine, 1);
    assert.equal(res.passed, true);
    assert.equal(res.failures.length, 0);
    assert.equal(res.passedCount, 127);
  });

  test('Reference DFA 3 (No two 0s in a row) matches predicate on all 127 strings', function () {
    const machine = AC.dfa.referenceMachines.noDoubleZero;
    const res = AC.dfa.testAgainst(machine, 2);
    assert.equal(res.passed, true);
    assert.equal(res.failures.length, 0);
    assert.equal(res.passedCount, 127);
  });

  test('Complement of each reference machine disagrees with original on all 127 strings', function () {
    const all = AC.dfa.allStrings(6);
    for (const key of ['endsWith01', 'evenOnes', 'noDoubleZero']) {
      const orig = AC.dfa.referenceMachines[key];
      const comp = AC.dfa.complement(orig);

      for (const s of all) {
        const acceptOrig = AC.dfa.accepts(orig, s);
        const acceptComp = AC.dfa.accepts(comp, s);
        assert(acceptOrig !== acceptComp, `Complement must disagree on string "${s}" for ${key}`);
      }
    }
  });

  test('DFA step simulation traces exact state transitions', function () {
    const machine = AC.dfa.referenceMachines.endsWith01;
    // delta: 0 -(0)-> 1, 1 -(1)-> 2, 2 -(0)-> 1
    assert.equal(AC.dfa.run(machine, ''), 0);
    assert.equal(AC.dfa.run(machine, '0'), 1);
    assert.equal(AC.dfa.run(machine, '01'), 2);
    assert.equal(AC.dfa.run(machine, '010'), 1);
    assert.equal(AC.dfa.run(machine, '0101'), 2);
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
