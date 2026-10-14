/* lessons-data.js: Authoritative lesson specifications for String Street, Set Park, Tree Forest, and DFA Station. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  AC.lessons = AC.lessons || {};

  // 1. STRING STREET LESSON (7 steps)
  const stringLesson = {
    id: 'str',
    title: 'String Street',
    color: '#e0663f',
    skin: 'chalk',
    seed: 101,
    steps: [
      {
        title: 'Alphabet Σ and Symbols',
        say: 'An alphabet Σ is a finite non-empty set of symbols. Here Σ = {a..z}. Strings are sequences formed from Σ.',
        draw(container) {
          AC.lessons.drawings.renderStringTrain(container, {
            w: 'abc',
            highlightIndex: 1
          });
        }
      },
      {
        title: 'A String and its Length',
        say: 'A string w is a sequence of symbols. Its length |w| is the symbol count. For train "city", |city| = 4.',
        draw(container) {
          const w = 'city';
          const len = AC.strings.length(w);
          AC.lessons.drawings.renderStringTrain(container, { w });
        }
      },
      {
        title: 'The Empty String ε',
        say: 'The empty string ε contains zero symbols: |ε| = 0. For any string w, concatenation wε = εw = w.',
        draw(container) {
          AC.lessons.drawings.renderStringTrain(container, { isEpsilon: true });
        }
      },
      {
        title: 'Concatenation (Coupling Cars)',
        say: 'Concatenation wv joins two strings by coupling their cars in order. For "cat" and "box", length is 3 + 3 = 6.',
        draw(container) {
          const w = 'cat';
          const v = 'box';
          const wv = AC.strings.concat(w, v);
          AC.lessons.drawings.renderStringTrain(container, { w, v });
        }
      },
      {
        title: 'Prefix and Suffix',
        say: 'Cutting string w of length n at position k yields prefix x and suffix y. Every string has n + 1 prefixes.',
        draw(container) {
          const w = 'train';
          const cut = 2; // "tr" and "ain"
          AC.lessons.drawings.renderStringTrain(container, { w, cut });
        }
      },
      {
        title: 'Reverse (Flipping Cars)',
        say: 'Reversing string w inverts car order: (wᴿ)ᴿ = w. Reversing coupled train (wv)ᴿ yields vᴿwᴿ. The empty string satisfies εᴿ = ε.',
        draw(container) {
          const w = 'track';
          const revW = AC.strings.reverse(w);
          AC.lessons.drawings.renderStringTrain(container, { w: revW, reversed: true });
        }
      },
      {
        title: 'Palindromes',
        say: 'A palindrome satisfies w = wᴿ, reading identically in both directions. The empty string ε and single letters are always palindromes.',
        draw(container) {
          const w = 'radar';
          const isPal = AC.strings.isPalindrome(w);
          AC.lessons.drawings.renderStringTrain(container, { w });
        }
      }
    ],
    quickCheck(rng) {
      return AC.quiz.generateTopicQuestions('str', rng, 3);
    }
  };

  // 2. SET PARK LESSON (9 steps, U = {1..8})
  const setLesson = {
    id: 'set',
    title: 'Set Park',
    color: '#1f9d8a',
    skin: 'chalk',
    seed: 202,
    steps: [
      {
        title: 'Elements and Membership ∈',
        say: 'An element x belongs to set A, written x ∈ A. Sets are unordered collections of distinct elements without duplicates.',
        draw(container) {
          AC.lessons.drawings.renderVenn(container, {
            A: [1, 2, 3],
            B: [],
            highlight: 'a',
            customLabel: 'A = {1, 2, 3}'
          });
        }
      },
      {
        title: 'Universe U and Subsets',
        say: 'All sets here are subsets of universe U = {1..8}. The empty set ∅ contains no elements and is a subset of all sets.',
        draw(container) {
          AC.lessons.drawings.renderVenn(container, {
            A: [1, 2],
            B: [7, 8],
            highlight: 'none',
            customLabel: 'Universe U = {1, 2, 3, 4, 5, 6, 7, 8}'
          });
        }
      },
      {
        title: 'Union A ∪ B',
        say: 'Union A ∪ B contains all elements in A or B (or both). Identity: |A ∪ B| = |A| + |B| − |A ∩ B|.',
        draw(container) {
          const A = [1, 2, 4];
          const B = [4, 5, 6];
          const union = AC.sets.toSortedArray(AC.sets.union(A, B));
          AC.lessons.drawings.renderVenn(container, {
            A,
            B,
            highlight: 'union',
            customLabel: `A ∪ B = {${union.join(', ')}}`
          });
        }
      },
      {
        title: 'Intersection A ∩ B',
        say: 'Intersection A ∩ B contains only elements in both sets simultaneously. If disjoint, their intersection is empty set ∅.',
        draw(container) {
          const A = [1, 2, 4];
          const B = [4, 5, 6];
          const inter = AC.sets.toSortedArray(AC.sets.intersection(A, B));
          AC.lessons.drawings.renderVenn(container, {
            A,
            B,
            highlight: 'ab',
            customLabel: `A ∩ B = {${inter.join(', ')}}`
          });
        }
      },
      {
        title: 'Difference A \\ B',
        say: 'Difference A \\ B contains elements in A not in B. Difference is not symmetric: A \\ B ≠ B \\ A.',
        draw(container) {
          const A = [1, 2, 4];
          const B = [4, 5, 6];
          const diff = AC.sets.toSortedArray(AC.sets.difference(A, B));
          AC.lessons.drawings.renderVenn(container, {
            A,
            B,
            highlight: 'a',
            customLabel: `A \\ B = {${diff.join(', ')}}`
          });
        }
      },
      {
        title: 'Symmetric Difference A Δ B',
        say: 'Symmetric difference A Δ B contains elements in exactly one set: (A \\ B) ∪ (B \\ A) = (A ∪ B) \\ (A ∩ B).',
        draw(container) {
          const A = [1, 2, 4];
          const B = [4, 5, 6];
          const sym = AC.sets.toSortedArray(AC.sets.symDiff(A, B));
          AC.lessons.drawings.renderVenn(container, {
            A,
            B,
            highlight: 'sym',
            customLabel: `A Δ B = {${sym.join(', ')}}`
          });
        }
      },
      {
        title: 'Complement A′ = U \\ A',
        say: 'The complement A′ = U \\ A contains every element in universe U not in A. By De Morgan: (A ∪ B)′ = A′ ∩ B′.',
        draw(container) {
          const A = [1, 2, 3];
          const comp = AC.sets.toSortedArray(AC.sets.complement(A));
          AC.lessons.drawings.renderVenn(container, {
            A,
            B: [],
            highlight: 'comp',
            customLabel: `A′ = {${comp.join(', ')}}`
          });
        }
      },
      {
        title: 'Power Set 𝒫(A)',
        say: 'Power set 𝒫(A) is the set of all subsets of A, always including ∅ and A. |𝒫(A)| = 2^|A|.',
        draw(container) {
          const A = [1, 2];
          const pset = AC.sets.powerSet(A);
          const pstr = pset.map(s => '{' + s.join(',') + '}').join(', ');
          AC.lessons.drawings.renderVenn(container, {
            A,
            B: [],
            highlight: 'a',
            customLabel: `𝒫({1, 2}) = {${pstr}} (size ${pset.length})`
          });
        }
      },
      {
        title: 'Cartesian Product A × B',
        say: 'Cartesian product A × B contains ordered pairs (a, b) with a ∈ A, b ∈ B. |A × B| = |A| · |B|.',
        draw(container) {
          const A = [1, 2];
          const B = [3, 4];
          const cp = AC.sets.cartesian(A, B);
          const cpStr = cp.map(([x, y]) => `(${x},${y})`).join(', ');
          AC.lessons.drawings.renderVenn(container, {
            A,
            B,
            highlight: 'none',
            customLabel: `{1, 2} × {3, 4} = {${cpStr}}`
          });
        }
      }
    ],
    quickCheck(rng) {
      return AC.quiz.generateTopicQuestions('set', rng, 3);
    }
  };

  // 3. TREE FOREST LESSON (8 steps)
  const treeLesson = {
    id: 'tree',
    title: 'Tree Forest',
    color: '#4c8c3a',
    skin: 'chalk',
    seed: 303,
    steps: [
      {
        title: 'Nodes, Edges, Root and Leaves',
        say: 'A tree consists of nodes connected by edges. The top node is the root; nodes with no children are leaves.',
        draw(container) {
          AC.lessons.drawings.renderTree(container, {
            keys: [4, 2, 6, 1, 3, 5, 7],
            activeNode: 4,
            traversalName: 'Root highlighted'
          });
        }
      },
      {
        title: 'Binary Tree: Left and Right',
        say: 'In a binary tree, every node has at most two children: left child and right child.',
        draw(container) {
          AC.lessons.drawings.renderTree(container, {
            keys: [4, 2, 6],
            traversalName: 'Binary Tree'
          });
        }
      },
      {
        title: 'The BST Rule',
        say: 'A Binary Search Tree (BST) stores distinct keys: all left subtree keys < node < all right subtree keys.',
        draw(container) {
          AC.lessons.drawings.renderTree(container, {
            keys: [4, 2, 6, 1, 3, 5, 7],
            traversalName: 'BST Invariant: Left < Root < Right'
          });
        }
      },
      {
        title: 'Preorder Traversal (NLR)',
        say: 'Preorder (NLR) visits the node first, then recursively walks the left subtree, then right subtree.',
        draw(container) {
          const root = AC.tree.buildBST([4, 2, 6, 1, 3, 5, 7]);
          const pre = AC.tree.preorder(root);
          AC.lessons.drawings.renderTree(container, {
            keys: [4, 2, 6, 1, 3, 5, 7],
            visitedKeys: pre,
            traversalName: 'Preorder (NLR)'
          });
        }
      },
      {
        title: 'Inorder Traversal (LNR)',
        say: 'Inorder (LNR) visits left subtree, current node, then right subtree. On a BST, inorder visits keys in ascending order.',
        draw(container) {
          const root = AC.tree.buildBST([4, 2, 6, 1, 3, 5, 7]);
          const inO = AC.tree.inorder(root);
          AC.lessons.drawings.renderTree(container, {
            keys: [4, 2, 6, 1, 3, 5, 7],
            visitedKeys: inO,
            traversalName: 'Inorder (LNR) — Sorted'
          });
        }
      },
      {
        title: 'Postorder Traversal (LRN)',
        say: 'Postorder (LRN) visits left subtree, right subtree, and finally the root node last.',
        draw(container) {
          const root = AC.tree.buildBST([4, 2, 6, 1, 3, 5, 7]);
          const post = AC.tree.postorder(root);
          AC.lessons.drawings.renderTree(container, {
            keys: [4, 2, 6, 1, 3, 5, 7],
            visitedKeys: post,
            traversalName: 'Postorder (LRN)'
          });
        }
      },
      {
        title: 'Call Stack Recursion',
        say: 'Recursive traversals use a call stack. Stack frames unwind as base cases return back up to ancestor nodes.',
        draw(container) {
          AC.lessons.drawings.renderTree(container, {
            keys: [4, 2, 6, 1, 3, 5, 7],
            activeNode: 1,
            visitedKeys: [4, 2],
            callStack: ['visit(4)', '  visit(2)', '    visit(1) ← current']
          });
        }
      },
      {
        title: 'Comparing the Three Orders',
        say: 'Comparing traversals on the same tree: NLR inspects roots first, LNR sorts keys, and LRN cleans up children first.',
        draw(container) {
          const root = AC.tree.buildBST([4, 2, 6, 1, 3, 5, 7]);
          const inO = AC.tree.inorder(root);
          AC.lessons.drawings.renderTree(container, {
            keys: [4, 2, 6, 1, 3, 5, 7],
            visitedKeys: inO,
            traversalName: 'Inorder sorted'
          });
        }
      }
    ],
    quickCheck(rng) {
      return AC.quiz.generateTopicQuestions('tree', rng, 3);
    }
  };

  // 4. DFA STATION LESSON (8 steps, CRT skin)
  const dfaLesson = {
    id: 'dfa',
    title: 'DFA Station',
    color: '#6f55e0',
    skin: 'crt',
    seed: 404,
    steps: [
      {
        title: 'A Machine Reading a Tape',
        say: 'A Deterministic Finite Automaton reads an input string one symbol at a time from left to right on a tape.',
        draw(container) {
          AC.lessons.drawings.renderDFA(container, {
            machine: AC.dfa.referenceMachines.endsWith01,
            activeState: 0,
            tape: '01',
            tapeHead: 0
          });
        }
      },
      {
        title: 'States and the Start State',
        say: 'A DFA has a finite set of states Q. Computation always starts in designated start state q0.',
        draw(container) {
          AC.lessons.drawings.renderDFA(container, {
            machine: AC.dfa.referenceMachines.endsWith01,
            activeState: 0,
            tape: '0',
            tapeHead: 0
          });
        }
      },
      {
        title: 'Transition Function δ',
        say: 'Transition function δ: Q × Σ → Q is total. Every state has exactly one arrow for each symbol.',
        draw(container) {
          AC.lessons.drawings.renderDFA(container, {
            machine: AC.dfa.referenceMachines.endsWith01,
            activeState: 1,
            tape: '0',
            tapeHead: 0
          });
        }
      },
      {
        title: 'Accepting States F ⊆ Q',
        say: 'Accepting states F ⊆ Q are marked by double circles. If execution finishes in F, the string is accepted.',
        draw(container) {
          AC.lessons.drawings.renderDFA(container, {
            machine: AC.dfa.referenceMachines.endsWith01,
            activeState: 2,
            tape: '01',
            tapeHead: 1,
            isAccepted: true
          });
        }
      },
      {
        title: 'Running an Accepted String',
        say: 'Running input "01" on the ends-in-01 machine transitions q0 → q1 → q2. Ending in accepting state q2 accepts the string.',
        draw(container) {
          const s = '01';
          const machine = AC.dfa.referenceMachines.endsWith01;
          const endState = AC.dfa.run(machine, s);
          const isAcc = AC.dfa.accepts(machine, s);
          AC.lessons.drawings.renderDFA(container, {
            machine,
            activeState: endState,
            tape: s,
            tapeHead: 1,
            isAccepted: isAcc
          });
        }
      },
      {
        title: 'Running a Rejected String',
        say: 'Running input "00" transitions q0 → q1 → q1. Because state q1 is not in F, the string is rejected.',
        draw(container) {
          const s = '00';
          const machine = AC.dfa.referenceMachines.endsWith01;
          const endState = AC.dfa.run(machine, s);
          const isAcc = AC.dfa.accepts(machine, s);
          AC.lessons.drawings.renderDFA(container, {
            machine,
            activeState: endState,
            tape: s,
            tapeHead: 1,
            isAccepted: isAcc
          });
        }
      },
      {
        title: 'The Formal 5-Tuple',
        say: 'Every DFA is formally a 5-tuple (Q, Σ, δ, q0, F): states, alphabet, transitions, start state, and accepting states.',
        draw(container) {
          AC.lessons.drawings.renderDFA(container, {
            machine: AC.dfa.referenceMachines.endsWith01,
            activeState: 0,
            tape: '',
            tapeHead: 0
          });
        }
      },
      {
        title: 'Complementing a DFA',
        say: 'Complementing a DFA flips accepting states to Q \\ F. Every rejected string becomes accepted, and every accepted string rejected.',
        draw(container) {
          const original = AC.dfa.referenceMachines.endsWith01;
          const comp = AC.dfa.complement(original);
          // For input "00", original rejected, complemented accepts!
          const s = '00';
          const endState = AC.dfa.run(comp, s);
          const isAcc = AC.dfa.accepts(comp, s);
          AC.lessons.drawings.renderDFA(container, {
            machine: comp,
            activeState: endState,
            tape: s,
            tapeHead: 1,
            isAccepted: isAcc
          });
        }
      }
    ],
    quickCheck(rng) {
      return AC.quiz.generateTopicQuestions('dfa', rng, 3);
    }
  };

  AC.lessons.data = {
    str: stringLesson,
    set: setLesson,
    tree: treeLesson,
    dfa: dfaLesson
  };

  // Wire each lesson module's `learn` handler to the lesson player
  ['str', 'set', 'tree', 'dfa'].forEach(id => {
    if (AC.lessons[id]) {
      AC.lessons[id].learn = {
        mount(host, ctx) {
          AC.lessons.lessonPlayer.mount(host, AC.lessons.data[id], ctx);
        },
        unmount() {
          AC.lessons.lessonPlayer.unmount();
        }
      };
    }
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
