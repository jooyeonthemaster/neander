/* AI 포춘 로봇 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const FORTUNE_ELEMENTS = [
  { id: 'fire', label: '불 🔥', gradient: 'from-red-500 to-orange-600' },
  { id: 'water', label: '물 💧', gradient: 'from-blue-400 to-cyan-600' },
  { id: 'earth', label: '흙 🌍', gradient: 'from-amber-600 to-yellow-800' },
  { id: 'air', label: '바람 🌬️', gradient: 'from-sky-300 to-blue-400' },
  { id: 'metal', label: '금속 ⚙️', gradient: 'from-slate-400 to-zinc-600' },
] as const;

export const FORTUNE_CATEGORIES = [
  { id: 'love', label: '연애 💕' },
  { id: 'career', label: '직업 💼' },
  { id: 'health', label: '건강 💪' },
  { id: 'wealth', label: '재물 💰' },
  { id: 'creativity', label: '창의 ✨' },
] as const;

/** Small, practical prompts accompany the fictional element story. */
export const FORTUNE_ACTIONS = {
  love: { item: '마음을 적을 작은 메모장', line: '고마웠던 사람에게 짧은 안부를 건네 보세요.' },
  career: { item: '손에 익은 볼펜', line: '오늘 끝낼 수 있는 일 하나를 적고 시작해 보세요.' },
  health: { item: '가볍게 들고 다닐 물병', line: '잠깐 일어나 어깨를 펴고 편하게 숨을 쉬어 보세요.' },
  wealth: { item: '하루 지출 메모', line: '오늘 쓴 돈을 한 번 돌아보고 내일의 우선순위를 정해 보세요.' },
  creativity: { item: '좋아하는 색의 색연필', line: '떠오른 아이디어를 한 줄이나 작은 그림으로 남겨 보세요.' },
} as const;

/** AI가 고르는 행운의 방향 */
export const FORTUNE_DIRECTIONS = ['동쪽', '서쪽', '남쪽', '북쪽', '동북쪽', '동남쪽', '서북쪽', '서남쪽', '중앙'] as const;
export type FortuneDirection = (typeof FORTUNE_DIRECTIONS)[number];

/** /api/demo-ai/fortune-robot 응답 */
export interface AiFortune {
  name: string;
  /** 점괘 두 줄 */
  lines: string[];
  luckyNumber: number;
  luckyColor: string;
  direction: FortuneDirection;
  /** 고른 운세 분야에 대한 한 줄 */
  advice: string;
}
