/* ─────────────────────────────────────────────────────────
   보고서(ReportDoc) — 온라인 견적 마지막 단계에서 받는 「보고서」의 내용과 모양 기준.
   2026-11-21 사용자 요청: 행사 담당자가 윗선에 올리는 공무원 보고서 양식(보고서 1.hwp)으로.
     제목 상자(「- ○○을 위한 -」 + 「○○ 운영계획(안)」) → 요약 상자 → Ⅰ·Ⅱ·Ⅲ 소제목 → ❍ 개조식 본문 (- 세부, ※ 참고)
   - 내용은 report-quote.ts 가 견적에서 만든다.
   - 글자 크기 · 간격 · 쪽 여백(SIZE · LEADING · PARA · PAGE)은 썸네일 · 한글 파일 · 인쇄(PDF)가 모두 이 값을 쓴다.
   ───────────────────────────────────────────────────────── */

export interface ReportLine { mark: '❍' | '-' | '※'; text: string; label?: string }

export type ReportBlock =
  | { kind: 'lines'; items: ReportLine[] }
  | { kind: 'table'; unit: string; head: string[]; rows: string[][]; foot: string[][] };

export interface ReportSection { title: string; blocks: ReportBlock[] }

export interface ReportDoc {
  /** 제목 위 작은 줄 — 「- ○○을 위한 -」 */
  kicker: string;
  title: string;
  /** 요약 상자 */
  summary: string[];
  sections: ReportSection[];
  /** 붙임 */
  attachments: string[];
}

export const ROMAN = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'];

/* ── 복사용 ── */

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 글꼴 — 2026-11-21 사용자 요청으로 제목·요약·표까지 모두 명조로 통일한다.
 *  한글(HWP)이 깔린 PC에서는 휴먼명조, 없으면 바탕·애플명조 등 비슷한 명조로 */
const MYEONGJO = "'휴먼명조','HumanMyeongjo','한컴바탕','HCR Batang','바탕','Batang','AppleMyungjo','Noto Serif KR',serif";
export const FONT = { head: MYEONGJO, body: MYEONGJO, box: MYEONGJO };
/** 글자 크기(pt) — 화면 미리보기 · 한글 파일 · 복사/인쇄가 모두 이 표를 쓴다 (2026-11-21: 본문 14pt) */
export const SIZE = { body: 14, sub: 12.5, note: 11, kicker: 12, title: 19, summary: 12.5, headNum: 14, headText: 16, cell: 10.5, unit: 10.5, attach: 13 };
/** 줄 간격(%) */
export const LEADING = { body: 160, sub: 150, note: 150, summary: 150, cell: 130, box: 140 };
/** 문단 위 간격 · 내어쓰기(pt). 내어쓰기는 left 에서 시작하고 첫 줄만 indent(음수)만큼 앞으로 나온다 */
export const PARA = {
  bullet: { left: 26, indent: -22, before: 5 },
  dash: { left: 43, indent: -13, before: 2 },
  note: { left: 20, indent: -16, before: 2 },
  summary: { left: 18, indent: -18, before: 1 },
  heading: { before: 18, after: 4 },
  unit: { before: 4, after: 2 },
  attach: { left: 40, before: 24 },
};
/** A4 쪽 여백(mm)과 표 칸 너비(mm) */
export const PAGE = { width: 210, marginX: 20, marginY: 15, bodyWidth: 170, headNumWidth: 6, budgetCols: [33, 109, 28] };

export const COLOR = { navy: '#1f3864', blue: '#2f80ed', line: '#4a90e2', gray: '#f2f2f2' };

function lineHtml(l: ReportLine): string {
  const k = l.mark === '❍' ? 'bullet' : l.mark === '-' ? 'dash' : 'note';
  const p = PARA[k];
  const size = k === 'bullet' ? SIZE.body : k === 'dash' ? SIZE.sub : SIZE.note;
  const lead = k === 'bullet' ? LEADING.body : k === 'dash' ? LEADING.sub : LEADING.note;
  const label = l.label ? `<b>${esc(l.label)}</b> : ` : '';
  return `<p style="margin:${p.before}pt 0 0 ${p.left}pt;text-indent:${p.indent}pt;font-size:${size}pt;line-height:${lead}%;${k === 'note' ? 'color:#444;' : ''}">${l.mark} ${label}${esc(l.text)}</p>`;
}

/** 한글(HWP)·워드·그룹웨어 편집기에 붙여도 모양이 유지되도록 표·인라인 스타일만 쓴다 */
export function reportToHtml(doc: ReportDoc): string {
  const out: string[] = [`<div style="font-family:${FONT.body};font-size:${SIZE.body}pt;line-height:${LEADING.body}%;color:#000;">`];
  // 제목 상자 — 회색 바탕, 아래 남색 띠
  out.push(`<table style="border-collapse:collapse;width:100%;"><tr><td style="background:${COLOR.gray};border:1px solid #d0d0d0;border-bottom:2pt solid ${COLOR.navy};padding:6pt 5pt;text-align:center;line-height:${LEADING.box}%;">`
    + `<p style="margin:0;font-size:${SIZE.kicker}pt;color:#333;">${esc(doc.kicker)}</p>`
    + `<p style="margin:0;font-size:${SIZE.title}pt;font-weight:bold;color:${COLOR.navy};">${esc(doc.title)}</p></td></tr></table>`);
  // 요약 상자
  out.push(`<table style="border-collapse:collapse;width:100%;margin-top:6pt;"><tr><td style="border:1.2pt solid ${COLOR.navy};padding:3pt 5pt;font-size:${SIZE.summary}pt;line-height:${LEADING.summary}%;">`
    + doc.summary.map((t) => `<p style="margin:${PARA.summary.before}pt 0 0 ${PARA.summary.left}pt;text-indent:${PARA.summary.indent}pt;">▫ ${esc(t)}</p>`).join('') + '</td></tr></table>');
  doc.sections.forEach((sec, i) => {
    out.push(`<table style="border-collapse:collapse;width:100%;margin:${PARA.heading.before}pt 0 ${PARA.heading.after}pt;"><tr>`
      + `<td style="width:${PAGE.headNumWidth}mm;background:${COLOR.navy};color:#fff;text-align:center;font-size:${SIZE.headNum}pt;font-weight:bold;border-bottom:1.4pt solid ${COLOR.line};padding:1pt 0;">${ROMAN[i] ?? i + 1}</td>`
      + `<td style="font-size:${SIZE.headText}pt;font-weight:bold;border-bottom:1.4pt solid ${COLOR.line};padding:1pt 5pt;">${esc(sec.title)}</td></tr></table>`);
    for (const b of sec.blocks) {
      if (b.kind === 'lines') out.push(b.items.map(lineHtml).join(''));
      else {
        const cell = `border:1px solid #000;padding:1.4pt 5pt;vertical-align:middle;font-size:${SIZE.cell}pt;line-height:${LEADING.cell}%;`;
        const num = 'text-align:right;white-space:nowrap;';
        const [c1, c2, c3] = PAGE.budgetCols;
        out.push(`<p style="margin:${PARA.unit.before}pt 0 ${PARA.unit.after}pt;text-align:right;font-size:${SIZE.unit}pt;">${esc(b.unit)}</p>`
          + `<table style="border-collapse:collapse;width:100%;border-top:1.2pt solid #000;border-bottom:1.2pt solid #000;"><colgroup><col style="width:${c1}mm"><col style="width:${c2}mm"><col style="width:${c3}mm"></colgroup>`
          + `<tr>${b.head.map((h) => `<td style="${cell}background:${COLOR.gray};font-weight:bold;text-align:center;">${esc(h)}</td>`).join('')}</tr>`
          + b.rows.map((r) => `<tr><td style="${cell}text-align:center;white-space:nowrap;">${esc(r[0])}</td><td style="${cell}">${esc(r[1])}</td><td style="${cell}${num}">${esc(r[2])}</td></tr>`).join('')
          + b.foot.map((r, k) => `<tr><td style="${cell}text-align:center;font-weight:bold;${k === b.foot.length - 1 ? `background:${COLOR.gray};` : ''}">${esc(r[0])}</td><td style="${cell}">${esc(r[1])}</td><td style="${cell}${num}font-weight:bold;${k === b.foot.length - 1 ? `background:${COLOR.gray};` : ''}">${esc(r[2])}</td></tr>`).join('')
          + '</table>');
      }
    }
  });
  out.push(`<p style="margin:${PARA.attach.before}pt 0 0 ${PARA.attach.left}pt;text-indent:-${PARA.attach.left}pt;font-size:${SIZE.attach}pt;">붙임&nbsp;&nbsp;${doc.attachments.map((a, i) => `${i + 1}. ${esc(a)}${i === doc.attachments.length - 1 ? '.&nbsp;&nbsp;끝.' : '<br>'}`).join('')}</p>`);
  out.push('</div>');
  return out.join('');
}
