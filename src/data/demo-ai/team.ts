/* AI 팀 케미스트리 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const TEAM_ROLES = [
  { id: 'leader', emoji: '🦁', title: '리더', desc: '방향을 제시하고 팀을 이끄다' },
  { id: 'mediator', emoji: '🕊️', title: '조율자', desc: '갈등을 해결하고 조화를 만든다' },
  { id: 'analyst', emoji: '🔍', title: '분석가', desc: '데이터로 최적의 답을 찾는다' },
  { id: 'creator', emoji: '💡', title: '크리에이터', desc: '새로운 아이디어를 만들어낸다' },
  { id: 'executor', emoji: '⚡', title: '실행자', desc: '계획을 빠르고 정확하게 실행한다' },
] as const;

export const TEAM_COMM_STYLES = [
  { id: 'direct', emoji: '💬', title: '직설적', desc: '핵심만 간결하게 전달' },
  { id: 'diplomatic', emoji: '🤝', title: '외교적', desc: '상대의 감정을 고려하며 전달' },
  { id: 'dataDriven', emoji: '📊', title: '데이터 중심', desc: '수치와 근거로 설득' },
  { id: 'storytelling', emoji: '📖', title: '스토리텔링', desc: '이야기와 비유로 공감 유도' },
] as const;

export const TEAM_STRESS_RESPONSES = [
  { id: 'charge', emoji: '🏃', title: '돌진', desc: '일단 부딪히며 해결한다' },
  { id: 'plan', emoji: '📋', title: '계획 수립', desc: '우선순위를 재정리한다' },
  { id: 'collaborate', emoji: '🤲', title: '협업', desc: '팀원에게 도움을 요청한다' },
  { id: 'reflect', emoji: '🧘', title: '성찰', desc: '한 발 물러서서 생각한다' },
] as const;

/** AI가 고르는 아키타입 아이콘 */
export const TEAM_EMOJIS = ['🎯', '🌐', '🎶', '📈', '♟️', '🔭', '🧪', '⚡', '⚓', '🧭', '🛡️', '🌟', '🔥', '🧩', '🚀', '🌱'] as const;

/** /api/demo-ai/team-chemistry 응답 */
export interface AiTeam {
  name: string;
  emoji: string;
  desc: string;
  strengths: string[];
  challenges: string[];
  partner: string;
}
