'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { quoteHrefFor } from '@/data/products';
import { CORE_SERVICES, priceFrom } from '@/data/site';
import { SERVICE_TEXT } from '@/lib/quote/catalog';
import { Reveal } from '@/components/fx';
import { ConsultServices } from '@/components/site/ConsultServices';
import { Title } from '@/components/site/Title';
import { ArrowLink, PhotoTag, SectionLabel } from '@/components/site/ui';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   홈 「WHAT WE DO」 — 주력 3종은 큰 사진 칸, 상담형 3종은 아래 목록.
   넓은 화면에서는 마우스를 올린 칸이 넓어지며 설명 · 시작가 · 견적 버튼이 나온다.
   이름 · 시작가는 온라인 견적(src/lib/quote)과 같은 값이다.
   ───────────────────────────────────────────────────────── */

export function HomeServices() {
  const t = useTranslations('services');
  const locale = useLocale();
  const ko = locale !== 'en';
  const lang = ko ? 'ko' : 'en';
  const [open, setOpen] = useState(0);

  return (
    <section id="services" className="relative bg-ink">
      <div className="wrap flex flex-wrap items-end justify-between gap-6 pb-10 pt-[clamp(4.5rem,9vw,8rem)] lg:pb-14">
        <div>
          <Reveal><SectionLabel no="01">WHAT WE DO</SectionLabel></Reveal>
          <Title en={['THREE WAYS', 'TO MEET AI.']} ko={ko ? '현장에서 바로 하는 세 가지 AI 체험' : undefined} className="mt-6" />
        </div>
        <Reveal delay={120}><ArrowLink href="/services">{ko ? '전체 체험 보기' : 'ALL EXPERIENCES'}</ArrowLink></Reveal>
      </div>

      {/* ── 주력 3종 ─────────────────────────────────── */}
      <Reveal variant="fade" className="flex flex-col border-t border-paper/15 lg:h-[min(46rem,82vh)] lg:flex-row">
        {CORE_SERVICES.map((s, i) => {
          const isOpen = open === i;
          const name = SERVICE_TEXT[s.key].name[lang];
          return (
            <article
              key={s.key}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen(i); }}
              onFocusCapture={() => setOpen(i)}
              className={cn(
                'group relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden border-b border-paper/15 last:border-b-0 lg:min-h-0 lg:border-b-0 lg:border-r lg:last:border-r-0',
                'lg:transition-[flex-grow] lg:duration-[900ms] lg:ease-[cubic-bezier(0.22,1,0.36,1)]',
                isOpen ? 'lg:grow-[2.3]' : 'lg:grow',
                'lg:basis-0',
              )}
            >
              <Image
                src={s.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className={cn('-z-20 object-cover transition-[transform,filter] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]', isOpen ? 'scale-100 lg:brightness-100' : 'scale-110 lg:brightness-[0.55] lg:saturate-[0.6]')}
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 via-ink/20 to-ink/95" aria-hidden="true" />

              <div className="absolute left-[clamp(1.25rem,3vw,3rem)] top-6 flex items-center gap-3 lg:top-8">
                <span className="t-label text-accent">SERVICE {s.no}</span>
              </div>
              <PhotoTag className={cn('absolute right-4 top-5 transition-opacity duration-500 lg:top-7', isOpen ? 'opacity-100' : 'lg:opacity-0')}>{s.caption[lang]}</PhotoTag>

              {/* 모바일은 내용이 아래에서부터 쌓여, 영어처럼 글이 길면 위쪽의 SERVICE 0n 글자를 덮는다 — 그 자리(pt-16)를 비워 둔다 */}
              <div className="relative px-[clamp(1.25rem,3vw,3rem)] pb-8 pt-16 lg:pb-12 lg:pt-0">
                <h3 className="text-paper">
                  {/* 줄 높이(leading)는 글자 크기 뒤에 둔다 — 앞에 두면 tailwind-merge 가 글자 크기 클래스와 겹친다고 지운다.
                      모바일은 화면 폭에 맞춰(8.6vw) 360px 폰에서도 PERFUMER 가 한 줄에 들어가게 한다 */}
                  <span className={cn('block font-display font-extrabold uppercase tracking-[-0.015em] transition-[font-size] duration-700', isOpen ? 'text-[clamp(1.75rem,8.6vw,4rem)] lg:text-[clamp(2.1rem,4.2vw,4rem)]' : 'text-[clamp(1.75rem,8.6vw,4rem)] lg:text-[clamp(1.5rem,2.3vw,2.4rem)]', 'leading-[0.98]')}>
                    {s.en.map((line) => <span key={line} className="block">{line}</span>)}
                  </span>
                  <span className="mt-3 block text-lg font-semibold tracking-[-0.02em] text-paper/90 lg:text-xl">{name}</span>
                </h3>

                {/* 넓은 화면에서는 열린 칸만 보인다 — 높이 0 ↔ auto 를 grid 로 부드럽게 */}
                <div className={cn('grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[1fr] opacity-100 lg:grid-rows-[0fr] lg:opacity-0')}>
                  <div className="min-h-0 overflow-hidden">
                    <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-paper/75">{s.line[lang]}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {s.takeHome[lang].map((item) => (
                        <li key={item} className="rounded-full border border-paper/35 px-3.5 py-1.5 text-[13px] text-paper/90">{item}</li>
                      ))}
                    </ul>
                    <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3" data-cta-area="home_services">
                      <span className="font-display text-xl font-bold tracking-[-0.01em] text-paper">{priceFrom(s.key, lang)}</span>
                      <Link
                        href={quoteHrefFor(s.key)}
                        className="inline-flex min-h-11 items-center gap-2 bg-paper px-5 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-accent"
                        aria-label={`${name} — ${t('addToQuote')}`}
                      >
                        {t('addToQuote')} <span aria-hidden="true" className="font-display">+</span>
                      </Link>
                      <Link href={s.href} className="t-label inline-flex min-h-11 items-center gap-2 text-paper/80 transition-colors hover:text-paper" aria-label={`${name} — ${t('viewDetail')}`}>
                        {ko ? '자세히' : 'DETAILS'} <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </Reveal>

      {/* ── 상담형 3종 ───────────────────────────────── */}
      <ConsultServices className="wrap pb-[clamp(4.5rem,9vw,8rem)]" />
    </section>
  );
}
