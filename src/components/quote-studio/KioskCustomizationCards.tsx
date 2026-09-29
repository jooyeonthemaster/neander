'use client';

import { Check, Monitor, Palette, SlidersHorizontal, Sparkles } from 'lucide-react';
import { CUSTOM_DEV, CUSTOM_DEV_TEXT, type KioskCustom, type Lang } from '@/lib/quote/catalog';
import { cn } from '@/lib/utils';
import { HoverInfo, PriceTag, type Price } from './QuoteControls';

export function KioskCustomizationCards({ value, lang, onChange, compact = false }: {
  value: KioskCustom;
  lang: Lang;
  onChange: (value: KioskCustom) => void;
  compact?: boolean;
}) {
  const ko = lang === 'ko';
  const choices = [
    { value: 'none' as const, name: ko ? '기존 체험 그대로' : 'Ready-made experience', icon: Monitor, description: ko ? '추가 제작 없이 선택한 체험을 그대로 운영해요.' : 'Use your selected experiences without custom development.' },
    { value: 'brand' as const, name: CUSTOM_DEV_TEXT.kiosk.brand.name[lang], icon: Palette, description: ko ? '시작·결과 화면에 로고, 브랜드 색과 문구를 적용해요.' : 'Add your logo, brand colors and copy to start and result screens.' },
    { value: 'content' as const, name: CUSTOM_DEV_TEXT.kiosk.content.name[lang], icon: SlidersHorizontal, description: ko ? '기존 체험의 질문·선택지·결과와 상품 연결을 바꿔요.' : 'Customize questions, choices, results and product matching in an existing experience.' },
    { value: 'dedicated' as const, name: CUSTOM_DEV_TEXT.kiosk.dedicated.name[lang], icon: Sparkles, description: ko ? '우리 행사만의 새 체험을 기획하고 개발해요. 범위를 정한 뒤 금액을 확정해요.' : 'Create a new experience for your event. The final fee depends on the agreed scope.' },
  ];
  const price = (kind: KioskCustom): Price => kind === 'none' ? { free: ko ? '추가 비용 없음' : 'No extra cost' }
    : { amount: CUSTOM_DEV.kiosk[kind], after: kind === 'dedicated' ? (ko ? '부터' : '+') : undefined };
  return <section data-testid="kiosk-customization-cards" className={compact ? 'space-y-1' : 'space-y-2'}>
    {/* 좁은 화면에서는 설명을 읽어 주기만 한다 — 맨 위에 두어 화면 아래로 삐져나가지 않게 (옵션 창 높이 계산) */}
    {compact && <p className="sr-only" aria-live="polite">{choices.find((choice) => choice.value === value)?.description}</p>}
    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
      <h3 className="text-[11px] font-semibold leading-4 text-slate-800">{ko ? '전체 기기 맞춤 제작' : 'Customize all kiosks'}</h3>
      <p className="text-[10px] leading-4 text-slate-500">{ko ? '1회 제작비 · 부가세 별도' : 'One-time fee · VAT excluded'}</p>
    </div>
    <div role="radiogroup" aria-label={ko ? '키오스크 맞춤 제작' : 'Kiosk customization'} className={cn('grid grid-cols-2 max-[359px]:grid-cols-1', compact ? 'gap-1 sm:grid-cols-4' : 'gap-2')}>
      {choices.map((choice) => {
        const selected = value === choice.value;
        const Icon = choice.icon;
        return <HoverInfo key={choice.value} info={choice.value === 'none' ? choice.description : CUSTOM_DEV_TEXT.kiosk[choice.value].scope[lang]}>
          <button type="button" role="radio" aria-checked={selected} aria-label={choice.name} data-testid={`kiosk-custom-${choice.value}`} onClick={() => onChange(choice.value)}
            onKeyDown={(event) => {
              const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
              if (!direction) return;
              event.preventDefault(); event.stopPropagation();
              const next = choices[(choices.indexOf(choice) + direction + choices.length) % choices.length];
              onChange(next.value);
              event.currentTarget.closest('[role="radiogroup"]')?.querySelector<HTMLButtonElement>(`[data-testid="kiosk-custom-${next.value}"]`)?.focus();
            }} tabIndex={selected ? 0 : -1}
            className={cn('relative flex w-full min-w-0 items-center overflow-hidden rounded-xl border focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-600', compact ? 'h-11 justify-center px-1 text-center sm:h-14' : 'h-[78px] gap-2 pr-2 text-left', selected ? 'border-teal-500 bg-teal-50/40' : 'border-slate-200 bg-white')}>
            {!compact && <span aria-hidden="true" className="flex h-full w-11 shrink-0 items-center justify-center bg-[#f7f5f0] text-teal-700"><Icon size={25} strokeWidth={1.7} /></span>}
            <span className="min-w-0"><span className={cn('block text-[11px] font-semibold leading-[14px] text-slate-800', compact && 'line-clamp-2')}>{choice.name}</span><PriceTag price={price(choice.value)} className={cn('mt-1', compact && 'text-[10px]')} /></span>
            {selected && <Check aria-hidden="true" size={11} className="absolute top-1 left-1 text-teal-700" />}
          </button>
        </HoverInfo>;
      })}
    </div>
    {!compact && <p className="rounded-lg bg-teal-50/70 px-3 py-2 text-[11px] leading-relaxed text-teal-800" aria-live="polite">{choices.find((choice) => choice.value === value)?.description}</p>}
  </section>;
}
