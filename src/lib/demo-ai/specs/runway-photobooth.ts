import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { COVER_HEADLINE, RUNWAY_CONCEPT_IDS, RUNWAY_POSE_IDS, type RunwayConceptId, type RunwayPoseId } from '@/data/demo-ai/runway';

// AI 런웨이 포토부스 — 방문객 사진을 고른 컬렉션 무드의 패션지 표지 사진으로 다시 찍고(이미지),
// 표지 헤드라인·커버 라인·포토그래퍼 코멘트를 쓴다(글). 마스트헤드·바코드 등 글자는 화면이 얹는다.

const input = z.object({
  photo: captureImage,
  concept: z.enum(RUNWAY_CONCEPT_IDS),
  pose: z.enum(RUNWAY_POSE_IDS),
});

/** 데모 화면의 착장 크레딧과 같은 옷 — 화면에 적힌 착장이 사진과 맞도록 */
const CONCEPT_PROMPT: Record<RunwayConceptId, { ko: string; en: string }> = {
  paris: {
    ko: '파리 오트쿠튀르 (아이보리 실크 드레이프 가운, 누드 글로우 메이크업 + 버건디 립)',
    en: `Paris haute couture show. Outfit: an ivory silk draped couture look (a flowing draped gown, or an ivory silk draped couture suit if that suits the person better). Makeup: nude glow skin with a burgundy lip.
Setting: an opulent Paris couture runway with gilded mirrors and warm golden spotlights, softly blurred audience. Warm champagne-and-gold color grading, elegant film grain.`,
  },
  milan: {
    ko: '밀라노 미니멀 (블랙 울 테일러드 수트, 매트 스킨 + 샤프 브로우)',
    en: `Milan minimal collection. Outfit: a sharp black wool tailored suit with a strong structured silhouette. Makeup: matte skin, sharp defined brows.
Setting: a stark minimalist concrete runway with hard directional light. Shot as a high-contrast BLACK-AND-WHITE fashion photograph with fine grain.`,
  },
  seoul: {
    ko: '서울 스트릿 (오버사이즈 바시티 재킷 + 카고 팬츠, 글리터 언더 + 체리 틴트)',
    en: `Seoul street fashion week. Outfit: an oversized varsity jacket with cargo pants, layered streetwear accessories. Makeup: glitter under the eyes and a cherry lip tint.
Setting: a Seongsu-dong alley at night lit by hot pink and cyan neon tubes and glowing blurred bokeh (abstract light shapes only, no readable signs), wet pavement reflections. Saturated magenta/cyan/violet color grading.`,
  },
  ny: {
    ko: '뉴욕 모던 (카멜 더블 트렌치코트, 브론즈 섀도 + 누드 립)',
    en: `New York modern collection. Outfit: a camel double-breasted trench coat over sleek modern layers. Makeup: bronze eyeshadow and a nude lip.
Setting: a Manhattan street crossing at golden hour with blurred yellow cabs and glass towers. Cool blue city tones with a warm orange sun flare from the upper right.`,
  },
};

const POSE_PROMPT: Record<RunwayPoseId, { ko: string; en: string }> = {
  walk: { ko: '캣워크', en: 'Pose: confidently walking toward the camera mid-stride on the runway, captured as a full-length / knee-up shot.' },
  shoulder: { ko: '오버 더 숄더', en: 'Pose: body turned away, glancing back over the shoulder toward the camera; three-quarter length shot.' },
  power: { ko: '파워 포즈', en: 'Pose: a strong frontal power stance, shoulders squared, hands on hips or in pockets, intense direct gaze; waist-up to knee-up shot.' },
  close: { ko: '뷰티 클로즈업', en: 'Pose: a beauty close-up of the face and shoulders, direct gaze, flawless editorial lighting on the skin.' },
};

function imagePrompt(concept: RunwayConceptId, pose: RunwayPoseId) {
  return `Create a high-fashion magazine COVER PHOTOGRAPH (the photo only) of the person in this photo, as if they are the cover star.
${CONCEPT_PROMPT[concept].en}
${POSE_PROMPT[pose].en}
Keep the person clearly recognizable: same face shape, eye shape, eyebrows, skin tone, hairstyle and hair color (it may be styled, but keep its length and color), glasses if they wear them. Flattering professional retouching, but it must still look like them.
Composition for a cover layout: a full-bleed photo — the scene fills the whole frame edge to edge, never leave blank, white or empty bands. Subject centered, with the top of the head roughly 15–20% below the top edge so the upper part shows only scene background (a masthead is overlaid there later); the lower third should be darker and less busy (cover lines are overlaid there).
Photorealistic editorial fashion photography, portrait orientation 3:4. Absolutely no text, magazine title, letters, numbers, logos, barcodes or watermark in the image — also no lettering, numbers or patches on the clothing and no readable signs in the background.`;
}

const text = z.object({
  headline: z.string().regex(COVER_HEADLINE),
  sub: z.string().min(1).max(22),
  lines: z.array(z.string().min(1).max(20)).length(2),
  note: z.string().min(1).max(80),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'sub', 'lines', 'note'],
  properties: {
    headline: { type: 'string', description: '표지 메인 헤드라인. 영어 대문자 2~3단어, 공백 포함 16자 이내, 영문·숫자·공백·&·\'·!·-만 (예: "THE NEW MUSE", "NEON NIGHTS")' },
    sub: { type: 'string', description: '헤드라인 아래 한글 한 줄, 16자 이내 (예: "파리가 주목한 새 얼굴")' },
    lines: { type: 'array', items: { type: 'string' }, description: '표지 커버 라인 정확히 2개, 각 14자 이내 한글 (예: "실크와 레이스로 쓴 새 시즌")' },
    note: { type: 'string', description: '촬영한 포토그래퍼의 코멘트. 사진 속 표정·눈빛·분위기와 고른 포즈를 칭찬 1~2문장, 60자 이내, 해요체' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 패션 매거진 에디터이자 표지 촬영 포토그래퍼입니다. 방문객이 커버 스타가 된 표지의 문구를 씁니다.
외모·체형을 평가하지 않고, 분위기·표정·포즈의 매력을 칭찬합니다.`;

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, concept, pose }) {
    const prompt = `런웨이 포토부스 체험 결과를 만들어 주세요.
컬렉션 컨셉: ${CONCEPT_PROMPT[concept].ko}
표지 포즈: ${POSE_PROMPT[pose].ko}
사진은 방문객의 촬영 컷입니다.
${themeLine()}`;
    const [image, words] = await Promise.all([
      generateImage({ prompt: imagePrompt(concept, pose), images: [photo], aspectRatio: '3:4' }),
      // 글은 덤 — 실패해도 사진은 살린다 (화면은 컨셉별 고정 커버 라인으로 채운다)
      generateJson({ name: 'runway_cover', system: SYSTEM, prompt, schema, images: [photo] })
        .then((raw) => text.parse(raw))
        .catch(() => null),
    ]);
    return { image, ...(words ?? {}) };
  },
});
