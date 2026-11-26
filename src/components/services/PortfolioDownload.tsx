'use client';

import { Link } from '@/i18n/navigation';
import { trackEvent } from '@/lib/analytics/tracker';
import { PORTFOLIO_FULL, PORTFOLIO_PARTS, type PortfolioDoc } from '@/data/portfolio-downloads';

/* 서비스별 소개서(PDF) 바로 받기 — 연락처를 받지 않는다. 받은 횟수만 portfolio_download 로 남긴다.
   전체 포트폴리오는 /portfolio#download 에서 이름 · 이메일을 받고 내려 준다. */

function fileName(url: string) {
  return url.split('/').pop();
}

/** 체험 서비스 목록 칸의 작은 링크 — 「자세히」 옆 */
export function PortfolioPdfLink({ doc, lang }: { doc: PortfolioDoc; lang: 'ko' | 'en' }) {
  const f = PORTFOLIO_PARTS[doc];
  const ko = lang === 'ko';
  return (
    <a
      href={f.url}
      download={fileName(f.url)}
      onClick={() => trackEvent('portfolio_download', `${doc}:service_block`)}
      aria-label={`${ko ? f.ko : f.en} PDF ${ko ? '받기' : 'download'} (${f.pages}${ko ? '쪽' : 'p'} · ${f.mb}MB${ko ? '' : ' · Korean'})`}
      className="t-label group inline-flex min-h-12 items-center gap-2.5 text-paper/80 transition-colors hover:text-paper"
    >
      {ko ? '소개서 PDF' : 'PDF DECK'} <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-y-0.5">↓</span>
    </a>
  );
}

/** 상품 화면(포토부스 · 키오스크)의 띠 — 소개서 바로 받기 + 전체 포트폴리오 안내 */
export function PortfolioBand({ doc, lang }: { doc: PortfolioDoc; lang: 'ko' | 'en' }) {
  const f = PORTFOLIO_PARTS[doc];
  const ko = lang === 'ko';
  return (
    <section className="border-t border-paper/10 bg-ink">
      <div className="wrap grid items-center gap-x-12 gap-y-8 py-[clamp(3rem,6vw,5rem)] lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="t-label text-accent">PDF · {f.pages}{ko ? '쪽' : ' PAGES'} · {f.mb}MB{ko ? '' : ' · KOREAN'}</p>
          <p className="t-kr-title mt-3 text-[clamp(1.35rem,2.2vw,1.9rem)] text-paper">
            {ko ? `${f.ko}를 PDF로 받아 보세요` : `Download the ${f.en} (PDF)`}
          </p>
          <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-paper/60">
            {ko
              ? '프로그램마다 진행 화면 · 받아 가는 것 · 운영 사례를 한 쪽씩 담았습니다. 내부 보고나 제안서에 그대로 쓰셔도 됩니다.'
              : 'One page per program — screens, take-home items and past events. Feel free to use it in internal reports.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
          <a
            href={f.url}
            download={fileName(f.url)}
            onClick={() => trackEvent('portfolio_download', `${doc}:product_page`)}
            className="inline-flex min-h-12 items-center gap-2.5 bg-paper px-6 text-[0.95rem] font-semibold text-ink transition-colors duration-300 hover:bg-accent"
          >
            {ko ? '소개서 PDF 받기' : 'Download PDF'} <span aria-hidden="true">↓</span>
          </a>
          <Link href="/portfolio#download" className="t-label group inline-flex min-h-12 items-center gap-2.5 text-paper/80 transition-colors hover:text-paper">
            {ko ? `전체 포트폴리오(${PORTFOLIO_FULL.pages}쪽)` : `FULL PORTFOLIO (${PORTFOLIO_FULL.pages}P)`} <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
