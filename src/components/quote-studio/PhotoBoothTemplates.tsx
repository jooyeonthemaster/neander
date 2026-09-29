'use client';

import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check as CheckIcon, ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, Sparkles } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { CUSTOM_DEV, CUSTOM_DEV_TEXT, PHOTO_BOOTH, type Lang } from '@/lib/quote/catalog';
import type { PhotoBoothOptions } from '@/lib/quote/engine';
import { getPhotoBoothTemplates, PHOTO_BOOTH_TEMPLATES } from '@/lib/quote/photo-booth-templates';
import { cn } from '@/lib/utils';
import { Check, Field, HoverInfo, PriceTag, Stepper, type Price } from './QuoteControls';
import { PhotoBoothTemplateArt } from './PhotoBoothTemplateArt';

const price = (value: number, lang: Lang) => lang === 'ko'
  ? `${(value / 10_000).toLocaleString('ko-KR')}만원` : `KRW ${value.toLocaleString('en-US')}`;

/** Existing demo selections and new style production have separate prices. */
export function PhotoBoothTemplates({ options, lang, onChange, compact = false, section = 'all', onOpenDemo }: {
  options: PhotoBoothOptions; lang: Lang; onChange: (patch: Partial<PhotoBoothOptions>) => void;
  compact?: boolean;
  section?: 'all' | 'templates' | 'custom';
  onOpenDemo?: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [galleryPage, setGalleryPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [customDraft, setCustomDraft] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const gridId = useId();
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const selected = getPhotoBoothTemplates(options.templateSlugs);
  const selectedSlugs = selected.map((template) => template.slug);
  // 고른 순서로 기본 포함 수까지는 무료, 그 뒤는 1종당 추가 요금 (아직 안 고른 것은 지금 고르면 몇 번째가 되는지로 본다)
  const templatePrice = (slug: string): Price =>
    (selectedSlugs.includes(slug) ? selectedSlugs.indexOf(slug) : selected.length) < PHOTO_BOOTH.includedStyles ? {} : { amount: PHOTO_BOOTH.extraStyle };
  const extraCount = options.templateSlugs === undefined ? options.extraStyles : Math.max(0, selected.length - PHOTO_BOOTH.includedStyles);
  const visible = expanded ? PHOTO_BOOTH_TEMPLATES : PHOTO_BOOTH_TEMPLATES.filter((template, index) => index < 4 || selectedSlugs.includes(template.slug));
  const customCount = options.customStyles ?? 0;
  const toggle = (slug: string) => {
    const templateSlugs = selectedSlugs.includes(slug) ? selectedSlugs.filter((value) => value !== slug) : [...selectedSlugs, slug];
    onChange({ templateSlugs, extraStyles: Math.max(0, templateSlugs.length - PHOTO_BOOTH.includedStyles) });
  };
  const openDemo = (slug: string) => {
    if (onOpenDemo) onOpenDemo(slug);
    else router.push(`/services?demo=${slug}`);
  };
  const galleryPages = Math.ceil(PHOTO_BOOTH_TEMPLATES.length / 4);
  const moveGallery = (step: number, focus = false) => {
    setDirection(step > 0 ? 1 : -1);
    setGalleryPage((previous) => Math.min(galleryPages - 1, Math.max(0, previous + step)));
    if (focus) galleryRef.current?.focus({ preventScroll: true });
  };

  if (compact && section === 'templates') {
    const pageTemplates = PHOTO_BOOTH_TEMPLATES.slice(galleryPage * 4, (galleryPage + 1) * 4);
    const setCustomCount = (value: number) => {
      setCustomDraft(null);
      onChange({ customStyles: Math.max(0, Math.min(10, Math.round(Number.isFinite(value) ? value : 0))) });
    };
    return <section data-testid="photo-booth-templates" data-gallery-page={galleryPage + 1} className="space-y-1.5">
      <p className="text-[11px] leading-relaxed text-slate-500">{L(`기존 ${PHOTO_BOOTH.includedStyles}종 포함 · 추가 1종 ${price(PHOTO_BOOTH.extraStyle, lang)} · 부가세 별도`, `${PHOTO_BOOTH.includedStyles} included · ${price(PHOTO_BOOTH.extraStyle, lang)} per extra style · VAT excluded`)}</p>
      {options.templateSlugs === undefined && options.extraStyles > 0 && <p className="text-[10px] leading-relaxed text-amber-700">{L(`저장된 추가 ${options.extraStyles}종은 미정이에요. 직접 고르면 선택 수로 다시 계산해요.`, `${options.extraStyles} saved extra styles are undecided. Choosing templates recalculates the count.`)}</p>}
      <div ref={galleryRef} id={gridId} data-testid="booth-templates-gallery" role="region" aria-roledescription={L('캐러셀', 'carousel')} aria-label={L('사진 스타일 둘러보기', 'Browse photo styles')} tabIndex={0}
        className="overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2" style={{ touchAction: 'pan-y' }}
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))) return;
          const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : event.key === 'Home' ? -galleryPage : event.key === 'End' ? galleryPages - 1 - galleryPage : null;
          if (step === null) return;
          event.preventDefault(); event.stopPropagation(); moveGallery(step, true);
        }}
        onTouchStart={(event) => { const touch = event.touches[0]; touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null; }}
        onTouchCancel={() => { touchStart.current = null; }}
        onTouchEnd={(event) => {
          const start = touchStart.current; const touch = event.changedTouches[0]; touchStart.current = null;
          if (!start || !touch) return;
          const dx = touch.clientX - start.x; const dy = touch.clientY - start.y;
          if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { suppressClickUntil.current = Date.now() + 350; moveGallery(dx < 0 ? 1 : -1); }
        }}
        onClickCapture={(event) => { if (Date.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
      <AnimatePresence initial={false} mode="wait"><motion.div key={galleryPage} initial={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : direction * 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : -direction * 16 }} transition={{ duration: reducedMotion ? 0 : 0.16 }} className="grid min-h-[164px] grid-cols-2 gap-2">
        {pageTemplates.map((template) => {
          const chosen = selectedSlugs.includes(template.slug);
          return <article key={template.slug} className={cn('relative h-[78px] min-w-0 overflow-hidden rounded-xl border bg-white', chosen ? 'border-teal-500 ring-1 ring-teal-500/15' : 'border-slate-200')}>
            <HoverInfo info={template.description[lang]} className="h-full"><button type="button" aria-pressed={chosen} aria-label={template.name[lang]} data-testid={`booth-template-${template.slug}`} onClick={() => toggle(template.slug)}
              className="flex h-full w-full items-center gap-2 pr-2 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-600">
              <span className="relative flex h-full w-14 shrink-0 items-center overflow-hidden bg-[#f7f5f0]">
                <PhotoBoothTemplateArt appearance={template.appearance} className="h-full w-full" />
                {chosen && <span aria-hidden="true" className="absolute left-1 top-1 rounded-full bg-teal-600 p-0.5 text-white"><CheckIcon size={11} /></span>}
              </span>
              {/* 이름은 위, 가격은 아래 왼쪽 — 오른쪽 아래의 짧은 '데모' 링크와 한 줄에 놓여도 겹치지 않는다 */}
              <span className="flex h-full min-w-0 flex-col items-start justify-between py-2">
                <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-slate-800">{template.name[lang]}</span>
                <PriceTag className="text-[10px]" price={templatePrice(template.slug)} />
              </span>
            </button></HoverInfo>
            <button type="button" data-testid={`booth-demo-${template.slug}`} aria-haspopup={onOpenDemo ? 'dialog' : undefined} aria-label={L(`${template.name.ko} 데모 체험`, `Try ${template.name.en} demo`)} onClick={() => openDemo(template.slug)}
              className="absolute bottom-1 right-1 inline-flex min-h-6 items-center gap-0.5 rounded px-1 text-[9px] text-slate-500 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-600">{L('데모', 'Demo')}<ArrowRight size={10} aria-hidden="true" /></button>
          </article>;
        })}

      </motion.div></AnimatePresence></div>
      <div className="flex items-center justify-between gap-3">
        <button type="button" data-testid="booth-templates-previous" aria-label={L('이전 사진 스타일', 'Previous photo styles')} aria-controls={gridId} disabled={galleryPage === 0} onClick={() => moveGallery(-1)} className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 disabled:cursor-default disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-teal-600"><ChevronLeft size={16} aria-hidden="true" /></button>
        <div className="flex min-w-0 flex-1 items-center gap-2"><span data-testid="booth-templates-page" aria-live="polite" aria-atomic="true" className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500">{galleryPage + 1} / {galleryPages}</span>
      <p data-testid="booth-template-selection" aria-live="polite" aria-atomic="true" className="truncate text-[10px] leading-4 text-teal-800">
        {selected.length || customCount > 0 ? L(`기존 ${selected.length}종${extraCount ? ` +${price(extraCount * PHOTO_BOOTH.extraStyle, lang)}` : ' 추가비 없음'}${customCount ? ` · 새 스타일 ${customCount}종 +${price(customCount * CUSTOM_DEV.boothStyle, lang)}` : ''}`, `${selected.length} existing · ${extraCount ? `+${price(extraCount * PHOTO_BOOTH.extraStyle, lang)}` : 'no extra fee'}${customCount ? ` · ${customCount} new +${price(customCount * CUSTOM_DEV.boothStyle, lang)}` : ''}`) : L('미정으로 넘어가도 괜찮아요. 상담할 때 함께 정해요.', 'You can leave styles undecided until consultation.')}
      </p>
      </div>
        <button type="button" data-testid="booth-templates-next" aria-label={L('다음 사진 스타일', 'Next photo styles')} aria-controls={gridId} disabled={galleryPage === galleryPages - 1} onClick={() => moveGallery(1)} className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 disabled:cursor-default disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-teal-600"><ChevronRight size={16} aria-hidden="true" /></button>
      </div>
      <article data-testid="booth-template-custom-style" className={cn('flex min-h-[52px] min-w-0 items-center gap-2 rounded-xl border bg-white px-2.5 py-1', customCount > 0 ? 'border-teal-500 ring-1 ring-teal-500/15' : 'border-slate-200')}>
          <HoverInfo className="min-w-0 flex-1" info={`${CUSTOM_DEV_TEXT.boothStyle.scope[lang]} ${L('기존 스타일과 별도인 1회 제작비 · 부가세 별도 · 시안 3컷, 수정 1회 · 1주 전 확정', 'Separate one-time production fee · VAT excluded · 3 samples, 1 revision · confirm 1 week ahead')}`}>
            <button type="button" id="b-custom-style-enabled" aria-pressed={customCount > 0} onClick={() => setCustomCount(customCount > 0 ? 0 : 1)}
              className="flex min-h-10 w-full items-center gap-2 rounded py-0.5 text-left focus-visible:outline-2 focus-visible:outline-teal-600">
              <Sparkles size={13} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-600" />
              <span className="min-w-0 flex-1"><span className="block text-[11px] font-semibold leading-tight text-slate-800">{L('새 스타일 제작', 'Create a new style')}</span><PriceTag className="mt-1 text-[10px]" price={{ amount: CUSTOM_DEV.boothStyle, per: L('1종당', 'each') }} /></span>
              {customCount > 0 && <CheckIcon size={12} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-600" />}
            </button>
          </HoverInfo>
          <div className="flex h-8 w-[110px] shrink-0 items-center justify-between rounded-lg border border-slate-200 bg-slate-50">
            <button type="button" aria-label={L('새로 만들 스타일 수 줄이기', 'Decrease new styles')} disabled={customCount === 0} onClick={() => setCustomCount(customCount - 1)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-600 disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-teal-600"><Minus size={12} aria-hidden="true" /></button>
            <input id="b-cstyles" aria-label={L('새로 만들 스타일 수', 'Number of new styles')} type="number" inputMode="numeric" min={0} max={10} step={1} value={customDraft ?? customCount}
              onFocus={() => setCustomDraft(String(customCount))}
              onChange={(event) => { const value = event.target.value; setCustomDraft(value); const number = Number(value); if (value !== '' && Number.isFinite(number) && number >= 0 && number <= 10) onChange({ customStyles: Math.round(number) }); }}
              onBlur={() => { if (customDraft !== null) setCustomCount(Number(customDraft || 0)); }}
              onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } }}
              className="h-full w-8 min-w-0 flex-1 bg-transparent text-center text-[11px] font-semibold tabular-nums text-slate-800 outline-none [appearance:textfield] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            <span className="text-[9px] text-slate-400">{L('종', 'styles')}</span>
            <button type="button" aria-label={L('새로 만들 스타일 수 늘리기', 'Increase new styles')} disabled={customCount === 10} onClick={() => setCustomCount(customCount + 1)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-600 disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-teal-600"><Plus size={12} aria-hidden="true" /></button>
          </div>
        </article>
    </section>;
  }

  if (compact && section === 'custom') return <section data-testid="photo-booth-custom-style" aria-label={L('커스텀 사진 스타일 제작', 'Custom photo style production')} className="space-y-3">
    <Check id="b-custom-style-enabled" checked={customCount > 0} onChange={(checked) => onChange({ customStyles: checked ? 1 : 0 })}
      label={L('새 스타일 제작', 'New custom style')} price={{ amount: CUSTOM_DEV.boothStyle, per: L('1종당', 'each') }} info={CUSTOM_DEV_TEXT.boothStyle.scope[lang]} />
    <p className="text-[11px] leading-relaxed text-slate-500">{L('기존 템플릿에 없는 브랜드·행사 스타일을 새로 만들어요. 기본 포함과 별도인 1회 제작비이며 부가세는 별도예요.', 'Create a brand or event style beyond existing templates. One-time production fee, separate from included styles; VAT excluded.')}</p>
    {customCount > 0 && <div data-testid="booth-custom-style-price">
      <Field label={L('새로 만들 스타일 수', 'Number of new styles')} hint={L(`+${price(customCount * CUSTOM_DEV.boothStyle, lang)} · 시안 3컷·수정 1회 · 1주 전 확정`, `+${price(customCount * CUSTOM_DEV.boothStyle, lang)} · 3 samples, 1 revision · confirm 1 week ahead`)}>
        <div className="max-w-64"><Stepper id="b-cstyles" value={customCount} min={1} max={10} suffix={lang === 'ko' ? '종' : undefined} onChange={(value) => onChange({ customStyles: value })} /></div>
      </Field>
    </div>}
  </section>;

  return <div className="space-y-6 sm:col-span-2" data-testid="photo-booth-templates">
    <section aria-labelledby={`${gridId}-heading`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${gridId}-heading`} className="text-sm font-semibold text-slate-800">{L('어떤 모습으로 찍어볼까요?', 'Which looks would you like?')}</h3>
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">{L(`기존 템플릿 ${PHOTO_BOOTH.includedStyles}종 기본 포함`, `${PHOTO_BOOTH.includedStyles} existing templates included`)}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{L('서비스 소개에서 체험한 데모 중 포토부스에 어울리는 사진 스타일이에요. 원하는 것을 여러 개 골라주세요.', 'Choose photo styles from our service demos. You can select more than one.')}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{L(`기본 ${PHOTO_BOOTH.includedStyles}종까지 추가 비용 없이, 그다음부터는 1종당 ${price(PHOTO_BOOTH.extraStyle, lang)}이 추가돼요. 부가세 별도예요.`, `The first ${PHOTO_BOOTH.includedStyles} are included; each additional existing template costs ${price(PHOTO_BOOTH.extraStyle, lang)}, excluding VAT.`)}</p>

      {options.templateSlugs === undefined && options.extraStyles > 0 && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600">{L(`저장된 추가 스타일 ${options.extraStyles}종은 아직 종류가 정해지지 않았어요. 아래에서 직접 고르면 선택한 수로 다시 계산해요.`, `Your saved ${options.extraStyles} extra styles have no templates yet. Selecting templates below recalculates the quantity from your choices.`)}</p>}

      <div id={gridId} className="mt-4 grid grid-cols-2 gap-3">
        {visible.map((template) => {
          const chosen = selectedSlugs.includes(template.slug);
          return <article key={template.slug} className={cn('min-w-0 overflow-hidden rounded-2xl border bg-white transition-colors', chosen ? 'border-teal-500 ring-1 ring-teal-500/20' : 'border-slate-200')}>
            <button type="button" aria-pressed={chosen} aria-label={template.name[lang]} data-testid={`booth-template-${template.slug}`} onClick={() => toggle(template.slug)}
              className="group block w-full text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-600">
              <span className="relative block aspect-[4/3] overflow-hidden bg-[#f7f5f0]">
                <PhotoBoothTemplateArt appearance={template.appearance} className="h-full w-full transition-transform duration-300 motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none" />
                <span aria-hidden="true" className={cn('absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors', chosen ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white/90 text-transparent')}><CheckIcon size={14} /></span>
              </span>
              <span className="block px-3 pb-2 pt-3">
                <span className="block text-xs font-semibold leading-relaxed text-slate-800">{template.name[lang]}</span>
                <span className="mt-1 block min-h-10 text-[11px] leading-relaxed text-slate-500">{template.description[lang]}</span>
                <PriceTag className="mt-2" price={templatePrice(template.slug)} />
              </span>
            </button>
            <button type="button" data-testid={`booth-demo-${template.slug}`} aria-haspopup={onOpenDemo ? 'dialog' : undefined} aria-label={L(`${template.name.ko} 데모 체험`, `Try ${template.name.en} demo`)} onClick={() => openDemo(template.slug)}
              className="mx-3 mb-2 inline-flex min-h-9 items-center gap-1 text-[11px] font-medium text-slate-500 underline-offset-4 hover:text-teal-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">{L('데모 체험', 'Try demo')}<ArrowRight size={12} aria-hidden="true" /></button>
          </article>;
        })}
      </div>
      {(expanded || visible.length < PHOTO_BOOTH_TEMPLATES.length) && <button type="button" data-testid="booth-templates-expand" aria-expanded={expanded} aria-controls={gridId} onClick={() => setExpanded(!expanded)}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
        {expanded ? L('템플릿 접기', 'Show fewer templates') : L(`다른 템플릿 ${PHOTO_BOOTH_TEMPLATES.length - visible.length}종 더 보기`, `Explore ${PHOTO_BOOTH_TEMPLATES.length - visible.length} more templates`)}<ChevronDown size={14} aria-hidden="true" className={cn('transition-transform motion-reduce:transition-none', expanded && 'rotate-180')} />
      </button>}
      <div data-testid="booth-template-selection" aria-live="polite" aria-atomic="true" className="mt-3 rounded-xl bg-teal-50/70 px-3.5 py-3 text-xs leading-relaxed text-teal-800">
        <p className="font-semibold">{selected.length ? L(`기존 템플릿 ${selected.length}종 선택 · ${extraCount > 0 ? `추가 ${price(extraCount * PHOTO_BOOTH.extraStyle, lang)}` : '추가 비용 없음'}`, `${selected.length} existing templates selected · ${extraCount > 0 ? `+ ${price(extraCount * PHOTO_BOOTH.extraStyle, lang)}` : 'no extra cost'}`) : L('아직 고르지 않아도 괜찮아요. 종류는 상담할 때 정할 수 있어요.', 'You can choose your templates later during consultation.')}</p>
        {selected.length > 0 && <p className="mt-1 text-[11px] text-teal-700">{selected.map((template) => template.name[lang]).join(' · ')}</p>}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4" aria-label={L('커스텀 사진 스타일 제작', 'Custom photo style production')}>
      <div className="mb-3 flex items-center gap-2"><Sparkles size={16} aria-hidden="true" className="text-teal-600" /><h3 className="text-sm font-semibold text-slate-800">{L('우리 행사만의 스타일이 필요하다면', 'Want a style unique to your event?')}</h3></div>
      <Check id="b-custom-style-enabled" checked={customCount > 0} onChange={(checked) => onChange({ customStyles: checked ? 1 : 0 })}
        label={L('새 커스텀 스타일 제작', 'Create a custom style')} price={{ amount: CUSTOM_DEV.boothStyle, per: L('1종당', 'each') }} info={CUSTOM_DEV_TEXT.boothStyle.scope[lang]} />
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{L('기존 템플릿에 없는 브랜드·행사 콘셉트를 새로 만들어요. 기본 포함 스타일과 별도로 받는 1회 제작비이며, 부가세는 별도예요.', 'Create a new photo treatment for your brand or event. This is a one-time production fee, separate from included templates and excluding VAT.')}</p>
      {customCount > 0 && <div className="mt-4" data-testid="booth-custom-style-price">
        <Field label={L('새로 만들 스타일 수', 'Number of new styles')} hint={L(`제작비 +${price(customCount * CUSTOM_DEV.boothStyle, lang)} · 시안 3컷, 수정 1회 · 1주 전 확정`, `Production +${price(customCount * CUSTOM_DEV.boothStyle, lang)} · 3 samples, 1 revision · confirm 1 week ahead`)}>
          <div className="max-w-64"><Stepper id="b-cstyles" value={customCount} min={1} max={10} suffix={lang === 'ko' ? '종' : undefined} onChange={(value) => onChange({ customStyles: value })} /></div>
        </Field>
      </div>}
    </section>
  </div>;
}
