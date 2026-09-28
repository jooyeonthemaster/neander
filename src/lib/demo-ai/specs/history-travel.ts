import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { BOOTH_IDENTITY_RULES, HISTORY_ERA_IDS } from '@/data/demo-ai/photo-booth';

// AI 역사 여행 — 방문객을 고른 시대·인물의 모습으로 바꾼 사진 + 사진 속 인물의 짧은 가상 이야기.
// (이미지 1장 약 95원 + 글 약 2원)

type EraId = (typeof HISTORY_ERA_IDS)[number];

interface RolePrompt {
  ko: string;
  en: string;
}

const ERA_PROMPT: Record<EraId, { ko: string; scene: string; style: string; roles: [RolePrompt, RolePrompt] }> = {
  samguk: {
    ko: '삼국시대 신라, 서라벌 남산 수련터',
    scene: 'an outdoor training ground on Namsan mountain near Seorabeol, the Silla capital, with pine trees and misty hills',
    style: 'a realistic historical drama still with warm, slightly faded sepia film tones',
    roles: [
      { ko: '화랑', en: 'a Silla hwarang youth: a crimson silk robe with gold trim tied with a belt, over trousers, and a jo-ugwan cap decorated with two upright bird feathers' },
      { ko: '신라 귀족', en: 'a Silla aristocrat: a deep blue silk robe with gold trim, and an ornate Silla gold crown-style headdress with gold dangles' },
    ],
  },
  goryeo: {
    ko: '고려, 개경 귀족의 사랑채',
    scene: 'the elegant wooden reception hall of an aristocrat\'s house in Gaegyeong, with celadon vases and folding screens',
    style: 'a realistic photograph with muted celadon-green and ivory tones, soft film grain',
    roles: [
      { ko: '고려 관리', en: 'a Goryeo court official: a purple round-collared official robe and a black bokdu hat with stiff side wings' },
      { ko: '귀족 부인', en: 'a Goryeo noblewoman: a flowing white ramie robe with celadon-green trim and a sheer black mongsu veil draped over the head (face visible)' },
    ],
  },
  joseon: {
    ko: '조선, 한옥 서재 앞마당',
    scene: 'the front yard of a hanok study with a paper-screened wooden door and a pine tree',
    style: 'a traditional Joseon portrait painting in ink and soft color on aged hanji paper, delicate brush lines, while keeping the face faithfully recognizable',
    roles: [
      { ko: '선비', en: 'a Joseon scholar: a pale sky-blue dopo robe with a black collar and a black horsehair gat hat' },
      { ko: '규수', en: 'a Joseon young lady: an ivory jeogori with a purple collar and a red goreum ribbon, a full skirt, and a jokduri coronet' },
    ],
  },
  modern: {
    ko: '1920~30년대 경성 사진관',
    scene: 'a 1920s–30s Gyeongseong (Seoul) photo studio with a painted backdrop, a potted plant and a wooden chair',
    style: 'an antique black-and-white photograph with sepia toning, film grain and soft vignetting',
    roles: [
      { ko: '모던보이', en: 'a 1920s "modern boy": a dark three-piece suit with a burgundy bow tie, a white shirt, and a fedora hat' },
      { ko: '모던걸', en: 'a 1920s "modern girl": a navy knee-length dress with a white collar, a pearl necklace, and a bell-shaped cloche hat' },
    ],
  },
};

const input = z.object({
  photo: captureImage,
  era: z.enum(HISTORY_ERA_IDS),
  role: z.union([z.literal(0), z.literal(1)]),
});

const textResult = z.object({ story: z.string().min(1).max(200) });

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['story'],
  properties: {
    story: { type: 'string', description: '사진 속 인물의 하루를 그린 가상 이야기 2문장, 90자 안팎' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 역사 체험관의 이야기 작가입니다. 방문객이 고른 시대·인물이 되어 보낸 하루를 2인칭("당신은 …")으로 짧게 씁니다.
시대 고증에 맞는 일상(장소·옷·물건)만 쓰고, 실존 인물·정확하지 않은 연도·사건은 지어내지 않습니다.`;

const output = z.object({ image: z.string().startsWith('data:image/'), story: z.string().optional() });

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, era, role }) {
    const e = ERA_PROMPT[era];
    const r = e.roles[role];
    const prompt = `Transform this photo into a historical portrait of the same person(s), time-traveled to Korean history.
Outfit: dress them as ${r.en}. Historically plausible fabrics and details.
Place: ${e.scene}.
Style: ${e.style}.
${BOOTH_IDENTITY_RULES}`;
    const [image, text] = await Promise.all([
      generateImage({ images: [photo], prompt, aspectRatio: '3:4' }),
      generateJson({
        name: 'history_story',
        system: SYSTEM,
        prompt: `시대와 장소: ${e.ko}. 방문객이 된 인물: ${r.ko}. 이 인물로 보낸 하루를 짧게 써 주세요.`,
        schema,
        maxTokens: 400,
      })
        .then((v) => textResult.parse(v))
        .catch(() => null),
    ]);
    return output.parse({ image, ...(text ?? {}) });
  },
});
