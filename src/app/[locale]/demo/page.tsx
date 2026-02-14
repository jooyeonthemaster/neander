import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ScrollReveal } from '@/components/animations';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'demo' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

const demos = [
  {
    id: 'scent-quiz',
    href: '/demo/scent-quiz',
    emoji: '🧪',
    gradient: 'from-amber-400 via-teal-400 to-cyan-500',
    accentBg: 'bg-gradient-to-br from-amber-50 to-teal-50',
  },
  {
    id: 'photo-booth',
    href: '/demo/photo-booth',
    emoji: '📸',
    gradient: 'from-rose-400 via-fuchsia-400 to-violet-500',
    accentBg: 'bg-gradient-to-br from-rose-50 to-violet-50',
  },
] as const;

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'demo' });

  return (
    <section className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 text-white">
        {/* Ambient bg circles */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-4">
            {t('category')}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-5 mx-auto max-w-xl text-base text-slate-400 leading-relaxed sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Demo cards grid */}
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {demos.map((demo, i) => (
            <ScrollReveal key={demo.id} delay={i * 0.15}>
              <Link
                href={demo.href}
                className="group block rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-4"
              >
                {/* Preview area */}
                <div className={`relative h-64 ${demo.accentBg} flex items-center justify-center overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${demo.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <span className="text-7xl transition-transform duration-500 group-hover:scale-110" aria-hidden="true">
                    {demo.emoji}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                    {t(`${demo.id}.title`)}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {t(`${demo.id}.description`)}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 group-hover:gap-3 transition-all duration-300">
                    {t('tryIt')}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
