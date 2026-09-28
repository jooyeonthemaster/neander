/* AI 명함 디자이너 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const BC_JOBS = ['dev', 'design', 'marketing', 'sales', 'management'] as const;
export type BcJobId = (typeof BC_JOBS)[number];

/** 이미지 생성 프롬프트용 직무 설명·복장 (영문) */
export const BC_JOB_PROMPTS: Record<BcJobId, { label: string; attire: string }> = {
  dev: { label: '개발', attire: 'neat smart-casual top (plain knit or simple collared shirt)' },
  design: { label: '디자인', attire: 'neat, simple creative smart-casual top in neutral tones' },
  marketing: { label: '마케팅', attire: 'neat smart-casual blazer or collared shirt' },
  sales: { label: '영업', attire: 'tidy business attire (plain jacket over a collared shirt or blouse)' },
  management: { label: '경영', attire: 'tidy business attire (well-fitted dark jacket over a shirt or blouse)' },
};

/** /api/demo-ai/business-card 응답 */
export interface AiBusinessCard {
  /** 명함용 프로필 사진 (data:image/jpeg URL) */
  photo: string;
  /** 명함 한 줄 소개 */
  tagline: string;
  /** 사진에서 읽은 인상 (예: '차분하고 신뢰감 있는') */
  impression: string;
  /** 인상·직무 키워드 3개 */
  keywords: string[];
}
