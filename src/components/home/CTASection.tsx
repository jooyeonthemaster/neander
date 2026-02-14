'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui';
import { ScrollReveal, ParallaxWrapper } from '@/components/animations';
import { cn } from '@/lib/utils';

export function CTASection() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0.6]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-950"
      aria-label={t('contact.subtitle')}
    >
      {/* ── Decorative elements ──────────────────────────── */}

      {/* Top-right teal glow */}
      <motion.div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
        style={{
          opacity: glowOpacity,
          background: 'radial-gradient(circle, rgba(36, 173, 181, 0.15) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom-left teal glow */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
        style={{
          opacity: glowOpacity,
          background: 'radial-gradient(circle, rgba(64, 201, 207, 0.12) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Animated gradient border at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

      {/* Floating geometric shapes */}
      <ParallaxWrapper speed={0.15} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[15%] right-[10%] w-32 h-32 rounded-full border border-teal-500/10"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[20%] left-[8%] w-20 h-20 rounded-full border border-teal-400/10"
          aria-hidden="true"
        />
        <div
          className="absolute top-[40%] left-[25%] w-2 h-2 rounded-full bg-teal-500/20"
          aria-hidden="true"
        />
        <div
          className="absolute top-[30%] right-[30%] w-3 h-3 rounded-full bg-teal-400/15"
          aria-hidden="true"
        />
      </ParallaxWrapper>

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
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            {t('contact.subtitle')}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="mt-6 max-w-lg mx-auto text-base sm:text-lg text-neutral-400 leading-relaxed">
            {t('contact.description')}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-10 relative inline-block">
            {/* Animated glow behind button */}
            <motion.div
              className={cn(
                'absolute -inset-1 rounded-xl blur-lg',
                'bg-gradient-to-r from-teal-500/40 via-cyan-400/40 to-teal-500/40'
              )}
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              aria-hidden="true"
            />
            <Button variant="primary" size="lg" className="relative px-10 py-3 text-base" asChild>
              <Link href="/quote">
                {t('hero.cta')}
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
