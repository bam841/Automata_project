/* dfa.js: Pure DFA simulation, complementation, test generation, and goal verification. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  const dfa = AC.dfa = AC.dfa || {};

  /**
   * The 3 target goals specified in DOMAIN_SPEC.md §4.
   */
  dfa.goals = [
    {
      id: 'endsWith01',
      name: 'Strings that end in 01',
      predicate: s => s.endsWith('01')
    },
    {
      id: 'evenOnes',
      name: 'An even number of 1s',
      predicate: s => ((s.match(/1/g) || []).length % 2 === 0)
    },
    {
      id: 'noDoubleZero',
      name: 'No two 0s in a row',
      predicate: s => !s.includes('00')
    }
  ];

  /**
   * Verified reference DFAs from DOMAIN_SPEC.md §4.
   */
  dfa.referenceMachines = {
    endsWith01: {
      n: 3,
      delta: [[1, 0], [1, 2], [1, 0]],
      accept: new Set([2])
    },
    evenOnes: {
      n: 2,
      delta: [[0, 1], [1, 0]],
      accept: new Set([0])
    },
    noDoubleZero: {
      n: 3,
      delta: [[1, 0], [2, 0], [2, 2]],
      accept: new Set([0, 1])
    }
  };

  /**
   * Simulates binary string s on machine, returning final state index.
   * Start state is always state 0.
   */
  dfa.run = function (machine, s) {
    let q = 0;
    const cleanStr = String(s).replace(/[^01]/g, '');
    for (let i = 0; i < cleanStr.length; i++) {
      const c = cleanStr.charCodeAt(i) - 48; // '0' -> 0, '1' -> 1
      const row = machine.delta[q];
      q = row ? row[c] : 0;
    }
    return q;
  };

  /**
   * Returns true iff final state is in accepting set F.
   */
  dfa.accepts = function (machine, s) {
    const q = dfa.run(machine, s);
    return machine.accept instanceof Set ? machine.accept.has(q) : Boolean(machine.accept && machine.accept[q]);
  };

  /**
   * Computes complement DFA (same Q, delta, q0, with inverted accept set Q \ F).
   */
  dfa.complement = function (machine) {
    const n = machine.n || machine.delta.length;
    const newAccept = new Set();
    const oldAccept = machine.accept instanceof Set ? machine.accept : new Set(machine.accept || []);

    for (let i = 0; i < n; i++) {
      if (!oldAccept.has(i)) {
        newAccept.add(i);
      }
    }

    return {
      n,
      delta: machine.delta.map(row => [row[0], row[1]]),
      accept: newAccept
    };
  };

  /**
   * Generates all binary strings of length 0 up to maxLen (inclusive).
   * For maxLen = 6: 1 + 2 + 4 + 8 + 16 + 32 + 64 = 127 strings.
   */
  dfa.allStrings = function (maxLen = 6) {
    let all = [''];
    for (let k = 0; k < maxLen; k++) {
      const prev = all.filter(s => s.length === k);
      for (const s of prev) {
        all.push(s + '0');
        all.push(s + '1');
      }
    }
    return all;
  };

  /**
   * Tests a machine against a goal predicate on all 127 strings.
   * Returns { passed, total, passedCount, failures: [{ s, expected, got }] }.
   */
  dfa.testAgainst = function (machine, goalOrPredicate) {
    let predicate;
    if (typeof goalOrPredicate === 'function') {
      predicate = goalOrPredicate;
    } else if (typeof goalOrPredicate === 'number') {
      predicate = dfa.goals[goalOrPredicate].predicate;
    } else if (typeof goalOrPredicate === 'string') {
      const g = dfa.goals.find(x => x.id === goalOrPredicate);
      predicate = g ? g.predicate : () => false;
    } else if (goalOrPredicate && typeof goalOrPredicate.predicate === 'function') {
      predicate = goalOrPredicate.predicate;
    } else {
      predicate = () => false;
    }

    const testStrings = dfa.allStrings(6);
    const failures = [];

    for (const s of testStrings) {
      const expected = Boolean(predicate(s));
      const got = dfa.accepts(machine, s);
      if (got !== expected) {
        failures.push({ s, expected, got });
      }
    }

    return {
      passed: failures.length === 0,
      total: testStrings.length,
      passedCount: testStrings.length - failures.length,
      failures
    };
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
