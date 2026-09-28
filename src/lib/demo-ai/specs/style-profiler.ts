import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import { STYLE_ITEM_EMOJIS, STYLE_OCCASIONS, STYLE_PALETTES, STYLE_VIBES } from '@/data/demo-ai/style';

// AI 스타일 프로파일러 — 스타일 무드·컬러 팔레트·TPO로 스타일 아키타입과 추천 워드로브를 만든다.

const palette = z.enum(STYLE_PALETTES.map((p) => p.id) as [string, ...string[]]);

const input = z.object({
  vibe: z.enum(STYLE_VIBES.map((v) => v.id) as [string, ...string[]]),
  palette: z.array(palette).min(1).max(2).refine((a) => new Set(a).size === a.length, { message: 'duplicate palette' }),
  occasion: z.enum(STYLE_OCCASIONS.map((o) => o.id) as [string, ...string[]]),
});

const hex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).transform((s) => s.toUpperCase());

const result = z.object({
  name: z.string().min(1).max(20),
  tags: z.array(z.string().trim().min(2).max(16).transform((t) => (t.startsWith('#') ? t : `#${t}`).replace(/\s+/g, '_'))).length(3),
  desc: z.string().min(1).max(160),
  colors: z.array(hex).length(5),
  wardrobe: z
    .array(z.object({ item: z.string().min(1).max(20), emoji: z.enum(STYLE_ITEM_EMOJIS), why: z.string().min(1).max(20) }))
    .length(3),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'tags', 'desc', 'colors', 'wardrobe'],
  properties: {
    name: { type: 'string', description: '스타일 아키타입 이름 (예: 노르딕 미니멀리스트), 12자 안팎' },
    tags: { type: 'array', items: { type: 'string' }, description: '해시태그 정확히 3개, "#"로 시작하고 띄어쓰기 없이 각 8자 이내 (예: #톤온톤)' },
    desc: { type: 'string', description: '방문객의 스타일 설명 2문장, 90자 안팎' },
    colors: { type: 'array', items: { type: 'string' }, description: '추천 컬러 정확히 5개, "#RRGGBB" 형식의 서로 다른 HEX 코드. 방문객이 고른 팔레트를 바탕으로 하되 그대로 베끼지 말고 무드·상황에 맞게 톤을 조정해 조합' },
    wardrobe: {
      type: 'array',
      description: '추천 아이템 정확히 3개 (상의·하의/원피스·신발/가방/액세서리를 섞어서)',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['item', 'emoji', 'why'],
        properties: {
          item: { type: 'string', description: '아이템 이름, 12자 이내 (예: 와이드 슬랙스)' },
          emoji: { type: 'string', enum: [...STYLE_ITEM_EMOJIS], description: '아이템에 가장 가까운 아이콘' },
          why: { type: 'string', description: '추천 이유, 12자 이내' },
        },
      },
    },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 패션 행사의 AI 스타일리스트입니다. 방문객의 취향을 칭찬하며 실제로 구할 수 있는 일반적인 아이템을 추천합니다.
특정 브랜드·가격은 쓰지 않고, 체형·외모에 대한 언급은 하지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ vibe, palette, occasion }) {
    const v = STYLE_VIBES.find((x) => x.id === vibe)!;
    const pals = palette.map((id) => STYLE_PALETTES.find((p) => p.id === id)!);
    const o = STYLE_OCCASIONS.find((x) => x.id === occasion)!;
    const prompt = `스타일 프로파일러 체험 결과를 만들어 주세요.
방문객 답변: 스타일 무드=${v.label}(${v.desc}), 선호 컬러 팔레트=${pals.map((p) => `${p.label}(${p.colors.join(' ')})`).join(', ')}, 주로 입는 상황=${o.label}(${o.desc})
워드로브는 ${o.label} 상황에 맞게 골라 주세요.
${themeLine()}`;
    return result.parse(await generateJson({ name: 'style_profiler', system: SYSTEM, prompt, schema }));
  },
});
