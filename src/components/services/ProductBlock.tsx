import Image from 'next/image';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { quoteHrefFor } from '@/data/products';
import { priceFrom, type CoreService } from '@/data/site';
import { SERVICE_TEXT } from '@/lib/quote/catalog';
import { Drift, Parallax, Reveal } from '@/components/fx';
import { Title } from '@/components/site/Title';
import { PhotoTag } from '@/components/site/ui';
import { ClickArea } from '@/components/site/ClickArea';
import { PORTFOLIO_BY_SERVICE } from '@/data/portfolio-downloads';
import { PortfolioPdfLink } from './PortfolioDownload';

/* 체험 서비스 목록의 주력 상품 한 칸 — 큰 번호 · 영어 이름 · 한 줄 소개 · 들고 가는 것 · 시작가 · 견적 버튼, 옆에는 visual */

export function ProductBlock({ service, lang, visual, labels, id }: { service: CoreService; lang: 'ko' | 'en'; visual: ReactNode; labels: { quote: string; detail: string }; id: string }) {
  const ko = lang === 'ko';
  const name = SERVICE_TEXT[service.key].name[lang];
  return (
    <section id={id} className="scroll-mt-16 border-t border-paper/10 bg-ink">
      {/* 칸 어디를 눌러도 「자세히」와 같은 상세 페이지로 간다 (견적 버튼 · 옆 그림 안의 링크는 그대로) */}
      <ClickArea href={service.href} className="wrap grid items-center gap-x-[clamp(2.5rem,6vw,7rem)] gap-y-14 py-[clamp(4rem,8vw,7.5rem)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div>
          <Reveal>
            <span aria-hidden="true" className="text-outline block font-display text-[clamp(4.5rem,11vw,10rem)] font-extrabold leading-[0.8]">{service.no}</span>
          </Reveal>
          <Title en={service.en} ko={ko ? name : undefined} className="mt-7 [&_[data-lines]]:!text-[length:clamp(1.9rem,3.3vw,3.3rem)]" koClassName="!text-[clamp(1.2rem,1.9vw,1.75rem)] !font-bold text-paper" />
          <Reveal delay={100}>
            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-paper/70">{SERVICE_TEXT[service.key].summary[lang]}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {service.takeHome[lang].map((item) => (
                <li key={item} className="rounded-full border border-paper/30 px-4 py-1.5 text-[13px] text-paper/85">{item}</li>
              ))}
            </ul>
          </Reveal>
          {/* 시작가 · 견적 버튼은 등장 효과 없이 처음부터 보인다 */}
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-paper/15 pt-7" data-cta-area="service_block">
            <span className="font-display text-[clamp(1.5rem,2.4vw,2.1rem)] font-extrabold tracking-[-0.02em] text-paper">{priceFrom(service.key, lang)}</span>
            <Link href={quoteHrefFor(service.key)} aria-label={`${name} — ${labels.quote}`} className="inline-flex min-h-12 items-center gap-2.5 bg-paper px-6 text-[0.95rem] font-semibold text-ink transition-colors duration-300 hover:bg-accent">
              {labels.quote} <span aria-hidden="true" className="font-display">+</span>
            </Link>
            <Link href={service.href} aria-label={`${name} — ${labels.detail}`} className="t-label group inline-flex min-h-12 items-center gap-2.5 text-paper/80 transition-colors hover:text-paper">
              {ko ? '자세히' : 'DETAILS'} <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
            </Link>
            {PORTFOLIO_BY_SERVICE[service.key] && <PortfolioPdfLink doc={PORTFOLIO_BY_SERVICE[service.key]} lang={lang} />}
          </div>
        </div>
        <div className="min-w-0">{visual}</div>
      </ClickArea>
    </section>
  );
}

/** AI 향수용 사진 묶음 — 큰 현장 사진 위에 결과 카드 · 향수병이 스크롤에 따라 다른 속도로 움직인다 */
export function PerfumeCollage({ lang }: { lang: 'ko' | 'en' }) {
  const ko = lang === 'ko';
  return (
    <div className="relative pb-[14%] pr-[10%]">
      <Reveal variant="clip">
        <Parallax className="aspect-[4/3]" strength={6}>
          <Image src="/images/site/perfume-jimff.webp" alt={ko ? '제천국제음악영화제 AI 조향 부스에서 향료를 고르는 방문객' : 'Guests choosing scent notes at the JIMFF AI perfume booth'} fill sizes="(min-width: 1024px) 48vw, 90vw" className="object-cover" />
        </Parallax>
        <PhotoTag className="absolute left-3 top-3">{ko ? '운영 사례 · 제천국제음악영화제' : 'JIMFF'}</PhotoTag>
      </Reveal>
      <Drift distance={46} className="absolute bottom-0 right-0 w-[40%]">
        <Reveal variant="clip" delay={180}>
          <div className="relative aspect-square border border-paper/15 bg-snow">
            <Image src="/images/site/perfume-result-card.webp" alt={ko ? 'AI 이미지 분석 결과 카드와 10ml 향수' : 'AI image analysis result card with a 10ml perfume'} fill sizes="(min-width: 1024px) 20vw, 36vw" className="object-cover" />
          </div>
        </Reveal>
      </Drift>
    </div>
  );
}
