# Assets, Art Direction and Licensing

## Principles
1. **Placeholder-first.** The game must be fully playable with procedural placeholder art (colored tiles with simple patterns, rectangles for sprites). Real art is swapped in later (M4) by changing `js/world/tiles.js` and the manifest — not gameplay code.
2. **Never guess an asset.** Only reference files that exist and are listed in `assets/MANIFEST.md`. Never guess a tile index: use named constants in `js/world/tiles.js` that were chosen by looking at the contact sheet (`tools/contact-sheet.html`).
3. **One tileset, one character set, one font.** Consistency beats variety.
4. **Everything has a license line.** No license line, no merge.

## Art direction
- 16×16 pixel art, top-down, slight "RPG town" look; characters 16×16 (or 16×24 if the chosen pack uses it) — whichever the chosen pack provides.
- Palette: pack's natural colors + four district accents: `#e0663f` (String Street), `#1f9d8a` (Set Park), `#4c8c3a` (Tree Forest), `#6f55e0` (DFA Station). Accents appear on banners, door rings, board frames, minimap, stamps.
- Lecture board skins (CSS, not sprites): **chalkboard** (dark green/charcoal, chalk-white strokes, SVG wobble filter) and **CRT/departure-board** (scanline gradient) for the DFA Station.

## Recommended sources (human downloads; agent must not assume contents)
- **Kenney** 16×16 packs (CC0): a town tileset (e.g., "Tiny Town") for terrain, buildings, trees, props; a Kenney character pack for player and NPCs. **The human verifies each pack's license on its page and records it in the manifest.**
- Pixel font for HUD/titles only: **Press Start 2P** (SIL OFL), self-hosted as `.woff2`. Lecture text uses a readable system font because the pixel font lacks math symbols (∪ ∩ Δ ε Σ δ) — never draw those in canvas text with the pixel font.
- If a recommended source is unavailable, **ask**; don't substitute from memory.

## Drawn in code (no files needed)
Venn ponds (two overlapping circles with translucent fills), train cars with letters, platform labels `q0…q3`, glowing board rings in district colors, lit tree nodes and connecting paths, minimap, HUD icons, confetti, fireflies, dust puffs.

## Sound (synthesized, WebAudio — no files)
Starting values (tune by ear): `select` square 660 Hz 50 ms · `open` sine sweep 220→440 Hz 150 ms · `close` sweep 440→220 Hz 120 ms · `collect` square 880→1320 Hz 80 ms · `stamp` triangle arpeggio C5-E5-G5-C6, 80 ms/note · `error` sawtooth 140 Hz 150 ms · `step` low-volume noise burst 30 ms. Master volume ≤ 0.2 by default. Mute persists in `AC.progress`.

## Manifest format (`assets/MANIFEST.md`)
```
| File | What it is | Author / source URL | License | Tile size | Used for |
|---|---|---|---|---|---|
| assets/sprites/town.png | town tileset | <URL the human copied> | CC0 | 16 | terrain, buildings |
```
Plus a **Credits** section that the game's credits screen mirrors.

## Contact sheet tool (`tools/contact-sheet.html`)
Standalone page that loads a spritesheet, draws a grid at the tile size, and overlays each
cell's index (and row/col). Purpose: let the human (or an agent with image viewing) pick
tile ids by looking. Output: the human fills `docs/ASSET_PICKS.md`:
```
| Name constant | Tile index | Solid? | Notes |
| T.GRASS | ?? | no | |
```
and the agent turns it into `js/world/tiles.js`. Entries left `??` stay on placeholders.

## Budgets
Total assets < 3 MB · spritesheets power-of-two not required but keep ≤ 1024×1024 · no audio files.
