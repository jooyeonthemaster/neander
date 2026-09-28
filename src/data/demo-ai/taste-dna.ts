/* AI 미각 DNA — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export type TasteId = 'sweet' | 'salty' | 'sour' | 'bitter' | 'umami';

export const TASTE_DNA_TASTES: { id: TasteId; label: string; emoji: string; color: string; left: string; right: string; code: string }[] = [
  { id: 'sweet', label: '단맛', emoji: '🍯', color: '#f472b6', left: '덜 달게', right: '달콤할수록 좋아', code: 'SW' },
  { id: 'salty', label: '짠맛', emoji: '🧂', color: '#38bdf8', left: '싱겁게', right: '짭짤하게', code: 'SA' },
  { id: 'sour', label: '신맛', emoji: '🍋', color: '#facc15', left: '새콤한 건 별로', right: '시큼할수록 좋아', code: 'SO' },
  { id: 'bitter', label: '쓴맛', emoji: '☕', color: '#a78bfa', left: '쓴 건 싫어요', right: '쌉싸름한 게 좋아', code: 'BI' },
  { id: 'umami', label: '감칠맛', emoji: '🍄', color: '#fb923c', left: '담백하게', right: '진하고 깊게', code: 'UM' },
];

export const TASTE_DNA_SPICE_LEVELS = [
  { label: '맵찔이', desc: '후추만 뿌려도 매워요', emoji: '🥛' },
  { label: '순한맛', desc: '살짝 칼칼한 정도가 좋아요', emoji: '🌱' },
  { label: '보통맛', desc: '떡볶이는 기본이죠', emoji: '🌶️' },
  { label: '매운맛', desc: '땀이 나야 먹은 것 같아요', emoji: '🔥' },
  { label: '지옥맛', desc: '매울수록 행복해져요', emoji: '🌋' },
] as const;

/** All displayed spice scores use this same 0–100 conversion, including zero. */
export function tasteSpiceScore(level: number): number {
  return Math.min(4, Math.max(0, Math.round(Number.isFinite(level) ? level : 0))) * 25;
}

/** Keep model-created type names readable without changing ordinary Korean words. */
export function formatTasteTypeName(name: string): string {
  return name.trim()
    .replace(/^(화끈한|달콤한|새콤한|짭짤한|쌉쌀한|부드러운)(?=[가-힣])/u, '$1 ')
    .replace(/([가-힣])(모험가|탐험가|미식가|수호자|개척자)$/u, '$1 $2')
    .replace(/\s+/g, ' ');
}

export type TextureId = 'crispy' | 'chewy' | 'soft' | 'creamy';

export const TASTE_DNA_TEXTURES: Record<TextureId, { label: string; emoji: string; desc: string }> = {
  crispy: { label: '바삭', emoji: '🍗', desc: '튀김·크래커·누룽지' },
  chewy: { label: '쫄깃', emoji: '🍡', desc: '떡·생면·젤리' },
  soft: { label: '부드러운', emoji: '🍮', desc: '푸딩·계란찜·두부' },
  creamy: { label: '크리미', emoji: '🧀', desc: '크림 파스타·치즈·라테' },
};

export type AdventureId = 'classic' | 'curious' | 'explorer' | 'pioneer';

export const TASTE_DNA_ADVENTURES: Record<AdventureId, { label: string; emoji: string; desc: string }> = {
  classic: { label: '늘 먹던 맛', emoji: '🏠', desc: '검증된 단골 메뉴가 최고' },
  curious: { label: '가끔은 새롭게', emoji: '👀', desc: '후기가 좋으면 도전해요' },
  explorer: { label: '신메뉴 먼저', emoji: '🧭', desc: '처음 보는 메뉴부터 시켜요' },
  pioneer: { label: '세상 모든 맛', emoji: '🚀', desc: '곤충 요리도 한 입은 먹어봐요' },
};

/** 미각 유형 계열 — 카드 색·이모지가 정해진다 */
export const TASTE_DNA_BASES = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'fire', 'balance'] as const;
export type TasteDnaBase = (typeof TASTE_DNA_BASES)[number];

export interface TasteDnaRec {
  emoji: string;
  name: string;
  why: string;
}

/** /api/demo-ai/taste-dna 응답 */
export interface AiTasteDna {
  base: TasteDnaBase;
  /** 미각 유형 이름 (예: 달콤 탐험가) */
  name: string;
  desc: string;
  foods: TasteDnaRec[];
  drinks: TasteDnaRec[];
  mission: TasteDnaRec;
  /** # 없이 */
  hashtags: string[];
}
