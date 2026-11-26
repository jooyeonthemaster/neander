import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { INSIGHTS } from '@/data/insights';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';
import { PageHero } from '@/components/site/PageHero';
import { HoverPreviewList, HoverPreviewRow, Reveal } from '@/components/fx';

interface Props {
  params: Promise<{ locale: string }>;
}

const COPY = {
  ko: {
    title: '인사이트',
    subtitle: '행사·팝업에 AI 체험을 들이기 전에 알아 두면 좋은 비용, 운영, 인허가 이야기를 정리합니다.',
    guides: '행사별 비용·진행 안내는 체험서비스 소개로 옮겼습니다',
    guidesLink: '행사별 안내 보기',
  },
  en: {
    title: 'Insights',
    subtitle: 'Costs, operations and licensing to know before bringing AI experiences to your event or pop-up.',
    guides: 'Guides by use (prices and process) are now under Services',
    guidesLink: 'SEE THE GUIDES',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  return {
    alternates: localeAlternates('/insights', locale),
    title: c.title,
    description: c.subtitle,
    openGraph: { title: c.title, description: c.subtitle, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale === 'en' ? 'en' : 'ko';
  const c = COPY[lang];
  // 읽을거리(가이드 글)만 — 서비스 안내(키워드 랜딩)는 체험서비스 소개의 「행사별 안내」에서 보여 준다 (주소는 그대로)
  const items = INSIGHTS.filter((item) => item.kind === 'article');

  return (
    <div>
      <PageHero
        id="insights-title"
        label="INSIGHTS"
        en={['GOOD', 'TO KNOW.']}
        ko={c.title}
        lead={c.subtitle}
        size="h1"
      />

      <section className="bg-ink pb-[clamp(4rem,9vw,8rem)] pt-4">
        <div className="wrap">
          {/* 글 목록 — 줄에 마우스를 올리면 그 글의 사진이 커서를 따라 뜬다 */}
          <HoverPreviewList>
            <ul className="border-t border-paper/15">
              {items.map((item, i) => {
                const title = item[lang].title;
                const cut = title.indexOf(' — ');
                return (
                  <li key={item.slug}>
                    <HoverPreviewRow image={item.cover?.src}>
                      <Reveal delay={(i % 4) * 70}>
                        <Link
                          href={`/insights/${item.slug}`}
                          data-cursor="READ"
                          className="group grid gap-x-10 gap-y-3 border-b border-paper/15 py-8 transition-colors duration-500 hover:border-paper/60 md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)_2rem] md:items-baseline lg:py-10"
                        >
                          <span className="t-label text-accent">{String(i + 1).padStart(2, '0')}</span>
                          <h2 className="t-kr-title text-[clamp(1.25rem,2.1vw,1.85rem)] text-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                            {cut < 0 ? title : title.slice(0, cut)}
                            {cut >= 0 && <span className="mt-1.5 block text-[0.62em] font-medium text-paper/55">{title.slice(cut + 3)}</span>}
                          </h2>
                          <p className="text-[0.95rem] leading-relaxed text-paper/55">{item[lang].description}</p>
                          <span aria-hidden="true" className="hidden justify-self-end font-display text-paper/40 transition-[color,transform] duration-500 group-hover:translate-x-1 group-hover:text-accent md:block">→</span>
                        </Link>
                      </Reveal>
                    </HoverPreviewRow>
                  </li>
                );
              })}
            </ul>
          </HoverPreviewList>

          <Link
            href="/services#guides"
            className="group mt-12 flex flex-col gap-3 border border-paper/20 px-6 py-6 transition-colors duration-500 hover:border-paper/60 sm:flex-row sm:items-center sm:justify-between lg:px-8"
          >
            <span className="text-[0.95rem] text-paper/65">{c.guides}</span>
            <span className="t-label inline-flex items-center gap-2.5 text-paper">
              {c.guidesLink}
              <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
