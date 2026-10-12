# M1 — Walking prototype (placeholder art)

**Goal:** A canvas world you can walk around: hub + four regions, walls, camera, crisp
integer scaling, stable 60 fps. No lectures yet.

**Load:** `AGENTS.md`, `docs/ARCHITECTURE.md` §1, §3, §5–§8, §12, `docs/CONVENTIONS.md`, `docs/ASSETS.md` (placeholder section), `workflows/02_task-loop.md`.

**Preconditions:** M0 accepted. Branch `m1-walking`.

## Tasks
### M1.1 — Canvas and integer scaling
`index.html` gets `<canvas id="game">` (Classic Mode remains reachable). Internal 320×180; scale = `floor(min(innerWidth/320, innerHeight/180))` ≥ 1; letterbox; `image-rendering: pixelated`; handle `devicePixelRatio`; recompute on resize.
**Done when:** resizing the window never blurs pixels or stretches non-uniformly (manual check at 3 sizes).

### M1.2 — Loop
`AC.loop` per contract (fixed 1/60 step, accumulator, delta clamp 0.25 s, ≤ 5 updates/frame, pause when hidden).
**Done when:** a test with a fake clock proves N elapsed seconds ⇒ ~60·N updates and a huge delta is clamped; switching tabs then back doesn't teleport the player.

### M1.3 — Input
`AC.input` per contract; keyboard + `bindTouch` stub; ignore keys when typing in form fields; diagonal movement normalized.
**Done when:** unit test for normalization (|v| ≤ 1); manual: holding W+D is not faster than W.

### M1.4 — Tilemap and placeholder tiles
`js/world/tiles.js`: named constants (`T.GRASS`, `T.PATH`, `T.WATER`, `T.TREE`, `T.WALL`, `T.FLOOR`, `T.RAIL`, …) with a `solid` set; placeholder drawing = colored squares with simple patterns generated at boot into an offscreen "atlas". `AC.tilemap` per contract with out-of-bounds solid.
**Done when:** `isSolid` tests (inside/outside/edges).

### M1.5 — Map data
`js/world/map-data.js`: helper-built 64×64 map per `ARCHITECTURE.md` §8 (hub, four regions, 3-tile roads, border of trees/walls, water ponds in Set Park, rails in String Street/DFA Station). Deterministic.
**Done when:** a test asserts map dimensions, that spawn (32,34) is walkable, that a walkable path exists from spawn to each board tile (BFS over non-solid tiles), and that every region's board tile is walkable-adjacent.

### M1.6 — Collision
`AC.collide.move` pure per contract (separate X/Y axes; slide along walls).
**Done when:** tests: blocked by solid tile, slides along a wall, can't leave map, tiny dt doesn't tunnel, max speed doesn't tunnel (speed × dt < tile size).

### M1.7 — Player and camera
Player entity (placeholder sprite = colored rectangle with a facing marker), speed 64 px/s *(default)*, 4-direction facing; camera smoothing + clamp.
**Done when:** you can walk the full map; camera never shows outside the map; player is drawn in the correct depth order against `above` tiles.

### M1.8 — Debug overlay
F3 toggles FPS, tile coords, hitbox, solid-tile outlines. Disabled by default; removable via one flag.
**Done when:** overlay works and costs nothing when off.

## Acceptance criteria
- [ ] All tests green (`node tests/run.js`).
- [ ] Walk from spawn to every region and back; cannot pass walls or leave the map.
- [ ] 60 fps in the browser performance panel (or the debug FPS) on the human's machine `[human check]`.
- [ ] No per-frame allocation in `update`/`render` (code review confirms).
- [ ] Console clean from `file://`.
- [ ] Resizing keeps pixels crisp.

## Out of scope
Triggers, lectures, NPCs, real art, sound, saving position.

## Stop and ask if
The map layout in `ARCHITECTURE.md` §8 produces unreachable areas (propose an adjustment as a decision entry); performance misses the budget.
