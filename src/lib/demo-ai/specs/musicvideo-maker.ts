import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import {
  MV_EFFECTS,
  MV_GENRES,
  MV_GROOVE_IDS,
  MV_KEY_MAX,
  MV_KEY_MIN,
  type AiMusicvideo,
  type MvEffectId,
} from '@/data/demo-ai/musicvideo';

// AI 뮤직비디오 메이커 — 방문객 대표 컷으로 ① 곡 제목·가사·컷 연출·비트를 정하고 ② 그 연출대로 MV 컷 2장을 생성한다.
// 영상 인코딩·음원 생성은 데모엔 너무 느리고 비싸서, 컷 재생과 비트는 브라우저(켄 번즈 + WebAudio 신스)가 맡는다.

const input = z.object({
  shot: captureImage,
  effect: z.enum(MV_EFFECTS.map((e) => e.id) as [string, ...string[]]),
  genre: z.enum(MV_GENRES.map((g) => g.id) as [string, ...string[]]),
});

const plan = z.object({
  title: z.string().trim().min(1).max(30),
  lyrics: z.array(z.string().trim().min(1).max(30)).min(4),
  scenes: z
    .array(z.object({ name: z.string().trim().min(1).max(14), prompt: z.string().trim().min(10).max(600) }))
    .min(2),
  beat: z.object({ bpm: z.number(), groove: z.enum(MV_GROOVE_IDS as [string, ...string[]]), key: z.number() }),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'lyrics', 'scenes', 'beat'],
  properties: {
    title: { type: 'string', description: '곡 제목, 영어 2~3단어 (예: "Neon Runaway")' },
    lyrics: {
      type: 'array',
      items: { type: 'string' },
      description: '가사 4줄 — 인트로·벌스·코러스(훅)·아웃트로 순서. 한국어, 각 16자 이내, 장르 분위기에 맞게. 3번째 줄이 가장 중독성 있는 훅',
    },
    scenes: {
      type: 'array',
      description: 'AI가 새로 만들 뮤직비디오 컷 2개 — 벌스, 코러스 순서',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'prompt'],
        properties: {
          name: { type: 'string', description: '스토리보드에 적을 컷 이름, 한국어 8자 이내 (예: "옥상 네온 댄스")' },
          prompt: {
            type: 'string',
            description:
              'Image-generation direction in English, 1-2 sentences: location, lighting, camera framing, pose/action and outfit for the same person. Match the visual concept and the song. No text, signs or lettering in the scene.',
          },
        },
      },
    },
    beat: {
      type: 'object',
      additionalProperties: false,
      required: ['bpm', 'groove', 'key'],
      properties: {
        bpm: { type: 'integer', description: '사용자가 선택한 장르의 BPM 그대로, 변경하지 않음' },
        groove: {
          type: 'string',
          enum: MV_GROOVE_IDS,
          description: '킥 패턴: four-on-floor=정박 댄스, rock=록 드라이브, half-time=느긋한 하프타임, syncopated=엇박 그루브',
        },
        key: { type: 'integer', description: `베이스 조옮김 반음 수, ${MV_KEY_MIN}~${MV_KEY_MAX}` },
      },
    },
  },
};

/** 이펙트별 컷 비주얼 콘셉트 (이미지 생성 프롬프트용) */
const LOOKS: Record<MvEffectId, string> = {
  cyber: 'cyberpunk music video: neon pink and cyan rim lighting, rainy night city, glowing reflections, high contrast, cinematic',
  vhs: '1990s music video shot on VHS tape: warm faded colors, soft blur, scan lines, light chromatic bleed, nostalgic film grain',
  fantasy: 'dreamy fantasy music video: soft pastel glow, floating light particles, ethereal haze, magical golden-hour light',
  noir: 'black-and-white film noir music video: hard dramatic light, deep shadows, venetian blind shadows, strong film grain, monochrome only',
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 뮤직비디오 감독 AI입니다. 방문객의 대표 컷(사진)과 고른 이펙트·장르로 4컷 숏폼 MV를 연출합니다. 재생 시간은 선택한 편집 리듬에 따라 화면에서 정합니다.
사진 속 인물의 옷차림·포즈·표정·배경처럼 보이는 요소를 연출에 녹이되, 외모를 평가하거나 신원을 추측하지 않습니다.
가사는 창작이며 실존 곡의 가사를 인용하지 않습니다. 선정적·폭력적 연출은 하지 않습니다.`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v)));

export default defineSpec({
  input,
  bucket: 'image',
  async run({ shot, effect, genre }): Promise<AiMusicvideo> {
    const fx = MV_EFFECTS.find((e) => e.id === effect)!;
    const g = MV_GENRES.find((x) => x.id === genre)!;
    const prompt = `AI 뮤직비디오 메이커 체험 결과를 연출해 주세요.
방문객 선택: 이펙트=${fx.label} (${fx.desc}), BGM 장르=${g.label} (${g.bpm} BPM 고정 — 선택 화면과 동일하게 유지)
첨부한 사진이 방문객의 대표 컷입니다. 이 사람이 주인공인 MV의 컷 2개를 새로 연출하세요.
${themeLine()}`;
    const p = plan.parse(await generateJson({ name: 'musicvideo', system: SYSTEM, prompt, schema, images: [shot] }));

    // 컷 이미지 2장은 동시에 — 한 장이 실패해도 나머지로 결과를 만든다
    const settled = await Promise.allSettled(
      p.scenes.slice(0, 2).map((scene) =>
        generateImage({
          images: [shot],
          aspectRatio: '3:4',
          prompt: `Create one still frame from a music video starring the person in the reference photo.
Keep the person's identity exactly: same face, facial features, skin tone, hairstyle and apparent age. Photorealistic, one person only.
Visual concept: ${LOOKS[effect as MvEffectId]}.
Scene: ${scene.prompt}
Use a new pose, camera angle and setting that fit the scene — do not just copy the reference photo's pose or background.
Vertical 3:4 cinematic frame, person clearly visible from chest up or waist up.
Absolutely no text, letters, numbers, captions, logos or watermarks anywhere in the image; any signs or screens in the background are blank or abstract light shapes.`,
        }).then((image) => ({ name: scene.name, image }))
      )
    );
    const scenes = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));

    return {
      title: p.title,
      lyrics: p.lyrics.slice(0, 4),
      scenes,
      beat: { bpm: g.bpm, groove: p.beat.groove as AiMusicvideo['beat']['groove'], key: clamp(p.beat.key, MV_KEY_MIN, MV_KEY_MAX) },
    };
  },
});
