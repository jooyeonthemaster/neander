'use client';

import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface ExperienceCardProps {
  slug: string;
  name: string;
  oneLiner: string;
  pillarId: string;
  pillarName: string;
  pillarColor: string;
}

export function ExperienceCard({
  slug,
  name,
  oneLiner,
  pillarName,
}: ExperienceCardProps) {
  return (
    <Link href={`/services/${slug}`} className="block h-full focus-visible:outline-none group">
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

        <div className="relative flex flex-col h-full p-5 sm:p-6">
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
            <span>자세히 보기</span>
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
