/* camera.js: 2D viewport camera with smoothing and strict map boundary clamping. */
(function (root) {
  'use strict';

  const AC = root.AC = root.AC || {};

  AC.Camera = function (viewportW = 320, viewportH = 180) {
    this.x = 0;
    this.y = 0;
    this.w = viewportW;
    this.h = viewportH;
  };

  AC.Camera.prototype.follow = function (targetX, targetY, mapW_px, mapH_px, smoothing = 0.15) {
    // Center camera on target
    const desiredX = targetX - this.w / 2;
    const desiredY = targetY - this.h / 2;

    // Smooth lerp follow
    this.x += (desiredX - this.x) * smoothing;
    this.y += (desiredY - this.y) * smoothing;

    // Clamp camera within map bounds
    const maxX = Math.max(0, mapW_px - this.w);
    const maxY = Math.max(0, mapH_px - this.h);

    this.x = Math.max(0, Math.min(maxX, this.x));
    this.y = Math.max(0, Math.min(maxY, this.y));
  };

  AC.Camera.prototype.snapTo = function (targetX, targetY, mapW_px, mapH_px) {
    this.x = targetX - this.w / 2;
    this.y = targetY - this.h / 2;

    const maxX = Math.max(0, mapW_px - this.w);
    const maxY = Math.max(0, mapH_px - this.h);

    this.x = Math.max(0, Math.min(maxX, this.x));
    this.y = Math.max(0, Math.min(maxY, this.y));
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
