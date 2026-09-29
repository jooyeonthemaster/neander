'use client';

import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PortfolioProject } from '@/data/portfolio';
import type { PortfolioImageMetadata } from '@/types/admin';

interface PortfolioCardProps {
  project: PortfolioProject;
  titleOverride?: string;
  imageKind?: PortfolioImageMetadata['kind'];
}

export function PortfolioCard({ project, titleOverride, imageKind }: PortfolioCardProps) {
  const t = useTranslations('portfolio');
  const locale = useLocale();
  const displayTitle = titleOverride || t(`projects.${project.titleKey}.title`);
  const tags = project.tags;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        href={`/portfolio/${project.slug}`}
        className={cn(
          'group relative block overflow-hidden rounded-2xl',
          'border border-slate-200 bg-white',
          'shadow-sm transition-shadow duration-300',
          'hover:shadow-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2'
        )}
      >
        {/* Image area */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          {/* Project image */}
          {project.image ? (
            <img
              src={project.image}
              alt={displayTitle}
              className={cn('absolute inset-0 h-full w-full transition-transform duration-500', imageKind && imageKind !== 'photo' ? 'object-contain p-2' : 'object-cover group-hover:scale-105')}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-800 via-slate-800 to-slate-900 p-5 text-center transition-transform duration-500 group-hover:scale-105">
              <span className="text-sm font-semibold text-white/70">{project.client}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100" />

          {/* Overlay content on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-4 p-5 opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100">
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="teal" className="bg-teal-500/20 text-white backdrop-blur-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Year badge */}
          {project.year && <div className="absolute right-3 top-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
              {project.year}
            </span>
          </div>}

          {/* Featured badge */}
          {project.featured && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-teal-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {t('featured')}
              </span>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-5">
          <h3 className="mb-1.5 text-base font-bold text-slate-900 transition-colors group-hover:text-teal-600 sm:text-lg">
            {displayTitle}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{project.client}</span>
            {project.location && (
              <>
                <span aria-hidden="true">·</span>
                <span>{project.location}</span>
              </>
            )}
          </div>
          {project.images.length > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              {locale === 'ko' ? `이미지 ${project.images.length}개` : `${project.images.length} ${project.images.length === 1 ? 'image' : 'images'}`}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
