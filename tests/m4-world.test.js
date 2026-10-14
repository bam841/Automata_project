/* m4-world.test.js: Unit and integration tests for Milestone 4 audio, shards, journal, NPCs, companion, and atmosphere. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  // BFS Reachability Checker
  function canReachTile(map, startTx, startTy, targetTx, targetTy) {
    if (map.isSolid(targetTx, targetTy)) return false;

    const visited = new Uint8Array(map.w * map.h);
    const queue = [{ x: startTx, y: startTy }];
    visited[startTy * map.w + startTx] = 1;

    const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.x === targetTx && cur.y === targetTy) {
        return true;
      }

      for (const d of dirs) {
        const nx = cur.x + d.dx;
        const ny = cur.y + d.dy;
        const idx = ny * map.w + nx;

        if (nx >= 0 && nx < map.w && ny >= 0 && ny < map.h && !visited[idx]) {
          visited[idx] = 1;
          if (!map.isSolid(nx, ny)) {
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }
    return false;
  }

  // --- M4.5 Shards Reachability & Glossary Validation ---
  test('M4.5: All 12 symbol shards exist, match DOMAIN_SPEC §6 glossary, and are reachable via BFS', function () {
    assert(AC.shards, 'AC.shards must be defined');
    const all = AC.shards.getAll();
    assert.equal(all.length, 12, 'Exactly 12 shards must exist');

    const expectedGlossary = {
      sigma: { symbol: 'Σ', name: 'Alphabet', district: 'str', def: 'Finite, non-empty set of symbols a string is built from.' },
      epsilon: { symbol: 'ε', name: 'Empty string', district: 'str', def: 'The string with no symbols; length 0.' },
      reverse: { symbol: 'w^R', name: 'Reverse', district: 'str', def: 'The same symbols in the opposite order.' },
      union: { symbol: '∪', name: 'Union', district: 'set', def: 'Everything that is in A or in B (or both).' },
      intersection: { symbol: '∩', name: 'Intersection', district: 'set', def: 'Only what is in both A and B.' },
      symdiff: { symbol: 'Δ', name: 'Symmetric difference', district: 'set', def: 'What is in exactly one of A and B.' },
      nlr: { symbol: 'NLR', name: 'Preorder', district: 'tree', def: 'Visit the node, then the left subtree, then the right.' },
      lnr: { symbol: 'LNR', name: 'Inorder', district: 'tree', def: 'Left subtree, node, right subtree (sorted on a BST).' },
      lrn: { symbol: 'LRN', name: 'Postorder', district: 'tree', def: 'Left subtree, right subtree, then the node.' },
      delta: { symbol: 'δ', name: 'Transition function', district: 'dfa', def: 'Maps (state, symbol) to the next state.' },
      q0: { symbol: 'q₀', name: 'Start state', district: 'dfa', def: 'The state a run begins in.' },
      accept: { symbol: 'F', name: 'Accepting states', district: 'dfa', def: 'If the run ends here, the string is accepted.' }
    };

    const map = AC.mapData.createWorldMap();
    const spawn = AC.mapData.SPAWN;

    for (const s of all) {
      const exp = expectedGlossary[s.id];
      assert(exp, `Shard ${s.id} must be in expected glossary`);
      assert.equal(s.symbol, exp.symbol, `Symbol matches for ${s.id}`);
      assert.equal(s.name, exp.name, `Name matches for ${s.id}`);
      assert.equal(s.district, exp.district, `District matches for ${s.id}`);
      assert.equal(s.definition, exp.def, `Definition strictly matches DOMAIN_SPEC §6 for ${s.id}`);

      // Reachability test from spawn
      const reachable = canReachTile(map, spawn.tx, spawn.ty, s.tx, s.ty);
      assert(reachable, `Shard ${s.id} at (${s.tx}, ${s.ty}) must be non-solid and reachable via BFS from spawn`);
    }
  });

  // --- M4.5 Shard Pickup Simulation ---
  test('M4.5: Walking near a shard collects it and updates progress', function () {
    AC.progress.reset();
    assert.equal(AC.progress.get().shards.length, 0);

    const s = AC.shards.get('sigma');
    assert(s, 'Sigma shard exists');

    const fakePlayer = { x: s.tx * 16, y: s.ty * 16 };
    AC.shards.update(0.016, fakePlayer);

    assert.equal(AC.progress.hasShard('sigma'), true, 'Should collect sigma shard');
    assert.equal(AC.progress.get().shards.length, 1);
  });

  // --- M4.5 Journal Modal Lifecycle ---
  test('M4.5: Theory Journal opens, displays collected status, and closes', function () {
    assert(AC.journal, 'AC.journal must exist');

    AC.setState('world');
    AC.journal.open();
    assert.equal(AC.journal.isOpen(), true);

    AC.journal.close();
    assert.equal(AC.journal.isOpen(), false);
    assert.equal(AC.getState(), 'world');
  });

  // --- M4.7 Audio Synthesizer ---
  test('M4.7: Audio engine handles plays, mute toggling, and persistence safely', function () {
    assert(AC.audio, 'AC.audio must exist');

    // Safe to trigger in any environment without throwing
    AC.audio.play('select');
    AC.audio.play('open');
    AC.audio.play('close');
    AC.audio.play('collect');
    AC.audio.play('stamp');
    AC.audio.play('error');
    AC.audio.play('step');

    // Mute toggling
    AC.audio.setMuted(true);
    assert.equal(AC.audio.isMuted(), true);
    assert.equal(AC.progress.get().settings.muted, true);

    AC.audio.setMuted(false);
    assert.equal(AC.audio.isMuted(), false);
    assert.equal(AC.progress.get().settings.muted, false);
  });

  // --- M4.4 Resident NPCs and Companion ---
  test('M4.4: 4 resident NPCs registered with dialogue lines and interact triggers', function () {
    assert(AC.npcs, 'AC.npcs must exist');
    const npcs = AC.npcs.getAll();
    assert.equal(npcs.length, 4, '4 resident NPCs (one per district)');

    const districts = ['str', 'set', 'tree', 'dfa'];
    for (const d of districts) {
      const npc = npcs.find(n => n.district === d);
      assert(npc, `Resident NPC exists for district ${d}`);
      assert(npc.lines.length >= 2, `NPC ${npc.name} has at least 2 hint lines`);
    }

    // Verify trigger registration and interaction for all resident NPCs
    AC.setState('world');
    AC.triggers.initDefaultTriggers();
    AC.npcs.initTriggers();

    for (const npc of npcs) {
      const trigger = AC.triggers.getAll().find(t => t.id === `trigger-${npc.id}`);
      assert(trigger, `Trigger registered for ${npc.id}`);
      assert(trigger.prompt.includes(npc.name), `Trigger prompt contains NPC name: ${npc.name}`);

      trigger.onInteract();
      assert.equal(AC.dialogue.isOpen(), true, `Dialogue opens when interacting with ${npc.name}`);
      assert.equal(AC.getState(), 'dialogue', `State machine transitions to dialogue for ${npc.name}`);

      // Advance through dialogue to the end
      let safety = 20;
      while (AC.dialogue.isOpen() && safety > 0) {
        AC.dialogue.advance();
        safety--;
      }
      assert.equal(AC.dialogue.isOpen(), false, `Dialogue closes after finishing ${npc.name} lines`);
      assert.equal(AC.getState(), 'world', `State machine returns to world after ${npc.name} dialogue`);
    }

    // Companion
    assert(AC.companion, 'AC.companion must exist');
    AC.companion.init(32 * 16, 34 * 16);
    const fakePlayer = { x: 32 * 16 + 10, y: 34 * 16 + 10 };
    AC.companion.update(0.016, fakePlayer);
    AC.companion.triggerHint(fakePlayer);
  });

  // --- M4.6 Day/Night Atmosphere ---
  test('M4.6: Atmosphere cycles day/night modes and updates state', function () {
    assert(AC.atmosphere, 'AC.atmosphere must exist');
    AC.atmosphere.setMode('night');
    assert.equal(AC.atmosphere.getMode(), 'night');
    assert.equal(AC.progress.get().settings.theme, 'night');

    AC.atmosphere.setMode('day');
    assert.equal(AC.atmosphere.getMode(), 'day');

    AC.atmosphere.setMode('auto');
    assert.equal(AC.atmosphere.getMode(), 'auto');
    AC.atmosphere.update(1.0);
  });

  // --- M4.8 Title Screen & Character Select ---
  test('M4.8: Title screen manages show/hide and player customization', function () {
    assert(AC.title, 'AC.title must exist');

    AC.title.show();
    assert.equal(AC.title.isOpen(), true);
    assert.equal(AC.getState(), 'title');

    AC.title.hide();
    assert.equal(AC.title.isOpen(), false);
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
