import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { HO_HANJA, HO_KO, PAINTER_FORMAT_IDS, PAINTER_STYLE_IDS, type PainterStyleId } from '@/data/demo-ai/traditional-painter';

// AI 전통 화가 — 방문객 사진을 한국 전통 화풍의 초상화로 다시 그리고(이미지), 호(號)를 지어 준다(글).

const input = z.object({
  photo: captureImage,
  style: z.enum(PAINTER_STYLE_IDS),
  format: z.enum(PAINTER_FORMAT_IDS),
});

const STYLE_PROMPT: Record<PainterStyleId, { ko: string; en: string }> = {
  ink: {
    ko: '수묵화',
    en: `Korean ink-wash painting (sumukhwa) in the Joseon literati tradition, painted on warm cream hanji paper.
Only black ink in rich gradations from deep black to pale grey washes, expressive dry-brush outlines, soft ink bleeding, generous empty paper space around the figure. Monochrome, no other colors.`,
  },
  minhwa: {
    ko: '민화',
    en: `Joseon folk painting (minhwa) on aged yellowish mulberry paper.
Flat, bold obangsaek colors (cobalt blue, vermilion red, ochre yellow, white, black) with naive, charming, slightly stylized drawing and fine black outlines. Background decorated with folk motifs such as peonies, pine branches, a magpie or auspicious clouds, kept to the edges.`,
  },
  dancheong: {
    ko: '단청',
    en: `Korean dancheong palette: a portrait painted like the decorative painting on palace and temple eaves.
Deep malachite green (noerok) and cinnabar red (seokganju) dominate, with accents of ochre yellow, white and cobalt; flat mineral-pigment colors with crisp outlines. A band of traditional dancheong geometric lotus/cloud patterns frames the portrait along the edges.`,
  },
  bluewhite: {
    ko: '청화백자',
    en: `Joseon blue-and-white porcelain (cheonghwa baekja) painting: the portrait is painted in cobalt-blue underglaze brushwork on a smooth milky-white glazed porcelain surface with a soft glaze sheen.
Only cobalt blue tones on white, delicate brush lines like porcelain decoration, a few sparse plum/orchid or cloud motifs around the figure.`,
  },
};

function imagePrompt(style: PainterStyleId) {
  return `Paint a traditional Korean portrait (Joseon-era chosangwha composition) of the person in this photo.
Style: ${STYLE_PROMPT[style].en}
Subject: a dignified, gently flattering bust / half-length portrait, facing forward, dressed in elegant traditional Korean hanbok attire suited to the person. Keep the person clearly recognizable: same face shape, eye shape, eyebrows, hairstyle and hair color, glasses if they wear them, and their expression (a calm or soft smile).
Composition: the figure centered slightly left; keep the upper-right corner as plain empty paper (an inscription and seal will be added there later).
Portrait orientation 3:4. Absolutely no text, calligraphy, hanja characters, red seals/stamps, signature, watermark or frame border drawn in the image.`;
}

const text = z.object({
  hoKo: z.string().regex(HO_KO),
  hoHanja: z.string().regex(HO_HANJA),
  hoMeaning: z.string().min(4).max(40),
  comment: z.string().min(1).max(100),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['hoKo', 'hoHanja', 'hoMeaning', 'comment'],
  properties: {
    hoKo: { type: 'string', description: '방문객에게 지어 준 호(號)의 한글 표기, 정확히 한글 2글자 (예: 송암, 운재, 월헌)' },
    hoHanja: { type: 'string', description: 'hoKo의 한자 표기, 정확히 한자 2글자. 각 한자의 대표 음이 hoKo의 각 글자와 같아야 함 (예: 松巖)' },
    hoMeaning: { type: 'string', description: '호의 뜻풀이. "~한 ~의 주인" 형식, 25자 이내 (예: "사철 푸른 소나무처럼 곧은 바위의 주인")' },
    comment: { type: 'string', description: '초상화를 그린 도화서 화원의 한마디. 사진에서 보이는 인상(표정·눈빛·분위기)을 전신사조의 관점에서 짚어 1~2문장, 80자 이내, 해요체' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 조선 도화서의 화원(畫員)입니다. 방문객의 인상에 어울리는 호(號)를 짓고 초상화에 대한 짧은 평을 남깁니다.
호는 자연물·덕목을 뜻하는 앞 글자와 거처(巖·齋·堂·軒·亭·園·谷·溪·村 등)를 뜻하는 뒷 글자로 짓고, 실존 인물의 유명한 호(예: 율곡, 퇴계, 다산, 추사, 겸재, 단원, 혜원)는 피합니다.
외모를 평가하거나 놀리는 말은 쓰지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, style }) {
    const prompt = `AI 전통 화가 체험 결과를 만들어 주세요. 방문객이 고른 화풍은 ${STYLE_PROMPT[style].ko}입니다.
사진 속 인물의 인상에 어울리는 호를 짓고, 화원의 한마디를 써 주세요.
${themeLine()}`;
    const [image, words] = await Promise.all([
      generateImage({ prompt: imagePrompt(style), images: [photo], aspectRatio: '3:4' }),
      // 글은 덤 — 실패해도 그림은 살린다 (호는 사진 해시로 짓는 기존 방식으로 채운다)
      generateJson({ name: 'traditional_portrait', system: SYSTEM, prompt, schema, images: [photo] })
        .then((raw) => text.parse(raw))
        .catch(() => null),
    ]);
    return { image, ...(words ?? {}) };
  },
});
