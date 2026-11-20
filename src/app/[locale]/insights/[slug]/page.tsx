import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { INSIGHTS, getInsight, type InsightBlock, type InsightImage } from '@/data/insights';
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
      images: item.cover ? [{ url: item.cover.src, alt: item.cover.caption[locale === 'en' ? 'en' : 'ko'] }] : [DEFAULT_OG_IMAGE],
    },
  };
}

/** 제목은 「 — 」 앞뒤로 나눠 두 줄로 보여 준다 (검색·공유용 제목 문자열은 그대로) */
function splitTitle(title: string): [string, string | null] {
  const i = title.indexOf(' — ');
  return i < 0 ? [title, null] : [title.slice(0, i), title.slice(i + 3)];
}

function Photo({ image, ratio, sizes, priority }: { image: InsightImage; ratio: string; sizes: string; priority?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-100 ${ratio}`}>
      <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
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
    case 'figure':
      return (
        <figure className="mt-8">
          <Photo image={block.image} ratio="aspect-[16/9]" sizes="(min-width: 768px) 768px, 100vw" />
          {block.image.caption && <figcaption className="mt-2 text-sm text-slate-500">{block.image.caption}</figcaption>}
        </figure>
      );
    case 'gallery':
      return (
        <div className={`mt-6 grid gap-3 ${block.cols === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {block.images.map((image) => (
            <figure key={image.src}>
              <Photo image={image} ratio="aspect-[4/3]" sizes={block.cols === 2 ? '(min-width: 768px) 380px, 50vw' : '(min-width: 768px) 250px, 50vw'} />
              {image.caption && <figcaption className="mt-1.5 text-xs leading-snug text-slate-500">{image.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );
    case 'steps':
      return (
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {block.items.map((step, i) => (
            <li key={step.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {step.image && (
                <div className="relative aspect-[16/10] bg-slate-100">
                  <Image src={step.image.src} alt={step.image.alt} fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{i + 1}</span>
                  <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'stats':
      return (
        <dl className={`mt-6 grid gap-3 ${block.items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {block.items.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-teal-100 bg-teal-50/60 px-4 py-4">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-xl font-extrabold tracking-tight text-teal-700 sm:text-2xl">{stat.value}</dd>
              <dd className="mt-1 text-xs leading-snug text-slate-600 sm:text-sm">{stat.label}</dd>
            </div>
          ))}
        </dl>
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
  const [titleMain, titleSub] = splitTitle(copy.title);
  const cover = item.cover;
  const url = `${SITE_URL}${localePath(`/insights/${slug}`, locale)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: copy.title,
    description: copy.description,
    datePublished: item.date,
    ...(cover ? { image: `${SITE_URL}${cover.src}` } : {}),
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
          <div className={cover ? 'mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]' : 'mx-auto max-w-3xl'}>
            <div>
              <Link href="/insights" className="text-sm text-slate-400 hover:text-white">
                ← {lang === 'ko' ? '인사이트' : 'Insights'}
              </Link>
              <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                <span className="block">{titleMain}</span>
                {titleSub && <span className="mt-3 block text-lg font-bold leading-snug text-teal-300 sm:text-2xl" style={{ fontFamily: 'var(--font-body)' }}>{titleSub}</span>}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-neutral-400">{copy.description}</p>
              <p className="mt-6 text-xs text-slate-500">
                <time dateTime={item.date}>{item.date}</time> · NEANDER
              </p>
            </div>
            {cover && (
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-800 ring-1 ring-white/10">
                  <Image src={cover.src} alt={cover.caption[lang]} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
                </div>
                <figcaption className="mt-2 text-xs text-slate-500">{cover.caption[lang]}</figcaption>
              </figure>
            )}
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
