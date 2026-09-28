import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec, freeText } from '../types';
import { PHOTOCARD_CONCEPT_IDS, type PhotocardConceptId } from '@/data/demo-ai/photocard';

// AI 팬 포토카드 — 방문객 사진을 고른 앨범 콘셉트의 아이돌 포토카드 사진으로 다시 찍고(이미지),
// 카드 뒷면 프로필(포지션·매력 포인트·팬에게 한마디·해시태그)을 쓴다(글). 활동명·넘버 등 글자는 화면이 얹는다.

const input = z.object({
  photo: captureImage,
  concept: z.enum(PHOTOCARD_CONCEPT_IDS),
  stageName: freeText(10),
  group: freeText(12),
});

const CONCEPT_PROMPT: Record<PhotocardConceptId, { ko: string; en: string }> = {
  season: {
    ko: "시즌 그리팅 (포근한 겨울 화보)",
    en: `Season's greetings photoshoot: a cozy winter set with a soft cream knit sweater or scarf, warm fairy-light bokeh and a hint of falling snow, warm golden soft light, gentle rosy blush. Warm, soft, dreamy color grading.`,
  },
  tour: {
    ko: '월드투어 (무대 조명 아래 라이브 컷)',
    en: `World-tour live concert shot: on a big stage in a sparkly stage outfit, holding or wearing a headset mic, hot pink and cyan spotlights with violet haze behind, lens flares and a sea of light sticks as blurred bokeh. Vivid, high-energy concert color grading.`,
  },
  debut: {
    ko: '데뷔 앨범 (청량한 티저 무드)',
    en: `Debut album teaser: a fresh, clear "cheongryang" mood — crisp white shirt or light denim, bright blue sky with soft clouds, airy sunlight and a light breeze in the hair. Cool, clean, bright pastel-blue color grading.`,
  },
  holo: {
    ko: '홀로그램 스페셜 (한정판 홀로 포일)',
    en: `Limited hologram special: a dreamy studio shot in an iridescent silver/pastel outfit, prism light refractions and rainbow light leaks in lilac, aqua and soft gold across the frame. Ethereal, glossy pastel color grading.`,
  },
};

function imagePrompt(concept: PhotocardConceptId) {
  return `Create an official K-pop idol PHOTOCARD photo (the photo only) of the person in this photo, as if they were an idol.
Concept: ${CONCEPT_PROMPT[concept].en}
Keep the person clearly recognizable: same face shape, eye shape, eyebrows, skin tone, hairstyle and hair color (it may be styled, but keep its length and color), glasses if they wear them. Idol-style flattering soft retouching, cute or charismatic expression close to their own, but it must still look like them.
Composition: chest-up / waist-up portrait, face in the upper-middle of the frame, a cute idol pose (e.g. a small finger heart, a peace sign near the face, or a soft head tilt). Keep the bottom quarter simple — a name will be overlaid there.
Photorealistic, polished K-pop photoshoot quality, portrait orientation 2:3. Absolutely no text, letters, numbers, names, logos or watermark in the image.`;
}

const text = z.object({
  position: z.string().min(1).max(20),
  charm: z.string().min(1).max(40),
  message: z.string().min(1).max(60),
  tags: z.array(z.string().min(1).max(14)).length(3),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['position', 'charm', 'message', 'tags'],
  properties: {
    position: { type: 'string', description: '그룹 내 포지션, 14자 이내 (예: "메인보컬 · 센터", "리더 · 메인댄서")' },
    charm: { type: 'string', description: '사진에서 보이는 매력 포인트, 30자 이내 (예: "웃을 때 사라지는 반달 눈")' },
    message: { type: 'string', description: '활동명으로 팬에게 건네는 한마디, 포토카드 뒷면 손글씨 느낌의 다정한 반말 1문장, 45자 이내' },
    tags: { type: 'array', items: { type: 'string' }, description: '팬들이 붙여 줄 해시태그 정확히 3개, # 없이, 각 10자 이내 (예: "청량돌", "안경미남")' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 K-팝 기획사의 콘텐츠 에디터입니다. 방문객이 아이돌로 데뷔한 포토카드의 뒷면 프로필을 씁니다.
외모 점수나 비교는 하지 않고, 사진에서 보이는 표정·분위기·스타일의 매력을 칭찬합니다. 실존 아이돌·그룹 이름은 쓰지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, concept, stageName, group }) {
    const prompt = `팬 포토카드 체험 결과를 만들어 주세요.
활동명=${stageName || '나'}, 그룹명=${group || 'NEANDER'}, 앨범 콘셉트=${CONCEPT_PROMPT[concept].ko}
사진은 방문객이 포토부스에서 찍은 컷입니다.
${themeLine()}`;
    const [image, words] = await Promise.all([
      generateImage({ prompt: imagePrompt(concept), images: [photo], aspectRatio: '2:3' }),
      // 글은 덤 — 실패해도 사진은 살린다 (화면은 프로필 패널 없이 기존 구성으로)
      generateJson({ name: 'photocard_profile', system: SYSTEM, prompt, schema, images: [photo] })
        .then((raw) => text.parse(raw))
        .catch(() => null),
    ]);
    return { image, ...(words ?? {}) };
  },
});
