import { getTranslations, setRequestLocale } from 'next-intl/server';
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

export default async function ScentQuizPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'demo' });

  return (
    <section className="min-h-screen bg-slate-950">
      {/* 화면에는 단계별 제목만 보이므로 페이지 제목은 보조기기·검색용으로만 둔다 */}
      <h1 className="sr-only">{t('scent-quiz.metaTitle')}</h1>
      <ScentQuiz />
    </section>
  );
}
