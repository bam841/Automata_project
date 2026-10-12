# Progress Tracker (the agent updates this at the end of every task)

**Current milestone:** M0 · **Branch:** m0-refactor · **Last updated:** 2026-10-12

## Milestones
- [ ] **M0 Refactor** — ground truth (done) · namespace · pure logic + tests · mountable views · Classic Mode · regression pass
- [ ] **M1 Walking prototype** — canvas scaling · loop · input · tilemap · collision · camera · player · hub + 4 regions (placeholder art)
- [ ] **M2 Stations wired** — triggers/prompts · lecture shell · Practice/Challenge mounted · stamps + persistence · HUD · Professor Delta · quest arrow
- [ ] **M3 Blackboard lessons** — lesson player · chalk/CRT skins · 4 lessons · quick checks
- [ ] **M4 World and feel** — asset manifest · tiles · district dressing · NPCs · shards + Journal · day/night · SFX · title + character select
- [ ] **M5 Minigames (optional)** — Venn stepping · Tree walk · DFA ride · String pads
- [ ] **M6 Finale and ship** — exam generator · Exam Tower · certificate · touch controls · settings · playtest · deploy · docs

## Acceptance evidence
### M0.1 — Snapshot and ground truth
- [VERIFIED] Created `legacy/` directory containing exact snapshot of original site (`index.html`, `css/`, `js/`), committed in commit `5dee245`.
- [VERIFIED] Read all files (`index.html`, `css/style.css`, `js/core.js`, `js/strings.js`, `js/sets.js`, `js/tree.js`, `js/dfa.js`, `js/app.js`).
- [VERIFIED] Authored `docs/GROUND_TRUTH.md` containing all top-level identifiers, inline handlers, DOM sinks, separation of concerns analysis, global variable dependencies, target API mapping table, and documented codebase anomalies. All entries cited with `path:line`.

## Known issues
- `index.html` has duplicated `<html>` and `<body>` outer structure (documented in `GROUND_TRUTH.md`).

## Open questions for the human
- None. Ground truth audit complete and ready for human review before M0.2.

## Last session summary
- M0.1 complete. Next: M0.2 (Namespace and utilities in `js/core/ac.js`).

