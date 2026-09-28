/* AI 미래 커리어 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const CAREER_INTERESTS = [
  { id: 'tech', emoji: '💻', label: '테크놀로지', desc: '코딩, AI, 로봇, 미래 기술' },
  { id: 'creative', emoji: '🎨', label: '크리에이티브', desc: '디자인, 영상, 음악, 콘텐츠' },
  { id: 'science', emoji: '🔬', label: '과학', desc: '연구, 실험, 발견, 혁신' },
  { id: 'business', emoji: '📊', label: '비즈니스', desc: '경영, 마케팅, 전략, 리더십' },
  { id: 'social', emoji: '🌱', label: '사회공헌', desc: '교육, 환경, 복지, 봉사' },
] as const;

export const CAREER_QUADRANTS = [
  { id: 'structured-solo', label: '체계적 전문가', row: 0, col: 0, color: 'blue' },
  { id: 'structured-team', label: '조직형 리더', row: 0, col: 1, color: 'green' },
  { id: 'flexible-solo', label: '자유로운 장인', row: 1, col: 0, color: 'purple' },
  { id: 'flexible-team', label: '유연한 협업가', row: 1, col: 1, color: 'amber' },
] as const;

export const CAREER_SUPERPOWERS = [
  { id: 'creativity', emoji: '✨', label: '창의력', desc: '남들이 보지 못하는 것을 본다' },
  { id: 'logic', emoji: '🧩', label: '논리력', desc: '복잡한 문제를 명쾌하게 해결' },
  { id: 'communication', emoji: '🗣️', label: '소통력', desc: '누구와도 통하는 대화의 달인' },
  { id: 'leadership', emoji: '👑', label: '리더십', desc: '사람들을 이끄는 자연스러운 힘' },
  { id: 'empathy', emoji: '💛', label: '공감력', desc: '마음을 읽고 연결하는 능력' },
] as const;

/** AI가 고르는 직업 아이콘 */
export const CAREER_EMOJIS = [
  '🤖', '🎯', '🚀', '📱', '🎬', '🔬', '🧬', '💡', '📣', '🌍', '🤝', '💻', '🎨', '🎵', '📚', '🏥',
  '🌱', '🛰️', '🎮', '📊', '🏗️', '✈️', '🍳', '⚖️', '🧑‍🏫', '📷', '🔭', '🛠️',
] as const;

/** /api/demo-ai/future-career 응답 */
export interface AiCareer {
  name: string;
  emoji: string;
  compatibility: number;
  desc: string;
  /** Year 1 · Year 3 · Year 5 */
  timeline: string[];
  skills: string[];
}
