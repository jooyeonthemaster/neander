import { z } from 'zod';
import { generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { GROUNDING_RULE } from '@/data/demo-ai/photo-reading';
import {
  CELEB_FACE_SHAPES,
  CELEB_FACE_SHAPE_IDS,
  CELEB_FEATURES,
  CELEB_FEATURE_IDS,
  CELEB_FIELDS,
  CELEB_VIBES,
  CELEB_VIBE_IDS,
} from '@/data/demo-ai/celeb';

// 기존 API 이름은 유지하되 결과는 실존 인물 대신 창작 캐스팅 무드로 구성한다.

const input = z.object({
  photo: captureImage,
  field: z.enum(CELEB_FIELDS.map((f) => f.id) as [string, ...string[]]),
});

const score = z.number().int().min(70).max(98);

const result = z.object({
  observed: z.literal(true),
  name: z.string().min(2).max(24),
  desc: z.string().min(10).max(220),
  faceShape: z.enum(CELEB_FACE_SHAPE_IDS),
  feature: z.enum(CELEB_FEATURE_IDS),
  vibe: z.enum(CELEB_VIBE_IDS),
  scores: z.object({ face: score, feature: score, vibe: score }),
  traits: z.array(z.string().min(1).max(20)).min(3).max(5),
  celebs: z
    .array(z.object({ name: z.string().min(1).max(20), similarity: z.number().int().min(60).max(95), point: z.string().min(4).max(80) }))
    .min(3)
    .max(3),
});

const scoreSchema = { type: 'integer', description: '70~98 사이 정수' };

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['observed', 'name', 'desc', 'faceShape', 'feature', 'vibe', 'scores', 'traits', 'celebs'],
  properties: {
    observed: { type: 'boolean', description: '사진에 사람 얼굴이 또렷하게 보이면 true' },
    name: { type: 'string', description: '창작 캐스팅 무드 이름, 한글 6~14자 (예: "청량한 무대 주인공", "필름 속 배우 무드"). 실존 인물 이름 금지' },
    desc: { type: 'string', description: '사진에서 보이는 매력을 칭찬하는 설명 2문장, 140자 이내' },
    faceShape: { type: 'string', enum: [...CELEB_FACE_SHAPE_IDS], description: `사진 속 얼굴형 (${CELEB_FACE_SHAPES.map((f) => `${f.id}=${f.label}`).join(', ')})` },
    feature: { type: 'string', enum: [...CELEB_FEATURE_IDS], description: `가장 돋보이는 이목구비 (${CELEB_FEATURES.map((f) => `${f.id}=${f.label}`).join(', ')})` },
    vibe: { type: 'string', enum: [...CELEB_VIBE_IDS], description: `첫인상 분위기 (${CELEB_VIBES.map((v) => `${v.id}=${v.label}`).join(', ')})` },
    scores: {
      type: 'object',
      additionalProperties: false,
      required: ['face', 'feature', 'vibe'],
      properties: { face: scoreSchema, feature: scoreSchema, vibe: scoreSchema },
      description: '창작 캐스팅 카드용 연출값. 실존 인물과의 일치도·닮을 확률이 아님',
    },
    traits: { type: 'array', items: { type: 'string' }, description: '헤어·의상·표정에서 참고한 스타일링 키워드 4개, 각 12자 이내' },
    celebs: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'similarity', 'point'],
        properties: {
          name: { type: 'string', description: '실존 인물이 아닌 창작 무드 이름 (예: 청량한 무대, 차분한 화보, 따뜻한 주인공)' },
          similarity: { type: 'integer', description: '카드용 허구의 무드 연출 지수 60~95, 첫 번째가 가장 높게. 닮을 확률 아님' },
          point: { type: 'string', description: '참고할 헤어·의상·표정 연출을 제안하는 한 문장, 50자 이내. 실제 사람과의 닮음 비교 금지' },
        },
      },
      description: '실존 인물이 아닌 창작 캐스팅 무드 3가지',
    },
  },
};

const SYSTEM = `당신은 이벤트 부스용 AI 체험 서비스 '네안데르'의 '셀럽 무드 캐스팅' 스타일리스트입니다.
사진의 헤어·옷차림·표정·조명처럼 보이는 스타일 요소와 방문객이 직접 고른 분위기를 바탕으로 허구의 캐스팅 무드 3가지를 제안합니다.
실존 인물 이름, 연예인 닮은꼴, 신원 추정, 얼굴 인식·비교는 하지 않습니다. 무드명은 '청량한 무대', '따뜻한 주인공'처럼 창작합니다.
${GROUNDING_RULE}
수치는 캐스팅 카드의 허구 연출값임을 설명합니다. 외모 등급이나 실제 인물과 닮을 확률로 표현하지 않습니다.
외모 비하·단정적 표현·의학적 언급은 하지 않습니다. 한국어로, 따뜻하고 재치 있게 씁니다. 반드시 지정된 JSON 스키마로만 답합니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ photo, field }) {
    const f = CELEB_FIELDS.find((o) => o.id === field)!;
    const prompt = `실존 인물 대신 창작 셀럽 무드 캐스팅 카드를 만들어 주세요. 첨부 사진의 스타일 요소를 참고하세요.
연출할 분야: ${f.label}${field === 'all' ? '' : ` (${f.desc} 분위기)`}`;
    const raw = await generateJson({ name: 'celeb_lookalike', system: SYSTEM, prompt, schema, images: [photo] });
    if ((raw as { observed?: unknown } | null)?.observed === false) return { observed: false };
    const parsed = result.parse(raw);
    return { ...parsed, celebs: [...parsed.celebs].sort((a, b) => b.similarity - a.similarity) };
  },
});
