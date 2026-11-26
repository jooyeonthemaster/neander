import { COMMON, ESTIMATE_DISCLAIMER, REGIONS, REGION_NOTE } from '@/lib/quote/catalog';
import { koreanAmount, type QuoteInput, type QuoteResult } from '@/lib/quote/engine';
import { COMPANY_NAME_EN, COMPANY_NAME_KO, CONTACT } from '@/lib/constants';

/* ─────────────────────────────────────────────────────────
   가견적서 PDF 첫 장 미리보기 — 견적 마지막 단계 버튼의 썸네일용 (2026-11-21 사용자 요청: 「실제로 나올 파일의 모습」)
   실제 PDF 는 서버(src/lib/quote/pdf.ts, pdf-lib)가 만든다. 여기서는 같은 A4(595 × 842pt), 같은 여백(44pt) · 글자 크기 ·
   색 · 순서로 1pt = 1px 로 그려 지금 고른 견적을 그대로 보여 준다. pdf.ts 의 배치를 바꾸면 이 파일도 같이 바꾼다.
   견적번호는 발급할 때 정해지므로 자리만 표시한다.
   ───────────────────────────────────────────────────────── */

const INK = '#171f1f';      // rgb(0.09, 0.12, 0.12)
const MUTED = '#616b69';    // rgb(0.38, 0.42, 0.41)
const LINE = '#d6dedb';     // rgb(0.84, 0.87, 0.86)
const ACCENT = '#0d6b63';   // rgb(0.05, 0.42, 0.39)
const TINT = '#f2f7f5';     // rgb(0.95, 0.97, 0.96)
const M = 44;

const fmtDate = (d: Date) => {
  const k = new Date(d.getTime() + 9 * 3600 * 1000);
  return `${k.getUTCFullYear()}-${String(k.getUTCMonth() + 1).padStart(2, '0')}-${String(k.getUTCDate()).padStart(2, '0')}`;
};

export function EstimateFirstPage({ input, quote, lang, recipient }: {
  input: QuoteInput;
  quote: QuoteResult;
  lang: 'ko' | 'en';
  recipient: { name: string; company?: string; email: string };
}) {
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en);
  const won = (n: number) => (lang === 'ko' ? `${n.toLocaleString('ko-KR')}원` : `KRW ${n.toLocaleString('en-US')}`);
  const now = new Date();
  const validUntil = new Date(now.getTime() + COMMON.validDays * 86400000);
  const name = recipient.name.trim() || L('○○○', 'Your name');
  const recipientName = recipient.company?.trim() ? `${recipient.company.trim()} ${name}` : name;
  const eventName = input.eventName?.trim() || L('미정', 'TBD');
  const region = REGIONS.find((r) => r.key === input.region)?.label[lang] ?? '';
  const supplier = [
    [L('상호', 'Company'), lang === 'ko' ? COMPANY_NAME_KO : COMPANY_NAME_EN],
    [L('대표', 'CEO'), L('유재영', 'Yoo Jae-young')],
    [L('사업자등록번호', 'Business reg. no.'), '683-86-02812'],
    [L('주소', 'Address'), CONTACT.officeAddress[lang]],
    [L('연락처', 'Contact'), `${CONTACT.phone} · ${CONTACT.email}`],
  ];
  const details = [
    [L('행사 일자', 'Event date'), input.eventDate || L('미정', 'TBD')],
    [L('운영 기간', 'Duration'), L(`${input.days}일 · 1일 ${input.hoursPerDay}시간`, `${input.days} day(s) · ${input.hoursPerDay} h/day`)],
    [L('예상 체험 인원', 'Expected participants'), L(`${input.attendees.toLocaleString('ko-KR')}명`, input.attendees.toLocaleString('en-US'))],
    [L('지역', 'Region'), region],
  ];
  const notes = [
    ...quote.warnings, ...quote.notes,
    ESTIMATE_DISCLAIMER[lang],
    L('본 문서는 웹사이트에서 자동 발급된 가견적서이며, 확정 견적은 담당자 확인 후 별도로 발행합니다.', 'This is an automatically generated preliminary estimate. A final quotation is issued after review by our team.'),
    L(`유효기간은 발행일로부터 ${COMMON.validDays}일입니다.`, `Valid for ${COMMON.validDays} days from issue.`),
    L(`1일 기본 운영 ${COMMON.baseHours}시간 기준이며, 설치·철수 시간은 포함하지 않습니다.`, `Based on ${COMMON.baseHours} operating hours per day, excluding setup and teardown.`),
    L("'상담 후 산정' 항목은 합계에 포함되지 않았습니다.", "Items marked 'TBD' are not included in the total."),
    REGION_NOTE[lang],
  ];

  return (
    <div className="relative overflow-hidden bg-[#fff]" style={{ width: 595.28, height: 841.89, padding: M, color: INK, fontFamily: 'Pretendard, system-ui, sans-serif', lineHeight: 1.25 }}>
      {/* 머리글 */}
      <div className="flex items-baseline justify-between">
        <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>NEANDER</span>
        <span style={{ fontSize: 8, color: MUTED }}>NEANDER ESTIMATE</span>
      </div>
      <div className="mt-[18px] flex items-end justify-between">
        <span style={{ fontSize: 22, fontWeight: 700 }}>{L('가견적서', 'PRELIMINARY ESTIMATE')}</span>
        <div className="text-right" style={{ fontSize: 8.5, color: MUTED, lineHeight: '12px' }}>
          <p>{L('견적번호', 'No.')}&nbsp;&nbsp;{L('발급 시 부여', 'Issued on download')}</p>
          <p>{L('발행일', 'Issued')}&nbsp;&nbsp;{fmtDate(now)}</p>
          <p>{L('유효기간', 'Valid until')}&nbsp;&nbsp;{fmtDate(validUntil)}</p>
        </div>
      </div>
      <div className="mt-[10px]" style={{ height: 1.2, background: INK }} />

      {/* 수신 / 공급자 */}
      <div className="mt-[14px] grid grid-cols-2 gap-x-[24px]">
        <div>
          <p style={{ fontSize: 8.5, fontWeight: 700, color: MUTED }}>{L('수신', 'To')}</p>
          <p className="mt-[5px]" style={{ fontSize: 12, fontWeight: 700 }}>{recipientName}{L(' 귀하', '')}</p>
          <p className="mt-[3px]" style={{ fontSize: 9, color: MUTED }}>{recipient.email.trim() || 'email@example.com'}</p>
        </div>
        <div>
          <p style={{ fontSize: 8.5, fontWeight: 700, color: MUTED }}>{L('공급자', 'Supplier')}</p>
          <div className="mt-[5px] space-y-[2px]" style={{ fontSize: 8.5 }}>
            {supplier.map(([k, v]) => <div key={k} className="grid grid-cols-[78px_1fr]"><span style={{ color: MUTED }}>{k}</span><span>{v}</span></div>)}
          </div>
        </div>
      </div>

      {/* 합계 */}
      <div className="mt-[12px] flex items-center justify-between px-[14px]" style={{ height: 44, background: TINT }}>
        <div className="flex items-baseline gap-[24px]" style={{ fontSize: 10 }}>
          <span style={{ fontWeight: 700, color: ACCENT }}>{L('합계 (VAT 포함)', 'Total (incl. VAT)')}</span>
          {lang === 'ko' && <span style={{ color: MUTED }}>일금 {koreanAmount(quote.total)}원정</span>}
        </div>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{won(quote.total)}</span>
      </div>
      <div className="mt-[12px] px-[14px] py-[6px]" style={{ background: '#fff7e6', border: '0.6px solid #f5d18c', fontSize: 8.5, fontWeight: 700, color: '#8c540a' }}>{ESTIMATE_DISCLAIMER[lang]}</div>

      {/* 행사 개요 */}
      <p className="mt-[16px]" style={{ fontSize: 10.5, fontWeight: 700 }}>{L('행사 개요', 'Event')}</p>
      <p className="mt-[6px]" style={{ fontSize: 8, color: MUTED }}>{L('행사명', 'Event name')}</p>
      <p className="mt-[3px]" style={{ fontSize: 9.5, fontWeight: 700 }}>{eventName}</p>
      <div className="mt-[14px] grid grid-cols-4">
        {details.map(([k, v]) => <div key={k}><p style={{ fontSize: 8, color: MUTED }}>{k}</p><p className="mt-[3px]" style={{ fontSize: 9.5, fontWeight: 700 }}>{v}</p></div>)}
      </div>

      {/* 품목 */}
      <p className="mt-[20px]" style={{ fontSize: 10.5, fontWeight: 700 }}>{L('품목', 'Items')}</p>
      <div className="mt-[8px] flex items-center px-[6px]" style={{ height: 20, background: TINT, fontSize: 8.5, fontWeight: 700, color: MUTED }}>
        <span style={{ width: 122 }}>{L('품목', 'Item')}</span><span className="flex-1">{L('내용', 'Details')}</span><span>{L('금액', 'Amount')}</span>
      </div>
      {quote.lines.map((l, i) => (
        <div key={i} className="flex items-start px-[6px] py-[7px]" style={{ borderBottom: `0.7px solid ${LINE}` }}>
          <span style={{ width: 122, fontSize: 9.5, fontWeight: 700 }}>{l.label}</span>
          <span className="flex-1 pr-[16px]" style={{ fontSize: 8.5, color: MUTED }}>{l.detail}</span>
          <span style={{ fontSize: 9.5, fontWeight: l.tbd ? 400 : 700, color: l.tbd ? MUTED : INK }}>{l.tbd ? L('상담 후 산정', 'TBD') : won(l.amount)}</span>
        </div>
      ))}
      <div className="mt-[8px] space-y-[5px] pr-[6px]">
        {[[L('공급가액', 'Subtotal'), won(quote.supply)], [L('부가세 (10%)', 'VAT (10%)'), won(quote.vat)]].map(([k, v]) => (
          <div key={k} className="flex justify-end gap-[40px]" style={{ fontSize: 9.5, color: MUTED }}><span>{k}</span><span className="w-[100px] text-right" style={{ color: INK }}>{v}</span></div>
        ))}
        <div className="flex justify-end gap-[40px]" style={{ fontWeight: 700 }}><span style={{ fontSize: 10.5 }}>{L('합계', 'Total')}</span><span className="w-[100px] text-right" style={{ fontSize: 12 }}>{won(quote.total)}</span></div>
      </div>

      {/* 유의사항 */}
      <p className="mt-[18px]" style={{ fontSize: 10.5, fontWeight: 700 }}>{L('유의사항', 'Notes')}</p>
      <ul className="mt-[5px] space-y-[1px]" style={{ fontSize: 8.5, color: MUTED }}>
        {notes.map((n) => <li key={n} className="flex gap-[4px]"><span>·</span><span>{n}</span></li>)}
      </ul>

      <p className="absolute" style={{ right: M, bottom: 18, fontSize: 7.5, color: MUTED }}>neander.co.kr&nbsp;&nbsp;·&nbsp;&nbsp;1 / 1</p>
    </div>
  );
}
