import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import subsetFont from 'subset-font';
import { COMMON, ESTIMATE_DISCLAIMER, EVENT_TYPES, REGION_NOTE, REGIONS, type Lang } from './catalog';
import { calculateQuote, koreanAmount, type QuoteInput, type QuoteResult } from './engine';
import { CONTACT, COMPANY_NAME_KO, COMPANY_NAME_EN, SITE_URL } from '@/lib/constants';

/* ─────────────────────────────────────────────────────────
   가견적서 PDF
   - 한글 폰트(Pretendard)는 이 문서에 쓰인 글자만 잘라(subset) 넣는다 → 수십 KB
     (pdf-lib 자체 subset은 한글 일부 글리프가 빠지는 문제가 있어 harfbuzz로 먼저 자른다)
   - 금액은 서버에서 다시 계산한다 (브라우저가 보낸 합계를 믿지 않는다)
   ───────────────────────────────────────────────────────── */

export interface EstimateMeta {
  estimateNo: string;
  issuedAt: Date;
  recipient: { name: string; company?: string; email: string; phone?: string };
  lang: Lang;
  /** 발급 당시 계산 결과 (다시 보기에서는 저장본을 그대로 쓴다) */
  quote?: QuoteResult;
}

const FONT_DIR = path.join(process.cwd(), 'src/assets/fonts');
const A4 = { w: 595.28, h: 841.89 };
const M = 44; // 여백
const INK = rgb(0.09, 0.12, 0.12);
const MUTED = rgb(0.38, 0.42, 0.41);
const LINE = rgb(0.84, 0.87, 0.86);
const ACCENT = rgb(0.05, 0.42, 0.39);
const TINT = rgb(0.95, 0.97, 0.96);

const fmtDate = (d: Date) => {
  const k = new Date(d.getTime() + 9 * 3600 * 1000); // KST
  return `${k.getUTCFullYear()}-${String(k.getUTCMonth() + 1).padStart(2, '0')}-${String(k.getUTCDate()).padStart(2, '0')}`;
};

export function newEstimateNo(now = new Date()): string {
  const d = fmtDate(now).replace(/-/g, '').slice(2);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NQ-${d}-${rand}`;
}

/** 글자 단위 줄바꿈 (한글은 띄어쓰기가 없어도 넘치면 자른다) */
function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(/(\s+)/)) {
      const tryLine = line + word;
      if (font.widthOfTextAtSize(tryLine, size) <= width) { line = tryLine; continue; }
      if (line.trim()) out.push(line.trimEnd());
      line = word.trimStart();
      while (font.widthOfTextAtSize(line, size) > width) {
        let cut = line.length - 1;
        while (cut > 1 && font.widthOfTextAtSize(line.slice(0, cut), size) > width) cut--;
        out.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
    out.push(line.trimEnd());
  }
  return out;
}

export async function renderEstimatePdf(input: QuoteInput, meta: EstimateMeta): Promise<Uint8Array> {
  const lang = meta.lang;
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en);
  const quote = meta.quote ?? calculateQuote(input, lang);
  const validUntil = new Date(meta.issuedAt.getTime() + COMMON.validDays * 86400000);
  const won = (n: number) => (lang === 'ko' ? `${n.toLocaleString('ko-KR')}원` : `KRW ${n.toLocaleString('en-US')}`);
  const eventName = input.eventName?.trim() || (input.eventName === undefined && meta.quote ? EVENT_TYPES.find((e) => e.key === input.eventType)?.label[lang] ?? input.eventType : L('미정', 'TBD'));
  const region = REGIONS.find((r) => r.key === input.region)?.label[lang] ?? '';

  const notes = [
    ESTIMATE_DISCLAIMER[lang],
    L('본 문서는 웹사이트에서 자동 발급된 가견적서이며, 확정 견적은 담당자 확인 후 별도로 발행합니다.',
      'This is an automatically generated preliminary estimate. A final quotation is issued after review by our team.'),
    L(`유효기간은 발행일로부터 ${COMMON.validDays}일입니다.`, `Valid for ${COMMON.validDays} days from issue.`),
    L(`1일 기본 운영 ${COMMON.baseHours}시간 기준이며, 설치·철수 시간은 포함하지 않습니다.`, `Based on ${COMMON.baseHours} operating hours per day, excluding setup and teardown.`),
    L("'상담 후 산정' 항목은 합계에 포함되지 않았습니다.", "Items marked 'TBD' are not included in the total."),
    REGION_NOTE[lang],
    L('문의: ok@neander.co.kr · 02-336-3368 · 010-8507-5121', 'Contact: ok@neander.co.kr · +82-2-336-3368 · +82-10-8507-5121'),
  ];

  const supplier = [
    [L('상호', 'Company'), lang === 'ko' ? COMPANY_NAME_KO : COMPANY_NAME_EN],
    [L('대표', 'CEO'), L('유재영', 'Yoo Jae-young')],
    [L('사업자등록번호', 'Business reg. no.'), '683-86-02812'],
    [L('주소', 'Address'), CONTACT.officeAddress[lang]],
    [L('연락처', 'Contact'), `${CONTACT.phone} · ${CONTACT.email}`],
  ];
  const recipientName = meta.recipient.company ? `${meta.recipient.company} ${meta.recipient.name}` : meta.recipient.name;
  const overview = [
    [L('행사명', 'Event name'), eventName],
    [L('행사 일자', 'Event date'), input.eventDate || L('미정', 'TBD')],
    [L('운영 기간', 'Duration'), L(`${input.days}일 · 1일 ${input.hoursPerDay}시간`, `${input.days} day(s) · ${input.hoursPerDay} h/day`)],
    [L('예상 체험 인원', 'Expected participants'), L(`${input.attendees.toLocaleString('ko-KR')}명`, input.attendees.toLocaleString('en-US'))],
    [L('지역', 'Region'), region],
  ];

  // 문서에 들어갈 모든 글자를 모아 폰트를 자른다
  const allText = [
    L('가견적서', 'PRELIMINARY ESTIMATE'), 'NEANDER ESTIMATE', meta.estimateNo, fmtDate(meta.issuedAt), fmtDate(validUntil),
    L('견적번호 발행일 유효기간 수신 공급자 행사 개요 품목 내용 금액 공급가액 부가세 (10%) 합계 일금 원정 (VAT 포함) 상담 후 산정 유의사항 귀하 페이지 계속 발행', 'No. Issued Valid until To Supplier Event Item Details Amount Subtotal VAT (10%) Total TBD Notes Page cont.'),
    recipientName, meta.recipient.email, meta.recipient.phone ?? '', SITE_URL,
    ...supplier.flat(), ...overview.flat(), ...notes, ...quote.warnings, ...quote.notes,
    ...quote.lines.flatMap((l) => [l.label, l.detail, won(l.amount)]),
    won(quote.supply), won(quote.vat), won(quote.total), koreanAmount(quote.total),
    '0123456789,.-·×()/:%~+#@', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
  ].join('');
  const chars = [...new Set(allText)].join('');
  const [regRaw, boldRaw] = await Promise.all([
    readFile(path.join(FONT_DIR, 'Pretendard-Regular.ttf')),
    readFile(path.join(FONT_DIR, 'Pretendard-Bold.ttf')),
  ]);
  const [regSub, boldSub] = await Promise.all([
    subsetFont(regRaw, chars, { targetFormat: 'truetype' }),
    subsetFont(boldRaw, chars, { targetFormat: 'truetype' }),
  ]);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`${L('가견적서', 'Estimate')} ${meta.estimateNo}`);
  doc.setAuthor(COMPANY_NAME_KO);
  doc.setCreator(SITE_URL);
  // 문맥 대체(예: 숫자·대문자 사이 하이픈 → hyphen.case)를 끈다.
  // pdf-lib는 cmap에 없는 대체 글리프의 폭을 기록하지 않아, 뷰어가 1em 폭으로 그려 글자 사이가 벌어지고 오른쪽 정렬이 어긋난다.
  const features = { calt: false, liga: false, clig: false, rclt: false, ccmp: false, locl: false, frac: false, numr: false, dnom: false, case: false };
  const reg = await doc.embedFont(regSub, { subset: false, features });
  const bold = await doc.embedFont(boldSub, { subset: false, features });

  let page: PDFPage = doc.addPage([A4.w, A4.h]);
  let y = A4.h - M;
  const W = A4.w - M * 2;
  const text = (s: string, x: number, yy: number, size = 9.5, font = reg, color = INK) => page.drawText(s, { x, y: yy, size, font, color });
  const right = (s: string, xr: number, yy: number, size = 9.5, font = reg, color = INK) =>
    text(s, xr - font.widthOfTextAtSize(s, size), yy, size, font, color);
  const hr = (yy: number, color = LINE, thickness = 0.7) => page.drawLine({ start: { x: M, y: yy }, end: { x: A4.w - M, y: yy }, thickness, color });

  // ── 머리글
  text('NEANDER', M, y - 12, 11, bold, ACCENT);
  right('NEANDER ESTIMATE', A4.w - M, y - 12, 8, reg, MUTED);
  y -= 46;
  text(L('가견적서', 'PRELIMINARY ESTIMATE'), M, y, 22, bold);
  const metaRows = [[L('견적번호', 'No.'), meta.estimateNo], [L('발행일', 'Issued'), fmtDate(meta.issuedAt)], [L('유효기간', 'Valid until'), fmtDate(validUntil)]];
  let my = y + 14;
  for (const [k, v] of metaRows) { right(`${k}  ${v}`, A4.w - M, my, 8.5, reg, MUTED); my -= 12; }
  y -= 22;
  hr(y, INK, 1.2);
  y -= 22;

  // ── 수신 / 공급자 (2단)
  const colW = (W - 24) / 2;
  const leftX = M, rightX = M + colW + 24;
  text(L('수신', 'To'), leftX, y, 8.5, bold, MUTED);
  text(L('공급자', 'Supplier'), rightX, y, 8.5, bold, MUTED);
  let ly = y - 16;
  text(`${recipientName}${L(' 귀하', '')}`, leftX, ly, 12, bold);
  ly -= 15;
  for (const s of [meta.recipient.email, meta.recipient.phone ?? ''].filter(Boolean)) { text(s, leftX, ly, 9, reg, MUTED); ly -= 12; }
  let ry = y - 16;
  for (const [k, v] of supplier) {
    text(k, rightX, ry, 8.5, reg, MUTED);
    const lines = wrap(v, reg, 8.5, colW - 78);
    lines.forEach((ln, i) => text(ln, rightX + 78, ry - i * 11, 8.5));
    ry -= 11 * lines.length + 2;
  }
  y = Math.min(ly, ry) - 12;

  // ── 합계 강조 박스
  page.drawRectangle({ x: M, y: y - 44, width: W, height: 44, color: TINT });
  text(L('합계 (VAT 포함)', 'Total (incl. VAT)'), M + 14, y - 27, 10, bold, ACCENT);
  if (lang === 'ko') text(`일금 ${koreanAmount(quote.total)}원정`, M + 120, y - 27, 10, reg, MUTED);
  right(won(quote.total), A4.w - M - 14, y - 29, 16, bold);
  y -= 58;
  // 참고용 안내 — 합계 바로 아래에 눈에 띄게
  const disclaimerLines = wrap(ESTIMATE_DISCLAIMER[lang], bold, 8.5, W - 28);
  const boxH = disclaimerLines.length * 12 + 12;
  page.drawRectangle({ x: M, y: y - boxH + 6, width: W, height: boxH, color: rgb(1, 0.97, 0.9), borderColor: rgb(0.96, 0.82, 0.55), borderWidth: 0.6 });
  disclaimerLines.forEach((ln, i) => text(ln, M + 14, y - 6 - i * 12, 8.5, bold, rgb(0.55, 0.33, 0.04)));
  y -= boxH + 16;

  // ── 행사 개요
  text(L('행사 개요', 'Event'), M, y, 10.5, bold);
  y -= 16;
  const [[eventLabel, eventValue], ...eventDetails] = overview;
  text(eventLabel, M, y, 8, reg, MUTED);
  const eventNameLines = wrap(eventValue, bold, 9.5, W);
  eventNameLines.forEach((line, index) => text(line, M, y - 13 - index * 11, 9.5, bold));
  y -= 27 + eventNameLines.length * 11;
  const ovColW = W / eventDetails.length;
  eventDetails.forEach(([k, v], i) => {
    text(k, M + i * ovColW, y, 8, reg, MUTED);
    wrap(v, bold, 9.5, ovColW - 8).slice(0, 2).forEach((ln, j) => text(ln, M + i * ovColW, y - 13 - j * 11, 9.5, bold));
  });
  y -= 44;

  // ── 품목표
  const cols = { item: M, detail: M + 128, amount: A4.w - M };
  const detailW = cols.amount - 92 - cols.detail;
  const tableHeader = () => {
    page.drawRectangle({ x: M, y: y - 6, width: W, height: 20, color: TINT });
    text(L('품목', 'Item'), cols.item + 6, y, 8.5, bold, MUTED);
    text(L('내용', 'Details'), cols.detail, y, 8.5, bold, MUTED);
    right(L('금액', 'Amount'), cols.amount - 6, y, 8.5, bold, MUTED);
    y -= 22;
  };
  const newPage = () => {
    page = doc.addPage([A4.w, A4.h]);
    y = A4.h - M;
    text(`${L('가견적서', 'Estimate')} ${meta.estimateNo} (${L('계속', 'cont.')})`, M, y - 10, 9, reg, MUTED);
    y -= 34;
    tableHeader();
  };
  text(L('품목', 'Items'), M, y, 10.5, bold);
  y -= 20;
  tableHeader();
  for (const line of quote.lines) {
    const labelLines = wrap(line.label, bold, 9.5, 118);
    const detailLines = line.detail ? wrap(line.detail, reg, 8.5, detailW) : [];
    // y = 이 행의 첫 줄 기준선. 구분선은 마지막 줄 아래 7pt, 다음 행 기준선은 구분선 아래 14pt
    const drop = Math.max((labelLines.length - 1) * 12, (detailLines.length - 1) * 11);
    if (y - drop - 21 < M + 150) newPage();
    labelLines.forEach((ln, i) => text(ln, cols.item + 6, y - i * 12, 9.5, bold));
    detailLines.forEach((ln, i) => text(ln, cols.detail, y - i * 11, 8.5, reg, MUTED));
    right(line.tbd ? L('상담 후 산정', 'TBD') : won(line.amount), cols.amount - 6, y, 9.5, line.tbd ? reg : bold, line.tbd ? MUTED : INK);
    const divider = y - drop - 7;
    hr(divider);
    y = divider - 14;
  }

  // ── 합계
  y -= 4;
  const sumRow = (k: string, v: string, big = false) => {
    right(k, cols.amount - 140, y, big ? 10.5 : 9.5, big ? bold : reg, big ? INK : MUTED);
    right(v, cols.amount - 6, y, big ? 12 : 9.5, big ? bold : reg);
    y -= big ? 20 : 15;
  };
  sumRow(L('공급가액', 'Subtotal'), won(quote.supply));
  sumRow(L('부가세 (10%)', 'VAT (10%)'), won(quote.vat));
  sumRow(L('합계', 'Total'), won(quote.total), true);

  // ── 유의사항
  if (y < M + 120) { page = doc.addPage([A4.w, A4.h]); y = A4.h - M - 10; }
  y -= 10;
  text(L('유의사항', 'Notes'), M, y, 10.5, bold);
  y -= 15;
  for (const n of [...quote.warnings, ...quote.notes, ...notes]) {
    // 두 줄 이상이면 둘째 줄부터 글머리(·) 다음에 맞춘다
    text('·', M, y, 8.5, reg, MUTED);
    for (const ln of wrap(n, reg, 8.5, W - 8)) { text(ln, M + 8, y, 8.5, reg, MUTED); y -= 12; }
  }

  // ── 쪽 번호
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const s = `${SITE_URL.replace('https://', '')}  ·  ${i + 1} / ${pages.length}`;
    p.drawText(s, { x: A4.w - M - reg.widthOfTextAtSize(s, 7.5), y: 24, size: 7.5, font: reg, color: MUTED });
  });

  return doc.save();
}
