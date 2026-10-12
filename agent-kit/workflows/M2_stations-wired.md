# M2 — Stations wired: walk up, press E, lecture board opens

**Goal:** Each district has a board you can interact with; it opens the lecture overlay
(Learn placeholder, Practice, Challenge); finishing a challenge earns a persisted stamp;
HUD shows progress; Professor Delta guides.

**Load:** `AGENTS.md`, `docs/ARCHITECTURE.md` §4–§9, `docs/CONVENTIONS.md` (DOM and events), `docs/PROJECT_BRIEF.md` §5–§8, `workflows/02_task-loop.md`.

**Preconditions:** M1 accepted. Branch `m2-stations`.

## Tasks
### M2.1 — Triggers and prompt
Trigger system per contract; nearest trigger within 1.5 tiles shows "E  Enter lecture" above the player. District registry `AC.districts` with `board` tiles per §8; board props drawn (placeholder).
**Done when:** unit test for "nearest in range"; manual: prompt appears/disappears at the right distance.

### M2.2 — Game state machine
`main.js`: `title` (minimal: "Press Start" which also unlocks audio) → `world` ⇄ `lecture`; emits `state` events; world `update` skipped in `lecture`.
**Done when:** state transitions are unit-tested with a stub (illegal transitions rejected).

### M2.3 — Lecture shell
`AC.lessons.shell` per §9: dialog semantics, focus trap, Esc closes, restore focus, tabs (Learn · Practice · Challenge), district color accent, overlay expand/collapse animation (skipped under reduced motion).
**Done when:** manual checklist — Tab cycles inside the dialog only; Esc closes; focus returns to canvas; screen reader label present; typing in inputs never moves the player.

### M2.4 — Mount existing views
Practice and Challenge tabs mount the refactored district views from M0; Learn shows "Lesson coming in M3". Pass `ctx` with `onStamp`.
**Done when:** every README feature for each district still works inside the overlay.

### M2.5 — Stamps and persistence
`ctx.onStamp(id)` → `AC.progress.setStamp` → `AC.bus.emit('stamp')` → HUD updates; `AC.progress.save()`; player tile position saved on lecture open and on `beforeunload`.
**Done when:** after finishing a challenge and refreshing, the stamp is still there; corrupt storage doesn't crash (test).

### M2.6 — HUD
Top-left 4 stamp slots (district colors + initial letter, not color-only), shard counter `0/12` placeholder, mute button, minimap with district blocks and player dot.
**Done when:** HUD updates on `stamp`; layout fine at 3 window sizes.

### M2.7 — Professor Delta and dialogue
Dialogue box with typewriter text (instant under reduced motion), advance with E/Enter/tap. Professor at the hub: intro, "where to go next" hints depending on stamps, a line when all 4 are stamped. Quest arrow/hint points to the nearest unstamped district.
**Done when:** dialogue strings live in a data table; unit test for "next hint" logic (0, 1–3, 4 stamps).

### M2.8 — Leak and lifecycle check
Open/close each lecture 20×; DOM node count and listener count stay flat.
**Done when:** a script or documented manual measurement shows no growth.

## Acceptance criteria
- [ ] Can enter all four stations, use Practice and Challenge, earn all four stamps.
- [ ] Stamps persist across refresh; Reset option clears them.
- [ ] Keyboard-only flow works end to end.
- [ ] Tests green; console clean; world paused while overlay open.
- [ ] Classic Mode still reachable (e.g., from the title screen).

## Out of scope
Real lesson content, shards, sounds beyond a placeholder beep, art.

## Stop and ask if
A view cannot be mounted without global state (report it, don't hack around it).
