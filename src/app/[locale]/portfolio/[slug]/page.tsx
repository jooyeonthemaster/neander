import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { portfolioProjects } from '@/data/portfolio';
import { services } from '@/data/services';
import { ScrollReveal } from '@/components/animations';
import { Badge } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { getPortfolioBySlug, getPublishedPortfolio } from '@/lib/firebase/queries';

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

  // Try Firestore first, then fallback to static
  const fsProject = await getPortfolioBySlug(slug);
  if (fsProject) {
    const title = locale === 'ko' ? fsProject.title_ko : fsProject.title_en;
    const desc = locale === 'ko' ? fsProject.description_ko : fsProject.description_en;
    return { title, description: desc, openGraph: { title, description: desc } };
  }

  const project = portfolioProjects.find((p) => p.slug === slug);
  if (!project) return {};
  const t = await getTranslations({ locale, namespace: 'portfolio' });
  return {
    title: t(`projects.${project.titleKey}.title`),
    description: t(`projects.${project.titleKey}.description`),
  };
}

export default async function PortfolioCaseStudyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'portfolio' });
  const tServices = await getTranslations({ locale, namespace: 'services' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Try Firestore
  const fsProject = await getPortfolioBySlug(slug);

  // Determine data source
  let title: string;
  let description: string;
  let images: string[];
  let heroImage: string;
  let category: string;
  let client: string;
  let location: string;
  let projectServices: string[];
  let year: number;
  let tags: string[];
  let nextSlug: string | null = null;
  let nextTitle: string | null = null;

  if (fsProject) {
    title = locale === 'ko' ? fsProject.title_ko : fsProject.title_en;
    description = locale === 'ko' ? fsProject.description_ko : fsProject.description_en;
    images = fsProject.images;
    heroImage = fsProject.thumbnail || images[0] || '';
    category = fsProject.category;
    client = fsProject.client;
    location = fsProject.location || '';
    projectServices = fsProject.services;
    year = fsProject.year;
    tags = fsProject.tags;

    // Get next project from Firestore
    const allProjects = await getPublishedPortfolio();
    const idx = allProjects.findIndex((p) => p.slug === slug);
    if (allProjects.length > 1) {
      const next = allProjects[(idx + 1) % allProjects.length];
      nextSlug = next.slug;
      nextTitle = locale === 'ko' ? next.title_ko : next.title_en;
    }
  } else {
    // Fallback to static data
    const project = portfolioProjects.find((p) => p.slug === slug);
    if (!project) notFound();

    title = t(`projects.${project.titleKey}.title`);
    description = t(`projects.${project.titleKey}.description`);
    images = project.images;
    heroImage = project.image;
    category = project.category;
    client = project.client;
    location = project.location;
    projectServices = project.services;
    year = project.year;
    tags = project.tags;

    const currentIndex = portfolioProjects.findIndex((p) => p.slug === slug);
    const nextProject = portfolioProjects[(currentIndex + 1) % portfolioProjects.length];
    nextSlug = nextProject.slug;
    nextTitle = t(`projects.${nextProject.titleKey}.title`);
  }

  const usedServices = projectServices
    .map((sKey) => {
      const svc = services.find((s) => s.key === sKey);
      if (!svc) return null;
      try {
        return { key: sKey, name: tServices(`items.${sKey}.shortTitle`), icon: svc.icon };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 pb-16 pt-28 sm:pb-20 sm:pt-36" aria-labelledby="case-study-title">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link href="/portfolio" className="text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm">
                    {t('title')}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <svg className="h-4 w-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </li>
                <li><span className="text-white" aria-current="page">{title}</span></li>
              </ol>
            </nav>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant="teal" className="bg-teal-500/20 text-teal-300">
                  {t(`filterCategories.${category}`)}
                </Badge>
                <span className="text-sm text-slate-400">{year}</span>
              </div>
              <h1 id="case-study-title" className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <Badge key={tag} className="border border-white/10 bg-white/5 text-slate-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            <div className="lg:col-span-2">
              <ScrollReveal>
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg leading-relaxed text-slate-600">{description}</p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="mt-12">
                  <h2 className="mb-6 text-xl font-bold text-slate-900">Gallery</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {images.map((imgSrc, i) => (
                      <div key={i} className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <img src={imgSrc} alt={`${title} - ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-1">
              <ScrollReveal direction="right">
                <div className="sticky top-28 space-y-8">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-base font-bold text-slate-900">Project Details</h2>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Client</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{client}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Year</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{year}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">Location</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">{location}</dd>
                      </div>
                      <div>
                        <dt className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Services</dt>
                        <dd>
                          <div className="flex flex-wrap gap-2">
                            {usedServices.map((svc) =>
                              svc ? (
                                <Badge key={svc.key} variant="teal">
                                  <span className="mr-1" aria-hidden="true">{svc.icon}</span>
                                  {svc.name}
                                </Badge>
                              ) : null
                            )}
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <p className="mb-4 text-sm text-slate-600">Interested in a similar project?</p>
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

      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              {tCommon('back')} {t('title')}
            </Link>

            {nextSlug && nextTitle && (
              <Link
                href={`/portfolio/${nextSlug}`}
                className="group inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition-all duration-200 hover:border-teal-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <div className="text-right">
                  <span className="block text-xs text-slate-400">{tCommon('next')}</span>
                  <span className="block text-sm font-medium text-slate-900 transition-colors group-hover:text-teal-600">{nextTitle}</span>
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
