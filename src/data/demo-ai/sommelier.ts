/* AI 소믈리에 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const SOMMELIER_TASTE_SLIDERS = [
  { id: 'sweet', emoji: '🍯', label: '단맛', left: '드라이하게', right: '달콤하게' },
  { id: 'acid', emoji: '🍋', label: '산미', left: '부드럽게', right: '상큼하게' },
  { id: 'body', emoji: '🥛', label: '바디감', left: '가볍게', right: '묵직하게' },
  { id: 'bitter', emoji: '☕', label: '쌉쌀함·떫은맛', left: '없이', right: '진하게' },
] as const;

export const SOMMELIER_STYLES = [
  { id: 'wine', emoji: '🍷', label: '와인', desc: '세계의 와인' },
  { id: 'korean', emoji: '🍶', label: '전통주', desc: '우리 술' },
  { id: 'any', emoji: '🎲', label: '상관없어요', desc: 'AI에게 맡기기' },
] as const;

export const SOMMELIER_OCCASIONS = [
  { id: 'alone', emoji: '🛋️', label: '혼술', desc: '나를 위한 한 잔' },
  { id: 'date', emoji: '🕯️', label: '데이트', desc: '분위기 있는 저녁' },
  { id: 'party', emoji: '🎉', label: '파티', desc: '여럿이 즐기는 자리' },
  { id: 'gift', emoji: '🎁', label: '선물', desc: '소중한 사람에게' },
] as const;

export const SOMMELIER_PAIRINGS = [
  { id: 'meat', emoji: '🥩', label: '고기' },
  { id: 'seafood', emoji: '🦐', label: '해산물' },
  { id: 'cheese', emoji: '🧀', label: '치즈' },
  { id: 'korean', emoji: '🥘', label: '한식' },
  { id: 'dessert', emoji: '🍰', label: '디저트' },
] as const;

export const SOMMELIER_KINDS = ['wine', 'korean'] as const;

/** /api/demo-ai/sommelier 응답 */
export interface AiSommelier {
  /** 스타일·산지 이름 (브랜드·생산자 없이) */
  name: string;
  /** 예: 프랑스 · 레드 와인 */
  origin: string;
  kind: (typeof SOMMELIER_KINDS)[number];
  /** 각 0~100 */
  profile: { sweet: number; acid: number; body: number; bitter: number };
  nose: string;
  palate: string;
  finish: string;
  temp: string;
  /** 72~98 */
  matchRate: number;
  reason: string;
  pairing: { dish: string; tip: string };
}
