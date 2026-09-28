import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import {
  IDOL_CONCEPT_IDS,
  IDOL_CONCEPT_PROMPTS,
  IDOL_POSITIONS,
  IDOL_STAGE_IDS,
  IDOL_STAGE_PROMPTS,
} from '@/data/demo-ai/idol-makeup';
import { KEEP_IDENTITY } from '@/data/demo-ai/photo-edit';

// AI 아이돌 메이크업 부스 — 방문객 사진에 콘셉트 메이크업·스타일링·무대 조명을 입힌 포토카드 사진을 만들고,
// 스테이지 네임·포지션·팬사인 문구·메이크업 포인트를 함께 쓴다.

const input = z.object({
  photo: captureImage,
  concept: z.enum(IDOL_CONCEPT_IDS),
  stage: z.enum(IDOL_STAGE_IDS),
});

const text = z.object({
  stageName: z.string().regex(/^[A-Z]{3,7}$/),
  positions: z.array(z.enum(IDOL_POSITIONS)).length(2),
  caption: z.string().min(4).max(40),
  points: z.array(z.string().min(1).max(16)).min(3).max(4),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['stageName', 'positions', 'caption', 'points'],
  properties: {
    stageName: { type: 'string', description: '영문 대문자 4~5글자 스테이지 네임 (예: NEVI, LUZE). 실존 아이돌 이름 금지' },
    positions: { type: 'array', items: { type: 'string', enum: [...IDOL_POSITIONS] }, description: '서로 다른 포지션 2개' },
    caption: { type: 'string', description: '포토카드에 손글씨로 적는 팬사인 메시지, 한글 30자 이내. 콘셉트 분위기에 맞게' },
    points: { type: 'array', items: { type: 'string' }, description: '적용한 메이크업·스타일 포인트 4개, 각 12자 이내 (예: "스모키 아이", "글로시 핑크 립")' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 '아이돌 데뷔 포토카드' 체험의 기획사 A&R입니다. 방문객이 고른 콘셉트로 막 데뷔한 신인 아이돌 프로필을 만듭니다.`;

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, concept, stage }) {
    const c = IDOL_CONCEPT_PROMPTS[concept];
    const s = IDOL_STAGE_PROMPTS[stage];
    const imagePrompt = `${KEEP_IDENTITY}
Turn this person into a K-pop idol debut photocard shot with a ${c.prompt}.
Setting: ${s.prompt}. The new background must fill the whole image edge to edge — no borders, frames, cards or inset panels.
Keep the person's original facial expression (if they smile, they still smile).
Apply professional idol stage makeup and hair styling; for a man, use the male idol version of the look (groomed brows, subtle liner, tinted lips).
The result should look like an official K-pop photocard photo of this same person, not a different person.`;
    const textPrompt = `아이돌 메이크업 부스 결과를 만들어 주세요.
방문객이 고른 콘셉트=${c.label}, 포토카드 배경=${s.label}
사진에 실제로 입힌 메이크업·스타일: ${c.makeup} — points는 반드시 이 내용을 바탕으로 쓴다.
${themeLine()}`;
    const [image, t] = await Promise.all([
      generateImage({ prompt: imagePrompt, images: [photo], aspectRatio: '3:4' }),
      generateJson({ name: 'idol_profile', system: SYSTEM, prompt: textPrompt, schema }).then((r) => text.parse(r)),
    ]);
    // 같은 포지션 두 개가 오면 두 번째를 다른 것으로 바꾼다 (이미지까지 버리지 않도록)
    if (t.positions[0] === t.positions[1]) t.positions[1] = IDOL_POSITIONS.find((p) => p !== t.positions[0])!;
    return { image, ...t };
  },
});
