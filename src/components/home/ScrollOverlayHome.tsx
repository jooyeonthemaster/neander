'use client';

import { type ReactNode } from 'react';
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

  // Define background colors for each section index to ensure opacity.
  // This prevents the underlying "stuck" section from bleeding through
  // transparency or gaps in the overlaying section.
  const BG_COLORS = [
    'bg-white',       // 0: Hero
    'bg-white',       // 1: Services
    'bg-teal-950',    // 2: Stats
    'bg-neutral-50',  // 3: Portfolio
    'bg-white',       // 4: Clients
    'bg-neutral-950', // 5: CTA
  ];

  return (
    <div className="bg-neutral-950">
      {children.map((child, idx) => (
        <ScrollOverlaySection
          key={idx}
          index={idx}
          isFirst={idx === 0}
          isLast={idx === total - 1}
          className={BG_COLORS[idx]}
        >
          {child}
        </ScrollOverlaySection>
      ))}
    </div>
  );
}
