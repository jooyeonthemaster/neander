import { getTranslations, setRequestLocale } from 'next-intl/server';
import { QuoteBuilder } from '@/components/quote/QuoteBuilder';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quote' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'quote' });

  return (
    <section className="min-h-screen bg-slate-50/50">
      {/* Hero strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-600 mb-3">
            {t('category')}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 leading-relaxed sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Builder area */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <QuoteBuilder />
      </div>
    </section>
  );
}
