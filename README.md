# Automata City

An educational open-world browser game for learning **Automata Theory and Formal Languages**.
Instead of reading static textbooks or slides, the player navigates an open-world city as a theoretical computer science scholar. Four stations (String Street, Set Park, Tree Forest, DFA Station) feature interactive lecture boards (Learn, Practice, Challenge). Earning all four stamps unseals the Exam Tower in the central plaza, unlocking the Final Examination and an official canvas-rendered pixel diploma.

> **Course:** ACE - Automata Theory and Formal Languages  
> **Group Members:** Brix Martin Pana, Irwin Huey Geron, John Abrahm Zapico  
> **Professor:** Doc. Jayson Guia  

---

## Game Overview & Features

1. **Top-Down Open-World Gameplay (Canvas 2D):**
   - Fixed 60 FPS update loop with integer pixel-perfect canvas scaling.
   - Smooth AABB sliding collisions against solid environment geometry.
   - Dynamic camera following the player through 5 themed districts.

2. **Four Theory Stations & Lecture Boards:**
   - **String Street (West):** Alphabet $\Sigma$, empty string $\varepsilon$, concatenation, prefixes, suffixes, string reversal, and palindromes.
   - **Set Park (East):** Universe $U = \{1..8\}$, set membership $\in$, union $\cup$, intersection $\cap$, difference $\setminus$, symmetric difference $\Delta$, complement $A'$, power set $\mathcal{P}(A)$, and Cartesian product $A \times B$.
   - **Tree Forest (North):** Binary tree anatomy, BST invariants ($L < N < R$), Preorder (NLR), Inorder (LNR), Postorder (LRN), and recursive call stack traces.
   - **DFA Station (South):** 5-tuple formal definition $(Q, \Sigma, \delta, q_0, F)$, step-by-step tape reading, state transitions, machine complementation, and full property testing across all 127 binary strings up to length 6.

3. **Chalkboard & CRT Interactive Lessons:**
   - Guided step-by-step interactive lessons with dynamic visual drawing helpers (locomotive string cars, Venn diagrams, BST layouts, animated CRT tape runner).
   - Word-count audited pedagogy ($\le 30$ words per step) ensuring concise conceptual clarity.
   - Topic quick-checks with deterministic seeded generation.

4. **Collectibles & In-Game Journal:**
   - 12 hidden theory symbol shards ($\Sigma, \varepsilon, w^R, \cup, \cap, \Delta, \text{NLR}, \text{LNR}, \text{LRN}, \delta, q_0, F$) placed throughout the world, 100% reachable via non-solid paths.
   - Interactive Theory Journal modal (`[J]`) documenting formal mathematical definitions.

5. **Resident NPCs & Companion:**
   - Guide NPC **Professor Delta** at the central Hub plaza with progressive advice.
   - Four resident district NPCs (Conductor Casey, Botanist Brooke, Ranger Rowan, Signalman Sam).
   - Floating companion **Eps** ($\varepsilon$) that trails the player and offers contextual advice (`[H]`).

6. **Audio & Atmosphere:**
   - 100% synthesized WebAudio sound effects (no external audio files required, runs cleanly offline).
   - Day/Night lighting cycle (`[T]`) with radial lantern cutouts and fireflies.

7. **Grand Exam Tower & Official Diploma:**
   - Locked with 4 ancient automata seals until all 4 district stamps are earned.
   - 8-question comprehensive final exam (2 per district topic) dynamically generated from pure theory logic with seeded RNG.
   - Score threshold: $\ge 6/8$ (75%) required to pass.
   - Official pixel-art diploma generated on Canvas 2D with student name, score, date, and signatures.
   - One-click PNG image download and print stylesheet support (`window.print()`).

8. **Dual Mode & Full Accessibility:**
   - **Classic Mode:** One-click toggle in top navigation preserves the original minimalist card interface.
   - **Mobile Touch Controls:** On-screen virtual D-pad and tactile action buttons for touch and coarse-pointer devices.
   - Complete keyboard accessibility and settings modal (`[O]`) with sound mute, theme selection, reduced-motion override, and in-UI progress reset.

---

## Controls

| Action | Keyboard Key | Mobile Touch Control |
|---|---|---|
| **Move Player** | `W`, `A`, `S`, `D` or Arrow Keys | Virtual D-Pad (Bottom-Left) |
| **Interact / Talk / Enter** | `E`, `Space`, or `Enter` | `[E]` Button (Bottom-Right) |
| **Theory Journal** | `J` | `[J]` Button |
| **Ask Eps for Hint** | `H` | `[H]` Button |
| **Toggle Day / Night** | `T` | Settings Menu |
| **Game Settings** | `O` | `[⚙]` Button |
| **Close Dialog / Back** | `Esc` | Modal `×` / Close Button |
| **Debug Overlay** | `F3` | — |

---

## How to Run

1. Clone or download this repository.
2. Double-click `index.html` to open it directly in any modern browser (Chrome, Edge, Firefox, Safari).
3. **No server, bundler, Node.js runtime, npm package, or build step is required.** The application runs 100% offline via `file://`.

---

## Architecture & Codebase Structure

```
automata-city/
├── index.html              Single entry point for game & classic views
├── css/
│   ├── style.css           Tokens, typography, and original styles
│   └── game.css            HUD, chalkboard skins, modals, touch, and print stylesheet
├── js/
│   ├── core/
│   │   ├── ac.js           Global namespace AC, DOM utilities, event bus, seeded RNG
│   │   └── progress.js     Persistent localStorage state management (v1 schema)
│   ├── engine/
│   │   ├── render.js       Canvas 2D integer scaling & letterboxing
│   │   ├── loop.js         Fixed 60 FPS timestep loop with lag clamping
│   │   ├── input.js        Normalized movement vectors & form protection
│   │   ├── camera.js       Viewport tracking and world boundary clamping
│   │   ├── tilemap.js      Multi-layer tile rendering and solid registry
│   │   ├── collide.js      AABB collision sliding along solid walls
│   │   └── audio.js        WebAudio synthesized sound cues
│   ├── logic/              PURE THEORY MODULES (headless testable in Node.js)
│   │   ├── strings.js      String operations, prefixes, suffixes, palindromes
│   │   ├── sets.js         Set operations, power set, Cartesian product over U={1..8}
│   │   ├── tree.js         BST builder, preorder, inorder, postorder traversals
│   │   ├── dfa.js          DFA simulator, complementation, 127-string exhaustive test
│   │   ├── quiz.js         Topic quick checks & question generator
│   │   └── exam-gen.js     8-question final exam generator (DOMAIN_SPEC §8)
│   ├── lessons/
│   │   ├── shell.js        Blackboard modal dialog container with focus trap
│   │   ├── lesson-player.js Autoplay step runner with progress dots & keyboard nav
│   │   ├── drawings.js     Dynamic SVG/Canvas drawing helpers for lesson visuals
│   │   ├── str.js          String Street Practice & Challenge views
│   │   ├── set.js          Set Park Practice & Challenge views
│   │   ├── tree.js         Tree Forest Practice & Challenge views
│   │   ├── dfa.js          DFA Station Practice & Challenge views
│   │   └── lessons-data.js Authoritative step data (all steps <= 30 words)
│   ├── world/
│   │   ├── tiles.js        Tile IDs and procedural placeholder atlas
│   │   ├── map-data.js     Deterministic 64x64 city world map generator
│   │   ├── districts.js    District metadata and bounds registry
│   │   ├── triggers.js     Proximity interact triggers
│   │   ├── hud.js          HUD stamps, compass radar, and interaction bubbles
│   │   ├── dialogue.js     NPC dialogue system with progressive advice
│   │   ├── shards.js       12 collectible theory symbol shards
│   │   ├── journal.js      In-game Theory Journal modal
│   │   ├── npcs.js         Resident station NPCs
│   │   ├── companion.js    Trailing companion Eps with contextual hints
│   │   ├── dressing.js     Procedural landmarks (fountain, rails, ponds, lanterns)
│   │   ├── atmosphere.js   Day/Night lighting overlay and firefly particles
│   │   ├── title.js        Title screen with character palette select & name entry
│   │   ├── tower.js        Exam Tower state machine & question player
│   │   ├── certificate.js  Canvas pixel-art diploma generator & PNG export
│   │   ├── settings.js     Audio, theme, motion, and in-UI reset dialog
│   │   ├── touch.js        Virtual on-screen D-Pad and action buttons
│   │   ├── player.js       Player sprite animation and entity physics
│   │   └── game.js         World coordinator and scene renderer
│   ├── classic.js          Preserved legacy card interface ("Classic Mode")
│   └── main.js             Finite state machine & bootstrap coordinator
├── tests/
│   ├── run.js              Node.js test runner (zero dependencies)
│   ├── index.html          Browser-based visual test runner
│   ├── harness.js          Lightweight test framework with assert helpers
│   └── *.test.js           77 unit, property, and regression test suites
├── assets/
│   └── MANIFEST.md         Asset catalog and licensing documentation
└── docs/                   Formal engineering documentation & architectural ADRs
```

---

## How to Explain This to the Professor

When defending this project to Professor Doc. Jayson Guia:

1. **Why an Open-World Game instead of a Static Web Page?**
   Educational research shows that spatial learning and contextual anchoring dramatically improve retention. Automata Theory is often viewed as abstract mathematics; by embodying concepts as districts (e.g., String concatenation as train couplers, Set operations as overlapping park ponds, BST invariants as forest trees, and DFAs as transit rail loops), abstract theories become tangible mental models.

2. **Is Theory Computation Hardcoded?**
   **No.** All theory operations are computed purely in `js/logic/`:
   - Every Venn calculation is evaluated via standard Set mathematics over $U = \{1..8\}$.
   - Every tree traversal is recursively generated from BST data structures.
   - Every DFA run is simulated step-by-step against formal transition tables $\delta(q, a)$ and validated against all $2^0 + \dots + 2^6 = 127$ binary strings.
   - The Final Exam dynamically computes correct options using the pure logic engine; no answers are hardcoded.

3. **How is Code Quality and Separation of Concerns Enforced?**
   - Single global namespace `window.AC`; zero namespace pollution.
   - Decoupled pure logic (`js/logic/`) has zero DOM dependencies and is tested headlessly in Node.js.
   - Zero external libraries or npm dependencies: custom Canvas 2D engine, custom fixed-timestep game loop, custom AABB sliding collision, and custom synthesized WebAudio.
   - Over 77 comprehensive automated tests verify theory properties, state machines, and regression equivalence.

---

## Verification & Testing

To run the automated test suite:

```bash
node tests/run.js
```

Or open `tests/index.html` in your browser. All 77 tests verify:
- Deterministic behavior of the seeded RNG.
- Exact string operations (prefixes, suffixes, concatenations, palindromes).
- Set operations matching formal golden definitions.
- Binary search tree traversals (Inorder ascending invariant).
- Exhaustive binary DFA validation across 127 strings for all 3 reference machines and complementation.
- Fixed 60 FPS timestep loop and AABB collision sliding.
- BFS reachability to all 4 district stations and 12 theory shards.
- Rapid modal mount/unmount memory leak prevention.
- 200 random seeds for the final exam generator.
