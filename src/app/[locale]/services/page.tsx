import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { IndustryShowcase } from '@/components/services/IndustryShowcase';
import { ProcessFlow } from '@/components/services/ProcessFlow';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { PricingGuide } from '@/components/services/PricingGuide';
import { type PillarId } from '@/data/experiences';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

const VALID_PILLARS: PillarId[] = ['ai-photo', 'ai-diagnosis', 'ai-fortune', 'ai-creative', 'ai-immersive'];

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pillar?: string; demo?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });

  return {
    alternates: localeAlternates('/services', locale),
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('subtitle'),
      description: t('description'),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ServicesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { pillar: pillarParam, demo: demoParam } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'services' });

  const initialPillar = VALID_PILLARS.includes(pillarParam as PillarId)
    ? (pillarParam as PillarId)
    : undefined;

  return (
    <main className="bg-neutral-950">
      {/* ── Hero ────────────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden bg-slate-950"
        aria-labelledby="services-hero-title"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 sm:pt-20 lg:flex lg:min-h-[640px] lg:items-center lg:px-8 lg:py-24">
          {/* 첫 화면(h1 포함)은 등장 애니메이션 없이 서버 HTML 그대로 보인다 — 스크립트가 늦어도 제목이 비어 보이지 않게 */}
          <div className="max-w-xl lg:max-w-[52%]">
            <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/[0.06] text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" aria-hidden="true" />
              {t('title')}
            </span>
            <h1
              id="services-hero-title"
              className="mb-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15] [word-break:keep-all]"
            >
              {t('subtitle')}
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
              {t('description')}
            </p>
            <p className="mt-6 text-xl font-semibold text-teal-300">
              {t('heroTagline')}
            </p>
          </div>
        </div>

        <div className="relative aspect-[4/3] sm:aspect-video lg:absolute lg:inset-0 lg:aspect-auto">
          <Image
            src="/images/about/about-hero.webp"
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

      {/* ── Industry Showcase (Main Selling Section) ──── */}
      <IndustryShowcase initialPillar={initialPillar} initialDemo={demoParam} />

      {/* ── Process Flow ────────────────────────────────── */}
      <ProcessFlow />

      {/* ── 비용·운영 안내 ─────────────────────────────── */}
      <PricingGuide locale={locale} variant="compact" />

      {/* ── CTA ─────────────────────────────────────────── */}
      <ServiceCTA />
    </main>
  );
}
