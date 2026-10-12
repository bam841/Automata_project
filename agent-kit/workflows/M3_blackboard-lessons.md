# M3 — Blackboard lessons (the heart of the project)

**Goal:** Each station's Learn tab is a guided, animated, chalkboard-style lesson that
teaches the topic with computed (never hard-coded) examples, ending in a 3-question quick check.

**Load:** `AGENTS.md`, `docs/DOMAIN_SPEC.md` (all), `docs/ARCHITECTURE.md` §9–§11, `docs/CONVENTIONS.md`, `docs/PROJECT_BRIEF.md` §5 and §9, `workflows/02_task-loop.md`.

**Preconditions:** M2 accepted. Branch `m3-lessons`.

## Tasks
### M3.1 — Lesson player
`js/lessons/lesson-player.js`: renders a `Lesson` (schema in `ARCHITECTURE.md` §10) into `host`: title, narration (`say`), drawing area, progress dots, Prev/Next, autoplay (Space), ←/→ keys, step counter. `mount/unmount` clean. Reduced motion ⇒ no autoplay animation, instant transitions.
**Done when:** unit-testable step navigation (clamped at ends); a dummy 3-step lesson works by keyboard only.

### M3.2 — Chalk and CRT skins (CSS)
`css/game.css`: `.board-chalk` (dark green/charcoal, chalk-white strokes, SVG filter using `feTurbulence` + `feDisplacementMap` for a slight wobble, applied only to drawings), `.board-crt` (scanline gradient, rounded bezel). Contrast ≥ 4.5:1 for text. District color as accent border/underline.
**Done when:** both skins render in light and dark theme; text stays readable (manual contrast check).

### M3.3 — Drawing helpers
Reuse the existing renderers (train cars, Venn SVG, tree SVG, DFA SVG) as functions that take **data** and return markup (no globals). Add chalk-style classes. Tree/DFA drawings must support "highlight node/state/region" and "current symbol on tape".
**Done when:** each helper has a snapshot-style test (string contains expected elements) or a manual visual check with a screenshot description.

### M3.4 — The four lessons (one task each)
Each lesson: 6–9 steps, ≤ 30 words each, one new idea per step, values computed via `AC.logic`, seed fixed per lesson (`Lesson.seed`) so the board is reproducible.

**String Street (`str`)** — 7 steps
1. Alphabet Σ and symbols · 2. A string and its length · 3. The empty string ε · 4. Concatenation (cars couple) · 5. Prefix and suffix (cut slider; show n+1 of each) · 6. Reverse (cars flip) · 7. Palindromes (w = w^R), and "ε is a palindrome too".

**Set Park (`set`)** — 9 steps (U = {1..8})
1. Elements and ∈ · 2. The universe U and subsets · 3. Union · 4. Intersection · 5. Difference (and why it's not symmetric) · 6. Symmetric difference · 7. Complement · 8. Power set (count 2^n, include ∅ and A) · 9. Cartesian product (ordered pairs; count |A||B|).
Each operation step walks element by element ("5 is in A and in B ⇒ in A ∩ B").

**Tree Forest (`tree`)** — 8 steps
1. Nodes, edges, root, leaf · 2. Binary tree: left and right · 3. The BST rule · 4. Preorder NLR (animated walk) · 5. Inorder LNR (note: sorted for a BST) · 6. Postorder LRN · 7. Call-stack panel showing the recursion for the current traversal · 8. The three orders side by side on the same tree.

**DFA Station (`dfa`)** — 8 steps (use the `.board-crt` skin)
1. A machine that reads a tape · 2. States and the start state · 3. Transitions: δ as a table · 4. Accepting states · 5. Run an accepted string (tape + highlighted state) · 6. Run a rejected string · 7. The 5-tuple (Q, Σ, δ, q0, F) mapped onto the picture · 8. Complement: flip accepting states (show a string whose result flips).
Use the "ends in 01" reference machine from `DOMAIN_SPEC.md` §4 for the lesson; verify each shown run with `AC.dfa.run`.

**Done when (each lesson):** step count within range; no step text > 30 words (enforced by a test that scans the lesson data); every displayed value is produced by a logic call (a test replays the steps and compares with golden values where they exist); content reviewed against `DOMAIN_SPEC.md` §5 "common mistakes".

### M3.5 — Quick checks
`AC.examGen`-style generators for 3 questions per topic (shared with M6): options unique, one correct, explanation shown after answering, "Try again" and "Continue".
**Done when:** tests: same seed ⇒ same questions; exactly one option equals the computed answer; no duplicate options (run 200 seeds).

### M3.6 — Integrate
Learn tab uses the player + lesson; finishing the quick check marks the lesson "seen" in `AC.progress` (optional hint to the player; **does not** replace the challenge).
**Done when:** full path works in-world: walk → E → Learn → quick check → Practice → Challenge → stamp.

## Acceptance criteria
- [ ] All four lessons complete, keyboard-navigable, reduced-motion friendly.
- [ ] A content review table (step ↔ DOMAIN_SPEC section) is added to `PROGRESS.md`.
- [ ] Tests green, including lesson-data tests (word limit, computed values).
- [ ] No hard-coded results (grep for literal results in lesson data; reviewer confirms).
- [ ] Looks good in light and dark; board skins consistent.

## Out of scope
Voice-over, extra topics, new minigames.

## Stop and ask if
A step needs a fact not in `DOMAIN_SPEC.md` — list it under Open questions instead of writing it.
