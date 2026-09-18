'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Overrides the in-view margin of reveals below it. The default negative
 * margin waits until an element is well inside the viewport, which never
 * happens near the bottom of a section that exactly fills the screen.
 */
export const RevealMarginContext = createContext<string | undefined>(undefined);

interface ScrollRevealProps {
  children: ReactNode;
  /** Stagger delay in seconds */
  delay?: number;
  /** Slide-in direction */
  direction?: Direction;
  /** Distance in pixels for the slide */
  distance?: number;
  /** Duration of the animation in seconds */
  duration?: number;
  /** If true, animates only once when entering view */
  once?: boolean;
  className?: string;
}

function getDirectionOffset(direction: Direction, distance: number) {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance };
    case 'down':
      return { x: 0, y: -distance };
    case 'left':
      return { x: distance, y: 0 };
    case 'right':
      return { x: -distance, y: 0 };
  }
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 40,
  duration = 0.6,
  once = true,
  className,
}: ScrollRevealProps) {
  const offset = getDirectionOffset(direction, distance);
  const margin = useContext(RevealMarginContext) ?? '-80px';

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
