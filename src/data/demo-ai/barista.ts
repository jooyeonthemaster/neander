/* AI 바리스타 매칭 — 데모 화면과 생성 API가 함께 쓰는 선택지·원두 데이터·결과 타입 */

export const BARISTA_HABITS = [
  { id: 'espresso', emoji: '☕', label: '에스프레소', desc: '진하고 짧게' },
  { id: 'americano', emoji: '🥤', label: '아메리카노', desc: '깔끔하게 매일' },
  { id: 'latte', emoji: '🥛', label: '라떼', desc: '우유와 부드럽게' },
  { id: 'drip', emoji: '🫖', label: '핸드드립', desc: '향을 음미하며' },
  { id: 'coldbrew', emoji: '🧊', label: '콜드브루', desc: '차갑고 부드럽게' },
  { id: 'sweet', emoji: '🍯', label: '달달한 커피', desc: '시럽·바닐라 추가' },
] as const;
export type BaristaHabitId = (typeof BARISTA_HABITS)[number]['id'];

export const BARISTA_TASTE_SLIDERS = [
  { id: 'acid', emoji: '🍋', label: '산미', left: '부드럽게', right: '새콤하게' },
  { id: 'bitter', emoji: '🌑', label: '쓴맛', left: '연하게', right: '진하게' },
  { id: 'nutty', emoji: '🥜', label: '고소함', left: '은은하게', right: '듬뿍' },
  { id: 'sweet', emoji: '🍯', label: '단맛', left: '드라이하게', right: '달콤하게' },
  { id: 'body', emoji: '🥛', label: '바디', left: '가볍게', right: '묵직하게' },
] as const;

export const BARISTA_AROMAS = [
  { id: 'fruit', emoji: '🍓', label: '과일', desc: '베리·시트러스' },
  { id: 'floral', emoji: '🌸', label: '꽃', desc: '자스민·베르가못' },
  { id: 'chocolate', emoji: '🍫', label: '초콜릿', desc: '카카오·캐러멜' },
  { id: 'nutty', emoji: '🌰', label: '견과', desc: '아몬드·헤이즐넛' },
] as const;
export type BaristaAromaId = (typeof BARISTA_AROMAS)[number]['id'];

/* ── 원두 (실제 산지 정보 — AI는 이 중에서 고른다) ─────── */

export type BaristaTaste = { acid: number; bitter: number; nutty: number; sweet: number; body: number };

export interface BaristaBean {
  name: string;
  flag: string;
  region: string;
  process: string;
  altitude: string;
  profile: BaristaTaste;
  aroma: BaristaAromaId;
  notes: string[];
  /** 0(라이트) ~ 7(이탈리안) */
  roast: number;
  story: string;
}

export const BARISTA_BEANS: Record<string, BaristaBean> = {
  yirgacheffe: {
    name: '에티오피아 예가체프',
    flag: '🇪🇹',
    region: '에티오피아 · 게데오',
    process: '워시드',
    altitude: '1,800–2,200m',
    profile: { acid: 85, bitter: 20, nutty: 20, sweet: 60, body: 30 },
    aroma: 'floral',
    notes: ['자스민', '레몬', '홍차'],
    roast: 1,
    story: '커피의 고향 에티오피아의 고지대에서 자라, 꽃향기와 레몬 같은 산뜻한 산미가 돋보여요.',
  },
  kenya: {
    name: '케냐 AA',
    flag: '🇰🇪',
    region: '케냐 · 니에리',
    process: '워시드',
    altitude: '1,500–2,100m',
    profile: { acid: 90, bitter: 30, nutty: 15, sweet: 55, body: 55 },
    aroma: 'fruit',
    notes: ['블랙커런트', '자몽', '와인'],
    roast: 2,
    story: '큰 생두 등급(AA)의 케냐 원두로, 베리류의 선명한 산미와 주스 같은 질감이 매력이에요.',
  },
  geisha: {
    name: '파나마 게이샤',
    flag: '🇵🇦',
    region: '파나마 · 보케테',
    process: '워시드',
    altitude: '1,600–1,800m',
    profile: { acid: 75, bitter: 10, nutty: 10, sweet: 75, body: 25 },
    aroma: 'floral',
    notes: ['베르가못', '자스민', '복숭아'],
    roast: 0,
    story: '홍차처럼 섬세한 질감과 화려한 꽃향으로 스페셜티 대회에서 사랑받는 품종이에요.',
  },
  colombia: {
    name: '콜롬비아 수프리모',
    flag: '🇨🇴',
    region: '콜롬비아 · 우일라',
    process: '워시드',
    altitude: '1,500–1,900m',
    profile: { acid: 55, bitter: 45, nutty: 55, sweet: 60, body: 55 },
    aroma: 'chocolate',
    notes: ['캐러멜', '밀크초콜릿', '사과'],
    roast: 3,
    story: '산미·단맛·바디가 고르게 균형 잡힌, 누구에게나 편안한 클래식 원두예요.',
  },
  costarica: {
    name: '코스타리카 따라주',
    flag: '🇨🇷',
    region: '코스타리카 · 따라주',
    process: '허니',
    altitude: '1,200–1,900m',
    profile: { acid: 60, bitter: 30, nutty: 40, sweet: 80, body: 45 },
    aroma: 'fruit',
    notes: ['꿀', '살구', '흑설탕'],
    roast: 3,
    story: '과육을 일부 남긴 채 말리는 허니 가공 덕분에 꿀 같은 단맛이 은은하게 올라와요.',
  },
  brazil: {
    name: '브라질 산토스',
    flag: '🇧🇷',
    region: '브라질 · 미나스제라이스',
    process: '내추럴',
    altitude: '800–1,300m',
    profile: { acid: 25, bitter: 50, nutty: 85, sweet: 55, body: 60 },
    aroma: 'nutty',
    notes: ['땅콩', '헤이즐넛', '코코아'],
    roast: 4,
    story: '산미가 적고 고소한 견과 향이 풍부해서 블렌딩의 베이스로 가장 많이 쓰여요.',
  },
  guatemala: {
    name: '과테말라 안티구아',
    flag: '🇬🇹',
    region: '과테말라 · 안티구아',
    process: '워시드',
    altitude: '1,500–1,700m',
    profile: { acid: 45, bitter: 65, nutty: 50, sweet: 45, body: 75 },
    aroma: 'chocolate',
    notes: ['다크초콜릿', '스모키', '오렌지 필'],
    roast: 5,
    story: '화산 토양에서 자라 스모키한 향과 묵직한 초콜릿 풍미가 특징이에요.',
  },
  mandheling: {
    name: '인도네시아 만델링',
    flag: '🇮🇩',
    region: '인도네시아 · 수마트라',
    process: '습식 탈곡',
    altitude: '1,100–1,500m',
    profile: { acid: 15, bitter: 80, nutty: 45, sweet: 35, body: 95 },
    aroma: 'chocolate',
    notes: ['허브', '흙내음', '다크초콜릿'],
    roast: 6,
    story: '낮은 산미와 진하고 묵직한 바디감으로 강배전 커피 애호가들이 즐겨 찾는 원두예요.',
  },
};

export const BARISTA_ROASTS = [
  { name: '라이트', color: '#c8a27a' },
  { name: '시나몬', color: '#b07d4f' },
  { name: '미디엄', color: '#95633a' },
  { name: '하이', color: '#7a4b2a' },
  { name: '시티', color: '#5f3920' },
  { name: '풀시티', color: '#482a17' },
  { name: '프렌치', color: '#331d10' },
  { name: '이탈리안', color: '#20120a' },
];

/** 추출 방식 — 레시피 수치는 데모가 방식·로스팅으로 계산한다 */
export const BARISTA_BREWS = ['pourover', 'frenchpress', 'espresso', 'latte', 'coldbrew'] as const;
export type BaristaBrewId = (typeof BARISTA_BREWS)[number];

/** An available tool wins over a drinking habit; a machine can also make a latte. */
export function resolveBaristaBrew(tool: string | undefined, habit: string | undefined, fallback: BaristaBrewId): BaristaBrewId {
  if (tool === 'dripper') return 'pourover';
  if (tool === 'immersion') return 'frenchpress';
  if (tool === 'espresso') return habit === 'latte' || habit === 'sweet' ? 'latte' : 'espresso';
  return fallback;
}

export const BARISTA_SERVING: Record<BaristaBrewId, { cup: string; tip: string }> = {
  pourover: { cup: '250–300ml 머그 또는 향미 잔', tip: '추출한 커피를 250–300ml 머그나 향미 잔에 담고, 조금 식혀 향의 변화를 즐겨요.' },
  frenchpress: { cup: '300ml 머그', tip: '추출이 끝나면 300ml 머그로 옮겨 원두와 커피를 분리하고 천천히 즐겨요.' },
  espresso: { cup: '60–90ml 데미타세 잔', tip: '미리 데운 60–90ml 데미타세 잔에 담아 크레마와 향이 살아 있을 때 즐겨요.' },
  latte: { cup: '250–300ml 라떼 잔', tip: '에스프레소와 스팀 밀크를 250–300ml 라떼 잔에 담아 고르게 섞어 즐겨요.' },
  coldbrew: { cup: '300–350ml 유리잔', tip: '원액은 취향에 맞게 물로 희석해 얼음을 넣은 300–350ml 유리잔에 담아요.' },
};

/** The serving sentence is deterministic, so a model tip cannot contradict the recipe. */
export function baristaServing(brew: BaristaBrewId, temperature?: string) {
  if (temperature === 'iced' && brew !== 'espresso' && brew !== 'coldbrew') {
    return { cup: '300–350ml 유리잔', tip: brew === 'pourover'
      ? '얼음을 담은 300–350ml 유리잔을 사용해요. 레시피에 적힌 물과 얼음의 총량을 지켜 주세요.'
      : '추출한 커피를 얼음이 든 300–350ml 유리잔에 담아 시원하게 즐겨요.' };
  }
  return BARISTA_SERVING[brew];
}

/** /api/demo-ai/barista-matching 응답 */
export interface AiBaristaMatch {
  /** BARISTA_BEANS 키 */
  bean: string;
  /** 0(라이트) ~ 7(이탈리안) */
  roast: number;
  brew: BaristaBrewId;
  persona: { emoji: string; name: string; desc: string };
  /** 72~98 */
  matchRate: number;
  /** 이 원두가 방문객에게 맞는 이유 */
  story: string;
  /** 마시는 팁 한 줄 */
  tip: string;
}
