import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { services } from '@/data/services';
import { fetchPublishedPortfolio } from '@/lib/firebase/rest';
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery';
import type { PortfolioImageMetadata, PortfolioItem } from '@/types/admin';
import caseStudyCopy from '@/data/portfolio-case-studies.json';
import Image from 'next/image';
import { Reveal } from '@/components/fx';
import { Title } from '@/components/site/Title';
import { Btn } from '@/components/site/ui';
import { Link } from '@/i18n/navigation';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';
import { SERVICE_TEXT, type ServiceKey } from '@/lib/quote/catalog';

// 사례에 쓴 서비스 → 자세한 안내 페이지 (구매 의도 검색어용 랜딩·개발 의뢰).
// 포트폴리오 상세로 바로 들어온 방문 96회 중 서비스·견적·문의로 넘어간 경우가 5회뿐이라 (2026-11 방문 분석)
// 사례 아래에 같은 구성의 안내와 견적으로 가는 길을 둔다.
const SERVICE_GUIDE: Partial<Record<ServiceKey, { href: string; ko: string; en: string }>> = {
  acscent: { href: '/insights/event-ai-perfume-experience', ko: 'AI 향수 만들기 체험 — 비용·진행 안내', en: 'AI perfume-making experience — cost & process' },
  photoBooth: { href: '/insights/ai-photo-booth-rental', ko: 'AI 포토부스 대여 — 가격·진행 안내', en: 'AI photo booth rental — pricing & process' },
  custom: { href: '/development', ko: '맞춤 AI 콘텐츠 개발 의뢰 안내', en: 'Custom AI content development' },
};
const isServiceKey = (k: string): k is ServiceKey => k in SERVICE_TEXT;

// 관리자 페이지에서 수정한 내용이 5분 안에 반영되도록 ISR 적용
export const revalidate = 300;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  date: string | null;
  category: 'online' | 'offline' | 'service' | 'ip';
  tags: string[];
  heroImage: string;
  images: string[];
  imageMetadata?: Record<string, PortfolioImageMetadata>;
  client: string;
  location: string;
  services: string[];
  result: string | null;
  story: { objective: string; execution: string; outcome: string } | null;
}

type CaseCopy = Partial<Pick<PortfolioItem,
  'objective_ko' | 'objective_en' | 'execution_ko' | 'execution_en' | 'outcome_ko' | 'outcome_en'>>;

// 목적 → 실행 → 결과. 관리자 화면(Firestore)에 입력한 값이 있으면 우선하고, 없으면 저장소 문구를 쓴다.
function caseStory(item: PortfolioItem, locale: string): CaseStudy['story'] {
  const fromCms: CaseCopy = item;
  const fromRepo: CaseCopy = (caseStudyCopy as Record<string, CaseCopy>)[item.slug] ?? {};
  const pick = (field: 'objective' | 'execution' | 'outcome') => {
    const ko = fromCms[`${field}_ko`] || fromRepo[`${field}_ko`] || '';
    const en = fromCms[`${field}_en`] || fromRepo[`${field}_en`] || '';
    return locale === 'ko' ? ko : en || ko;
  };
  const story = { objective: pick('objective'), execution: pick('execution'), outcome: pick('outcome') };
  return story.objective && story.execution && story.outcome ? story : null;
}

// The shared loader supplies the reviewed catalog and published CMS updates.
async function getCaseStudies(locale: string): Promise<CaseStudy[]> {
  const items = await fetchPublishedPortfolio();
  return (items ?? []).map((item) => {
    const result = locale === 'ko' ? item.result_ko : item.result_en;
    return {
      slug: item.slug,
      title: locale === 'ko' ? item.title_ko : item.title_en || item.title_ko,
      description: locale === 'ko' ? item.description_ko : item.description_en || item.description_ko,
      date: (locale === 'ko' ? item.period_ko : item.period_en) || item.period || (item.year ? String(item.year) : null),
      category: item.category,
      tags: (locale === 'ko' ? item.tags_ko : item.tags_en) ?? item.tags ?? [],
      heroImage: item.thumbnail || item.images?.[0] || '',
      images: item.images ?? [],
      imageMetadata: item.image_metadata,
      client: (locale === 'ko' ? item.client_ko : item.client_en) || item.client,
      location: (locale === 'ko' ? item.location_ko : item.location_en) || item.location || '',
      services: item.services ?? [],
      result: result || null,
      story: caseStory(item, locale),
    };
  });
}

export async function generateStaticParams() {
  const items = await fetchPublishedPortfolio();
  return (items ?? []).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const study = (await getCaseStudies(locale)).find((s) => s.slug === slug);
  if (!study) return {};

  return {
    alternates: localeAlternates(`/portfolio/${slug}`, locale),
    title: study.title,
    description: study.description,
    openGraph: {
      title: study.title,
      description: study.description,
      images: study.heroImage ? [study.heroImage] : [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PortfolioCaseStudyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const studies = await getCaseStudies(locale);
  const currentIndex = studies.findIndex((s) => s.slug === slug);

  if (currentIndex === -1) {
    notFound();
  }

  const project = studies[currentIndex];
  const story = project.story;
  const t = await getTranslations({ locale, namespace: 'portfolio' });
  const tServices = await getTranslations({ locale, namespace: 'services' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // 이 사례에 쓴 서비스 (견적 카탈로그에 있는 것만)
  const lang = locale === 'en' ? 'en' : 'ko';
  const usedForQuote = project.services.filter(isServiceKey);
  const firstQuoteKey = usedForQuote[0];
  // 축제·페스타·영화제 사례에서는 축제 체험 부스 안내로도 잇는다 (축제부스·체험부스 검색어용 랜딩)
  const isFestival = project.category === 'offline' && /축제|페스타|페스티벌|영화제|festival|festa/i.test(`${project.title} ${project.tags.join(' ')}`);

  // Find next project for navigation
  const nextProject =
    studies.length > 1 ? studies[(currentIndex + 1) % studies.length] : null;

  // Map service IDs to their translated names
  const usedServices = project.services
    .map((sKey) => {
      const svc = services.find((s) => s.key === sKey);
      // 서비스 key는 photoBooth인데 번역 키는 photobooth라서 소문자 키도 함께 찾는다.
      const msgKey = [sKey, sKey.toLowerCase()].find((k) => tServices.has(`items.${k}.shortTitle`));
      if (!svc || !msgKey) return null;
      return {
        key: sKey,
        name: tServices(`items.${msgKey}.shortTitle`),
        icon: svc.icon,
      };
    })
    .filter(Boolean);

  const nextImage = nextProject?.heroImage;
  const meta = [
    // 대행사를 거친 행사는 클라이언트 칸이 비어 온다 (src/lib/portfolio-catalog.ts) — 그때는 칸을 뺀다
    ...(project.client ? [{ label: t('detail.client'), value: project.client }] : []),
    ...(project.date ? [{ label: t('detail.date'), value: project.date }] : []),
    ...(project.location ? [{ label: t('detail.location'), value: project.location }] : []),
    ...(usedServices.length ? [{ label: t('detail.services'), value: usedServices.map((svc) => svc?.name).filter(Boolean).join(' · ') }] : []),
  ];

  return (
    <>
      {/* ── 첫 화면: 대표 사진 + 제목 + 프로젝트 정보 ── */}
      <section className="under-header relative isolate flex min-h-[min(54rem,100svh)] flex-col justify-end overflow-hidden bg-ink" aria-labelledby="case-study-title">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {project.heroImage && <Image src={project.heroImage} alt="" fill priority sizes="100vw" className="zoom-settle object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/35 to-ink" />
        </div>

        <div className="wrap pb-10 pt-36 lg:pt-44">
          <nav aria-label="Breadcrumb" className="t-label fade-in mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-paper/55">
            <Link href="/portfolio" className="transition-colors hover:text-paper">PORTFOLIO</Link>
            <span aria-hidden="true">/</span>
            <span className="text-accent">{t(`filterCategories.${project.category}`)}</span>
          </nav>
          <h1 id="case-study-title" className="rise t-kr-title max-w-5xl text-[clamp(2rem,4.8vw,4.4rem)] !leading-[1.2] text-paper">
            {project.title}
          </h1>
          {project.tags.length > 0 && (
            <ul className="rise mt-7 flex flex-wrap gap-2" style={{ '--i': 2 } as React.CSSProperties}>
              {project.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-paper/30 px-3.5 py-1.5 text-[13px] text-paper/85">{tag}</li>
              ))}
            </ul>
          )}
        </div>

        <dl className="fade-in grid border-t border-paper/20 sm:grid-cols-2 lg:grid-cols-4" style={{ '--i': 5 } as React.CSSProperties}>
          {meta.map((m) => (
            <div key={m.label} className="border-b border-paper/15 px-[clamp(1.25rem,3vw,3.25rem)] py-5 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0">
              <dt className="t-label !text-[0.64rem] text-paper/50">{m.label}</dt>
              <dd className="mt-2 text-[1.02rem] font-semibold leading-snug tracking-[-0.02em] text-paper">{m.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── 소개 · 목적 → 실행 → 결과 ───────────────────── */}
      <section className="bg-ink">
        <div className="wrap section-y">
          <Reveal>
            <p className="max-w-5xl whitespace-pre-line text-[clamp(1.25rem,2.3vw,2.1rem)] font-semibold leading-[1.55] tracking-[-0.03em] text-paper">
              {project.description}
            </p>
          </Reveal>

          {story ? (
            <ol className="mt-14 grid gap-px border border-paper/15 bg-paper/15 md:grid-cols-3 lg:mt-20">
              {(['objective', 'execution', 'outcome'] as const).map((step, i) => (
                <Reveal as="li" key={step} delay={i * 90} className={step === 'outcome' ? 'bg-paper p-7 text-ink lg:p-9' : 'bg-ink p-7 lg:p-9'}>
                  <h2 className={step === 'outcome' ? 't-label flex items-center gap-3 text-ink/60' : 't-label flex items-center gap-3 text-paper/55'}>
                    <span className={step === 'outcome' ? 'text-ink' : 'text-accent'}>{String(i + 1).padStart(2, '0')}</span>
                    {t(`detail.${step}`)}
                  </h2>
                  <p className={step === 'outcome' ? 'mt-5 text-[1.05rem] font-semibold leading-[1.75] tracking-[-0.01em]' : 'mt-5 text-[1.02rem] leading-[1.75] text-paper/75'}>{story[step]}</p>
                </Reveal>
              ))}
            </ol>
          ) : project.result && (
            <Reveal delay={120} className="mt-14 bg-paper p-7 text-ink lg:mt-20 lg:p-10">
              <h2 className="t-label text-ink/55">{t('detail.result')}</h2>
              <p className="mt-4 text-[clamp(1.25rem,2.2vw,2rem)] font-bold leading-snug tracking-[-0.03em]">{project.result}</p>
            </Reveal>
          )}

          {/* 사진 */}
          <div className="rd-gallery">
            <PortfolioGallery
              images={project.images}
              metadata={project.imageMetadata}
              title={project.title}
              locale={locale}
              heading={t('detail.gallery')}
            />
          </div>
        </div>
      </section>

      {/* ── 이 프로젝트에 쓴 서비스 → 안내 · 견적 ─────────
          포트폴리오 상세는 끝까지 읽는 비율이 가장 높은데(스크롤 중앙값 87%) 절반이 그대로 나간다.
          그래서 읽고 난 자리에 같은 구성의 견적으로 가는 길을 크게 둔다. */}
      {usedForQuote.length > 0 && (
        <section aria-labelledby="used-services-title" className="border-t border-paper/10 bg-ink">
          <div className="wrap section-y">
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
              <div>
                <Reveal><p className="t-label text-paper/55"><span className="mr-4 text-accent">→</span>SERVICES USED</p></Reveal>
                <Title id="used-services-title" en={['SAME SETUP,', 'YOUR EVENT.']} ko={lang === 'ko' ? '이 프로젝트에 쓴 서비스' : undefined} className="mt-6" />
              </div>
              <Reveal delay={120} className="max-w-md text-[1.05rem] leading-relaxed text-paper/60 lg:text-right">
                {lang === 'ko' ? '비슷한 행사를 준비 중이라면 같은 구성으로 금액을 바로 확인해 보세요.' : 'Planning something similar? Check the price for the same setup right away.'}
              </Reveal>
            </div>
            <ul className="mt-12 border-t border-paper/15">
              {usedForQuote.map((key, i) => {
                const guide = SERVICE_GUIDE[key];
                return (
                  <Reveal as="li" key={key} delay={i * 70} className="grid items-center gap-x-10 gap-y-4 border-b border-paper/15 py-7 lg:grid-cols-[minmax(0,18rem)_1fr_auto]">
                    <h3 className="text-[1.4rem] font-bold tracking-[-0.03em] text-paper">{SERVICE_TEXT[key].name[lang]}</h3>
                    <p className="text-[0.95rem] leading-relaxed text-paper/60">{SERVICE_TEXT[key].summary[lang]}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <Link href={{ pathname: '/quote', query: { item: key } }} className="inline-flex min-h-11 items-center gap-2.5 bg-paper px-5 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-accent">
                        {lang === 'ko' ? '이 구성으로 견적 내기' : 'Get a quote for this'} <span aria-hidden="true" className="font-display">→</span>
                      </Link>
                      {guide && (
                        <Link href={guide.href} className="text-sm font-medium text-paper/70 underline decoration-paper/30 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper">{guide[lang]}</Link>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </ul>
            {isFestival && (
              <p className="mt-7 text-[0.95rem] text-paper/60">
                {lang === 'ko' ? '축제에 체험 부스를 준비 중이라면 ' : 'Planning booths for a festival? '}
                <Link href="/insights/festival-experience-booth" className="font-semibold text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-accent">
                  {lang === 'ko' ? '축제 체험 부스 — 구성·비용 안내 →' : 'Festival experience booths — setup and costs →'}
                </Link>
              </p>
            )}
            <div className="mt-10 flex flex-wrap gap-3" data-cta-area="portfolio_detail">
              <Btn href={firstQuoteKey ? { pathname: '/quote', query: { item: firstQuoteKey } } : '/quote'} variant="fill" arrow>{lang === 'ko' ? '온라인 견적으로 금액 보기' : 'See the price online'}</Btn>
              <Btn href="/contact">{t('detail.ctaTitle')}</Btn>
            </div>
          </div>
        </section>
      )}

      {/* ── 다음 프로젝트 ──────────────────────────────── */}
      <section className="border-t border-paper/10 bg-ink">
        {nextProject && (
          <Link href={`/portfolio/${nextProject.slug}`} data-cursor="NEXT" className="group relative isolate block overflow-hidden">
            {nextImage && (
              <div className="absolute inset-0 -z-10" aria-hidden="true">
                <Image src={nextImage} alt="" fill sizes="100vw" loading="lazy" className="object-cover opacity-25 transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:opacity-55" />
                <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/30" />
              </div>
            )}
            <div className="wrap flex flex-wrap items-end justify-between gap-8 py-[clamp(3.5rem,8vw,7rem)]">
              <div>
                <p className="t-label text-paper/55">NEXT PROJECT{lang === 'ko' && <span className="ml-3 font-body text-[11px] font-medium normal-case tracking-normal text-paper/40">{tCommon('next')}</span>}</p>
                <p className="t-kr-title mt-5 max-w-4xl text-[clamp(1.6rem,3.6vw,3.2rem)] text-paper transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3">{nextProject.title}</p>
              </div>
              <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full border border-paper/40 font-display text-2xl text-paper transition-colors duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink lg:h-28 lg:w-28">→</span>
            </div>
          </Link>
        )}
        <div className="wrap border-t border-paper/10 py-6">
          <Link href="/portfolio" className="t-label inline-flex items-center gap-3 text-paper/60 transition-colors hover:text-paper">
            <span aria-hidden="true">←</span> {t('detail.backToList')}
          </Link>
        </div>
      </section>
    </>
  );
}
