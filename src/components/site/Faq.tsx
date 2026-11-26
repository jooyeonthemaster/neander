'use client';

import { useId, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/* 질문을 누르면 답이 펼쳐지는 목록. 접힌 답도 HTML 에 그대로 들어 있어 검색엔진·AI 가 읽는다. */

export interface FaqItem {
  q: string;
  a: string;
  /** 답 아래에 붙는 이미지 등 (선택) */
  media?: ReactNode;
}

export function Faq({ items, className, defaultOpen = 0 }: { items: FaqItem[]; className?: string; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();
  return (
    <ul className={cn('border-t border-paper/15', className)}>
      {items.map((item, i) => {
        const on = open === i;
        const triggerId = `${baseId}-q-${i}`;
        const panelId = `${baseId}-a-${i}`;
        return (
          <li key={item.q} className="border-b border-paper/15">
            <button
              id={triggerId}
              type="button"
              onClick={() => setOpen(on ? null : i)}
              aria-expanded={on}
              aria-controls={panelId}
              className="group flex w-full items-baseline justify-between gap-8 py-6 text-left lg:py-7"
            >
              <span className={cn('text-[clamp(1.05rem,1.6vw,1.4rem)] font-semibold leading-snug tracking-[-0.025em] transition-colors duration-300', on ? 'text-paper' : 'text-paper/75 group-hover:text-paper')}>{item.q}</span>
              <span aria-hidden="true" className="relative mt-1 h-4 w-4 shrink-0">
                <span className="absolute left-0 top-1/2 h-px w-4 bg-paper" />
                <span className={cn('absolute left-0 top-1/2 h-px w-4 bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]', on ? 'rotate-0' : 'rotate-90')} />
              </span>
            </button>
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              initial={false}
              animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
              // 접힌 답은 화면 낭독기 · 키보드 초점에서 빼 둔다 (내용은 HTML 에 그대로 남는다)
              inert={!on}
            >
              <p className="max-w-3xl whitespace-pre-line pb-7 text-[1rem] leading-[1.8] text-paper/65">{item.a}</p>
              {item.media && <div className="pb-8">{item.media}</div>}
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
