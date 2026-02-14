'use client';

import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  /** Enable hover lift effect */
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  hover = false,
  onClick,
  ...props
}: CardProps) {
  const isInteractive = hover || !!onClick;

  return (
    <motion.div
      whileHover={
        isInteractive
          ? { y: -4, boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.12)' }
          : undefined
      }
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-6',
        'shadow-sm transition-colors',
        isInteractive && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
