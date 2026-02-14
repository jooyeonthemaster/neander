'use client';

import { useRef, useEffect, useState, type RefObject } from 'react';

interface UseScrollProgressOptions {
  /** Offset for when tracking begins, e.g. "0px" or "-100px" */
  offset?: string;
}

/**
 * Returns a scroll progress value between 0 and 1 for a referenced element.
 * 0 = element just entered the viewport from below.
 * 1 = element has fully scrolled past the top of the viewport.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollProgressOptions = {}
): { ref: RefObject<T | null>; progress: number } {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function handleScroll() {
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;

      // total travel distance: from bottom of viewport to fully past top
      const totalDistance = windowHeight + elementHeight;
      // how far the element has traveled into the viewport
      const traveled = windowHeight - rect.top;

      const raw = traveled / totalDistance;
      setProgress(Math.min(1, Math.max(0, raw)));
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [options.offset]);

  return { ref, progress };
}
