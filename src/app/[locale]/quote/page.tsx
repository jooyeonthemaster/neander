import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Check } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { VisualQuoteStudio } from '@/components/quote-preview/QuotePreviewLab';
import { Title } from '@/components/site/Title';
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
    <div className="bg-ink">
      {/* 첫 화면: 제목만 짧게 — 견적 화면이 바로 보이도록 */}
      <section className="under-header relative isolate overflow-hidden" aria-labelledby="quote-title">
        <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(55% 120% at 8% 0%, rgba(125,149,255,0.2), transparent 62%)' }} />
        <div className="wrap flex flex-wrap items-end justify-between gap-x-12 gap-y-6 pb-8 pt-28 lg:pb-10 lg:pt-36">
          <div>
            <p className="t-label rise text-paper/60">ONLINE QUOTE</p>
            <Title as="h1" id="quote-title" en={['GET YOUR QUOTE.']} ko={locale === 'en' ? undefined : c.title} size="h2" immediate delay={80} className="mt-5" koClassName="text-paper/85" />
          </div>
          <div className="rise max-w-md lg:text-right" style={{ '--i': 4 } as React.CSSProperties}>
            <p className="text-[1.02rem] leading-relaxed text-paper/65 [word-break:keep-all]">{c.subtitle}</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 lg:justify-end">
              {c.points.map((point) => (
                <li key={point} className="flex items-center gap-1.5 text-[13px] font-medium text-paper/55">
                  <Check size={14} className="text-accent" strokeWidth={2.5} aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="pb-12 text-pretty sm:pb-16 [&_button]:scroll-mb-28 [&_input]:scroll-mb-28 [&_textarea]:scroll-mb-28 [&_img]:scroll-mb-28" aria-label={locale === 'en' ? 'Build your estimate' : '견적 만들기'}>
        <div className="mx-auto w-full max-w-[96rem] px-4 sm:px-6">
          {/* 주소의 ?preset= · ?service= 를 읽으므로 Suspense로 감싼다 */}
          <Suspense fallback={<div role="status" className="flex min-h-80 items-center justify-center rounded-[28px] border border-slate-100 bg-white text-sm text-slate-500">{c.loading}</div>}>
            <VisualQuoteStudio />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
