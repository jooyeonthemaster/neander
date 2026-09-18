'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  InfoGrid,
  Panel,
  ResultShell,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  renderLook,
  seededInt,
  seededPick,
  seededRandom,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type EffectId = 'cyber' | 'vhs' | 'fantasy' | 'noir';
type GenreId = 'kpop' | 'citypop' | 'lofi' | 'rock' | 'ballad' | 'edm';

interface Effect {
  label: string;
  emoji: string;
  desc: string;
  swatch: string;
  accent: string;
  looks: [PhotoLook, PhotoLook, PhotoLook, PhotoLook];
  lookNames: [string, string, string, string];
}

const EFFECTS: Record<EffectId, Effect> = {
  cyber: {
    label: '사이버펑크',
    emoji: '🌃',
    desc: '네온 조명 & 글리치',
    swatch: 'linear-gradient(135deg,#1e0b3a,#db2777,#22d3ee)',
    accent: '#f0abfc',
    looks: [
      {
        adjust: { contrast: 1.25, saturation: 1.35, brightness: 0.95 },
        paints: [
          { x: 0, y: 40, rx: 50, ry: 60, color: '#ec4899', alpha: 0.6, blend: 'screen' },
          { x: 100, y: 40, rx: 50, ry: 60, color: '#22d3ee', alpha: 0.5, blend: 'screen' },
        ],
        tint: { color: '#6d28d9', alpha: 0.3, blend: 'overlay' },
        vignette: 0.4,
      },
      {
        effect: { kind: 'duotone', dark: '#1e0b3a', light: '#22d3ee' },
        paints: [{ x: 10, y: 20, rx: 45, ry: 40, color: '#ec4899', alpha: 0.55, blend: 'screen' }],
        vignette: 0.35,
      },
      {
        adjust: { contrast: 1.2, saturation: 1.5 },
        effect: { kind: 'posterize', levels: 5 },
        tint: { color: '#ec4899', alpha: 0.35, blend: 'overlay' },
        vignette: 0.3,
      },
      {
        adjust: { contrast: 1.2, saturation: 1.4 },
        effect: { kind: 'pixelate', block: 9 },
        tint: { color: '#22d3ee', alpha: 0.3, blend: 'overlay' },
        vignette: 0.4,
      },
    ],
    lookNames: ['네온 사이드라이트', '시안 듀오톤', '포스터 글리치', '픽셀 노이즈'],
  },
  vhs: {
    label: '레트로 VHS',
    emoji: '📼',
    desc: '90년대 비디오테이프 감성',
    swatch: 'linear-gradient(135deg,#f59e0b,#f43f5e,#0ea5e9)',
    accent: '#fcd34d',
    looks: [
      {
        adjust: { saturation: 0.75, contrast: 0.9, brightness: 1.05, warmth: 0.25 },
        tint: { color: '#fde68a', alpha: 0.25, blend: 'soft-light' },
        grain: 28,
        vignette: 0.3,
      },
      { adjust: { saturation: 0.5, sepia: 0.3, contrast: 0.85, brightness: 1.1 }, grain: 32, vignette: 0.35 },
      { adjust: { saturation: 0.9, warmth: 0.2 }, effect: { kind: 'pixelate', block: 4 }, grain: 24, vignette: 0.3 },
      {
        adjust: { saturation: 1.3, contrast: 1.1 },
        tint: { color: '#f43f5e', alpha: 0.3, blend: 'soft-light' },
        paints: [{ x: 100, y: 50, rx: 40, ry: 70, color: '#22d3ee', alpha: 0.35, blend: 'screen' }],
        grain: 26,
        vignette: 0.3,
      },
    ],
    lookNames: ['웜 테이프', '바랜 필름', '저화질 녹화', '컬러 번짐'],
  },
  fantasy: {
    label: '판타지',
    emoji: '🦋',
    desc: '몽환적인 빛 입자',
    swatch: 'linear-gradient(135deg,#c4b5fd,#f0abfc,#fde68a)',
    accent: '#f5d0fe',
    looks: [
      {
        adjust: { brightness: 1.1, saturation: 1.2, contrast: 0.95 },
        paints: [
          { x: 15, y: 15, rx: 40, ry: 35, color: '#f0abfc', alpha: 0.5, blend: 'screen' },
          { x: 88, y: 30, rx: 35, ry: 35, color: '#a78bfa', alpha: 0.5, blend: 'screen' },
          { x: 50, y: 98, rx: 60, ry: 25, color: '#fde68a', alpha: 0.45, blend: 'screen' },
        ],
        tint: { color: '#f0abfc', alpha: 0.3, blend: 'soft-light' },
        vignette: 0.2,
      },
      {
        effect: { kind: 'duotone', dark: '#4c1d95', light: '#fce7f3' },
        paints: [{ x: 80, y: 10, rx: 45, ry: 40, color: '#fde68a', alpha: 0.5, blend: 'screen' }],
      },
      {
        adjust: { brightness: 1.15, saturation: 1.1 },
        effect: { kind: 'posterize', levels: 7 },
        tint: { color: '#a5b4fc', alpha: 0.4, blend: 'soft-light' },
      },
      {
        adjust: { warmth: 0.4, brightness: 1.1, saturation: 1.1 },
        paints: [{ x: 50, y: 20, rx: 80, ry: 50, color: '#fde68a', alpha: 0.4, blend: 'screen' }],
        vignette: 0.25,
      },
    ],
    lookNames: ['요정의 숲', '라벤더 드림', '파스텔 수채', '골든 아워'],
  },
  noir: {
    label: '흑백 누아르',
    emoji: '🎞️',
    desc: '고전 영화의 강렬한 명암',
    swatch: 'linear-gradient(135deg,#0a0a0a,#737373,#fafafa)',
    accent: '#e5e5e5',
    looks: [
      { adjust: { saturation: 0, contrast: 1.45, brightness: 0.95 }, grain: 30, vignette: 0.6 },
      { effect: { kind: 'ink', paper: '#e5e5e5' }, grain: 20, vignette: 0.4 },
      { adjust: { saturation: 0, contrast: 1.2, brightness: 1.2 }, grain: 22, vignette: 0.3 },
      { adjust: { saturation: 0, contrast: 1.7, brightness: 0.8 }, grain: 28, vignette: 0.75 },
    ],
    lookNames: ['하드 라이트', '먹선 스케치', '하이키', '로우키 실루엣'],
  },
};

const GENRES: Record<GenreId, { label: string; emoji: string; desc: string; bpm: number; lyrics: string[]; roots: number[] }> = {
  kpop: {
    label: 'K-POP 댄스',
    emoji: '💃',
    desc: '중독성 강한 훅',
    bpm: 124,
    lyrics: ['조명이 켜지면 시작돼', '멈추지 마 지금 이 순간', '내 이름을 불러줘 더 크게', '이 무대의 주인공은 나야'],
    roots: [55, 49, 52, 46.25],
  },
  citypop: {
    label: '시티팝',
    emoji: '🌆',
    desc: '레트로 도시의 밤',
    bpm: 108,
    lyrics: ['창밖엔 반짝이는 도시', '라디오에 흐르는 우리 노래', '해 질 녘 드라이브, 너와 나', '이 밤이 끝나지 않게'],
    roots: [43.65, 49, 41.2, 46.25],
  },
  lofi: {
    label: '로파이 힙합',
    emoji: '🎧',
    desc: '느긋한 오후 감성',
    bpm: 82,
    lyrics: ['느리게 흘러가는 오후', '커피 한 잔, 창가의 햇살', '아무 생각 없이 걷고 싶어', '오늘도 수고했어, 나'],
    roots: [49, 41.2, 43.65, 36.7],
  },
  rock: {
    label: '록',
    emoji: '🎸',
    desc: '터질 듯한 에너지',
    bpm: 140,
    lyrics: ['심장이 터질 듯 뛰어', '소리쳐 더 크게', '부서져도 다시 일어서', '끝까지 달려 나가자'],
    roots: [41.2, 41.2, 55, 49],
  },
  ballad: {
    label: '발라드',
    emoji: '🎹',
    desc: '잔잔한 감성',
    bpm: 72,
    lyrics: ['기억 속 그날의 너', '천천히 번지는 노을처럼', '다 전하지 못한 말들', '여기 노래로 남길게'],
    roots: [65.4, 49, 55, 43.65],
  },
  edm: {
    label: 'EDM',
    emoji: '🔊',
    desc: '페스티벌 드롭',
    bpm: 128,
    lyrics: ['3, 2, 1 — 드롭!', '빛이 쏟아지는 플로어', '손을 들어 하늘 높이', '이 비트에 몸을 맡겨'],
    roots: [55, 55, 43.65, 49],
  },
};

const TITLE_A = ['Midnight', 'Neon', 'Velvet', 'Paper', 'Golden', 'Blue', 'Silver', 'Electric', 'Moonlight', 'Summer'];
const TITLE_B = ['Runaway', 'Signal', 'Heartbeat', 'Parade', 'Dreamer', 'Highway', 'Letter', 'Mirage', 'Frequency', 'Rush'];

const DURATION = 15;
const CUT = DURATION / 4;

/** 컷마다 다른 카메라 무빙 (scale, x%, y%) */
const MOVES = [
  { name: '인트로 · 클로즈업', from: [1.45, 0, 6], to: [1.2, 0, 3] },
  { name: '벌스 · 패닝', from: [1.3, -7, 0], to: [1.3, 7, 0] },
  { name: '코러스 · 줌아웃', from: [1.5, 0, 4], to: [1.05, 0, 0] },
  { name: '아웃트로 · 틸트', from: [1.2, 0, 6], to: [1.2, 0, -5] },
] as const;

function kenBurns(cut: number, local: number): string {
  const m = MOVES[cut] ?? MOVES[0];
  const e = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
  const [s0, x0, y0] = m.from;
  const [s1, x1, y1] = m.to;
  return `scale(${s0 + (s1 - s0) * e}) translate(${x0 + (x1 - x0) * e}%, ${y0 + (y1 - y0) * e}%)`;
}

function formatTime(sec: number): string {
  const s = Math.floor(sec);
  return `0:${String(s).padStart(2, '0')}`;
}

function track(answers: DemoAnswers) {
  const seed = answersSeed(answers);
  const effect = (getChoice(answers, 'effect') as EffectId | undefined) ?? 'cyber';
  const genre = (getChoice(answers, 'bgm') as GenreId | undefined) ?? 'kpop';
  const title = `${seededPick(seed, 'ta', TITLE_A)} ${seededPick(seed, 'tb', TITLE_B)}`;
  return { seed, effect, genre, title };
}

/* ── Beat synth (Web Audio, 사용자가 켰을 때만) ─────────── */

function scheduleBeat(ctx: AudioContext, noise: AudioBuffer, when: number, step: number, genre: GenreId, bar: number) {
  const out = ctx.destination;
  const soft = genre === 'ballad' || genre === 'lofi';
  const kickSteps = genre === 'rock' ? [0, 3, 4] : soft ? [0, 5] : genre === 'citypop' ? [0, 3, 6] : [0, 2, 4, 6];

  if (kickSteps.includes(step)) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, when);
    osc.frequency.exponentialRampToValueAtTime(45, when + 0.12);
    gain.gain.setValueAtTime(soft ? 0.5 : 0.8, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.3);
    osc.connect(gain).connect(out);
    osc.start(when);
    osc.stop(when + 0.32);
  }
  if (step === 2 || step === 6) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(soft ? 0.25 : 0.45, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.16);
    src.connect(filter).connect(gain).connect(out);
    src.start(when);
    src.stop(when + 0.18);
  }
  {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(step % 2 ? 0.08 : 0.14, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
    src.connect(filter).connect(gain).connect(out);
    src.start(when);
    src.stop(when + 0.06);
  }
  if (step % 2 === 0) {
    const root = GENRES[genre].roots[bar % 4] ?? 55;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = root * (step === 4 ? 2 : 1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.25);
    osc.connect(gain).connect(out);
    osc.start(when);
    osc.stop(when + 0.27);
  }
}

/* ── Effect overlays ───────────────────────────────────── */

const PARTICLES = Array.from({ length: 16 }, (_, i) => i);

/** 네온 그리드 바닥 (100×40 좌표, 정적 SVG) — 재생 시간에 따라 가로줄이 흘러간다 */
function NeonGridLines({ time }: { time: number }) {
  return (
    <>
      <defs>
        <linearGradient id="mv-grid-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ec4899" stopOpacity="0" />
          <stop offset="1" stopColor="#ec4899" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <g stroke="url(#mv-grid-fade)" strokeWidth="0.4">
        {[-60, -40, -20, 0, 20, 40, 60, 80, 100, 120, 140, 160].map((x) => (
          <line key={x} x1="50" y1="0" x2={x} y2="40" />
        ))}
        {[4, 9, 15, 22, 30, 39].map((y, i) => (
          <line key={y} x1="0" x2="100" y1={(y + (time * 8 * (i + 1)) / 6) % 40} y2={(y + (time * 8 * (i + 1)) / 6) % 40} />
        ))}
      </g>
    </>
  );
}

function EffectOverlay({ effect, frame, time, seed }: { effect: EffectId; frame: string; time: number; seed: number }) {
  if (effect === 'cyber') {
    return (
      <>
        {/* RGB 분리 글리치 */}
        <motion.img
          src={frame}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-screen"
          style={{ filter: 'hue-rotate(140deg) saturate(2)' }}
          animate={{ x: [0, -8, 6, 0, 0], opacity: [0, 0.5, 0.4, 0, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.6 }}
        />
        {/* 네온 그리드 바닥 */}
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] w-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <NeonGridLines time={time} />
        </svg>
        <p className="absolute left-3 top-9 font-mono text-[9px] tracking-widest text-cyan-300 drop-shadow-[0_0_6px_#22d3ee]">
          ▲ NEON//MODE
        </p>
      </>
    );
  }

  if (effect === 'vhs') {
    const band = (time * 23) % 120;
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 1px, transparent 1px 3px)' }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 h-[9%] mix-blend-screen"
          style={{
            top: `${band - 10}%`,
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 3px, rgba(255,255,255,0.05) 3px 7px, rgba(255,255,255,0.18) 7px 9px)',
            filter: 'blur(0.6px)',
          }}
        />
        <div
          className="absolute inset-x-3 top-9 flex justify-between font-mono text-[11px] font-bold text-white"
          style={{ textShadow: '2px 0 #f43f5e, -2px 0 #22d3ee' }}
        >
          <span>PLAY ▶</span>
          <span>SP</span>
        </div>
        <p
          className="absolute left-3 top-[3.6rem] font-mono text-[10px] font-bold text-white"
          style={{ textShadow: '2px 0 #f43f5e, -2px 0 #22d3ee' }}
        >
          JAN.01 1999
        </p>
      </>
    );
  }

  if (effect === 'fantasy') {
    return (
      <>
        {PARTICLES.map((i) => {
          const x = seededInt(seed, `px${i}`, 4, 96);
          const size = seededInt(seed, `ps${i}`, 3, 7);
          const dur = 3 + seededRandom(seed, `pd${i}`) * 3;
          return (
            <motion.span
              key={i}
              className="pointer-events-none absolute rounded-full bg-white"
              style={{ left: `${x}%`, width: size, height: size, boxShadow: '0 0 10px 3px rgba(250,232,255,0.9)' }}
              initial={{ top: '105%', opacity: 0 }}
              animate={{ top: ['105%', '-5%'], opacity: [0, 1, 0] }}
              transition={{ duration: dur, repeat: Infinity, delay: (i % 6) * 0.5, ease: 'linear' }}
            />
          );
        })}
        {[18, 72].map((x, i) => (
          <motion.span
            key={x}
            className="pointer-events-none absolute text-xl"
            style={{ left: `${x}%` }}
            animate={{ top: i ? ['70%', '40%', '55%'] : ['30%', '12%', '28%'], rotate: [0, 12, -8, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
          >
            🦋
          </motion.span>
        ))}
      </>
    );
  }

  // noir
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{ backgroundImage: 'repeating-linear-gradient(-18deg, rgba(0,0,0,0.35) 0 14px, transparent 14px 30px)' }}
      />
      {[22, 68].map((x, i) => (
        <motion.span
          key={x}
          className="pointer-events-none absolute inset-y-0 w-px bg-white/40"
          style={{ left: `${x}%` }}
          animate={{ opacity: [0, 0.8, 0, 0.5, 0], x: [0, 6, -4, 2, 0] }}
          transition={{ duration: 0.9 + i * 0.4, repeat: Infinity, repeatDelay: 0.8 }}
        />
      ))}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-white"
        animate={{ opacity: [0, 0.06, 0, 0.04, 0] }}
        transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.3 }}
      />
      <div className="absolute inset-x-0 top-0 h-[7%] bg-black" />
      <div className="absolute inset-x-0 bottom-0 h-[7%] bg-black" />
    </>
  );
}

/* ── Print storyboard cut (정적 SVG, 300×400) ─────────── */

const PRINT_SANS = 'Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Helvetica Neue", Arial, sans-serif';
const PRINT_MONO = 'ui-monospace, Menlo, monospace';

/** 컷 한 장의 이펙트 장식 + 가사 자막 — 화면 플레이어 오버레이를 그 컷 시점으로 멈춘 모습 */
function CutPrint({ effect, cut, lyric, seed }: { effect: EffectId; cut: number; lyric: string; seed: number }) {
  // 컷 가운데 시점
  const time = cut * CUT + CUT / 2;
  const rgb = (text: string, x: number, y: number, size: number, anchor: 'start' | 'end' = 'start') => (
    <g fontFamily={PRINT_MONO} fontSize={size} fontWeight="700" textAnchor={anchor}>
      <text x={x + 2.4} y={y} fill="#f43f5e">
        {text}
      </text>
      <text x={x - 2.4} y={y} fill="#22d3ee">
        {text}
      </text>
      <text x={x} y={y} fill="#ffffff">
        {text}
      </text>
    </g>
  );

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width={1200} height={1600}>
      {effect === 'cyber' && (
        <>
          <svg x="0" y="288" width="300" height="112" viewBox="0 0 100 40" preserveAspectRatio="none">
            <NeonGridLines time={time} />
          </svg>
          <text x="14" y="52" fontFamily={PRINT_MONO} fontSize="10.7" letterSpacing="2" fontWeight="700" fill="#67e8f9" stroke="#083344" strokeOpacity="0.7" strokeWidth="1.6" paintOrder="stroke">
            ▲ NEON//MODE
          </text>
        </>
      )}

      {effect === 'vhs' && (
        <>
          <defs>
            <pattern id="vhs-scan" width="300" height="3.6" patternUnits="userSpaceOnUse">
              <rect width="300" height="1.2" fill="#000000" fillOpacity="0.17" />
            </pattern>
            <pattern id="vhs-band" width="10.7" height="40" patternUnits="userSpaceOnUse">
              <rect width="3.6" height="40" fill="#ffffff" fillOpacity="0.25" />
              <rect x="3.6" width="4.8" height="40" fill="#ffffff" fillOpacity="0.05" />
              <rect x="8.4" width="2.3" height="40" fill="#ffffff" fillOpacity="0.18" />
            </pattern>
          </defs>
          <rect width="300" height="400" fill="url(#vhs-scan)" />
          <rect y={(((time * 23) % 120) - 10) * 4} width="300" height="36" fill="url(#vhs-band)" />
          {rgb('PLAY ▶', 14, 57, 13)}
          {rgb('SP', 286, 57, 13, 'end')}
          {rgb('JAN.01 1999', 14, 80, 12)}
        </>
      )}

      {effect === 'fantasy' && (
        <>
          <defs>
            <radialGradient id="fairy-glow">
              <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="0.35" stopColor="#fae8ff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fae8ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {PARTICLES.map((i) => (
            <circle
              key={i}
              cx={seededInt(seed, `px${i}`, 4, 96) * 3}
              cy={seededInt(seed, `py${i}-${cut}`, 6, 94) * 4}
              r={seededInt(seed, `ps${i}`, 3, 7) * 1.6}
              fill="url(#fairy-glow)"
            />
          ))}
          {[
            { x: 54, y: 30 + cut * 14, s: 1.4 },
            { x: 216, y: 250 - cut * 22, s: 1.1 },
          ].map((b, i) => (
            <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${i ? 12 : -10}) scale(${b.s})`} fill="#60a5fa" stroke="#1e3a8a" strokeWidth="0.8">
              <ellipse cx="-7" cy="-5" rx="8" ry="6.5" transform="rotate(-25 -7 -5)" />
              <ellipse cx="7" cy="-5" rx="8" ry="6.5" transform="rotate(25 7 -5)" />
              <ellipse cx="-5" cy="5" rx="5" ry="4" fill="#93c5fd" />
              <ellipse cx="5" cy="5" rx="5" ry="4" fill="#93c5fd" />
              <rect x="-1" y="-9" width="2" height="18" rx="1" fill="#1e293b" stroke="none" />
            </g>
          ))}
        </>
      )}

      {effect === 'noir' && (
        <>
          <defs>
            <pattern id="noir-blinds" width="36" height="400" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
              <rect width="17" height="400" fill="#000000" fillOpacity="0.22" />
            </pattern>
          </defs>
          <rect width="300" height="400" fill="url(#noir-blinds)" />
          {[22, 68].map((x, i) => (
            <line key={x} x1={x * 3 + i * 3} y1="0" x2={x * 3 - 2} y2="400" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />
          ))}
          <rect width="300" height="28" fill="#000000" />
          <rect y="372" width="300" height="28" fill="#000000" />
        </>
      )}

      {/* 가사 자막 */}
      <text
        x="150"
        y="334"
        textAnchor="middle"
        fontFamily={PRINT_SANS}
        fontSize="15"
        fontWeight="700"
        fill="#ffffff"
        stroke="rgba(0,0,0,0.7)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {`♪ ${lyric}`}
      </text>
    </svg>
  );
}

const PAPER: Record<EffectId, 'white' | 'cream' | 'black'> = { cyber: 'black', vhs: 'cream', fantasy: 'white', noir: 'black' };

/* ── Player ────────────────────────────────────────────── */

function MvPlayer({ answers, pillarColor }: { answers: DemoAnswers; pillarColor: string }) {
  const capture = getCapture(answers, 'shot');
  const { seed, effect: effectId, genre: genreId, title } = track(answers);
  const effect = EFFECTS[effectId];
  const genre = GENRES[genreId];
  const src = capture?.image ?? '';

  const [frames, setFrames] = useState<string[] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<{ ctx: AudioContext; noise: AudioBuffer } | null>(null);

  const ended = time >= DURATION;
  const running = playing && !ended && frames !== null;

  // 4개 컷의 룩을 한 번에 렌더링
  useEffect(() => {
    if (!src) return;
    let alive = true;
    Promise.all(effect.looks.map((look) => renderLook(src, look)))
      .catch(() => effect.looks.map(() => src))
      .then((urls) => {
        if (!alive) return;
        setFrames(urls);
        setPlaying(true);
      });
    return () => {
      alive = false;
    };
  }, [src, effect]);

  // 재생 시계
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime((prev) => Math.min(DURATION, prev + dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  // 비트 스케줄러 (8분음표 단위)
  useEffect(() => {
    const audio = audioRef.current;
    if (!running || !soundOn || !audio) return;
    const { ctx, noise } = audio;
    const stepDur = 60 / genre.bpm / 2;
    let step = 0;
    let nextAt = ctx.currentTime + 0.05;
    const timer = window.setInterval(() => {
      while (nextAt < ctx.currentTime + 0.15) {
        scheduleBeat(ctx, noise, nextAt, step % 8, genreId, Math.floor(step / 8));
        nextAt += stepDur;
        step++;
      }
    }, 40);
    return () => window.clearInterval(timer);
  }, [running, soundOn, genre.bpm, genreId]);

  useEffect(() => {
    return () => {
      audioRef.current?.ctx.close().catch(() => {});
    };
  }, []);

  const toggleSound = () => {
    if (!soundOn && !audioRef.current) {
      try {
        const ctx = new AudioContext();
        const noise = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        audioRef.current = { ctx, noise };
      } catch {
        return;
      }
    }
    audioRef.current?.ctx.resume().catch(() => {});
    setSoundOn((v) => !v);
  };

  const togglePlay = () => {
    if (ended) {
      setTime(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  };

  const cut = Math.min(3, Math.floor(time / CUT));
  const local = Math.min(1, (time - cut * CUT) / CUT);
  const bars = Array.from({ length: 18 }, (_, i) => ({
    peak: seededInt(seed, `eq${i}`, 35, 100),
    low: seededInt(seed, `eql${i}`, 10, 35),
  }));
  const beat = 60 / genre.bpm;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      {/* 9:16 플레이어 */}
      <div className="relative aspect-[9/16] w-[252px] overflow-hidden rounded-[1.75rem] border border-slate-700 bg-black shadow-2xl shadow-black/60">
        {!frames && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <motion.div
              className="h-7 w-7 rounded-full border-2 border-t-transparent"
              style={{ borderColor: `${pillarColor} transparent ${pillarColor} ${pillarColor}` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-xs text-slate-400">AI 이펙트 렌더링 중…</p>
          </div>
        )}

        {frames?.map((url, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: i === cut ? 1 : 0 }}
          >
            <div className="h-full w-full" style={{ transform: kenBurns(i, i === cut ? local : 0), transformOrigin: '50% 32%' }}>
              <motion.img
                src={url}
                alt={i === cut ? `${effect.label} 뮤직비디오 컷 ${i + 1}` : ''}
                className="h-full w-full object-cover"
                initial={i === 0 ? { opacity: 0, filter: 'blur(12px)' } : false}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        ))}

        {frames && (
          <>
            <EffectOverlay effect={effectId} frame={frames[cut] ?? src} time={time} seed={seed} />
            {/* 컷 전환 플래시 */}
            <AnimatePresence>
              <motion.div
                key={cut}
                className={cn('pointer-events-none absolute inset-0', effectId === 'noir' ? 'bg-black' : 'bg-white')}
                initial={{ opacity: time > 0.2 ? 0.7 : 0 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            </AnimatePresence>

            {/* 상단 워터마크 */}
            <div className="absolute inset-x-3 top-3 flex items-center justify-between">
              <span className="rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-bold tracking-[0.25em] text-white backdrop-blur-sm">
                NEANDER MV
              </span>
              <span className="rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                {effect.emoji} {effect.label}
              </span>
            </div>

            {/* 가사 자막 */}
            <AnimatePresence mode="wait">
              <motion.p
                key={cut}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-x-3 bottom-16 text-center text-sm font-bold text-white [word-break:keep-all]"
                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
              >
                ♪ {genre.lyrics[cut]}
              </motion.p>
            </AnimatePresence>

            {/* 곡 정보 */}
            <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
              <motion.span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/40 text-[10px]"
                animate={running ? { rotate: 360 } : { rotate: 0 }}
                transition={running ? { duration: 3, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
              >
                💿
              </motion.span>
              <div className="min-w-0 text-left">
                <p className="truncate text-[11px] font-bold text-white">{title}</p>
                <p className="truncate text-[9px] text-white/70">
                  YOU · {genre.label} · {genre.bpm} BPM
                </p>
              </div>
            </div>

            {/* 재생/일시정지 오버레이 */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={ended ? '다시 재생' : running ? '일시정지' : '재생'}
              className="absolute inset-0 flex items-center justify-center"
            >
              <AnimatePresence>
                {!running && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.3, opacity: 0 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-2xl text-white backdrop-blur"
                  >
                    {ended ? '↻' : '▶'}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </>
        )}
      </div>

      {/* 컨트롤 바 */}
      <div className="w-full max-w-[320px] space-y-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!frames}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-slate-950 disabled:opacity-40"
            style={{ backgroundColor: pillarColor }}
            aria-label={running ? '일시정지' : '재생'}
          >
            {running ? '❚❚' : ended ? '↻' : '▶'}
          </button>
          <div className="relative h-1.5 flex-1 rounded-full bg-slate-800">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(time / DURATION) * 100}%`, backgroundColor: pillarColor }} />
            {[1, 2, 3].map((c) => (
              <span key={c} className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded bg-slate-500" style={{ left: `${c * 25}%` }} />
            ))}
          </div>
          <span className="shrink-0 whitespace-nowrap text-right font-mono text-[11px] text-slate-400">
            {formatTime(time)} / 0:15
          </span>
        </div>

        {/* 이퀄라이저 */}
        <div className="flex items-end gap-2">
          <div className="flex h-10 flex-1 items-end justify-between gap-[3px]" aria-hidden="true">
            {bars.map((b, i) => (
              <motion.span
                key={i}
                className="w-full rounded-t-sm"
                style={{ background: `linear-gradient(to top, ${pillarColor}, ${effect.accent})` }}
                animate={
                  running
                    ? { height: [`${b.low}%`, `${b.peak}%`, `${(b.low + b.peak) / 2}%`, `${b.low}%`] }
                    : { height: '8%' }
                }
                transition={running ? { duration: beat * (1 + (i % 3) * 0.5), repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={toggleSound}
            className={cn(
              'shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
              soundOn ? 'border-transparent text-slate-950' : 'border-slate-700 text-slate-300 hover:border-slate-500'
            )}
            style={soundOn ? { backgroundColor: pillarColor } : undefined}
            aria-pressed={soundOn}
          >
            {soundOn ? '🔊 BGM 켜짐' : '🔈 BGM 듣기'}
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-500">
          데모는 대표 컷 한 장으로 만든 미리보기예요 · 실제 부스는 15초 영상을 촬영해요
        </p>
      </div>

      {/* 스토리보드 */}
      <Panel title="AI 스토리보드 · 비트에 맞춘 4컷">
        <div className="grid grid-cols-4 gap-2">
          {MOVES.map((move, i) => (
            <button
              key={move.name}
              type="button"
              onClick={() => {
                setTime(i * CUT + 0.01);
                setPlaying(true);
              }}
              disabled={!frames}
              className="group text-left"
              aria-label={`${i + 1}번 컷으로 이동`}
            >
              <div
                className={cn(
                  'relative aspect-[9/16] overflow-hidden rounded-lg border-2 bg-slate-800 transition-colors',
                  i === cut ? '' : 'border-transparent group-hover:border-slate-600'
                )}
                style={i === cut ? { borderColor: pillarColor } : undefined}
              >
                {frames?.[i] && (
                  <motion.img
                    src={frames[i]}
                    alt=""
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.12 }}
                  />
                )}
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1 font-mono text-[8px] text-white">
                  {formatTime(i * CUT)}
                </span>
              </div>
              <p className="mt-1.5 truncate text-[10px] font-semibold text-slate-200">{effect.lookNames[i]}</p>
              <p className="truncate text-[9px] text-slate-500">{move.name}</p>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const { effect: effectId, genre: genreId, title } = track(answers);
  const effect = EFFECTS[effectId];
  const genre = GENRES[genreId];

  return (
    <ResultShell
      eyebrow={`${effect.label} × ${genre.label}`}
      title={`"${title}" 뮤직비디오 완성!`}
      description="AI가 컷을 나누고 이펙트를 입힌 뒤, 비트에 맞춰 편집했어요. 플레이어를 눌러 재생·정지할 수 있어요."
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 이펙트로 찍기"
    >
      <MvPlayer answers={answers} pillarColor={pillarColor} />

      <InfoGrid
        items={[
          { emoji: '🎬', label: '영상 길이', value: '15초 숏폼', desc: '컷 전환 4회 · 비트 싱크' },
          { emoji: '📱', label: '출력 사이즈', value: '9:16 세로형', desc: '릴스·쇼츠 업로드용' },
          { emoji: '🎵', label: 'BGM', value: `${genre.label} ${genre.bpm} BPM`, desc: genre.desc },
          { emoji: '📲', label: '다운로드', value: 'QR 코드 전송', desc: '실제 부스에서 바로 저장해요' },
        ]}
      />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'musicvideo-maker',
    targetSlug: 'ai-musicvideo-maker',
    industryId: 'entertainment',
    analyzeEmoji: '🎬',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'shot',
    analyzeMessages: ['인물과 배경 분리 중', 'AI 이펙트 입히는 중', 'BGM 비트 분석 중', '컷 편집·싱크 맞추는 중'],
  },
  steps: [
    cameraStep({
      id: 'shot',
      title: '뮤직비디오 대표 컷을 찍어요',
      subtitle: '실제 부스에선 15초 영상을 찍지만, 데모에선 대표 컷 한 장으로 체험해요',
      mode: 'portrait',
      subject: '대표 컷',
      countdown: true,
      scanLabels: ['인물 영역 분리', '포즈·동작 추적', '배경 매팅', '컷 구도 분석'],
      readouts: (c) => [
        { label: '무대 존재감', value: `${70 + (c.seed % 29)}%` },
        { label: '조명 무드', value: c.stats.contrast > 45 ? '드라마틱' : '소프트' },
      ],
    }),
    choiceStep({
      id: 'effect',
      title: '어떤 이펙트를 입힐까요?',
      subtitle: '컷마다 조금씩 다른 룩으로 편집돼요',
      columns: 2,
      options: (Object.keys(EFFECTS) as EffectId[]).map((id) => ({
        id,
        emoji: EFFECTS[id].emoji,
        label: EFFECTS[id].label,
        desc: EFFECTS[id].desc,
        swatch: EFFECTS[id].swatch,
      })),
    }),
    choiceStep({
      id: 'bgm',
      title: 'BGM 장르를 골라주세요',
      subtitle: 'AI가 비트에 맞춰 컷을 자동 싱크해요',
      columns: 3,
      options: (Object.keys(GENRES) as GenreId[]).map((id) => ({
        id,
        emoji: GENRES[id].emoji,
        label: GENRES[id].label,
        desc: `${GENRES[id].desc} · ${GENRES[id].bpm} BPM`,
      })),
    }),
  ],
  computeResult: (answers) => {
    const { effect, genre } = track(answers);
    return `${effect}-${genre}`;
  },
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'shot');
    const { seed, effect: effectId, genre: genreId, title } = track(answers);
    const effect = EFFECTS[effectId];
    const genre = GENRES[genreId];
    return {
      kind: 'photo',
      // 결과 화면의 AI 스토리보드 4컷 그대로
      photos: capture
        ? effect.looks.map((look, i) => ({
            src: capture.image,
            look,
            label: `${formatTime(i * CUT)} ${effect.lookNames[i]}`,
            overlay: <CutPrint effect={effectId} cut={i} lyric={genre.lyrics[i] ?? ''} seed={seed} />,
          }))
        : [],
      title: `“${title}”`,
      caption: `${effect.label} × ${genre.label} · ${genre.bpm} BPM · 4컷 스토리보드`,
      badge: '15초 숏폼',
      paper: PAPER[effectId],
    };
  },
});
