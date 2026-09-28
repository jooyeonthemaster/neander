/* AI 셀럽 닮은꼴 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const CELEB_FACE_SHAPES = [
  { id: 'oval', label: '계란형', vx: 50, vy: 55, rx: 38, ry: 50, isRect: false, isHeart: false },
  { id: 'round', label: '둥근형', vx: 50, vy: 50, rx: 44, ry: 44, isRect: false, isHeart: false },
  { id: 'square', label: '각진형', vx: 50, vy: 50, rx: 0, ry: 0, isRect: true, isHeart: false },
  { id: 'heart', label: '하트형', vx: 50, vy: 52, rx: 0, ry: 0, isRect: false, isHeart: true },
  { id: 'oblong', label: '긴형', vx: 50, vy: 55, rx: 32, ry: 55, isRect: false, isHeart: false },
] as const;

export const CELEB_FEATURES = [
  { id: 'eyes', emoji: '👀', label: '눈', desc: '깊고 매력적인 눈매' },
  { id: 'nose', emoji: '👃', label: '코', desc: '뚜렷한 콧날' },
  { id: 'lips', emoji: '👄', label: '입술', desc: '매력적인 입술 라인' },
  { id: 'jawline', emoji: '🗿', label: '턱라인', desc: '선명한 페이스라인' },
] as const;

export const CELEB_VIBES = [
  { id: 'cute', emoji: '🐰', label: '큐트', desc: '사랑스럽고 밝은 에너지', from: 'from-pink-400', to: 'to-rose-300' },
  { id: 'cool', emoji: '😎', label: '시크', desc: '도도하고 세련된 카리스마', from: 'from-slate-500', to: 'to-zinc-700' },
  { id: 'elegant', emoji: '🦢', label: '우아', desc: '고급스럽고 기품 있는 무드', from: 'from-amber-200', to: 'to-rose-300' },
  { id: 'charismatic', emoji: '🔥', label: '카리스마', desc: '강렬하고 압도적인 존재감', from: 'from-red-500', to: 'to-orange-600' },
] as const;

/** 어느 분야의 창작 캐스팅 무드를 참고할지 */
export const CELEB_FIELDS = [
  { id: 'all', emoji: '🌟', label: '상관없어요', desc: '다양한 분야의 무드 탐색' },
  { id: 'actor', emoji: '🎬', label: '배우', desc: '드라마·영화 배우' },
  { id: 'singer', emoji: '🎤', label: '가수·아이돌', desc: 'K-POP 가수와 아이돌' },
  { id: 'entertainer', emoji: '📺', label: '방송인·모델', desc: '예능인·MC·모델' },
] as const;

export const CELEB_FACE_SHAPE_IDS = CELEB_FACE_SHAPES.map((f) => f.id) as unknown as readonly [
  (typeof CELEB_FACE_SHAPES)[number]['id'],
  ...(typeof CELEB_FACE_SHAPES)[number]['id'][],
];
export const CELEB_FEATURE_IDS = CELEB_FEATURES.map((f) => f.id) as unknown as readonly [
  (typeof CELEB_FEATURES)[number]['id'],
  ...(typeof CELEB_FEATURES)[number]['id'][],
];
export const CELEB_VIBE_IDS = CELEB_VIBES.map((v) => v.id) as unknown as readonly [
  (typeof CELEB_VIBES)[number]['id'],
  ...(typeof CELEB_VIBES)[number]['id'][],
];

/** /api/demo-ai/celeb-lookalike 응답 — 사진에 얼굴이 없으면 { observed: false } */
export interface AiCelebLookalike {
  observed: true;
  /** 닮은꼴 유형 이름 (예: 청량한 아이돌 비주얼) */
  name: string;
  desc: string;
  /** 사진에서 읽은 얼굴형·가장 돋보이는 이목구비·첫인상 */
  faceShape: (typeof CELEB_FACE_SHAPES)[number]['id'];
  feature: (typeof CELEB_FEATURES)[number]['id'];
  vibe: (typeof CELEB_VIBES)[number]['id'];
  /** 각 70~98 */
  scores: { face: number; feature: number; vibe: number };
  traits: string[];
  /** 실존 인물 대신 창작 캐스팅 무드. similarity는 연출용 허구 지수 60~95. */
  celebs: { name: string; similarity: number; point: string }[];
}
