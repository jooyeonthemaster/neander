'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { quizSteps, scentProfiles, type ScentProfile } from '@/data/scent-quiz';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ScentResult } from './ScentResult';

type Answers = Record<string, string[]>;

const TOTAL_STEPS = 5; // 4 quiz steps + 1 result

const MOOD_GRADIENTS: Record<string, string> = {
  calm: 'from-sky-400 to-teal-300',
  energetic: 'from-amber-400 to-orange-400',
  romantic: 'from-rose-400 to-pink-300',
  mysterious: 'from-indigo-500 to-violet-400',
};

export function ScentQuiz() {
  const t = useTranslations('scentQuiz');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [intensity, setIntensity] = useState(5);
  const [showResult, setShowResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const step = quizSteps[currentStep] as (typeof quizSteps)[number] | undefined;

  const toggleAnswer = useCallback(
    (stepId: string, optionValue: string, maxSelect: number) => {
      setAnswers((prev) => {
        const current = prev[stepId] ?? [];
        if (current.includes(optionValue)) {
          return { ...prev, [stepId]: current.filter((v) => v !== optionValue) };
        }
        if (current.length >= maxSelect) {
          // Replace the oldest selection
          return { ...prev, [stepId]: [...current.slice(1), optionValue] };
        }
        return { ...prev, [stepId]: [...current, optionValue] };
      });
    },
    []
  );

  const canProceed = useMemo(() => {
    if (!step) return false;
    if (step.type === 'intensity') return true;
    const stepAnswers = answers[step.id] ?? [];
    return stepAnswers.length > 0;
  }, [step, answers]);

  const goNext = useCallback(() => {
    if (currentStep < quizSteps.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      // Last quiz step -> show result
      setIsAnalyzing(true);
      setDirection(1);
      setCurrentStep(quizSteps.length);
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResult(true);
      }, 2500);
    }
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (showResult || isAnalyzing) {
      setShowResult(false);
      setIsAnalyzing(false);
      setDirection(-1);
      setCurrentStep(quizSteps.length - 1);
    } else if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep, showResult, isAnalyzing]);

  const restart = useCallback(() => {
    setAnswers({});
    setIntensity(5);
    setShowResult(false);
    setIsAnalyzing(false);
    setDirection(-1);
    setCurrentStep(0);
  }, []);

  // Determine result scent profile
  const resultProfile = useMemo((): ScentProfile => {
    const mood = answers['mood']?.[0] ?? 'calm';
    const colors = answers['color'] ?? [];
    const memories = answers['memory'] ?? [];

    // Simple scoring algorithm
    const scoreMap: Record<string, number> = {};
    scentProfiles.forEach((p) => {
      scoreMap[p.name] = 0;
    });

    // Mood-based scoring
    const moodMapping: Record<string, string[]> = {
      calm: ['Aurora Mist', 'Crystal Garden'],
      energetic: ['Citrus Wave'],
      romantic: ['Velvet Bloom', 'Crystal Garden'],
      mysterious: ['Midnight Ember', 'Terra Noir'],
    };
    (moodMapping[mood] ?? []).forEach((name) => {
      scoreMap[name] = (scoreMap[name] ?? 0) + 3;
    });

    // Color-based scoring
    const colorMapping: Record<string, string[]> = {
      rose: ['Velvet Bloom'],
      amber: ['Midnight Ember', 'Terra Noir'],
      teal: ['Aurora Mist', 'Crystal Garden'],
      violet: ['Midnight Ember'],
      sky: ['Citrus Wave', 'Aurora Mist'],
      lime: ['Citrus Wave', 'Crystal Garden'],
      slate: ['Terra Noir'],
      cream: ['Crystal Garden', 'Velvet Bloom'],
    };
    colors.forEach((c) => {
      (colorMapping[c] ?? []).forEach((name) => {
        scoreMap[name] = (scoreMap[name] ?? 0) + 2;
      });
    });

    // Memory-based scoring
    const memoryMapping: Record<string, string[]> = {
      beachMorning: ['Citrus Wave', 'Aurora Mist'],
      forestRain: ['Terra Noir', 'Crystal Garden'],
      oldLibrary: ['Midnight Ember', 'Terra Noir'],
      nightCity: ['Midnight Ember'],
      warmCafe: ['Velvet Bloom', 'Aurora Mist'],
      springGarden: ['Crystal Garden', 'Velvet Bloom'],
    };
    memories.forEach((m) => {
      (memoryMapping[m] ?? []).forEach((name) => {
        scoreMap[name] = (scoreMap[name] ?? 0) + 2;
      });
    });

    // Intensity modifier
    if (intensity <= 3) {
      scoreMap['Aurora Mist'] = (scoreMap['Aurora Mist'] ?? 0) + 2;
      scoreMap['Crystal Garden'] = (scoreMap['Crystal Garden'] ?? 0) + 2;
    } else if (intensity >= 7) {
      scoreMap['Midnight Ember'] = (scoreMap['Midnight Ember'] ?? 0) + 2;
      scoreMap['Terra Noir'] = (scoreMap['Terra Noir'] ?? 0) + 2;
    }

    // Find highest
    let best = scentProfiles[0]!;
    let bestScore = -1;
    scentProfiles.forEach((p) => {
      const s = scoreMap[p.name] ?? 0;
      if (s > bestScore) {
        bestScore = s;
        best = p;
      }
    });

    return best;
  }, [answers, intensity]);

  const progress = showResult || isAnalyzing
    ? 100
    : ((currentStep) / quizSteps.length) * 100;

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12 sm:py-20">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">
            {showResult
              ? t('complete')
              : `${currentStep + 1} / ${quizSteps.length}`}
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

      {/* Step content */}
      <AnimatePresence mode="wait" custom={direction}>
        {/* Analyzing state */}
        {isAnalyzing && !showResult && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            {/* Pulse circles */}
            <div className="relative mb-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-teal-400/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: [0.8, 1.8],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: 'easeOut',
                  }}
                  style={{ width: 80, height: 80 }}
                />
              ))}
              <motion.div
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <span className="text-2xl">🧪</span>
              </motion.div>
            </div>
            <motion.p
              className="text-lg font-semibold text-white"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {t('analyzing')}
            </motion.p>
            <p className="mt-2 text-sm text-slate-500">
              {t('analyzingSubtitle')}
            </p>
          </motion.div>
        )}

        {/* Result */}
        {showResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <ScentResult profile={resultProfile} onRestart={restart} />
          </motion.div>
        )}

        {/* Quiz steps */}
        {!isAnalyzing && !showResult && step && (
          <motion.div
            key={step.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-8"
          >
            {/* Step header */}
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {t(step.titleKey)}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {t(step.subtitleKey)}
              </p>
            </div>

            {/* Mood selection */}
            {step.type === 'mood' && step.options && (
              <div className="grid grid-cols-2 gap-4">
                {step.options.map((option) => {
                  const isSelected = (answers[step.id] ?? []).includes(option.value);
                  const gradient = MOOD_GRADIENTS[option.value] ?? 'from-slate-400 to-slate-500';

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => toggleAnswer(step.id, option.value, step.maxSelect ?? 1)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      animate={isSelected ? { scale: 1.05 } : { scale: 1, opacity: (answers[step.id]?.length ?? 0) > 0 && !isSelected ? 0.5 : 1 }}
                      className={cn(
                        'relative flex flex-col items-center justify-center rounded-2xl p-8 text-center transition-all duration-300',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                        `bg-gradient-to-br ${gradient}`,
                        isSelected
                          ? 'shadow-2xl ring-2 ring-white/50'
                          : 'shadow-lg'
                      )}
                      aria-pressed={isSelected}
                    >
                      <span className="text-5xl mb-3">{option.emoji}</span>
                      <span className="text-base font-semibold text-white drop-shadow-sm">
                        {t(option.labelKey)}
                      </span>

                      {isSelected && (
                        <motion.div
                          layoutId="mood-check"
                          className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-teal-600 shadow"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Color selection */}
            {step.type === 'color' && step.options && (
              <div className="flex flex-wrap justify-center gap-4">
                {step.options.map((option) => {
                  const isSelected = (answers[step.id] ?? []).includes(option.value);
                  const selectedCount = (answers[step.id] ?? []).length;

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => toggleAnswer(step.id, option.value, step.maxSelect ?? 3)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        'relative flex flex-col items-center gap-2 group',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-xl p-2'
                      )}
                      aria-pressed={isSelected}
                      aria-label={t(option.labelKey)}
                    >
                      <div
                        className={cn(
                          'h-16 w-16 sm:h-20 sm:w-20 rounded-full transition-all duration-300',
                          isSelected
                            ? 'ring-4 ring-teal-400 ring-offset-4 ring-offset-slate-950 shadow-2xl scale-110'
                            : 'ring-2 ring-white/10 hover:ring-white/30'
                        )}
                        style={{ backgroundColor: option.color }}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-full w-full items-center justify-center rounded-full bg-black/20"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                              <path d="M4 10L8.5 14.5L16 5.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <span className={cn(
                        'text-xs font-medium transition-colors',
                        isSelected ? 'text-teal-400' : 'text-slate-500'
                      )}>
                        {t(option.labelKey)}
                      </span>
                    </motion.button>
                  );
                })}
                <p className="w-full text-center text-xs text-slate-500 mt-2">
                  {t('selectUpTo', { count: step.maxSelect ?? 3 })} ({(answers[step.id] ?? []).length}/{step.maxSelect ?? 3})
                </p>
              </div>
            )}

            {/* Memory selection */}
            {step.type === 'memory' && step.options && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {step.options.map((option) => {
                  const isSelected = (answers[step.id] ?? []).includes(option.value);
                  const selectedCount = (answers[step.id] ?? []).length;

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => toggleAnswer(step.id, option.value, step.maxSelect ?? 2)}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        'rounded-xl border p-4 text-center transition-all duration-300',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                        isSelected
                          ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/5'
                          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'
                      )}
                      aria-pressed={isSelected}
                    >
                      <span className="text-2xl mb-2 block">{option.emoji}</span>
                      <span className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-teal-300' : 'text-slate-300'
                      )}>
                        {t(option.labelKey)}
                      </span>
                    </motion.button>
                  );
                })}
                <p className="col-span-full text-center text-xs text-slate-500 mt-1">
                  {t('selectUpTo', { count: step.maxSelect ?? 2 })} ({(answers[step.id] ?? []).length}/{step.maxSelect ?? 2})
                </p>
              </div>
            )}

            {/* Intensity slider */}
            {step.type === 'intensity' && (
              <div className="space-y-8 py-8">
                <div className="relative">
                  {/* Gradient bar background */}
                  <div
                    className="h-3 w-full rounded-full"
                    style={{
                      background: `linear-gradient(to right,
                        rgba(20, 184, 166, 0.3),
                        rgba(20, 184, 166, 0.6),
                        rgba(20, 184, 166, 1))`,
                    }}
                  />

                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="absolute inset-0 w-full h-3 appearance-none bg-transparent cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none
                               [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7
                               [&::-webkit-slider-thumb]:rounded-full
                               [&::-webkit-slider-thumb]:bg-white
                               [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-teal-500
                               [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-teal-500/30
                               [&::-webkit-slider-thumb]:transition-transform
                               [&::-webkit-slider-thumb]:hover:scale-110
                               [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7
                               [&::-moz-range-thumb]:rounded-full
                               [&::-moz-range-thumb]:bg-white
                               [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-teal-500
                               [&::-moz-range-thumb]:shadow-lg"
                    aria-label={t('intensityLabel')}
                    aria-valuemin={1}
                    aria-valuemax={10}
                    aria-valuenow={intensity}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">{t('subtle')}</span>
                  <motion.span
                    key={intensity}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-3xl font-bold text-teal-400 tabular-nums"
                  >
                    {intensity}
                  </motion.span>
                  <span className="text-slate-400 font-medium">{t('intense')}</span>
                </div>

                {/* Visual feedback */}
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="rounded-full"
                      animate={{
                        height: i < intensity ? 20 + i * 3 : 8,
                        width: 6,
                        backgroundColor: i < intensity ? 'rgb(20, 184, 166)' : 'rgb(51, 65, 85)',
                      }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('back')}
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
          >
            {currentStep === quizSteps.length - 1 ? t('seeResult') : t('next')}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      )}
    </div>
  );
}
