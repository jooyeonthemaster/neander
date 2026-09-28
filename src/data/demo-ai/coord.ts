/* AI 코디 추천 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const COORD_TONES = ['warm', 'cool', 'neutral'] as const;
export type CoordTone = (typeof COORD_TONES)[number];

export const COORD_TPOS = { work: '출근', date: '데이트', travel: '여행', party: '파티' } as const;
export type CoordTpo = keyof typeof COORD_TPOS;
export const COORD_STYLES = { minimal: '미니멀', casual: '캐주얼', street: '스트릿', classic: '클래식', feminine: '페미닌', sporty: '스포티' } as const;
export type CoordStyle = keyof typeof COORD_STYLES;
export const COORD_FITS = { slim: '슬림핏', regular: '레귤러핏', over: '오버사이즈' } as const;
export type CoordFit = keyof typeof COORD_FITS;

/** AI가 고를 수 있는 옷 색 (이름 → 칩 색) */
export const COORD_COLORS = {
  카멜: '#c19a6b',
  올리브: '#708238',
  테라코타: '#c8674a',
  크림: '#f3e5c8',
  브라운: '#5c3a21',
  머스타드: '#d4a017',
  네이비: '#1f2a44',
  차콜: '#4b5563',
  '아이스 블루': '#bfdbfe',
  라벤더: '#c4b5fd',
  블랙: '#111111',
  화이트: '#f8fafc',
  베이지: '#d6c3a5',
  토프: '#8b7d6b',
  세이지: '#9caf88',
  '데님 블루': '#4a6fa5',
  아이보리: '#f5f0e1',
  그레이: '#9ca3af',
  버건디: '#7f1d1d',
  핑크: '#f9a8d4',
} as const;
export type CoordColor = keyof typeof COORD_COLORS;
export const COORD_COLOR_NAMES = Object.keys(COORD_COLORS) as [CoordColor, ...CoordColor[]];

/** 아이템 카드에 올리는 이모지 */
export const COORD_EMOJIS = [
  '👕', '👔', '👚', '🧥', '🧶', '👖', '👗', '🩳', '👞', '👟', '👠', '👢', '🥾', '🥿', '🩴',
  '👜', '👛', '👝', '⌚', '💍', '💎', '🧣', '📿', '👒', '🧢', '🕶️', '🛍️', '⛓️', '🎀', '💳',
] as const;

export const COORD_SLOTS = ['top', 'bottom', 'shoes', 'accessory'] as const;
export type CoordSlot = (typeof COORD_SLOTS)[number];

export interface AiCoordPiece {
  name: string;
  color: CoordColor;
  emoji: (typeof COORD_EMOJIS)[number];
}

/** /api/demo-ai/coord-recommender 응답 (사람이 보였을 때) */
export interface AiCoord {
  observed: true;
  tone: CoordTone;
  observation: string;
  outfits: { name: string; match: number; tip: string; pieces: Record<CoordSlot, AiCoordPiece> }[];
}
