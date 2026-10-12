/* tree.test.js: Golden tests and property checks for AC.tree */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('AC.tree traversals match golden values in DOMAIN_SPEC §7 (Case 1: 4,2,6,1,3,5,7)', function () {
    const root = AC.tree.buildBST([4, 2, 6, 1, 3, 5, 7]);
    assert.deepEqual(AC.tree.preorder(root), [4, 2, 1, 3, 6, 5, 7]);
    assert.deepEqual(AC.tree.inorder(root), [1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(AC.tree.postorder(root), [1, 3, 2, 5, 7, 6, 4]);
  });

  test('AC.tree traversals match golden values in DOMAIN_SPEC §7 (Case 2: 1,2,3)', function () {
    const root = AC.tree.buildBST([1, 2, 3]);
    assert.deepEqual(AC.tree.preorder(root), [1, 2, 3]);
    assert.deepEqual(AC.tree.inorder(root), [1, 2, 3]);
    assert.deepEqual(AC.tree.postorder(root), [3, 2, 1]);
  });

  test('AC.tree traversals match golden values in DOMAIN_SPEC §7 (Case 3: 3,2,1)', function () {
    const root = AC.tree.buildBST([3, 2, 1]);
    assert.deepEqual(AC.tree.preorder(root), [3, 2, 1]);
    assert.deepEqual(AC.tree.inorder(root), [1, 2, 3]);
    assert.deepEqual(AC.tree.postorder(root), [1, 2, 3]);
  });

  test('AC.tree traversals match golden values in DOMAIN_SPEC §7 (Case 4: 5,3,8,1,4,7,9)', function () {
    const root = AC.tree.buildBST([5, 3, 8, 1, 4, 7, 9]);
    assert.deepEqual(AC.tree.preorder(root), [5, 3, 1, 4, 8, 7, 9]);
    assert.deepEqual(AC.tree.inorder(root), [1, 3, 4, 5, 7, 8, 9]);
    assert.deepEqual(AC.tree.postorder(root), [1, 4, 3, 7, 9, 8, 5]);
  });

  test('Inorder traversal of any BST is strictly ascending', function () {
    const rng = AC.rng(12345);
    for (let trial = 0; trial < 10; trial++) {
      const { root } = AC.tree.randomBST(rng, 7);
      const inValues = AC.tree.inorder(root);
      assert.equal(inValues.length, 7);
      for (let i = 1; i < inValues.length; i++) {
        assert(inValues[i - 1] < inValues[i], `Inorder must be strictly ascending: ${inValues[i-1]} < ${inValues[i]}`);
      }
    }
  });

  test('AC.tree.randomBST with seeded rng is deterministic', function () {
    const tree1 = AC.tree.randomBST(AC.rng(777), 7);
    const tree2 = AC.tree.randomBST(AC.rng(777), 7);
    assert.deepEqual(AC.tree.preorder(tree1.root), AC.tree.preorder(tree2.root));
    assert.equal(tree1.md, tree2.md);
  });

  test('AC.tree.layout assigns non-overlapping horizontal positions', function () {
    const { nodes, md } = AC.tree.randomBST(AC.rng(42), 7);
    assert.equal(nodes.length, 7);
    assert(md >= 2, 'Depth must be at least 2 for 7 nodes');

    // Horizontal positions x must span 0 to 6
    const xs = nodes.map(n => n.x).sort((a, b) => a - b);
    assert.deepEqual(xs, [0, 1, 2, 3, 4, 5, 6]);
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
