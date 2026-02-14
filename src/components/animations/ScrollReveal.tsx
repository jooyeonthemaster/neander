'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right';

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
      viewport={{ once, margin: '-80px' }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
