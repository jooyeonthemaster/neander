/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — printouts
   데모 결과를 현장 출력물(감열지 영수증 / 4×6 인화지)로 그린다.
   화면에 보이는 출력물과 "출력물 저장" 이미지가 같은 캔버스 결과물이다.
   ───────────────────────────────────────────────────────── */

import type { ReactElement } from 'react';
import { renderLook, type PhotoLook } from './photo';
import { seededRandom } from './core';

/* ── Spec ─────────────────────────────────────────────── */

export type ReceiptSection =
  /** 라벨 ······ 값 */
  | { type: 'rows'; title?: string; rows: { label: string; value: string }[] }
  /** 라벨 ■■■■■□□□□□ 값 (0–100) */
  | { type: 'bars'; title?: string; bars: { label: string; value: number }[] }
  /** 줄바꿈되는 문단 */
  | { type: 'text'; title?: string; text: string }
  /** • 항목 */
  | { type: 'list'; title?: string; items: string[] }
  /** 가운데 큰 글씨 (점수·코드 등) */
  | { type: 'big'; title?: string; text: string }
  /** 막대 파형 (0–1) */
  | { type: 'waveform'; title?: string; values: number[] };

export interface ReceiptSpec {
  kind: 'receipt';
  /** 제목 위 작은 줄 (예: 'AI 피부 분석 결과') */
  eyebrow?: string;
  /** 결과 이름 — 크게 인쇄된다 */
  title: string;
  /** 감열 흑백으로 인쇄할 사진 */
  photo?: { src: string; look?: PhotoLook };
  sections: ReceiptSection[];
  /** 맨 아래 한 줄 메시지 */
  footer?: string;
}

export interface PhotoPrintSpec {
  kind: 'photo';
  /** 1장이면 크게, 2–4장이면 2열 격자 */
  photos: {
    src: string;
    look?: PhotoLook;
    label?: string;
    /** 사진 위에 얹을 정적 SVG (viewBox 0 0 300 400, motion 요소 금지) */
    overlay?: ReactElement;
  }[];
  title: string;
  caption?: string;
  /** 사진 오른쪽 위 배지 (예: 'SECRET', 'No.0427') */
  badge?: string;
  /** 인화지 테두리 색 */
  paper?: 'white' | 'cream' | 'black';
}

export type PrintSpec = ReceiptSpec | PhotoPrintSpec;

export interface PrintMeta {
  serviceName: string;
  serial: string;
  date: Date;
  accent: string;
}

export interface RenderedPrint {
  url: string;
  width: number;
  height: number;
}

/* ── Helpers ──────────────────────────────────────────── */

const RECEIPT_FONT = '"D2Coding", "Nanum Gothic Coding", ui-monospace, "SFMono-Regular", Menlo, "Apple SD Gothic Neo", "Noto Sans KR", monospace';
const PHOTO_FONT = '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif';
const INK = '#1d1d1f';
const PAPER = '#fbfaf6';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function formatPrintDate(date: Date) {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 공백 기준으로 줄바꿈하고, 너무 긴 단어는 글자 단위로 자른다 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      if (ctx.measureText(word).width <= maxWidth) {
        line = word;
        continue;
      }
      line = '';
      for (const ch of word) {
        if (ctx.measureText(line + ch).width > maxWidth) {
          lines.push(line);
          line = ch;
        } else {
          line += ch;
        }
      }
    }
    lines.push(line);
  }
  return lines;
}

/** object-fit: cover 로 그리기 */
function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

/** 정적 SVG 엘리먼트를 이미지로 만든다 (react-dom/client로 한 번 그려 마크업을 얻는다) */
async function overlayToImage(overlay: ReactElement): Promise<HTMLImageElement | null> {
  try {
    const [{ createRoot }, { flushSync }] = await Promise.all([import('react-dom/client'), import('react-dom')]);
    const host = document.createElement('div');
    const root = createRoot(host);
    flushSync(() => root.render(overlay));
    let markup = host.innerHTML;
    root.unmount();
    if (!markup.includes('xmlns=')) markup = markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    return await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`);
  } catch {
    return null;
  }
}

function drawBarcode(ctx: CanvasRenderingContext2D, seedText: string, cx: number, y: number, width: number, height: number) {
  let seed = 0;
  for (const ch of seedText) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  let x = cx - width / 2;
  const end = cx + width / 2;
  let i = 0;
  ctx.fillStyle = INK;
  while (x < end) {
    const bar = 2 + Math.floor(seededRandom(seed, `b${i}`) * 3) * 2;
    const gap = 2 + Math.floor(seededRandom(seed, `g${i}`) * 3) * 2;
    ctx.fillRect(x, y, Math.min(bar, end - x), height);
    x += bar + gap;
    i++;
  }
}

/* ── Receipt ──────────────────────────────────────────── */

const RECEIPT_W = 576;

async function renderReceipt(spec: ReceiptSpec, meta: PrintMeta): Promise<RenderedPrint> {
  const photo = spec.photo
    ? await loadImage(await renderLook(spec.photo.src, { ...spec.photo.look, effect: { kind: 'dither' } }))
    : null;

  // 높이를 모르니 넉넉한 캔버스에 그린 뒤 실제 높이만큼 잘라낸다
  const draft = document.createElement('canvas');
  draft.width = RECEIPT_W;
  draft.height = 6000;
  const ctx = draft.getContext('2d')!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, draft.width, draft.height);
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  ctx.textBaseline = 'top';

  const L = 40;
  const R = RECEIPT_W - 40;
  const C = RECEIPT_W / 2;
  const inner = R - L;
  let y = 44;

  const font = (size: number, weight = 400) => {
    ctx.font = `${weight} ${size}px ${RECEIPT_FONT}`;
  };
  const center = (text: string, size: number, weight = 400, gap = 8) => {
    font(size, weight);
    ctx.textAlign = 'center';
    for (const line of wrapText(ctx, text, inner)) {
      ctx.fillText(line, C, y);
      y += size + gap;
    }
    ctx.textAlign = 'left';
  };
  const dashed = () => {
    y += 10;
    ctx.save();
    ctx.setLineDash([8, 7]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(L, y);
    ctx.lineTo(R, y);
    ctx.stroke();
    ctx.restore();
    y += 22;
  };
  const row = (label: string, value: string, size = 22, weight = 400) => {
    font(size, weight);
    const valueLines = wrapText(ctx, value, inner * 0.62);
    ctx.fillText(label, L, y);
    ctx.textAlign = 'right';
    valueLines.forEach((line, i) => ctx.fillText(line, R, y + i * (size + 6)));
    // 점선 리더
    const labelEnd = L + ctx.measureText(label).width + 10;
    const valueStart = R - ctx.measureText(valueLines[0] ?? '').width - 10;
    ctx.textAlign = 'left';
    if (valueStart - labelEnd > 16) {
      ctx.save();
      ctx.setLineDash([2, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(labelEnd, y + size * 0.72);
      ctx.lineTo(valueStart, y + size * 0.72);
      ctx.stroke();
      ctx.restore();
    }
    y += valueLines.length * (size + 6) + 6;
  };
  const sectionTitle = (title?: string) => {
    if (!title) return;
    font(22, 800);
    ctx.fillText(`■ ${title}`, L, y);
    y += 36;
  };

  // Header
  font(46, 900);
  ctx.textAlign = 'center';
  ctx.fillText('NEANDER', C, y);
  y += 56;
  center('AI EXPERIENCE LAB', 18, 700, 4);
  dashed();
  row('체험', meta.serviceName, 20);
  row('일시', formatPrintDate(meta.date), 20);
  row('번호', meta.serial, 20);
  dashed();

  // Title
  if (spec.eyebrow) center(spec.eyebrow, 20, 500, 10);
  y += 4;
  center(spec.title, 40, 900, 10);
  y += 10;

  if (photo) {
    const pw = 360;
    const ph = 480;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    drawCover(ctx, photo, C - pw / 2, y, pw, ph);
    ctx.restore();
    ctx.lineWidth = 3;
    ctx.strokeRect(C - pw / 2, y, pw, ph);
    y += ph + 24;
  }

  for (const section of spec.sections) {
    dashed();
    sectionTitle(section.title);
    if (section.type === 'rows') {
      section.rows.forEach((r) => row(r.label, r.value));
    } else if (section.type === 'bars') {
      for (const bar of section.bars) {
        const value = Math.max(0, Math.min(100, Math.round(bar.value)));
        font(22, 400);
        ctx.fillText(bar.label, L, y);
        const cells = 10;
        const cellW = 17;
        const startX = R - 64 - cells * (cellW + 4);
        for (let i = 0; i < cells; i++) {
          const filled = i < Math.round(value / 10);
          ctx.lineWidth = 2;
          if (filled) ctx.fillRect(startX + i * (cellW + 4), y + 2, cellW, 20);
          else ctx.strokeRect(startX + i * (cellW + 4) + 1, y + 3, cellW - 2, 18);
        }
        ctx.textAlign = 'right';
        font(22, 700);
        ctx.fillText(String(value), R, y);
        ctx.textAlign = 'left';
        y += 34;
      }
    } else if (section.type === 'text') {
      font(21, 400);
      for (const line of wrapText(ctx, section.text, inner)) {
        ctx.fillText(line, L, y);
        y += 31;
      }
    } else if (section.type === 'list') {
      font(21, 400);
      for (const item of section.items) {
        const lines = wrapText(ctx, item, inner - 26);
        lines.forEach((line, i) => {
          if (i === 0) ctx.fillText('•', L, y);
          ctx.fillText(line, L + 26, y);
          y += 31;
        });
      }
    } else if (section.type === 'big') {
      center(section.text, 64, 900, 6);
    } else if (section.type === 'waveform') {
      const values = section.values.length ? section.values : [0.2];
      const barW = inner / values.length;
      const maxH = 70;
      values.forEach((v, i) => {
        const h = Math.max(4, v * maxH);
        ctx.fillRect(L + i * barW + 1, y + (maxH - h) / 2, Math.max(2, barW - 3), h);
      });
      y += maxH + 12;
    }
  }

  // Barcode + footer
  dashed();
  drawBarcode(ctx, `${meta.serial}${meta.serviceName}`, C, y, 380, 76);
  y += 86;
  center(meta.serial.replace(/\D/g, '').padStart(12, '0').replace(/(\d{4})(?=\d)/g, '$1 '), 18, 400, 4);
  y += 14;
  if (spec.footer) center(spec.footer, 20, 500, 8);
  y += 6;
  center('THANK YOU FOR VISITING', 20, 800, 6);
  center('neander.co.kr', 18, 400, 4);
  y += 36;

  // 실제 높이로 자르고 아래를 톱니 모양으로 찢는다
  const height = Math.ceil(y);
  const out = document.createElement('canvas');
  out.width = RECEIPT_W;
  out.height = height;
  const octx = out.getContext('2d')!;
  octx.drawImage(draft, 0, 0);
  octx.globalCompositeOperation = 'destination-out';
  const tooth = 16;
  octx.beginPath();
  octx.moveTo(0, height);
  for (let x = 0; x <= RECEIPT_W; x += tooth) {
    octx.lineTo(x + tooth / 2, height - 12);
    octx.lineTo(x + tooth, height);
  }
  octx.closePath();
  octx.fill();

  return { url: out.toDataURL('image/png'), width: RECEIPT_W, height };
}

/* ── 4×6 photo print ──────────────────────────────────── */

const PHOTO_W = 1200;
const PHOTO_H = 1800;

async function renderPhotoPrint(spec: PhotoPrintSpec, meta: PrintMeta): Promise<RenderedPrint> {
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_W;
  canvas.height = PHOTO_H;
  const ctx = canvas.getContext('2d')!;
  const paper = spec.paper ?? 'white';
  const bg = paper === 'black' ? '#141414' : paper === 'cream' ? '#f6efe2' : '#ffffff';
  const fg = paper === 'black' ? '#f5f5f5' : '#161616';
  const sub = paper === 'black' ? '#a3a3a3' : '#6b6b6b';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, PHOTO_W, PHOTO_H);

  const M = 60;
  const areaW = PHOTO_W - M * 2;
  const areaH = 1440;
  const photos = spec.photos.slice(0, 4);
  const cells: { x: number; y: number; w: number; h: number }[] = [];
  if (photos.length <= 1) {
    cells.push({ x: M, y: M, w: areaW, h: areaH });
  } else {
    const gap = 24;
    const w = (areaW - gap) / 2;
    const rows = photos.length <= 2 ? 1 : 2;
    // 2장은 세로로 길게(좌우를 조금 잘라) 인화지를 채운다
    const h = rows === 1 ? Math.min(areaH, w * 1.95) : (areaH - gap) / 2;
    // 2장은 위로 붙이고 남는 아래 공간을 큰 캡션이 쓴다
    const top = M;
    for (let i = 0; i < rows * 2; i++) {
      cells.push({ x: M + (i % 2) * (w + gap), y: top + Math.floor(i / 2) * (h + gap), w, h });
    }
  }

  const images = await Promise.all(
    photos.map(async (p) => {
      const [img, overlay] = await Promise.all([
        loadImage(p.look ? await renderLook(p.src, p.look) : p.src),
        p.overlay ? overlayToImage(p.overlay) : Promise.resolve(null),
      ]);
      return { img, overlay };
    })
  );

  cells.forEach((cell, i) => {
    const entry = images[i];
    if (!entry) {
      // 빈 칸 — 로고 카드
      ctx.fillStyle = meta.accent;
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 64px ${PHOTO_FONT}`;
      ctx.fillText('NEANDER', cell.x + cell.w / 2, cell.y + cell.h / 2 - 20);
      ctx.font = `600 28px ${PHOTO_FONT}`;
      ctx.fillText(meta.serviceName, cell.x + cell.w / 2, cell.y + cell.h / 2 + 40);
      return;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(cell.x, cell.y, cell.w, cell.h);
    ctx.clip();
    drawCover(ctx, entry.img, cell.x, cell.y, cell.w, cell.h);
    if (entry.overlay) {
      // 오버레이는 300×400(3:4) 좌표 — 사진과 같은 방식으로 cover 배치
      const scale = Math.max(cell.w / 300, cell.h / 400);
      const ow = 300 * scale;
      const oh = 400 * scale;
      ctx.drawImage(entry.overlay, cell.x + (cell.w - ow) / 2, cell.y + (cell.h - oh) / 2, ow, oh);
    }
    ctx.restore();

    const label = photos[i]?.label;
    if (label) {
      ctx.font = `700 ${photos.length > 1 ? 26 : 30}px ${PHOTO_FONT}`;
      const tw = ctx.measureText(label).width;
      const bx = cell.x + 20;
      const by = cell.y + cell.h - 20 - 48;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.roundRect(bx, by, tw + 36, 48, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, bx + 18, by + 25);
    }
  });

  if (spec.badge) {
    ctx.font = `800 30px ${PHOTO_FONT}`;
    const tw = ctx.measureText(spec.badge).width;
    const bx = PHOTO_W - M - 24 - tw - 40;
    ctx.fillStyle = meta.accent;
    ctx.beginPath();
    ctx.roundRect(bx, M + 24, tw + 40, 54, 27);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(spec.badge, bx + 20, M + 52);
  }

  // Caption — 사진이 차지한 영역 바로 아래부터
  const photoBottom = Math.max(...cells.map((c) => c.y + c.h));
  const roomy = PHOTO_H - photoBottom > 500;
  const capY = photoBottom + (roomy ? 70 : 40);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = fg;
  const titleSize = roomy ? 84 : 60;
  ctx.font = `900 ${titleSize}px ${PHOTO_FONT}`;
  const titleLines = wrapText(ctx, spec.title, areaW).slice(0, roomy ? 2 : 1);
  if (!roomy && ctx.measureText(spec.title).width > areaW) {
    let t = spec.title;
    while (ctx.measureText(`${t}…`).width > areaW && t.length > 1) t = t.slice(0, -1);
    titleLines[0] = `${t}…`;
  }
  titleLines.forEach((line, i) => ctx.fillText(line, M, capY + i * (titleSize + 12)));
  if (spec.caption) {
    ctx.fillStyle = sub;
    const captionSize = roomy ? 36 : 30;
    ctx.font = `500 ${captionSize}px ${PHOTO_FONT}`;
    const captionTop = capY + titleLines.length * (titleSize + 12) + 10;
    wrapText(ctx, spec.caption, areaW)
      .slice(0, roomy ? 4 : 1)
      .forEach((line, i) => ctx.fillText(line, M, captionTop + i * (captionSize + 14)));
  }
  // 하단 로고 · 일시
  ctx.fillStyle = meta.accent;
  ctx.fillRect(M, PHOTO_H - M - 34, 12, 34);
  ctx.fillStyle = fg;
  ctx.font = `900 30px ${PHOTO_FONT}`;
  ctx.fillText('NEANDER', M + 26, PHOTO_H - M - 34);
  ctx.textAlign = 'right';
  ctx.fillStyle = sub;
  ctx.font = `500 24px ${PHOTO_FONT}`;
  ctx.fillText(`${meta.serviceName} · ${formatPrintDate(meta.date)} · ${meta.serial}`, PHOTO_W - M, PHOTO_H - M - 30);

  return { url: canvas.toDataURL('image/jpeg', 0.92), width: PHOTO_W, height: PHOTO_H };
}

export function renderPrint(spec: PrintSpec, meta: PrintMeta): Promise<RenderedPrint> {
  return spec.kind === 'receipt' ? renderReceipt(spec, meta) : renderPhotoPrint(spec, meta);
}
