/* AI 캐리커처 아티스트 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const CARICATURE_STYLE_IDS = ['webtoon', 'popart', 'pixel', 'sketch', 'watercolor'] as const;
export type CaricatureStyleId = (typeof CARICATURE_STYLE_IDS)[number];

export const CARICATURE_FRAME_IDS = ['postcard', 'poster', 'sticker'] as const;
export type CaricatureFrameId = (typeof CARICATURE_FRAME_IDS)[number];

/** /api/demo-ai/caricature-artist 응답 — 글 생성이 실패하면 image만 온다 */
export interface AiCaricature {
  /** 캐리커처 (data:image/jpeg URL, 3:4) */
  image: string;
  /** AI 화가의 한마디 */
  comment?: string;
  /** 과장한 매력 포인트 3개 (칩) */
  points?: string[];
}
