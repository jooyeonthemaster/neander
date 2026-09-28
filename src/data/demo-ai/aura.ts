/* AI 오라 리딩 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const AURA_IDS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'] as const;
export type AuraId = (typeof AURA_IDS)[number];
export const AURA_HINTS: Record<AuraId, string> = {
  red: '레드 — 열정·추진력',
  orange: '오렌지 — 사교성·모험심',
  yellow: '옐로 — 긍정·호기심',
  green: '그린 — 배려·균형',
  blue: '블루 — 신뢰·평온',
  indigo: '인디고 — 직관·몰입',
  violet: '바이올렛 — 상상력·감수성',
};

export const AURA_MOODS = [
  { id: 'passion', emoji: '🔥', label: '열정 가득', desc: '뭐든 해낼 것 같아요', target: 0 },
  { id: 'flutter', emoji: '💓', label: '두근두근', desc: '설레는 일이 있어요', target: 1 },
  { id: 'joy', emoji: '😆', label: '신나요', desc: '웃음이 계속 나와요', target: 2 },
  { id: 'tired', emoji: '🫠', label: '조금 지쳤어요', desc: '쉼이 필요해요', target: 3 },
  { id: 'calm', emoji: '🌊', label: '평온해요', desc: '마음이 잔잔해요', target: 4 },
  { id: 'dreamy', emoji: '☁️', label: '몽글몽글', desc: '생각이 둥둥 떠다녀요', target: 6 },
] as const;
export type AuraMoodId = (typeof AURA_MOODS)[number]['id'];
export const AURA_MOOD_IDS = AURA_MOODS.map((m) => m.id) as [AuraMoodId, ...AuraMoodId[]];

export const AURA_PROFILE_LABELS = ['에너지 레벨', '감수성', '공감력', '창의력', '안정감'] as const;

/** /api/demo-ai/aura-reading 응답 (얼굴이 보였을 때) */
export interface AiAura {
  observed: true;
  main: AuraId;
  second: AuraId;
  nickname: string;
  desc: string;
  moodLine: string;
  keywords: string[];
  profile: number[];
  intensity: number;
  charge: string;
}
