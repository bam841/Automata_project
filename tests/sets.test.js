/* sets.test.js: Golden tests and property checks for AC.sets */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('AC.sets operations match golden values in DOMAIN_SPEC §7', function () {
    const A = [1, 2, 3];
    const B = [3, 4];

    // Union
    assert.deepEqual(AC.sets.toSortedArray(AC.sets.union(A, B)), [1, 2, 3, 4]);

    // Intersection
    assert.deepEqual(AC.sets.toSortedArray(AC.sets.intersection(A, B)), [3]);

    // Difference
    assert.deepEqual(AC.sets.toSortedArray(AC.sets.difference(A, B)), [1, 2]);

    // Symmetric difference
    assert.deepEqual(AC.sets.toSortedArray(AC.sets.symDiff(A, B)), [1, 2, 4]);

    // Complement
    assert.deepEqual(AC.sets.toSortedArray(AC.sets.complement(A)), [4, 5, 6, 7, 8]);

    // Power set
    const pA = AC.sets.powerSet(A);
    assert.equal(pA.length, 8); // 2^3 = 8
    assert.deepEqual(pA[0], []); // Empty set included
    assert.deepEqual(pA[pA.length - 1], [1, 2, 3]); // Whole set included

    // Cartesian product
    const cAB = AC.sets.cartesian(A, B);
    assert.equal(cAB.length, 6); // 3 * 2 = 6
    assert.deepEqual(cAB[0], [1, 3]);
    assert.deepEqual(cAB[cAB.length - 1], [3, 4]);
  });

  test('AC.sets.powerSet handles empty set', function () {
    const pEmpty = AC.sets.powerSet([]);
    assert.equal(pEmpty.length, 1);
    assert.deepEqual(pEmpty, [[]]);
  });

  test('AC.sets.isChallengeSatisfied identifies valid challenge solutions', function () {
    // Valid solution: A = {1, 2, 4}, B = {4, 7, 8}
    assert.equal(AC.sets.isChallengeSatisfied([1, 2, 4], [4, 7, 8]), true);

    // Invalid solution
    assert.equal(AC.sets.isChallengeSatisfied([1, 2], [3, 4]), false);
  });

  test('Set Park challenge has exactly 16 satisfying subsets over U', function () {
    // Each of {1, 2, 7, 8} must belong to either A or B (2^4 = 16 combinations)
    // 4 must belong to both A and B
    // 3, 5, 6 belong to neither
    const fixed = [1, 2, 7, 8];
    let validPairs = 0;

    for (let mask = 0; mask < 16; mask++) {
      const a = [4];
      const b = [4];
      for (let i = 0; i < 4; i++) {
        if ((mask >> i) & 1) {
          a.push(fixed[i]);
        } else {
          b.push(fixed[i]);
        }
      }
      if (AC.sets.isChallengeSatisfied(a, b)) {
        validPairs++;
      }
    }

    assert.equal(validPairs, 16);
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
