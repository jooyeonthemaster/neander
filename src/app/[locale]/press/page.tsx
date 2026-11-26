import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PressGrid } from '@/components/press/PressGrid';
import { PRESS_ARTICLES } from '@/lib/press-data';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';
import { PageHero } from '@/components/site/PageHero';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'press' });

  return {
    alternates: localeAlternates('/press', locale),
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PressPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'press' });

  return (
    <main>
      {/* Hero banner */}
      <PageHero
        id="press-hero-title"
        label="PRESS · NEWSROOM"
        en={['IN THE', 'NEWS.']}
        ko={`${t('title')} — ${t('subtitle')}`}
        size="h1"
      />

      {/* Press articles grid */}
      <section className="bg-ink pb-[clamp(4rem,9vw,8rem)] pt-4" aria-labelledby="press-articles-title">
        <div className="wrap">
          <h2 id="press-articles-title" className="sr-only">
            {t('title')}
          </h2>
          <PressGrid articles={PRESS_ARTICLES} />
        </div>
      </section>
    </main>
  );
}
