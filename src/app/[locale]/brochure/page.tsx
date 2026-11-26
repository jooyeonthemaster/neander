import { permanentRedirect } from 'next/navigation';
import { localePath } from '@/lib/seo';

/* 예전 「회사소개서 받기」 화면 — /portfolio 맨 아래 자료 받기 칸(#download)으로 합쳤다 (2026-11-26 사용자 「흩어져 있어서 헷갈려」).
   견적 보고서 · 바깥에 퍼진 링크가 있어 주소는 남기고 넘겨 준다. ?doc=profile 은 그대로 건넨다(회사소개서를 고른 채로 연다). */

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ doc?: string }>;
}

export default async function BrochurePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { doc } = await searchParams;
  const q = doc === 'profile' || doc === 'portfolio' ? `?doc=${doc}` : '';
  permanentRedirect(`${localePath('/portfolio', locale)}${q}#download`);
}
