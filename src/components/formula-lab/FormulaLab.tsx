'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useFormulaLabStore } from '@/stores/formulaLabStore';
import { generateFormulaResults } from '@/data/formula-lab-engine';
import { PROCESSING_STAGES, type BrandBrief } from '@/data/formula-lab-data';
import { BrandBriefForm } from './BrandBriefForm';
import { ProcessingView } from './ProcessingView';
import { ResultsDashboard } from './ResultsDashboard';

// 취소 가능한 대기: abort 되면 타이머를 지우고 바로 풀린다
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>(resolve => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
  });
}

export function FormulaLab() {
  const tErrors = useTranslations('errors.404');
  const {
    step, setStep, setBrief, setResults,
    setProcessingStage, setProcessingProgress, reset,
  } = useFormulaLabStore();

  // Hide the main site Header/Footer — standalone experience
  useEffect(() => {
    const siteHeader = document.body.querySelector(':scope > header');
    const siteFooter = document.body.querySelector(':scope > footer');
    const siteMain = document.body.querySelector(':scope > main');

    if (siteHeader) (siteHeader as HTMLElement).style.display = 'none';
    if (siteFooter) (siteFooter as HTMLElement).style.display = 'none';
    if (siteMain) (siteMain as HTMLElement).style.paddingTop = '0';

    return () => {
      if (siteHeader) (siteHeader as HTMLElement).style.display = '';
      if (siteFooter) (siteFooter as HTMLElement).style.display = '';
      if (siteMain) (siteMain as HTMLElement).style.paddingTop = '';
    };
  }, []);

  // 진행 중인 처리 루프. New Brief·언마운트 시 abort 해서
  // 이전 실행이 뒤늦게 setStep('results') 로 새 입력 화면을 덮어쓰지 않게 한다
  const runRef = useRef<AbortController | null>(null);

  const cancelRun = useCallback(() => {
    runRef.current?.abort();
    runRef.current = null;
  }, []);

  const handleReset = useCallback(() => {
    cancelRun();
    reset();
  }, [cancelRun, reset]);

  useEffect(() => () => {
    cancelRun();
    // 처리 도중 페이지를 떠나면 스토어가 'processing' 에 멈춰 있지 않도록 초기화
    if (useFormulaLabStore.getState().step === 'processing') useFormulaLabStore.getState().reset();
  }, [cancelRun]);

  const handleSubmit = useCallback(async (brief: BrandBrief) => {
    cancelRun();
    const run = new AbortController();
    runRef.current = run;
    const { signal } = run;

    setBrief(brief);
    setStep('processing');
    setProcessingStage(0);
    setProcessingProgress(0);

    // Simulate multi-stage AI processing
    for (let i = 0; i < PROCESSING_STAGES.length; i++) {
      if (signal.aborted) return;
      setProcessingStage(i);
      const duration = PROCESSING_STAGES[i].duration;
      const steps = 60;
      const interval = duration / steps;

      for (let s = 0; s <= steps; s++) {
        await wait(interval, signal);
        if (signal.aborted) return;
        setProcessingProgress(Math.round((s / steps) * 100));
      }
    }

    // Generate results
    const results = generateFormulaResults(brief);
    setResults(results);

    // Brief pause before showing results
    await wait(600, signal);
    if (signal.aborted) return;
    setStep('results');
    runRef.current = null;
  }, [cancelRun, setBrief, setStep, setProcessingStage, setProcessingProgress, setResults]);

  // 단계가 바뀌면 맨 위에서 시작 (폼 하단에서 제출해도 결과가 중간부터 보이지 않게).
  // 이전 화면이 사라진 뒤(mode="wait" 의 exit 완료 시점)에 올려서 사라지는 화면이 튀지 않게 한다.
  // html 의 scroll-behavior: smooth 를 타지 않도록 instant 로 즉시 이동
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <button type="button" onClick={handleReset} className="flex items-center gap-3 group cursor-pointer shrink-0">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-neutral-950 uppercase">
              ON<span className="text-teal-600">SCENT</span>
            </span>
            {/* 모바일에서는 우측 링크 자리를 위해 라벨 숨김 */}
            <span className="hidden sm:inline text-neutral-300 text-xs">|</span>
            <span className="hidden sm:inline text-xs font-medium text-neutral-500 tracking-widest uppercase">
              AI Formula Lab
            </span>
          </button>

          <div className="flex items-center gap-4 sm:gap-5">
            {step !== 'input' && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleReset}
                className="text-xs font-medium text-neutral-400 hover:text-teal-600 transition-colors tracking-wide uppercase cursor-pointer whitespace-nowrap"
              >
                New Brief
              </motion.button>
            )}
            {/* 사이트로 돌아갈 길 (헤더·푸터를 숨기기 때문에 반드시 필요하다) */}
            <Link
              href="/"
              className="text-xs font-medium text-neutral-400 hover:text-teal-600 transition-colors tracking-wide uppercase whitespace-nowrap"
            >
              {tErrors('backToHome')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content — 사이트 레이아웃이 이미 <main> 으로 감싸므로 div 사용 */}
      <div className="pt-16">
        <AnimatePresence mode="wait" onExitComplete={scrollToTop}>
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <BrandBriefForm onSubmit={handleSubmit} />
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
            >
              <ProcessingView />
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <ResultsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
