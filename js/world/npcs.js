/* npcs.js: Resident station NPCs using dynamically recolored Meppo sprites. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  // --- SPRITESHEET CONFIG ---
  const MEPPO_SRC = 'assets/meppo.png'; // Update path if needed
  const CELL_SIZE = 64;
  const DRAW_SIZE = 24; // Crisp pixel divisor of 128/64
  const IDLE_FRAMES = 5;
  const IDLE_FPS = 6;

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

  // Global animation timer for all NPCs
  let globalAnimTimer = 0;
  let globalAnimFrame = 0;

  // Load and pre-render tinted spritesheets
  const baseSheet = new Image();
  baseSheet.onload = function () {
    NPCS_DATA.forEach(npc => {
      npc.tintedSheet = createTintedSheet(baseSheet, npc.color);
    });
  };
  baseSheet.src = MEPPO_SRC;

  // Helper: Generates a recolored version of the Meppo spritesheet in memory
  function createTintedSheet(img, hexColor) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Parse target hex color to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Isolate the red body pixels (ignoring white eyes and black pupils)
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // If not transparent
        const pR = data[i];
        const pG = data[i + 1];
        const pB = data[i + 2];
        
        // If Red channel dominates (it's the red body, not a white eye or black pupil)
        if (pR > pG + 30 && pR > pB + 30) {
          // Normalize shading based on Meppo's original base red (~158)
          const shade = pR / 158; 
          data[i] = Math.min(255, r * shade);     // R
          data[i + 1] = Math.min(255, g * shade); // G
          data[i + 2] = Math.min(255, b * shade); // B
        }
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

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

    update(dt) {
      // If dt is undefined or broken, default to 0.016 (roughly 60fps)
      const safeDt = (typeof dt === 'number' && dt > 0) ? dt : 0.016; 
      
      const frameDuration = 1 / IDLE_FPS;
      globalAnimTimer += safeDt;
      
      if (globalAnimTimer >= frameDuration) {
        globalAnimTimer -= frameDuration;
        globalAnimFrame = (globalAnimFrame + 1) % IDLE_FRAMES;
      }
    },

    draw(ctx, camera) {
      if (!ctx || !camera) return;

      for (const npc of NPCS_DATA) {
        const wx = npc.tx * 16;
        const wy = npc.ty * 16;

        if (!camera.isVisible(wx, wy, 16, 20)) continue;

        const sx = Math.round(wx - camera.x);
        const sy = Math.round(wy - camera.y);

        // 1. Foot Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(sx + 3, sy + 13, 10, 3);

        // 2. Draw recolored Meppo Sprite
        if (npc.tintedSheet) {
          ctx.imageSmoothingEnabled = false;
          
          const srcX = globalAnimFrame * CELL_SIZE;
          const srcY = 0; // Row 0 is the Idle animation

          const offsetX = Math.floor((16 - DRAW_SIZE) / 2);
          const offsetY = (16 - DRAW_SIZE) - 4; // Shift up to align feet

          // NPCs face right by default, so we flip them to face left (Meppo's default) or keep them right
          ctx.drawImage(
            npc.tintedSheet,
            srcX, srcY, CELL_SIZE, CELL_SIZE,
            sx + offsetX, sy + offsetY, DRAW_SIZE, DRAW_SIZE
          );
          continue; 
        }

        // 3. Loading Fallback
        ctx.fillStyle = npc.color;
        ctx.fillRect(sx + 4, sy + 2, 8, 13);
      }
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);