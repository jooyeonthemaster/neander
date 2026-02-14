/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Interactive Demo Type Definitions
   Shared types for the 9 industry MVP demo system
   ───────────────────────────────────────────────────────── */

import type { IndustryId } from '@/data/experiences';

/** Answers collected across all steps, keyed by step ID */
export type DemoAnswers = Record<string, unknown>;

/** Metadata for one step (used by DemoShell for validation & progress) */
export interface DemoStepMeta {
  id: string;
  titleKey: string;
  subtitleKey: string;
  canProceed: (answers: DemoAnswers) => boolean;
}

/** Configuration for a single demo */
export interface DemoConfig {
  id: string;
  targetSlug: string;
  industryId: IndustryId;
  analyzeEmoji: string;
  analyzeDurationMs: number;
  steps: DemoStepMeta[];
}

/** Props injected into each custom step component */
export interface DemoStepProps {
  answers: DemoAnswers;
  onUpdate: (stepId: string, value: unknown) => void;
}

/** Props injected into the result component */
export interface DemoResultProps {
  resultKey: string;
  answers: DemoAnswers;
  onRestart: () => void;
  pillarColor: string;
}

/** Full module export from each demo file */
export interface DemoModule {
  config: DemoConfig;
  StepComponents: React.ComponentType<DemoStepProps>[];
  ResultComponent: React.ComponentType<DemoResultProps>;
  computeResult: (answers: DemoAnswers) => string;
}
