import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { IndustryShowcase } from '@/components/services/IndustryShowcase';
import { ServiceCTA } from '@/components/services/ServiceCTA';
import { PricingGuide } from '@/components/services/PricingGuide';
import { EventGuides } from '@/components/services/EventGuides';
import { type PillarId } from '@/data/experiences';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

const VALID_PILLARS: PillarId[] = ['ai-photo', 'ai-diagnosis', 'ai-fortune', 'ai-creative', 'ai-immersive'];

// 히어로: 향수 바 · AI 키오스크 · AI 포토부스가 함께 있는 행사장을 그린 생성 이미지(실제 기기 사진 참고).
// 실제 행사 사진이 아니므로 카드의 콘셉트 이미지처럼 「체험 콘셉트 이미지」로 표시한다.
const HERO_IMAGE = '/images/services/services-hero-concept.webp';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pillar?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });

  return {
    alternates: localeAlternates('/services', locale),
    // 화면 제목(「서비스」)과 달리 검색 결과에는 행사 담당자가 찾는 말을 쓴다
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ServicesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { pillar: pillarParam } = await searchParams;
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

        {/* 생성 이미지라 카드와 같은 규칙으로 「체험 콘셉트 이미지」를 붙인다 */}
        <figure className="relative aspect-[4/3] sm:aspect-video lg:absolute lg:inset-0 lg:aspect-auto">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center lg:object-[50%_55%]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-950/95 lg:via-slate-950/40 lg:to-transparent"
            aria-hidden="true"
          />
          <figcaption className="absolute bottom-3 right-4 rounded bg-slate-950/60 px-2 py-0.5 text-[11px] font-medium text-white/90 sm:right-6 lg:bottom-5 lg:right-8">
            {t('photoConcept')}
          </figcaption>
        </figure>
      </section>

      {/* ── Industry Showcase (Main Selling Section) ──── */}
      <IndustryShowcase key={initialPillar ?? 'all'} initialPillar={initialPillar} />

      {/* ── 행사별 안내 (인사이트의 서비스 안내 페이지, 주소는 /insights 그대로) ── */}
      <EventGuides locale={locale} />

      {/* ── 비용·운영 안내 ─────────────────────────────── */}
      <PricingGuide locale={locale} variant="compact" />

      {/* ── CTA ─────────────────────────────────────────── */}
      <ServiceCTA />
    </main>
  );
}
