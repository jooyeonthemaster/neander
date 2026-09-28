'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Page { start: number; end: number }
interface Layout { height: number; pages: Page[]; scroll: boolean; remaining: number[] }

/** Keeps live controls mounted while advancing through content at readable block boundaries. */
export function DemoViewport({ children, label = '체험 내용', className = '', focused = false, mode = 'auto' }: {
  children: ReactNode; label?: string; className?: string; focused?: boolean; mode?: 'auto' | 'scroll';
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>({ scroll: false, remaining: [], height: 300, pages: [{ start: 0, end: 300 }] });
  const [pageIndex, setPageIndex] = useState(0);
  const id = useId();
  const activeIndex = Math.min(pageIndex, layout.pages.length - 1);
  const page = layout.pages[activeIndex];
  const multiple = layout.pages.length > 1;

  const measure = useCallback(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content || root.clientHeight < 1 || !root.getClientRects().length) return;
    const total = content.scrollHeight;
    if (focused || mode === 'scroll' || window.matchMedia('(min-width: 1024px)').matches) {
      const height = root.clientHeight;
      setLayout((previous) => previous.scroll && previous.height === height ? previous : { scroll: true, height, pages: [{ start: 0, end: height }], remaining: [] });
      return;
    }
    const origin = content.getBoundingClientRect().top;
    // Only explicit step boundaries force a new page. A result's short eyebrow,
    // heading and introduction should read together instead of occupying three
    // mostly empty screens.
    const breaks = Array.from(content.querySelectorAll<HTMLElement>('[data-demo-page-start]'))
      .filter((element) => element.getClientRects().length && getComputedStyle(element).position !== 'absolute')
      .map((element) => Math.max(0, element.getBoundingClientRect().top - origin - 4))
      .sort((a, b) => a - b);
    const controlsHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue('--demo-page-controls-height')) || 44;
    // Keep this budget stable: responsive media must not grow each time pagination disappears.
    const height = Math.max(1, root.clientHeight - controlsHeight);
    const intervals: { start: number; end: number }[] = [];
    const add = (rect: DOMRect) => {
      if (rect.width && rect.height) intervals.push({ start: Math.max(0, rect.top - origin - 3), end: rect.bottom - origin + 3 });
    };
    const readableBlocks = 'button, input, textarea, select, label, legend, p, h1, h2, h3, h4, img, video, canvas, svg[viewBox], .demo-panel, [data-demo-page-atomic]';
    for (const element of content.querySelectorAll<HTMLElement>(focused ? `${readableBlocks}, .venue-summary-grid > article` : readableBlocks)) {
      if (!element.getClientRects().length || getComputedStyle(element).position === 'absolute') continue;
      const owner = element.parentElement?.closest('button, [data-demo-page-atomic]');
      if (owner && content.contains(owner)) continue;
      const rect = element.getBoundingClientRect();
      if (rect.height > height && element.matches('p, h1, h2, h3, h4, label, legend')) {
        const range = document.createRange();
        range.selectNodeContents(element);
        for (const line of range.getClientRects()) add(line);
      } else if (rect.height <= height + 2) add(rect);
    }
    intervals.sort((a, b) => a.start - b.start);
    const bands: { start: number; end: number }[] = [];
    for (const interval of intervals) {
      const previous = bands[bands.length - 1];
      if (previous && interval.start < previous.end) previous.end = Math.max(previous.end, interval.end);
      else bands.push({ ...interval });
    }
    const pages: Page[] = [];
    let start = 0;
    while (start < total - 2 && pages.length < 100) {
      let end = Math.min(total, start + height);
      const nextBreak = breaks.find((point) => point > start + 30 && point < end);
      if (nextBreak !== undefined) end = nextBreak;
      if (end < total) {
        const crossing = bands.find((band) => band.start < end && band.end > end);
        if (crossing && crossing.start > start + 40) end = crossing.start;
      }
      pages.push({ start, end });
      start = end;
    }
    if (!pages.length) pages.push({ start: 0, end: height });
    const options = Array.from(content.querySelectorAll<HTMLElement>('button[aria-pressed], input, select, textarea'));
    const remaining = pages.map((page) => options.filter((option) => option.getBoundingClientRect().top - origin >= page.end - 1).length);
    setLayout((previous) => !previous.scroll && previous.height === height && JSON.stringify(previous.pages) === JSON.stringify(pages) && JSON.stringify(previous.remaining) === JSON.stringify(remaining) ? previous : { height, pages, scroll: false, remaining });
  }, [focused, mode]);

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    resize.observe(content);
    const mutation = new MutationObserver(schedule);
    mutation.observe(content, { subtree: true, childList: true, characterData: true });
    schedule();
    const settle = window.setTimeout(schedule, 600);
    void document.fonts.ready.then(schedule);
    return () => { resize.disconnect(); mutation.disconnect(); cancelAnimationFrame(frame); clearTimeout(settle); };
  }, [measure]);

  useEffect(() => {
    const content = contentRef.current;
    const window = windowRef.current;
    if (!content || !window || !page) return;
    window.scrollTop = 0;
    if (layout.scroll) return;
    const origin = content.getBoundingClientRect().top;
    const saved: { element: HTMLElement; inert: boolean; hidden: string | null }[] = [];
    for (const element of content.querySelectorAll<HTMLElement>('*')) {
      if (!element.getClientRects().length || element.closest('[aria-hidden="true"]')) continue;
      const rect = element.getBoundingClientRect();
      if (!rect.height || !rect.width) continue;
      const top = rect.top - origin;
      const bottom = rect.bottom - origin;
      if (bottom <= page.start + 1 || top >= page.end - 1) {
        saved.push({ element, inert: element.inert, hidden: element.getAttribute('aria-hidden') });
        element.inert = true;
        element.setAttribute('aria-hidden', 'true');
      }
    }
    return () => {
      for (const item of saved) {
        item.element.inert = item.inert;
        if (item.hidden === null) item.element.removeAttribute('aria-hidden');
        else item.element.setAttribute('aria-hidden', item.hidden);
      }
    };
  }, [page, layout]);

  return (
    <div ref={rootRef} className={`demo-paged-viewport ${className}`} data-scroll-mode={layout.scroll || undefined} data-content-pages={layout.pages.length} data-content-page={activeIndex + 1}>
      <div ref={windowRef} id={id} className="demo-page-window" data-demo-viewport data-lenis-prevent style={{ '--demo-available-height': `${layout.height}px`, height: layout.height } as CSSProperties}>
        <div className="demo-page-clip" style={{ height: layout.scroll ? 'auto' : Math.min(layout.height, (page?.end ?? layout.height) - (page?.start ?? 0)) }}>
          <div ref={contentRef} className="demo-page-content" style={{ transform: layout.scroll ? 'none' : `translateY(-${page?.start ?? 0}px)` }}>{children}</div>
        </div>
      </div>
      {multiple && <nav className="demo-page-pagination" aria-label={`${label} 페이지`} onKeyDown={(event) => {
        if ((event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        event.preventDefault();
        event.stopPropagation();
        setPageIndex(Math.max(0, Math.min(layout.pages.length - 1, activeIndex + (event.key === 'ArrowRight' ? 1 : -1))));
      }}>
        <button type="button" aria-label="이전 내용" aria-controls={id} disabled={activeIndex === 0} onClick={() => setPageIndex(activeIndex - 1)}><ChevronLeft size={18} /><span>이전 내용</span></button>
        <span aria-live="polite">{activeIndex + 1} / {layout.pages.length}{layout.remaining[activeIndex] > 0 && <small> · 옵션 {layout.remaining[activeIndex]}개 더</small>}</span>
        <button type="button" aria-label="다음 내용" aria-controls={id} disabled={activeIndex === layout.pages.length - 1} onClick={() => setPageIndex(activeIndex + 1)}><span>다음 내용</span><ChevronRight size={18} /></button>
      </nav>}
    </div>
  );
}
