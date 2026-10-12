/* triggers.js: Interactive trigger system for station boards, NPCs, and doors. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  const triggersList = [];

  AC.triggers = {
    clear() {
      triggersList.length = 0;
    },

    register(trigger) {
      triggersList.push(trigger);
    },

    getAll() {
      return triggersList;
    },

    /**
     * Finds nearest trigger within maxRange px from player center (px, py).
     */
    getNearest(px, py, maxRange = 26) {
      let nearest = null;
      let minDist = maxRange;

      for (const t of triggersList) {
        const cx = t.rect.x + t.rect.w / 2;
        const cy = t.rect.y + t.rect.h / 2;
        const dist = Math.hypot(cx - px, cy - py);

        if (dist <= minDist) {
          minDist = dist;
          nearest = t;
        }
      }

      return nearest;
    },

    initDefaultTriggers() {
      this.clear();

      // 4 District Station Boards
      if (AC.districts) {
        for (const d of AC.districts) {
          this.register({
            id: 'station-' + d.id,
            districtId: d.id,
            rect: { x: d.board.tx * 16, y: d.board.ty * 16, w: 16, h: 16 },
            prompt: `E  Enter ${d.name}`,
            onInteract(game) {
              if (AC.lessons && AC.lessons.shell) {
                AC.lessons.shell.open(d.id);
              }
            }
          });
        }
      }

      // Professor Delta NPC in Hub (32, 35)
      this.register({
        id: 'npc-delta',
        rect: { x: 32 * 16, y: 35 * 16, w: 16, h: 16 },
        prompt: 'E  Talk to Prof. Delta',
        onInteract(game) {
          if (AC.dialogue) {
            AC.dialogue.start();
          }
        }
      });
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
