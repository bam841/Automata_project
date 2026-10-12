# AGENTS.md — Automata City (read this first, every session)

## Mission
Turn the existing vanilla-JS site "Automata City" into a top-down pixel-art **open-world
browser game**. Four stations (String Street, Set Park, Tree Forest, DFA Station) each open a
**lecture board** (Learn / Practice / Challenge). Earn 4 stamps, unlock the Exam Tower.
Full design: `docs/PROJECT_BRIEF.md`. Contracts: `docs/ARCHITECTURE.md`.

## Hard constraints (never violate)
1. **No frameworks, no bundler, no npm runtime dependencies.** Plain JavaScript, HTML5 Canvas 2D, CSS, SVG.
2. **Must run by double-clicking `index.html` (`file://`).** So: classic `<script>` tags only. **No `import`/`export`, no `type="module"`, no `fetch()`/XHR of local files.** Images via `<img>`/`Image` are fine.
3. **One global: `AC`.** Every file is an IIFE that attaches to `AC` (see `docs/CONVENTIONS.md`). No other globals, no inline `onclick`.
4. **Theory logic is pure** (no DOM, no `Math.random` directly — use the seeded RNG) and lives in `js/logic/`.
5. **Do not invent assets.** Only files listed in `assets/MANIFEST.md` may be referenced. Until art exists, use procedural placeholders.
6. **Do not add a dependency, CDN link, or external URL** without a new entry in `docs/DECISIONS.md` approved by the human.

## Source of truth (highest wins)
1. The code currently in the repository (read it, don't recall it).
2. `docs/DOMAIN_SPEC.md` for any theory fact. `docs/ARCHITECTURE.md` for contracts.
3. `docs/DECISIONS.md`.
4. The human's latest message.
5. Your general knowledge — **lowest**. Never use it to fill a gap about this project.

## Anti-hallucination protocol (summary — full text: `workflows/00_anti-hallucination.md`)
- **Ground before you act.** Before using any existing identifier, file, CSS class, or DOM id, open the file and confirm it exists. Cite `file:line`.
- **Never guess.** If something is not in the repo, the docs, or the human's message, write `UNKNOWN` and either ask or propose it labeled `[ASSUMED]`.
- **Tag every claim in reports:** `[VERIFIED]` (you ran/observed it), `[READ]` (seen in code), `[ASSUMED]`, `[UNKNOWN]`. Untagged claims are treated as `[ASSUMED]`.
- **"Works" means you ran it.** If you cannot run code in your environment, say `[NOT VERIFIED]` and give the human an exact manual check.
- **No invented APIs.** Use only browser APIs listed in `docs/CONVENTIONS.md` §Allowed APIs. If unsure a method exists, say so.
- **Theory facts come from `docs/DOMAIN_SPEC.md`**, and displayed results are computed by `js/logic/`, never hard-coded in lesson text.

## Stop and ask the human when
- A requirement is ambiguous or two docs disagree.
- You need a new dependency, asset, or a change to a contract in `docs/ARCHITECTURE.md`.
- A test fails and you cannot explain why after **two** attempts.
- The task would touch more than 5 files or exceed ~400 lines in one file.
- You are about to delete or rewrite working code that the task did not mention.

## Working rules
- **One task at a time**, following `workflows/02_task-loop.md`. Small diffs. No drive-by refactors or reformatting.
- Preserve behavior of existing features unless the task says otherwise. `legacy/` (copy of the original site) is read-only reference.
- Keep names from the existing code where they are still used (`'str'|'set'|'tree'|'dfa'` district ids, color tokens).
- Add a test whenever you add or change logic. Visual work gets a written manual check.
- Update `docs/PROGRESS.md` at the end of every task; add `docs/DECISIONS.md` entries for any design choice.
- Keep files under ~400 lines; split by responsibility.

## Definition of done (every task)
- [ ] Acceptance criteria from the milestone workflow all checked, each with evidence.
- [ ] `node tests/run.js` passes (once it exists, from M0) and `tests/index.html` shows all green.
- [ ] No console errors/warnings when opening `index.html` from `file://`.
- [ ] No new globals besides `AC`.
- [ ] `docs/PROGRESS.md` updated; task report posted using the template in `workflows/02_task-loop.md`.

## What exists today (from docs — **UNVERIFIED** until the M0 ground-truth pass)
- `index.html` loads `css/style.css`, then scripts in this order: `core.js, strings.js, sets.js, tree.js, dfa.js, app.js`.
- `core.js` reportedly defines: `$`, `app` (mount node `#app`), `esc`, `ST` (stamp state), `D` (district registry with `id, n, c, s, f`), `head(t)`, `home()`.
- District views: `strv()`, `setv()`, `treev()`, `dfav()`; they redraw by rewriting `app.innerHTML` on every change.
- District ids and colors: `str #e0663f`, `set #1f9d8a`, `tree #4c8c3a`, `dfa #6f55e0`.
- Universe for sets is `{1..8}`; DFA is binary, 2–5 states; "Run all tests" checks all 127 binary strings of length 0–6.

## Forbidden
Inventing file names, function names, tile indices, library versions, or URLs · "TODO: implement later" stubs presented as done · silently skipping a failing test · editing `legacy/` · using real people's names in game content (the guide NPC is *Professor Delta*) · copying assets without a license entry in `assets/MANIFEST.md`.
