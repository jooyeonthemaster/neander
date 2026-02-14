'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';

interface StaggerChildrenProps {
  children: ReactNode;
  /** Delay between each child animation in seconds */
  staggerDelay?: number;
  className?: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: {
      staggerChildren: staggerDelay,
    },
  }),
};

/**
 * Child items must use the exported `staggerItemVariants` or define
 * their own "hidden" / "visible" variants for the stagger to work.
 */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerChildrenProps) {
  return (
    <motion.div
      variants={containerVariants}
      custom={staggerDelay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * Convenience wrapper to apply stagger item variants to individual children.
 * Wrap each child inside <StaggerItem> for automatic fade+slide entrance.
 */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItemVariants} className={cn(className)}>
      {children}
    </motion.div>
  );
}
