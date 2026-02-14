'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { portfolioCategories, type PortfolioCategory } from '@/data/portfolio';
import { cn } from '@/lib/utils';

interface PortfolioFilterProps {
  activeCategory: PortfolioCategory;
  onCategoryChange: (category: PortfolioCategory) => void;
}

export function PortfolioFilter({
  activeCategory,
  onCategoryChange,
}: PortfolioFilterProps) {
  const t = useTranslations('portfolio');

  function getCategoryLabel(category: PortfolioCategory): string {
    if (category === 'all') return t('filterAll');
    return t(`filterCategories.${category}`);
  }

  return (
    <nav
      aria-label="Portfolio filter"
      className="mb-10 flex gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0"
    >
      {portfolioCategories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            aria-pressed={isActive}
            className={cn(
              'relative shrink-0 rounded-full px-5 py-2 text-sm font-medium',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2',
              isActive
                ? 'text-white'
                : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
            )}
          >
            {/* Sliding active indicator */}
            {isActive && (
              <motion.div
                layoutId="portfolio-filter-active"
                className="absolute inset-0 rounded-full bg-teal-600"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{getCategoryLabel(category)}</span>
          </button>
        );
      })}
    </nav>
  );
}
