import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SectionHeader } from '@/components/ui';
import { ScrollReveal, TextReveal } from '@/components/animations';
import { Timeline } from '@/components/about/Timeline';
import { ValuesSection } from '@/components/about/ValuesSection';
import { BusinessDivisions } from '@/components/about/BusinessDivisions';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('title'),
    description: t('mission.content'),
    openGraph: {
      title: t('title'),
      description: t('mission.content'),
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <main>
      {/* Hero banner */}
      <section
        className="relative overflow-hidden bg-slate-950 pb-20 pt-32 sm:pb-28 sm:pt-40"
        aria-labelledby="about-hero-title"
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />

        {/* Teal glow */}
        <div
          className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full bg-teal-500/8 blur-[100px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              category={t('title')}
              title={t('subtitle')}
              align="center"
              as="h1"
              className="max-w-3xl [&_h1]:text-white [&_span]:text-teal-400"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-20 sm:py-28" aria-labelledby="mission-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Mission */}
            <ScrollReveal>
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">
                  {t('mission.title')}
                </span>
                <h2 id="mission-title" className="sr-only">
                  {t('mission.title')}
                </h2>
                <div className="text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  <TextReveal text={t('mission.content')} className="justify-center" />
                </div>
              </div>
            </ScrollReveal>

            {/* Vision */}
            <ScrollReveal delay={0.2}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center sm:p-12">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">
                  {t('vision.title')}
                </span>
                <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                  {t('vision.content')}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Business Divisions */}
      <BusinessDivisions />

      {/* Core Values */}
      <section className="py-20 sm:py-28" aria-labelledby="values-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              category={t('values.title')}
              title={t('values.title')}
              align="center"
              className="mb-14"
            />
          </ScrollReveal>

          <div className="mx-auto max-w-4xl">
            <ValuesSection />
          </div>
        </div>
      </section>

      {/* Timeline */}
      {/* overflow-x-clip: 옆에서 밀려 들어오는 연혁 카드가 등장 전 모바일 페이지 폭을 넓히지 않도록 */}
      <section
        className="overflow-x-clip bg-slate-50 py-20 sm:py-28"
        aria-labelledby="timeline-title"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              category={t('timeline.title')}
              title={t('timeline.title')}
              align="center"
              className="mb-16"
            />
          </ScrollReveal>

          <div className="mx-auto max-w-5xl">
            <Timeline />
          </div>
        </div>
      </section>

      {/* Team teaser */}
      <section className="py-20 sm:py-28" aria-labelledby="team-title">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <ScrollReveal>
            <h2
              id="team-title"
              className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl"
            >
              {t('team.title')}
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-600 sm:text-lg">
              {t('team.description')}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
            >
              {tNav('contact')}
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
