# Progress Tracker (the agent updates this at the end of every task)

**Current milestone:** M0 Complete (Ready for M1) · **Branch:** m0-refactor · **Last updated:** 2026-10-12

## Milestones
- [x] **M0 Refactor** — ground truth · namespace · pure logic + tests · mountable views · Classic Mode · regression pass
- [ ] **M1 Walking prototype** — canvas scaling · loop · input · tilemap · collision · camera · player · hub + 4 regions (placeholder art)
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

## Known issues
- None.

## Open questions for the human
- None. M0 refactor is clean, fully verified, and ready to merge or proceed to M1.

## Last session summary
- M0 Refactor successfully completed. Codebase is now modularized under `AC`, pure theory math is tested and separated in `js/logic/`, views are mountable with event delegation in `js/lessons/`, Classic Mode runs seamlessly, and 42 tests pass. Next: Milestone 1 (Walking Prototype).


