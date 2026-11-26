'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';
import { useReduce } from './useReduce';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   끝없이 흐르는 글자 띠. 스크롤을 빨리 내리면 더 빨리 흐르고,
   올리면 반대로 흐른다. 내용은 화면 낭독기에서 한 번만 읽힌다.
   ───────────────────────────────────────────────────────── */

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

export function VelocityMarquee({ children, className, speed = 2.2 }: { children: ReactNode; className?: string; speed?: number }) {
  const reduce = useReduce();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const direction = useRef(-1);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < 0) direction.current = 1;
    else if (f > 0) direction.current = -1;
    let move = direction.current * speed * (delta / 1000);
    move += direction.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  return (
    <div data-marquee className={cn('overflow-hidden whitespace-nowrap', className)}>
      <motion.div className="inline-flex w-max will-change-transform" style={{ x }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">{children}</div>
      </motion.div>
    </div>
  );
}
