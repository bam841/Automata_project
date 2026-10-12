/* sets.js: Pure set theory operations over finite universe U = {1..8}. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  const sets = AC.sets = AC.sets || {};

  sets.U = [1, 2, 3, 4, 5, 6, 7, 8];

  /**
   * Converts any Set, array, or iterable to a numerically sorted array.
   */
  sets.toSortedArray = function (s) {
    return [...(s || [])].map(Number).sort((x, y) => x - y);
  };

  /**
   * Converts an iterable to a Set of numbers.
   */
  function toSet(s) {
    if (s instanceof Set) return s;
    return new Set(s || []);
  }

  /**
   * Union A ∪ B.
   */
  sets.union = function (a, b, u = sets.U) {
    const sA = toSet(a);
    const sB = toSet(b);
    const res = new Set();
    for (const x of u) {
      if (sA.has(x) || sB.has(x)) res.add(x);
    }
    return res;
  };

  /**
   * Intersection A ∩ B.
   */
  sets.intersection = function (a, b, u = sets.U) {
    const sA = toSet(a);
    const sB = toSet(b);
    const res = new Set();
    for (const x of u) {
      if (sA.has(x) && sB.has(x)) res.add(x);
    }
    return res;
  };

  /**
   * Difference A \ B (elements in A not in B).
   */
  sets.difference = function (a, b, u = sets.U) {
    const sA = toSet(a);
    const sB = toSet(b);
    const res = new Set();
    for (const x of u) {
      if (sA.has(x) && !sB.has(x)) res.add(x);
    }
    return res;
  };

  /**
   * Symmetric difference A Δ B (elements in A or B, but not both).
   */
  sets.symDiff = function (a, b, u = sets.U) {
    const sA = toSet(a);
    const sB = toSet(b);
    const res = new Set();
    for (const x of u) {
      if (sA.has(x) !== sB.has(x)) res.add(x);
    }
    return res;
  };

  /**
   * Complement A' = U \ A.
   */
  sets.complement = function (a, u = sets.U) {
    const sA = toSet(a);
    const res = new Set();
    for (const x of u) {
      if (!sA.has(x)) res.add(x);
    }
    return res;
  };

  /**
   * Power set 𝒫(A).
   * Returns array of arrays, sorted by length then lexicographically.
   * |𝒫(A)| = 2^|A|. Includes empty set [] and A itself.
   */
  sets.powerSet = function (a) {
    const sorted = sets.toSortedArray(a);
    let subsets = [[]];
    for (const x of sorted) {
      const more = subsets.map(sub => [...sub, x]);
      subsets = subsets.concat(more);
    }
    // Sort by subset size ascending, then lexicographical order
    subsets.sort((x, y) => {
      if (x.length !== y.length) return x.length - y.length;
      for (let i = 0; i < x.length; i++) {
        if (x[i] !== y[i]) return x[i] - y[i];
      }
      return 0;
    });
    return subsets;
  };

  /**
   * Cartesian product A × B.
   * Returns array of pairs [a, b], where a ∈ sorted(A) and b ∈ sorted(B).
   */
  sets.cartesian = function (a, b) {
    const sA = sets.toSortedArray(a);
    const sB = sets.toSortedArray(b);
    const res = [];
    for (const x of sA) {
      for (const y of sB) {
        res.push([x, y]);
      }
    }
    return res;
  };

  /**
   * Tests whether sets A and B satisfy the Set Park challenge:
   * A Δ B = {1, 2, 7, 8} AND A ∩ B = {4}.
   */
  sets.isChallengeSatisfied = function (a, b) {
    const sd = sets.toSortedArray(sets.symDiff(a, b));
    const it = sets.toSortedArray(sets.intersection(a, b));
    return sd.join(',') === '1,2,7,8' && it.join(',') === '4';
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
