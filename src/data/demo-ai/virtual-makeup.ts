/* AI 가상 메이크업 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const MAKEUP_LOOK_IDS = ['coral', 'rose', 'mlbb', 'red', 'smoky'] as const;
export type MakeupLookId = (typeof MAKEUP_LOOK_IDS)[number];

export const MAKEUP_INTENSITY_IDS = ['soft', 'daily', 'bold'] as const;
export type MakeupIntensityId = (typeof MAKEUP_INTENSITY_IDS)[number];

export const MAKEUP_TONES = ['warm', 'cool', 'neutral'] as const;
export type MakeupTone = (typeof MAKEUP_TONES)[number];

/** 이미지 모델에 보내는 룩 설명 (영문, 데모 스와치 색과 같은 hex) */
export const MAKEUP_LOOK_PROMPTS: Record<MakeupLookId, { label: string; prompt: string }> = {
  coral: {
    label: '내추럴 코랄',
    prompt:
      'natural coral look: sheer glossy coral lip tint (#f0604d), soft peach blush (#ff9478) on the apples of the cheeks, light salmon-brown eyeshadow (#d99a78) on the lids',
  },
  rose: {
    label: '로즈 글램',
    prompt:
      'rose glam look: satin rose lipstick (#c73866), rosy pink blush (#f07aa0), champagne-rose shimmer eyeshadow (#b0707e) with a subtle silver-pink highlighter on the cheekbones',
  },
  mlbb: {
    label: 'MLBB 데일리',
    prompt:
      'MLBB daily look: soft matte nude-rose lips (#b0666a) one shade deeper than natural lips, beige-rose cream blush (#d9978d), toffee-brown eyeshadow (#a88170)',
  },
  red: {
    label: '레트로 레드립',
    prompt:
      'retro red-lip look: crisp velvet matte classic red lips (#c1121f), rosy beige blush (#e38a8a), soft brown eyeshadow (#9c6b5a) and a sharp black winged eyeliner',
  },
  smoky: {
    label: '스모키 나이트',
    prompt:
      'smoky night look: blended espresso-brown smoky eyeshadow (#5a4038) with black eyeliner, mocha nude lips (#c2847a), warm taupe contour and muted blush (#b88a7a)',
  },
};

export const MAKEUP_INTENSITY_PROMPTS: Record<MakeupIntensityId, { label: string; prompt: string }> = {
  soft: { label: '은은하게', prompt: 'Apply it sheer and subtle, like a light everyday wash of color.' },
  daily: { label: '데일리', prompt: 'Apply it at a natural everyday intensity.' },
  bold: { label: '또렷하게', prompt: 'Apply it fully saturated and clearly defined, like a finished photoshoot makeup — the colors must be obvious at first glance, also on a man.' },
};

/** /api/demo-ai/virtual-makeup 응답 */
export interface AiMakeup {
  /** 메이크업을 입힌 사진 (data:image/jpeg URL) — 비포 & 애프터의 '후' */
  image: string;
  /** 사진에서 본 피부 언더톤 */
  tone: MakeupTone;
  /** 이 사람 얼굴에 룩이 어떻게 어울리는지 1~2문장 */
  comment: string;
  /** 따라 하기 팁 2~3개 */
  tips: string[];
}

export function isAiMakeup(v: unknown): v is AiMakeup {
  const o = v as AiMakeup | null;
  return (
    !!o &&
    typeof o.image === 'string' &&
    o.image.startsWith('data:image/') &&
    (MAKEUP_TONES as readonly string[]).includes(o.tone) &&
    typeof o.comment === 'string' &&
    Array.isArray(o.tips) &&
    o.tips.every((t) => typeof t === 'string')
  );
}
