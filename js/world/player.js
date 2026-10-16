/* player.js: Player entity configured for 'meppo 64x64px.png' (64x64 cell grid, 5-frame idle, 8-frame walk, auto-flip). */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  // --- MEPPO SPRITESHEET CONFIG ---
  const SPRITE_SRC = 'assets/meppo 128x128px.png'; // Adjust path if inside an assets/ folder
  const CELL_SIZE = 128;                   // Each frame in the PNG is 64x64 px

  // Animation rows & frame counts matching meppo 64x64px.png
  const ANIM_CONFIG = {
    idle: { row: 0, frames: 5, fps: 6 },
    walk: { row: 1, frames: 8, fps: 12 }
  };

  const meppoSheet = new Image();
  let sheetLoaded = false;
  meppoSheet.onload = function () { sheetLoaded = true; };
  meppoSheet.src = SPRITE_SRC;

  AC.Player = function (tx = 32, ty = 34) {
    this.x = tx * 16;
    this.y = ty * 16;
    this.w = 16;
    this.h = 16;
    this.speed = 64; // pixels per second (ARCHITECTURE.md default)
    this.facing = 'down';
    this.flipX = false; // false = facing left (sheet default), true = facing right

    // Animation state
    this.state = 'idle'; // 'idle' or 'walk'
    this.animTimer = 0;
    this.animFrame = 0;

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
    const isMoving = (dx !== 0 || dy !== 0);

    if (isMoving) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.facing = dy > 0 ? 'down' : 'up';
      }

      // Track horizontal orientation so the left-facing sprite flips when moving right
      if (dx > 0) this.flipX = true;
      else if (dx < 0) this.flipX = false;
    }

    // Switch between 'idle' (Row 0, 5 frames) and 'walk' (Row 1, 8 frames)
    const nextState = isMoving ? 'walk' : 'idle';
    if (this.state !== nextState) {
      this.state = nextState;
      this.animFrame = 0;
      this.animTimer = 0;
    }

    // Advance animation frame
    const anim = ANIM_CONFIG[this.state];
    const frameDuration = 1 / anim.fps;
    this.animTimer += dt;
    if (this.animTimer >= frameDuration) {
      this.animTimer -= frameDuration;
      this.animFrame = (this.animFrame + 1) % anim.frames;
    }

    // Apply movement & collision
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

    // 2. Draw Meppo Spritesheet if loaded
    if (sheetLoaded) {
      const anim = ANIM_CONFIG[this.state];
      const srcX = this.animFrame * CELL_SIZE;
      const srcY = anim.row * CELL_SIZE;

      // Since the character inside each 64x64 cell is padded with transparent space,
      // drawing it at 24x24 (centered on the 16x16 tile) makes Meppo match a 16x16 body height.
      // Change DRAW_SIZE to 16 if you want the entire 64x64 cell shrunk into 16x16.
      const DRAW_SIZE =24; 

const offsetX = Math.floor((this.w - DRAW_SIZE) / 2);
const offsetY = (this.h - DRAW_SIZE) + 2; // Align Meppo's feet with the bottom of the tile

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      if (this.flipX) {
        // Flip horizontally around the center of the player tile when facing right
        ctx.translate(screenX + this.w / 2, screenY);
        ctx.scale(-1, 1);
        ctx.drawImage(
          meppoSheet,
          srcX, srcY, CELL_SIZE, CELL_SIZE,
          -this.w / 2 + offsetX, offsetY, DRAW_SIZE, DRAW_SIZE
        );
      } else {
        ctx.drawImage(
          meppoSheet,
          srcX, srcY, CELL_SIZE, CELL_SIZE,
          screenX + offsetX, screenY + offsetY, DRAW_SIZE, DRAW_SIZE
        );
      }

      ctx.restore();
      return;
    }

    // 3. Fallback red block while image loads
    ctx.fillStyle = '#9e0b0b';
    ctx.fillRect(screenX + 4, screenY + 2, 8, 13);
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);