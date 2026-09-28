import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import { PC_COLOR_SWATCHES, PC_SEASON_PALETTES, PC_SEASONS, PC_UNDERTONES } from '@/data/demo-ai/personal-color';

// AI 퍼스널 컬러 — 방문객이 고른 언더톤·눈/모발 색·끌리는 팔레트로 시즌 유형과 컬러 팔레트를 만든다. (사진 없음)

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((o) => o.id) as [string, ...string[]];

const input = z.object({
  undertone: z.enum(ids(PC_UNDERTONES)),
  coloring: z.array(z.enum(ids(PC_COLOR_SWATCHES))).min(1).max(2),
  preference: z.enum(ids(PC_SEASON_PALETTES)),
});

const color = z.object({ hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/), name: z.string().min(1).max(16) });

const result = z.object({
  season: z.enum(PC_SEASONS),
  name: z.string().min(2).max(16),
  en: z.string().min(2).max(32),
  desc: z.string().min(10).max(200),
  colors: z.array(color).min(6).max(8),
  avoid: z.array(color).min(3).max(4),
  tips: z.array(z.string().min(4).max(60)).min(2).max(3),
});

const colorSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['hex', 'name'],
  properties: {
    hex: { type: 'string', description: '#RRGGBB 형식 (대문자 16진수)' },
    name: { type: 'string', description: '한글 색 이름, 8자 이내 (예: 버터 옐로)' },
  },
};

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['season', 'name', 'en', 'desc', 'colors', 'avoid', 'tips'],
  properties: {
    season: { type: 'string', enum: [...PC_SEASONS], description: '시즌 (spring=봄 웜, summer=여름 쿨, autumn=가을 웜, winter=겨울 쿨)' },
    name: { type: 'string', description: '세부 유형 한글 이름 (예: 봄 웜 브라이트, 여름 쿨 뮤트, 가을 웜 딥)' },
    en: { type: 'string', description: '영문 이름 (예: Spring Warm Bright)' },
    desc: { type: 'string', description: '어울리는 이유와 분위기 2문장, 120자 이내' },
    colors: { type: 'array', items: colorSchema, description: '추천 컬러 8개, 첫 번째가 시그니처 컬러' },
    avoid: { type: 'array', items: colorSchema, description: '추천 팔레트와 나란히 비교할 다른 컬러 방향 4개. 피해야 할 색이라고 단정하지 않음.' },
    tips: { type: 'array', items: { type: 'string' }, description: '메이크업·헤어·액세서리 스타일링 팁 3개, 각 40자 이내' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 컬러 스타일링 컨설턴트입니다. 사진이나 실제 드레이핑 없이 방문객이 고른 답변으로 스타일링 방향을 제안하는 체험입니다. 검증된 퍼스널 컬러 진단이나 확정된 언더톤이라고 표현하지 않습니다.
시즌은 팔레트를 분류하는 이름입니다. 웜을 고르면 봄·가을, 쿨을 고르면 여름·겨울을 후보로 삼되 좋아하는 팔레트, 활용 장면과 대비 선호를 우선합니다. 눈·모발 색이나 혈관 색만으로 실제 언더톤을 확정하지 않습니다.
추천색은 코디하기 좋은 조합으로 고르고 avoid 필드는 나란히 비교할 다른 방향의 색으로 씁니다. 특정 색을 못 쓰거나 피해야 한다고 단정하지 않습니다. 팁에는 사용 장면과 원하는 대비를 실제 색 면적·조합으로 설명합니다.
입력 속성을 다른 부위에 옮겨 쓰지 않습니다. 눈동자·모발의 '레디쉬 브라운'은 해당 부위의 입력일 뿐 립의 색·결·제품명이 아닙니다. 립은 립에 어울리는 독립적인 색상(예: 로즈 베리, 누드 코랄)으로 제안하고 머릿결·눈동자 묘사를 섞지 않습니다.
선택한 톤과 맞지 않는 온도 비유를 금지합니다. 여름·겨울 쿨 팔레트에 '갓 구운 온기', '따뜻한 햇살'처럼 웜톤을 암시하는 비유를 쓰지 않습니다. 음식·온도 비유 대신 실제 색의 명도·채도·대비로 설명합니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ undertone, coloring, preference }) {
    const tone = PC_UNDERTONES.find((t) => t.id === undertone)!;
    const colors = PC_COLOR_SWATCHES.filter((c) => coloring.includes(c.id)).map((c) => c.label);
    const pref = PC_SEASON_PALETTES.find((s) => s.id === preference)!;
    const prompt = `퍼스널 컬러 체험 결과를 만들어 주세요.
방문객 답변: 피부 언더톤=${tone.label}(${tone.desc}), 눈동자·머리카락 색=${colors.join(', ')}, 직감적으로 끌린 팔레트=${pref.label}
${themeLine()}`;
    return result.parse(await generateJson({ name: 'personal_color', system: SYSTEM, prompt, schema }));
  },
});
