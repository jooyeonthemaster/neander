'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: ReactNode;
  /** Speed in seconds for one full loop. Lower = faster. Default 30 */
  speed?: number;
  /** Scroll direction */
  direction?: 'left' | 'right';
  /** Pause the animation on hover */
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  speed = 30,
  direction = 'left',
  pauseOnHover = false,
  className,
}: MarqueeProps) {
  const animationDirection = direction === 'left' ? 'normal' : 'reverse';

  return (
    <div
      className={cn('group relative flex overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* First copy */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-4 animate-marquee',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        style={{
          animationDuration: `${speed}s`,
          animationDirection,
        }}
      >
        {children}
      </div>

      {/* Duplicate for seamless loop */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-4 animate-marquee',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        style={{
          animationDuration: `${speed}s`,
          animationDirection,
        }}
      >
        {children}
      </div>
    </div>
  );
}
