import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { COMMON, ESTIMATE_DISCLAIMER, EVENT_TYPES, REGIONS } from '@/lib/quote/catalog';
import { readEstimateToken } from '@/lib/quote/token';
import { EstimateReuseButton } from '@/components/quote-studio/EstimateReuseButton';

/* ─────────────────────────────────────────────────────────
   가견적서 다시 보기 (/quote/estimate?t=토큰)
   발급 당시 내용을 그대로 보여 준다. 개인 정보가 들어 있어 검색에 노출하지 않는다.
   ───────────────────────────────────────────────────────── */

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string }>;
}

// 개인 정보가 들어 있어 검색에 노출하지 않는다. 제목은 화면 언어에 맞춘다
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: COPY[locale === 'en' ? 'en' : 'ko'].title, robots: { index: false, follow: false } };
}

const COPY = {
  ko: {
    title: '가견적서',
    invalid: '가견적서를 찾을 수 없습니다',
    invalidBody: '링크가 잘렸거나 바뀌었을 수 있습니다. 받은 링크를 다시 확인하거나 새 견적을 만들어 주세요. 발급받은 가견적서가 필요하면 담당자에게 문의해 주세요.',
    newQuote: '새 견적 만들기',
    issued: '발행일',
    validUntil: '유효기간',
    expired: '유효기간이 지났습니다. 금액이 달라졌을 수 있어 새로 견적을 받아 보세요.',
    valid: '유효',
    to: '수신',
    event: '행사 개요',
    type: '행사 유형',
    date: '행사 일자',
    duration: '운영 기간',
    guests: '예상 인원',
    region: '지역',
    items: '품목',
    supply: '공급가액',
    vat: '부가세 (10%)',
    total: '합계 (VAT 포함)',
    tbd: '상담 후 산정',
    notes: '유의사항',
    viewPdf: 'PDF 보기',
    download: 'PDF 내려받기',
    reuse: '이 조건으로 다시 견적 내기',
    contact: '담당자에게 문의하기',
    undecided: '미정',
    note: '웹사이트에서 자동 발급된 가견적서입니다. 확정 견적은 담당자 확인 후 별도로 발행합니다.',
  },
  en: {
    title: 'Preliminary estimate',
    invalid: 'Estimate not found',
    invalidBody: 'The link may be cut off or changed. Check the link you received or create a new estimate. If you need the estimate we issued, contact our team.',
    newQuote: 'Create a new estimate',
    issued: 'Issued',
    validUntil: 'Valid until',
    expired: 'This estimate has expired. Prices may have changed; please create a new one.',
    valid: 'Valid',
    to: 'To',
    event: 'Event',
    type: 'Event type',
    date: 'Event date',
    duration: 'Duration',
    guests: 'Expected guests',
    region: 'Region',
    items: 'Items',
    supply: 'Subtotal',
    vat: 'VAT (10%)',
    total: 'Total (incl. VAT)',
    tbd: 'TBD',
    notes: 'Notes',
    viewPdf: 'View PDF',
    download: 'Download PDF',
    reuse: 'Start a new estimate with these details',
    contact: 'Contact us',
    undecided: 'TBD',
    note: 'This is an automatically generated preliminary estimate. A final quotation is issued after review by our team.',
  },
} as const;

const kstDate = (iso: string) => new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);

export default async function EstimatePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { t } = await searchParams;
  const snapshot = readEstimateToken(t);
  const lang = snapshot?.lang ?? (locale === 'en' ? 'en' : 'ko');
  const c = COPY[lang];

  if (!snapshot || !t) {
    return (
      <div className="bg-slate-50 py-24">
        <div className="container-wide max-w-xl text-center">
          <h1 className="text-2xl font-bold text-slate-900">{c.invalid}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.invalidBody}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/quote" className="inline-flex h-11 items-center rounded-lg bg-teal-700 px-6 text-sm font-semibold text-white hover:bg-teal-800">{c.newQuote}</Link>
            <Link href="/contact" className="inline-flex h-11 items-center px-3 text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900">{c.contact}</Link>
          </div>
          <p className="mt-4 text-xs text-slate-500"><a href="mailto:ok@neander.co.kr" className="underline underline-offset-4 hover:text-slate-800">ok@neander.co.kr</a></p>
        </div>
      </div>
    );
  }

  const won = (n: number) => (lang === 'ko' ? `${n.toLocaleString('ko-KR')}원` : `KRW ${n.toLocaleString('en-US')}`);
  const issued = kstDate(snapshot.issuedAt);
  const validUntil = kstDate(new Date(new Date(snapshot.issuedAt).getTime() + COMMON.validDays * 86400000).toISOString());
  const expired = kstDate(new Date().toISOString()) > validUntil;
  const { input, result, recipient } = snapshot;
  const pdfHref = `/api/quote-pdf?t=${encodeURIComponent(t)}`;
  const overview: [string, string][] = [
    [c.type, EVENT_TYPES.find((e) => e.key === input.eventType)?.label[lang] ?? input.eventType],
    [c.date, input.eventDate || c.undecided],
    [c.duration, lang === 'ko' ? `${input.days}일 · 1일 ${input.hoursPerDay}시간` : `${input.days} day(s) · ${input.hoursPerDay} h/day`],
    [c.guests, lang === 'ko' ? `${input.attendees.toLocaleString('ko-KR')}명` : input.attendees.toLocaleString('en-US')],
    [c.region, REGIONS.find((r) => r.key === input.region)?.label[lang] ?? ''],
  ];

  return (
    <div className="bg-slate-50 pb-20 pt-12 sm:pt-16">
      <div className="container-wide max-w-3xl">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold tracking-[0.16em] text-teal-700">NEANDER ESTIMATE</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{c.title} <span className="text-base font-medium text-slate-500">{snapshot.no}</span></h1>
              <p className="text-xs text-slate-500">
                {c.issued} {issued} · {c.validUntil} {validUntil}{' '}
                <span className={expired ? 'font-semibold text-amber-700' : 'font-semibold text-teal-700'}>{expired ? '' : `(${c.valid})`}</span>
              </p>
            </div>
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-900">{ESTIMATE_DISCLAIMER[lang]}</p>
            {expired && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{c.expired}</p>}
            <p className="mt-4 text-sm text-slate-700">
              <span className="text-slate-500">{c.to}</span>{' '}
              <b>{recipient.company ? `${recipient.company} ` : ''}{recipient.name}</b>{lang === 'ko' ? ' 귀하' : ''}
            </p>
          </header>

          <section className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <h2 className="text-sm font-semibold text-slate-900">{c.event}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              {overview.map(([k, v]) => (
                <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd></div>
              ))}
            </dl>
          </section>

          <section className="px-6 py-5 sm:px-8">
            <h2 className="text-sm font-semibold text-slate-900">{c.items}</h2>
            <ul className="mt-2 divide-y divide-slate-100">
              {result.lines.map((l, i) => (
                <li key={i} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{l.label}</p>
                    {l.detail && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{l.detail}</p>}
                  </div>
                  <span className={l.tbd ? 'shrink-0 text-sm text-slate-400' : 'shrink-0 text-sm font-semibold tabular-nums text-slate-900'}>
                    {l.tbd ? c.tbd : won(l.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-600"><dt>{c.supply}</dt><dd className="tabular-nums">{won(result.supply)}</dd></div>
              <div className="flex justify-between text-slate-600"><dt>{c.vat}</dt><dd className="tabular-nums">{won(result.vat)}</dd></div>
              <div className="flex items-baseline justify-between pt-1 text-slate-900"><dt className="font-semibold">{c.total}</dt><dd className="text-xl font-bold tabular-nums">{won(result.total)}</dd></div>
            </dl>
          </section>

          {(result.warnings.length > 0 || (result.notes?.length ?? 0) > 0) && (
            <section className="border-t border-slate-100 px-6 py-5 text-xs leading-relaxed text-slate-500 sm:px-8">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">{c.notes}</h2>
              {[...result.warnings, ...(result.notes ?? [])].map((n) => <p key={n} className="mt-1">· {n}</p>)}
            </section>
          )}

          <footer className="flex flex-wrap gap-2.5 border-t border-slate-100 px-6 py-5 sm:px-8">
            <a href={pdfHref} target="_blank" rel="noopener" className="inline-flex h-11 items-center rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white hover:bg-teal-500">{c.viewPdf}</a>
            <a href={`${pdfHref}&download=1`} className="inline-flex h-11 items-center rounded-lg border-2 border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{c.download}</a>
            <EstimateReuseButton input={input} label={c.reuse} />
            <Link href="/contact" className="inline-flex h-11 items-center px-3 text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900">{c.contact}</Link>
          </footer>
        </article>
        <p className="mt-4 text-center text-xs text-slate-400">{c.note}</p>
      </div>
    </div>
  );
}
