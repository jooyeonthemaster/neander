'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════
   Hero Slideshow — blurred portfolio photos cross-fading
   behind the hero copy. Images mount one slide ahead of
   the active one so the page doesn't fetch all 10 up front.
   ═══════════════════════════════════════════════════════════ */

const SLIDES = [
  '/images/portfolio/acscent-id-3.webp',
  '/images/portfolio/pyeongtaek-ai-festa-2026-1.webp',
  '/images/portfolio/cross-the-line-2.webp',
  '/images/portfolio/jecheon-music-film-festival-1.webp',
  '/images/portfolio/acscent-sinchon-1.webp',
  '/images/portfolio/seoul-writers-festival-1.webp',
  '/images/portfolio/cross-the-line-1.webp',
  '/images/portfolio/namsangol-hanok-chwihyang-2025-2.webp',
  '/images/portfolio/jimff-2026-ost-fair-1.webp',
  '/images/portfolio/heukseok-popup-testbed-2025-1.webp',
];

const INTERVAL_MS = 6000;
const FADE_MS = 1600;

interface HeroSlideshowProps {
  className?: string;
}

export function HeroSlideshow({ className }: HeroSlideshowProps) {
  const reduceMotion = useReducedMotion();
  const [{ active, mounted }, setState] = useState({ active: 0, mounted: 2 });
  // Flipped after first paint so the first slide zooms like the rest
  const [zoomReady, setZoomReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setZoomReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setState(({ active, mounted }) => {
        const next = (active + 1) % SLIDES.length;
        return { active: next, mounted: Math.max(mounted, next + 2) };
      });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {SLIDES.slice(0, mounted).map((src, i) => {
        const isActive = i === active;
        return (
          <div
            key={src}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              // Slow zoom while visible; snap back only after fading out
              transform: `scale(${isActive && zoomReady && !reduceMotion ? 1.18 : 1.1})`,
              transition: isActive
                ? `opacity ${FADE_MS}ms ease-in-out, transform ${INTERVAL_MS + FADE_MS}ms linear`
                : `opacity ${FADE_MS}ms ease-in-out, transform 0s linear ${FADE_MS}ms`,
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              // Heavily blurred, so half-width sources are plenty
              sizes="50vw"
              preload={i === 0}
              className="object-cover blur-[6px]"
            />
          </div>
        );
      })}
    </div>
  );
}
