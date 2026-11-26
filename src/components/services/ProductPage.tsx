import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { quoteHrefFor } from '@/data/products';
import { productPageCopy, type ProductPageKind } from '@/data/product-pages';
import { BOOTH_PROGRAMS, KIOSK_PROGRAMS } from '@/data/product-lines';
import { ONSITE_FLOWS, type OnsiteFlow } from '@/data/onsite-flows';
import { CHEESE_VIDEO_FLOW } from '@/data/program-previews';
import { coreService, priceFrom } from '@/data/site';
import { SITE_URL } from '@/lib/constants';
import { fetchPublishedPortfolio } from '@/lib/firebase/rest';
import { SERVICE_TEXT } from '@/lib/quote/catalog';
import { localePath } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { Parallax, Reveal, ScrollWords } from '@/components/fx';
import { Faq } from '@/components/site/Faq';
import { ArrowLink, PhotoTag } from '@/components/site/ui';
import { DeviceFlow } from './DeviceFlow';
import { GuideCards } from './GuideCards';
import { LineupGrid } from './LineupGrid';
import { ProductPricing } from './ProductPricing';
import { TakeHome } from './TakeHome';
import { PortfolioBand } from './PortfolioDownload';
import { SectionHead } from './detail/SectionHead';
import { ServiceHero } from './detail/ServiceHero';

/* ─────────────────────────────────────────────────────────
   AI 포토부스 · AI 키오스크 상세 (2026-11 개편에서 새로 만든 페이지)
   프로그램 하나하나의 상세(/services/[slug]) 위에 있는 '상품' 단위 안내 — 무엇이 포함되고, 얼마이고, 어떤 프로그램을 올릴 수 있는지.
   문구는 src/data/product-pages.ts, 금액은 온라인 견적 가격표에서 온다.
   ───────────────────────────────────────────────────────── */

export async function ProductPage({ kind, locale }: { kind: ProductPageKind; locale: string }) {
  const ko = locale !== 'en';
  const lang = ko ? 'ko' : 'en';
  const t = await getTranslations({ locale, namespace: 'services' });
  const copy = productPageCopy(kind, lang);
  const service = coreService(kind);
  const name = SERVICE_TEXT[kind].name[lang];
  const device = kind === 'photoBooth' ? 'booth' : 'kiosk';
  const programs = kind === 'photoBooth' ? BOOTH_PROGRAMS : KIOSK_PROGRAMS;
  const flow = ONSITE_FLOWS[copy.flowSlug];
  const processFlow = copy.processFlow ?? flow;
  // 받아 가는 것: 키오스크는 영수증(퍼스널 컬러)과 휴대폰 받기(캐리커처)를 함께 보여 준다
  // 받아 가는 것도 「체험 순서」와 같은 프로그램으로 (포토부스는 SAJU! 영상판 — 사주 카드 인화)
  const takeHome: OnsiteFlow | undefined = kind === 'rental' && flow
    ? { ...flow, phone: ONSITE_FLOWS['ai-caricature-artist']?.phone }
    : kind === 'photoBooth' ? processFlow ?? flow : flow;

  const portfolio = await fetchPublishedPortfolio();
  const cases = copy.caseSlugs.map((slug) => portfolio.find((p) => p.slug === slug)).filter((p) => p !== undefined).slice(0, 3);

  const url = `${SITE_URL}${localePath(copy.path, locale)}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name,
      description: copy.metaDescription,
      url,
      provider: { '@type': 'Organization', name: ko ? '네안데르' : 'NEANDER', url: SITE_URL },
      areaServed: 'KR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: copy.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  let no = 0;
  const next = () => String(++no).padStart(2, '0');

  return (
    <>
      <JsonLd data={jsonLd} />

      <ServiceHero
        eyebrow={`SERVICE ${service.no}`}
        nameEn={service.en.join(' ')}
        nameKo={ko ? name : undefined}
        lead={SERVICE_TEXT[kind].summary[lang]}
        image={service.image}
        imageAlt=""
        caption={service.caption[lang]}
        crumbs={[{ label: 'SERVICES', href: '/services' }, { label: service.en.join(' ') }]}
        primary={{ label: t('addToQuote'), href: quoteHrefFor(kind) }}
        secondary={{ label: t('inquire'), href: '/contact' }}
        facts={[
          { label: 'STARTING AT', value: priceFrom(kind, lang), strong: true },
          ...copy.spec.slice(1, 4).map((row) => ({ label: row.label, value: row.value })),
        ]}
      />

      {/* ── OVERVIEW ───────────────────────────────────── */}
      <section className="bg-ink">
        <div className="wrap section-y">
          <SectionHead no={next()} label="OVERVIEW" en={['WHAT IT IS.']} ko={ko ? '어떤 서비스인가요' : undefined} />
          <ScrollWords className="mt-12 max-w-5xl text-[clamp(1.5rem,3.1vw,2.9rem)] font-bold leading-[1.4] tracking-[-0.035em] text-paper" text={copy.statement} />
          <dl className="mt-14 grid border-t border-paper/15 sm:grid-cols-3 lg:mt-20">
            {copy.numbers.map((nItem, i) => (
              <Reveal key={nItem.label} delay={i * 90} className="border-b border-paper/15 py-7 sm:border-b-0 sm:border-r sm:px-8 sm:first:pl-0 sm:last:border-r-0">
                <dd className="font-display text-[clamp(3rem,6vw,5.5rem)] font-extrabold leading-none tracking-[-0.03em] text-paper">
                  {nItem.value}
                  {nItem.unit && <span className="ml-1.5 font-body text-[0.34em] font-bold tracking-[-0.02em] text-accent">{nItem.unit}</span>}
                </dd>
                <dt className="mt-4">
                  <span className="block text-[1.05rem] font-semibold tracking-[-0.02em] text-paper/90">{nItem.label}</span>
                  {nItem.note && <span className="mt-1 block text-[13px] text-paper/45">{nItem.note}</span>}
                </dt>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      {processFlow && processFlow.steps.length > 0 && (
        <section className="border-t border-paper/10 bg-ink">
          <div className="wrap pt-[clamp(4.5rem,10vw,9.5rem)]">
            <SectionHead no={next()} label="HOW IT WORKS" en={[`${processFlow.steps.length} STEPS.`]} ko={ko ? '체험 순서' : undefined} aside={copy.flowNote} />
          </div>
          <div className="wrap pb-[clamp(2rem,5vw,4rem)] max-lg:pt-10">
            <DeviceFlow flow={processFlow} lang={lang} />
          </div>
        </section>
      )}

      {/* ── TAKE HOME ──────────────────────────────────── */}
      {takeHome && (
        <section className="border-t border-paper/10 bg-ink">
          {/* 넓은 화면: 왼쪽 제목 · 오른쪽 받아 가는 것 (세로 길이를 줄이고 오른쪽 빈자리를 채운다) */}
          <div className="wrap section-y grid gap-x-[clamp(2.5rem,6vw,7rem)] gap-y-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
            {/* 제목은 위에 붙인다 — 오른쪽 그림 아래 끝에 맞추면 제목이 너무 내려간다 */}
            <div className="lg:self-start"><SectionHead no={next()} label="WHAT GUESTS TAKE HOME" en={['TAKE IT', 'HOME.']} ko={ko ? '손님이 받아 가는 것' : undefined} /></div>
            <div className="lg:justify-self-end"><TakeHome flow={takeHome} lang={lang} /></div>
          </div>
        </section>
      )}

      {/* ── ON SITE ────────────────────────────────────── */}
      {/* 홈 DEVELOPMENT STUDIO 처럼 사진이 구역 왼쪽 끝까지 깔리고, 스펙 표 쪽(오른쪽)과 위아래로 배경에 녹는다.
          휴대폰에서는 사진이 위에 오고 아래로 흐려진다 */}
      <section className="relative isolate overflow-hidden border-t border-paper/10 bg-ink">
        <div aria-hidden="true" className="relative -z-10 aspect-[16/10] w-full [mask-image:linear-gradient(to_bottom,black_55%,transparent)] lg:absolute lg:inset-y-0 lg:left-0 lg:aspect-auto lg:w-[58%] lg:[mask-image:linear-gradient(to_right,black_22%,transparent_96%),linear-gradient(to_bottom,transparent,black_20%,black_78%,transparent)] lg:[mask-composite:intersect] lg:[-webkit-mask-composite:source-in]">
          <Image src={copy.scene} alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover opacity-75" />
          {/* 제목이 놓이는 위쪽은 조금 더 어둡게 (홈 DEVELOPMENT STUDIO 처럼 글자 쪽을 눌러 준다) */}
          <div className="absolute inset-0 hidden bg-gradient-to-b from-ink/75 via-ink/15 to-transparent lg:block" />
          {/* 실물을 참고한 생성 이미지라 표시를 붙인다 */}
          <PhotoTag className="absolute bottom-[50%] right-4 lg:right-auto lg:bottom-[22%] lg:left-[36%]">{t('photoConcept')}</PhotoTag>
        </div>
        <div className="wrap section-y max-lg:-mt-24 max-lg:pt-0">
          <SectionHead no={next()} label="ON SITE" en={['ON SITE.']} ko={ko ? '현장 구성' : undefined} />
          {/* 표 글자를 키운 만큼 표 칸을 넓힌다 — 한 줄에 들어가게 */}
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <span aria-hidden="true" className="hidden lg:block lg:min-h-[24rem]" />
            <Reveal as="dl" delay={120} className="self-start border-t border-paper/15">
              {copy.spec.map((row) => (
                <div key={row.label} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-paper/15 py-5 sm:grid-cols-[7.5rem_1fr]">
                  <dt className="text-[1.02rem] text-paper/55">{row.label}</dt>
                  <dd className="text-[1.12rem] font-semibold leading-snug tracking-[-0.015em] text-paper lg:text-[1.2rem]">{row.value}</dd>
                </div>
              ))}
            </Reveal>
          </div>
          <p className="mt-6 text-[1.05rem] leading-relaxed text-paper/60 lg:text-right">{ko ? '기본 구성 기준이며, 현장 조건과 행사 규모에 맞춰 조정합니다.' : 'Standard setup; adjusted to the venue and the size of your event.'}</p>
        </div>
      </section>

      {/* ── LINEUP ─────────────────────────────────────── */}
      <section id="lineup" className="scroll-mt-20 border-t border-paper/10 bg-ink">
        <div className="wrap section-y">
          <SectionHead
            no={next()}
            label="LINEUP"
            en={kind === 'photoBooth' ? ['CHANGE THE THEME,', 'NEW BOOTH.'] : [`${programs.length} READY-MADE`, 'EXPERIENCES.']}
            ko={ko ? (kind === 'photoBooth' ? `바로 쓰는 AI 테마 ${programs.length}종` : `바로 쓰는 AI 체험 ${programs.length}종`) : undefined}
            aside={copy.lineupSub}
          />
          <div className="mt-12"><LineupGrid programs={programs} device={device} lang={lang} /></div>
        </div>
      </section>

      {/* 소개서 PDF — 프로그램을 다 본 자리에서 바로 받게 (2026-11-26 사용자) */}
      <PortfolioBand doc={kind === 'photoBooth' ? 'photoBooth' : 'kiosk'} lang={lang} />

      {/* ── BASIC BOOTH ────────────────────────────────── */}
      {/* AI 없는 기본 네 컷 포토부스(CHEESE! 영상판) — AI 테마와 섞이지 않게 따로 밝힌다 (2026-11-25 사용자) */}
      {kind === 'photoBooth' && (
        <section id="basic-booth" className="scroll-mt-20 border-t border-paper/10 bg-ink">
          <div className="wrap pt-[clamp(4.5rem,10vw,9.5rem)]">
            <SectionHead
              no={next()}
              label="BASIC BOOTH"
              en={['NO AI.', 'JUST SAY CHEESE.']}
              ko={ko ? 'AI 없이, 기본 네 컷 포토부스' : undefined}
              aside={ko ? '같은 부스로 AI 테마 대신, 또는 함께 운영해요' : 'Runs on the same booth, instead of or alongside an AI theme'}
            />
            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
              <p className="max-w-3xl text-[clamp(1.15rem,1.7vw,1.45rem)] font-semibold leading-[1.6] tracking-[-0.02em] text-paper/85">
                {ko
                  ? 'CHEESE! 스튜디오는 영상 속 포토그래퍼 「온유」가 안내하는 네 컷 포토부스예요. 네 컷을 찍고, 프레임 8종 중 하나를 골라 4×6 사진으로 바로 인화해요. AI 생성을 기다리지 않아 손님이 많은 행사에서도 줄이 빨리 줄어요.'
                  : 'CHEESE! Studio is a four-shot photo booth hosted by Onyu, an on-screen photographer. Guests take four shots, pick one of eight frames and get a 4×6 print on the spot. No AI wait, so lines move fast even at busy events.'}
              </p>
              <ul className="flex flex-wrap gap-2 lg:justify-end">
                {(ko ? ['AI 없음', '영상 안내', '네 컷', '프레임 8종', '4×6 인화', '휴대폰 저장'] : ['No AI', 'Video host', 'Four shots', '8 frames', '4×6 print', 'Phone copy']).map((b) => (
                  <li key={b} className="rounded-full border border-paper/20 px-3.5 py-1.5 text-[0.9rem] font-semibold text-paper/75">{b}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="wrap pb-[clamp(3rem,7vw,6rem)] max-lg:pt-10">
            <DeviceFlow flow={CHEESE_VIDEO_FLOW} lang={lang} />
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-paper/15 pt-6">
              <p className="text-[1.02rem] text-paper/60">{ko ? '기본 포토부스 비용은 행사 규모에 맞춰 따로 안내해요.' : 'Pricing for the basic booth is quoted by event size.'}</p>
              <ArrowLink href="/contact">{ko ? '기본 포토부스 문의' : 'ASK ABOUT THE BASIC BOOTH'}</ArrowLink>
            </div>
          </div>
        </section>
      )}

      {/* ── PRICE ──────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 border-t border-paper/10 bg-ink">
        <div className="wrap section-y">
          <SectionHead no={next()} label="PRICE" en={['CLEAR', 'PRICING.']} ko={ko ? '가격 안내' : undefined} />
          <div className="mt-12"><ProductPricing service={kind} locale={locale} /></div>
        </div>
      </section>

      {/* ── CASES ──────────────────────────────────────── */}
      {cases.length > 0 && (
        <section className="border-t border-paper/10 bg-ink">
          <div className="wrap section-y">
            <SectionHead no={next()} label="CASES" en={['FROM', 'THE FIELD.']} ko={ko ? `${name} 운영 사례` : undefined} aside={<ArrowLink href="/portfolio">{ko ? '전체 프로젝트' : 'ALL PROJECTS'}</ArrowLink>} />
            <ul className="mt-12 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((c, i) => {
                const title = ko ? c.title_ko : c.title_en || c.title_ko;
                const period = (ko ? c.period_ko : c.period_en) || c.period || (c.year ? String(c.year) : '');
                const thumb = c.thumbnail || c.images?.[0];
                return (
                  <li key={c.slug}>
                    <Reveal variant="clip" delay={i * 90}>
                      <Link href={`/portfolio/${c.slug}`} data-cursor="VIEW" className="group block focus-visible:outline-2 focus-visible:outline-offset-4">
                        <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
                          {thumb && <Image src={thumb} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" className="rd-zoom object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]" />}
                        </div>
                        <div className="border-b border-paper/15 pb-5 pt-4 transition-colors duration-500 group-hover:border-paper/60">
                          {period && <p className="t-label !text-[0.66rem] text-paper/45">{period}</p>}
                          <p className="t-kr-title mt-2 text-[1.15rem] text-paper">{title}</p>
                        </div>
                      </Link>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ── GUIDES ─────────────────────────────────────── */}
      <section className="border-t border-paper/10 bg-ink">
        <div className="wrap section-y">
          <SectionHead no={next()} label="GUIDES" en={['BY EVENT.']} ko={ko ? '행사별 안내' : undefined} aside={ko ? '쓰임새별 비용 · 현장 진행 · 운영 사례' : 'Prices, how it runs on the day, and past events'} />
          <div className="mt-12"><GuideCards slugs={copy.guideSlugs} lang={lang} /></div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="border-t border-paper/10 bg-ink">
        <div className="wrap section-y">
          <SectionHead no={next()} label="FAQ" en={['QUESTIONS.']} ko={ko ? '자주 묻는 질문' : undefined} />
          <Faq items={copy.faq} className="mt-12" />
        </div>
      </section>
    </>
  );
}
