import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionHeader } from '@/components/ui';
import { ScrollReveal } from '@/components/animations';
import { ContactTabs } from '@/components/contact/ContactTabs';

interface Props {
  params: Promise<{ locale: string }>;
  /** ?type=quote 로 들어오면 견적 계산 탭을 연다 */
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { type } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <main>
      {/* Hero banner */}
      <section
        className="relative overflow-hidden bg-slate-950 pb-20 pt-32 sm:pb-28 sm:pt-40"
        aria-labelledby="contact-hero-title"
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />

        {/* Gradient glow */}
        <div
          className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-y-1/3 rounded-full bg-teal-500/8 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader
              category={t('title')}
              title={t('subtitle')}
              subtitle={t('description')}
              align="center"
              as="h1"
              className="max-w-3xl [&_h1]:text-white [&_p]:text-slate-400 [&_span]:text-teal-400"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* 간단 문의 / 견적 계산 */}
      <section className="py-16 sm:py-24" aria-labelledby="contact-form-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="contact-form-title" className="sr-only">
            {t('title')}
          </h2>
          <ContactTabs initialTab={type === 'quote' ? 'quote' : 'inquiry'} />
        </div>
      </section>
    </main>
  );
}
