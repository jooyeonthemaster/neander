import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Accordion } from '@/components/ui';
import { ScrollReveal } from '@/components/animations';
import { Link } from '@/i18n/navigation';
import { QUOTE_HREF } from '@/lib/constants';

interface Props {
  params: Promise<{ locale: string }>;
}

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
    },
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'faq' });
  const tContact = await getTranslations({ locale, namespace: 'contact' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const items = QUESTION_KEYS.map((key) => ({
    title: t(`items.${key}.question`),
    content: t(`items.${key}.answer`),
  }));

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-950 pb-20 pt-32 sm:pb-28 sm:pt-40">
        <div className="container-wide">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-400">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Questions */}
      <section className="py-20 sm:py-28">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <ScrollReveal>
              <Accordion items={items} />
            </ScrollReveal>

            {/* 답이 없을 때 나갈 길 */}
            <ScrollReveal>
              <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-base font-semibold text-slate-900">
                  {tContact('title')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {tContact('subtitle')}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-teal-600 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                  >
                    {tNav('contact')}
                  </Link>
                  <Link
                    href={QUOTE_HREF}
                    className="inline-flex h-11 items-center justify-center rounded-lg border-2 border-slate-300 px-6 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  >
                    {tNav('quote')}
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
