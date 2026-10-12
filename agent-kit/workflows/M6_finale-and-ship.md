# M6 — Finale and ship

**Goal:** Exam Tower with a generated final exam, certificate, touch controls, settings,
playtest fixes, deployment, and updated documentation for the project defense.

**Load:** `AGENTS.md`, `docs/DOMAIN_SPEC.md` §8, `docs/ARCHITECTURE.md` §4, §9, §11–§13, `docs/PROJECT_BRIEF.md`, `workflows/03_fix-and-review.md`.

**Preconditions:** M4 accepted (M5 optional). Branch `m6-ship`.

## Tasks
### M6.1 — Exam generator
`AC.examGen(rng)` → 8 questions (2 per topic) exactly per `DOMAIN_SPEC.md` §8; shared with quick checks.
**Done when:** tests over 200 seeds: 8 questions, 2 per topic, exactly one correct option, options unique, answer equals the logic result, same seed ⇒ identical exam, different seeds ⇒ not all identical.

### M6.2 — Exam Tower
Tower locked (4 stamp locks visible) until 4 stamps; interacting opens an exam overlay (reuses the lecture shell: dialog semantics, focus trap). One question at a time, explanation after each answer, score at the end, pass ≥ 6/8, retry with a new seed; best score saved.
**Done when:** locked state shows how many stamps are missing; pass emits `exam:pass` and persists.

### M6.3 — Certificate and credits
Canvas-drawn certificate: player name, date, score, group credits from `README.md`, asset credits from `assets/MANIFEST.md`. "Download image" via `canvas.toDataURL` + `<a download>`; "Print" via `window.print` with a print stylesheet.
**Done when:** name is escaped/trimmed; works on `file://`.

### M6.4 — Touch controls and responsive
Virtual joystick (left) + A button (right) via Pointer Events; show only on touch devices (`matchMedia('(pointer: coarse)')`); lecture overlay scrollable on small screens; safe-area insets respected.
**Done when:** manual test on a phone or devtools device emulation (list devices tried).

### M6.5 — Settings and reset
Mute, theme (auto/light/dark), reduced motion override, "Reset progress" with a confirm dialog **built in the UI** (no `confirm()`), Classic Mode link, controls help screen.
**Done when:** settings persist; reset clears `automataCity.v1` and returns to the title.

### M6.6 — Playtest and fixes
Run the **playtest script** below with 3 people who haven't seen the game. File issues in `PROGRESS.md`; fix with `workflows/03_fix-and-review.md`.

### M6.7 — Review, hardening, deploy
- Full code review per `workflows/03_fix-and-review.md` §B (fresh session).
- Remove/disable debug overlay by default; no console logs in the happy path.
- Deployment: static hosting (e.g., GitHub Pages or Netlify) by pushing the folder; relative paths only. The human performs the deployment; the agent provides step-by-step instructions it has verified from the host's documentation **only if it can look them up**, otherwise says so.

### M6.8 — Documentation for the defense
Update `README.md` (new description, controls, how to run, structure, limitations) and `DOCUMENTATION.md` (architecture, module walkthroughs, game loop, state machine, lesson system, exam generator, testing). Add a short "How to explain this to the professor" section like the existing one. Every function/file named in docs must exist (identifier audit).

## Playtest script
Give testers no instructions. Observe: where they get lost; first-station time (< 2 min target); whether they find Practice/Challenge; whether any lesson step confuses them; total time (25–40 min target); any crash. Record quotes and fixes.

## Acceptance criteria
- [ ] Full path playable: title → 4 stamps → exam pass → certificate.
- [ ] Exam tests green over 200 seeds; all other tests green.
- [ ] Works from `file://` and when hosted; console clean in both.
- [ ] Touch and keyboard both complete the game.
- [ ] Docs updated and audited; credits correct.
- [ ] Reviewer verdict: Accept.

## Out of scope
New topics, backend, accounts, analytics.

## Stop and ask if
Deployment requirements conflict with the `file://` constraint; any license issue appears in the manifest.
