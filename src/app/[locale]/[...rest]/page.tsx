import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: string; rest: string[] }>;
}

/**
 * 존재하지 않는 주소를 로케일 레이아웃(헤더·푸터 포함) 안의 404 화면으로 넘긴다.
 * 이 파일이 없으면 Next.js 기본 영문 404가 헤더 없이 노출된다.
 */
export default async function CatchAllNotFound({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
