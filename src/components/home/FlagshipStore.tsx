'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/animations';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   Naver Place links
   ───────────────────────────────────────────────────────── */
const ACCENT_ID_MAP =
  'https://map.naver.com/p/entry/place/1274492663?placePath=%252Fhome%253Fentry%253Dplt&searchType=place&lng=126.9267345&lat=37.5549328';

const ACCENT_WOW_MAP =
  'https://map.naver.com/p/search/%EC%95%85%EC%84%BC%ED%8A%B8%EC%99%80%EC%9A%B0/place/1205808970?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202602142112&locale=ko&svcName=map_pcv5&searchText=%EC%95%85%EC%84%BC%ED%8A%B8%EC%99%80%EC%9A%B0';

const KEY_COLOR = '#24ADB5';

/* ── SVG Icons ────────────────────────────────────────── */
function FlaskIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16.5h10" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

export function FlagshipStore() {
  const t = useTranslations('flagship');

  return (
    <section className="relative overflow-hidden bg-white" id="flagship">
      {/* ── Background layers (light, matching ServicesOverview) ── */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-[-8%] right-[20%] w-[500px] h-[400px] rounded-full blur-[120px]"
        style={{ background: `radial-gradient(ellipse, ${KEY_COLOR}08 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Divider line from previous section */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

      <div className="relative container-wide py-16 lg:py-20">
        {/* Section header */}
        <ScrollReveal className="text-center mb-10 lg:mb-14">
          <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-teal-600/20 bg-teal-500/[0.06] text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-600">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {t('badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
            {t('title')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            {t('description')}
          </p>
        </ScrollReveal>

        {/* ── Store cards (2 columns) ──────────────────────── */}
        <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 mb-8 lg:mb-10">
          {/* AC'SCENT ID */}
          <StaggerItem>
            <StoreCard
              icon={<FlaskIcon />}
              name={t('stores.accentId.nameEn')}
              nameKo={t('stores.accentId.name')}
              description={t('stores.accentId.description')}
              detail={t('stores.accentId.detail')}
              features={[
                t('stores.accentId.features.0'),
                t('stores.accentId.features.1'),
                t('stores.accentId.features.2'),
              ]}
              mapUrl={ACCENT_ID_MAP}
              mapLabel={t('viewMap')}
            />
          </StaggerItem>

          {/* AC'SCENT WOW */}
          <StaggerItem>
            <StoreCard
              icon={<SparklesIcon />}
              name={t('stores.accentWow.nameEn')}
              nameKo={t('stores.accentWow.name')}
              description={t('stores.accentWow.description')}
              detail={t('stores.accentWow.detail')}
              features={[
                t('stores.accentWow.features.0'),
                t('stores.accentWow.features.1'),
                t('stores.accentWow.features.2'),
              ]}
              mapUrl={ACCENT_WOW_MAP}
              mapLabel={t('viewMap')}
            />
          </StaggerItem>
        </StaggerChildren>

        {/* ── Bottom info strip ────────────────────────────── */}
        <ScrollReveal>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Address + Phone */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon />
                  <span>{t('address')}</span>
                </span>
                <a
                  href="tel:02-336-3368"
                  className="inline-flex items-center gap-1.5 text-teal-600 font-medium hover:text-teal-700 transition-colors"
                >
                  <PhoneIcon />
                  <span>{t('phone')}</span>
                </a>
              </div>

              {/* Flagship CTA button */}
              <Link
                href="/experience"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-teal-600 text-white text-base sm:text-lg font-bold transition-all duration-300 hover:bg-teal-700 hover:gap-4 hover:shadow-lg hover:shadow-teal-600/20 shrink-0"
              >
                <span>{t('b2bCta')}</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform duration-300" />
              </Link>
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              {t('b2bNotice')}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── Store Card Component (light theme) ────────────────── */
function StoreCard({
  icon,
  name,
  nameKo,
  description,
  detail,
  features,
  mapUrl,
  mapLabel,
}: {
  icon: React.ReactNode;
  name: string;
  nameKo: string;
  description: string;
  detail: string;
  features: string[];
  mapUrl: string;
  mapLabel: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'group relative flex flex-col h-full rounded-2xl overflow-hidden',
        'border border-neutral-200/80',
        'bg-white',
        'shadow-sm',
        'transition-all duration-500',
        'hover:shadow-xl hover:border-teal-200',
      )}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-teal-500 transition-all duration-500 group-hover:h-1.5" aria-hidden="true" />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${KEY_COLOR}0C 0%, transparent 50%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col h-full p-6 sm:p-7">
        {/* Icon + Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/[0.08] text-teal-600 ring-1 ring-teal-500/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-teal-500/[0.12]">
            {icon}
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              {name}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">{nameKo}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-500 leading-relaxed mb-2">
          {description}
        </p>

        {/* Detail */}
        <p className="text-sm text-neutral-700 leading-relaxed mb-4 flex-1">
          {detail}
        </p>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {features.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-500/[0.06] border border-teal-500/15 text-xs font-medium text-teal-600"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Map link */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 transition-all duration-300 hover:text-teal-700 hover:gap-3"
          >
            <span>{mapLabel}</span>
            <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
