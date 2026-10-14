/* dressing.js: Procedural district landmarks, Venn ponds, tree lanterns, train cars, and fountain. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let animTime = 0;

  AC.dressing = {
    update(dt) {
      animTime += dt;
    },

    drawGroundDressing(ctx, camera) {
      if (!ctx || !camera) return;

      // 1. HUB FOUNTAIN (tx: 32, ty: 32)
      const fx = 32 * 16 + 8 - camera.x;
      const fy = 32 * 16 + 8 - camera.y;
      if (camera.isVisible(32 * 16 - 16, 32 * 16 - 16, 48, 48)) {
        // Outer stone basin
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(fx, fy, 16, 0, Math.PI * 2);
        ctx.fill();

        // Inner water pool
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(fx, fy, 13, 0, Math.PI * 2);
        ctx.fill();

        // Water ripple
        const rip = (Math.sin(animTime * 3) + 1) * 4 + 3;
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(fx, fy, rip, 0, Math.PI * 2);
        ctx.stroke();

        // Center spout
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. STRING STREET RAILWAY & TRAIN CARS (Around tx: 10..15, ty: 30..33)
      if (camera.isVisible(8 * 16, 30 * 16, 8 * 16, 4 * 16)) {
        const rx = 8 * 16 - camera.x;
        const ry = 30 * 16 - camera.y;

        // Steel rail lines
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx, ry + 20);
        ctx.lineTo(rx + 110, ry + 20);
        ctx.moveTo(rx, ry + 28);
        ctx.lineTo(rx + 110, ry + 28);
        ctx.stroke();

        // Wooden ties
        ctx.fillStyle = '#78350f';
        for (let x = 0; x < 110; x += 10) {
          ctx.fillRect(rx + x, ry + 18, 4, 12);
        }

        // Stationary locomotive box
        ctx.fillStyle = '#e0663f';
        ctx.fillRect(rx + 24, ry + 14, 20, 14);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('Σ', rx + 30, ry + 24);
      }

      // 3. SET PARK VENN PONDS (tx: 50..55, ty: 30..34)
      if (camera.isVisible(48 * 16, 29 * 16, 8 * 16, 6 * 16)) {
        const vx1 = 50 * 16 + 8 - camera.x;
        const vy1 = 31 * 16 + 8 - camera.y;
        const vx2 = 53 * 16 + 8 - camera.x;
        const vy2 = 31 * 16 + 8 - camera.y;

        // Circle A pond
        ctx.fillStyle = 'rgba(31, 157, 138, 0.55)';
        ctx.beginPath();
        ctx.arc(vx1, vy1, 24, 0, Math.PI * 2);
        ctx.fill();

        // Circle B pond
        ctx.fillStyle = 'rgba(14, 165, 233, 0.55)';
        ctx.beginPath();
        ctx.arc(vx2, vy2, 24, 0, Math.PI * 2);
        ctx.fill();

        // Overlap boundary
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(vx1, vy1, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(vx2, vy2, 24, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. TREE FOREST LANTERNS (tx: 30..34, ty: 10..15)
      if (camera.isVisible(28 * 16, 8 * 16, 8 * 16, 8 * 16)) {
        const treeNodes = [
          { tx: 32, ty: 9, k: '4' },
          { tx: 30, ty: 11, k: '2' },
          { tx: 34, ty: 11, k: '6' }
        ];

        // Connecting vine lines
        const root = treeNodes[0];
        const left = treeNodes[1];
        const right = treeNodes[2];

        ctx.strokeStyle = '#4c8c3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(root.tx * 16 + 8 - camera.x, root.ty * 16 + 8 - camera.y);
        ctx.lineTo(left.tx * 16 + 8 - camera.x, left.ty * 16 + 8 - camera.y);
        ctx.moveTo(root.tx * 16 + 8 - camera.x, root.ty * 16 + 8 - camera.y);
        ctx.lineTo(right.tx * 16 + 8 - camera.x, right.ty * 16 + 8 - camera.y);
        ctx.stroke();

        for (const n of treeNodes) {
          const nx = n.tx * 16 + 8 - camera.x;
          const ny = n.ty * 16 + 8 - camera.y;

          ctx.fillStyle = 'rgba(76, 140, 58, 0.3)';
          ctx.beginPath();
          ctx.arc(nx, ny, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(nx, ny, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 7px monospace';
          ctx.fillText(n.k, nx - 2, ny + 2);
        }
      }

      // 5. DFA STATION PLATFORM PADS (tx: 30..34, ty: 50..55)
      if (camera.isVisible(28 * 16, 48 * 16, 8 * 16, 8 * 16)) {
        const dfaPads = [
          { tx: 30, ty: 51, label: 'q0' },
          { tx: 34, ty: 51, label: 'q1' },
          { tx: 34, ty: 55, label: 'q2', accept: true }
        ];

        for (const pad of dfaPads) {
          const px = pad.tx * 16 + 8 - camera.x;
          const py = pad.ty * 16 + 8 - camera.y;

          ctx.fillStyle = '#312e81';
          ctx.beginPath();
          ctx.arc(px, py, 11, 0, Math.PI * 2);
          ctx.fill();

          if (pad.accept) {
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = '#a5b4fc';
          ctx.font = 'bold 7px monospace';
          ctx.fillText(pad.label, px - 4, py + 2);
        }
      }

      // 6. EXAM TOWER (Northeastern Plaza: tx 36..39, ty 25..28)
      if (camera.isVisible(36 * 16, 25 * 16, 4 * 16, 4 * 16)) {
        const ex = 36 * 16 - camera.x;
        const ey = 25 * 16 - camera.y;

        const allStamps = AC.progress ? AC.progress.stampCount() >= 4 : false;

        // Stone Spire Base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(ex, ey, 64, 64);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(ex, ey, 64, 64);

        // Entrance Doorway
        ctx.fillStyle = allStamps ? '#10b981' : '#b91c1c';
        ctx.fillRect(ex + 24, ey + 40, 16, 24);

        // Tower Emblem / Seal
        ctx.fillStyle = allStamps ? '#34d399' : '#f87171';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(allStamps ? 'UNSEALED' : 'SEALED', ex + 32, ey + 24);
      }
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
