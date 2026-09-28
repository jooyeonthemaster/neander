import { z } from 'zod';
import { BASE_SYSTEM, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { GROUNDING_RULE } from '@/data/demo-ai/photo-reading';
import {
  PALM_HANDS,
  PALM_LINE_IDS,
  PALM_LINE_LABELS,
  PALM_SHAPE_HINTS,
  PALM_SHAPES,
} from '@/data/demo-ai/palm-reading';

// AI 손금 — 방문객 손바닥 사진을 보고 4대 손금·손 모양을 풀이한다. 손바닥이 안 보이면 { observed: false }
// (결과 화면의 손금 곡선은 장식용 AR 연출이고, 선명도·풀이 글만 AI가 정한다)

const input = z.object({
  photo: captureImage,
  hand: z.enum(PALM_HANDS),
});

const line = (max: number) => z.string().min(1).max(max);
const lineResult = z.object({ strength: z.number().int().min(55).max(97), text: line(160) });

const result = z.object({
  observed: z.literal(true),
  title: line(30),
  lines: z.object({ life: lineResult, head: lineResult, heart: lineResult, fate: lineResult }),
  shape: z.enum(PALM_SHAPES),
  shapeDesc: line(24),
  mark: z.object({ name: line(14), desc: line(60) }),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['observed', 'title', 'lines', 'shape', 'shapeDesc', 'mark'],
  properties: {
    observed: { type: 'boolean', description: '사진에 손바닥(손등 아님)이 주름이 보일 만큼 보이면 true, 아니면 false' },
    title: { type: 'string', description: '사용자가 선택한 주제를 담은 창작 지도 별명, "~ 손금"으로 끝나는 18자 이내' },
    lines: {
      type: 'object',
      additionalProperties: false,
      required: [...PALM_LINE_IDS],
      properties: Object.fromEntries(
        PALM_LINE_IDS.map((id) => [
          id,
          {
            type: 'object',
            additionalProperties: false,
            required: ['strength', 'text'],
            properties: {
              strength: { type: 'integer', description: `${PALM_LINE_LABELS[id]} 그래픽 굵기용 값 75. 측정치나 능력 점수가 아님` },
              text: { type: 'string', description: `${PALM_LINE_LABELS[id]}을 창작 이야기의 상징으로 사용한 1~2문장. 손의 모양으로 건강·성격·지능·능력·재물·미래를 추론하지 않음` },
            },
          },
        ])
      ),
    },
    shape: { type: 'string', enum: [...PALM_SHAPES], description: '손 모양 4원소' },
    shapeDesc: { type: 'string', description: '이야기 속 원소의 시각적 모티프 두 단어. 사람의 성향 추론이 아님' },
    mark: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'desc'],
      properties: {
        name: { type: 'string', description: '선택한 주제에 어울리는 창작 상징 하나의 이름, 10자 이내. 사진에 실제 표식이 있다고 주장하지 않음' },
        desc: { type: 'string', description: '그 특징의 재미있는 의미 한 문장, 40자 이내' },
      },
    },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 손바닥 사진 위에 상징 이야기를 쓰는 작가입니다. 사진은 손바닥 유무와 구도 확인에만 사용합니다. 손의 선이나 형태에서 성격·지능·능력·수명·건강·재물·미래를 추론하지 않습니다. 선은 실제로 추적한 측정값이 아니라 창작 그래픽입니다.
${GROUNDING_RULE}
직접 선택한 관심사를 바탕으로 오늘 해볼 작은 행동을 권합니다. 오락용 창작임을 분명히 하며 선명도 strength는 그래픽용 75로 고정합니다. 손 모양 기준은 그림의 원소 모티프 이름에만 사용합니다.
손 모양 기준: ${PALM_SHAPES.map((s) => `${s}=${PALM_SHAPE_HINTS[s]}`).join(' / ')}`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ photo, hand }) {
    const handLine =
      hand === 'left' ? '왼손 사진으로 구성한 창작 지도' : '오른손 사진으로 구성한 창작 지도';
    const prompt = `AI 손금 체험 결과를 만들어 주세요. 첨부한 사진이 방문객이 방금 찍은 손바닥 사진입니다.
방문객이 고른 손: ${handLine}`;
    const raw = await generateJson({ name: 'palm_reading', system: SYSTEM, prompt, schema, images: [photo], maxTokens: 2000 });
    if ((raw as { observed?: unknown } | null)?.observed === false) return { observed: false };
    return result.parse(raw);
  },
});
