'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useReduce } from '@/components/fx/useReduce';
import { TRACK_RECORD } from '@/data/site';
import { CountUp, Reveal, ScrollWords, VelocityMarquee } from '@/components/fx';
import { Title } from '@/components/site/Title';
import { ArrowLink, SectionLabel } from '@/components/site/ui';

/* 홈 「WHO WE ARE」 — 한 문장 · 숫자 3개 · 운영 행사 이름 띠.
   숫자는 모두 공개된 근거가 있는 값이다 (190+: 기존 홈 문구, 316팀: 안산 과학축제 2026 포트폴리오, 250명+: 한스경제 2026-09-08 보도). */

/* 오른쪽 위에 흐르는 실제 현장 사진 — 아래 DEVELOPMENT STUDIO 의 화면 벽과 같은 방식.
   「들고 가는 AI」라서 손님이 만든 향수 · 받은 결과 카드 · 현장 부스 사진을 섞는다 (모두 포트폴리오에 실린 실제 사진) */
const P = '/images/portfolio';
const PHOTOS = [
  `${P}/archive/sowon-festa-saju-photobooth-2026-04.webp`, `${P}/archive/eunpyeong-ai-festival-2026-01.webp`, `${P}/korea-grand-sale-2026-1.webp`,
  `${P}/archive/acscent-packaging-design-01.webp`, `${P}/archive/jimff-2026-ost-fair-03.webp`, `${P}/archive/ansan-science-festival-2026-01.webp`,
  `${P}/tourism-venture-week-2025-1.webp`, `${P}/archive/acscent-saju-collection-2026-01.webp`, `${P}/archive/eunpyeong-ai-festival-2026-03.webp`,
  `${P}/korea-grand-sale-2026-2.webp`, `${P}/archive/pyeongtaek-ai-festa-2026-03.webp`, `${P}/archive/jecheon-music-film-festival-02.webp`,
];
const COLUMNS = [0, 1, 2].map((c) => PHOTOS.filter((_, i) => i % 3 === c));

function Column({ items, progress, from, to }: { items: string[]; progress: MotionValue<number>; from: string; to: string }) {
  const reduce = useReduce();
  const alt = useLocale() === 'en' ? 'NEANDER AI experience at an event' : '네안데르 AI 체험 행사 현장';
  const y = useTransform(progress, [0, 1], [from, to]);
  return (
    <motion.div className="flex flex-col gap-4 lg:gap-5" style={reduce ? undefined : { y }}>
      {items.map((src) => (
        <div key={src} className="relative aspect-[4/3] overflow-hidden round-tile bg-ink-3">
          <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
        </div>
      ))}
    </motion.div>
  );
}

export function HomeStatement() {
  const locale = useLocale();
  const ko = locale !== 'en';
  const lang = ko ? 'ko' : 'en';
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const stats = ko
    ? [
        { n: 190, suffix: '+', label: '운영한 행사', note: '' },
        { n: 316, suffix: '', label: '팀이 이틀 동안 완성', note: '안산사이언스밸리 과학축제 2026 · AI 포토부스' },
        { n: 250, suffix: '+', label: '명이 참여, 조기 마감', note: '평택 AI 페스타 2026 · AI 조향 (한스경제 보도)' },
      ]
    : [
        { n: 190, suffix: '+', label: 'events delivered', note: '' },
        { n: 316, suffix: '', label: 'groups in two days', note: 'Ansan Science Festival 2026 · AI photo booth' },
        { n: 250, suffix: '+', label: 'guests, closed early', note: 'Pyeongtaek AI Festa 2026 · AI perfume (press report)' },
      ];

  return (
    <section ref={ref} className="relative isolate overflow-hidden border-t border-paper/10 bg-ink">
      {/* 흐르는 현장 사진 — 제목 오른쪽에서 숫자 줄 뒤까지. 글자가 사진 위에 얹힌다 */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[-10%] top-[-4%] -z-10 h-[30%] w-[min(40rem,100%)] [mask-image:linear-gradient(to_bottom,black_60%,transparent),linear-gradient(to_right,transparent,black_30%)] [mask-composite:intersect] [-webkit-mask-composite:source-in] lg:h-[80%] lg:w-[46%]">
        <div className="grid h-full rotate-[-8deg] grid-cols-3 gap-4 opacity-25 lg:gap-5 lg:opacity-60">
          <Column items={COLUMNS[0]} progress={scrollYProgress} from="4%" to="-16%" />
          <Column items={COLUMNS[1]} progress={scrollYProgress} from="-14%" to="6%" />
          <Column items={COLUMNS[2]} progress={scrollYProgress} from="8%" to="-12%" />
        </div>
      </div>
      <div className="wrap section-y">
        <Reveal><SectionLabel no="03">WHO WE ARE</SectionLabel></Reveal>
        <Title
          en={['WE MAKE AI', <>YOU CAN <span className="text-accent">TAKE</span></>, 'HOME.']}
          ko={ko ? '들고 갈 수 있는 AI를 만듭니다' : undefined}
          className="mt-6"
        />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <ScrollWords
              className="text-[clamp(1.35rem,2.5vw,2.25rem)] font-bold leading-[1.5] tracking-[-0.03em] text-paper"
              text={ko
                ? '향수 한 병, 사진 한 장, 결과 카드 한 장.\n화면 속 AI를 손에 잡히는 경험으로 바꿉니다.\n기획 · 제작 · 현장 운영까지 한 팀이 맡습니다.'
                : 'A bottle of perfume, a printed photo, a result card.\nWe turn on-screen AI into something you can hold.\nOne team plans, builds and runs it on site.'}
            />
            <Reveal className="mt-10"><ArrowLink href="/about">{ko ? '회사 소개' : 'ABOUT US'}</ArrowLink></Reveal>
          </div>

          <dl className="grid content-start gap-0 border-t border-paper/15">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 90} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-8 border-b border-paper/15 py-6 lg:py-7">
                <dd className="order-1 whitespace-nowrap font-display text-[clamp(2.75rem,5.6vw,5rem)] font-extrabold leading-none tracking-[-0.03em] text-paper">
                  <CountUp target={s.n} suffix={s.suffix} duration={1.6} />
                </dd>
                <dt className="order-2">
                  <span className="block text-lg font-semibold tracking-[-0.02em] text-paper/90">{s.label}</span>
                  {s.note && <span className="mt-1 block text-[13px] text-paper/45">{s.note}</span>}
                </dt>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>

      <VelocityMarquee className="border-y border-paper/10 py-7 lg:py-9">
        {TRACK_RECORD[lang].map((name, i) => (
          <span key={name} className="flex items-center">
            <span className={i % 2 === 0 ? 'px-7 text-[clamp(1.6rem,3.6vw,3.4rem)] font-extrabold tracking-[-0.03em] text-paper' : 'text-outline px-7 text-[clamp(1.6rem,3.6vw,3.4rem)] font-extrabold tracking-[-0.03em]'}>{name}</span>
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
        ))}
      </VelocityMarquee>
    </section>
  );
}
