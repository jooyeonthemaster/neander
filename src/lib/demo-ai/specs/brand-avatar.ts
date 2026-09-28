import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec, freeText } from '../types';
import { BRAND_STYLE_IDS, type BrandStyleId } from '@/data/demo-ai/brand-avatar';

// AI 브랜드 아바타 — 방문객 사진을 브랜드 컬러의 플랫 일러스트 아바타로 다시 그리고(이미지),
// 명함 한 줄 소개·메신저 상태·동료 반응을 쓴다(글).

const input = z.object({
  photo: captureImage,
  brand: z.enum(BRAND_STYLE_IDS),
  name: freeText(10),
  title: freeText(18),
});

/** 데모 화면의 STYLES와 같은 색 — 아바타가 명함·링 색과 어울리도록 */
const BRAND_PROMPT: Record<BrandStyleId, { ko: string; en: string }> = {
  mono: {
    ko: '미니멀 모노',
    en: 'Minimal monochrome: strictly black (#0a0a0a), white and a few warm greys (#57534e, #a8a29e, #e7e5e4). Bold graphic shapes, high contrast, restrained and editorial. Background: flat off-white #fafaf9.',
  },
  pop: {
    ko: '비비드 팝',
    en: 'Vivid pop: hot pink #db2777, sunny yellow #fde047, cyan #22d3ee, with deep berry #831843 for lines and shadows. Playful, energetic, punchy flat colors. Background: flat sunny yellow #fde047 with a few simple pink/cyan geometric shapes.',
  },
  corporate: {
    ko: '코퍼레이트 블루',
    en: 'Corporate blue: navy #0b1f4b, royal blue #2563eb, light blue #bfdbfe and white only (natural skin tone is fine). Clean, trustworthy, professional. Background: flat royal blue #2563eb to navy.',
  },
  pastel: {
    ko: '파스텔 소프트',
    en: 'Soft pastel: lavender #a78bfa, dusty violet #6d5a9c, baby pink #fbcfe8, blush #ffe4ec and a touch of mint #a5f3fc. Gentle, friendly, warm. Background: flat blush pink #fdf2f8.',
  },
};

function imagePrompt(brand: BrandStyleId) {
  return `Turn the person in this photo into a polished flat vector illustration avatar for a company profile picture (like a modern brand illustration system).
Brand palette — use ONLY these colors for clothing, background and accents: ${BRAND_PROMPT[brand].en}
Style: clean flat shapes, smooth simplified forms, minimal subtle shading, crisp edges, friendly and professional, consistent line weight. Not photorealistic, not 3D.
Keep the person clearly recognizable: same face shape, eye shape, eyebrows, hairstyle and hair color, skin tone, glasses if they wear them, and a warm confident expression. Flattering but true to them.
Composition: head and shoulders, facing the camera, face centered horizontally and slightly above the middle, with generous margin around the head (the app crops it into a circle itself).
The flat background must fill the entire canvas edge to edge — do NOT draw a circle, badge, frame or border around the avatar, and no white corners.
Portrait orientation 3:4. Absolutely no text, letters, logos, badges, name tags or watermark in the image.`;
}

const text = z.object({
  tagline: z.string().min(1).max(24),
  status: z.string().min(1).max(24),
  reply: z.string().min(1).max(50),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['tagline', 'status', 'reply'],
  properties: {
    tagline: { type: 'string', description: '명함에 들어갈 한 줄 소개. 직함과 브랜드 무드에 어울리게, 18자 이내 (예: "브랜드의 첫인상을 설계합니다")' },
    status: { type: 'string', description: '사내 메신저 상태 메시지, 18자 이내, 이모지 없이 (예: "브랜드 런칭 준비 중")' },
    reply: {
      type: 'string',
      description: '방문객이 새 아바타로 바꿨다고 하자 동료가 보내는 반응 메시지. 사진에서 보이는 특징(안경·헤어·미소 등)이 아바타에 잘 살았다는 칭찬 1문장, 40자 이내, 이모지 1개 포함',
    },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 회사 브랜드팀의 카피라이터입니다. 방문객의 새 브랜드 아바타가 적용될 명함과 사내 메신저 문구를 씁니다.
동료 반응은 친근한 사내 메신저 말투(해요체)로, 외모 평가 대신 아바타의 분위기와 눈에 보이는 특징을 칭찬합니다.`;

export default defineSpec({
  input,
  bucket: 'image',
  async run({ photo, brand, name, title }) {
    const prompt = `브랜드 아바타 체험 결과를 만들어 주세요.
방문객: 이름=${name || '네안데르'}, 직함=${title || '브랜드 매니저'}, 고른 브랜드 스타일=${BRAND_PROMPT[brand].ko}
사진은 방문객의 프로필 사진입니다.
${themeLine()}`;
    const [image, words] = await Promise.all([
      generateImage({ prompt: imagePrompt(brand), images: [photo], aspectRatio: '3:4' }),
      // 글은 덤 — 실패해도 그림은 살린다 (화면은 고정 문구로 채운다)
      generateJson({ name: 'brand_avatar', system: SYSTEM, prompt, schema, images: [photo] })
        .then((raw) => text.parse(raw))
        .catch(() => null),
    ]);
    return { image, ...(words ?? {}) };
  },
});
