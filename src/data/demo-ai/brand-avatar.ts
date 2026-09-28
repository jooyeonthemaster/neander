/* AI 브랜드 아바타 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const BRAND_STYLE_IDS = ['mono', 'pop', 'corporate', 'pastel'] as const;
export type BrandStyleId = (typeof BRAND_STYLE_IDS)[number];

/** /api/demo-ai/brand-avatar 응답 — 글 생성이 실패하면 image만 온다 */
export interface AiBrandAvatar {
  /** 아바타 일러스트 (data:image/jpeg URL, 3:4 — 얼굴이 가운데라 원형으로 잘라 쓴다) */
  image: string;
  /** 명함 한 줄 소개 */
  tagline?: string;
  /** 메신저 상태 메시지 */
  status?: string;
  /** 동료의 반응 메시지 */
  reply?: string;
}
