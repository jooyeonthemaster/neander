/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — canvas photo pipeline
   캡처(크롭·통계) + 결과 화면용 스타일 변환. 모두 브라우저 안에서만 처리한다.
   ───────────────────────────────────────────────────────── */

import { clamp, hashString, type CaptureData, type CaptureStats } from './core';
import { FINGERS, PALM_PATH } from './hand';

export const CAPTURE_WIDTH = 540;
export const CAPTURE_HEIGHT = 720;

/* ── Capture ──────────────────────────────────────────── */

/** 영상/이미지를 3:4로 가운데 크롭해 CaptureData로 만든다 */
export function captureFrom(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  { mirror, origin }: { mirror: boolean; origin: CaptureData['source'] }
): CaptureData {
  const canvas = document.createElement('canvas');
  canvas.width = CAPTURE_WIDTH;
  canvas.height = CAPTURE_HEIGHT;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const targetRatio = CAPTURE_WIDTH / CAPTURE_HEIGHT;
  let sw = sourceWidth;
  let sh = sourceHeight;
  if (sw / sh > targetRatio) sw = sh * targetRatio;
  else sh = sw / targetRatio;
  const sx = (sourceWidth - sw) / 2;
  const sy = (sourceHeight - sh) / 2;

  if (mirror) {
    ctx.translate(CAPTURE_WIDTH, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const { stats, seed } = analyzeRegion(ctx);
  return { image: canvas.toDataURL('image/jpeg', 0.88), stats, seed, source: origin };
}

/** 얼굴이 놓이는 중앙부 픽셀로 밝기·온도·채도·대비와 시드를 계산한다 */
function analyzeRegion(ctx: CanvasRenderingContext2D): { stats: CaptureStats; seed: number } {
  const x0 = Math.round(CAPTURE_WIDTH * 0.25);
  const y0 = Math.round(CAPTURE_HEIGHT * 0.2);
  const w = Math.round(CAPTURE_WIDTH * 0.5);
  const h = Math.round(CAPTURE_HEIGHT * 0.5);
  const { data } = ctx.getImageData(x0, y0, w, h);

  let n = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumL = 0;
  let sumL2 = 0;
  let sumS = 0;
  let fingerprint = '';
  for (let i = 0; i < data.length; i += 4 * 7) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    sumR += r;
    sumG += g;
    sumB += b;
    sumL += l;
    sumL2 += l * l;
    sumS += max === 0 ? 0 : (max - min) / max;
    n++;
    if (n % 97 === 0) fingerprint += String.fromCharCode(65 + (r >> 4), 65 + (g >> 4), 65 + (b >> 4));
  }

  const meanL = sumL / n;
  const std = Math.sqrt(Math.max(0, sumL2 / n - meanL * meanL));
  const stats: CaptureStats = {
    brightness: Math.round(clamp((meanL / 255) * 100)),
    warmth: Math.round(clamp(50 + ((sumR - sumB) / n / 255) * 150)),
    saturation: Math.round(clamp((sumS / n) * 100)),
    contrast: Math.round(clamp((std / 64) * 100)),
  };
  return { stats, seed: hashString(fingerprint || `${sumR}|${sumG}|${sumB}`) };
}

/** 카메라가 없을 때 쓰는 샘플 이미지 (그라디언트 배경 + 실루엣) */
export function createSampleCapture(mode: 'face' | 'hand' | 'handBack' | 'portrait', thumbLeft = true): CaptureData {
  const canvas = document.createElement('canvas');
  canvas.width = CAPTURE_WIDTH;
  canvas.height = CAPTURE_HEIGHT;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const W = CAPTURE_WIDTH;
  const H = CAPTURE_HEIGHT;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#dbeafe');
  bg.addColorStop(1, '#fce7f3');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const skin = ctx.createRadialGradient(W * 0.46, H * 0.4, 0, W * 0.5, H * 0.45, W * 0.45);
  skin.addColorStop(0, '#f0c8ac');
  skin.addColorStop(1, '#dcaa8c');

  if (mode === 'hand' || mode === 'handBack') {
    // 카메라 가이드와 같은 손 모양(300×400 좌표)을 그대로 그린다
    ctx.save();
    ctx.scale(W / 300, H / 400);
    if (!thumbLeft) {
      ctx.translate(300, 0);
      ctx.scale(-1, 1);
    }
    const handSkin = ctx.createLinearGradient(0, 40, 0, 400);
    handSkin.addColorStop(0, '#f2cdb3');
    handSkin.addColorStop(1, '#dfae90');
    ctx.fillStyle = handSkin;
    ctx.fill(new Path2D(PALM_PATH));
    for (const f of FINGERS) {
      ctx.save();
      ctx.translate(f.bx, f.by);
      ctx.rotate((f.angle * Math.PI) / 180);
      ctx.beginPath();
      ctx.roundRect(-f.w / 2, -f.len, f.w, f.len + 34, f.w / 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.lineCap = 'round';
    if (mode === 'handBack') {
      // 손등: 마디 주름 + 맨 손톱
      for (const f of FINGERS) {
        ctx.save();
        ctx.translate(f.bx, f.by);
        ctx.rotate((f.angle * Math.PI) / 180);
        ctx.strokeStyle = 'rgba(150, 95, 75, 0.35)';
        ctx.lineWidth = 1.5;
        for (const t of [0.35, 0.62]) {
          ctx.beginPath();
          ctx.moveTo(-f.w * 0.22, -f.len * t);
          ctx.quadraticCurveTo(0, -f.len * t + 3, f.w * 0.22, -f.len * t);
          ctx.stroke();
        }
        const nw = f.w * 0.62;
        const nh = f.w * 0.78;
        ctx.fillStyle = '#f7d9d2';
        ctx.strokeStyle = 'rgba(190, 120, 110, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-nw / 2, -f.len + f.w * 0.16, nw, nh, nw * 0.42);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // 손바닥: 감정선·두뇌선·생명선
      ctx.strokeStyle = 'rgba(150, 90, 70, 0.55)';
      ctx.lineWidth = 2;
      const lines: [number, number, number, number, number, number][] = [
        [206, 204, 160, 188, 104, 196],
        [96, 214, 150, 226, 196, 252],
        [100, 206, 88, 300, 124, 372],
      ];
      for (const [ax, ay, cx, cy, bx, by] of lines) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cx, cy, bx, by);
        ctx.stroke();
      }
    }
    ctx.restore();
  } else {
    const faceY = mode === 'portrait' ? 0.36 : 0.45;
    const faceR = mode === 'portrait' ? 0.2 : 0.29;
    // 어깨
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 1.05, W * 0.55, H * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    // 목
    ctx.fillStyle = skin;
    ctx.fillRect(W * 0.42, H * (faceY + faceR * 0.8), W * 0.16, H * 0.12);
    // 얼굴
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * faceY, W * faceR * 0.95, H * faceR, 0, 0, Math.PI * 2);
    ctx.fill();
    // 머리카락
    ctx.fillStyle = '#3f2a22';
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * (faceY - faceR * 0.55), W * faceR, H * faceR * 0.55, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // 눈·입
    ctx.fillStyle = '#3f2a22';
    for (const dx of [-0.1, 0.1]) {
      ctx.beginPath();
      ctx.ellipse(W * (0.5 + dx * (faceR / 0.29)), H * (faceY - faceR * 0.12), 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#b4534b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(W * 0.5, H * (faceY + faceR * 0.35), W * 0.05 * (faceR / 0.29), 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  return captureFrom(canvas, W, H, { mirror: false, origin: 'sample' });
}

/* ── Looks (result-side processing) ───────────────────── */

export type PixelEffect =
  | { kind: 'none' }
  /** 색 단계를 줄여 포스터 느낌 */
  | { kind: 'posterize'; levels: number }
  /** 포스터라이즈 + 외곽선 = 만화/웹툰 */
  | { kind: 'cartoon'; levels?: number; edge?: number }
  | { kind: 'pixelate'; block: number }
  /** 밝기를 두 색 사이 그라디언트로 매핑 */
  | { kind: 'duotone'; dark: string; light: string }
  /** 듀오톤 + 하프톤 망점 = 팝아트 */
  | { kind: 'popart'; dark: string; light: string; dot?: number }
  /** 수묵화 (먹 번짐 + 한지 톤) */
  | { kind: 'ink'; paper?: string }
  /** 연필 스케치 */
  | { kind: 'sketch'; paper?: string }
  /** 감열지 프린터처럼 흑백 망점(오차 확산) */
  | { kind: 'dither' };

export interface PhotoPaint {
  /** 중심 좌표 (%), 크기 (%) — 얼굴 가이드 기준 좌표계를 쓴다 (FACE_POINTS 참고) */
  x: number;
  y: number;
  rx: number;
  ry: number;
  color: string;
  alpha: number;
  blend?: GlobalCompositeOperation;
}

export interface PhotoLook {
  /** 픽셀 효과 이전에 적용하는 보정 (1 = 원본) */
  adjust?: { brightness?: number; contrast?: number; saturation?: number; sepia?: number; warmth?: number };
  effect?: PixelEffect;
  /** 부드러운 원형 채색 (메이크업·블러셔·오라 등) */
  paints?: PhotoPaint[];
  /** 전체 색 덮기 */
  tint?: { color: string; alpha: number; blend?: GlobalCompositeOperation };
  /** 필름 그레인 0–60 */
  grain?: number;
  /** 비네팅 0–1 */
  vignette?: number;
}

/** 얼굴 가이드(타원) 안에서의 대략적인 랜드마크 위치 (%). 카메라 스텝과 결과 연출이 같은 좌표를 쓴다 */
export const FACE_POINTS = {
  forehead: { x: 50, y: 24 },
  browL: { x: 38, y: 36 },
  browR: { x: 62, y: 36 },
  eyeL: { x: 39, y: 41 },
  eyeR: { x: 61, y: 41 },
  nose: { x: 50, y: 52 },
  cheekL: { x: 34, y: 54 },
  cheekR: { x: 66, y: 54 },
  lips: { x: 50, y: 62 },
  chin: { x: 50, y: 72 },
} as const;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function parseColor(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

function applyAdjust(data: Uint8ClampedArray, adjust: NonNullable<PhotoLook['adjust']>) {
  const { brightness = 1, contrast = 1, saturation = 1, sepia = 0, warmth = 0 } = adjust;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]! * brightness;
    let g = data[i + 1]! * brightness;
    let b = data[i + 2]! * brightness;
    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    r = l + (r - l) * saturation;
    g = l + (g - l) * saturation;
    b = l + (b - l) * saturation;
    if (sepia > 0) {
      const sr = 0.393 * r + 0.769 * g + 0.189 * b;
      const sg = 0.349 * r + 0.686 * g + 0.168 * b;
      const sb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = r + (sr - r) * sepia;
      g = g + (sg - g) * sepia;
      b = b + (sb - b) * sepia;
    }
    r += warmth * 30;
    b -= warmth * 30;
    data[i] = clamp255(r);
    data[i + 1] = clamp255(g);
    data[i + 2] = clamp255(b);
  }
}

/** 3x3 박스 블러를 거친 휘도 + 소벨 에지 강도 (0–1) */
function edgeMap(data: Uint8ClampedArray, w: number, h: number): Float32Array {
  const lum = new Float32Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    lum[p] = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
  }
  const blur = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += lum[(y + dy) * w + x + dx]!;
      blur[y * w + x] = s / 9;
    }
  }
  const edges = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -blur[i - w - 1]! - 2 * blur[i - 1]! - blur[i + w - 1]! + blur[i - w + 1]! + 2 * blur[i + 1]! + blur[i + w + 1]!;
      const gy =
        -blur[i - w - 1]! - 2 * blur[i - w]! - blur[i - w + 1]! + blur[i + w - 1]! + 2 * blur[i + w]! + blur[i + w + 1]!;
      edges[i] = Math.min(1, Math.sqrt(gx * gx + gy * gy) / 255);
    }
  }
  return edges;
}

function applyEffect(ctx: CanvasRenderingContext2D, w: number, h: number, effect: PixelEffect) {
  if (effect.kind === 'none') return;

  if (effect.kind === 'pixelate') {
    const block = Math.max(2, effect.block);
    const small = document.createElement('canvas');
    small.width = Math.ceil(w / block);
    small.height = Math.ceil(h / block);
    const sctx = small.getContext('2d')!;
    sctx.drawImage(ctx.canvas, 0, 0, small.width, small.height);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(small, 0, 0, small.width, small.height, 0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    return;
  }

  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;

  if (effect.kind === 'dither') {
    // Floyd–Steinberg: 대비를 올린 휘도를 흑/백 두 값으로 떨어뜨리고 오차를 이웃에 나눈다
    const lum = new Float32Array(w * h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const l = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      lum[p] = (l - 128) * 1.35 + 140;
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        const old = lum[p]!;
        const value = old < 128 ? 0 : 255;
        const err = old - value;
        lum[p] = value;
        if (x + 1 < w) lum[p + 1]! += (err * 7) / 16;
        if (y + 1 < h) {
          if (x > 0) lum[p + w - 1]! += (err * 3) / 16;
          lum[p + w]! += (err * 5) / 16;
          if (x + 1 < w) lum[p + w + 1]! += err / 16;
        }
      }
    }
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      data[i] = data[i + 1] = data[i + 2] = lum[p]!;
    }
    ctx.putImageData(image, 0, 0);
    return;
  }

  if (effect.kind === 'posterize' || effect.kind === 'cartoon') {
    const levels = Math.max(2, effect.kind === 'posterize' ? effect.levels : (effect.levels ?? 6));
    const step = 255 / (levels - 1);
    const edges = effect.kind === 'cartoon' ? edgeMap(data, w, h) : null;
    const threshold = effect.kind === 'cartoon' ? (effect.edge ?? 0.18) : 1;
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      let r = Math.round(data[i]! / step) * step;
      let g = Math.round(data[i + 1]! / step) * step;
      let b = Math.round(data[i + 2]! / step) * step;
      if (edges) {
        const e = edges[p]!;
        const ink = e > threshold ? Math.min(1, (e - threshold) / threshold) * 0.9 : 0;
        r *= 1 - ink;
        g *= 1 - ink;
        b *= 1 - ink;
      }
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    ctx.putImageData(image, 0, 0);
    return;
  }

  if (effect.kind === 'duotone' || effect.kind === 'popart') {
    const [dr, dg, db] = parseColor(effect.dark);
    const [lr, lg, lb] = parseColor(effect.light);
    const punch = effect.kind === 'popart' ? 1.6 : 1.1;
    // 하프톤 망점 크기는 원본 명암 기준
    const luma = new Float32Array(w * h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const l = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      luma[p] = l;
      const t = Math.min(1, Math.max(0, ((l / 255 - 0.5) * punch + 0.5)));
      data[i] = dr + (lr - dr) * t;
      data[i + 1] = dg + (lg - dg) * t;
      data[i + 2] = db + (lb - db) * t;
    }
    ctx.putImageData(image, 0, 0);
    if (effect.kind === 'popart') {
      // 하프톤 망점 — 어두운 영역일수록 점이 커진다
      const cell = effect.dot ?? 9;
      ctx.fillStyle = effect.dark;
      ctx.globalAlpha = 0.5;
      for (let y = cell / 2; y < h; y += cell) {
        for (let x = cell / 2; x < w; x += cell) {
          const l = luma[Math.floor(y) * w + Math.floor(x)]! / 255;
          const radius = Math.sqrt(1 - l) * cell * 0.5;
          if (radius < 0.6) continue;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    return;
  }

  if (effect.kind === 'ink' || effect.kind === 'sketch') {
    const [pr, pg, pb] = parseColor(effect.paper ?? (effect.kind === 'ink' ? '#efe6d2' : '#f8f7f4'));
    const edges = edgeMap(data, w, h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const l = (0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!) / 255;
      let tone: number;
      if (effect.kind === 'ink') {
        // 먹의 농담: 대비를 키운 명암 + 굵은 외곽선
        const wash = Math.min(1, Math.max(0, (l - 0.5) * 1.8 + 0.62));
        tone = wash * (1 - Math.min(1, edges[p]! * 3.2));
      } else {
        tone = 1 - Math.min(1, edges[p]! * 4) * 0.9;
        tone = tone * 0.85 + l * 0.15;
      }
      data[i] = pr * tone + 18 * (1 - tone);
      data[i + 1] = pg * tone + 18 * (1 - tone);
      data[i + 2] = pb * tone + 22 * (1 - tone);
    }
    ctx.putImageData(image, 0, 0);
  }
}

/** 캡처 이미지에 PhotoLook을 적용해 새 data URL을 만든다 */
export async function renderLook(src: string, look: PhotoLook): Promise<string> {
  const img = await loadImage(src);
  const w = img.naturalWidth || CAPTURE_WIDTH;
  const h = img.naturalHeight || CAPTURE_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);

  if (look.adjust) {
    const image = ctx.getImageData(0, 0, w, h);
    applyAdjust(image.data, look.adjust);
    ctx.putImageData(image, 0, 0);
  }

  if (look.effect) applyEffect(ctx, w, h, look.effect);

  for (const paint of look.paints ?? []) {
    const cx = (paint.x / 100) * w;
    const cy = (paint.y / 100) * h;
    const rx = (paint.rx / 100) * w;
    const ry = (paint.ry / 100) * h;
    ctx.save();
    ctx.globalCompositeOperation = paint.blend ?? 'soft-light';
    ctx.globalAlpha = paint.alpha;
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    gradient.addColorStop(0, paint.color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (look.tint) {
    ctx.save();
    ctx.globalCompositeOperation = look.tint.blend ?? 'soft-light';
    ctx.globalAlpha = look.tint.alpha;
    ctx.fillStyle = look.tint.color;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  if (look.grain) {
    const image = ctx.getImageData(0, 0, w, h);
    const d = image.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (Math.random() - 0.5) * look.grain;
      d[i] = clamp255(d[i]! + noise);
      d[i + 1] = clamp255(d[i + 1]! + noise);
      d[i + 2] = clamp255(d[i + 2]! + noise);
    }
    ctx.putImageData(image, 0, 0);
  }

  if (look.vignette) {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${look.vignette})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}
