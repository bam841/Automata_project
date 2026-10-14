/* tiles.js: Tile IDs, solid collision registry, and static A1 + A5 sprite atlas. */
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
  let atlasCtx = null;

  // External Asset Paths
  const A1_ANIM_SRC = 'assets/A1_AnimatedGround.png';
  const A5_TILES_SRC = 'assets/A5_Tiles.png';
  const TREE_SRC = 'assets/tree.png';

  const a1Img = new Image();
  let a1Loaded = false;

  const a5Img = new Image();
  let a5Loaded = false;

  const treeImg = new Image();
  let treeLoaded = false;

  // Map static tiles to (col, row) on A5_Tiles.png (8 cols x 16 rows)
  const A5_MAP = {
    [tiles.GRASS]:      { col: 3, row: 4 }, // Green grass with tufts
    [tiles.PATH]:       { col: 4, row: 4 }, // Earthy pebble path
    [tiles.WALL]:       { col: 0, row: 2 }, // Dark stone wall bricks
    [tiles.FLOOR]:      { col: 3, row: 1 }, // Checkered interior floor
    [tiles.RAIL]:       { col: 2, row: 2 }, // Wooden track ties
    [tiles.TOWER_WALL]: { col: 0, row: 2 }, // Dark slate stone
    [tiles.TOWER_DOOR]: { col: 3, row: 1 }  // Wooden door planks
  };

  /**
   * Stamps static 16x16 water and fountain sprites from A1_AnimatedGround.png
   */
  function applyA1WaterTiles() {
    if (!atlasCtx || !a1Loaded) return;

    const cellW = a1Img.width / 16;
    const cellH = a1Img.height / 12;

    // 1. WATER (Tile 3): Pure static blue water from the center of the first pool (Col 0.5, Row 1.5)
    const waterDestX = tiles.WATER * 16;
    atlasCtx.clearRect(waterDestX, 0, 16, 16);
    atlasCtx.drawImage(
      a1Img,
      0.5 * cellW, 1.5 * cellH, 16, 16,
      waterDestX, 0, 16, 16
    );

    // 2. FOUNTAIN (Tile 8): Static stone-rimmed water pool (Col 8, Row 0)
    const fountDestX = tiles.FOUNTAIN * 16;
    atlasCtx.clearRect(fountDestX, 0, 16, 16);
    atlasCtx.drawImage(
      a1Img,
      8 * cellW, 0 * cellH, 16, 16,
      fountDestX, 0, 16, 16
    );

    // Static center water spout on fountain
    atlasCtx.fillStyle = '#e8f7ff';
    atlasCtx.fillRect(fountDestX + 7, 4, 2, 4);
    atlasCtx.fillStyle = '#ffffff';
    atlasCtx.fillRect(fountDestX + 6, 4, 4, 1);

    // Fallback ground textures if A5_Tiles.png hasn't loaded yet
    if (!a5Loaded) {
      atlasCtx.drawImage(a1Img, 0, 0, 16, 16, tiles.GRASS * 16, 0, 16, 16);
      atlasCtx.drawImage(a1Img, 0, 6 * cellH, 16, 16, tiles.PATH * 16, 0, 16, 16);
      atlasCtx.drawImage(a1Img, 8 * cellW, 3 * cellH, 16, 16, tiles.FLOOR * 16, 0, 16, 16);
    }
  }

  /**
   * Stamps static architectural tiles from A5_Tiles.png
   */
  function applyA5Tiles() {
    if (!atlasCtx || !a5Loaded) return;

    const cellW = a5Img.width / 8;
    const cellH = a5Img.height / 16;

    function stampA5(tileId, col, row) {
      const destX = tileId * 16;
      atlasCtx.clearRect(destX, 0, 16, 16);
      atlasCtx.drawImage(
        a5Img,
        col * cellW, row * cellH, 16, 16,
        destX, 0, 16, 16
      );
    }

    Object.keys(A5_MAP).forEach(id => {
      const tileId = Number(id);
      const coords = A5_MAP[tileId];
      stampA5(tileId, coords.col, coords.row);
    });

    // Add steel rails on top of the A5 wooden plank tile
    // Rotate the A5 wooden plank tile (col 2, row 2) 90 degrees and draw horizontal steel rails
    const railX = tiles.RAIL * 16;
    atlasCtx.clearRect(railX, 0, 16, 16);

    atlasCtx.save();
    atlasCtx.translate(railX + 8, 8); // Move pivot to center of the 16x16 tile
    atlasCtx.rotate(Math.PI / 2);     // Rotate 90 degrees clockwise
    atlasCtx.drawImage(
      a5Img,
      2 * cellW, 2 * cellH, 16, 16,
      -8, -8, 16, 16
    );
    atlasCtx.restore();

    // Draw horizontal steel rails
    atlasCtx.fillStyle = '#99aabb';
    atlasCtx.fillRect(railX, 3, 16, 2);
    atlasCtx.fillRect(railX, 11, 16, 2);

    // If A1_AnimatedGround.png isn't loaded, use A5 blue tile (Col 7, Row 5) for Water & Fountain
    if (!a1Loaded) {
      stampA5(tiles.WATER, 7, 5);
      stampA5(tiles.FOUNTAIN, 7, 5);
      const fX = tiles.FOUNTAIN * 16;
      ctxStrokeFountain(atlasCtx, fX);
    }

    // Use A5 dense foliage (Col 2, Row 4) for TREE if standalone tree.png isn't used
    if (!treeLoaded) {
      stampA5(tiles.TREE, 2, 4);
      const tX = tiles.TREE * 16;
      atlasCtx.fillStyle = '#5c3a1e';
      atlasCtx.fillRect(tX + 6, 12, 4, 4);
    }
  }

  function ctxStrokeFountain(c, fX) {
    c.strokeStyle = '#d0dce5';
    c.strokeRect(fX + 1.5, 1.5, 13, 13);
    c.fillStyle = '#ffffff';
    c.fillRect(fX + 7, 5, 2, 5);
  }

  /**
   * Stamps standalone tree.png over the grass tile
   */
  function applyTreeTile() {
    if (!atlasCtx || !treeLoaded) return;
    const tX = tiles.TREE * 16;

    if (a5Loaded) {
      const cellW = a5Img.width / 8;
      const cellH = a5Img.height / 16;
      atlasCtx.drawImage(a5Img, 0 * cellW, 3 * cellH, 16, 16, tX, 0, 16, 16);
    } else {
      atlasCtx.fillStyle = '#43833b';
      atlasCtx.fillRect(tX, 0, 16, 16);
    }
    atlasCtx.drawImage(treeImg, tX, 0, 16, 16);
  }

  /**
   * Builds the 16x16 tile atlas.
   */
  tiles.createAtlas = function () {
    if (typeof document === 'undefined') return null;
    if (atlasCanvas) return atlasCanvas;

    const canvas = document.createElement('canvas');
    canvas.width = 16 * 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = false;
    atlasCanvas = canvas;
    atlasCtx = ctx;

    function drawTile(id, bg, fg, patternFn) {
      const x = id * 16;
      ctx.fillStyle = bg;
      ctx.fillRect(x, 0, 16, 16);
      if (patternFn) {
        ctx.fillStyle = fg;
        patternFn(ctx, x);
      }
    }

    // --- 1. PROCEDURAL INITIAL FALLBACKS ---
    drawTile(tiles.GRASS, '#43833b', '#35692e', (c, x) => {
      c.fillRect(x + 3, 4, 2, 3);
      c.fillRect(x + 9, 10, 2, 3);
    });
    drawTile(tiles.PATH, '#c6b894', '#9e8d69', (c, x) => {
      c.strokeRect(x + 0.5, 0.5, 7, 7);
      c.strokeRect(x + 8.5, 0.5, 7, 7);
    });
    drawTile(tiles.WATER, '#1e7b9e', '#55b2d4', (c, x) => {
      c.fillRect(x + 2, 4, 5, 1);
      c.fillRect(x + 9, 10, 5, 1);
    });
    drawTile(tiles.WALL, '#3f4b59', '#2a333d', (c, x) => {
      c.fillRect(x + 1, 1, 14, 14);
    });
    drawTile(tiles.TREE, '#2b5a26', '#1c3e19', (c, x) => {
      c.fillRect(x + 2, 2, 12, 12);
      c.fillStyle = '#7a5127';
      c.fillRect(x + 6, 11, 4, 5);
    });
    drawTile(tiles.FLOOR, '#828e9e', '#667280', (c, x) => {
      c.fillRect(x + 1, 1, 14, 14);
    });
    drawTile(tiles.RAIL, '#7a6855', '#333333', (c, x) => {
      c.fillRect(x + 1, 2, 14, 2);
      c.fillRect(x + 1, 7, 14, 2);
      c.fillRect(x + 1, 12, 14, 2);
      c.fillStyle = '#99aabb';
      c.fillRect(x + 3, 0, 2, 16);
      c.fillRect(x + 11, 0, 2, 16);
    });
    drawTile(tiles.FOUNTAIN, '#30688a', '#eef5fa', (c, x) => {
      c.fillRect(x + 2, 2, 12, 12);
    });

    // District Lesson Boards
    drawTile(tiles.BOARD_STR, '#e0663f', '#ffffff', (c, x) => {
      c.strokeRect(x + 2.5, 2.5, 11, 11);
      c.fillRect(x + 6, 6, 4, 4);
    });
    drawTile(tiles.BOARD_SET, '#1f9d8a', '#ffffff', (c, x) => {
      c.strokeRect(x + 2.5, 2.5, 11, 11);
      c.fillRect(x + 6, 6, 4, 4);
    });
    drawTile(tiles.BOARD_TREE, '#4c8c3a', '#ffffff', (c, x) => {
      c.strokeRect(x + 2.5, 2.5, 11, 11);
      c.fillRect(x + 6, 6, 4, 4);
    });
    drawTile(tiles.BOARD_DFA, '#6f55e0', '#ffffff', (c, x) => {
      c.strokeRect(x + 2.5, 2.5, 11, 11);
      c.fillRect(x + 6, 6, 4, 4);
    });
    drawTile(tiles.TOWER_WALL, '#2c223b', '#b39842', (c, x) => {
      c.fillRect(x + 2, 2, 12, 12);
    });
    drawTile(tiles.TOWER_DOOR, '#4a1525', '#e6c86e', (c, x) => {
      c.fillRect(x + 3, 2, 10, 14);
      c.fillStyle = '#ffffff';
      c.fillRect(x + 7, 7, 2, 3);
    });

    // --- 2. LOAD EXTERNAL SHEETS (STATIC) ---
    a1Img.onload = function () {
      a1Loaded = true;
      applyA1WaterTiles();
    };
    a1Img.src = A1_ANIM_SRC;

    a5Img.onload = function () {
      a5Loaded = true;
      applyA5Tiles();
      if (a1Loaded) applyA1WaterTiles();
      if (treeLoaded) applyTreeTile();
    };
    a5Img.src = A5_TILES_SRC;

    treeImg.onload = function () {
      treeLoaded = true;
      applyTreeTile();
    };
    treeImg.src = TREE_SRC;

    return atlasCanvas;
  };

  tiles.getAtlas = function () {
    return atlasCanvas || tiles.createAtlas();
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);