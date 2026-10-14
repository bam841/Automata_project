/* player.js: Player entity with 4-direction movement, foot collision hitbox, and procedural sprite. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  AC.Player = function (tx = 32, ty = 34) {
    this.x = tx * 16;
    this.y = ty * 16;
    this.w = 16;
    this.h = 16;
    this.speed = 64; // pixels per second (ARCHITECTURE.md default)
    this.facing = 'down';

    // Foot hitbox (10x6 px at feet, ARCHITECTURE.md §6)
    this.boxOffset = { x: 3, y: 10, w: 10, h: 6 };
  };

  AC.Player.prototype.getFootBox = function () {
    return {
      x: this.x + this.boxOffset.x,
      y: this.y + this.boxOffset.y,
      w: this.boxOffset.w,
      h: this.boxOffset.h
    };
  };

  AC.Player.prototype.update = function (dt, map) {
    const inputVec = AC.input ? AC.input.getVector() : { dx: 0, dy: 0 };
    const dx = inputVec.dx;
    const dy = inputVec.dy;

    if (dx !== 0 || dy !== 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.facing = dy > 0 ? 'down' : 'up';
      }
    }

    const moveX = dx * this.speed * dt;
    const moveY = dy * this.speed * dt;

    if (moveX !== 0 || moveY !== 0) {
      const footBox = this.getFootBox();
      const moved = AC.collide.move(map, footBox, moveX, moveY);
      this.x = moved.x - this.boxOffset.x;
      this.y = moved.y - this.boxOffset.y;
    }
  };

  AC.Player.prototype.draw = function (ctx, cam) {
    const screenX = Math.round(this.x - cam.x);
    const screenY = Math.round(this.y - cam.y);

    // 1. Foot shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(screenX + 3, screenY + 13, 10, 3);

    // 2. Legs / shoes
    ctx.fillStyle = '#223344';
    ctx.fillRect(screenX + 4, screenY + 11, 3, 3);
    ctx.fillRect(screenX + 9, screenY + 11, 3, 3);

    // 3. Torso (Custom Character Palette)
    const spriteColors = ['#2f5fd0', '#10b981', '#f59e0b', '#8b5cf6'];
    const sprIdx = (AC.progress && typeof AC.progress.get === 'function' && typeof AC.progress.get().sprite === 'number')
      ? Math.abs(AC.progress.get().sprite) % 4
      : 0;
    ctx.fillStyle = spriteColors[sprIdx] || '#2f5fd0';
    ctx.fillRect(screenX + 3, screenY + 6, 10, 6);

    // 4. Head & Face
    ctx.fillStyle = '#f0c896';
    ctx.fillRect(screenX + 4, screenY + 1, 8, 6);

    // 5. Hair
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(screenX + 4, screenY + 0, 8, 3);
    ctx.fillRect(screenX + 3, screenY + 1, 2, 3);
    ctx.fillRect(screenX + 11, screenY + 1, 2, 3);

    // 6. Eyes based on facing direction
    ctx.fillStyle = '#112233';
    if (this.facing === 'down') {
      ctx.fillRect(screenX + 5, screenY + 4, 2, 2);
      ctx.fillRect(screenX + 9, screenY + 4, 2, 2);
    } else if (this.facing === 'up') {
      // Back of head, hair covers face
      ctx.fillStyle = '#5c3a1e';
      ctx.fillRect(screenX + 4, screenY + 2, 8, 4);
    } else if (this.facing === 'left') {
      ctx.fillRect(screenX + 4, screenY + 4, 2, 2);
    } else if (this.facing === 'right') {
      ctx.fillRect(screenX + 10, screenY + 4, 2, 2);
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
