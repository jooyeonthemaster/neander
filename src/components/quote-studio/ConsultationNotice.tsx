'use client';

import { Link } from '@/i18n/navigation';
import { SERVICE_TEXT, type Lang, type ServiceKey } from '@/lib/quote/catalog';

export function ConsultationNotice({ service, lang }: { service: ServiceKey; lang: Lang }) {
  const ko = lang === 'ko';
  return <section role="status" data-testid="quote-consultation-notice" data-service={service}
    className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 sm:p-5">
    <h3 className="text-sm font-semibold text-slate-900">{SERVICE_TEXT[service].name[lang]} · {ko ? '별도 문의 필요' : 'Separate inquiry required'}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">{ko
      ? '행사 내용과 현장 조건을 확인한 뒤 별도로 안내해 드려요.'
      : 'We will review your event and venue and provide a separate quote.'}</p>
    <Link href="/contact" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600">
      {ko ? '문의하기' : 'Contact us'}
    </Link>
  </section>;
}
