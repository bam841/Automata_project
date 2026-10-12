const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

// Setup global window reference for Node
globalThis.window = globalThis;
require('./harness.js');

// Load core and logic modules as they become available
const modulesToLoad = [
  'js/core/ac.js',
  'js/core/progress.js',
  'js/engine/render.js',
  'js/engine/loop.js',
  'js/engine/input.js',
  'js/engine/camera.js',
  'js/engine/tilemap.js',
  'js/engine/collide.js',
  'js/world/tiles.js',
  'js/world/map-data.js',
  'js/world/districts.js',
  'js/world/triggers.js',
  'js/world/hud.js',
  'js/world/dialogue.js',
  'js/world/player.js',
  'js/world/game.js',
  'js/logic/strings.js',
  'js/logic/sets.js',
  'js/logic/tree.js',
  'js/logic/dfa.js',
  'js/lessons/shell.js',
  'js/lessons/str.js',
  'js/lessons/set.js',
  'js/lessons/tree.js',
  'js/lessons/dfa.js',
  'js/classic.js',
  'js/main.js'
];

for (const rel of modulesToLoad) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    vm.runInThisContext(fs.readFileSync(full, 'utf8'), { filename: rel });
  }
}

// Load and register all test suites in tests/
const testFiles = fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.test.js'))
  .sort();

for (const tf of testFiles) {
  require(path.join(__dirname, tf));
}

// Run all registered tests
const res = globalThis.AC_TEST.runAll();

console.log('\n========================================');
console.log('       AUTOMATA CITY TEST SUITE         ');
console.log('========================================');

for (const r of res.results) {
  if (r.ok) {
    console.log(`  \x1b[32m✓\x1b[0m ${r.name}`);
  } else {
    console.error(`  \x1b[31m✗\x1b[0m ${r.name}`);
    console.error(`    ${r.error.stack || r.error.message}`);
  }
}

console.log('----------------------------------------');
if (res.failed === 0) {
  console.log(`\x1b[32mALL ${res.passed} TESTS PASSED\x1b[0m\n`);
  process.exit(0);
} else {
  console.log(`\x1b[31mFAILED: ${res.failed} of ${res.total} tests failed\x1b[0m\n`);
  process.exit(1);
}
