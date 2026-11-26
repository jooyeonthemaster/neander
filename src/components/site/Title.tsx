'use client';

import type { ElementType, ReactNode } from 'react';
import { Lines } from '@/components/fx/Reveal';
import { longestLineEm } from '@/components/site/title-metrics';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   영어 큰 제목 + 작은 한국어 병기 (2026-11-21 사용자 확정 규칙)
   · en: 줄 단위 배열. 한 줄씩 아래에서 올라온다
   · ko: 한국어판에서만 넘긴다 (영어판은 undefined)
   · 검색엔진이 한국어 제목을 함께 읽도록 한국어도 같은 제목 태그 안에 둔다
   ───────────────────────────────────────────────────────── */

const SIZE = {
  giant: 't-giant',
  h1: 't-h1',
  h2: 't-h2',
  h3: 't-h3',
} as const;

interface TitleProps {
  en: ReactNode[];
  ko?: string;
  as?: ElementType;
  size?: keyof typeof SIZE;
  className?: string;
  koClassName?: string;
  /** 첫 화면용 — 스크롤을 기다리지 않고 바로 올라온다 */
  immediate?: boolean;
  delay?: number;
  id?: string;
  /** 칸 폭에 맞춰 글자를 줄인다 — 가장 긴 영어 줄이 한 줄에 들어가게 (데이터에서 오는 이름용).
      제목 상자의 폭이 내용에 따라 정해지는 자리(가운데 정렬 flex 등)에서는 쓰지 않는다 */
  fit?: boolean;
}

export function Title({ en, ko, as: Tag = 'h2', size = 'h2', className, koClassName, immediate = false, delay = 0, id, fit = false }: TitleProps) {
  const fitEm = fit ? longestLineEm(en) : 0;
  return (
    <Tag
      id={id}
      data-fit={fitEm > 0 ? '' : undefined}
      className={cn('text-paper', className)}
      // 3% 여유를 둔다 (글자 사이 커닝 · 반올림)
      style={fitEm > 0 ? ({ '--fit-em': (fitEm * 1.03).toFixed(2) } as React.CSSProperties) : undefined}
    >
      <Lines lines={en} className={SIZE[size]} immediate={immediate} delay={delay} />
      {ko && (
        <span
          className={cn('t-ko mt-[0.9em] block text-paper/90', immediate && 'rise', koClassName)}
          style={immediate ? ({ '--i': en.length + 1 } as React.CSSProperties) : undefined}
        >
          {ko}
        </span>
      )}
    </Tag>
  );
}
