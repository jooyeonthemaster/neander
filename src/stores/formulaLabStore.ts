'use client';

import { create } from 'zustand';
import type { BrandBrief, FormulaResults } from '@/data/formula-lab-data';

type Step = 'input' | 'processing' | 'results';

interface FormulaLabState {
  step: Step;
  processingStage: number;
  processingProgress: number;
  brief: BrandBrief | null;
  results: FormulaResults | null;
  selectedFormulaId: string | null;

  setStep: (step: Step) => void;
  setProcessingStage: (stage: number) => void;
  setProcessingProgress: (progress: number) => void;
  setBrief: (brief: BrandBrief) => void;
  setResults: (results: FormulaResults) => void;
  selectFormula: (id: string | null) => void;
  reset: () => void;
}

export const useFormulaLabStore = create<FormulaLabState>((set) => ({
  step: 'input',
  processingStage: 0,
  processingProgress: 0,
  brief: null,
  results: null,
  selectedFormulaId: null,

  setStep: (step) => set({ step }),
  setProcessingStage: (stage) => set({ processingStage: stage }),
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  setBrief: (brief) => set({ brief }),
  setResults: (results) => set({ results, selectedFormulaId: results?.formulas[0]?.id || null }),
  selectFormula: (id) => set({ selectedFormulaId: id }),
  reset: () => set({
    step: 'input',
    processingStage: 0,
    processingProgress: 0,
    brief: null,
    results: null,
    selectedFormulaId: null,
  }),
}));
