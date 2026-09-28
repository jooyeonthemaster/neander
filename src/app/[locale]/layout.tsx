import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';
import { COMPANY_NAME_EN, COMPANY_NAME_KO, CONTACT, SITE_URL, SOCIAL_LINKS } from '@/lib/constants';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider';
import CustomCursor from '@/components/layout/CustomCursor';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';

/* ─────────────────────────────────────────────────────────
   Locale Layout
   Server component that wraps every locale-specific page.
   Provides i18n context, font variables, smooth scroll, and
   persistent layout shell (Header, Footer, Cursor).
   ───────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    // 상대 경로 og:image 등을 운영 도메인 기준 절대 URL로 만든다
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('title'),
      template: `%s | NEANDERco.`,
    },
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      siteName: t('ogSiteName'),
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
    },
    // 서치어드바이저·서치 콘솔에서 받은 HTML 태그 인증값을 Vercel 환경변수로 넣는다
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
        ? { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
        : undefined,
    },
  };
}

// 검색엔진용 회사 정보 (schema.org Organization)
function organizationJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: locale === 'en' ? 'NEANDER' : '네안데르',
    legalName: locale === 'en' ? COMPANY_NAME_EN : COMPANY_NAME_KO,
    alternateName: ['NEANDER', 'NEANDERco.', '네안데르'],
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    email: CONTACT.email,
    telephone: CONTACT.phoneInternational,
    foundingDate: '2022',
    address: {
      '@type': 'PostalAddress',
      streetAddress: locale === 'en' ? '1F, 10-6, Dongmak-ro 36-gil' : '독막로36길 10-6 1층',
      addressLocality: locale === 'en' ? 'Mapo-gu, Seoul' : '서울특별시 마포구',
      addressCountry: 'KR',
    },
    sameAs: Object.values(SOCIAL_LINKS).filter(Boolean),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className=""
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-hidden bg-white font-body text-neutral-900 antialiased">
        <script
          type="application/ld+json"
          // JSON.stringify 결과의 '<'를 이스케이프해 스크립트 태그가 닫히지 않게 한다
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(locale)).replace(/</g, '\\u003c'),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <SmoothScrollProvider>
            <CustomCursor />
            <Header />
            {/* 페이지 이동 시 Next가 새 페이지 첫 요소로 스크롤하는데, 헤더 여백(pt)만큼 내려가 멈추지 않도록
                같은 크기의 scroll-margin을 준다 */}
            <main
              id="main-content"
              className="pt-16 lg:pt-20 [&>*:first-child]:scroll-mt-16 lg:[&>*:first-child]:scroll-mt-20"
            >
              {children}
            </main>
            <Footer />
            <AnalyticsTracker />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
