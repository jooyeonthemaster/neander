'use client';

import { type ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

interface ParallaxWrapperProps {
  children: ReactNode;
  /**
   * Parallax speed multiplier.
   * Positive values move the element slower than scroll (classic parallax).
   * Negative values move it faster / opposite.
   * Typical range: -0.5 to 0.5
   */
  speed?: number;
  className?: string;
}

export function ParallaxWrapper({
  children,
  speed = 0.2,
  className,
}: ParallaxWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress to a pixel offset
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
