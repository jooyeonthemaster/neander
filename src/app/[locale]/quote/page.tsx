import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { Check, ChevronDown, Info } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { QuoteStudio } from '@/components/quote-studio/QuoteStudio';
import { PricingGuide } from '@/components/services/PricingGuide';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

const COPY = {
  ko: {
    eyebrow: '우리 행사에 딱 맞는 체험 찾기',
    title: '온라인 견적',
    subtitle: '행사와 체험을 골라보세요. 예상 비용은 바로 알려드릴게요.',
    points: ['연락처 없이 비용 확인', '선택은 언제든 바꿀 수 있어요'],
    scent: '취향에 맞는 향을 만들고',
    photo: '특별한 사진을 남기고',
    imageNote: '실제 행사 운영 사진',
    pricingTitle: '가격은 어떻게 계산되나요?',
    pricingHint: '체험별 시작 가격과 추가 비용을 확인해 보세요.',
    loading: '견적 화면을 준비하고 있어요.',
  },
  en: {
    eyebrow: 'EXPERIENCES FOR YOUR EVENT',
    title: 'Online estimate',
    subtitle: 'Choose your event and experiences. See your estimated cost as you go.',
    points: ['No contact details needed to see prices', 'Change your choices anytime'],
    scent: 'Create a personal scent',
    photo: 'Capture a special moment',
    imageNote: 'Photos from real events',
    pricingTitle: 'How is the price calculated?',
    pricingHint: 'See starting prices and what adds to your estimate.',
    loading: 'Getting your estimate ready.',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  return {
    alternates: localeAlternates('/quote', locale),
    title: c.title,
    description: c.subtitle,
    openGraph: { title: c.title, description: c.subtitle, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function QuotePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[locale === 'en' ? 'en' : 'ko'];

  return (
    <div className="bg-[#f6f8fa]">
      <section className="pb-7 pt-8 sm:pb-8 sm:pt-10" aria-labelledby="quote-title">
        <div className="container-wide flex items-center justify-between gap-8">
          <div>
            <p className="text-xs font-semibold tracking-wide text-teal-700">{c.eyebrow}</p>
            <h1 id="quote-title" className="mt-2.5 font-display text-[2rem] font-extrabold leading-tight tracking-[-0.045em] text-slate-900 sm:text-[2.5rem]">{c.title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base [word-break:keep-all]">{c.subtitle}</p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {c.points.map((point) => (
                <li key={point} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Check size={14} className="text-teal-600" strokeWidth={2.5} aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative hidden h-[168px] w-[328px] shrink-0 lg:block">
            <figure className="absolute left-0 top-0 z-10 w-[174px] -rotate-6 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
              <div className="relative h-[108px]">
                <Image src="/images/services/experiences/ai-scent-soulmate.webp" alt={locale === 'en' ? 'Visitors making perfume at Korea Grand Sale 2026' : '코리아그랜드세일 2026 현장에서 향수를 만드는 체험'} fill sizes="174px" className="object-cover" />
              </div>
              <figcaption className="py-2 text-center text-[11px] font-semibold text-slate-600">{c.scent}</figcaption>
            </figure>
            <figure className="absolute right-0 top-3 w-[174px] rotate-6 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
              <div className="relative h-[108px]">
                <Image src="/images/services/experiences/ai-celeb-lookalike.webp" alt={locale === 'en' ? 'AI photo booths at Pyeongtaek AI Festa 2026' : '평택 AI 페스타 2026에 설치된 AI 포토부스'} fill sizes="174px" className="object-cover" />
              </div>
              <figcaption className="py-2 text-center text-[11px] font-semibold text-slate-600">{c.photo}</figcaption>
            </figure>
            <p className="absolute -bottom-3 right-1 text-[10px] text-slate-400">{c.imageNote}</p>
          </div>
        </div>
      </section>

      <section className="pb-8 sm:pb-10" aria-label={locale === 'en' ? 'Build your estimate' : '견적 구성하기'}>
        <div className="container-wide">
          {/* 주소의 ?preset= · ?service= 를 읽으므로 Suspense로 감싼다 */}
          <Suspense fallback={<div role="status" className="flex min-h-80 items-center justify-center rounded-[28px] border border-slate-100 bg-white text-sm text-slate-500">{c.loading}</div>}>
            <QuoteStudio />
          </Suspense>
        </div>
      </section>

      <div className="container-wide pb-14 sm:pb-20">
        <details className="group rounded-2xl border border-slate-200/70 bg-white">
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-5 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-500 sm:px-6 [&::-webkit-details-marker]:hidden">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Info size={18} aria-hidden="true" /></span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-700">{c.pricingTitle}</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">{c.pricingHint}</span>
            </span>
            <ChevronDown size={18} className="shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
          </summary>
          <div className="border-t border-slate-100 px-5 sm:px-6 [&>section]:bg-transparent [&>section]:py-8 [&>section>div]:w-full [&>section>div]:px-0">
            <PricingGuide locale={locale} variant="full" />
          </div>
        </details>
      </div>
    </div>
  );
}
