'use client';

import type { PressArticle } from '@/types';
import { useTranslations } from 'next-intl';
import { ScrollReveal } from '@/components/animations';
import { PressCard } from './PressCard';

interface PressGridProps {
  articles: PressArticle[];
}

export function PressGrid({ articles }: PressGridProps) {
  const t = useTranslations('press');

  if (articles.length === 0) {
    return (
      <p className="py-20 text-center text-slate-400">
        {t('noArticles')}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <ScrollReveal key={article.id} delay={index * 0.08}>
          <PressCard article={article} />
        </ScrollReveal>
      ))}
    </div>
  );
}
