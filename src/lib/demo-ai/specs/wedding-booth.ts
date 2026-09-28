import { z } from 'zod';
import { generateImage } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { BOOTH_IDENTITY_RULES, WEDDING_THEME_IDS } from '@/data/demo-ai/photo-booth';

// AI 웨딩 포토부스 — 커플(또는 한 명) 사진을 고른 테마의 웨딩 화보로 바꾼다. (이미지 1장, 약 95원)

type ThemeId = (typeof WEDDING_THEME_IDS)[number];

const THEME_PROMPT: Record<ThemeId, string> = {
  fairytale:
    'a dreamy fairytale wedding: a blooming rose garden in front of a small white castle, soft pastel pink and gold light, a few floating petals and gentle sparkles',
  movie:
    'a cinematic romantic film still: a city street at dusk with warm bokeh lights, teal-and-orange color grading, dramatic soft key light',
  period:
    'a vintage 1920s wedding portrait taken in an old photo studio with a painted backdrop and a draped curtain, rendered as an antique sepia photograph with fine film grain',
  travel:
    'a sunny honeymoon snapshot at a seaside destination with turquoise sea, white-washed buildings and bright summer sunlight',
};

const input = z.object({
  photo: captureImage,
  theme: z.enum(WEDDING_THEME_IDS),
});

const output = z.object({ image: z.string().startsWith('data:image/') });

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, theme }) {
    const prompt = `Turn this photo into a romantic wedding photograph of the same people.
Attire: dress each person in elegant wedding attire that suits how they appear in the photo — a white wedding gown with a veil, or a classic tuxedo or suit with a boutonniere. Keep glasses and other personal features.
Scene: ${THEME_PROMPT[theme]}.
Style: realistic, high-quality photo. Keep the faces in the central band of the image (not at the very top or bottom edge), because the top and bottom may be covered by a frame.
${BOOTH_IDENTITY_RULES}`;
    const image = await generateImage({ images: [photo], prompt, aspectRatio: '3:4' });
    return output.parse({ image });
  },
});
