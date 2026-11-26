'use client';

import type { CSSProperties, ReactNode } from 'react';
import { COLOR, FONT, LEADING, PAGE, PARA, ROMAN, SIZE, type ReportDoc, type ReportLine } from './report-doc';

/* ─────────────────────────────────────────────────────────
   보고서 첫 장 미리보기 — 온라인 견적 마지막 단계의 「보고서」 썸네일.
   실제 A4(595 × 842pt)를 1pt = 1px 로 그리고, 썸네일(FinalThumbs)이 칸 폭에 맞춰 줄인다.
   글자 크기 · 간격 · 여백은 한글 파일(report-hwpx) · 인쇄(report-actions)와 같은 report-doc 값을 쓴다.
   ───────────────────────────────────────────────────────── */

const pt = (n: number) => `calc(var(--pt) * ${n})`;
const lead = (pct: number) => pct / 100;

/* ── 문서를 쪽 나누기 단위로 편다 ── */

type Item =
  | { k: 'title' }
  | { k: 'summary' }
  | { k: 'heading'; n: number; title: string }
  | { k: 'line'; l: ReportLine }
  | { k: 'unit'; text: string }
  | { k: 'row'; t: number; cells: string[]; foot: boolean; total: boolean }
  | { k: 'attach' };

function flatten(doc: ReportDoc): { items: Item[]; heads: string[][] } {
  const items: Item[] = [{ k: 'title' }, { k: 'summary' }];
  const heads: string[][] = [];
  doc.sections.forEach((sec, n) => {
    items.push({ k: 'heading', n, title: sec.title });
    for (const b of sec.blocks) {
      if (b.kind === 'lines') b.items.forEach((l) => items.push({ k: 'line', l }));
      else {
        const t = heads.push(b.head) - 1;
        items.push({ k: 'unit', text: b.unit });
        b.rows.forEach((cells) => items.push({ k: 'row', t, cells, foot: false, total: false }));
        b.foot.forEach((cells, i) => items.push({ k: 'row', t, cells, foot: true, total: i === b.foot.length - 1 }));
      }
    }
  });
  items.push({ k: 'attach' });
  return { items, heads };
}

/* ── 조각 그리기 ── */

function Line({ l }: { l: ReportLine }) {
  const k = l.mark === '❍' ? 'bullet' : l.mark === '-' ? 'dash' : 'note';
  const p = PARA[k];
  const size = k === 'bullet' ? SIZE.body : k === 'dash' ? SIZE.sub : SIZE.note;
  const lh = k === 'bullet' ? LEADING.body : k === 'dash' ? LEADING.sub : LEADING.note;
  return (
    <p style={{ paddingTop: pt(p.before), paddingLeft: pt(p.left), textIndent: pt(p.indent), fontSize: pt(size), lineHeight: lead(lh), color: k === 'note' ? '#444' : undefined }}>
      {l.mark} {l.label && <b className="font-bold">{l.label} : </b>}
      {l.text}
    </p>
  );
}

const cellPad = { padding: `${pt(1.4)} ${pt(5.1)}` };
const colPct = (mmw: number) => `${(mmw / PAGE.bodyWidth) * 100}%`;

function Table({ head, rows, startIdx }: { head: string[]; rows: Extract<Item, { k: 'row' }>[]; startIdx: number }) {
  const [c1, c2, c3] = PAGE.budgetCols;
  return (
    <table className="w-full border-collapse" style={{ fontSize: pt(SIZE.cell), lineHeight: lead(LEADING.cell), borderTop: `${pt(1.2)} solid #000`, borderBottom: `${pt(1.2)} solid #000` }}>
      <colgroup><col style={{ width: colPct(c1) }} /><col style={{ width: colPct(c2) }} /><col style={{ width: colPct(c3) }} /></colgroup>
      <thead data-thead>
        <tr>{head.map((h) => <th key={h} className="border border-[#333] text-center font-bold" style={{ ...cellPad, background: COLOR.gray }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, j) => (
          <tr key={j} data-i={startIdx + j} className={r.foot ? 'font-bold' : undefined} style={r.total ? { background: COLOR.gray } : undefined}>
            <td className="whitespace-nowrap border border-[#333] text-center" style={cellPad}>{r.cells[0]}</td>
            <td className={r.foot ? 'border border-[#333] font-normal' : 'border border-[#333]'} style={cellPad}>{r.cells[1]}</td>
            <td className="whitespace-nowrap border border-[#333] text-right tabular-nums" style={cellPad}>{r.cells[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 항목 목록을 그린다 — 이어지는 표 행은 하나의 표로 묶는다. data-i 는 높이 재기용 */
function Flow({ doc, items, heads, indices }: { doc: ReportDoc; items: Item[]; heads: string[][]; indices: number[] }) {
  const out: ReactNode[] = [];
  for (let n = 0; n < indices.length; n++) {
    const i = indices[n];
    const it = items[i];
    if (it.k === 'row') {
      const rows: Extract<Item, { k: 'row' }>[] = [it];
      while (n + 1 < indices.length && indices[n + 1] === indices[n] + 1) {
        const next = items[indices[n + 1]];
        if (next.k !== 'row' || next.t !== it.t) break;
        rows.push(next);
        n++;
      }
      out.push(<Table key={`t${i}`} head={heads[it.t]} rows={rows} startIdx={i} />);
      continue;
    }
    out.push(<div key={i} data-i={i}>{renderItem(doc, it)}</div>);
  }
  return <>{out}</>;
}

function renderItem(doc: ReportDoc, it: Exclude<Item, { k: 'row' }>): ReactNode {
  switch (it.k) {
    case 'title':
      return (
        <div className="border border-[#d0d0d0] text-center" style={{ background: COLOR.gray, borderBottom: `${pt(2)} solid ${COLOR.navy}`, padding: `${pt(6)} ${pt(5.1)}`, lineHeight: lead(LEADING.box) }}>
          <p style={{ fontSize: pt(SIZE.kicker), color: '#333' }}>{doc.kicker}</p>
          <p className="font-bold" style={{ fontSize: pt(SIZE.title), color: COLOR.navy }}>{doc.title}</p>
        </div>
      );
    case 'summary':
      return (
        <div style={{ marginTop: pt(6), border: `${pt(1.2)} solid ${COLOR.navy}`, padding: `${pt(3)} ${pt(5.1)}`, fontSize: pt(SIZE.summary), lineHeight: lead(LEADING.summary) }}>
          {doc.summary.map((t) => (
            <p key={t} style={{ paddingTop: pt(PARA.summary.before), paddingLeft: pt(PARA.summary.left), textIndent: pt(PARA.summary.indent) }}>▫ {t}</p>
          ))}
        </div>
      );
    case 'heading':
      return (
        <div style={{ paddingTop: pt(PARA.heading.before), paddingBottom: pt(PARA.heading.after) }}>
          <h4 className="flex items-stretch font-bold" style={{ borderBottom: `${pt(1.4)} solid ${COLOR.line}`, lineHeight: lead(LEADING.cell) }}>
            <span className="grid shrink-0 place-items-center text-[#fff]" style={{ width: `${(PAGE.headNumWidth / PAGE.bodyWidth) * 100}%`, background: COLOR.navy, fontSize: pt(SIZE.headNum), padding: `${pt(1)} 0` }}>{ROMAN[it.n] ?? it.n + 1}</span>
            <span style={{ fontSize: pt(SIZE.headText), padding: `${pt(1)} ${pt(5.1)}` }}>{it.title}</span>
          </h4>
        </div>
      );
    case 'line':
      return <Line l={it.l} />;
    case 'unit':
      return <p className="text-right" style={{ paddingTop: pt(PARA.unit.before), paddingBottom: pt(PARA.unit.after), fontSize: pt(SIZE.unit), lineHeight: lead(LEADING.cell) }}>{it.text}</p>;
    case 'attach':
      return (
        <div style={{ paddingTop: pt(PARA.attach.before), paddingLeft: pt(PARA.attach.left), textIndent: pt(-PARA.attach.left), fontSize: pt(SIZE.attach) }}>
          {doc.attachments.map((a, i) => (
            <p key={a} style={i ? { textIndent: 0 } : undefined}>{i === 0 && <span className="inline-block" style={{ width: pt(PARA.attach.left), textIndent: 0 }}>붙임</span>}{i + 1}. {a}{i === doc.attachments.length - 1 && <span>.&nbsp;&nbsp;끝.</span>}</p>
          ))}
        </div>
      );
  }
}

/** 보고서 첫 장 — 1pt = 1px 의 실제 A4 크기(595 × 842px)로 그린다. 견적 마지막 단계 썸네일이 줄여서 쓴다. */
export function ReportFirstPage({ doc }: { doc: ReportDoc }) {
  const { items, heads } = flatten(doc);
  const mmPx = 72 / 25.4;
  return (
    <div className="overflow-hidden bg-[#fff] text-[#111]"
      style={{ '--pt': '1px', width: 595.28, height: 841.89, padding: `${PAGE.marginY * mmPx}px ${PAGE.marginX * mmPx}px`, fontFamily: FONT.body, fontSize: SIZE.body, lineHeight: lead(LEADING.body) } as CSSProperties}>
      <div className="flow-root">
        <Flow doc={doc} items={items} heads={heads} indices={items.map((_, i) => i)} />
      </div>
    </div>
  );
}
