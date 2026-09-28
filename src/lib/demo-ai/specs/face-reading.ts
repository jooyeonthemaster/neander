import { z } from 'zod';
import { BASE_SYSTEM, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { GROUNDING_RULE } from '@/data/demo-ai/photo-reading';
import {
  FACE_FEATURE_KEYS,
  FACE_FORTUNE_IDS,
  FACE_FORTUNE_LABELS,
  FACE_TYPE_HINTS,
  FACE_TYPE_IDS,
} from '@/data/demo-ai/face-reading';

// AI 관상 — 방문객 얼굴 사진을 보고 부위별 풀이·운세를 쓴다. 얼굴이 안 보이면 { observed: false }

const input = z.object({
  photo: captureImage,
  fortune: z.enum(FACE_FORTUNE_IDS),
});

const line = (max: number) => z.string().min(1).max(max);
const score = z.number().int().min(55).max(98);

const result = z.object({
  observed: z.literal(true),
  type: z.enum(FACE_TYPE_IDS),
  summary: line(200),
  keywords: z.array(line(10)).min(3).max(3),
  features: z.object(
    Object.fromEntries(FACE_FEATURE_KEYS.map((k) => [k, z.object({ head: line(24), text: line(140) })])) as Record<
      (typeof FACE_FEATURE_KEYS)[number],
      z.ZodObject<{ head: z.ZodString; text: z.ZodString }>
    >
  ),
  scores: z.object(Object.fromEntries(FACE_FORTUNE_IDS.map((id) => [id, score])) as Record<(typeof FACE_FORTUNE_IDS)[number], typeof score>),
  balance: z.number().int().min(70).max(98),
  harmony: z.number().int().min(3).max(5),
  focusText: line(220),
  lucky: z.object({ color: line(12), number: z.number().int().min(1).max(9), item: line(16) }),
  motto: line(30),
});

const FEATURE_LABELS = { forehead: '이마', eyes: '눈', nose: '코', lips: '입', chin: '턱' } as const;

const featureSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['head', 'text'],
  properties: {
    head: { type: 'string', description: '사진에서 보이는 모양을 담은 짧은 제목 (예: "부드럽게 휘는 눈매"), 14자 이내' },
    text: { type: 'string', description: '초상에서 보이는 형태를 예술적 비유로 표현하는 1~2문장. 형태로 성격·능력·건강·재물을 추론하지 않음' },
  },
};

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['observed', 'type', 'summary', 'keywords', 'features', 'scores', 'balance', 'harmony', 'focusText', 'lucky', 'motto'],
  properties: {
    observed: { type: 'boolean', description: '사진에 사람 얼굴이 정면 가까이 또렷하게 보이면 true, 아니면 false' },
    type: { type: 'string', enum: [...FACE_TYPE_IDS], description: '선택한 이야기 분위기에 어울리는 창작 캐릭터 모티프' },
    summary: { type: 'string', description: '오락용 창작 이야기임을 밝히는 소개 2문장. 외모가 성격이나 미래를 나타낸다고 말하지 않음' },
    keywords: { type: 'array', items: { type: 'string' }, description: '직접 고른 주제의 창작 캐릭터 키워드 3개, 성격 판정이 아님' },
    features: {
      type: 'object',
      additionalProperties: false,
      required: [...FACE_FEATURE_KEYS],
      properties: Object.fromEntries(
        FACE_FEATURE_KEYS.map((k) => [k, { ...featureSchema, description: `${FEATURE_LABELS[k]} 풀이` }])
      ),
    },
    scores: {
      type: 'object',
      additionalProperties: false,
      required: [...FACE_FORTUNE_IDS],
      properties: Object.fromEntries(
        FACE_FORTUNE_IDS.map((id) => [id, { type: 'integer', description: `${FACE_FORTUNE_LABELS[id]} 호환용 비표시 값 75로 고정. 예측 점수가 아님` }])
      ),
    },
    balance: { type: 'integer', description: '호환용 비표시 값 80으로 고정. 얼굴 균형을 측정하지 않음' },
    harmony: { type: 'integer', description: '호환용 비표시 값 3으로 고정. 조화를 평가하지 않음' },
    focusText: { type: 'string', description: '방문객이 직접 고른 관심 주제에 관한 창작 이야기와 작은 실천 팁. 얼굴 부위를 성격이나 미래의 근거로 사용하지 않음' },
    lucky: {
      type: 'object',
      additionalProperties: false,
      required: ['color', 'number', 'item'],
      properties: {
        color: { type: 'string', description: '행운의 색 (한글 색 이름, 6자 이내)' },
        number: { type: 'integer', description: '행운의 숫자 1~9' },
        item: { type: 'string', description: '관심운에 어울리는 행운 아이템, 10자 이내' },
      },
    },
    motto: { type: 'string', description: '이 사람에게 건네는 관상 한마디, 16자 이내' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 전통적 상징을 차용하는 초상 이야기 작가입니다. 사진은 대상 확인과 시각적 묘사에만 사용합니다. 얼굴로 성격·지능·능력·도덕성·건강·재물·관계·운명을 추론하지 않습니다. 모티프와 서사는 사용자가 선택한 주제에서 가져오고 오락용 창작임을 분명히 합니다.
${GROUNDING_RULE}
모든 부위는 장점 중심으로 풀이하고, 외모 평가(잘생김·못생김·나이 들어 보임·살 등)나 단점 지적은 절대 하지 않습니다.
관상 유형 후보: ${FACE_TYPE_IDS.map((id) => `${id}=${FACE_TYPE_HINTS[id]}`).join(' / ')}`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ photo, fortune }) {
    const prompt = `AI 관상 체험 결과를 만들어 주세요. 첨부한 사진이 방문객이 방금 찍은 얼굴 사진입니다.
방문객이 가장 궁금해한 운: ${FACE_FORTUNE_LABELS[fortune]} (focusText는 선택한 주제로 가벼운 응원과 실천 팁을 작성하세요. scores는 전부 75이며 예측하지 않습니다.)
부위별 제목(head)은 사진에서 실제로 보이는 모양을 반영해 주세요 (예: 안경 너머의 또렷한 눈, 활짝 웃는 입꼬리).`;
    const raw = await generateJson({ name: 'face_reading', system: SYSTEM, prompt, schema, images: [photo], maxTokens: 2500 });
    if ((raw as { observed?: unknown } | null)?.observed === false) return { observed: false };
    return result.parse(raw);
  },
});
