'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useReduce } from '@/components/fx/useReduce';
import { DEVELOPMENT_PROJECTS } from '@/data/development-projects';
import { Reveal } from '@/components/fx';
import { Title } from '@/components/site/Title';
import { Btn, SectionLabel } from '@/components/site/ui';

/* ─────────────────────────────────────────────────────────
   홈 「AX STUDIO」(옛 DEVELOPMENT STUDIO) — 개발·AX 소개.
   문의·견적 고객의 32%가 프로그램 개발 페이지도 본다. 실제로 만든 사이트 화면이
   스크롤에 따라 세로 줄마다 다른 속도로 흐른다.
   ───────────────────────────────────────────────────────── */

const shots = DEVELOPMENT_PROJECTS.filter((p) => p.image).map((p) => ({ id: p.id, image: p.image }));
const COLUMNS = [0, 1, 2, 3].map((c) => shots.filter((_, i) => i % 4 === c).slice(0, 4));

function Column({ items, progress, from, to }: { items: typeof shots; progress: MotionValue<number>; from: string; to: string }) {
  const reduce = useReduce();
  const y = useTransform(progress, [0, 1], [from, to]);
  return (
    <motion.div className="flex flex-col gap-4 lg:gap-5" style={reduce ? undefined : { y }}>
      {items.map((s) => (
        <div key={s.id} className="relative aspect-[16/10] overflow-hidden round-tile bg-ink-3">
          <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover object-top" />
        </div>
      ))}
    </motion.div>
  );
}

export function HomeStudio() {
  const locale = useLocale();
  const ko = locale !== 'en';
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  return (
    <section ref={ref} className="relative isolate overflow-hidden border-t border-paper/10 bg-ink">
      {/* 흐르는 화면 벽 */}
      <div aria-hidden="true" className="absolute inset-y-[-18%] right-[-6%] -z-10 grid w-[min(72rem,118%)] rotate-[-8deg] grid-cols-2 gap-4 opacity-55 sm:grid-cols-4 lg:w-[62%] lg:gap-5 lg:opacity-100">
        <Column items={COLUMNS[0]} progress={scrollYProgress} from="6%" to="-14%" />
        <Column items={COLUMNS[1]} progress={scrollYProgress} from="-12%" to="8%" />
        <div className="hidden sm:block"><Column items={COLUMNS[2]} progress={scrollYProgress} from="10%" to="-18%" /></div>
        <div className="hidden sm:block"><Column items={COLUMNS[3]} progress={scrollYProgress} from="-8%" to="12%" /></div>
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/88 to-ink/25 max-lg:bg-ink/80" />

      <div className="wrap section-y">
        <div>
          <Reveal><SectionLabel no="04">AX STUDIO</SectionLabel></Reveal>
          <Title en={['FROM IDEA', 'TO SERVICE.']} ko={ko ? '아이디어를 서비스로, AI를 비즈니스로' : undefined} className="mt-6" />
          <Reveal delay={120}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/70">
              {ko ? '웹사이트 · 자사몰 · 플랫폼 · AI 솔루션. 기획부터 운영까지 한 팀으로 만듭니다.' : 'Websites, stores, platforms and AI solutions — planned, built and run by one team.'}
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Btn href="/development" arrow>{ko ? '만든 서비스 보기' : 'See what we built'}</Btn>
            <p className="font-display text-sm font-semibold tracking-[0.14em] text-paper/55">
              <span className="mr-2 text-2xl font-extrabold tracking-[-0.02em] text-paper">{DEVELOPMENT_PROJECTS.length}</span>PROJECTS
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
