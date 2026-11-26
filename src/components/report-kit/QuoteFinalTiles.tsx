'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { calculateQuote, type QuoteInput } from '@/lib/quote/engine';
import { cn } from '@/lib/utils';
import type { ReportDoc } from './report-doc';
import { ReportFirstPage } from './ReportSheet';
import { EstimateFirstPage } from './EstimateFirstPage';
import { BADGE, BlankPage, ConsultThumb, PageThumb } from './FinalThumbs';

/* ─────────────────────────────────────────────────────────
   온라인 견적 마지막 단계 — 썸네일 3개 (2026-11-23 사용자 요청)
     가견적서 · 보고서 · 상담 요청. 누르면 팝업(QuoteStudio 의 FinalModal)이 열리고,
     이름·이메일(필수) · 회사·전화(선택)를 받은 뒤 파일을 내려준다. 보고서는 팝업에서 PDF · 한글 파일을 고른다.
     보고서는 한국어 양식이라 한국어 화면에서만 보인다.
   썸네일은 지금 고른 견적으로 그린 실제 파일의 첫 장이다 — 견적을 바꾸면 같이 바뀐다.
   ───────────────────────────────────────────────────────── */

export type FinalForm = 'pdf' | 'report' | 'request';
type Builder = (input: QuoteInput, quote: ReturnType<typeof calculateQuote>, refNo?: string) => ReportDoc;

/** 버튼 = 실제 파일 첫 장 썸네일. 이름은 썸네일 위에 겹쳐 있고(FinalThumbs), 형식은 뱃지가 알려 준다 */
function Tile({ thumb, title, onClick, active, disabled, testId }: { thumb: ReactNode; title: string; onClick: () => void; active?: boolean; disabled?: boolean; testId: string }) {
  return (
    <button type="button" data-testid={testId} onClick={onClick} disabled={disabled} aria-haspopup="dialog" aria-expanded={active} aria-label={title}
      className={cn('group block w-full rounded-[8px] p-1 text-left transition-[transform,box-shadow] duration-500 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-50',
        active && 'ring-2 ring-teal-500')}>
      {thumb}
    </button>
  );
}

export function QuoteFinalTiles({ input, lang, open, onOpen, recipient }: {
  input: QuoteInput;
  lang: 'ko' | 'en';
  open: FinalForm | null;
  onOpen: (form: FinalForm) => void;
  /** 입력 칸에 적은 수신자 — 가견적서 미리보기에 바로 반영 */
  recipient: { name: string; company?: string; email: string };
}) {
  const ko = lang === 'ko';
  const [builder, setBuilder] = useState<Builder | null>(null);
  const empty = input.items.length === 0;

  // 보고서 썸네일을 그리는 코드(사례 데이터 포함)는 이 단계에 들어온 뒤 불러온다
  useEffect(() => {
    if (!ko) return;
    let alive = true;
    import('./report-quote').then((m) => { if (alive) setBuilder(() => m.buildQuoteReport); }).catch(() => {});
    return () => { alive = false; };
  }, [ko]);

  const quoteKo = useMemo(() => calculateQuote(input, 'ko'), [input]);
  const quote = useMemo(() => (ko ? quoteKo : calculateQuote(input, lang)), [ko, quoteKo, input, lang]);
  const doc = useMemo(() => (builder && !empty ? builder(input, quoteKo) : null), [builder, empty, input, quoteKo]);

  return (
    <div className={cn('grid gap-3 sm:gap-5', ko ? 'grid-cols-3' : 'grid-cols-2 lg:max-w-[40rem]')}>
      <Tile thumb={<PageThumb badge={BADGE.pdf} label={ko ? '가견적서' : 'Estimate'}><EstimateFirstPage input={input} quote={quote} lang={lang} recipient={recipient} /></PageThumb>}
        title={ko ? '가견적서 (PDF)' : 'Estimate (PDF)'} onClick={() => onOpen('pdf')} active={open === 'pdf'} disabled={empty} testId="quote-final-estimate" />
      {ko && <Tile thumb={<PageThumb badge={BADGE.report} label="보고서">{doc ? <ReportFirstPage doc={doc} /> : <BlankPage />}</PageThumb>}
        title="보고서 (PDF · 한글 파일)" onClick={() => onOpen('report')} active={open === 'report'} disabled={empty} testId="quote-final-report" />}
      <Tile thumb={<ConsultThumb label={ko ? '상담 요청' : 'Request a quote'} />} title={ko ? '상담 요청' : 'Request a quote'} onClick={() => onOpen('request')} active={open === 'request'} disabled={empty} testId="quote-final-request" />
    </div>
  );
}
