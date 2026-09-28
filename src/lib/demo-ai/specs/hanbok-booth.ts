import { z } from 'zod';
import { generateImage } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { BOOTH_IDENTITY_RULES, HANBOK_BACKDROP_IDS, HANBOK_STYLE_IDS } from '@/data/demo-ai/photo-booth';

// AI 한복 포토부스 — 방문객 사진을 고른 한복·전통 배경의 인물 사진으로 바꾼다. (이미지 1장, 약 95원)

type StyleId = (typeof HANBOK_STYLE_IDS)[number];
type BackdropId = (typeof HANBOK_BACKDROP_IDS)[number];

const STYLE_PROMPT: Record<StyleId, string> = {
  king: 'a Joseon king\'s red silk gonryongpo robe (round collar) with round gold embroidered dragon badges on the chest and shoulders, a jade belt, and a black ikseongwan royal hat',
  queen: 'a Joseon queen\'s formal jeogui ceremonial robe in deep blue silk with gold pheasant patterns, red collar trim, and gold royal hair ornaments',
  scholar: 'a Joseon scholar\'s pale jade-colored dopo robe with a thin red cord belt and a black horsehair gat hat with a bead chin strap',
  modern: 'a modern daily hanbok: soft pastel pink jeogori with a teal collar and a purple goreum ribbon, with a dark navy skirt or trousers, and a small flower hair accessory',
};

const BACKDROP_PROMPT: Record<BackdropId, string> = {
  palace: 'in front of the main hall of Gyeongbokgung Palace in Seoul at golden sunset, with the curved tiled roof and colorful dancheong eaves visible',
  village: 'in a traditional hanok village alley with curved black-tiled roofs, stone walls and red-and-blue cheongsachorong lanterns, on a clear day',
  garden: 'in a traditional Korean garden in spring with a lotus pond, weeping willows, cherry blossoms and a small wooden pavilion',
};

const input = z.object({
  photo: captureImage,
  style: z.enum(HANBOK_STYLE_IDS),
  backdrop: z.enum(HANBOK_BACKDROP_IDS),
});

const output = z.object({ image: z.string().startsWith('data:image/') });

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, style, backdrop }) {
    const prompt = `Turn this photo into a realistic Korean hanbok portrait photograph of the same person(s).
Outfit: ${STYLE_PROMPT[style]}.
Place: ${BACKDROP_PROMPT[backdrop]}.
Style: natural, high-quality photo, warm soft light, shallow depth of field.
${BOOTH_IDENTITY_RULES}`;
    const image = await generateImage({ images: [photo], prompt, aspectRatio: '3:4' });
    return output.parse({ image });
  },
});
