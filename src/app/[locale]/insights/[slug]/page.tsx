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
import { HoverPreviewList, HoverPreviewRow, Reveal } from '@/components/fx';
import { Toc } from '@/components/insights/Toc';
import { Faq } from '@/components/site/Faq';
import { Btn, PhotoTag } from '@/components/site/ui';

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

function Photo({ image, ratio, sizes }: { image: InsightImage; ratio: string; sizes: string }) {
  return (
    <Reveal variant="clip">
      <div className={`relative overflow-hidden bg-ink-2 ${ratio}`}>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className="rd-zoom object-cover" />
      </div>
    </Reveal>
  );
}

/* 본문 블록 — 글 내용(src/data/insights*.ts)은 그대로 두고 모양만 2026-11 디자인으로 그린다 */
function Block({ block, lang, headingId }: { block: InsightBlock; lang: 'ko' | 'en'; headingId?: string }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 id={headingId} className="t-kr-title mt-[clamp(3.5rem,7vw,5.5rem)] scroll-mt-28 border-t border-paper/15 pt-8 text-[clamp(1.45rem,2.4vw,2.1rem)] text-paper first:mt-0 first:border-t-0 first:pt-0">
          {block.text}
        </h2>
      );
    case 'p':
      return <p className="mt-5 text-[1.05rem] leading-[1.9] text-paper/75">{block.text}</p>;
    case 'ul':
      return (
        <ul className="mt-5 space-y-2.5 text-[1.02rem] leading-relaxed text-paper/75">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3.5"><span aria-hidden="true" className="mt-[0.72em] h-px w-3 shrink-0 bg-accent" />{item}</li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <Reveal className="mt-7 overflow-x-auto border-y border-paper/20">
          <table className="w-full min-w-[440px] text-left text-[0.95rem]">
            <thead>
              <tr>{block.head.map((h) => <th key={h} className="t-label px-4 py-3.5 !text-[0.66rem] font-semibold text-paper/50 first:pl-0">{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join('|')} className="border-t border-paper/12 transition-colors duration-300 hover:bg-paper/[0.04]">
                  {row.map((cell, i) => (
                    <td key={i} className={i === 0 ? 'px-4 py-3.5 font-semibold text-paper first:pl-0' : 'px-4 py-3.5 text-paper/70'}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      );
    case 'links':
      return (
        <ul className="mt-6 border-t border-paper/15">
          {block.items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group flex items-baseline justify-between gap-6 border-b border-paper/15 py-4 text-[1.02rem] font-medium text-paper/85 transition-colors duration-300 hover:border-paper/60 hover:text-paper">
                <span className="transition-transform duration-500 group-hover:translate-x-1.5">{item.text}</span>
                <span aria-hidden="true" className="font-display text-paper/40 transition-colors group-hover:text-accent">→</span>
              </Link>
            </li>
          ))}
        </ul>
      );
    case 'faq':
      return (
        <section className="mt-[clamp(3.5rem,7vw,5.5rem)] border-t border-paper/15 pt-8">
          <h2 id={headingId} className="t-kr-title scroll-mt-28 text-[clamp(1.45rem,2.4vw,2.1rem)] text-paper">{lang === 'en' ? 'FAQ' : '자주 묻는 질문'}</h2>
          <Faq items={block.items} className="mt-6" />
        </section>
      );
    case 'figure':
      return (
        <figure className="mt-9">
          <Photo image={block.image} ratio="aspect-[16/9]" sizes="(min-width: 1024px) 760px, 100vw" />
          {block.image.caption && <figcaption className="mt-2.5 text-[13px] text-paper/50">{block.image.caption}</figcaption>}
        </figure>
      );
    case 'gallery':
      return (
        <div className={`mt-7 grid gap-3 ${block.cols === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {block.images.map((image) => (
            <figure key={image.src}>
              <Photo image={image} ratio="aspect-[4/3]" sizes={block.cols === 2 ? '(min-width: 1024px) 380px, 50vw' : '(min-width: 1024px) 250px, 50vw'} />
              {image.caption && <figcaption className="mt-2 text-xs leading-snug text-paper/50">{image.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );
    case 'steps':
      return (
        <ol className="mt-7 grid gap-4 sm:grid-cols-2">
          {block.items.map((step, i) => (
            <Reveal as="li" key={step.title} delay={(i % 2) * 80} className="group overflow-hidden border border-paper/15 transition-colors duration-500 hover:border-paper/45">
              {step.image && (
                <div className="relative aspect-[16/10] overflow-hidden bg-ink-2">
                  <Image src={step.image.src} alt={step.image.alt} fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-baseline gap-3">
                  <span className="t-label text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="t-kr-title text-[1.1rem] text-paper">{step.title}</h3>
                </div>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-paper/60">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      );
    case 'stats':
      return (
        <dl className={`mt-8 grid border-y border-paper/20 ${block.items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {block.items.map((stat) => (
            <div key={stat.label} className="border-paper/12 px-4 py-6 first:pl-0 [&:not(:first-child)]:border-l max-sm:[&:nth-child(odd)]:border-l-0 max-sm:[&:nth-child(odd)]:pl-0 max-sm:[&:nth-child(n+3)]:border-t">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-[clamp(1.5rem,3vw,2.4rem)] font-extrabold leading-none tracking-[-0.03em] text-paper">{stat.value}</dd>
              <dd className="mt-2.5 text-xs leading-snug text-paper/55 sm:text-[13px]">{stat.label}</dd>
            </div>
          ))}
        </dl>
      );
    case 'cta':
      return (
        <div className="mt-9">
          <Btn href={block.href} variant="fill" arrow>{block.text}</Btn>
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
  // 서비스 안내(landing)는 체험서비스 소개 아래에 있는 것으로 보여 준다 — 주소는 /insights 그대로
  const isGuide = item.kind === 'landing';
  const parent = isGuide
    ? { href: '/services', label: lang === 'ko' ? '체험서비스 소개' : 'Services' }
    : { href: '/insights', label: lang === 'ko' ? '인사이트' : 'Insights' };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: parent.label, item: `${SITE_URL}${localePath(parent.href, locale)}` },
      { '@type': 'ListItem', position: 2, name: copy.title, item: url },
    ],
  };

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

  // 목차: 본문의 소제목(h2)과 자주 묻는 질문
  const headingIds = copy.blocks.map((block, i) => (block.type === 'h2' || block.type === 'faq' ? `sec-${i}` : undefined));
  const toc = copy.blocks.flatMap((block, i) =>
    block.type === 'h2' ? [{ id: `sec-${i}`, text: block.text }] : block.type === 'faq' ? [{ id: `sec-${i}`, text: lang === 'en' ? 'FAQ' : '자주 묻는 질문' }] : [],
  );
  // 글 안의 첫 버튼(견적 · 문의)을 첫 화면에도 올린다 — 검색으로 들어온 사람의 30%가 이 한 페이지만 보고 나간다 (2026-11 방문 기록)
  const firstCta = copy.blocks.find((block) => block.type === 'cta');

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <JsonLd data={breadcrumbJsonLd} />

      <header className={`under-header relative isolate flex flex-col justify-end overflow-hidden bg-ink ${cover ? 'min-h-[min(48rem,92svh)]' : 'min-h-[min(34rem,70svh)]'}`}>
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {cover ? (
            <>
              <Image src={cover.src} alt={cover.caption[lang] || copy.title} fill priority sizes="100vw" className="zoom-settle object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-ink" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/20 to-transparent max-lg:hidden" />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 90% at 88% 0%, rgba(125,149,255,0.2), transparent 62%)' }} />
          )}
        </div>
        {cover && <PhotoTag className="absolute right-4 top-24 max-w-[70vw] lg:right-8 lg:top-28">{cover.caption[lang]}</PhotoTag>}

        <div className="wrap pb-[clamp(2.5rem,6vw,5rem)] pt-36 lg:pt-44">
          <nav aria-label="Breadcrumb" className="t-label fade-in flex flex-wrap items-center gap-x-3 gap-y-1 text-paper/55">
            <Link href={parent.href} className="transition-colors hover:text-paper">{isGuide ? 'SERVICES' : 'INSIGHTS'}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-accent">{isGuide ? 'EVENT GUIDE' : 'GUIDE'}</span>
            <span className="sr-only">{parent.label}</span>
          </nav>
          <h1 className="mt-7 max-w-5xl text-paper">
            <span className="rise t-kr-title block text-[clamp(2rem,5vw,4.4rem)] !leading-[1.18]">{titleMain}</span>
            {titleSub && <span className="rise mt-4 block text-[clamp(1.1rem,2vw,1.75rem)] font-bold leading-snug tracking-[-0.025em] text-paper/75" style={{ '--i': 2 } as React.CSSProperties}>{titleSub}</span>}
          </h1>
          <p className="rise mt-6 max-w-2xl text-[clamp(1rem,1.2vw,1.15rem)] leading-relaxed text-paper/65" style={{ '--i': 3 } as React.CSSProperties}>{copy.description}</p>
          <div className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" data-cta-area="guide_hero" style={{ '--i': 4 } as React.CSSProperties}>
            {firstCta && firstCta.type === 'cta' && <Btn href={firstCta.href} variant="fill" arrow>{firstCta.text}</Btn>}
            {isGuide && <Btn href="/contact">{lang === 'ko' ? '문의하기' : 'Contact us'}</Btn>}
            <p className="t-label !text-[0.64rem] text-paper/45"><time dateTime={item.date}>{item.date}</time> · NEANDER</p>
          </div>
        </div>
      </header>

      <div className="bg-ink">
        <div className="wrap grid gap-x-[clamp(2.5rem,6vw,7rem)] pb-[clamp(4.5rem,10vw,9rem)] pt-[clamp(3rem,6vw,5rem)] lg:grid-cols-[15rem_minmax(0,48rem)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <Toc items={toc} label={lang === 'ko' ? '목차' : 'ON THIS PAGE'} />
            </div>
          </aside>
          <div className="min-w-0">
            {copy.blocks.map((block, i) => <Block key={i} block={block} lang={lang} headingId={headingIds[i]} />)}
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <aside className="border-t border-paper/10 bg-ink">
          <div className="wrap section-y">
            <p className="t-label flex items-center gap-4 text-paper/55">
              <span className="text-accent">→</span>
              {isGuide ? (lang === 'ko' ? '다른 행사별 안내' : 'MORE GUIDES') : lang === 'ko' ? '함께 보면 좋은 글' : 'MORE TO READ'}
            </p>
            <HoverPreviewList className="mt-8">
              <ul className="border-t border-paper/15">
                {others.map((other, i) => {
                  const [main, sub] = splitTitle(other[lang].title);
                  return (
                    <li key={other.slug}>
                      <HoverPreviewRow image={other.cover?.src}>
                        <Link href={`/insights/${other.slug}`} className="group grid items-baseline gap-x-8 gap-y-1 border-b border-paper/15 py-6 transition-colors duration-500 hover:border-paper/60 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.1fr)_2rem]">
                          <span className="t-label text-paper/40">{String(i + 1).padStart(2, '0')}</span>
                          <span className="t-kr-title text-[clamp(1.1rem,1.8vw,1.55rem)] text-paper transition-transform duration-500 group-hover:translate-x-2">{main}</span>
                          <span className="text-[0.95rem] text-paper/50">{sub}</span>
                          <span aria-hidden="true" className="hidden justify-self-end font-display text-paper/40 transition-colors group-hover:text-accent md:block">→</span>
                        </Link>
                      </HoverPreviewRow>
                    </li>
                  );
                })}
              </ul>
            </HoverPreviewList>
          </div>
        </aside>
      )}
    </article>
  );
}
