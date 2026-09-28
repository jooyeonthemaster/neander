/* AI 칵테일 크리에이터 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const COCKTAIL_MOODS = [
  { id: 'relaxed', emoji: '\u{1F33F}', label: '편안한 휴식', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'adventurous', emoji: '⚡', label: '새로운 모험', gradient: 'from-amber-400 to-orange-500' },
  { id: 'romantic', emoji: '\u{1F339}', label: '로맨틱한 밤', gradient: 'from-rose-400 to-pink-500' },
  { id: 'celebratory', emoji: '\u{1F389}', label: '축하 파티', gradient: 'from-violet-400 to-purple-500' },
] as const;

export const COCKTAIL_SPIRITS = [
  { id: 'vodka', emoji: '\u{1F378}', label: '보드카' },
  { id: 'gin', emoji: '\u{1FAD2}', label: '진' },
  { id: 'rum', emoji: '\u{1F3DD}️', label: '럼' },
  { id: 'whiskey', emoji: '\u{1F943}', label: '위스키' },
  { id: 'tequila', emoji: '\u{1F335}', label: '데킬라' },
  { id: 'nonalcohol', emoji: '\u{1F379}', label: '논알콜' },
] as const;

/** AI가 고르는 칵테일 색 — 데모의 잔 그라데이션으로 바뀐다 */
export const COCKTAIL_COLORS = ['clear', 'green', 'amber', 'orange', 'red', 'pink', 'purple', 'blue', 'brown', 'gold'] as const;
export type CocktailColor = (typeof COCKTAIL_COLORS)[number];

export function normalizeCocktailGarnish(value: string): string {
  const garnish = value.trim().replace(/가니쉬/g, '가니시');
  return /^(?:가니시\s*)?(?:없이|없음|생략|없어요|없다|none)[.!]?$/i.test(garnish) ? '없음' : garnish;
}

export function cocktailCopy(value: string): string {
  return value.replace(/가니쉬/g, '가니시').replace(/조향/g, '블렌딩');
}

/** /api/demo-ai/cocktail 응답 */
export interface AiCocktail {
  name: string;
  tagline: string;
  story: string;
  ingredients: string[];
  garnish: string;
  method: string;
  color: CocktailColor;
}
