/* hud.js: In-game HUD overlay, stamp badges, minimap, quest tracker, and prompt bubbles. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  AC.hud = {
    draw(ctx, game) {
      if (!ctx || !game || !game.player || !game.camera) return;

      const p = game.player;
      const cam = game.camera;

      // 1. Top-Left: 4 Stamp Badges
      const districts = AC.districts || [];
      const badgeX0 = 6;
      const badgeY0 = 6;
      const badgeSize = 14;
      const spacing = 18;

      ctx.save();
      for (let i = 0; i < districts.length; i++) {
        const d = districts[i];
        const bx = badgeX0 + i * spacing;
        const by = badgeY0;
        const isStamped = AC.progress ? AC.progress.hasStamp(d.id) : false;

        if (isStamped) {
          // Stamped: Solid colored badge with white checkmark
          ctx.fillStyle = d.color;
          ctx.fillRect(bx, by, badgeSize, badgeSize);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, badgeSize - 1, badgeSize - 1);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('✓', bx + badgeSize / 2, by + 10);
        } else {
          // Unstamped: Dark slate box with colored initial letter
          ctx.fillStyle = 'rgba(16, 27, 38, 0.75)';
          ctx.fillRect(bx, by, badgeSize, badgeSize);
          ctx.strokeStyle = '#3f5368';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, badgeSize - 1, badgeSize - 1);

          ctx.fillStyle = d.color;
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(d.letter, bx + badgeSize / 2, by + 10);
        }
      }

      // Shard counter badge
      const shardCount = AC.progress ? (AC.progress.get().shards || []).length : 0;
      ctx.fillStyle = 'rgba(16, 27, 38, 0.75)';
      ctx.fillRect(badgeX0 + 4 * spacing, badgeY0, 42, badgeSize);
      ctx.strokeStyle = '#3f5368';
      ctx.strokeRect(badgeX0 + 4 * spacing + 0.5, badgeY0 + 0.5, 41, badgeSize - 1);

      ctx.fillStyle = '#e6eef5';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${shardCount}/12`, badgeX0 + 4 * spacing + 21, badgeY0 + 10);

      // Player name & key shortcuts guide
      const pName = (AC.progress && typeof AC.progress.get === 'function' && AC.progress.get().name) || 'Student';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${pName} | [J] Journal [H] Hint [U] Unlock All`, badgeX0, badgeY0 + badgeSize + 8);

      // Active Quest Objective Tracker
      let questText = '';
      let questColor = '#fbbf24';
      const stampCount = AC.progress ? AC.progress.stampCount() : 0;
      if (stampCount >= 4) {
        questText = '★ Goal: Enter the Exam Tower in the Central Hub!';
        questColor = '#f59e0b';
      } else {
        const unstamped = (AC.districts || []).filter(d => !AC.progress.hasStamp(d.id));
        if (unstamped.length > 0) {
          const target = unstamped[0];
          const isUnlocked = AC.quests ? AC.quests.isGateUnlocked(target.id) : true;
          const q = AC.quests ? AC.quests.get(target.id) : null;
          if (!isUnlocked && q) {
            questText = `📋 Quest: Find ${q.itemName} (${q.symbol}) in Plaza`;
            questColor = q.color;
          } else {
            questText = `🎯 Goal: Master ${target.name} & claim stamp`;
            questColor = target.color;
          }
        }
      }

      if (questText) {
        ctx.font = 'bold 7px monospace';
        const qw = Math.min(256, ctx.measureText(questText).width + 10);
        ctx.fillStyle = 'rgba(11, 19, 32, 0.85)';
        ctx.fillRect(badgeX0, badgeY0 + badgeSize + 11, qw, 11);
        ctx.strokeStyle = questColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(badgeX0 + 0.5, badgeY0 + badgeSize + 11.5, qw - 1, 10);

        ctx.fillStyle = questColor;
        ctx.textAlign = 'left';
        ctx.fillText(questText, badgeX0 + 4, badgeY0 + badgeSize + 19);
      }

      // 2. Top-Right: Minimap Radar (44x44 px)
      const mmX = 270;
      const mmY = 6;
      const mmW = 44;
      const mmH = 44;

      ctx.fillStyle = 'rgba(10, 16, 23, 0.85)';
      ctx.fillRect(mmX, mmY, mmW, mmH);
      ctx.strokeStyle = '#3a4e63';
      ctx.lineWidth = 1;
      ctx.strokeRect(mmX + 0.5, mmY + 0.5, mmW - 1, mmH - 1);

      // Draw district zones on minimap
      // Hub (center)
      ctx.fillStyle = '#556677';
      ctx.fillRect(mmX + 16, mmY + 16, 12, 12);

      // 4 Districts
      for (const d of districts) {
        const dx = mmX + Math.round((d.board.tx / 64) * mmW);
        const dy = mmY + Math.round((d.board.ty / 64) * mmH);
        ctx.fillStyle = d.color;
        ctx.fillRect(dx - 2, dy - 2, 4, 4);
      }

      // Player blip
      const playerMmX = mmX + Math.round((p.x / (64 * 16)) * mmW);
      const playerMmY = mmY + Math.round((p.y / (64 * 16)) * mmH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(playerMmX - 1, playerMmY - 1, 3, 3);

      // 3. Interaction Prompt Bubble above player
      const nearestTrigger = AC.triggers ? AC.triggers.getNearest(p.x + 8, p.y + 8) : null;
      if (nearestTrigger && nearestTrigger.prompt) {
        const screenPx = Math.round(p.x - cam.x + 8);
        const screenPy = Math.round(p.y - cam.y - 8);

        ctx.font = 'bold 8px monospace';
        const textWidth = ctx.measureText(nearestTrigger.prompt).width;
        const bubbleW = textWidth + 10;
        const bubbleH = 14;
        const bubbleX = screenPx - bubbleW / 2;
        const bubbleY = screenPy - bubbleH;

        // Dark pill background with glowing border
        ctx.fillStyle = 'rgba(16, 27, 38, 0.9)';
        ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
        ctx.strokeStyle = '#7aa7ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(bubbleX + 0.5, bubbleY + 0.5, bubbleW - 1, bubbleH - 1);

        // Prompt text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(nearestTrigger.prompt, screenPx, bubbleY + 10);
      }

      ctx.restore();
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
