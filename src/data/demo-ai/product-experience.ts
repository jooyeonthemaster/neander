/* AI 제품 체험 컨시어지 — 데모 화면과 생성 API가 함께 쓰는 제품·질문 데이터 */

export type ProductId = 'air' | 'buds' | 'watch' | 'robot' | 'coffee';

export interface Product {
  name: string;
  category: string;
  emoji: string;
  tagline: string;
  benefit: string;
  specs: string[];
  color: string;
  price: number;
}

export const PRODUCTS: Record<ProductId, Product> = {
  air: {
    name: '에어 퓨어 X',
    category: '공기청정기',
    emoji: '🌬️',
    tagline: '숨 쉬는 모든 순간을 깨끗하게',
    benefit: '잠들기 전 공기까지 알아서 관리해 쉬는 시간의 질을 높여줘요.',
    specs: ['H13 헤파 필터', '수면 모드 22dB', '50㎡ 커버', 'AI 미세먼지 예측'],
    color: '#38bdf8',
    price: 389000,
  },
  buds: {
    name: '사운드핏 프로',
    category: '무선 이어폰',
    emoji: '🎧',
    tagline: '나만의 조용한 방을 귀에 담다',
    benefit: '적응형 노이즈 캔슬링이 어디서든 나만의 몰입 공간을 만들어줘요.',
    specs: ['적응형 노이즈 캔슬링', '최대 32시간 재생', 'IPX5 방수', '공간 음향'],
    color: '#a78bfa',
    price: 219000,
  },
  watch: {
    name: '핏 워치 S',
    category: '스마트워치',
    emoji: '⌚',
    tagline: '몸의 신호를 먼저 알아채는 코치',
    benefit: '심박·수면·활동량을 24시간 읽어 오늘 필요한 운동량을 알려줘요.',
    specs: ['24시간 심박·수면 분석', 'GPS 러닝 코치', '14일 배터리', '5ATM 방수'],
    color: '#34d399',
    price: 299000,
  },
  robot: {
    name: '로보클린 360',
    category: '로봇청소기',
    emoji: '🤖',
    tagline: '집안일은 로봇에게, 시간은 나에게',
    benefit: '3D 맵핑으로 집 구조를 기억해 외출한 사이 청소를 끝내 둬요.',
    specs: ['라이다 3D 맵핑', '흡입·물걸레 올인원', '자동 먼지 비움', '반려동물 털 모드'],
    color: '#f59e0b',
    price: 899000,
  },
  coffee: {
    name: '바리스타 원',
    category: '커피머신',
    emoji: '☕',
    tagline: '버튼 하나로 완성되는 카페 한 잔',
    benefit: '원터치 라떼와 예약 추출로 하루의 시작과 쉼표를 만들어줘요.',
    specs: ['19바 추출 압력', '원터치 라떼', '레시피 20종', '예약 추출'],
    color: '#fb923c',
    price: 459000,
  },
};

export const PRODUCT_ORDER: ProductId[] = ['air', 'buds', 'watch', 'robot', 'coffee'];

export interface Option {
  id: string;
  emoji: string;
  label: string;
  /** 다음 질문 앞에 붙는 AI의 맞장구 */
  reply: string;
  /** 추천 리포트용 한 줄 근거 */
  why?: string;
  keywords: string[];
  points: Partial<Record<ProductId, number>>;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export const QUESTIONS: Question[] = [
  {
    id: 'moment',
    text: '저는 NEANDER LIFE 체험관의 AI 컨시어지 네오예요 👋 요즘 가장 더 좋아졌으면 하는 순간은 언제예요?',
    options: [
      { id: 'rest', emoji: '🛋️', label: '집에서 쉬는 시간', reply: '쉬는 시간이 제일 소중하죠 🙂', keywords: ['집', '휴식', '쉬', '잠', '수면'], points: { air: 3, coffee: 2 } },
      { id: 'work', emoji: '💻', label: '일·공부하는 시간', reply: '집중력이 곧 경쟁력이죠 💪', keywords: ['일', '공부', '회사', '업무', '집중'], points: { buds: 2, coffee: 3 } },
      { id: 'move', emoji: '🚇', label: '출퇴근·이동 시간', reply: '이동 시간도 내 시간으로 만들 수 있어요 🚀', keywords: ['출퇴근', '이동', '지하철', '버스', '운전'], points: { buds: 4, watch: 1 } },
      { id: 'health', emoji: '🏃', label: '운동·건강 관리', reply: '건강 챙기는 분, 멋져요 👍', keywords: ['운동', '건강', '헬스', '러닝', '다이어트'], points: { watch: 4, air: 1 } },
      { id: 'chores', emoji: '🧺', label: '집안일 줄이기', reply: '집안일은 줄일수록 행복해지죠 😄', keywords: ['청소', '집안일', '빨래', '정리', '설거지'], points: { robot: 4 } },
    ],
  },
  {
    id: 'priority',
    text: '제품을 고를 때 가장 중요하게 보는 건 뭐예요?',
    options: [
      { id: 'design', emoji: '✨', label: '디자인', reply: '감각적인 안목이시네요 ✨', why: '미니멀한 디자인이라 어느 공간에 두어도 인테리어가 돼요.', keywords: ['디자인', '예쁜', '감성', '색'], points: { coffee: 1, watch: 1, buds: 1 } },
      { id: 'performance', emoji: '⚡', label: '강력한 성능', reply: '역시 성능이 기본이죠 ⚡', why: '동급 제품 대비 높은 성능 지표를 갖춘 플래그십 라인이에요.', keywords: ['성능', '빠른', '파워', '강력'], points: { robot: 2, air: 1, buds: 1 } },
      { id: 'auto', emoji: '🪄', label: '알아서 해주는 자동화', reply: '신경 안 써도 되는 게 최고죠 🪄', why: '앱과 AI가 사용 패턴을 학습해 알아서 최적 모드로 맞춰줘요.', keywords: ['자동', '편한', '스마트', '알아서'], points: { robot: 2, air: 2, watch: 1 } },
      { id: 'value', emoji: '💸', label: '가성비', reply: '현명한 소비, 좋아요 💡', why: '체험관 전용 쿠폰까지 더하면 가격 부담이 확 줄어요.', keywords: ['가격', '가성비', '저렴', '할인'], points: { buds: 2, coffee: 1 } },
    ],
  },
  {
    id: 'home',
    text: '함께 지내는 가족이나 반려동물이 있나요?',
    options: [
      { id: 'solo', emoji: '🙋', label: '혼자 살아요', reply: '1인 라이프 맞춤으로 볼게요 🏡', why: '1인 가구에 딱 맞는 크기와 사용량으로 설계됐어요.', keywords: ['혼자', '자취', '1인'], points: { buds: 1, coffee: 1 } },
      { id: 'family', emoji: '👨‍👩‍👧', label: '가족과 함께', reply: '온 가족이 함께 쓰면 더 좋죠 🏡', why: '가족 모두가 함께 쓰기 좋은 넉넉한 성능이에요.', keywords: ['가족', '아이', '부모', '엄마', '아빠'], points: { air: 2, robot: 1 } },
      { id: 'pet', emoji: '🐶', label: '반려동물이 있어요', reply: '귀여운 가족이 있군요 🐾', why: '반려동물 털과 냄새까지 고려한 전용 모드가 있어요.', keywords: ['강아지', '고양이', '반려', '펫'], points: { robot: 2, air: 2 } },
      { id: 'roommate', emoji: '🏠', label: '룸메이트와 함께', reply: '서로 배려하는 게 중요하죠 🤝', why: '저소음 설계라 함께 사는 사람을 방해하지 않아요.', keywords: ['룸메', '친구', '셰어'], points: { buds: 2 } },
    ],
  },
  {
    id: 'time',
    text: '마지막 질문이에요! 하루 중 나만의 여유 시간은 언제인가요?',
    options: [
      { id: 'morning', emoji: '🌅', label: '아침', reply: '아침형 인간이시군요 🌅', keywords: ['아침', '새벽', '출근 전'], points: { coffee: 2, watch: 1 } },
      { id: 'lunch', emoji: '☀️', label: '점심', reply: '점심의 짧은 쉼표, 소중하죠 🌞', keywords: ['점심', '낮'], points: { buds: 1, watch: 1 } },
      { id: 'evening', emoji: '🌙', label: '저녁·밤', reply: '하루를 마무리하는 시간이네요 🌙', keywords: ['저녁', '밤', '퇴근', '자기 전'], points: { air: 1, buds: 1 } },
      { id: 'weekend', emoji: '📅', label: '주말에만', reply: '주말을 알차게 보내시는군요 📅', keywords: ['주말', '휴일', '토요일', '일요일'], points: { robot: 1, coffee: 1 } },
    ],
  },
];

export const PURPOSES = [
  { id: 'me', emoji: '🙋', label: '나를 위해', desc: '내 생활을 업그레이드', intro: '오늘은 나를 위한 제품을 찾고 계시군요!' },
  { id: 'family', emoji: '🏡', label: '가족을 위해', desc: '함께 쓰는 제품', intro: '가족을 위한 제품을 찾고 계시군요!' },
  { id: 'gift', emoji: '🎁', label: '선물용', desc: '소중한 사람에게', intro: '선물을 고르고 계시군요! 받는 분을 떠올리며 답해 주세요.' },
  { id: 'browse', emoji: '👀', label: '그냥 둘러보기', desc: '신제품이 궁금해요', intro: '편하게 둘러보세요! 가볍게 몇 가지만 여쭤볼게요.' },
];

/** /api/demo-ai/product-experience 응답 */
export interface AiProductPick {
  /** 1순위 추천 제품 */
  best: ProductId;
  /** 매칭 점수 80~97 */
  match: number;
  /** 대화 답변을 근거로 한 추천 이유 2~3개 */
  reasons: string[];
  /** 함께 비교해 볼 제품 2개 (best 제외, 55~95) */
  runnerUps: { id: ProductId; match: number }[];
}
