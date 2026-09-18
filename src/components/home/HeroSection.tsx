'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { TextReveal } from '@/components/animations';
import { Badge } from '@/components/ui';
import { NeuralCircuitGrid } from './NeuralCircuitGrid';
import { HeroSlideshow } from './HeroSlideshow';

export function HeroSection() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms — each layer at different speed for depth
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const nodesY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label={t('tagline')}
    >
      {/* ── Photo slideshow + gradient mesh background ───── */}
      <motion.div
        className="absolute inset-0 -z-10 bg-neutral-950"
        style={{ y: bgY }}
      >
        <HeroSlideshow />

        {/* Dark scrim — keeps white copy readable over bright photos */}
        <div className="absolute inset-0 bg-neutral-950/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-transparent to-neutral-950/70" />

        {/* Radial mesh spots — teal glow over the photos */}
        <div
          className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full opacity-45"
          style={{
            background: 'radial-gradient(circle, rgba(125, 224, 227, 0.35) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-15%] w-[60vw] h-[60vw] rounded-full opacity-35"
          style={{
            background: 'radial-gradient(circle, rgba(36, 173, 181, 0.25) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(64, 201, 207, 0.3) 0%, transparent 60%)',
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />
      </motion.div>

      {/* ── Neural Circuit Grid ──────────────────────────── */}
      <NeuralCircuitGrid gridY={gridY} nodesY={nodesY} className="-z-5" />

      {/* ── Main content: Hero text ─────────────────────── */}
      <motion.div
        className="relative z-10 container-wide flex flex-col items-center text-center pt-28 sm:pt-32 pb-8 sm:pb-12 -mt-16 sm:-mt-20"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Badge variant="teal" className="mb-6 px-4 py-1.5 text-sm font-medium tracking-wide bg-white/10 text-teal-200 ring-1 ring-white/15 backdrop-blur-sm">
            {t('badge')}
          </Badge>
        </motion.div>

        {/* Sub-tagline (above main heading) */}
        <motion.p
          className="mb-3 text-base sm:text-lg md:text-xl font-medium text-white/70 tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {t('taglineSub')}
        </motion.p>

        {/* Main heading */}
        <h1 className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-white">
          <TextReveal
            text={t('tagline')}
            className="justify-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95]"
            delay={0.6}
            staggerDelay={0.06}
          />
        </h1>

        {/* Company name */}
        <motion.p
          className="mt-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-[family-name:var(--font-display)] bg-linear-135 from-teal-300 to-teal-500 bg-clip-text text-transparent tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
        >
          {t('companyName')}
        </motion.p>

        {/* Description */}
        <motion.p
          className="mt-6 max-w-xl text-base sm:text-lg text-white/75 leading-relaxed whitespace-pre-line"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.5 }}
        >
          {t('description')}
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.8 }}
        >
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-teal-600 px-7 text-base font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            {t('cta')}
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-white/30 px-7 text-base font-medium text-white transition-colors hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            {t('ctaSecondary')}
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ─────────────────────────────── */}
      <motion.div
        className="relative z-10 pb-8 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <span className="text-xs font-medium text-white/50 tracking-widest uppercase">
          {t('scrollIndicator')}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal-300"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
