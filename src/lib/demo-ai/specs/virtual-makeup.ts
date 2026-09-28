import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import {
  MAKEUP_INTENSITY_IDS,
  MAKEUP_INTENSITY_PROMPTS,
  MAKEUP_LOOK_IDS,
  MAKEUP_LOOK_PROMPTS,
  MAKEUP_TONES,
} from '@/data/demo-ai/virtual-makeup';
import { KEEP_IDENTITY } from '@/data/demo-ai/photo-edit';

// AI 가상 메이크업 — 방문객 얼굴 사진에 고른 룩(립·블러셔·섀도)만 입힌 '애프터' 사진을 만들고,
// 같은 사진을 보고 피부 언더톤·어울림 코멘트·따라 하기 팁을 쓴다.

const input = z.object({
  photo: captureImage,
  look: z.enum(MAKEUP_LOOK_IDS),
  intensity: z.enum(MAKEUP_INTENSITY_IDS),
});

const text = z.object({
  tone: z.enum(MAKEUP_TONES),
  comment: z.string().min(10).max(160),
  tips: z.array(z.string().min(4).max(60)).min(2).max(3),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['tone', 'comment', 'tips'],
  properties: {
    tone: { type: 'string', enum: [...MAKEUP_TONES], description: '사진 속 피부의 언더톤 (warm·cool·neutral). 조명 탓에 애매하면 neutral' },
    comment: { type: 'string', description: '이 얼굴에 고른 룩이 어떻게 어울리는지 칭찬 위주 2문장, 100자 이내. 이목구비를 평가하거나 단점을 말하지 않는다' },
    tips: { type: 'array', items: { type: 'string' }, description: '이 룩을 집에서 따라 할 때의 팁 3개, 각 40자 이내 (바르는 위치·양·순서)' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 뷰티 매장의 메이크업 아티스트입니다. 사진 속 피부 톤과 분위기를 보고 고른 룩을 어떻게 소화하면 좋은지 알려줍니다.
얼굴형·이목구비·피부 상태에 대한 부정적 평가, 성형·시술 권유는 하지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, look, intensity }) {
    const l = MAKEUP_LOOK_PROMPTS[look];
    const k = MAKEUP_INTENSITY_PROMPTS[intensity];
    const imagePrompt = `${KEEP_IDENTITY}
Apply only this makeup to the person: ${l.prompt}. ${k.prompt}
Change nothing else: same hair, clothes, background, lighting, skin texture (pores stay visible, no airbrushing), face shape and jawline (no face slimming), eye size and lip shape.
Lip color must follow the natural lip line. The result should look like a real photo of the same person wearing this makeup.
Makeup here is for everyone: apply the same visible amount regardless of the person's gender. Comparing before and after side by side, the eyeshadow, liner, blush and lip color must be clearly noticeable.`;
    const textPrompt = `가상 메이크업 체험 결과를 만들어 주세요.
방문객이 고른 룩=${l.label} (${l.prompt}), 농도=${k.label}
첨부한 사진은 메이크업 전 방문객 얼굴입니다.`;
    const [image, t] = await Promise.all([
      generateImage({ prompt: imagePrompt, images: [photo], aspectRatio: '3:4' }),
      generateJson({ name: 'virtual_makeup', system: SYSTEM, prompt: textPrompt, schema, images: [photo] }).then((r) => text.parse(r)),
    ]);
    return { image, ...t };
  },
});
