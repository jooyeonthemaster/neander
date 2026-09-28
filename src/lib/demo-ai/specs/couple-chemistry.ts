import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import { COUPLE_COLORS, COUPLE_CONFLICTS, COUPLE_DREAMS, COUPLE_EMOJIS, COUPLE_LOVE_LANGS } from '@/data/demo-ai/couple';

// AI 커플 케미스트리 — 두 사람의 사랑의 언어·갈등 해결·꿈의 우선순위로 커플 유형을 만든다.

const loveLang = z.enum(COUPLE_LOVE_LANGS.map((l) => l.id) as [string, ...string[]]);
const dream = z.enum(COUPLE_DREAMS.map((d) => d.id) as [string, ...string[]]);

const input = z
  .object({
    loveA: loveLang,
    loveB: loveLang,
    conflict: z.enum(COUPLE_CONFLICTS.map((c) => c.id) as [string, ...string[]]),
    dreamFirst: dream,
    dreamSecond: dream,
  })
  .refine((v) => v.dreamFirst !== v.dreamSecond, { message: 'dream priorities must differ' });

const result = z.object({
  name: z.string().min(1).max(20),
  emoji: z.enum(COUPLE_EMOJIS),
  score: z.number().int().min(80).max(99),
  strengths: z.array(z.string().min(1).max(30)).length(3),
  advice: z.string().min(1).max(160),
  color: z.enum(COUPLE_COLORS),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'emoji', 'score', 'strengths', 'advice', 'color'],
  properties: {
    name: { type: 'string', description: '커플 유형 이름 (예: 소울메이트, 코미디 커플), 10자 안팎' },
    emoji: { type: 'string', enum: [...COUPLE_EMOJIS], description: '커플 유형을 나타내는 아이콘' },
    score: { type: 'integer', description: '대화 놀이를 위한 장식적 연출값 80~99. 관계의 성공률·심리 측정·상대적 우열을 뜻하지 않음' },
    strengths: { type: 'array', items: { type: 'string' }, description: '두 사람이 이야기해 볼 수 있는 강점 후보 정확히 3개. 단정 대신 답변의 선호를 바탕으로 작성, 각 15자 이내' },
    advice: { type: 'string', description: '답변과 체험 브리프의 대화 목표·가능한 시간을 반영한 작은 공동 행동 2문장, 90자 안팎' },
    color: { type: 'string', enum: [...COUPLE_COLORS], description: '커플 분위기에 어울리는 색' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 웨딩·커플 행사의 창작 대화 카드 진행자입니다. 결과는 선호 답변에서 출발하는 가벼운 대화 놀이이며 심리검사·상담·관계 성공 예측이 아닙니다.
관계의 좋고 나쁨·완벽함·위기·지속 기간을 단정하거나 낮은 궁합을 진단하지 않습니다. 서로 다른 답변은 대화할 소재로만 사용하고 선호가 같다고 더 우월하거나 성공 가능성이 높다고 말하지 않습니다.
첨부된 체험 브리프의 conversationGoal과 sharedTime에 맞춰 함께할 수 있는 작고 구체적인 행동을 제안합니다. 신체 접촉·큰 지출·과도한 자기 공개를 요구하지 않습니다.
성별을 가정하지 않고 "두 사람", "A", "B"로 부릅니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ loveA, loveB, conflict, dreamFirst, dreamSecond }) {
    const lab = <T extends { id: string; label: string }>(list: readonly T[], id: string) => list.find((x) => x.id === id)!.label;
    const c = COUPLE_CONFLICTS.find((x) => x.id === conflict)!;
    const prompt = `커플 케미스트리 체험 결과를 만들어 주세요.
방문객 답변: A의 사랑의 언어=${lab(COUPLE_LOVE_LANGS, loveA)}, B의 사랑의 언어=${lab(COUPLE_LOVE_LANGS, loveB)}${loveA === loveB ? ' (두 사람이 같음)' : ''}, 갈등 해결 방식=${c.label}(${c.desc}), 꿈꾸는 삶 1순위=${lab(COUPLE_DREAMS, dreamFirst)}, 2순위=${lab(COUPLE_DREAMS, dreamSecond)}
${themeLine()}`;
    return result.parse(await generateJson({ name: 'couple_chemistry', system: SYSTEM, prompt, schema }));
  },
});
