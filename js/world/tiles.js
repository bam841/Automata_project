/* tiles.js: Tile IDs, solid collision registry, and procedural placeholder sprite atlas. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  const tiles = AC.tiles = AC.tiles || {};

  // Tile IDs
  tiles.EMPTY = 0;
  tiles.GRASS = 1;
  tiles.PATH = 2;
  tiles.WATER = 3;
  tiles.WALL = 4;
  tiles.TREE = 5;
  tiles.FLOOR = 6;
  tiles.RAIL = 7;
  tiles.FOUNTAIN = 8;
  tiles.BOARD_STR = 9;
  tiles.BOARD_SET = 10;
  tiles.BOARD_TREE = 11;
  tiles.BOARD_DFA = 12;
  tiles.TOWER_WALL = 13;
  tiles.TOWER_DOOR = 14;

  // Solid collision tile IDs
  tiles.solid = new Set([
    tiles.WATER,
    tiles.WALL,
    tiles.TREE,
    tiles.FOUNTAIN,
    tiles.TOWER_WALL,
    tiles.TOWER_DOOR
  ]);

  let atlasCanvas = null;

  /**
   * Builds the procedural 16x16 placeholder atlas.
   */
  tiles.createAtlas = function () {
    if (typeof document === 'undefined') return null;
    if (atlasCanvas) return atlasCanvas;

    const canvas = document.createElement('canvas');
    canvas.width = 16 * 16; // 16 tiles wide
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = false;

    function drawTile(id, bg, fg, patternFn) {
      const x = id * 16;
      ctx.fillStyle = bg;
      ctx.fillRect(x, 0, 16, 16);
      if (patternFn) {
        ctx.fillStyle = fg;
        patternFn(ctx, x);
      }
    }

    // 0: EMPTY (transparent)
    // 1: GRASS
    drawTile(tiles.GRASS, '#43833b', '#35692e', (c, x) => {
      c.fillRect(x + 3, 4, 2, 3);
      c.fillRect(x + 9, 10, 2, 3);
      c.fillRect(x + 12, 2, 1, 2);
    });

    // 2: PATH (Cobblestone / dirt road)
    drawTile(tiles.PATH, '#c6b894', '#9e8d69', (c, x) => {
      c.strokeRect(x + 0.5, 0.5, 7, 7);
      c.strokeRect(x + 8.5, 0.5, 7, 7);
      c.strokeRect(x + 4.5, 8.5, 7, 7);
    });

    // 3: WATER
    drawTile(tiles.WATER, '#1e7b9e', '#55b2d4', (c, x) => {
      c.fillRect(x + 2, 4, 5, 1);
      c.fillRect(x + 9, 10, 5, 1);
    });

    // 4: WALL
    drawTile(tiles.WALL, '#3f4b59', '#2a333d', (c, x) => {
      c.fillRect(x + 1, 1, 14, 14);
      c.fillStyle = '#65768a';
      c.fillRect(x + 2, 2, 12, 2);
    });

    // 5: TREE
    drawTile(tiles.TREE, '#2b5a26', '#1c3e19', (c, x) => {
      c.fillRect(x + 2, 2, 12, 12);
      c.fillStyle = '#7a5127'; // trunk
      c.fillRect(x + 6, 11, 4, 5);
      c.fillStyle = '#3e8037'; // highlight
      c.fillRect(x + 4, 3, 8, 5);
    });

    // 6: FLOOR
    drawTile(tiles.FLOOR, '#828e9e', '#667280', (c, x) => {
      c.fillRect(x + 1, 1, 14, 14);
    });

    // 7: RAIL
    drawTile(tiles.RAIL, '#7a6855', '#333333', (c, x) => {
      // Wood ties
      c.fillRect(x + 1, 2, 14, 2);
      c.fillRect(x + 1, 7, 14, 2);
      c.fillRect(x + 1, 12, 14, 2);
      // Steel rails
      c.fillStyle = '#99aabb';
      c.fillRect(x + 3, 0, 2, 16);
      c.fillRect(x + 11, 0, 2, 16);
    });

    // 8: FOUNTAIN
    drawTile(tiles.FOUNTAIN, '#30688a', '#eef5fa', (c, x) => {
      c.fillRect(x + 2, 2, 12, 12);
      c.fillStyle = '#7fc5e8';
      c.fillRect(x + 4, 4, 8, 8);
      c.fillStyle = '#ffffff';
      c.fillRect(x + 7, 6, 2, 4);
    });

    // 9: BOARD_STR (Orange glow)
    drawTile(tiles.BOARD_STR, '#e0663f', '#ffffff', (c, x) => {
      c.strokeRect(x + 2.5, 2.5, 11, 11);
      c.fillRect(x + 6, 6, 4, 4);
    });

    // 10: BOARD_SET (Teal glow)
    drawTile(tiles.BOARD_SET, '#1f9d8a', '#ffffff', (c, x) => {
      c.strokeRect(x + 2.5, 2.5, 11, 11);
      c.fillRect(x + 6, 6, 4, 4);
    });

    // 11: BOARD_TREE (Green glow)
    drawTile(tiles.BOARD_TREE, '#4c8c3a', '#ffffff', (c, x) => {
      c.strokeRect(x + 2.5, 2.5, 11, 11);
      c.fillRect(x + 6, 6, 4, 4);
    });

    // 12: BOARD_DFA (Purple glow)
    drawTile(tiles.BOARD_DFA, '#6f55e0', '#ffffff', (c, x) => {
      c.strokeRect(x + 2.5, 2.5, 11, 11);
      c.fillRect(x + 6, 6, 4, 4);
    });

    // 13: TOWER_WALL
    drawTile(tiles.TOWER_WALL, '#2c223b', '#b39842', (c, x) => {
      c.fillRect(x + 2, 2, 12, 12);
    });

    // 14: TOWER_DOOR
    drawTile(tiles.TOWER_DOOR, '#4a1525', '#e6c86e', (c, x) => {
      c.fillRect(x + 3, 2, 10, 14);
      c.fillStyle = '#ffffff';
      c.fillRect(x + 7, 7, 2, 3);
    });

    atlasCanvas = canvas;
    return atlasCanvas;
  };

  tiles.getAtlas = function () {
    return atlasCanvas || tiles.createAtlas();
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
