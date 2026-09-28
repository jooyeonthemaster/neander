/* AI 런웨이 포토부스 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const RUNWAY_CONCEPT_IDS = ['paris', 'milan', 'seoul', 'ny'] as const;
export type RunwayConceptId = (typeof RUNWAY_CONCEPT_IDS)[number];

export const RUNWAY_POSE_IDS = ['walk', 'shoulder', 'power', 'close'] as const;
export type RunwayPoseId = (typeof RUNWAY_POSE_IDS)[number];

/** 커버 헤드라인 — 표지 한 줄에 들어가는 영문 대문자 */
export const COVER_HEADLINE = /^[A-Z0-9][A-Z0-9 '&.!-]{2,17}$/;

/** /api/demo-ai/runway-photobooth 응답 — 글 생성이 실패하면 image만 온다 */
export interface AiRunwayCover {
  /** 표지 사진 (data:image/jpeg URL, 3:4, 글자 없음) */
  image: string;
  headline?: string;
  /** 헤드라인 아래 한글 한 줄 */
  sub?: string;
  /** 커버 라인 2개 */
  lines?: string[];
  /** 포토그래퍼 코멘트 */
  note?: string;
}
