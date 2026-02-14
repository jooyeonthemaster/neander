'use client';

import { useTranslations } from 'next-intl';
import { ScrollReveal } from '@/components/animations';
import { cn } from '@/lib/utils';

export function CEOSection() {
  const t = useTranslations('about.ceo');

  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-16">
      {/* Portrait placeholder */}
      <ScrollReveal direction="left" className="lg:col-span-2">
        <div
          className={cn(
            'relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl',
            'bg-slate-100 border border-slate-200'
          )}
        >
          {/* Placeholder icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg
              className="h-20 w-20 text-slate-300"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium text-slate-400">CEO</span>
          </div>

          {/* Decorative accent */}
          <div
            className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-400"
            aria-hidden="true"
          />
        </div>
      </ScrollReveal>

      {/* Quote and bio */}
      <ScrollReveal direction="right" delay={0.15} className="lg:col-span-3">
        <div>
          {/* Quote mark */}
          <svg
            className="mb-4 h-10 w-10 text-teal-200"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
          </svg>

          {/* Quote text */}
          <blockquote className="mb-6">
            <p className="text-lg leading-relaxed text-slate-700 sm:text-xl lg:text-2xl">
              {t('quote')}
            </p>
          </blockquote>

          {/* Name and title */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            <div className="text-right">
              <p className="text-base font-bold text-slate-900">{t('name')}</p>
              <p className="text-sm text-slate-500">{t('title')}</p>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm leading-relaxed text-slate-500">
            {t('bio')}
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
