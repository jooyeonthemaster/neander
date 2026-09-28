'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Monitor, MapPin, Zap } from 'lucide-react';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/animations';
import { cn } from '@/lib/utils';

const divisionKeys = ['online', 'offline', 'service'] as const;

const divisionIcons = {
  online: Monitor,
  offline: MapPin,
  service: Zap,
} as const;

const divisionImages = {
  online: '/images/about/digital-solutions.webp',
  offline: '/images/about/spatial-experiences.webp',
  service: '/images/about/brand-lab.webp',
} as const;

const divisionColors = {
  online: { dot: 'bg-blue-400', iconBg: 'bg-blue-400/10', iconText: 'text-blue-400', hoverBg: 'hover:bg-blue-400/20', accent: 'from-blue-400 to-cyan-400', hoverBorder: 'hover:border-blue-400/20' },
  offline: { dot: 'bg-amber-400', iconBg: 'bg-amber-400/10', iconText: 'text-amber-400', hoverBg: 'hover:bg-amber-400/20', accent: 'from-amber-400 to-orange-400', hoverBorder: 'hover:border-amber-400/20' },
  service: { dot: 'bg-teal-400', iconBg: 'bg-teal-400/10', iconText: 'text-teal-400', hoverBg: 'hover:bg-teal-400/20', accent: 'from-teal-400 to-cyan-400', hoverBorder: 'hover:border-teal-400/20' },
} as const;

export function BusinessDivisions() {
  const t = useTranslations('about.divisions');

  return (
    <section
      className="bg-neutral-950 py-20 sm:py-28"
      aria-labelledby="divisions-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-teal-400">
            {t('title')}
          </p>
          <h2 id="divisions-title" className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t('subtitle')}
          </h2>
        </ScrollReveal>

        <StaggerChildren className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {divisionKeys.map((key) => {
            const items: string[] = t.raw(`${key}.items`) as string[];
            const Icon = divisionIcons[key];
            const colors = divisionColors[key];

            return (
              <StaggerItem key={key}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-2xl',
                    'border border-white/[0.06] bg-white/[0.03]',
                    'backdrop-blur-sm',
                    'transition-colors duration-300',
                    colors.hoverBorder, 'hover:bg-white/[0.06]'
                  )}
                >
                  {/* Top accent line */}
                  <div
                    className={cn(
                      'absolute left-0 top-0 z-10 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100',
                      colors.accent
                    )}
                    aria-hidden="true"
                  />

                  <div className="relative aspect-[3/2] shrink-0 overflow-hidden bg-neutral-900">
                    <Image
                      src={divisionImages[key]}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 384px, (min-width: 768px) 31vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6 lg:p-7">
                    <div className="mb-5 flex items-center gap-3">
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                        colors.iconBg, colors.iconText, colors.hoverBg
                      )}>
                        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-white">
                        {t(`${key}.name`)}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="mb-6 text-sm leading-relaxed text-neutral-400">
                      {t(`${key}.description`)}
                    </p>

                    {/* Sub-items */}
                    <ul className="mt-auto space-y-2.5 border-t border-white/[0.06] pt-6">
                      {items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-neutral-300"
                        >
                          <span
                            className={cn('mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full', colors.dot)}
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
