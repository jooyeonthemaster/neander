import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SectionHeader } from '@/components/ui';
import { ScrollReveal } from '@/components/animations';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portfolio' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portfolio' });

  return (
    <main>
      {/* Hero banner */}
      <section
        className="relative overflow-hidden bg-slate-950 pb-20 pt-32 sm:pb-28 sm:pt-40"
        aria-labelledby="portfolio-hero-title"
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(135deg, white 25%, transparent 25%), linear-gradient(225deg, white 25%, transparent 25%), linear-gradient(45deg, white 25%, transparent 25%), linear-gradient(315deg, white 25%, transparent 25%)',
            backgroundSize: '40px 40px',
            backgroundPosition: '20px 0, 20px 0, 0 0, 0 0',
          }}
          aria-hidden="true"
        />

        {/* Gradient accents */}
        <div
          className="absolute left-0 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/8 blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 h-[300px] w-[300px] translate-x-1/4 translate-y-1/4 rounded-full bg-cyan-500/6 blur-[80px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              category={t('title')}
              title={t('subtitle')}
              subtitle={t('description')}
              align="center"
              className="max-w-3xl [&_h2]:text-white [&_p]:text-slate-400 [&_span]:text-teal-400"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Portfolio grid section */}
      <section className="py-16 sm:py-24" aria-labelledby="portfolio-grid-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="portfolio-grid-title" className="sr-only">
            {t('title')}
          </h2>
          <PortfolioGrid />
        </div>
      </section>
    </main>
  );
}
