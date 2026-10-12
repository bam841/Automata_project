/* loop.js: Fixed 60 FPS timestep game loop with accumulator and lag clamping. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  const DT = 1 / 60;
  const MAX_FRAME_DELTA = 0.25;
  const MAX_UPDATES_PER_FRAME = 5;

  let isRunning = false;
  let rafId = null;
  let lastTime = 0;
  let accumulator = 0;
  let updateFn = null;
  let renderFn = null;

  function step(currentTimeSec) {
    if (!isRunning) return;

    if (lastTime === 0) {
      lastTime = currentTimeSec;
    }

    let delta = currentTimeSec - lastTime;
    lastTime = currentTimeSec;

    // Clamp huge frame deltas (tab switch or background sleep)
    if (delta > MAX_FRAME_DELTA) {
      delta = MAX_FRAME_DELTA;
    }

    accumulator += delta;

    let updates = 0;
    while (accumulator >= DT && updates < MAX_UPDATES_PER_FRAME) {
      if (updateFn) updateFn(DT);
      accumulator -= DT;
      updates++;
    }

    // Drop excess accumulated time if running behind
    if (updates >= MAX_UPDATES_PER_FRAME) {
      accumulator = 0;
    }

    const alpha = accumulator / DT;
    if (renderFn) renderFn(alpha);

    if (typeof root.requestAnimationFrame !== 'undefined') {
      rafId = root.requestAnimationFrame(timeMs => step(timeMs / 1000));
    }
  }

  function handleVisibilityChange() {
    if (typeof document !== 'undefined' && document.hidden) {
      accumulator = 0;
      lastTime = 0;
    }
  }

  AC.loop = {
    DT,
    MAX_FRAME_DELTA,
    MAX_UPDATES_PER_FRAME,

    start(onUpdate, onRender) {
      this.stop();
      updateFn = onUpdate;
      renderFn = onRender;
      isRunning = true;
      lastTime = 0;
      accumulator = 0;

      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }

      if (typeof root.requestAnimationFrame !== 'undefined') {
        rafId = root.requestAnimationFrame(timeMs => step(timeMs / 1000));
      }
    },

    stop() {
      isRunning = false;
      if (rafId !== null && typeof root.cancelAnimationFrame !== 'undefined') {
        root.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      lastTime = 0;
      accumulator = 0;
    },

    isRunning() {
      return isRunning;
    },

    // Manual step function for deterministic unit testing
    tick(deltaTime) {
      let delta = deltaTime;
      if (delta > MAX_FRAME_DELTA) delta = MAX_FRAME_DELTA;
      accumulator += delta;

      let updateCount = 0;
      while (accumulator >= DT && updateCount < MAX_UPDATES_PER_FRAME) {
        if (updateFn) updateFn(DT);
        accumulator -= DT;
        updateCount++;
      }
      if (updateCount >= MAX_UPDATES_PER_FRAME) {
        accumulator = 0;
      }

      const alpha = accumulator / DT;
      if (renderFn) renderFn(alpha);
      return updateCount;
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
