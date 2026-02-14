import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ScrollReveal } from '@/components/animations';
import {
  experiences,
  getAllSlugs,
  getExperienceBySlug,
  getExperiencesByPillar,
  getExperiencesByIndustry,
  getPillarById,
  getIndustryById,
} from '@/data/experiences';
import { ExperienceDetailClient } from './ExperienceDetailClient';
import { hasDemoForSlug } from '@/data/demo-registry';
import { DemoSection } from '@/components/demo/DemoSection';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const exp = getExperienceBySlug(slug);
  if (!exp) return { title: 'Not Found' };

  const t = await getTranslations({ locale, namespace: 'services' });

  return {
    title: t(exp.nameKey),
    description: t(exp.oneLinerKey),
    openGraph: {
      title: t(exp.nameKey),
      description: t(exp.oneLinerKey),
    },
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const exp = getExperienceBySlug(slug);
  if (!exp) notFound();

  const t = await getTranslations({ locale, namespace: 'services' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const pillar = getPillarById(exp.pillar);
  const industry = getIndustryById(exp.industry);

  /* -- Related experiences -------------------------------- */
  const relatedByPillar = getExperiencesByPillar(exp.pillar)
    .filter((e) => e.id !== exp.id)
    .slice(0, 3);

  const relatedByIndustry = getExperiencesByIndustry(exp.industry)
    .filter((e) => e.id !== exp.id && !relatedByPillar.find((r) => r.id === e.id))
    .slice(0, 3);

  const related = [...relatedByPillar, ...relatedByIndustry].slice(0, 4);

  /* -- Pre-translate all strings -------------------------- */
  const name = t(exp.nameKey);
  const oneLiner = t(exp.oneLinerKey);
  const description = t(exp.descriptionKey);

  const features: string[] = [];
  for (let i = 0; i < exp.featureCount; i++) {
    features.push(t(`${exp.featuresKey}.${i}`));
  }

  const processSteps: { title: string; description: string }[] = [];
  for (let i = 0; i < exp.processStepCount; i++) {
    processSteps.push({
      title: t(`${exp.processStepsKey}.${i}.title`),
      description: t(`${exp.processStepsKey}.${i}.description`),
    });
  }

  const highlights: { value: string; label: string }[] = [];
  for (let i = 0; i < exp.highlightCount; i++) {
    highlights.push({
      value: t(`${exp.highlightsKey}.${i}.value`),
      label: t(`${exp.highlightsKey}.${i}.label`),
    });
  }

  const useCases: { title: string; description: string }[] = [];
  for (let i = 0; i < exp.useCaseCount; i++) {
    useCases.push({
      title: t(`${exp.useCasesKey}.${i}.title`),
      description: t(`${exp.useCasesKey}.${i}.description`),
    });
  }

  const pillarName = pillar ? t(pillar.nameKey) : '';
  const pillarColor = pillar?.color ?? '#0D9488';
  const industryName = industry ? t(industry.nameKey) : '';

  /* -- Demo section labels -------------------------------- */
  const hasDemo = hasDemoForSlug(slug);
  let demoLabels:
    | {
        sectionTitle: string;
        sectionSubtitle: string;
        tryDemoLabel: string;
        labels: {
          back: string;
          next: string;
          seeResult: string;
          analyzing: string;
          analyzingSubtitle: string;
          complete: string;
        };
      }
    | undefined;

  if (hasDemo) {
    const tDemo = await getTranslations({ locale, namespace: 'demos' });
    demoLabels = {
      sectionTitle: tDemo('sectionTitle'),
      sectionSubtitle: tDemo('sectionSubtitle'),
      tryDemoLabel: tDemo('tryDemo'),
      labels: {
        back: tDemo('common.back'),
        next: tDemo('common.next'),
        seeResult: tDemo('common.seeResult'),
        analyzing: tDemo('common.analyzing'),
        analyzingSubtitle: tDemo('common.analyzingSubtitle'),
        complete: tDemo('common.complete'),
      },
    };
  }

  const relatedData = related.map((r) => {
    const rPillar = getPillarById(r.pillar);
    return {
      slug: r.slug,
      name: t(r.nameKey),
      oneLiner: t(r.oneLinerKey),
      pillarId: r.pillar,
      pillarName: rPillar ? t(rPillar.nameKey) : '',
      pillarColor: rPillar?.color ?? '#0D9488',
    };
  });

  return (
    <main>
      {/* ══════════════════════════════════════════════════════
          1. HERO SECTION
          ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 pb-20 pt-32 sm:pb-28 sm:pt-44">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
          aria-hidden="true"
        />

        {/* Large colored glow */}
        <div
          className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full"
          style={{
            backgroundColor: pillarColor,
            opacity: 0.08,
            filter: 'blur(160px)',
          }}
          aria-hidden="true"
        />

        {/* Secondary glow, offset */}
        <div
          className="absolute right-0 bottom-0 h-[300px] w-[400px] rounded-full"
          style={{
            backgroundColor: pillarColor,
            opacity: 0.05,
            filter: 'blur(120px)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            {/* Breadcrumb */}
            <nav
              className="mb-8 flex items-center justify-center gap-2 text-sm"
              aria-label="Breadcrumb"
            >
              <a
                href={`/${locale}/services`}
                className="text-slate-500 transition-colors duration-200 hover:text-white"
              >
                {t('backToServices')}
              </a>
              <svg
                className="h-3.5 w-3.5 text-slate-600"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
              <span className="text-slate-400">{pillarName}</span>
              <svg
                className="h-3.5 w-3.5 text-slate-600"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
              <span className="text-slate-300 font-medium">{name}</span>
            </nav>

            <div className="text-center">
              {/* Badges */}
              <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: pillarColor }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-white/60"
                    aria-hidden="true"
                  />
                  {pillarName}
                </span>
                <span
                  className="inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide text-slate-400"
                  style={{ borderColor: `${pillarColor}40` }}
                >
                  {industryName}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {name}
              </h1>

              {/* Subtitle */}
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
                {oneLiner}
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href={`/${locale}/contact`}
                  className="group inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  style={{
                    backgroundColor: pillarColor,
                    boxShadow: `0 8px 32px ${pillarColor}30`,
                  }}
                >
                  {t('inquiryBtn')}
                  <svg
                    className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
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
                </a>
                <a
                  href={`/${locale}/quote`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-8 py-4 text-base font-semibold text-slate-300 transition-all duration-300 hover:border-slate-500 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  style={{ borderColor: `${pillarColor}30` }}
                >
                  {t('ctaQuote')}
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom edge fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${pillarColor}30, transparent)`,
          }}
          aria-hidden="true"
        />
      </section>

      {/* ══════════════════════════════════════════════════════
          1.5 INTERACTIVE DEMO
          ══════════════════════════════════════════════════════ */}
      {hasDemo && demoLabels && (
        <DemoSection
          slug={slug}
          pillarColor={pillarColor}
          sectionTitle={demoLabels.sectionTitle}
          sectionSubtitle={demoLabels.sectionSubtitle}
          tryDemoLabel={demoLabels.tryDemoLabel}
          labels={demoLabels.labels}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          2. DESCRIPTION + HIGHLIGHT STATS
          ══════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28">
        {/* Subtle top glow bleed from hero */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[200px] w-[600px] rounded-full"
          style={{
            backgroundColor: pillarColor,
            opacity: 0.03,
            filter: 'blur(100px)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Description */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <div
                  className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  style={{ color: pillarColor }}
                >
                  <span
                    className="h-px w-8"
                    style={{ backgroundColor: pillarColor }}
                    aria-hidden="true"
                  />
                  Overview
                </div>
                <p className="font-body text-lg leading-[1.85] text-slate-600 sm:text-xl">
                  {description}
                </p>
              </ScrollReveal>
            </div>

            {/* Highlight Stats */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={0.15}>
                <div className="grid grid-cols-1 gap-4">
                  {highlights.map((highlight, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-md"
                      style={{
                        backgroundColor: `${pillarColor}06`,
                        borderColor: `${pillarColor}15`,
                      }}
                    >
                      <div
                        className="absolute top-0 right-0 h-16 w-16 -translate-y-1/2 translate-x-1/2 rounded-full opacity-20 blur-2xl"
                        style={{ backgroundColor: pillarColor }}
                        aria-hidden="true"
                      />
                      <div className="relative">
                        <p
                          className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
                          style={{ color: pillarColor }}
                        >
                          {highlight.value}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {highlight.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. PROCESS STEPS
          ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-28">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${pillarColor}, ${pillarColor} 1px, transparent 1px, transparent 40px)`,
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <div
                className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: pillarColor }}
              >
                <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
                Process
                <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {t('detailProcessTitle')}
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-0">
            <div
              className="absolute top-[60px] left-[16.67%] right-[16.67%] hidden h-px lg:block"
              style={{
                background: `linear-gradient(to right, transparent, ${pillarColor}30, ${pillarColor}30, transparent)`,
              }}
              aria-hidden="true"
            />

            {processSteps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className="relative flex flex-col items-center text-center lg:px-8">
                  <div
                    className="relative z-10 mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-lg"
                    style={{
                      backgroundColor: pillarColor,
                      boxShadow: `0 8px 24px ${pillarColor}25`,
                    }}
                  >
                    <span className="font-display">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-display mb-3 text-xl font-bold tracking-tight text-slate-900">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-slate-500 max-w-xs">
                    {step.description}
                  </p>
                  {i < processSteps.length - 1 && (
                    <div className="mt-6 flex justify-center lg:hidden" aria-hidden="true">
                      <svg className="h-6 w-6 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. FEATURES
          ══════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <div
                className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: pillarColor }}
              >
                <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
                Features
                <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {t('features')}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <div className="group relative flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:border-transparent hover:shadow-lg">
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `linear-gradient(135deg, ${pillarColor}05, ${pillarColor}08)` }}
                    aria-hidden="true"
                  />
                  <div className="relative shrink-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${pillarColor}10` }}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ color: pillarColor }} aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="relative font-body pt-2 text-base font-medium text-slate-700 leading-relaxed">
                    {feature}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. USE CASES
          ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-28">
        <div
          className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full"
          style={{ backgroundColor: pillarColor, opacity: 0.04, filter: 'blur(120px)' }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <div
                className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: pillarColor }}
              >
                <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
                Use Cases
                <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {t('useCasesTitle')}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {useCases.map((useCase, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div
                  className="relative overflow-hidden rounded-2xl border bg-white p-8 transition-all duration-300 hover:shadow-lg"
                  style={{ borderColor: `${pillarColor}15` }}
                >
                  <div
                    className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                    style={{ backgroundColor: pillarColor }}
                    aria-hidden="true"
                  />
                  <div
                    className="mb-5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                    style={{ backgroundColor: `${pillarColor}15`, color: pillarColor }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-display mb-3 text-lg font-bold tracking-tight text-slate-900">
                    {useCase.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-slate-500">
                    {useCase.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. CTA SECTION
          ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full"
          style={{ backgroundColor: pillarColor, opacity: 0.08, filter: 'blur(140px)' }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <div
              className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `${pillarColor}15`,
                boxShadow: `0 0 40px ${pillarColor}20`,
              }}
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: pillarColor }}
                aria-hidden="true"
              />
            </div>

            <h2 className="font-display mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t('ctaInquiryTitle')}
            </h2>
            <p className="mb-10 text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
              {t('ctaInquirySubtitle')}
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href={`/${locale}/contact`}
                className="group inline-flex items-center gap-2.5 rounded-xl px-10 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                style={{
                  backgroundColor: pillarColor,
                  boxShadow: `0 8px 32px ${pillarColor}30`,
                }}
              >
                {t('inquiryBtn')}
                <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href={`/${locale}/quote`}
                className="inline-flex items-center gap-2 rounded-xl border px-10 py-4 text-base font-semibold text-slate-300 transition-all duration-300 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                style={{ borderColor: `${pillarColor}30` }}
              >
                {t('ctaQuote')}
              </a>
            </div>
          </ScrollReveal>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${pillarColor}20, transparent)` }}
          aria-hidden="true"
        />
      </section>

      {/* ══════════════════════════════════════════════════════
          7. RELATED EXPERIENCES
          ══════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mb-12 text-center">
                <div
                  className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  style={{ color: pillarColor }}
                >
                  <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
                  More
                  <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
                </div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {t('relatedExperiences')}
                </h2>
              </div>
            </ScrollReveal>
            <ExperienceDetailClient related={relatedData} viewDetailLabel={t('viewDetail')} />
          </div>
        </section>
      )}
    </main>
  );
}
