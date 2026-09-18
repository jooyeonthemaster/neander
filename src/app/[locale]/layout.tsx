import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider';
import CustomCursor from '@/components/layout/CustomCursor';

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
    },
    robots: {
      index: true,
      follow: true,
    },
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
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
