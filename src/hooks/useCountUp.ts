'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountUpOptions {
  /** The target number to count up to */
  target: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Number of decimal places */
  decimals?: number;
  /** Whether the animation is enabled (tie to inView) */
  enabled?: boolean;
}

/**
 * Animates a number from 0 to `target` using an easeOut curve.
 * Returns the current interpolated value.
 */
export function useCountUp({
  target,
  duration = 2,
  decimals = 0,
  enabled = true,
}: UseCountUpOptions): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevTargetRef = useRef(target);

  const animate = useCallback(
    (from: number, to: number) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      startTimeRef.current = null;

      function step(timestamp: number) {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = (timestamp - startTimeRef.current) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutExpo curve for a satisfying deceleration
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentValue = from + eased * (to - from);

        setCount(
          decimals > 0
            ? parseFloat(currentValue.toFixed(decimals))
            : Math.round(currentValue)
        );

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [duration, decimals]
  );

  useEffect(() => {
    if (!enabled) return;

    const prev = prevTargetRef.current;
    prevTargetRef.current = target;

    animate(prev, target);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, target, animate]);

  return count;
}
