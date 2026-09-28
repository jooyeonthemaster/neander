/* AI 커플 케미스트리 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const COUPLE_LOVE_LANGS = [
  { id: 'words', label: '칭찬의 말', emoji: '💬' },
  { id: 'touch', label: '스킨십', emoji: '🤗' },
  { id: 'gifts', label: '선물', emoji: '🎁' },
  { id: 'acts', label: '행동으로 표현', emoji: '🛠️' },
  { id: 'time', label: '함께하는 시간', emoji: '⏰' },
] as const;

export const COUPLE_CONFLICTS = [
  { id: 'talk', emoji: '💬', label: '대화로 해결', desc: '마주 앉아 솔직하게 이야기한다' },
  { id: 'space', emoji: '🌙', label: '시간을 두고', desc: '각자 시간을 가진 후 대화한다' },
  { id: 'compromise', emoji: '🤝', label: '타협', desc: '서로 한 발씩 양보한다' },
  { id: 'humor', emoji: '😄', label: '유머로', desc: '웃음으로 분위기를 풀어낸다' },
] as const;

export const COUPLE_DREAMS = [
  { id: 'adventure', emoji: '✈️', label: '모험과 여행' },
  { id: 'stability', emoji: '🏠', label: '안정과 평화' },
  { id: 'growth', emoji: '📈', label: '성장과 도전' },
  { id: 'romance', emoji: '💕', label: '로맨스와 설렘' },
] as const;

/** AI가 고르는 커플 아이콘 */
export const COUPLE_EMOJIS = ['👫', '💑', '🤝', '🫶', '🔥', '😂', '🏡', '☯️', '💞', '🌈', '✈️', '🌙', '🌻', '🎈', '🍀', '🎶'] as const;

/** AI가 고르는 이름 글자색 — 데모의 그라데이션으로 바뀐다 */
export const COUPLE_COLORS = ['rose', 'amber', 'blue', 'teal', 'red', 'yellow', 'emerald', 'purple'] as const;
export type CoupleColor = (typeof COUPLE_COLORS)[number];

/** /api/demo-ai/couple-chemistry 응답 */
export interface AiCouple {
  name: string;
  emoji: string;
  score: number;
  strengths: string[];
  advice: string;
  color: CoupleColor;
}
