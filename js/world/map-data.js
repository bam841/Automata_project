/* map-data.js: Deterministic 64x64 world map builder with hub, 4 regions, and connecting roads. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  function createWorldMap() {
    const T = AC.tiles;
    const map = new AC.Tilemap(64, 64, 16);

    function fillRect(layer, x0, y0, w, h, tileId) {
      for (let y = y0; y < y0 + h; y++) {
        for (let x = x0; x < x0 + w; x++) {
          map.setTile(layer, x, y, tileId);
        }
      }
    }

    // 1. Base ground: default to Grass across entire 64x64 map
    fillRect('ground', 0, 0, 64, 64, T.GRASS);

    // 2. Outer boundary perimeter: 2-tile border of solid trees and stone walls
    fillRect('objects', 0, 0, 64, 2, T.TREE);
    fillRect('objects', 0, 62, 64, 2, T.TREE);
    fillRect('objects', 0, 0, 2, 64, T.TREE);
    fillRect('objects', 62, 0, 2, 64, T.TREE);

    // 3. Central Hub Plaza (x: 24..40, y: 24..40)
    fillRect('ground', 24, 24, 17, 17, T.FLOOR);
    // Plaza decorative border
    for (let x = 24; x <= 40; x++) {
      map.setTile('ground', x, 24, T.PATH);
      map.setTile('ground', x, 40, T.PATH);
    }
    for (let y = 24; y <= 40; y++) {
      map.setTile('ground', 24, y, T.PATH);
      map.setTile('ground', 40, y, T.PATH);
    }

    // Central Fountain at (32, 32)
    map.setTile('objects', 32, 32, T.FOUNTAIN);

    // Exam Tower (x: 36..39, y: 25..28)
    fillRect('objects', 36, 25, 4, 4, T.TOWER_WALL);
    map.setTile('objects', 37, 28, T.TOWER_DOOR); // Entrance

    // 4. Connecting 3-tile wide Roads
    // North road to Tree Forest (x: 31..33, y: 12..24)
    fillRect('ground', 31, 12, 3, 13, T.PATH);
    // South road to DFA Station (x: 31..33, y: 40..52)
    fillRect('ground', 31, 40, 3, 13, T.PATH);
    // West road to String Street (x: 12..24, y: 31..33)
    fillRect('ground', 12, 31, 13, 3, T.PATH);
    // East road to Set Park (x: 40..52, y: 31..33)
    fillRect('ground', 40, 31, 13, 3, T.PATH);

    // 5. String Street (West, x: 4..20, y: 24..40)
    fillRect('ground', 4, 24, 17, 17, T.FLOOR);
    // Train tracks running east-west through the district
    fillRect('ground', 4, 32, 17, 1, T.RAIL);
    // String Street Station Board at (12, 32)
    map.setTile('ground', 12, 32, T.BOARD_STR);

    // 6. Set Park (East, x: 44..60, y: 24..40)
    fillRect('ground', 44, 24, 17, 17, T.GRASS);
    // Twin overlapping Venn ponds (Circle A center at 49, 29; Circle B center at 55, 29)
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx * dx + dy * dy <= 9) {
          // Circle A pond
          map.setTile('objects', 49 + dx, 29 + dy, T.WATER);
          // Circle B pond
          map.setTile('objects', 55 + dx, 29 + dy, T.WATER);
        }
      }
    }
    // Set Park Board at (52, 32)
    map.setTile('ground', 52, 32, T.BOARD_SET);

    // 7. Tree Forest (North, x: 20..44, y: 4..20)
    fillRect('ground', 20, 4, 25, 17, T.GRASS);
    // Decorative trees lining the forest
    for (let x = 20; x <= 44; x += 4) {
      for (let y = 4; y <= 20; y += 4) {
        if (x !== 32 || y > 15) {
          map.setTile('objects', x, y, T.TREE);
        }
      }
    }
    // Clearing around the Tree Forest Board at (32, 12)
    fillRect('objects', 30, 10, 5, 5, T.EMPTY);
    fillRect('ground', 30, 10, 5, 5, T.PATH);
    map.setTile('ground', 32, 12, T.BOARD_TREE);

    // 8. DFA Station (South, x: 20..44, y: 44..60)
    fillRect('ground', 20, 44, 25, 17, T.FLOOR);
    // Rail loops connecting platforms q0, q1, q2, q3
    fillRect('ground', 26, 48, 13, 1, T.RAIL);
    fillRect('ground', 26, 56, 13, 1, T.RAIL);
    fillRect('ground', 26, 48, 1, 9, T.RAIL);
    fillRect('ground', 38, 48, 1, 9, T.RAIL);
    // DFA Board at (32, 52)
    map.setTile('ground', 32, 52, T.BOARD_DFA);

    // Ensure player spawn (32, 34) is strictly empty & walkable
    map.setTile('objects', 32, 34, T.EMPTY);
    map.setTile('ground', 32, 34, T.PATH);

    return map;
  }

  AC.mapData = {
    createWorldMap,
    SPAWN: { tx: 32, ty: 34 },
    BOARDS: {
      str: { tx: 12, ty: 32 },
      set: { tx: 52, ty: 32 },
      tree: { tx: 32, ty: 12 },
      dfa: { tx: 32, ty: 52 }
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
