/* strings.js: String Street. Length, prefix, suffix, concatenation, reverse. */

// Global string variables and cut pointer:
// W = user's primary string w (default 'level')
// V = user's secondary string v (default 'city')
// K = integer index where w is sliced into prefix and suffix (default 2)
let W = 'level', V = 'city', K = 2;

// Renders the String Street district screen
function strv() {
  // Build the initial HTML structure: back button, header, input fields, train track container,
  // range slider for cut position K, results output container, and challenge banner
  app.innerHTML = head('String Street') + `<p>A string is a train and each letter is a car. Edit the trains, then slide the cut to split w into a prefix and a suffix.</p>
  <div class="f"><label>w <input id="w" value="${esc(W)}" maxlength="14" oninput="su()"></label><label>v <input id="v" value="${esc(V)}" maxlength="14" oninput="su()"></label></div>
  <div id="trk"></div>
  <label class="f">Cut after letter <input type="range" id="k" min="0" max="${W.length}" value="${K}" oninput="su()"> <b id="kv"></b></label>
  <div id="out"></div><p id="ch"></p>`;

  // Run the computation and redraw routine immediately to display the initial data
  su();
}

/* Redraws everything whenever w, v or the cut changes. */
function su() {
  // Retrieve the latest value typed into input #w by the user
  W = $('#w').value;
  // Retrieve the latest value typed into input #v by the user
  V = $('#v').value;

  // Get the range slider element representing cut index K
  const r = $('#k');
  // Dynamically constrain slider's max attribute to the current length of string W
  r.max = W.length;
  // Read numeric slider position and ensure K never exceeds string W's current length
  K = Math.min(+r.value, W.length);

  // Unpack string W into an array of characters (spread handles Unicode characters cleanly)
  const a = [...W];
  // Unpack string V into an array of characters
  const b = [...V];
  // Calculate length |w|
  const n = a.length;
  // Create reversed character array w^R
  const rv = [...a].reverse();

  // Helper function tr(x, f): draws an array of characters x as styled train cars
  // - If x is empty, returns the Greek epsilon symbol 'ε' indicating the empty string
  // - If x has characters, maps each character into an <i class="car ..."> tag
  // - Parameter f can be a static CSS class string or a function receiving character index i
  const tr = (x, f) => x.length ? x.map((c, i) => `<i class="car ${typeof f == 'function' ? f(i) : f}">${esc(c)}</i>`).join('') : '<i class="car e">ε</i>';

  // Helper function li(f): generates indices 0 through n (total n+1), transforms each via callback f,
  // and formats them as a readable comma-separated string list
  const li = f => [...Array(n + 1).keys()].map(f).join(', ');

  // Update the text badge next to the slider with the current numeric cut value K
  $('#kv').textContent = K;

  // Render the train track display of string w:
  // Cars before cut index K (i < K) get class 'p' (prefix color), while cars at or after cut get 's' (suffix color)
  $('#trk').innerHTML = `<div class="row">${tr(a, i => i < K ? 'p' : 's')}</div>`;

  // Render the theoretical string analysis table:
  // - Length |w|
  // - Prefix: w[0..K-1] styled with prefix color 'p'
  // - Suffix: w[K..n-1] styled with suffix color 's'
  // - Concat wv: cars of w followed by cars of v, plus combined length (|w| + |v|)
  // - Reverse w^R: reversed string cars
  // - All prefixes: comprehensive list of w.slice(0, i) for i from 0 to n (empty string represented as ε)
  // - All suffixes: comprehensive list of w.slice(i) for i from 0 to n (empty string represented as ε)
  $('#out').innerHTML = `<table class="ot">
    <tr><th>Length |w|</th><td>${n}</td></tr>
    <tr><th>Prefix (first ${K})</th><td><div class="row">${tr(a.slice(0, K), 'p')}</div></td></tr>
    <tr><th>Suffix (last ${n - K})</th><td><div class="row">${tr(a.slice(K), 's')}</div></td></tr>
    <tr><th>Concat wv</th><td><div class="row">${[...a.map(c => `<i class="car p">${esc(c)}</i>`), ...b.map(c => `<i class="car s">${esc(c)}</i>`)].join('') || '<i class="car e">ε</i>'}</div>Length ${n + b.length}</td></tr>
    <tr><th>Reverse wᴿ</th><td><div class="row">${tr(rv, 'p')}</div></td></tr>
    <tr><th>All prefixes</th><td>${li(i => esc(a.slice(0, i).join('')) || 'ε')}</td></tr>
    <tr><th>All suffixes</th><td>${li(i => esc(a.slice(i).join('')) || 'ε')}</td></tr></table>`;

  // Evaluate challenge condition:
  // User earns stamp 'str' when string w is at least 3 letters long (n >= 3) and equals its reverse (a.join('') == rv.join(''))
  chal('str', n >= 3 && a.join('') == rv.join(''), 'Type a word of 3 or more letters that reads the same reversed (wᴿ = w).');
}
