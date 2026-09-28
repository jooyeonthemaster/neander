/* AI 손금 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const PALM_LINE_IDS = ['life', 'head', 'heart', 'fate'] as const;
export type PalmLineId = (typeof PALM_LINE_IDS)[number];
export const PALM_LINE_LABELS: Record<PalmLineId, string> = { life: '생명선', head: '두뇌선', heart: '감정선', fate: '운명선' };

export const PALM_HANDS = ['left', 'right'] as const;
export type PalmHand = (typeof PALM_HANDS)[number];

/** 손 모양 4원소 — 손바닥·손가락 비율로 고른다 */
export const PALM_SHAPES = ['불의 손', '물의 손', '흙의 손', '바람의 손'] as const;
export type PalmShape = (typeof PALM_SHAPES)[number];
export const PALM_SHAPE_HINTS: Record<PalmShape, string> = {
  '불의 손': '긴 손바닥 + 짧은 손가락',
  '물의 손': '긴 손바닥 + 길고 가는 손가락',
  '흙의 손': '네모난 손바닥 + 짧고 굵은 손가락',
  '바람의 손': '네모난 손바닥 + 긴 손가락',
};

/** /api/demo-ai/palm-reading 응답 (손바닥이 보였을 때) */
export interface AiPalmReading {
  observed: true;
  title: string;
  lines: Record<PalmLineId, { strength: number; text: string }>;
  shape: PalmShape;
  shapeDesc: string;
  mark: { name: string; desc: string };
}
