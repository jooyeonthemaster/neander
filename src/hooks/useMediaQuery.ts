'use client';

import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Detects whether a CSS media query or named breakpoint matches.
 * Accepts either a named Tailwind breakpoint ('sm', 'md', 'lg', 'xl', '2xl')
 * or a raw media query string.
 *
 * Returns `false` during SSR to avoid hydration mismatches.
 */
export function useMediaQuery(query: BreakpointKey | string): boolean {
  const resolvedQuery =
    query in BREAKPOINTS
      ? BREAKPOINTS[query as BreakpointKey]
      : query;

  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(resolvedQuery);

    // Set initial value
    setMatches(mql.matches);

    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [resolvedQuery]);

  return matches;
}
