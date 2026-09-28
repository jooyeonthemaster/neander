/* AI 네일 디자이너 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const NAIL_MOOD_IDS = ['lovely', 'chic', 'natural', 'funky', 'elegant', 'dreamy'] as const;
export type NailMoodId = (typeof NAIL_MOOD_IDS)[number];

export const NAIL_PALETTE_IDS = ['cherry', 'nude', 'midnight', 'mint', 'wine', 'lavender'] as const;
export type NailPaletteId = (typeof NAIL_PALETTE_IDS)[number];

export const NAIL_PATTERN_IDS = ['french', 'gradient', 'glitter', 'marble', 'art'] as const;
export type NailPatternId = (typeof NAIL_PATTERN_IDS)[number];

export const NAIL_SHAPE_IDS = ['round', 'square', 'almond', 'stiletto'] as const;
export type NailShapeId = (typeof NAIL_SHAPE_IDS)[number];

/** 이미지 모델에 보내는 선택지 설명 (영문, 데모 팔레트와 같은 hex) */
export const NAIL_PROMPTS = {
  mood: {
    lovely: { label: '러블리', prompt: 'lovely and sweet', accent: 'a small pearl or heart charm' },
    chic: { label: '시크', prompt: 'chic and urban', accent: 'a thin gold vertical stripe' },
    natural: { label: '내추럴', prompt: 'clean and natural', accent: 'a slightly deeper shade of the same color' },
    funky: { label: '펑키', prompt: 'playful, bold and funky', accent: 'a yellow lightning-bolt motif' },
    elegant: { label: '우아한', prompt: 'elegant and refined', accent: 'three tiny rhinestones in a row near the cuticle' },
    dreamy: { label: '몽환', prompt: 'dreamy and sparkling', accent: 'a holographic iridescent chrome finish' },
  },
  palette: {
    cherry: { label: '체리 블라썸', prompt: 'cherry-blossom palette: pale pink #ffe4ec, pink #ff8fab, deep magenta #e11d74' },
    nude: { label: '누드 베이지', prompt: 'nude beige palette: cream #f7e7dc, beige #d9b8a3, cocoa brown #8d5b4c' },
    midnight: { label: '미드나잇 블루', prompt: 'midnight blue palette: pale periwinkle #dbe4ff, blue #6272e8, navy #1e1b4b' },
    mint: { label: '민트 소다', prompt: 'mint soda palette: pale mint #e6fff7, mint #7ee0c3, teal #0f9b8e' },
    wine: { label: '버건디 와인', prompt: 'burgundy wine palette: blush #fbe3e8, raspberry #c0395a, burgundy #5b0f24' },
    lavender: { label: '라벤더 드림', prompt: 'lavender palette: pale lilac #f3edff, lavender #c4b0ff, violet #7c4dff' },
  },
  pattern: {
    french: { label: '프렌치', prompt: 'French tips (a colored tip line along the free edge over a sheer base)' },
    gradient: { label: '그라데이션', prompt: 'ombre gradient from the cuticle to the tip' },
    glitter: { label: '글리터', prompt: 'glitter gradient with fine sparkles concentrated toward the tips' },
    marble: { label: '마블', prompt: 'marble stone effect with soft veins and a thin gold vein' },
    art: { label: '아트 드로잉', prompt: 'small hand-painted motifs (hearts, stars, flowers or moons) on a solid base' },
  },
  shape: {
    round: { label: '라운드', prompt: 'short round' },
    square: { label: '스퀘어', prompt: 'short square' },
    almond: { label: '아몬드', prompt: 'medium-length almond' },
    stiletto: { label: '스틸레토', prompt: 'long pointed stiletto' },
  },
} as const satisfies {
  mood: Record<NailMoodId, { label: string; prompt: string; accent: string }>;
  palette: Record<NailPaletteId, { label: string; prompt: string }>;
  pattern: Record<NailPatternId, { label: string; prompt: string }>;
  shape: Record<NailShapeId, { label: string; prompt: string }>;
};

/** /api/demo-ai/nail-designer 응답 */
export interface AiNail {
  /** 방문객 손에 네일을 입힌 사진 (data:image/jpeg URL) */
  image: string;
  /** 디자인 이름 */
  title: string;
  /** 디자인 설명 1~2문장 */
  desc: string;
}

export function isAiNail(v: unknown): v is AiNail {
  const o = v as AiNail | null;
  return !!o && typeof o.image === 'string' && o.image.startsWith('data:image/') && typeof o.title === 'string' && typeof o.desc === 'string';
}
