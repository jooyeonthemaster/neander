import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExperienceContent } from '@/components/experience/ExperienceContent';
import { AcscentTrust } from '@/components/services/AcscentTrust';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';
import { PageHero } from '@/components/site/PageHero';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'experience' });

  return {
    alternates: localeAlternates('/experience', locale),
    title: t('title'),
    description: t('heroDescription'),
    openGraph: {
      title: t('title'),
      description: t('heroDescription'),
      images: [DEFAULT_OG_IMAGE],
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
      <PageHero
        id="experience-hero-title"
        label={`FLAGSHIP STORE · ${t('subtitle')}`}
        en={['TRY IT', 'FIRST.']}
        ko={t('heroTitle').replace('\n', ' ')}
        lead={t('heroDescription')}
        image="/images/portfolio/acscent-id-1.webp"
        imageAlt={locale === 'en' ? "AC'SCENT ID store in Hongdae" : "홍대 AC'SCENT ID 매장"}
        size="h1"
      />

      {/* ── Main Content (Client Component) ──────────── */}
      <ExperienceContent />
      <div className="on-dark border-t border-paper/10"><AcscentTrust locale={locale} /></div>
    </main>
  );
}
