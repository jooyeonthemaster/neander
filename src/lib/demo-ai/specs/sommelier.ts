import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import {
  SOMMELIER_KINDS,
  SOMMELIER_OCCASIONS,
  SOMMELIER_PAIRINGS,
  SOMMELIER_STYLES,
  SOMMELIER_TASTE_SLIDERS,
} from '@/data/demo-ai/sommelier';

// AI 소믈리에 — 맛 슬라이더·선호 주종·자리·음식으로 와인/전통주 스타일 하나와 테이스팅 노트·페어링을 추천한다.

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((o) => o.id) as [string, ...string[]];
const slider = z.number().int().min(0).max(100);

const input = z.object({
  taste: z.object({ sweet: slider, acid: slider, body: slider, bitter: slider }),
  style: z.enum(ids(SOMMELIER_STYLES)),
  occasion: z.enum(ids(SOMMELIER_OCCASIONS)),
  pairing: z.enum(ids(SOMMELIER_PAIRINGS)),
});

const pct = z.number().int().min(0).max(100);
const line = (max: number) => z.string().min(2).max(max);

const result = z.object({
  name: line(30),
  origin: line(30),
  kind: z.enum(SOMMELIER_KINDS),
  profile: z.object({ sweet: pct, acid: pct, body: pct, bitter: pct }),
  nose: line(40),
  palate: line(50),
  finish: line(40),
  temp: line(20),
  matchRate: z.number().int().min(72).max(98),
  reason: line(160),
  pairing: z.object({ dish: line(24), tip: line(80) }),
});

const pctSchema = { type: 'integer', description: '0~100' };

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'origin', 'kind', 'profile', 'nose', 'palate', 'finish', 'temp', 'matchRate', 'reason', 'pairing'],
  properties: {
    name: { type: 'string', description: '추천 주류의 스타일·산지 이름, 20자 이내 (예: 부르고뉴 피노 누아, 모스카토 다스티, 프리미엄 생막걸리). 브랜드·양조장·빈티지 없이' },
    origin: { type: 'string', description: '"나라 · 종류" 형식 (예: 프랑스 · 레드 와인, 한국 · 탁주)' },
    kind: { type: 'string', enum: [...SOMMELIER_KINDS], description: 'wine=와인, korean=한국 전통주' },
    profile: {
      type: 'object',
      additionalProperties: false,
      required: ['sweet', 'acid', 'body', 'bitter'],
      properties: { sweet: pctSchema, acid: pctSchema, body: pctSchema, bitter: pctSchema },
      description: '추천 주류의 실제 맛 프로필 (단맛·산미·바디감·쌉쌀함, 각 0~100)',
    },
    nose: { type: 'string', description: '향 — 대표 아로마 3가지를 쉼표로, 25자 이내' },
    palate: { type: 'string', description: '맛 — 질감과 맛 한 구절, 30자 이내' },
    finish: { type: 'string', description: '여운 한 구절, 25자 이내' },
    temp: { type: 'string', description: '서빙 온도 (예: 14–16°C)' },
    matchRate: { type: 'integer', description: '방문객 미각과의 일치도 72~98' },
    reason: { type: 'string', description: '이 술을 고른 이유 2문장, 100자 이내. 방문객 맛 취향과 마시는 자리를 연결' },
    pairing: {
      type: 'object',
      additionalProperties: false,
      required: ['dish', 'tip'],
      properties: {
        dish: { type: 'string', description: '방문객이 고른 음식 종류 안에서 구체적인 메뉴 하나, 15자 이내 (예: 한우 채끝 스테이크)' },
        tip: { type: 'string', description: '왜 잘 어울리는지 한 문장, 50자 이내' },
      },
    },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 와인·전통주 소믈리에 AI입니다. 실제로 존재하는 일반적인 스타일·품종·산지만 추천하고, 특정 브랜드·양조장·가격은 말하지 않습니다.
주종 규칙: '와인'을 고르면 와인(스파클링 포함)만, '전통주'를 고르면 한국 전통주(막걸리·약주·청주·과실주·증류식 소주 등)만, '상관없어요'면 둘 중 더 잘 맞는 쪽을 고릅니다.
맛 프로필은 추천한 술의 실제 특성에 맞게 쓰되, 방문객 슬라이더 값과 가까운 술을 고릅니다. 선물이면 격식 있는 술, 파티면 가볍고 어울리기 쉬운 술을 우선합니다.
테이스팅 노트(향·맛·여운)와 맛 프로필은 비유 없이 그 술의 실제 특성으로만 쓰고, 영감 키워드는 선택 이유(reason)에만 은은하게 반영합니다.
술을 권하는 압박 없이 천천히 음미하는 분위기로 쓰고, 과음·취함을 미화하지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ taste, style, occasion, pairing }) {
    const tasteLine = SOMMELIER_TASTE_SLIDERS.map((s) => `${s.label} ${taste[s.id]}`).join(', ');
    const styleOpt = SOMMELIER_STYLES.find((o) => o.id === style)!;
    const occ = SOMMELIER_OCCASIONS.find((o) => o.id === occasion)!;
    const food = SOMMELIER_PAIRINGS.find((o) => o.id === pairing)!;
    const prompt = `AI 소믈리에 체험 결과를 만들어 주세요.
방문객 답변: 좋아하는 맛(0~100)=${tasteLine}, 끌리는 술=${styleOpt.label}, 마시는 자리=${occ.label}(${occ.desc}), 함께할 음식=${food.label}
${themeLine()}`;
    const out = result.parse(await generateJson({ name: 'sommelier', system: SYSTEM, prompt, schema }));
    if (style !== 'any' && out.kind !== style) throw new Error(`kind mismatch: ${out.kind} for ${style}`);
    return out;
  },
});
