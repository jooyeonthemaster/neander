import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PricingGuide } from '@/components/services/PricingGuide';
import { EventGuides } from '@/components/services/EventGuides';
import { ProgramExplorer } from '@/components/services/ProgramExplorer';
import { PerfumeCollage, ProductBlock } from '@/components/services/ProductBlock';
import { ProgramStage } from '@/components/services/ProgramStage';
import { SectionHead } from '@/components/services/detail/SectionHead';
import { ConsultServices } from '@/components/site/ConsultServices';
import { Title } from '@/components/site/Title';
import { PhotoTag } from '@/components/site/ui';
import { experiences, type PillarId } from '@/data/experiences';
import { BOOTH_PROGRAMS, KIOSK_PROGRAMS, stagePrograms } from '@/data/product-lines';
import { CORE_SERVICES, priceFrom } from '@/data/site';
import { SERVICE_TEXT } from '@/lib/quote/catalog';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

const VALID_PILLARS: PillarId[] = ['ai-photo', 'ai-diagnosis', 'ai-fortune', 'ai-creative', 'ai-immersive'];

// 첫 화면: 향수 바 · AI 키오스크 · AI 포토부스가 함께 있는 행사장을 그린 생성 이미지(실제 기기 사진 참고).
// 실제 행사 사진이 아니므로 카드의 콘셉트 이미지처럼 「체험 콘셉트 이미지」로 표시한다.
const HERO_IMAGE = '/images/services/services-hero-concept.webp';

const ANCHOR = { acscent: 'perfume', photoBooth: 'photo-booth', rental: 'kiosk' } as const;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pillar?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });

  return {
    alternates: localeAlternates('/services', locale),
    // 화면 제목(「서비스」)과 달리 검색 결과에는 행사 담당자가 찾는 말을 쓴다
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

/* 체험 서비스 목록 (2026-11 개편)
   방문 기록상 이 페이지는 홈 다음으로 많이 들어오는 곳이고(12%), 문의·견적 고객의 68%가 거친다.
   그런데 스크롤 중앙값이 54%, 끝까지 보는 사람은 15% 뿐이라 — 주력 3종의 이름 · 시작가 · 견적 버튼을 맨 위에 둔다. */
export default async function ServicesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { pillar: pillarParam } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'services' });
  const tEn = await getTranslations({ locale: 'en', namespace: 'services' });
  const ko = locale !== 'en';
  const lang = ko ? 'ko' : 'en';

  const initialPillar = VALID_PILLARS.includes(pillarParam as PillarId) ? (pillarParam as PillarId) : undefined;
  const namesEn = Object.fromEntries(experiences.map((e) => [e.slug, tEn(e.nameKey).toUpperCase()]));
  const labels = { quote: t('addToQuote'), detail: t('viewDetail') };
  const [perfume, booth, kiosk] = CORE_SERVICES;

  return (
    <>
      {/* ── 첫 화면 ───────────────────────────────────── */}
      <section className="under-header relative isolate flex min-h-[min(54rem,calc(96svh-4.5rem))] lg:min-h-[min(54rem,96svh)] flex-col justify-end overflow-hidden bg-ink" aria-labelledby="services-hero-title">
        <div className="absolute inset-0 -z-10">
          <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="zoom-settle object-cover object-[50%_55%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/50 to-ink" />
        </div>
        <PhotoTag className="absolute right-4 top-24 lg:right-8 lg:top-28">{t('photoConcept')}</PhotoTag>

        <div className="wrap pb-10 pt-36 text-center lg:pb-14">
          <p className="t-label rise text-paper/70">OUR SERVICES</p>
          {/* 첫 화면(h1 포함)은 서버 HTML 그대로 보이고 CSS 로만 올라온다 — 스크립트가 늦어도 제목이 비어 보이지 않게 */}
          <Title as="h1" id="services-hero-title" en={['EXPERIENCES']} ko={t('subtitle')} size="giant" immediate delay={100} className="mt-6 [&_[data-lines]]:!text-[length:clamp(1.3rem,max(min(6.9vw,3.1rem),6.5vw),6.6rem)]" koClassName="text-paper/85" />
        </div>

        {/* 주력 3종 바로 가기 */}
        <ul className="fade-in grid border-t border-paper/20 lg:grid-cols-3" style={{ '--i': 7 } as React.CSSProperties}>
          {CORE_SERVICES.map((s) => (
            <li key={s.key} className="border-b border-paper/15 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
              <Link href={`#${ANCHOR[s.key]}`} className="group relative flex items-center gap-4 overflow-hidden px-[clamp(1.25rem,3vw,3.25rem)] py-4 lg:py-6">
                <span aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 bg-paper/[0.08] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                <span className="t-label relative text-accent">{s.no}</span>
                <span className="relative min-w-0 flex-1">
                  <span className="block font-display text-[1.05rem] font-extrabold uppercase leading-tight text-paper lg:text-[1.3rem]">{s.en.join(' ')}</span>
                  <span className="mt-1 block text-[13px] text-paper/60">{SERVICE_TEXT[s.key].name[lang]}<span className="mx-2 text-paper/25">·</span>{priceFrom(s.key, lang)}</span>
                </span>
                <span aria-hidden="true" className="relative font-display text-lg text-paper/60 transition-transform duration-500 group-hover:translate-y-1">↓</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 주력 3종 ──────────────────────────────────── */}
      <ProductBlock id={ANCHOR.acscent} service={perfume} lang={lang} labels={labels} visual={<PerfumeCollage lang={lang} />} />
      <ProductBlock
        id={ANCHOR.photoBooth}
        service={booth}
        lang={lang}
        labels={labels}
        visual={<ProgramStage device="booth" programs={stagePrograms(BOOTH_PROGRAMS)} lang={lang} limit={6} deviceClassName="lg:!w-[min(26vw,22rem)]" />}
      />
      <ProductBlock
        id={ANCHOR.rental}
        service={kiosk}
        lang={lang}
        labels={labels}
        visual={<ProgramStage device="kiosk" programs={stagePrograms(KIOSK_PROGRAMS)} lang={lang} limit={8} deviceClassName="lg:!w-[min(17vw,15.5rem)]" />}
      />

      {/* ── 전체 프로그램 ─────────────────────────────── */}
      <ProgramExplorer key={initialPillar ?? 'all'} initialPillar={initialPillar} namesEn={namesEn} no="04" />

      {/* ── 상담형 서비스 ─────────────────────────────── */}
      <section className="border-t border-paper/10 bg-ink">
        <div className="wrap section-y">
          <SectionHead no="05" label="MADE TO ORDER" en={['BUILT FOR', 'YOUR EVENT.']} ko={ko ? '공간 · 미디어 아트 · 커스텀 콘텐츠' : undefined} aside={ko ? '행사에 맞춰 새로 만드는 일은 상담 후 견적을 드립니다.' : 'Work built for a single event is quoted after a consultation.'} />
          <ConsultServices className="mt-12" startNo={1} />
        </div>
      </section>

      {/* ── 행사별 안내 (인사이트의 서비스 안내 페이지, 주소는 /insights 그대로) ── */}
      <EventGuides locale={locale} no="06" />

      {/* ── 비용·운영 안내 ─────────────────────────────── */}
      <PricingGuide locale={locale} variant="compact" />
    </>
  );
}
