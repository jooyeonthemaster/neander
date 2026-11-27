import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { timelineData } from '@/data/timeline';
import { TRACK_RECORD } from '@/data/site';
import { CONTACT, phonesText } from '@/lib/constants';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';
import { Reveal, ScrollWords, Tilt, VelocityMarquee } from '@/components/fx';
import { PageHero } from '@/components/site/PageHero';
import { SectionHead } from '@/components/services/detail/SectionHead';
import { ArrowLink, Btn, PhotoTag } from '@/components/site/ui';
import { cn } from '@/lib/utils';

interface Props {
  params: Promise<{ locale: string }>;
}

/* 구역 오른쪽에 깔려 왼쪽 · 위아래로 배경에 녹는 사진 (체험 상품 페이지 ON SITE 와 같은 방식, 좌우만 반대).
   휴대폰에서는 글 위에 오고 아래로 흐려진다. 실제 현장 사진이 아니라 생성한 콘셉트 이미지라 표시를 붙인다 */
function SceneBackdrop({ src, tag, alt, className, tagClassName }: { src: string; tag: string; alt: string; className?: string; tagClassName?: string }) {
  return (
    <div aria-hidden="true" className={cn(
      'relative -z-10 aspect-[16/9] w-full [mask-image:linear-gradient(to_bottom,black_50%,transparent)]',
      'lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[62%] lg:[mask-image:linear-gradient(to_left,black_30%,transparent_98%),linear-gradient(to_bottom,transparent,black_18%,black_75%,transparent)] lg:[mask-composite:intersect] lg:[-webkit-mask-composite:source-in]',
      className,
    )}>
      <Image src={src} alt={`${alt} (${tag})`} fill sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover object-right opacity-70" />
      <PhotoTag className={cn('absolute right-4 bottom-[45%] lg:right-6 lg:bottom-[26%]', tagClassName)}>{tag}</PhotoTag>
    </div>
  );
}

// 대표 작업 — slug는 포트폴리오 데이터(src/data/portfolio-catalog.json)의 slug와 같다
const WORK = [
  { key: 'jimff', slug: 'jimff-2026-ost-fair', image: '/images/portfolio/jimff-2026-ost-fair-1.webp' },
  { key: 'seoulWriters', slug: 'seoul-writers-festival', image: '/images/portfolio/seoul-writers-festival-1.webp' },
  { key: 'acscentId', slug: 'acscent-id', image: '/images/portfolio/acscent-id-1.webp' },
] as const;

// 운영 기기 — 이미지는 실제 기기 사진(안산 과학축제 포토부스 · JIMFF 키오스크)을 바탕으로 Seedream 5.5 로 만든 연출 컷 (2026-11-21).
// 링크는 2026-11 개편에서 만든 상품 상세로 간다
const DEVICES = [
  { key: 'photoBooth', image: '/images/about/device-photo-booth.webp', href: '/services/ai-photo-booth' },
  { key: 'kiosk', image: '/images/about/device-ai-kiosk.webp', href: '/services/ai-kiosk' },
] as const;
const DEVICE_SPECS = ['0', '1', '2'] as const;
const STEPS = ['plan', 'make', 'operate'] as const;
// 기본 화면에 보이는 주요 이정표. 전체 연혁은 src/data/timeline.ts 를 펼쳐서 보여준다
const MILESTONE_YEARS = ['2022', '2023', '2024', '2025', '2026'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    alternates: localeAlternates('/about', locale),
    title: t('title'),
    description: t('metaDescription'),
    openGraph: {
      title: t('title'),
      description: t('metaDescription'),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

/* 회사 소개 (2026-11 개편)
   방문 기록상 회사 소개를 본 사람의 26%가 다음에 체험 서비스로 간다 — 그래서 일하는 방식 다음에 기기 · 대표 작업으로 이어지게 둔다.
   문구는 messages 의 about.* 를 그대로 쓴다. */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });
  const tEntries = await getTranslations({ locale, namespace: 'about.timeline.entries' });
  const tFooter = await getTranslations({ locale, namespace: 'footer' });
  const tConcept = await getTranslations({ locale, namespace: 'services' });
  const ko = locale !== 'en';
  const lang = ko ? 'ko' : 'en';

  return (
    <>
      <PageHero
        id="about-title"
        label={t('hero.eyebrow')}
        en={['WE MAKE AI', 'TANGIBLE.']}
        ko={t('hero.title').replace('\n', ' ')}
        // 「…연결합니다.」 다음에서 줄을 바꾼다 (2026-11-22 사용자)
        lead={t('hero.description').split('\n').flatMap((line, i) => (i ? [<br key={i} />, line] : [line]))}
        image="/images/portfolio/pyeongtaek-ai-festa-2026-1.webp"
        imageAlt={t('hero.photoAlt')}
        imagePosition="50% 70%"
        caption={`${t('hero.photoTitle')} · ${t('hero.photoRole')}`}
        size="h1"
      >
        <div className="flex flex-wrap gap-3">
          <Btn href="/contact" variant="fill" arrow>{t('hero.primaryCta')}</Btn>
          <Btn href="/portfolio">{t('hero.secondaryCta')}</Btn>
        </div>
      </PageHero>

      {/* ── 한 문장 ────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink">
        <SceneBackdrop src="/images/about/about-who-studio.webp" alt={ko ? '네안데르 팀이 AI 체험을 기획·제작하는 작업실' : 'The NEANDER team planning and building AI experiences'} tag={ko ? '콘셉트 이미지' : 'Concept image'} />
        <div className="wrap section-y max-lg:-mt-20 max-lg:pt-0">
          <Reveal><p className="t-label flex items-center gap-4 text-paper/55"><span className="text-accent">01</span>WHO WE ARE</p></Reveal>
          <ScrollWords className="mt-10 max-w-6xl text-[clamp(1.7rem,4.2vw,4rem)] font-bold leading-[1.35] tracking-[-0.04em] text-paper" text={t('statement').replace(/, /g, ',\n')} />
          <Reveal delay={120}>
            <p className="mt-10 flex items-center gap-4 text-[1.05rem] text-paper/60"><span aria-hidden="true" className="h-px w-10 bg-accent" />{t('subtitle')}</p>
          </Reveal>
        </div>
      </section>

      {/* ── 일하는 방식 ────────────────────────────────── */}
      <section aria-labelledby="process-title" className="relative isolate overflow-hidden border-t border-paper/10 bg-ink">
        {/* 사진은 제목 쪽 위에만 깔고, 아래 세 칸(불투명) 앞에서 녹아 사라진다 */}
        <SceneBackdrop src="/images/about/about-how-onsite.webp" alt={ko ? '행사 현장에서 AI 체험 부스를 운영하는 모습' : 'Running an AI experience booth on site at an event'} tag={ko ? '콘셉트 이미지' : 'Concept image'}
          className="lg:bottom-auto lg:h-[34rem] lg:[mask-image:linear-gradient(to_left,black_25%,transparent_72%),linear-gradient(to_bottom,transparent,black_18%,black_48%,transparent_88%)]"
          tagClassName="lg:top-24 lg:bottom-auto" />
        <div className="wrap section-y max-lg:-mt-20 max-lg:pt-0">
          <SectionHead id="process-title" no="02" label={t('process.label')} en={['ONE TEAM,', 'START TO END.']} ko={ko ? t('process.title').replace('\n', ' ') : undefined} aside={t('process.description')} />
          <ol className="mt-14 grid gap-px border border-paper/15 bg-paper/15 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal as="li" key={step} delay={index * 90} className="group bg-ink p-7 transition-colors duration-500 hover:bg-ink-2 lg:p-10">
                <span aria-hidden="true" className="text-outline block font-display text-[clamp(3.5rem,7vw,6rem)] font-extrabold leading-none transition-[color] duration-500 group-hover:text-paper">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="t-kr-title mt-8 text-2xl text-paper">{t(`process.steps.${step}.title`)}</h3>
                <p className="mt-3 text-[1rem] leading-relaxed text-paper/60">{t(`process.steps.${step}.description`)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 운영 기기 ──────────────────────────────────── */}
      <section aria-labelledby="devices-title" className="border-t border-paper/10 bg-ink">
        <div className="wrap section-y">
          <SectionHead id="devices-title" no="03" label={t('devices.label')} en={['OUR', 'DEVICES.']} ko={ko ? t('devices.title').replace('\n', ' ') : undefined} aside={t('devices.description')} />
          <ul className="mt-14 grid gap-x-5 gap-y-16 md:grid-cols-2">
            {DEVICES.map((device, i) => (
              <li key={device.key}>
                <Reveal variant="clip" delay={i * 100}>
                  {/* 연출 컷의 오른쪽 빈 배경 위에 기기 이름을 얹는다 — 밝은 종이 타일 */}
                  <Tilt max={4} className="relative aspect-[3/2] overflow-hidden bg-[#cfccc9]">
                    <Image
                      src={device.image}
                      alt={t(`devices.items.${device.key}.alt`)}
                      fill
                      sizes="(min-width: 768px) 46vw, 92vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-y-0 right-0 flex w-[45%] flex-col justify-center pr-4 sm:pr-8">
                      <p className="t-label !text-[0.62rem] text-ink/60">{t(`devices.items.${device.key}.eyebrow`)}</p>
                      <h3 className="mt-2 text-balance text-xl font-bold leading-tight tracking-[-0.03em] text-ink sm:text-3xl lg:text-[2.1rem]">{t(`devices.items.${device.key}.name`)}</h3>
                    </div>
                    <PhotoTag className="absolute bottom-3 left-3">{tConcept('photoConcept')}</PhotoTag>
                  </Tilt>
                </Reveal>
                <Reveal delay={120 + i * 100}>
                  <p className="mt-7 text-[1.05rem] leading-relaxed text-paper/75">{t(`devices.items.${device.key}.description`)}</p>
                  <ul className="mt-5 border-t border-paper/15">
                    {DEVICE_SPECS.map((index) => (
                      <li key={index} className="flex items-baseline gap-4 border-b border-paper/15 py-3.5 text-[0.98rem] text-paper/75">
                        <span aria-hidden="true" className="t-label !text-[0.62rem] text-accent">{`0${Number(index) + 1}`}</span>
                        {t(`devices.items.${device.key}.specs.${index}`)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6"><ArrowLink href={device.href}>{ko ? t(`devices.items.${device.key}.name`) + ' 자세히' : 'DETAILS'}</ArrowLink></p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 대표 작업 ──────────────────────────────────── */}
      <section aria-labelledby="work-title" className="border-t border-paper/10 bg-ink">
        <div className="wrap section-y">
          <SectionHead id="work-title" no="04" label={t('work.label')} en={['FROM', 'THE FIELD.']} ko={ko ? t('work.title') : undefined} aside={<ArrowLink href="/portfolio">{t('work.more')}</ArrowLink>} />
          <ul className="mt-14 grid gap-x-5 gap-y-10 md:grid-cols-3">
            {WORK.map((item, i) => (
              <li key={item.key}>
                <Reveal variant="clip" delay={i * 90}>
                  <Link href={`/portfolio/${item.slug}`} data-cursor="VIEW" className="group block focus-visible:outline-2 focus-visible:outline-offset-4">
                    <div className="relative aspect-[3/2] overflow-hidden bg-ink-2">
                      <Image src={item.image} alt={t(`work.items.${item.key}.alt`)} fill sizes="(min-width: 768px) 31vw, 92vw" className="rd-zoom object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]" />
                    </div>
                    <div className="border-b border-paper/15 pb-5 pt-4 transition-colors duration-500 group-hover:border-paper/60">
                      <h3 className="t-kr-title text-[1.2rem] text-paper">{t(`work.items.${item.key}.title`)}</h3>
                      <p className="mt-1.5 text-[0.92rem] text-paper/55">{t(`work.items.${item.key}.role`)}</p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
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

      {/* ── 연혁 ───────────────────────────────────────── */}
      <section aria-labelledby="story-title" className="bg-ink">
        <div className="wrap section-y">
          <SectionHead id="story-title" no="05" label={t('story.label')} en={['SINCE 2023.']} ko={ko ? t('story.title').replace('\n', ' ') : undefined} />
          <ol className="mt-14 border-t border-paper/15">
            {MILESTONE_YEARS.map((year, i) => (
              <Reveal as="li" key={year} delay={i * 60} className="group grid grid-cols-[5.5rem_1fr] items-baseline gap-x-6 border-b border-paper/15 py-6 transition-colors duration-500 hover:border-paper/60 sm:grid-cols-[11rem_1fr] lg:grid-cols-[14rem_1fr] lg:py-7">
                <time dateTime={year} className="whitespace-nowrap font-display text-[clamp(1.05rem,2.4vw,2.2rem)] font-extrabold leading-none tracking-[-0.02em] text-paper/35 transition-colors duration-500 group-hover:text-accent">{year}</time>
                <span className="text-[clamp(1.05rem,1.7vw,1.5rem)] font-semibold leading-snug tracking-[-0.025em] text-paper">{t(`story.milestones.${year}`)}</span>
              </Reveal>
            ))}
          </ol>
          {/* 전체 연혁은 처음에는 접어 둔다 (JS 없이 열리고 닫힌다) */}
          <details className="group mt-7">
            <summary className="t-label inline-flex min-h-11 cursor-pointer list-none items-center gap-3 text-paper/70 transition-colors hover:text-paper [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">{t('story.showAll')}</span>
              <span className="hidden group-open:inline">{t('story.hideAll')}</span>
              <svg className="h-4 w-4 transition-transform duration-500 group-open:rotate-180" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m4 6 4 4 4-4" />
              </svg>
            </summary>
            <div className="mt-4 border-t border-paper/15">
              {timelineData.map((entry) => (
                <div key={entry.year} className="grid grid-cols-[5.5rem_1fr] gap-x-6 border-b border-paper/15 py-5 sm:grid-cols-[11rem_1fr] lg:grid-cols-[14rem_1fr]">
                  <h3 className="font-display text-sm font-bold tabular-nums text-paper/50">{entry.year}</h3>
                  <ul className="space-y-1.5 text-[0.98rem] leading-relaxed text-paper/75">
                    {entry.events.map((event, index) => (
                      <li key={event.titleKey}>{tEntries(`${entry.year}.events.${index}`)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      {/* ── 회사 정보 ──────────────────────────────────── */}
      <section aria-labelledby="company-title" className="border-t border-paper/10 bg-ink">
        <div className="wrap section-y grid gap-x-20 gap-y-12 lg:grid-cols-[1fr_1.25fr]">
          <div>
            <SectionHead id="company-title" no="06" label="COMPANY" en={['NEANDER', 'CO., LTD']} ko={ko ? '(주)네안데르' : undefined} />
            <Reveal delay={140} className="mt-10 flex flex-wrap gap-3">
              <Btn href="/portfolio?doc=profile#download" variant="fill">{ko ? '회사소개서 받기' : 'Get the company profile'} <span aria-hidden="true">↓</span></Btn>
            </Reveal>
          </div>
          <Reveal as="dl" delay={100} className="self-end border-t border-paper/15">
            {[
              [ko ? '회사' : 'Company', tFooter('companyInfo')],
              [ko ? '설립' : 'Founded', ko ? '2023년 · 서울 마포' : '2023 · Mapo, Seoul'],
              [ko ? '분야' : 'Fields', ko ? 'AI 향수 · AI 포토부스 · AI 키오스크 · 개발·AX' : 'AI perfume · AI photo booth · AI kiosk · development & AX'],
              [ko ? '직영 매장' : 'Own store', ko ? "AC'SCENT ID — AI 맞춤 조향 매장 (홍대)" : "AC'SCENT ID — AI custom perfume store (Hongdae)"],
              [ko ? '주소' : 'Address', CONTACT.officeAddress[lang]],
              [ko ? '연락처' : 'Contact', `${phonesText(lang)} · ${CONTACT.email}`],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-paper/15 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="t-label !text-[0.66rem] pt-1 text-paper/45">{label}</dt>
                <dd className="text-[1rem] leading-relaxed text-paper/90">{value}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
