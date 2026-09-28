/* AI 스타일 프로파일러 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const STYLE_VIBES = [
  { id: 'minimal', label: '미니멀', gradient: ['#E0E0E0', '#9E9E9E'], desc: '깔끔하고 정돈된 실루엣', emoji: '🤍' },
  { id: 'street', label: '스트릿', gradient: ['#FF6B35', '#F7C948'], desc: '자유롭고 트렌디한 무드', emoji: '🔥' },
  { id: 'classic', label: '클래식', gradient: ['#2C3E50', '#8B7355'], desc: '시간이 지나도 변하지 않는 품격', emoji: '🏛️' },
  { id: 'romantic', label: '로맨틱', gradient: ['#F8BBD0', '#E1BEE7'], desc: '부드럽고 여성스러운 분위기', emoji: '🌸' },
  { id: 'avantgarde', label: '아방가르드', gradient: ['#000000', '#FF0000'], desc: '파격적이고 실험적인 표현', emoji: '🎭' },
] as const;

export const STYLE_PALETTES = [
  { id: 'monochrome', label: '모노크롬', colors: ['#000000', '#333333', '#666666', '#999999', '#FFFFFF'] },
  { id: 'earth', label: '어스톤', colors: ['#8D6E63', '#A1887F', '#BCAAA4', '#795548', '#D7CCC8'] },
  { id: 'pastel', label: '파스텔', colors: ['#F8BBD0', '#B3E5FC', '#C8E6C9', '#FFF9C4', '#E1BEE7'] },
  { id: 'bold', label: '볼드', colors: ['#F44336', '#2196F3', '#FFEB3B', '#4CAF50', '#9C27B0'] },
  { id: 'neutral', label: '뉴트럴', colors: ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#8D6E63', '#3E2723'] },
] as const;

export const STYLE_OCCASIONS = [
  { id: 'daily', label: '데일리', emoji: '☀️', desc: '편안한 일상 스타일' },
  { id: 'work', label: '출근', emoji: '💼', desc: '프로페셔널한 오피스룩' },
  { id: 'date', label: '데이트', emoji: '💝', desc: '특별한 만남을 위한 스타일' },
  { id: 'event', label: '행사', emoji: '🎭', desc: '파티 & 이벤트 드레스업' },
] as const;

/** AI가 고르는 워드로브 아이템 아이콘 */
export const STYLE_ITEM_EMOJIS = [
  '👕', '👔', '👗', '👖', '🩳', '🧥', '🥼', '🧶', '👚', '👘', '🩱', '🧣', '🧤', '🧢', '👒', '🎩',
  '👟', '👞', '👠', '👡', '👢', '🩰', '🥿', '👜', '👝', '👛', '🎒', '⌚', '💍', '💎', '🕶️', '🎨',
] as const;

/** /api/demo-ai/style-profiler 응답 */
export interface AiStyle {
  name: string;
  tags: string[];
  desc: string;
  /** #RRGGBB 5개 */
  colors: string[];
  wardrobe: { item: string; emoji: string; why: string }[];
}
