Here’s the plan. I based it on your README, DOCUMENTATION and CSS. The js/ files weren’t in the upload, so the refactor step assumes the structure the docs describe.

The concept

Automata City becomes a top-down pixel-art open world in the style of Zelda or Pokémon. You walk around a small city, and each district is a station. Stepping onto a station’s glowing door tile and pressing E opens a lecture board: a chalkboard over the game with three tabs (Learn, Practice, Challenge). Close it and you’re back in the world.

                 ┌─────────────────────┐
                 │   TREE FOREST (N)   │
                 │  lit trees = nodes  │
                 └──────────┬──────────┘
                            │
┌──────────────────┐   ┌────┴────┐   ┌──────────────────┐
│ STRING STREET (W)├───┤   HUB   ├───┤   SET PARK (E)   │
│ train tracks     │   │ plaza   │   │ twin Venn ponds  │
└──────────────────┘   └────┬────┘   └──────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │   DFA STATION (S)   │
                 │ platforms q0 … q3   │
                 └─────────────────────┘

The hub has the guide NPC (Professor Delta, a nod to δ), a fountain, and the Exam Tower, which stays sealed until you collect all 4 stamps. The map is about 64×64 tiles, so any station is roughly 10 seconds from the hub.

Decisions I made
Engine: A custom HTML5 Canvas 2D engine with no libraries. It matches your “zero dependency, no build step” identity from the defense notes. A tile game is only about 600–900 lines. If the team would rather not write the engine, Phaser 3 is the fallback.
World vs. lessons: The world is drawn on canvas. The blackboard is regular HTML/SVG on top of it. That lets you reuse your existing train, Venn, tree and DFA drawings, which are already SVG.
Art: 16×16 pixel art. I’d use Kenney’s CC0 packs: Tiny Town for terrain, buildings and props, plus a Kenney character pack for people. Check the license on each pack page when you download. Drawn in code: Venn ponds, train car letters, platform labels, and glowing door rings in your district colors (orange 
#e0663f, teal 
#1f9d8a, green 
#4c8c3a, purple 
#6f55e0).
Sound: Synthesized with WebAudio (steps, collect ping, stamp jingle, error buzz). No audio files, and it works offline.
Fonts: A pixel font (Press Start 2P) for HUD and titles only. Lesson text keeps a readable font, because pixel fonts lack symbols like ∪ ∩ Δ ε Σ δ.
Maps: Written as JS code with helpers like fillRect() and path(), not Tiled JSON.
How it plays
Controls: WASD or arrows to move, E to interact, Esc to close, M for the map, J for the journal. Mobile gets a virtual joystick and an A button.
Loop: Explore, enter a station, learn, practice, beat the challenge, get a stamp, then the next station. With 4 stamps, the Exam Tower opens.
Companion: A small robot named Eps (ε) follows you and gives hints.
Collectibles: Symbol shards (Σ, δ, ε, ∅, ∪, ∩…) are hidden around the map. Each one adds a definition to your Journal, which gives people a reason to explore.
Character select: The player picks a name and a sprite at the start. The name goes on the final certificate.
Day/night: Your existing dark theme becomes a day/night toggle, with a tint over the world and lamps at night.
Classic Mode: The original site stays available as an accessibility fallback and a safe demo option.
The four stations

Each station’s Learn tab is a guided lesson of 6–8 steps with Next/Prev and an auto-play button. It ends with a 3-question quick check. The Practice and Challenge tabs reuse what you already built.

String Street (west): Tracks run through the street with lettered train cars.

Learn: alphabet Σ, strings, length, ε, concatenation (cars coupling), prefix and suffix (cars splitting), reverse, palindromes.
Stretch game: Letter crates sit along the track. You push them into order to build the target string.

Set Park (east): Two overlapping ponds form a Venn diagram, with numbered flowers 1–8 around them.

Learn: universe, union, intersection, difference, symmetric difference, complement, power set, Cartesian product. Each step highlights the region and tests each element (“5 ∈ A and 5 ∈ B, so it’s in A ∩ B”).
Stretch game: Professor Delta calls out “stand in A Δ B” and you walk to that region. It’s a point-in-circle check, so it’s cheap to build.

Tree Forest (north): Glowing trees are the nodes, and paths between them are the edges.

Learn: root, leaf, subtree, then preorder, inorder and postorder with the N-L-R rule. Add a call-stack panel next to the walk, which makes recursion much clearer.
Stretch game: You walk to the trees in the requested traversal order, so the world itself is the quiz.

DFA Station (south): A rail loop with platforms labeled q0, q1, q2, q3.

Learn: the 5-tuple, states, transitions, start and accepting states. Then run a sample string like 0101 with a tape that shows the current symbol and highlighted state, and finish with the complement.
Stretch game: You get an input string and ride from platform to platform, one symbol at a time. Ending on an accepting platform (with a flag) means accepted.
Architecture
automata-city/
├── index.html
├── css/  style.css (kept) · game.css (HUD, overlay frame, chalkboard skin)
├── js/
│   ├── engine/   loop · input · camera · tilemap · sprites · audio · save
│   ├── world/    map-data · entities (player, npc, prop, trigger, collectible) · hud · minimap
│   ├── logic/    strings · sets · tree · dfa        (pure functions, no DOM)
│   ├── lessons/  shell · lesson-player · strings · sets · tree · dfa   (mount into a host element)
│   ├── exam.js · progress.js · main.js
└── assets/       spritesheets (png) · fonts
State machine: TITLE → WORLD ⇄ LECTURE → ENDING. While a lecture is open, the world keeps drawing, dimmed, but stops updating. Keyboard input goes only to the overlay.
Rendering: Internal resolution is 320×180, scaled by whole-number factors with image-rendering: pixelated. Static layers are pre-rendered, and only visible tiles are drawn.
Layers: Ground, objects (with collision), and “above” (tree canopies and roofs, drawn over the player). Entities are sorted by y for depth.
Collision: Tile-based with a small hitbox at the feet. Move X and Y separately so the player slides along walls.
Interactions: Every trigger is {rect, prompt, onInteract}. The nearest one in range shows a “Press E” bubble.
Lesson modules: Each station exports mount(host, ctx) and unmount(). ctx.onStamp(id) reports a finished challenge to the world.
Chalk look: Reuse your SVG drawings with round line caps, an SVG feTurbulence + feDisplacementMap filter for a hand-drawn wobble, and a chalk-colored palette. The DFA Station can use a CRT or departure-board skin for variety.
Entering a lecture: The overlay expands from the in-world board or TV to full size, then collapses back on close. Respect prefers-reduced-motion, which your CSS already handles.
Save: localStorage holds stamps, shards, position, settings and name. This also fixes the “progress resets on refresh” limitation in your README.
Build phases
Phase	What gets built	Done when
M0 Refactor (S)	Split each district into logic and view. Render into a host element instead of the global app. Replace the global ST with a Progress module and namespace everything under AC.	The original site works unchanged through the new structure.
M1 Walking prototype (M)	Loop, input, camera, tilemap, collision, player sprite, hub plus four blank districts.	You can walk everywhere at 60fps and can’t pass through walls.
M2 Stations wired (M)	Triggers, “Press E” prompt, lecture shell (tabs, focus trap, pause), existing Practice and Challenge mounted inside, stamps in the HUD, Professor Delta, quest arrow.	You can walk in, finish a challenge, and see the stamp.
M3 Blackboard lessons (L)	Lesson player, chalk skin, four Learn lessons, quick checks. This is the heart of the project.	Each station has a 6–8 step animated lesson.
M4 World and feel (L)	Real tiles and district dressing, NPCs, shards and Journal, day/night, SFX, title screen, character select.	It looks and sounds like a game.
M5 In-world minigames (L, optional)	Venn stepping and Tree walk first (cheapest and most impressive), then DFA ride and String crates.	At least 2 minigames work.
M6 Finale and ship (M)	Exam Tower with a generated final exam, certificate (name, date, group credits), mobile joystick, settings, playtest, deploy, docs update.	Someone outside your group can finish it.

S, M and L are relative sizes, since I don’t know your deadline. Suggested split for three people:

A: engine and world (M1, M4 engine side).
B: refactor, lesson shell and exam (M0, M2, M6).
C: art, lesson content and audio (M3, M4 art side).

If time gets tight, cut M5 and the collectibles first. M0 through M3 plus a decent hub is already a strong project.

Gotchas to avoid
file:// limits: Opening index.html by double-click blocks fetch(), which is why maps are in JS and sound is synthesized. Images through <img> work fine. For sharing with your professor, deploy free on GitHub Pages or Netlify.
Typing vs. movement: Typing in the DFA input boxes can trigger WASD movement. Disable world input whenever the overlay is open or an input has focus.
Name collisions: Several modules share global names today. Namespace them in M0 before anything else.
Mixed art styles: Use one tile pack and one character pack, and tint with your four district colors for identity.
Final exam: Generate questions from the pure logic modules (preorder of a random tree, “is abba accepted by this DFA?”, A \ B for random sets) so they never repeat.

I can put this in a doc for your group, or start coding M1, a walking prototype with the hub, four districts and collision, so you can see how the world feels. Which would you like?