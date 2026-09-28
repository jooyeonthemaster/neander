import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ScrollReveal, TextReveal } from '@/components/animations';
import { Timeline } from '@/components/about/Timeline';
import { ValuesSection } from '@/components/about/ValuesSection';
import { BusinessDivisions } from '@/components/about/BusinessDivisions';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    alternates: localeAlternates('/about', locale),
    title: t('title'),
    description: t('mission.content'),
    openGraph: {
      title: t('title'),
      description: t('mission.content'),
      images: [DEFAULT_OG_IMAGE],
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
        className="relative isolate overflow-hidden bg-slate-950"
        aria-labelledby="about-hero-title"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 sm:pt-20 lg:flex lg:min-h-[640px] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-xl lg:max-w-[52%]">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              {t('title')}
            </p>
            <h1
              id="about-hero-title"
              className="text-balance break-keep text-4xl font-bold leading-[1.2] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              {t('subtitle')}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
              {t('company.business')}
            </p>
          </div>
        </div>

        <div className="relative aspect-[4/3] sm:aspect-video lg:absolute lg:inset-0 lg:aspect-auto">
          <Image
            src="/images/about/about-event-hero.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-right lg:object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-950/95 lg:via-slate-950/40 lg:to-transparent"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-20 sm:py-28" aria-labelledby="mission-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <ScrollReveal className="lg:col-start-2 lg:row-start-1">
              <div>
                <h2 id="mission-title" className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">
                  {t('mission.title')}
                </h2>
                <div className="text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl">
                  <TextReveal text={t('mission.content')} />
                </div>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-8">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-teal-600">
                  {t('vision.title')}
                </h3>
                <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                  {t('vision.content')}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="lg:col-start-1 lg:row-start-1">
              <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <Image
                  src="/images/about/experience-design.webp"
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 576px, (min-width: 1024px) 46vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                  className="object-cover"
                />
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
            <h2 id="values-title" className="mb-14 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {t('values.title')}
            </h2>
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
            <h2 id="timeline-title" className="mb-16 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {t('timeline.title')}
            </h2>
          </ScrollReveal>

          <div className="mx-auto max-w-5xl">
            <Timeline />
          </div>
        </div>
      </section>

      {/* Team teaser */}
      <section className="py-20 sm:py-28" aria-labelledby="team-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="overflow-hidden rounded-3xl bg-slate-950">
            <div className="grid lg:grid-cols-2">
              <div className="relative aspect-[3/2] bg-slate-800 lg:aspect-auto lg:min-h-[400px]">
                <Image
                  src="/images/about/collaboration-studio.webp"
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 608px, (min-width: 1024px) 48vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-start justify-center p-8 sm:p-12 lg:p-14">
                <h2
                  id="team-title"
                  className="mb-5 text-3xl font-bold tracking-tight text-white sm:text-4xl"
                >
                  {t('team.title')}
                </h2>
                <p className="mb-8 text-base leading-relaxed text-slate-300 sm:text-lg">
                  {t('team.description')}
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
