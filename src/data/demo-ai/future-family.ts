/* AI 미래 가족 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

/** 결과 아이 구성 — 'AI에게 맡기기'는 화면에서 성별을 먼저 정해 보낸다 */
export const FF_CHILDREN = ['boy', 'girl', 'twins'] as const;
export type FfChild = (typeof FF_CHILDREN)[number];

/** 닮은 곳 분석 항목 (화면의 FEATURES와 같은 id) */
export const FF_FEATURE_IDS = ['eyes', 'brows', 'nose', 'mouth', 'face', 'smile'] as const;
export type FfFeatureId = (typeof FF_FEATURE_IDS)[number];

/** Fictional card decoration: mixed A/B motifs, never a measurement or genetic probability. */
export function familyMotifMix(seed: number, proposed?: Partial<Record<FfFeatureId, number>>): Record<FfFeatureId, number> {
  const values = FF_FEATURE_IDS.map((id) => Math.round(Math.min(65, Math.max(35, proposed?.[id] ?? 50))));
  if (values.every(Number.isFinite) && new Set(values).size > 1 && values.some((value) => value > 50) && values.some((value) => value < 50)) {
    return Object.fromEntries(FF_FEATURE_IDS.map((id, index) => [id, values[index]!])) as Record<FfFeatureId, number>;
  }
  const rotation = (seed >>> 0) % 11;
  return Object.fromEntries(FF_FEATURE_IDS.map((id, index) => {
    const dominant = 55 + (rotation + index * 3) % 11;
    return [id, (index + (seed >>> 0) % 2) % 2 === 0 ? dominant : 100 - dominant];
  })) as Record<FfFeatureId, number>;
}

/** /api/demo-ai/future-family 응답 */
export interface AiFutureFamily {
  /** AI가 상상한 4살 아이 사진 (data:image/jpeg URL) */
  image: string;
  /** 결과 설명 1~2문장 */
  summary: string;
  /** 항목별 허구의 A 시각 모티브 배합 (%) — B는 100 - A. 닮음·유전 확률이 아님. */
  features: Record<FfFeatureId, number>;
  firstWord: string;
  play: string;
  /** 이모지 + 장래희망 */
  dream: string;
  personality: string[];
}
