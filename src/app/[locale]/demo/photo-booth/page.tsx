import { getTranslations } from 'next-intl/server';
import { PhotoBoothPreview } from '@/components/demo/PhotoBoothPreview';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'demo' });

  return {
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
