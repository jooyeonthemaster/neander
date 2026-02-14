'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
  title: string;
  description: string;
  icon?: string;
  side: 'left' | 'right';
  delay: number;
}

export function TimelineItem({
  title,
  description,
  icon,
  side,
  delay,
}: TimelineItemProps) {
  const isLeft = side === 'left';

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(
        'relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm',
        'transition-colors duration-200 hover:border-teal-200 hover:shadow-md'
      )}
    >
      {/* Connector arrow */}
      <div
        className={cn(
          'absolute top-5 hidden h-3 w-3 rotate-45 border bg-white lg:block',
          isLeft
            ? '-right-1.5 border-r border-t border-slate-200'
            : '-left-1.5 border-b border-l border-slate-200'
        )}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3">
        {icon && (
          <span className="shrink-0 text-xl" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
            {title}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
