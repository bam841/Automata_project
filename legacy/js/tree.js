/* tree.js: Tree Forest. Preorder, inorder and postorder on a random binary tree. */

// State variables for tree generation, traversal, and animation:
let T,            // Stores the current tree object: { root: Node, md: maxDepth }
    TO = 'pre',   // Currently selected traversal order key: 'pre' | 'in' | 'post'
    TM = 'watch', // Active mode: 'watch' (automated walk animation) or 'turn' (interactive quiz)
    TS = [],      // Array storing the target traversal visiting sequence of node numbers
    TP = 0,       // Counter index tracking how many nodes have been visited so far
    TI,           // Stores the setInterval timer ID for step animation (cleared by home() and re-inits)
    TG = '';      // Status/feedback message string displayed under the tree

// Human-readable labels for traversal orders
const NM = {pre: 'Preorder', in: 'Inorder', post: 'Postorder'};

// Explanatory visiting rules for each traversal
const RL = {pre: 'root, left, right', in: 'left, root, right', post: 'left, right, root'};

/* Recursive tree walker: returns values of tree node `n` in traversal order `o` accumulated in array `a`. */
const wk = (n, o, a = []) => {
  // Base case: if current node is null/undefined, return accumulated array
  if (!n) return a;

  // Preorder traversal: visit root before traversing subtrees
  o == 'pre' && a.push(n.v);

  // Recursively traverse the left subtree
  wk(n.l, o, a);

  // Inorder traversal: visit root between left and right subtrees
  o == 'in' && a.push(n.v);

  // Recursively traverse the right subtree
  wk(n.r, o, a);

  // Postorder traversal: visit root after traversing both subtrees
  o == 'post' && a.push(n.v);

  // Return the accumulated array containing traversal order
  return a;
};

/* Builds a random binary search tree (BST) with 7 distinct values, and assigns 2D positions (x, d) to each node. */
function mk() {
  // Array to collect 7 unique random numbers
  const v = [];
  // Continue generating random numbers until we have exactly 7 unique numbers
  while (v.length < 7) {
    // Generate a random integer from 1 to 99
    const x = 1 + Math.floor(Math.random() * 99);
    // If not already in array, add it
    if (!v.includes(x)) v.push(x);
  }

  // Recursive BST insert helper: places number x into tree node n following BST property (left < root < right)
  const ins = (n, x) => !n ? {v: x} : (x < n.v ? (n.l = ins(n.l, x), n) : (n.r = ins(n.r, x), n));

  // Initialize root pointer, inorder horizontal position counter i, and maximum depth tracker md
  let root = null, i = 0, md = 0;

  // Insert all 7 random numbers one-by-one into the BST
  v.forEach(x => root = ins(root, x));

  // Recursive layout helper lay(n, d): assigns 2D planar coordinates using an inorder traversal.
  // Inorder layout guarantees every node's horizontal position x is between its left and right subtrees,
  // preventing overlapping lines and nodes.
  const lay = (n, d) => {
    // Return if node is empty
    if (!n) return;
    // Layout left subtree at depth d + 1
    lay(n.l, d + 1);
    // Assign monotonic inorder index to x
    n.x = i++;
    // Assign depth to d
    n.d = d;
    // Track maximum tree depth seen
    md = Math.max(md, d);
    // Layout right subtree at depth d + 1
    lay(n.r, d + 1);
  };

  // Compute positions starting from root at depth 0
  lay(root, 0);

  // Store the root and maximum depth into global object T
  T = {root, md};
}

// Renders the Tree Forest district view
function treev() {
  // Clear any existing animation timer
  clearInterval(TI);

  // If no tree has been generated yet, build one
  if (!T) mk();

  // Construct view HTML:
  // - Header & description
  // - Traversal selector buttons (Preorder, Inorder, Postorder)
  // - Action buttons ("Watch the walk", "Your turn", "New tree")
  // - Mount point #tv for SVG tree and traversal logs
  // - Challenge status banner #ch
  app.innerHTML = head('Tree Forest') + `<p>Pick a traversal. Watch it walk the tree, or try it yourself by clicking the nodes in the right order.</p>
  <div class="f">${Object.keys(NM).map(k => `<button class="${k == TO ? 'pri' : ''}" onclick="TO='${k}';treev()">${NM[k]}</button>`).join('')}</div>
  <div class="f"><button onclick="wt()">Watch the walk</button><button onclick="yt()">Your turn</button><button onclick="mk();treev()">New tree</button></div>
  <div id="tv"></div><p id="ch"></p>`;

  // Calculate the correct target traversal array TS for current tree and order
  TS = wk(T.root, TO);
  // Reset visited node count to 0
  TP = 0;
  // Default to 'watch' animation mode
  TM = 'watch';
  // Clear feedback text
  TG = '';

  // Render the SVG tree
  trr();
}

/* Draws the tree SVG, edges, visited highlights, and traversal order status. */
function trr() {
  // Canvas width W = 340, dynamic height H proportional to tree depth md
  // X(i) scales horizontal position across width
  // Y(d) scales vertical position down by depth
  // ns: array to collect all tree nodes
  const W = 340, H = T.md * 54 + 52, X = i => 24 + i * (W - 48) / 6, Y = d => 26 + d * 54, ns = [];

  // Helper col(n): collects all non-null nodes into array ns via preorder traversal
  const col = n => { if (n) { ns.push(n); col(n.l); col(n.r); } };
  // Collect all nodes from root
  col(T.root);

  // Start SVG string with viewBox and accessible role
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Binary tree">`;

  // Draw branch connector lines from each parent node n to each of its children c
  ns.forEach(n => [n.l, n.r].forEach(c => { if (c) s += `<line class="ed" x1="${X(n.x)}" y1="${Y(n.d)}" x2="${X(c.x)}" y2="${Y(c.d)}"/>`; }));

  // Draw node circles and labels
  ns.forEach(n => {
    // Find this node value's position index in target traversal array TS
    const k = TS.indexOf(n.v);
    // Check if this node has already been visited in the current walk
    const seen = k < TP;

    // Build interactive node group:
    // - <circle>: gets class 'hl' (blue) if visited, and 'cur' (thick green border) if it is the most recently visited node
    // - <text class="qn">: displays the node's number inside the circle
    // - <text class="lb">: displays the 1-based traversal step number badge above the circle if already visited
    s += `<g class="tn" tabindex="0" role="button" aria-label="Node ${n.v}" onclick="tc(${n.v})" onkeydown="if(event.key=='Enter')tc(${n.v})"><circle class="el ${seen ? 'hl' : ''} ${k == TP - 1 ? 'cur' : ''}" cx="${X(n.x)}" cy="${Y(n.d)}" r="15"/><text class="qn" x="${X(n.x)}" y="${Y(n.d) + 4}" text-anchor="middle">${n.v}</text>${seen ? `<text class="lb" x="${X(n.x) + 14}" y="${Y(n.d) - 12}">${k + 1}</text>` : ''}</g>`;
  });

  // Inject completed SVG, rule explanation, visited nodes order, and feedback string into #tv
  $('#tv').innerHTML = s + `</svg><p><b>${NM[TO]}</b> visits ${RL[TO]}.</p><p>Order so far: <b>${TS.slice(0, TP).join(', ') || 'none yet'}</b></p><p class="${/^Not/.test(TG) ? 'bad' : ''}">${TG}</p>`;

  // Evaluate challenge:
  // Stamp 'tree' is awarded when user is in 'turn' mode and has successfully visited all nodes in correct order (TP == TS.length)
  chal('tree', TM == 'turn' && TP == TS.length, 'Press Your turn and click every node in the correct order for the traversal you picked.');
}

/* "Watch the walk": animate one visit every 0.8 seconds. */
function wt() {
  // Clear any existing animation timer
  clearInterval(TI);
  // Set mode to 'watch', reset visited count to 0, clear feedback text
  TM = 'watch'; TP = 0; TG = '';
  // Redraw initial state with 0 visited nodes
  trr();
  // Set recurring interval: every 800ms increment visited counter TP, redraw, and stop when all nodes are visited
  TI = setInterval(() => { TP++; trr(); if (TP >= TS.length) clearInterval(TI); }, 800);
}

/* "Your turn": interactive mode where user clicks nodes. */
function yt() {
  // Clear any active animation timer
  clearInterval(TI);
  // Switch mode to 'turn' and reset progress TP to 0
  TM = 'turn'; TP = 0;
  // Prompt user to click the first node in the selected traversal order
  TG = `Click the first node to visit in ${NM[TO].toLowerCase()}.`;
  // Redraw tree
  trr();
}

/* Handles node click event for node value `v`. */
function tc(v) {
  // If not currently in interactive 'turn' mode, remind user to click "Your turn" first
  if (TM != 'turn') { TG = 'Press Your turn first, then click the nodes.'; return trr(); }

  // If all nodes have already been successfully visited, do nothing on extra clicks
  if (TP >= TS.length) return;

  // Check if the clicked node value v matches the expected next node in sequence TS[TP]
  if (v == TS[TP]) {
    // If correct, increment visited count TP
    TP++;
    // Set feedback message depending on whether this completed the walk or if more nodes remain
    TG = TP == TS.length ? 'Correct, the whole walk is done!' : 'Correct. Keep going.';
  } else {
    // If incorrect, show error message reminding user of the traversal order rule
    TG = `Not ${v}. For ${NM[TO].toLowerCase()}, go ${RL[TO]}.`;
  }

  // Redraw tree to reflect updated visited states and feedback message
  trr();
}
