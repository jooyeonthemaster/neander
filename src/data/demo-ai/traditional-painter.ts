/* AI 전통 화가 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const PAINTER_STYLE_IDS = ['ink', 'minhwa', 'dancheong', 'bluewhite'] as const;
export type PainterStyleId = (typeof PAINTER_STYLE_IDS)[number];

export const PAINTER_FORMAT_IDS = ['scroll', 'screen'] as const;
export type PainterFormatId = (typeof PAINTER_FORMAT_IDS)[number];

/** 호(號) — 한글 2자, 한자 2자(음이 한글과 같다) */
export const HO_KO = /^[가-힣]{2}$/;
export const HO_HANJA = /^[一-鿿]{2}$/;

/** /api/demo-ai/traditional-painter 응답 — 글 생성이 실패하면 image만 온다 */
export interface AiPortrait {
  /** 초상화 (data:image/jpeg URL, 3:4) */
  image: string;
  hoKo?: string;
  hoHanja?: string;
  /** 호의 뜻 — '…의 주인'으로 끝난다 */
  hoMeaning?: string;
  /** 화원의 한마디 */
  comment?: string;
}
