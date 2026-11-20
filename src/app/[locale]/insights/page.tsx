import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { INSIGHTS } from '@/data/insights';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

const COPY = {
  ko: {
    title: '인사이트',
    subtitle: '행사·팝업에 AI 체험을 들이기 전에 알아 두면 좋은 비용, 운영, 인허가 이야기를 정리합니다.',
    article: '가이드',
    landing: '서비스 안내',
    read: '읽기',
    guides: '행사별 비용·진행 안내는 체험서비스 소개로 옮겼습니다',
    guidesLink: '행사별 안내 보기 →',
  },
  en: {
    title: 'Insights',
    subtitle: 'Costs, operations and licensing to know before bringing AI experiences to your event or pop-up.',
    article: 'Guide',
    landing: 'Service',
    read: 'Read',
    guides: 'Guides by use (prices and process) are now under Services',
    guidesLink: 'See the guides →',
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
      <section className="bg-slate-950 pb-16 pt-32 sm:pb-20 sm:pt-40">
        <div className="container-wide">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{c.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-400">{c.subtitle}</p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-wide">
          <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
            {items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/insights/${item.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 p-6 transition-colors hover:border-teal-300 hover:bg-teal-50/40"
                >
                  <span className="text-xs font-semibold text-teal-700">
                    {item.kind === 'article' ? c.article : c.landing}
                  </span>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900">{item[lang].title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item[lang].description}</p>
                  <span className="mt-4 text-sm font-semibold text-teal-700 group-hover:underline">{c.read} →</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/services#guides"
            className="mx-auto mt-8 flex max-w-5xl flex-col gap-1 rounded-2xl border border-teal-200 bg-teal-50/60 p-6 transition-colors hover:border-teal-400 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm text-slate-700">{c.guides}</span>
            <span className="text-sm font-semibold text-teal-700">{c.guidesLink}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
