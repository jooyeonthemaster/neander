import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { CARICATURE_FRAME_IDS, CARICATURE_STYLE_IDS, type CaricatureFrameId, type CaricatureStyleId } from '@/data/demo-ai/caricature';

// AI 캐리커처 아티스트 — 방문객 사진을 고른 화풍의 캐리커처로 다시 그리고(이미지), 화가의 한마디를 쓴다(글).

const input = z.object({
  photo: captureImage,
  style: z.enum(CARICATURE_STYLE_IDS),
  frame: z.enum(CARICATURE_FRAME_IDS),
});

const STYLE_PROMPT: Record<CaricatureStyleId, { ko: string; en: string }> = {
  webtoon: {
    ko: '웹툰',
    en: 'Korean webtoon style digital illustration: clean confident line art, cel shading, bright saturated colors, glossy anime-style eyes kept true to the person',
  },
  popart: {
    ko: '팝아트',
    en: 'Andy Warhol / Roy Lichtenstein inspired pop art: bold black outlines, flat punchy colors (magenta, yellow, cyan), Ben-Day halftone dots, NO speech bubbles',
  },
  pixel: {
    ko: '픽셀아트',
    en: '16-bit retro video game pixel art character portrait: clearly visible chunky square pixels, limited vivid palette, crisp pixel edges, simple pixel background',
  },
  sketch: {
    ko: '연필 스케치',
    en: 'Montmartre street artist pencil caricature: graphite and charcoal on warm off-white sketch paper, confident contour lines, soft hatching, a few light colored-pencil accents',
  },
  watercolor: {
    ko: '수채화',
    en: 'loose watercolor caricature: soft bleeding washes and wet-on-wet blooms on textured cold-press paper, delicate ink outline, fresh airy colors',
  },
};

const FRAME_NOTE: Record<CaricatureFrameId, string> = {
  postcard: 'Composition: head and upper body, centered, with a simple light festive background.',
  poster: 'Composition: head and upper body in the upper two thirds; keep the bottom quarter uncluttered with no important details (a title will be overlaid there later) — just the torso against the same plain backdrop, no separate panel or bar.',
  sticker: 'Composition: head and upper body filling the frame, on a plain clean single-color background (it will be die-cut as a sticker).',
};

function imagePrompt(style: CaricatureStyleId, frame: CaricatureFrameId) {
  return `Redraw the person in this photo as a fun, flattering caricature for a festival caricature booth.
Style: ${STYLE_PROMPT[style].en}.
Caricature rules: big head on a small body, and gently exaggerate their most CHARMING features only (e.g. a bright smile, sparkling eyes, a signature hairstyle). It must be friendly, cute and flattering, like a gift the person would love — never mocking, never grotesque. Do not exaggerate nose size, weight, wrinkles, skin blemishes or any feature people are commonly self-conscious about.
Keep the person clearly recognizable: same face shape, eye shape, hairstyle and hair color, skin tone, glasses or accessories if any, clothing colors, and the same expression.
${FRAME_NOTE[frame]}
Portrait orientation 3:4. Absolutely no text, letters, numbers, signature, watermark, logo or speech bubble anywhere in the image.`;
}

const text = z.object({
  comment: z.string().min(1).max(90),
  points: z.array(z.string().min(1).max(16)).length(3),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['comment', 'points'],
  properties: {
    comment: { type: 'string', description: '캐리커처를 그린 화가의 한마디. 사진에서 실제로 보이는 매력 포인트를 짚어 1~2문장, 70자 이내, 해요체' },
    points: {
      type: 'array',
      items: { type: 'string' },
      description: '캐리커처에서 살짝 과장해 살린 매력 포인트 정확히 3개. 각 12자 이내 명사구 (예: "반달 눈웃음", "풍성한 앞머리")',
    },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 축제 현장의 캐리커처 화가입니다. 사진 속 방문객의 표정·헤어스타일·안경·옷 색처럼 눈에 보이는 매력만 칭찬합니다.
코·체형·피부·나이 등 외모를 평가하거나 놀리는 말은 절대 쓰지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, style, frame }) {
    const prompt = `캐리커처 아티스트 체험 결과를 만들어 주세요. 방문객이 고른 화풍은 ${STYLE_PROMPT[style].ko}입니다.
사진을 보고 화가의 한마디와 과장한 매력 포인트 3개를 써 주세요.
${themeLine()}`;
    const [image, words] = await Promise.all([
      generateImage({ prompt: imagePrompt(style, frame), images: [photo], aspectRatio: '3:4' }),
      // 글은 덤 — 실패해도 그림은 살린다 (화면은 고정 문구로 채운다)
      generateJson({ name: 'caricature', system: SYSTEM, prompt, schema, images: [photo] })
        .then((raw) => text.parse(raw))
        .catch(() => null),
    ]);
    return { image, ...(words ?? {}) };
  },
});
