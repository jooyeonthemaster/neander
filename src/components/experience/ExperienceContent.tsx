'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ScrollReveal, StaggerChildren, StaggerItem } from '@/components/animations';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────────────────── */
const ACCENT_ID_MAP =
  'https://map.naver.com/p/entry/place/1274492663?placePath=%252Fhome%253Fentry%253Dplt&searchType=place&lng=126.9267345&lat=37.5549328';

const ACCENT_WOW_MAP =
  'https://map.naver.com/p/search/%EC%95%85%EC%84%BC%ED%8A%B8%EC%99%80%EC%9A%B0/place/1205808970?c=15.00,0,0,0,dh&isCorrectAnswer=true&placePath=/home?from=map&fromPanelNum=1&additionalHeight=76&timestamp=202602142112&locale=ko&svcName=map_pcv5&searchText=%EC%95%85%EC%84%BC%ED%8A%B8%EC%99%80%EC%9A%B0';

const STORE_IMAGES = [
  '/images/acscentid/1.png',
  '/images/acscentid/2.png',
  '/images/acscentid/3.png',
];

const KEY_COLOR = '#24ADB5';

/* ── SVG Icons ────────────────────────────────────────── */
function FlaskIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16.5h10" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
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

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ExperienceContent() {
  const t = useTranslations('experience');

  return (
    <>
      {/* ── Store Gallery ──────────────────────────────── */}
      <section className="relative bg-white">
        <div className="container-wide py-16 lg:py-24">
          <ScrollReveal className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 mb-2">
              {t('galleryTitle')}
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
              {STORE_IMAGES.map((src, idx) => (
                <motion.div
                  key={src}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  className={cn(
                    'relative overflow-hidden rounded-2xl',
                    idx === 0 ? 'sm:col-span-2 aspect-[16/10]' : 'aspect-[4/3]',
                  )}
                >
                  <Image
                    src={src}
                    alt={`AC'SCENT ID Store ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes={idx === 0 ? '(max-width: 640px) 100vw, 66vw' : '(max-width: 640px) 100vw, 33vw'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/30 via-transparent to-transparent" />
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Store Details ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-neutral-50">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
          aria-hidden="true"
        />

        <div className="relative container-wide py-16 lg:py-24">
          <ScrollReveal className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
              {t('storesTitle')}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
              {t('storesSubtitle')}
            </p>
          </ScrollReveal>

          <StaggerChildren staggerDelay={0.15} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* AC'SCENT ID */}
            <StaggerItem>
              <StoreDetailCard
                icon={<FlaskIcon />}
                name={t('accentId.name')}
                nameKo={t('accentId.nameKo')}
                tagline={t('accentId.tagline')}
                description={t('accentId.description')}
                features={[
                  t('accentId.features.0'),
                  t('accentId.features.1'),
                  t('accentId.features.2'),
                  t('accentId.features.3'),
                ]}
                mapUrl={ACCENT_ID_MAP}
                mapLabel={t('viewMap')}
              />
            </StaggerItem>

            {/* AC'SCENT WOW */}
            <StaggerItem>
              <StoreDetailCard
                icon={<SparklesIcon />}
                name={t('accentWow.name')}
                nameKo={t('accentWow.nameKo')}
                tagline={t('accentWow.tagline')}
                description={t('accentWow.description')}
                features={[
                  t('accentWow.features.0'),
                  t('accentWow.features.1'),
                  t('accentWow.features.2'),
                  t('accentWow.features.3'),
                ]}
                mapUrl={ACCENT_WOW_MAP}
                mapLabel={t('viewMap')}
              />
            </StaggerItem>
          </StaggerChildren>
        </div>
      </section>

      {/* ── CTA / Contact ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-neutral-950">
        {/* Teal glow */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(36, 173, 181, 0.12) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

        <div className="relative container-wide py-20 lg:py-28">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              {t('ctaTitle')}
            </h2>
            <p className="mt-4 max-w-lg mx-auto text-base sm:text-lg text-neutral-400 leading-relaxed">
              {t('ctaDescription')}
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <a
                  href="tel:02-336-3368"
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/[0.08] text-teal-400 ring-1 ring-teal-500/20 transition-all duration-300 group-hover:bg-teal-500/[0.12]">
                    <PhoneIcon />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-0.5">
                      {t('ctaPhoneLabel')}
                    </p>
                    <p className="text-lg font-bold text-teal-400 group-hover:text-teal-300 transition-colors">
                      {t('ctaPhone')}
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:ok@neander.co.kr"
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/[0.08] text-teal-400 ring-1 ring-teal-500/20 transition-all duration-300 group-hover:bg-teal-500/[0.12]">
                    <MailIcon />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-0.5">
                      {t('ctaEmailLabel')}
                    </p>
                    <p className="text-lg font-bold text-teal-400 group-hover:text-teal-300 transition-colors">
                      {t('ctaEmail')}
                    </p>
                  </div>
                </a>
              </div>

              {/* Address bar */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-500">
                <MapPinIcon className="shrink-0" />
                <span>{t('address')}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

/* ── Store Detail Card ─────────────────────────────────── */
function StoreDetailCard({
  icon,
  name,
  nameKo,
  tagline,
  description,
  features,
  mapUrl,
  mapLabel,
}: {
  icon: React.ReactNode;
  name: string;
  nameKo: string;
  tagline: string;
  description: string;
  features: string[];
  mapUrl: string;
  mapLabel: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
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

      <div className="relative flex flex-col h-full p-7 sm:p-8 lg:p-9">
        {/* Icon + Name */}
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/[0.08] text-teal-600 ring-1 ring-teal-500/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-teal-500/[0.12]">
            {icon}
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {name}
            </h3>
            <p className="text-sm text-neutral-400 mt-0.5">{nameKo}</p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-base sm:text-lg font-medium text-teal-600 mb-3">
          {tagline}
        </p>

        {/* Description */}
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 flex-1">
          {description}
        </p>

        {/* Features */}
        <div className="space-y-2.5 mb-6">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/[0.08] text-teal-600">
                <CheckIcon />
              </span>
              <span className="text-sm text-neutral-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Map link */}
        <div className="pt-4 border-t border-neutral-100">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 transition-all duration-300 hover:text-teal-700 hover:gap-3"
          >
            <span>{mapLabel}</span>
            <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
