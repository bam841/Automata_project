/* core.js: shared helpers, the list of districts, progress (stamps) and the home map.
   Loaded first. Every other file uses what is defined here. */

const $ = s => document.querySelector(s);
const app = $('#app');
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Stamps earned so far, e.g. { str: 1, set: 1 }. Resets on page refresh. */
let ST = {};

/* The four districts. Each `f` opens that district's screen. */
const D = [
  {id:'str',  n:'String Street', c:'#e0663f', s:'Length, prefix, suffix, concat and reverse, with strings as trains.', f:() => strv()},
  {id:'set',  n:'Set Park',      c:'#1f9d8a', s:'Union, intersection, difference, complement, power set and more on a live Venn diagram.', f:() => setv()},
  {id:'tree', n:'Tree Forest',   c:'#4c8c3a', s:'Walk a random tree in preorder, inorder or postorder, then try it yourself.', f:() => treev()},
  {id:'dfa',  n:'DFA Station',   c:'#6f55e0', s:'Build a DFA, step through a string and flip it into its complement.', f:() => dfav()}
];

/* Top of every district screen: a back button and a title. */
const head = t => `<button onclick="home()">Back to the map</button><h2>${t}</h2>`;

/* Updates the challenge banner (#ch). Pass ok=true to earn the district's stamp. */
const chal = (id, ok, t) => {
  if (ok) ST[id] = 1;
  const e = $('#ch');
  e.className = 'ch' + (ST[id] ? ' done' : '');
  e.textContent = (ST[id] ? 'Stamp earned. ' : 'Challenge: ') + t;
};

/* The city map. */
function home() {
  clearInterval(TI); // stop the tree animation if it was running (TI lives in tree.js)
  const n = Object.keys(ST).length;
  app.innerHTML = `<h1>Automata City</h1>
  <p class="mut">Explore four districts and earn a stamp in each by finishing its challenge. Stamps: ${n} of 4.</p>
  <div class="map">${D.map(d => `<button class="dist ${ST[d.id] ? 'st' : ''}" style="--c:${d.c}" onclick="D.find(x=>x.id=='${d.id}').f()"><b>${d.n}</b><span>${d.s}</span><em>${ST[d.id] ? 'Stamped' : 'Not stamped yet'}</em></button>`).join('')}</div>`;
}
