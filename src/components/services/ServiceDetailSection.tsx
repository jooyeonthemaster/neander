'use client';

import { motion } from 'motion/react';
import { ScrollReveal } from '@/components/animations';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ServiceDetailSectionProps {
  id: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  features: string[];
  tag: string;
  stat: string;
  index: number;
  ctaLabel: string;
  image?: string;
}

export function ServiceDetailSection({
  id,
  icon,
  color,
  title,
  description,
  features,
  tag,
  stat,
  index,
  ctaLabel,
  image,
}: ServiceDetailSectionProps) {
  const isEven = index % 2 === 0;

  return (
    <section
      id={id}
      aria-labelledby={`service-title-${id}`}
      className="py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20',
            !isEven && 'lg:[direction:rtl]'
          )}
        >
          {/* Image area */}
          <ScrollReveal direction={isEven ? 'left' : 'right'} distance={60}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={cn(
                'relative aspect-video overflow-hidden rounded-2xl bg-slate-100',
                'border border-slate-200 transition-colors duration-300',
                'hover:border-teal-300',
                !isEven && 'lg:[direction:ltr]'
              )}
            >
              {/* Service image or fallback */}
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="text-5xl" aria-hidden="true">
                    {icon}
                  </span>
                  <div
                    className="h-1 w-12 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Corner accent */}
              <div
                className="absolute left-0 top-0 h-24 w-1 rounded-b-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
            </motion.div>
          </ScrollReveal>

          {/* Content area */}
          <ScrollReveal
            direction={isEven ? 'right' : 'left'}
            distance={60}
            delay={0.15}
          >
            <div className={cn(!isEven && 'lg:[direction:ltr]')}>
              {/* Tag and stat */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant="teal">{tag}</Badge>
                <span className="text-sm font-medium text-slate-500">
                  {stat}
                </span>
              </div>

              {/* Title */}
              <h2
                id={`service-title-${id}`}
                className="mb-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl"
              >
                {title}
              </h2>

              {/* Description */}
              <p className="mb-8 text-base leading-relaxed text-slate-600 sm:text-lg">
                {description}
              </p>

              {/* Features list */}
              <ul className="mb-8 space-y-3" role="list">
                {features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.3 + i * 0.08,
                      duration: 0.4,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="flex items-start gap-3 text-sm text-slate-700 sm:text-base"
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-6 py-3',
                  'bg-teal-600 text-sm font-medium text-white',
                  'transition-colors duration-150 hover:bg-teal-500',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2'
                )}
              >
                {ctaLabel}
                <svg
                  className="h-4 w-4"
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
              </motion.a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
