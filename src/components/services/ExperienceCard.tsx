'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ExperienceImage } from './ExperienceImage';

interface ExperienceCardProps {
  slug: string;
  name: string;
  oneLiner: string;
  pillarId: string;
  pillarName: string;
  /** 산업군 (뷰티·패션·교육 …) — 필터 대신 뱃지로 보여 준다 */
  industryName?: string;
  pillarColor: string;
  /** 같은 줄 카드 높이에 맞춰 늘릴지 */
  stretch?: boolean;
  /** 데모가 있는 서비스 — 누르면 상세 페이지 대신 데모 팝업을 연다 (새 탭·Cmd 클릭은 그대로 상세 페이지) */
  onOpenDemo?: () => void;
  /** 실제 키오스크·포토부스 프로그램 주소 — 있으면 데모 팝업 대신 이 주소를 새 탭으로 연다 (Cmd 클릭은 그대로 상세 페이지) */
  liveDemoHref?: string;
}

export function ExperienceCard({
  slug,
  name,
  oneLiner,
  pillarName,
  industryName,
  stretch = true,
  onOpenDemo,
  liveDemoHref,
}: ExperienceCardProps) {
  const t = useTranslations('services');
  const tDemo = useTranslations('demos');
  const tA11y = useTranslations('accessibility');
  const hasDemo = Boolean(liveDemoHref || onOpenDemo);

  return (
    <Link
      href={`/services/${slug}`}
      onClick={(e) => {
        if (!hasDemo || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        if (liveDemoHref) window.open(liveDemoHref, '_blank', 'noopener');
        else onOpenDemo?.();
      }}
      aria-haspopup={!liveDemoHref && onOpenDemo ? 'dialog' : undefined}
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

        <ExperienceImage slug={slug} name={name} />

        <div className="relative flex flex-1 flex-col p-5 sm:p-6">
          {/* Pillar · industry badges */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-teal-50 text-teal-700 border border-teal-200">
              {pillarName}
            </span>
            {industryName && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide bg-neutral-50 text-neutral-500 border border-neutral-200">
                {industryName}
              </span>
            )}
          </div>

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
            <span>{hasDemo ? tDemo('tryDemo') : t('viewDetail')}</span>
            {liveDemoHref && <span className="sr-only">{tA11y('externalLink')}</span>}
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
              className={cn(
                'transition-transform duration-300',
                liveDemoHref ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : 'group-hover:translate-x-1.5',
              )}
              aria-hidden="true"
            >
              {liveDemoHref ? (
                <path d="M7 17 17 7M8 7h9v9" />
              ) : (
                <>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </>
              )}
            </svg>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
