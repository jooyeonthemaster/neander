/* ─────────────────────────────────────────────────────────
   2026-11 디자인 개편에서 여러 화면이 함께 쓰는 값.
   순서 · 강조는 2026-09-20 ~ 11-20 국내 방문 476회 기록을 따른다
   (scratch 분석: 서비스 상세 관심 1위 AI 향수, 문의·견적 고객의 68%가 체험 서비스 목록을 봄 등).
   ───────────────────────────────────────────────────────── */
import type { Lang } from '@/lib/quote/catalog';
import { formatPrice } from '@/lib/quote/format';
import { startingPrice } from '@/lib/quote/engine';

export type CoreServiceKey = 'acscent' | 'photoBooth' | 'rental';

export interface CoreService {
  key: CoreServiceKey;
  no: string;
  /** 영어 큰 제목 (줄 단위) */
  en: string[];
  href: string;
  /** 실제 운영 사진 + 어느 행사인지 */
  image: string;
  caption: Record<Lang, string>;
  /** 방문객이 들고 가는 것 */
  takeHome: Record<Lang, string[]>;
  /** 한 줄 소개 */
  line: Record<Lang, string>;
}

/** 주력 3종 — AI 향수가 먼저 (관심도·문의 1위, 2026-11-20 사용자 결정) */
export const CORE_SERVICES: CoreService[] = [
  {
    key: 'acscent',
    no: '01',
    en: ['AI', 'PERFUMER'],
    href: '/services/ai-scent-soulmate',
    image: '/images/site/perfume-pyeongtaek.webp',
    caption: { ko: '운영 사례 · 평택 AI 페스타 2026', en: 'Pyeongtaek AI Festa 2026' },
    takeHome: { ko: ['10ml · 50ml 향수', '결과 카드'], en: ['10ml · 50ml perfume', 'Result card'] },
    line: {
      ko: 'AI가 어울리는 향을 추천하고, 조향사가 현장에서 향수로 만들어 드립니다.',
      en: 'AI recommends a scent; a perfumer blends it on site.',
    },
  },
  {
    key: 'photoBooth',
    no: '02',
    en: ['AI PHOTO', 'BOOTH'],
    href: '/services/ai-photo-booth',
    image: '/images/site/photobooth-pyeongtaek.webp',
    caption: { ko: '운영 사례 · 평택 AI 페스타 2026', en: 'Pyeongtaek AI Festa 2026' },
    takeHome: { ko: ['4×6 인화', 'QR 저장'], en: ['4×6 print', 'QR download'] },
    line: {
      ko: '찍은 사진을 AI가 행사 테마 속 모습으로 바꾸고 그 자리에서 인화합니다.',
      en: 'AI restyles each photo into your event theme and prints it on the spot.',
    },
  },
  {
    key: 'rental',
    no: '03',
    en: ['AI', 'KIOSK'],
    href: '/services/ai-kiosk',
    image: '/images/site/kiosk-jimff.webp',
    caption: { ko: '운영 사례 · 제천국제음악영화제 2026', en: 'JIMFF 2026' },
    takeHome: { ko: ['결과지', 'QR'], en: ['Printed result', 'QR'] },
    line: {
      ko: '퍼스널 컬러 · 손금 · 미래직업 같은 AI 체험을 키오스크로 운영합니다.',
      en: 'Personal color, palm reading and career tests, run on a kiosk.',
    },
  },
];

export function coreService(key: CoreServiceKey): CoreService {
  return CORE_SERVICES.find((s) => s.key === key) as CoreService;
}

/** 「99만원부터」 / 「from ₩990,000」 */
export function priceFrom(key: CoreServiceKey, lang: Lang): string {
  const price = formatPrice(startingPrice(key), lang);
  return lang === 'ko' ? `${price}부터` : `from ${price}`;
}

/** 홈 운영 사례에 먼저 올릴 순서 — 기업·기관 방문자가 많이 본 사례 순 (팬 검색 유입이 대부분인 사례는 뒤로) */
export const HOME_WORK_PRIORITY = [
  'pyeongtaek-ai-festa-2026',
  'kwave-dance-festival-2026',
  'jimff-2026-ost-fair',
  'eunpyeong-ai-festival-2026',
  'sowon-festa-saju-photobooth-2026',
  'ansan-science-festival-2026',
];

/** 흐르는 띠에 쓰는 운영 행사 이름 (모두 포트폴리오에 있는 실제 운영 행사) */
export const TRACK_RECORD: Record<Lang, string[]> = {
  ko: ['제천국제음악영화제', '평택 AI 페스타', 'K-WAVE DANCE FESTIVAL', '소원성취페스타', '안산사이언스밸리 과학축제', '은평 AI 페스티벌', '서울국제작가축제', '코리아그랜드세일'],
  en: ['JIMFF', 'PYEONGTAEK AI FESTA', 'K-WAVE DANCE FESTIVAL', 'SOWON FESTA', 'ANSAN SCIENCE FESTIVAL', 'EUNPYEONG AI FESTIVAL', 'SEOUL WRITERS’ FESTIVAL', 'KOREA GRAND SALE'],
};

/** 네이버 지도 — AC'SCENT ID */
export const STORE_MAP_URL =
  'https://map.naver.com/p/entry/place/1274492663?placePath=%252Fhome%253Fentry%253Dplt&searchType=place&lng=126.9267345&lat=37.5549328';
