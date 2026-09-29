'use client';

import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Lang } from '@/lib/quote/catalog';
import { cn } from '@/lib/utils';
import { useQuoteOptionFlowRegistration, type QuoteOptionFlowState } from './QuoteOptionFlowContext';

export interface QuoteOptionPage {
  id: string;
  label: string;
  content: ReactNode;
  /** The original, descriptive option-group title remains accessible. */
  ariaLabel?: string;
  hint?: string;
  count?: number;
}

/** Topic panels stay mounted, preserving temporary form state while only the
 * current topic participates in layout and keyboard navigation. */
export function QuoteOptionPages({ pages, lang, active = true }: { pages: QuoteOptionPage[]; lang: Lang; active?: boolean }) {
  const uid = useId();
  const scrollArea = useRef<HTMLDivElement>(null);
  const bridge = useQuoteOptionFlowRegistration();
  const [selectedId, setSelectedId] = useState(pages[0]?.id ?? 'basic');
  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => new Set());
  const existingIndex = pages.findIndex((page) => page.id === selectedId);
  const selectedIndex = existingIndex >= 0 ? existingIndex : Math.max(0, pages.findIndex((page) => !visitedIds.has(page.id)));
  const selected = pages[selectedIndex];
  const ko = lang === 'ko';
  const visitedBits = pages.map((page, index) => visitedIds.has(page.id) || (active && index === selectedIndex) ? '1' : '0').join('');
  const visited = useMemo(() => [...visitedBits].map((value) => value === '1'), [visitedBits]);
  const visitedCount = visited.filter(Boolean).length;
  const allVisited = pages.length > 0 && visitedCount === pages.length;
  const current = useRef({ pages, index: selectedIndex, visited });
  useLayoutEffect(() => { current.current = { pages, index: selectedIndex, visited }; });

  // Hidden service panels do not count as visited. A newly inserted conditional
  // page starts unvisited, while retained page IDs keep the user's progress.
  const availableIds = new Set(pages.map((page) => page.id));
  if ([...visitedIds].some((id) => !availableIds.has(id)) || (active && selected && !visitedIds.has(selected.id))) {
    const retained = new Set([...visitedIds].filter((id) => availableIds.has(id)));
    if (active && selected) retained.add(selected.id);
    setVisitedIds(retained);
  }
  if (active && selected && selectedId !== selected.id) setSelectedId(selected.id);

  const select = useCallback((index: number, focusTab = false) => {
    const page = current.current.pages[index];
    if (!page) return;
    setSelectedId(page.id);
    setVisitedIds((previous) => previous.has(page.id) ? previous : new Set([...previous, page.id]));
    if (scrollArea.current) scrollArea.current.scrollTop = 0;
    if (focusTab) document.getElementById(`${uid}-tab-${page.id}`)?.focus();
  }, [uid]);
  const goPrevious = useCallback(() => select(current.current.index - 1), [select]);
  const goFirstUnvisited = useCallback(() => {
    const missed = current.current.visited.findIndex((value) => !value);
    if (missed >= 0) select(missed);
  }, [select]);
  const goNext = useCallback(() => {
    const { index, pages: available, visited: seen } = current.current;
    if (index < available.length - 1) select(index + 1);
    else {
      const missed = seen.findIndex((value) => !value);
      if (missed >= 0) select(missed);
    }
  }, [select]);
  const total = pages.length;
  const label = selected?.label ?? '';
  const nextLabel = pages[selectedIndex + 1]?.label ?? null;
  const flow = useMemo<QuoteOptionFlowState>(() => ({
    index: selectedIndex, total, label, nextLabel, visited, visitedCount, allVisited, goPrevious, goNext, goFirstUnvisited,
  }), [selectedIndex, total, label, nextLabel, visited, visitedCount, allVisited, goPrevious, goNext, goFirstUnvisited]);
  useLayoutEffect(() => {
    if (active && total) bridge?.register(uid, flow);
    else bridge?.unregister(uid);
  }, [bridge, uid, active, total, flow]);
  useLayoutEffect(() => () => bridge?.unregister(uid), [bridge, uid]);

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % pages.length
      : event.key === 'ArrowLeft' ? (index + pages.length - 1) % pages.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? pages.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  };
  if (!selected) return null;

  return <div data-testid="option-pages" data-current-page={selected.id} data-current-step={selectedIndex + 1} data-total-steps={total} data-all-visited={allVisited}
    className="flex h-full min-h-0 flex-col">
    <div data-testid="option-page-progress" className="relative flex shrink-0 flex-col gap-1.5 border-b border-slate-100 py-2">
      <div aria-live="polite" aria-atomic="true" className="flex min-h-4 items-center justify-between gap-2 text-[11px] leading-4">
        <p className="min-w-0 truncate font-semibold text-slate-700"><span className="mr-2 tabular-nums text-teal-700">{selectedIndex + 1}/{total}</span>{selected.label}</p>
        <span className="shrink-0 tabular-nums text-slate-400">{ko ? `${visitedCount}개 확인` : `${visitedCount} reviewed`}</span>
      </div>
      <div role="tablist" aria-label={ko ? '옵션 선택 순서' : 'Option topics'} aria-orientation="horizontal" className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {pages.map((page, index) => <button key={page.id} id={`${uid}-tab-${page.id}`} type="button" role="tab"
          data-testid={`option-tab-${page.id}`} data-visited={visited[index]} aria-label={page.ariaLabel ?? page.label} aria-selected={index === selectedIndex}
          aria-describedby={`${uid}-status-${page.id}`} aria-controls={`${uid}-panel-${page.id}`} tabIndex={index === selectedIndex ? 0 : -1}
          onClick={() => select(index)} onKeyDown={(event) => onTabKeyDown(event, index)}
          className={cn('relative flex h-8 min-w-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 motion-reduce:transition-none', index === selectedIndex ? 'bg-teal-600 text-white' : visited[index] ? 'bg-teal-50 text-teal-800 hover:bg-teal-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}>
          <span aria-hidden="true">{index + 1}</span>
          {visited[index] && index !== selectedIndex && <Check size={8} aria-hidden="true" className="absolute top-1 right-1 text-teal-600" />}
          <span id={`${uid}-status-${page.id}`} className="sr-only">{ko ? `${index + 1}단계, ${visited[index] ? '확인한 단계' : '아직 확인하지 않은 단계'}` : `Step ${index + 1}, ${visited[index] ? 'reviewed' : 'not reviewed yet'}`}</span>
        </button>)}
      </div>
      <div aria-hidden="true" className="absolute right-0 bottom-0 left-0 h-0.5 bg-slate-100"><div className="h-full bg-teal-400 transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${visitedCount / total * 100}%` }} /></div>
    </div>

    <div ref={scrollArea} data-testid="option-page-scroll" className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-3 pr-1 [scrollbar-gutter:stable]">
      {pages.map((page, index) => <section key={page.id} id={`${uid}-panel-${page.id}`} role="tabpanel"
        data-testid={`option-page-${page.id}`} aria-labelledby={`${uid}-tab-${page.id}`} hidden={index !== selectedIndex} inert={index !== selectedIndex}>
        {page.hint && <p className="mb-3 text-xs leading-relaxed text-slate-500">{page.hint}</p>}
        {page.content}
      </section>)}
    </div>

    {!bridge && pages.length > 1 && <div data-option-navigation className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3 pb-2">
      <button type="button" data-testid="option-page-previous" disabled={selectedIndex === 0} onClick={goPrevious}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-default disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
        <ArrowLeft size={14} aria-hidden="true" />{ko ? '이전' : 'Back'}
      </button>
      <span aria-live="polite" className="text-[11px] tabular-nums text-slate-400">{selectedIndex + 1} / {pages.length}</span>
      {selectedIndex < pages.length - 1 || !allVisited ? <button type="button" data-testid="option-page-next" onClick={goNext}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-teal-50 px-3 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
        {selectedIndex < pages.length - 1 ? (ko ? '다음' : 'Next') : (ko ? '놓친 옵션 보기' : 'Review missed options')}<ArrowRight size={14} aria-hidden="true" />
      </button> : <span className="text-xs font-medium text-teal-700">{ko ? '모든 옵션을 확인했어요' : 'All options reviewed'}</span>}
    </div>}
  </div>;
}
