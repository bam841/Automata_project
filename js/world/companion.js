/* companion.js: Floating companion "Eps" following player trail and providing H-key hints. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  const history = [];
  const HISTORY_LENGTH = 14;
  let companionX = 32 * 16;
  let companionY = 34 * 16;
  let floatTime = 0;
  let activeHint = null;
  let hintTimer = 0;

  function getNearestDistrict(px, py) {
    if (!AC.districts) return null;
    let nearest = null;
    let minDist = Infinity;

    for (const d of AC.districts) {
      const bx = d.board.tx * 16;
      const by = d.board.ty * 16;
      const dist = Math.hypot(px - bx, py - by);
      if (dist < minDist) {
        minDist = dist;
        nearest = d;
      }
    }
    return nearest;
  }

  AC.companion = {
    init(spawnX, spawnY) {
      companionX = spawnX;
      companionY = spawnY;
      history.length = 0;
      activeHint = null;
    },

    update(dt, player) {
      floatTime += dt;

      if (hintTimer > 0) {
        hintTimer -= dt;
        if (hintTimer <= 0) activeHint = null;
      }

      if (!player) return;

      // Track player position
      history.push({ x: player.x, y: player.y });
      if (history.length > HISTORY_LENGTH) {
        history.shift();
      }

      // Smooth lag behind player
      const target = history[0] || player;
      companionX += (target.x - companionX) * 0.15;
      companionY += (target.y - companionY) * 0.15;
    },

    triggerHint(player) {
      if (!player) return;
      const nearest = getNearestDistrict(player.x, player.y);
      if (!nearest) return;

      const hasStamp = AC.progress ? AC.progress.hasStamp(nearest.id) : false;
      const seenLesson = AC.progress ? AC.progress.hasSeenLesson(nearest.id) : false;

      let msg = '';
      if (hasStamp) {
        msg = `You've already mastered ${nearest.name}! Let's find unstamped stations or hunt for shards!`;
      } else if (!seenLesson) {
        msg = `Head to the ${nearest.name} board and press [E] to study the Learn blackboard!`;
      } else {
        msg = `You've reviewed ${nearest.name}! Take on the Practice and Challenge boards to claim your stamp!`;
      }

      activeHint = msg;
      hintTimer = 4.5;

      if (AC.audio && typeof AC.audio.play === 'function') {
        AC.audio.play('select');
      }
    },

    draw(ctx, camera) {
      if (!ctx || !camera) return;

      const sx = companionX - camera.x;
      const bob = Math.sin(floatTime * 5) * 3;
      const sy = companionY - camera.y - 12 + bob;

      // Glow halo
      ctx.fillStyle = 'rgba(120, 220, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(sx + 8, sy + 8, 9, 0, Math.PI * 2);
      ctx.fill();

      // Body (Eps orb)
      ctx.fillStyle = '#8ee3ff';
      ctx.beginPath();
      ctx.arc(sx + 8, sy + 8, 5, 0, Math.PI * 2);
      ctx.fill();

      // Antenna
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + 8, sy + 3);
      ctx.lineTo(sx + 8, sy);
      ctx.stroke();

      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(sx + 8, sy - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#083344';
      ctx.fillRect(sx + 6, sy + 7, 1, 2);
      ctx.fillRect(sx + 9, sy + 7, 1, 2);

      // Hint bubble if active
      if (activeHint && hintTimer > 0) {
        ctx.font = '10px system-ui, sans-serif';
        const tw = Math.min(220, ctx.measureText(activeHint).width + 12);
        const bx = Math.max(10, Math.min(310 - tw, sx - tw / 2 + 8));
        const by = Math.max(12, sy - 28);

        ctx.fillStyle = 'rgba(16, 27, 38, 0.95)';
        ctx.strokeStyle = '#8ee3ff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(bx, by, tw, 22);
        ctx.strokeRect(bx, by, tw, 22);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activeHint, bx + tw / 2, by + 11, tw - 8);
      }
    }
  };

  // Keyboard shortcut H for hint
  if (typeof root.addEventListener !== 'undefined') {
    root.addEventListener('keydown', e => {
      if (e.key === 'h' || e.key === 'H') {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (AC.getState && AC.getState() === 'world' && AC.game && AC.game.player) {
          e.preventDefault();
          AC.companion.triggerHint(AC.game.player);
        }
      }
    });
  }

})(typeof globalThis !== 'undefined' ? globalThis : window);
