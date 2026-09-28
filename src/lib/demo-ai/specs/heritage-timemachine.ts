import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { HERITAGE_ERAS, HERITAGE_SITE_IDS, HERITAGE_SITE_LABELS, SKY_PROMPTS } from '@/data/demo-ai/heritage';

// AI 문화유산 타임머신 — 방문객을 고른 문화유산·시대 장면 속에 그려 넣고(이미지 생성), 음성 해설 원고를 쓴다(사진 분석).
// 해설은 브라우저 speechSynthesis가 읽는다.

const input = z
  .object({
    photo: captureImage,
    site: z.enum(HERITAGE_SITE_IDS),
    era: z.enum(Object.keys(HERITAGE_ERAS) as [string, ...string[]]),
  })
  .refine((v) => HERITAGE_ERAS[v.era]!.site === v.site, { message: 'era does not belong to site', path: ['era'] });

const text = z.object({
  narration: z.string().min(40).max(360),
  outfit: z.string().min(2).max(24),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['narration', 'outfit'],
  properties: {
    narration: {
      type: 'string',
      description: '소리 내어 읽을 해설 원고 3~4문장, 250자 이내. 한자·괄호·이모지·영문 없이 해요체. 연도는 숫자로 (예: 1443년)',
    },
    outfit: { type: 'string', description: '사진 속 방문객의 차림 한 줄, 16자 이내 (예: 조선 전기 선비의 도포)' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 문화유산 해설사입니다. 방문객이 시간 여행자가 되어 그 시대 장면 속에 서 있다는 설정으로 음성 해설 원고를 씁니다.
역사적 사실은 제공된 사실과 널리 알려진 내용만 쓰고, 연도·인물·수치를 새로 지어내지 않습니다. 확실하지 않은 것은 '~라고 전해져요'처럼 씁니다.
사진 속 방문객은 이름 대신 '시간 여행자'로 부르고, 외모 평가는 하지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, site, era }) {
    const e = HERITAGE_ERAS[era]!;
    const modern = e.costume.startsWith('their own');
    const imagePrompt = `Place the person from the reference photo into this scene as a time traveler: ${e.scene}.
Keep the person's identity exactly: same face, facial features, skin tone, hairstyle and age. Do not beautify or change ethnicity.
Clothing: ${modern ? 'keep their own clothes from the photo.' : `dress them in ${e.costume}.`}${modern ? '' : '\nThe person holds nothing modern (no phone, tablet, laptop, bag, lanyard or badge), and the scene has no modern objects (no fences, street lamps, cars, signs or tourists in modern clothes).'}
Composition: a vertical souvenir portrait — the person stands in the foreground, visible from the knees or waist up, slightly off-center, with the heritage site clearly recognizable behind them. Lighting: ${SKY_PROMPTS[e.sky]}, matching on the person and the scene.
Photorealistic, cinematic, respectful and historically plausible. No text, letters, signs with writing, logos or watermarks.`;
    const textPrompt = `문화유산 타임머신 음성 해설을 써 주세요.
장소: ${HERITAGE_SITE_LABELS[site]}
시대: ${e.year}${/^\d+$/.test(e.year) ? '년' : ''} · ${e.label}
이 시대의 사실: ${e.fact}
방문객 차림: ${modern ? '자기 옷 그대로 (현대 복장)' : '그 시대 옷차림으로 갈아입은 모습'}
첫 문장은 지금 어느 시대, 어느 곳에 와 있는지 알려 주고, 마지막 문장은 사진 속 시간 여행자에게 건네는 말로 끝내 주세요.`;
    const [image, parsed] = await Promise.all([
      generateImage({ prompt: imagePrompt, images: [photo], aspectRatio: '3:4' }),
      generateJson({ name: 'heritage_narration', system: SYSTEM, prompt: textPrompt, schema, images: [photo] }).then((r) => text.parse(r)),
    ]);
    return { image, ...parsed };
  },
});
