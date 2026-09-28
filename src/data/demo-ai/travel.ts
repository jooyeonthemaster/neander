/* AI 여행 스타일 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const TRAVEL_DESTINATIONS = [
  { id: 'city', emoji: '🏙️', label: '도시', desc: '화려한 도시의 에너지', gradient: 'from-slate-700 to-blue-900' },
  { id: 'nature', emoji: '🌲', label: '자연', desc: '자연 속의 힐링', gradient: 'from-emerald-700 to-green-900' },
  { id: 'culture', emoji: '🏛️', label: '문화', desc: '역사와 예술의 감동', gradient: 'from-amber-700 to-orange-900' },
  { id: 'beach', emoji: '🏖️', label: '해변', desc: '바다와 태양의 여유', gradient: 'from-cyan-600 to-blue-800' },
  { id: 'adventure', emoji: '🧗', label: '모험', desc: '스릴 넘치는 도전', gradient: 'from-red-700 to-orange-800' },
] as const;

export const TRAVEL_PACES = [
  { id: 'packed', emoji: '⏰', label: '빡빡한 일정', desc: '하루에 5곳 이상! 놓치는 건 못 참아' },
  { id: 'balanced', emoji: '⚖️', label: '균형잡힌', desc: '적당히 보고 적당히 쉬기' },
  { id: 'slow', emoji: '🐌', label: '슬로우 트래블', desc: '한 곳에서 오래 머물며 느끼기' },
] as const;

export const TRAVEL_MUST_HAVES = [
  { id: 'food', emoji: '🍜', label: '맛집 탐방' },
  { id: 'photo', emoji: '📸', label: '인생샷' },
  { id: 'shopping', emoji: '🛍️', label: '쇼핑' },
  { id: 'local', emoji: '🎭', label: '로컬 체험' },
] as const;

/** AI가 고르는 페르소나 아이콘 */
export const TRAVEL_EMOJIS = ['🌃', '🚶', '🌿', '🏛️', '🐚', '⛵', '🪂', '🧭', '🗺️', '🏔️', '🌅', '🍜', '📸', '🎒', '🚲', '🚂'] as const;

export type TravelTripLength = 'day' | 'weekend' | 'long';
type TravelAtmosphere = (typeof TRAVEL_DESTINATIONS)[number]['id'];
interface ShortTripCandidate { destination: string; airport: string; tip: string }

/** Short visits stay within Korea; listed places are alternatives, not a multi-city itinerary. */
const SHORT_TRIPS: Record<'day' | 'weekend', Record<TravelAtmosphere, ShortTripCandidate>> = {
  day: {
    city: { destination: '서울 성수 또는 수원 행궁동', airport: 'GMP', tip: '출발지에서 당일 왕복 가능한 동네 한 곳을 골라 카페와 산책을 묶어보세요.' },
    nature: { destination: '남양주 숲길 또는 담양 대나무숲', airport: 'GMP', tip: '집에서 가까운 숲길 한 곳을 골라 이동 시간을 포함한 당일 코스로 잡아보세요.' },
    culture: { destination: '수원 화성 또는 전주 한옥마을', airport: 'GMP', tip: '당일 왕복 가능한 문화 공간 한 곳을 골라 관람과 휴식을 번갈아 즐겨보세요.' },
    beach: { destination: '인천 을왕리 또는 부산 송정', airport: 'GMP', tip: '출발지와 가까운 해변 한 곳만 고르고, 돌아올 교통편을 먼저 확인하세요.' },
    adventure: { destination: '춘천 자전거길 또는 가까운 실내 클라이밍장', airport: 'GMP', tip: '당일 이동이 가능한 장소에서 짧은 체험 하나를 고르고 충분한 휴식 시간을 남겨보세요.' },
  },
  weekend: {
    city: { destination: '부산 또는 전주', airport: 'PUS', tip: '2~3일 동안 한 도시만 골라 머물고 하루에 한 지역씩 둘러보세요.' },
    nature: { destination: '제주 또는 순천', airport: 'CJU', tip: '2~3일 동안 한 지역을 정해 자연 산책과 휴식을 묶고 이동을 줄여보세요.' },
    culture: { destination: '경주 또는 전주', airport: 'PUS', tip: '한 도시에서 2~3일 머물며 문화 공간을 여유 있게 둘러보세요.' },
    beach: { destination: '강릉 또는 부산', airport: 'YNY', tip: '2~3일 동안 한 해안 지역에 머물며 산책과 카페 방문을 가까운 동선으로 묶어보세요.' },
    adventure: { destination: '단양 또는 춘천', airport: 'CJJ', tip: '한 지역에서 체험 하나와 산책 하나를 골라 2~3일 일정으로 나눠보세요.' },
  },
};

export function shortTripCandidate(length: unknown, atmosphere: unknown): ShortTripCandidate | undefined {
  if (length !== 'day' && length !== 'weekend') return undefined;
  const key = TRAVEL_DESTINATIONS.some((item) => item.id === atmosphere) ? atmosphere as TravelAtmosphere : 'city';
  return SHORT_TRIPS[length][key];
}

/** /api/demo-ai/travel-style 응답 */
export interface AiTravel {
  name: string;
  emoji: string;
  desc: string;
  /** "도시 & 도시" */
  destination: string;
  /** 첫 번째 여행지의 IATA 공항 코드 (보딩패스 출력용) */
  airport: string;
  tip: string;
  packing: string[];
}
