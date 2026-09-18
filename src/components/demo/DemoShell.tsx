'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoModule, DemoAnswers } from '@/types/demo';
import { AnalyzingAnimation } from './AnalyzingAnimation';
import { answersSeed, getCapture } from './kit/core';
import { PrintStage } from './kit/PrintStage';
import type { PrintMeta } from './kit/print';

interface DemoShellProps {
  module: DemoModule;
  pillarColor: string;
  /** 출력물에 찍히는 서비스 이름 */
  serviceName?: string;
  labels: {
    back: string;
    next: string;
    seeResult: string;
    analyzing: string;
    analyzingSubtitle: string;
    complete: string;
  };
}

const TRANSITION_EASE = [0.25, 0.1, 0.25, 1] as const;

// 방향키를 스스로 쓰는 요소(입력창·슬라이더·라디오·탭 등)에 포커스가 있으면 단계 이동을 하지 않는다
const ARROW_KEY_OWNER_SELECTOR = [
  'input', 'textarea', 'select', '[contenteditable]:not([contenteditable="false"])',
  ...['slider', 'spinbutton', 'radio', 'radiogroup', 'tab', 'tablist', 'listbox', 'option',
    'menu', 'menubar', 'menuitem', 'menuitemradio', 'menuitemcheckbox', 'combobox',
    'textbox', 'searchbox', 'grid', 'treegrid', 'tree', 'treeitem', 'scrollbar',
  ].map((role) => `[role="${role}"]`),
].join(',');

function isArrowKeyOwner(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(ARROW_KEY_OWNER_SELECTOR) !== null;
}

export function DemoShell({ module, pillarColor, serviceName = '', labels }: DemoShellProps) {
  const { config, StepComponents, ResultComponent, computeResult } = module;
  const totalSteps = config.steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<DemoAnswers>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultKey, setResultKey] = useState('');
  // 결과가 나온 시각 — 출력물에 인쇄된다
  const [resultAt, setResultAt] = useState<Date | null>(null);
  // printAfterReveal 데모는 결과 화면에서 공개 동작을 해야 출력이 시작된다
  const [revealed, setRevealed] = useState(false);
  const onReveal = useCallback(() => setRevealed(true), []);
  const [direction, setDirection] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);

  const step = config.steps[currentStep];
  const canProceed = step ? step.canProceed(answers) : false;

  const onUpdate = useCallback((stepId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [stepId]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      // Last step -> analyze
      setDirection(1);
      setIsAnalyzing(true);
      setTimeout(() => {
        const key = computeResult(answers);
        setResultKey(key);
        setResultAt(new Date());
        setRevealed(false);
        setIsAnalyzing(false);
        setShowResult(true);
      }, config.analyzeDurationMs);
    }
  }, [currentStep, totalSteps, answers, computeResult, config.analyzeDurationMs]);

  const goPrev = useCallback(() => {
    if (showResult || isAnalyzing) {
      setShowResult(false);
      setIsAnalyzing(false);
      setDirection(-1);
      setCurrentStep(totalSteps - 1);
    } else if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep, showResult, isAnalyzing, totalSteps]);

  const restart = useCallback(() => {
    setAnswers({});
    setShowResult(false);
    setIsAnalyzing(false);
    setResultKey('');
    setDirection(-1);
    setCurrentStep(0);
  }, []);

  // 화면(단계·분석·결과)이 바뀔 때 데모 윗부분이 화면 위로 지나가 있으면 다시 보이게 올린다.
  // 결과 화면이 길어서, 아래쪽 '다시 체험하기'를 누르면 짧은 1단계가 화면 밖(위)에 그려졌다.
  const viewKey = showResult ? 'result' : isAnalyzing ? 'analyzing' : `step-${currentStep}`;
  const lastViewKeyRef = useRef(viewKey);
  useEffect(() => {
    if (lastViewKeyRef.current === viewKey) return;
    lastViewKeyRef.current = viewKey;
    const root = rootRef.current;
    // 고정 헤더(64px) 아래로 데모 시작점이 보이지 않을 때만
    if (root && root.getBoundingClientRect().top < 64) {
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [viewKey]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (isArrowKeyOwner(e.target)) return;

      // 포커스가 데모 안에 있을 때, 또는 포커스가 없고(body) 데모가 화면에 보일 때만 반응한다
      const root = rootRef.current;
      if (!root) return;
      const active = document.activeElement;
      const focusInside = active !== null && root.contains(active);
      const focusIdle = active === null || active === document.body;
      if (!focusInside) {
        if (!focusIdle) return;
        const rect = root.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      }

      if (e.key === 'ArrowRight' && canProceed && !showResult && !isAnalyzing) {
        goNext();
      } else if (e.key === 'ArrowLeft' && !isAnalyzing) {
        goPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canProceed, showResult, isAnalyzing, goNext, goPrev]);

  // 결과 출력물 (영수증 / 4×6 인화지) — 모듈이 제공할 때만
  const printSpec = useMemo(
    () => (showResult && module.getPrint ? module.getPrint(answers, resultKey) : null),
    [showResult, module, answers, resultKey]
  );
  const printMeta = useMemo<PrintMeta | null>(
    () =>
      resultAt
        ? {
            serviceName,
            serial: `No.${String(answersSeed(answers) % 10000).padStart(4, '0')}`,
            date: resultAt,
            accent: pillarColor,
          }
        : null,
    [resultAt, serviceName, answers, pillarColor]
  );
  const printFileName = resultAt
    ? `neander-${config.targetSlug}-${resultAt.getFullYear()}${String(resultAt.getMonth() + 1).padStart(2, '0')}${String(resultAt.getDate()).padStart(2, '0')}.${printSpec?.kind === 'photo' ? 'jpg' : 'png'}`
    : 'neander-print.png';
  const showPrint = showResult && printSpec && printMeta;

  const progress = showResult || isAnalyzing
    ? 100
    : (currentStep / totalSteps) * 100;

  const StepComponent = StepComponents[currentStep];

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative mx-auto w-full max-w-2xl scroll-mt-16 px-4 py-6 lg:scroll-mt-20',
        // 출력물이 있는 결과 화면은 출력물 + 상세 리포트 2단으로 넓힌다
        showPrint ? 'lg:max-w-6xl' : 'lg:max-w-3xl'
      )}
    >
      {/* Progress bar */}
      <div className="mb-6 sm:mb-8" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">
            {showResult ? labels.complete : `${currentStep + 1} / ${totalSteps}`}
          </span>
          <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Content area with ARIA live region */}
      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Analyzing state */}
          {isAnalyzing && !showResult && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnalyzingAnimation
                emoji={config.analyzeEmoji}
                title={labels.analyzing}
                subtitle={labels.analyzingSubtitle}
                messages={config.analyzeMessages}
                durationMs={config.analyzeDurationMs}
                image={
                  config.analyzeImageStepId
                    ? getCapture(answers, config.analyzeImageStepId)?.image
                    : undefined
                }
              />
            </motion.div>
          )}

          {/* Result */}
          {showResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: TRANSITION_EASE }}
            >
              {showPrint ? (
                <div className="grid items-start gap-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-12">
                  <div>
                    <PrintStage
                      spec={printSpec}
                      meta={printMeta}
                      fileName={printFileName}
                      hold={config.printAfterReveal && !revealed ? config.printAfterReveal : undefined}
                    />
                  </div>
                  <div className="min-w-0">
                    <ResultComponent
                      resultKey={resultKey}
                      answers={answers}
                      onRestart={restart}
                      pillarColor={pillarColor}
                      onReveal={onReveal}
                    />
                  </div>
                </div>
              ) : (
                <ResultComponent
                  resultKey={resultKey}
                  answers={answers}
                  onRestart={restart}
                  pillarColor={pillarColor}
                  onReveal={onReveal}
                />
              )}
            </motion.div>
          )}

          {/* Quiz steps */}
          {!isAnalyzing && !showResult && StepComponent && (
            <motion.div
              key={step?.id ?? currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.35, ease: TRANSITION_EASE }}
            >
              {/* 질문 문구 (각 데모 config의 steps에 정의돼 있다) */}
              {step && (step.titleKey || step.subtitleKey) && (
                <div className="mb-6 text-center sm:mb-8">
                  {step.titleKey && (
                    <h2 className="font-display text-2xl font-bold text-white [word-break:keep-all] sm:text-3xl lg:text-4xl">
                      {step.titleKey}
                    </h2>
                  )}
                  {step.subtitleKey && (
                    <p className="mt-2 text-sm text-slate-400 lg:text-base">
                      {step.subtitleKey}
                    </p>
                  )}
                </div>
              )}
              <StepComponent answers={answers} onUpdate={onUpdate} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!showResult && !isAnalyzing && (
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStep === 0}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
              currentStep === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            )}
            aria-label={labels.back}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {labels.back}
          </button>

          <motion.button
            type="button"
            onClick={goNext}
            disabled={!canProceed}
            whileHover={canProceed ? { scale: 1.03 } : undefined}
            whileTap={canProceed ? { scale: 0.97 } : undefined}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
              canProceed
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            )}
            aria-label={currentStep === totalSteps - 1 ? labels.seeResult : labels.next}
          >
            {currentStep === totalSteps - 1 ? labels.seeResult : labels.next}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      )}
    </div>
  );
}
