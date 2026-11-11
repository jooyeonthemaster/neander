/* ─────────────────────────────────────────────────────────
   서비스 상세(/services/[slug])의 검색 문구와 구조화 데이터.
   체험 이름(예: 「AI 향수 소울메이트」)은 아무도 검색하지 않으므로,
   제목·설명에 행사 담당자가 실제로 찾는 말(포토부스 대여, 체험 부스, 행사 운영)을 붙인다.
   가격은 온라인 견적 카탈로그(src/lib/quote/catalog.ts)의 시작가만 쓴다.
   ───────────────────────────────────────────────────────── */

import { SITE_URL } from '@/lib/constants';
import { localePath } from '@/lib/seo';
import { serviceForExperience, startingPrice } from '@/lib/quote/engine';
import { formatPrice } from '@/lib/quote/format';

type Lang = 'ko' | 'en';

const PHRASES: Record<string, Record<Lang, string>> = {
  acscent: { ko: '행사·팝업 AI 향수 만들기 체험', en: 'AI Perfume-Making Experience for Events' },
  photoBooth: { ko: 'AI 포토부스 대여·행사 운영', en: 'AI Photo Booth Rental for Events' },
  'rental:ai-fortune': { ko: 'AI 운세 체험 키오스크 대여', en: 'AI Fortune Kiosk Rental for Events' },
  'rental:ai-diagnosis': { ko: 'AI 진단 체험 부스 대여', en: 'AI Analysis Booth Rental for Events' },
  rental: { ko: 'AI 체험 키오스크 행사 대여', en: 'AI Experience Kiosk Rental for Events' },
  mediaArt: { ko: '인터랙티브 미디어아트 체험 제작·운영', en: 'Interactive Media Art Experience' },
};

function phraseKey(slug: string, pillar: string): string {
  const service = serviceForExperience(slug, pillar) ?? 'rental';
  if (service === 'rental' && PHRASES[`rental:${pillar}`]) return `rental:${pillar}`;
  return service;
}

/** 검색 결과 제목 — "AI 향수 소울메이트 — 행사·팝업 AI 향수 만들기 체험" */
export function serviceSearchTitle(name: string, slug: string, pillar: string, locale: string): string {
  const lang: Lang = locale === 'en' ? 'en' : 'ko';
  return `${name} — ${PHRASES[phraseKey(slug, pillar)][lang]}`;
}

/** 검색 결과 설명 — 한 줄 소개 + 어디에 쓰는지 + 시작가 + 온라인 견적 */
export function serviceSearchDescription(oneLiner: string, slug: string, pillar: string, locale: string): string {
  const service = serviceForExperience(slug, pillar);
  const price = service ? startingPrice(service) : 0;
  const lead = oneLiner.replace(/[.!。]\s*$/, '');
  if (locale === 'en') {
    const from = price ? ` From ${formatPrice(price, 'en')} (excl. VAT, Seoul).` : '';
    return `${lead}. We bring the equipment and on-site staff to pop-ups, corporate events, festivals and exhibitions across Korea.${from} Check the price instantly with our online estimate.`;
  }
  const from = price ? ` ${formatPrice(price, 'ko')}부터(VAT 별도, 서울 기준),` : '';
  return `${lead}. 팝업·기업 행사·축제·전시 현장에 장비와 운영 인력을 함께 보내 드립니다.${from} 온라인 견적으로 금액을 바로 확인하세요.`;
}

/** schema.org Service + BreadcrumbList */
export function serviceJsonLd(opts: {
  name: string;
  description: string;
  slug: string;
  pillar: string;
  locale: string;
  servicesLabel: string;
}): Record<string, unknown>[] {
  const { name, description, slug, pillar, locale, servicesLabel } = opts;
  const lang: Lang = locale === 'en' ? 'en' : 'ko';
  const url = `${SITE_URL}${localePath(`/services/${slug}`, locale)}`;
  const service = serviceForExperience(slug, pillar);
  const price = service ? startingPrice(service) : 0;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name,
      description,
      serviceType: PHRASES[phraseKey(slug, pillar)][lang],
      url,
      provider: { '@type': 'Organization', name: lang === 'en' ? 'NEANDER' : '네안데르', url: SITE_URL },
      areaServed: { '@type': 'Country', name: lang === 'en' ? 'South Korea' : '대한민국' },
      ...(price
        ? {
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}${localePath('/quote', locale)}`,
              priceCurrency: 'KRW',
              priceSpecification: {
                '@type': 'PriceSpecification',
                minPrice: price,
                priceCurrency: 'KRW',
                valueAddedTaxIncluded: false,
              },
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: servicesLabel, item: `${SITE_URL}${localePath('/services', locale)}` },
        { '@type': 'ListItem', position: 2, name, item: url },
      ],
    },
  ];
}

/** 서비스 상세에서 이어 줄 구매 의도 랜딩 (가격·조건·FAQ 정리 페이지, src/data/insights-landings.ts) */
export function serviceLanding(slug: string, pillar: string, locale: string): { href: string; text: string } | null {
  const service = serviceForExperience(slug, pillar);
  const en = locale === 'en';
  if (service === 'photoBooth') return { href: '/insights/ai-photo-booth-rental', text: en ? 'AI photo booth rental: prices and terms →' : 'AI 포토부스 대여 가격·조건 보기 →' };
  if (service === 'acscent') return { href: '/insights/event-ai-perfume-experience', text: en ? 'AI perfume experience: prices and terms →' : 'AI 향수 체험 가격·조건 보기 →' };
  if (service === 'rental' && pillar === 'ai-fortune') return { href: '/insights/ai-fortune-kiosk-rental', text: en ? 'AI fortune kiosk rental: prices and terms →' : 'AI 사주·관상 키오스크 대여 가격·조건 보기 →' };
  if (service === 'rental') return { href: '/insights/event-ai-experience-cost-guide-2026', text: en ? 'AI kiosk prices and options →' : 'AI 키오스크 가격·옵션 보기 →' };
  return null;
}
