/* AI 패션 타임머신 — 데모 화면과 생성 API가 함께 쓰는 시대 목록·결과 타입 */

export const FASHION_ERA_IDS = ['e1920', 'e1950', 'e1970', 'e1990', 'y2k', 'e2080'] as const;
export type FashionEraId = (typeof FASHION_ERA_IDS)[number];

/** 이미지 모델에 보내는 시대별 스타일 (영문) — 데모 화면의 헤어·메이크업·아이템과 같은 내용 */
export const FASHION_ERA_PROMPTS: Record<FashionEraId, { label: string; style: string; photo: string }> = {
  e1920: {
    label: '1920s 재즈 에이지',
    style:
      '1920s Jazz Age: finger-wave bob hairstyle, thin arched brows and dark cherry lips; a beaded fringe flapper dress with a long pearl necklace (for a man: a three-piece suit with a bow tie and slicked-back hair)',
    photo: 'a sepia-toned 1920s studio portrait with soft film grain and an Art Deco backdrop',
  },
  e1950: {
    label: '1950s 레트로 핀업',
    style:
      '1950s retro pin-up: voluminous pin-up curls, cat-eye liner and red lips; a polka-dot swing dress (for a man: a pompadour, a bowling shirt or a cardigan over a collared shirt)',
    photo: 'a warm saturated 1950s Kodachrome color photo with a pastel diner backdrop',
  },
  e1970: {
    label: '1970s 디스코 피버',
    style:
      '1970s disco: feathered voluminous hair, blue eyeshadow and glossy lips; a shimmering disco top with bell-bottom pants (for a man: a wide-collar patterned shirt, flared trousers and a feathered shag haircut)',
    photo: 'a warm, faded 1970s film photo on a disco floor with a mirror ball and colored lights',
  },
  e1990: {
    label: '1990s 힙합 스트리트',
    style:
      '1990s hip-hop street style: a snapback cap or braids, brown lip liner and matte skin; an oversized denim jacket and a windbreaker',
    photo: 'a 1990s street photo shot on a point-and-shoot film camera with slightly crushed contrast, a brick wall with abstract colorful spray-paint shapes (no letters) behind',
  },
  y2k: {
    label: 'Y2K 밀레니엄 팝',
    style:
      'Y2K millennium pop: half-up hair with butterfly clips, glitter eyeshadow and lip gloss; a baby tee with low-rise jeans and tinted sunglasses on the head',
    photo: 'an early-2000s compact digital camera photo with on-camera flash (no red-eye) and bright saturated colors',
  },
  e2080: {
    label: '2080 퓨처 사이버',
    style:
      'the year 2080: a metallic silver short haircut, holographic highlighter; a sleek smart-fabric suit with glowing seams and a translucent AR visor pushed up on the forehead so the eyes stay visible',
    photo: 'a clean futuristic editorial photo with cool neon cyan and violet lighting in a minimal sci-fi space',
  },
};

/** /api/demo-ai/fashion-timemachine 응답 */
export interface AiFashion {
  /** 가장 잘 어울리는 시대(ranking[0])의 스타일을 입힌 사진 (data:image/jpeg URL) */
  image: string;
  /** 고른 시대 전부의 싱크로율 순위 (높은 순) */
  ranking: { id: FashionEraId; score: number; reason: string }[];
}

export function isAiFashion(v: unknown): v is AiFashion {
  const o = v as AiFashion | null;
  return (
    !!o &&
    typeof o.image === 'string' &&
    o.image.startsWith('data:image/') &&
    Array.isArray(o.ranking) &&
    o.ranking.length > 0 &&
    o.ranking.every(
      (r) => !!r && (FASHION_ERA_IDS as readonly string[]).includes(r.id) && typeof r.score === 'number' && typeof r.reason === 'string'
    )
  );
}
