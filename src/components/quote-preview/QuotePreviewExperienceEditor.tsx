'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { OPTION_TEXT, SERVICE_ORDER, SERVICE_TEXT, SPACE, type BoothBuild, type Lang, type ServiceKey } from '@/lib/quote/catalog';
import { boothPrice, type QuoteInput, type QuoteResult, type SpaceOptions } from '@/lib/quote/engine';
import { optionInfo } from '@/components/quote-studio/option-info';
import { cn } from '@/lib/utils';
import { QUOTE_COPY } from '@/components/quote-studio/copy';
import { QuoteOptions, type QuoteOptionsSetter } from '@/components/quote-studio/QuoteOptions';
import { Field, PriceTag, type Price } from '@/components/quote-studio/QuoteControls';
import { SpaceAreaInput } from '@/components/quote-studio/SpaceAreaInput';
import { DemoModal } from '@/components/demo/DemoModal';
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
const money = (value: number, lang: Lang) => lang === 'ko'
  ? `${value.toLocaleString('ko-KR')}원`
  : `KRW ${value.toLocaleString('en-US')}`;
const renderExperienceIllustration = (slug: string, label: string) => <ExperienceIllustration slug={slug} label={label} />;

/** Step three only. The shared quote flow owns all selection, pricing and navigation state. */
export function QuotePreviewExperienceEditor({
  input, lang, activeKey, onActiveKeyChange, onToggleItem, onOptionsChange, onPerfumeSpaceChange, kioskExperiences, quote, onOptionsOpenChange,
}: QuotePreviewExperienceEditorProps) {
  const ko = lang === 'ko';
  const c = QUOTE_COPY[lang];
  const [optionsKey, setOptionsKey] = useState<ServiceKey | null>(null);
  const [hasOpenedOptions, setHasOpenedOptions] = useState(false);
  const [demoSlug, setDemoSlug] = useState<string | null>(null);
  const demoTrigger = useRef<HTMLElement | null>(null);
  const openExperienceDemo = useCallback((slug: string) => {
    demoTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDemoSlug(slug);
  }, []);
  const closeExperienceDemo = useCallback(() => {
    setDemoSlug(null);
    requestAnimationFrame(() => {
      if (demoTrigger.current?.isConnected) demoTrigger.current.focus({ preventScroll: true });
    });
  }, []);
  const closeOptions = useCallback(() => setOptionsKey(null), []);
  const optionsOpen = optionsKey !== null && input.items.some((item) => item.key === optionsKey);
  useEffect(() => {
    onOptionsOpenChange?.(optionsOpen);
    return () => onOptionsOpenChange?.(false);
  }, [optionsOpen, onOptionsOpenChange]);
  const openOptions = (key: ServiceKey | null) => {
    if (!key) return;
    onActiveKeyChange(key);
    setOptionsKey(key);
    setHasOpenedOptions(true);
  };
  const selected = SERVICE_ORDER.filter((key) => input.items.some((item) => item.key === key));
  const visibleKey = activeKey && selected.includes(activeKey) ? activeKey : selected[0] ?? null;
  const space = input.items.find((item) => item.key === 'spatialDesign');
  const spaceAmount = quote.lines.filter((line) => line.service === 'spatialDesign' && !line.tbd).reduce((sum, line) => sum + line.amount, 0);
  // '~부터' 금액: 한국어는 금액 뒤에 '부터', 영어는 금액 앞에 'from'
  const from = (amount: number): Price => (ko ? { amount, after: '부터' } : { amount, per: 'from' });
  const perfumeSpaces: { value: SpaceOptions['size'] | null; label: string; hint: string; price: Price }[] = [
    { value: null, label: ko ? '준비된 공간 이용' : 'Existing venue', hint: ko ? '향수 체험만 진행해요' : 'Perfume experience only', price: { free: ko ? '공간 비용 없음' : 'No space design fee' } },
    { value: 'booth3x3', label: ko ? '3 × 3 m 부스' : '3 × 3 m booth', hint: ko ? '약 9㎡' : 'About 9 m²', price: from(SPACE.booth3x3) },
    { value: 'booth6x3', label: ko ? '6 × 3 m 부스' : '6 × 3 m booth', hint: ko ? '약 18㎡' : 'About 18 m²', price: from(SPACE.booth6x3) },
    { value: 'large', label: ko ? '맞춤 공간' : 'Custom space', hint: ko ? '행사장에 맞춰 만들어요' : 'Designed for your venue', price: from(SPACE.perPyeong * 10) },
  ];


  return <>
    {/* 두 열(미리보기 | 체험 카드)은 본문 폭이 768px 이상일 때만 — 오른쪽 「지금까지 고른 견적」 칸이
        함께 있어 창이 넓어도 본문은 좁을 수 있다. 좁으면 미리보기 아래에 카드를 둔다. */}
    <div className="@container">
    <div inert={!!demoSlug} className="grid min-w-0 items-start gap-7 @3xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @3xl:items-stretch @3xl:gap-8" data-testid="quote-preview-experience-editor">
      <div tabIndex={-1} aria-label={ko ? '고른 체험 미리보기' : 'Selected experience preview'} data-preview-column
        className="h-[270px] min-w-0 scroll-mt-28 space-y-4 overflow-y-auto overscroll-contain rounded-[28px] outline-none lg:h-auto lg:overflow-visible lg:[&_[data-testid=preview-canvas]]:h-[220px]" data-lenis-prevent>
        <EventPreview input={input} lang={lang} activeKey={visibleKey} onActiveKeyChange={onActiveKeyChange} compact />

      </div>

      {/* 왼쪽 「우리 행사의 모습」과 같은 틀: 머리 → 그림(체험 카드) → 설명(예상 합계).
          두 카드는 위아래 끝이 맞도록 격자 행 높이만큼 늘어난다. */}
      <div className="min-w-0">
        <section aria-labelledby="preview-service-choice-title" className="@container/cards flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_50px_-30px_rgba(15,23,42,0.18)]">
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
            <h2 id="preview-service-choice-title" className="flex items-center gap-2.5 text-sm font-semibold text-slate-800"><span aria-hidden="true" className="size-2 rounded-full bg-teal-500 ring-4 ring-teal-50" />{ko ? '어떤 체험을 함께할까요?' : 'What would you like to include?'}</h2>
            <span className="text-[11px] text-slate-500">{ko ? '카드를 눌러 옵션을 골라요' : 'Tap a card to choose options'}</span>
          </div>
          {/* 데스크톱은 3단계 높이를 1·2단계와 맞추려고 카드를 낮게 — 칸이 넓으면 3열 2줄로 둔다. */}
          <div data-options-card-grid className="grid flex-1 auto-rows-fr grid-cols-2 gap-2.5 px-4 pb-4 sm:px-5 @[22rem]/cards:grid-cols-3">
            {SERVICE_ORDER.map((key) => {
              const included = selected.includes(key);
              return <div key={key} className={cn('group relative min-w-0 rounded-2xl transition-shadow motion-reduce:transition-none', included && 'ring-2 ring-teal-500 ring-offset-2')}>
                <button type="button" id={`preview-trigger-${key}`} data-testid={`quote-${included ? 'edit' : 'add'}-${key}`}
                  aria-label={ko ? `${SERVICE_TEXT[key].name.ko} ${included ? '옵션 보기' : c.add}` : included ? `${SERVICE_TEXT[key].name.en} options` : `Add ${SERVICE_TEXT[key].name.en}`}
                  aria-pressed={included} aria-haspopup="dialog" aria-expanded={optionsOpen && optionsKey === key} aria-controls={optionsOpen && optionsKey === key ? 'preview-options-popover' : undefined}
                  onClick={() => { if (optionsOpen && optionsKey === key) { closeOptions(); return; } if (!included) onToggleItem(key); openOptions(key); }}
                  className={cn('relative flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl border bg-[#f5f2e9] text-left text-slate-800 transition-colors motion-reduce:transition-none', included ? 'border-teal-300 bg-teal-50/40' : 'border-slate-200/70 hover:border-teal-300', focus)}>
                  <ServiceThumbnail service={key} className="!h-[112px] w-full sm:!h-[128px] lg:!h-[76px] @[22rem]/cards:lg:!h-[88px] motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]" />
                  <span data-options-anchor className="relative flex w-full items-center justify-between gap-1 bg-white/80 px-3 py-2.5 text-[12px] font-semibold leading-snug text-balance [word-break:keep-all]">{SERVICE_TEXT[key].name[lang]}<SlidersHorizontal size={12} className="shrink-0 text-teal-600" aria-hidden="true" /></span>
                  {/* 카드 위쪽 표식은 모두 같은 줄(top-2 · 높이 8)에 둔다 — 왼쪽 「담았어요」, 오른쪽 + / 휴지통 */}
                  {!included && <span className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full border border-white bg-white/85 text-teal-700" aria-hidden="true"><Plus size={15} /></span>}
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

        {hasOpenedOptions && <QuoteOptionsPopover open={optionsOpen} service={optionsKey} lang={lang} total={quote.total} supply={quote.supply} suspended={!!demoSlug}
          onClose={closeOptions} onRemove={() => { if (optionsKey) { onToggleItem(optionsKey); closeOptions(); } }}>
          {input.items.map((item) => <div key={item.key} id={`preview-options-${item.key}`} data-testid={`quote-options-${item.key}`} hidden={optionsKey !== item.key} inert={optionsKey !== item.key} className={optionsKey === item.key ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            <QuoteOptions item={item} schedule={input} lang={lang} c={c} kioskExperiences={kioskExperiences} setOptions={onOptionsChange} renderExperienceIllustration={renderExperienceIllustration} enablePhotoBoothTemplates enableKioskAssignments allowKioskSubscription={false} paged flowActive={optionsOpen && optionsKey === item.key} onOpenPhotoDemo={openExperienceDemo} onOpenKioskDemo={openExperienceDemo}
              leadingPage={item.key === 'acscent' ? [{ id: 'space', label: ko ? '부스 공간' : 'Booth space', content: <fieldset className="min-w-0" data-testid="perfume-space-selector">
                <Field label={ko ? '조향 부스는 어떻게 준비할까요?' : 'Choose your perfume space'} info={ko ? '부스 가격은 부가세 별도예요. 디자인·기본 조명·설치·철수가 포함되며, 포토존과 추가 조명은 별도예요.' : 'Booth prices exclude VAT and include design, basic lighting, installation and teardown. Photo zones and custom lighting cost extra.'}>
                  <div role="group" aria-label={ko ? '향수 체험 공간 크기' : 'Perfume experience space size'} className="grid grid-cols-2 gap-2">
                    {perfumeSpaces.map((choice) => {
                      const checked = (space?.options.size ?? null) === choice.value;
                      return <button key={choice.value ?? 'none'} type="button" aria-pressed={checked} data-testid={`perfume-space-${choice.value ?? 'none'}`}
                        onClick={() => onPerfumeSpaceChange(choice.value)}
                        className={cn('relative min-h-[76px] min-w-0 rounded-xl border px-3 py-2 text-left transition-colors motion-reduce:transition-none', checked ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300', focus)}>
                        <span className="block pr-3 text-xs font-semibold leading-relaxed text-slate-800 [word-break:keep-all]">{choice.label}</span>
                        {checked && <Check size={12} className="absolute top-2.5 right-2 text-teal-600" aria-hidden="true" />}
                        <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">{choice.hint}</span>
                        <PriceTag className="mt-1.5" price={choice.price} />
                      </button>;
                    })}
                  </div>
                </Field>
                {/* 3×3·6×3 부스는 구조를 고른다 — 재사용하는 조립식 천 부스(기본) 또는 행사마다 짓는 나무 가벽 */}
                {space && space.options.size !== 'large' && <div className="mt-3" data-testid="perfume-space-build">
                  <Field label={ko ? '부스는 어떻게 만들까요?' : 'How should the booth be built?'}>
                    <div role="group" aria-label={ko ? '부스 구조' : 'Booth build'} className="grid grid-cols-2 gap-2">
                      {(['fabric', 'wood'] as const satisfies readonly BoothBuild[]).map((build) => {
                        const size = space.options.size as 'booth3x3' | 'booth6x3';
                        const checked = (space.options.build ?? 'fabric') === build;
                        return <button key={build} type="button" aria-pressed={checked} data-testid={`perfume-build-${build}`} title={optionInfo(build, lang)}
                          onClick={() => onOptionsChange('spatialDesign', { build })}
                          className={cn('relative min-h-[76px] min-w-0 rounded-xl border px-3 py-2 text-left transition-colors motion-reduce:transition-none', checked ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300', focus)}>
                          <span className="block pr-3 text-xs font-semibold leading-relaxed text-slate-800 [word-break:keep-all]">{OPTION_TEXT.boothBuild[build][lang]}</span>
                          {checked && <Check size={12} className="absolute top-2.5 right-2 text-teal-600" aria-hidden="true" />}
                          <span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500 [word-break:keep-all]">{build === 'fabric'
                            ? (ko ? '프레임을 다시 써서 빠르고 깔끔해요' : 'Reusable frame, quick and clean')
                            : (ko ? '선반·특별한 모양, 행사 후 철거' : 'Shelves & custom shapes, removed after')}</span>
                          <PriceTag className="mt-1.5" price={{ amount: boothPrice(size, build) }} />
                        </button>;
                      })}
                    </div>
                  </Field>
                </div>}
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500" data-testid="perfume-space-price-note" aria-live="polite">
                  {!space
                    ? (ko ? '준비된 공간에서 진행해요. 별도 공간 제작비가 없어요.' : 'Use your existing venue with no space design fee.')
                    : space.options.size === 'large'
                      ? (ko ? `공간 예상 제작비 ${money(spaceAmount, lang)}(부가세 별도)가 합계에 포함돼요. 실제 금액은 현장 확인 후 확정해요.` : `Estimated space design: ${money(spaceAmount, lang)}, excl. VAT, included. Final price follows a site survey.`)
                      : (ko ? `공간 제작비 ${money(spaceAmount, lang)}(부가세 별도)가 합계에 반영돼요.` : `Space design: ${money(spaceAmount, lang)} excl. VAT, included in your total.`)}
                </p>
              </fieldset> }, ...(space?.options.size === 'large' ? [{ id: 'space-area', label: ko ? '공간 넓이' : 'Space area', content: <SpaceAreaInput id="perfume-space-pyeong" pyeong={space.options.pyeong} areaUnit={space.options.areaUnit} lang={lang} onChange={(patch) => onOptionsChange('spatialDesign', patch)} hint={ko ? '평당 120만원부터 예상 합계에 반영해요. 실제 금액은 현장 확인 후 확정해요.' : 'From KRW 1.2M per pyeong, included in this estimate. Final price follows a site survey.'} /> }] : [])] : undefined} />
          </div>)}
        </QuoteOptionsPopover>}

      </div>
    </div>
    </div>
    {demoSlug && <DemoModal slug={demoSlug} onClose={closeExperienceDemo} returnLabel={ko ? '옵션 선택으로 돌아가기' : 'Back to quote options'} />}
  </>;
}
