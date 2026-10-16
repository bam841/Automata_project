# Decision Log

Rule: a decision here is **settled**. To change one, add a new entry that supersedes it and
get the human's approval. Agents never change a settled decision silently.

| ID | Decision | Rationale | Status |
|---|---|---|---|
| D-001 | Custom Canvas 2D engine, no game library | Keeps the project's "zero dependency" identity; tile game is small | Accepted |
| D-002 | Classic scripts + single `AC` namespace; no ES modules | ES modules and `fetch` fail on `file://`; project must open by double-click | Accepted |
| D-003 | Maps defined in JS code with helpers, not Tiled JSON | `fetch` of JSON fails on `file://`; deterministic and diff-friendly | Accepted |
| D-004 | Lessons are a DOM overlay over the canvas | Reuses existing HTML/SVG views; math symbols render properly | Accepted |
| D-005 | Placeholder-first art; Kenney CC0 packs later; tile ids chosen via contact sheet | Prevents art from blocking progress and tile-id guessing | Accepted |
| D-006 | SFX synthesized with WebAudio, no audio files | Works on `file://`, zero assets | Accepted |
| D-007 | Pixel font for HUD/titles only; readable font for lessons | Pixel fonts lack math symbols | Accepted |
| D-008 | Internal resolution 320×180, tile 16 px, integer scaling | Crisp pixels, simple math | Accepted (adjustable in M1) |
| D-009 | Progress in `localStorage` key `automataCity.v1`, in try/catch | Fixes "progress resets on refresh" | Accepted |
| D-010 | Original site kept as **Classic Mode** and in `legacy/` | Accessibility fallback and regression reference | Accepted |
| D-011 | Guide NPC "Professor Delta", companion "Eps (ε)"; no real people's names in game content | Avoids using a real person as a character | Accepted |
| D-012 | District ids `str/set/tree/dfa` and their four colors are unchanged | Continuity with existing code and docs | Accepted |
| D-013 | Theory logic is pure and seeded; lesson/exam values computed, never hard-coded | Correctness and testability | Accepted |
| D-014 | Exam: 8 questions, pass ≥ 6; 12 shards; 6–9 steps per lesson | Scope control | Accepted |

| D-015 | AC.dialogue.show(speaker, lines) multi-speaker API with robust keycode/key & delegated click advance | Allows all resident NPCs and Professor Delta to be interacted with via E, Space, Enter, mouse click, and touch | Accepted |
| D-016 | Station prerequisite quests with Hub resources, road gates, and active HUD quest tracker | Engages viewers during video demonstration defense and grounds each station in foundational theory | Accepted |

## New decisions (append below)
<!-- | D-016 | … | … | Proposed/Accepted | -->
