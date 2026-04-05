'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { useFirestorePortfolio, type DisplayPortfolio } from '@/hooks/useFirestorePortfolio';
import { PortfolioCard } from './PortfolioCard';
import { ScrollReveal } from '@/components/animations';
import { cn } from '@/lib/utils';

type Division = 'all' | 'online' | 'offline' | 'service';

interface DivisionConfig {
  id: Exclude<Division, 'all'>
  labelKo: string
  labelEn: string
  descKo: string
  descEn: string
  dotColor: string
  borderActive: string
}

const DIVISIONS: DivisionConfig[] = [
  {
    id: 'online',
    labelKo: '온라인 솔루션',
    labelEn: 'Online Solution',
    descKo: '디지털 AI 솔루션으로 브랜드 경험을 확장합니다',
    descEn: 'Expanding brand experiences with digital AI solutions',
    dotColor: 'bg-blue-500',
    borderActive: 'border-blue-500',
  },
  {
    id: 'offline',
    labelKo: '오프라인 솔루션',
    labelEn: 'Offline Solution',
    descKo: '현장에서 직접 체험하는 AI 인터랙티브 콘텐츠',
    descEn: 'On-site interactive AI content experiences',
    dotColor: 'bg-amber-500',
    borderActive: 'border-amber-500',
  },
  {
    id: 'service',
    labelKo: '네안데르 서비스',
    labelEn: 'Neander Service',
    descKo: '네안데르의 자체 브랜드 및 서비스',
    descEn: "Neander's own brands and services",
    dotColor: 'bg-teal-500',
    borderActive: 'border-teal-500',
  },
];

function toCardProps(project: DisplayPortfolio, locale: string) {
  return {
    project: {
      slug: project.slug,
      titleKey: project.slug,
      descriptionKey: project.slug,
      year: project.year,
      category: project.category as 'online' | 'offline' | 'service',
      tags: project.tags,
      image: project.thumbnail,
      images: project.images,
      services: project.services,
      client: project.client,
      location: project.location || '',
      featured: project.is_featured,
    },
    titleOverride: locale === 'ko' ? project.title_ko : project.title_en,
  };
}

export function PortfolioGrid() {
  const [active, setActive] = useState<Division>('all');
  const locale = useLocale();
  const t = useTranslations('portfolio');
  const { projects, loading } = useFirestorePortfolio();

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
      </div>
    );
  }

  const filtered = active === 'all' ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      {/* ─── Structure Map ─── */}
      <ScrollReveal>
        <div className="mb-20">
          {/* Root node */}
          <div className="flex justify-center">
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-3 shadow-sm">
              <span className="text-sm font-bold tracking-wide text-slate-900">AI SOLUTION</span>
            </div>
          </div>

          {/* Root vertical stem */}
          <div className="flex justify-center">
            <div className="h-8 w-px bg-slate-300" />
          </div>

          {/* Horizontal branch line with 3 drops */}
          <div className="relative mx-auto max-w-3xl px-4 sm:px-0">
            {/* The horizontal line - spans from first card center to last card center */}
            <div className="absolute left-[calc(16.667%)] right-[calc(16.667%)] top-0 h-px bg-slate-300 hidden sm:block" />
            {/* Mobile: no horizontal line, just stack */}

            {/* 3 columns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {DIVISIONS.map((div, idx) => {
                const isActive = active === div.id;
                const divProjects = projects.filter((p) => p.category === div.id);
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
                      className={cn(
                        'group w-full rounded-xl border-2 p-5 text-left transition-all duration-200',
                        isActive
                          ? `${div.borderActive} bg-white shadow-md`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      )}
                    >
                      {/* Dot + title */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', div.dotColor)} />
                        <h4 className="text-sm font-bold text-slate-900">
                          {locale === 'ko' ? div.labelKo : div.labelEn}
                        </h4>
                      </div>

                      {/* Tree items */}
                      {hasProjects ? (
                        <div className="ml-[11px] border-l border-slate-200 pl-4 space-y-1.5 mt-2">
                          {divProjects.slice(0, 5).map((proj, i) => (
                            <div key={proj.slug} className="relative flex items-center text-xs text-slate-600">
                              {/* Horizontal tick mark from the vertical border-l */}
                              <div className="absolute -left-4 top-1/2 h-px w-3 bg-slate-200" />
                              <span className="truncate">
                                {locale === 'ko' ? proj.title_ko : proj.title_en}
                              </span>
                            </div>
                          ))}
                          {divProjects.length > 5 && (
                            <div className="relative text-[11px] text-slate-400">
                              <div className="absolute -left-4 top-1/2 h-px w-3 bg-slate-200" />
                              +{divProjects.length - 5} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="ml-[11px] border-l border-dashed border-slate-200 pl-4 mt-2">
                          <p className="text-[11px] text-slate-400 italic">
                            {locale === 'ko' ? '준비 중' : 'Coming soon'}
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
                onClick={() => setActive('all')}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {locale === 'ko' ? '← 전체 보기' : '← Show all'}
              </button>
            </motion.div>
          )}
        </div>
      </ScrollReveal>

      {/* ─── Portfolio Items ─── */}
      {active === 'all' ? (
        <div className="space-y-20">
          {DIVISIONS.map((div) => {
            const divProjects = projects.filter((p) => p.category === div.id);
            if (divProjects.length === 0) return null;

            return (
              <section key={div.id}>
                <ScrollReveal>
                  <div className="mb-8 flex items-center gap-3">
                    <div className={cn('h-3 w-3 rounded-full shrink-0', div.dotColor)} />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {locale === 'ko' ? div.labelKo : div.labelEn}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {locale === 'ko' ? div.descKo : div.descEn}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" role="list">
                  {divProjects.map((project) => (
                    <div key={project.slug} role="listitem">
                      <PortfolioCard {...toCardProps(project, locale)} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="mb-8 flex items-center gap-3">
            {(() => {
              const div = DIVISIONS.find((d) => d.id === active)!;
              return (
                <>
                  <div className={cn('h-3 w-3 rounded-full shrink-0', div.dotColor)} />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {locale === 'ko' ? div.labelKo : div.labelEn}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {locale === 'ko' ? div.descKo : div.descEn}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" role="list">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <div key={project.slug} role="listitem">
                  <PortfolioCard {...toCardProps(project, locale)} />
                </div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-500">
                {locale === 'ko' ? '해당 분야의 프로젝트가 준비 중입니다.' : 'Projects coming soon.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
