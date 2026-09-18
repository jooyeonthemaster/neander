/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — core types & helpers
   카메라/마이크 캡처 데이터 형태와, 결과 연출용 결정적 난수 도구
   ───────────────────────────────────────────────────────── */

import type { DemoAnswers } from '@/types/demo';

/** 캡처 이미지 중앙부에서 뽑은 픽셀 통계 (0–100) */
export interface CaptureStats {
  brightness: number;
  warmth: number;
  saturation: number;
  contrast: number;
}

/** 카메라 스텝이 answers[stepId]에 저장하는 값 */
export interface CaptureData {
  /** 3:4 JPEG data URL — 브라우저 메모리에만 존재하고 어디에도 전송하지 않는다 */
  image: string;
  stats: CaptureStats;
  /** 픽셀 기반 해시 — 같은 사진이면 같은 결과가 나오도록 결과 연출에 쓴다 */
  seed: number;
  source: 'camera' | 'upload' | 'sample';
  /** 손 촬영일 때 — 가이드 기준 어느 손/어느 면이었는지, 엄지가 화면 왼쪽인지 */
  hand?: { which: 'left' | 'right'; side: 'palm' | 'back'; thumbLeft: boolean };
}

/** 마이크 스텝이 answers[stepId]에 저장하는 값 */
export interface VoiceData {
  /** 녹음 object URL (샘플 모드면 null) */
  audioUrl: string | null;
  /** 평균 음높이 (Hz) */
  pitchHz: number;
  /** 성량 0–100 */
  volume: number;
  /** 억양 변화폭 0–100 */
  variation: number;
  /** 결과 화면용 파형 (0–1, 48개) */
  waveform: number[];
  seed: number;
  source: 'mic' | 'sample';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getCapture(answers: DemoAnswers, stepId: string): CaptureData | undefined {
  const value = answers[stepId];
  return isRecord(value) && typeof value.image === 'string' ? (value as unknown as CaptureData) : undefined;
}

export function getVoice(answers: DemoAnswers, stepId: string): VoiceData | undefined {
  const value = answers[stepId];
  return isRecord(value) && typeof value.pitchHz === 'number' ? (value as unknown as VoiceData) : undefined;
}

/** 단일 선택 스텝 값 */
export function getChoice(answers: DemoAnswers, stepId: string): string | undefined {
  const value = answers[stepId];
  return typeof value === 'string' ? value : undefined;
}

/** 다중 선택 스텝 값 */
export function getChoices(answers: DemoAnswers, stepId: string): string[] {
  const value = answers[stepId];
  return Array.isArray(value) ? (value.filter((v) => typeof v === 'string') as string[]) : [];
}

/** 텍스트/슬라이더 스텝 값 (필드 ID → 값) */
export function getFields<T extends string | number>(answers: DemoAnswers, stepId: string): Record<string, T> {
  const value = answers[stepId];
  return isRecord(value) ? (value as Record<string, T>) : {};
}

/* ── Deterministic randomness ─────────────────────────── */

/** FNV-1a 32bit */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** seed + salt → 0 이상 1 미만 (mulberry32) */
export function seededRandom(seed: number, salt: string | number = 0): number {
  let t = (seed ^ hashString(String(salt))) + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** seed + salt → min 이상 max 이하 정수 */
export function seededInt(seed: number, salt: string | number, min: number, max: number): number {
  return min + Math.floor(seededRandom(seed, salt) * (max - min + 1));
}

export function seededPick<T>(seed: number, salt: string | number, items: readonly T[]): T {
  return items[Math.floor(seededRandom(seed, salt) * items.length)]!;
}

/** 전체 답변으로 만든 시드 — 이미지 데이터는 제외하고 캡처 시드만 반영한다 */
export function answersSeed(answers: DemoAnswers): number {
  return hashString(
    JSON.stringify(answers, (_key, value) =>
      typeof value === 'string' && (value.startsWith('data:') || value.startsWith('blob:')) ? '' : value
    )
  );
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}
