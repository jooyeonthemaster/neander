'use client';

import { useState, useRef, useMemo, useCallback, useEffect, useSyncExternalStore } from 'react';
import { smoothScrollIntoView } from '@/lib/smooth-scroll';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { experiences, getIndustryById, pillars, type PillarId } from '@/data/experiences';
import { ScrollReveal } from '@/components/animations';
import { ExperienceCard } from './ExperienceCard';
import { cn } from '@/lib/utils';

const subscribeToHydration = () => () => {};
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

/* ── Pillar icon SVGs ────────────────────────────────── */

function PillarIcon({ icon, className }: { icon: string; className?: string }) {
  const props = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 16,
    height: 16,
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

/* ── Pillar Filter Pill ──────────────────────────────── */

function PillarPill({
  label,
  icon,
  isActive,
  onClick,
  disabled,
}: {
  label: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      className={cn(
        'relative flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium',
        'whitespace-nowrap transition-all duration-200 border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
        isActive
          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
          : 'bg-white text-neutral-600 border-neutral-200 hover:border-teal-300 hover:text-teal-700',
      )}
    >
      {icon && (
        <PillarIcon
          icon={icon}
          className={cn('h-4 w-4 transition-colors', isActive ? 'text-white' : 'text-neutral-400')}
        />
      )}
      <span>{label}</span>
    </button>
  );
}

/* ── Main IndustryShowcase Section ────────────────────── */

interface IndustryShowcaseProps {
  initialPillar?: PillarId;
}

export function IndustryShowcase({ initialPillar }: IndustryShowcaseProps) {
  const t = useTranslations('services');
  // Do not accept a filter click before its client handler is ready.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrationSnapshot, serverHydrationSnapshot);
  const [activePillar, setActivePillar] = useState<PillarId | 'all'>(initialPillar ?? 'all');
  const sectionRef = useRef<HTMLElement>(null);

  const industryName = useCallback(
    (id: Parameters<typeof getIndustryById>[0]) => {
      const industry = getIndustryById(id);
      return industry ? t(industry.nameKey) : '';
    },
    [t]
  );

  const pillarMap = useMemo(() => {
    const map = new Map(pillars.map((p) => [p.id, p]));
    return map;
  }, []);

  // 산업군은 필터 대신 카드 뱃지로만 보여 준다 — 필라만 고르면 해당 체험이 한 화면에 다 나온다
  const activeExperiences = useMemo(
    () => (activePillar === 'all' ? experiences : experiences.filter((exp) => exp.pillar === activePillar)),
    [activePillar]
  );
  const handlePillarClick = useCallback((pillarId: PillarId | 'all') => {
    if (pillarId === activePillar) return;
    setActivePillar(pillarId);
    const url = new URL(window.location.href);
    if (pillarId === 'all') url.searchParams.delete('pillar');
    else url.searchParams.set('pillar', pillarId);
    window.history.pushState(null, '', url);
  }, [activePillar]);

  useEffect(() => {
    const onPopState = () => {
      const selectedPillar = new URLSearchParams(window.location.search).get('pillar');
      setActivePillar(pillars.some((pillar) => pillar.id === selectedPillar) ? selectedPillar as PillarId : 'all');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  /* Auto-scroll when arriving with a pillar param */
  useEffect(() => {
    if (initialPillar && sectionRef.current) {
      const timer = setTimeout(() => {
        smoothScrollIntoView(sectionRef.current, { block: 'start' });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [initialPillar]);

  return (
    <section
      ref={sectionRef}
      id="experiences"
      className="relative overflow-hidden bg-white"
      aria-labelledby="industry-showcase-heading"
    >
      {/* Subtle teal glow on white */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[140px] transform-gpu"
        style={{ background: 'radial-gradient(ellipse, rgba(36, 173, 181, 0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative section-padding">
        <div className="container-default">
          {/* Section header */}
          <ScrollReveal>
            <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:items-end lg:text-left">
              <div className="max-w-2xl">
                <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
                  AI EXPERIENCES
                </span>
                <h2 id="industry-showcase-heading" className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                  {t('industryTitle')}
                </h2>
                <p className="mt-4 text-base text-neutral-500 leading-relaxed sm:text-lg">
                  {t('industrySubtitle')}
                </p>
              </div>
              <Link href="/portfolio" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-700 transition-colors hover:border-teal-400 hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
                {t('viewPortfolio')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </Link>
            </div>
          </ScrollReveal>

          {/* Pillar filter pills */}
          <ScrollReveal delay={0.1}>
            <div className="mt-8 lg:mt-12">
              <div
                className={cn(
                  'flex items-center gap-2 overflow-x-auto scrollbar-none pb-1',
                  '-mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center sm:flex-wrap',
                )}
              >
                <PillarPill
                  label={t('allPillars')}
                  isActive={activePillar === 'all'}
                  onClick={() => handlePillarClick('all')}
                  disabled={!hydrated}
                />
                {pillars.map((pillar) => (
                  <PillarPill
                    key={pillar.id}
                    label={t(pillar.nameKey)}
                    icon={pillar.icon}
                    isActive={activePillar === pillar.id}
                    onClick={() => handlePillarClick(pillar.id)}
                    disabled={!hydrated}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Experience grid */}
          <div className="mt-8 min-h-[320px] lg:mt-10" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePillar}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {activeExperiences.length > 0 ? (
                  <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {activeExperiences.map((exp) => {
                      const pillar = pillarMap.get(exp.pillar);
                      return (
                        <ExperienceCard
                          key={exp.id}
                          slug={exp.slug}
                          name={t(exp.nameKey)}
                          oneLiner={t(exp.oneLinerKey)}
                          pillarName={pillar ? t(pillar.nameKey) : ''}
                          industryName={industryName(exp.industry)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                    <p className="text-neutral-500 text-sm">{t('noExperiences')}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
