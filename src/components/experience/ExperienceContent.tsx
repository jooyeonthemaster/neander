'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CONTACT, PHONE_LINES, QUOTE_HREF } from '@/lib/constants';
import { STORE_MAP_URL } from '@/data/site';
import { Parallax, Reveal, Spotlight } from '@/components/fx';
import { SectionHead } from '@/components/services/detail/SectionHead';
import { Title } from '@/components/site/Title';
import { ArrowLink, Btn } from '@/components/site/ui';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   B2B 무료 체험 안내 본문 (2026-11 개편)
   매장 사진 → 매장 소개 → 예약 · 문의. 문구는 messages 의 experience.* 그대로.
   전화는 고객센터 · 직통 두 번호를 함께 적는다 (constants.ts 의 PHONE_LINES, 2026-11-26).
   ───────────────────────────────────────────────────────── */

const STORE_IMAGES = ['/images/acscentid/1.png', '/images/acscentid/2.png', '/images/acscentid/3.png'];

export function ExperienceContent() {
  const t = useTranslations('experience');
  const locale = useLocale();
  const ko = locale !== 'en';
  const features = [0, 1, 2, 3].map((i) => t(`accentId.features.${i}`));

  return (
    <>
      {/* ── 매장 사진 ─────────────────────────────────── */}
      <section className="bg-ink">
        <div className="wrap section-y">
          <SectionHead no="01" label="STORE GALLERY" en={['INSIDE', 'THE STORE.']} ko={t('galleryTitle')} />
          <div className="mt-14 grid gap-4 md:grid-cols-3 md:grid-rows-2 lg:gap-5">
            {STORE_IMAGES.map((src, idx) => (
              <Reveal key={src} variant="clip" delay={idx * 100} className={cn(idx === 0 ? 'md:col-span-2 md:row-span-2' : '')}>
                <Parallax className={cn(idx === 0 ? 'aspect-[3/2] md:aspect-auto md:h-full md:min-h-[30rem]' : 'aspect-[3/2]')} strength={idx === 0 ? 5 : 3}>
                  <Image src={src} alt={`${t('accentId.name')} — ${t('galleryTitle')} ${idx + 1}`} fill sizes={idx === 0 ? '(min-width: 768px) 60vw, 92vw' : '(min-width: 768px) 30vw, 92vw'} className="object-cover" />
                </Parallax>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 매장 소개 ─────────────────────────────────── */}
      <section className="border-t border-paper/10 bg-ink">
        <div className="wrap section-y">
          <SectionHead no="02" label={ko ? 'FLAGSHIP STORE' : t('storesTitle').toUpperCase()} en={["AC'SCENT ID"]} ko={`${t('accentId.nameKo')} · ${t('accentId.tagline')}`} aside={t('storesSubtitle')} />
          <div className="mt-14 grid gap-x-20 gap-y-12 lg:grid-cols-[1.1fr_1fr]">
            <Reveal>
              <p className="text-[clamp(1.15rem,1.9vw,1.6rem)] font-semibold leading-[1.6] tracking-[-0.03em] text-paper">{t('accentId.description')}</p>
              <p className="mt-8"><ArrowLink href={STORE_MAP_URL} external>{t('viewMap')}</ArrowLink></p>
            </Reveal>
            <ul className="self-start border-t border-paper/15">
              {features.map((feature, i) => (
                <Reveal as="li" key={feature} delay={i * 70} className="flex items-baseline gap-6 border-b border-paper/15 py-5">
                  <span className="t-label text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[1.08rem] font-medium tracking-[-0.02em] text-paper/90">{feature}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 예약 · 문의 ───────────────────────────────── */}
      <Spotlight as="section" className="overflow-hidden border-t border-paper/10 bg-ink">
        <div className="wrap section-y relative text-center">
          <Reveal><p className="t-label text-paper/55">BOOK A VISIT</p></Reveal>
          <Title en={['COME AND', 'TRY IT.']} ko={t('ctaTitle')} size="h1" className="mt-7" />
          <Reveal delay={120}><p className="mx-auto mt-8 max-w-xl text-[1.05rem] leading-relaxed text-paper/65">{t('ctaDescription')}</p></Reveal>
          <Reveal delay={180} className="mt-10 flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-x-12 gap-y-5 sm:flex-row">
              {PHONE_LINES.map((p) => (
                <a key={p.key} href={`tel:${p.intl}`} className="group flex flex-col items-center gap-2" aria-label={`${t('ctaPhoneLabel')} — ${ko ? p.ko : p.en} ${p.number}`}>
                  <span className="t-label !text-[0.7rem] text-paper/50">{ko ? p.ko : p.en.toUpperCase()}</span>
                  <span className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-extrabold leading-none tracking-[0.01em] text-paper transition-colors group-hover:text-accent">{ko ? p.number : p.intl}</span>
                </a>
              ))}
            </div>
            <a href={`mailto:${CONTACT.email}`} className="font-display text-[clamp(1rem,1.8vw,1.35rem)] font-bold tracking-[0.04em] text-paper/60 transition-colors hover:text-paper" aria-label={`${t('ctaEmailLabel')} ${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </Reveal>
          <Reveal delay={240} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Btn href="/contact" variant="fill" arrow>{ko ? '체험 문의하기' : 'Ask about a visit'}</Btn>
            <Btn href={QUOTE_HREF}>{ko ? '온라인 견적' : 'Online estimate'}</Btn>
          </Reveal>
          <Reveal delay={300}><p className="mt-9 text-sm text-paper/45">{t('address')}</p></Reveal>
        </div>
      </Spotlight>
    </>
  );
}
