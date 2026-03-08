/* ─────────────────────────────────────────────────────────
   A C'SCENT  |  16 Olfactory Cognition Types
   4-axis system: I/O × B/G × L/S × C/W = 16 types
   ───────────────────────────────────────────────────────── */

export interface AcscentType {
  code: string;
  name: string;
  nameEn: string;
  weatherName: string;
  tagline: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  recommendedFamilies: string[];
  color: string;
  gradientFrom: string;
  gradientTo: string;
  imagePath: string;
}

export interface TestFragrance {
  id: number;
  name: string;
  nameKo: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  notes: { top: string[]; middle: string[]; base: string[] };
  questions: TestQuestion[];
}

export interface TestQuestion {
  text: string;
  subtitle?: string;
  type: 'cards' | 'spectrum' | 'note-select';
  axes: ('IO' | 'BG' | 'LS' | 'CW')[]; // which axes this question measures
  options?: TestOption[];
  noteOptions?: NoteOption[];
  sliderLabels?: [string, string];
}

export interface TestOption {
  label: string;
  emoji: string;
  description: string;
  scores: Partial<Record<'IO' | 'BG' | 'LS' | 'CW', number>>; // multi-axis scoring
}

export interface NoteOption {
  label: string;
  category: 'concrete' | 'abstract'; // concrete = specific ingredient, abstract = sensory impression
}

export const AXIS_LABELS = {
  IO: { negative: 'Introspective', positive: 'Outward', negKo: '내향 인지', posKo: '외향 인지' },
  BG: { negative: 'Bold', positive: 'Gentle', negKo: '대담한 감각', posKo: '섬세한 감각' },
  LS: { negative: 'Linear', positive: 'Synesthetic', negKo: '선형적 분석', posKo: '공감각적 인지' },
  CW: { negative: 'Cool', positive: 'Warm', negKo: '쿨 지향', posKo: '웜 지향' },
} as const;

export const ACSCENT_TYPES: AcscentType[] = [
  {
    code: 'IBLC',
    name: '분석적 탐험가',
    nameEn: 'Analytical Explorer',
    weatherName: '서리 맺힌 새벽',
    tagline: '향의 구조를 꿰뚫어 보는 냉철한 감별사',
    description: '당신은 향을 맡는 순간 각 원료를 분리해서 인지하는 놀라운 분석력을 가지고 있습니다. 강렬한 향도 두려워하지 않으며, 차갑고 선명한 노트를 선호합니다. 향수의 구조를 마치 건축물처럼 해체하고 이해하는 것이 당신만의 방식입니다.',
    characteristics: ['원료 하나하나를 분리해서 인지', '복잡한 향 구조를 논리적으로 분석', '시트러스·허벌 계열의 쿨톤 선호'],
    strengths: ['향의 품질과 구성을 정확히 판별', '새로운 향에 대한 적응이 빠름', '향수 추천 시 구체적 근거 제시 가능'],
    recommendedFamilies: ['시트러스', '아로마틱', '푸제르'],
    color: '#0EA5E9',
    gradientFrom: '#0EA5E9',
    gradientTo: '#06B6D4',
    imagePath: '/acscent/weather-profile-IBLC.png',
  },
  {
    code: 'IBLW',
    name: '깊은 관조자',
    nameEn: 'Deep Contemplator',
    weatherName: '깊은 안개 숲',
    tagline: '향 속에서 깊은 사유의 세계를 발견하는 사색가',
    description: '당신은 진한 향 속에서 명상적 깊이를 발견합니다. 따뜻한 우디·앰버 노트에서 편안함을 느끼며, 향의 시간적 변화를 세밀하게 추적합니다. 한 가지 향에 오래 머물며 그 안의 이야기를 읽어내는 유형입니다.',
    characteristics: ['향의 시간적 변화를 세밀하게 추적', '따뜻한 베이스 노트에 깊이 몰입', '향 하나에 오래 머물며 사유'],
    strengths: ['향의 잔향과 지속력을 정확히 평가', '복잡한 오리엔탈 계열 향수 이해', '향수의 감성적 깊이를 파악'],
    recommendedFamilies: ['우디', '오리엔탈', '앰버'],
    color: '#92400E',
    gradientFrom: '#92400E',
    gradientTo: '#B45309',
    imagePath: '/acscent/weather-profile-IBLW.png',
  },
  {
    code: 'IBSC',
    name: '감각적 사색가',
    nameEn: 'Sensory Philosopher',
    weatherName: '오로라 밤하늘',
    tagline: '향을 색과 형태로 번역하는 내면의 예술가',
    description: '당신은 향을 맡으면 색과 질감이 동시에 떠오르는 공감각적 인지를 가지고 있습니다. 강렬한 향에서 내면의 비전을 발견하며, 차가운 톤의 향에서 독특한 이미지를 그려냅니다. 향수는 당신에게 하나의 예술 작품입니다.',
    characteristics: ['향에서 색과 이미지가 자동 연상', '강렬한 향에서 예술적 영감 발견', '쿨톤 향에서 독창적 이미지 생성'],
    strengths: ['향의 분위기를 시각적으로 표현', '니치 향수의 예술성을 깊이 감상', '향수를 감성적 언어로 묘사'],
    recommendedFamilies: ['아쿠아틱', '그린', '아로마틱'],
    color: '#7C3AED',
    gradientFrom: '#7C3AED',
    gradientTo: '#2DD4BF',
    imagePath: '/acscent/weather-profile-IBSC.png',
  },
  {
    code: 'IBSW',
    name: '내면의 연금술사',
    nameEn: 'Inner Alchemist',
    weatherName: '화산 근처 온천',
    tagline: '향의 깊은 울림에서 감정의 연금술을 완성하는 자',
    description: '당신은 향에서 가장 깊은 감정적 울림을 경험하는 유형입니다. 따뜻하고 강렬한 오리엔탈 노트에서 색채와 질감, 온도를 동시에 느끼며, 이를 풍부한 내면의 세계로 변환합니다. 향수는 당신의 감정 언어입니다.',
    characteristics: ['향에서 가장 강렬한 감정적 반응', '따뜻한 향에서 색·질감·온도 동시 인지', '향수를 통한 깊은 감정 탐험'],
    strengths: ['오리엔탈·스파이시 향의 뉘앙스 포착', '향수의 감정적 스토리텔링 능력', '향의 온도감을 섬세하게 구분'],
    recommendedFamilies: ['오리엔탈', '스파이시', '앰버'],
    color: '#DC2626',
    gradientFrom: '#DC2626',
    gradientTo: '#F59E0B',
    imagePath: '/acscent/weather-profile-IBSW (1).png',
  },
  {
    code: 'IGLC',
    name: '조용한 감별사',
    nameEn: 'Quiet Connoisseur',
    weatherName: '눈 위의 달빛',
    tagline: '고요함 속에서 향의 미세한 차이를 간파하는 감별사',
    description: '당신은 섬세한 후각으로 다른 사람들이 놓치는 미묘한 차이를 포착합니다. 가볍고 차가운 프레시 계열을 선호하며, 향의 순수한 원료 퀄리티를 정확히 판별합니다. 조용하지만 누구보다 정확한 후각의 소유자입니다.',
    characteristics: ['미세한 향의 차이를 정확히 구분', '가볍고 순수한 프레시 계열 선호', '원료의 품질을 본능적으로 감별'],
    strengths: ['원료 퀄리티 판별 능력 탁월', '은은한 향의 섬세한 변화 추적', '프레시 계열 향수 추천에 강점'],
    recommendedFamilies: ['프레시', '뮤스크', '플로럴 라이트'],
    color: '#94A3B8',
    gradientFrom: '#94A3B8',
    gradientTo: '#CBD5E1',
    imagePath: '/acscent/weather-profile-IGLC.png',
  },
  {
    code: 'IGLW',
    name: '섬세한 기억가',
    nameEn: 'Delicate Memorist',
    weatherName: '따뜻한 봄비',
    tagline: '향 하나에 수천 개의 기억을 간직한 감성의 아카이브',
    description: '당신은 향을 맡으면 구체적인 기억과 장면이 자연스럽게 떠오릅니다. 은은한 따뜻함 속에서 과거의 순간들을 선명하게 재현하며, 향수를 통해 시간을 여행합니다. 향은 당신에게 가장 강력한 기억의 매개체입니다.',
    characteristics: ['향에서 구체적 기억이 자동 연상', '은은한 따뜻한 향에서 편안함', '향수를 통한 시간 여행 경험'],
    strengths: ['향의 감성적 스토리 파악', '바닐라·머스크 계열의 미세 차이 구분', '향수의 추억 연결 능력'],
    recommendedFamilies: ['소프트 플로럴', '바닐라', '파우더리'],
    color: '#F9A8D4',
    gradientFrom: '#F9A8D4',
    gradientTo: '#FDE68A',
    imagePath: '/acscent/weather-profile-IGLW.png',
  },
  {
    code: 'IGSC',
    name: '꿈꾸는 조향사',
    nameEn: 'Dreaming Perfumer',
    weatherName: '이슬 맺힌 초원',
    tagline: '향의 세계에서 가장 섬세한 색채를 보는 몽상가',
    description: '당신은 가벼운 향에서도 풍부한 색채와 이미지를 경험합니다. 쿨톤의 섬세한 향에서 꿈같은 풍경을 그려내며, 향수를 하나의 감각적 예술로 경험합니다. 당신의 후각 세계는 파스텔 수채화처럼 아름답습니다.',
    characteristics: ['가벼운 향에서 풍부한 이미지 경험', '파스텔 톤의 쿨한 향 선호', '향수를 감각적 예술로 인식'],
    strengths: ['플로럴 계열의 미묘한 뉘앙스 포착', '향의 분위기를 감성적으로 전달', '라이트 향수의 레이어링 감각'],
    recommendedFamilies: ['플로럴', '그린', '아쿠아틱 라이트'],
    color: '#A7F3D0',
    gradientFrom: '#A7F3D0',
    gradientTo: '#BAE6FD',
    imagePath: '/acscent/weather-profile-IGSC.jpg',
  },
  {
    code: 'IGSW',
    name: '고요한 감성가',
    nameEn: 'Serene Empath',
    weatherName: '저녁노을 구름',
    tagline: '향의 따뜻함 속에서 평온한 감성의 바다를 항해하는 자',
    description: '당신은 따뜻하고 부드러운 향에서 깊은 평온함과 감성적 풍요를 경험합니다. 향에서 색과 감정이 부드럽게 어우러지며, 이를 통해 내면의 안식처를 발견합니다. 당신에게 향수는 마음의 쉼터입니다.',
    characteristics: ['따뜻한 향에서 깊은 평온함 경험', '부드러운 공감각적 인지', '향수를 감정적 안식처로 활용'],
    strengths: ['향의 편안함 레벨을 정확히 파악', '소프트 오리엔탈 계열 감상 능력', '향수의 힐링 효과를 최대화'],
    recommendedFamilies: ['소프트 오리엔탈', '바닐라', '머스크'],
    color: '#FBBF24',
    gradientFrom: '#FDE68A',
    gradientTo: '#FBBF24',
    imagePath: '/acscent/weather-profile-IGSW.png',
  },
  {
    code: 'OBLC',
    name: '대담한 비평가',
    nameEn: 'Bold Critic',
    weatherName: '찬 바람의 절벽',
    tagline: '향의 세계에 날카로운 기준을 제시하는 당당한 비평가',
    description: '당신은 향에 대한 명확한 기준을 가지고 있으며, 이를 거침없이 표현합니다. 강렬하고 시원한 향을 선호하며, 향의 품질에 대한 높은 안목으로 주변에 영향력을 행사합니다. 당신의 향수 추천은 신뢰를 받습니다.',
    characteristics: ['향에 대한 명확한 호불호', '시원하고 강렬한 향 선호', '향수 품평에 자신감 있는 표현'],
    strengths: ['향수 추천 시 설득력 높은 리뷰', '프레시·시트러스 계열의 정확한 평가', '향수 트렌드를 빠르게 파악'],
    recommendedFamilies: ['시트러스', '푸제르', '아로마틱'],
    color: '#0284C7',
    gradientFrom: '#0284C7',
    gradientTo: '#38BDF8',
    imagePath: '/acscent/weather-profile-OBLC.png',
  },
  {
    code: 'OBLW',
    name: '열정적 안내자',
    nameEn: 'Passionate Guide',
    weatherName: '사막의 열풍',
    tagline: '따뜻한 열정으로 향의 매력을 전파하는 안내자',
    description: '당신은 따뜻하고 깊은 향의 매력에 빠져 이를 주변에 열정적으로 전파합니다. 우디·앰버 계열의 풍부한 향을 논리적으로 분석하면서도 그 감동을 생생하게 전달합니다. 당신은 타고난 향수 앰배서더입니다.',
    characteristics: ['향의 매력을 열정적으로 전달', '따뜻한 우디·앰버 계열 전문', '분석과 감동을 동시에 전달'],
    strengths: ['향수 추천의 설득력과 열정', '우디 계열의 체계적 비교 능력', '향수 커뮤니티에서의 영향력'],
    recommendedFamilies: ['우디', '앰버', '레더'],
    color: '#EA580C',
    gradientFrom: '#EA580C',
    gradientTo: '#F97316',
    imagePath: '/acscent/weather-profile-OBLW.png',
  },
  {
    code: 'OBSC',
    name: '표현적 예술가',
    nameEn: 'Expressive Artist',
    weatherName: '번개 치는 밤',
    tagline: '향을 드라마틱한 예술로 승화시키는 표현의 마에스트로',
    description: '당신은 향에서 받은 강렬한 공감각적 인상을 극적으로 표현합니다. 시원하고 파워풀한 향에서 색채와 이미지의 폭발을 경험하며, 이를 독창적인 언어로 전환합니다. 당신의 향수 리뷰는 하나의 예술 작품입니다.',
    characteristics: ['향의 인상을 극적으로 표현', '쿨톤 파워풀 향에서 이미지 폭발', '독창적 향수 표현 언어'],
    strengths: ['향수 리뷰의 예술적 표현력', '니치 향수의 개성을 포착', '향수의 시각적 브랜딩 감각'],
    recommendedFamilies: ['아쿠아틱', '그린 시프레', '아로마틱'],
    color: '#6366F1',
    gradientFrom: '#6366F1',
    gradientTo: '#22D3EE',
    imagePath: '/acscent/weather-profile-OBSC.png',
  },
  {
    code: 'OBSW',
    name: '카리스마 소믈리에',
    nameEn: 'Charismatic Sommelier',
    weatherName: '열대 우림 스콜',
    tagline: '향의 모든 감각을 지배하는 카리스마의 소유자',
    description: '당신은 향에서 가장 풍부하고 다층적인 감각 경험을 하며, 이를 압도적인 카리스마로 전달합니다. 따뜻하고 강렬한 향에서 색·소리·질감을 동시에 경험하는 최고 수준의 공감각자입니다.',
    characteristics: ['가장 풍부한 다층적 감각 경험', '따뜻한 강렬함에서 모든 감각 동시 활성', '압도적 카리스마의 향수 전문가'],
    strengths: ['모든 향수 패밀리의 깊이 있는 감상', '향수 소믈리에급 전문 감별', '향수의 전체적 경험을 총체적으로 전달'],
    recommendedFamilies: ['오리엔탈', '스파이시', '우디 오리엔탈'],
    color: '#E11D48',
    gradientFrom: '#E11D48',
    gradientTo: '#F59E0B',
    imagePath: '/acscent/weather-profile-OBSW.png',
  },
  {
    code: 'OGLC',
    name: '친밀한 큐레이터',
    nameEn: 'Intimate Curator',
    weatherName: '맑은 가을 하늘',
    tagline: '맑은 감각으로 최적의 향을 큐레이션하는 안목의 소유자',
    description: '당신은 가볍고 시원한 향에서 편안함을 느끼며, 이를 주변 사람들과 나누는 것을 즐깁니다. 섬세하면서도 논리적인 접근으로 상대방에게 딱 맞는 향수를 추천하는 타고난 큐레이터입니다.',
    characteristics: ['라이트·쿨톤 향수 큐레이션 전문', '상대방 취향을 빠르게 파악', '섬세하면서도 논리적 추천'],
    strengths: ['맞춤형 향수 추천 능력', '프레시 계열의 섬세한 차이 구분', '향수 선물 큐레이션의 달인'],
    recommendedFamilies: ['프레시', '시트러스', '라이트 플로럴'],
    color: '#0D9488',
    gradientFrom: '#0D9488',
    gradientTo: '#67E8F9',
    imagePath: '/acscent/weather-profile-OGLC.png',
  },
  {
    code: 'OGLW',
    name: '따뜻한 이야기꾼',
    nameEn: 'Warm Storyteller',
    weatherName: '벽난로 옆 눈오는 밤',
    tagline: '향에서 이야기를 발견하고 따뜻하게 전해주는 스토리텔러',
    description: '당신은 따뜻한 향에서 아름다운 이야기를 발견하고, 이를 주변 사람들과 다정하게 나눕니다. 바닐라·머스크의 부드러운 따뜻함을 논리적으로 분석하면서도 감성적 스토리로 전환하는 특별한 재능을 가지고 있습니다.',
    characteristics: ['향에서 이야기를 발견하고 전달', '따뜻한 바닐라·머스크 전문', '분석적이면서도 감성적 스토리텔링'],
    strengths: ['향수의 스토리텔링 능력', '따뜻한 계열 향수의 미세 비교', '향수를 통한 감성 소통'],
    recommendedFamilies: ['구르망', '바닐라', '소프트 우디'],
    color: '#D97706',
    gradientFrom: '#D97706',
    gradientTo: '#FCD34D',
    imagePath: '/acscent/weather-profile-OGLW.png',
  },
  {
    code: 'OGSC',
    name: '자유로운 시인',
    nameEn: 'Free Poet',
    weatherName: '바다 위 무지개',
    tagline: '향의 세계를 자유롭게 유영하며 시를 쓰는 낭만가',
    description: '당신은 가볍고 시원한 향에서 무한한 상상력을 발휘합니다. 향에서 느끼는 색과 이미지를 시적인 언어로 변환하며, 이를 자유롭게 공유합니다. 당신에게 향수는 영감의 원천이자 자유로운 표현의 매개체입니다.',
    characteristics: ['향에서 시적 영감 발현', '프레시 쿨톤에서 무한 상상력', '자유롭고 독창적인 향수 표현'],
    strengths: ['향수의 감성적 언어화 능력', '라이트 향수의 숨겨진 매력 발견', '향수 커뮤니티의 인기 리뷰어'],
    recommendedFamilies: ['아쿠아틱', '그린', '플로럴 프레시'],
    color: '#06B6D4',
    gradientFrom: '#06B6D4',
    gradientTo: '#A78BFA',
    imagePath: '/acscent/weather-profile-OGSC.png',
  },
  {
    code: 'OGSW',
    name: '감성적 공유자',
    nameEn: 'Emotional Sharer',
    weatherName: '석양의 꽃밭',
    tagline: '향에서 발견한 따뜻한 감동을 세상과 나누는 공유자',
    description: '당신은 따뜻하고 부드러운 향에서 풍부한 감정을 경험하고, 이 감동을 주변과 나누는 것에 큰 기쁨을 느낍니다. 향에서 색과 감정이 자연스럽게 어우러지며, 당신의 향수 이야기는 사람들의 마음을 따뜻하게 합니다.',
    characteristics: ['향의 감동을 따뜻하게 공유', '소프트 웜톤에서 풍부한 감정', '향에서 색과 감정의 자연스러운 융합'],
    strengths: ['향수의 감성적 가치 전달 능력', '플로럴·구르망 계열의 매력 발견', '향수를 통한 감성적 유대 형성'],
    recommendedFamilies: ['플로럴', '구르망', '소프트 오리엔탈'],
    color: '#F472B6',
    gradientFrom: '#F472B6',
    gradientTo: '#FBBF24',
    imagePath: '/acscent/weather-profile-OGSW.png',
  },
];

/* ─────────────────────────────────────────────────────────
   6 Test Fragrances — Unified 4-question structure
   Each fragrance: note-select(BG+LS) → cards(IO) → intensity(BG) → temperature(CW)
   ───────────────────────────────────────────────────────── */

/** Identical IO card options used across ALL 6 fragrances for consistency */
const COMMON_IO_OPTIONS: TestOption[] = [
  { label: '향의 구조를 분석하게 됨', emoji: '🔬', description: '각 노트를 분리해서 어떤 원료인지 파악하려 한다', scores: { IO: -2 } },
  { label: '내면의 기억이 떠오름', emoji: '💭', description: '개인적인 기억이나 장면이 자연스럽게 연상된다', scores: { IO: -1 } },
  { label: '느낌을 표현하고 싶어짐', emoji: '💬', description: '이 향에 대한 감상을 누군가에게 말하고 싶어진다', scores: { IO: 1 } },
  { label: '감각적 이미지가 밀려옴', emoji: '🎨', description: '색, 질감, 소리 등 다른 감각이 함께 느껴진다', scores: { IO: 2 } },
];

/** Builds the unified 4-question set for a fragrance (only noteOptions differ) */
function buildQuestions(noteOptions: NoteOption[]): TestQuestion[] {
  return [
    {
      text: '이 향에서 감지되는 것들을 모두 선택해주세요',
      subtitle: '느껴지는 대로 자유롭게 선택하세요. 정답은 없습니다.',
      type: 'note-select',
      axes: ['BG', 'LS'],
      noteOptions,
    },
    {
      text: '이 향을 맡을 때, 가장 먼저 일어나는 반응은?',
      subtitle: '가장 자연스럽게 떠오르는 것을 선택하세요',
      type: 'cards',
      axes: ['IO'],
      options: COMMON_IO_OPTIONS,
    },
    {
      text: '이 향의 전체적 강도는 어떻게 느껴지나요?',
      type: 'spectrum',
      axes: ['BG'],
      sliderLabels: ['거의 느끼지 못함', '매우 강렬하게 느낌'],
    },
    {
      text: '이 향에서 느껴지는 온도감은?',
      type: 'spectrum',
      axes: ['CW'],
      sliderLabels: ['매우 차갑게 느껴짐', '매우 따뜻하게 느껴짐'],
    },
  ];
}

export const TEST_FRAGRANCES: TestFragrance[] = [
  {
    id: 1, name: 'Aurora Mist', nameKo: '오로라 미스트',
    description: '이슬 맺힌 아침 빛의 속삭임',
    gradientFrom: '#BAE6FD', gradientTo: '#C4B5FD', icon: '🌅',
    notes: { top: ['베르가못', '핑크페퍼'], middle: ['아이리스', '바이올렛 리프'], base: ['화이트 머스크', '시더우드'] },
    questions: buildQuestions([
      { label: '새콤한 레몬향', category: 'concrete' },
      { label: '톡 쏘는 후추향', category: 'concrete' },
      { label: '화장품 같은 분향', category: 'concrete' },
      { label: '나무 껍질향', category: 'concrete' },
      { label: '시원함', category: 'abstract' },
      { label: '상쾌함', category: 'abstract' },
      { label: '가벼움', category: 'abstract' },
      { label: '깨끗함', category: 'abstract' },
    ]),
  },
  {
    id: 2, name: 'Midnight Ember', nameKo: '미드나잇 엠버',
    description: '벨벳 방 안 촛불의 깊은 매력',
    gradientFrom: '#7C2D12', gradientTo: '#44403C', icon: '🕯️',
    notes: { top: ['블랙페퍼', '카다멈'], middle: ['우드', '로즈 앱솔루트'], base: ['앰버', '샌달우드'] },
    questions: buildQuestions([
      { label: '매콤한 후추향', category: 'concrete' },
      { label: '알싸한 생강향', category: 'concrete' },
      { label: '진한 장미향', category: 'concrete' },
      { label: '부드러운 나무향', category: 'concrete' },
      { label: '따뜻함', category: 'abstract' },
      { label: '무거움', category: 'abstract' },
      { label: '씁쓸함', category: 'abstract' },
      { label: '포근함', category: 'abstract' },
    ]),
  },
  {
    id: 3, name: 'Citrus Wave', nameKo: '시트러스 웨이브',
    description: '태양 아래 파도치는 활력의 에너지',
    gradientFrom: '#FDE68A', gradientTo: '#6EE7B7', icon: '🌊',
    notes: { top: ['유자', '자몽'], middle: ['네롤리', '그린티'], base: ['화이트 시더', '씨솔트'] },
    questions: buildQuestions([
      { label: '새콤한 유자향', category: 'concrete' },
      { label: '쌉쌀한 자몽향', category: 'concrete' },
      { label: '은은한 꽃향', category: 'concrete' },
      { label: '짭조름한 바다향', category: 'concrete' },
      { label: '시큼함', category: 'abstract' },
      { label: '상쾌함', category: 'abstract' },
      { label: '톡 쏘는 느낌', category: 'abstract' },
      { label: '활기참', category: 'abstract' },
    ]),
  },
  {
    id: 4, name: 'Velvet Bloom', nameKo: '벨벳 블룸',
    description: '한밤의 정원, 만개한 꽃의 관능적 축제',
    gradientFrom: '#FDA4AF', gradientTo: '#DDD6FE', icon: '🌹',
    notes: { top: ['피오니', '리치'], middle: ['터키쉬 로즈', '자스민 삼박'], base: ['바닐라', '캐시미어 머스크'] },
    questions: buildQuestions([
      { label: '진한 장미향', category: 'concrete' },
      { label: '달콤한 꽃향', category: 'concrete' },
      { label: '바닐라향', category: 'concrete' },
      { label: '비누향', category: 'concrete' },
      { label: '달콤함', category: 'abstract' },
      { label: '부드러움', category: 'abstract' },
      { label: '포근함', category: 'abstract' },
      { label: '나른함', category: 'abstract' },
    ]),
  },
  {
    id: 5, name: 'Terra Noir', nameKo: '테라 누아르',
    description: '대지의 뿌리 깊은 곳, 스모키한 깊이',
    gradientFrom: '#365314', gradientTo: '#292524', icon: '🪨',
    notes: { top: ['사프란', '주니퍼베리'], middle: ['베티버', '파출리'], base: ['다크 앰버', '토바코 리프'] },
    questions: buildQuestions([
      { label: '흙냄새', category: 'concrete' },
      { label: '축축한 풀향', category: 'concrete' },
      { label: '매콤한 향신료향', category: 'concrete' },
      { label: '연기향', category: 'concrete' },
      { label: '씁쓸함', category: 'abstract' },
      { label: '텁텁함', category: 'abstract' },
      { label: '무거움', category: 'abstract' },
      { label: '차분함', category: 'abstract' },
    ]),
  },
  {
    id: 6, name: 'Crystal Garden', nameKo: '크리스탈 가든',
    description: '수정처럼 맑은 빛, 순수한 꽃의 정원',
    gradientFrom: '#F0FDF4', gradientTo: '#FDF2F8', icon: '💎',
    notes: { top: ['화이트 피치', '프리지아'], middle: ['은방울꽃', '목련'], base: ['시어 머스크', '블론드 우드'] },
    questions: buildQuestions([
      { label: '가벼운 꽃향', category: 'concrete' },
      { label: '풀잎향', category: 'concrete' },
      { label: '달콤한 복숭아향', category: 'concrete' },
      { label: '비누향', category: 'concrete' },
      { label: '깨끗함', category: 'abstract' },
      { label: '가벼움', category: 'abstract' },
      { label: '상냥함', category: 'abstract' },
      { label: '산뜻함', category: 'abstract' },
    ]),
  },
];

export function getTypeByCode(code: string): AcscentType | undefined {
  return ACSCENT_TYPES.find((t) => t.code === code);
}

export function calculateType(scores: Record<string, number>): string {
  const io = (scores['IO'] ?? 0) < 0 ? 'I' : 'O';
  const bg = (scores['BG'] ?? 0) < 0 ? 'B' : 'G';
  const ls = (scores['LS'] ?? 0) < 0 ? 'L' : 'S';
  const cw = (scores['CW'] ?? 0) < 0 ? 'C' : 'W';
  return `${io}${bg}${ls}${cw}`;
}
