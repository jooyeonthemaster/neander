import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import {
  TASTE_DNA_ADVENTURES,
  TASTE_DNA_BASES,
  TASTE_DNA_SPICE_LEVELS,
  TASTE_DNA_TASTES,
  TASTE_DNA_TEXTURES,
  formatTasteTypeName,
  type AdventureId,
  type TextureId,
} from '@/data/demo-ai/taste-dna';

// AI 미각 DNA — 5미 슬라이더·매운맛 단계·식감·모험 성향으로 미각 유형과 맞춤 음식·음료·도전 미션을 만든다.
// 8가지 축 수치와 평문 취향 요약은 방문객 답변으로 데모가 계산한다.

const slider = z.number().int().min(0).max(100);

const input = z.object({
  taste: z.object({ sweet: slider, salty: slider, sour: slider, bitter: slider, umami: slider }),
  spice: z.number().int().min(0).max(4),
  texture: z.enum(Object.keys(TASTE_DNA_TEXTURES) as [TextureId, ...TextureId[]]),
  adventure: z.enum(Object.keys(TASTE_DNA_ADVENTURES) as [AdventureId, ...AdventureId[]]),
});

const rec = z.object({
  emoji: z.string().min(1).max(8),
  name: z.string().min(2).max(20),
  why: z.string().min(2).max(40),
});

const result = z.object({
  base: z.enum(TASTE_DNA_BASES),
  name: z.string().min(2).max(12),
  desc: z.string().min(10).max(150),
  foods: z.array(rec).min(3).max(4),
  drinks: z.array(rec).min(3).max(4),
  mission: rec,
  hashtags: z.array(z.string().min(1).max(12)).min(2).max(3),
});

const recSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['emoji', 'name', 'why'],
  properties: {
    emoji: { type: 'string', description: '음식·음료 이모지 1개' },
    name: { type: 'string', description: '실제 메뉴 이름, 14자 이내' },
    why: { type: 'string', description: '추천 이유 한 구절, 20자 이내' },
  },
};

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['base', 'name', 'desc', 'foods', 'drinks', 'mission', 'hashtags'],
  properties: {
    base: {
      type: 'string',
      enum: [...TASTE_DNA_BASES],
      description: '가장 두드러진 미각 계열 (sweet=단맛, salty=짠맛, sour=신맛, bitter=쓴맛, umami=감칠맛, fire=매운맛 3단계 이상이 가장 강할 때, balance=다섯 맛이 고르게 비슷할 때)',
    },
    name: { type: 'string', description: '미각 유형 이름, 한글 8자 안팎 "맛 키워드 + 성향" 형태 (예: 달콤 탐험가, 감칠맛 수호자)' },
    desc: { type: 'string', description: '유형 해설 2문장, 90자 이내. 방문객 답변을 재치 있게 짚기' },
    foods: { type: 'array', items: recSchema, description: '추천 음식 4개 — 마지막 하나는 좋아하는 식감을 살린 메뉴' },
    drinks: { type: 'array', items: recSchema, description: '추천 음료 4개 — 논알콜 음료를 2개 이상 포함' },
    mission: { ...recSchema, description: '이번 주 미각 도전 미션 — 모험 성향에 맞는 난이도의 음식 하나' },
    hashtags: { type: 'array', items: { type: 'string' }, description: '해시태그 3개, # 없이 공백 없이 각 8자 이내' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 미각 분석가 AI입니다. 추천 메뉴는 한국에서 실제로 먹어 볼 수 있는 음식·음료로 씁니다.
유형 이름은 의미 단위로 띄어 씁니다. '화끈한크림모험가' 대신 '화끈한 크림 모험가'처럼 맛·식감·성향 단어를 구분합니다.
매운맛 단계가 낮은 방문객에게 매운 음식을, 모험 성향이 '늘 먹던 맛'인 방문객에게 낯선 이국 음식을 권하지 않습니다.
음료는 술만 권하지 말고 논알콜 음료를 섞습니다. 건강 효과·다이어트 효과를 단정하지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ taste, spice, texture, adventure }) {
    const tasteLine = TASTE_DNA_TASTES.map((t) => `${t.label} ${taste[t.id]}`).join(', ');
    const spiceLevel = TASTE_DNA_SPICE_LEVELS[spice]!;
    const tex = TASTE_DNA_TEXTURES[texture];
    const adv = TASTE_DNA_ADVENTURES[adventure];
    const prompt = `미각 DNA 체험 결과를 만들어 주세요.
방문객 답변: 다섯 가지 맛 선호(0~100)=${tasteLine}, 매운맛 내성=${spice}/4단계 ${spiceLevel.label}(${spiceLevel.desc}), 최애 식감=${tex.label}(${tex.desc}), 새로운 음식 앞에서=${adv.label}(${adv.desc})
${themeLine()}`;
    const out = result.parse(await generateJson({ name: 'taste_dna', system: SYSTEM, prompt, schema }));
    return { ...out, name: formatTasteTypeName(out.name), hashtags: out.hashtags.map((h) => h.replace(/^#+/, '').replace(/\s/g, '')) };
  },
});
