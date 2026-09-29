'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Trash2, X } from 'lucide-react';
import { SERVICE_TEXT, type Lang, type ServiceKey } from '@/lib/quote/catalog';
import { QuoteOptionFlowProvider, useQuoteOptionFlow } from '@/components/quote-studio/QuoteOptionFlowContext';
import { recordQuote } from '@/lib/analytics/quote-journey';
import { smoothScrollBy } from '@/lib/smooth-scroll';

/** An anchored, non-modal speech bubble. The page and its live preview remain
 * usable; only this bubble's longer option lists scroll independently. */
interface QuoteOptionsPopoverProps {
  open: boolean;
  service: ServiceKey | null;
  lang: Lang;
  total: number;
  children: ReactNode;
  onClose: () => void;
  onRemove: () => void;
  /** A demo can temporarily take focus while these options stay mounted. */
  suspended?: boolean;
}

/** 말풍선의 최대 높이 — 내용이 짧으면 내용만큼만, 화면이 낮으면 화면 안쪽까지만 */
const MAX_HEIGHT = 640;
const MIN_HEIGHT = 120;
const GAP = 12;

/** 말풍선을 둘 수 있는 화면 안쪽 범위 — 위 헤더와 아래 고정 합계 바를 실제로 재서 뺀다 */
function safeArea() {
  const viewport = window.visualViewport;
  const vTop = viewport?.offsetTop ?? 0;
  const vHeight = viewport?.height ?? window.innerHeight;
  const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 80;
  const bar = document.querySelector('[data-quote-bottom-bar]')?.getBoundingClientRect();
  const barTop = bar && bar.height > 0 && bar.top < vTop + vHeight ? bar.top : vTop + vHeight;
  return { top: Math.max(vTop + GAP, Math.min(headerBottom + GAP, vTop + 100)), bottom: barTop - GAP };
}

/** 지금 보이는 체험의 옵션 스크롤 영역 — 담은 체험마다 하나씩 있고, 다른 체험 것은 숨겨져 있다 */
function visibleOptionArea(panel: HTMLElement | null): HTMLElement | undefined {
  return [...(panel?.querySelectorAll<HTMLElement>('[data-testid="option-page-scroll"]') ?? [])].find((area) => area.offsetParent !== null);
}

/** 지금 보이는 옵션 페이지를 스크롤 없이 다 보여주는 말풍선 높이 (헤더·탭·아래 버튼 포함) */
function naturalHeight(panel: HTMLElement | null): number | null {
  const area = visibleOptionArea(panel);
  const page = area?.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])');
  // 처음 여는 순간에는 말풍선이 아직 숨겨져 있어 잴 수 없다
  if (!panel || !area || !page || panel.offsetHeight === 0) return null;
  const style = getComputedStyle(area);
  // 내용이 넘치면 스크롤 높이가 정확하다 (마지막 요소의 바깥 여백까지 들어간다) — 그만큼 키워서 맞춘다
  const content = area.scrollHeight > area.clientHeight + 1
    ? area.scrollHeight
    : page.offsetHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  return panel.offsetHeight - area.clientHeight + content;
}

export function QuoteOptionsPopover(props: QuoteOptionsPopoverProps) {
  return <QuoteOptionFlowProvider><QuoteOptionsBubble {...props} /></QuoteOptionFlowProvider>;
}

function QuoteOptionsBubble({ open, service, lang, total, children, onClose, onRemove, suspended = false }: QuoteOptionsPopoverProps) {
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const ko = lang === 'ko';
  const flow = useQuoteOptionFlow();
  // 견적 행동 기록: 어떤 체험의 몇 번째 옵션 페이지를 봤는지, 언제 닫았는지
  const flowPage = open && service && flow ? `${flow.index + 1}/${flow.total} ${flow.label}` : null;
  useEffect(() => { if (service && flowPage) recordQuote('o', service, flowPage); }, [service, flowPage]);
  const openService = open ? service : null;
  useEffect(() => (openService ? () => recordQuote('oc', openService) : undefined), [openService]);
  const [position, setPosition] = useState<{ left: number; top: number; width: number; height: number; arrow: number; side: string; service: ServiceKey | null }>({ left: 0, top: 0, width: 360, height: 440, arrow: 40, side: 'bottom', service: null });

  const reposition = useCallback(() => {
    const button = document.getElementById(`preview-trigger-${service}`);
    if (!button) return;
    trigger.current = button;
    // The card's name is the visible attachment point, even when the bubble
    // opens above the card's illustration.
    const anchor = (button.querySelector('[data-options-anchor]') ?? button).getBoundingClientRect();
    const grid = button.closest('[data-options-card-grid]')?.getBoundingClientRect();
    const viewport = window.visualViewport;
    const vLeft = viewport?.offsetLeft ?? 0;
    const vWidth = viewport?.width ?? window.innerWidth;
    const { top: safeTop, bottom: safeBottom } = safeArea();
    const wanted = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, naturalHeight(panel.current) ?? MAX_HEIGHT));
    const below = Math.max(0, safeBottom - anchor.bottom - GAP);
    const above = Math.max(0, anchor.top - safeTop - GAP);
    // 위아래 어느 쪽에도 다 안 들어가면 방금 누른 카드 위로 겹쳐 올라가 화면 높이를 다 쓴다 (꼬리는 숨긴다).
    // 미리보기는 왼쪽 칸이라 가려지지 않고, 제목에 체험 이름이 있어 어느 카드의 옵션인지 알 수 있다.
    // 조금 모자란 정도면 카드에 붙인 채(꼬리 유지) 말풍선 안에서 스크롤하고, 많이 모자랄 때만 겹친다
    const roomy = Math.max(below, above);
    const overlay = roomy < wanted * 0.8 && safeBottom - safeTop > roomy + GAP;
    const side = overlay ? 'overlay' : below >= wanted || below >= above ? 'bottom' : 'top';
    const height = overlay
      ? Math.min(wanted, safeBottom - safeTop)
      : Math.min(wanted, Math.max(MIN_HEIGHT, side === 'bottom' ? below : above), Math.max(MIN_HEIGHT, safeBottom - safeTop));
    const width = Math.min(480, vWidth >= 1024 ? grid?.width ?? 480 : 480, vWidth - 24);
    const left = Math.max(vLeft + 12, Math.min(grid?.left ?? anchor.left, vLeft + vWidth - width - 12));
    const top = side === 'overlay'
      ? Math.max(safeTop, Math.min(anchor.bottom + GAP, safeBottom - height))
      : side === 'bottom'
        ? Math.max(safeTop, Math.min(anchor.bottom + GAP, safeBottom - height))
        : Math.max(safeTop, anchor.top - height - GAP);
    // 꼬리는 말풍선 테두리(1px) 안쪽 기준으로 놓이므로 그만큼 빼야 카드 이름 한가운데를 가리킨다
    const next = { left, top, width, height, side, service, arrow: Math.max(22, Math.min(width - 22, anchor.left + anchor.width / 2 - left - 1)) };
    setPosition((current) => Object.keys(next).every((key) => current[key as keyof typeof current] === next[key as keyof typeof next]) ? current : next);
  }, [service]);

  /**
   * 말풍선을 열 때(또는 페이지가 길어질 때) 화면을 필요한 만큼만 굴린다.
   * - 굴릴 수 있는 범위: 카드 이름은 늘 보이고, 미리보기와 카드가 나란히 있으면 미리보기도 잘리지 않는 만큼.
   * - 그 안에서 말풍선이 카드 아래에 다 들어가면 아래, 안 되면 위(오른쪽 카드 칸 — 미리보기를 가리지 않는다),
   *   둘 다 안 되면 더 넓은 쪽을 만들고 말풍선 안에서 스크롤한다. 가능한 것 중 화면이 덜 움직이는 쪽.
   * 내용 높이를 아직 잴 수 없으면(여는 순간) 다음 프레임에 다시 잰다.
   */
  const align = useCallback(() => {
    const run = (attempt: number) => {
      const button = document.getElementById(`preview-trigger-${service}`);
      const anchor = (button?.querySelector('[data-options-anchor]') ?? button)?.getBoundingClientRect();
      if (!anchor || !button) return;
      const natural = naturalHeight(panel.current);
      if (natural === null) {
        if (attempt < 6) requestAnimationFrame(() => run(attempt + 1));
        return;
      }
      const { top: safeTop, bottom: safeBottom } = safeArea();
      const wanted = Math.min(MAX_HEIGHT, natural);
      const clampRange = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

      // d = 아래로 굴릴 양(음수면 위로). 카드 이름이 화면 안에 남는 범위
      let lo = anchor.bottom - safeBottom;
      let hi = anchor.top - safeTop;
      // 미리보기와 카드가 나란히 있으면 미리보기 전체도 화면 안에 — 미리보기가 화면보다 크면 이 조건은 뺀다
      const preview = button.closest('[data-testid="quote-preview-experience-editor"]')?.querySelector('[data-preview-column]')?.getBoundingClientRect();
      if (preview && preview.right <= anchor.left + 1 && preview.height <= safeBottom - safeTop) {
        const previewLo = Math.max(lo, preview.bottom - safeBottom);
        const previewHi = Math.min(hi, preview.top - safeTop);
        if (previewLo <= previewHi) { lo = previewLo; hi = previewHi; }
      }
      // 문서가 더 굴러갈 수 없는 만큼
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      lo = Math.max(lo, -window.scrollY);
      hi = Math.min(hi, maxScroll - window.scrollY);
      if (lo > hi) return;

      const needBelow = anchor.bottom + GAP + wanted - safeBottom; // 이만큼 이상 굴리면 아래에 다 들어간다
      const needAbove = anchor.top - GAP - wanted - safeTop;      // 이만큼 이하로 굴리면 위에 다 들어간다
      const options: number[] = [];
      if (needBelow <= hi) options.push(clampRange(0, Math.max(needBelow, lo), hi));
      if (needAbove >= lo) options.push(clampRange(0, lo, Math.min(needAbove, hi)));
      let delta: number;
      if (options.length) delta = options.reduce((best, d) => (Math.abs(d) < Math.abs(best) ? d : best));
      else {
        // 어느 쪽에도 다 안 들어가면 더 넓게 만들 수 있는 쪽으로
        const roomBelow = safeBottom - (anchor.bottom - hi) - GAP;
        const roomAbove = anchor.top - lo - GAP - safeTop;
        delta = roomBelow >= roomAbove ? hi : lo;
      }
      if (Math.abs(delta) > 2) smoothScrollBy(delta);
    };
    run(0);
  }, [service]);


  // 높이를 바꾼 뒤에도 내용이 넘치면 한 번 더 재서 맞춘다. 내용이 뒤늦게 커져(그림 로딩 등)
  // 화면 아래가 모자라면 화면도 그만큼 다시 굴린다. 더 키울 수도 굴릴 수도 없으면 같은 값이 나와 멈춘다.
  useEffect(() => {
    if (!open) return;
    const area = visibleOptionArea(panel.current);
    if (!area || area.scrollHeight <= area.clientHeight + 1 || position.height >= MAX_HEIGHT) return;
    const frame = requestAnimationFrame(() => { reposition(); align(); reposition(); });
    return () => cancelAnimationFrame(frame);
  }, [open, position.height, reposition, align]);

  // 다음 옵션 페이지가 더 길면 그만큼 다시 맞춘다 (페이지가 그려진 뒤)
  const pageKey = open && flow ? `${service}:${flow.index}` : null;
  useEffect(() => {
    if (!pageKey) return;
    const frame = requestAnimationFrame(() => { reposition(); align(); reposition(); });
    return () => cancelAnimationFrame(frame);
  }, [pageKey, reposition, align]);

  useLayoutEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      reposition();
      // 첫 배치로 내용 높이를 잰 뒤, 카드 이름과 말풍선 전체가 보이도록 화면을 부드럽게 맞춘다
      // 화면을 곧바로 옮긴 경우(동작 줄이기) 같은 프레임에 말풍선도 따라 맞춘다
      requestAnimationFrame(() => { align(); reposition(); });
    });
    const observer = new ResizeObserver(reposition);
    // 옵션 페이지 내용(이미지 로딩·펼침 등)이 커지거나 줄면 말풍선 높이도 따라간다
    panel.current?.querySelectorAll('[data-testid="option-page-scroll"] > [role="tabpanel"]').forEach((page) => observer.observe(page));
    const button = document.getElementById(`preview-trigger-${service}`);
    if (button) observer.observe(button);
    const grid = button?.closest('[data-options-card-grid]');
    if (grid) observer.observe(grid);
    const editor = button?.closest('[data-testid="quote-preview-experience-editor"]');
    if (editor) observer.observe(editor);
    const scroll = (event: Event) => {
      if (panel.current?.inert) return;
      if (event.target instanceof Element && (panel.current?.contains(event.target) || event.target.closest('[data-site-select]'))) return;
      const anchor = trigger.current?.getBoundingClientRect();
      if (anchor && (anchor.bottom < 80 || anchor.top > window.innerHeight - 80)) { onClose(); return; }
      reposition();
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', scroll, true);
    window.visualViewport?.addEventListener('resize', reposition);
    window.visualViewport?.addEventListener('scroll', reposition);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', scroll, true);
      window.visualViewport?.removeEventListener('resize', reposition);
      window.visualViewport?.removeEventListener('scroll', reposition);
    };
  }, [open, service, reposition, align, onClose]);

  const dismiss = useCallback(() => {
    trigger.current?.focus({ preventScroll: true });
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open || position.service !== service) return;
    const frame = requestAnimationFrame(() => {
      if (!panel.current?.inert) closeButton.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, service, position.service]);

  useEffect(() => {
    if (!open || suspended || position.service !== service) return;
    const isInside = (target: EventTarget | null) => target instanceof Element && (
      panel.current?.contains(target) || trigger.current?.contains(target) || target.closest('[data-site-select], [role="tooltip"], [data-testid="preview-canvas"]')
    );
    const outside = (event: PointerEvent) => { if (!panel.current?.inert && !isInside(event.target)) onClose(); };
    const focusOutside = (event: FocusEvent) => { if (!panel.current?.inert && !isInside(event.target)) onClose(); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && !document.querySelector('[data-site-select]')) {
        event.preventDefault();
        dismiss();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focusOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', focusOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, suspended, service, position.service, onClose, dismiss]);

  const title = service ? SERVICE_TEXT[service].name[lang] : '';
  const ready = open && position.service === service;
  return createPortal(<motion.div ref={panel} id="preview-options-popover" hidden={!ready} inert={!ready || suspended} aria-hidden={suspended || undefined} role="dialog" aria-modal="false"
    aria-label={`${title} ${ko ? '옵션' : 'options'}`} data-testid="quote-options-popover" data-side={position.side} data-anchor-service={service}
    data-lenis-prevent style={{ left: position.left, top: position.top, width: position.width, height: position.height }}
    initial={false} animate={{ opacity: open ? 1 : 0, y: open || reducedMotion ? 0 : position.side === 'bottom' ? -5 : 5 }} transition={{ duration: reducedMotion ? 0 : .16 }}
    className="fixed z-[80] rounded-[22px] border border-teal-200 bg-white transition-[height] duration-200 ease-out motion-reduce:transition-none shadow-[0_12px_40px_-8px_rgba(15,23,42,0.2)] [&_[data-option-navigation]]:hidden">
    <span data-testid="quote-options-arrow" aria-hidden="true" hidden={position.side === 'overlay'} style={{ left: position.arrow, ...(position.side === 'bottom' ? { top: -8 } : { bottom: -8 }) }}
      className={`absolute size-3.5 -translate-x-1/2 rotate-45 bg-white ${position.side === 'bottom' ? 'border-t border-l' : 'border-r border-b'} border-teal-200`} />
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-white">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-2">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-900"><span className="size-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />{title}</h2>
        <button ref={closeButton} type="button" data-testid="quote-options-close" onClick={dismiss} aria-label={ko ? '옵션 닫기' : 'Close options'} className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-600"><X size={17} /></button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 sm:px-4">{children}</div>
      <div className="shrink-0 border-t border-slate-100 px-4 py-2.5">
        <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-slate-500">
          <span>{ko ? '전체 합계 · 부가세 포함' : 'Event total · incl. VAT'} <strong className="ml-1 text-xs tabular-nums text-teal-700" data-testid="options-total" data-amount={total}>{ko ? `${total.toLocaleString('ko-KR')}원` : `KRW ${total.toLocaleString('en-US')}`}</strong></span>
          <button type="button" data-testid="quote-options-remove" onClick={() => { dismiss(); onRemove(); }} aria-label={ko ? '이 체험 빼기' : 'Remove this experience'} className="flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-teal-600"><Trash2 size={13} /></button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <button type="button" data-testid="option-page-previous" disabled={!flow || flow.index === 0} onClick={() => flow?.goPrevious()} className="inline-flex min-h-9 items-center gap-1 rounded-xl px-2 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-teal-600"><ArrowLeft size={14} />{ko ? '이전' : 'Back'}</button>
          <span className="shrink-0 text-[11px] tabular-nums text-slate-400" aria-live="polite" data-testid="option-flow-progress">{flow ? `${flow.index + 1} / ${flow.total}` : ''}</span>
          {flow && (flow.index < flow.total - 1 || !flow.allVisited)
            ? <button type="button" data-testid="option-page-next" onClick={() => flow.index < flow.total - 1 ? flow.goNext() : flow.goFirstUnvisited()} className="inline-flex min-h-9 max-w-[65%] items-center justify-center gap-1 rounded-xl bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"><span>{flow.index < flow.total - 1 ? (ko ? `다음 · ${flow.nextLabel}` : `Next · ${flow.nextLabel}`) : (ko ? '남은 옵션 확인' : 'Review remaining')}</span><ArrowRight size={14} className="shrink-0" /></button>
            : <button type="button" data-testid="quote-options-done" disabled={!flow || !flow.allVisited} onClick={() => { if (flow?.allVisited) dismiss(); }} className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"><Check size={14} />{ko ? '선택 완료' : 'Finish options'}</button>}
        </div>
      </div>
    </div>
  </motion.div>, document.body);
}
