import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { services } from '@/data/services';
import { fetchPublishedPortfolio } from '@/lib/firebase/rest';
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery';
import type { PortfolioImageMetadata, PortfolioItem } from '@/types/admin';
import caseStudyCopy from '@/data/portfolio-case-studies.json';
import { ScrollReveal } from '@/components/animations';
import { Badge } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';
import { SERVICE_TEXT, type ServiceKey } from '@/lib/quote/catalog';

// 사례에 쓴 서비스 → 자세한 안내 페이지 (구매 의도 검색어용 랜딩·개발 의뢰).
// 포트폴리오 상세로 바로 들어온 방문 96회 중 서비스·견적·문의로 넘어간 경우가 5회뿐이라 (2026-11 방문 분석)
// 사례 아래에 같은 구성의 안내와 견적으로 가는 길을 둔다.
const SERVICE_GUIDE: Partial<Record<ServiceKey, { href: string; ko: string; en: string }>> = {
  acscent: { href: '/insights/event-ai-perfume-experience', ko: 'AI 향수 만들기 체험 — 비용·진행 안내', en: 'AI perfume-making experience — cost & process' },
  photoBooth: { href: '/insights/ai-photo-booth-rental', ko: 'AI 포토부스 대여 — 가격·진행 안내', en: 'AI photo booth rental — pricing & process' },
  custom: { href: '/development', ko: '맞춤 AI 콘텐츠 개발 의뢰 안내', en: 'Custom AI content development' },
};
const isServiceKey = (k: string): k is ServiceKey => k in SERVICE_TEXT;

// 관리자 페이지에서 수정한 내용이 5분 안에 반영되도록 ISR 적용
export const revalidate = 300;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  date: string | null;
  category: 'online' | 'offline' | 'service' | 'ip';
  tags: string[];
  heroImage: string;
  images: string[];
  imageMetadata?: Record<string, PortfolioImageMetadata>;
  client: string;
  location: string;
  services: string[];
  result: string | null;
  story: { objective: string; execution: string; outcome: string } | null;
}

type CaseCopy = Partial<Pick<PortfolioItem,
  'objective_ko' | 'objective_en' | 'execution_ko' | 'execution_en' | 'outcome_ko' | 'outcome_en'>>;

// 목적 → 실행 → 결과. 관리자 화면(Firestore)에 입력한 값이 있으면 우선하고, 없으면 저장소 문구를 쓴다.
function caseStory(item: PortfolioItem, locale: string): CaseStudy['story'] {
  const fromCms: CaseCopy = item;
  const fromRepo: CaseCopy = (caseStudyCopy as Record<string, CaseCopy>)[item.slug] ?? {};
  const pick = (field: 'objective' | 'execution' | 'outcome') => {
    const ko = fromCms[`${field}_ko`] || fromRepo[`${field}_ko`] || '';
    const en = fromCms[`${field}_en`] || fromRepo[`${field}_en`] || '';
    return locale === 'ko' ? ko : en || ko;
  };
  const story = { objective: pick('objective'), execution: pick('execution'), outcome: pick('outcome') };
  return story.objective && story.execution && story.outcome ? story : null;
}

// The shared loader supplies the reviewed catalog and published CMS updates.
async function getCaseStudies(locale: string): Promise<CaseStudy[]> {
  const items = await fetchPublishedPortfolio();
  return (items ?? []).map((item) => {
    const result = locale === 'ko' ? item.result_ko : item.result_en;
    return {
      slug: item.slug,
      title: locale === 'ko' ? item.title_ko : item.title_en || item.title_ko,
      description: locale === 'ko' ? item.description_ko : item.description_en || item.description_ko,
      date: (locale === 'ko' ? item.period_ko : item.period_en) || item.period || (item.year ? String(item.year) : null),
      category: item.category,
      tags: (locale === 'ko' ? item.tags_ko : item.tags_en) ?? item.tags ?? [],
      heroImage: item.thumbnail || item.images?.[0] || '',
      images: item.images ?? [],
      imageMetadata: item.image_metadata,
      client: (locale === 'ko' ? item.client_ko : item.client_en) || item.client,
      location: (locale === 'ko' ? item.location_ko : item.location_en) || item.location || '',
      services: item.services ?? [],
      result: result || null,
      story: caseStory(item, locale),
    };
  });
}

export async function generateStaticParams() {
  const items = await fetchPublishedPortfolio();
  return (items ?? []).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const study = (await getCaseStudies(locale)).find((s) => s.slug === slug);
  if (!study) return {};

  return {
    alternates: localeAlternates(`/portfolio/${slug}`, locale),
    title: study.title,
    description: study.description,
    openGraph: {
      title: study.title,
      description: study.description,
      images: study.heroImage ? [study.heroImage] : [DEFAULT_OG_IMAGE],
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
  const story = project.story;
  const t = await getTranslations({ locale, namespace: 'portfolio' });
  const tServices = await getTranslations({ locale, namespace: 'services' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // 이 사례에 쓴 서비스 (견적 카탈로그에 있는 것만)
  const lang = locale === 'en' ? 'en' : 'ko';
  const usedForQuote = project.services.filter(isServiceKey);
  const firstQuoteKey = usedForQuote[0];

  // Find next project for navigation
  const nextProject =
    studies.length > 1 ? studies[(currentIndex + 1) % studies.length] : null;

  // Map service IDs to their translated names
  const usedServices = project.services
    .map((sKey) => {
      const svc = services.find((s) => s.key === sKey);
      // 서비스 key는 photoBooth인데 번역 키는 photobooth라서 소문자 키도 함께 찾는다.
      const msgKey = [sKey, sKey.toLowerCase()].find((k) => tServices.has(`items.${k}.shortTitle`));
      if (!svc || !msgKey) return null;
      return {
        key: sKey,
        name: tServices(`items.${msgKey}.shortTitle`),
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
                {project.date && <span className="text-sm text-slate-400">
                  {project.date}
                </span>}
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

              {/* 목적 → 실행 → 결과 */}
              {story ? (
                <ScrollReveal delay={0.15}>
                  <ol className="mt-10 grid gap-4 sm:grid-cols-3">
                    {(['objective', 'execution', 'outcome'] as const).map((step, i) => (
                      <li
                        key={step}
                        className={
                          step === 'outcome'
                            ? 'rounded-2xl border border-teal-100 bg-teal-50 p-6'
                            : 'rounded-2xl border border-slate-200 bg-white p-6'
                        }
                      >
                        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-teal-700">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs text-white">
                            {i + 1}
                          </span>
                          {t(`detail.${step}`)}
                        </h2>
                        <p className="text-base leading-relaxed text-slate-700">
                          {story[step]}
                        </p>
                      </li>
                    ))}
                  </ol>
                </ScrollReveal>
              ) : project.result && (
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
              <PortfolioGallery
                images={project.images}
                metadata={project.imageMetadata}
                title={project.title}
                locale={locale}
                heading={t('detail.gallery')}
              />

              {/* 이 프로젝트에 쓴 서비스 → 안내·견적 */}
              {usedForQuote.length > 0 && (
                <section aria-labelledby="used-services-title" className="mt-14 border-t border-slate-200 pt-10">
                  <h2 id="used-services-title" className="text-xl font-bold text-slate-900">
                    {lang === 'ko' ? '이 프로젝트에 쓴 서비스' : 'Services used in this project'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {lang === 'ko'
                      ? '비슷한 행사를 준비 중이라면 같은 구성으로 금액을 바로 확인해 보세요.'
                      : 'Planning something similar? Check the price for the same setup right away.'}
                  </p>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {usedForQuote.map((key) => {
                      const guide = SERVICE_GUIDE[key];
                      return (
                        <li key={key} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                          <h3 className="text-base font-semibold text-slate-900">{SERVICE_TEXT[key].name[lang]}</h3>
                          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{SERVICE_TEXT[key].summary[lang]}</p>
                          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
                            <Link
                              href={{ pathname: '/quote', query: { item: key } }}
                              className="text-teal-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm"
                            >
                              {lang === 'ko' ? '이 구성으로 견적 내기 →' : 'Get a quote for this →'}
                            </Link>
                            {guide && (
                              <Link
                                href={guide.href}
                                className="text-slate-600 underline-offset-4 hover:text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm"
                              >
                                {guide[lang]}
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
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

                      {project.date && <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          {t('detail.date')}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {project.date}
                        </dd>
                      </div>}

                      {project.location && <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          {t('detail.location')}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {project.location}
                        </dd>
                      </div>}

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
                    <Link
                      href={firstQuoteKey ? { pathname: '/quote', query: { item: firstQuoteKey } } : '/quote'}
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-teal-600 bg-white px-5 py-2.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                    >
                      {lang === 'ko' ? '온라인 견적으로 금액 보기' : 'See the price online'}
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
