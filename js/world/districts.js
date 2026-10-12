/* districts.js: District registry and metadata. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  AC.districts = [
    {
      id: 'str',
      name: 'String Street',
      color: '#e0663f',
      letter: 'S',
      summary: 'Length, prefix, suffix, concat and reverse, with strings as trains.',
      board: { tx: 12, ty: 32 },
      region: { x0: 2, y0: 24, x1: 20, y1: 40 }
    },
    {
      id: 'set',
      name: 'Set Park',
      color: '#1f9d8a',
      letter: 'P',
      summary: 'Union, intersection, difference, complement, power set and more on a live Venn diagram.',
      board: { tx: 52, ty: 32 },
      region: { x0: 44, y0: 24, x1: 62, y1: 40 }
    },
    {
      id: 'tree',
      name: 'Tree Forest',
      color: '#4c8c3a',
      letter: 'T',
      summary: 'Walk a random tree in preorder, inorder or postorder, then try it yourself.',
      board: { tx: 32, ty: 12 },
      region: { x0: 20, y0: 2, x1: 44, y1: 20 }
    },
    {
      id: 'dfa',
      name: 'DFA Station',
      color: '#6f55e0',
      letter: 'D',
      summary: 'Build a DFA, step through a string and flip it into its complement.',
      board: { tx: 32, ty: 52 },
      region: { x0: 20, y0: 44, x1: 44, y1: 62 }
    }
  ];

  AC.getDistrict = function (id) {
    return AC.districts.find(d => d.id === id) || null;
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
