/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Interactive Demo Type Definitions
   Shared types for the 9 industry MVP demo system
   ───────────────────────────────────────────────────────── */

import type { IndustryId } from '@/data/experiences';
import type { PrintSpec } from '@/components/demo/kit/print';

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
  /** 분석 화면에서 순서대로 보여줄 진행 문구 (없으면 공통 부제) */
  analyzeMessages?: string[];
  /** 분석 화면 중앙에 촬영 이미지를 띄울 카메라 스텝 ID */
  analyzeImageStepId?: string;
  /** 결과 화면에서 사용자가 직접 공개(예: 카드 팩 뜯기)해야 출력을 시작할 때, 그동안 프린터에 띄울 안내 */
  printAfterReveal?: string;
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
  /** config.printAfterReveal을 쓰는 데모가 결과를 공개한 순간 호출 — 출력이 시작된다 */
  onReveal?: () => void;
}

/** Full module export from each demo file */
export interface DemoModule {
  config: DemoConfig;
  StepComponents: React.ComponentType<DemoStepProps>[];
  ResultComponent: React.ComponentType<DemoResultProps>;
  computeResult: (answers: DemoAnswers) => string;
  /** 결과를 현장 출력물(영수증 / 4×6 인화지)로 뽑을 내용 */
  getPrint?: (answers: DemoAnswers, resultKey: string) => PrintSpec;
}
