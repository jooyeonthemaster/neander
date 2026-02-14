'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui';
import { ScrollReveal } from '@/components/animations';
import { cn } from '@/lib/utils';

export function ServiceCTA() {
  const t = useTranslations('services');

  return (
    <section
      className="relative overflow-hidden bg-neutral-950"
      aria-labelledby="service-cta-heading"
    >
      {/* ── Decorative elements ──────────────────────────── */}

      {/* Top-right teal glow */}
      <div
        className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom-left teal glow */}
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Gradient border top */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"
        aria-hidden="true"
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      {/* ── Content ──────────────────────────────────────── */}
      <div className="relative container-tight section-padding-lg text-center">
        <ScrollReveal>
          <h2
            id="service-cta-heading"
            className={cn(
              'font-[family-name:var(--font-display)]',
              'text-3xl sm:text-4xl md:text-5xl font-bold',
              'text-white tracking-tight leading-tight'
            )}
          >
            {t('ctaTitle')}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="mt-5 max-w-lg mx-auto text-base sm:text-lg text-neutral-400 leading-relaxed">
            {t('ctaSubtitle')}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary CTA */}
            <div className="relative">
              {/* Animated glow behind button */}
              <motion.div
                className={cn(
                  'absolute -inset-1 rounded-xl blur-lg',
                  'bg-gradient-to-r from-teal-500/40 via-cyan-400/40 to-teal-500/40'
                )}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.04, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-hidden="true"
              />
              <Button
                variant="primary"
                size="lg"
                className="relative px-8 py-3 text-base"
                asChild
              >
                <Link href="/contact">{t('ctaConsult')}</Link>
              </Button>
            </div>

            {/* Secondary CTA */}
            <Button
              variant="secondary"
              size="lg"
              className={cn(
                'px-8 py-3 text-base',
                'border-neutral-700 text-neutral-300',
                'hover:border-teal-500 hover:text-white hover:bg-teal-500/10'
              )}
              asChild
            >
              <Link href="/quote">{t('ctaQuote')}</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
