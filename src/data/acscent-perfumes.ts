/* ─────────────────────────────────────────────────────────
   A C'SCENT  |  Perfume Products & Reviews Database
   Demo data for personalized perfume recommendations
   ───────────────────────────────────────────────────────── */

import type { AcscentType } from './acscent-types';

export interface AcscentPerfume {
  id: string;
  name: string;
  brand: string;
  price: string;
  family: string;
  notes: { top: string[]; middle: string[]; base: string[] };
  brandDescription: string;
  rating: number;
  reviewCount: number;
  gradientFrom: string;
  gradientTo: string;
}

export interface AcscentReview {
  id: string;
  perfumeId: string;
  userType: string;
  userName: string;
  rating: number;
  content: string;
  date: string;
  helpful: number;
}

export const PERFUMES: AcscentPerfume[] = [
  {
    id: 'santal-33',
    name: 'Santal 33',
    brand: 'Le Labo',
    price: '₩320,000',
    family: '우디 아로마틱',
    notes: { top: ['바이올렛', '카다멈'], middle: ['아이리스', '앰브록산'], base: ['샌달우드', '시더우드', '레더'] },
    brandDescription: '부드러운 샌달우드와 가죽이 어우러진 도시적 세련미. 캠프파이어의 따뜻함과 사막의 건조함이 공존하는 중성적 향.',
    rating: 4.5,
    reviewCount: 2847,
    gradientFrom: '#92400E',
    gradientTo: '#D97706',
  },
  {
    id: 'blanche',
    name: 'Blanche',
    brand: 'Byredo',
    price: '₩280,000',
    family: '플로럴 머스크',
    notes: { top: ['핑크페퍼', '알데하이드'], middle: ['피오니', '바이올렛'], base: ['뮤스크', '샌달우드', '블론드우드'] },
    brandDescription: '갓 세탁한 하얀 리넨의 청결함. 순수하면서도 관능적인 화이트 플로럴의 미니멀한 아름다움.',
    rating: 4.3,
    reviewCount: 1923,
    gradientFrom: '#F8FAFC',
    gradientTo: '#E2E8F0',
  },
  {
    id: 'oud-wood',
    name: 'Oud Wood',
    brand: 'Tom Ford',
    price: '₩450,000',
    family: '우디 오리엔탈',
    notes: { top: ['로즈우드', '카다멈'], middle: ['우드', '샌달우드'], base: ['베티버', '통카빈', '앰버'] },
    brandDescription: '이국적인 우드의 깊이와 스파이시한 따뜻함. 세련되고 스모키한 럭셔리 우디 오리엔탈의 정수.',
    rating: 4.7,
    reviewCount: 3156,
    gradientFrom: '#44403C',
    gradientTo: '#78716C',
  },
  {
    id: 'wood-sage',
    name: 'Wood Sage & Sea Salt',
    brand: 'Jo Malone',
    price: '₩190,000',
    family: '아로마틱 아쿠아틱',
    notes: { top: ['씨솔트', '앰브렛'], middle: ['세이지', '씨위드'], base: ['드리프트우드', '구즈베리'] },
    brandDescription: '바람에 날리는 파도와 해안 절벽의 야생 세이지. 자유롭고 내추럴한 영국 해안가의 무심한 매력.',
    rating: 4.2,
    reviewCount: 4521,
    gradientFrom: '#64748B',
    gradientTo: '#94A3B8',
  },
  {
    id: 'baccarat-540',
    name: 'Baccarat Rouge 540',
    brand: 'Maison Francis Kurkdjian',
    price: '₩520,000',
    family: '앰버 플로럴',
    notes: { top: ['사프란', '재스민'], middle: ['앰버그리스', '시더우드'], base: ['퍼 발삼', '머스크'] },
    brandDescription: '크리스탈처럼 빛나는 앰버의 광채. 달콤하면서도 미네랄한 독특한 아우라로 감싸는 시그니처 향.',
    rating: 4.8,
    reviewCount: 5234,
    gradientFrom: '#DC2626',
    gradientTo: '#F59E0B',
  },
  {
    id: 'do-son',
    name: 'Do Son',
    brand: 'Diptyque',
    price: '₩210,000',
    family: '플로럴',
    notes: { top: ['오렌지 블라썸', '네롤리'], middle: ['튜베로즈', '자스민'], base: ['머스크', '벵골 벤조인'] },
    brandDescription: '베트남 해안가에서 피어나는 튜베로즈의 관능적 향기. 이국적이면서도 우아한 화이트 플로럴의 꿈.',
    rating: 4.4,
    reviewCount: 1678,
    gradientFrom: '#FDF2F8',
    gradientTo: '#FECDD3',
  },
  {
    id: 'gypsy-water',
    name: 'Gypsy Water',
    brand: 'Byredo',
    price: '₩280,000',
    family: '아로마틱 프레시',
    notes: { top: ['베르가못', '레몬', '주니퍼베리'], middle: ['인센스', '파인 니들'], base: ['앰버', '바닐라', '샌달우드'] },
    brandDescription: '방랑자의 자유로운 영혼. 숲과 흙, 모닥불의 따뜻한 잔상이 묻어나는 노마딕 프레시 향.',
    rating: 4.3,
    reviewCount: 2134,
    gradientFrom: '#365314',
    gradientTo: '#65A30D',
  },
  {
    id: 'hwyl',
    name: 'Hwyl',
    brand: 'Aesop',
    price: '₩250,000',
    family: '우디 스모키',
    notes: { top: ['엘레미'], middle: ['사이프러스', '베티버'], base: ['인센스', '가야쿠'] },
    brandDescription: '일본 고대 사원의 정적. 히노키 숲의 습기와 인센스의 명상적 깊이가 어우러진 미니멀 우디.',
    rating: 4.6,
    reviewCount: 987,
    gradientFrom: '#1C1917',
    gradientTo: '#3F3F46',
  },
];

/** Generate personalized type perception for a perfume */
export function getTypePerception(type: AcscentType, perfume: AcscentPerfume): string {
  const isI = type.code[0] === 'I';
  const isB = type.code[1] === 'B';
  const isL = type.code[2] === 'L';
  const isW = type.code[3] === 'W';

  const topNote = perfume.notes.top[0];
  const midNote = perfume.notes.middle[0];
  const baseNote = perfume.notes.base[0];

  const perceptions: string[] = [];

  // Intensity perception (B/G axis)
  if (isB) {
    perceptions.push(
      `당신의 대담한 후각 감수성은 ${perfume.name}의 ${topNote} 탑노트를 일반인 대비 약 1.5배 강하게 인지합니다. 첫 스프레이에서부터 ${topNote}의 존재감이 강렬하게 다가올 것입니다.`
    );
  } else {
    perceptions.push(
      `섬세한 후각의 소유자인 당신은 ${perfume.name}에서 대부분의 사람들이 놓치는 ${midNote}의 미묘한 뉘앙스를 포착합니다. 다른 사람이 느끼지 못하는 숨겨진 레이어를 발견할 수 있는 특별한 능력입니다.`
    );
  }

  // Processing style (I/O axis)
  if (isI) {
    perceptions.push(
      `내향적 인지 유형인 당신은 이 향을 맡을 때 특정 기억이나 장면이 자연스럽게 떠오릅니다. ${baseNote}의 잔향이 남을 때, 오래된 기억 속 한 장면이 선명하게 재생될 수 있습니다.`
    );
  } else {
    perceptions.push(
      `외향적 인지 유형인 당신은 이 향에 대한 감상을 즉각적으로 표현하고 싶을 것입니다. "${perfume.name}의 ${midNote}가 정말 매력적이야"라고 누군가에게 바로 이야기하게 되는 유형입니다.`
    );
  }

  // Perception mode (L/S axis)
  if (isL) {
    perceptions.push(
      `선형적 분석 능력이 뛰어난 당신은 ${topNote} → ${midNote} → ${baseNote}로 이어지는 향의 시간적 변화를 마치 악보를 읽듯 정확하게 추적합니다. 드라이다운까지의 여정이 하나의 서사처럼 느껴질 것입니다.`
    );
  } else {
    perceptions.push(
      `공감각적 인지 유형인 당신에게 이 향은 단순한 냄새를 넘어 하나의 풍경입니다. ${midNote}에서 특정 색채가 보이고, ${baseNote}에서 질감이 느껴질 것입니다. 향이 만들어내는 감각의 교향곡을 온전히 경험하세요.`
    );
  }

  // Temperature (C/W axis)
  if (isW) {
    perceptions.push(
      `웜 지향인 당신에게 이 향의 따뜻한 베이스 노트(${baseNote})가 특히 두드러지게 다가옵니다. 피부 위에서 시간이 지남에 따라 더욱 포근해지는 향의 변화를 즐겨보세요.`
    );
  } else {
    perceptions.push(
      `쿨 지향인 당신은 이 향에서 상쾌하고 시원한 면모를 먼저 감지합니다. ${topNote}의 프레시한 오프닝이 당신에게는 다른 사람보다 더 오래, 더 선명하게 지속될 것입니다.`
    );
  }

  return perceptions.join('\n\n');
}

export const REVIEWS: AcscentReview[] = [
  // Santal 33 reviews
  { id: 'r1', perfumeId: 'santal-33', userType: 'IBLW', userName: '깊은관조자_윤서', rating: 5, content: '샌달우드의 따뜻함이 시간이 지나면서 점점 깊어져요. 특히 베이스의 레더 노트가 오래된 서재의 분위기를 만들어내는데, 혼자만의 시간에 맡으면 명상적인 깊이가 느껴집니다.', date: '2025-12-15', helpful: 42 },
  { id: 'r2', perfumeId: 'santal-33', userType: 'OBLW', userName: '열정안내자_준호', rating: 4, content: '이 향을 뿌리면 주변에서 항상 물어봐요. 카다멈 탑에서 샌달우드 베이스까지의 변화가 드라마틱하면서도 따뜻해서, 사람들에게 설명하기 좋은 향입니다.', date: '2025-11-28', helpful: 38 },
  { id: 'r3', perfumeId: 'santal-33', userType: 'IGLW', userName: '섬세한기억_하은', rating: 5, content: '이 향을 맡으면 할아버지 서재가 떠올라요. 바닐라와 샌달우드의 은은한 따뜻함이 어린 시절 기억을 불러일으키는데, 너무 강하지 않아서 하루종일 편안하게 안고 있을 수 있어요.', date: '2025-10-22', helpful: 56 },
  { id: 'r4', perfumeId: 'santal-33', userType: 'OBSW', userName: '소믈리에_민재', rating: 5, content: '진정한 걸작. 탑의 스파이시함에서 미드의 우디, 베이스의 가죽까지 각 레이어에서 색과 질감이 동시에 느껴져요. 시나몬 빛 갈색에서 깊은 보르도로 변해가는 느낌.', date: '2025-09-18', helpful: 71 },
  // Blanche reviews
  { id: 'r5', perfumeId: 'blanche', userType: 'IGLC', userName: '감별사_서연', rating: 4, content: '핑크페퍼의 톡 쏘는 오프닝 뒤로 깨끗한 머스크가 자리잡는 구조가 인상적이에요. 알데하이드의 품질이 좋아서 비누향으로 빠지지 않고 세련되게 유지됩니다.', date: '2025-12-03', helpful: 33 },
  { id: 'r6', perfumeId: 'blanche', userType: 'IGSC', userName: '꿈꾸는향_지우', rating: 5, content: '뿌리는 순간 하얀 빛이 퍼지는 것 같아요. 은은한 파스텔 톤의 플로럴이 점점 투명해지면서 마치 햇살에 빨래가 마르는 장면이 그려져요. 너무 아름다운 향.', date: '2025-11-14', helpful: 48 },
  { id: 'r7', perfumeId: 'blanche', userType: 'OGSW', userName: '감성공유_채원', rating: 4, content: '이 향 뿌리면 주변 사람들이 "좋은 냄새 난다"고 해요. 순수하면서도 따뜻한 느낌이 있어서 친구들에게 선물하기 좋아요. 같이 맡으면서 이야기 나누면 더 좋은 향.', date: '2025-10-30', helpful: 29 },
  // Oud Wood reviews
  { id: 'r8', perfumeId: 'oud-wood', userType: 'IBSW', userName: '연금술사_도윤', rating: 5, content: '이 향에서 짙은 보라색과 깊은 갈색이 동시에 느껴져요. 우드의 질감이 벨벳처럼 부드러우면서도 무게감이 있고, 앰버의 따뜻함이 마지막까지 깊은 감정을 끌어올려요.', date: '2025-12-08', helpful: 63 },
  { id: 'r9', perfumeId: 'oud-wood', userType: 'IBLC', userName: '분석탐험_현우', rating: 4, content: '카다멈 탑이 빠르게 사라지고 우드-베티버 골격이 드러나는 구조가 좋습니다. 합성 우드와 천연 우드의 블렌딩 밸런스가 정교해요. 다만 시트러스 계열 선호자에겐 무거울 수 있습니다.', date: '2025-11-20', helpful: 45 },
  // Baccarat Rouge 540 reviews
  { id: 'r10', perfumeId: 'baccarat-540', userType: 'OBSW', userName: '소믈리에_서진', rating: 5, content: '처음 맡았을 때 붉은 크리스탈에서 빛이 굴절되는 이미지가 떠올랐어요. 사프란의 따뜻한 금빛에서 앰버그리스의 미네랄한 질감까지, 모든 감각이 동시에 반응하는 거의 유일한 향.', date: '2025-12-01', helpful: 89 },
  { id: 'r11', perfumeId: 'baccarat-540', userType: 'OBLC', userName: '대담비평_지훈', rating: 4, content: '확실히 시야쥬가 강력합니다. 좋든 싫든 호불호가 갈리는 향인데, 저는 사프란의 시원한 스파이시함이 인상적이었어요. 다만 달콤함이 강해서 쿨톤 선호자에겐 상반기보다 하반기가 적합.', date: '2025-11-25', helpful: 52 },
  { id: 'r12', perfumeId: 'baccarat-540', userType: 'OGSW', userName: '감성공유_나연', rating: 5, content: '이 향 뿌리면 마법처럼 분위기가 달라져요! 달콤하면서도 고급스러운 느낌이 있어서, 특별한 날 뿌리면 주변에서 다들 칭찬해요. 함께 있는 사람들과 나누고 싶은 향기.', date: '2025-10-15', helpful: 67 },
  // Wood Sage reviews
  { id: 'r13', perfumeId: 'wood-sage', userType: 'OGLC', userName: '큐레이터_예린', rating: 5, content: '데일리 향수로 이것만한 게 없어요. 시원한 바다소금과 세이지가 만나서 깔끔하면서도 개성 있는 향을 만들어내요. 남녀 구분 없이 추천할 수 있는 향이라 선물용으로도 자주 사요.', date: '2025-12-10', helpful: 44 },
  { id: 'r14', perfumeId: 'wood-sage', userType: 'OBSC', userName: '표현예술_승현', rating: 4, content: '영국 해안가의 바위 틈에서 불어오는 바람이 보여요. 회색빛 바다와 초록빛 세이지의 대비가 마치 수묵화 같은 향. 단순해 보이지만 그 안에 복잡한 텍스처가 숨어있어요.', date: '2025-11-08', helpful: 38 },
  // Hwyl reviews
  { id: 'r15', perfumeId: 'hwyl', userType: 'IBLW', userName: '관조자_시현', rating: 5, content: '히노키 숲의 습한 공기와 오래된 사원의 인센스. 베이스의 가야쿠가 점점 깊어지면서 마치 명상의 깊이가 더해지는 것 같아요. 3시간 후의 잔향이 오히려 더 아름답습니다.', date: '2025-12-20', helpful: 58 },
  { id: 'r16', perfumeId: 'hwyl', userType: 'IBSC', userName: '감각사색_태은', rating: 5, content: '이 향을 맡으면 짙은 녹색과 연회색이 교차해요. 마치 안개 낀 교토의 선 정원을 걷는 것 같은 시각적 경험. 미니멀하지만 그 안에 무한한 깊이가 있는 향입니다.', date: '2025-11-30', helpful: 47 },
];

export function getReviewsForPerfume(perfumeId: string): AcscentReview[] {
  return REVIEWS.filter((r) => r.perfumeId === perfumeId);
}

export function getReviewsByType(perfumeId: string, typeCode: string): AcscentReview[] {
  return REVIEWS.filter((r) => r.perfumeId === perfumeId && r.userType === typeCode);
}

export function getSameTypeReviews(typeCode: string): AcscentReview[] {
  return REVIEWS.filter((r) => r.userType === typeCode);
}
