import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SectionHeader } from '@/components/ui';
import { ScrollReveal } from '@/components/animations';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactInfo } from '@/components/contact/ContactInfo';

interface Props {
  params: Promise<{ locale: string }>;
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

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
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
              className="max-w-3xl [&_h2]:text-white [&_p]:text-slate-400 [&_span]:text-teal-400"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Form + Info two-column layout */}
      <section className="py-16 sm:py-24" aria-labelledby="contact-form-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="contact-form-title" className="sr-only">
            {t('title')}
          </h2>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Form (left, wider) */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h3 className="mb-6 text-xl font-bold text-slate-900">
                    {t('subtitle')}
                  </h3>
                  <ContactForm />
                </div>
              </ScrollReveal>
            </div>

            {/* Info (right, narrower) */}
            <div className="lg:col-span-2">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
