'use client';

import { useTranslations } from 'next-intl';
import { ScrollReveal, CountUp, FitToViewport } from '@/components/animations';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   Stat definitions -- ordered for visual impact
   ───────────────────────────────────────────────────────── */
// 숫자는 번역 파일의 items.<key>.number 를 그대로 쓴다.
// (예전에는 코드에 박힌 값을 써서 영문에서 '1+ Total Visitors'로 보였다)
const STAT_KEYS = ['events', 'visitors', 'stores', 'satisfaction'] as const;

export function StatsCounter() {
  const t = useTranslations('stats');

  return (
    <section className="home-screen relative overflow-hidden" aria-label={t('title')}>
      {/* ── Gradient background band ─────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      <FitToViewport className="container-wide section-padding-md lg:py-0">
        {/* Section heading */}
        <ScrollReveal className="text-center mb-12 lg:mb-[8vh]">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-300 mb-3">
            {t('subtitle')}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-[clamp(1.875rem,4.5vh,3rem)] font-bold text-white tracking-tight">
            {t('title')}
          </h2>
        </ScrollReveal>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 lg:gap-x-6">
          {STAT_KEYS.map((key, idx) => {
            const suffix = t(`items.${key}.suffix`);
            const rawNumber = t(`items.${key}.number`);
            const numericValue = Number(rawNumber);
            return (
              <ScrollReveal
                key={key}
                delay={idx * 0.1}
                className={cn(
                  'flex flex-col items-center text-center',
                  idx > 0 && 'lg:border-l lg:border-teal-700/40'
                )}
              >
                {/* Number + suffix */}
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="font-[family-name:var(--font-display)] font-extrabold text-4xl sm:text-5xl lg:text-[clamp(3.75rem,8vh,5rem)] text-white tabular-nums tracking-tight">
                    {Number.isFinite(numericValue) && rawNumber.trim() !== '' ? (
                      <CountUp target={numericValue} duration={2.5} />
                    ) : (
                      rawNumber
                    )}
                  </span>
                  {suffix && (
                    <span className="font-[family-name:var(--font-display)] font-bold text-2xl sm:text-3xl lg:text-[clamp(2.25rem,4.5vh,3rem)] text-teal-300">
                      {suffix}
                    </span>
                  )}
                </div>

                {/* Label */}
                <p className="mt-3 text-sm sm:text-base font-medium text-teal-200">
                  {t(`items.${key}.label`)}
                </p>

                {/* Description (hidden on mobile for cleanliness) */}
                <p className="hidden sm:block mt-1 text-xs text-teal-400/70 max-w-[200px]">
                  {t(`items.${key}.description`)}
                </p>
              </ScrollReveal>
            );
          })}
        </div>
      </FitToViewport>
    </section>
  );
}
