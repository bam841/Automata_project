# Asset Manifest — Automata City

All external art and audio referenced by the project must be listed in this table before merge.
Until external packs are downloaded and placed into `assets/sprites/`, the game runs on procedural pixel-art generation in `js/world/tiles.js`, `js/world/dressing.js`, and synthesized WebAudio.

| File | What it is | Author / Source URL | License | Tile Size | Used For |
|---|---|---|---|---|---|
| *(procedural)* | 16x16 Terrain & World Tiles | Automata City Engine (`js/world/tiles.js`) | MIT | 16 | Ground, paths, walls, water, landmarks |
| *(procedural)* | Character & NPC Sprites | Automata City Engine (`js/world/player.js`, `js/world/npcs.js`) | MIT | 16 | Player, Professor Delta, Station NPCs, Companion |
| *(synthesized)* | Sound Effects | WebAudio Synthesizer (`js/engine/audio.js`) | MIT | N/A | UI, steps, collect, stamp, errors |

## Credits
- **Theory & Mathematics**: DeepMind Advanced Agentic Coding / Formal Languages & Automata Theory Domain Spec.
- **Audio & Visuals**: Procedural Canvas 2D engine with integer pixel-perfect scaling and WebAudio oscillator synthesis.
