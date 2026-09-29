import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { QuotePreviewLab } from '@/components/quote-preview/QuotePreviewLab';

export const metadata: Metadata = {
  title: '견적 미리보기 실험실',
  description: '향수 체험과 조향 공간을 옵션별로 미리 살펴보세요.',
  robots: { index: false, follow: false },
};

export default async function QuotePreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <QuotePreviewLab />;
}
