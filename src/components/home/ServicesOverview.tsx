'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/animations';
import { pillars, getExperiencesByPillar } from '@/data/experiences';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   Pillar icon map
   ───────────────────────────────────────────────────────── */
const PILLAR_ICONS: Record<string, React.ReactNode> = {
  camera: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ),
  scan: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  ),
  sparkles: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
    </svg>
  ),
  palette: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
    </svg>
  ),
  layers: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.65-8.58 3.9a2 2 0 0 1-1.66 0L2 12.56" />
      <path d="m22 17.65-8.58 3.9a2 2 0 0 1-1.66 0L2 17.56" />
    </svg>
  ),
};

/* ── Experience count per pillar (precomputed) ─────────── */
const PILLAR_COUNTS: Record<string, number> = {};
pillars.forEach((p) => {
  PILLAR_COUNTS[p.id] = getExperiencesByPillar(p.id).length;
});

/* ── Key color: teal unified ───────────────────────────── */
const KEY_COLOR = '#24ADB5';

/* ── Reorder: ai-creative (조향) as hero, then rest ────── */
const HERO_PILLAR_ID = 'ai-creative';
const heroPillar = pillars.find((p) => p.id === HERO_PILLAR_ID)!;
const restPillars = pillars.filter((p) => p.id !== HERO_PILLAR_ID);

export function ServicesOverview() {
  const t = useTranslations('services');

  return (
    <section className="relative overflow-hidden bg-white" id="services">
      {/* ── Background layers (light) ──────────────────────── */}
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />
      {/* Top-left teal glow */}
      <div
        className="absolute top-[-8%] left-[15%] w-[600px] h-[400px] rounded-full blur-[120px]"
        style={{ background: `radial-gradient(ellipse, ${KEY_COLOR}10 0%, transparent 70%)` }}
        aria-hidden="true"
      />
      {/* Bottom-right teal glow */}
      <div
        className="absolute bottom-[-5%] right-[10%] w-[500px] h-[300px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(ellipse, rgba(36, 173, 181, 0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* ── Content ──────────────────────────────────────── */}
      <div className="relative w-full py-16 lg:py-20">
        <div className="container-wide">
          {/* Header — compact */}
          <ScrollReveal className="text-center mb-10 lg:mb-14">
            <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-teal-600/20 bg-teal-500/[0.06] text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-600">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              AI EXPERIENCES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
              {t('pillarsTitle')}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
              {t('pillarsSubtitle')}
            </p>
          </ScrollReveal>

          {/* ── Bento: hero (ai-creative) + 2x2 grid ─────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
            {/* Hero card — AI 크리에이티브 (조향) */}
            <StaggerChildren staggerDelay={0.08} className="lg:col-span-5 grid grid-cols-1 gap-4 lg:gap-5">
              <StaggerItem>
                <PillarCardHero
                  pillar={heroPillar}
                  t={t}
                  count={PILLAR_COUNTS[heroPillar.id]}
                />
              </StaggerItem>
            </StaggerChildren>

            {/* Remaining 4 pillars in 2x2 grid */}
            <StaggerChildren
              staggerDelay={0.08}
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5"
            >
              {restPillars.map((pillar, idx) => (
                <StaggerItem key={pillar.id}>
                  <PillarCard
                    pillar={pillar}
                    idx={idx}
                    t={t}
                    count={PILLAR_COUNTS[pillar.id]}
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>

          {/* Bottom stat line */}
          <ScrollReveal className="mt-10 lg:mt-14 flex justify-center">
            <div className="inline-flex items-center gap-5 sm:gap-7 px-7 py-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/80 backdrop-blur-sm">
              <StatItem value="42" label="체험 콘텐츠" color="#24ADB5" />
              <span className="w-px h-4 bg-neutral-200" aria-hidden="true" />
              <StatItem value="9" label="산업군" color="#24ADB5" />
              <span className="w-px h-4 bg-neutral-200" aria-hidden="true" />
              <StatItem value="5" label="카테고리" color="#24ADB5" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ── Stat Item ────────────────────────────────────────── */
function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span
        className="text-xl sm:text-2xl font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-sm text-neutral-500 font-medium">{label}</span>
    </span>
  );
}

/* ── Hero Card (AI 크리에이티브 — tall, rich layout) ───── */
function PillarCardHero({
  pillar,
  t,
  count,
}: {
  pillar: (typeof pillars)[number];
  t: ReturnType<typeof useTranslations>;
  count: number;
}) {
  return (
    <Link href={`/services?pillar=${pillar.id}`} className="group block h-full focus-visible:outline-none">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          'relative flex flex-col h-full min-h-[380px] rounded-2xl overflow-hidden',
          'border border-neutral-200/80',
          'bg-white',
          'shadow-sm',
          'transition-all duration-500',
          'group-hover:shadow-xl group-hover:border-teal-200',
          'group-focus-visible:ring-2 group-focus-visible:ring-teal-500 group-focus-visible:ring-offset-2',
        )}
      >
        {/* Top accent bar — teal */}
        <div
          className="h-1 w-full bg-teal-500 transition-all duration-500 group-hover:h-1.5"
          aria-hidden="true"
        />

        {/* Background glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${KEY_COLOR}0C 0%, transparent 50%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col h-full p-7 lg:p-9">
          {/* Icon */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/[0.08] text-teal-600 ring-1 ring-teal-500/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-teal-500/[0.12]">
              {PILLAR_ICONS[pillar.icon] ?? null}
            </div>
            <span className="text-3xl font-bold font-mono text-teal-500 opacity-[0.12] group-hover:opacity-[0.20] transition-opacity duration-500">
              01
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-3 leading-tight">
            {t(pillar.nameKey)}
          </h3>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed mb-3">
            {t(pillar.taglineKey)}
          </p>

          {/* Description */}
          <p className="text-sm text-neutral-400 leading-[1.8] flex-1">
            {t(pillar.descriptionKey)}
          </p>

          {/* Bottom: count + CTA */}
          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-teal-600">
                {count}
              </span>
              <span className="text-sm font-medium text-neutral-400">체험 콘텐츠</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 transition-all duration-300 group-hover:gap-3">
              <span>{t('viewDetail')}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1.5"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Standard Pillar Card (2x2 grid cards) ────────────── */
function PillarCard({
  pillar,
  idx,
  t,
  count,
}: {
  pillar: (typeof pillars)[number];
  idx: number;
  t: ReturnType<typeof useTranslations>;
  count: number;
}) {
  return (
    <Link href={`/services?pillar=${pillar.id}`} className="group block h-full focus-visible:outline-none">
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          'relative flex flex-col h-full rounded-2xl overflow-hidden',
          'border border-neutral-200/80',
          'bg-white',
          'shadow-sm',
          'transition-all duration-500',
          'group-hover:shadow-lg group-hover:border-teal-200',
          'group-focus-visible:ring-2 group-focus-visible:ring-teal-500 group-focus-visible:ring-offset-2',
        )}
      >
        {/* Top accent bar — teal */}
        <div
          className="h-1 w-full bg-teal-500 transition-all duration-500 group-hover:h-1.5"
          aria-hidden="true"
        />

        {/* Background glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${KEY_COLOR}0A 0%, transparent 55%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col h-full p-5 sm:p-6">
          {/* Icon + Number */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/[0.08] text-teal-600 ring-1 ring-teal-500/20 transition-all duration-500 group-hover:scale-105 group-hover:bg-teal-500/[0.12]">
              {PILLAR_ICONS[pillar.icon] ?? null}
            </div>
            <span className="text-xl font-bold font-mono text-teal-500 opacity-[0.12] group-hover:opacity-[0.20] transition-opacity duration-500">
              0{idx + 2}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight mb-2 leading-tight">
            {t(pillar.nameKey)}
          </h3>

          {/* Tagline */}
          <p className="text-sm text-neutral-500 leading-relaxed mb-2">
            {t(pillar.taglineKey)}
          </p>

          {/* Description */}
          <p className="text-xs text-neutral-400 leading-relaxed flex-1 line-clamp-2">
            {t(pillar.descriptionKey)}
          </p>

          {/* Bottom: count + CTA */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-teal-600">
                {count}
              </span>
              <span className="text-xs font-medium text-neutral-400">체험 콘텐츠</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 transition-all duration-300 group-hover:gap-2.5">
              <span>{t('viewDetail')}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
