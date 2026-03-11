'use client';

import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useFormulaLabStore } from '@/stores/formulaLabStore';
import { generateFormulaResults } from '@/data/formula-lab-engine';
import { PROCESSING_STAGES, type BrandBrief } from '@/data/formula-lab-data';
import { BrandBriefForm } from './BrandBriefForm';
import { ProcessingView } from './ProcessingView';
import { ResultsDashboard } from './ResultsDashboard';

export function FormulaLab() {
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

  const handleSubmit = useCallback(async (brief: BrandBrief) => {
    setBrief(brief);
    setStep('processing');
    setProcessingStage(0);
    setProcessingProgress(0);

    // Simulate multi-stage AI processing
    for (let i = 0; i < PROCESSING_STAGES.length; i++) {
      setProcessingStage(i);
      const duration = PROCESSING_STAGES[i].duration;
      const steps = 60;
      const interval = duration / steps;

      for (let s = 0; s <= steps; s++) {
        await new Promise(r => setTimeout(r, interval));
        setProcessingProgress(Math.round((s / steps) * 100));
      }
    }

    // Generate results
    const results = generateFormulaResults(brief);
    setResults(results);

    // Brief pause before showing results
    await new Promise(r => setTimeout(r, 600));
    setStep('results');
  }, [setBrief, setStep, setProcessingStage, setProcessingProgress, setResults]);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-3 group cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-neutral-950 uppercase">
              ON<span className="text-teal-600">SCENT</span>
            </span>
            <span className="text-neutral-300 text-xs">|</span>
            <span className="text-xs font-medium text-neutral-500 tracking-widest uppercase">
              AI Formula Lab
            </span>
          </button>

          {step !== 'input' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={reset}
              className="text-xs font-medium text-neutral-400 hover:text-teal-600 transition-colors tracking-wide uppercase cursor-pointer"
            >
              New Brief
            </motion.button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <AnimatePresence mode="wait">
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
      </main>
    </div>
  );
}
