/* AI 타임캡슐 포토 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

/** 개봉 시점(년 후) — 데모 choiceStep의 option id와 같다 */
export const TIMECAPSULE_YEARS = ['10', '20', '30'] as const;
export type TimecapsuleYears = (typeof TIMECAPSULE_YEARS)[number];

/** 편지 입력 최대 길이 — 데모 textStep과 같다 */
export const TIMECAPSULE_MESSAGE_MAX = 120;
export const TIMECAPSULE_FROM_MAX = 12;

/** /api/demo-ai/timecapsule-photo 응답 */
export interface AiTimecapsule {
  /** 고른 시점만큼 나이 든 모습 (data:image/jpeg URL) */
  image: string;
  /** 미래의 내가 보내는 답장 */
  reply: string;
}

export function isAiTimecapsule(v: unknown): v is AiTimecapsule {
  const o = v as AiTimecapsule | null;
  return !!o && typeof o.image === 'string' && o.image.startsWith('data:image/') && typeof o.reply === 'string' && o.reply.length > 0;
}
