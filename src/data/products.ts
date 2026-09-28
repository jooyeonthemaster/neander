import type { Lang, ServiceKey } from '@/lib/quote/catalog';

/**
 * 판매 상품 6가지 — 홈 'AI 체험' 섹션과 푸터 서비스 목록이 쓴다.
 * 이름·설명·시작가는 온라인 견적과 같은 src/lib/quote 를 쓰고, 여기에는 연결 주소와 대표 사진만 둔다.
 * 사진은 실제 운영 사진이면 행사명을, 생성한 연출 이미지면 '연출 예시'를 캡션으로 단다.
 */
export interface ProductEntry {
  key: ServiceKey;
  /** '자세히' 링크 */
  href: string;
  image: string;
  caption: Record<Lang, string>;
}

export const PRODUCTS: ProductEntry[] = [
  {
    key: 'acscent',
    href: '/services/ai-scent-soulmate',
    image: '/images/services/experiences/ai-scent-soulmate.webp',
    caption: { ko: '운영 사례 · 코리아그랜드세일 2026', en: 'Korea Grand Sale 2026' },
  },
  {
    key: 'photoBooth',
    href: '/services?pillar=ai-photo',
    image: '/images/services/experiences/ai-celeb-lookalike.webp',
    caption: { ko: '운영 사례 · 평택 AI 페스타 2026', en: 'Pyeongtaek AI Festa 2026' },
  },
  {
    key: 'rental',
    href: '/services?pillar=ai-diagnosis',
    image: '/images/ai-experiences/ai-diagnosis.webp',
    caption: { ko: '연출 예시', en: 'Concept image' },
  },
  {
    key: 'spatialDesign',
    href: '/portfolio',
    image: '/images/flagship/acscent-wow.webp',
    caption: { ko: "직영 공간 · AC'SCENT WOW", en: "Our own space · AC'SCENT WOW" },
  },
  {
    key: 'mediaArt',
    href: '/services?pillar=ai-immersive',
    image: '/images/portfolio/cross-the-line-1.webp',
    caption: { ko: '운영 사례 · CROSS THE LINE', en: 'CROSS THE LINE' },
  },
  {
    key: 'custom',
    href: '/portfolio',
    image: '/images/portfolio/jimff-2026-ost-fair-1.webp',
    caption: { ko: '운영 사례 · 제천국제음악영화제 2026', en: 'JIMFF 2026' },
  },
];

/** 온라인 견적에 해당 상품을 담은 채로 여는 주소 */
export const quoteHrefFor = (key: ServiceKey) => ({ pathname: '/quote' as const, query: { item: key } });
