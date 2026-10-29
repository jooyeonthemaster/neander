import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { timelineData } from '@/data/timeline';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

// 대표 작업 — slug는 포트폴리오 데이터(src/data/portfolio-catalog.json)의 slug와 같다
const WORK = [
  { key: 'jimff', slug: 'jimff-2026-ost-fair', image: '/images/portfolio/jimff-2026-ost-fair-1.webp' },
  { key: 'seoulWriters', slug: 'seoul-writers-festival', image: '/images/portfolio/seoul-writers-festival-1.webp' },
  { key: 'acscentId', slug: 'acscent-id', image: '/images/portfolio/acscent-id-1.webp' },
] as const;

const STEPS = ['plan', 'make', 'operate'] as const;

// 기본 화면에 보이는 주요 이정표. 전체 연혁은 src/data/timeline.ts 를 펼쳐서 보여준다
const MILESTONE_YEARS = ['2022', '2023', '2024', '2025', '2026'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    alternates: localeAlternates('/about', locale),
    title: t('title'),
    description: t('metaDescription'),
    openGraph: {
      title: t('title'),
      description: t('metaDescription'),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

function ArrowUpRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
      <span className="font-semibold text-teal-700">{index}</span> / {label}
    </p>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2';

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });
  const tEntries = await getTranslations({ locale, namespace: 'about.timeline.entries' });

  return (
    <div className="bg-white text-neutral-950">
      {/* 히어로: 회사가 하는 일 + 실제 현장 사진 */}
      <section aria-labelledby="about-title" className="container-wide pb-12 pt-10 sm:pt-14 lg:pb-16 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.16em] text-neutral-500">{t('hero.eyebrow')}</p>
            <h1
              id="about-title"
              className="mt-5 whitespace-pre-line text-balance text-[2.125rem] font-bold leading-[1.2] tracking-tight sm:text-5xl sm:leading-[1.15] lg:text-[2.5rem] xl:text-[3.25rem]"
            >
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg">
              {/* 모바일은 이어 쓰고, sm 이상에서만 문장마다 줄을 바꾼다 */}
              {t('hero.description').split('\n').map((line) => (
                <span key={line} className="sm:block">{line} </span>
              ))}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link
                href="/contact"
                className={`inline-flex min-h-12 items-center gap-2 rounded-sm bg-neutral-950 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 ${focusRing}`}
              >
                {t('hero.primaryCta')}
                <ArrowUpRight />
              </Link>
              <Link
                href="/portfolio"
                className={`group/link inline-flex min-h-12 items-center gap-1.5 text-[15px] font-semibold text-neutral-900 ${focusRing}`}
              >
                <span className="underline decoration-neutral-300 decoration-1 underline-offset-[6px] transition-colors group-hover/link:decoration-teal-600">
                  {t('hero.secondaryCta')}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <figure className="lg:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-neutral-100 lg:aspect-[4/3]">
              <Image
                src="/images/portfolio/pyeongtaek-ai-festa-2026-1.webp"
                alt={t('hero.photoAlt')}
                fill
                preload
                sizes="(min-width: 1280px) 700px, (min-width: 1024px) 56vw, calc(100vw - 48px)"
                className="object-cover object-[50%_78%] lg:object-center"
              />
            </div>
            <figcaption className="mt-3 flex flex-col gap-0.5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <span className="font-semibold text-neutral-900">{t('hero.photoTitle')}</span>
              <span className="text-neutral-500">{t('hero.photoRole')}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <div className="container-wide">
        <div className="flex items-baseline justify-between gap-6 border-y border-neutral-200 py-7 lg:py-9">
          <p className="text-balance text-xl font-bold leading-snug tracking-tight sm:text-2xl lg:text-[1.75rem]">{t('statement')}</p>
          <span aria-hidden="true" className="hidden shrink-0 text-xs font-medium tracking-[0.16em] text-neutral-500 sm:block">
            NEANDER CO.
          </span>
        </div>
      </div>

      {/* 대표 작업 */}
      <section aria-labelledby="work-title" className="container-wide py-16 sm:py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <SectionLabel index="01" label={t('work.label')} />
            <h2 id="work-title" className="mt-3 text-[1.75rem] font-bold tracking-tight sm:text-4xl">
              {t('work.title')}
            </h2>
          </div>
          <Link
            href="/portfolio"
            className={`inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold text-teal-700 underline decoration-teal-700/30 underline-offset-[6px] transition-colors hover:decoration-teal-700 ${focusRing}`}
          >
            {t('work.more')}
            <ArrowUpRight />
          </Link>
        </div>

        <ul className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-3 lg:gap-x-8">
          {WORK.map((item) => (
            <li key={item.key} className="group relative">
              <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-neutral-100">
                <Image
                  src={item.image}
                  alt={t(`work.items.${item.key}.alt`)}
                  fill
                  sizes="(min-width: 1280px) 395px, (min-width: 768px) 31vw, calc(100vw - 48px)"
                  className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug">
                {/* 카드 전체를 덮는 링크 — 링크 이름은 프로젝트명만 */}
                <Link
                  href={`/portfolio/${item.slug}`}
                  className="after:absolute after:inset-0 after:rounded-sm group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-teal-600 focus-visible:after:ring-offset-4"
                >
                  {t(`work.items.${item.key}.title`)}
                  <ArrowUpRight className="ml-1.5 inline-block h-4 w-4 align-[-2px] text-neutral-500 transition-colors group-hover:text-teal-700" />
                </Link>
              </h3>
              <p className="mt-1 text-[15px] leading-relaxed text-neutral-500">{t(`work.items.${item.key}.role`)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 일하는 방식 */}
      <section aria-labelledby="process-title" className="bg-[#f6f5f1]">
        <div className="container-wide grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:py-24">
          <div className="lg:col-span-5">
            <SectionLabel index="02" label={t('process.label')} />
            <h2 id="process-title" className="mt-3 whitespace-pre-line text-[1.75rem] font-bold leading-[1.25] tracking-tight sm:text-4xl">
              {t('process.title')}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-neutral-600 sm:text-lg">{t('process.description')}</p>
          </div>
          <ol className="border-t border-neutral-300 lg:col-span-7">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[2.5rem_1fr] gap-x-3 gap-y-1 border-b border-neutral-300 py-6 sm:grid-cols-[3rem_10rem_1fr] sm:items-baseline sm:gap-x-4 lg:py-8"
              >
                <span aria-hidden="true" className="text-sm font-semibold tabular-nums text-teal-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-bold sm:text-xl">{t(`process.steps.${step}.title`)}</h3>
                <p className="col-start-2 text-[15px] leading-relaxed text-neutral-600 sm:col-start-3 sm:text-base">
                  {t(`process.steps.${step}.description`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 짧은 연혁 */}
      <section aria-labelledby="story-title" className="container-wide py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionLabel index="03" label={t('story.label')} />
            <h2 id="story-title" className="mt-3 whitespace-pre-line text-[1.75rem] font-bold leading-[1.25] tracking-tight sm:text-4xl">
              {t('story.title')}
            </h2>
          </div>
          <div className="lg:col-span-7">
            <ol className="border-t border-neutral-200">
              {MILESTONE_YEARS.map((year) => (
                <li key={year} className="grid grid-cols-[4rem_1fr] items-baseline gap-x-4 border-b border-neutral-200 py-4 sm:grid-cols-[5.5rem_1fr]">
                  <time dateTime={year} className="text-sm font-medium tabular-nums text-neutral-500">{year}</time>
                  <span className="text-base font-medium leading-relaxed">{t(`story.milestones.${year}`)}</span>
                </li>
              ))}
            </ol>

            {/* 전체 연혁은 처음에는 접어 둔다 (JS 없이 열리고 닫힌다) */}
            <details className="group mt-5">
              <summary
                className={`inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-sm text-[15px] font-semibold text-teal-700 [&::-webkit-details-marker]:hidden ${focusRing}`}
              >
                <span className="group-open:hidden">{t('story.showAll')}</span>
                <span className="hidden group-open:inline">{t('story.hideAll')}</span>
                <svg className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </summary>
              <div className="mt-3 border-t border-neutral-200">
                {timelineData.map((entry) => (
                  <div key={entry.year} className="grid grid-cols-[4rem_1fr] gap-x-4 border-b border-neutral-200 py-5 sm:grid-cols-[5.5rem_1fr]">
                    <h3 className="text-sm font-medium tabular-nums text-neutral-500">{entry.year}</h3>
                    <ul className="space-y-1.5 text-[15px] leading-relaxed text-neutral-700">
                      {entry.events.map((event, index) => (
                        // raw: 영문 항목의 〈앨범명〉 표기 <Elegy> 를 ICU 태그로 해석하지 않도록
                        <li key={event.titleKey}>{tEntries.raw(`${entry.year}.events.${index}`)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* 문의 */}
      <section aria-labelledby="cta-title" className="bg-neutral-900">
        <div className="container-wide flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div>
            <h2 id="cta-title" className="text-[1.75rem] font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              {t('cta.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-300 sm:text-lg">{t('cta.description')}</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-13 shrink-0 items-center justify-center gap-2 self-start rounded-sm bg-teal-500 px-7 text-base font-semibold text-neutral-950 transition-colors hover:bg-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 lg:self-auto"
          >
            {t('cta.button')}
            <ArrowUpRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
