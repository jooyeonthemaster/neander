'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   ScrollOverlaySection
   Wraps a section so it "sticks" in place while the next
   section slides up and overlays it — a layered card-stack
   scroll effect. Each section gets an incrementing z-index
   so later sections naturally cover earlier ones.

   Outgoing effects (when being covered by the next section):
   · Scale down to 0.93
   · Fade to 0.3 opacity
   · Add border-radius (card-like)
   · Dark backdrop visible behind rounded corners for depth

   Incoming effects (when overlaying the previous section):
   · Top edge shadow for depth separation
   · Rounded top corners for smooth entry
   ───────────────────────────────────────────────────────── */

interface ScrollOverlaySectionProps {
  children: ReactNode;
  /** Stacking order — 0 = first (bottommost), increments up */
  index: number;
  /** Skip outgoing scale/fade (for the very last section) */
  isLast?: boolean;
  /** Skip incoming shadow (for the very first section) */
  isFirst?: boolean;
  /** Extra className on the outer container */
  className?: string;
  /**
   * Emit scroll-snap targets for this section (start, plus end when taller
   * than the viewport). Only takes effect inside a snap container.
   */
  snap?: boolean;
}

export function ScrollOverlaySection({
  children,
  index,
  isLast = false,
  isFirst = false,
  className,
  snap = false,
}: ScrollOverlaySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [stickyTop, setStickyTop] = useState(0);
  const [height, setHeight] = useState(0);
  const [coverStart, setCoverStart] = useState(0);

  // Measure content to adjust sticky position for tall sections
  useEffect(() => {
    if (!containerRef.current) return;

    const updateStickyOffset = () => {
      if (!containerRef.current) return;
      const h = containerRef.current.offsetHeight;
      const wh = window.innerHeight;
      // If section is taller than viewport, stick so the BOTTOM is visible
      // (i.e. top is negative offset). Otherwise stick to top (0).
      const newTop = h > wh ? -(h - wh) : 0;
      setStickyTop(newTop);
      setHeight(h);
      // A section shorter than the viewport only starts being covered once
      // its top reaches the viewport top, part-way through the tracked range
      setCoverStart(h < wh ? 1 - h / wh : 0);
    };

    updateStickyOffset();

    const observer = new ResizeObserver(updateStickyOffset);
    observer.observe(containerRef.current);
    window.addEventListener('resize', updateStickyOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateStickyOffset);
    };
  }, []);

  /* ── Track overlap phase ──────────────────────────────── */
  // 'end end': When bottom of section hits bottom of viewport (stickiness starts for tall content)
  // 'end start': When bottom of section hits top of viewport (fully covered)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['end end', 'end start'],
  });

  /* ── Outgoing transforms (section being covered) ────── */
  // Map the overlap phase [0, 1] to the scale effect
  const scale = useTransform(scrollYProgress, [coverStart, 1], [1, 0.93]);
  const borderRadius = useTransform(scrollYProgress, [coverStart, 1], [0, 24]);

  const shouldAnimate = !isLast && !prefersReducedMotion;

  return (
    <>
      {snap && (
        // Snap targets live in a zero-height, non-sticky anchor at the
        // section's natural position — the sticky section itself can't be
        // used, since once stuck its position reads as the current scroll.
        // The full-height start area lets browsers scroll freely inside
        // sections taller than the viewport.
        <div className="pointer-events-none relative h-0" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 snap-start snap-always" style={{ height }} />
          {stickyTop < 0 && (
            <div
              className="absolute inset-x-0 h-px snap-end snap-always"
              style={{ top: height - 1 }}
            />
          )}
        </div>
      )}
      <motion.div
        ref={containerRef}
        className={cn(
          'sticky w-full overflow-hidden will-change-transform',
          className,
        )}
        style={{
          zIndex: index + 1,
          top: stickyTop,
          ...(shouldAnimate
            ? {
              scale,
              borderRadius,
              transformOrigin: 'center top',
            }
            : {}),
        }}
      >
        {/* ── Incoming top-edge shadow for depth separation ── */}
        {!isFirst && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-50 h-3"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)',
            }}
            aria-hidden="true"
          />
        )}

        {children}
      </motion.div>
    </>
  );
}
