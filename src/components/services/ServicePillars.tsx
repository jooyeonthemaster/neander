'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { pillars, getExperiencesByPillar, type Pillar } from '@/data/experiences';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/animations';
import { cn } from '@/lib/utils';

/* ── Key color: teal unified ──────────────────────────── */
const KEY_COLOR = '#24ADB5';

/* ── SVG icons mapped by pillar.icon key ──────────────── */

function PillarIcon({ icon, className }: { icon: string; className?: string }) {
  const props = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 32,
    height: 32,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true as const,
  };

  switch (icon) {
    case 'camera':
      return (
        <svg {...props}>
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case 'scan':
      return (
        <svg {...props}>
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...props}>
          <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
          <path d="M19 2v2" />
          <path d="M20 3h-2" />
          <path d="M5 18v2" />
          <path d="M6 19H4" />
        </svg>
      );
    case 'palette':
      return (
        <svg {...props}>
          <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...props}>
          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
          <path d="m22 12.65-8.58 3.9a2 2 0 0 1-1.66 0L2 12.56" />
          <path d="m22 17.65-8.58 3.9a2 2 0 0 1-1.66 0L2 17.56" />
        </svg>
      );
    default:
      return null;
  }
}

/* ── Experience count per pillar ──────────────────────── */
const PILLAR_COUNTS: Record<string, number> = {};
pillars.forEach((p) => {
  PILLAR_COUNTS[p.id] = getExperiencesByPillar(p.id).length;
});

/* ── Reorder: ai-creative as hero ─────────────────────── */
const HERO_PILLAR_ID = 'ai-creative';
const heroPillar = pillars.find((p) => p.id === HERO_PILLAR_ID)!;
const restPillars = pillars.filter((p) => p.id !== HERO_PILLAR_ID);

/* ── Individual Pillar Card ───────────────────────────── */

function PillarCard({ pillar, idx, t }: { pillar: Pillar; idx: number; t: ReturnType<typeof useTranslations> }) {
  const count = PILLAR_COUNTS[pillar.id];

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden h-full',
        'border border-white/[0.06]',
        'bg-white/[0.04]',
        'transition-all duration-500',
        'hover:bg-white/[0.08] hover:border-teal-400/30',
        'cursor-default select-none',
      )}
    >
      {/* Top accent line — teal */}
      <div
        className="h-1 w-full bg-teal-400 opacity-70 group-hover:opacity-100 transition-opacity duration-500"
        aria-hidden="true"
      />

      {/* Hover glow — teal */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${KEY_COLOR}15 0%, transparent 55%)` }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col h-full p-6 sm:p-7 lg:p-8">
        {/* Icon + number */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/25 transition-all duration-500 group-hover:scale-110 group-hover:bg-teal-500/25 group-hover:text-teal-300 group-hover:shadow-lg group-hover:shadow-teal-500/10">
            <PillarIcon icon={pillar.icon} className="h-7 w-7 transition-colors" />
          </div>
          <span className="text-3xl font-bold font-mono text-teal-400 opacity-[0.15] group-hover:opacity-[0.30] transition-opacity duration-500">
            {String(idx + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl mb-3 leading-tight">
          {t(pillar.nameKey)}
        </h3>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-neutral-200 leading-relaxed mb-4">
          {t(pillar.taglineKey)}
        </p>

        {/* Description */}
        <p className="text-sm text-neutral-400 leading-[1.7] flex-1">
          {t(pillar.descriptionKey)}
        </p>

        {/* Count */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-2">
          <span className="text-2xl font-extrabold text-teal-400">
            {count}
          </span>
          <span className="text-sm font-medium text-neutral-400">
            체험 콘텐츠
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── ServicePillars Section ───────────────────────────── */

export function ServicePillars() {
  const t = useTranslations('services');

  return (
    <section className="relative overflow-hidden" aria-labelledby="pillars-heading">
      {/* Dark background continuity */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-[#060d10] to-neutral-950" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      <div className="relative section-padding">
        <div className="container-default">
          <ScrollReveal>
            <div className="max-w-2xl text-center mx-auto mb-14 lg:mb-20">
              <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/[0.06] text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                AI EXPERIENCES
              </span>
              <h2
                id="pillars-heading"
                className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
              >
                {t('pillarsTitle')}
              </h2>
              <p className="mt-5 text-base text-neutral-300 leading-relaxed sm:text-lg">
                {t('pillarsSubtitle')}
              </p>
            </div>
          </ScrollReveal>

          {/* Bento layout — hero + 2x2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Hero — AI 크리에이티브 (조향) */}
            <StaggerChildren staggerDelay={0.08} className="lg:col-span-5 grid grid-cols-1 gap-5">
              <StaggerItem>
                <PillarCard pillar={heroPillar} idx={0} t={t} />
              </StaggerItem>
            </StaggerChildren>

            {/* Remaining 4 — 2x2 grid */}
            <StaggerChildren
              staggerDelay={0.08}
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {restPillars.map((pillar, idx) => (
                <StaggerItem key={pillar.id}>
                  <PillarCard pillar={pillar} idx={idx + 1} t={t} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </div>
    </section>
  );
}
