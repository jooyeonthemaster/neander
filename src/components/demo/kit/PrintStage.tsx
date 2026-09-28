'use client';

/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — printer stage
   결과가 나오면 화면 속 프린터에서 출력물(영수증/4×6 인화지)이 뽑혀 나온다.
   ───────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { renderPrint, type PrintMeta, type PrintSpec, type RenderedPrint } from './print';

type Stage = 'rendering' | 'printing' | 'done' | 'error';

/** 감열 프린터의 줄 단위 급지 느낌 — 일정 간격으로 끊어 움직인다 */
const lineFeed = (steps: number) => (t: number) => Math.min(1, Math.ceil(t * steps) / steps);

export function PrintStage({
  spec,
  meta,
  fileName,
  hold,
}: {
  spec: PrintSpec;
  meta: PrintMeta;
  fileName: string;
  /** 값이 있으면 출력을 멈추고 이 안내를 띄운다 (결과 공개 전) */
  hold?: string;
}) {
  const isPhoto = spec.kind === 'photo';
  const [print, setPrint] = useState<RenderedPrint | null>(null);
  const [stage, setStage] = useState<Stage>('rendering');
  const [run, setRun] = useState(0);
  const [renderAttempt, setRenderAttempt] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const venue = container.closest('.experience-venue[data-fit-viewport]');
    const viewport = container.closest('[data-demo-viewport]');
    const measure = () => {
      setAvailableWidth(container.clientWidth);
      // The page viewport owns this height. Measuring the print's own height would
      // repeatedly shrink its paper as the preview resizes.
      const height = venue
        ? Number.parseFloat(getComputedStyle(container).getPropertyValue('--demo-available-height'))
        : NaN;
      setAvailableHeight(Number.isFinite(height) && height > 0 ? height : null);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    if (venue) observer.observe(venue);
    if (viewport) observer.observe(viewport);
    // The viewport publishes its measured budget as a CSS variable. It can change
    // without changing the print's width (orientation, fullscreen or a new page).
    const mutationObserver = new MutationObserver(measure);
    if (venue) mutationObserver.observe(venue, { attributes: true, attributeFilter: ['style'] });
    if (viewport) mutationObserver.observe(viewport, { attributes: true, attributeFilter: ['style'] });
    measure();
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    renderPrint(spec, meta)
      .then((result) => {
        if (!alive) return;
        setPrint(result);
        setStage('printing');
      })
      .catch(() => {
        if (alive) setStage('error');
      });
    return () => {
      alive = false;
    };
  }, [spec, meta, renderAttempt]);

  // Fit the physical preview in both axes; renderPrint keeps the full export resolution.
  const paperRatio = print ? print.height / print.width : isPhoto ? 1.5 : 520 / 280;
  const widthLimit = Math.min(isPhoto ? 300 : 280, Math.max(160, (availableWidth ?? 348) - 48));
  const paperWidth = availableHeight === null
    ? widthLimit
    : Math.min(widthLimit, Math.max(56, availableHeight - 156) / paperRatio);
  const paperHeight = paperWidth * paperRatio;
  const printerWidth = availableHeight === null
    ? paperWidth + 44
    : Math.min(availableWidth ?? 348, Math.max(280, paperWidth + 44));
  const printMs = isPhoto ? 3400 : Math.min(4200, 1400 + paperHeight * 2.4);

  const replay = () => {
    setRun((n) => n + 1);
    setStage('printing');
  };

  return (
    <div ref={containerRef} data-demo-page-atomic className="demo-print-stage flex w-full min-w-0 flex-col items-center">
      {/* Printer body */}
      <div
        className="demo-printer-body relative z-10 flex h-14 items-center justify-between rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-700 to-slate-900 px-4 shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
        style={{ width: printerWidth }}
      >
        <span className="demo-printer-name text-[10px] font-bold tracking-[0.25em] text-slate-400">
          NEANDER {isPhoto ? 'PHOTO' : 'PRINT'}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          <motion.span
            className={cn('h-2 w-2 rounded-full', stage === 'done' ? 'bg-emerald-400' : 'bg-amber-400')}
            animate={stage === 'done' ? { opacity: 1 } : { opacity: [1, 0.25, 1] }}
            transition={{ duration: 0.8, repeat: stage === 'done' ? 0 : Infinity }}
          />
          {stage === 'error' ? '출력 준비 실패' : stage === 'done' ? '출력 완료' : hold ? '대기 중' : stage === 'printing' ? '출력 중' : '준비 중'}
        </span>
        {/* 급지구 */}
        <span className="absolute inset-x-3 -bottom-1 h-2 rounded-full bg-black shadow-inner" aria-hidden="true" />
      </div>

      {/* Paper — 급지구 아래로 밀려 나온다 */}
      <div className="demo-print-paper relative -mt-1 overflow-hidden px-6 pb-8" style={{ width: paperWidth + 48 }}>
        <div style={{ height: paperHeight }}>
          {print && !hold && (
            <motion.div
              key={run}
              initial={{ y: -paperHeight - 8 }}
              animate={{ y: 0 }}
              transition={{ duration: printMs / 1000, ease: isPhoto ? [0.45, 0, 0.55, 1] : lineFeed(28) }}
              onAnimationComplete={() => setStage('done')}
              className="relative origin-top"
              style={{ width: paperWidth }}
            >
              <motion.div
                animate={stage === 'done' ? { rotate: isPhoto ? -1.5 : 1, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                className={cn(
                  'relative',
                  isPhoto ? 'overflow-hidden rounded-[3px] shadow-[0_18px_40px_rgba(0,0,0,0.55)]' : 'drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]'
                )}
              >
                <motion.img
                  src={print.url}
                  alt={isPhoto ? '출력된 4×6 인화 사진' : '출력된 결과 영수증'}
                  width={paperWidth}
                  height={paperHeight}
                  className="block h-auto w-full select-none"
                  draggable={false}
                  // 인화지는 나오면서 색이 서서히 올라온다
                  initial={isPhoto ? { filter: 'saturate(0.1) brightness(1.45) contrast(0.6)' } : false}
                  animate={isPhoto ? { filter: 'saturate(1) brightness(1) contrast(1)' } : undefined}
                  transition={{ duration: 3.6, ease: 'easeOut', delay: 0.6 }}
                />
                {isPhoto && stage === 'done' && (
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: '0%' }}
                    animate={{ x: '400%' }}
                    transition={{ duration: 1.1, ease: 'easeInOut' }}
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            </motion.div>
          )}
          {(hold || (!print && stage === 'rendering')) && (
            <div className="flex h-full items-start justify-center pt-10 text-center text-xs text-slate-500">
              {hold ?? '출력물을 준비하고 있어요…'}
            </div>
          )}
        </div>
      </div>

      {stage === 'error' && <div className="demo-print-error" role="alert"><p>출력물을 만들지 못했어요. 다시 준비해 주세요.</p><button type="button" className="demo-primary-action" onClick={() => { setPrint(null); setStage('rendering'); setRenderAttempt((attempt) => attempt + 1); }}>출력 다시 준비하기</button></div>}
      {stage !== 'error' && (stage !== 'done' || !print || hold) && <div className="demo-print-controls"><button type="button" disabled className="demo-primary-action" aria-busy={!hold}>출력물 저장 · {hold ? '결과 공개 후 가능' : '준비 중'}</button></div>}
      <AnimatePresence>
        {stage === 'done' && print && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="demo-print-controls -mt-2 flex items-center gap-2"
          >
            <a
              href={print.url}
              download={fileName}
              className="demo-primary-action inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              출력물 저장
            </a>
            <button
              type="button"
              onClick={replay}
              className="demo-secondary-action min-h-11 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              다시 출력
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
