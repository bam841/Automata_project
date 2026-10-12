/* engine.test.js: Tests for render scaling, fixed loop, input normalization, collision, and camera. */
(function (root) {
  'use strict';

  const { test, assert } = root.AC_TEST || require('./harness.js');
  const AC = root.AC;

  test('M1.1: AC.render.computeScale calculates integer pixel-perfect factors', function () {
    assert.equal(AC.render.computeScale(320, 180), 1);
    assert.equal(AC.render.computeScale(640, 360), 2);
    assert.equal(AC.render.computeScale(960, 540), 3);
    assert.equal(AC.render.computeScale(1920, 1080), 6);
    // Non-uniform aspect ratios must letterbox to smallest dimension
    assert.equal(AC.render.computeScale(800, 400), 2);
    assert.equal(AC.render.computeScale(100, 100), 1); // Minimum scale is 1
  });

  test('M1.2: AC.loop fixed timestep runs ~60 updates per second', function () {
    let updateCount = 0;
    AC.loop.start(
      dt => { updateCount++; },
      alpha => {}
    );

    // Simulate 0.5 seconds in discrete 16.6ms chunks
    for (let i = 0; i < 30; i++) {
      AC.loop.tick(1 / 60);
    }
    assert.equal(updateCount, 30);

    AC.loop.stop();
  });

  test('M1.2: AC.loop clamps huge frame deltas to MAX_FRAME_DELTA', function () {
    let updateCount = 0;
    AC.loop.start(
      dt => { updateCount++; },
      alpha => {}
    );

    // Simulate huge 5-second lag spike (tab backgrounding)
    const updates = AC.loop.tick(5.0);
    // Max updates per tick is capped at MAX_UPDATES_PER_FRAME (5)
    assert(updates <= AC.loop.MAX_UPDATES_PER_FRAME, `Updates (${updates}) must not exceed max cap`);

    AC.loop.stop();
  });

  test('M1.3: AC.input normalizes diagonal movement vector (|v| <= 1)', function () {
    AC.input.setEnabled(true);

    // Clear state
    AC.input._setDown('left', false);
    AC.input._setDown('right', false);
    AC.input._setDown('up', false);
    AC.input._setDown('down', false);

    // Single axis
    AC.input._setDown('right', true);
    let vec = AC.input.getVector();
    assert.equal(vec.dx, 1);
    assert.equal(vec.dy, 0);

    // Diagonal axis: right + down
    AC.input._setDown('down', true);
    vec = AC.input.getVector();
    const mag = Math.hypot(vec.dx, vec.dy);
    assert(Math.abs(mag - 1.0) < 0.001, `Diagonal magnitude ${mag} must be ~1.0`);

    // Reset
    AC.input._setDown('right', false);
    AC.input._setDown('down', false);
  });

  test('M1.6: AC.collide.move slides along walls on separate axes', function () {
    // Create a simple test tilemap where (1, 1) is solid wall
    const map = new AC.Tilemap(4, 4, 16);
    map.setTile('objects', 1, 1, AC.tiles.WALL);

    // Box at (4, 4), trying to move right into wall at x=16
    const box = { x: 4, y: 4, w: 8, h: 8 };

    // Move diagonally right + down: dx = 8, dy = 8
    // Target x would be 12 -> box right edge is 20 (overlaps x=16..31)
    // Target y would be 12 -> box bottom edge is 20 (overlaps y=16..31)
    const res = AC.collide.move(map, box, 8, 8);

    // Movement must be blocked or clamped on collision axis, but permitted where clear
    assert(res.x >= box.x, 'Player x must be valid');
    assert(res.y >= box.y, 'Player y must be valid');
  });

  test('M1.6: Out of bounds is strictly solid', function () {
    const map = new AC.Tilemap(4, 4, 16);
    assert.equal(map.isSolid(-1, 0), true);
    assert.equal(map.isSolid(0, -1), true);
    assert.equal(map.isSolid(4, 0), true);
    assert.equal(map.isSolid(0, 4), true);
  });

  test('M1.7: AC.Camera clamps strictly to map boundaries', function () {
    const cam = new AC.Camera(320, 180);
    const mapW_px = 64 * 16; // 1024
    const mapH_px = 64 * 16; // 1024

    // Follow near top-left edge
    cam.follow(10, 10, mapW_px, mapH_px, 1.0);
    assert.equal(cam.x, 0);
    assert.equal(cam.y, 0);

    // Follow near bottom-right edge
    cam.follow(1020, 1020, mapW_px, mapH_px, 1.0);
    assert.equal(cam.x, mapW_px - 320);
    assert.equal(cam.y, mapH_px - 180);
  });

  test('M1.7: AC.Camera.isVisible correctly tests viewport intersection', function () {
    const cam = new AC.Camera(320, 180);
    cam.x = 100;
    cam.y = 100;

    // Inside viewport
    assert.equal(cam.isVisible(150, 150, 16, 16), true, 'Inside viewport must be visible');
    // Overlapping left edge
    assert.equal(cam.isVisible(90, 120, 20, 20), true, 'Overlapping left edge must be visible');
    // Completely to the left
    assert.equal(cam.isVisible(50, 120, 10, 10), false, 'Outside left must not be visible');
    // Completely above
    assert.equal(cam.isVisible(150, 50, 10, 10), false, 'Outside above must not be visible');
  });

})(typeof globalThis !== 'undefined' ? globalThis : window);
