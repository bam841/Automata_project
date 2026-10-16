/* dialogue.js: Interactive dialogue box with Professor Delta guide and quest hints. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  let dialogueEl = null;
  let isOpen = false;
  let currentScript = [];
  let currentSpeaker = 'Professor Delta';
  let scriptIndex = 0;
  let fullText = '';
  let charIndex = 0;
  let typewriterTimer = null;

  function getDialogueEl() {
    if (dialogueEl) return dialogueEl;
    if (typeof document === 'undefined') return null;

    let el = document.getElementById('dialogue-box');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dialogue-box';
      el.hidden = true;
      document.body.appendChild(el);
    }
    dialogueEl = el;
    return dialogueEl;
  }

  function initDialogueEl() {
    const el = getDialogueEl();
    if (!el) return null;
    if (!el._hasClickListener) {
      el._hasClickListener = true;
      el.addEventListener('click', (e) => {
        if (!isOpen) return;
        e.stopPropagation();
        advance();
      });
    }
    return el;
  }

  function getProfessorHint() {
    const stampCount = AC.progress ? AC.progress.stampCount() : 0;

    if (stampCount === 0) {
      return [
        'Greetings traveler! I am Professor Delta (δ). Welcome to Automata City!',
        'To unlock the ancient Exam Tower, you must explore all four stations and earn their completion stamps.',
        'Follow the stone roads! String Street lies to the West, and Set Park to the East. Find their foundational resources in the plaza first!'
      ];
    }

    if (stampCount === 4) {
      return [
        'Magnificent work! You have collected all four district stamps: String, Set, Tree, and DFA!',
        'The great Exam Tower in the northeastern plaza is now unsealed.',
        'Step forward and prove your mastery of theoretical computation!'
      ];
    }

    // 1 to 3 stamps: recommend the nearest unstamped district
    const unstamped = (AC.districts || []).filter(d => !AC.progress.hasStamp(d.id));
    if (unstamped.length > 0) {
      const nextTarget = unstamped[0];
      const directions = {
        str: 'West along the railroad tracks',
        set: 'East toward the twin Venn ponds',
        tree: 'North into the glowing Tree Forest',
        dfa: 'South along the transit loop'
      };
      const dirText = directions[nextTarget.id] || 'through the city';
      const isUnlocked = AC.quests ? AC.quests.isGateUnlocked(nextTarget.id) : true;
      const q = AC.quests ? AC.quests.get(nextTarget.id) : null;

      return [
        `You are making steady progress! Stamps collected: ${stampCount} of 4.`,
        `Next, I recommend heading to ${nextTarget.name}, located ${dirText}.`,
        isUnlocked
          ? 'Step onto the station\'s glowing platform and press E to open the lecture board!'
          : `Its gate requires the ${q ? q.itemName : 'resource'}. Retrieve it from the Central Plaza!`
      ];
    }

    return ['Keep exploring Automata City!'];
  }

  function showNextPage() {
    const el = initDialogueEl();
    if (!el) return;

    if (scriptIndex >= currentScript.length) {
      close();
      return;
    }

    fullText = currentScript[scriptIndex];
    charIndex = 0;
    scriptIndex++;

    const speakerName = (AC.util && typeof AC.util.esc === 'function')
      ? AC.util.esc(currentSpeaker)
      : currentSpeaker;

    el.innerHTML = `
      <div class="dialogue-card">
        <div class="dialogue-speaker">${speakerName}</div>
        <div class="dialogue-body" id="dialogue-text"></div>
        <div class="dialogue-hint">Press E or Click to continue ▶</div>
      </div>
    `;

    const textEl = el.querySelector('#dialogue-text');
    if (!textEl) return;

    if (typewriterTimer) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }

    // Typewriter effect
    typewriterTimer = setInterval(() => {
      charIndex++;
      textEl.textContent = fullText.slice(0, charIndex);
      if (charIndex >= fullText.length) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
      }
    }, 20);
  }

  function handleInput(e) {
    if (!isOpen) return;

    const isInteractKey = (
      e.code === 'KeyE' ||
      e.code === 'Enter' ||
      e.code === 'Space' ||
      e.key === 'e' ||
      e.key === 'E' ||
      e.key === 'Enter' ||
      e.key === ' '
    );

    if (isInteractKey) {
      e.preventDefault();
      advance();
    } else if (e.key === 'Escape' || e.code === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  function advance() {
    if (!isOpen) return;

    if (typewriterTimer) {
      // Complete current text immediately
      clearInterval(typewriterTimer);
      typewriterTimer = null;
      const el = getDialogueEl();
      const textEl = el ? el.querySelector('#dialogue-text') : null;
      if (textEl) textEl.textContent = fullText;
    } else {
      if (AC.audio && typeof AC.audio.play === 'function') {
        AC.audio.play('select');
      }
      showNextPage();
    }
  }

  function close() {
    if (typewriterTimer) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
    const el = getDialogueEl();
    if (el) {
      el.hidden = true;
      el.innerHTML = '';
    }
    isOpen = false;

    if (typeof root.removeEventListener !== 'undefined') {
      root.removeEventListener('keydown', handleInput);
    }

    if (AC.input && typeof AC.input.clearPressed === 'function') {
      AC.input.clearPressed();
    }

    if (AC.setState) {
      AC.setState('world');
    }
  }

  function start(customScript, speakerName) {
    const el = initDialogueEl();
    if (!el) return;

    isOpen = true;
    currentSpeaker = speakerName || 'Professor Delta';
    currentScript = customScript || getProfessorHint();
    scriptIndex = 0;

    if (AC.setState) {
      AC.setState('dialogue');
    }

    if (AC.audio && typeof AC.audio.play === 'function') {
      AC.audio.play('select');
    }

    el.hidden = false;
    showNextPage();

    if (typeof root.addEventListener !== 'undefined') {
      root.addEventListener('keydown', handleInput);
    }
  }

  function show(speakerName, lines) {
    start(lines, speakerName);
  }

  AC.dialogue = {
    start,
    show,
    advance,
    close,
    isOpen: () => isOpen,
    getProfessorHint
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
