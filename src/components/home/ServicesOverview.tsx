'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { FitToViewport, ScrollReveal, StaggerChildren, StaggerItem } from '@/components/animations';
import { industries, experiences } from '@/data/experiences';
import { PRODUCTS, quoteHrefFor, type ProductEntry } from '@/data/products';
import { isConsultationService, SERVICE_TEXT, type Lang } from '@/lib/quote/catalog';
import { startingPrice } from '@/lib/quote/engine';

/* ─────────────────────────────────────────────────────────
   홈 'AI 체험' 섹션 — 판매 상품 6가지
   이름·설명·시작가는 온라인 견적(src/lib/quote)과 같은 값을 쓴다.
   체험 프로그램을 성격별로 나눈 5개 카테고리는 서비스 소개 페이지의 필터로 남아 있다.
   ───────────────────────────────────────────────────────── */

const KEY_COLOR = '#24ADB5';

export function ServicesOverview() {
  const t = useTranslations('services');
  const locale = useLocale();
  const lang: Lang = locale === 'en' ? 'en' : 'ko';

  return (
    <section className="home-screen relative overflow-hidden bg-white" id="services">
      {/* ── Background layers (light) ──────────────────────── */}
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
        className="absolute top-[-8%] left-[15%] w-[600px] h-[400px] rounded-full blur-[120px] transform-gpu"
        style={{ background: `radial-gradient(ellipse, ${KEY_COLOR}10 0%, transparent 70%)` }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-5%] right-[10%] w-[500px] h-[300px] rounded-full blur-[100px] transform-gpu"
        style={{ background: 'radial-gradient(ellipse, rgba(36, 173, 181, 0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* ── Content ──────────────────────────────────────── */}
      <FitToViewport className="py-16 lg:py-0">
        <div className="container-wide lg-short:max-w-6xl">
          <ScrollReveal className="text-center mb-10 lg:mb-[3vh] lg-short:mb-3">
            <span className="inline-flex lg-short:hidden items-center gap-2 mb-5 lg:mb-[1.6vh] px-4 py-1.5 rounded-full border border-teal-600/20 bg-teal-500/[0.06] text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-600">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              AI EXPERIENCES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[clamp(2rem,5vh,3.75rem)] font-bold tracking-tight text-neutral-900 leading-[1.1]">
              {t('pillarsTitle')}
            </h2>
            <p className="mt-4 lg:mt-[1.4vh] text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
              {t('pillarsSubtitle')}
            </p>
          </ScrollReveal>

          <StaggerChildren staggerDelay={0.06} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 lg-short:gap-3">
            {PRODUCTS.map((product) => (
              <StaggerItem key={product.key}>
                <ProductCard product={product} lang={lang} labels={{ detail: t('viewDetail'), quote: t('addToQuote'), from: t('priceFrom'), consultation: t('consultationOnly'), inquiry: t('inquire') }} />
              </StaggerItem>
            ))}
          </StaggerChildren>

          {/* 하단 숫자 줄 + 전체 체험 보기 */}
          <ScrollReveal className="mt-10 lg:mt-[3vh] lg-short:mt-3 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-3 sm:gap-7 px-4 sm:px-7 py-3.5 lg-short:py-2.5 rounded-2xl border border-neutral-200 bg-neutral-50/80 backdrop-blur-sm">
              <StatItem value={String(PRODUCTS.length)} label={t('statProducts')} />
              <span className="w-px h-4 bg-neutral-200" aria-hidden="true" />
              <StatItem value={String(experiences.length)} label={t('statExperiences')} />
              <span className="w-px h-4 bg-neutral-200" aria-hidden="true" />
              <StatItem value={String(industries.length)} label={t('statIndustries')} />
            </div>
            <Link href="/services" className="text-sm font-semibold text-teal-700 underline-offset-4 hover:underline">
              {t('viewAllExperiences', { count: experiences.length })} →
            </Link>
          </ScrollReveal>
        </div>
      </FitToViewport>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-xl sm:text-2xl font-bold tabular-nums" style={{ color: KEY_COLOR }}>{value}</span>
      <span className="text-xs sm:text-sm text-neutral-500 font-medium">{label}</span>
    </span>
  );
}

function ProductCard({ product, lang, labels }: {
  product: ProductEntry;
  lang: Lang;
  labels: { detail: string; quote: string; from: string; consultation: string; inquiry: string };
}) {
  const text = SERVICE_TEXT[product.key];
  const consultation = isConsultationService(product.key);
  const price = startingPrice(product.key);
  const priceText = lang === 'ko' ? `${(price / 10000).toLocaleString('ko-KR')}만원` : `KRW ${price.toLocaleString('en-US')}`;

  return (
    <article className="group relative isolate flex h-full min-h-[330px] flex-col overflow-hidden rounded-2xl bg-neutral-950 shadow-sm transition-shadow duration-500 hover:shadow-xl lg:min-h-[clamp(17rem,29vh,21rem)] lg-short:min-h-[15.5rem] motion-reduce:transition-none">
      {/* 화면 맞춤·부드러운 스크롤 안에서도 배경 사진이 바로 보이도록 처음부터 불러온다. */}
      <Image
        src={product.image}
        alt=""
        fill
        loading="eager"
        sizes="(min-width: 1280px) 420px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 48px)"
        className="pointer-events-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(8, 15, 17, 0.18) 0%, rgba(8, 15, 17, 0.08) 25%, rgba(8, 15, 17, 0.72) 58%, rgba(8, 15, 17, 0.96) 100%)' }}
        aria-hidden="true"
      />
      <Link
        href={product.href}
        className="group/detail relative flex flex-1 flex-col justify-between gap-12 rounded-t-2xl px-6 pt-5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white lg-short:gap-8 lg-short:px-5 lg-short:pt-4"
        aria-label={`${text.name[lang]} — ${labels.detail}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-medium leading-relaxed text-white backdrop-blur-md">
            {product.caption[lang]}
          </span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm transition-colors group-hover/detail:bg-white group-hover/detail:text-neutral-900 motion-reduce:transition-none" aria-hidden="true">
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
        <div>
          <h3 className="text-[22px] font-bold leading-tight tracking-tight text-white group-focus-visible/detail:underline lg-short:text-xl">
            {text.name[lang]}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[2.0lh] text-[13px] leading-relaxed text-white/80 lg-short:mt-1.5 lg-short:text-xs">{text.summary[lang]}</p>
        </div>
      </Link>
      <div className="relative mx-6 mt-4 mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/20 pt-3 lg-short:mx-5 lg-short:mt-3 lg-short:mb-4">
        <span className="whitespace-nowrap text-xs text-white/70">
          {!consultation && lang === 'en' && <span className="mr-1">{labels.from}</span>}
          <span className="text-lg font-bold tabular-nums tracking-tight text-white lg-short:text-base">{consultation ? labels.consultation : priceText}</span>
          {!consultation && lang === 'ko' && <span className="ml-1">{labels.from}</span>}
        </span>
        <Link
          href={consultation ? '/contact' : quoteHrefFor(product.key)}
          aria-label={`${text.name[lang]} — ${consultation ? labels.inquiry : labels.quote}`}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-neutral-900 transition-colors hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none"
        >
          {consultation ? labels.inquiry : labels.quote}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
