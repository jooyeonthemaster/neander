import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { NAIL_MOOD_IDS, NAIL_PALETTE_IDS, NAIL_PATTERN_IDS, NAIL_PROMPTS, NAIL_SHAPE_IDS } from '@/data/demo-ai/nail';

// AI 네일 디자이너 — 방문객 손등 사진의 손톱에만 고른 디자인을 칠한 사진을 만들고, 디자인 이름·설명을 쓴다.

const input = z.object({
  photo: captureImage,
  mood: z.enum(NAIL_MOOD_IDS),
  palette: z.enum(NAIL_PALETTE_IDS),
  pattern: z.enum(NAIL_PATTERN_IDS),
  shape: z.enum(NAIL_SHAPE_IDS),
});

const text = z.object({
  title: z.string().min(2).max(24),
  desc: z.string().min(10).max(160),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'desc'],
  properties: {
    title: { type: 'string', description: '네일 디자인 이름, 한글 6~14자 (예: "체리빛 첫사랑 프렌치")' },
    desc: { type: 'string', description: '디자인 설명 2문장, 100자 이내. 무드·컬러·패턴·쉐입과 약지 포인트 네일을 자연스럽게 소개' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 네일 살롱의 디자이너입니다. 방문객이 고른 조합으로 만든 디자인에 이름을 붙이고 소개합니다.`;

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, mood, palette, pattern, shape }) {
    const m = NAIL_PROMPTS.mood[mood];
    const p = NAIL_PROMPTS.palette[palette];
    const pt = NAIL_PROMPTS.pattern[pattern];
    const sh = NAIL_PROMPTS.shape[shape];
    const imagePrompt = `Edit the attached photo of a hand. Paint a professional gel manicure on all five fingernails and change nothing else.
Design: ${m.prompt} mood, ${p.prompt}, ${pt.prompt}, ${sh.prompt} nail shape (extend the nails naturally if the shape needs more length).
Make the ring finger an accent nail with ${m.accent}; the other four nails share the main design.
Keep the hand exactly as photographed: same hand size, finger count, finger positions and angles, knuckles, skin tone and texture, wrist, background, lighting, camera angle and framing.
Do not add rings, bracelets or other jewelry. Keep it photorealistic.
Never add any text, letters, numbers, logos or watermarks.`;
    const textPrompt = `네일 디자이너 체험 결과를 만들어 주세요.
방문객이 고른 조합: 무드=${m.label}, 팔레트=${p.label}, 패턴=${pt.label}, 쉐입=${sh.label}, 약지 포인트=${m.accent}
${themeLine()}`;
    const [image, t] = await Promise.all([
      generateImage({ prompt: imagePrompt, images: [photo], aspectRatio: '3:4' }),
      generateJson({ name: 'nail_design', system: SYSTEM, prompt: textPrompt, schema }).then((r) => text.parse(r)),
    ]);
    return { image, ...t };
  },
});
