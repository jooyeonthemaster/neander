/* AI 피부 분석 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const SKIN_TYPE_IDS = ['dry', 'oily', 'combination', 'sensitive', 'balanced'] as const;
export type SkinType = (typeof SKIN_TYPE_IDS)[number];
export const SKIN_TYPE_LABELS: Record<SkinType, string> = {
  dry: '수분 부족 건성',
  oily: '유분 과다 지성',
  combination: 'T존 복합성',
  sensitive: '예민한 민감성',
  balanced: '밸런스 중성',
};

export const SKIN_CONCERNS = [
  { id: 'dryness', emoji: '💧', label: '건조·당김', desc: '세안 후 얼굴이 당겨요' },
  { id: 'shine', emoji: '✨', label: '번들거림', desc: '오후만 되면 유분이 올라와요' },
  { id: 'pores', emoji: '🔍', label: '넓은 모공', desc: '코·볼 모공이 신경 쓰여요' },
  { id: 'dullness', emoji: '🌫️', label: '칙칙함·잡티', desc: '피부톤이 고르지 않아요' },
  { id: 'aging', emoji: '⏳', label: '잔주름·탄력', desc: '눈가·팔자가 신경 쓰여요' },
  { id: 'redness', emoji: '🌹', label: '붉은기·민감', desc: '쉽게 빨개지고 따가워요' },
] as const;
export const SKIN_CONCERN_IDS = SKIN_CONCERNS.map((c) => c.id) as [string, ...string[]];

export const SKIN_ROUTINES = [
  { id: 'minimal', emoji: '🧴', label: '미니멀', desc: '1~2단계' },
  { id: 'basic', emoji: '🧖', label: '기본', desc: '3~4단계' },
  { id: 'full', emoji: '💎', label: '풀코스', desc: '5단계 이상' },
] as const;
export const SKIN_ROUTINE_IDS = SKIN_ROUTINES.map((r) => r.id) as [string, ...string[]];

export const SKIN_SCORE_KEYS = ['pore', 'moisture', 'wrinkle', 'tone', 'elasticity'] as const;
export type SkinScoreKey = (typeof SKIN_SCORE_KEYS)[number];

/** /api/demo-ai/skincare-analysis 응답 (얼굴이 보였을 때) */
export interface AiSkinAnalysis {
  observed: true;
  type: SkinType;
  desc: string;
  scores: Record<SkinScoreKey, number>;
  morning: string[];
  night: string[];
  picks: string[];
}
