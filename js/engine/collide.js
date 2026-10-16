/* collide.js: AABB tilemap collision system with separate axis sliding. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  const collide = AC.collide = AC.collide || {};

  /**
   * Tests whether an AABB box { x, y, w, h } collides with any solid tile in map.
   */
  collide.overlapsSolid = function (map, box) {
    const t = map.tile || 16;
    const minTx = Math.floor(box.x / t);
    const maxTx = Math.floor((box.x + box.w - 0.001) / t);
    const minTy = Math.floor(box.y / t);
    const maxTy = Math.floor((box.y + box.h - 0.001) / t);

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (map.isSolid(tx, ty)) {
          return true;
        }
        if (AC.quests && typeof AC.quests.isSolid === 'function' && AC.quests.isSolid(tx, ty)) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Pure movement solver: moves along X then Y separately to allow wall-sliding.
   * Returns { x, y, hitX, hitY }.
   */
  collide.move = function (map, box, dx, dy) {
    let newX = box.x;
    let newY = box.y;
    let hitX = false;
    let hitY = false;

    // 1. Move along X axis
    if (dx !== 0) {
      const targetBoxX = { x: newX + dx, y: newY, w: box.w, h: box.h };
      if (!collide.overlapsSolid(map, targetBoxX)) {
        newX += dx;
      } else {
        hitX = true;
        // Step in discrete 1px or 0.5px sub-steps toward collision boundary
        const step = Math.sign(dx) * 0.5;
        let dist = 0;
        while (Math.abs(dist + step) <= Math.abs(dx)) {
          const testBox = { x: newX + dist + step, y: newY, w: box.w, h: box.h };
          if (collide.overlapsSolid(map, testBox)) break;
          dist += step;
        }
        newX += dist;
      }
    }

    // 2. Move along Y axis
    if (dy !== 0) {
      const targetBoxY = { x: newX, y: newY + dy, w: box.w, h: box.h };
      if (!collide.overlapsSolid(map, targetBoxY)) {
        newY += dy;
      } else {
        hitY = true;
        const step = Math.sign(dy) * 0.5;
        let dist = 0;
        while (Math.abs(dist + step) <= Math.abs(dy)) {
          const testBox = { x: newX, y: newY + dist + step, w: box.w, h: box.h };
          if (collide.overlapsSolid(map, testBox)) break;
          dist += step;
        }
        newY += dist;
      }
    }

    return { x: newX, y: newY, hitX, hitY };
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
