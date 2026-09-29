export type CanvasCamera = { zoom: number; x: number; y: number };
type Point = { x: number; y: number };
type Viewport = { width: number; height: number };

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const CAMERA_DEFAULT: CanvasCamera = Object.freeze({ zoom: 1, x: 0, y: 0 });

const finite = (value: number, fallback = 0) => Number.isFinite(value) ? value : fallback;
const limitZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
const offsetLimit = (dimension: number, zoom: number) =>
  Math.min(Number.MAX_VALUE, Math.max(0, finite(dimension)) / 2 * Math.max(zoom, 1));
const limitOffset = (offset: number, bound: number) => Math.max(-bound, Math.min(bound, finite(offset))) || 0;

/** Translation is in viewport pixels; zero means centered at every zoom level.
 * Limit panning independently on each axis so the scene cannot be lost. */
export function clampCamera(camera: CanvasCamera, width: number, height: number): CanvasCamera {
  const zoom = limitZoom(finite(camera.zoom, CAMERA_DEFAULT.zoom));
  return {
    zoom,
    x: limitOffset(camera.x, offsetLimit(width, zoom)),
    y: limitOffset(camera.y, offsetLimit(height, zoom)),
  };
}

/** Anchor coordinates are relative to the viewport center, in screen pixels.
 * Optional translation moves the anchor during a pinch. Apply both movements
 * before clamping so a temporary zoom boundary cannot discard part of a pan. */
export function zoomCamera(camera: CanvasCamera, nextZoom: number, anchor: Point, viewport: Viewport, translation: Point = { x: 0, y: 0 }): CanvasCamera {
  const current = clampCamera(camera, viewport.width, viewport.height);
  const zoom = limitZoom(finite(nextZoom, current.zoom));
  const ratio = zoom / current.zoom;
  return clampCamera({
    zoom,
    x: current.x * ratio + finite(anchor.x) * (1 - ratio) + finite(translation.x),
    y: current.y * ratio + finite(anchor.y) * (1 - ratio) + finite(translation.y),
  }, viewport.width, viewport.height);
}

/** Pan distances are viewport pixels, independent of zoom. */
export function panCamera(camera: CanvasCamera, dx: number, dy: number, viewport: Viewport): CanvasCamera {
  const current = clampCamera(camera, viewport.width, viewport.height);
  return clampCamera({ ...current, x: current.x + finite(dx), y: current.y + finite(dy) }, viewport.width, viewport.height);
}
