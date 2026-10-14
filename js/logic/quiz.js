/* quiz.js: Question generator for lesson quick checks and Exam Tower. Pure logic with seeded RNG. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  function pickRandom(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffle(arr, rng) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function buildQuestion(topic, id, prompt, correctVal, distractors, explain, rng, visual) {
    const uniqueDistractors = [];
    const correctStr = String(correctVal);

    for (const d of distractors) {
      const str = String(d);
      if (str !== correctStr && !uniqueDistractors.includes(str)) {
        uniqueDistractors.push(str);
      }
      if (uniqueDistractors.length === 3) break;
    }

    // Fallbacks if not enough unique distractors
    let fallbackCounter = 1;
    while (uniqueDistractors.length < 3) {
      const fallback = `Option ${fallbackCounter++}`;
      if (fallback !== correctStr && !uniqueDistractors.includes(fallback)) {
        uniqueDistractors.push(fallback);
      }
    }

    const allOptions = shuffle([correctStr, ...uniqueDistractors.slice(0, 3)], rng);
    const answerIndex = allOptions.indexOf(correctStr);

    return {
      id: `${topic}-${id}`,
      topic,
      prompt,
      visual: visual || null,
      options: allOptions,
      answerIndex,
      explain
    };
  }

  // --- STRING QUESTIONS ---
  function genStringQuestions(rng, count = 3) {
    const wordsPool = ['cat', 'race', 'star', 'level', 'train', 'city', 'loop', 'logic'];
    const w = pickRandom(wordsPool, rng);
    const v = pickRandom(['car', 'box', 'run', 'net'], rng);

    const q1Correct = AC.strings.prefixes(w).length; // n + 1
    const q1 = buildQuestion(
      'str',
      'prefixes-count',
      `How many prefixes does the string "${w}" have (counting the empty string ε and the whole string)?`,
      q1Correct,
      [w.length, Math.max(1, w.length - 1), w.length + 2, Math.pow(2, w.length)],
      `A string of length n has exactly n + 1 prefixes (one for each cut position 0 through n, from ε to the whole string). For "${w}", length is ${w.length}, so there are ${q1Correct} prefixes.`,
      rng
    );

    const wv = AC.strings.concat(w, v);
    const wvRev = AC.strings.reverse(wv);
    const q2 = buildQuestion(
      'str',
      'concat-reverse',
      `What is the reverse of concatenation ("${w}" · "${v}")?`,
      `"${wvRev}"`,
      [
        `"${AC.strings.concat(AC.strings.reverse(w), AC.strings.reverse(v))}"`,
        `"${wv}"`,
        `"${AC.strings.concat(v, w)}"`
      ],
      `The reversal of a concatenation satisfies (w · v)ᴿ = vᴿ · wᴿ. For "${w}" · "${v}" = "${wv}", the reversed string is "${wvRev}".`,
      rng
    );

    const isWPal = AC.strings.isPalindrome(w);
    const palWord = pickRandom(['racecar', 'radar', 'rotor', 'noon'], rng);
    const nonPalWord = pickRandom(['rocket', 'engine', 'canvas', 'vertex'], rng);
    const q3 = buildQuestion(
      'str',
      'palindrome-rule',
      `Which of the following is a valid palindrome (satisfying w = wᴿ)?`,
      `"${palWord}"`,
      [`"${nonPalWord}"`, `"${w}!"`, `"not a palindrome"`],
      `A palindrome reads exactly the same forwards and backwards (w = wᴿ). "${palWord}" reversed is "${palWord}".`,
      rng
    );

    return [q1, q2, q3].slice(0, count);
  }

  // --- SET QUESTIONS ---
  function genSetQuestions(rng, count = 3) {
    const el1 = Math.floor(rng() * 3) + 1; // 1..3
    const el2 = el1 + 1;
    const el3 = el2 + 1;
    const el4 = el3 + 1;
    const el5 = el4 + 1;

    const A = [el1, el2, el3];
    const B = [el2, el3, el4];

    // Q1: Symmetric Difference or Intersection
    const symDiffResult = AC.sets.toSortedArray(AC.sets.symDiff(A, B));
    const symStr = `{${symDiffResult.join(', ')}}`;
    const unionStr = `{${AC.sets.toSortedArray(AC.sets.union(A, B)).join(', ')}}`;
    const interStr = `{${AC.sets.toSortedArray(AC.sets.intersection(A, B)).join(', ')}}`;
    const diffStr = `{${AC.sets.toSortedArray(AC.sets.difference(A, B)).join(', ')}}`;

    const q1 = buildQuestion(
      'set',
      'symdiff',
      `For sets A = {${A.join(', ')}} and B = {${B.join(', ')}}, what is the symmetric difference A Δ B?`,
      symStr,
      [unionStr, interStr, diffStr],
      `The symmetric difference A Δ B contains elements in either A or B, but NOT both ((A \\ B) ∪ (B \\ A)). Here, ${symStr}.`,
      rng
    );

    // Q2: Power set size 2^|A|
    const pSize = Math.pow(2, A.length);
    const q2 = buildQuestion(
      'set',
      'powerset-size',
      `How many subsets does the set A = {${A.join(', ')}} have in its power set 𝒫(A)?`,
      pSize,
      [A.length, pSize - 1, Math.pow(2, A.length - 1), A.length * 2],
      `For any finite set with n elements, its power set 𝒫(A) contains exactly 2ⁿ subsets (always including the empty set ∅ and A itself). 2³ = 8.`,
      rng
    );

    // Q3: Complement relative to U = {1..8}
    const compA = AC.sets.toSortedArray(AC.sets.complement(A));
    const compStr = `{${compA.join(', ')}}`;
    const fakeComp1 = `{${compA.filter(x => x !== 8).join(', ')}}`;
    const fakeComp2 = `{${[...compA, A[0]].sort((a,b)=>a-b).join(', ')}}`;

    const q3 = buildQuestion(
      'set',
      'complement',
      `Given universe U = {1, 2, 3, 4, 5, 6, 7, 8}, what is the complement A′ of set A = {${A.join(', ')}}?`,
      compStr,
      [fakeComp1, fakeComp2, `{${A.join(', ')}}`],
      `The complement A′ = U \\ A contains every element of the universe U that is not in A. U \\ {${A.join(', ')}} = ${compStr}.`,
      rng
    );

    return [q1, q2, q3].slice(0, count);
  }

  // --- TREE QUESTIONS ---
  function genTreeQuestions(rng, count = 3) {
    const keys = [4, 2, 6, 1, 3, 5, 7];
    const root = AC.tree.buildBST(keys);

    const pre = AC.tree.preorder(root).join(' ');
    const inO = AC.tree.inorder(root).join(' ');
    const post = AC.tree.postorder(root).join(' ');
    const rev = AC.tree.inorder(root).reverse().join(' ');

    const q1 = buildQuestion(
      'tree',
      'bst-inorder-rule',
      'Which traversal of a Binary Search Tree (BST) visits its keys in strictly ascending sorted order?',
      'Inorder (LNR)',
      ['Preorder (NLR)', 'Postorder (LRN)', 'Level-order (BFS)'],
      'Inorder traversal visits the left subtree, then the root node, then the right subtree (LNR). Because of the BST invariant (left < node < right), inorder visits keys in ascending order.',
      rng
    );

    const q2 = buildQuestion(
      'tree',
      'bst-preorder',
      `For the BST with root 4 and keys {1, 2, 3, 4, 5, 6, 7}, what is the Preorder (NLR) traversal?`,
      pre,
      [inO, post, rev],
      `Preorder traversal visits the Node first, then Left subtree, then Right subtree (NLR). For root 4, it visits 4, then subtree {2, 1, 3}, then {6, 5, 7}: ${pre}.`,
      rng
    );

    const q3 = buildQuestion(
      'tree',
      'bst-postorder',
      `For the BST with root 4 and keys {1, 2, 3, 4, 5, 6, 7}, what is the Postorder (LRN) traversal?`,
      post,
      [inO, pre, rev],
      `Postorder traversal visits the Left subtree, then Right subtree, and finally the root Node (LRN). The root 4 is visited last: ${post}.`,
      rng
    );

    return [q1, q2, q3].slice(0, count);
  }

  // --- DFA QUESTIONS ---
  function genDfaQuestions(rng, count = 3) {
    const goalObj = Array.isArray(AC.dfa.goals)
      ? AC.dfa.goals.find(g => g.id === 'endsWith01')
      : null;
    const predicate = goalObj && typeof goalObj.predicate === 'function'
      ? goalObj.predicate
      : (str => str.endsWith('01'));

    const testStrings = ['01', '101', '00', '110', '001', '11'];
    const s = pickRandom(testStrings, rng);
    const doesAccept = predicate(s);

    const q1 = buildQuestion(
      'dfa',
      'ends-in-01-run',
      `Does the DFA recognizing strings that end in "01" accept the input string "${s}"?`,
      doesAccept ? 'Accept (ends in state q2)' : 'Reject (ends in non-accepting state)',
      [
        !doesAccept ? 'Accept (ends in state q2)' : 'Reject (ends in non-accepting state)',
        'Undefined transition error',
        'Stuck in infinite loop'
      ],
      `The DFA for "ends in 01" accepts if and only if the final two symbols are 01. For "${s}", the condition is ${doesAccept ? 'met' : 'NOT met'}.`,
      rng
    );

    const q2 = buildQuestion(
      'dfa',
      'complement-rule',
      'If we complement a DFA by flipping its accepting states (F_new = Q \\ F), what happens to a string previously rejected by the original DFA?',
      'It is accepted by the complemented DFA',
      [
        'It is still rejected by the complemented DFA',
        'The machine crashes on the first symbol',
        'The start state becomes unreachable'
      ],
      'Because the transition function δ of a DFA is total, every input leads to a unique state. Swapping accepting and non-accepting states (Q \\ F) accepts all strings that were previously rejected.',
      rng
    );

    const q3 = buildQuestion(
      'dfa',
      'delta-meaning',
      'In the formal 5-tuple definition of a DFA M = (Q, Σ, δ, q0, F), what is δ?',
      'The transition function mapping (state, symbol) to the next state',
      [
        'The finite alphabet of input symbols',
        'The set of all accepting final states',
        'The initial start state of the machine'
      ],
      'δ (delta) is the transition function δ: Q × Σ → Q. For every state and input symbol, it specifies exactly which state to move to.',
      rng
    );

    return [q1, q2, q3].slice(0, count);
  }

  AC.quiz = {
    generateTopicQuestions(topic, rng, count = 3) {
      const r = rng || Math.random;
      switch (topic) {
        case 'str': return genStringQuestions(r, count);
        case 'set': return genSetQuestions(r, count);
        case 'tree': return genTreeQuestions(r, count);
        case 'dfa': return genDfaQuestions(r, count);
        default: return [];
      }
    },

    generateExam(rng) {
      const r = rng || Math.random;
      return [
        ...genStringQuestions(r, 2),
        ...genSetQuestions(r, 2),
        ...genTreeQuestions(r, 2),
        ...genDfaQuestions(r, 2)
      ];
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
