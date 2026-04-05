'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Monitor, MapPin, Zap } from 'lucide-react';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/animations';
import { SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

const divisionKeys = ['online', 'offline', 'service'] as const;

const divisionIcons = {
  online: Monitor,
  offline: MapPin,
  service: Zap,
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
        <ScrollReveal>
          <SectionHeader
            category={t('title')}
            title={t('subtitle')}
            align="center"
            className="mb-16 [&_h2]:text-white [&_span]:text-teal-400"
          />
          <h2 id="divisions-title" className="sr-only">
            {t('title')}
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
                    'p-8 backdrop-blur-sm',
                    'transition-colors duration-300',
                    colors.hoverBorder, 'hover:bg-white/[0.06]'
                  )}
                >
                  {/* Top accent line */}
                  <div
                    className={cn(
                      'absolute left-0 top-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100',
                      colors.accent
                    )}
                    aria-hidden="true"
                  />

                  {/* Icon */}
                  <div className={cn(
                    'mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300',
                    colors.iconBg, colors.iconText, colors.hoverBg
                  )}>
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>

                  {/* Division name */}
                  <h3 className="mb-3 text-xl font-bold tracking-tight text-white">
                    {t(`${key}.name`)}
                  </h3>

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
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
