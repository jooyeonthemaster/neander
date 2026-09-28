import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import { COCKTAIL_COLORS, COCKTAIL_MOODS, COCKTAIL_SPIRITS, cocktailCopy, normalizeCocktailGarnish } from '@/data/demo-ai/cocktail';

// AI 칵테일 크리에이터 — 방문객 답변으로 레시피를 생성한다. (다른 데모 spec의 기준 예시)

const input = z.object({
  mood: z.enum(COCKTAIL_MOODS.map((m) => m.id) as [string, ...string[]]),
  spirit: z.enum(COCKTAIL_SPIRITS.map((s) => s.id) as [string, ...string[]]),
  sweetness: z.number().int().min(1).max(10),
  strength: z.number().int().min(1).max(10),
});

const result = z.object({
  name: z.string().min(1).max(40),
  tagline: z.string().min(1).max(60),
  story: z.string().min(1).max(400),
  ingredients: z.array(z.string().min(1).max(60)).min(2).max(8),
  garnish: z.string().min(1).max(60),
  method: z.string().min(1).max(300),
  color: z.enum(COCKTAIL_COLORS),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'tagline', 'story', 'ingredients', 'garnish', 'method', 'color'],
  properties: {
    name: { type: 'string', description: '칵테일 이름 (한글, 12자 안팎)' },
    tagline: { type: 'string', description: '한 줄 소개, 30자 이내' },
    story: { type: 'string', description: '방문객 답변을 반영한 설명 2~3문장' },
    ingredients: { type: 'array', items: { type: 'string' }, description: '재료와 분량 (ml 단위)' },
    garnish: { type: 'string' },
    method: { type: 'string', description: '만드는 법 1~2문장' },
    color: { type: 'string', enum: [...COCKTAIL_COLORS], description: '완성된 칵테일의 색에 가장 가까운 것' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 바텐더 AI입니다. 실제로 만들 수 있는 레시피만 쓰고, 재료는 ml 단위로 적습니다.
표기는 '가니시'로 통일하고 장식이 없으면 garnish는 '없음'으로 씁니다. 향수 용어인 '조향' 대신 칵테일에 맞는 '블렌딩', '섞기', '만들기'를 씁니다.
도수 규칙: 도수 1~3이면 증류주 합계 30ml 이하, 4~7이면 30~45ml, 8~10이면 45~60ml.
논알콜을 고르면 술·리큐어·비터스 등 알코올이 든 재료를 절대 쓰지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ mood, spirit, sweetness, strength }) {
    const moodLabel = COCKTAIL_MOODS.find((m) => m.id === mood)!.label;
    const spiritLabel = COCKTAIL_SPIRITS.find((s) => s.id === spirit)!.label;
    const prompt = `칵테일 크리에이터 체험 결과를 만들어 주세요.
방문객 답변: 오늘의 기분=${moodLabel}, 베이스=${spiritLabel}, 당도 ${sweetness}/10, 도수 ${spirit === 'nonalcohol' ? '없음(논알콜)' : `${strength}/10`}
${themeLine()}`;
    const out = result.parse(await generateJson({ name: 'cocktail', system: SYSTEM, prompt, schema }));
    return { ...out, garnish: normalizeCocktailGarnish(out.garnish), story: cocktailCopy(out.story), tagline: cocktailCopy(out.tagline), method: cocktailCopy(out.method) };
  },
});
