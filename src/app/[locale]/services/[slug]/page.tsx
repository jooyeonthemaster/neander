import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, permanentRedirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getServiceContactHref } from '@/lib/constants';
import {
  getAllSlugs,
  getExperienceBySlug,
  getExperiencesByPillar,
  getExperiencesByIndustry,
  getPillarById,
  getIndustryById,
  RETIRED_PROGRAMS,
  formerProgramPillar,
} from '@/data/experiences';
import { DEFAULT_OG_IMAGE, localeAlternates, localePath } from '@/lib/seo';
import { getExperienceSpec } from '@/data/experience-specs';
import { getExperienceImage } from '@/data/experience-images';
import { getOnsiteFlow } from '@/data/onsite-flows';
import { VIDEO_FLOWS } from '@/data/program-previews';
import { AcscentTrust } from '@/components/services/AcscentTrust';
import { serviceForExperience, startingPrice as quoteStartingPrice } from '@/lib/quote/engine';
import { getPhotoBoothTemplates } from '@/lib/quote/photo-booth-templates';
import { formatPrice } from '@/lib/quote/format';
import { serviceJsonLd, serviceLanding, serviceSearchDescription, serviceSearchTitle } from '@/lib/seo-service';
import { JsonLd } from '@/components/seo/JsonLd';
import { GuideCards } from '@/components/services/GuideCards';
import { guidesForExperience } from '@/data/event-guides';
import { EXPERIENCE_PHOTOS } from '@/data/experience-photos';
import { fetchPublishedPortfolio } from '@/lib/firebase/rest';
import type { PortfolioItem } from '@/types/admin';
import { coreService, type CoreServiceKey } from '@/data/site';
import { Reveal, ScrollWords } from '@/components/fx';
import { ArrowLink, Btn, PhotoTag } from '@/components/site/ui';
import { cn } from '@/lib/utils';
import { ServiceHero, type HeroFact } from '@/components/services/detail/ServiceHero';
import { SectionHead } from '@/components/services/detail/SectionHead';
import { DeviceFlow } from '@/components/services/DeviceFlow';
import { TakeHome } from '@/components/services/TakeHome';
import { ProgramCard } from '@/components/services/ProgramCard';
import { ProductPricing } from '@/components/services/ProductPricing';

/* ─────────────────────────────────────────────────────────
   체험 서비스 상세 (2026-11 개편)
   방문 기록상 문의·견적 고객의 53%가 서비스 상세를 보고, 포트폴리오 · 견적과 오가며 평균 14쪽을 본다.
   그래서 위에서부터: 무엇인지 · 얼마부터인지 · 견적 버튼 → 실제 화면으로 보는 체험 순서 → 스펙 → 운영 사례 → 관련 안내 순으로 둔다.
   문구는 messages 의 services.exp.* 를 그대로 쓰고, 수치는 확인된 것만 보여 준다 (experience-specs.ts 규칙).
   ───────────────────────────────────────────────────────── */

// 이 체험을 실제로 운영한 행사 사례 (최대 3건).
// 서비스 카드 사진의 출처 사례(EXPERIENCE_PHOTOS)를 먼저, AI 향수·AI 포토부스는 같은 서비스를 쓴 행사 사례를 더한다.
// 사례 ↔ 서비스를 서로 이어 검색엔진이 실적을 함께 읽고, 방문자도 실제 현장을 볼 수 있게 한다.
async function operatedCases(slug: string, serviceKey: string | null): Promise<PortfolioItem[]> {
  const portfolio = await fetchPublishedPortfolio();
  const picked: PortfolioItem[] = [];
  const exact = EXPERIENCE_PHOTOS[slug]?.portfolioSlug;
  const exactItem = exact ? portfolio.find((p) => p.slug === exact) : undefined;
  if (exactItem) picked.push(exactItem);
  if (serviceKey === 'acscent' || serviceKey === 'photoBooth') {
    for (const p of portfolio) {
      if (picked.length >= 3) break;
      if (p.category === 'offline' && p.services?.includes(serviceKey) && !picked.includes(p)) picked.push(p);
    }
  }
  return picked;
}

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const exp = getExperienceBySlug(slug);
  if (!exp) return { title: 'Not Found' };

  const t = await getTranslations({ locale, namespace: 'services' });
  // 체험 이름만으로는 검색되지 않으므로 행사 담당자가 찾는 말과 시작가를 붙인다 (src/lib/seo-service.ts)
  const title = serviceSearchTitle(t(exp.nameKey), slug, exp.pillar, locale);
  const description = serviceSearchDescription(t(exp.oneLinerKey), slug, exp.pillar, locale);

  return {
    alternates: localeAlternates(`/services/${slug}`, locale),
    title,
    description,
    openGraph: {
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

const CORE: CoreServiceKey[] = ['acscent', 'photoBooth', 'rental'];

export default async function ExperienceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const exp = getExperienceBySlug(slug);
  // 2026-11-26 뺀 프로그램의 예전 주소 → 상품 화면
  if (!exp && RETIRED_PROGRAMS[slug]) permanentRedirect(localePath(RETIRED_PROGRAMS[slug], locale));
  // 상세 페이지를 내린 프로그램의 예전 주소 (검색엔진에 남아 있다) → 가장 가까운 상품 화면 (2026-11-27)
  //  포토부스에서 도는 프로그램 → 포토부스, 미디어아트형 → 체험서비스 목록, 나머지(키오스크 체험) → 키오스크
  if (!exp) {
    const pillar = formerProgramPillar(slug);
    if (pillar) permanentRedirect(localePath(getPhotoBoothTemplates([slug]).length || pillar === 'ai-photo'
      ? '/services/ai-photo-booth' : pillar === 'ai-immersive' ? '/services' : '/services/ai-kiosk', locale));
    notFound();
  }

  const ko = locale !== 'en';
  const lang = ko ? 'ko' : 'en';
  const t = await getTranslations({ locale, namespace: 'services' });
  const tEn = ko ? await getTranslations({ locale: 'en', namespace: 'services' }) : t;
  const tPricing = await getTranslations({ locale, namespace: 'pricingGuide' });

  const pillar = getPillarById(exp.pillar);
  const industry = getIndustryById(exp.industry);

  /* -- Related experiences -------------------------------- */
  const relatedByPillar = getExperiencesByPillar(exp.pillar).filter((e) => e.id !== exp.id).slice(0, 4);
  const relatedByIndustry = getExperiencesByIndustry(exp.industry)
    .filter((e) => e.id !== exp.id && !relatedByPillar.find((r) => r.id === e.id))
    .slice(0, 4);
  const related = [...relatedByPillar, ...relatedByIndustry].slice(0, 4);

  const quoteService = serviceForExperience(slug, exp.pillar);
  const cases = await operatedCases(slug, quoteService);

  /* -- Strings -------------------------------------------- */
  const name = t(exp.nameKey);
  const nameEn = tEn(exp.nameKey);
  const oneLiner = t(exp.oneLinerKey);
  const description = t(exp.descriptionKey);
  const features = Array.from({ length: exp.featureCount }, (_, i) => t(`${exp.featuresKey}.${i}`));
  const processSteps = Array.from({ length: exp.processStepCount }, (_, i) => ({
    title: t(`${exp.processStepsKey}.${i}.title`),
    description: t(`${exp.processStepsKey}.${i}.description`),
  }));
  const highlights = Array.from({ length: exp.highlightCount }, (_, i) => ({
    value: t(`${exp.highlightsKey}.${i}.value`),
    label: t(`${exp.highlightsKey}.${i}.label`),
  }));
  const useCases = Array.from({ length: exp.useCaseCount }, (_, i) => ({
    title: t(`${exp.useCasesKey}.${i}.title`),
    description: t(`${exp.useCasesKey}.${i}.description`),
  }));
  const pillarName = pillar ? t(pillar.nameKey) : '';
  const industryName = industry ? t(industry.nameKey) : '';

  /* -- Spec (확인되지 않은 수치는 "상담 시 안내") --------- */
  const spec = getExperienceSpec(slug);
  // 체험 순서는 카드 미리보기와 같은 판으로 — 영상판이 있으면 영상판 녹화, 없으면 기본 화면 캡처
  const basicFlow = getOnsiteFlow(slug);
  const processFlow = VIDEO_FLOWS[slug] ?? basicFlow;
  const flow = processFlow;
  // 받아 가는 것은 받는 물건 그림이 있는 쪽 (영상판 녹화에는 인화물 · 휴대폰 그림이 없는 경우가 많다)
  const hasItems = (f?: typeof basicFlow) => !!f && (!!f.phone || !!f.receipt || (f.prints?.length ?? 0) > 0);
  // 기본 화면 캡처가 다른 기기용이면(예: FACE! 영상판은 포토부스, 기본은 키오스크) 받아 가는 것이 어긋나므로 쓰지 않는다
  const sameDeviceBasic = basicFlow && basicFlow.device === processFlow?.device ? basicFlow : undefined;
  // 영상판 녹화에서 받은 결과물(영수증 · 인화물)이 있으면 그것을, 휴대폰 받기 화면은 기본 캡처에서 채운다
  const v = VIDEO_FLOWS[slug];
  const takeHomeFlow = v && hasItems(v) ? { ...v, phone: v.phone ?? sameDeviceBasic?.phone } : sameDeviceBasic;
  const onRequest = t('spec.onRequest');
  const landing = serviceLanding(slug, exp.pillar, locale);
  const startingPrice = quoteService ? quoteStartingPrice(quoteService) : 0;
  const priceText = startingPrice ? (ko ? `${formatPrice(startingPrice, locale)}${tPricing('from')}` : `${tPricing('from')} ${formatPrice(startingPrice, locale)}`) : '';
  const deviceText = flow
    ? flow.device === 'kiosk'
      ? (ko ? '세로형 AI 키오스크 — 터치 화면 · 웹캠 · 80mm 영수증 프린터' : 'Portrait AI kiosk — touch screen, webcam, 80mm receipt printer')
      : (ko ? 'AI 포토부스 — 가로 화면 · DSLR 카메라 · 4×6 사진 프린터 · 조명' : 'AI photo booth — landscape screen, DSLR camera, 4×6 photo printer, light')
    : '';
  const specRows = spec
    ? [
        ...(priceText ? [{ label: t('spec.startingPrice'), value: priceText }] : []),
        ...(deviceText ? [{ label: ko ? '기기' : 'Device', value: deviceText }] : []),
        { label: t('spec.input'), value: spec.input.map((k) => t(`spec.inputs.${k}`)).join(' · ') },
        { label: t('spec.output'), value: spec.text?.output?.[lang] ?? spec.output.map((k) => t(`spec.outputs.${k}`)).join(' · ') },
        { label: t('spec.power'), value: t('spec.powerValue') },
        { label: t('spec.internet'), value: t('spec.internetValue') },
        { label: t('spec.minutes'), value: spec.text?.minutes?.[lang] ?? (spec.minutesPerGuest ? t('spec.minutesValue', { n: spec.minutesPerGuest }) : onRequest) },
        { label: t('spec.throughput'), value: spec.guestsPerHour ? t('spec.countValue', { n: spec.guestsPerHour }) : onRequest },
        { label: t('spec.footprint'), value: spec.footprint ?? onRequest },
        { label: t('spec.staff'), value: spec.text?.staff?.[lang] ?? (spec.staff ? t('spec.countValue', { n: spec.staff }) : onRequest) },
      ]
    : [];

  /* -- Hero ----------------------------------------------- */
  const image = getExperienceImage(slug);
  const caption = image ? (image.kind === 'case' ? `${t('photoCase')} · ${ko ? image.eventKo : image.eventEn}` : t('photoConcept')) : undefined;
  const core = quoteService && (CORE as string[]).includes(quoteService) ? coreService(quoteService as CoreServiceKey) : null;
  const isPerfume = slug === 'ai-scent-soulmate';
  // 운영 스펙 옆 현장 구성 그림 (있는 체험만)
  const SPEC_IMAGES: Record<string, { src: string; altKo: string; altEn: string }> = {
    'ai-scent-soulmate': {
      src: '/images/services/spec/ai-scent-soulmate.webp',
      altKo: '터치스크린 키오스크 1대와 조향 카운터, 조향사·조수 2명이 손님의 향수 제작을 돕는 현장 구성 예시',
      altEn: 'Example setup: one touchscreen kiosk beside a perfume counter where two staff help a guest blend a perfume',
    },
  };
  const specImage = SPEC_IMAGES[slug];
  const facts: HeroFact[] = [
    ...(priceText ? [{ label: 'STARTING AT', value: priceText, strong: true }] : []),
    ...(spec ? [{ label: ko ? '결과 전달' : 'TAKE HOME', value: spec.output.map((k) => t(`spec.outputs.${k}`)).join(' · ') }] : []),
    ...(spec?.guestsPerHour ? [{ label: ko ? '시간당 체험 인원' : 'PER HOUR', value: t('spec.countValue', { n: spec.guestsPerHour }) }] : []),
    { label: ko ? '분류' : 'CATEGORY', value: [pillarName, industryName].filter(Boolean).join(' · ') },
  ];

  let no = 0;
  const next = () => String(++no).padStart(2, '0');
  const hasTakeHome = hasItems(takeHomeFlow);

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name,
          description: serviceSearchDescription(oneLiner, slug, exp.pillar, locale),
          slug,
          pillar: exp.pillar,
          locale,
          servicesLabel: t('title'),
        })}
      />

      <ServiceHero
        eyebrow={isPerfume ? 'SERVICE 01' : pillarName}
        nameEn={isPerfume ? 'AI PERFUMER' : nameEn}
        nameKo={ko ? name : isPerfume ? nameEn : undefined}
        lead={oneLiner}
        image={image?.src ?? '/images/services/services-hero-concept.webp'}
        imageAlt={caption ? `${name} — ${caption}` : name}
        caption={caption}
        crumbs={[
          { label: 'SERVICES', href: '/services' },
          ...(core && !isPerfume ? [{ label: core.en.join(' '), href: core.href }] : []),
          { label: isPerfume ? 'AI PERFUMER' : nameEn.toUpperCase() },
        ]}
        primary={{ label: t('ctaQuote'), href: getServiceContactHref(slug) }}
        secondary={{ label: t('inquiryBtn'), href: getServiceContactHref(slug, false) }}
        facts={facts}
      />

      {/* ── OVERVIEW ───────────────────────────────────── */}
      <section id="overview" className="scroll-mt-20 bg-ink">
        <div className="wrap section-y">
          <SectionHead no={next()} label="OVERVIEW" en={['WHAT IT IS.']} ko={ko ? '어떤 체험인가요' : undefined} />
          <ScrollWords className="mt-12 max-w-5xl text-balance text-[clamp(1.4rem,2.9vw,2.6rem)] font-bold leading-[1.45] tracking-[-0.035em] text-paper" text={description} />
          {highlights.length > 0 && (
            <dl className="mt-14 grid border-t border-paper/15 sm:grid-cols-3 lg:mt-20">
              {highlights.map((h, i) => (
                <Reveal key={h.label} delay={i * 90} className="border-b border-paper/15 py-7 sm:border-b-0 sm:border-r sm:px-8 sm:first:pl-0 sm:last:border-r-0">
                  <dd className="font-display text-[clamp(2.4rem,4.6vw,4.2rem)] font-extrabold leading-none tracking-[-0.03em] text-paper">{h.value}</dd>
                  <dt className="mt-3 text-[0.98rem] text-paper/60">{h.label}</dt>
                </Reveal>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section id="how" className="scroll-mt-20 border-t border-paper/10 bg-ink">
        <div className="wrap pt-[clamp(4.5rem,10vw,9.5rem)]">
          <SectionHead
            no={next()}
            label="HOW IT WORKS"
            en={[`${flow?.steps.length ? flow.steps.length : processSteps.length} STEPS.`]}
            ko={ko ? t('detailProcessTitle') : undefined}
            aside={flow?.steps.length ? (ko ? '행사장 기기에서 도는 실제 프로그램 화면입니다. 단계를 누르면 그 장면으로 넘어갑니다.' : 'These are the actual program screens that run on the device. Tap a step to jump to it.') : undefined}
          />
        </div>
        {flow && flow.steps.length > 0 && (
          <div className="wrap max-lg:pt-10">
            <DeviceFlow flow={flow} lang={lang} />
          </div>
        )}
        <div className="wrap pb-[clamp(4.5rem,10vw,9.5rem)] pt-10 lg:pt-4">
          <ol className="grid gap-px border border-paper/15 bg-paper/15 md:grid-cols-3">
            {processSteps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 90} className="bg-ink p-7 lg:p-9">
                <span className="text-outline font-display text-[3.5rem] font-extrabold leading-none">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="t-kr-title mt-6 text-xl text-paper">{step.title}</h3>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-paper/60">{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── TAKE HOME ──────────────────────────────────── */}
      {hasTakeHome && takeHomeFlow && (
        <section className="border-t border-paper/10 bg-ink">
          {/* 상품 상세와 같은 배치: 넓은 화면은 왼쪽 제목 · 오른쪽 받아 가는 것 */}
          <div className="wrap section-y grid gap-x-[clamp(2.5rem,6vw,7rem)] gap-y-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
            <div className="lg:self-start"><SectionHead no={next()} label="WHAT GUESTS TAKE HOME" en={['TAKE IT', 'HOME.']} ko={ko ? '손님이 받아 가는 것' : undefined} /></div>
            <div className="lg:justify-self-end">
              <TakeHome flow={takeHomeFlow} lang={lang} />
              {/* 화면 캡처에 영수증이 없는 키오스크 체험 — 스펙(결과 전달: 현장 출력)과 어긋나 보이지 않게 출력도 함께 적는다 (2026-11-27 배포 전 검수) */}
              {quoteService === 'rental' && !takeHomeFlow.receipt && spec?.output.includes('print') && (
                <p className="mt-8 max-w-md text-sm leading-relaxed text-paper/60">
                  {ko ? '결과는 키오스크에 내장된 80mm 프린터로 현장에서 출력하고, QR로 휴대폰에서도 받을 수 있습니다.' : 'Results print on the kiosk’s built-in 80mm printer on site and can also be downloaded to a phone by QR.'}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES · USE CASES ───────────────────────── */}
      <section className="border-t border-paper/10 bg-ink">
        <div className="wrap section-y grid gap-x-20 gap-y-20 lg:grid-cols-2">
          <div>
            <SectionHead no={next()} label="FEATURES" en={['INSIDE.']} ko={ko ? t('features') : undefined} />
            <ul className="mt-10 border-t border-paper/15">
              {features.map((feature, i) => (
                <Reveal as="li" key={feature} delay={i * 60} className="flex items-baseline gap-6 border-b border-paper/15 py-5">
                  <span className="t-label text-accent">{String(i + 1).padStart(2, '0')}</span>
                  {/* 영어의 「(sweetness/acidity/body…)」처럼 띄어쓰기 없는 긴 낱말이 320px 폰에서 넘치지 않게 */}
                  <span className="min-w-0 text-[1.08rem] font-medium leading-snug tracking-[-0.02em] text-paper/90 [overflow-wrap:anywhere]">{feature}</span>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead no={next()} label="USE CASES" en={['WHERE', 'IT FITS.']} ko={ko ? t('useCasesTitle') : undefined} />
            <ul className="mt-10 grid gap-4">
              {useCases.map((useCase, i) => (
                <Reveal as="li" key={useCase.title} delay={i * 80} className="group border border-paper/15 p-6 transition-colors duration-500 hover:border-paper/50 lg:p-7">
                  <h3 className="t-kr-title text-lg text-paper">{useCase.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-paper/60">{useCase.description}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── SPEC · PRICE ───────────────────────────────── */}
      {specRows.length > 0 && (
        <section id="spec" className={cn('scroll-mt-20 border-t border-paper/10 bg-ink', specImage && 'relative isolate overflow-hidden')}>
          {/* 현장 구성 그림 — 실제 운영 부스 사진을 참고해 Seedream 5.5 로 만든 연출 컷 (output/onsite-spec-images-2026-11-21).
              홈 WHO WE ARE 의 사진 벽처럼 오른쪽에서 배경으로 녹아든다 — 휴대폰에서는 표 위에 두고 아래로 흐려진다 */}
          {specImage && (
            <figure className="relative -z-10 aspect-[3/2] w-full [mask-image:linear-gradient(to_bottom,black_55%,transparent)] lg:absolute lg:right-0 lg:top-[55%] lg:w-[64%] lg:-translate-y-1/2 lg:[mask-image:linear-gradient(to_right,transparent,black_34%),linear-gradient(to_bottom,transparent,black_14%,black_80%,transparent)] lg:[mask-composite:intersect] lg:[-webkit-mask-composite:source-in]">
              <Image src={specImage.src} alt={ko ? specImage.altKo : specImage.altEn} fill sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover opacity-90" />
              <PhotoTag className="absolute bottom-[22%] right-4 lg:right-8">{t('photoConcept')}</PhotoTag>
            </figure>
          )}
          <div className={cn('wrap section-y', specImage && 'max-lg:-mt-16 max-lg:pt-0')}>
            {/* 현장 구성 그림이 있는 체험은 오른쪽 안내 문구 대신 그림을 둔다 */}
            <SectionHead no={next()} label="SPEC" en={['ON SITE.']} ko={ko ? t('spec.title') : undefined} aside={specImage ? undefined : t('spec.note')} />
            <div className="mt-12 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
              <Reveal as="dl" className="border-t border-paper/15">
                {specRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[9.5rem_1fr] gap-4 border-b border-paper/15 py-4 sm:grid-cols-[13rem_1fr]">
                    <dt className="text-[0.92rem] text-paper/50">{row.label}</dt>
                    <dd className={row.value === onRequest ? 'text-[0.98rem] text-paper/40' : 'text-[0.98rem] font-semibold tracking-[-0.01em] text-paper'}>{row.value}</dd>
                  </div>
                ))}
              </Reveal>
              {/* 가격 — 주력 3종은 가격표를 따로 두고, 그 밖의 체험은 시작가와 바로 가기만 */}
              {!isPerfume && (
                // 가격 카드는 등장 효과 없이 처음부터 보인다
                <div className="self-start bg-paper p-7 text-ink lg:p-9" data-cta-area="price_card">
                  <p className="t-label text-ink/50">{core ? core.en.join(' ') : 'PRICE'}</p>
                  {/* 영어 가격(「from ₩1,200,000」)은 360px 폰에서 카드를 밀어낸다 — 모바일은 화면 폭에 맞춰 줄인다 */}
                  <p className={cn('mt-4 font-display font-extrabold leading-none tracking-[-0.03em]', ko ? 'text-[clamp(2.2rem,4vw,3.4rem)]' : 'text-[clamp(1.75rem,8.5vw,2.2rem)] sm:text-[clamp(2.2rem,4vw,3.4rem)]')}>{priceText || t('consultationOnly')}</p>
                  {quoteService && tPricing.has(`basis.${quoteService}`) && <p className="mt-4 text-[0.92rem] leading-relaxed text-ink/60">{tPricing(`basis.${quoteService}`)}</p>}
                  <div className="mt-7 flex flex-wrap gap-2.5">
                    <Link href={getServiceContactHref(slug)} className="inline-flex min-h-12 items-center gap-2.5 bg-ink px-6 text-[0.95rem] font-semibold text-paper transition-colors duration-300 hover:bg-accent hover:text-ink">
                      {t('ctaQuote')} <span aria-hidden="true" className="font-display">→</span>
                    </Link>
                    {core && (
                      <Link href={`${core.href}#pricing`} className="inline-flex min-h-12 items-center border border-ink/60 px-6 text-[0.95rem] font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper">
                        {ko ? '가격 자세히' : 'Full pricing'}
                      </Link>
                    )}
                  </div>
                  {landing && (
                    <Link href={landing.href} className="mt-5 inline-block text-sm font-semibold underline decoration-ink/30 underline-offset-4 hover:decoration-ink">{landing.text}</Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* AC'SCENT 체험은 인허가·실적과 가격표를 함께 보여준다 */}
      {isPerfume && (
        <>
          <div className="on-dark border-t border-paper/10">
            <AcscentTrust locale={locale} />
          </div>
          <section id="pricing" className="scroll-mt-20 border-t border-paper/10 bg-ink">
            <div className="wrap section-y">
              <SectionHead no={next()} label="PRICE" en={['CLEAR', 'PRICING.']} ko={ko ? '가격 안내' : undefined} />
              <div className="mt-12"><ProductPricing service="acscent" locale={locale} /></div>
              {landing && <p className="mt-6"><ArrowLink href={landing.href}>{landing.text}</ArrowLink></p>}
            </div>
          </section>
        </>
      )}

      {/* ── CASES ──────────────────────────────────────── */}
      {cases.length > 0 && (
        <section aria-labelledby="operated-cases-title" className="border-t border-paper/10 bg-ink">
          <div className="wrap section-y">
            <SectionHead
              id="operated-cases-title"
              no={next()}
              label="CASES"
              en={['FROM', 'THE FIELD.']}
              ko={ko ? `${name} 운영 사례` : undefined}
              aside={<ArrowLink href="/portfolio">{ko ? '전체 프로젝트' : 'ALL PROJECTS'}</ArrowLink>}
            />
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
                          {thumb && <Image src={thumb} alt={title} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" className="rd-zoom object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]" />}
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
      <section aria-labelledby="event-guides-title" className="border-t border-paper/10 bg-ink">
        <div className="wrap section-y">
          <SectionHead id="event-guides-title" no={next()} label="GUIDES" en={['BY EVENT.']} ko={ko ? '행사별 안내' : undefined} aside={ko ? '쓰임새별 비용 · 현장 진행 · 운영 사례' : 'Prices, how it runs on the day, and past events'} />
          <div className="mt-12">
            <GuideCards slugs={guidesForExperience(slug, exp.pillar)} lang={lang} />
          </div>
        </div>
      </section>

      {/* ── RELATED ────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="border-t border-paper/10 bg-ink">
          <div className="wrap section-y">
            <SectionHead no={next()} label="MORE" en={['RELATED.']} ko={ko ? t('relatedExperiences') : undefined} aside={<Btn href={`/services?pillar=${exp.pillar}`} arrow>{ko ? `${pillarName} 전체` : `All ${pillarName}`}</Btn>} />
            <ul className="mt-12 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r, i) => {
                const rPillar = getPillarById(r.pillar);
                return (
                  <li key={r.slug}>
                    <Reveal delay={i * 80} className="h-full">
                      <ProgramCard slug={r.slug} name={t(r.nameKey)} nameEn={tEn(r.nameKey)} oneLiner={t(r.oneLinerKey)} tag={rPillar ? t(rPillar.nameKey) : undefined} />
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
