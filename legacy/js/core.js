/* core.js: shared helpers, the list of districts, progress (stamps) and the home map.
   Loaded first. Every other file uses what is defined here. */

// Shorthand query selector: passes CSS selector string `s` and returns the matching DOM element
const $ = s => document.querySelector(s);

// Caches the main DOM container (<div id="app"></div>) where all screens/views are mounted
const app = $('#app');

// Sanitizes user strings to prevent HTML injection and rendering issues
// Replaces &, <, >, " with their corresponding safe HTML entities (&amp;, &lt;, &gt;, &quot;)
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Stamps earned so far, e.g. { str: 1, set: 1 }. Resets on page refresh. */
// Key-value map holding completed district IDs as keys (value 1)
let ST = {};

/* The four districts. Each `f` opens that district's screen. */
// Array of district configuration objects:
// - id: unique district identifier string
// - n: display title name of the district
// - c: hexadecimal accent color for the district card's left border
// - s: short description subtitle
// - f: callback function that renders that district's screen
const D = [
  // District 1: String Street (renders via strv() in strings.js)
  {id:'str',  n:'String Street', c:'#e0663f', s:'Length, prefix, suffix, concat and reverse, with strings as trains.', f:() => strv()},
  // District 2: Set Park (renders via setv() in sets.js)
  {id:'set',  n:'Set Park',      c:'#1f9d8a', s:'Union, intersection, difference, complement, power set and more on a live Venn diagram.', f:() => setv()},
  // District 3: Tree Forest (renders via treev() in tree.js)
  {id:'tree', n:'Tree Forest',   c:'#4c8c3a', s:'Walk a random tree in preorder, inorder or postorder, then try it yourself.', f:() => treev()},
  // District 4: DFA Station (renders via dfav() in dfa.js)
  {id:'dfa',  n:'DFA Station',   c:'#6f55e0', s:'Build a DFA, step through a string and flip it into its complement.', f:() => dfav()}
];

/* Top of every district screen: a back button and a title. */
// Returns HTML string with a button that goes back to the home map, and an <h2> header with title `t`
const head = t => `<button onclick="home()">Back to the map</button><h2>${t}</h2>`;

/* Updates the challenge banner (#ch). Pass ok=true to earn the district's stamp. */
// Parameters:
// - id: district id string ('str', 'set', 'tree', or 'dfa')
// - ok: boolean condition indicating if the challenge requirements are satisfied
// - t: description message of the challenge
const chal = (id, ok, t) => {
  // If the challenge was completed successfully, record this district in the ST stamps map
  if (ok) ST[id] = 1;
  // Locate the challenge banner element with ID 'ch' in the current DOM
  const e = $('#ch');
  // Update class to 'ch done' if stamped (green style), or 'ch' if incomplete
  e.className = 'ch' + (ST[id] ? ' done' : '');
  // Update banner text to show either completion confirmation or the challenge prompt
  e.textContent = (ST[id] ? 'Stamp earned. ' : 'Challenge: ') + t;
};

/* The city map (Home screen). */
function home() {
  // Stop the Tree Forest animation timer (TI) if the user navigated back to home while it was running
  clearInterval(TI);

  // Count the total number of stamps earned so far across all districts
  const n = Object.keys(ST).length;

  // Render the title header, stamp progress counter, and district cards grid into #app
  app.innerHTML = `<h1>Automata City</h1>
  <p class="mut">Explore four districts and earn a stamp in each by finishing its challenge. Stamps: ${n} of 4.</p>
  <div class="map">${D.map(d => `<button class="dist ${ST[d.id] ? 'st' : ''}" style="--c:${d.c}" onclick="D.find(x=>x.id=='${d.id}').f()"><b>${d.n}</b><span>${d.s}</span><em>${ST[d.id] ? 'Stamped' : 'Not stamped yet'}</em></button>`).join('')}</div>`;
}
