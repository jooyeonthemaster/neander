'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { FitToViewport, ScrollReveal, StaggerChildren, StaggerItem } from '@/components/animations';

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
    <section className="home-screen relative overflow-hidden bg-white" id="flagship">
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
        className="absolute top-[-8%] right-[20%] w-[500px] h-[400px] rounded-full blur-[120px] transform-gpu"
        style={{ background: `radial-gradient(ellipse, ${KEY_COLOR}08 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Divider line from previous section */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

      <FitToViewport className="container-wide py-16 lg:py-0 lg-short:max-w-[68rem]">
        {/* Section header */}
        <ScrollReveal className="text-center mb-10 lg:mb-[3.5vh] lg-short:mb-2">
          <span className="inline-flex items-center gap-2 mb-5 lg:mb-[1.6vh] lg-short:mb-1 px-4 py-1.5 rounded-full border border-teal-600/20 bg-teal-500/[0.06] text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-600">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {t('badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[clamp(2rem,5vh,3.75rem)] font-bold tracking-tight text-neutral-900 leading-[1.1]">
            {t('title')}
          </h2>
          <p className="mt-4 lg:mt-[1.4vh] text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            {t('description')}
          </p>
        </ScrollReveal>

        {/* ── Store cards (2 columns) ──────────────────────── */}
        <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 mb-8 lg:mb-[3vh] lg-short:mb-3">
          {/* AC'SCENT ID */}
          <StaggerItem>
            <StoreCard
              imageSrc="/images/flagship/acscent-id.webp"
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
              imageSrc="/images/flagship/acscent-wow.webp"
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
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 backdrop-blur-sm p-5 sm:p-6 lg-short:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Address + Phone */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon />
                  <span>{t('address')}</span>
                </span>
                <a
                  href="tel:+8223363368"
                  className="inline-flex items-center gap-1.5 text-teal-600 font-medium hover:text-teal-700 transition-colors"
                >
                  <PhoneIcon />
                  <span>{t('phone')}</span>
                </a>
              </div>

              {/* Flagship CTA button */}
              <Link
                href="/experience"
                className="inline-flex items-center gap-3 px-8 py-4 lg-short:py-3 rounded-2xl bg-teal-600 text-white text-base sm:text-lg font-bold transition-all duration-300 hover:bg-teal-700 hover:gap-4 hover:shadow-lg hover:shadow-teal-600/20 shrink-0"
              >
                <span>{t('b2bCta')}</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform duration-300" />
              </Link>
            </div>
            <p className="mt-3 lg-short:mt-2 text-xs text-neutral-400">
              {t('b2bNotice')}
            </p>
          </div>
        </ScrollReveal>
      </FitToViewport>
    </section>
  );
}

/* ── Store Card Component (full photo background) ──────── */
function StoreCard({
  imageSrc,
  icon,
  name,
  nameKo,
  description,
  detail,
  features,
  mapUrl,
  mapLabel,
}: {
  imageSrc: string;
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
    <article className="group relative isolate flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl bg-neutral-950 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:min-h-[560px] lg:min-h-[clamp(28rem,51vh,36rem)] lg-short:min-h-[25rem] motion-reduce:transition-none">
      <Image
        src={imageSrc}
        alt=""
        fill
        loading="eager"
        sizes="(min-width: 1280px) 610px, (min-width: 1024px) 50vw, calc(100vw - 48px)"
        className="pointer-events-none object-cover object-center transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.035] motion-reduce:transition-none"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(8, 15, 17, 0.06) 0%, rgba(8, 15, 17, 0.16) 20%, rgba(8, 15, 17, 0.74) 35%, rgba(8, 15, 17, 0.97) 100%)' }}
        aria-hidden="true"
      />

      <div className="relative mt-auto flex flex-col px-6 pt-44 pb-6 sm:px-7 sm:pt-52 sm:pb-7 lg:pt-36 lg-short:px-5 lg-short:pt-28 lg-short:pb-5">
        {/* Icon + Name */}
        <div className="mb-4 flex items-center gap-3 lg-short:mb-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur-md lg-short:size-10" aria-hidden="true">
            {icon}
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-white sm:text-2xl lg-short:text-xl">
              {name}
            </h3>
            <p className="mt-1 text-xs text-white/75">{nameKo}</p>
          </div>
        </div>

        {/* Description */}
        <p className="mb-2 text-[13px] leading-relaxed text-white/80 [word-break:keep-all]">
          {description}
        </p>

        {/* Detail */}
        <p className="mb-4 text-sm leading-relaxed text-white/95 [word-break:keep-all] lg-short:mb-3">
          {detail}
        </p>

        {/* Feature tags */}
        <div className="mb-5 flex flex-wrap gap-1.5 lg-short:mb-4">
          {features.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Map link */}
        <div className="flex items-center border-t border-white/20 pt-4">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} — ${mapLabel}`}
            className="group/map inline-flex min-h-11 items-center justify-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-colors duration-300 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none"
          >
            <span>{mapLabel}</span>
            <ArrowRightIcon className="transition-transform duration-300 motion-safe:group-hover/map:translate-x-1 motion-reduce:transition-none" />
          </a>
        </div>
      </div>
    </article>
  );
}
