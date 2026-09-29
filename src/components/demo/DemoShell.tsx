'use client';

import { useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { smoothScrollIntoView } from '@/lib/smooth-scroll';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoModule, DemoAnswers } from '@/types/demo';
import { AnalyzingAnimation } from './AnalyzingAnimation';
import { answersSeed, getCapture } from './kit/core';
import { PrintStage } from './kit/PrintStage';
import type { PrintMeta } from './kit/print';
import { getExperienceDesign, readExperienceProfile, experienceDecisions } from '@/data/demo-experiences';
import { getDemoMockupTheme } from '@/data/demo-experiences/mockup-themes';
import { ExperienceWelcome, ExperienceBriefing, ExperienceStationGuide, ExperienceSummary, ExperienceProcessing } from './ExperienceVenue';
import { DemoViewport } from './DemoViewport';
import { DemoResultNotice } from './DemoResultNotice';
import { DemoResultContext } from './kit/ResultParts';
import { generateWithDeadline, requiredProfileCount, type DemoResultStatus } from '@/lib/demo-generation';
import { Link } from '@/i18n/navigation';
import { getServiceContactHref } from '@/lib/constants';

interface DemoShellProps {
  module: DemoModule;
  pillarColor: string;
  /** 출력물에 찍히는 서비스 이름 */
  serviceName?: string;
  renderHeader?: (progress: ReactNode) => ReactNode;
  detailLink?: ReactNode;
  disclaimer?: string;
  returnAction?: { label: string; onClick: () => void };
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

export function DemoShell({ module, pillarColor, serviceName = '', labels, renderHeader, detailLink, disclaimer, returnAction }: DemoShellProps) {
  const { config, StepComponents, ResultComponent, computeResult, generate } = module;
  const baseDesign = getExperienceDesign(config.targetSlug);
  const theme = getDemoMockupTheme(config.targetSlug);
  const design = useMemo(() => baseDesign ? { ...baseDesign, questions: baseDesign.questions.slice(0, requiredProfileCount(config.steps.length, baseDesign.questions.length)), accent: theme.accent, secondary: theme.secondary, background: theme.canvas } : baseDesign, [baseDesign, theme, config.steps.length]);
  const profileOffset = design ? design.questions.length + 1 : 0;
  const totalSteps = config.steps.length + profileOffset;
  const experienceColor = design?.accent ?? pillarColor;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<DemoAnswers>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultKey, setResultKey] = useState('');
  // module.generate가 돌려준 AI 결과
  const [generated, setGenerated] = useState<unknown>(undefined);
  const [resultStatus, setResultStatus] = useState<DemoResultStatus>('example');
  const hasAiResult = resultStatus === 'ai';
  const generationController = useRef<AbortController | null>(null);
  // 분석을 시작할 때마다 올린다 — 뒤로 가기·다시 하기 뒤에 늦게 도착한 결과를 버린다
  const runRef = useRef(0);
  // 결과가 나온 시각 — 출력물에 인쇄된다
  const [resultAt, setResultAt] = useState<Date | null>(null);
  // printAfterReveal 데모는 결과 화면에서 공개 동작을 해야 출력이 시작된다
  const [revealed, setRevealed] = useState(false);
  const onReveal = useCallback(() => setRevealed(true), [setRevealed]);
  const [direction, setDirection] = useState(1);
  const [resultTab, setResultTab] = useState<'result' | 'guide' | 'print'>('result');
  const [printOpened, setPrintOpened] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isWelcome = !!design && currentStep === 0;
  const isBriefing = !!design && currentStep > 0 && currentStep < profileOffset;
  const step = config.steps[currentStep - profileOffset];
  const canProceed = isWelcome ? true : isBriefing && design
    ? !!readExperienceProfile(design, answers.experienceProfile)[design.questions[currentStep - 1].id]
    : step ? step.canProceed(answers) : false;

  useEffect(() => () => { runRef.current++; generationController.current?.abort(); }, []);

  const blockedReason = canProceed || isAnalyzing || showResult ? undefined : isBriefing
    ? '선택지를 하나 골라주세요.'
    : step?.getBlockedReason?.(answers) ?? '위 항목을 선택하거나 입력해 주세요.';

  const onUpdate = useCallback((stepId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [stepId]: value }));
  }, [setAnswers]);

  const startGeneration = useCallback((retry = false) => {
    generationController.current?.abort();
    const controller = new AbortController();
    generationController.current = controller;
    const input = retry ? answers : { ...answers, __demoRunId: crypto.randomUUID() };
    setAnswers(input);
    setPrintOpened(false);
    setResultTab('result');
    setDirection(1);
    setShowResult(false);
    setIsAnalyzing(true);
    const runId = ++runRef.current;
    void generateWithDeadline(async () => {
      const [data] = await Promise.all([
        generate ? generate(input) : Promise.resolve(null),
        new Promise((resolve) => setTimeout(resolve, Math.min(config.analyzeDurationMs, 2000))),
      ]);
      return data;
    }, { signal: controller.signal }).then((result) => {
      if (runRef.current !== runId) return;
      setResultKey(computeResult(input));
      setGenerated(result.data);
      setResultStatus(result.status);
      setResultAt(new Date());
      setRevealed(false);
      setIsAnalyzing(false);
      setShowResult(true);
    });
  }, [answers, generate, config.analyzeDurationMs, computeResult]);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else startGeneration();
  }, [currentStep, totalSteps, startGeneration]);

  const goPrev = useCallback(() => {
    if (showResult || isAnalyzing) {
      runRef.current++;
      generationController.current?.abort();
      setShowResult(false);
      setIsAnalyzing(false);
      setDirection(-1);
      setCurrentStep(totalSteps - 1);
    } else if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep, showResult, isAnalyzing, totalSteps,
    setShowResult, setIsAnalyzing, setDirection, setCurrentStep]);

  const restart = useCallback(() => {
    runRef.current++;
    generationController.current?.abort();
    setAnswers({});
    setGenerated(undefined);
    setShowResult(false);
    setIsAnalyzing(false);
    setResultKey('');
    setDirection(-1);
    setCurrentStep(0);
    setResultTab('result');
    setPrintOpened(false);
  }, [setAnswers, setGenerated, setShowResult, setIsAnalyzing, setResultKey, setDirection, setCurrentStep, setResultTab]);

  // 화면(단계·분석·결과)이 바뀔 때 데모 윗부분이 화면 위로 지나가 있으면 다시 보이게 올린다.
  // 결과 화면이 길어서, 아래쪽 '다시 체험하기'를 누르면 짧은 1단계가 화면 밖(위)에 그려졌다.
  const viewKey = showResult ? 'result' : isAnalyzing ? 'analyzing' : `step-${currentStep}`;
  const lastViewKeyRef = useRef(viewKey);
  useEffect(() => {
    if (lastViewKeyRef.current === viewKey) return;
    lastViewKeyRef.current = viewKey;
    const root = rootRef.current;
    // 고정 헤더(64px) 아래로 데모 시작점이 보이지 않을 때만
    if (root && !root.closest('[data-fit-viewport]') && root.getBoundingClientRect().top < 64) {
      smoothScrollIntoView(root, { block: 'start' });
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
    () => {
      const spec = showResult && module.getPrint ? module.getPrint(answers, resultKey, generated) : null;
      if (!spec || !design) return spec;
      const decisions = experienceDecisions(design, answers.experienceProfile);
      if (spec.kind === 'receipt') return {
        ...spec,
        sections: [...spec.sections, { type: 'list' as const, title: '나의 체험 설정 · 맞춤 가이드', items: decisions.map((item) => `${item.label}: ${item.outcome}`) }],
        footer: [spec.footer, hasAiResult ? '' : '체험 예시 · 선택 기반 가이드'].filter(Boolean).join(' · '),
      };
      return { ...spec, caption: [spec.caption, decisions.map((item) => item.label).join(' / '), hasAiResult ? '' : '체험 예시'].filter(Boolean).join(' · ') };
    },
    [showResult, module, answers, resultKey, generated, design, hasAiResult]
  );
  const printMeta = useMemo<PrintMeta | null>(
    () =>
      resultAt
        ? {
            serviceName,
            serial: `No.${String(answersSeed(answers) % 10000).padStart(4, '0')}`,
            date: resultAt,
            accent: experienceColor,
          }
        : null,
    [resultAt, serviceName, answers, experienceColor]
  );
  const printFileName = resultAt
    ? `neander-${config.targetSlug}-${resultAt.getFullYear()}${String(resultAt.getMonth() + 1).padStart(2, '0')}${String(resultAt.getDate()).padStart(2, '0')}.${printSpec?.kind === 'photo' ? 'jpg' : 'png'}`
    : 'neander-print.png';
  const showPrint = showResult && printSpec && printMeta;

  const progress = showResult || isAnalyzing
    ? 100
    : (currentStep / totalSteps) * 100;

  const StepComponent = StepComponents[currentStep - profileOffset];

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative mx-auto w-full scroll-mt-16 lg:scroll-mt-20',
        // 출력물이 있는 결과 화면은 출력물 + 상세 리포트 2단으로 넓힌다
        design ? 'venue-shell' : showPrint ? 'max-w-2xl px-4 py-6 lg:max-w-6xl' : 'max-w-2xl px-4 py-6 lg:max-w-3xl'
      )}
      data-demo-slug={config.targetSlug}
      data-demo-view={viewKey}
      data-demo-scene={isWelcome ? 'welcome' : isBriefing ? 'question' : showResult ? 'result' : isAnalyzing ? 'processing' : 'activity'}
    >
      {/* Progress bar */}
      {renderHeader ? renderHeader(
        <div className="mockup-progress" role="status" aria-label={showResult ? labels.complete : isAnalyzing ? labels.analyzing : isWelcome ? '체험 소개' : `${totalSteps - (design ? 1 : 0)}개 입력 중 ${currentStep}번째`}>
          {showResult ? <b>{labels.complete}</b> : isAnalyzing ? <b className="mockup-progress-pending">준비 중</b> : isWelcome ? <b>시작하기</b> : <><b>{String(currentStep).padStart(2, '0')}</b><span>/ {String(totalSteps - (design ? 1 : 0)).padStart(2, '0')}</span></>}
        </div>
      ) : design ? (
        <nav className="venue-wayfinding" aria-label="체험 진행 순서">
          <span className="venue-wayfinding-label">{showResult ? 'TAKE YOUR EXPERIENCE' : isAnalyzing ? 'MAKING YOUR EXPERIENCE' : isBriefing ? 'MAKE IT YOURS' : 'IN THE EXPERIENCE'}</span>
          <ol>{Array.from({ length: totalSteps }, (_, index) => (
            <li key={index} aria-current={!showResult && !isAnalyzing && currentStep === index ? 'step' : undefined} data-state={showResult || currentStep > index ? 'complete' : currentStep === index ? 'current' : 'upcoming'}>
              <i aria-hidden="true" /><span className="sr-only">{index === 0 ? '체험 소개' : index < profileOffset ? design.questions[index - 1]?.label : config.steps[index - profileOffset]?.titleKey}</span>
            </li>
          ))}</ol>
          <small>{showResult ? labels.complete : `${currentStep + 1} / ${totalSteps}`}</small>
        </nav>
      ) : <div className="mb-6 sm:mb-8" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
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
      </div>}

      {/* Content area with ARIA live region */}
      <div className="venue-view" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Analyzing state */}
          {isAnalyzing && !showResult && (
            <motion.div
              key="analyzing"
              className="venue-view-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {design ? <DemoViewport mode="scroll" label="진행 안내"><ExperienceProcessing design={design} answers={answers} onCancel={goPrev} /></DemoViewport> : <AnalyzingAnimation
                emoji={config.analyzeEmoji}
                title={labels.analyzing}
                subtitle={labels.analyzingSubtitle}
                messages={config.analyzeMessages}
                durationMs={config.analyzeDurationMs}
                aiWait={!!generate}
                image={
                  config.analyzeImageStepId
                    ? getCapture(answers, config.analyzeImageStepId)?.image
                    : undefined
                }
              />}
            </motion.div>
          )}

          {/* Result */}
          {showResult && (
            <motion.div
              key="result"
              className="venue-view-panel venue-result-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: TRANSITION_EASE }}
            >
              <div className="venue-result-tabs" role="tablist" aria-label="결과 보기" onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
                const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
                if (current < 0) return;
                event.preventDefault();
                event.stopPropagation();
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                tabs[next]?.click();
                tabs[next]?.focus();
              }}>
                <button id="demo-result-tab" type="button" role="tab" aria-selected={resultTab === 'result'} aria-controls="demo-result-panel" onClick={() => setResultTab('result')}>체험 결과</button>
                {design && <button id="demo-guide-tab" type="button" role="tab" aria-selected={resultTab === 'guide'} aria-controls="demo-guide-panel" onClick={() => setResultTab('guide')}>맞춤 가이드</button>}
                {showPrint && <button id="demo-print-tab" type="button" role="tab" aria-selected={resultTab === 'print'} aria-controls="demo-print-panel" onClick={() => { setPrintOpened(true); setResultTab('print'); }}>출력물 저장</button>}
              </div>
              <div id="demo-result-panel" role="tabpanel" aria-labelledby="demo-result-tab" className="venue-result-tab-panel" hidden={resultTab !== 'result'}>
                <DemoViewport focused label="체험 결과"><DemoResultNotice status={resultStatus} onRetry={() => startGeneration(true)} /><DemoResultContext.Provider value={{ status: resultStatus, slug: config.targetSlug }}><div className="venue-result-content"><ResultComponent resultKey={resultKey} answers={answers} onRestart={restart} pillarColor={experienceColor} onReveal={onReveal} generated={generated} resultStatus={resultStatus} /></div></DemoResultContext.Provider></DemoViewport>
              </div>
              {design && <div id="demo-guide-panel" role="tabpanel" aria-labelledby="demo-guide-tab" className="venue-result-tab-panel" hidden={resultTab !== 'guide'}><DemoViewport focused label="맞춤 가이드"><ExperienceSummary design={design} answers={answers} generated={hasAiResult} /></DemoViewport></div>}
              {showPrint && (
                <div id="demo-print-panel" role="tabpanel" aria-labelledby="demo-print-tab" className="venue-result-tab-panel" hidden={resultTab !== 'print'}>
                  <DemoViewport mode="scroll" label="출력물">
                    {printOpened && <PrintStage
                      spec={printSpec}
                      meta={printMeta}
                      fileName={printFileName}
                      hold={config.printAfterReveal && !revealed ? config.printAfterReveal : undefined}
                    />}
                  </DemoViewport>
                </div>
              )}
            </motion.div>
          )}

          {/* Quiz steps */}
          {!isAnalyzing && !showResult && (StepComponent || isBriefing || isWelcome) && (
            <motion.div
              key={step?.id ?? currentStep}
              className="venue-view-panel"
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.35, ease: TRANSITION_EASE }}
            >
              {isWelcome && design ? <ExperienceWelcome design={design} slug={config.targetSlug} /> : isBriefing && design ? (
                <ExperienceBriefing design={design} slug={config.targetSlug} answers={answers} onUpdate={onUpdate} questionIndex={currentStep - 1} />
              ) : <div className={design ? 'venue-station-grid' : undefined}>
              {design && <ExperienceStationGuide design={design} slug={config.targetSlug} answers={answers} stepTitle={step?.titleKey ?? ''} />}
              <div className={design ? 'venue-workspace' : undefined}>
              {/* 질문 문구 (각 데모 config의 steps에 정의돼 있다) */}
              {step && (step.titleKey || step.subtitleKey) && (
                <div className="demo-step-heading mb-6 text-center sm:mb-8">
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
              {StepComponent && <DemoViewport label={step?.titleKey}><StepComponent answers={answers} onUpdate={onUpdate} /></DemoViewport>}
              </div>
              </div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* A single persistent footer: details on the left, step controls on the right. */}
      <footer className={design ? 'venue-navigation' : 'mt-8 flex items-center justify-between'}>
        <div className="mockup-footer-info">
          {showResult ? <div className="demo-quote-wrap">{returnAction ? (
            <button type="button" onClick={returnAction.onClick} className="demo-quote-cta" data-demo-return>{returnAction.label}<span aria-hidden="true">↩</span></button>
          ) : <><Link href={getServiceContactHref(config.targetSlug)} className="demo-quote-cta" data-demo-quote-cta>이 체험을 우리 행사에<span aria-hidden="true">→</span></Link><p className="mockup-disclaimer">견적 계산기에 이 체험이 담긴 채로 열립니다</p></>}</div> : detailLink}
          {isWelcome && !showResult && !isAnalyzing && disclaimer && <p className="mockup-disclaimer">{disclaimer}</p>}
        </div>
        <div className="mockup-step-actions">
          {blockedReason && <p id="demo-blocked-reason" className="demo-blocked-reason" role="status">{blockedReason}</p>}
          <button
            type="button"
            onClick={goPrev}
            disabled={!showResult && !isAnalyzing && currentStep === 0}
            aria-label={showResult || isAnalyzing ? '입력으로 돌아가기' : labels.back}
            className="mockup-back"
          >
            {showResult || isAnalyzing ? '입력 수정' : labels.back}
          </button>
          {showResult ? <button type="button" onClick={restart} className="mockup-next" data-restart>다시 체험하기</button> : (
            <motion.button
              type="button"
              onClick={goNext}
              disabled={!canProceed || isAnalyzing}
              whileTap={canProceed && !isAnalyzing ? { scale: 0.98 } : undefined}
              className="mockup-next"
              aria-label={isAnalyzing ? labels.analyzing : isWelcome ? '체험 시작' : isBriefing ? currentStep === profileOffset - 1 ? '이 설정으로 체험 시작' : '다음 질문' : currentStep === totalSteps - 1 ? labels.seeResult : labels.next}
              aria-describedby={blockedReason ? 'demo-blocked-reason' : undefined}
              data-primary="true"
            >
              {isAnalyzing ? '준비 중' : isWelcome ? '체험 시작' : currentStep === totalSteps - 1 ? labels.seeResult : labels.next}
            </motion.button>
          )}
        </div>
      </footer>
    </div>
  );
}
