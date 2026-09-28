import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import { FORTUNE_CATEGORIES, FORTUNE_DIRECTIONS, FORTUNE_ELEMENTS } from '@/data/demo-ai/fortune';

// AI 포춘 로봇 — 태어난 달·끌리는 원소·궁금한 운세로 오늘의 점괘를 만든다.

const input = z.object({
  month: z.number().int().min(1).max(12),
  element: z.enum(FORTUNE_ELEMENTS.map((e) => e.id) as [string, ...string[]]),
  category: z.enum(FORTUNE_CATEGORIES.map((c) => c.id) as [string, ...string[]]),
});

const result = z.object({
  name: z.string().min(1).max(24),
  lines: z.array(z.string().min(1).max(60)).min(2).max(2),
  luckyNumber: z.number().int().min(1).max(99),
  luckyColor: z.string().min(1).max(12),
  direction: z.enum(FORTUNE_DIRECTIONS),
  advice: z.string().min(1).max(50),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'lines', 'luckyNumber', 'luckyColor', 'direction', 'advice'],
  properties: {
    name: { type: 'string', description: '운세 아키타입 이름. 영어 단어를 한글로 적은 2단어 (예: 피닉스 파이어, 오션 위즈덤), 12자 안팎' },
    lines: { type: 'array', items: { type: 'string' }, description: '점괘 정확히 2줄. 각 줄 35자 이내의 한 문장, 희망적인 어조' },
    luckyNumber: { type: 'integer', description: '행운의 숫자 1~99' },
    luckyColor: { type: 'string', description: '행운의 색 이름 (예: 코발트 블루, 주홍색), 8자 이내' },
    direction: { type: 'string', enum: [...FORTUNE_DIRECTIONS], description: '행운의 방향' },
    advice: { type: 'string', description: '방문객이 궁금해한 운세 분야에 대한 한 줄 조언, 25자 이내' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 축제 부스의 원소 운세 로봇입니다. 태어난 계절과 상상 속 원소의 이미지를 빌린 가벼운 오늘의 이야기를 씁니다.
생년월일시를 계산하는 사주나 전통 오행, 정확한 별자리 분석이 아닙니다. 그런 분석을 했다고 말하지 않습니다.
"반드시 ~된다" 같은 단정 대신 "~할 기운이 보여요"처럼 부드럽게 쓰고, 나쁜 일·불운·경고는 쓰지 않습니다.
건강 운세는 생활 습관 수준의 가벼운 제안만 하고, 재물 운세는 특정 투자·도박을 권하지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ month, element, category }) {
    const elementLabel = FORTUNE_ELEMENTS.find((e) => e.id === element)!.label.split(' ')[0];
    const categoryLabel = FORTUNE_CATEGORIES.find((c) => c.id === category)!.label.split(' ')[0];
    const prompt = `포춘 로봇 체험 결과(오늘의 점괘)를 만들어 주세요.
방문객 답변: 태어난 달=${month}월, 끌리는 원소=${elementLabel}, 궁금한 운세=${categoryLabel}
아키타입 이름과 점괘에 원소와 태어난 계절의 이미지를 담고, advice는 ${categoryLabel} 운세에 대한 조언으로 써 주세요.
${themeLine()}`;
    return result.parse(await generateJson({ name: 'fortune', system: SYSTEM, prompt, schema }));
  },
});
