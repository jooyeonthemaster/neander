/* AI 향수 소울메이트 — 데모 화면과 생성 API가 함께 쓰는 선택지·향수 데이터·결과 타입 */

export type ScentAxis = 'floral' | 'citrus' | 'fresh' | 'woody' | 'musk' | 'amber';
export type ScentWeights = Partial<Record<ScentAxis, number>>;

export const SCENT_AXES: { id: ScentAxis; label: string }[] = [
  { id: 'floral', label: '플로럴' },
  { id: 'citrus', label: '시트러스' },
  { id: 'fresh', label: '프레시' },
  { id: 'woody', label: '우디' },
  { id: 'musk', label: '머스크' },
  { id: 'amber', label: '앰버' },
];

export const SCENT_TYPES: Record<ScentAxis, string> = {
  floral: '꽃잎 같은 로맨티스트',
  citrus: '햇살 같은 에너자이저',
  fresh: '바람 같은 자유 여행자',
  woody: '숲을 닮은 사색가',
  musk: '포근한 코튼 힐러',
  amber: '촛불 같은 매혹가',
};

export interface ScentOption {
  id: string;
  label: string;
  desc?: string;
  emoji?: string;
  swatch?: string;
  w: ScentWeights;
}

export const SCENT_PERSONA: ScentOption[] = [
  { id: 'calm', emoji: '🌙', label: '차분한', desc: '혼자만의 시간이 좋아요', w: { musk: 2, woody: 1 } },
  { id: 'passion', emoji: '🔥', label: '열정적인', desc: '하고 싶은 건 바로 해요', w: { amber: 2, citrus: 1 } },
  { id: 'kind', emoji: '🤍', label: '다정한', desc: '주변을 잘 챙겨요', w: { floral: 2, musk: 1 } },
  { id: 'free', emoji: '🍃', label: '자유로운', desc: '즉흥 여행 환영이에요', w: { fresh: 2, citrus: 1 } },
  { id: 'smart', emoji: '📚', label: '지적인', desc: '생각이 깊은 편이에요', w: { woody: 2, amber: 1 } },
  { id: 'playful', emoji: '🎈', label: '장난스러운', desc: '분위기 메이커예요', w: { citrus: 2, floral: 1 } },
];

export const SCENT_PLACES: ScentOption[] = [
  { id: 'forest', emoji: '🌲', label: '비 갠 숲길', desc: '젖은 흙과 초록 잎', w: { fresh: 2, woody: 2 } },
  { id: 'beach', emoji: '🏖️', label: '햇살 가득한 해변', desc: '바닷바람과 레몬에이드', w: { citrus: 2, fresh: 2 } },
  { id: 'library', emoji: '🕰️', label: '오래된 서재', desc: '책장과 가죽 소파', w: { woody: 3, amber: 1 } },
  { id: 'garden', emoji: '🌷', label: '꽃이 핀 정원', desc: '장미와 작약 사이', w: { floral: 3, fresh: 1 } },
  { id: 'jazz', emoji: '🎷', label: '한밤의 재즈 바', desc: '촛불과 위스키', w: { amber: 3, woody: 1 } },
  { id: 'bed', emoji: '🛏️', label: '포근한 이불 속', desc: '갓 세탁한 코튼', w: { musk: 3, floral: 1 } },
];

export const SCENT_SEASONS: ScentOption[] = [
  { id: 'spring', emoji: '🌸', label: '봄', w: { floral: 2, fresh: 1 } },
  { id: 'summer', emoji: '🌊', label: '여름', w: { citrus: 2, fresh: 2 } },
  { id: 'autumn', emoji: '🍂', label: '가을', w: { woody: 2, amber: 1 } },
  { id: 'winter', emoji: '❄️', label: '겨울', w: { amber: 2, musk: 2 } },
];

export const SCENT_COLORS: ScentOption[] = [
  { id: 'pink', label: '파우더 핑크', swatch: 'linear-gradient(135deg, #fde2e8, #f4a7bb)', w: { floral: 2, musk: 1 } },
  { id: 'yellow', label: '시트러스 옐로', swatch: 'linear-gradient(135deg, #fef9c3, #facc15)', w: { citrus: 3 } },
  { id: 'sage', label: '세이지 그린', swatch: 'linear-gradient(135deg, #e3ecd6, #8fae7a)', w: { fresh: 2, woody: 1 } },
  { id: 'ocean', label: '오션 블루', swatch: 'linear-gradient(135deg, #e0f2fe, #38bdf8)', w: { fresh: 2, citrus: 1 } },
  { id: 'burgundy', label: '딥 버건디', swatch: 'linear-gradient(135deg, #b4536a, #4c0519)', w: { amber: 3, floral: 1 } },
  { id: 'beige', label: '샌달우드 베이지', swatch: 'linear-gradient(135deg, #f1e7d8, #b89b77)', w: { woody: 2, musk: 2 } },
];

export interface ScentPerfume {
  name: string;
  en: string;
  family: string;
  emoji: string;
  profile: Record<ScentAxis, number>;
  notes: { top: string[]; middle: string[]; base: string[] };
  mood: string;
  keywords: string[];
  colors: [string, string];
}

export const SCENT_PERFUMES: Record<string, ScentPerfume> = {
  petal: {
    name: '페탈 레터',
    en: 'Petal Letter',
    family: '파우더리 플로럴',
    emoji: '🌸',
    profile: { floral: 92, citrus: 30, fresh: 28, woody: 30, musk: 70, amber: 32 },
    notes: { top: ['핑크 페퍼', '리치'], middle: ['불가리안 로즈', '피오니'], base: ['화이트 머스크', '캐시미어 우드'] },
    mood: '손편지에 스민 꽃잎처럼 다정하고 포근한 향이에요.',
    keywords: ['다정한', '로맨틱', '포근한'],
    colors: ['#fbcfe8', '#db2777'],
  },
  sunshine: {
    name: '선샤인 포스트카드',
    en: 'Sunshine Postcard',
    family: '시트러스 콜로뉴',
    emoji: '🍊',
    profile: { floral: 42, citrus: 95, fresh: 55, woody: 30, musk: 28, amber: 18 },
    notes: { top: ['유자', '베르가못', '만다린'], middle: ['네롤리', '오렌지 블라썸'], base: ['베티버', '앰버그리스'] },
    mood: '여름 오후의 햇살을 엽서에 담은 듯 밝고 경쾌한 향이에요.',
    keywords: ['경쾌한', '에너지', '산뜻한'],
    colors: ['#fef08a', '#ea580c'],
  },
  forest: {
    name: '포레스트 애프터 레인',
    en: 'Forest After Rain',
    family: '그린 우디',
    emoji: '🌿',
    profile: { floral: 20, citrus: 35, fresh: 90, woody: 72, musk: 30, amber: 15 },
    notes: { top: ['갈바넘', '바이올렛 잎'], middle: ['무화과 잎', '이끼'], base: ['시더우드', '베티버'] },
    mood: '비 갠 숲길의 젖은 흙과 초록 잎사귀처럼 맑고 차분한 향이에요.',
    keywords: ['차분한', '내추럴', '맑은'],
    colors: ['#bbf7d0', '#15803d'],
  },
  library: {
    name: '라이브러리 누아',
    en: 'Library Noir',
    family: '스모키 우디',
    emoji: '📖',
    profile: { floral: 15, citrus: 18, fresh: 20, woody: 94, musk: 45, amber: 62 },
    notes: { top: ['카다멈', '핑크 페퍼'], middle: ['파피루스', '레더'], base: ['샌달우드', '통카빈'] },
    mood: '오래된 책장과 가죽 소파가 있는 서재처럼 지적이고 깊은 향이에요.',
    keywords: ['지적인', '깊은', '클래식'],
    colors: ['#e7d3b0', '#78350f'],
  },
  bluehour: {
    name: '블루 아워',
    en: 'Blue Hour',
    family: '아쿠아 머스크',
    emoji: '🌊',
    profile: { floral: 35, citrus: 55, fresh: 88, woody: 38, musk: 60, amber: 12 },
    notes: { top: ['씨솔트', '라임'], middle: ['워터 릴리', '로즈마리'], base: ['앰브레트', '드리프트우드'] },
    mood: '해 질 녘 바닷바람처럼 시원하면서도 여운이 긴 향이에요.',
    keywords: ['자유로운', '시원한', '청량한'],
    colors: ['#bae6fd', '#1d4ed8'],
  },
  velvet: {
    name: '벨벳 미드나잇',
    en: 'Velvet Midnight',
    family: '앰버 구르망',
    emoji: '🕯️',
    profile: { floral: 40, citrus: 15, fresh: 10, woody: 52, musk: 55, amber: 96 },
    notes: { top: ['블랙커런트', '사프란'], middle: ['튜베로즈', '자스민'], base: ['바닐라', '앰버', '통카빈'] },
    mood: '재즈 바의 촛불처럼 관능적이고 달콤한 밤의 향이에요.',
    keywords: ['관능적인', '달콤한', '매혹적인'],
    colors: ['#fda4af', '#7f1d1d'],
  },
  cotton: {
    name: '코튼 클라우드',
    en: 'Cotton Cloud',
    family: '클린 머스크',
    emoji: '☁️',
    profile: { floral: 50, citrus: 30, fresh: 48, woody: 22, musk: 95, amber: 28 },
    notes: { top: ['알데하이드', '배'], middle: ['코튼 플라워', '아이리스'], base: ['화이트 머스크', '앰브레트'] },
    mood: '갓 세탁한 이불처럼 깨끗하고 포근한 살냄새 향이에요.',
    keywords: ['깨끗한', '포근한', '편안한'],
    colors: ['#e2e8f0', '#6366f1'],
  },
};

/** /api/demo-ai/scent-soulmate 응답 — 방문객만을 위한 향수를 새로 조향한다 */
export interface AiScentSoulmate {
  name: string;
  en: string;
  family: string;
  emoji: string;
  notes: { top: string[]; middle: string[]; base: string[] };
  mood: string;
  keywords: string[];
  /** 병 색 [밝은 색, 진한 색] #RRGGBB */
  colors: [string, string];
  scentType: string;
  /** 80~98 */
  matchRate: number;
  /** 레이어링 추천 — SCENT_PERFUMES 키 */
  layering: string;
  /** 70~92, matchRate보다 낮게 */
  layeringRate: number;
}
