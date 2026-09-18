'use client';

import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { ScrollOverlaySection } from '@/components/animations';

/* ─────────────────────────────────────────────────────────
   ScrollOverlayHome
   Client wrapper that applies the scroll-overlay stacking
   effect to the homepage sections. Each child is wrapped
   in a ScrollOverlaySection with ascending z-index so later
   sections slide up and cover earlier ones.
   ───────────────────────────────────────────────────────── */

interface ScrollOverlayHomeProps {
  children: ReactNode[];
}

export function ScrollOverlayHome({ children }: ScrollOverlayHomeProps) {
  const total = children.length;

  // Section snapping is scoped to the home page via a class on <html>,
  // the element that owns the viewport's scroll-snap-type (see globals.css).
  // Layout effect so the class is removed in the same commit that swaps in the
  // next page: with a passive effect the new page painted while snapping was
  // still on, and the footer (the only snap target left) pulled it to the bottom.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('home-snap');
    return () => root.classList.remove('home-snap');
  }, []);

  // Expose the footer's height so the CTA can share the last screen with it
  useEffect(() => {
    const root = document.documentElement;
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new ResizeObserver(() => {
      root.style.setProperty('--footer-h', `${footer.offsetHeight}px`);
    });
    observer.observe(footer);

    return () => {
      observer.disconnect();
      root.style.removeProperty('--footer-h');
    };
  }, []);

  // Define background colors for each section index to ensure opacity.
  // This prevents the underlying "stuck" section from bleeding through
  // transparency or gaps in the overlaying section.
  const BG_COLORS = [
    'bg-neutral-950', // 0: Hero
    'bg-white',       // 1: Services
    'bg-teal-950',    // 2: Stats
    'bg-neutral-50',  // 3: Portfolio
    'bg-white',       // 4: Clients
    'bg-neutral-950', // 5: CTA
  ];

  return (
    // Negative margin cancels main's header padding so the hero photos
    // run up behind the transparent header
    <div className="-mt-16 bg-neutral-950 lg:-mt-20">
      {children.map((child, idx) => (
        <ScrollOverlaySection
          key={idx}
          index={idx}
          isFirst={idx === 0}
          isLast={idx === total - 1}
          className={BG_COLORS[idx]}
          snap
        >
          {child}
        </ScrollOverlaySection>
      ))}
    </div>
  );
}
