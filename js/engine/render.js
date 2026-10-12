/* render.js: Canvas setup, integer pixel-perfect scaling, and letterboxing. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};
  const render = AC.render = AC.render || {};

  render.WIDTH = 320;
  render.HEIGHT = 180;
  render.TILE = 16;

  let screenCanvas = null;
  let screenCtx = null;
  let bufferCanvas = null;
  let bufferCtx = null;
  let currentScale = 1;

  render.computeScale = function (windowWidth, windowHeight) {
    const scaleX = Math.floor(windowWidth / render.WIDTH);
    const scaleY = Math.floor(windowHeight / render.HEIGHT);
    return Math.max(1, Math.min(scaleX, scaleY));
  };

  render.resize = function () {
    if (!screenCanvas) return;
    const w = typeof root.innerWidth !== 'undefined' ? root.innerWidth : render.WIDTH;
    const h = typeof root.innerHeight !== 'undefined' ? root.innerHeight : render.HEIGHT;

    currentScale = render.computeScale(w, h);

    const displayW = render.WIDTH * currentScale;
    const displayH = render.HEIGHT * currentScale;

    screenCanvas.width = displayW;
    screenCanvas.height = displayH;
    screenCanvas.style.width = displayW + 'px';
    screenCanvas.style.height = displayH + 'px';

    if (screenCtx) {
      screenCtx.imageSmoothingEnabled = false;
    }
  };

  render.init = function (canvas) {
    screenCanvas = canvas;
    if (!screenCanvas) return null;

    screenCtx = screenCanvas.getContext('2d');
    if (screenCtx) screenCtx.imageSmoothingEnabled = false;

    // Create 320x180 offscreen buffer
    if (typeof document !== 'undefined') {
      bufferCanvas = document.createElement('canvas');
      bufferCanvas.width = render.WIDTH;
      bufferCanvas.height = render.HEIGHT;
      bufferCtx = bufferCanvas.getContext('2d');
      if (bufferCtx) bufferCtx.imageSmoothingEnabled = false;
    }

    render.resize();
    if (typeof root.addEventListener !== 'undefined') {
      root.addEventListener('resize', render.resize);
    }

    return bufferCtx;
  };

  render.getBuffer = function () {
    return bufferCtx;
  };

  render.getScale = function () {
    return currentScale;
  };

  render.present = function () {
    if (!screenCtx || !bufferCanvas) return;
    screenCtx.imageSmoothingEnabled = false;
    screenCtx.drawImage(
      bufferCanvas,
      0, 0, render.WIDTH, render.HEIGHT,
      0, 0, render.WIDTH * currentScale, render.HEIGHT * currentScale
    );
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
