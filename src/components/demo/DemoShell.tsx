'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoModule, DemoAnswers } from '@/types/demo';
import { AnalyzingAnimation } from './AnalyzingAnimation';

interface DemoShellProps {
  module: DemoModule;
  pillarColor: string;
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

export function DemoShell({ module, pillarColor, labels }: DemoShellProps) {
  const { config, StepComponents, ResultComponent, computeResult } = module;
  const totalSteps = config.steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<DemoAnswers>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultKey, setResultKey] = useState('');
  const [direction, setDirection] = useState(1);

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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && canProceed && !showResult && !isAnalyzing) {
        goNext();
      } else if (e.key === 'ArrowLeft' && !isAnalyzing) {
        goPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canProceed, showResult, isAnalyzing, goNext, goPrev]);

  const progress = showResult || isAnalyzing
    ? 100
    : (currentStep / totalSteps) * 100;

  const StepComponent = StepComponents[currentStep];

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12 sm:py-16">
      {/* Progress bar */}
      <div className="mb-10" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
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
              <ResultComponent
                resultKey={resultKey}
                answers={answers}
                onRestart={restart}
                pillarColor={pillarColor}
              />
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
              <StepComponent answers={answers} onUpdate={onUpdate} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!showResult && !isAnalyzing && (
        <div className="mt-10 flex items-center justify-between">
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
