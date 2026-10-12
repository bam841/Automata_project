# M5 — In-world minigames (optional; do the first two, then reassess)

**Goal:** Make the world itself demonstrate each concept. Minigames are **bonus**: they never
gate stamps or the exam. Each rewards confetti and a Journal flourish, not progress.

**Load:** `AGENTS.md`, `docs/DOMAIN_SPEC.md`, `docs/ARCHITECTURE.md` §5–§7, `workflows/02_task-loop.md`.

**Preconditions:** M4 accepted. Branch `m5-minigames`. Each minigame is a module `js/world/mini-<id>.js` with `start(game, rng)`, `update(dt)`, `draw(ctx)`, `stop()`, and emits `mini:done {id, score}` on the bus (add the event to `ARCHITECTURE.md` §3 and `DECISIONS.md` first).

## Priority order
1. **Set Park — Venn stepping.** Professor/NPC calls "Stand in A ∩ B". Two ponds are two circles (center, radius). Region = point-in-circle tests for the player's feet position; ignore a 2 px band at circle borders. 5 rounds from a seeded `rng`; targets: only A, only B, both, neither, plus the operation named. Required answer computed via `AC.sets` over a small A/B for the round.
2. **Tree Forest — Walk the traversal.** `AC.tree.randomBST(rng, 7)` placed as lit trees at layout positions. The prompt shows "Preorder": walk to the trees in that order (enter a node radius to "visit"). Wrong order ⇒ error sound + highlight the expected node, no punishment. Expected sequence from `AC.tree`.
3. **DFA Station — Ride the machine.** A seeded input string (length ≤ 6) and the "ends in 01" machine laid out as platforms; each symbol: walk to the platform `δ(current, symbol)`; at the end, stand at the *accept* or *reject* gate accordingly.
4. **String Street — Letter pads.** Pads with letters on the ground; step on them to spell a target (concatenation) or its reverse. Optional; skip if time is short.

## Tasks
Per minigame: (a) logic tested in Node (round generation, correctness check, with seeds); (b) module; (c) world integration (an NPC or sign starts it, Esc quits); (d) manual checklist.

## Acceptance criteria
- [ ] At least two minigames complete, started in-world, quittable with Esc, no effect on stamps.
- [ ] All expected answers come from `AC.logic`; tests with fixed seeds.
- [ ] Border cases tested (Venn boundary, empty-string input for DFA ride is allowed and accepted iff q0 ∈ F).
- [ ] No leaks after start/stop ×20.

## Out of scope
Scoring leaderboards, timers that pressure the player, multiplayer.

## Stop and ask if
A minigame needs a new entity type or event not in the contracts (propose a decision entry first).
