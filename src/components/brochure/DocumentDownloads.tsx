import Image from 'next/image';
import { BrochureForm } from '@/components/brochure/BrochureForm';
import { Title } from '@/components/site/Title';
import { COMPANY_PROFILE, PORTFOLIO_FULL } from '@/data/portfolio-downloads';

/* 자료 받기 — /portfolio 맨 아래 칸(#download). 예전 /brochure 화면을 옮겨 왔다 (2026-11-26 사용자 「흩어져 있어서 헷갈려」).
   회사소개서(16쪽)와 체험서비스 포트폴리오 전체본(80쪽) — 둘 다 이름 · 이메일을 받고 내려 준다(/api/brochure).
   서비스별 낱권(AI 조향 · 포토부스 · 키오스크)은 서비스 화면에서 바로 받는다 — src/data/portfolio-downloads.ts
   주소에 ?doc=profile 이 있으면 회사소개서를 고른 채로 연다 (BrochureForm). */

export const DOWNLOAD_HREF = '/portfolio#download';
export const PROFILE_HREF = '/portfolio?doc=profile#download';

const COPY = {
  ko: {
    title: '회사소개서 · 포트폴리오 받기',
    subtitle: '내부 보고나 제안서에 바로 쓸 수 있는 PDF 두 가지입니다. 네안데르를 짧게 소개하려면 회사소개서를, 프로그램과 운영 사례를 자세히 보려면 체험서비스 포트폴리오를 받으세요.',
    docs: [
      {
        key: 'portfolio',
        label: '체험서비스 포트폴리오 2026',
        meta: `PDF · ${PORTFOLIO_FULL.pages}P · ${PORTFOLIO_FULL.mb}MB`,
        cover: '/images/about/portfolio-2026-cover.webp',
        coverAlt: '네안데르 체험서비스 포트폴리오 2026 PDF 표지 — AI IN PERSON',
        size: [1440, 810],
        inside: [
          'AI 조향 · AI 포토부스 13종 · AI 키오스크 19종을 프로그램마다 한 쪽씩',
          '프로그램별 진행 화면 6단계와 손님이 받아 가는 것',
          '맞춤 제작 사례 6건 (QR 스탬프 투어 시스템 포함)',
          '실제 행사 사례 27곳',
        ],
      },
      {
        key: 'profile',
        label: '회사소개서',
        meta: `PDF · ${COMPANY_PROFILE.pages}P · ${COMPANY_PROFILE.mb}MB`,
        cover: '/images/about/company-profile-2026-preview.webp',
        coverAlt: '네안데르 회사소개서 2026 PDF의 회사 소개 쪽 — We make AI tangible.',
        size: [1440, 810],
        inside: [
          '회사 개요 · 연혁 · 일하는 방식',
          'AI 조향 · AI 포토부스 · AI 키오스크 한눈에',
          '맞춤 제작 사례 6건과 실제 행사 사례 27곳 목록',
          '대표 행사 6곳 · 엔플라잉 공식 향 MD',
        ],
      },
    ],
  },
  en: {
    title: 'Get our portfolio & company profile',
    subtitle: 'Two PDFs (in Korean) ready to drop into an internal report or proposal: a short company profile, and the full experience portfolio with every program and past event.',
    docs: [
      {
        key: 'portfolio',
        label: 'Experience Portfolio 2026',
        meta: `PDF · ${PORTFOLIO_FULL.pages}P · ${PORTFOLIO_FULL.mb}MB · KOREAN`,
        cover: '/images/about/portfolio-2026-cover.webp',
        coverAlt: 'Cover of the NEANDER Experience Portfolio 2026 PDF — AI IN PERSON',
        size: [1440, 810],
        inside: [
          'AI perfume, 13 photo booth themes and 19 kiosk programs — one page each',
          'Six on-screen steps and the take-home item for every program',
          'Six custom-made projects, including a QR stamp tour system',
          '27 real events',
        ],
      },
      {
        key: 'profile',
        label: 'Company profile',
        meta: `PDF · ${COMPANY_PROFILE.pages}P · ${COMPANY_PROFILE.mb}MB · KOREAN`,
        cover: '/images/about/company-profile-2026-preview.webp',
        coverAlt: 'About-us page of the NEANDER Company Profile 2026 PDF — We make AI tangible.',
        size: [1440, 810],
        inside: [
          'Company overview, history and how we work',
          'AI perfume, AI photo booth and AI kiosk at a glance',
          'Six custom-made projects and a list of 27 real events',
          'Six featured events and the N.Flying official scent MD',
        ],
      },
    ],
  },
} as const;

export function DocumentDownloads({ lang }: { lang: 'ko' | 'en' }) {
  const ko = lang === 'ko';
  const c = COPY[lang];
  return (
    <section id="download" className="scroll-mt-16 border-t border-paper/15 bg-ink py-[clamp(4rem,9vw,8rem)]" aria-labelledby="download-title">
      <div className="wrap">
        <div className="mx-auto mb-12 max-w-5xl">
          <Title id="download-title" en={['GET THE', 'DECK.']} ko={ko ? c.title : undefined} size="h2" />
          <p className="mt-5 max-w-3xl text-[clamp(1rem,1.3vw,1.125rem)] leading-relaxed text-paper/60">{c.subtitle}</p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="space-y-12 lg:col-span-2">
            {c.docs.map((d) => (
              <div key={d.key}>
                <figure className="mb-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 sm:p-6">
                    <Image
                      src={d.cover}
                      alt={d.coverAlt}
                      width={d.size[0]}
                      height={d.size[1]}
                      sizes="(min-width: 1024px) 340px, (min-width: 768px) 660px, calc(100vw - 80px)"
                      className="h-auto w-full rounded-sm shadow-xl shadow-slate-900/20"
                    />
                  </div>
                  <figcaption className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="text-sm font-bold text-slate-900">{d.label}</span>
                    <span className="font-mono tracking-wider">{d.meta}</span>
                  </figcaption>
                </figure>
                <ol className="space-y-3">
                  {d.inside.map((line, i) => (
                    <li key={line} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{line}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-24 lg:col-span-3">
            <BrochureForm />
          </div>
        </div>
      </div>
    </section>
  );
}
