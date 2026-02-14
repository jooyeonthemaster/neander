'use client';

import { useRef } from 'react';
import { useInView } from 'motion/react';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface CountUpProps {
  /** The number to count up to */
  target: number;
  /** Text placed after the number, e.g. "+" or "%" */
  suffix?: string;
  /** Text placed before the number, e.g. "$" */
  prefix?: string;
  /** Duration in seconds */
  duration?: number;
  /** Number of decimal places */
  decimals?: number;
  className?: string;
}

export function CountUp({
  target,
  suffix = '',
  prefix = '',
  duration = 2,
  decimals = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const count = useCountUp({
    target,
    duration,
    decimals,
    enabled: isInView,
  });

  const formatted =
    decimals > 0
      ? count.toFixed(decimals)
      : count.toLocaleString();

  return (
    <span ref={ref} className={cn('tabular-nums', className)} aria-label={`${prefix}${target}${suffix}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
