import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { FASHION_ERA_IDS, FASHION_ERA_PROMPTS, type FashionEraId } from '@/data/demo-ai/fashion-era';
import { KEEP_IDENTITY } from '@/data/demo-ai/photo-edit';

// AI 패션 타임머신 — 사진의 스타일 요소로 시대별 포스터 아이디어 순서·이유를 정한 뒤,
// 1위 시대의 의상·헤어·메이크업을 입힌 사진 한 장을 만든다. (이미지는 1장만 — 비용)
// 시대가 여러 개면 순위가 정해져야 그릴 시대를 알 수 있어 분석 → 이미지 순서로 돈다 (약 20초).

const input = z.object({
  photo: captureImage,
  eras: z
    .array(z.enum(FASHION_ERA_IDS))
    .min(1)
    .max(3)
    .refine((list) => new Set(list).size === list.length, 'duplicate eras'),
});

const rankingItem = z.object({
  id: z.enum(FASHION_ERA_IDS),
  score: z.number().int().min(71).max(98),
  reason: z.string().min(6).max(80),
});

function schemaFor(eras: FashionEraId[]) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['ranking'],
    properties: {
      ranking: {
        type: 'array',
        description: `방문객이 고른 시대 ${eras.length}개 전부를 스타일링 제안 순으로 (각 시대 한 번씩). 한 개일 때는 순위 비교를 하지 않는다.`,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'score', 'reason'],
          properties: {
            id: { type: 'string', enum: eras },
            score: { type: 'integer', description: '포스터 장식용 창작 연출값 71~98. 실제 외모 평가나 확률이 아님. 화면은 별도 창작 예시값을 표시한다.' },
            reason: { type: 'string', description: '이 시대의 스타일링 아이디어 한 문장, 50자 이내. 사진 속 헤어·표정·지금 옷 스타일만 참고. 점수나 순위 또는 다른 시대와의 비교를 언급하지 않는다.' },
          },
        },
      },
    },
  };
}

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 패션 박물관의 시대 스타일리스트입니다. 방문객 사진의 스타일 요소를 참고해 고른 시대의 포스터 연출 아이디어를 제안합니다.
외모를 평가하거나 단점을 말하지 않고, 헤어·표정·지금 입은 옷의 느낌처럼 사진에서 보이는 스타일 요소만 참고합니다. 시대를 하나만 골랐다면 1위 또는 비교 순위라고 부르지 마세요. 점수는 창작 장식값이며 실제 적합도나 확률로 설명하지 마세요.`;

async function rank(photo: string, eras: FashionEraId[]) {
  const list = eras.map((id) => `${id}=${FASHION_ERA_PROMPTS[id].label}`).join(', ');
  const raw = await generateJson({
    name: 'fashion_era_ranking',
    system: SYSTEM,
    prompt: `패션 타임머신 체험 결과를 만들어 주세요.\n방문객이 고른 시대: ${list}\n첨부한 사진은 방문객의 지금 모습입니다.`,
    schema: schemaFor(eras),
    images: [photo],
  });
  const ranking = z.object({ ranking: z.array(rankingItem) }).parse(raw).ranking;
  // 고른 시대가 정확히 한 번씩 들어 있어야 한다
  const ids = ranking.map((r) => r.id);
  if (ids.length !== eras.length || new Set(ids).size !== ids.length || !eras.every((id) => ids.includes(id))) {
    throw new Error('ranking does not match the chosen eras');
  }
  return ranking.sort((a, b) => b.score - a.score);
}

function drawEra(photo: string, id: FashionEraId) {
  const era = FASHION_ERA_PROMPTS[id];
  const prompt = `${KEEP_IDENTITY}
Restyle this person as if they time-travelled to ${era.style}.
Change the outfit, hairstyle and makeup to match that era (choose the menswear or womenswear version that matches how the person presents in the photo), and render it as ${era.photo}.
The outfit MUST visibly change: completely replace the clothes in the photo with the era's garments described above — keeping the original clothes is wrong.
Keep the same face, pose and framing (same crop — do not zoom out to show more of the body); only the styling, background and photo look change. Glasses may be swapped for era-appropriate frames.
Background: a simple era-appropriate setting with no other people, no posters or pictures of faces, and no readable text or signs.
Clothing must have no printed words, slogans or logos.`;
  return generateImage({ prompt, images: [photo], aspectRatio: '3:4' });
}

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, eras }) {
    if (eras.length === 1) {
      // 시대가 하나면 순위를 기다릴 필요가 없다 — 동시에
      const [ranking, image] = await Promise.all([rank(photo, eras), drawEra(photo, eras[0]!)]);
      return { image, ranking };
    }
    const ranking = await rank(photo, eras);
    const image = await drawEra(photo, ranking[0]!.id);
    return { image, ranking };
  },
});
