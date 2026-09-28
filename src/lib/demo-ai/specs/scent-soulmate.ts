import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import {
  SCENT_AXES,
  SCENT_COLORS,
  SCENT_PERFUMES,
  SCENT_PERSONA,
  SCENT_PLACES,
  SCENT_SEASONS,
} from '@/data/demo-ai/scent';

// AI 향수 소울메이트 — 성격 키워드·끌리는 장소·계절·무드 컬러로 방문객만의 향수를 조향하고,
// 부스 향수(고정 목록) 중 하나를 레이어링 짝으로 고른다.

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((o) => o.id) as [string, ...string[]];
const PERFUME_KEYS = Object.keys(SCENT_PERFUMES) as [string, ...string[]];
const HEX = /^#[0-9A-Fa-f]{6}$/;

const input = z.object({
  persona: z.array(z.enum(ids(SCENT_PERSONA))).min(1).max(2),
  place: z.enum(ids(SCENT_PLACES)),
  season: z.enum(ids(SCENT_SEASONS)),
  color: z.enum(ids(SCENT_COLORS)),
});

const noteList = z.array(z.string().min(1).max(16)).min(2).max(3);

const result = z.object({
  name: z.string().min(2).max(16),
  en: z.string().min(2).max(24),
  family: z.string().min(2).max(16),
  emoji: z.string().min(1).max(8),
  notes: z.object({ top: noteList, middle: noteList, base: noteList }),
  mood: z.string().min(10).max(120),
  keywords: z.array(z.string().min(1).max(8)).min(3).max(3),
  colors: z.tuple([z.string().regex(HEX), z.string().regex(HEX)]),
  scentType: z.string().min(2).max(16),
  matchRate: z.number().int().min(80).max(98),
  layering: z.enum(PERFUME_KEYS),
  layeringRate: z.number().int().min(70).max(95),
});

const notesSchema = { type: 'array', items: { type: 'string' }, description: '실제 향료 이름 2~3개' };

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'en', 'family', 'emoji', 'notes', 'mood', 'keywords', 'colors', 'scentType', 'matchRate', 'layering', 'layeringRate'],
  properties: {
    name: { type: 'string', description: '향수 이름 한글, 10자 이내 (예: 페탈 레터)' },
    en: { type: 'string', description: '향수 영문 이름, 20자 이내 (예: Petal Letter)' },
    family: { type: 'string', description: '향 계열, 10자 이내 (예: 파우더리 플로럴, 그린 우디)' },
    emoji: { type: 'string', description: '향수를 나타내는 이모지 1개' },
    notes: {
      type: 'object',
      additionalProperties: false,
      required: ['top', 'middle', 'base'],
      properties: { top: notesSchema, middle: notesSchema, base: notesSchema },
      description: '노트 피라미드 — 탑은 가볍고 휘발성 있는 향료, 베이스는 무겁고 오래가는 향료',
    },
    mood: { type: 'string', description: '향의 분위기 한두 문장, 70자 이내, "~향이에요"로 끝맺기' },
    keywords: { type: 'array', items: { type: 'string' }, description: '향을 표현하는 형용사 키워드 3개, 각 5자 이내 (예: 다정한)' },
    colors: { type: 'array', items: { type: 'string' }, description: '향수병 색 2개 [밝은 색, 진한 색], #RRGGBB' },
    scentType: { type: 'string', description: '방문객의 향 타입 별명, 12자 이내 (예: 꽃잎 같은 로맨티스트)' },
    matchRate: { type: 'integer', description: '소울메이트 매치율 80~98' },
    layering: { type: 'string', enum: PERFUME_KEYS, description: '부스 향수 목록 중 이 향수와 겹쳐 뿌리기 좋은 것' },
    layeringRate: { type: 'integer', description: '레이어링 향수와의 매치율 70~92, matchRate보다 3 이상 낮게' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 향수 조향사 AI입니다. 방문객의 답변을 향료로 번역해 세상에 하나뿐인 향수를 설계합니다.
노트는 실제로 향수에 쓰이는 향료만 쓰고(예: 베르가못, 네롤리, 피오니, 아이리스, 시더우드, 샌달우드, 앰브레트, 통카빈), 방문객이 고른 장소·계절·컬러가 노트 선택에 드러나게 합니다.
향수 이름은 기존 상용 향수 이름을 쓰지 않고 새로 짓습니다. 향의 효능(치유·건강)을 단정하지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ persona, place, season, color }) {
    const personaLabels = SCENT_PERSONA.filter((o) => persona.includes(o.id)).map((o) => `${o.label}(${o.desc})`);
    const placeOpt = SCENT_PLACES.find((o) => o.id === place)!;
    const seasonOpt = SCENT_SEASONS.find((o) => o.id === season)!;
    const colorOpt = SCENT_COLORS.find((o) => o.id === color)!;
    const axisLabel = Object.fromEntries(SCENT_AXES.map((a) => [a.id, a.label]));
    const perfumes = Object.entries(SCENT_PERFUMES)
      .map(([key, p]) => {
        const top2 = SCENT_AXES.map((a) => a.id).sort((a, b) => p.profile[b] - p.profile[a]).slice(0, 2);
        return `- ${key}: ${p.name} (${p.family}, 주요 계열 ${top2.map((a) => axisLabel[a]).join('·')})`;
      })
      .join('\n');
    const prompt = `향수 소울메이트 체험 결과를 만들어 주세요.
방문객 답변: 나를 표현하는 키워드=${personaLabels.join(', ')}, 끌리는 장소=${placeOpt.label}(${placeOpt.desc}), 좋아하는 계절=${seasonOpt.label}, 무드 컬러=${colorOpt.label}

레이어링용 부스 향수 목록:
${perfumes}
${themeLine()}`;
    const out = result.parse(await generateJson({ name: 'scent_soulmate', system: SYSTEM, prompt, schema }));
    return { ...out, layeringRate: Math.min(out.layeringRate, out.matchRate - 3) };
  },
});
