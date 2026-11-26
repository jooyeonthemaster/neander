import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ProductPage } from '@/components/services/ProductPage';
import { productPageCopy } from '@/data/product-pages';
import { DEFAULT_OG_IMAGE, localeAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = productPageCopy('rental', locale === 'en' ? 'en' : 'ko');
  return {
    alternates: localeAlternates(copy.path, locale),
    title: copy.metaTitle,
    description: copy.metaDescription,
    openGraph: { title: copy.metaTitle, description: copy.metaDescription, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProductPage kind="rental" locale={locale} />;
}
