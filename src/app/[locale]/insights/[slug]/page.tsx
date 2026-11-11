import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { INSIGHTS, getInsight, type InsightBlock } from '@/data/insights';
import { SITE_URL } from '@/lib/constants';
import { DEFAULT_OG_IMAGE, localeAlternates, localePath } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => INSIGHTS.map((item) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getInsight(slug);
  if (!item) return {};
  const copy = item[locale === 'en' ? 'en' : 'ko'];
  return {
    alternates: localeAlternates(`/insights/${slug}`, locale),
    title: copy.title,
    description: copy.description,
    keywords: item.keywords,
    openGraph: {
      type: 'article',
      title: copy.title,
      description: copy.description,
      publishedTime: item.date,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

function Block({ block, lang }: { block: InsightBlock; lang: 'ko' | 'en' }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="mt-12 text-xl font-bold text-slate-900 sm:text-2xl">{block.text}</h2>;
    case 'p':
      return <p className="mt-4 text-base leading-[1.85] text-slate-700">{block.text}</p>;
    case 'ul':
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-slate-700">
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      );
    case 'table':
      return (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>{block.head.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {block.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell, i) => (
                    <td key={i} className={i === 0 ? 'px-4 py-3 font-medium text-slate-900' : 'px-4 py-3'}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'links':
      return (
        <ul className="mt-4 space-y-2 text-base leading-relaxed">
          {block.items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="font-medium text-teal-700 underline-offset-4 hover:underline">
                {item.text} →
              </Link>
            </li>
          ))}
        </ul>
      );
    case 'faq':
      return (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{lang === 'en' ? 'FAQ' : '자주 묻는 질문'}</h2>
          <dl className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
            {block.items.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="text-base font-semibold text-slate-900">{item.q}</dt>
                <dd className="mt-2 text-base leading-relaxed text-slate-700">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    case 'cta':
      return (
        <div className="mt-8">
          <Link
            href={block.href}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
          >
            {block.text}
          </Link>
        </div>
      );
  }
}

export default async function InsightPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = getInsight(slug);
  if (!item) notFound();
  const lang = locale === 'en' ? 'en' : 'ko';
  const copy = item[lang];
  const url = `${SITE_URL}${localePath(`/insights/${slug}`, locale)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: copy.title,
    description: copy.description,
    datePublished: item.date,
    inLanguage: lang,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'NEANDER', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'NEANDER', logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` } },
  };

  // 질문·답 블록이 있으면 FAQPage 구조화 데이터도 함께 낸다
  const faqs = copy.blocks.flatMap((block) => (block.type === 'faq' ? block.items : []));
  const faqJsonLd = faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }
    : null;

  // 랜딩끼리 서로 이어지도록 같은 종류를 먼저 보여 준다
  const others = [...INSIGHTS.filter((o) => o.slug !== slug && o.kind === item.kind), ...INSIGHTS.filter((o) => o.slug !== slug && o.kind !== item.kind)].slice(0, 4);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <header className="bg-slate-950 pb-16 pt-32 sm:pb-20 sm:pt-40">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <Link href="/insights" className="text-sm text-slate-400 hover:text-white">
              ← {lang === 'ko' ? '인사이트' : 'Insights'}
            </Link>
            <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-400">{copy.description}</p>
            <p className="mt-6 text-xs text-slate-500">
              <time dateTime={item.date}>{item.date}</time> · NEANDER
            </p>
          </div>
        </div>
      </header>

      <div className="py-12 sm:py-20">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            {copy.blocks.map((block, i) => <Block key={i} block={block} lang={lang} />)}
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <aside className="border-t border-slate-200 bg-slate-50 py-12 sm:py-16">
          <div className="container-wide">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {lang === 'ko' ? '함께 보면 좋은 글' : 'More to read'}
              </h2>
              <ul className="mt-4 space-y-3">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link href={`/insights/${other.slug}`} className="text-base font-medium text-slate-800 hover:text-teal-700">
                      {other[lang].title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      )}
    </article>
  );
}
