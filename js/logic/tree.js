/* tree.js: Pure binary search tree algorithms, traversals, and planar layout. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  const tree = AC.tree = AC.tree || {};

  /**
   * Inserts value x into BST rooted at node n.
   * Preserves BST property: left < root < right.
   */
  tree.insert = function (n, x) {
    if (!n) return { v: x, l: null, r: null };
    if (x < n.v) {
      n.l = tree.insert(n.l, x);
    } else if (x > n.v) {
      n.r = tree.insert(n.r, x);
    }
    return n;
  };

  /**
   * Builds a BST by inserting keys in sequential order.
   */
  tree.buildBST = function (keys) {
    let root = null;
    for (const k of keys) {
      root = tree.insert(root, k);
    }
    return root;
  };

  /**
   * Preorder traversal (Node, Left, Right).
   */
  tree.preorder = function (n, acc = []) {
    if (!n) return acc;
    acc.push(n.v);
    tree.preorder(n.l, acc);
    tree.preorder(n.r, acc);
    return acc;
  };

  /**
   * Inorder traversal (Left, Node, Right).
   * Note: On a BST with distinct keys, this always yields strictly ascending values.
   */
  tree.inorder = function (n, acc = []) {
    if (!n) return acc;
    tree.inorder(n.l, acc);
    acc.push(n.v);
    tree.inorder(n.r, acc);
    return acc;
  };

  /**
   * Postorder traversal (Left, Right, Node).
   */
  tree.postorder = function (n, acc = []) {
    if (!n) return acc;
    tree.postorder(n.l, acc);
    tree.postorder(n.r, acc);
    acc.push(n.v);
    return acc;
  };

  /**
   * Assigns 2D layout coordinates to each tree node using inorder horizontal positioning.
   * Returns { root, md, nodes, edges }.
   */
  tree.layout = function (root) {
    let i = 0;
    let md = 0;
    const nodes = [];
    const edges = [];

    function lay(n, d) {
      if (!n) return;
      lay(n.l, d + 1);
      n.x = i++;
      n.d = d;
      md = Math.max(md, d);
      nodes.push(n);
      lay(n.r, d + 1);
    }

    lay(root, 0);

    for (const n of nodes) {
      if (n.l) edges.push({ from: n, to: n.l });
      if (n.r) edges.push({ from: n, to: n.r });
    }

    return { root, md, nodes, edges };
  };

  /**
   * Generates a random BST with n distinct values (1..99) using a seeded PRNG.
   * Returns { root, md, nodes, edges }.
   */
  tree.randomBST = function (rng = Math.random, n = 7) {
    const vals = [];
    while (vals.length < n) {
      const v = 1 + Math.floor(rng() * 99);
      if (!vals.includes(v)) vals.push(v);
    }
    const root = tree.buildBST(vals);
    return tree.layout(root);
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
