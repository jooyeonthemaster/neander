import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { BrochureForm } from '@/components/brochure/BrochureForm';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

const COPY = {
  ko: {
    title: '회사소개서 받기',
    subtitle: '내부 보고나 제안서에 바로 쓸 수 있도록 네안데르의 체험, 운영 방식, 시작가, 주요 프로젝트를 PDF 한 권(10쪽)에 담았습니다.',
    insideTitle: '담긴 내용',
    coverAlt: '네안데르 회사소개서 PDF 표지. 체험형 AI 콘텐츠 기획사, 2026.',
    previewLabel: '회사소개서 표지',
    inside: [
      '회사 개요와 연혁',
      'AI 체험 5개 카테고리와 웹 데모',
      "AC'SCENT AI 조향: 인허가, 운영 규모 가이드",
      '진행 절차와 운영 형태 (행사 렌탈 / 상시 운영)',
      '서비스별 시작가와 가격 결정 요인',
      '주요 프로젝트 6건 (목적 · 실행 · 결과)',
      '개인정보·데이터 원칙',
    ],
  },
  en: {
    title: 'Get our company profile',
    subtitle: 'A 10-page PDF (in Korean) covering our experiences, how we operate, starting prices and key projects — ready to drop into an internal report or proposal.',
    insideTitle: "What's inside",
    coverAlt: 'Cover of the NEANDER company profile PDF: Experiential AI content company, 2026.',
    previewLabel: 'Company profile cover',
    inside: [
      'Company overview and history',
      'Five AI experience categories and web demos',
      "AC'SCENT AI perfume: licenses and sizing guide",
      'Process and engagement types (event rental / ongoing operation)',
      'Starting prices and price factors',
      'Six key projects (objective · what we did · outcome)',
      'Privacy and data principles',
    ],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  return {
    alternates: localeAlternates('/brochure', locale),
    title: c.title,
    description: c.subtitle,
    openGraph: { title: c.title, description: c.subtitle, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function BrochurePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[locale === 'en' ? 'en' : 'ko'];

  return (
    <main>
      <section
        className="relative isolate overflow-hidden bg-slate-950 pb-36 pt-32 sm:pb-24 sm:pt-40 lg:pb-28 lg:pt-44"
        aria-labelledby="brochure-title"
      >
        <Image
          src="/images/about/about-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[68%_center] sm:object-center"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/65 sm:to-slate-950/10"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/30 via-transparent to-slate-950/35"
          aria-hidden="true"
        />
        <div className="container-wide relative">
          <span className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-teal-300" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
            COMPANY PROFILE
          </span>
          <h1 id="brochure-title" className="max-w-xl font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl [word-break:keep-all]">{c.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg [word-break:keep-all]">{c.subtitle}</p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-wide">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <figure className="mb-9">
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 sm:p-6">
                  <Image
                    src="/images/about/company-profile-cover.webp"
                    alt={c.coverAlt}
                    width={1684}
                    height={1190}
                    sizes="(min-width: 1024px) 340px, (min-width: 768px) 660px, calc(100vw - 80px)"
                    className="h-auto w-full rounded-sm shadow-xl shadow-slate-900/20"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>{c.previewLabel}</span>
                  <span className="font-mono tracking-wider">PDF · 10P</span>
                </figcaption>
              </figure>
              <h2 className="text-lg font-bold text-slate-900">{c.insideTitle}</h2>
              <ol className="mt-4 space-y-3">
                {c.inside.map((line, i) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{line}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
              <BrochureForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
