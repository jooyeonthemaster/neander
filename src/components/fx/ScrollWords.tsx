'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useReduce } from './useReduce';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   스크롤을 내리는 만큼 낱말이 하나씩 밝아지는 문장.
   줄바꿈(\n)은 넓은 화면에서만 지킨다.
   ───────────────────────────────────────────────────────── */

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] });
  const lines = text.split('\n').map((line) => line.split(' '));
  const total = lines.reduce((n, words) => n + words.length, 0);
  // 줄마다 그 앞까지의 낱말 수 — 낱말 하나가 전체에서 몇 번째인지 계산하는 데 쓴다
  const offsets = lines.map((_, li) => lines.slice(0, li).reduce((n, words) => n + words.length, 0));

  return (
    <p ref={ref} className={cn(className)}>
      {lines.map((words, li) => (
        <span key={li} className="lg:block">
          {words.map((word, wi) => {
            const index = offsets[li] + wi;
            return reduce ? (
              <span key={wi}>{word} </span>
            ) : (
              <span key={wi}>
                <Word progress={scrollYProgress} range={[index / total, (index + 1) / total]}>{word}</Word>{' '}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}
