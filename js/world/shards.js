/* shards.js: 12 collectible symbol shards scattered across the 4 districts. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  const SHARDS_DATA = [
    // String Street (3)
    {
      id: 'sigma',
      symbol: 'Σ',
      name: 'Alphabet',
      district: 'str',
      definition: 'Finite, non-empty set of symbols a string is built from.',
      tx: 6,
      ty: 28
    },
    {
      id: 'epsilon',
      symbol: 'ε',
      name: 'Empty string',
      district: 'str',
      definition: 'The string with no symbols; length 0.',
      tx: 16,
      ty: 36
    },
    {
      id: 'reverse',
      symbol: 'w^R',
      name: 'Reverse',
      district: 'str',
      definition: 'The same symbols in the opposite order.',
      tx: 8,
      ty: 36
    },

    // Set Park (3)
    {
      id: 'union',
      symbol: '∪',
      name: 'Union',
      district: 'set',
      definition: 'Everything that is in A or in B (or both).',
      tx: 48,
      ty: 25
    },
    {
      id: 'intersection',
      symbol: '∩',
      name: 'Intersection',
      district: 'set',
      definition: 'Only what is in both A and B.',
      tx: 52,
      ty: 26
    },
    {
      id: 'symdiff',
      symbol: 'Δ',
      name: 'Symmetric difference',
      district: 'set',
      definition: 'What is in exactly one of A and B.',
      tx: 54,
      ty: 36
    },

    // Tree Forest (3)
    {
      id: 'nlr',
      symbol: 'NLR',
      name: 'Preorder',
      district: 'tree',
      definition: 'Visit the node, then the left subtree, then the right.',
      tx: 26,
      ty: 8
    },
    {
      id: 'lnr',
      symbol: 'LNR',
      name: 'Inorder',
      district: 'tree',
      definition: 'Left subtree, node, right subtree (sorted on a BST).',
      tx: 38,
      ty: 8
    },
    {
      id: 'lrn',
      symbol: 'LRN',
      name: 'Postorder',
      district: 'tree',
      definition: 'Left subtree, right subtree, then the node.',
      tx: 32,
      ty: 17
    },

    // DFA Station (3)
    {
      id: 'delta',
      symbol: 'δ',
      name: 'Transition function',
      district: 'dfa',
      definition: 'Maps (state, symbol) to the next state.',
      tx: 26,
      ty: 48
    },
    {
      id: 'q0',
      symbol: 'q₀',
      name: 'Start state',
      district: 'dfa',
      definition: 'The state a run begins in.',
      tx: 38,
      ty: 48
    },
    {
      id: 'accept',
      symbol: 'F',
      name: 'Accepting states',
      district: 'dfa',
      definition: 'If the run ends here, the string is accepted.',
      tx: 32,
      ty: 58
    }
  ];

  let animTimer = 0;

  AC.shards = {
    getAll() {
      return SHARDS_DATA;
    },

    get(id) {
      return SHARDS_DATA.find(s => s.id === id) || null;
    },

    update(dt, player) {
      animTimer += dt;
      if (!player) return;

      const px = player.x + 8;
      const py = player.y + 12;

      for (const shard of SHARDS_DATA) {
        if (AC.progress.hasShard(shard.id)) continue;

        const sx = shard.tx * 16 + 8;
        const sy = shard.ty * 16 + 8;
        const dist = Math.hypot(px - sx, py - sy);

        if (dist <= 14) {
          AC.progress.addShard(shard.id);
          if (AC.audio && typeof AC.audio.play === 'function') {
            AC.audio.play('collect');
          }
        }
      }
    },

    draw(ctx, camera) {
      if (!ctx || !camera) return;

      for (const shard of SHARDS_DATA) {
        if (AC.progress.hasShard(shard.id)) continue;

        const worldX = shard.tx * 16;
        const worldY = shard.ty * 16;

        if (!camera.isVisible(worldX - 8, worldY - 8, 32, 32)) continue;

        const sx = worldX - camera.x;
        const bob = Math.sin(animTimer * 4 + shard.tx) * 3;
        const sy = worldY - camera.y + bob;

        // Glowing backdrop
        ctx.fillStyle = 'rgba(255, 230, 80, 0.3)';
        ctx.beginPath();
        ctx.arc(sx + 8, sy + 8, 9, 0, Math.PI * 2);
        ctx.fill();

        // Shard diamond
        ctx.fillStyle = '#fffa65';
        ctx.beginPath();
        ctx.moveTo(sx + 8, sy + 2);
        ctx.lineTo(sx + 14, sy + 8);
        ctx.lineTo(sx + 8, sy + 14);
        ctx.lineTo(sx + 2, sy + 8);
        ctx.closePath();
        ctx.fill();

        // Symbol
        ctx.fillStyle = '#101720';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(shard.symbol[0], sx + 8, sy + 8);
      }
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
