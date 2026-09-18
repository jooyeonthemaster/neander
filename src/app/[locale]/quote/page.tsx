import { redirect } from '@/i18n/navigation';
import { QUOTE_HREF } from '@/lib/constants';

// 견적 요청은 문의하기 페이지의 '견적 계산' 탭으로 합쳤다. 예전 주소·외부 링크를 위해 넘겨준다.
export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: QUOTE_HREF, locale });
}
