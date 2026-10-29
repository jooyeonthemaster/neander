'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Lang } from '@/lib/quote/catalog';
import { cn } from '@/lib/utils';

/**
 * 합계가 바뀌면 얼마가 늘고 줄었는지 잠깐 보여 준다 (+2,200,000원).
 * 합계 숫자만 바뀌면 무엇이 얼마나 달라졌는지 알기 어렵다. 2초쯤 뒤에 사라지고,
 * '동작 줄이기' 환경에서는 움직임 없이 나타났다 사라진다. 합계 자체는 따로 읽어 주므로 보조 기기에는 숨긴다.
 */
export function TotalDelta({ value, lang, className }: { value: number; lang: Lang; className?: string }) {
  const reducedMotion = useReducedMotion();
  const [previous, setPrevious] = useState(value);
  const [change, setChange] = useState<{ amount: number; id: number } | null>(null);
  if (previous !== value) {
    setPrevious(value);
    setChange({ amount: value - previous, id: (change?.id ?? 0) + 1 });
  }
  useEffect(() => {
    if (!change) return;
    const timer = window.setTimeout(() => setChange(null), 2200);
    return () => window.clearTimeout(timer);
  }, [change]);

  const amount = change ? Math.abs(change.amount) : 0;
  const text = change ? `${change.amount > 0 ? '+' : '−'}${lang === 'ko' ? `${amount.toLocaleString('ko-KR')}원` : `KRW ${amount.toLocaleString('en-US')}`}` : '';
  return (
    <AnimatePresence>
      {change && (
        <motion.span key={change.id} aria-hidden="true" data-testid="quote-total-delta" data-delta={change.amount}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}
          className={cn('inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none', change.amount > 0 ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-700', className)}>
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
