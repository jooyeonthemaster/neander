'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useQuoteStore } from '@/stores/quoteStore';
import { cn } from '@/lib/utils';
import { EventDetailsForm } from './EventDetailsForm';
import { ServiceSelector } from './ServiceSelector';
import { AddOnsSection } from './AddOnsSection';
import { QuoteSummary } from './QuoteSummary';

const STEPS = ['eventDetails', 'services', 'addOns', 'summary'] as const;
type Step = (typeof STEPS)[number];

const stepIcons: Record<Step, string> = {
  eventDetails: '1',
  services: '2',
  addOns: '3',
  summary: '4',
};

export function QuoteBuilder() {
  const t = useTranslations('quote');
  const [currentStep, setCurrentStep] = useState<Step>('eventDetails');
  const services = useQuoteStore((s) => s.services);

  const currentIndex = STEPS.indexOf(currentStep);

  const canProceedFromStep = useMemo(() => {
    return {
      eventDetails: true,
      services: services.length > 0,
      addOns: true,
      summary: true,
    };
  }, [services.length]);

  function goNext() {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
    }
  }

  function goPrev() {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
    }
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <nav aria-label="Quote builder steps" className="relative">
        <ol className="flex items-center justify-between gap-2">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx < currentIndex;
            const isFuture = idx > currentIndex;

            return (
              <li key={step} className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (idx <= currentIndex || canProceedFromStep[STEPS[idx - 1] ?? 'eventDetails']) {
                      setCurrentStep(step);
                    }
                  }}
                  disabled={isFuture && !canProceedFromStep[STEPS[idx - 1] ?? 'eventDetails']}
                  className={cn(
                    'w-full group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300',
                    isActive && 'bg-teal-600 text-white shadow-lg shadow-teal-600/20',
                    isCompleted && 'bg-teal-50 text-teal-700 hover:bg-teal-100',
                    isFuture && 'bg-white text-slate-400 border border-slate-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2'
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                      isActive && 'bg-white/20 text-white',
                      isCompleted && 'bg-teal-600 text-white',
                      isFuture && 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      stepIcons[step]
                    )}
                  </span>
                  <span className="hidden sm:block text-sm font-medium truncate">
                    {t(`step.${step}`)}
                  </span>
                </button>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'hidden lg:block h-0.5 mt-2 rounded-full transition-colors duration-500',
                      idx < currentIndex ? 'bg-teal-400' : 'bg-slate-200'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: form content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {currentStep === 'eventDetails' && <EventDetailsForm />}
              {currentStep === 'services' && <ServiceSelector />}
              {currentStep === 'addOns' && <AddOnsSection />}
              {currentStep === 'summary' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {t('summaryReview')}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('summaryDescription')}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                currentIndex === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t('prev')}
            </button>

            {currentIndex < STEPS.length - 1 && (
              <motion.button
                type="button"
                onClick={goNext}
                disabled={!canProceedFromStep[currentStep]}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                  canProceedFromStep[currentStep]
                    ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-md shadow-teal-600/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                {t('next')}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>

        {/* Right column: sticky summary */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <QuoteSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
