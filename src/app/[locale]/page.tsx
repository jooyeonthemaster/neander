import type { Metadata } from 'next';
import { HomeHero, HomeServices, HomeStatement, HomeStore, HomeStudio, HomeWork } from '@/components/home';
import { localeAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localeAlternates('/', locale) };
}

/* 홈 구역 순서는 방문 기록을 따른다 (2026-09~11):
   홈에서 다음으로 가는 곳이 체험 서비스(18%) · 포트폴리오(16%) · 회사 소개(11%) 순이고,
   홈 스크롤 중앙값이 PC 40% · 휴대폰 20% 라 중요한 것을 위에 둔다. 문의 구역은 바닥글이 맡는다. */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeServices />
      <HomeWork />
      <HomeStatement />
      <HomeStudio />
      <HomeStore />
    </>
  );
}
