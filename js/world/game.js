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
    if (AC.quests && typeof AC.quests.initTriggers === 'function') {
      AC.quests.initTriggers();
    }
    if (AC.npcs && typeof AC.npcs.initTriggers === 'function') {
      AC.npcs.initTriggers();
    }
    if (AC.tower && typeof AC.tower.initTrigger === 'function') {
      AC.tower.initTrigger();
    }
    if (AC.companion && typeof AC.companion.init === 'function') {
      AC.companion.init(this.player.x, this.player.y);
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

    if (canvas && !canvas._interactBound) {
      canvas._interactBound = true;
      canvas.addEventListener('click', () => {
        if (AC.getState && AC.getState() !== 'world') return;
        if (this.player && AC.triggers) {
          const nearest = AC.triggers.getNearest(this.player.x + 8, this.player.y + 8);
          if (nearest && typeof nearest.onInteract === 'function') {
            nearest.onInteract(this);
          }
        }
      });
    }
  };

  Game.prototype.update = function (dt) {
    if (AC.input && AC.input.pressed('debug')) {
      this.showDebug = !this.showDebug;
    }

    if (AC.input && AC.input.pressed('settings')) {
      if (AC.settings) AC.settings.open();
    }

    if (AC.input && AC.input.pressed('theme')) {
      if (AC.atmosphere && typeof AC.atmosphere.cycle === 'function') {
        AC.atmosphere.cycle();
      }
    }

    if (AC.input && AC.input.pressed('mute')) {
      if (AC.audio && typeof AC.audio.toggleMute === 'function') {
        AC.audio.toggleMute();
      }
    }

    if (AC.input && AC.input.pressed('unlock')) {
      if (AC.progress && typeof AC.progress.unlockAllGates === 'function') {
        AC.progress.unlockAllGates();
        if (AC.audio && typeof AC.audio.play === 'function') {
          AC.audio.play('stamp');
        }
      }
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

    if (AC.dressing && typeof AC.dressing.update === 'function') {
      AC.dressing.update(dt);
    }

    if (AC.shards && typeof AC.shards.update === 'function') {
      AC.shards.update(dt, this.player);
    }

    if (AC.quests && typeof AC.quests.update === 'function') {
      AC.quests.update(dt, this.player);
    }

    if (AC.companion && typeof AC.companion.update === 'function') {
      AC.companion.update(dt, this.player);
    }

    if (AC.atmosphere && typeof AC.atmosphere.update === 'function') {
      AC.atmosphere.update(dt);
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

    // 3. Ground landmarks dressing
    if (AC.dressing && typeof AC.dressing.drawGroundDressing === 'function') {
      AC.dressing.drawGroundDressing(ctx, this.camera);
    }

    // 4. Draw objects layer
    this.map.drawLayer(ctx, this.camera, 'objects');

    // 5. Draw Professor Delta NPC at (32, 35) and resident NPCs
    this.drawNPC(ctx, 32 * 16, 35 * 16);
    if (AC.npcs && typeof AC.npcs.draw === 'function') {
      AC.npcs.draw(ctx, this.camera);
    }

    // 6. Draw shards
    if (AC.shards && typeof AC.shards.draw === 'function') {
      AC.shards.draw(ctx, this.camera);
    }

    // 6b. Draw prerequisite quest items, road gates, and discovery cards
    if (AC.quests && typeof AC.quests.draw === 'function') {
      AC.quests.draw(ctx, this.camera);
    }

    // 7. Draw player and companion
    this.player.draw(ctx, this.camera);
    if (AC.companion && typeof AC.companion.draw === 'function') {
      AC.companion.draw(ctx, this.camera);
    }

    // 8. Draw above layer
    this.map.drawLayer(ctx, this.camera, 'above');

    // 9. Draw day/night atmospheric tint and lamps
    if (AC.atmosphere && typeof AC.atmosphere.draw === 'function') {
      AC.atmosphere.draw(ctx, this.camera);
    }

    // 10. Draw HUD (Stamps, Minimap, Prompt Bubble)
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
