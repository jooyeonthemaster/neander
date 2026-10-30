'use client';

import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lang } from '@/lib/quote/catalog';
import { cn } from '@/lib/utils';
import { KioskExperienceArt } from './KioskExperienceArt';

const PAGE_SIZE = 4;

/**
 * The same compact gallery as photo styles. One experience per device by default;
 * with `values` it becomes a multi-select (checkboxes) for splitting several kiosks.
 */
export function KioskExperienceGallery({ number, value, experiences, lang, onChange, dense = false, values, limit = Infinity, onClear }: {
  number: number;
  value: string;
  experiences: { value: string; label: string }[];
  lang: Lang;
  onChange: (slug: string) => void;
  dense?: boolean;
  /** Multi-select: the chosen slugs. `onChange` then toggles one. */
  values?: string[];
  /** Multi-select: how many can be chosen (the number of kiosks) */
  limit?: number;
  /** Multi-select: clear every choice */
  onClear?: () => void;
}) {
  const multiple = values !== undefined;
  const isChosen = (slug: string) => (multiple ? values.includes(slug) : slug === value);
  const full = multiple && values.length >= limit;
  const [page, setPage] = useState(() => Math.floor(Math.max(0, experiences.findIndex((experience) => experience.value === value)) / PAGE_SIZE));
  const [direction, setDirection] = useState(1);
  const regionRef = useRef<HTMLDivElement>(null);
  const pendingRadioFocus = useRef<string | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const reducedMotion = useReducedMotion();
  const id = useId();
  const L = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const pages = Math.max(1, Math.ceil(experiences.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const visible = experiences.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const selected = experiences.find((experience) => experience.value === value);
  const selectedVisible = visible.some((experience) => isChosen(experience.value));
  const chosenLabels = multiple ? values.map((slug) => experiences.find((experience) => experience.value === slug)?.label).filter(Boolean) : [];
  const movePage = (step: number, focus = false) => {
    setDirection(step < 0 ? -1 : 1);
    setPage(Math.max(0, Math.min(pages - 1, currentPage + step)));
    if (focus) regionRef.current?.focus({ preventScroll: true });
  };

  const selectionSummary = multiple ? <>
      <p aria-live="polite" aria-atomic="true" className={cn("min-w-0 flex-1 text-[10px] leading-relaxed text-teal-800", dense && "truncate")}>{chosenLabels.length ? L(`${chosenLabels.length}종 선택${full && limit > 1 ? ' · 최대' : ''}`, `${chosenLabels.length} chosen${full && limit > 1 ? ' · max' : ''}`) : L('여러 개 고를 수 있어요. 미정이면 상담 때 정해요.', 'Pick one or more, or decide later.')}</p>
      {chosenLabels.length > 0 && <button type="button" data-testid={`kiosk-experience-reset-${number}`} onClick={onClear}
        className={cn('shrink-0 rounded px-1 text-[10px] font-medium text-teal-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-600 touch:min-h-11', dense ? 'min-h-6' : 'min-h-7')}>{L('모두 상담 후 결정', 'Decide later')}</button>}
  </> : <>
      <p aria-live="polite" aria-atomic="true" className={cn("min-w-0 flex-1 text-[10px] leading-relaxed text-teal-800", dense && "truncate")}>{selected ? L(`선택: ${selected.label}`, `Selected: ${selected.label}`) : L('미정으로 넘어가도 괜찮아요. 상담할 때 함께 정해요.', 'You can decide later with our help.')}</p>
      {selected && <button type="button" data-testid={`kiosk-experience-reset-${number}`} onClick={() => onChange('')}
        className={cn('shrink-0 rounded px-1 text-[10px] font-medium text-teal-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-600 touch:min-h-11', dense ? 'min-h-6' : 'min-h-7')}>{L('상담 후 결정', 'Decide later')}</button>}
  </>;

  return <div data-testid={`kiosk-assignment-${number}`} data-experience-slug={value} className={dense ? "space-y-1" : "space-y-2"}>
    <div ref={regionRef} id={id} data-testid={`kiosk-experience-gallery-${number}`} data-gallery-page={currentPage + 1}
      // 여러 대면 한 갤러리에서 여러 체험을 골라 기기에 나눠 담는다 — 특정 기기 하나의 선택이 아니다
      role="region" aria-roledescription={L('캐러셀', 'carousel')} aria-label={multiple ? L('키오스크에 넣을 체험 둘러보기 · 여러 개 선택', 'Browse experiences for your kiosks, choose one or more') : L(`${number}번 키오스크의 체험 둘러보기`, `Browse experiences for kiosk ${number}`)}
      tabIndex={0} className="overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2" style={{ touchAction: 'pan-y' }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : event.key === 'Home' ? -currentPage : event.key === 'End' ? pages - 1 - currentPage : null;
        if (step === null) return;
        event.preventDefault(); event.stopPropagation(); movePage(step, true);
      }}
      onTouchStart={(event) => { const touch = event.touches[0]; touchStart.current = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : null; }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={(event) => {
        const start = touchStart.current; const touch = event.changedTouches[0]; touchStart.current = null;
        if (!start || !touch) return;
        const dx = touch.clientX - start.x; const dy = touch.clientY - start.y;
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          suppressClickUntil.current = event.timeStamp + 350;
          movePage(dx < 0 ? 1 : -1, true);
        }
      }}
      onClickCapture={(event) => { if (event.timeStamp < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
      <div role={multiple ? 'group' : 'radiogroup'} aria-label={multiple ? L(`키오스크 ${limit}대에 나눠 담을 체험 (최대 ${limit}종)`, `Experiences to split across ${limit} kiosks (up to ${limit})`) : L(`${number}번 키오스크의 체험`, `Experience for kiosk ${number}`)}>
        <AnimatePresence initial={false} mode="wait"><motion.div key={currentPage}
          initial={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : direction * 16 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : -direction * 16 }} transition={{ duration: reducedMotion ? 0 : 0.16 }}
          onAnimationComplete={() => {
            if (!pendingRadioFocus.current || document.activeElement !== regionRef.current) return;
            const radio = regionRef.current?.querySelector<HTMLButtonElement>(`[data-testid="kiosk-experience-${number}-${pendingRadioFocus.current}"]`);
            if (radio) {
              radio.focus({ preventScroll: true });
              pendingRadioFocus.current = null;
            }
          }}
          className={cn("grid grid-cols-2 gap-2 max-[359px]:grid-cols-1", dense ? "min-h-[136px]" : "min-h-[164px]")}>
          {visible.map((experience, index) => {
            const chosen = isChosen(experience.value);
            // 최대 개수를 고른 뒤 남은 카드는 흐리게 — 누르면 아무 일도 없다 (하나를 빼면 다시 고를 수 있다)
            const locked = full && !chosen && limit > 1;
            return <article key={experience.value} className={cn('relative min-w-0 overflow-hidden rounded-xl border bg-white transition-opacity', dense ? 'h-16' : 'h-[78px]', chosen ? 'border-teal-500 ring-1 ring-teal-500/15' : 'border-slate-200', locked && 'opacity-45')}>
              <button type="button" role={multiple ? 'checkbox' : 'radio'} aria-checked={chosen} aria-disabled={locked || undefined} aria-label={experience.label} data-testid={`kiosk-experience-${number}-${experience.value}`}
                tabIndex={multiple || chosen || (!selectedVisible && index === 0) ? 0 : -1}
                onClick={() => { if (!locked) onChange(experience.value); }}
                onKeyDown={(event) => {
                  if (multiple || event.altKey || event.ctrlKey || event.metaKey) return;
                  const offset = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
                  if (!offset) return;
                  event.preventDefault(); event.stopPropagation();
                  const nextIndex = (currentPage * PAGE_SIZE + index + offset + experiences.length) % experiences.length;
                  const next = experiences[nextIndex];
                  onChange(next.value);
                  const nextPage = Math.floor(nextIndex / PAGE_SIZE);
                  if (nextPage !== currentPage) {
                    pendingRadioFocus.current = next.value;
                    movePage(nextPage - currentPage, true);
                  }
                  else regionRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex % PAGE_SIZE]?.focus({ preventScroll: true });
                }}
                className="flex h-full w-full items-center gap-2 pr-2 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-600">
                <span aria-hidden="true" className="relative flex h-full w-[52px] shrink-0 items-center overflow-hidden bg-[#f7f5f0]">
                  <KioskExperienceArt slug={experience.value} className="h-full w-full" />
                  {chosen && <span className="absolute left-1 top-1 rounded-full bg-teal-600 p-0.5 text-white"><Check size={11} /></span>}
                </span>
                <span className="flex h-full min-w-0 flex-1 items-center py-2">
                  <span className={cn("block text-[11px] font-semibold leading-[14px] text-slate-800", dense && "line-clamp-2")}>{experience.label}</span>
                </span>
              </button>
            </article>;
          })}
        </motion.div></AnimatePresence>
      </div>
    </div>
    <nav aria-label={L('체험 목록 넘기기', 'Browse experience pages')} className="flex items-center justify-between gap-2">
      <button type="button" aria-label={L('이전 체험 보기', 'Previous experiences')} aria-controls={id} disabled={currentPage === 0} onClick={() => movePage(-1)}
        className={cn('flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-teal-600 touch:size-11', dense ? 'size-7' : 'size-8')}><ChevronLeft size={16} aria-hidden="true" /></button>
      <div className={cn('min-w-0 flex-1 text-center', dense && 'flex items-center gap-2')}><span aria-live="polite" aria-atomic="true" className="shrink-0 text-[11px] tabular-nums text-slate-500">{currentPage + 1} / {pages}</span>{dense && selectionSummary}</div>
      <button type="button" aria-label={L('다음 체험 보기', 'Next experiences')} aria-controls={id} disabled={currentPage === pages - 1} onClick={() => movePage(1)}
        className={cn('flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-teal-600 touch:size-11', dense ? 'size-7' : 'size-8')}><ChevronRight size={16} aria-hidden="true" /></button>
    </nav>
    {!dense && <div className="flex items-center gap-2 rounded-lg bg-teal-50/70 px-2.5 py-1.5">
      {selectionSummary}
    </div>}
  </div>;
}
