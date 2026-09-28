import { getTranslations } from 'next-intl/server';
import { PhotoBoothPreview } from '@/components/demo/PhotoBoothPreview';
import { localeAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'demo' });

  return {
    alternates: localeAlternates('/demo/photo-booth', locale),
    title: t('photo-booth.metaTitle'),
    description: t('photo-booth.metaDescription'),
  };
}

export default async function PhotoBoothPage() {
  return (
    <section className="min-h-screen bg-slate-950">
      <PhotoBoothPreview />
    </section>
  );
}
