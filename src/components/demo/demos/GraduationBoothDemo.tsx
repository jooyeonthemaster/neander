'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  InfoGrid,
  ProcessedPhoto,
  ResultShell,
  TraitChips,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  seededInt,
  seededPick,
  seededRandom,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type GownId = 'black' | 'navy' | 'burgundy' | 'green';
type PlaceId = 'gate' | 'library' | 'hall';

const GOWNS: Record<GownId, { label: string; desc: string; gown: string; trim: string; tassel: string; tasselName: string }> = {
  black: { label: '클래식 블랙', desc: '가장 격식 있는 기본 학위복', gown: '#111827', trim: '#fbbf24', tassel: '#fbbf24', tasselName: '골드' },
  navy: { label: '로열 네이비', desc: '단정하고 지적인 인상', gown: '#1e3a8a', trim: '#93c5fd', tassel: '#e2e8f0', tasselName: '실버' },
  burgundy: { label: '버건디', desc: '따뜻하고 우아한 분위기', gown: '#7f1d1d', trim: '#fde68a', tassel: '#fcd34d', tasselName: '샴페인 골드' },
  green: { label: '포레스트 그린', desc: '싱그럽고 산뜻한 느낌', gown: '#14532d', trim: '#86efac', tassel: '#f8fafc', tasselName: '화이트' },
};

interface Place {
  label: string;
  emoji: string;
  desc: string;
  swatch: string;
  look: PhotoLook;
  band: [string, string];
  ink: string;
}

const PLACES: Record<PlaceId, Place> = {
  gate: {
    label: '캠퍼스 정문',
    emoji: '🏛️',
    desc: '봄꽃 핀 교정 앞',
    swatch: 'linear-gradient(180deg,#bfdbfe 0%,#fbcfe8 55%,#86efac 100%)',
    look: {
      adjust: { brightness: 1.06, contrast: 1.04, saturation: 1.08, warmth: 0.08 },
      paints: [
        { x: 0, y: 8, rx: 34, ry: 26, color: '#f9a8d4', alpha: 0.55, blend: 'screen' },
        { x: 100, y: 12, rx: 30, ry: 24, color: '#fbcfe8', alpha: 0.5, blend: 'screen' },
        { x: 0, y: 55, rx: 20, ry: 30, color: '#86efac', alpha: 0.35, blend: 'soft-light' },
        { x: 100, y: 55, rx: 20, ry: 30, color: '#86efac', alpha: 0.35, blend: 'soft-light' },
      ],
      tint: { color: '#bfdbfe', alpha: 0.2, blend: 'soft-light' },
    },
    band: ['#bfdbfe', '#fbcfe8'],
    ink: '#64748b',
  },
  library: {
    label: '도서관',
    emoji: '📚',
    desc: '고풍스러운 열람실',
    swatch: 'linear-gradient(180deg,#78350f 0%,#b45309 55%,#fcd34d 100%)',
    look: {
      adjust: { brightness: 1.02, contrast: 1.08, saturation: 0.95, warmth: 0.28 },
      paints: [
        { x: 50, y: 0, rx: 60, ry: 22, color: '#fde68a', alpha: 0.45, blend: 'screen' },
        { x: 0, y: 40, rx: 22, ry: 50, color: '#78350f', alpha: 0.5, blend: 'multiply' },
        { x: 100, y: 40, rx: 22, ry: 50, color: '#78350f', alpha: 0.5, blend: 'multiply' },
      ],
      tint: { color: '#f59e0b', alpha: 0.25, blend: 'soft-light' },
      vignette: 0.3,
    },
    band: ['#78350f', '#b45309'],
    ink: '#fde68a',
  },
  hall: {
    label: '졸업식장',
    emoji: '🎓',
    desc: '현수막과 무대 조명',
    swatch: 'linear-gradient(180deg,#1e3a8a 0%,#3b82f6 55%,#fde68a 100%)',
    look: {
      adjust: { brightness: 1.05, contrast: 1.12, saturation: 1.05 },
      paints: [
        { x: 50, y: 0, rx: 40, ry: 45, color: '#fef9c3', alpha: 0.5, blend: 'screen' },
        { x: 0, y: 20, rx: 26, ry: 40, color: '#1e3a8a', alpha: 0.5, blend: 'multiply' },
        { x: 100, y: 20, rx: 26, ry: 40, color: '#1e3a8a', alpha: 0.5, blend: 'multiply' },
      ],
      vignette: 0.35,
    },
    band: ['#1e3a8a', '#3b82f6'],
    ink: '#fde68a',
  },
};

const MESSAGES = [
  '지금까지 달려온 모든 날에 큰 박수를 보내요.',
  '새로운 출발을 온 마음으로 응원해요.',
  '오늘의 웃음이 오래오래 기억되길 바라요.',
  '수고 많았어요. 이제 더 넓은 세상으로!',
  '당신의 다음 챕터가 벌써 기대돼요.',
];

const CONFETTI_COLORS = ['#f43f5e', '#38bdf8', '#a3e635', '#fbbf24', '#e879f9', '#ffffff'];

function pick(answers: DemoAnswers) {
  const gownId = (getChoice(answers, 'gown') as GownId | undefined) ?? 'black';
  const placeId = (getChoice(answers, 'place') as PlaceId | undefined) ?? 'gate';
  const seed = answersSeed(answers);
  return { gownId, placeId, seed, message: seededPick(seed, 'msg', MESSAGES) };
}

/* ── Overlays (portrait 좌표: 머리 위 50/14, 눈 31, 목 50/59, 어깨 22/69 & 78/69) ─ */

type Gown = (typeof GOWNS)[GownId];

/* 아래 정적 SVG 조각은 300×400(3:4) 좌표 — 화면 오버레이와 출력물 오버레이가 함께 쓴다 */

/** 학위복 — 카메라 가이드의 상반신 실루엣을 따라 그린다 */
function GownShapes({ gown }: { gown: Gown }) {
  return (
    <>
      <path
        d="M20 400 C28 316 72 280 120 268 L150 312 L180 268 C228 280 272 316 280 400 Z"
        fill={gown.gown}
        opacity="0.88"
        style={{ mixBlendMode: 'multiply' }}
      />
      <path d="M20 400 C28 316 72 280 120 268 L150 312 L180 268 C228 280 272 316 280 400 Z" fill={gown.gown} opacity="0.55" />
      {/* 후드(깃) */}
      <path d="M112 262 L150 330 L188 262 L176 258 L150 304 L124 258 Z" fill={gown.trim} opacity="0.95" />
      <path d="M124 258 L150 304 L176 258" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
      {/* 주름 */}
      <g stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none">
        <path d="M78 330 C82 360 80 385 76 400" />
        <path d="M222 330 C218 360 220 385 224 400" />
        <path d="M150 336 L150 400" />
      </g>
    </>
  );
}

/** 학사모 사각판 + 술 매듭 — 머리 위(50/14) 기준 */
function CapBoard({ gown }: { gown: Gown }) {
  return (
    <>
      <defs>
        <linearGradient id="grad-cap-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="150" cy="96" rx="58" ry="10" fill="rgba(0,0,0,0.25)" />
      {/* 머리에 쓰는 부분 */}
      <path d="M98 58 L202 58 L198 90 Q150 102 102 90 Z" fill={gown.gown} />
      <path d="M98 58 L202 58 L198 90 Q150 102 102 90 Z" fill="rgba(0,0,0,0.35)" />
      {/* 사각판 두께 */}
      <polygon points="56,52 150,76 244,52 244,58 150,82 56,58" fill={gown.gown} />
      <polygon points="56,52 150,76 244,52 244,58 150,82 56,58" fill="rgba(0,0,0,0.3)" />
      {/* 사각판 윗면 */}
      <polygon points="56,52 150,28 244,52 150,76" fill={gown.gown} />
      <polygon points="56,52 150,28 244,52 150,76" fill="url(#grad-cap-top)" />
      <circle cx="150" cy="52" r="4" fill={gown.tassel} />
      <path d="M150 52 Q190 52 226 57" stroke={gown.tassel} strokeWidth="2.5" fill="none" />
    </>
  );
}

/** 늘어진 술 — (226, 57)에 매달려 있다 */
function TasselDrop({ gown }: { gown: Gown }) {
  return (
    <>
      <line x1="226" y1="57" x2="228" y2="98" stroke={gown.tassel} strokeWidth="2.5" />
      <rect x="222" y="96" width="12" height="7" rx="2" fill={gown.tassel} />
      <path d="M222 103 L220 132 L236 132 L234 103 Z" fill={gown.tassel} />
      <g stroke="rgba(0,0,0,0.18)" strokeWidth="0.8">
        <line x1="224" y1="106" x2="223" y2="131" />
        <line x1="228" y1="106" x2="228" y2="131" />
        <line x1="232" y1="106" x2="233" y2="131" />
      </g>
    </>
  );
}

function GownOverlay({ gown }: { gown: Gown }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" aria-hidden="true">
      <GownShapes gown={gown} />
    </svg>
  );
}

/** 학사모 + 흔들리는 술 */
function CapOverlay({ gown }: { gown: Gown }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 300 400" aria-hidden="true">
      <CapBoard gown={gown} />
      <motion.g
        style={{ transformOrigin: '226px 57px' }}
        animate={{ rotate: [-6, 8, -6] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <TasselDrop gown={gown} />
      </motion.g>
    </svg>
  );
}

/** 출력물 오버레이 — 학위복 + 학사모를 한 장의 정적 SVG로 (술은 살짝 흔들린 순간) */
function GraduationPrintOverlay({ gown }: { gown: Gown }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width={1200} height={1600}>
      <GownShapes gown={gown} />
      <CapBoard gown={gown} />
      <g transform="rotate(4 226 57)">
        <TasselDrop gown={gown} />
      </g>
    </svg>
  );
}

function PlaceBand({ placeId }: { placeId: PlaceId }) {
  const place = PLACES[placeId];
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 44" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`grad-band-${placeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={place.band[0]} />
          <stop offset="1" stopColor={place.band[1]} />
        </linearGradient>
      </defs>
      <rect width="240" height="44" fill={`url(#grad-band-${placeId})`} />
      <g fill={place.ink} opacity="0.35">
        {placeId === 'gate' && (
          <>
            <rect x="12" y="14" width="10" height="30" />
            <rect x="218" y="14" width="10" height="30" />
            <path d="M22 18 Q120 -6 218 18 L218 24 Q120 2 22 24 Z" />
            <circle cx="40" cy="30" r="10" />
            <circle cx="52" cy="26" r="8" />
            <circle cx="196" cy="28" r="10" />
            <circle cx="186" cy="24" r="7" />
          </>
        )}
        {placeId === 'library' &&
          Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={6 + i * 10.4} y={10 + ((i * 7) % 11)} width="7" height={34 - ((i * 7) % 11)} rx="1" />
          ))}
        {placeId === 'hall' && (
          <>
            <path d="M0 0 Q20 22 10 44 L0 44 Z" />
            <path d="M240 0 Q220 22 230 44 L240 44 Z" />
            <rect x="60" y="6" width="120" height="14" rx="2" />
            <rect x="40" y="34" width="160" height="10" />
          </>
        )}
      </g>
    </svg>
  );
}

/* ── Confetti ──────────────────────────────────────────── */

const PIECES = Array.from({ length: 40 }, (_, i) => i);

function Confetti({ seed, colors }: { seed: number; colors: string[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
      {PIECES.map((i) => {
        const x = seededInt(seed, `cx${i}`, 0, 100);
        const drift = seededInt(seed, `cd${i}`, -30, 30);
        const delay = seededRandom(seed, `cdl${i}`) * 1.2;
        const duration = 2.4 + seededRandom(seed, `cdu${i}`) * 1.6;
        const round = i % 3 === 0;
        return (
          <motion.span
            key={i}
            className="absolute block"
            style={{
              left: `${x}%`,
              width: round ? 7 : 6,
              height: round ? 7 : 11,
              borderRadius: round ? 999 : 1,
              backgroundColor: seededPick(seed, `cc${i}`, colors),
            }}
            initial={{ top: '-4%', x: 0, rotate: 0, opacity: 1 }}
            animate={{ top: '104%', x: drift, rotate: seededInt(seed, `cr${i}`, 180, 720), opacity: [1, 1, 0.8] }}
            transition={{ duration, delay, ease: 'easeIn' }}
          />
        );
      })}
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'photo');
  const { gownId, placeId, seed, message } = pick(answers);
  const gown = GOWNS[gownId];
  const place = PLACES[placeId];
  const [toss, setToss] = useState(0);

  return (
    <ResultShell
      eyebrow="CLASS OF 2026 · AI 졸업 포토부스"
      title="졸업을 축하해요! 🎓"
      description={message}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 촬영하기"
    >
      {capture && (
        <div className="relative w-full max-w-md">
          <Confetti key={toss} seed={seed + toss} colors={[gown.tassel, ...CONFETTI_COLORS]} />
          <motion.div
            initial={{ rotate: 0, y: 20, opacity: 0 }}
            animate={{ rotate: -1.5, y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-[280px] bg-[#fdfaf3] p-3 shadow-2xl shadow-black/50"
          >
            <div className="border-2 border-[#c9a227] p-2.5">
              <div className="mb-2 text-center">
                <p className="font-serif text-[10px] font-semibold tracking-[0.4em] text-[#a1841f]">NEANDER UNIVERSITY</p>
                <p className="font-serif text-2xl font-bold tracking-[0.12em] text-slate-900">CLASS OF 2026</p>
              </div>

              <div className="relative aspect-[3/4] w-full">
                <ProcessedPhoto
                  src={capture.image}
                  look={place.look}
                  className="absolute inset-0 h-full w-full"
                  alt="AI 졸업 사진"
                  delayMs={900}
                >
                  <GownOverlay gown={gown} />
                </ProcessedPhoto>
                <motion.div
                  key={toss}
                  className="absolute inset-0"
                  initial={toss ? { y: 0, opacity: 1 } : { y: -40, opacity: 0 }}
                  animate={
                    toss
                      ? { y: [0, -150, 0], rotate: [0, -160, -360], opacity: 1 }
                      : { y: 0, opacity: 1 }
                  }
                  transition={toss ? { duration: 1.3, ease: 'easeInOut' } : { delay: 1.4, type: 'spring', stiffness: 140, damping: 12 }}
                  style={{ transformOrigin: '50% 13%' }}
                >
                  <CapOverlay gown={gown} />
                </motion.div>
                <span className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                  📍 {place.label}
                </span>
              </div>

              <div className="relative mt-2 h-11 overflow-hidden">
                <PlaceBand placeId={placeId} />
                <p className="relative flex h-full items-center justify-center font-serif text-sm font-bold italic tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  Congratulations, Graduate!
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-5 flex justify-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setToss((t) => t + 1)}
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-2.5 text-sm font-semibold text-white hover:border-slate-500"
            >
              🎓 학사모 던지기
            </motion.button>
          </div>
        </div>
      )}

      <InfoGrid
        items={[
          { emoji: '👘', label: '학위복', value: gown.label, desc: `${gown.tasselName} 술 · ${gown.desc}` },
          { emoji: place.emoji, label: '배경', value: place.label, desc: place.desc },
          { emoji: '🖨️', label: '출력', value: '4×6 즉석 인화', desc: '졸업 축하 프레임 포함' },
          { emoji: '🏫', label: '프레임', value: '학교별 커스텀', desc: '교표·교색·문구를 맞춰 제작해요' },
        ]}
      />

      <TraitChips
        title="AI 합성 과정"
        items={['인물 영역 분리', '머리 각도에 맞춘 학사모', '학위복 핏 합성', `${place.label} 배경 톤`, '축하 프레임 적용']}
      />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'graduation-booth',
    targetSlug: 'ai-graduation-booth',
    industryId: 'education',
    analyzeEmoji: '🎓',
    analyzeDurationMs: 3400,
    analyzeImageStepId: 'photo',
    analyzeMessages: ['머리 위치에 학사모 맞추는 중', '학위복 합성 중', '캠퍼스 배경 톤 입히는 중', '축하 프레임 인쇄 준비 중'],
  },
  steps: [
    choiceStep({
      id: 'gown',
      title: '학위복 색을 골라주세요',
      subtitle: '학사모와 술 색도 함께 맞춰져요',
      columns: 2,
      options: (Object.keys(GOWNS) as GownId[]).map((id) => ({
        id,
        label: GOWNS[id].label,
        desc: `${GOWNS[id].tasselName} 술 · ${GOWNS[id].desc}`,
        swatch: `linear-gradient(135deg, ${GOWNS[id].gown} 0 72%, ${GOWNS[id].tassel} 72% 100%)`,
      })),
    }),
    choiceStep({
      id: 'place',
      title: '어디에서 찍은 사진으로 만들까요?',
      subtitle: '배경 분위기와 프레임 일러스트가 바뀌어요',
      columns: 3,
      options: (Object.keys(PLACES) as PlaceId[]).map((id) => ({
        id,
        emoji: PLACES[id].emoji,
        label: PLACES[id].label,
        desc: PLACES[id].desc,
        swatch: PLACES[id].swatch,
      })),
    }),
    cameraStep({
      id: 'photo',
      title: '졸업 포즈로 찰칵!',
      subtitle: '학사모가 올라갈 수 있게 머리 위 공간을 조금 남겨주세요',
      mode: 'portrait',
      subject: '졸업 사진',
      countdown: true,
      scanLabels: ['인물 영역 분리', '머리 위치·기울기 측정', '어깨선 추적', '조명 보정'],
      readouts: (c) => [
        { label: '포즈', value: c.stats.contrast > 40 ? '당당한 정면' : '부드러운 미소' },
        { label: '학사모 핏', value: `${88 + (c.seed % 11)}%` },
      ],
    }),
  ],
  computeResult: (answers) => {
    const { gownId, placeId } = pick(answers);
    return `${gownId}-${placeId}`;
  },
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'photo');
    const { gownId, placeId, message } = pick(answers);
    const gown = GOWNS[gownId];
    const place = PLACES[placeId];
    return {
      kind: 'photo',
      photos: capture
        ? [{ src: capture.image, look: place.look, label: place.label, overlay: <GraduationPrintOverlay gown={gown} /> }]
        : [],
      title: '졸업을 축하해요!',
      caption: message,
      badge: 'CLASS OF 2026',
      // 결과 화면 액자와 같은 크림색 인화지
      paper: 'cream',
    };
  },
});
