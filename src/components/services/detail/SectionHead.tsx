import type { ReactNode } from 'react';
import { Reveal } from '@/components/fx';
import { Title } from '@/components/site/Title';
import { SectionLabel } from '@/components/site/ui';
import { cn } from '@/lib/utils';

/* 구역 머리 — 번호 라벨 · 영어 큰 제목 · 작은 한국어 · (오른쪽) 짧은 설명이나 링크 */
export function SectionHead({ no, label, en, ko, aside, className, id }: { no?: string; label: string; en: ReactNode[]; ko?: string; aside?: ReactNode; className?: string; id?: string }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-12 gap-y-6', className)}>
      <div>
        <Reveal><SectionLabel no={no}>{label}</SectionLabel></Reveal>
        <Title id={id} en={en} ko={ko} className="mt-6" />
      </div>
      {aside && <Reveal delay={120} className="max-w-md text-[1.05rem] leading-relaxed text-paper/60 lg:text-right">{aside}</Reveal>}
    </div>
  );
}
