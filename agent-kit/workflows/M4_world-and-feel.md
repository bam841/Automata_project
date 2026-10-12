# M4 — World and feel (real art, NPCs, shards, polish)

**Goal:** The world looks and sounds like a game: real tiles and sprites, district dressing,
NPCs, 12 collectible shards with a Journal, day/night, SFX, title screen, character select.

**Load:** `AGENTS.md`, `docs/ASSETS.md`, `docs/ARCHITECTURE.md` §5–§8, `docs/DOMAIN_SPEC.md` §6, `docs/PROJECT_BRIEF.md` §3 and §8, `workflows/02_task-loop.md`.

**Preconditions:** M3 accepted. Branch `m4-feel`. **Human action needed first:** download the chosen asset packs, put them in `assets/sprites/`, and fill `assets/MANIFEST.md` (file, source URL, license). The agent does **not** download or guess.

## Tasks
### M4.1 — Contact sheet and tile picks
Build `tools/contact-sheet.html` (loads a sheet, draws grid + index labels). The human (or an agent that can view images) fills `docs/ASSET_PICKS.md`. Agent converts it to `js/world/tiles.js` constants. Unpicked entries remain placeholders.
**Done when:** every constant used by `map-data.js` is either picked or placeholder; no raw tile numbers appear in gameplay code (`grep` check).

### M4.2 — Sprite loading and animation
`AC.sprites.load` using `Image`, with a loading screen and a graceful fallback to placeholders if an image fails. Player/NPC animation: 4 directions × walk frames (as the chosen pack provides). Frame tables use names.
**Done when:** missing image ⇒ visible warning in console + placeholder, game still runs.

### M4.3 — District dressing
Per `PROJECT_BRIEF.md` §3: railway + letter train cars; two overlapping ponds as a Venn (drawn in code) with flowers numbered 1–8; lit tree nodes with connecting paths; platforms `q0…q3` with a flag on accepting ones; fountain, Exam Tower (sealed), banners in district colors. Add `above`-layer canopies/roofs.
**Done when:** each district is recognizable at a glance (human check) and still passes the M1 reachability test.

### M4.4 — NPCs and companion
One resident NPC per district with 2–3 hint lines (data table); companion Eps follows with a position-history trail; press H (or tap) for a hint relevant to the nearest district's current state.
**Done when:** dialogue data in one file; companion never blocks the player (no collision with player).

### M4.5 — Shards and Journal
12 shards per `DOMAIN_SPEC.md` §6 (3 per district), hidden but reachable; pickup → `AC.bus.emit('shard')`, `AC.progress.addShard`, `collect` sound, counter update. Journal (J): grid of 12 slots; collected ones show symbol, name, definition from the glossary table.
**Done when:** all 12 are reachable (BFS test over map); Journal text equals the glossary in `DOMAIN_SPEC.md` (test compares).

### M4.6 — Day/night and theme
Toggle (and "auto" via `prefers-color-scheme`) tints the world, lights lamps, adds fireflies (dust/fireflies obey reduced motion). Lecture overlay theme follows.
**Done when:** toggle persists; no perf drop below budget.

### M4.7 — Audio
`AC.audio` synthesized SFX per `docs/ASSETS.md`; created on first gesture; mute persists; master ≤ 0.2.
**Done when:** each named sound triggers on its event; mute truly silences.

### M4.8 — Title screen and character select
Pixel-font title, "Press Start", Classic Mode link, name entry (escaped, ≤ 12 chars), choose one of 4 sprites (from the character pack), Continue/New Game/Reset.
**Done when:** name/sprite persist and show in the HUD.

## Acceptance criteria
- [ ] `assets/MANIFEST.md` complete with license lines and credits; credits screen mirrors it.
- [ ] No 404s / console errors; fallbacks tested by renaming an asset temporarily.
- [ ] Reachability/BFS tests still green; 60 fps with all dressing.
- [ ] One tileset + one character set + one font used consistently.
- [ ] Human playtest: 3 people find the first station without instructions.

## Out of scope
Music, cutscenes, extra districts.

## Stop and ask if
A needed tile/sprite doesn't exist in the chosen packs (propose placeholder or ask for a source); license is unclear.
