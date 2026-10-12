# Progress Tracker (the agent updates this at the end of every task)

**Current milestone:** M3 Complete (Ready for M4) · **Branch:** m3-lessons · **Last updated:** 2026-10-12

## Milestones
- [x] **M0 Refactor** — ground truth · namespace · pure logic + tests · mountable views · Classic Mode · regression pass
- [x] **M1 Walking prototype** — canvas scaling · loop · input · tilemap · collision · camera · player · hub + 4 regions (placeholder art)
- [x] **M2 Stations wired** — triggers/prompts · lecture shell · Practice/Challenge mounted · stamps + persistence · HUD · Professor Delta · quest arrow
- [x] **M3 Blackboard lessons** — lesson player · chalk/CRT skins · 4 lessons · quick checks
- [ ] **M4 World and feel** — asset manifest · tiles · district dressing · NPCs · shards + Journal · day/night · SFX · title + character select
- [ ] **M5 Minigames (optional)** — Venn stepping · Tree walk · DFA ride · String pads
- [ ] **M6 Finale and ship** — exam generator · Exam Tower · certificate · touch controls · settings · playtest · deploy · docs

## Acceptance evidence
### M0 — Refactor and Decoupling
- [x] `docs/GROUND_TRUTH.md` complete and cite-grounded [VERIFIED].
- [x] `node tests/run.js` passes all 42 unit, property, and integration tests [VERIFIED].
- [x] `tests/index.html` green from `file://` browser [VERIFIED].
- [x] Only global is `AC` across all 12 modules (`js/core/`, `js/logic/`, `js/lessons/`, `js/classic.js`, `js/main.js`) [VERIFIED].
- [x] Zero inline `onclick=` handlers (`grep -rn "onclick=" js/ index.html` -> 0) [VERIFIED].
- [x] Complete regression checklist passing: String Street, Set Park, Tree Forest, DFA Station, Classic Mode [VERIFIED].
- [x] `legacy/` untouched baseline preserved [VERIFIED].

### M1 — Walking Prototype
- [x] Canvas integer scaling (320x180 buffer scaled by floor factor, letterboxed) [VERIFIED].
- [x] Fixed 60 FPS timestep loop with accumulator and lag spike clamping [VERIFIED].
- [x] Input system with diagonal movement normalization (|v| <= 1.0) and form field protection [VERIFIED].
- [x] 64x64 World map with Hub, 4 regions, 3-tile roads, and solid perimeter [VERIFIED].
- [x] BFS pathfinding tests confirm non-solid walkable path from spawn (32, 34) to all 4 district board tiles [VERIFIED].
- [x] AABB collision with separate X/Y axis sliding along solid walls [VERIFIED].
- [x] Camera tracking and viewport clamping within map bounds [VERIFIED].
- [x] Debug overlay (F3) displaying FPS, player coordinates, tile index, and hitbox outline [VERIFIED].
- [x] Mode toggle between World Game and Classic Mode [VERIFIED].
- [x] Total test suite: 52 tests passing [VERIFIED].

### M2 — Stations Wired & Lecture Shell
- [x] Proximity triggers (`AC.triggers`) for all 4 district stations and Professor Delta NPC [VERIFIED].
- [x] Contextual interact prompt ("[E] Inspect Board", "[E] Talk to Prof Delta") rendered when in trigger radius [VERIFIED].
- [x] Lecture modal shell (`AC.lessons.shell`) with blackboard theme, focus trap, Esc-to-close, and accessible tabs (Learn, Practice, Challenge) [VERIFIED].
- [x] Clean mounting and unmounting of Practice and Challenge views inside modal container with zero listener leaks [VERIFIED].
- [x] State machine coordination (`AC.setState`, `AC.getState`): inputs disabled in `lecture` and `dialogue`, world loop continues background rendering [VERIFIED].
- [x] HUD displays 4 district stamp badges (`[S]`, `[P]`, `[T]`, `[D]`) reflecting persistent progress with stamp glow, plus minimap radar [VERIFIED].
- [x] Professor Delta NPC dialogue tree with progressive advice based on stamp count, guiding player to next unstamped district and unsealing Exam Tower at 4 stamps [VERIFIED].
- [x] 20 open/close rapid cycle test executed with zero listener leaks or runtime errors [VERIFIED].
- [x] Total test suite: 57 tests passing [VERIFIED].

### M3 — Blackboard Lessons
- [x] Interactive chalkboard lesson player (`AC.lessons.lessonPlayer`) with step controls, progress dots, autoplay, keyboard navigation (Left/Right/Space), and reduced-motion support [VERIFIED].
- [x] Chalkboard (`.board-chalk`) and CRT (`.board-crt`) visual skins with high-contrast text and district color accent borders [VERIFIED].
- [x] Dynamic visual drawing helpers (`AC.lessons.drawings`): string locomotive train cars with cut and reverse indicators, Venn diagram SVG for universe U={1..8}, BST layout renderer with call stack display, and animated DFA CRT tape runner [VERIFIED].
- [x] Four authoritative lessons implemented (`AC.lessons.data`): String Street (7 steps), Set Park (9 steps), Tree Forest (8 steps), and DFA Station (8 steps) [VERIFIED].
- [x] Strict word limit validation: 100% of lesson step `say` texts are <= 30 words (verified by test scanner) [VERIFIED].
- [x] Seeded quick check quiz generator (`AC.quiz`): 3 questions per topic, 4 unique options each, exactly 1 computed correct answer, verified across 200 random seeds [VERIFIED].
- [x] Full integration into Learn tab: walking to board -> pressing E -> Learn tab runs player -> Quick Check -> Practice tab -> Challenge -> stamp collection [VERIFIED].
- [x] Total test suite: 63 tests passing [VERIFIED].

### Content Review Table (M3 Step ↔ DOMAIN_SPEC Mapping)
| District | Step | Title | DOMAIN_SPEC Section | Computed Value Source |
|---|---|---|---|---|
| String Street (`str`) | 1 | Alphabet Σ and Symbols | DOMAIN_SPEC §1 | Σ = {a..z} definition |
| String Street (`str`) | 2 | A String and its Length | DOMAIN_SPEC §1 | `AC.strings.length("city")` = 4 |
| String Street (`str`) | 3 | The Empty String ε | DOMAIN_SPEC §1 | \|ε\| = 0, wε = εw = w identity |
| String Street (`str`) | 4 | Concatenation (Coupling Cars) | DOMAIN_SPEC §1 | `AC.strings.concat("cat", "box")` = "catbox" |
| String Street (`str`) | 5 | Prefix and Suffix | DOMAIN_SPEC §1 | `AC.strings.prefixAt`, `AC.strings.suffixAt` (k=2) |
| String Street (`str`) | 6 | Reverse (Flipping Cars) | DOMAIN_SPEC §1 | `AC.strings.reverse("track")` = "kcart" |
| String Street (`str`) | 7 | Palindromes | DOMAIN_SPEC §1 | `AC.strings.isPalindrome("radar")` = true |
| Set Park (`set`) | 1 | Elements and Membership ∈ | DOMAIN_SPEC §2 | Elements & distinct sets |
| Set Park (`set`) | 2 | Universe U and Subsets | DOMAIN_SPEC §2 | `AC.sets.U` = {1..8} |
| Set Park (`set`) | 3 | Union A ∪ B | DOMAIN_SPEC §2 | `AC.sets.union({1,2,4}, {4,5,6})` = {1,2,4,5,6} |
| Set Park (`set`) | 4 | Intersection A ∩ B | DOMAIN_SPEC §2 | `AC.sets.intersection({1,2,4}, {4,5,6})` = {4} |
| Set Park (`set`) | 5 | Difference A \ B | DOMAIN_SPEC §2 | `AC.sets.difference({1,2,4}, {4,5,6})` = {1,2} |
| Set Park (`set`) | 6 | Symmetric Difference A Δ B | DOMAIN_SPEC §2 | `AC.sets.symDiff({1,2,4}, {4,5,6})` = {1,2,5,6} |
| Set Park (`set`) | 7 | Complement A′ = U \ A | DOMAIN_SPEC §2 | `AC.sets.complement({1,2,3})` = {4,5,6,7,8} |
| Set Park (`set`) | 8 | Power Set 𝒫(A) | DOMAIN_SPEC §2 | `AC.sets.powerSet({1,2})` count = 4 |
| Set Park (`set`) | 9 | Cartesian Product A × B | DOMAIN_SPEC §2 | `AC.sets.cartesian({1,2}, {3,4})` = 4 pairs |
| Tree Forest (`tree`) | 1 | Nodes, Edges, Root and Leaves | DOMAIN_SPEC §3 | `AC.tree.layout` root definition |
| Tree Forest (`tree`) | 2 | Binary Tree: Left and Right | DOMAIN_SPEC §3 | Binary tree child branching |
| Tree Forest (`tree`) | 3 | The BST Rule | DOMAIN_SPEC §3 | BST ordering invariant (left < node < right) |
| Tree Forest (`tree`) | 4 | Preorder Traversal (NLR) | DOMAIN_SPEC §3 | `AC.tree.preorder` on BST {4,2,6,1,3,5,7} |
| Tree Forest (`tree`) | 5 | Inorder Traversal (LNR) | DOMAIN_SPEC §3 | `AC.tree.inorder` on BST (sorted [1..7]) |
| Tree Forest (`tree`) | 6 | Postorder Traversal (LRN) | DOMAIN_SPEC §3 | `AC.tree.postorder` on BST |
| Tree Forest (`tree`) | 7 | Call Stack Recursion | DOMAIN_SPEC §3 | Call frame stack depth |
| Tree Forest (`tree`) | 8 | Comparing the Three Orders | DOMAIN_SPEC §3 | Traversals comparison on identical keys |
| DFA Station (`dfa`) | 1 | A Machine Reading a Tape | DOMAIN_SPEC §4 | Step simulation on input tape |
| DFA Station (`dfa`) | 2 | States and the Start State | DOMAIN_SPEC §4 | State set Q, start state q0 = 0 |
| DFA Station (`dfa`) | 3 | Transition Function δ | DOMAIN_SPEC §4 | Total transition table `machine.delta` |
| DFA Station (`dfa`) | 4 | Accepting States F ⊆ Q | DOMAIN_SPEC §4 | Accepting states Set `machine.accept` |
| DFA Station (`dfa`) | 5 | Running an Accepted String | DOMAIN_SPEC §4 | `AC.dfa.run("01")` = q2 ∈ F (Accepted) |
| DFA Station (`dfa`) | 6 | Running a Rejected String | DOMAIN_SPEC §4 | `AC.dfa.run("00")` = q1 ∉ F (Rejected) |
| DFA Station (`dfa`) | 7 | The Formal 5-Tuple | DOMAIN_SPEC §4 | 5-tuple (Q, Σ, δ, q0, F) structure |
| DFA Station (`dfa`) | 8 | Complementing a DFA | DOMAIN_SPEC §4 | `AC.dfa.complement`: flips accept states |

## Known issues
- None.

## Open questions for the human
- None. Milestone 3 is complete and verified. Ready to proceed to Milestone 4 (World and Feel: assets, tiles, dressing, NPC wanderers, Journal).

## Last session summary
- Milestone 3 completed. All four chalkboard / CRT guided lessons implemented with computed examples, visual drawing helpers, step player with keyboard navigation, 200-seed verified quiz generator, and complete Learn tab integration. Total: 63 tests passing. Ready for M4.



