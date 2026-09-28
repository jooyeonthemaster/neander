import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { BOOTH_IDENTITY_RULES, GRADUATION_GOWN_IDS, GRADUATION_PLACE_IDS } from '@/data/demo-ai/photo-booth';

// AI 졸업 포토부스 — 학위복·학사모를 입힌 캠퍼스 졸업 사진 + 축하 한마디. (이미지 1장 약 95원 + 글 약 4원)

type GownId = (typeof GRADUATION_GOWN_IDS)[number];
type PlaceId = (typeof GRADUATION_PLACE_IDS)[number];

const GOWN_PROMPT: Record<GownId, { en: string; ko: string }> = {
  black: { en: 'a classic black graduation gown with a gold-trimmed hood, and a black square mortarboard cap with a gold tassel', ko: '클래식 블랙 학위복, 골드 술' },
  navy: { en: 'a royal navy-blue graduation gown with a light-blue-trimmed hood, and a navy square mortarboard cap with a silver tassel', ko: '로열 네이비 학위복, 실버 술' },
  burgundy: { en: 'a burgundy graduation gown with a champagne-gold-trimmed hood, and a burgundy square mortarboard cap with a champagne-gold tassel', ko: '버건디 학위복, 샴페인 골드 술' },
  green: { en: 'a forest-green graduation gown with a mint-trimmed hood, and a forest-green square mortarboard cap with a white tassel', ko: '포레스트 그린 학위복, 화이트 술' },
};

const PLACE_PROMPT: Record<PlaceId, { en: string; ko: string }> = {
  gate: { en: 'in front of a university main gate on a bright spring day, with cherry blossoms and green lawns', ko: '봄꽃 핀 캠퍼스 정문' },
  library: { en: 'inside a classic old university library reading room with tall wooden bookshelves and warm lamp light', ko: '고풍스러운 도서관 열람실' },
  hall: { en: 'in a university graduation ceremony hall with stage lights and blurred rows of seats (no readable text on banners)', ko: '현수막과 무대 조명이 있는 졸업식장' },
};

const input = z.object({
  photo: captureImage,
  gown: z.enum(GRADUATION_GOWN_IDS),
  place: z.enum(GRADUATION_PLACE_IDS),
});

const textResult = z.object({ message: z.string().min(1).max(80) });

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['message'],
  properties: {
    message: { type: 'string', description: '졸업 축하 한마디, 한 문장 40자 안팎' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 졸업 포토부스의 축하 카드 작가입니다. 사진 속 분위기(표정·포즈·밝은 기운 등)를 살짝 반영한 축하 한마디를 씁니다.
외모·체형·나이·성별을 평가하거나 추측하지 않고, 이름을 지어내지 않습니다.`;

const output = z.object({ image: z.string().startsWith('data:image/'), message: z.string().optional() });

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, gown, place }) {
    const g = GOWN_PROMPT[gown];
    const p = PLACE_PROMPT[place];
    const prompt = `Turn this photo into a realistic graduation portrait photograph of the same person(s).
Outfit: ${g.en}, worn properly on the head, tassel hanging to one side.
Place: ${p.en}.
Style: bright, joyful, natural high-quality photo.
${BOOTH_IDENTITY_RULES}`;
    const [image, text] = await Promise.all([
      generateImage({ images: [photo], prompt, aspectRatio: '3:4' }),
      // 글은 덤 — 실패해도 사진은 보여준다
      generateJson({
        name: 'graduation_message',
        system: SYSTEM,
        prompt: `졸업 포토부스 결과 카드에 넣을 축하 한마디를 써 주세요. 학위복: ${g.ko}, 배경: ${p.ko}.`,
        schema,
        images: [photo],
        maxTokens: 300,
      })
        .then((v) => textResult.parse(v))
        .catch(() => null),
    ]);
    return output.parse({ image, ...(text ?? {}) });
  },
});
