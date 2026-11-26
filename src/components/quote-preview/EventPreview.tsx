'use client';

import dynamic from 'next/dynamic';
import type { Lang, ServiceKey } from '@/lib/quote/catalog';
import { sanitizeInput, type QuoteInput } from '@/lib/quote/engine';
import { cn } from '@/lib/utils';

// 3D 배치 미리보기 — three.js 가 무거워서 이 미리보기가 화면에 놓일 때 따로 불러온다
const Quote3D = dynamic(() => import('./Quote3D'), {
  ssr: false,
  loading: () => <div role="status" className="theme-dark flex min-h-[260px] flex-1 items-center justify-center bg-[#2c313b] text-sm text-paper/55 lg:min-h-[clamp(280px,42dvh,420px)]">3D…</div>,
});

/** One shared event overview.
    전체 행사 공간은 3D 배치 미리보기 하나만 둔다 — 그림(2D) 보기는 뺐다 (2026-11-21 사용자 지시).
    「전체 행사 공간 / 선택한 체험 자세히」 전환도 뺐다 (2026-11-21 사용자 지시). */
export function EventPreview({ input, lang, activeKey, compact = false }: {
  input: QuoteInput;
  lang: Lang;
  activeKey: ServiceKey | null;
  compact?: boolean;
}) {
  const normalized = sanitizeInput(input);
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;

  return <section data-testid="event-preview" data-active-service={activeKey ?? ''} data-view="overview"
    aria-label={L('우리 행사 전체 미리보기', 'Your whole event preview')} className={cn('min-w-0 space-y-3', compact && 'lg:flex lg:h-full lg:flex-col')}>
    {/* 머리 → 3D 미리보기. 옆의 체험 카드와 같은 틀이라 머리 줄 높이(min-h-14)와 안쪽 여백을 그쪽과 똑같이 둔다. */}
    <div className={cn('overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_50px_-30px_rgba(15,23,42,0.18)]', compact && 'lg:flex lg:flex-1 lg:flex-col')}>
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
        <h2 className="flex items-center gap-2.5 text-sm font-semibold text-slate-800"><span aria-hidden="true" className="size-2 rounded-full bg-teal-500 ring-4 ring-teal-50" />{L('우리 행사의 모습', 'Picture your event')}</h2>
      </div>

      {/* 카드가 옆 열 높이만큼 늘어나면 3D 화면이 그만큼 늘어난다. 범례는 Quote3D 안에 있다 */}
      <div className="relative flex flex-1 flex-col">
        <Quote3D input={normalized} lang={lang} className="flex-1" />
      </div>
    </div>
  </section>;
}
