/* tree.js: Mountable Tree Forest district practice view. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  AC.lessons = AC.lessons || {};

  let currentHost = null;
  let currentCtx = null;
  let listeners = [];

  let treeData = null;
  let TO = 'pre';
  let TM = 'watch';
  let TS = [];
  let TP = 0;
  let timerId = null;
  let TG = '';

  const ORDER_NAMES = { pre: 'Preorder', in: 'Inorder', post: 'Postorder' };
  const ORDER_RULES = { pre: 'root, left, right', in: 'left, root, right', post: 'left, right, root' };

  function initTree(rng) {
    treeData = AC.tree.randomBST(rng || (AC.rng ? AC.rng(Date.now()) : Math.random), 7);
    updateSequence();
  }

  function updateSequence() {
    if (!treeData) return;
    if (TO === 'pre') TS = AC.tree.preorder(treeData.root);
    else if (TO === 'in') TS = AC.tree.inorder(treeData.root);
    else if (TO === 'post') TS = AC.tree.postorder(treeData.root);
    TP = 0;
    TG = '';
  }

  function stopAnimation() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function renderTreeSVG() {
    if (!treeData) return '';
    const W = 340;
    const H = treeData.md * 54 + 52;
    const X = i => 24 + i * (W - 48) / 6;
    const Y = d => 26 + d * 54;

    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Binary tree">`;

    // Edges
    for (const e of treeData.edges) {
      s += `<line class="ed" x1="${X(e.from.x)}" y1="${Y(e.from.d)}" x2="${X(e.to.x)}" y2="${Y(e.to.d)}"/>`;
    }

    // Nodes
    for (const n of treeData.nodes) {
      const k = TS.indexOf(n.v);
      const seen = k < TP;
      const isCurrent = k === TP - 1;

      s += `
        <g class="tn" tabindex="0" role="button" aria-label="Node ${n.v}"
           data-act="node-click" data-val="${n.v}">
          <circle class="el ${seen ? 'hl' : ''} ${isCurrent ? 'cur' : ''}" cx="${X(n.x)}" cy="${Y(n.d)}" r="15"/>
          <text class="qn" x="${X(n.x)}" y="${Y(n.d) + 4}" text-anchor="middle">${n.v}</text>
          ${seen ? `<text class="lb" x="${X(n.x) + 14}" y="${Y(n.d) - 12}">${k + 1}</text>` : ''}
        </g>
      `;
    }

    s += '</svg>';
    return s;
  }

  function updateView() {
    if (!currentHost) return;

    // Check challenge
    if (TM === 'turn' && TP === TS.length && TS.length > 0) {
      if (!AC.progress.hasStamp('tree')) {
        AC.progress.setStamp('tree');
        if (currentCtx && currentCtx.onStamp) currentCtx.onStamp('tree');
      }
    }

    const stamped = AC.progress.hasStamp('tree');

    currentHost.innerHTML = `
      <p>Pick a traversal. Watch it walk the tree, or try it yourself by clicking the nodes in the right order.</p>
      <div class="f">
        ${Object.keys(ORDER_NAMES).map(k => `
          <button class="${k === TO ? 'pri' : ''}" data-act="set-order" data-order="${k}">${ORDER_NAMES[k]}</button>
        `).join('')}
      </div>
      <div class="f">
        <button data-act="watch">Watch the walk</button>
        <button data-act="turn">Your turn</button>
        <button data-act="new-tree">New tree</button>
      </div>
      <div id="tv">
        ${renderTreeSVG()}
        <p><b>${ORDER_NAMES[TO]}</b> visits ${ORDER_RULES[TO]}.</p>
        <p>Order so far: <b>${TS.slice(0, TP).join(', ') || 'none yet'}</b></p>
        <p class="${/^Not/.test(TG) ? 'bad' : ''}">${TG}</p>
      </div>
      <p id="ch" class="ch${stamped ? ' done' : ''}">${stamped ? 'Stamp earned. ' : 'Challenge: '}Press Your turn and click every node in the correct order for the traversal you picked.</p>
    `;
  }

  function handleNodeClick(v) {
    if (TM !== 'turn') {
      TG = 'Press Your turn first, then click the nodes.';
      updateView();
      return;
    }
    if (TP >= TS.length) return;

    if (v === TS[TP]) {
      TP++;
      TG = TP === TS.length ? 'Correct, the whole walk is done!' : 'Correct. Keep going.';
    } else {
      TG = `Not ${v}. For ${ORDER_NAMES[TO].toLowerCase()}, go ${ORDER_RULES[TO]}.`;
    }
    updateView();
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;

    const act = btn.dataset.act;
    if (act === 'set-order') {
      stopAnimation();
      TO = btn.dataset.order;
      updateSequence();
      updateView();
    } else if (act === 'watch') {
      stopAnimation();
      TM = 'watch';
      TP = 0;
      TG = '';
      updateView();
      timerId = setInterval(() => {
        TP++;
        updateView();
        if (TP >= TS.length) stopAnimation();
      }, 800);
    } else if (act === 'turn') {
      stopAnimation();
      TM = 'turn';
      TP = 0;
      TG = `Click the first node to visit in ${ORDER_NAMES[TO].toLowerCase()}.`;
      updateView();
    } else if (act === 'new-tree') {
      stopAnimation();
      initTree(currentCtx && currentCtx.rng);
      TM = 'watch';
      updateView();
    } else if (act === 'node-click') {
      handleNodeClick(+btn.dataset.val);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      const btn = e.target.closest('[data-act="node-click"]');
      if (btn) {
        handleNodeClick(+btn.dataset.val);
      }
    }
  }

  function mount(host, ctx) {
    unmount();
    currentHost = host;
    currentCtx = ctx || {};

    if (!treeData) {
      initTree(currentCtx.rng);
    }

    host.addEventListener('click', handleClick);
    listeners.push({ target: host, type: 'click', fn: handleClick });

    host.addEventListener('keydown', handleKeyDown);
    listeners.push({ target: host, type: 'keydown', fn: handleKeyDown });

    updateView();
  }

  function unmount() {
    stopAnimation();
    for (const l of listeners) {
      l.target.removeEventListener(l.type, l.fn);
    }
    listeners = [];
    if (currentHost) {
      currentHost.innerHTML = '';
      currentHost = null;
    }
    currentCtx = null;
  }

  AC.lessons.tree = {
    id: 'tree',
    title: 'Tree Forest',
    color: '#4c8c3a',
    practice: { mount, unmount },
    challenge: { mount, unmount }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
