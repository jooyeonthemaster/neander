'use client';

import type { PressArticle } from '@/types';
import { useTranslations } from 'next-intl';

interface PressCardProps {
  article: PressArticle;
}

export function PressCard({ article }: PressCardProps) {
  const t = useTranslations('press');

  const formattedDate = new Date(article.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5 sm:p-8"
    >
      {/* Source badge + date */}
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          {article.source}
        </span>
        <time
          dateTime={article.date}
          className="text-xs text-slate-400"
        >
          {formattedDate}
        </time>
      </div>

      {/* Title */}
      <h3 className="mb-3 text-lg font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-teal-600 sm:text-xl">
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="mb-5 text-sm leading-relaxed text-slate-500 line-clamp-2">
        {article.excerpt}
      </p>

      {/* Read more */}
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 transition-colors group-hover:text-teal-500">
        {t('readMore')}
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </a>
  );
}
