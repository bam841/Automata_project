/* game.js: Coordinates world map, player, camera, layers, and debug overlay. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  function Game() {
    this.map = null;
    this.player = null;
    this.camera = null;
    this.showDebug = false;
    this.frameCount = 0;
    this.fps = 60;
    this.lastFpsUpdate = 0;
  }

  Game.prototype.init = function (canvas) {
    AC.render.init(canvas);

    this.map = AC.mapData.createWorldMap();
    this.player = new AC.Player(AC.mapData.SPAWN.tx, AC.mapData.SPAWN.ty);
    this.camera = new AC.Camera(AC.render.WIDTH, AC.render.HEIGHT);

    // Initialize triggers for stations and NPCs
    if (AC.triggers) {
      AC.triggers.initDefaultTriggers();
    }

    // Snap camera immediately to player
    this.camera.snapTo(
      this.player.x + 8,
      this.player.y + 8,
      this.map.w * 16,
      this.map.h * 16
    );

    this.frameCount = 0;
    this.lastFpsUpdate = Date.now();
  };

  Game.prototype.update = function (dt) {
    if (AC.input && AC.input.pressed('debug')) {
      this.showDebug = !this.showDebug;
    }

    // Check interaction with nearest trigger
    if (AC.input && AC.input.pressed('interact') && this.player) {
      const nearest = AC.triggers ? AC.triggers.getNearest(this.player.x + 8, this.player.y + 8) : null;
      if (nearest && typeof nearest.onInteract === 'function') {
        nearest.onInteract(this);
      }
    }

    if (this.player && this.map) {
      this.player.update(dt, this.map);
    }

    if (this.camera && this.player && this.map) {
      this.camera.follow(
        this.player.x + 8,
        this.player.y + 8,
        this.map.w * 16,
        this.map.h * 16
      );
    }

    // FPS calculation
    this.frameCount++;
    const now = Date.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  };

  Game.prototype.render = function () {
    const ctx = AC.render.getBuffer();
    if (!ctx || !this.map || !this.camera || !this.player) return;

    // 1. Clear background
    ctx.fillStyle = '#101b26';
    ctx.fillRect(0, 0, AC.render.WIDTH, AC.render.HEIGHT);

    // 2. Draw ground layer
    this.map.drawLayer(ctx, this.camera, 'ground');

    // 3. Draw objects layer
    this.map.drawLayer(ctx, this.camera, 'objects');

    // 4. Draw Professor Delta NPC at (32, 35)
    this.drawNPC(ctx, 32 * 16, 35 * 16);

    // 5. Draw player
    this.player.draw(ctx, this.camera);

    // 6. Draw above layer
    this.map.drawLayer(ctx, this.camera, 'above');

    // 7. Draw HUD (Stamps, Minimap, Prompt Bubble)
    if (AC.hud) {
      AC.hud.draw(ctx, this);
    }

    // 8. Debug overlay (F3)
    if (this.showDebug) {
      this.renderDebug(ctx);
    }

    // 9. Blit buffer to screen canvas with integer pixel-perfect scale
    AC.render.present();
  };

  Game.prototype.drawNPC = function (ctx, x, y) {
    const screenX = Math.round(x - this.camera.x);
    const screenY = Math.round(y - this.camera.y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(screenX + 3, screenY + 13, 10, 3);

    // Legs
    ctx.fillStyle = '#1c2833';
    ctx.fillRect(screenX + 4, screenY + 11, 3, 3);
    ctx.fillRect(screenX + 9, screenY + 11, 3, 3);

    // Professor Delta Robe (Purple/Teal Scholar Robe)
    ctx.fillStyle = '#5c4382';
    ctx.fillRect(screenX + 3, screenY + 6, 10, 6);

    // Head
    ctx.fillStyle = '#eec699';
    ctx.fillRect(screenX + 4, screenY + 1, 8, 6);

    // White beard & hair
    ctx.fillStyle = '#e6eef5';
    ctx.fillRect(screenX + 3, screenY, 10, 3);
    ctx.fillRect(screenX + 5, screenY + 5, 6, 3); // Beard

    // Glasses
    ctx.fillStyle = '#223344';
    ctx.fillRect(screenX + 5, screenY + 3, 2, 1);
    ctx.fillRect(screenX + 9, screenY + 3, 2, 1);
  };

  Game.prototype.renderDebug = function (ctx) {
    const cam = this.camera;
    const p = this.player;
    const foot = p.getFootBox();

    // Hitbox outline
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.round(foot.x - cam.x) + 0.5,
      Math.round(foot.y - cam.y) + 0.5,
      foot.w,
      foot.h
    );

    // Debug text banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(4, 4, 180, 42);

    ctx.fillStyle = '#4fdc9d';
    ctx.font = '9px monospace';
    ctx.fillText(`FPS: ${this.fps}`, 8, 15);
    ctx.fillText(`Pos: (${Math.round(p.x)}, ${Math.round(p.y)})`, 8, 27);
    ctx.fillText(`Tile: (${Math.floor(p.x / 16)}, ${Math.floor(p.y / 16)})`, 8, 39);
  };

  AC.game = new Game();

})(typeof globalThis !== 'undefined' ? globalThis : window);
