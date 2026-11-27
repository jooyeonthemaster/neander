import type { Metadata } from 'next';
import { HomeHero, HomeServices, HomeStatement, HomeStore, HomeStudio, HomeWork } from '@/components/home';
import { JsonLd } from '@/components/seo/JsonLd';
import { CORE_SERVICES } from '@/data/site';
import { SITE_URL } from '@/lib/constants';
import { SERVICE_TEXT } from '@/lib/quote/catalog';
import { startingPrice } from '@/lib/quote/engine';
import { localeAlternates, localePath } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localeAlternates('/', locale) };
}

/* 홈 구역 순서는 방문 기록을 따른다 (2026-09~11):
   홈에서 다음으로 가는 곳이 체험 서비스(18%) · 포트폴리오(16%) · 회사 소개(11%) 순이고,
   홈 스크롤 중앙값이 PC 40% · 휴대폰 20% 라 중요한 것을 위에 둔다. 문의 구역은 바닥글이 맡는다. */
/* 홈 구조화 데이터 (2026-11-27): ChatGPT 가 답하며 가장 많이 여는 페이지가 홈이다.
   회사 정보(Organization)는 layout 에 있고, 여기에는 「무엇을 얼마부터」를 주력 3종 목록과 시작가로 붙인다.
   금액은 온라인 견적과 같은 startingPrice — 상품 화면(ProductPage)의 Service 와 같은 모양. */
function homeJsonLd(locale: string) {
  const lang = locale === 'en' ? 'en' : 'ko';
  const provider = { '@type': 'Organization', name: lang === 'ko' ? '네안데르' : 'NEANDER', url: SITE_URL };
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: lang === 'ko' ? '네안데르 — 체험형 AI 콘텐츠 기획사' : 'NEANDER — AI experience studio',
      url: `${SITE_URL}${localePath('/', locale)}`,
      inLanguage: lang,
      publisher: provider,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: lang === 'ko' ? '네안데르 주력 체험 서비스' : 'NEANDER core experiences',
      itemListElement: CORE_SERVICES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Service',
          name: SERVICE_TEXT[s.key].name[lang],
          description: `${s.line[lang]} ${SERVICE_TEXT[s.key].summary[lang]}`,
          url: `${SITE_URL}${localePath(s.href, locale)}`,
          provider,
          areaServed: { '@type': 'Country', name: lang === 'ko' ? '대한민국' : 'South Korea' },
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}${localePath(`/quote?item=${s.key}`, locale)}`,
            priceCurrency: 'KRW',
            priceSpecification: { '@type': 'PriceSpecification', minPrice: startingPrice(s.key), priceCurrency: 'KRW', valueAddedTaxIncluded: false },
          },
        },
      })),
    },
  ];
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <JsonLd data={homeJsonLd(locale)} />
      <HomeHero />
      <HomeServices />
      <HomeWork />
      <HomeStatement />
      <HomeStudio />
      <HomeStore />
    </>
  );
}
