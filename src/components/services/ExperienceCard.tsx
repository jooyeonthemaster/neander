'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { EXPERIENCE_PHOTOS } from '@/data/experience-photos';

interface ExperienceCardProps {
  slug: string;
  name: string;
  oneLiner: string;
  pillarId: string;
  pillarName: string;
  pillarColor: string;
  /** 같은 줄 카드 높이에 맞춰 늘릴지. 사진 카드와 섞인 목록에서는 끄면 사진 없는 카드가 텅 비어 보이지 않는다 */
  stretch?: boolean;
}

export function ExperienceCard({
  slug,
  name,
  oneLiner,
  pillarName,
  stretch = true,
}: ExperienceCardProps) {
  const t = useTranslations('services');
  const locale = useLocale();
  const photo = EXPERIENCE_PHOTOS[slug];
  const photoEvent = photo ? (locale === 'ko' ? photo.eventKo : photo.eventEn) : '';

  return (
    <Link
      href={`/services/${slug}`}
      className={cn('block focus-visible:outline-none group', stretch && 'h-full')}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          'relative flex flex-col h-full rounded-2xl overflow-hidden',
          'border border-neutral-200 bg-white',
          'transition-all duration-300',
          'group-hover:border-teal-400 group-hover:shadow-lg group-hover:shadow-teal-500/8',
          'group-focus-visible:ring-2 group-focus-visible:ring-teal-500 group-focus-visible:ring-offset-2',
        )}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500/0 to-transparent group-hover:via-teal-500/60 transition-all duration-500"
          aria-hidden="true"
        />

        {/* 실제 운영 현장 사진 (있는 서비스만) */}
        {photo && (
          <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
            <Image
              src={photo.src}
              alt={`${name} — ${photoEvent}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-neutral-950/5 to-transparent"
              aria-hidden="true"
            />
            <span className="absolute bottom-3 left-3 right-3 truncate text-[11px] font-medium text-white/90">
              {t('photoCase')} · {photoEvent}
            </span>
          </div>
        )}

        <div className="relative flex flex-1 flex-col p-5 sm:p-6">
          {/* Pillar badge */}
          <span className="inline-flex self-start items-center mb-4 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-teal-50 text-teal-700 border border-teal-200">
            {pillarName}
          </span>

          {/* Experience name */}
          <h3 className="text-base font-bold tracking-tight text-neutral-900 leading-snug sm:text-lg">
            {name}
          </h3>

          {/* One-liner description */}
          <p className="mt-2 flex-1 text-sm text-neutral-500 leading-relaxed line-clamp-2">
            {oneLiner}
          </p>

          {/* Arrow link */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors duration-300">
            <span>{t('viewDetail')}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1.5"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
