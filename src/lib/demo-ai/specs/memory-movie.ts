import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec, freeText } from '../types';
import {
  MOVIE_KEY_MAX,
  MOVIE_KEY_MIN,
  MOVIE_MAX_PHOTOS,
  MOVIE_MIN_PHOTOS,
  MOVIE_MOODS,
  MOVIE_MOTIONS,
  type AiMemoryMovie,
} from '@/data/demo-ai/memory-movie';

// AI 추억 무비 메이커 — 방문객 사진을 보고 제목·장면별 자막·상영 순서·카메라 무빙·BGM 템포를 연출한다.
// 영상·음악은 브라우저가 기존 프리셋(켄 번즈 + WebAudio)으로 재생하고, AI는 '연출'만 맡는다.

const input = z.object({
  /** 브라우저에서 384×512 JPEG로 줄여 보낸다 */
  photos: z.array(captureImage.max(400_000)).min(MOVIE_MIN_PHOTOS).max(MOVIE_MAX_PHOTOS),
  mood: z.enum(MOVIE_MOODS.map((m) => m.id) as [string, ...string[]]),
  title: freeText(20),
  message: freeText(36),
});

const result = z.object({
  title: z.string().trim().min(1).max(24),
  logline: z.string().trim().min(1).max(80),
  photos: z
    .array(
      z.object({
        note: z.string().trim().min(1).max(40),
        caption: z.string().trim().min(1).max(40),
        motion: z.enum(MOVIE_MOTIONS),
      })
    )
    .min(1),
  order: z.array(z.number().int()),
  closing: z.string().trim().min(1).max(50),
  music: z.object({
    track: z.string().trim().min(1).max(30),
    bpm: z.number(),
    key: z.number(),
  }),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'logline', 'photos', 'order', 'closing', 'music'],
  properties: {
    title: { type: 'string', description: '무비 제목, 한글 4~12자. 사진 속 장면·분위기에서 떠올린 이름' },
    logline: { type: 'string', description: '이 무비를 소개하는 한 문장, 50자 이내' },
    photos: {
      type: 'array',
      description: '받은 사진마다 하나씩, 받은 순서 그대로 (사진 수와 길이가 같아야 함)',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['note', 'caption', 'motion'],
        properties: {
          note: { type: 'string', description: '사진에 실제로 보이는 것을 짧게 (예: "창가 테이블의 머그잔"), 20자 이내. 보이지 않는 것을 지어내지 않는다' },
          caption: { type: 'string', description: '이 장면에 띄울 감성 자막, 한 줄 22자 이내. 사진 속 구체적인 요소를 하나 담는다' },
          motion: {
            type: 'string',
            enum: [...MOVIE_MOTIONS],
            description: '카메라 무빙: zoom-in=천천히 다가가는 줌인, zoom-out=넓게 물러나며 보여 주는 줌아웃, push-in=주인공에게 깊게 파고드는 줌인, drift=가볍게 흐르듯 이동',
          },
        },
      },
    },
    order: {
      type: 'array',
      items: { type: 'integer' },
      description: '상영 순서 — 사진 번호(0부터)를 이야기 흐름이 자연스럽게 한 번씩만 나열',
    },
    closing: { type: 'string', description: '엔딩 크레딧에 띄울 한 문장, 30자 이내' },
    music: {
      type: 'object',
      additionalProperties: false,
      required: ['track', 'bpm', 'key'],
      properties: {
        track: { type: 'string', description: 'BGM 곡 제목, 영어 2~4단어' },
        bpm: { type: 'integer', description: '방문객이 선택한 무드의 BPM 그대로, 변경하지 않음' },
        key: { type: 'integer', description: `조옮김 반음 수, ${MOVIE_KEY_MIN}~${MOVIE_KEY_MAX} (0=원래 키, +는 밝게, -는 차분하게)` },
      },
    },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 추억 무비의 AI 편집 감독입니다. 방문객이 올린 사진을 한 장씩 보고, 실제로 보이는 장면에 맞는 자막과 연출을 정합니다.
사진 속 사람의 외모·나이·관계를 단정하지 말고, 장소·사물·빛·표정·행동처럼 보이는 것에서 이야기를 만듭니다.
자막은 짧은 한 줄의 감성 문장이며, 이모지와 따옴표를 쓰지 않습니다.`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v)));

/** 모델이 순열을 틀리게 줘도 모든 사진이 한 번씩 나오게 고친다 */
function fixOrder(order: number[], n: number): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const i of [...order, ...Array.from({ length: n }, (_, k) => k)]) {
    if (i < 0 || i >= n || seen.has(i)) continue;
    seen.add(i);
    out.push(i);
  }
  return out;
}

export default defineSpec({
  input,
  bucket: 'text',
  async run({ photos, mood, title, message }): Promise<AiMemoryMovie> {
    const m = MOVIE_MOODS.find((x) => x.id === mood)!;
    const prompt = `추억 무비 메이커 체험 결과를 만들어 주세요.
사진 ${photos.length}장을 받은 순서대로 보냈습니다 (사진 번호 0~${photos.length - 1}).
방문객이 고른 무드: ${m.label} (BGM ${m.genre}, ${m.bpm} BPM 고정 — 선택 화면과 동일하게 유지)
${title ? `방문객이 정한 제목: "${title}" — title은 이 제목을 그대로 쓰세요.` : '제목은 비워 두었으니 사진을 보고 지어 주세요.'}
${message ? `방문객이 쓴 마지막 장면 자막: "${message}" — 이 문장으로 끝나는 흐름이 되도록 순서와 자막을 정하세요.` : ''}
photos 배열은 반드시 ${photos.length}개여야 합니다.
${themeLine()}`;
    const raw = result.parse(
      await generateJson({ name: 'memory_movie', system: SYSTEM, prompt, schema, images: photos, maxTokens: 2500 })
    );
    if (raw.photos.length < photos.length) throw new Error('missing photo captions');
    return {
      title: title || raw.title,
      logline: raw.logline,
      photos: raw.photos.slice(0, photos.length),
      order: fixOrder(raw.order, photos.length),
      closing: raw.closing,
      music: { track: raw.music.track, bpm: m.bpm, key: clamp(raw.music.key, MOVIE_KEY_MIN, MOVIE_KEY_MAX) },
    };
  },
});
