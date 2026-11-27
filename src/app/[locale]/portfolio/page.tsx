import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { Reveal } from '@/components/fx';
import { PageHero } from '@/components/site/PageHero';
import { Title } from '@/components/site/Title';
import { ArrowLink, Btn } from '@/components/site/ui';
import { DocumentDownloads, DOWNLOAD_HREF } from '@/components/brochure/DocumentDownloads';
import { COMPANY_PROFILE, PORTFOLIO_FULL } from '@/data/portfolio-downloads';
import { DEVELOPMENT_PROJECTS } from '@/data/development-projects';
import { QUOTE_HREF } from '@/lib/constants';
import { publishedPortfolio } from '@/lib/portfolio-catalog';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portfolio' });

  return {
    alternates: localeAlternates('/portfolio', locale),
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'portfolio' });
  const ko = locale !== 'en';
  // 목록과 같은 기준: 공개된 사례 + 프로그램 개발 프로젝트
  const total = publishedPortfolio().length + DEVELOPMENT_PROJECTS.length;

  return (
    <>
      <PageHero
        id="portfolio-hero-title"
        label={`OUR WORK · ${total} PROJECTS`}
        en={['PORTFOLIO']}
        ko={ko ? t('title') : undefined}
        lead={ko ? '축제와 전시, 브랜드 현장에서 직접 운영한 AI 체험과 향 프로젝트' : 'AI experiences and scent projects we ran ourselves at festivals, exhibitions and brand events'}
        image="/images/portfolio/archive/pyeongtaek-ai-festa-2026-06.webp"
        imageAlt={ko ? '평택 AI 페스타 2026 AI 체험 부스 현장' : 'AI experience booth at Pyeongtaek AI Festa 2026'}
        caption={ko ? '운영 사례 · 평택 AI 페스타 2026' : 'Pyeongtaek AI Festa 2026'}
        align="center"
        titleClassName="[&_[data-lines]]:!text-[clamp(1.6rem,8.4vw,8.25rem)] [&_[data-lines]]:tracking-[0.02em]"
      />

      {/* PDF 안내 띠 — 맨 아래 자료 받기 칸(#download)으로 내려간다 (예전 /brochure 를 이 화면으로 합침, 2026-11-26) */}
      <div className="border-b border-paper/10 bg-ink">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-5">
          <p className="text-[0.98rem] text-paper/70">
            <span className="t-label mr-3 text-accent">PDF</span>
            {ko
              ? `체험서비스 포트폴리오(${PORTFOLIO_FULL.pages}쪽)와 회사소개서(${COMPANY_PROFILE.pages}쪽)를 PDF로 받아 보세요.`
              : `Get the Experience Portfolio (${PORTFOLIO_FULL.pages}p) and company profile (${COMPANY_PROFILE.pages}p) as PDFs.`}
          </p>
          <ArrowLink href={DOWNLOAD_HREF}>{ko ? '자료 받기' : 'DOWNLOAD'}</ArrowLink>
        </div>
      </div>

      <section className="bg-ink" aria-labelledby="portfolio-grid-title">
        <h2 id="portfolio-grid-title" className="sr-only">{t('title')}</h2>
        <PortfolioGrid />
      </section>

      <DocumentDownloads lang={ko ? 'ko' : 'en'} />

      {/* 마무리 — 이 페이지에서는 바닥글의 공통 문의 구역 대신 이 띠를 쓴다 (Footer 의 NO_CTA_EXACT) */}
      <section className="border-t border-paper/15 bg-ink" aria-labelledby="portfolio-next-title">
        <div className="wrap grid items-center gap-x-16 gap-y-10 py-[clamp(4rem,7vw,5.5rem)] lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <Title id="portfolio-next-title" en={['YOUR EVENT,', 'NEXT.']} ko={ko ? '다음은 우리 행사 차례' : undefined} size="h2" />
            <Reveal delay={120}>
              <p className="mt-5 text-[clamp(1rem,1.3vw,1.125rem)] text-paper/60">
                {ko ? '비슷한 행사를 준비 중이라면 사례를 보며 함께 이야기해요.' : 'Planning something similar? Let’s talk it through with these cases in hand.'}
              </p>
            </Reveal>
          </div>
          <Reveal delay={180}>
            <div className="flex flex-wrap gap-3.5" data-cta-area="portfolio_list">
              <Btn href={QUOTE_HREF} variant="fill">{ko ? '온라인 견적 받기' : 'Get an online estimate'}</Btn>
              <Btn href="/contact">{ko ? '프로젝트 문의' : 'Start a project'}</Btn>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
