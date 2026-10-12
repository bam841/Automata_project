# Progress Tracker (the agent updates this at the end of every task)

**Current milestone:** M1 Complete (Ready for M2) · **Branch:** m1-walking · **Last updated:** 2026-10-12

## Milestones
- [x] **M0 Refactor** — ground truth · namespace · pure logic + tests · mountable views · Classic Mode · regression pass
- [x] **M1 Walking prototype** — canvas scaling · loop · input · tilemap · collision · camera · player · hub + 4 regions (placeholder art)
- [ ] **M2 Stations wired** — triggers/prompts · lecture shell · Practice/Challenge mounted · stamps + persistence · HUD · Professor Delta · quest arrow
- [ ] **M3 Blackboard lessons** — lesson player · chalk/CRT skins · 4 lessons · quick checks
- [ ] **M4 World and feel** — asset manifest · tiles · district dressing · NPCs · shards + Journal · day/night · SFX · title + character select
- [ ] **M5 Minigames (optional)** — Venn stepping · Tree walk · DFA ride · String pads
- [ ] **M6 Finale and ship** — exam generator · Exam Tower · certificate · touch controls · settings · playtest · deploy · docs

## Acceptance evidence
### M0 — Refactor and Decoupling
- [x] `docs/GROUND_TRUTH.md` complete and cite-grounded [VERIFIED].
- [x] `node tests/run.js` passes all 42 unit, property, and integration tests [VERIFIED].
- [x] `tests/index.html` green from `file://` browser [VERIFIED].
- [x] Only global is `AC` across all 12 modules (`js/core/`, `js/logic/`, `js/lessons/`, `js/classic.js`, `js/main.js`) [VERIFIED].
- [x] Zero inline `onclick=` handlers (`grep -rn "onclick=" js/ index.html` -> 0) [VERIFIED].
- [x] Complete regression checklist passing: String Street, Set Park, Tree Forest, DFA Station, Classic Mode [VERIFIED].
- [x] `legacy/` untouched baseline preserved [VERIFIED].

### M1 — Walking Prototype
- [x] Canvas integer scaling (320x180 buffer scaled by floor factor, letterboxed) [VERIFIED].
- [x] Fixed 60 FPS timestep loop with accumulator and lag spike clamping [VERIFIED].
- [x] Input system with diagonal movement normalization (|v| <= 1.0) and form field protection [VERIFIED].
- [x] 64x64 World map with Hub, 4 regions, 3-tile roads, and solid perimeter [VERIFIED].
- [x] BFS pathfinding tests confirm non-solid walkable path from spawn (32, 34) to all 4 district board tiles [VERIFIED].
- [x] AABB collision with separate X/Y axis sliding along solid walls [VERIFIED].
- [x] Camera tracking and viewport clamping within map bounds [VERIFIED].
- [x] Debug overlay (F3) displaying FPS, player coordinates, tile index, and hitbox outline [VERIFIED].
- [x] Mode toggle between World Game and Classic Mode [VERIFIED].
- [x] Total test suite: 52 tests passing [VERIFIED].

## Known issues
- None.

## Open questions for the human
- None. M1 Walking Prototype is fully verified and ready for M2 (Stations wired & blackboard lecture shell).

## Last session summary
- M1 Walking Prototype complete. Engine and world systems implemented with zero external dependencies, running at 60 FPS with pixel-perfect integer scaling. Next: Milestone 2 (Stations wired, interaction triggers, and lecture overlay shell).



