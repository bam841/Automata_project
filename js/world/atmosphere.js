/* atmosphere.js: Day/night lighting cycle, lamp glow halos, and drifting firefly particles. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let timeOfDay = 0.25; // 0..1 (0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = dusk)
  let dayNightMode = 'auto'; // 'auto' | 'day' | 'night'
  let fireflies = [];
  const FIREFLY_COUNT = 24;

  function initFireflies() {
    fireflies = [];
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      fireflies.push({
        x: Math.random() * (64 * 16),
        y: Math.random() * (64 * 16),
        phase: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 8,
        speedY: (Math.random() - 0.5) * 8
      });
    }
  }

  initFireflies();

  AC.atmosphere = {
    setMode(mode) {
      dayNightMode = mode;
      if (AC.progress) {
        const p = AC.progress.get();
        if (p && p.settings) {
          p.settings.theme = mode;
          AC.progress.save();
        }
      }
    },

    getMode() {
      return dayNightMode;
    },

    cycleMode() {
      const modes = ['auto', 'day', 'night'];
      const nextIdx = (modes.indexOf(dayNightMode) + 1) % modes.length;
      this.setMode(modes[nextIdx]);
      return dayNightMode;
    },

    update(dt) {
      if (dayNightMode === 'auto') {
        timeOfDay = (timeOfDay + dt * 0.005) % 1; // ~200s full day/night cycle
      } else if (dayNightMode === 'day') {
        timeOfDay = 0.5;
      } else if (dayNightMode === 'night') {
        timeOfDay = 0.0;
      }

      // Update fireflies
      for (const f of fireflies) {
        f.x += f.speedX * dt;
        f.y += f.speedY * dt;
        f.phase += dt * 3;

        // Wrap around world
        if (f.x < 0) f.x += 64 * 16;
        if (f.x > 64 * 16) f.x -= 64 * 16;
        if (f.y < 0) f.y += 64 * 16;
        if (f.y > 64 * 16) f.y -= 64 * 16;
      }
    },

    draw(ctx, camera) {
      if (!ctx || !camera) return;

      // Calculate night darkness factor (0 = bright daylight, 0.4 = deep night)
      let nightFactor = 0;
      if (dayNightMode === 'night') {
        nightFactor = 0.42;
      } else if (dayNightMode === 'day') {
        nightFactor = 0;
      } else {
        // Sine wave: min at noon (0.5), max at midnight (0.0/1.0)
        nightFactor = Math.max(0, (Math.cos(timeOfDay * Math.PI * 2) + 0.3) * 0.35);
      }

      if (nightFactor > 0.05) {
        ctx.save();
        ctx.fillStyle = `rgba(10, 16, 36, ${nightFactor})`;
        ctx.fillRect(0, 0, 320, 180);

        // Lamp light halos
        const lampPoints = [
          { tx: 32, ty: 32, r: 28 }, // Central Fountain
          { tx: 12, ty: 32, r: 22 }, // String Street Board
          { tx: 52, ty: 32, r: 22 }, // Set Park Board
          { tx: 32, ty: 12, r: 22 }, // Tree Forest Board
          { tx: 32, ty: 52, r: 22 }  // DFA Station Board
        ];

        ctx.globalCompositeOperation = 'destination-out';
        for (const lamp of lampPoints) {
          const sx = lamp.tx * 16 + 8 - camera.x;
          const sy = lamp.ty * 16 + 8 - camera.y;
          if (sx < -40 || sx > 360 || sy < -40 || sy > 220) continue;

          const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, lamp.r);
          grad.addColorStop(0, 'rgba(0,0,0,0.8)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, lamp.r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Draw fireflies when twilight or night
      if (nightFactor > 0.15) {
        for (const f of fireflies) {
          if (!camera.isVisible(f.x, f.y, 4, 4)) continue;

          const sx = f.x - camera.x;
          const sy = f.y - camera.y;
          const glow = (Math.sin(f.phase) + 1) * 0.5;

          ctx.fillStyle = `rgba(220, 255, 120, ${glow * 0.8})`;
          ctx.fillRect(sx, sy, 2, 2);
        }
      }
    }
  };

  // Keyboard shortcut T for toggling day/night
  if (typeof root.addEventListener !== 'undefined') {
    root.addEventListener('keydown', e => {
      if (e.key === 't' || e.key === 'T') {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (AC.getState && AC.getState() === 'world') {
          e.preventDefault();
          AC.atmosphere.cycleMode();
        }
      }
    });
  }

})(typeof globalThis !== 'undefined' ? globalThis : window);
