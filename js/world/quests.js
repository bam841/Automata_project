/* quests.js: Thematic station prerequisite quests, collectible Hub resources, and road gate barriers. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  const QUESTS_DATA = [
    {
      id: 'str',
      district: 'str',
      name: 'String Street Train Fuel',
      itemName: 'Alphabet Cartridge (Σ)',
      symbol: 'Σ',
      color: '#e0663f',
      tx: 28,
      ty: 32,
      gate: { axis: 'x', coord: 23, min: 31, max: 33, label: 'West Railroad Gate' },
      theoryText: 'A formal alphabet Σ is the non-empty finite set of symbols used to construct strings.',
      unlockedMsg: 'West Railroad Gate is now OPEN!'
    },
    {
      id: 'set',
      district: 'set',
      name: 'Venn Optical Calibrator',
      itemName: 'Dual Venn Prisms',
      symbol: 'A∩B',
      color: '#1f9d8a',
      tx: 36,
      ty: 32,
      gate: { axis: 'x', coord: 41, min: 31, max: 33, label: 'East Botanical Gate' },
      theoryText: 'Subsets partition universe U = {1..8}. The Venn prisms resolve intersections and unions.',
      unlockedMsg: 'East Botanical Gate is now OPEN!'
    },
    {
      id: 'tree',
      district: 'tree',
      name: 'Canopy Navigation Guide',
      itemName: 'BST Branch Compass',
      symbol: 'BST',
      color: '#4c8c3a',
      tx: 32,
      ty: 27,
      gate: { axis: 'y', coord: 23, min: 31, max: 33, label: 'North Forest Trellis' },
      theoryText: 'In a BST, keys branch Left < Node < Right. The compass ensures correct trail navigation.',
      unlockedMsg: 'North Forest Trellis is now OPEN!'
    },
    {
      id: 'dfa',
      district: 'dfa',
      name: 'Transit Route Generator',
      itemName: 'Transition Relay (δ)',
      symbol: 'δ',
      color: '#6f55e0',
      tx: 32,
      ty: 38,
      gate: { axis: 'y', coord: 41, min: 31, max: 33, label: 'South Subway Gate' },
      theoryText: 'Deterministic automata require total transition function δ mapping (state, symbol) to a unique next state.',
      unlockedMsg: 'South Subway Gate is now OPEN!'
    }
  ];

  let animTimer = 0;
  let activeCard = null; // { title, itemName, symbol, color, text, timer }

  AC.quests = {
    getAll() {
      return QUESTS_DATA;
    },

    get(id) {
      return QUESTS_DATA.find(q => q.id === id) || null;
    },

    isGateUnlocked(id) {
      if (!AC.progress) return true;
      return AC.progress.isGateUnlocked(id);
    },

    initTriggers() {
      if (!AC.triggers || typeof AC.triggers.register !== 'function') return;

      for (const q of QUESTS_DATA) {
        const g = q.gate;
        const rect = g.axis === 'x'
          ? { x: g.coord * 16 - 8, y: g.min * 16, w: 32, h: (g.max - g.min + 1) * 16 }
          : { x: g.min * 16, y: g.coord * 16 - 8, w: (g.max - g.min + 1) * 16, h: 32 };

        AC.triggers.register({
          id: 'gate-' + q.id,
          rect,
          get prompt() {
            const unlocked = AC.quests.isGateUnlocked(q.id);
            return unlocked ? '' : `E  ${g.label} (Locked: Needs ${q.symbol})`;
          },
          onInteract() {
            const unlocked = AC.quests.isGateUnlocked(q.id);
            if (!unlocked && AC.dialogue) {
              AC.dialogue.show(g.label, [
                `Security Barrier active! Prerequisite item: ${q.itemName}.`,
                `Theory Concept: ${q.theoryText}`,
                'Search the Central Plaza near the fountain to find it!'
              ]);
            }
          }
        });

        // Quest Item Pedestal Trigger
        AC.triggers.register({
          id: 'item-' + q.id,
          rect: { x: q.tx * 16, y: q.ty * 16, w: 16, h: 16 },
          get prompt() {
            const unlocked = AC.quests.isGateUnlocked(q.id);
            return unlocked ? '' : `E  Examine ${q.itemName}`;
          },
          onInteract() {
            if (!AC.quests.isGateUnlocked(q.id)) {
              if (AC.progress) {
                AC.progress.addItem(q.id);
              }
              if (AC.quests.showCard) {
                AC.quests.showCard(q);
              }
            }
          }
        });
      }
    },

    /**
     * Checks if (tx, ty) intersects any locked road gate barrier.
     */
    isSolid(tx, ty) {
      for (const q of QUESTS_DATA) {
        if (this.isGateUnlocked(q.id)) continue;
        const g = q.gate;
        if (g.axis === 'x') {
          if (tx === g.coord && ty >= g.min && ty <= g.max) return true;
        } else {
          if (ty === g.coord && tx >= g.min && tx <= g.max) return true;
        }
      }
      return false;
    },

    /**
     * Returns nearest quest item within maxDist px from (px, py).
     */
    getNearestItem(px, py, maxDist = 20) {
      let nearest = null;
      let minDist = maxDist;

      for (const q of QUESTS_DATA) {
        if (this.isGateUnlocked(q.id)) continue;
        const ix = q.tx * 16 + 8;
        const iy = q.ty * 16 + 8;
        const d = Math.hypot(ix - px, iy - py);
        if (d <= minDist) {
          minDist = d;
          nearest = q;
        }
      }
      return nearest;
    },

    /**
     * Returns active card notification if any.
     */
    getActiveCard() {
      return activeCard;
    },

    dismissCard() {
      activeCard = null;
    },

    showCard(quest) {
      activeCard = {
        title: 'RESOURCE ACQUIRED!',
        itemName: quest.itemName,
        symbol: quest.symbol,
        color: quest.color,
        theoryText: quest.theoryText,
        unlockedMsg: quest.unlockedMsg,
        timer: 3.5
      };
      if (AC.audio && typeof AC.audio.play === 'function') {
        AC.audio.play('collect');
      }
    },

    update(dt, player) {
      animTimer += dt;

      if (activeCard) {
        activeCard.timer -= dt;
        if (activeCard.timer <= 0) {
          activeCard = null;
        }
      }

      if (!player) return;

      const px = player.x + 8;
      const py = player.y + 12;

      // Auto-collect or check proximity
      for (const q of QUESTS_DATA) {
        if (this.isGateUnlocked(q.id)) continue;
        const ix = q.tx * 16 + 8;
        const iy = q.ty * 16 + 8;
        const dist = Math.hypot(px - ix, py - iy);

        if (dist <= 14) {
          if (AC.progress) {
            AC.progress.addItem(q.id);
          }
          this.showCard(q);
        }
      }
    },

    draw(ctx, camera) {
      if (!ctx || !camera) return;

      this.drawGates(ctx, camera);
      this.drawItems(ctx, camera);
      this.drawCardOverlay(ctx);
    },

    drawGates(ctx, camera) {
      for (const q of QUESTS_DATA) {
        const unlocked = this.isGateUnlocked(q.id);
        const g = q.gate;
        const isX = g.axis === 'x';
        const wx = isX ? g.coord * 16 : g.min * 16;
        const wy = isX ? g.min * 16 : g.coord * 16;
        const w = isX ? 16 : (g.max - g.min + 1) * 16;
        const h = isX ? (g.max - g.min + 1) * 16 : 16;

        if (!camera.isVisible(wx - 8, wy - 8, w + 16, h + 16)) continue;
        const sx = wx - camera.x;
        const sy = wy - camera.y;

        if (!unlocked) {
          const pulse = (Math.sin(animTimer * 6) + 1) * 0.25 + 0.5;
          ctx.fillStyle = `rgba(220, 38, 38, ${pulse * 0.4})`;
          ctx.fillRect(isX ? sx + 4 : sx, isX ? sy : sy + 4, isX ? 8 : w, isX ? h : 8);

          // Posts at ends
          ctx.fillStyle = '#1e293b';
          if (isX) {
            ctx.fillRect(sx + 2, sy - 2, 12, 4);
            ctx.fillRect(sx + 2, sy + h - 2, 12, 4);
          } else {
            ctx.fillRect(sx - 2, sy + 2, 4, 12);
            ctx.fillRect(sx + w - 2, sy + 2, 4, 12);
          }

          // Red laser beam
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(isX ? sx + 8 : sx, isX ? sy : sy + 8);
          ctx.lineTo(isX ? sx + 8 : sx + w, isX ? sy + h : sy + 8);
          ctx.stroke();

          // Lock badge in center
          const cx = sx + w / 2;
          const cy = sy + h / 2;
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔒', cx, cy);
        } else {
          // Unlocked stone arch markers
          ctx.fillStyle = '#64748b';
          if (isX) {
            ctx.fillRect(sx + 1, sy - 2, 6, 6);
            ctx.fillRect(sx + 1, sy + h - 4, 6, 6);
          } else {
            ctx.fillRect(sx - 2, sy + 1, 6, 6);
            ctx.fillRect(sx + w - 4, sy + 1, 6, 6);
          }
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(sx + (isX ? 3 : 0), sy + (isX ? 0 : 3), 2, 2);
          ctx.fillRect(sx + (isX ? 3 : w - 2), sy + (isX ? h - 2 : 3), 2, 2);
        }
      }
    },

    drawItems(ctx, camera) {
      for (const q of QUESTS_DATA) {
        if (this.isGateUnlocked(q.id)) continue;

        const wx = q.tx * 16;
        const wy = q.ty * 16;

        if (!camera.isVisible(wx - 8, wy - 8, 32, 32)) continue;

        const sx = wx - camera.x;
        const bob = Math.sin(animTimer * 4 + q.tx) * 3;
        const sy = wy - camera.y + bob;

        // Glowing Pulsing Halo
        const glowPulse = (Math.sin(animTimer * 5) + 1) * 0.15 + 0.25;
        ctx.fillStyle = q.color;
        ctx.globalAlpha = glowPulse;
        ctx.beginPath();
        ctx.arc(sx + 8, sy + 8, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Pedestal base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(sx + 2, sy + 12, 12, 4);
        ctx.fillStyle = q.color;
        ctx.fillRect(sx + 3, sy + 11, 10, 1);

        // Hovering Gem / Container
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(sx + 1, sy + 1, 14, 11);
        ctx.strokeStyle = q.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 1.5, sy + 1.5, 13, 10);

        // Symbol Glyph
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(q.symbol, sx + 8, sy + 7);
      }
    },

    drawCardOverlay(ctx) {
      if (!activeCard) return;

      const c = activeCard;
      const cw = 280;
      const ch = 52;
      const cx = (320 - cw) / 2;
      const cy = 20;

      ctx.save();
      // Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(cx + 2, cy + 2, cw, ch);

      // Card Background
      ctx.fillStyle = '#0b1320';
      ctx.fillRect(cx, cy, cw, ch);

      // District Border Highlight
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx + 0.5, cy + 0.5, cw - 1, ch - 1);

      // Icon Pill Left
      ctx.fillStyle = c.color;
      ctx.fillRect(cx + 8, cy + 8, 36, 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.symbol, cx + 26, cy + 26);

      // Header Label
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(c.title, cx + 50, cy + 14);

      // Item Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(c.itemName, cx + 50, cy + 24);

      // Theory Text
      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px monospace';
      ctx.fillText(c.theoryText.length > 52 ? c.theoryText.slice(0, 50) + '…' : c.theoryText, cx + 50, cy + 34);

      // Unlocked Gate status
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 7px monospace';
      ctx.fillText(`✓ ${c.unlockedMsg}`, cx + 50, cy + 44);

      ctx.restore();
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
