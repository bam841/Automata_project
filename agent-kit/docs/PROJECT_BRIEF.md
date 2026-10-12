# Project Brief — Automata City: The Game

## 1. Vision
Learners walk around a small pixel-art city. Each district is a hands-on station for one
topic of Automata Theory and Formal Languages. Stepping up to a station's board opens a
chalkboard lesson, a practice sandbox, and a challenge that earns a stamp. Four stamps open
the Exam Tower; passing the exam awards a certificate.

**Audience:** classmates and the course professor (project defense). Must be understandable
in 5 minutes without instructions.

**Course context:** ACE — Automata Theory and Formal Languages. Credits (group members) live
in the existing `README.md`; reuse them on the certificate/credits screen. Do not hard-code
real people's names anywhere else in game content.

## 2. Scope
**In scope:** strings, sets, binary-tree traversals, DFAs (existing four topics); open-world
exploration; lesson boards; stamps; collectible symbol shards + Journal; final exam;
certificate; save/load; keyboard + touch controls; Classic Mode (original site view).

**Out of scope (do not build unless a new decision says so):** NFA, ε-NFA, regular
expressions, pumping lemma, CFG/PDA, multiplayer, accounts/backend, procedural world
generation, inventory/combat, voice, localization.

## 3. World
- Map 64×64 tiles, hub-and-spoke: Hub (center), Tree Forest (N), String Street (W), Set Park (E), DFA Station (S).
- Hub: Professor Delta (guide NPC), fountain, sealed Exam Tower (4 stamp locks).
- Each district has a **board prop** (blackboard/TV) as its interaction point, plus 3 hidden **symbol shards**, 1 resident NPC with hint lines, and themed dressing:
  - String Street: railway track, train cars with letters.
  - Set Park: two overlapping ponds = Venn diagram, flowers numbered 1–8.
  - Tree Forest: lit trees connected by paths forming a binary tree.
  - DFA Station: platforms labeled q0…q3, rail loop, flag on accepting platform.
- Companion robot **Eps (ε)** follows the player and gives hints on request.
- Day/night toggle ties to the existing light/dark theme.

## 4. Core loop
Explore → reach a board → **Learn** (animated steps + quick check) → **Practice** (sandbox) → **Challenge** (stamp) → next district → 4 stamps → Exam Tower → certificate.
Side loop: find the 12 shards; each fills a Journal entry.

## 5. Lecture board (the signature feature)
A DOM overlay above the canvas with three tabs:
1. **Learn** — 6–9 step guided lesson, chalkboard look (DFA Station may use a CRT/departure-board skin). Prev/Next, autoplay, Esc closes. Ends with a 3-question quick check.
2. **Practice** — the existing district sandbox, mounted unchanged in behavior.
3. **Challenge** — the existing challenge; success calls `ctx.onStamp(id)`.

World update is paused while the board is open. Closing returns focus to the game.

## 6. Existing challenges (preserve exactly)
- **String Street:** a palindrome of length ≥ 3.
- **Set Park:** choose A, B with A Δ B = {1,2,7,8} and A ∩ B = {4}.
- **Tree Forest:** click every node in the correct traversal order.
- **DFA Station:** a DFA passing all tests for one goal (ends in `01` / even number of 1s / no two 0s in a row).

## 7. Controls
Move: WASD / arrows · Interact: E (or Enter/Space) · Close/cancel: Esc · Map: M · Journal: J · Mute: N · Hint from Eps: H.
Touch: virtual joystick (left), A button (right), tap-to-advance in dialogue.

## 8. HUD
Top-left: 4 stamp slots (district colors). Top-right: shards `n/12`, mute, settings. Bottom: interaction prompt and dialogue box. Minimap (corner): districts as colored blocks + player dot.

## 9. Tone and writing
Friendly, short sentences, plain language first, symbol second ("every string in the set — the
*union* A ∪ B"). Max ~30 words per lesson step. Professor Delta jokes lightly; never condescends.

## 10. Quality bar (the project is "good" when…)
- A stranger finishes the game in ~25–40 minutes without help.
- Every number shown on a board is computed by `js/logic/` (no hard-coded results).
- Opens by double-click on any modern browser; 60 fps on a mid-range laptop.
- No console errors. Keyboard-only playable. Respects `prefers-reduced-motion`.
- Visuals consistent: one tileset, one character set, four district accent colors.

## 11. Non-goals for polish
Do not spend time on: music (SFX only), cutscenes, particle systems beyond dust/confetti/fireflies, achievements beyond stamps and shards.
