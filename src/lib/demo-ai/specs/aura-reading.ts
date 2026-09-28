import { z } from 'zod';
import { BASE_SYSTEM, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { GROUNDING_RULE } from '@/data/demo-ai/photo-reading';
import { AURA_HINTS, AURA_IDS, AURA_MOOD_IDS, AURA_MOODS, AURA_PROFILE_LABELS } from '@/data/demo-ai/aura';

// AI 오라 리딩 — 표정·분위기 사진 + 오늘 기분으로 오라 색(7색 중)과 풀이를 고른다. 오라 그림은 브라우저 캔버스가 그린다.
// (이미지 생성으로 오라를 칠하는 방식은 1회 약 94원·10~20초라, 캔버스 연출 + AI 색·글 조합을 택했다)

const input = z.object({
  photo: captureImage,
  mood: z.enum(AURA_MOOD_IDS),
});

const line = (max: number) => z.string().min(1).max(max);

const result = z.object({
  observed: z.literal(true),
  main: z.enum(AURA_IDS),
  second: z.enum(AURA_IDS),
  nickname: line(16),
  desc: line(200),
  moodLine: line(120),
  keywords: z.array(line(8)).min(4).max(4),
  profile: z.array(z.number().int().min(35).max(98)).length(AURA_PROFILE_LABELS.length),
  intensity: z.number().int().min(60).max(99),
  charge: line(30),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['observed', 'main', 'second', 'nickname', 'desc', 'moodLine', 'keywords', 'profile', 'intensity', 'charge'],
  properties: {
    observed: { type: 'boolean', description: '사진에 사람 얼굴이 보이면 true, 아니면 false' },
    main: { type: 'string', enum: [...AURA_IDS], description: '메인 오라 색' },
    second: { type: 'string', enum: [...AURA_IDS], description: '가장자리에 번지는 보조 오라 색 (메인과 다른 색)' },
    nickname: { type: 'string', description: '메인 오라 별명, 10자 이내 (예: 햇살 같은 낙천가)' },
    desc: { type: 'string', description: '본인이 선택한 기분과 색을 담은 창작 초상화 설명 2문장. 사진에서 내적 감정·성격·건강·에너지장을 읽지 않음' },
    moodLine: { type: 'string', description: '오늘 기분이 보조 색으로 어떻게 번지는지 한 문장, 50자 안팎' },
    keywords: { type: 'array', items: { type: 'string' }, description: '오라 키워드 정확히 4개, 각 2~4자 (# 없이)' },
    profile: {
      type: 'array',
      items: { type: 'integer' },
      description: `화면에 표시하지 않는 호환용 값 60을 정확히 5개 반환. ${AURA_PROFILE_LABELS.join(', ')}를 측정하지 않음`,
    },
    intensity: { type: 'integer', description: '화면의 광채 효과를 위한 기본 값 80. 생체 측정이나 성격 수치가 아님' },
    charge: { type: 'string', description: '오늘의 오라 충전법 한 가지, 16자 이내' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 무드 초상화의 색채 디자이너입니다. 방문객이 직접 고른 기분과 색을 바탕으로 작품의 설명을 만듭니다. 사진은 얼굴 유무와 시각적 구도 참고에만 사용하며 성격·내적 감정·건강·생체 에너지장을 추론하거나 측정하지 않습니다.
${GROUNDING_RULE}
오락용 색채 창작임을 설명하고 오라의 실재나 진단 정확성을 주장하지 않습니다. 색의 의미는 예술적 연상으로만 다루며 profile은 모두 60, intensity는 80으로 반환합니다.
오라 7색: ${AURA_IDS.map((id) => `${id}=${AURA_HINTS[id]}`).join(' / ')}`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ photo, mood }) {
    const moodMeta = AURA_MOODS.find((m) => m.id === mood)!;
    const prompt = `AI 오라 리딩 체험 결과를 만들어 주세요. 첨부한 사진이 방문객이 방금 찍은 사진입니다.
방문객이 고른 오늘 기분: ${moodMeta.emoji} ${moodMeta.label} (${moodMeta.desc}) — 보조 색과 moodLine에 반영해 주세요.`;
    const raw = await generateJson({ name: 'aura', system: SYSTEM, prompt, schema, images: [photo], maxTokens: 1500 });
    if ((raw as { observed?: unknown } | null)?.observed === false) return { observed: false };
    const parsed = result.parse(raw);
    // 보조 색이 메인과 같으면 스펙트럼 이웃 색으로
    if (parsed.second === parsed.main) {
      const i = AURA_IDS.indexOf(parsed.main);
      parsed.second = AURA_IDS[i === AURA_IDS.length - 1 ? i - 1 : i + 1]!;
    }
    return parsed;
  },
});
