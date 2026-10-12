# Code Conventions

## Language and structure
- ES2020 max, plain scripts (no modules, no transpiling). `'use strict'` in every file.
- Every file = one IIFE attaching to `AC` (see `ARCHITECTURE.md` §2). No top-level `var`/`function`/`let`/`const` outside the IIFE.
- Files ≤ ~400 lines; one responsibility per file; filename matches the `AC.<name>` it provides.
- Names: `camelCase` functions/vars, `PascalCase` only for constructor-like factories, `UPPER_SNAKE` for constants. District ids stay `'str' | 'set' | 'tree' | 'dfa'`.
- Prefer small pure functions; pass dependencies as arguments (`rng`, `map`, `host`).

## DOM and events
- No inline `onclick`. Use `data-act="name"` and one delegated listener on the `host`.
- Escape all user-typed text with `AC.util.esc` before inserting into `innerHTML`; prefer `textContent` where possible.
- Views render only inside the `host` they receive. They never use `document.body` or global ids except via `AC.util.$(sel, host)`.
- Every `mount` has a matching `unmount` that removes listeners, timers, `requestAnimationFrame` ids, and observers.
- Overlay: `role="dialog"`, `aria-modal="true"`, labelled; focus trap; Esc closes; restore focus on close.

## Allowed APIs (anything else: ask first)
Canvas 2D (`getContext('2d')`, `drawImage`, `fillRect`, `fillText`, offscreen canvas via `document.createElement('canvas')`), `requestAnimationFrame`, `performance.now`, `KeyboardEvent`, Pointer Events, `Image`, Web Audio (`AudioContext`, `OscillatorNode`, `GainNode`, `AudioBufferSourceNode`), `localStorage` (in try/catch), `matchMedia`, `ResizeObserver`, `Set`/`Map`/typed arrays, SVG via `createElementNS` or template strings, `document.fonts` (optional), `canvas.toBlob`/`toDataURL`.
**Not allowed:** `fetch`/`XMLHttpRequest` for local files, ES modules, `eval`/`new Function`, `document.write`, external CDNs/URLs, `localStorage` without try/catch, `alert/confirm/prompt`.

## Randomness and time
- Logic and generators take an `rng` argument. Tests use fixed seeds.
- Use `performance.now()` deltas, clamped, for the loop. Never rely on frame count for time.

## Error handling
- Boot failures show a readable message in the page (and offer Classic Mode), not a blank screen.
- Storage failures degrade silently to in-memory progress.

## Testing
- `tests/run.js` (Node): loads `js/core/ac.js` and `js/logic/*.js` with `vm.runInThisContext`, runs `*.test.js` using a tiny `assert`-based harness, exits non-zero on failure.
- `tests/index.html`: same tests in the browser, shows green/red per test (works from `file://`).
- Every logic function has tests from `DOMAIN_SPEC.md` §7 plus edge cases (empty string, empty set, single-node tree, 1-state DFA is out of range, 2–5 only).
- Visual/behavioral work has a written manual checklist in the milestone workflow; the agent lists which steps it could not perform.

## Git hygiene
Branch per milestone. Commit per task: `M1: add tile collision`. No unrelated changes in a commit. Never commit generated or downloaded assets without a manifest line.

## Comments
Explain *why*, not *what*. Mention the contract section when implementing one (e.g., `// ARCHITECTURE §5`).
