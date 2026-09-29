'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Maximize, Minus, Plus } from 'lucide-react';
import type { Lang } from '@/lib/quote/catalog';
import { CAMERA_DEFAULT, MAX_ZOOM, MIN_ZOOM, clampCamera, panCamera, zoomCamera, type CanvasCamera } from '@/lib/quote-preview/canvas-camera';
import { cn } from '@/lib/utils';

type Point = { x: number; y: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** Viewport size belongs to the page, while the scene and camera stay inside it. */
export function PreviewCanvas({ children, lang, label, overlay }: { children: ReactNode; lang: Lang; label: string; overlay?: ReactNode }) {
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const instructions = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const cameraRef = useRef<CanvasCamera>({ ...CAMERA_DEFAULT });
  const [camera, setCamera] = useState<CanvasCamera>({ ...CAMERA_DEFAULT });
  const [dragging, setDragging] = useState(false);

  function size() {
    const rect = viewport.current?.getBoundingClientRect();
    return { width: rect?.width ?? 0, height: rect?.height ?? 0 };
  }
  function update(next: CanvasCamera) {
    cameraRef.current = next;
    setCamera(next);
  }
  function anchor(point: Point): Point {
    const rect = viewport.current!.getBoundingClientRect();
    return { x: point.x - rect.left - rect.width / 2, y: point.y - rect.top - rect.height / 2 };
  }
  function zoomTo(zoom: number, point: Point = { x: 0, y: 0 }) {
    update(zoomCamera(cameraRef.current, zoom, point, size()));
  }
  function reset() { update({ ...CAMERA_DEFAULT }); }

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const next = clampCamera(cameraRef.current, element.clientWidth, element.clientHeight);
      cameraRef.current = next;
      setCamera(next);
    });
    observer.observe(element);
    // Consume wheel input only over the scene, keeping the cursor's scene point anchored.
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = element.getBoundingClientRect();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
      const sensitivity = event.ctrlKey || event.metaKey ? .005 : .002;
      const next = zoomCamera(cameraRef.current, cameraRef.current.zoom * Math.exp(-delta * sensitivity),
        { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 }, rect);
      cameraRef.current = next;
      setCamera(next);
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => { observer.disconnect(); element.removeEventListener('wheel', wheel); };
  }, []);

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    viewport.current?.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    setDragging(true);
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const before = [...pointers.current.values()];
    const current = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, current);
    const after = [...pointers.current.values()];
    if (before.length >= 2) {
      const oldMid = midpoint(before[0], before[1]), newMid = midpoint(after[0], after[1]);
      const oldDistance = distance(before[0], before[1]);
      update(zoomCamera(cameraRef.current, cameraRef.current.zoom * (oldDistance > 0 ? distance(after[0], after[1]) / oldDistance : 1), anchor(oldMid), size(),
        { x: newMid.x - oldMid.x, y: newMid.y - oldMid.y }));
    } else update(panCamera(cameraRef.current, current.x - previous.x, current.y - previous.y, size()));
  }
  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    setDragging(pointers.current.size > 0);
  }
  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case '+': case '=': zoomTo(cameraRef.current.zoom + .25); break;
      case '-': case '_': zoomTo(cameraRef.current.zoom - .25); break;
      case '0': case 'Home': reset(); break;
      case 'ArrowLeft': update(panCamera(cameraRef.current, 30, 0, size())); break;
      case 'ArrowRight': update(panCamera(cameraRef.current, -30, 0, size())); break;
      case 'ArrowUp': update(panCamera(cameraRef.current, 0, 30, size())); break;
      case 'ArrowDown': update(panCamera(cameraRef.current, 0, -30, size())); break;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  const control = 'inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 disabled:cursor-default disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none';
  return <div data-testid="preview-canvas" data-zoom={camera.zoom} data-pan-x={camera.x} data-pan-y={camera.y}
    className="relative h-[180px] w-full shrink-0 overflow-hidden bg-[#f7f5f0] lg:h-[clamp(280px,42dvh,420px)]">
    <div ref={viewport} data-testid="preview-canvas-viewport" role="group" aria-label={label} aria-describedby={instructions}
      tabIndex={0} onKeyDown={keyDown} onPointerDown={pointerDown} onPointerMove={pointerMove}
      onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={pointerEnd}
      onDoubleClick={(event) => cameraRef.current.zoom >= MAX_ZOOM ? reset() : zoomTo(cameraRef.current.zoom * 1.5, anchor({ x: event.clientX, y: event.clientY }))}
      className={cn('absolute inset-x-0 bottom-12 top-0 touch-none select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500', dragging ? 'cursor-grabbing' : 'cursor-grab')}>
      {/* Clip at the fixed viewport, never at the moving SVG's original box.
          The floor extends past the initial fitted view and must remain paintable when panned. */}
      <div data-testid="preview-canvas-stage" className={cn('h-full w-full origin-center [&>svg]:!h-full [&>svg]:!max-h-none [&>svg]:!w-full [&>svg]:!overflow-visible', !dragging && 'transition-transform duration-200 ease-out motion-reduce:transition-none')}
        style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>{children}</div>
    </div>
    {overlay && <div data-testid="preview-canvas-overlay" className="pointer-events-none absolute inset-x-0 top-0 bottom-12">{overlay}</div>}
    <p id={instructions} className="sr-only">{L('드래그로 이동하고, 마우스 휠을 위로 돌리면 확대, 아래로 돌리면 축소돼요. 두 손가락이나 확대·축소 버튼도 사용할 수 있어요. 키보드 +, −로 확대·축소, 방향키로 이동, 0으로 전체 보기를 할 수 있어요.', 'Drag to move. Scroll up to zoom in around the pointer, or down to zoom out. Pinch or use the zoom buttons too. Keyboard: + and − to zoom, arrows to move, and 0 to fit the whole scene.')}</p>
    <div className="pointer-events-none absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2">
      <span aria-hidden="true" className="hidden text-[10px] text-slate-500 xl:block">{L('휠로 확대·축소 · 드래그로 이동', 'Scroll to zoom · Drag to move')}</span>
      <div role="group" aria-label={L('미리보기 확대·축소', 'Preview zoom controls')} className="pointer-events-auto ml-auto flex items-center gap-0.5 rounded-2xl border border-slate-200/70 bg-white/95 p-0.5 shadow-sm">
        <button type="button" data-testid="preview-zoom-out" aria-label={L('미리보기 축소', 'Zoom out')} disabled={camera.zoom <= MIN_ZOOM} onClick={() => zoomTo(cameraRef.current.zoom - .25)} className={control}><Minus size={15} aria-hidden="true" /></button>
        <output data-testid="preview-zoom-value" aria-label={L('확대 비율', 'Zoom level')} className="min-w-10 text-center text-[11px] font-semibold tabular-nums text-slate-600">{Math.round(camera.zoom * 100)}%</output>
        <button type="button" data-testid="preview-zoom-in" aria-label={L('미리보기 확대', 'Zoom in')} disabled={camera.zoom >= MAX_ZOOM} onClick={() => zoomTo(cameraRef.current.zoom + .25)} className={control}><Plus size={15} aria-hidden="true" /></button>
        <span aria-hidden="true" className="mx-1 h-4 w-px bg-slate-200" />
        <button type="button" data-testid="preview-zoom-reset" onClick={reset} className={cn(control, 'w-auto gap-1.5 px-2 text-[11px] font-semibold')}><Maximize size={13} aria-hidden="true" />{L('전체 보기', 'Fit all')}</button>
      </div>
    </div>
  </div>;
}
