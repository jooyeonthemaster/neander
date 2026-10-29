import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { DevelopmentPage } from '@/components/development/DevelopmentPage';
import { DEVELOPMENT_COPY, type DevelopmentLocale } from '@/components/development/copy';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = DEVELOPMENT_COPY[locale === 'en' ? 'en' : 'ko'];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: localeAlternates('/development', locale),
    openGraph: { title: copy.metaTitle, description: copy.metaDescription, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function DevelopmentRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DevelopmentPage locale={(locale === 'en' ? 'en' : 'ko') as DevelopmentLocale} />;
}
