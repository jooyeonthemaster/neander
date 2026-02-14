import { getTranslations } from 'next-intl/server';
import { ScentQuiz } from '@/components/demo/ScentQuiz';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'demo' });

  return {
    title: t('scent-quiz.metaTitle'),
    description: t('scent-quiz.metaDescription'),
  };
}

export default async function ScentQuizPage() {
  return (
    <section className="min-h-screen bg-slate-950">
      <ScentQuiz />
    </section>
  );
}
