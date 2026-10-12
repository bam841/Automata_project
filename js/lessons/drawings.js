/* drawings.js: Blackboard and CRT drawing renderers for lessons (train cars, Venn SVG, tree SVG, DFA SVG). */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  AC.lessons = AC.lessons || {};

  // 1. STRING TRAIN RENDERER
  function renderStringTrain(container, opts = {}) {
    const {
      w = '',
      v = null,
      cut = -1,
      reversed = false,
      isEpsilon = false,
      highlightIndex = -1
    } = opts;

    if (isEpsilon) {
      container.innerHTML = `
        <div class="chalk-train-track">
          <div class="train-engine">🚂</div>
          <div class="train-car epsilon-car">ε (length 0)</div>
          <div class="train-caboose">🚃</div>
        </div>
      `;
      return;
    }

    const charsW = [...w];
    let carsHtml = '';

    charsW.forEach((ch, idx) => {
      let carCls = 'train-car';
      if (idx === highlightIndex) carCls += ' car-highlight';
      if (cut >= 0 && idx < cut) carCls += ' car-prefix';
      if (cut >= 0 && idx >= cut) carCls += ' car-suffix';

      carsHtml += `<div class="${carCls}" data-idx="${idx}"><span class="car-letter">${AC.util.esc(ch)}</span><span class="car-wheel w1"></span><span class="car-wheel w2"></span></div>`;
      if (cut >= 0 && idx === cut - 1) {
        carsHtml += `<div class="train-cut-marker" title="Cut point k=${cut}">✂️</div>`;
      }
    });

    if (v !== null) {
      carsHtml += `<div class="train-coupler" title="Concatenation ·">🔗</div>`;
      const charsV = [...v];
      charsV.forEach((ch, idx) => {
        carsHtml += `<div class="train-car car-v" data-vidx="${idx}"><span class="car-letter">${AC.util.esc(ch)}</span><span class="car-wheel w1"></span><span class="car-wheel w2"></span></div>`;
      });
    }

    container.innerHTML = `
      <div class="chalk-train-track ${reversed ? 'train-reversed' : ''}">
        <div class="train-engine">${reversed ? '🚃' : '🚂'}</div>
        <div class="train-cars-row">${carsHtml}</div>
        <div class="train-caboose">${reversed ? '🚂' : '🚃'}</div>
      </div>
    `;
  }

  // 2. VENN DIAGRAM SVG RENDERER (U = {1..8})
  function renderVenn(container, opts = {}) {
    const {
      A = [],
      B = [],
      highlight = 'none', // 'a', 'b', 'ab', 'union', 'sym', 'comp', 'none'
      customLabel = ''
    } = opts;

    const setA = new Set(A);
    const setB = new Set(B);
    const U = AC.sets ? AC.sets.U : [1, 2, 3, 4, 5, 6, 7, 8];

    // Partition elements
    const onlyA = [], onlyB = [], both = [], neither = [];
    for (const x of U) {
      const inA = setA.has(x);
      const inB = setB.has(x);
      if (inA && inB) both.push(x);
      else if (inA) onlyA.push(x);
      else if (inB) onlyB.push(x);
      else neither.push(x);
    }

    // Determine highlight regions
    const hlA = highlight === 'a' || highlight === 'union' || highlight === 'sym';
    const hlB = highlight === 'b' || highlight === 'union' || highlight === 'sym';
    const hlBoth = highlight === 'ab' || highlight === 'union';
    const hlNeither = highlight === 'comp';

    // SVG elements
    const renderBadges = (list, cx, cyBase) => {
      return list.map((val, i) => {
        const x = cx + ((i % 2) - 0.5) * 24;
        const y = cyBase + Math.floor(i / 2) * 22;
        return `<g class="venn-token" transform="translate(${x},${y})"><circle r="9" class="token-bg"/><text y="3" text-anchor="middle" class="token-text">${val}</text></g>`;
      }).join('');
    };

    const tokensA = renderBadges(onlyA, 100, 75);
    const tokensBoth = renderBadges(both, 175, 75);
    const tokensB = renderBadges(onlyB, 250, 75);
    const tokensNeither = renderBadges(neither, 50, 165);

    container.innerHTML = `
      <div class="chalk-venn-wrapper">
        <svg viewBox="0 0 350 200" class="chalk-svg venn-svg" aria-label="Venn Diagram">
          <rect x="10" y="10" width="330" height="180" rx="8" class="venn-rect ${hlNeither ? 'hl-region' : ''}" />
          <text x="25" y="32" class="venn-label">U</text>

          <!-- Circle A -->
          <circle cx="130" cy="100" r="72" class="venn-circle circle-a ${hlA ? 'hl-circle' : ''}" />
          <!-- Circle B -->
          <circle cx="220" cy="100" r="72" class="venn-circle circle-b ${hlB ? 'hl-circle' : ''}" />

          <text x="95" y="38" class="venn-set-title">A</text>
          <text x="255" y="38" class="venn-set-title">B</text>

          <!-- Placed element tokens -->
          ${tokensA}
          ${tokensBoth}
          ${tokensB}
          ${tokensNeither}
        </svg>
        ${customLabel ? `<div class="venn-caption">${AC.util.esc(customLabel)}</div>` : ''}
      </div>
    `;
  }

  // 3. TREE SVG RENDERER
  function renderTree(container, opts = {}) {
    const {
      keys = [4, 2, 6, 1, 3, 5, 7],
      activeNode = null,
      visitedKeys = [],
      traversalName = 'Inorder (LNR)',
      callStack = []
    } = opts;

    const root = AC.tree.buildBST(keys);
    const layout = AC.tree.layout(root);

    // Compute bounds and scale to fit inside 320x160 viewBox
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layout.nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const scaleX = 260 / Math.max(1, (maxX - minX || 1));
    const scaleY = 100 / Math.max(1, (maxY - minY || 1));

    const mapX = x => 45 + (x - minX) * scaleX;
    const mapY = y => 30 + (y - minY) * scaleY;

    let edgesSvg = '';
    layout.edges.forEach(e => {
      const x1 = mapX(e.from.x), y1 = mapY(e.from.y);
      const x2 = mapX(e.to.x), y2 = mapY(e.to.y);
      edgesSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="tree-edge" />`;
    });

    let nodesSvg = '';
    layout.nodes.forEach(n => {
      const cx = mapX(n.x), cy = mapY(n.y);
      const keyVal = n.v !== undefined ? n.v : n.k;
      const isVisited = visitedKeys.includes(keyVal);
      const isActive = activeNode === keyVal;

      let cls = 'tree-node';
      if (isActive) cls += ' node-active';
      else if (isVisited) cls += ' node-visited';

      nodesSvg += `
        <g class="${cls}" transform="translate(${cx},${cy})">
          <circle r="14" class="node-circle" />
          <text y="4" text-anchor="middle" class="node-text">${keyVal}</text>
        </g>
      `;
    });

    let stackHtml = '';
    if (callStack.length > 0) {
      stackHtml = `
        <div class="tree-call-stack">
          <div class="stack-title">Call Stack</div>
          ${callStack.map(frame => `<div class="stack-frame">${AC.util.esc(frame)}</div>`).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="chalk-tree-wrapper">
        <svg viewBox="0 0 350 160" class="chalk-svg tree-svg" aria-label="Binary Search Tree">
          ${edgesSvg}
          ${nodesSvg}
        </svg>
        <div class="tree-legend">
          <span class="tree-order-tag">${AC.util.esc(traversalName)}: [${visitedKeys.join(', ')}]</span>
        </div>
        ${stackHtml}
      </div>
    `;
  }

  // 4. DFA CRT/SVG RENDERER
  function renderDFA(container, opts = {}) {
    const defaultMachine = (AC.dfa && AC.dfa.referenceMachines && AC.dfa.referenceMachines.endsWith01)
      ? AC.dfa.referenceMachines.endsWith01
      : { n: 3, delta: [[1, 0], [1, 2], [1, 0]], accept: new Set([2]) };
    const {
      machine = defaultMachine,
      activeState = 0,
      tape = '01',
      tapeHead = 0,
      isAccepted = false
    } = opts;

    // States positions for 2-4 states
    const positions = [
      { x: 70, y: 70, label: 'q0' },
      { x: 175, y: 70, label: 'q1' },
      { x: 280, y: 70, label: 'q2' },
      { x: 175, y: 130, label: 'q3' }
    ];

    let arrowsSvg = '';
    // Draw transitions
    machine.delta.forEach((transitions, fromState) => {
      const p1 = positions[fromState] || { x: 50, y: 50 };
      transitions.forEach((toState, symbol) => {
        const p2 = positions[toState] || { x: 50, y: 50 };
        if (fromState === toState) {
          // Self-loop
          arrowsSvg += `
            <path d="M ${p1.x - 8} ${p1.y - 18} C ${p1.x - 20} ${p1.y - 45}, ${p1.x + 20} ${p1.y - 45}, ${p1.x + 8} ${p1.y - 18}" class="dfa-arrow" />
            <text x="${p1.x}" y="${p1.y - 36}" text-anchor="middle" class="dfa-symbol-label">${symbol}</text>
          `;
        } else {
          // Arc between states
          const midX = (p1.x + p2.x) / 2;
          const curveY = fromState < toState ? Math.min(p1.y, p2.y) - 22 : Math.max(p1.y, p2.y) + 22;
          arrowsSvg += `
            <path d="M ${p1.x} ${p1.y} Q ${midX} ${curveY} ${p2.x} ${p2.y}" class="dfa-arrow" />
            <text x="${midX}" y="${curveY + (fromState < toState ? -4 : 14)}" text-anchor="middle" class="dfa-symbol-label">${symbol}</text>
          `;
        }
      });
    });

    // Start arrow into q0
    arrowsSvg += `<line x1="20" y1="70" x2="52" y2="70" class="dfa-arrow dfa-start-arrow" /><polygon points="52,70 44,66 44,74" class="dfa-arrow-head" />`;

    let statesSvg = '';
    for (let i = 0; i < machine.n; i++) {
      const p = positions[i] || { x: 50, y: 50, label: `q${i}` };
      const isAccept = machine.accept.has(i);
      const isActive = i === activeState;

      let cls = 'dfa-state';
      if (isActive) cls += ' state-active';
      if (isAccept) cls += ' state-accepting';

      statesSvg += `
        <g class="${cls}" transform="translate(${p.x},${p.y})">
          <circle r="20" class="dfa-outer-circle" />
          ${isAccept ? '<circle r="16" class="dfa-inner-circle" />' : ''}
          <text y="5" text-anchor="middle" class="dfa-state-label">${p.label}</text>
        </g>
      `;
    }

    // Tape rendering
    let tapeCells = '';
    const tapeChars = [...tape];
    tapeChars.forEach((ch, idx) => {
      const isRead = idx === tapeHead;
      tapeCells += `
        <div class="tape-cell ${isRead ? 'tape-head' : ''}">
          <span class="tape-char">${AC.util.esc(ch)}</span>
          ${isRead ? '<span class="tape-pointer">▲</span>' : ''}
        </div>
      `;
    });

    container.innerHTML = `
      <div class="crt-dfa-wrapper">
        <svg viewBox="0 0 350 150" class="crt-svg dfa-svg" aria-label="Deterministic Finite Automaton">
          ${arrowsSvg}
          ${statesSvg}
        </svg>
        <div class="dfa-tape-container">
          <span class="tape-label">Input Tape:</span>
          <div class="dfa-tape-strip">${tapeCells || '<span class="tape-empty">ε (empty)</span>'}</div>
          <span class="dfa-status-badge ${isAccepted ? 'status-accept' : 'status-reject'}">
            ${isAccepted ? '✓ ACCEPT' : '✗ REJECT'}
          </span>
        </div>
      </div>
    `;
  }

  AC.lessons.drawings = {
    renderStringTrain,
    renderVenn,
    renderTree,
    renderDFA
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
