/* npcs.js: Resident station NPCs with hints and interaction triggers. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  const NPCS_DATA = [
    {
      id: 'npc-casey',
      name: 'Conductor Casey',
      district: 'str',
      title: 'String Conductor',
      tx: 10,
      ty: 33,
      color: '#e0663f',
      lines: [
        'All aboard the String Express! Letters couple together just like train cars.',
        'Watch your cuts: cutting a train of length n leaves n + 1 possible prefixes, from ε to the whole train.',
        'Keep an eye out for palindromes: words where w = wᴿ, like "radar" or "level"!'
      ]
    },
    {
      id: 'npc-brooke',
      name: 'Botanist Brooke',
      district: 'set',
      title: 'Park Botanist',
      tx: 50,
      ty: 33,
      color: '#1f9d8a',
      lines: [
        'Welcome to Set Park! Notice how our two ponds overlap in the center like a Venn diagram.',
        'Remember: symmetric difference A Δ B gives elements in either set, but never both!',
        'The power set 𝒫(A) always grows as 2ⁿ, and never forget to count the empty set ∅!'
      ]
    },
    {
      id: 'npc-rowan',
      name: 'Ranger Rowan',
      district: 'tree',
      title: 'Forest Ranger',
      tx: 30,
      ty: 13,
      color: '#4c8c3a',
      lines: [
        'The canopy grows according to strict rules: smaller keys branch left, larger keys branch right.',
        'If you walk our trails in Inorder (Left, Node, Right), you will always visit the trees in sorted order!',
        'Preorder visits roots first (NLR), while Postorder visits leaves first (LRN).'
      ]
    },
    {
      id: 'npc-sam',
      name: 'Signalman Sam',
      district: 'dfa',
      title: 'Station Signalman',
      tx: 30,
      ty: 53,
      color: '#6f55e0',
      lines: [
        'Signals green! Our deterministic automaton reads input tape one symbol at a time.',
        'Because transition function δ is total, every state knows exactly where to route next.',
        'Complementation simply flips the switch on accepting states: Q \\ F accepts all previously rejected inputs!'
      ]
    }
  ];

  AC.npcs = {
    getAll() {
      return NPCS_DATA;
    },

    get(id) {
      return NPCS_DATA.find(n => n.id === id) || null;
    },

    initTriggers() {
      if (!AC.triggers || typeof AC.triggers.register !== 'function') return;

      for (const npc of NPCS_DATA) {
        AC.triggers.register({
          id: `trigger-${npc.id}`,
          rect: { x: npc.tx * 16, y: npc.ty * 16, w: 16, h: 16 },
          prompt: `E  Talk to ${npc.name}`,
          onInteract() {
            if (AC.dialogue && typeof AC.dialogue.show === 'function') {
              AC.dialogue.show(npc.name, npc.lines);
            }
          }
        });
      }
    },

    draw(ctx, camera) {
      if (!ctx || !camera) return;

      for (const npc of NPCS_DATA) {
        const wx = npc.tx * 16;
        const wy = npc.ty * 16;

        if (!camera.isVisible(wx, wy, 16, 20)) continue;

        const sx = wx - camera.x;
        const sy = wy - camera.y;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(sx + 8, sy + 15, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // NPC Body
        ctx.fillStyle = npc.color;
        ctx.fillRect(sx + 3, sy + 6, 10, 8);

        // Head
        ctx.fillStyle = '#ffdfba';
        ctx.fillRect(sx + 4, sy + 1, 8, 7);

        // Hat / Hair in district color
        ctx.fillStyle = npc.color;
        ctx.fillRect(sx + 3, sy, 10, 3);

        // Eyes
        ctx.fillStyle = '#111';
        ctx.fillRect(sx + 6, sy + 4, 1, 2);
        ctx.fillRect(sx + 9, sy + 4, 1, 2);
      }
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
