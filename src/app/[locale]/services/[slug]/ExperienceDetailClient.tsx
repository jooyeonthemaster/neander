'use client';

import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface RelatedExperience {
  slug: string;
  name: string;
  oneLiner: string;
  pillarId: string;
  pillarName: string;
  pillarColor: string;
}

interface Props {
  related: RelatedExperience[];
  viewDetailLabel: string;
}

export function ExperienceDetailClient({ related, viewDetailLabel }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {related.map((exp, i) => (
        <motion.div
          key={exp.slug}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            delay: i * 0.1,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Link
            href={`/services/${exp.slug}`}
            className="group block h-full focus-visible:outline-none"
          >
            <div
              className={cn(
                'relative h-full flex flex-col overflow-hidden rounded-2xl',
                'bg-white border border-neutral-200/80',
                'transition-all duration-300',
                'group-hover:shadow-xl group-hover:-translate-y-1',
                'group-focus-visible:ring-2 group-focus-visible:ring-teal-500 group-focus-visible:ring-offset-2'
              )}
            >
              {/* Top accent bar */}
              <div
                className="h-1 w-full transition-all duration-300 group-hover:h-1.5"
                style={{ backgroundColor: exp.pillarColor }}
                aria-hidden="true"
              />

              <div className="flex flex-col flex-1 p-5 sm:p-6">
                {/* Pillar badge */}
                <span
                  className="inline-flex self-start items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white mb-4"
                  style={{ backgroundColor: exp.pillarColor }}
                >
                  {exp.pillarName}
                </span>

                {/* Title */}
                <h3 className="text-base font-bold text-neutral-900 tracking-tight leading-snug sm:text-lg mb-2">
                  {exp.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 flex-1">
                  {exp.oneLiner}
                </p>

                {/* View detail link */}
                <div
                  className="flex items-center gap-2 text-sm font-semibold mt-4 pt-4 border-t border-neutral-100 transition-colors duration-300"
                  style={{ color: exp.pillarColor }}
                >
                  <span>{viewDetailLabel}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:translate-x-2"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
