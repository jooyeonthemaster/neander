import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import {
  BARISTA_AROMAS,
  BARISTA_BEANS,
  BARISTA_BREWS,
  BARISTA_HABITS,
  BARISTA_ROASTS,
  BARISTA_TASTE_SLIDERS,
  resolveBaristaBrew,
  baristaServing,
} from '@/data/demo-ai/barista';

// AI 바리스타 매칭 — 커피 습관·맛 슬라이더·향 취향으로 원두(고정 목록 중)·로스팅·추출 방식과 취향 설명을 고른다.
// 원두의 산지·가공·노트는 실제 정보라 목록에서만 고르고, 레시피 수치는 데모가 추출 방식·로스팅으로 계산한다.

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((o) => o.id) as [string, ...string[]];
const BEAN_KEYS = Object.keys(BARISTA_BEANS) as [string, ...string[]];
const slider = z.number().int().min(0).max(100);

const input = z.object({
  habit: z.enum(ids(BARISTA_HABITS)),
  aroma: z.enum(ids(BARISTA_AROMAS)),
  taste: z.object({ acid: slider, bitter: slider, nutty: slider, sweet: slider, body: slider }),
  brewTool: z.enum(['dripper', 'espresso', 'immersion', 'cafe']).optional(),
});

const result = z.object({
  bean: z.enum(BEAN_KEYS),
  roast: z.number().int().min(0).max(7),
  brew: z.enum(BARISTA_BREWS),
  persona: z.object({
    emoji: z.string().min(1).max(8),
    name: z.string().min(2).max(16),
    desc: z.string().min(4).max(50),
  }),
  matchRate: z.number().int().min(72).max(98),
  story: z.string().min(10).max(200),
  tip: z.string().min(4).max(80),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['bean', 'roast', 'brew', 'persona', 'matchRate', 'story', 'tip'],
  properties: {
    bean: { type: 'string', enum: BEAN_KEYS, description: '원두 목록에서 방문객 취향에 가장 맞는 키' },
    roast: { type: 'integer', description: `추천 로스팅 단계 0~7 (${BARISTA_ROASTS.map((r, i) => `${i}=${r.name}`).join(', ')})` },
    brew: {
      type: 'string',
      enum: [...BARISTA_BREWS],
      description: '추출 방식 (pourover=핸드드립, frenchpress=프렌치프레스, espresso=에스프레소, latte=카페 라떼, coldbrew=콜드브루)',
    },
    persona: {
      type: 'object',
      additionalProperties: false,
      required: ['emoji', 'name', 'desc'],
      properties: {
        emoji: { type: 'string', description: '취향 타입을 나타내는 이모지 1개' },
        name: { type: 'string', description: '커피 취향 타입 이름, 한글 10자 안팎. 맛·향 취향이 이름에서 드러나야 함 (예: 산미 탐험가, 고소함 수집가). 영감 키워드는 이름에 넣지 않아도 된다' },
        desc: { type: 'string', description: '취향 타입 한 줄 설명, 30자 이내, "~타입"으로 끝맺기' },
      },
    },
    matchRate: { type: 'integer', description: '취향 일치도 72~98' },
    story: { type: 'string', description: '이 원두가 방문객 취향에 맞는 이유 2문장, 120자 이내. 원두 정보와 방문객 답변을 연결' },
    tip: { type: 'string', description: '이 원두를 더 맛있게 즐기는 팁 한 문장, 50자 이내 (곁들일 디저트·잔·마시는 온도감 등. 추출 온도·분쇄도·시간 수치는 레시피 카드가 따로 보여 주므로 쓰지 않는다)' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 스페셜티 카페의 바리스타 AI입니다. 원두는 반드시 주어진 목록에서만 고르고, 목록에 없는 산지·노트를 지어내지 않습니다.
원두의 맛 프로필(0~100)과 방문객 슬라이더 값, 좋아하는 향이 가깝도록 고릅니다.
추출 방식은 평소 마시는 스타일을 존중합니다 (라떼·달달한 커피→latte, 에스프레소→espresso, 콜드브루→coldbrew, 핸드드립→pourover, 아메리카노→pourover 또는 바디가 묵직하면 frenchpress).
사용할 도구가 지정되면 도구를 우선합니다. dripper는 pourover, immersion은 frenchpress, espresso 머신은 espresso(라떼·달달한 커피 선호면 latte)입니다. cafe 또는 미지정일 때는 음용 취향을 따릅니다. story도 실제 추출 방식에 맞추고, 잔과 음용 팁은 서버의 방식별 표에서 제공하므로 다른 방식의 잔을 언급하지 않습니다.
로스팅은 원두의 기본 로스팅 단계에서 ±1 안에서 정합니다. 우유·시럽과 마시면 한 단계 진하게, 핸드드립이면 한 단계 밝게 해도 됩니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ habit, aroma, taste, brewTool }) {
    const habitOpt = BARISTA_HABITS.find((h) => h.id === habit)!;
    const aromaOpt = BARISTA_AROMAS.find((a) => a.id === aroma)!;
    const tasteLine = BARISTA_TASTE_SLIDERS.map((s) => `${s.label} ${taste[s.id]}`).join(', ');
    const beans = Object.entries(BARISTA_BEANS)
      .map(([key, b]) => {
        const p = b.profile;
        return `- ${key}: ${b.name} (${b.region}, ${b.process}) 산미 ${p.acid}/쓴맛 ${p.bitter}/고소함 ${p.nutty}/단맛 ${p.sweet}/바디 ${p.body}, 향 계열=${BARISTA_AROMAS.find((a) => a.id === b.aroma)!.label}, 노트=${b.notes.join('·')}, 기본 로스팅=${b.roast}`;
      })
      .join('\n');
    const prompt = `바리스타 매칭 체험 결과를 만들어 주세요.
방문객 답변: 평소 스타일=${habitOpt.label}(${habitOpt.desc}), 사용할 도구=${brewTool ?? '미지정'}, 좋아하는 맛(0~100)=${tasteLine}, 끌리는 향=${aromaOpt.label}(${aromaOpt.desc})

원두 목록:
${beans}
${themeLine()}`;
    const out = result.parse(await generateJson({ name: 'barista_match', system: SYSTEM, prompt, schema }));
    // 로스팅이 원두와 너무 동떨어지지 않게 기본 단계 ±1로 묶는다
    const base = BARISTA_BEANS[out.bean]!.roast;
    const brew = resolveBaristaBrew(brewTool, habit, out.brew);
    return { ...out, brew, tip: baristaServing(brew).tip, roast: Math.min(7, Math.max(0, base - 1, Math.min(base + 1, out.roast))) };
  },
});
