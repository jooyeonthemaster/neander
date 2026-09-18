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

    const fit = () => {
      el.style.zoom = '';
      const style = getComputedStyle(parent);
      const target = parseFloat(style.minHeight);
      if (!target) return;

      const available =
        target - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const natural = el.offsetHeight;
      if (natural <= available) return;

      let zoom = Math.max(MIN_ZOOM, available / natural);
      el.style.zoom = String(zoom);
      // Zoomed layout isn't perfectly linear (fixed borders, rounding) —
      // correct once against what the parent actually ended up at
      const overflow = parent.offsetHeight - target;
      if (overflow > 0 && zoom > MIN_ZOOM) {
        zoom = Math.max(MIN_ZOOM, zoom * (available / (available + overflow)));
        el.style.zoom = String(zoom);
      }
    };

    // Refit outside the observer callback — fit() itself resizes `el`
    let frame = 0;
    const scheduleFit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    fit();
    const observer = new ResizeObserver(scheduleFit);
    observer.observe(el);
    window.addEventListener('resize', scheduleFit);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', scheduleFit);
    };
  }, []);

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <RevealMarginContext.Provider value="0px">{children}</RevealMarginContext.Provider>
    </div>
  );
}
