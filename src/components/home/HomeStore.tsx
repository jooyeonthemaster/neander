'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CONTACT } from '@/lib/constants';
import { STORE_MAP_URL } from '@/data/site';
import { Parallax, Reveal } from '@/components/fx';
import { Title } from '@/components/site/Title';
import { ArrowLink, Btn, SectionLabel } from '@/components/site/ui';

/* 홈 「FLAGSHIP STORE」 — 직영 매장 AC'SCENT ID. 기업·기관 담당자는 행사 전에 무료로 체험해 볼 수 있다 (/experience) */

export function HomeStore() {
  const t = useTranslations('experience');
  const locale = useLocale();
  const ko = locale !== 'en';

  return (
    // @container: 왼쪽 칸의 여백을 섹션 폭(100cqw) 기준으로 잡아 위 섹션들의 .wrap 왼쪽 선과 맞춘다
    // (.wrap 은 110rem 보다 넓은 화면에서 가운데로 모이는데, 칸 안의 .wrap 은 그렇지 않다)
    <section className="@container relative grid border-t border-paper/10 bg-ink lg:grid-cols-[1fr_1.25fr]">
      <div className="wrap flex flex-col justify-center py-[clamp(4.5rem,9vw,8rem)] lg:pr-16 lg:pl-[calc(max(0px,(100cqw-110rem)/2)+clamp(1.25rem,6vw,6.75rem))]">
        <Reveal><SectionLabel no="05">FLAGSHIP STORE</SectionLabel></Reveal>
        <Title en={["AC'SCENT ID"]} ko={ko ? '악센트 아이디 · 홍대 직영 매장' : undefined} className="mt-6 lg:[&_[data-lines]]:!text-[length:clamp(1.8rem,2.9vw,3.5rem)]" />
        <Reveal delay={120}>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/70">
            {ko
              ? '행사에 들이기 전에 매장에서 먼저 체험해 보세요. 기업 · 기관 담당자께는 무료로 안내해 드립니다.'
              : 'Try it at our store before your event. Free guided sessions for business and public-sector teams.'}
          </p>
          <p className="mt-6 text-sm text-paper/45">{CONTACT.address[ko ? 'ko' : 'en']}</p>
        </Reveal>
        <Reveal delay={200} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Btn href="/experience" arrow>{t('title')}</Btn>
          <ArrowLink href={STORE_MAP_URL} external>{ko ? '네이버 지도' : 'NAVER MAP'}</ArrowLink>
        </Reveal>
      </div>
      <Reveal variant="clip" className="relative min-h-[22rem] lg:min-h-[40rem]">
        <Parallax className="absolute inset-0" strength={7}>
          <Image src="/images/portfolio/acscent-id-2.webp" alt={ko ? "AC'SCENT ID 매장의 시향용 유리 플라스크와 은색 손 오브제" : "Glass scent flasks and silver hand objects at the AC'SCENT ID store"} fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" />
        </Parallax>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent max-lg:bg-gradient-to-b" />
      </Reveal>
    </section>
  );
}
