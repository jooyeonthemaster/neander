'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { SectionHeader, Badge } from '@/components/ui';
import { ScrollReveal } from '@/components/animations';
import { useFirestorePortfolio } from '@/hooks/useFirestorePortfolio';
import { cn } from '@/lib/utils';

const CATEGORY_BADGE_MAP: Record<string, string> = {
  online: 'blue',
  offline: 'amber',
  service: 'teal',
};

export function FeaturedPortfolio() {
  const t = useTranslations('portfolio');
  const locale = useLocale();
  const { projects, loading } = useFirestorePortfolio();
  const featured = projects.filter((p) => p.is_featured);

  if (loading || featured.length === 0) {
    return null;
  }

  return (
    <section className="section-padding-lg bg-neutral-50" id="portfolio">
      <div className="container-wide">
        <SectionHeader
          category="PORTFOLIO"
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {featured.map((project, idx) => {
            const title = locale === 'ko' ? project.title_ko : project.title_en;
            const description = locale === 'ko' ? project.description_ko : project.description_en;
            const categoryBadge = CATEGORY_BADGE_MAP[project.category] ?? 'default';

            return (
              <ScrollReveal key={project.slug} delay={idx * 0.1}>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group block relative rounded-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[16/10] bg-neutral-200 overflow-hidden">
                    <img
                      src={project.thumbnail}
                      alt={title}
                      className={cn(
                        'absolute inset-0 h-full w-full object-cover',
                        'transition-transform duration-700 ease-out',
                        'group-hover:scale-105'
                      )}
                      loading="lazy"
                    />

                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent',
                        'transition-opacity duration-300',
                        'opacity-60 group-hover:opacity-80'
                      )}
                    />

                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                      <motion.div className="flex flex-wrap gap-2 mb-3" initial={false}>
                        <Badge
                          variant={categoryBadge as 'teal' | 'amber' | 'blue' | 'default'}
                          className="text-[10px] uppercase tracking-wider"
                        >
                          {t(`filterCategories.${project.category}`)}
                        </Badge>
                        <span className="text-xs text-white/70 font-medium self-center">
                          {project.year}
                        </span>
                      </motion.div>

                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                        {title}
                      </h3>

                      <p
                        className={cn(
                          'mt-2 text-sm text-white/70 leading-relaxed line-clamp-2',
                          'max-h-0 overflow-hidden opacity-0',
                          'transition-all duration-300 ease-out',
                          'group-hover:max-h-20 group-hover:opacity-100'
                        )}
                      >
                        {description}
                      </p>

                      <div
                        className={cn(
                          'mt-3 flex items-center gap-2 text-sm font-semibold text-teal-300',
                          'opacity-0 translate-y-2',
                          'transition-all duration-300',
                          'group-hover:opacity-100 group-hover:translate-y-0'
                        )}
                      >
                        <span>{t('viewProject')}</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal className="mt-12 text-center">
          <Link
            href="/portfolio"
            className={cn(
              'inline-flex items-center gap-2 text-sm font-semibold text-teal-600',
              'border-b-2 border-teal-600/30 pb-1',
              'transition-all duration-200',
              'hover:border-teal-600 hover:gap-3',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:rounded-sm'
            )}
          >
            {t('viewAll')}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
