'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import {
  industries,
  experiences,
  pillars,
  type PillarId,
  type IndustryId,
  type Industry,
} from '@/data/experiences';
import { ScrollReveal } from '@/components/animations';
import { ExperienceCard } from './ExperienceCard';
import { cn } from '@/lib/utils';

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

/* ── Industry tab icon SVGs ───────────────────────────── */

function IndustryIcon({ icon, className }: { icon: string; className?: string }) {
  const props = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 18,
    height: 18,
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
    case 'sparkles':
      return (
        <svg {...props}>
          <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
        </svg>
      );
    case 'wine':
      return (
        <svg {...props}>
          <path d="M8 22h8" />
          <path d="M12 11v11" />
          <path d="M20 7c0 4.418-3.582 8-8 8S4 11.418 4 7" />
          <path d="M4 7h16" />
          <path d="M7 2l-1 5" />
          <path d="M17 2l1 5" />
        </svg>
      );
    case 'shirt':
      return (
        <svg {...props}>
          <path d="M20.38 3.46 16 2 12 4 8 2 3.62 3.46a2 2 0 0 0-1.34 1.73l-.97 6.83A1 1 0 0 0 2.3 13h3.2l.72 6.06a2 2 0 0 0 1.99 1.74h7.58a2 2 0 0 0 1.99-1.74L18.5 13h3.2a1 1 0 0 0 .99-1.12l-.97-6.83a2 2 0 0 0-1.34-1.73Z" />
        </svg>
      );
    case 'music':
      return (
        <svg {...props}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case 'graduationCap':
      return (
        <svg {...props}>
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0Z" />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
      );
    case 'party':
      return (
        <svg {...props}>
          <path d="M5.8 11.3 2 22l10.7-3.79" />
          <path d="M4 3h.01" />
          <path d="M22 8h.01" />
          <path d="M15 2h.01" />
          <path d="M22 20h.01" />
          <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
          <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.63-.69 1.08-1.33 1.08h-.36c-.87 0-1.53.77-1.32 1.62l.14.53" />
          <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.59 4.91 9.14 5.5 9.14 6.14v.36c0 .87-.77 1.53-1.62 1.32l-.53-.14" />
        </svg>
      );
    case 'building':
      return (
        <svg {...props}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
          <path d="M12 10h.01" />
          <path d="M12 14h.01" />
          <path d="M16 10h.01" />
          <path d="M16 14h.01" />
          <path d="M8 10h.01" />
          <path d="M8 14h.01" />
        </svg>
      );
    case 'landmark':
      return (
        <svg {...props}>
          <line x1="3" x2="21" y1="22" y2="22" />
          <line x1="6" x2="6" y1="18" y2="11" />
          <line x1="10" x2="10" y1="18" y2="11" />
          <line x1="14" x2="14" y1="18" y2="11" />
          <line x1="18" x2="18" y1="18" y2="11" />
          <polygon points="12 2 20 7 4 7" />
          <line x1="2" x2="22" y1="18" y2="18" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...props}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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
}: {
  label: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
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

/* ── Tab Button ───────────────────────────────────────── */

function TabButton({
  industry,
  isActive,
  onClick,
  label,
}: {
  industry: Industry;
  isActive: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'relative flex flex-shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium',
        'whitespace-nowrap transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-md',
        isActive
          ? 'text-teal-700'
          : 'text-neutral-500 hover:text-neutral-800'
      )}
    >
      <IndustryIcon
        icon={industry.icon}
        className={cn(
          'h-4 w-4 transition-colors',
          isActive ? 'text-teal-600' : 'text-neutral-400'
        )}
      />
      <span>{label}</span>

      {/* Animated underline indicator */}
      {isActive && (
        <motion.div
          layoutId="industry-tab-indicator"
          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-teal-600"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
}

/* ── Main IndustryShowcase Section ────────────────────── */

interface IndustryShowcaseProps {
  initialPillar?: PillarId;
}

export function IndustryShowcase({ initialPillar }: IndustryShowcaseProps) {
  const t = useTranslations('services');
  const router = useRouter();
  const pathname = usePathname();
  const [activePillar, setActivePillar] = useState<PillarId | 'all'>(initialPillar ?? 'all');
  const [activeTab, setActiveTab] = useState<IndustryId>('beauty');
  const sectionRef = useRef<HTMLElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);

  const pillarMap = useMemo(() => {
    const map = new Map(pillars.map((p) => [p.id, p]));
    return map;
  }, []);

  const activeExperiences = useMemo(() => {
    let filtered = experiences;
    if (activePillar !== 'all') {
      filtered = filtered.filter((exp) => exp.pillar === activePillar);
    }
    return filtered.filter((exp) => exp.industry === activeTab);
  }, [activeTab, activePillar]);

  const handlePillarClick = useCallback((pillarId: PillarId | 'all') => {
    setActivePillar(pillarId);
    if (pillarId === 'all') {
      router.replace(pathname, { scroll: false });
    } else {
      router.replace(`${pathname}?pillar=${pillarId}`, { scroll: false });
    }
  }, [router, pathname]);

  const handleTabClick = useCallback((id: IndustryId) => {
    setActiveTab(id);
  }, []);

  /* Auto-scroll when arriving with a pillar param */
  useEffect(() => {
    if (initialPillar && sectionRef.current) {
      const timer = setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(ellipse, rgba(36, 173, 181, 0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative section-padding">
        <div className="container-default">
          {/* Section header */}
          <ScrollReveal>
            <div className="max-w-2xl text-center mx-auto">
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
                />
                {pillars.map((pillar) => (
                  <PillarPill
                    key={pillar.id}
                    label={t(pillar.nameKey)}
                    icon={pillar.icon}
                    isActive={activePillar === pillar.id}
                    onClick={() => handlePillarClick(pillar.id)}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Industry tab bar */}
          <ScrollReveal delay={0.15}>
            <div className="mt-6 lg:mt-8">
              <div
                ref={tabListRef}
                role="tablist"
                aria-label="Industry tabs"
                className={cn(
                  'flex overflow-x-auto scrollbar-none',
                  'border-b border-neutral-200',
                  '-mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center'
                )}
              >
                {industries.map((industry) => (
                  <TabButton
                    key={industry.id}
                    industry={industry}
                    isActive={activeTab === industry.id}
                    onClick={() => handleTabClick(industry.id)}
                    label={t(industry.nameKey)}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Tab content */}
          <div className="mt-8 min-h-[320px]" role="tabpanel" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activePillar}-${activeTab}`}
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
                          pillarId={exp.pillar}
                          pillarName={pillar ? t(pillar.nameKey) : ''}
                          pillarColor={pillar?.color ?? '#0D9488'}
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
