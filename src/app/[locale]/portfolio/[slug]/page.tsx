import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { portfolioProjects } from '@/data/portfolio';
import { services } from '@/data/services';
import { ScrollReveal } from '@/components/animations';
import { Badge } from '@/components/ui';
import { Link } from '@/i18n/navigation';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return portfolioProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = portfolioProjects.find((p) => p.slug === slug);
  if (!project) return {};

  const t = await getTranslations({ locale, namespace: 'portfolio' });

  return {
    title: t(`projects.${project.titleKey}.title`),
    description: t(`projects.${project.titleKey}.description`),
    openGraph: {
      title: t(`projects.${project.titleKey}.title`),
      description: t(`projects.${project.titleKey}.description`),
    },
  };
}

export default async function PortfolioCaseStudyPage({ params }: Props) {
  const { locale, slug } = await params;
  const project = portfolioProjects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'portfolio' });
  const tServices = await getTranslations({ locale, namespace: 'services' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Find next project for navigation
  const currentIndex = portfolioProjects.findIndex((p) => p.slug === slug);
  const nextProject =
    portfolioProjects[(currentIndex + 1) % portfolioProjects.length];

  // Map service IDs to their translated names
  const usedServices = project.services
    .map((sKey) => {
      const svc = services.find((s) => s.key === sKey);
      if (!svc) return null;
      try {
        return {
          key: sKey,
          name: tServices(`items.${sKey}.shortTitle`),
          icon: svc.icon,
        };
      } catch {
        return null;
      }
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
        <img
          src={project.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />

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
                    {t(`projects.${project.titleKey}.title`)}
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
                  {t(`projects.${project.titleKey}.date`)}
                </span>
              </div>

              {/* Title */}
              <h1
                id="case-study-title"
                className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
              >
                {t(`projects.${project.titleKey}.title`)}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {(
                  t.raw(`projects.${project.titleKey}.tags`) as string[]
                ).map((tag: string) => (
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
                  <p className="text-lg leading-relaxed text-slate-600">
                    {t(`projects.${project.titleKey}.description`)}
                  </p>
                </div>
              </ScrollReveal>

              {/* Result highlight */}
              <ScrollReveal delay={0.15}>
                <div className="mt-10 rounded-2xl border border-teal-100 bg-teal-50 p-6 sm:p-8">
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-teal-700">
                    Result
                  </h2>
                  <p className="text-lg font-medium text-teal-900">
                    {t(`projects.${project.titleKey}.result`)}
                  </p>
                </div>
              </ScrollReveal>

              {/* Image gallery placeholder */}
              <ScrollReveal delay={0.2}>
                <div className="mt-12">
                  <h2 className="mb-6 text-xl font-bold text-slate-900">
                    Gallery
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {project.images.map((imgSrc, i) => (
                      <div
                        key={i}
                        className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={imgSrc}
                          alt={`${t(`projects.${project.titleKey}.title`)} - ${i + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Sidebar metadata */}
            <div className="lg:col-span-1">
              <ScrollReveal direction="right">
                <div className="sticky top-28 space-y-8">
                  {/* Project info card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-base font-bold text-slate-900">
                      Project Details
                    </h2>

                    <dl className="space-y-4">
                      {/* Client */}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Client
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {project.client}
                        </dd>
                      </div>

                      {/* Date */}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Date
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {t(`projects.${project.titleKey}.date`)}
                        </dd>
                      </div>

                      {/* Location */}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Location
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {project.location}
                        </dd>
                      </div>

                      {/* Services */}
                      <div>
                        <dt className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                          Services
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
                      Interested in a similar project?
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                    >
                      Get in touch
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
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
            {/* Back to portfolio */}
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              {tCommon('back')} {t('title')}
            </Link>

            {/* Next project */}
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
                    {t(`projects.${nextProject.titleKey}.title`)}
                  </span>
                </div>
                <svg className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-teal-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
