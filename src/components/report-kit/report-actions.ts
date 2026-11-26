import { reportToHtml, type ReportDoc } from './report-doc';

/* 보고서 내려받기 — 보고용 요약 테스트 페이지와 온라인 견적이 같이 쓴다 */

/** 새 창에 A4 한 장으로 띄워 인쇄 대화상자를 연다 (PDF로 저장 포함) */
export function openPrintWindow(): Window | null {
  return window.open('', '_blank', 'width=860,height=1000');
}

/** 창은 누른 순간 열어야 팝업 차단에 걸리지 않는다 — 문서를 늦게 만들면 openPrintWindow() 로 먼저 연 창을 넘긴다 */
export function printDoc(doc: ReportDoc, w: Window | null = openPrintWindow()): boolean {
  if (!w) return false;
  const safeTitle = doc.title.replace(/</g, '&lt;');
  w.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${safeTitle}</title>
<style>@page{size:A4;margin:15mm 20mm}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}p{margin:0}body{margin:24px auto;max-width:170mm}@media print{body{margin:0;max-width:none}}</style></head>
<body>${reportToHtml(doc)}<script>window.onload=function(){window.focus();window.print();}<\/script></body></html>`);
  w.document.close();
  return true;
}

/** 한글 파일(.hwpx) — 만드는 코드는 누를 때만 불러온다 */
export async function downloadHwpx(doc: ReportDoc): Promise<boolean> {
  try {
    const { reportToHwpx, hwpxFileName } = await import('./report-hwpx');
    const bytes = reportToHwpx(doc);
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/hwp+zip' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = hwpxFileName(doc);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return true;
  } catch {
    return false;
  }
}

