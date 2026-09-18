'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps, DemoStepProps } from '@/types/demo';
import {
  InfoGrid,
  ResultShell,
  TraitChips,
  answersSeed,
  captureFrom,
  choiceStep,
  defineDemo,
  getChoice,
  getFields,
  seededInt,
  seededRandom,
  textStep,
  type CaptureData,
  type DemoStepDef,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 6;
const TITLE_SEC = 3;
const PHOTO_SEC = 3.2;
const END_SEC = 3.6;

type MoodId = 'flutter' | 'calm' | 'joyful' | 'cinematic';

type Grade = Pick<NonNullable<PhotoLook['adjust']>, 'brightness' | 'contrast' | 'saturation'>;

interface Mood {
  label: string;
  emoji: string;
  track: string;
  genre: string;
  bpm: number;
  colors: [string, string, string];
  /** 컬러 그레이딩 — 화면은 CSS filter, 출력물은 PhotoLook.adjust로 같은 값을 쓴다 */
  grade: Grade;
  /** 사진 위에 덮는 색 워시 (CSS linear-gradient 각도 + 두 색 [hex, 불투명도]) */
  wash: { angle: number; stops: [[string, number], [string, number]] };
  letterbox?: boolean;
  fallbackTitle: string;
  captions: string[];
  /** 아르페지오용 코드 진행 (MIDI) */
  chords: number[][];
  wave: OscillatorType;
}

const MOODS: Record<MoodId, Mood> = {
  flutter: {
    label: '설렘',
    emoji: '💗',
    track: 'Spring Letter',
    genre: '어쿠스틱 팝',
    bpm: 112,
    colors: ['#f472b6', '#fb7185', '#fde68a'],
    grade: { saturation: 1.15, brightness: 1.06 },
    wash: { angle: 135, stops: [['#f472b6', 0.28], ['#fde68a', 0.14]] },
    fallbackTitle: '우리의 봄날',
    captions: ['처음 눈이 마주친 그날처럼', '너와 걷는 모든 길이 봄이었어', '심장이 먼저 알아본 사람', '오늘도 네 생각에 두근두근', '손끝까지 설레던 순간'],
    chords: [
      [60, 64, 67, 72],
      [55, 59, 62, 67],
      [57, 60, 64, 69],
      [53, 57, 60, 65],
    ],
    wave: 'triangle',
  },
  calm: {
    label: '잔잔함',
    emoji: '🌙',
    track: 'Moonlight Diary',
    genre: '피아노 솔로',
    bpm: 72,
    colors: ['#38bdf8', '#818cf8', '#e0f2fe'],
    grade: { saturation: 0.8, contrast: 0.95, brightness: 1.04 },
    wash: { angle: 180, stops: [['#38bdf8', 0.16], ['#0f172a', 0.3]] },
    fallbackTitle: '고요한 기억',
    captions: ['조용히 곁에 있어 줘서 고마워', '천천히, 오래오래 함께', '평범한 하루가 가장 빛났던 날들', '말하지 않아도 편안한 우리', '그 계절의 공기까지 기억나'],
    chords: [
      [57, 60, 64, 69],
      [53, 57, 60, 65],
      [48, 52, 55, 60],
      [55, 59, 62, 67],
    ],
    wave: 'sine',
  },
  joyful: {
    label: '유쾌함',
    emoji: '🎉',
    track: 'Sunny Side Up',
    genre: '우쿨렐레 스윙',
    bpm: 128,
    colors: ['#facc15', '#34d399', '#fb923c'],
    grade: { saturation: 1.35, contrast: 1.05, brightness: 1.05 },
    wash: { angle: 135, stops: [['#facc15', 0.2], ['#34d399', 0.14]] },
    fallbackTitle: '웃음 가득한 날들',
    captions: ['웃음이 끊이지 않던 우리', '이 조합 실화? 최강 케미!', '같이라면 뭐든 재밌어', '오늘의 주인공은 바로 우리', '다음 여행은 어디로 갈까?'],
    chords: [
      [65, 69, 72, 77],
      [60, 64, 67, 72],
      [62, 67, 71, 74],
      [60, 64, 67, 72],
    ],
    wave: 'square',
  },
  cinematic: {
    label: '시네마틱',
    emoji: '🎬',
    track: 'The Long Take',
    genre: '오케스트라 스트링',
    bpm: 90,
    colors: ['#0d9488', '#f97316', '#1e293b'],
    grade: { contrast: 1.15, saturation: 0.9 },
    wash: { angle: 90, stops: [['#0d9488', 0.28], ['#f97316', 0.18]] },
    letterbox: true,
    fallbackTitle: 'THE LONG TAKE',
    captions: ['그리고, 모든 것이 시작되었다', '기억은 장면이 되고', '장면은 이야기가 된다', '가장 아름다운 롱테이크', '우리의 이야기는 계속된다'],
    chords: [
      [62, 65, 69, 74],
      [58, 62, 65, 70],
      [53, 57, 60, 65],
      [60, 64, 67, 72],
    ],
    wave: 'triangle',
  },
};

const SERIF = '"Nanum Myeongjo", "AppleMyungjo", "Batang", "Noto Serif KR", Georgia, serif';

/** 화면 가장자리를 어둡게 — 투명 시작점과 가장자리 불투명도 */
const VIGNETTE = { from: 0.55, alpha: 0.55 };

function rgba(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** 그레이딩 → CSS filter (kit renderLook과 같은 밝기 → 대비 → 채도 순서) */
function gradeFilter({ brightness = 1, contrast = 1, saturation = 1 }: Grade) {
  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
}

function washCss({ angle, stops }: Mood['wash']) {
  return `linear-gradient(${angle}deg, ${stops.map(([c, a]) => rgba(c, a)).join(', ')})`;
}

/** 러닝타임 (초) — 타이틀 + 장면 + 엔딩 */
function runtimeOf(sceneCount: number) {
  return TITLE_SEC + sceneCount * PHOTO_SEC + END_SEC;
}

/** 장면 자막 — 마지막 장면은 직접 쓴 자막, 나머지는 무드 자막을 돌려 쓴다 */
function sceneCaption(mood: Mood, message: string, index: number, count: number) {
  return index === count - 1 && message ? message : mood.captions[index % mood.captions.length]!;
}

function isCapture(value: unknown): value is CaptureData {
  return typeof value === 'object' && value !== null && typeof (value as CaptureData).image === 'string';
}

function getPhotos(answers: DemoAnswers): CaptureData[] {
  const value = answers.photos;
  return Array.isArray(value) ? value.filter(isCapture) : [];
}

/* ── Sample scenes (canvas) ────────────────────────────── */

type Painter = (ctx: CanvasRenderingContext2D, W: number, H: number, rnd: (k: number) => number) => void;

function vGrad(ctx: CanvasRenderingContext2D, y0: number, y1: number, stops: string[]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function person(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 120 * s, 20 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x - 24 * s, y - 96 * s, 48 * s, 100 * s, 20 * s);
  ctx.fill();
}

const SAMPLE_SCENES: Painter[] = [
  // 바다 노을
  (ctx, W, H) => {
    ctx.fillStyle = vGrad(ctx, 0, H * 0.62, ['#312e81', '#db2777', '#fb923c']);
    ctx.fillRect(0, 0, W, H * 0.62);
    glow(ctx, W * 0.5, H * 0.58, 180, 'rgba(253,230,138,0.9)');
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.58, 70, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = vGrad(ctx, H * 0.58, H, ['#7c3aed', '#1e1b4b']);
    ctx.fillRect(0, H * 0.58, W, H * 0.42);
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = `rgba(253,230,138,${0.6 - i * 0.06})`;
      ctx.fillRect(W * 0.5 - 90 + i * 8, H * 0.61 + i * 14, 180 - i * 16, 4);
    }
    ctx.fillStyle = '#f5d0a9';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.86);
    ctx.quadraticCurveTo(W * 0.5, H * 0.8, W, H * 0.88);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();
    person(ctx, W * 0.43, H * 0.9, 1, '#1e1b4b');
    person(ctx, W * 0.57, H * 0.9, 0.92, '#1e1b4b');
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(W * 0.46, H * 0.83);
    ctx.lineTo(W * 0.54, H * 0.83);
    ctx.stroke();
  },
  // 벚꽃길
  (ctx, W, H, rnd) => {
    ctx.fillStyle = vGrad(ctx, 0, H, ['#bae6fd', '#fdf2f8']);
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    ctx.fillStyle = '#e7e5e4';
    ctx.beginPath();
    ctx.moveTo(W * 0.47, H * 0.55);
    ctx.lineTo(W * 0.53, H * 0.55);
    ctx.lineTo(W * 0.85, H);
    ctx.lineTo(W * 0.15, H);
    ctx.fill();
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const t = i / 3;
        const x = W * (0.5 + side * (0.12 + t * 0.34));
        const y = H * (0.55 + t * 0.3);
        const s = 0.4 + t * 0.8;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - 6 * s, y - 120 * s, 12 * s, 130 * s);
        for (let k = 0; k < 14; k++) {
          ctx.fillStyle = k % 2 ? '#f9a8d4' : '#fbcfe8';
          ctx.beginPath();
          ctx.arc(x + (rnd(i * 40 + k) - 0.5) * 150 * s, y - 130 * s + (rnd(i * 40 + k + 17) - 0.5) * 90 * s, 34 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.fillStyle = '#f472b6';
    for (let k = 0; k < 40; k++) {
      ctx.beginPath();
      ctx.ellipse(rnd(k + 300) * W, rnd(k + 400) * H, 5, 3, rnd(k + 500) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 도시 야경
  (ctx, W, H, rnd) => {
    ctx.fillStyle = vGrad(ctx, 0, H, ['#0f172a', '#312e81', '#7c3aed']);
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.arc(W * 0.78, H * 0.14, 34, 0, Math.PI * 2);
    ctx.fill();
    for (let k = 0; k < 50; k++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + rnd(k) * 0.6})`;
      ctx.fillRect(rnd(k + 100) * W, rnd(k + 200) * H * 0.4, 2, 2);
    }
    for (const [layer, color] of [
      [0, '#1e293b'],
      [1, '#0f172a'],
    ] as const) {
      let x = -20;
      while (x < W) {
        const w = 50 + rnd(x + layer * 999) * 60;
        const h = H * (0.25 + rnd(x + 7 + layer * 999) * 0.3) + layer * 40;
        ctx.fillStyle = color;
        ctx.fillRect(x, H - h, w, h);
        for (let wy = H - h + 14; wy < H - 20; wy += 22) {
          for (let wx = x + 8; wx < x + w - 10; wx += 16) {
            if (rnd(wx * 3 + wy) > 0.45) {
              ctx.fillStyle = rnd(wx + wy) > 0.3 ? '#fde68a' : '#93c5fd';
              ctx.fillRect(wx, wy, 7, 10);
            }
          }
        }
        x += w + 6;
      }
    }
    for (let k = 0; k < 10; k++) {
      glow(ctx, rnd(k + 700) * W, H * (0.8 + rnd(k + 800) * 0.2), 30 + rnd(k + 900) * 30, k % 2 ? 'rgba(251,113,133,0.45)' : 'rgba(253,230,138,0.45)');
    }
  },
  // 캠핑 별밤
  (ctx, W, H, rnd) => {
    ctx.fillStyle = vGrad(ctx, 0, H, ['#0b1026', '#312e81', '#6d28d9']);
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W * 0.5, H * 0.3);
    ctx.rotate(-0.5);
    glow(ctx, 0, 0, 260, 'rgba(226,232,240,0.18)');
    ctx.restore();
    for (let k = 0; k < 120; k++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + rnd(k) * 0.7})`;
      ctx.beginPath();
      ctx.arc(rnd(k + 1000) * W, rnd(k + 2000) * H * 0.6, rnd(k + 3000) * 1.8 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.66);
    ctx.lineTo(W * 0.3, H * 0.5);
    ctx.lineTo(W * 0.55, H * 0.64);
    ctx.lineTo(W * 0.8, H * 0.46);
    ctx.lineTo(W, H * 0.6);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
    glow(ctx, W * 0.38, H * 0.74, 160, 'rgba(251,146,60,0.55)');
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(W * 0.2, H * 0.82);
    ctx.lineTo(W * 0.38, H * 0.6);
    ctx.lineTo(W * 0.56, H * 0.82);
    ctx.fill();
    ctx.fillStyle = '#fdba74';
    ctx.beginPath();
    ctx.moveTo(W * 0.34, H * 0.82);
    ctx.lineTo(W * 0.38, H * 0.7);
    ctx.lineTo(W * 0.42, H * 0.82);
    ctx.fill();
    glow(ctx, W * 0.72, H * 0.84, 70, 'rgba(250,204,21,0.8)');
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(W * 0.68, H * 0.87);
    ctx.quadraticCurveTo(W * 0.72, H * 0.76, W * 0.76, H * 0.87);
    ctx.fill();
  },
  // 카페 데이트
  (ctx, W, H) => {
    ctx.fillStyle = vGrad(ctx, 0, H, ['#fef3c7', '#fcd34d', '#b45309']);
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(W * 0.12, H * 0.08, W * 0.5, H * 0.36);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 10;
    ctx.strokeRect(W * 0.12, H * 0.08, W * 0.5, H * 0.36);
    ctx.beginPath();
    ctx.moveTo(W * 0.37, H * 0.08);
    ctx.lineTo(W * 0.37, H * 0.44);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(W * 0.62, H * 0.1);
    ctx.lineTo(W, H * 0.3);
    ctx.lineTo(W, H * 0.5);
    ctx.lineTo(W * 0.62, H * 0.42);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(W * 0.5, H * 0.78, W * 0.48, H * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    for (const [x, heart] of [
      [0.36, true],
      [0.64, false],
    ] as const) {
      ctx.fillStyle = '#fafaf9';
      ctx.beginPath();
      ctx.ellipse(W * x, H * 0.74, 62, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.ellipse(W * x, H * 0.735, 48, 29, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef3c7';
      if (heart) {
        const cx = W * x;
        const cy = H * 0.735;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 12);
        ctx.bezierCurveTo(cx - 26, cy - 4, cx - 12, cy - 22, cx, cy - 8);
        ctx.bezierCurveTo(cx + 12, cy - 22, cx + 26, cy - 4, cx, cy + 12);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(W * x, H * 0.735, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#15803d';
    for (let k = 0; k < 7; k++) {
      ctx.beginPath();
      ctx.ellipse(W * 0.86, H * (0.5 + k * 0.03), 40, 14, -0.6 + k * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 축제 불꽃
  (ctx, W, H, rnd) => {
    ctx.fillStyle = vGrad(ctx, 0, H, ['#020617', '#1e1b4b', '#312e81']);
    ctx.fillRect(0, 0, W, H);
    const colors = ['#f472b6', '#facc15', '#34d399', '#60a5fa', '#fb923c'];
    for (let b = 0; b < 5; b++) {
      const cx = W * (0.15 + rnd(b + 50) * 0.7);
      const cy = H * (0.12 + rnd(b + 60) * 0.35);
      const r = 70 + rnd(b + 70) * 60;
      const color = colors[b % colors.length]!;
      glow(ctx, cx, cy, r * 1.2, `${color}33`);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.5;
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.25, cy + Math.sin(a) * r * 0.25);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * 1.08, cy + Math.sin(a) * r * 1.08, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = vGrad(ctx, H * 0.78, H, ['#1e3a8a', '#020617']);
    ctx.fillRect(0, H * 0.78, W, H * 0.22);
    for (let k = 0; k < 9; k++) person(ctx, W * (0.06 + k * 0.11), H * (1.02 + (k % 2) * 0.03), 0.9, '#020617');
  },
];

function makeSampleCaptures(count: number): CaptureData[] {
  return SAMPLE_SCENES.slice(0, count).map((paint, i) => {
    const canvas = document.createElement('canvas');
    canvas.width = 540;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;
    paint(ctx, 540, 720, (k) => seededRandom(1000 + i, k));
    return captureFrom(canvas, 540, 720, { mirror: false, origin: 'sample' });
  });
}

function loadFile(file: File): Promise<CaptureData | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        resolve(captureFrom(img, img.naturalWidth, img.naturalHeight, { mirror: false, origin: 'upload' }));
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/* ── Photo collector step (custom) ─────────────────────── */

type CameraPhase = 'off' | 'starting' | 'live';

function PhotoCollector({ answers, onUpdate }: DemoStepProps) {
  const photos = getPhotos(answers);
  const photosRef = useRef<CaptureData[]>(photos);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mountedRef = useRef(true);
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState<CameraPhase>('off');
  const [videoReady, setVideoReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    photosRef.current = getPhotos(answers);
  }, [answers]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setVideoReady(false);
    setCamera('off');
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const commit = (next: CaptureData[]) => {
    photosRef.current = next;
    onUpdate('photos', next);
  };

  const add = (items: CaptureData[]) => commit([...photosRef.current, ...items].slice(0, MAX_PHOTOS));

  const handleFiles = async (files: FileList | null) => {
    const room = MAX_PHOTOS - photosRef.current.length;
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    if (room <= 0) {
      setMessage(`최대 ${MAX_PHOTOS}장까지 넣을 수 있어요.`);
      return;
    }
    setBusy(true);
    setMessage(list.length > room ? `최대 ${MAX_PHOTOS}장까지라 앞의 ${room}장만 담았어요.` : null);
    const loaded = await Promise.all(list.slice(0, room).map(loadFile));
    if (!mountedRef.current) return;
    const ok = loaded.filter((c): c is CaptureData => c !== null);
    if (ok.length < Math.min(room, list.length)) setMessage('일부 사진을 불러오지 못했어요.');
    add(ok);
    setBusy(false);
  };

  // 이미 담은 사진은 두고 남은 칸만 샘플 장면으로 채운다
  const addSamples = () => {
    setMessage(null);
    add(makeSampleCaptures(MAX_PHOTOS - photosRef.current.length));
  };

  const startCamera = async () => {
    setMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage('이 브라우저에서는 카메라를 쓸 수 없어요. 사진을 올리거나 샘플로 체험해 보세요.');
      return;
    }
    setCamera('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      setCamera('live');
    } catch {
      if (!mountedRef.current) return;
      setCamera('off');
      setMessage('카메라를 시작하지 못했어요. 권한을 허용하거나 사진을 올려 주세요.');
    }
  };

  const attachVideo = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  };

  const snap = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    add([captureFrom(video, video.videoWidth, video.videoHeight, { mirror: true, origin: 'camera' })]);
    stopCamera();
  };

  const remove = (index: number) => commit(photos.filter((_, i) => i !== index));
  const full = photos.length >= MAX_PHOTOS;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          <span className="font-semibold text-teal-300">{photos.length}</span> / {MAX_PHOTOS}장 · 최소 {MIN_PHOTOS}장
        </span>
        {photos.length > 0 && (
          <button type="button" onClick={() => commit([])} className="text-slate-500 underline-offset-4 hover:text-white hover:underline">
            모두 비우기
          </button>
        )}
      </div>

      {camera !== 'off' ? (
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900">
          {camera === 'live' ? (
            <video ref={attachVideo} autoPlay playsInline muted onLoadedMetadata={() => setVideoReady(true)} className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">카메라 권한을 요청하고 있어요…</div>
          )}
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-6">
            <button type="button" onClick={stopCamera} className="rounded-full bg-black/50 px-3 py-1.5 text-xs text-white">
              취소
            </button>
            <button
              type="button"
              onClick={snap}
              disabled={!videoReady}
              aria-label="추억 사진 촬영하기"
              className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white/80 bg-white/10 disabled:opacity-40"
            >
              <span className="h-9 w-9 rounded-full bg-white" />
            </button>
            <span className="w-10" aria-hidden="true" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: MAX_PHOTOS }, (_, i) => {
            const photo = photos[i];
            if (photo) {
              return (
                <motion.div key={`${i}-${photo.seed}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative aspect-[3/4] overflow-hidden rounded-xl border border-slate-700">
                  <motion.img src={photo.image} alt={`추억 사진 ${i + 1}`} className="h-full w-full object-cover" />
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 text-[10px] font-bold text-white">{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`${i + 1}번 사진 빼기`}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
                  >
                    ✕
                  </button>
                </motion.div>
              );
            }
            return (
              <button
                key={`empty-${i}`}
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-slate-500 transition-colors hover:border-slate-500 hover:text-slate-300"
                aria-label="사진 추가"
              >
                <span className="text-xl">＋</span>
                <span className="text-[10px]">{i < MIN_PHOTOS ? '필수' : '선택'}</span>
              </button>
            );
          })}
        </div>
      )}

      {busy && <p className="mt-3 text-center text-xs text-teal-300">사진을 3:4로 맞추는 중…</p>}
      {message && <p className="mt-3 text-center text-xs text-amber-300">{message}</p>}

      {camera === 'off' && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => fileRef.current?.click()}
              disabled={busy || full}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 disabled:opacity-40"
            >
              📁 사진 올리기
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={startCamera}
              disabled={busy || full}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500 disabled:opacity-40"
            >
              📷 카메라로 한 장
            </motion.button>
          </div>
          <button type="button" onClick={addSamples} disabled={busy || full} className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline disabled:opacity-40">
            ✨ 샘플 사진으로 체험
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <p className="mt-4 text-center text-[11px] text-slate-500">사진은 이 브라우저 안에서만 쓰이고 저장·전송되지 않아요</p>
    </div>
  );
}

const photosStep: DemoStepDef = {
  meta: {
    id: 'photos',
    titleKey: '추억 사진을 모아주세요',
    subtitleKey: `${MIN_PHOTOS}~${MAX_PHOTOS}장을 넣으면 AI가 감성 무비로 편집해요 (실제 행사는 5~20장)`,
    canProceed: (a) => getPhotos(a).length >= MIN_PHOTOS,
  },
  Component: PhotoCollector,
};

/* ── BGM (Web Audio 아르페지오) ─────────────────────────── */

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function playTone(ctx: AudioContext, out: AudioNode, freq: number, at: number, dur: number, wave: OscillatorType, peak: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/* ── Movie player ──────────────────────────────────────── */

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const PANS: [number, number, number, number][] = [
  // [시작 y%, 끝 y%, 시작 배율, 끝 배율]
  [25, 60, 1.05, 1.18],
  [65, 30, 1.18, 1.06],
  [35, 55, 1.1, 1.22],
  [60, 35, 1.04, 1.16],
];

function MoviePlayer({ photos, mood, title, message, color }: { photos: CaptureData[]; mood: Mood; title: string; message: string; color: string }) {
  const n = photos.length;
  const total = runtimeOf(n);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const ended = elapsed >= total;
  const isPlaying = playing && !ended;

  // 재생 시계
  useEffect(() => {
    if (!isPlaying) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setElapsed((e) => Math.min(total, e + dt));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, total]);

  // BGM 스케줄러
  useEffect(() => {
    const ctx = audioRef.current;
    if (!soundOn || !isPlaying || !ctx) return;
    const master = ctx.createGain();
    master.gain.value = mood.wave === 'square' ? 0.07 : 0.16;
    master.connect(ctx.destination);
    const eighth = 60 / mood.bpm / 2;
    let step = 0;
    let next = ctx.currentTime + 0.05;
    const timer = window.setInterval(() => {
      while (next < ctx.currentTime + 0.25) {
        const chord = mood.chords[Math.floor(step / 8) % mood.chords.length]!;
        const order = [0, 1, 2, 3, 2, 1, 2, 3];
        playTone(ctx, master, midiToFreq(chord[order[step % 8]!]!), next, eighth * 1.6, mood.wave, 0.5);
        if (step % 8 === 0) playTone(ctx, master, midiToFreq(chord[0]! - 12), next, eighth * 7.5, 'sine', 0.7);
        step++;
        next += eighth;
      }
    }, 60);
    return () => {
      window.clearInterval(timer);
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
      window.setTimeout(() => master.disconnect(), 400);
    };
  }, [soundOn, isPlaying, mood]);

  useEffect(() => {
    return () => {
      audioRef.current?.close().catch(() => {});
      audioRef.current = null;
    };
  }, []);

  const toggleSound = () => {
    if (soundOn) {
      setSoundOn(false);
      return;
    }
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) throw new Error('unsupported');
      audioRef.current = audioRef.current ?? new Ctor();
      audioRef.current.resume().catch(() => {});
      setSoundOn(true);
    } catch {
      setSoundError(true);
    }
  };

  const togglePlay = () => {
    if (ended) {
      setElapsed(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  };

  // 현재 장면
  let scene: { kind: 'title' | 'photo' | 'end'; index: number; local: number; duration: number };
  if (elapsed < TITLE_SEC) scene = { kind: 'title', index: -1, local: elapsed, duration: TITLE_SEC };
  else if (elapsed < TITLE_SEC + n * PHOTO_SEC) {
    const index = Math.floor((elapsed - TITLE_SEC) / PHOTO_SEC);
    scene = { kind: 'photo', index, local: elapsed - TITLE_SEC - index * PHOTO_SEC, duration: PHOTO_SEC };
  } else scene = { kind: 'end', index: n, local: elapsed - TITLE_SEC - n * PHOTO_SEC, duration: END_SEC };
  const p = Math.min(1, scene.local / scene.duration);

  const caption = scene.kind === 'photo' ? sceneCaption(mood, message, scene.index, n) : null;
  const pan = PANS[Math.max(0, scene.index) % PANS.length]!;
  const segments = [{ label: '타이틀', start: 0, dur: TITLE_SEC }, ...photos.map((_, i) => ({ label: `장면 ${i + 1}`, start: TITLE_SEC + i * PHOTO_SEC, dur: PHOTO_SEC })), { label: '엔딩', start: TITLE_SEC + n * PHOTO_SEC, dur: END_SEC }];

  const bars = Array.from({ length: 28 }, (_, i) => {
    if (!isPlaying) return 0.12 + ((i * 7) % 5) * 0.03;
    const beat = elapsed * (mood.bpm / 60) * Math.PI;
    return 0.15 + 0.85 * Math.abs(Math.sin(beat + i * 0.55)) * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + elapsed * 1.3)));
  });

  return (
    <div className="w-full max-w-md">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-700 bg-black shadow-2xl shadow-black/60">
        <AnimatePresence initial={false}>
          {scene.kind === 'title' && (
            <motion.div
              key="title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{ background: `radial-gradient(circle at 50% 40%, ${mood.colors[0]}66, #0b0b12 72%)` }}
            >
              <p className="text-[9px] font-semibold tracking-[0.5em] text-white/60">A NEANDER MEMORY FILM</p>
              <p className="mt-2 text-2xl font-bold text-white [word-break:keep-all] sm:text-3xl" style={{ fontFamily: SERIF, transform: `scale(${1 + p * 0.06})`, opacity: Math.min(1, p * 2.5) }}>
                {title}
              </p>
              <p className="mt-2 text-[10px] tracking-widest text-white/60">
                {mood.emoji} {mood.label} · {n} SCENES
              </p>
            </motion.div>
          )}
          {scene.kind === 'photo' && (
            <motion.div key={`photo-${scene.index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0">
              {/* 배경: 같은 사진을 흐리게 깔고 반대 방향으로 흐른다 */}
              <motion.img
                src={photos[scene.index]!.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  filter: `${gradeFilter(mood.grade)} blur(14px) brightness(0.55)`,
                  objectPosition: `50% ${pan[0] + (pan[1] - pan[0]) * p}%`,
                  transform: `scale(${1.25 + (pan[3] - pan[2]) * (1 - p)})`,
                }}
              />
              {/* 전경: 사진 전체가 보이도록 세로로 꽉 채우고 켄 번즈 줌·팬 */}
              <div className={cn('absolute inset-x-0 flex justify-center', mood.letterbox ? 'inset-y-[10%]' : 'inset-y-0')}>
                <motion.img
                  src={photos[scene.index]!.image}
                  alt={`장면 ${scene.index + 1}`}
                  className="h-full w-auto max-w-none shadow-[0_0_40px_rgba(0,0,0,0.6)]"
                  style={{
                    aspectRatio: '3 / 4',
                    filter: gradeFilter(mood.grade),
                    transform: `translateX(${(scene.index % 2 ? 1 : -1) * (6 - p * 12)}%) scale(${pan[2] + (pan[3] - pan[2]) * p})`,
                  }}
                />
              </div>
              <div className="absolute inset-0" style={{ background: washCss(mood.wash) }} />
            </motion.div>
          )}
          {scene.kind === 'end' && (
            <motion.div
              key="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#0b0b12] px-6 text-center"
            >
              <div style={{ transform: `translateY(${20 - p * 30}%)` }}>
                <p className="text-xl font-bold tracking-[0.3em] text-white" style={{ fontFamily: SERIF }}>
                  THE END
                </p>
                {message && <p className="mt-2 text-sm text-white/85 [word-break:keep-all]">“{message}”</p>}
                <p className="mt-3 text-[9px] tracking-[0.3em] text-white/50">DIRECTED BY AI NEANDER</p>
                <p className="text-[9px] tracking-[0.3em] text-white/50">MUSIC · {mood.track.toUpperCase()}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 비네팅 + 레터박스 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at center, transparent ${VIGNETTE.from * 100}%, rgba(0,0,0,${VIGNETTE.alpha}))` }}
        />
        {mood.letterbox && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[10%] bg-black" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%] bg-black" />
          </>
        )}

        {/* 자막 */}
        <AnimatePresence mode="wait">
          {caption && (
            <motion.p
              key={`cap-${scene.index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={cn(
                'absolute inset-x-6 text-center text-xs font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] [word-break:keep-all] sm:text-sm',
                mood.letterbox ? 'bottom-[12%]' : 'bottom-[8%]'
              )}
            >
              {caption}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute left-3 top-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-white/80">
          <span className={cn('h-1.5 w-1.5 rounded-full', isPlaying ? 'bg-red-500' : 'bg-white/50')} />
          {mood.emoji} {mood.label}
        </div>
        {scene.kind === 'photo' && (
          <span className="pointer-events-none absolute right-3 top-2.5 font-mono text-[10px] text-white/70">
            {String(scene.index + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}
          </span>
        )}

        {!isPlaying && (
          <button type="button" onClick={togglePlay} aria-label={ended ? '다시 재생' : '재생'} className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-2xl text-slate-900 shadow-xl">{ended ? '↻' : '▶'}</span>
          </button>
        )}
      </div>

      {/* 컨트롤 */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? '일시정지' : ended ? '다시 재생' : '재생'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {isPlaying ? '❚❚' : ended ? '↻' : '▶'}
        </button>
        <div className="flex h-2 flex-1 gap-[3px]">
          {segments.map((seg) => {
            const fill = Math.min(1, Math.max(0, (elapsed - seg.start) / seg.dur));
            return (
              <button
                key={seg.label}
                type="button"
                onClick={() => {
                  setElapsed(seg.start);
                  setPlaying(true);
                }}
                aria-label={`${seg.label} 구간으로 이동`}
                className="relative h-full overflow-hidden rounded-full bg-slate-800"
                style={{ flexGrow: seg.dur, flexBasis: 0 }}
              >
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${fill * 100}%`, backgroundColor: color }} />
              </button>
            );
          })}
        </div>
        <span className="shrink-0 font-mono text-[11px] text-slate-400">
          {formatTime(elapsed)} / {formatTime(total)}
        </span>
      </div>

      {/* BGM 비주얼라이저 */}
      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">AI BGM 매칭</p>
            <p className="truncate text-sm font-semibold text-white">♪ {mood.track}</p>
            <p className="text-[11px] text-slate-400">
              NEANDER Sound Lab · {mood.genre} · {mood.bpm} BPM
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            className={cn('shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors', soundOn ? 'text-white' : 'border-slate-700 text-slate-300 hover:border-slate-500')}
            style={soundOn ? { borderColor: color, backgroundColor: `${color}30` } : undefined}
          >
            {soundOn ? '🔊 BGM 켜짐' : '🔈 BGM 듣기'}
          </button>
        </div>
        <div className="mt-3 flex h-12 items-end gap-[3px]" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ height: `${h * 100}%`, background: `linear-gradient(to top, ${mood.colors[0]}, ${mood.colors[1]})`, opacity: 0.55 + h * 0.45 }}
            />
          ))}
        </div>
        {soundError && <p className="mt-2 text-[11px] text-amber-300">이 브라우저에서는 BGM 미리듣기를 재생할 수 없어요.</p>}
      </div>
    </div>
  );
}

/* ── Decorative QR ─────────────────────────────────────── */

function FakeQr({ seed }: { seed: number }) {
  const size = 25;
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ] as const) {
      if (x >= fx && x < fx + 7 && y >= fy && y < fy + 7) {
        const dx = x - fx;
        const dy = y - fy;
        const ring = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        return ring || core ? 1 : 0;
      }
      if (x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7) return 0;
    }
    return -1;
  };
  const cells: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const f = finder(x, y);
      if (f === 1 || (f === -1 && seededRandom(seed, x * 31 + y) > 0.52)) cells.push([x, y]);
    }
  }
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} className="h-28 w-28 rounded-lg bg-white" role="img" aria-label="장식용 QR 코드">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="#0f172a" />
      ))}
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

/** 결과 화면과 출력물이 함께 쓰는 무비 정보 */
function movieOf(answers: DemoAnswers) {
  const picked = getChoice(answers, 'mood') as MoodId | undefined;
  const mood = (picked && MOODS[picked]) || MOODS.flutter;
  const text = getFields<string>(answers, 'text');
  return {
    photos: getPhotos(answers),
    mood,
    title: (text.title ?? '').trim() || mood.fallbackTitle,
    message: (text.message ?? '').trim(),
  };
}

/* ── Print (필름 스틸 4컷) ─────────────────────────────── */

const SVG_SANS = "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif";

/** 인화할 장면 — 4컷 이하면 전부, 넘으면 앞의 세 장면 + 엔딩 직전 장면(직접 쓴 자막) */
function stillIndexes(count: number): number[] {
  if (count <= 4) return Array.from({ length: count }, (_, i) => i);
  return [0, 1, 2, count - 1];
}

/** 글자 폭 어림 (em) — 한글 1, 라틴 대문자·숫자 0.68, 공백 0.3, 그 외 0.55 */
function textEm(text: string): number {
  let em = 0;
  for (const ch of text) {
    if (/[\u1100-\u11ff\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/.test(ch)) em += 1;
    else if (/[A-Z0-9]/.test(ch)) em += 0.68;
    else if (ch === ' ') em += 0.3;
    else em += 0.55;
  }
  return em;
}

/** 자막을 폭에 맞춰 줄바꿈 (단어 단위) */
function wrapCaption(text: string, maxEm: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && textEm(next) > maxEm) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** 필름 스틸 한 컷 — 화면 플레이어와 같은 색 워시 · 비네팅 · 레터박스 · 자막 */
function StillOverlay({ mood, caption, index, count }: { mood: Mood; caption: string; index: number; count: number }) {
  const { angle, stops } = mood.wash;
  const rad = (angle * Math.PI) / 180;
  const [dx, dy] = [Math.sin(rad) / 2, -Math.cos(rad) / 2];
  const fontSize = 15;
  const lines = wrapCaption(caption, 16.5);
  const bottom = mood.letterbox ? 348 : 372;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" fontFamily={SVG_SANS}>
      <defs>
        <linearGradient id="mm-wash" x1={0.5 - dx} y1={0.5 - dy} x2={0.5 + dx} y2={0.5 + dy}>
          {stops.map(([color, alpha], i) => (
            <stop key={color} offset={i} stopColor={color} stopOpacity={alpha} />
          ))}
        </linearGradient>
        <radialGradient id="mm-vignette" r="0.71">
          <stop offset={VIGNETTE.from} stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={VIGNETTE.alpha} />
        </radialGradient>
        <filter id="mm-shadow" x="-10%" y="-40%" width="120%" height="180%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.9" />
        </filter>
      </defs>
      <rect width="300" height="400" fill="url(#mm-wash)" />
      <rect width="300" height="400" fill="url(#mm-vignette)" />
      {mood.letterbox && (
        <>
          <rect width="300" height="40" fill="#000" />
          <rect y="360" width="300" height="40" fill="#000" />
        </>
      )}
      <text x="286" y={mood.letterbox ? 25 : 22} textAnchor="end" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" fill="rgba(255,255,255,0.75)">
        {String(index + 1).padStart(2, '0')}/{String(count).padStart(2, '0')}
      </text>
      <g filter="url(#mm-shadow)" fill="#fff" fontSize={fontSize} fontWeight="600" textAnchor="middle">
        {lines.map((line, i) => (
          <text key={i} x="150" y={bottom - (lines.length - 1 - i) * (fontSize + 5)}>
            {line}
          </text>
        ))}
      </g>
    </svg>
  );
}

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const { photos, mood, title, message } = movieOf(answers);
  const seed = answersSeed(answers);
  const code = `NDR-${seededInt(seed, 'code', 0x10000, 0xfffff).toString(16).toUpperCase()}`;
  const total = runtimeOf(photos.length);

  return (
    <ResultShell
      eyebrow={`AI 추억 무비 메이커 · ${mood.label}`}
      title={`🎞️ ${title}`}
      description={`사진 ${photos.length}장을 ${mood.label} 무드로 편집하고, 어울리는 BGM과 자막을 입혔어요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="새 무비 만들기"
    >
      {photos.length > 0 && <MoviePlayer photos={photos} mood={mood} title={title} message={message} color={pillarColor} />}

      <InfoGrid
        columns={3}
        items={[
          { label: '러닝타임', value: formatTime(total) },
          { label: '장면 수', value: `${photos.length}컷` },
          { label: '화질', value: '16:9 FHD' },
        ]}
      />

      <TraitChips title="AI 편집 노트" items={['켄 번즈 줌·팬', '크로스페이드 전환', `${mood.label} 컬러 그레이딩`, '자막 자동 배치', `BGM ${mood.bpm} BPM 비트 싱크`]} />

      <div className="flex w-full max-w-md items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left">
        <FakeQr seed={seed} />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">QR 다운로드</p>
          <p className="mt-1 text-sm font-semibold text-white [word-break:keep-all]">스캔하면 폰으로 바로 받아요</p>
          <p className="mt-1 font-mono text-xs" style={{ color: pillarColor }}>
            {code}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500 [word-break:keep-all]">현장에서는 MP4로 바로 저장돼요. 데모의 QR은 장식용이에요.</p>
        </div>
      </div>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  return getChoice(answers, 'mood') ?? 'flutter';
}

export default defineDemo({
  config: {
    id: 'memory-movie',
    targetSlug: 'ai-memory-movie',
    industryId: 'wedding',
    analyzeEmoji: '🎞️',
    analyzeDurationMs: 3800,
    analyzeMessages: ['사진 속 표정·장면 분석 중', '감성 컷 순서 편집 중', '분위기에 맞는 BGM 매칭 중', '자막 입히고 렌더링 중'],
  },
  steps: [
    photosStep,
    choiceStep({
      id: 'mood',
      title: '어떤 분위기의 무비로 만들까요?',
      subtitle: '분위기에 맞춰 색감과 BGM을 AI가 골라요',
      columns: 2,
      options: (Object.keys(MOODS) as MoodId[]).map((id) => ({
        id,
        emoji: MOODS[id].emoji,
        label: MOODS[id].label,
        desc: `♪ ${MOODS[id].genre} · ${MOODS[id].bpm} BPM`,
        swatch: `linear-gradient(135deg, ${MOODS[id].colors.join(', ')})`,
      })),
    }),
    textStep({
      id: 'text',
      title: '무비 제목과 자막을 넣어볼까요?',
      subtitle: '비워 두면 AI가 분위기에 맞게 채워요',
      fields: [
        { id: 'title', label: '무비 제목', placeholder: '예) 우리의 첫 번째 계절', maxLength: 20, optional: true },
        { id: 'message', label: '마지막 장면 자막', placeholder: '예) 함께한 모든 순간이 고마워', maxLength: 36, optional: true },
      ],
    }),
  ],
  computeResult,
  Result,
  print: (answers) => {
    const { photos, mood, title, message } = movieOf(answers);
    const n = photos.length;
    return {
      kind: 'photo',
      photos: stillIndexes(n).map((i) => ({
        src: photos[i]!.image,
        look: { adjust: mood.grade },
        overlay: <StillOverlay mood={mood} caption={sceneCaption(mood, message, i, n)} index={i} count={n} />,
      })),
      title,
      caption: `${mood.label} 무드 · ♪ ${mood.track} · ${n}컷 · 러닝타임 ${formatTime(runtimeOf(n))}`,
      paper: 'black',
    };
  },
});
