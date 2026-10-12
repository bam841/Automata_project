/* map.test.js: Verifies map dimensions, spawn walkability, and BFS path connectivity to all 4 district boards. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('M1.5: World map has 64x64 dimensions and walkable spawn', function () {
    const map = AC.mapData.createWorldMap();
    assert.equal(map.w, 64);
    assert.equal(map.h, 64);

    const spawn = AC.mapData.SPAWN;
    assert.equal(spawn.tx, 32);
    assert.equal(spawn.ty, 34);
    assert.equal(map.isSolid(spawn.tx, spawn.ty), false, 'Spawn point must be non-solid');
  });

  test('M1.5: BFS path exists from spawn to all 4 district boards', function () {
    const map = AC.mapData.createWorldMap();
    const spawn = AC.mapData.SPAWN;
    const boards = AC.mapData.BOARDS;

    // Helper BFS to check if target is reachable from start via non-solid tiles
    function isReachable(startX, startY, targetX, targetY) {
      const visited = new Uint8Array(64 * 64);
      const queue = [[startX, startY]];
      visited[startY * 64 + startX] = 1;

      while (queue.length > 0) {
        const [x, y] = queue.shift();

        // Check if reached target or adjacent to target
        if (x === targetX && y === targetY) {
          return true;
        }

        const neighbors = [
          [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < 64 && ny >= 0 && ny < 64) {
            const idx = ny * 64 + nx;
            if (!visited[idx] && !map.isSolid(nx, ny)) {
              visited[idx] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
      return false;
    }

    // Verify all 4 district boards are reachable
    for (const [id, pos] of Object.entries(boards)) {
      const reachable = isReachable(spawn.tx, spawn.ty, pos.tx, pos.ty);
      assert(reachable, `District board ${id} at (${pos.tx}, ${pos.ty}) must be reachable from spawn`);
    }
  });

  test('M1.5: Perimeter border is strictly solid', function () {
    const map = AC.mapData.createWorldMap();
    for (let x = 0; x < 64; x++) {
      assert.equal(map.isSolid(x, 0), true, `Top border (${x}, 0) must be solid`);
      assert.equal(map.isSolid(x, 63), true, `Bottom border (${x}, 63) must be solid`);
    }
    for (let y = 0; y < 64; y++) {
      assert.equal(map.isSolid(0, y), true, `Left border (0, ${y}) must be solid`);
      assert.equal(map.isSolid(63, y), true, `Right border (63, ${y}) must be solid`);
    }
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
