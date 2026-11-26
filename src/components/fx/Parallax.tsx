'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useReduce } from './useReduce';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   스크롤보다 조금 느리게 움직이는 사진 틀.
   틀(overflow hidden) 안의 내용이 위아래로 strength% 만큼 어긋나며 지나간다.
   ───────────────────────────────────────────────────────── */

export function Parallax({ children, className, strength = 8 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y, scale: 1 + (strength * 2.4) / 100 }}>
        {children}
      </motion.div>
    </div>
  );
}

/** 스크롤에 따라 위아래로 떠 움직이는 요소 (사진 틀 없이) */
export function Drift({ children, className, distance = 60 }: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
