import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ScrollReveal } from '@/components/animations';
import { ExperienceContent } from '@/components/experience/ExperienceContent';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'experience' });

  return {
    title: t('title'),
    description: t('heroDescription'),
    openGraph: {
      title: t('title'),
      description: t('heroDescription'),
    },
  };
}

export default async function ExperiencePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'experience' });

  return (
    <main>
      {/* ── Hero ────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-neutral-950 pb-20 pt-32 sm:pb-28 sm:pt-40"
        aria-labelledby="experience-hero-title"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-[#0a1214] to-neutral-950" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
          aria-hidden="true"
        />

        {/* Teal glow */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(36, 173, 181, 0.14) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/[0.06] text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                {t('subtitle')}
              </span>
              <h1
                id="experience-hero-title"
                className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15] whitespace-pre-line [word-break:keep-all]"
              >
                {t('heroTitle')}
              </h1>
              <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-xl mx-auto">
                {t('heroDescription')}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Main Content (Client Component) ──────────── */}
      <ExperienceContent />
    </main>
  );
}
