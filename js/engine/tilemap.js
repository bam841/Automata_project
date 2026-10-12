/* tilemap.js: 3-layer tilemap container with viewport culling and solid collision queries. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  AC.Tilemap = function (w = 64, h = 64, tileSize = 16) {
    this.w = w;
    this.h = h;
    this.tile = tileSize;
    this.layers = {
      ground: new Uint16Array(w * h),
      objects: new Uint16Array(w * h),
      above: new Uint16Array(w * h)
    };
  };

  AC.Tilemap.prototype.index = function (tx, ty) {
    return ty * this.w + tx;
  };

  AC.Tilemap.prototype.getTile = function (layerName, tx, ty) {
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return 0;
    const layer = this.layers[layerName];
    return layer ? layer[this.index(tx, ty)] : 0;
  };

  AC.Tilemap.prototype.setTile = function (layerName, tx, ty, tileId) {
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return;
    const layer = this.layers[layerName];
    if (layer) {
      layer[this.index(tx, ty)] = tileId;
    }
  };

  /**
   * Out-of-bounds tiles are always solid.
   * Solid check inspects both ground and objects layers.
   */
  AC.Tilemap.prototype.isSolid = function (tx, ty) {
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) {
      return true;
    }
    const solidSet = AC.tiles ? AC.tiles.solid : null;
    if (!solidSet) return false;

    const idx = this.index(tx, ty);
    const objTile = this.layers.objects[idx];
    if (objTile !== 0 && solidSet.has(objTile)) return true;

    const gndTile = this.layers.ground[idx];
    if (gndTile !== 0 && solidSet.has(gndTile)) return true;

    return false;
  };

  /**
   * Draws visible tiles for the specified layer with camera culling.
   */
  AC.Tilemap.prototype.drawLayer = function (ctx, cam, layerName) {
    const layer = this.layers[layerName];
    if (!layer || !ctx) return;

    const atlas = AC.tiles ? AC.tiles.getAtlas() : null;
    if (!atlas) return;

    const t = this.tile;
    const minTx = Math.max(0, Math.floor(cam.x / t));
    const maxTx = Math.min(this.w - 1, Math.ceil((cam.x + cam.w) / t));
    const minTy = Math.max(0, Math.floor(cam.y / t));
    const maxTy = Math.min(this.h - 1, Math.ceil((cam.y + cam.h) / t));

    for (let ty = minTy; ty <= maxTy; ty++) {
      const rowOffset = ty * this.w;
      const screenY = Math.round(ty * t - cam.y);

      for (let tx = minTx; tx <= maxTx; tx++) {
        const tileId = layer[rowOffset + tx];
        if (tileId === 0) continue;

        const screenX = Math.round(tx * t - cam.x);
        ctx.drawImage(atlas, tileId * t, 0, t, t, screenX, screenY, t, t);
      }
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
