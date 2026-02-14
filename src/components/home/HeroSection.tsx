'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { TextReveal } from '@/components/animations';
import { Badge } from '@/components/ui';
import { NeuralCircuitGrid } from './NeuralCircuitGrid';

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
      {/* ── Gradient mesh background ─────────────────────── */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y: bgY }}
      >
        {/* Base gradient — strengthened teal */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/30 via-teal-100/40 to-white" />

        {/* Radial mesh spots — boosted opacity */}
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
          <Badge variant="teal" className="mb-6 px-4 py-1.5 text-sm font-medium tracking-wide">
            {t('badge')}
          </Badge>
        </motion.div>

        {/* Sub-tagline (above main heading) */}
        <motion.p
          className="mb-3 text-base sm:text-lg md:text-xl font-medium text-neutral-500 tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {t('taglineSub')}
        </motion.p>

        {/* Main heading */}
        <h1 className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-neutral-950">
          <TextReveal
            text={t('tagline')}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95]"
            delay={0.6}
            staggerDelay={0.06}
          />
        </h1>

        {/* Company name */}
        <motion.p
          className="mt-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-[family-name:var(--font-display)] text-gradient-teal tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
        >
          {t('companyName')}
        </motion.p>

        {/* Description */}
        <motion.p
          className="mt-6 max-w-xl text-base sm:text-lg text-neutral-600 leading-relaxed whitespace-pre-line"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.5 }}
        >
          {t('description')}
        </motion.p>
      </motion.div>

      {/* ── Scroll indicator ─────────────────────────────── */}
      <motion.div
        className="relative z-10 pb-8 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <span className="text-xs font-medium text-neutral-400 tracking-widest uppercase">
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
            className="text-teal-500"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
