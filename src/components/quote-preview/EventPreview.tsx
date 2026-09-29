'use client';

import { useState } from 'react';
import { Camera, FlaskConical, Layers3, Monitor, MoveUpRight, ScanFace, Sparkles } from 'lucide-react';
import { PERFUME, SERVICE_ORDER, SERVICE_TEXT, type Lang, type ServiceKey } from '@/lib/quote/catalog';
import { sanitizeInput, type QuoteInput, type QuoteItem } from '@/lib/quote/engine';
import { formatSpaceArea } from '@/lib/quote/space-area';
import { perfumeRackCount } from '@/lib/quote-preview/perfume-furniture';
import { cn } from '@/lib/utils';
import { EventScene } from './EventScene';
import { ServicePreview } from './ServicePreview';

const icons = { acscent: FlaskConical, photoBooth: Camera, rental: Monitor, spatialDesign: Layers3, mediaArt: ScanFace, custom: Sparkles };

function configuration(item: QuoteItem, lang: Lang): string {
  const ko = lang === 'ko';
  switch (item.key) {
    case 'acscent': return ko ? `조향 ${PERFUME.includedTeams + item.options.extraTeams}팀 · 조향대 ${perfumeRackCount(item.options.guests)}개` : `${PERFUME.includedTeams + item.options.extraTeams} perfumer team${item.options.extraTeams ? 's' : ''} · ${perfumeRackCount(item.options.guests)} scent racks`;
    case 'photoBooth': return ko ? `${item.options.booths}대` : `${item.options.booths} booth${item.options.booths === 1 ? '' : 's'}`;
    case 'rental': return ko ? `${item.options.kiosks}대` : `${item.options.kiosks} kiosk${item.options.kiosks === 1 ? '' : 's'}`;
    case 'spatialDesign': return item.options.size === 'large' ? `${ko ? '맞춤' : 'Custom'} · ${formatSpaceArea(item.options, lang)}`
      : `${item.options.size === 'booth6x3' ? '6 × 3 m' : '3 × 3 m'}${item.options.build === 'wood' ? (ko ? ' · 나무 가벽' : ' · wooden walls') : ''}`;
    case 'mediaArt': return ko ? `${item.options.sensorType === 'depth' ? '3D' : '이미지'} 카메라 ${1 + item.options.extraSensors}세트` : `${1 + item.options.extraSensors} ${item.options.sensorType === 'depth' ? '3D' : 'image'} camera set(s)`;
    case 'custom': return '';
  }
}

/** One shared event overview. Focus changes the emphasis, never the selected inventory. */
export function EventPreview({ input, lang, activeKey, onActiveKeyChange, compact = false }: {
  input: QuoteInput;
  lang: Lang;
  activeKey: ServiceKey | null;
  onActiveKeyChange: (key: ServiceKey | null) => void;
  compact?: boolean;
}) {
  const [view, setView] = useState<{ service: ServiceKey | null; detail: boolean }>({ service: activeKey, detail: false });
  if (view.service !== activeKey) setView({ service: activeKey, detail: false });
  const setDetailKey = (key: ServiceKey | null) => setView({ service: key ?? activeKey, detail: key !== null });
  const normalized = sanitizeInput(input);
  const physical = SERVICE_ORDER.flatMap((key) => {
    const item = normalized.items.find((entry) => entry.key === key);
    return item && key !== 'custom' ? [item] : [];
  });
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const detail = activeKey !== null && view.service === activeKey && view.detail;
  const space = normalized.items.find((item) => item.key === 'spatialDesign');
  const hasCustom = normalized.items.some((item) => item.key === 'custom');


  return <section data-testid="event-preview" data-active-service={activeKey ?? ''} data-view={detail ? 'detail' : 'overview'}
    aria-label={L('우리 행사 전체 미리보기', 'Your whole event preview')} className={cn('min-w-0 space-y-3', compact && !detail && 'lg:flex lg:h-full lg:flex-col')}>
    {/* 머리 → 그림 → 설명. 3단계에서는 옆의 체험 카드와 같은 틀이라
        머리 줄 높이(min-h-14 — 전환 버튼이 있어도 없어도 같다)와 안쪽 여백을 그쪽과 똑같이 둔다. */}
    <div className={cn('overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_50px_-30px_rgba(15,23,42,0.18)]', compact && !detail && 'lg:flex lg:flex-1 lg:flex-col')}>
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
        <h2 className="flex items-center gap-2.5 text-sm font-semibold text-slate-800"><span aria-hidden="true" className="size-2 rounded-full bg-teal-500 ring-4 ring-teal-50" />{L('우리 행사의 모습', 'Picture your event')}</h2>
        {activeKey && <div role="group" aria-label={L('미리보기 범위', 'Preview scope')} className="flex gap-1 rounded-xl bg-slate-100/80 p-0.5">
          <button type="button" data-testid="event-preview-overview" aria-pressed={!detail} onClick={() => setDetailKey(null)}
            className={cn('flex min-h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] px-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none', !detail ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:bg-white/60')}>
            <Layers3 size={12} aria-hidden="true" />{L('전체 행사 공간', 'Whole event')}
          </button>
          <button type="button" data-testid="event-preview-detail" aria-pressed={detail} onClick={() => setDetailKey(activeKey)} disabled={!activeKey}
            className={cn('flex min-h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] px-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none', detail ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:bg-white/60')}>
            <MoveUpRight size={12} aria-hidden="true" />{L('선택한 체험 자세히', 'Experience details')}
          </button>
        </div>}
      </div>

      {!detail && <>
        {/* 카드가 옆 열 높이만큼 늘어나면 남는 높이는 그림 바탕색으로 채운다 */}
        <div className="flex flex-1 flex-col justify-center bg-[#f7f5f0]">
          <EventScene input={normalized} lang={lang} activeKey={activeKey} onActiveKeyChange={onActiveKeyChange} />
        </div>
        <div className={cn('space-y-3 border-t border-slate-100 px-4 py-4 sm:px-5', compact && 'hidden lg:block')}>
          {physical.length > 0 && <div role="group" aria-label={L('공간에서 살펴볼 체험', 'Focus an experience in your space')} className="flex flex-wrap gap-2">
            {physical.map((item) => {
              const Icon = icons[item.key];
              const focused = item.key === activeKey;
              return <button key={item.key} type="button" data-testid={`event-focus-${item.key}`} aria-pressed={focused}
                onClick={() => { setDetailKey(null); onActiveKeyChange(item.key); }}
                className={cn('inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none', focused ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-slate-200/80 bg-white text-slate-600 hover:border-teal-200')}>
                <Icon size={13} className="shrink-0" aria-hidden="true" /><span>{SERVICE_TEXT[item.key].name[lang]}<span className="ml-1.5 opacity-70">{configuration(item, lang)}</span></span>
              </button>;
            })}
          </div>}
          <p className="text-[11px] leading-relaxed text-slate-500" data-testid="event-layout-note">
            {!physical.length && hasCustom ? L('행사를 위한 맞춤 AI 콘텐츠의 화면 예시예요. 태블릿 대여는 포함되지 않아요.', 'A screen concept for your event AI content. Tablet rental is not included.') : !physical.length ? L('체험을 고르면 이 공간에 하나씩 나타나요.', 'Selected experiences will appear in this space.') : space ? L(`${space.options.size === 'large' ? '맞춤 공간' : `${space.options.size === 'booth6x3' ? '6 × 3 m' : '3 × 3 m'} ${space.options.build === 'wood' ? '나무 가벽 ' : ''}부스`}를 포함한 행사 구성 예시예요. 실제 배치는 공간과 동선에 맞춰 정해요.`, `An event illustration including ${space.options.size === 'large' ? 'a custom space' : `a ${space.options.size === 'booth6x3' ? '6 × 3 m' : '3 × 3 m'}${space.options.build === 'wood' ? ' wooden-wall' : ''} booth`}. The final layout is planned for your venue and visitor paths.`)
              : L('고른 체험을 준비된 행사장에 함께 배치한 예시예요. 실제 배치는 공간과 동선에 맞춰 정해요.', 'An illustration of your experiences together in an existing venue. The final layout is planned for your venue and visitor paths.')}
          </p>
          {hasCustom && <button type="button" data-testid="event-custom-details" onClick={() => { onActiveKeyChange('custom'); setDetailKey('custom'); }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg text-left text-[11px] font-medium text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            <Sparkles size={13} aria-hidden="true" className="shrink-0" />{L('태블릿의 행사 맞춤 AI 콘텐츠 자세히', 'Explore the event AI content on the tablet')}<MoveUpRight size={12} aria-hidden="true" className="shrink-0" />
          </button>}
        </div>
      </>}
    </div>
    {detail && <ServicePreview input={input} lang={lang} activeKey={activeKey} />}
  </section>;
}
