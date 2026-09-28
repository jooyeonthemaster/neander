/* AI 관상 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const FACE_TYPE_IDS = ['moon', 'tiger', 'crane', 'deer', 'dragon', 'owl'] as const;
export type FaceType = (typeof FACE_TYPE_IDS)[number];

/** 관상 유형 — 모델이 사진을 보고 고를 때 쓰는 설명 */
export const FACE_TYPE_HINTS: Record<FaceType, string> = {
  moon: '보름달상 — 둥글고 원만한 윤곽, 편안한 인상',
  tiger: '호랑이상 — 또렷한 눈빛, 힘 있는 턱선',
  crane: '학상 — 가늘고 긴 선, 섬세한 인상',
  deer: '사슴상 — 맑은 눈매, 부드러운 인상',
  dragon: '용상 — 시원한 이마, 곧은 중심선',
  owl: '부엉이상 — 차분한 눈매, 단정한 입매',
};

export const FACE_FORTUNE_IDS = ['wealth', 'love', 'career', 'health'] as const;
export type FaceFortuneId = (typeof FACE_FORTUNE_IDS)[number];
export const FACE_FORTUNE_LABELS: Record<FaceFortuneId, string> = { wealth: '재물운', love: '연애운', career: '직업운', health: '건강운' };

export const FACE_FEATURE_KEYS = ['forehead', 'eyes', 'nose', 'lips', 'chin'] as const;
export type FaceFeatureKey = (typeof FACE_FEATURE_KEYS)[number];

/** /api/demo-ai/face-reading 응답 (얼굴이 보였을 때) */
export interface AiFaceReading {
  observed: true;
  type: FaceType;
  summary: string;
  keywords: string[];
  features: Record<FaceFeatureKey, { head: string; text: string }>;
  scores: Record<FaceFortuneId, number>;
  balance: number;
  harmony: number;
  focusText: string;
  lucky: { color: string; number: number; item: string };
  motto: string;
}
