'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { RevealMarginContext } from './ScrollReveal';

/* ─────────────────────────────────────────────────────────
   FitToViewport
   Keeps a screen-sized section's content inside the screen.
   The parent sets the target with a min-height (see the
   `home-screen` utility); if the content is taller than that
   minus the parent's vertical padding, it is shrunk with CSS
   zoom, which — unlike a transform — shrinks its layout box
   too. Parents without a min-height (e.g. on mobile) are
   left alone. Reveals inside fire as soon as they enter the
   viewport, since the whole section is on screen at once.
   ───────────────────────────────────────────────────────── */

/** Below this the text gets too small — let the section grow instead */
const MIN_ZOOM = 0.7;

interface FitToViewportProps {
  children: ReactNode;
  className?: string;
}

export function FitToViewport({ children, className }: FitToViewportProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    /** One shrink step from the current zoom. Returns true if the zoom changed. */
    const shrink = () => {
      const style = getComputedStyle(parent);
      const target = parseFloat(style.minHeight);
      if (!target) return false;
      const zoom = parseFloat(el.style.zoom) || 1;
      // Rendered (zoomed) height vs. the room left after everything else in the
      // parent — padding and any other children
      const rendered = el.getBoundingClientRect().height;
      const available = parent.offsetHeight > target
        ? target - (parent.offsetHeight - rendered)
        : target - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      if (rendered <= available + 1) return false;
      const next = Math.max(MIN_ZOOM, zoom * (available / rendered));
      if (zoom - next < 0.002) return false;
      el.style.zoom = String(next);
      return true;
    };

    /**
     * Zoomed text can wrap differently (it renders a hair smaller), so a fit
     * can change the height it was based on. Recomputing from the unzoomed
     * size on every size change therefore flipped between two zooms forever
     * (a visible jitter). Only start over from 100% when the screen size
     * changes; otherwise only ever shrink, a few steps until it fits.
     */
    const fit = (fromScratch: boolean) => {
      if (fromScratch) el.style.zoom = '';
      for (let i = 0; i < 4 && shrink(); i++);
    };

    let frame = 0;
    const schedule = (fromScratch: boolean) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fit(fromScratch));
    };
    const onContentResize = () => schedule(false);
    const onWindowResize = () => schedule(true);

    fit(true);
    const observer = new ResizeObserver(onContentResize);
    observer.observe(el);
    window.addEventListener('resize', onWindowResize);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <RevealMarginContext.Provider value="0px">{children}</RevealMarginContext.Provider>
    </div>
  );
}
