/* AI 팬 포토카드 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const PHOTOCARD_CONCEPT_IDS = ['season', 'tour', 'debut', 'holo'] as const;
export type PhotocardConceptId = (typeof PHOTOCARD_CONCEPT_IDS)[number];

/** /api/demo-ai/fan-photocard 응답 — 글 생성이 실패하면 image만 온다 */
export interface AiPhotocard {
  /** 포토카드 사진 (data:image/jpeg URL, 2:3, 글자 없음) */
  image: string;
  /** 포지션 (예: 메인보컬 · 센터) */
  position?: string;
  /** 매력 포인트 */
  charm?: string;
  /** 팬에게 한마디 */
  message?: string;
  /** 해시태그 3개 (# 없이) */
  tags?: string[];
}
