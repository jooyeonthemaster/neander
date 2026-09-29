import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CAMERA_DEFAULT, MAX_ZOOM, MIN_ZOOM, clampCamera, panCamera, zoomCamera, type CanvasCamera,
} from '../../src/lib/quote-preview/canvas-camera';

const viewport = { width: 1000, height: 600 };
const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} !== ${expected}`);

test('camera clamps zoom and each pan axis while preserving a centered reset', () => {
  assert.deepEqual(clampCamera(CAMERA_DEFAULT, 1000, 600), { zoom: 1, x: 0, y: 0 });
  assert.deepEqual(clampCamera({ zoom: 0.1, x: -900, y: 900 }, 1000, 600), { zoom: MIN_ZOOM, x: -500, y: 300 });
  assert.deepEqual(clampCamera({ zoom: 10, x: 9000, y: -9000 }, 1000, 600), { zoom: MAX_ZOOM, x: 1500, y: -900 });
  assert.deepEqual(clampCamera({ zoom: 2, x: 300, y: 800 }, 1000, 600), { zoom: 2, x: 300, y: 600 });
});

test('zoom preserves the content point under an off-center anchor and can reverse without drift', () => {
  for (const oldZoom of [MIN_ZOOM, 1, 2.4, MAX_ZOOM]) {
    const camera = { zoom: oldZoom, x: 70, y: -45 };
    for (const anchor of [{ x: 0, y: 0 }, { x: -120, y: 90 }, { x: 130, y: -65 }]) {
      const content = { x: (anchor.x - camera.x) / oldZoom, y: (anchor.y - camera.y) / oldZoom };
      for (const nextZoom of [MIN_ZOOM, 1, 1.8, MAX_ZOOM]) {
        const next = zoomCamera(camera, nextZoom, anchor, viewport);
        close(content.x * next.zoom + next.x, anchor.x);
        close(content.y * next.zoom + next.y, anchor.y);
        const restored = zoomCamera(next, oldZoom, anchor, viewport);
        close(restored.x, camera.x);
        close(restored.y, camera.y);
        assert.equal(restored.zoom, camera.zoom);
      }
    }
  }
});

test('zoom uses the clamped target ratio and prioritizes pan limits over an unreachable anchor', () => {
  assert.deepEqual(zoomCamera(CAMERA_DEFAULT, 100, { x: 100, y: -50 }, viewport), { zoom: MAX_ZOOM, x: -200, y: 100 });
  assert.deepEqual(zoomCamera(CAMERA_DEFAULT, 3, { x: 10_000, y: -10_000 }, viewport), { zoom: 3, x: -1500, y: 900 });
  const atMaximum = { zoom: 3, x: -1500, y: 900 };
  assert.deepEqual(zoomCamera(atMaximum, 4, { x: 50, y: 50 }, viewport), atMaximum);
});

test('a pinch combines zoom and midpoint translation before limiting the final camera', () => {
  const bounds = { width: 500, height: 300 };
  assert.deepEqual(zoomCamera({ zoom: 1, x: 250, y: -150 }, 2, { x: -100, y: 60 }, bounds, { x: -50, y: 30 }),
    { zoom: 2, x: 500, y: -300 }, 'Clamping zoom first would incorrectly slide the camera back to (450, -270)');

  const camera = { zoom: 1, x: 20, y: -10 };
  const anchor = { x: 30, y: -20 };
  const movement = { x: -40, y: 25 };
  const next = zoomCamera(camera, 2, anchor, bounds, movement);
  close((anchor.x - camera.x) / camera.zoom * next.zoom + next.x, anchor.x + movement.x);
  close((anchor.y - camera.y) / camera.zoom * next.zoom + next.y, anchor.y + movement.y);
  assert.deepEqual(zoomCamera(camera, 2, anchor, bounds, { x: Infinity, y: NaN }), zoomCamera(camera, 2, anchor, bounds));
});

test('pan uses screen pixels at every zoom and respects resized viewports', () => {
  for (const zoom of [MIN_ZOOM, 1, MAX_ZOOM]) {
    const camera = { zoom, x: 30, y: -20 };
    const next = panCamera(camera, 40, -25, viewport);
    assert.deepEqual(next, { zoom, x: 70, y: -45 });
    assert.deepEqual(panCamera(next, -40, 25, viewport), camera);
  }
  assert.deepEqual(panCamera({ zoom: 2, x: 990, y: -590 }, 100, -100, viewport), { zoom: 2, x: 1000, y: -600 });
  assert.deepEqual(clampCamera({ zoom: 2, x: 1000, y: -600 }, 360, 240), { zoom: 2, x: 360, y: -240 });
});

test('invalid numeric input and collapsed viewports never produce nonfinite camera state', () => {
  assert.deepEqual(clampCamera({ zoom: NaN, x: Infinity, y: -Infinity }, NaN, -10), CAMERA_DEFAULT);
  assert.deepEqual(clampCamera({ zoom: 2, x: 50, y: 80 }, 0, Infinity), { zoom: 2, x: 0, y: 0 });
  const camera = { zoom: 2, x: 30, y: -20 };
  assert.deepEqual(zoomCamera(camera, NaN, { x: Infinity, y: NaN }, viewport), camera);
  assert.deepEqual(panCamera(camera, Infinity, NaN, viewport), camera);
  const extreme = panCamera({ zoom: 3, x: Number.MAX_VALUE, y: Number.MAX_VALUE }, Number.MAX_VALUE, Number.MAX_VALUE, { width: Number.MAX_VALUE, height: Number.MAX_VALUE });
  assert.ok(Object.values(extreme).every(Number.isFinite));
});

test('camera operations are pure and clamping is idempotent', () => {
  const camera: CanvasCamera = Object.freeze({ zoom: 1.5, x: 120, y: -80 });
  const anchor = Object.freeze({ x: 30, y: 25 });
  const bounds = Object.freeze({ width: 800, height: 500 });
  const original = { ...camera };
  const moved = panCamera(camera, 10, 20, bounds);
  const zoomed = zoomCamera(camera, 2, anchor, bounds);
  assert.deepEqual(camera, original);
  assert.deepEqual(anchor, { x: 30, y: 25 });
  for (const value of [CAMERA_DEFAULT, camera, moved, zoomed, { zoom: 20, x: -9000, y: 9000 }]) {
    const normalized = clampCamera(value, bounds.width, bounds.height);
    assert.deepEqual(clampCamera(normalized, bounds.width, bounds.height), normalized);
  }
});
