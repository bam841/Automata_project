# M0 — Refactor: make the existing site reusable

**Goal:** Same behavior as today, but organized so game code can mount each district inside
a lecture board: pure logic separated from views, one global (`AC`), tests, progress module,
Classic Mode.

**Load:** `AGENTS.md`, `docs/ARCHITECTURE.md` §1–4, §9, §11, `docs/CONVENTIONS.md`, `docs/DOMAIN_SPEC.md`, `workflows/00_anti-hallucination.md`, `workflows/02_task-loop.md`.

**Preconditions:** repo contains the original site. Create branch `m0-refactor`.

## Tasks

### M0.1 — Snapshot and ground truth (no code changes)
- Copy the original site to `legacy/` (read-only reference). Commit.
- Read **every** file in `js/`, `css/`, `index.html`. Write `docs/GROUND_TRUTH.md` containing:
  1. Every top-level name per file (functions, consts, lets) with `path:line` and a one-line purpose.
  2. Every inline `onclick`/`on*=` handler and the function it calls.
  3. Every DOM id/class the JS reads or writes; every `innerHTML` sink.
  4. Which functions are **pure computation** vs **DOM rendering** vs **state**.
  5. Where `ST`, `app`, `D`, `head`, `home` are used.
  6. Mapping table: the target API in `ARCHITECTURE.md` §11 → the existing function that implements it (or `MISSING`).
  7. Anomalies. (The uploaded `index.html` appeared to contain a duplicated `<html>/<body>` wrapper and `css/style.css` was referenced while `style.css` was uploaded flat — confirm whether that is real.)
- **Done when:** `GROUND_TRUTH.md` exists, every entry has a `path:line`, nothing is `[ASSUMED]`. Human reviews it before M0.2.

### M0.2 — Namespace and utilities
- Create `js/core/ac.js`: `AC`, `AC.util` (`$`, `esc`, `clamp`), `AC.bus`, `AC.rng` (reference mulberry32 in `ARCHITECTURE.md` §3).
- **Done when:** tests for `esc`, `bus.on/off/emit`, and `rng` determinism (same seed ⇒ same first 5 numbers) pass.

### M0.3 — Test harness
- `tests/run.js` (Node, `vm.runInThisContext`, tiny `test(name, fn)` + `assert`) and `tests/index.html` (browser). Sketch:
```js
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
for (const f of ['js/core/ac.js','js/logic/strings.js','js/logic/sets.js','js/logic/tree.js','js/logic/dfa.js'].filter(p=>fs.existsSync(path.join(root,p))))
  vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
```
- **Done when:** `node tests/run.js` runs and exits 0 with the M0.2 tests; `tests/index.html` shows the same tests green from `file://`.

### M0.4 — Extract logic, one module at a time (strings → sets → tree → dfa)
For each module: move the **computation** into `js/logic/<name>.js` under `AC.<name>`, **keeping algorithms and results identical**; make it pure (no DOM, no `Math.random`; take `rng`). Add tests from `docs/DOMAIN_SPEC.md` §7. Update the old view to call the new logic.
- Tree: random BST must use `rng`; keep 7 unique keys; keep the inorder-based layout behavior.
- DFA: `testAgainst` must check all 127 strings of length 0–6 and return failures; the three goals per `DOMAIN_SPEC.md` §4. Add the reference-DFA test (0 mismatches each; complement disagrees on all 127).
- **Done when (each module):** tests green; the legacy page still behaves the same for that district.

### M0.5 — Views become mountable
- Each district view becomes `mount(host, ctx)` / `unmount()` rendering into `host`. Replace `app.innerHTML` with `host.innerHTML`, inline `onclick` with delegation via `data-act`, global `ST` with `AC.progress`.
- `AC.progress` per `ARCHITECTURE.md` §4 (localStorage in try/catch, defaults on corruption). Tests with a stubbed storage.
- **Done when:** a throwaway page mounts and unmounts each view twice without errors; no listener leaks (count `addEventListener` calls vs removals via a test wrapper or manual log).

### M0.6 — Classic Mode shell
- `js/classic.js`: the old `home()` card screen (district cards, stamps from `AC.progress`), "Back to the map" buttons, using the mountable views. `main.js` temporarily boots Classic Mode.
- **Done when:** the page looks and behaves like the original (compare with `legacy/` side by side).

### M0.7 — Regression pass and handoff
- Run the **regression checklist** below, fill results in `docs/PROGRESS.md`.

## Regression checklist (every item must be checked against `legacy/`)
- [ ] City map shows 4 districts; stamp status updates after a challenge.
- [ ] String Street: two inputs; length, prefix/suffix cut slider, concatenation, reverse, all prefixes/suffixes; palindrome (≥3 letters) challenge stamps.
- [ ] Set Park: toggle 1–8 in A and B; Venn highlights; all 7 operations; power set and Cartesian product lists; challenge A Δ B={1,2,7,8}, A∩B={4}.
- [ ] Tree Forest: new random tree; animated walk for 3 traversals; "Your turn" with correction on wrong click; challenge completes.
- [ ] DFA Station: 2–5 states; edit table; accepting toggles; diagram redraws; step a string; complement; "Run all tests" (127 strings) with failure examples; each of the 3 goals.
- [ ] Light and dark theme both fine; keyboard focus visible.
- [ ] No console errors from `file://`.

## Acceptance criteria
- [ ] `docs/GROUND_TRUTH.md` complete and human-reviewed.
- [ ] `node tests/run.js` green; `tests/index.html` green.
- [ ] Only global added is `AC` (verify by listing top-level `function`/`var` in `js/` — none outside IIFEs).
- [ ] No inline `onclick` remains (`grep -rn "onclick=" js/ index.html` → none).
- [ ] Regression checklist fully ticked.
- [ ] `legacy/` untouched.

## Out of scope
Any canvas/game code, new visuals, new lessons.

## Stop and ask if
Ground truth shows logic and rendering are too entangled to separate without behavior change; the old code disagrees with `DOMAIN_SPEC.md` (report the discrepancy with `path:line`, don't silently "fix").
