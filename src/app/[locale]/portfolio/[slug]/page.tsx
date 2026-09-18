import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { portfolioProjects } from '@/data/portfolio';
import { services } from '@/data/services';
import { fetchPublishedPortfolio } from '@/lib/firebase/rest';
import { ScrollReveal } from '@/components/animations';
import { Badge } from '@/components/ui';
import { Link } from '@/i18n/navigation';

// 관리자 페이지에서 수정한 내용이 5분 안에 반영되도록 ISR 적용
export const revalidate = 300;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: 'online' | 'offline' | 'service' | 'ip';
  tags: string[];
  heroImage: string;
  images: string[];
  client: string;
  location: string;
  services: string[];
  result: string | null;
}

// Firestore(관리자 CMS)를 우선 사용하고, 읽기에 실패하면 정적 데이터로 대체한다.
// 초기 7개 프로젝트는 번역 파일에 있는 날짜·태그·결과 문구를 보조로 사용한다.
async function getCaseStudies(locale: string): Promise<CaseStudy[]> {
  const t = await getTranslations({ locale, namespace: 'portfolio' });
  const items = await fetchPublishedPortfolio();

  const legacy = (slug: string) => {
    const project = portfolioProjects.find((p) => p.slug === slug);
    if (!project) return null;
    const key = `projects.${project.titleKey}`;
    return {
      project,
      title: t(`${key}.title`),
      description: t(`${key}.description`),
      date: t(`${key}.date`),
      tags: t.raw(`${key}.tags`) as string[],
      result: t(`${key}.result`),
    };
  };

  if (!items || items.length === 0) {
    return portfolioProjects.map((project) => {
      const l = legacy(project.slug)!;
      return {
        slug: project.slug,
        title: l.title,
        description: l.description,
        date: l.date,
        category: project.category,
        tags: l.tags,
        heroImage: project.image,
        images: project.images,
        client: project.client,
        location: project.location,
        services: project.services,
        result: l.result,
      };
    });
  }

  return items.map((item) => {
    const l = legacy(item.slug);
    const result = locale === 'ko' ? item.result_ko : item.result_en;
    return {
      slug: item.slug,
      title: locale === 'ko' ? item.title_ko : item.title_en,
      description: locale === 'ko' ? item.description_ko : item.description_en,
      date: item.period || l?.date || String(item.year),
      category: item.category,
      tags: l?.tags ?? item.tags ?? [],
      heroImage: item.thumbnail || item.images?.[0] || '',
      images: item.images ?? [],
      client: item.client,
      location: item.location ?? '',
      services: item.services ?? [],
      result: result || l?.result || null,
    };
  });
}

export async function generateStaticParams() {
  const items = await fetchPublishedPortfolio();
  const slugs = items && items.length > 0 ? items.map((i) => i.slug) : portfolioProjects.map((p) => p.slug);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const study = (await getCaseStudies(locale)).find((s) => s.slug === slug);
  if (!study) return {};

  return {
    title: study.title,
    description: study.description,
    openGraph: {
      title: study.title,
      description: study.description,
      ...(study.heroImage ? { images: [study.heroImage] } : {}),
    },
  };
}

export default async function PortfolioCaseStudyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const studies = await getCaseStudies(locale);
  const currentIndex = studies.findIndex((s) => s.slug === slug);

  if (currentIndex === -1) {
    notFound();
  }

  const project = studies[currentIndex];
  const t = await getTranslations({ locale, namespace: 'portfolio' });
  const tServices = await getTranslations({ locale, namespace: 'services' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Find next project for navigation
  const nextProject =
    studies.length > 1 ? studies[(currentIndex + 1) % studies.length] : null;

  // Map service IDs to their translated names
  const usedServices = project.services
    .map((sKey) => {
      const svc = services.find((s) => s.key === sKey);
      if (!svc || !tServices.has(`items.${sKey}.shortTitle`)) return null;
      return {
        key: sKey,
        name: tServices(`items.${sKey}.shortTitle`),
        icon: svc.icon,
      };
    })
    .filter(Boolean);

  return (
    <main>
      {/* Full-width hero image */}
      <section
        className="relative overflow-hidden bg-slate-950 pb-16 pt-28 sm:pb-20 sm:pt-36"
        aria-labelledby="case-study-title"
      >
        {/* Background hero image */}
        {project.heroImage ? (
          <img
            src={project.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950"
            aria-hidden="true"
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb nav */}
          <ScrollReveal>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link
                    href="/portfolio"
                    className="text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm"
                  >
                    {t('title')}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <svg className="h-4 w-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <span className="text-white" aria-current="page">
                    {project.title}
                  </span>
                </li>
              </ol>
            </nav>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="max-w-3xl">
              {/* Category + year */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant="teal" className="bg-teal-500/20 text-teal-300">
                  {t(`filterCategories.${project.category}`)}
                </Badge>
                <span className="text-sm text-slate-400">
                  {project.date}
                </span>
              </div>

              {/* Title */}
              <h1
                id="case-study-title"
                className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
              >
                {project.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} className="border border-white/10 bg-white/5 text-slate-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Project details */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Description */}
              <ScrollReveal>
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-line text-lg leading-relaxed text-slate-600">
                    {project.description}
                  </p>
                </div>
              </ScrollReveal>

              {/* Result highlight */}
              {project.result && (
                <ScrollReveal delay={0.15}>
                  <div className="mt-10 rounded-2xl border border-teal-100 bg-teal-50 p-6 sm:p-8">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-teal-700">
                      {t('detail.result')}
                    </h2>
                    <p className="text-lg font-medium text-teal-900">
                      {project.result}
                    </p>
                  </div>
                </ScrollReveal>
              )}

              {/* Image gallery */}
              {project.images.length > 0 && (
                <ScrollReveal delay={0.2}>
                  <div className="mt-12">
                    <h2 className="mb-6 text-xl font-bold text-slate-900">
                      {t('detail.gallery')}
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {project.images.map((imgSrc, i) => (
                        <div
                          key={i}
                          className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                        >
                          <img
                            src={imgSrc}
                            alt={`${project.title} - ${i + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </div>

            {/* Sidebar metadata */}
            <div className="lg:col-span-1">
              <ScrollReveal direction="right">
                <div className="sticky top-28 space-y-8">
                  {/* Project info card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-base font-bold text-slate-900">
                      {t('detail.projectDetails')}
                    </h2>

                    <dl className="space-y-4">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          {t('detail.client')}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {project.client}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          {t('detail.date')}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {project.date}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          {t('detail.location')}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {project.location}
                        </dd>
                      </div>

                      <div>
                        <dt className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                          {t('detail.services')}
                        </dt>
                        <dd>
                          <div className="flex flex-wrap gap-2">
                            {usedServices.map((svc) =>
                              svc ? (
                                <Badge key={svc.key} variant="teal">
                                  <span className="mr-1" aria-hidden="true">
                                    {svc.icon}
                                  </span>
                                  {svc.name}
                                </Badge>
                              ) : null
                            )}
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* CTA */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <p className="mb-4 text-sm text-slate-600">
                      {t('detail.ctaTitle')}
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                    >
                      {t('detail.ctaButton')}
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation: Back + Next project */}
      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm"
            >
              {t('detail.backToList')}
            </Link>

            {nextProject && (
              <Link
                href={`/portfolio/${nextProject.slug}`}
                className="group inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition-all duration-200 hover:border-teal-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <div className="text-right">
                  <span className="block text-xs text-slate-400">
                    {tCommon('next')}
                  </span>
                  <span className="block text-sm font-medium text-slate-900 transition-colors group-hover:text-teal-600">
                    {nextProject.title}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
