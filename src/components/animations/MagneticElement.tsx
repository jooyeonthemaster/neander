'use client';

import {
  type ReactNode,
  useRef,
  useCallback,
} from 'react';
import { motion, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

interface MagneticElementProps {
  children: ReactNode;
  /** How strongly the element follows the cursor (0-1). Default 0.3 */
  strength?: number;
  className?: string;
}

const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };

export function MagneticElement({
  children,
  strength = 0.3,
  className,
}: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      x.set(deltaX);
      y.set(deltaY);
    },
    [strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
}
