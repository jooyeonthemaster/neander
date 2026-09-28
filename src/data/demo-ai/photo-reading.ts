/* 사진·녹음 분석 데모(관상·손금·피부·코디·오라·음색)가 함께 쓰는 AI 응답 형태 */

/** 사진에 얼굴·손바닥·사람이 안 보였을 때(또는 녹음에 목소리가 없을 때) 서버가 돌려주는 값 — 데모는 기존 고정 결과로 그린다 */
export interface NotObserved {
  observed: false;
}

export function isNotObserved(v: unknown): v is NotObserved {
  return typeof v === 'object' && v !== null && (v as { observed?: unknown }).observed === false;
}

/** 모델에게 공통으로 거는 "보이는 것만" 규칙 */
export const GROUNDING_RULE = `사진에서 실제로 보이는 것(표정·형태·색·옷·조명 등)만 근거로 삼고, 보이지 않는 것을 지어내지 않습니다.
사진이 흐리거나 대상이 없으면 억지로 풀이하지 말고 observed=false로 답합니다 (이때 나머지 필드는 짧은 빈 값·최솟값으로 채웁니다).`;
