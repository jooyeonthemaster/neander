'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, MessageCircle, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { SERVICE_ORDER, SERVICE_TEXT, isConsultationService, type Lang, type ServiceKey } from '@/lib/quote/catalog';
import { type QuoteInput, type QuoteResult, type SpaceOptions } from '@/lib/quote/engine';
import { cn } from '@/lib/utils';
import { QUOTE_COPY } from '@/components/quote-studio/copy';
import { QuoteOptions, type QuoteOptionsSetter } from '@/components/quote-studio/QuoteOptions';
import { ConsultationNotice } from '@/components/quote-studio/ConsultationNotice';
import { EventPreview } from './EventPreview';
import { QuoteOptionsPopover } from './QuoteOptionsPopover';
import { ExperienceIllustration, ServiceThumbnail } from './illustrations/ServiceIllustration';

export interface QuotePreviewExperienceEditorProps {
  input: QuoteInput;
  lang: Lang;
  activeKey: ServiceKey | null;
  onActiveKeyChange: (key: ServiceKey | null) => void;
  onToggleItem: (key: ServiceKey) => void;
  onOptionsChange: QuoteOptionsSetter;
  onPerfumeSpaceChange: (size: SpaceOptions['size'] | null) => void;
  kioskExperiences: { value: string; label: string }[];
  quote: QuoteResult;
  onOptionsOpenChange?: (open: boolean) => void;
}

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600';
const renderExperienceIllustration = (slug: string, label: string) => <ExperienceIllustration slug={slug} label={label} />;

/** Step three only. The shared quote flow owns all selection, pricing and navigation state. */
export function QuotePreviewExperienceEditor({
  input, lang, activeKey, onActiveKeyChange, onToggleItem, onOptionsChange, kioskExperiences, quote, onOptionsOpenChange,
}: QuotePreviewExperienceEditorProps) {
  const ko = lang === 'ko';
  const c = QUOTE_COPY[lang];
  const [optionsKey, setOptionsKey] = useState<ServiceKey | null>(null);
  const [hasOpenedOptions, setHasOpenedOptions] = useState(false);
  const [consultationKey, setConsultationKey] = useState<ServiceKey | null>(activeKey && isConsultationService(activeKey) ? activeKey : null);
  const closeOptions = useCallback(() => setOptionsKey(null), []);
  const optionsOpen = optionsKey !== null && input.items.some((item) => item.key === optionsKey);
  useEffect(() => {
    onOptionsOpenChange?.(optionsOpen);
    return () => onOptionsOpenChange?.(false);
  }, [optionsOpen, onOptionsOpenChange]);
  const openOptions = (key: ServiceKey | null) => {
    if (!key) return;
    setConsultationKey(null);
    onActiveKeyChange(key);
    setOptionsKey(key);
    setHasOpenedOptions(true);
  };
  const automaticInput = { ...input, items: input.items.filter((item) => !isConsultationService(item.key)) };
  const selected = SERVICE_ORDER.filter((key) => automaticInput.items.some((item) => item.key === key));
  const visibleKey = activeKey && selected.includes(activeKey) ? activeKey : selected[0] ?? null;


  return <>
    {/* 두 열(미리보기 | 체험 카드)은 본문 폭이 768px 이상일 때만 — 오른쪽 「지금까지 고른 견적」 칸이
        함께 있어 창이 넓어도 본문은 좁을 수 있다. 좁으면 미리보기 아래에 카드를 둔다. */}
    <div className="@container">
    <div className="grid min-w-0 items-start gap-7 @3xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @3xl:items-stretch @3xl:gap-8" data-testid="quote-preview-experience-editor">
      <div tabIndex={-1} aria-label={ko ? '고른 체험 미리보기' : 'Selected experience preview'} data-preview-column
        className="h-[270px] min-w-0 scroll-mt-28 space-y-4 overflow-y-auto overscroll-contain rounded-[28px] outline-none lg:h-auto lg:overflow-visible lg:[&_[data-testid=preview-canvas]]:h-[220px]" data-lenis-prevent>
        <EventPreview input={automaticInput} lang={lang} activeKey={visibleKey} onActiveKeyChange={onActiveKeyChange} compact />

      </div>

      {/* 왼쪽 「우리 행사의 모습」과 같은 틀: 머리 → 그림(체험 카드) → 설명(예상 합계).
          두 카드는 위아래 끝이 맞도록 격자 행 높이만큼 늘어난다. */}
      <div className="min-w-0">
        <section aria-labelledby="preview-service-choice-title" className="@container/cards flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_50px_-30px_rgba(15,23,42,0.18)]">
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
            <h2 id="preview-service-choice-title" className="flex items-center gap-2.5 text-sm font-semibold text-slate-800"><span aria-hidden="true" className="size-2 rounded-full bg-teal-500 ring-4 ring-teal-50" />{ko ? '어떤 체험을 함께할까요?' : 'What would you like to include?'}</h2>
            <span className="text-[11px] text-slate-500">{ko ? '체험 견적 · 맞춤 서비스 별도 문의' : 'Experience estimates · custom services by inquiry'}</span>
          </div>
          {/* 데스크톱은 3단계 높이를 1·2단계와 맞추려고 카드를 낮게 — 칸이 넓으면 3열 2줄로 둔다. */}
          <div data-options-card-grid className="grid flex-1 auto-rows-fr grid-cols-2 gap-2.5 px-4 pb-4 sm:px-5 @[22rem]/cards:grid-cols-3">
            {SERVICE_ORDER.map((key) => {
              const consultation = isConsultationService(key);
              const included = selected.includes(key);
              return <div key={key} className={cn('group relative min-w-0 rounded-2xl transition-shadow motion-reduce:transition-none', included && 'ring-2 ring-teal-500 ring-offset-2')}>
                <button type="button" id={`preview-trigger-${key}`} data-testid={`quote-${included ? 'edit' : 'add'}-${key}`}
                  aria-label={consultation ? (ko ? `${SERVICE_TEXT[key].name.ko} 별도 문의 안내` : `${SERVICE_TEXT[key].name.en} inquiry information`) : ko ? `${SERVICE_TEXT[key].name.ko} ${included ? '옵션 보기' : c.add}` : included ? `${SERVICE_TEXT[key].name.en} options` : `Add ${SERVICE_TEXT[key].name.en}`}
                  aria-pressed={consultation ? undefined : included} aria-haspopup={consultation ? undefined : 'dialog'} aria-expanded={consultation ? consultationKey === key : optionsOpen && optionsKey === key} aria-controls={consultation ? consultationKey === key ? 'quote-consultation-info' : undefined : optionsOpen && optionsKey === key ? 'preview-options-popover' : undefined}
                  onClick={() => { if (consultation) { closeOptions(); setConsultationKey(key); return; } if (optionsOpen && optionsKey === key) { closeOptions(); return; } if (!included) onToggleItem(key); openOptions(key); }}
                  className={cn('relative flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl border bg-[#f5f2e9] text-left text-slate-800 transition-colors motion-reduce:transition-none', included ? 'border-teal-300 bg-teal-50/40' : 'border-slate-200/70 hover:border-teal-300', focus)}>
                  <ServiceThumbnail service={key} className="!h-[112px] w-full sm:!h-[128px] lg:!h-[76px] @[22rem]/cards:lg:!h-[88px] motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]" />
                  <span data-options-anchor className="relative flex w-full items-center justify-between gap-1 bg-white/80 px-3 py-2.5 text-[12px] font-semibold leading-snug text-balance [word-break:keep-all]">{SERVICE_TEXT[key].name[lang]}{consultation ? <span className="shrink-0 text-[10px] font-medium text-teal-700">{ko ? '별도 문의' : 'Inquire'}</span> : <SlidersHorizontal size={12} className="shrink-0 text-teal-600" aria-hidden="true" />}</span>
                  {/* 카드 위쪽 표식은 모두 같은 줄(top-2 · 높이 8)에 둔다 — 왼쪽 「담았어요」, 오른쪽 + / 휴지통 */}
                  {!included && <span className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full border border-white bg-white/85 text-teal-700" aria-hidden="true">{consultation ? <MessageCircle size={15} /> : <Plus size={15} />}</span>}
                  {included && <span className="absolute top-2 left-2 flex h-8 items-center" aria-hidden="true"><span className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-2 py-1 text-[9px] font-bold text-white"><Check size={10} /><span className="@max-[26rem]/cards:lg:hidden">{ko ? '담았어요' : 'Added'}</span></span></span>}
                </button>
                {/* 터치 화면: 휴지통은 44px 영역으로 누르고(보이는 크기는 그대로), 그 둘레는 눌러도 카드가 열리지 않는 빈 띠로 둔다 */}
                {included && <span aria-hidden="true" data-testid={`quote-remove-guard-${key}`} className="absolute top-0 right-0 hidden size-14 rounded-tr-2xl touch:block" />}
                {included && <button type="button" data-testid={`quote-remove-${key}`} onClick={() => onToggleItem(key)}
                  aria-label={ko ? `${SERVICE_TEXT[key].name.ko} ${c.remove}` : `Remove ${SERVICE_TEXT[key].name.en}`}
                  className={cn('group/remove absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full text-slate-500 hover:text-slate-900 touch:top-0.5 touch:right-0.5 touch:size-11', focus)}>
                  <span className="flex size-8 items-center justify-center rounded-full border border-white bg-white/90 transition-colors group-hover/remove:bg-white motion-reduce:transition-none"><Trash2 size={13} aria-hidden="true" /></span>
                </button>}
              </div>;
            })}
          </div>

        </section>

        {consultationKey && <div id="quote-consultation-info" className="mt-4"><ConsultationNotice service={consultationKey} lang={lang} /></div>}

        {hasOpenedOptions && <QuoteOptionsPopover open={optionsOpen} service={optionsKey} lang={lang} total={quote.total} supply={quote.supply}
          onClose={closeOptions} onRemove={() => { if (optionsKey) { onToggleItem(optionsKey); closeOptions(); } }}>
          {automaticInput.items.map((item) => <div key={item.key} id={`preview-options-${item.key}`} data-testid={`quote-options-${item.key}`} hidden={optionsKey !== item.key} inert={optionsKey !== item.key} className={optionsKey === item.key ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            <QuoteOptions item={item} schedule={input} lang={lang} c={c} kioskExperiences={kioskExperiences} setOptions={onOptionsChange} renderExperienceIllustration={renderExperienceIllustration} enablePhotoBoothTemplates enableKioskAssignments allowKioskSubscription={false} paged flowActive={optionsOpen && optionsKey === item.key}
              />
          </div>)}
        </QuoteOptionsPopover>}

      </div>
    </div>
    </div>
  </>;
}
