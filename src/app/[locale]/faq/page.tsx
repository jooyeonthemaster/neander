import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { Faq } from '@/components/site/Faq';
import { PageHero } from '@/components/site/PageHero';

interface Props {
  params: Promise<{ locale: string }>;
}

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  return {
    alternates: localeAlternates('/faq', locale),
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'faq' });

  const items = QUESTION_KEYS.map((key) => ({
    q: t(`items.${key}.question`),
    a: t(`items.${key}.answer`),
    // 결과보고서 질문에는 가상 행사로 만든 샘플 보고서 첫 장을 붙인다
    media:
      key === 'q6' ? (
        <figure className="max-w-sm">
          <Image
            src="/images/faq/result-report-sample-p1.webp"
            alt={t('items.q6.imageAlt')}
            width={1000}
            height={1414}
            sizes="(max-width: 640px) 100vw, 384px"
            className="w-full border border-paper/15"
          />
          <figcaption className="mt-2.5 text-xs leading-relaxed text-paper/50">
            {t('items.q6.imageCaption')}
          </figcaption>
        </figure>
      ) : undefined,
  }));

  return (
    <div>
      {/* 검색엔진·AI 답변용 질문·답 구조화 데이터 */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />
      {/* Hero */}
      <PageHero
        id="faq-title"
        label="FAQ"
        en={['QUESTIONS.']}
        ko={t('title')}
        lead={t('subtitle')}
        size="h1"
      />

      {/* Questions — 답이 없을 때 나갈 길(문의 · 견적)은 바닥글의 문의 구역이 맡는다 */}
      <section className="bg-ink pb-[clamp(4rem,9vw,8rem)] pt-4">
        <div className="wrap">
          <Faq items={items} defaultOpen={null} className="max-w-5xl" />
        </div>
      </section>
    </div>
  );
}
