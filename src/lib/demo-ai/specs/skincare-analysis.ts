import { z } from 'zod';
import { BASE_SYSTEM, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { GROUNDING_RULE } from '@/data/demo-ai/photo-reading';
import {
  SKIN_CONCERN_IDS,
  SKIN_CONCERNS,
  SKIN_ROUTINE_IDS,
  SKIN_ROUTINES,
  SKIN_SCORE_KEYS,
  SKIN_TYPE_IDS,
  SKIN_TYPE_LABELS,
} from '@/data/demo-ai/skincare';

// Self-reported comfort drives routine suggestions. Legacy score fields are inert compatibility values.

const input = z.object({
  photo: captureImage,
  concern: z.enum(SKIN_CONCERN_IDS),
  routine: z.enum(SKIN_ROUTINE_IDS),
});

const line = (max: number) => z.string().min(1).max(max);
const score = z.literal(50);

const result = z.object({
  observed: z.literal(true),
  type: z.enum(SKIN_TYPE_IDS),
  desc: line(200),
  scores: z.object({ pore: score, moisture: score, wrinkle: score, tone: score, elasticity: score }),
  morning: z.array(line(30)).min(3).max(5),
  night: z.array(line(30)).min(2).max(4),
  picks: z.array(line(14)).min(3).max(3),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['observed', 'type', 'desc', 'scores', 'morning', 'night', 'picks'],
  properties: {
    observed: { type: 'boolean', description: '사진에 사람 얼굴 피부가 보이면 true, 아니면 false' },
    type: { type: 'string', enum: [...SKIN_TYPE_IDS], description: `자기보고 관리 방향 (사진으로 판정하지 않음): ${SKIN_TYPE_IDS.map((id) => `${id}=${SKIN_TYPE_LABELS[id]}`).join(', ')}` },
    desc: { type: 'string', description: '방문객이 직접 보고한 느낌과 관리 습관에 근거한 일반 관리 제안 2문장. 사진으로 장벽·수분·질환을 추정하지 않음.' },
    scores: {
      type: 'object',
      additionalProperties: false,
      required: [...SKIN_SCORE_KEYS],
      properties: Object.fromEntries(
        SKIN_SCORE_KEYS.map((k) => [k, { type: 'integer', enum: [50], description: '기존 응답 형식 호환용 고정값 50. 측정·평가 의미 없으며 사용자 화면에 표시하지 않음.' }])
      ),
    },
    morning: { type: 'array', items: { type: 'string' }, description: '기본 아침 루틴: 순한 세안·보습·광범위 SPF 30 이상 자외선 차단. 3~4단계, 브랜드명 금지.' },
    night: { type: 'array', items: { type: 'string' }, description: '저녁 루틴 2~3단계, 각 15자 이내 (브랜드명 금지)' },
    picks: { type: 'array', items: { type: 'string' }, description: '제품 선택 기준 정확히 3개 (예: 무향, 크림 제형, 논코메도제닉)' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 뷰티 매장의 일상 관리 상담 AI입니다. 방문객이 직접 보고한 피부 느낌·자극 경험·관리 시간과 습관으로 기본 루틴을 추천합니다. 사진은 얼굴이 보이는지 확인하는 참고 자료일 뿐 피부 타입의 근거가 아닙니다.
${GROUNDING_RULE}
화장품·생활 습관 관점의 조언만 합니다. 여드름·아토피·주사·기미 같은 질환명이나 진단·치료·시술·약 이야기는 하지 않습니다.
사진에서 수분량·탄력·주름 깊이·피부 장벽·모공 수를 측정하거나 추정하지 않습니다. 동연령 비교와 나이 추정도 하지 않습니다.
scores는 기존 응답 형식 호환용으로 모든 필드에 50을 넣고 해설에 언급하지 않습니다. 자기보고 정보가 부족하면 기본 관리 방향을 제안하며 확정적인 피부 타입이라고 말하지 않습니다.
자극을 경험한 방문객에게는 무향의 순한 세안·보습·자외선 차단으로 단순화하고, 각질 제거 산이나 레티놀 같은 활성 성분을 새로 권하지 않습니다. 기본 루틴에 새 제품을 추가할 때에는 작은 부위에서 먼저 사용해 보도록 안내합니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ photo, concern, routine }) {
    const concernMeta = SKIN_CONCERNS.find((c) => c.id === concern)!;
    const routineMeta = SKIN_ROUTINES.find((r) => r.id === routine)!;
    const prompt = `일상 스킨케어 상담용 루틴 카드를 만들어 주세요. 첨부 사진은 참고 사진입니다.
방문객 답변: 가장 신경 쓰이는 고민=${concernMeta.label}(${concernMeta.desc}), 현재 스킨케어=${routineMeta.label}(${routineMeta.desc})
루틴은 직접 답한 피부 느낌과 자극 경험을 우선하고, 관리 시간과 현재 습관에 맞춰 무리 없게 정리해 주세요. scores는 전부 고정값 50이며 의미를 부여하지 마세요.`;
    const raw = await generateJson({ name: 'skin_analysis', system: SYSTEM, prompt, schema, images: [photo], maxTokens: 1500 });
    if ((raw as { observed?: unknown } | null)?.observed === false) return { observed: false };
    return result.parse(raw);
  },
});
