// ─── OPT-16 Emotion Types ─────────────────────────────────────────────
export interface EmotionType {
  id: number;
  name: string;
  nameKo: string;
  description: string;
  color: string;
  icon: string;
}

export const EMOTION_TYPES: EmotionType[] = [
  { id: 0, name: 'Comfort', nameKo: '편안함', description: '안정적이고 포근한 정서적 안식', color: '#8B5CF6', icon: '☁' },
  { id: 1, name: 'Freshness', nameKo: '상쾌함', description: '맑고 깨끗한 청량감', color: '#06B6D4', icon: '◇' },
  { id: 2, name: 'Elegance', nameKo: '우아함', description: '세련되고 격조 높은 품격', color: '#EC4899', icon: '◈' },
  { id: 3, name: 'Warmth', nameKo: '따뜻함', description: '온기와 친밀감의 감성', color: '#F59E0B', icon: '○' },
  { id: 4, name: 'Sensuality', nameKo: '관능적', description: '감각적이고 매혹적인 에너지', color: '#EF4444', icon: '◆' },
  { id: 5, name: 'Playfulness', nameKo: '발랄함', description: '경쾌하고 즐거운 활기', color: '#F97316', icon: '△' },
  { id: 6, name: 'Mystery', nameKo: '신비로움', description: '깊이 있는 미지의 매력', color: '#6366F1', icon: '◎' },
  { id: 7, name: 'Confidence', nameKo: '자신감', description: '단단하고 확신에 찬 존재감', color: '#14B8A6', icon: '▪' },
  { id: 8, name: 'Serenity', nameKo: '고요함', description: '평온하고 명상적인 차분함', color: '#64748B', icon: '—' },
  { id: 9, name: 'Vitality', nameKo: '활력', description: '역동적이고 에너지 넘치는 생동감', color: '#22C55E', icon: '▲' },
  { id: 10, name: 'Romance', nameKo: '로맨틱', description: '감미롭고 사랑스러운 서정성', color: '#FB7185', icon: '♦' },
  { id: 11, name: 'Naturalness', nameKo: '자연스러움', description: '꾸밈없이 담백한 자연의 향', color: '#84CC16', icon: '◇' },
  { id: 12, name: 'Sophistication', nameKo: '세련됨', description: '도시적이고 모던한 정제미', color: '#0EA5E9', icon: '□' },
  { id: 13, name: 'Freedom', nameKo: '자유로움', description: '구속 없이 열린 해방감', color: '#38BDF8', icon: '◁' },
  { id: 14, name: 'Nostalgia', nameKo: '향수', description: '아련하고 그리운 기억의 온기', color: '#A78BFA', icon: '◐' },
  { id: 15, name: 'Power', nameKo: '강인함', description: '압도적이고 카리스마 있는 힘', color: '#1E293B', icon: '■' },
];

// ─── Fragrance Ingredients ────────────────────────────────────────────
export type NoteType = 'top' | 'middle' | 'base';

export interface Ingredient {
  id: string;
  name: string;
  nameKo: string;
  noteType: NoteType;
  category: string;
  costTier: 1 | 2 | 3; // 1=standard, 2=premium, 3=luxury
  ifraLimit: number; // max % allowed
}

export const INGREDIENTS: Ingredient[] = [
  // ── Top Notes ──
  { id: 'bergamot', name: 'Bergamot', nameKo: '베르가못', noteType: 'top', category: 'Citrus', costTier: 1, ifraLimit: 15 },
  { id: 'pink-pepper', name: 'Pink Pepper', nameKo: '핑크 페퍼', noteType: 'top', category: 'Spice', costTier: 2, ifraLimit: 8 },
  { id: 'lemon', name: 'Lemon', nameKo: '레몬', noteType: 'top', category: 'Citrus', costTier: 1, ifraLimit: 20 },
  { id: 'grapefruit', name: 'Grapefruit', nameKo: '자몽', noteType: 'top', category: 'Citrus', costTier: 1, ifraLimit: 18 },
  { id: 'cardamom', name: 'Cardamom', nameKo: '카다몬', noteType: 'top', category: 'Spice', costTier: 2, ifraLimit: 10 },
  { id: 'mandarin', name: 'Mandarin', nameKo: '만다린', noteType: 'top', category: 'Citrus', costTier: 1, ifraLimit: 20 },
  { id: 'green-tea', name: 'Green Tea', nameKo: '녹차', noteType: 'top', category: 'Fresh', costTier: 1, ifraLimit: 15 },
  { id: 'yuzu', name: 'Yuzu', nameKo: '유자', noteType: 'top', category: 'Citrus', costTier: 2, ifraLimit: 12 },
  { id: 'aldehyde', name: 'Aldehyde C-11', nameKo: '알데하이드', noteType: 'top', category: 'Synthetic', costTier: 1, ifraLimit: 5 },
  { id: 'fig', name: 'Fig Leaf', nameKo: '무화과', noteType: 'top', category: 'Green', costTier: 2, ifraLimit: 10 },
  { id: 'pear', name: 'Pear', nameKo: '배', noteType: 'top', category: 'Fruity', costTier: 1, ifraLimit: 15 },
  { id: 'black-currant', name: 'Black Currant', nameKo: '블랙커런트', noteType: 'top', category: 'Fruity', costTier: 2, ifraLimit: 8 },
  // ── Middle Notes ──
  { id: 'jasmine', name: 'Jasmine Absolute', nameKo: '자스민', noteType: 'middle', category: 'Floral', costTier: 3, ifraLimit: 12 },
  { id: 'rose', name: 'Rose de Mai', nameKo: '로즈', noteType: 'middle', category: 'Floral', costTier: 3, ifraLimit: 15 },
  { id: 'iris', name: 'Iris Pallida', nameKo: '아이리스', noteType: 'middle', category: 'Floral', costTier: 3, ifraLimit: 10 },
  { id: 'lavender', name: 'Lavender', nameKo: '라벤더', noteType: 'middle', category: 'Herbal', costTier: 1, ifraLimit: 20 },
  { id: 'geranium', name: 'Geranium', nameKo: '제라늄', noteType: 'middle', category: 'Floral', costTier: 1, ifraLimit: 18 },
  { id: 'ylang', name: 'Ylang-Ylang', nameKo: '일랑일랑', noteType: 'middle', category: 'Floral', costTier: 2, ifraLimit: 10 },
  { id: 'magnolia', name: 'Magnolia', nameKo: '목련', noteType: 'middle', category: 'Floral', costTier: 2, ifraLimit: 12 },
  { id: 'peony', name: 'Peony', nameKo: '피오니', noteType: 'middle', category: 'Floral', costTier: 2, ifraLimit: 15 },
  { id: 'neroli', name: 'Neroli', nameKo: '네롤리', noteType: 'middle', category: 'Floral', costTier: 3, ifraLimit: 8 },
  { id: 'violet', name: 'Violet Leaf', nameKo: '바이올렛', noteType: 'middle', category: 'Green', costTier: 2, ifraLimit: 10 },
  { id: 'orris', name: 'Orris Butter', nameKo: '오리스', noteType: 'middle', category: 'Powdery', costTier: 3, ifraLimit: 6 },
  { id: 'saffron', name: 'Saffron', nameKo: '사프란', noteType: 'middle', category: 'Spice', costTier: 3, ifraLimit: 5 },
  // ── Base Notes ──
  { id: 'sandalwood', name: 'Sandalwood', nameKo: '샌달우드', noteType: 'base', category: 'Woody', costTier: 3, ifraLimit: 20 },
  { id: 'white-musk', name: 'White Musk', nameKo: '화이트 머스크', noteType: 'base', category: 'Musk', costTier: 1, ifraLimit: 25 },
  { id: 'vanilla', name: 'Vanilla Absolute', nameKo: '바닐라', noteType: 'base', category: 'Sweet', costTier: 2, ifraLimit: 15 },
  { id: 'amber', name: 'Amber', nameKo: '앰버', noteType: 'base', category: 'Resinous', costTier: 2, ifraLimit: 18 },
  { id: 'cedarwood', name: 'Cedarwood', nameKo: '시더우드', noteType: 'base', category: 'Woody', costTier: 1, ifraLimit: 20 },
  { id: 'patchouli', name: 'Patchouli', nameKo: '패출리', noteType: 'base', category: 'Earthy', costTier: 2, ifraLimit: 15 },
  { id: 'vetiver', name: 'Vetiver', nameKo: '베티버', noteType: 'base', category: 'Earthy', costTier: 2, ifraLimit: 15 },
  { id: 'tonka', name: 'Tonka Bean', nameKo: '통카빈', noteType: 'base', category: 'Sweet', costTier: 2, ifraLimit: 10 },
  { id: 'benzoin', name: 'Benzoin', nameKo: '벤조인', noteType: 'base', category: 'Balsamic', costTier: 2, ifraLimit: 12 },
  { id: 'oud', name: 'Oud', nameKo: '우드', noteType: 'base', category: 'Woody', costTier: 3, ifraLimit: 8 },
  { id: 'cashmeran', name: 'Cashmeran', nameKo: '캐시머란', noteType: 'base', category: 'Musky', costTier: 2, ifraLimit: 15 },
  { id: 'ambroxan', name: 'Ambroxan', nameKo: '앰브록산', noteType: 'base', category: 'Synthetic', costTier: 2, ifraLimit: 20 },
];

// ─── Keyword → Emotion Mapping ────────────────────────────────────────
export const KEYWORD_EMOTION_MAP: Record<string, number[]> = {
  // Korean primary
  '편안': [0], '상쾌': [1], '우아': [2], '따뜻': [3],
  '관능': [4], '발랄': [5], '신비': [6], '자신감': [7],
  '고요': [8], '활력': [9], '로맨': [10], '자연': [11],
  '세련': [12], '자유': [13], '그리움': [14], '강인': [15],
  // Korean compound
  '부드러': [0, 3], '시원': [1], '깔끔': [1, 12], '도시': [7, 12],
  '럭셔리': [2, 12], '포근': [0, 3], '달콤': [3, 10], '쿨': [1, 7],
  '모던': [7, 12], '클래식': [2, 14], '섹시': [4], '청량': [1],
  '몽환': [6, 8], '화려': [2, 5], '스포티': [1, 9], '지적': [7, 12],
  '차분': [0, 8], '밤': [4, 6], '여름': [1, 9], '겨울': [3, 6],
  '봄': [5, 11], '가을': [8, 14], '퇴근': [0, 8], '데이트': [4, 10],
  '오피스': [7, 12], '파티': [5, 9], '명상': [8, 11],
  // English
  'comfort': [0], 'fresh': [1], 'elegant': [2], 'warm': [3],
  'sensual': [4], 'playful': [5], 'mysterious': [6], 'confident': [7],
  'serene': [8], 'vital': [9], 'romantic': [10], 'natural': [11],
  'sophisticated': [12], 'free': [13], 'nostalgic': [14], 'powerful': [15],
  'urban': [7, 12], 'cozy': [0, 3], 'modern': [7, 12], 'luxury': [2, 12],
  'clean': [1, 12], 'calm': [0, 8], 'bold': [7, 15],
};

// ─── Emotion → Ingredient Affinity ────────────────────────────────────
export const EMOTION_INGREDIENT_MAP: Record<number, string[]> = {
  0: ['lavender', 'vanilla', 'sandalwood', 'white-musk', 'tonka', 'cashmeran'],
  1: ['bergamot', 'grapefruit', 'green-tea', 'yuzu', 'lemon', 'aldehyde'],
  2: ['iris', 'rose', 'orris', 'saffron', 'jasmine', 'neroli'],
  3: ['vanilla', 'amber', 'tonka', 'benzoin', 'cashmeran', 'sandalwood'],
  4: ['ylang', 'jasmine', 'vanilla', 'oud', 'ambroxan', 'saffron'],
  5: ['mandarin', 'pear', 'peony', 'pink-pepper', 'fig', 'magnolia'],
  6: ['oud', 'saffron', 'patchouli', 'vetiver', 'iris', 'violet'],
  7: ['pink-pepper', 'bergamot', 'cedarwood', 'ambroxan', 'cardamom', 'vetiver'],
  8: ['lavender', 'sandalwood', 'neroli', 'cedarwood', 'vetiver', 'white-musk'],
  9: ['grapefruit', 'cardamom', 'pink-pepper', 'geranium', 'lemon', 'mandarin'],
  10: ['rose', 'peony', 'magnolia', 'vanilla', 'amber', 'benzoin'],
  11: ['green-tea', 'fig', 'vetiver', 'cedarwood', 'geranium', 'lavender'],
  12: ['iris', 'ambroxan', 'cedarwood', 'bergamot', 'cashmeran', 'aldehyde'],
  13: ['bergamot', 'neroli', 'grapefruit', 'sandalwood', 'ambroxan', 'green-tea'],
  14: ['vanilla', 'benzoin', 'tonka', 'rose', 'amber', 'lavender'],
  15: ['oud', 'patchouli', 'vetiver', 'pink-pepper', 'saffron', 'cedarwood'],
};

// ─── Processing Stages ────────────────────────────────────────────────
export interface ProcessingStage {
  id: number;
  name: string;
  nameKo: string;
  module: string;
  description: string;
  duration: number; // ms
}

export const PROCESSING_STAGES: ProcessingStage[] = [
  {
    id: 0, name: 'Emotional Analysis', nameKo: '감성 언어 분석',
    module: 'OPT-16', description: '자연어 감성 브리프를 16차원 감성 벡터로 변환합니다',
    duration: 3500,
  },
  {
    id: 1, name: 'Formula Generation', nameKo: '배합 후보 생성',
    module: 'CVAE-PA', description: '조건부 변이 오토인코더로 최적 배합 후보를 자동 설계합니다',
    duration: 4000,
  },
  {
    id: 2, name: 'Interaction Validation', nameKo: '성분 상호작용 검증',
    module: 'CINN', description: 'Self-Attention 기반 신경망으로 성분 간 시너지를 검증합니다',
    duration: 3000,
  },
  {
    id: 3, name: 'Constraint Optimization', nameKo: '제약 조건 최적화',
    module: 'BO-OC', description: 'IFRA 규제·원가·휘발 균형을 동시에 최적화합니다',
    duration: 3000,
  },
  {
    id: 4, name: 'Consumer Simulation', nameKo: '가상 소비자 시뮬레이션',
    module: 'SOP', description: '10,000명 가상 패널의 감성 반응을 몬테카를로 시뮬레이션합니다',
    duration: 3500,
  },
];

// ─── Brand Brief Types ────────────────────────────────────────────────
export interface BrandBrief {
  brandName: string;
  targetAge: string;
  targetGender: 'female' | 'male' | 'unisex';
  emotionalDescription: string;
  usageContext: string;
  budgetLevel: 'standard' | 'premium' | 'luxury';
  preferredNotes: string[];
  avoidedNotes: string[];
  lifestyleKeywords: string[];
}

// ─── Result Types ─────────────────────────────────────────────────────
export interface EmotionScore {
  typeId: number;
  score: number; // 0-100
}

export interface FormulaIngredient {
  ingredientId: string;
  percentage: number;
}

export interface Formula {
  id: string;
  name: string;
  nameKo: string;
  concept: string;
  matchScore: number;
  ingredients: FormulaIngredient[];
  estimatedCostPer10ml: number;
  stabilityScore: number;
  uniquenessIndex: number;
  ifraCompliant: boolean;
  longevityHours: number;
  sillageRating: 'intimate' | 'moderate' | 'strong' | 'enormous';
  character: string;
}

export interface ConsumerPrediction {
  preferenceRate: number;
  confidenceInterval: [number, number];
  targetAudienceMatch: number;
  purchaseIntentRate: number;
  repurchaseRate: number;
  genderBreakdown: { male: number; female: number };
  ageBreakdown: Record<string, number>;
  competitiveEdge: number;
  marketPositioning: string;
}

export interface FormulaResults {
  emotionVector: EmotionScore[];
  dominantEmotions: EmotionScore[];
  formulas: Formula[];
  consumerPrediction: ConsumerPrediction;
  totalCandidatesGenerated: number;
  candidatesAfterCINN: number;
  candidatesAfterBOOC: number;
  targetInsight: string;
  processingTimeSec: number;
}

// ─── Dropdown Options ─────────────────────────────────────────────────
export const AGE_OPTIONS = [
  { value: '10late', label: '10대 후반' },
  { value: '20early', label: '20대 초반' },
  { value: '20late', label: '20대 후반' },
  { value: '30early', label: '30대 초반' },
  { value: '30late', label: '30대 후반' },
  { value: '40s', label: '40대' },
  { value: '50plus', label: '50대 이상' },
];

export const USAGE_OPTIONS = [
  { value: 'daily', label: '데일리' },
  { value: 'office', label: '오피스/비즈니스' },
  { value: 'evening', label: '이브닝/나이트' },
  { value: 'date', label: '데이트' },
  { value: 'relaxation', label: '휴식/릴랙스' },
  { value: 'special', label: '스페셜 오케이전' },
  { value: 'travel', label: '여행' },
];

export const LIFESTYLE_OPTIONS = [
  '미니멀리스트', '트렌드세터', '클래식', '아웃도어',
  '크리에이티브', '웰니스', '럭셔리', '캐주얼',
  '프로페셔널', '아티스틱', '에코', '어반',
];

export const NOTE_TAG_OPTIONS = [
  '시트러스', '플로럴', '우디', '머스크', '스파이시',
  '프루티', '그린', '파우더리', '발사믹', '스위트',
  '어시', '아쿠아틱', '레더', '스모키',
];
