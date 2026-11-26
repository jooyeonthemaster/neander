/* ─────────────────────────────────────────────────────────
   보고용 요약 → 한글 파일(.hwpx)
   2026-11-21 사용자 요청: 「한글파일로도 다운받을 수 있게」.
   - HWPX(한글 2014 이후 · 맥 한글이 여는 공개 형식, ZIP + XML)를 브라우저에서 바로 만든다. 서버를 거치지 않는다.
   - 구조 규칙은 SMOAT 시험지 HWPX(한컴 2024 실측 통과)와 한컴이 직접 저장한 파일(졸업.hwpx 등)을 따른다:
       · mimetype 은 첫 항목, 압축 없이
       · borderFill id 는 1부터, 선 굵기는 "0.12 mm" 처럼 숫자 뒤 공백
       · 문단 여백은 hp:switch 로 감싸고 hc:* 에 unit="HWPUNIT"
       · 첫 문단 첫 run 에 secPr + colPr, 표는 그다음 run
       · 줄 배치 정보(lineseg) 폭은 4의 배수가 아니게 → 한글이 열 때 스스로 다시 배치한다
   - 모양은 화면 미리보기와 같다: 제목 상자 → 요약 상자 → Ⅰ·Ⅱ·Ⅲ 소제목 → ❍ 개조식 본문. 글꼴은 모두 휴먼명조.
   ───────────────────────────────────────────────────────── */

import { strToU8, zipSync, type Zippable } from 'fflate';
import { COLOR, LEADING, PAGE, PARA, ROMAN, SIZE, type ReportDoc, type ReportLine } from './report-doc';

/* ── 단위 (HWPUNIT = 1/7200 inch, 1pt = 100) ── */
const mm = (v: number) => Math.round((v * 7200) / 25.4);
const PAGE_W = mm(210);
const PAGE_H = mm(297);
const MARGIN_X = mm(PAGE.marginX);
const MARGIN_TOP = mm(PAGE.marginY);
const MARGIN_BOTTOM = mm(PAGE.marginY);
/** 본문 폭 48190 — 4의 배수가 아니라 한글이 줄 배치를 스스로 다시 한다 */
const BODY_W = PAGE_W - MARGIN_X * 2;
const CELL_MARGIN = { left: 510, right: 510, top: 141, bottom: 141 }; // 5.1pt · 1.41pt — 미리보기 칸 여백과 같다

const FONT_FACE = '휴먼명조';
const FONT_SUBST = '함초롬바탕';

const NS = [
  'xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app"',
  'xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph"',
  'xmlns:hp10="http://www.hancom.co.kr/hwpml/2016/paragraph"',
  'xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section"',
  'xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core"',
  'xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head"',
  'xmlns:hhs="http://www.hancom.co.kr/hwpml/2011/history"',
  'xmlns:hm="http://www.hancom.co.kr/hwpml/2011/master-page"',
  'xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf"',
  'xmlns:dc="http://purl.org/dc/elements/1.1/"',
  'xmlns:opf="http://www.idpf.org/2007/opf/"',
  'xmlns:ooxmlchart="http://www.hancom.co.kr/hwpml/2016/ooxmlchart"',
  'xmlns:hwpunitchar="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar"',
  'xmlns:epub="http://www.idpf.org/2007/ops"',
  'xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0"',
].join(' ');
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';

const esc = (t: string) => t
  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F￾￿]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/* ── 모양 목록 (header.xml 에 선언하고 본문은 번호로 참조) ── */

type Border = { type: 'NONE' | 'SOLID'; width: string; color: string };
const NONE: Border = { type: 'NONE', width: '0.1 mm', color: '#000000' };
const line = (width: string, color = '#000000'): Border => ({ type: 'SOLID', width, color });
interface BorderFill { left: Border; right: Border; top: Border; bottom: Border; fill?: string }

// id 는 1부터 (배열 index + 1)
const BF = {
  none: 1,
  thin: 2,
  titleBox: 3,
  summaryBox: 4,
  headNum: 5,
  headText: 6,
  thHead: 7,
  td: 8,
  tdTotal: 9,
} as const;
const GRAY_LINE = '#D0D0D0';
const BORDER_FILLS: BorderFill[] = [
  { left: NONE, right: NONE, top: NONE, bottom: NONE },
  { left: line('0.12 mm'), right: line('0.12 mm'), top: line('0.12 mm'), bottom: line('0.12 mm') },
  { left: line('0.12 mm', GRAY_LINE), right: line('0.12 mm', GRAY_LINE), top: line('0.12 mm', GRAY_LINE), bottom: line('0.7 mm', COLOR.navy), fill: COLOR.gray },
  { left: line('0.4 mm', COLOR.navy), right: line('0.4 mm', COLOR.navy), top: line('0.4 mm', COLOR.navy), bottom: line('0.4 mm', COLOR.navy) },
  { left: NONE, right: NONE, top: NONE, bottom: line('0.5 mm', COLOR.line), fill: COLOR.navy },
  { left: NONE, right: NONE, top: NONE, bottom: line('0.5 mm', COLOR.line) },
  { left: line('0.12 mm'), right: line('0.12 mm'), top: line('0.4 mm'), bottom: line('0.12 mm'), fill: COLOR.gray },
  { left: line('0.12 mm'), right: line('0.12 mm'), top: line('0.12 mm'), bottom: line('0.12 mm') },
  { left: line('0.12 mm'), right: line('0.12 mm'), top: line('0.12 mm'), bottom: line('0.4 mm'), fill: COLOR.gray },
];

interface CharShape { pt: number; bold?: boolean; color?: string }
const CS = {
  base: 0, body: 1, bodyBold: 2, sub: 3, note: 4, kicker: 5, title: 6, summary: 7,
  headNum: 8, headText: 9, cell: 10, cellBold: 11, unit: 12, attach: 13,
} as const;
// 크기는 report-doc 의 SIZE (화면 미리보기와 같은 표)
const CHAR_SHAPES: CharShape[] = [
  { pt: 10 },
  { pt: SIZE.body },
  { pt: SIZE.body, bold: true },
  { pt: SIZE.sub },
  { pt: SIZE.note, color: '#444444' },
  { pt: SIZE.kicker, color: '#333333' },
  { pt: SIZE.title, bold: true, color: COLOR.navy },
  { pt: SIZE.summary },
  { pt: SIZE.headNum, bold: true, color: '#FFFFFF' },
  { pt: SIZE.headText, bold: true },
  { pt: SIZE.cell },
  { pt: SIZE.cell, bold: true },
  { pt: SIZE.unit },
  { pt: SIZE.attach },
];

interface ParaShape { align: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY'; left?: number; indent?: number; before?: number; after?: number; spacing: number }
const PS = {
  base: 0, bullet: 1, dash: 2, note: 3, center: 4, right: 5, summary: 6,
  cell: 7, cellCenter: 8, cellRight: 9, heading: 10, gap: 11, attach: 12, attachNext: 13,
} as const;
// 내어쓰기: indent 가 음수면 첫 줄이 left+indent 에서 시작하고, 둘째 줄부터 left 에 맞는다
// 간격·내어쓰기는 report-doc 의 PARA(pt) × 100 = HWPUNIT
const u = (pt: number) => Math.round(pt * 100);
const PARA_SHAPES: ParaShape[] = [
  { align: 'JUSTIFY', spacing: LEADING.body },
  { align: 'JUSTIFY', left: u(PARA.bullet.left), indent: u(PARA.bullet.indent), before: u(PARA.bullet.before), spacing: LEADING.body },
  { align: 'JUSTIFY', left: u(PARA.dash.left), indent: u(PARA.dash.indent), before: u(PARA.dash.before), spacing: LEADING.sub },
  { align: 'JUSTIFY', left: u(PARA.note.left), indent: u(PARA.note.indent), before: u(PARA.note.before), spacing: LEADING.note },
  { align: 'CENTER', spacing: LEADING.box },
  { align: 'RIGHT', before: u(PARA.unit.before), after: u(PARA.unit.after), spacing: LEADING.cell },
  { align: 'JUSTIFY', left: u(PARA.summary.left), indent: u(PARA.summary.indent), before: u(PARA.summary.before), spacing: LEADING.summary },
  { align: 'LEFT', spacing: LEADING.cell },
  { align: 'CENTER', spacing: LEADING.cell },
  { align: 'RIGHT', spacing: LEADING.cell },
  { align: 'LEFT', before: u(PARA.heading.before), after: u(PARA.heading.after), spacing: LEADING.cell },
  { align: 'LEFT', before: 600, spacing: 100 },
  { align: 'LEFT', left: u(PARA.attach.left), indent: -u(PARA.attach.left), before: u(PARA.attach.before), spacing: LEADING.body },
  { align: 'LEFT', left: u(PARA.attach.left), spacing: LEADING.body },
];

/* ── header.xml ── */

function headerXml(): string {
  const font = `<hh:font id="0" face="${FONT_FACE}" type="TTF" isEmbedded="0"><hh:substFont face="${FONT_SUBST}" type="TTF" isEmbedded="0" binaryItemIDRef=""/><hh:typeInfo familyType="FCAT_MYUNGJO" weight="5" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/></hh:font>`;
  const fontfaces = ['HANGUL', 'LATIN', 'HANJA', 'JAPANESE', 'OTHER', 'SYMBOL', 'USER']
    .map((lang) => `<hh:fontface lang="${lang}" fontCnt="1">${font}</hh:fontface>`).join('');

  const border = (tag: string, b: Border) => `<hh:${tag} type="${b.type}" width="${b.width}" color="${b.color}"/>`;
  const borderFills = BORDER_FILLS.map((bf, i) => [
    `<hh:borderFill id="${i + 1}" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0">`,
    '<hh:slash type="NONE" Crooked="0" isCounter="0"/><hh:backSlash type="NONE" Crooked="0" isCounter="0"/>',
    border('leftBorder', bf.left), border('rightBorder', bf.right), border('topBorder', bf.top), border('bottomBorder', bf.bottom),
    '<hh:diagonal type="SOLID" width="0.1 mm" color="#000000"/>',
    bf.fill ? `<hc:fillBrush><hc:winBrush faceColor="${bf.fill}" hatchColor="#FF000000" alpha="0"/></hc:fillBrush>` : '',
    '</hh:borderFill>',
  ].join('')).join('');

  const seven = (v: string | number) => `hangul="${v}" latin="${v}" hanja="${v}" japanese="${v}" other="${v}" symbol="${v}" user="${v}"`;
  const charProps = CHAR_SHAPES.map((c, i) => [
    `<hh:charPr id="${i}" height="${Math.round(c.pt * 100)}" textColor="${c.color ?? '#000000'}" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="1">`,
    `<hh:fontRef ${seven(0)}/><hh:ratio ${seven(100)}/><hh:spacing ${seven(0)}/><hh:relSz ${seven(100)}/><hh:offset ${seven(0)}/>`,
    c.bold ? '<hh:bold/>' : '',
    '<hh:underline type="NONE" shape="SOLID" color="#000000"/><hh:strikeout shape="NONE" color="#000000"/><hh:outline type="NONE"/><hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>',
    '</hh:charPr>',
  ].join('')).join('');

  const paraProps = PARA_SHAPES.map((p, i) => {
    const ml = `<hh:margin><hc:intent value="${p.indent ?? 0}" unit="HWPUNIT"/><hc:left value="${p.left ?? 0}" unit="HWPUNIT"/><hc:right value="0" unit="HWPUNIT"/><hc:prev value="${p.before ?? 0}" unit="HWPUNIT"/><hc:next value="${p.after ?? 0}" unit="HWPUNIT"/></hh:margin><hh:lineSpacing type="PERCENT" value="${p.spacing}" unit="HWPUNIT"/>`;
    return [
      `<hh:paraPr id="${i}" tabPrIDRef="0" condense="0" fontLineHeight="0" snapToGrid="1" suppressLineNumbers="0" checked="0">`,
      `<hh:align horizontal="${p.align}" vertical="BASELINE"/>`,
      '<hh:heading type="NONE" idRef="0" level="0"/>',
      '<hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="KEEP_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/>',
      `<hp:switch><hp:case hp:required-namespace="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar">${ml}</hp:case><hp:default>${ml}</hp:default></hp:switch>`,
      '<hh:autoSpacing eAsianEng="0" eAsianNum="0"/>',
      '<hh:border borderFillIDRef="1" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/>',
      '</hh:paraPr>',
    ].join('');
  }).join('');

  const heads = [['DIGIT', '^1.'], ['HANGUL_SYLLABLE', '^2.'], ['DIGIT', '^3)'], ['HANGUL_SYLLABLE', '^4)'], ['DIGIT', '(^5)'], ['HANGUL_SYLLABLE', '(^6)'], ['CIRCLED_DIGIT', '^7']]
    .map(([fmt, text], i) => `<hh:paraHead start="1" level="${i + 1}" align="LEFT" useInstWidth="1" autoIndent="1" widthAdjust="0" textOffsetType="PERCENT" textOffset="50" numFormat="${fmt}" charPrIDRef="4294967295" checkable="${i === 6 ? 1 : 0}">${esc(text)}</hh:paraHead>`).join('');

  return [
    XML_HEAD,
    `<hh:head ${NS} version="1.4" secCnt="1">`,
    '<hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>',
    '<hh:refList>',
    `<hh:fontfaces itemCnt="7">${fontfaces}</hh:fontfaces>`,
    `<hh:borderFills itemCnt="${BORDER_FILLS.length}">${borderFills}</hh:borderFills>`,
    `<hh:charProperties itemCnt="${CHAR_SHAPES.length}">${charProps}</hh:charProperties>`,
    '<hh:tabProperties itemCnt="2"><hh:tabPr id="0" autoTabLeft="0" autoTabRight="0"/><hh:tabPr id="1" autoTabLeft="1" autoTabRight="0"/></hh:tabProperties>',
    `<hh:numberings itemCnt="1"><hh:numbering id="1" start="0">${heads}</hh:numbering></hh:numberings>`,
    `<hh:paraProperties itemCnt="${PARA_SHAPES.length}">${paraProps}</hh:paraProperties>`,
    '<hh:styles itemCnt="1"><hh:style id="0" type="PARA" name="바탕글" engName="Normal" paraPrIDRef="0" charPrIDRef="0" nextStyleIDRef="0" langID="1042" lockForm="0"/></hh:styles>',
    '</hh:refList>',
    '<hh:compatibleDocument targetProgram="HWP201X"><hh:layoutCompatibility/></hh:compatibleDocument>',
    '<hh:docOption><hh:linkinfo path="" pageInherit="0" footnoteInherit="0"/></hh:docOption>',
    '<hh:trackchageConfig flags="56"/>',
    '</hh:head>',
  ].join('');
}

/* ── 본문 ── */

interface Run { text: string; cs: number }

/** 글자 폭 대략 — 한글·기호는 1, 영문·숫자·공백은 0.55 (줄 수 추정용) */
const units = (s: string) => [...s].reduce((n, ch) => n + (/[\u0000-ɏ]/.test(ch) ? 0.55 : 1), 0);

class Writer {
  private pid = 0;
  private ctrl = 1;

  /** 줄 배치 정보 — 한글이 다시 배치하므로 줄 수와 높이만 대략 맞춘다 */
  lineseg(width: number, runs: Run[], ps: number): { xml: string; height: number } {
    const p = PARA_SHAPES[ps];
    const h = Math.max(...runs.map((r) => CHAR_SHAPES[r.cs].pt * 100), 1000);
    const lh = Math.round((h * p.spacing) / 100);
    const avail = Math.max(1000, width - (p.left ?? 0));
    const text = runs.map((r) => r.text).join('');
    const perLine = Math.max(4, avail / h);
    const count = Math.max(1, Math.ceil(units(text) / perLine));
    // 줄 시작 글자 위치 — 글자 수를 같은 비율로 나눈다
    const len = [...text].length;
    const segs = Array.from({ length: count }, (_, i) => {
      const pos = Math.floor((len * i) / count);
      return `<hp:lineseg textpos="${pos}" vertpos="${i * lh}" vertsize="${h}" textheight="${h}" baseline="${Math.round(h * 0.85)}" spacing="${lh - h}" horzpos="0" horzsize="${width}" flags="393216"/>`;
    }).join('');
    return { xml: `<hp:linesegarray>${segs}</hp:linesegarray>`, height: count * lh + (p.before ?? 0) + (p.after ?? 0) };
  }

  para(runs: Run[], ps: number, width = BODY_W): { xml: string; height: number } {
    const body = runs.length
      ? runs.map((r) => `<hp:run charPrIDRef="${r.cs}"><hp:t>${esc(r.text)}</hp:t></hp:run>`).join('')
      : `<hp:run charPrIDRef="${CS.base}"><hp:t></hp:t></hp:run>`;
    const seg = this.lineseg(width, runs.length ? runs : [{ text: '', cs: CS.base }], ps);
    return { xml: `<hp:p id="${this.pid++}" paraPrIDRef="${ps}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">${body}${seg.xml}</hp:p>`, height: seg.height };
  }

  /** 표 하나 — 행마다 칸(폭, 테두리, 문단들) */
  table(widths: number[], rows: { bf: number; paras: { runs: Run[]; ps: number }[]; vAlign?: 'TOP' | 'CENTER' }[][], minRowH = 0): { xml: string; height: number } {
    const total = widths.reduce((a, b) => a + b, 0);
    let tableH = 0;
    const trs = rows.map((cells, r) => {
      const built = cells.map((cell, c) => {
        const inner = widths[c] - CELL_MARGIN.left - CELL_MARGIN.right;
        const ps = cell.paras.map((p) => this.para(p.runs, p.ps, inner));
        return { cell, c, xml: ps.map((p) => p.xml).join(''), h: ps.reduce((s, p) => s + p.height, 0) + CELL_MARGIN.top + CELL_MARGIN.bottom };
      });
      const rowH = Math.max(minRowH, ...built.map((b) => b.h));
      tableH += rowH;
      return `<hp:tr>${built.map(({ cell, c, xml }) => [
        `<hp:tc name="" header="0" hasMargin="1" protect="0" editable="0" dirty="0" borderFillIDRef="${cell.bf}">`,
        `<hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="${cell.vAlign ?? 'CENTER'}" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">${xml}</hp:subList>`,
        `<hp:cellAddr colAddr="${c}" rowAddr="${r}"/><hp:cellSpan colSpan="1" rowSpan="1"/>`,
        `<hp:cellSz width="${widths[c]}" height="${rowH}"/>`,
        `<hp:cellMargin left="${CELL_MARGIN.left}" right="${CELL_MARGIN.right}" top="${CELL_MARGIN.top}" bottom="${CELL_MARGIN.bottom}"/>`,
        '</hp:tc>',
      ].join('')).join('')}</hp:tr>`;
    }).join('');
    const xml = [
      `<hp:tbl id="${this.ctrl++}" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="1" rowCnt="${rows.length}" colCnt="${widths.length}" cellSpacing="0" borderFillIDRef="${BF.none}" noAdjust="0">`,
      `<hp:sz width="${total}" widthRelTo="ABSOLUTE" height="${tableH}" heightRelTo="ABSOLUTE" protect="0"/>`,
      '<hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>',
      '<hp:outMargin left="0" right="0" top="0" bottom="0"/>',
      `<hp:inMargin left="${CELL_MARGIN.left}" right="${CELL_MARGIN.right}" top="${CELL_MARGIN.top}" bottom="${CELL_MARGIN.bottom}"/>`,
      trs,
      '</hp:tbl>',
    ].join('');
    return { xml, height: tableH };
  }

  /** 표를 감싸는 문단 (prelude 가 있으면 첫 문단 — 쪽 설정을 먼저 둔다) */
  tablePara(tbl: { xml: string; height: number }, ps: number, prelude = ''): string {
    const pre = prelude ? `<hp:run charPrIDRef="${CS.base}">${prelude}</hp:run>` : '';
    const seg = `<hp:linesegarray><hp:lineseg textpos="0" vertpos="0" vertsize="${tbl.height}" textheight="${tbl.height}" baseline="${Math.round(tbl.height * 0.85)}" spacing="0" horzpos="0" horzsize="${BODY_W}" flags="393216"/></hp:linesegarray>`;
    return `<hp:p id="${this.pid++}" paraPrIDRef="${ps}" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">${pre}<hp:run charPrIDRef="${CS.base}">${tbl.xml}<hp:t></hp:t></hp:run>${seg}</hp:p>`;
  }
}

function secPr(): string {
  return [
    '<hp:secPr id="" textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" tabStopVal="4000" tabStopUnit="HWPUNIT" outlineShapeIDRef="1" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0">',
    '<hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/>',
    '<hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/>',
    '<hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/>',
    '<hp:lineNumberShape restartType="0" countBy="0" distance="0" startNumber="0"/>',
    `<hp:pagePr landscape="WIDELY" width="${PAGE_W}" height="${PAGE_H}" gutterType="LEFT_ONLY">`,
    `<hp:margin header="${mm(10)}" footer="${mm(10)}" gutter="0" left="${MARGIN_X}" right="${MARGIN_X}" top="${MARGIN_TOP}" bottom="${MARGIN_BOTTOM}"/>`,
    '</hp:pagePr>',
    '<hp:footNotePr><hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/><hp:noteLine length="-1" type="SOLID" width="0.12 mm" color="#000000"/><hp:noteSpacing betweenNotes="283" belowLine="567" aboveLine="850"/><hp:numbering type="CONTINUOUS" newNum="1"/><hp:placement place="EACH_COLUMN" beneathText="0"/></hp:footNotePr>',
    '<hp:endNotePr><hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/><hp:noteLine length="14692344" type="SOLID" width="0.12 mm" color="#000000"/><hp:noteSpacing betweenNotes="0" belowLine="567" aboveLine="850"/><hp:numbering type="CONTINUOUS" newNum="1"/><hp:placement place="END_OF_DOCUMENT" beneathText="0"/></hp:endNotePr>',
    ...['BOTH', 'EVEN', 'ODD'].map((t) => `<hp:pageBorderFill type="${t}" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER"><hp:offset left="1417" right="1417" top="1417" bottom="1417"/></hp:pageBorderFill>`),
    '</hp:secPr>',
    '<hp:ctrl><hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="1" sameSz="1" sameGap="0"/></hp:ctrl>',
  ].join('');
}

function lineRuns(l: ReportLine): { runs: Run[]; ps: number } {
  const cs = l.mark === '❍' ? CS.body : l.mark === '-' ? CS.sub : CS.note;
  const runs: Run[] = [{ text: `${l.mark} `, cs }];
  if (l.label) runs.push({ text: `${l.label} : `, cs: l.mark === '❍' ? CS.bodyBold : cs });
  runs.push({ text: l.text, cs });
  return { runs, ps: l.mark === '❍' ? PS.bullet : l.mark === '-' ? PS.dash : PS.note };
}

function sectionXml(doc: ReportDoc): string {
  const w = new Writer();
  const out: string[] = [];

  // 제목 상자 (첫 문단 — 쪽 설정과 함께)
  const title = w.table([BODY_W], [[{ bf: BF.titleBox, paras: [
    { runs: [{ text: doc.kicker, cs: CS.kicker }], ps: PS.center },
    { runs: [{ text: doc.title, cs: CS.title }], ps: PS.center },
  ] }]], 2600);
  out.push(w.tablePara(title, PS.base, secPr()));

  // 요약 상자
  out.push(w.para([], PS.gap).xml);
  const summary = w.table([BODY_W], [[{ bf: BF.summaryBox, paras: doc.summary.map((t) => ({ runs: [{ text: `▫ ${t}`, cs: CS.summary }], ps: PS.summary })) }]]);
  out.push(w.tablePara(summary, PS.base));

  doc.sections.forEach((sec, i) => {
    const numW = mm(PAGE.headNumWidth);
    const head = w.table([numW, BODY_W - numW], [[
      { bf: BF.headNum, paras: [{ runs: [{ text: ROMAN[i] ?? String(i + 1), cs: CS.headNum }], ps: PS.cellCenter }] },
      { bf: BF.headText, paras: [{ runs: [{ text: sec.title, cs: CS.headText }], ps: PS.cell }] },
    ]]);
    out.push(w.tablePara(head, PS.heading));
    for (const b of sec.blocks) {
      if (b.kind === 'lines') {
        for (const l of b.items) { const { runs, ps } = lineRuns(l); out.push(w.para(runs, ps).xml); }
      } else {
        out.push(w.para([{ text: b.unit, cs: CS.unit }], PS.right).xml);
        const widths = [mm(PAGE.budgetCols[0]), 0, mm(PAGE.budgetCols[2])];
        widths[1] = BODY_W - widths[0] - widths[2];
        const cell = (text: string, ps: number, bf: number, bold = false) => ({ bf, paras: [{ runs: [{ text, cs: bold ? CS.cellBold : CS.cell }], ps }] });
        const rows = [
          b.head.map((h) => cell(h, PS.cellCenter, BF.thHead, true)),
          ...b.rows.map((r) => [cell(r[0], PS.cellCenter, BF.td), cell(r[1], PS.cell, BF.td), cell(r[2], PS.cellRight, BF.td)]),
          ...b.foot.map((r, k) => {
            const bf = k === b.foot.length - 1 ? BF.tdTotal : BF.td;
            return [cell(r[0], PS.cellCenter, bf, true), cell(r[1], PS.cell, bf), cell(r[2], PS.cellRight, bf, true)];
          }),
        ];
        out.push(w.tablePara(w.table(widths, rows, 1100), PS.base));
      }
    }
  });

  // 붙임
  doc.attachments.forEach((a, i) => {
    const last = i === doc.attachments.length - 1;
    const text = `${i + 1}. ${a}${last ? '.  끝.' : ''}`;
    out.push(w.para(i === 0 ? [{ text: '붙임', cs: CS.attach }, { text: `  ${text}`, cs: CS.attach }] : [{ text, cs: CS.attach }], i === 0 ? PS.attach : PS.attachNext).xml);
  });

  return `${XML_HEAD}<hs:sec ${NS}>${out.join('')}</hs:sec>`;
}

/* ── 꾸러미 ── */

function contentHpf(title: string): string {
  const iso = new Date().toISOString().slice(0, 19) + 'Z';
  return [
    XML_HEAD,
    `<opf:package ${NS} version="" unique-identifier="" id="">`,
    `<opf:metadata><opf:title>${esc(title)}</opf:title><opf:language>ko</opf:language>`,
    '<opf:meta name="creator" content="text">NEANDER</opf:meta><opf:meta name="subject" content="text"/><opf:meta name="description" content="text"/><opf:meta name="lastsaveby" content="text"/>',
    `<opf:meta name="CreatedDate" content="text">${iso}</opf:meta><opf:meta name="ModifiedDate" content="text">${iso}</opf:meta><opf:meta name="date" content="text">${iso}</opf:meta><opf:meta name="keyword" content="text"/>`,
    '</opf:metadata>',
    '<opf:manifest><opf:item id="header" href="Contents/header.xml" media-type="application/xml"/><opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/><opf:item id="settings" href="settings.xml" media-type="application/xml"/></opf:manifest>',
    '<opf:spine><opf:itemref idref="header"/><opf:itemref idref="section0"/></opf:spine>',
    '</opf:package>',
  ].join('');
}

export function reportToHwpx(doc: ReportDoc): Uint8Array {
  const files: Zippable = {
    // mimetype 은 반드시 첫 항목, 압축 없이
    mimetype: [strToU8('application/hwp+zip'), { level: 0 }],
    'META-INF/container.xml': strToU8(`${XML_HEAD}<ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf"><ocf:rootfiles><ocf:rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/></ocf:rootfiles></ocf:container>`),
    'META-INF/manifest.xml': strToU8(`${XML_HEAD}<odf:manifest xmlns:odf="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"/>`),
    'version.xml': strToU8(`${XML_HEAD}<hv:HCFVersion xmlns:hv="http://www.hancom.co.kr/hwpml/2011/version" tagetApplication="WORDPROCESSOR" major="5" minor="0" micro="5" buildNumber="0" xmlVersion="1.4" application="NEANDER" appVersion="1.0.0.0"/>`),
    'settings.xml': strToU8(`${XML_HEAD}<ha:HWPApplicationSetting xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0"><ha:CaretPosition listIDRef="0" paraIDRef="0" pos="0"/></ha:HWPApplicationSetting>`),
    'Contents/content.hpf': strToU8(contentHpf(doc.title)),
    'Contents/header.xml': strToU8(headerXml()),
    'Contents/section0.xml': strToU8(sectionXml(doc)),
  };
  return zipSync(files, { level: 6 });
}

/** 파일 이름에 쓸 수 없는 글자를 뺀다 */
export function hwpxFileName(doc: ReportDoc): string {
  return `${doc.title.replace(/[\\/:*?"<>|]/g, '').trim() || '보고서'}.hwpx`;
}
