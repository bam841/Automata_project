/* classic.js: Classic Mode view representing the original 4-district card explorer. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  const DISTRICTS = [
    {
      id: 'str',
      n: 'String Street',
      c: '#e0663f',
      s: 'Length, prefix, suffix, concat and reverse, with strings as trains.'
    },
    {
      id: 'set',
      n: 'Set Park',
      c: '#1f9d8a',
      s: 'Union, intersection, difference, complement, power set and more on a live Venn diagram.'
    },
    {
      id: 'tree',
      n: 'Tree Forest',
      c: '#4c8c3a',
      s: 'Walk a random tree in preorder, inorder or postorder, then try it yourself.'
    },
    {
      id: 'dfa',
      n: 'DFA Station',
      c: '#6f55e0',
      s: 'Build a DFA, step through a string and flip it into its complement.'
    }
  ];

  let currentMount = null;
  let activeDistrict = null;
  let clickListener = null;

  function renderHome() {
    if (!currentMount) return;

    if (activeDistrict && AC.lessons[activeDistrict]) {
      AC.lessons[activeDistrict].practice.unmount();
      activeDistrict = null;
    }

    const n = AC.progress.stampCount();

    currentMount.innerHTML = `
      <h1>Automata City</h1>
      <p class="mut">Explore four districts and earn a stamp in each by finishing its challenge. Stamps: ${n} of 4.</p>
      <div class="map">
        ${DISTRICTS.map(d => {
          const stamped = AC.progress.hasStamp(d.id);
          return `
            <button class="dist ${stamped ? 'st' : ''}" style="--c:${d.c}"
                    data-act="open-district" data-id="${d.id}">
              <b>${d.n}</b>
              <span>${d.s}</span>
              <em>${stamped ? 'Stamped' : 'Not stamped yet'}</em>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function openDistrict(id) {
    if (!currentMount) return;
    const district = DISTRICTS.find(d => d.id === id);
    const lesson = AC.lessons && AC.lessons[id];
    if (!district || !lesson) return;

    activeDistrict = id;

    currentMount.innerHTML = `
      <button data-act="back-home">Back to the map</button>
      <h2>${district.n}</h2>
      <div id="district-content"></div>
    `;

    const contentEl = currentMount.querySelector('#district-content');
    lesson.practice.mount(contentEl, {
      onStamp(stampedId) {
        // Stamp notification callback
      }
    });
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;

    const act = btn.dataset.act;
    if (act === 'open-district') {
      openDistrict(btn.dataset.id);
    } else if (act === 'back-home') {
      renderHome();
    }
  }

  AC.classic = {
    mount(host) {
      this.unmount();
      currentMount = host || (typeof document !== 'undefined' ? document.getElementById('app') : null);
      if (!currentMount) return;

      clickListener = handleClick;
      currentMount.addEventListener('click', clickListener);

      renderHome();
    },

    unmount() {
      if (activeDistrict && AC.lessons[activeDistrict]) {
        AC.lessons[activeDistrict].practice.unmount();
        activeDistrict = null;
      }
      if (currentMount && clickListener) {
        currentMount.removeEventListener('click', clickListener);
        clickListener = null;
        currentMount.innerHTML = '';
        currentMount = null;
      }
    },

    renderHome
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
