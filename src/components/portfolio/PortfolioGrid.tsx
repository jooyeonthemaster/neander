'use client';

import { useState, type ComponentProps } from 'react';
import { useLocale } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useFirestorePortfolio, type DisplayPortfolio } from '@/hooks/useFirestorePortfolio';
import { DEVELOPMENT_PROJECTS, type DevelopmentProject } from '@/data/development-projects';
import { DEVELOPMENT_COPY } from '@/components/development/copy';
import { Link } from '@/i18n/navigation';
import { PortfolioCard } from './PortfolioCard';
import { ScrollReveal } from '@/components/animations';
import { cn } from '@/lib/utils';

type Division = 'all' | 'online' | 'offline' | 'service' | 'ip';

interface DivisionConfig {
  id: Exclude<Division, 'all'>
  labelKo: string
  labelEn: string
  descKo: string
  descEn: string
  dotColor: string
  borderActive: string
}

// 온라인 솔루션(프로그램 개발)은 맨 뒤에 둔다
const DIVISIONS: DivisionConfig[] = [
  {
    id: 'offline',
    labelKo: '오프라인 솔루션',
    labelEn: 'Offline Solution',
    descKo: '전시·팝업·브랜드 행사를 위한 공간과 체험 콘텐츠',
    descEn: 'Spaces and experiences for exhibitions, pop-ups and brand events',
    dotColor: 'bg-amber-500',
    borderActive: 'border-amber-500',
  },
  {
    id: 'service',
    labelKo: '네안데르 서비스',
    labelEn: 'Neander Service',
    descKo: '네안데르의 자체 브랜드·제품·조향 서비스',
    descEn: "Neander's own brands, products and perfume experiences",
    dotColor: 'bg-teal-500',
    borderActive: 'border-teal-500',
  },
  {
    id: 'ip',
    labelKo: 'IP 콜라보',
    labelEn: 'IP Collaboration',
    descKo: '아티스트·브랜드·팬덤을 위한 향 제품과 굿즈',
    descEn: 'Fragrance products and merchandise for artists, brands and fan communities',
    dotColor: 'bg-rose-500',
    borderActive: 'border-rose-500',
  },
  {
    id: 'online',
    labelKo: '온라인 솔루션',
    labelEn: 'Online Solution',
    descKo: '디지털 AI 솔루션으로 브랜드 경험을 확장합니다',
    descEn: 'Expanding brand experiences with digital AI solutions',
    dotColor: 'bg-blue-500',
    borderActive: 'border-blue-500',
  },
];

/** 목록에 함께 보여 주는 항목: 행사 사례(Firestore)와 프로그램 개발 프로젝트(/development) */
interface GridItem {
  key: string;
  category: Exclude<Division, 'all'>;
  title: string;
  searchText: string;
  card: ComponentProps<typeof PortfolioCard>;
}

function caseItem(project: DisplayPortfolio, locale: string): GridItem {
  const card = toCardProps(project, locale);
  return {
    key: project.slug,
    category: project.category,
    title: card.titleOverride,
    searchText: [project.title_ko, project.title_en, project.description_ko, project.description_en,
      project.client, project.client_ko, project.client_en, project.location, project.location_ko, project.location_en, project.year, ...(project.tags ?? []),
      ...(project.tags_ko ?? []), ...(project.tags_en ?? [])].join(' '),
    card,
  };
}

// 프로그램 개발 페이지의 프로젝트는 상세 페이지가 없어서 카드가 실제 사이트로 바로 이어진다 (/development 와 같은 데이터)
function developmentItem(project: DevelopmentProject, locale: 'ko' | 'en'): GridItem {
  return {
    key: `development-${project.id}`,
    category: 'online',
    title: project.name[locale],
    searchText: [project.name.ko, project.name.en, project.client, project.description.ko, project.description.en, ...project.tags,
      DEVELOPMENT_COPY.ko.categories[project.category], DEVELOPMENT_COPY.en.categories[project.category]].join(' '),
    card: {
      project: {
        slug: `development-${project.id}`,
        titleKey: project.id,
        descriptionKey: project.id,
        year: null,
        category: 'online',
        tags: [...project.tags],
        image: project.image,
        images: [],
        services: [],
        client: project.client,
        location: DEVELOPMENT_COPY[locale].categories[project.category],
        featured: false,
      },
      titleOverride: project.name[locale],
      externalUrl: project.url,
      description: project.description[locale],
    },
  };
}

function toCardProps(project: DisplayPortfolio, locale: string) {
  return {
    project: {
      slug: project.slug,
      titleKey: project.slug,
      descriptionKey: project.slug,
      year: project.year,
      category: project.category as 'online' | 'offline' | 'service' | 'ip',
      tags: (locale === 'ko' ? project.tags_ko : project.tags_en) ?? project.tags,
      image: project.thumbnail,
      images: project.images,
      services: project.services,
      client: (locale === 'ko' ? project.client_ko : project.client_en) || project.client,
      location: (locale === 'ko' ? project.location_ko : project.location_en) || project.location || '',
      featured: project.is_featured,
    },
    titleOverride: locale === 'ko' ? project.title_ko : project.title_en || project.title_ko,
    imageKind: project.image_metadata?.[project.thumbnail]?.kind,
  };
}

export function PortfolioGrid() {
  const [active, setActive] = useState<Division>('all');
  const [search, setSearch] = useState('');
  const locale = useLocale();
  const { projects, loading } = useFirestorePortfolio();

  if (loading) {
    return (
      <div className="py-20 text-center" role="status">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" aria-hidden="true" />
        <span className="sr-only">{locale === 'ko' ? '프로젝트를 불러오는 중입니다.' : 'Loading projects.'}</span>
      </div>
    );
  }

  const terms = search.normalize('NFC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const items: GridItem[] = [
    ...projects.map((project) => caseItem(project, locale)),
    ...DEVELOPMENT_PROJECTS.map((project) => developmentItem(project, locale === 'ko' ? 'ko' : 'en')),
  ];
  const matching = items.filter((item) => {
    const text = item.searchText.normalize('NFC').toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
  const filtered = active === 'all' ? matching : matching.filter((p) => p.category === active);
  const developmentLink = (
    // 모바일에서는 제목 아래 줄, 넓은 화면에서는 제목 오른쪽
    <Link href="/development" className="inline-flex basis-full items-center gap-1 rounded-lg pl-6 text-sm font-medium text-teal-700 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:ml-auto sm:basis-auto sm:px-3 sm:py-2 sm:hover:bg-teal-50">
      {locale === 'ko' ? '프로그램 개발 자세히 보기' : 'About our development work'}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );

  return (
    <div>
      <div className="mb-10">
        <label htmlFor="portfolio-search" className="mb-2 block text-sm font-medium text-slate-700">
          {locale === 'ko' ? '프로젝트 검색' : 'Search projects'}
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="portfolio-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={locale === 'ko' ? '프로젝트명, 브랜드, 장소, 연도로 검색' : 'Search by project, brand, location or year'}
            aria-controls="portfolio-results"
            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label={locale === 'ko' ? '검색어 지우기' : 'Clear search'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="mt-3 text-sm text-slate-500" role="status" aria-live="polite" aria-atomic="true">
          {locale === 'ko' ? `전체 ${items.length}개 중 ${filtered.length}개 프로젝트` : `${filtered.length} of ${items.length} projects`}
        </p>
      </div>
      {/* ─── Structure Map ─── */}
      {/* Not wrapped in ScrollReveal: it sits right under the search box, and when the
          reveal never fires (seen in Safari) it leaves an invisible but clickable gap. */}
      <div className="mb-20">
          {/* Root node */}
          <div className="flex justify-center">
            <button type="button" onClick={() => setActive('all')} aria-pressed={active === 'all'} aria-controls="portfolio-results" className={cn('rounded-lg border bg-white px-6 py-3 text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500', active === 'all' ? 'border-teal-500 text-teal-800' : 'border-slate-200 text-slate-700')}>
              {locale === 'ko' ? '전체 프로젝트' : 'All projects'} <span className="ml-2 font-normal">{matching.length}</span>
            </button>
          </div>

          {/* Root vertical stem */}
          <div className="flex justify-center">
            <div className="h-8 w-px bg-slate-300" />
          </div>

          {/* Horizontal branch line with one drop per division */}
          <div className="relative mx-auto max-w-4xl px-4 sm:px-0">
            {/* The horizontal line - spans from first card center to last card center */}
            <div className="absolute left-1/4 right-1/4 top-0 h-px bg-slate-300 hidden sm:block lg:left-[12.5%] lg:right-[12.5%]" />
            {/* Mobile: no horizontal line, just stack */}

            {/* 4 columns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DIVISIONS.map((div) => {
                const isActive = active === div.id;
                const divProjects = matching.filter((p) => p.category === div.id);
                const hasProjects = divProjects.length > 0;

                return (
                  <div key={div.id} className="flex flex-col items-center">
                    {/* Vertical drop from horizontal line to card */}
                    <div className="h-6 w-px bg-slate-300 hidden sm:block" />
                    {/* Mobile: small connector */}
                    <div className="h-3 w-px bg-slate-300 sm:hidden" />

                    {/* Division card */}
                    <button
                      type="button"
                      onClick={() => setActive(isActive ? 'all' : div.id)}
                      aria-pressed={isActive}
                      aria-controls="portfolio-results"
                      className={cn(
                        'group w-full rounded-xl border-2 p-5 text-left transition-all duration-200',
                        isActive
                          ? `${div.borderActive} bg-white shadow-md`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2'
                      )}
                    >
                      {/* Dot + title */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', div.dotColor)} />
                        <h4 className="text-sm font-bold text-slate-900">
                          {locale === 'ko' ? div.labelKo : div.labelEn}
                        </h4>
                        <span className="ml-auto text-xs text-slate-500">{divProjects.length}</span>
                      </div>

                      {/* Tree items */}
                      {hasProjects ? (
                        <div className="ml-[11px] border-l border-slate-200 pl-4 space-y-1.5 mt-2">
                          {divProjects.slice(0, 5).map((proj) => (
                            <div key={proj.key} className="relative flex items-center text-xs text-slate-600">
                              {/* Horizontal tick mark from the vertical border-l */}
                              <div className="absolute -left-4 top-1/2 h-px w-3 bg-slate-200" />
                              <span className="truncate">
                                {proj.title}
                              </span>
                            </div>
                          ))}
                          {divProjects.length > 5 && (
                            <div className="relative text-[11px] text-slate-400">
                              <div className="absolute -left-4 top-1/2 h-px w-3 bg-slate-200" />
                              {locale === 'ko' ? `외 ${divProjects.length - 5}개` : `+${divProjects.length - 5} more`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="ml-[11px] border-l border-dashed border-slate-200 pl-4 mt-2">
                          <p className="text-[11px] text-slate-400 italic">
                            {search.trim() ? (locale === 'ko' ? '검색 결과 없음' : 'No matches') : (locale === 'ko' ? '준비 중' : 'Coming soon')}
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Back to all */}
          {active !== 'all' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <button
                type="button"
                onClick={() => setActive('all')}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {locale === 'ko' ? '← 전체 보기' : '← Show all'}
              </button>
            </motion.div>
          )}
      </div>

      {/* ─── Portfolio Items ─── */}
      <div id="portfolio-results">
      {active === 'all' ? (
        <div className="space-y-20">
          {DIVISIONS.map((div) => {
            const divProjects = matching.filter((p) => p.category === div.id);
            if (divProjects.length === 0) return null;

            return (
              <section key={div.id}>
                <ScrollReveal>
                  <div className="mb-8 flex flex-wrap items-center gap-3">
                    <div className={cn('h-3 w-3 rounded-full shrink-0', div.dotColor)} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-slate-900">
                        {locale === 'ko' ? div.labelKo : div.labelEn}
                        <span className="ml-2 text-base font-normal text-slate-400">{divProjects.length}</span>
                      </h3>
                      <p className="text-sm text-slate-500">
                        {locale === 'ko' ? div.descKo : div.descEn}
                      </p>
                    </div>
                    {div.id === 'online' && developmentLink}
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" role="list">
                  {divProjects.map((item) => (
                    <div key={item.key} role="listitem">
                      <PortfolioCard {...item.card} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="mb-8 flex flex-wrap items-center gap-3">
            {(() => {
              const div = DIVISIONS.find((d) => d.id === active)!;
              return (
                <>
                  <div className={cn('h-3 w-3 rounded-full shrink-0', div.dotColor)} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {locale === 'ko' ? div.labelKo : div.labelEn}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {locale === 'ko' ? div.descKo : div.descEn}
                    </p>
                  </div>
                  {div.id === 'online' && developmentLink}
                </>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" role="list">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <div key={item.key} role="listitem">
                  <PortfolioCard {...item.card} />
                </div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      )}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-500">{locale === 'ko' ? '검색 조건에 맞는 프로젝트가 없습니다.' : 'No projects match your search.'}</p>
          <button type="button" onClick={() => { setSearch(''); setActive('all'); }} className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
            {locale === 'ko' ? '전체 프로젝트 보기' : 'View all projects'}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
