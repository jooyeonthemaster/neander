'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  FACE_POINTS,
  InfoGrid,
  Panel,
  ProcessedPhoto,
  ResultShell,
  TraitChips,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  getFields,
  seededInt,
  seededRandom,
  textStep,
  type PhotoLook,
  type PhotoPaint,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type ConceptId = 'season' | 'tour' | 'debut' | 'holo';
type Rarity = 'common' | 'rare' | 'secret';

const BLUSH: PhotoPaint[] = [
  { ...FACE_POINTS.cheekL, rx: 9, ry: 6, color: '#fb7185', alpha: 0.35, blend: 'soft-light' },
  { ...FACE_POINTS.cheekR, rx: 9, ry: 6, color: '#fb7185', alpha: 0.35, blend: 'soft-light' },
];

interface Concept {
  label: string;
  emoji: string;
  desc: string;
  album: string;
  swatch: string;
  /** 팩 포일 색 */
  pack: string;
  look: PhotoLook;
  /** 카드 테두리 (holo는 애니메이션 그라디언트) */
  border: string;
  deco: string[];
  edits: string[];
}

const CONCEPTS: Record<ConceptId, Concept> = {
  season: {
    label: '시즌 그리팅',
    emoji: '🎄',
    desc: '포근한 겨울 화보 톤',
    album: "SEASON'S GREETINGS",
    swatch: 'linear-gradient(135deg,#fecdd3,#fef3c7,#fff7ed)',
    pack: 'linear-gradient(160deg,#be123c 0%,#fb7185 45%,#fde68a 100%)',
    look: {
      adjust: { brightness: 1.08, contrast: 0.95, saturation: 0.92, warmth: 0.18 },
      paints: [...BLUSH, { x: 92, y: 6, rx: 42, ry: 30, color: '#fde68a', alpha: 0.5, blend: 'screen' }],
      tint: { color: '#ffe4e6', alpha: 0.35, blend: 'soft-light' },
      vignette: 0.12,
    },
    border: '#fff7ed',
    deco: ['❄', '❄', '✦'],
    edits: ['웜톤 화보 보정', '윈터 라이트 릭', '시즌 그리팅 프레임'],
  },
  tour: {
    label: '월드투어',
    emoji: '🎤',
    desc: '무대 조명 아래 라이브 컷',
    album: 'WORLD TOUR · LIVE',
    swatch: 'linear-gradient(135deg,#0f172a,#7c3aed,#ec4899)',
    pack: 'linear-gradient(160deg,#0f172a 0%,#6d28d9 50%,#ec4899 100%)',
    look: {
      adjust: { contrast: 1.2, saturation: 1.15, brightness: 0.96 },
      paints: [
        ...BLUSH,
        { x: 6, y: 4, rx: 46, ry: 36, color: '#ec4899', alpha: 0.55, blend: 'screen' },
        { x: 96, y: 18, rx: 40, ry: 32, color: '#22d3ee', alpha: 0.45, blend: 'screen' },
        { x: 50, y: 100, rx: 70, ry: 22, color: '#7c3aed', alpha: 0.45, blend: 'screen' },
      ],
      vignette: 0.45,
    },
    border: '#0b0b12',
    deco: ['✦', '✦', '★'],
    edits: ['스테이지 조명 합성', '콘서트 컬러 그레이딩', '투어 로고 프레임'],
  },
  debut: {
    label: '데뷔 앨범',
    emoji: '💿',
    desc: '청량한 데뷔 티저 무드',
    album: '1ST MINI ALBUM',
    swatch: 'linear-gradient(135deg,#a5f3fc,#e0f2fe,#ffffff)',
    pack: 'linear-gradient(160deg,#0369a1 0%,#38bdf8 55%,#e0f2fe 100%)',
    look: {
      adjust: { brightness: 1.12, contrast: 1.05, saturation: 1.12, warmth: -0.18 },
      paints: [...BLUSH, { x: 4, y: 4, rx: 40, ry: 30, color: '#ffffff', alpha: 0.4, blend: 'screen' }],
      tint: { color: '#bae6fd', alpha: 0.35, blend: 'soft-light' },
    },
    border: '#f0f9ff',
    deco: ['☁', '✦', '•'],
    edits: ['청량 쿨톤 보정', '피부 결 리터칭', '데뷔 티저 프레임'],
  },
  holo: {
    label: '홀로그램 스페셜',
    emoji: '🌈',
    desc: '한정판 홀로 포일 카드',
    album: 'HOLOGRAM SPECIAL',
    swatch: 'linear-gradient(135deg,#f0abfc,#a5f3fc,#fde68a,#c4b5fd)',
    pack: 'linear-gradient(135deg,#f0abfc 0%,#a5f3fc 30%,#fde68a 60%,#c4b5fd 100%)',
    look: {
      adjust: { brightness: 1.06, saturation: 1.15, contrast: 1.05 },
      paints: [
        ...BLUSH,
        { x: 8, y: 18, rx: 36, ry: 30, color: '#f0abfc', alpha: 0.4, blend: 'screen' },
        { x: 94, y: 84, rx: 38, ry: 30, color: '#67e8f9', alpha: 0.4, blend: 'screen' },
      ],
      tint: { color: '#c4b5fd', alpha: 0.3, blend: 'soft-light' },
    },
    border: 'linear-gradient(135deg,#f0abfc,#a5f3fc,#fde68a,#86efac,#c4b5fd,#f0abfc)',
    deco: ['✦', '✧', '✦'],
    edits: ['홀로 포일 코팅', '프리즘 반사광', '한정판 넘버링'],
  },
};

const RARITY: Record<Rarity, { label: string; ko: string; color: string; glow: string }> = {
  common: { label: 'COMMON', ko: '일반', color: '#cbd5e1', glow: 'rgba(203,213,225,0.35)' },
  rare: { label: 'RARE', ko: '레어', color: '#c084fc', glow: 'rgba(192,132,252,0.55)' },
  secret: { label: 'SECRET', ko: '시크릿', color: '#fbbf24', glow: 'rgba(251,191,36,0.7)' },
};

function dropRates(concept: ConceptId): Record<Rarity, number> {
  return concept === 'holo' ? { common: 50, rare: 30, secret: 20 } : { common: 60, rare: 30, secret: 10 };
}

/* ── Roll ─────────────────────────────────────────────── */

function roll(answers: DemoAnswers) {
  const concept = (getChoice(answers, 'concept') as ConceptId | undefined) ?? 'season';
  const seed = answersSeed(answers);
  const rates = dropRates(concept);
  const r = seededRandom(seed, 'rarity') * 100;
  const rarity: Rarity = r < rates.secret ? 'secret' : r < rates.secret + rates.rare ? 'rare' : 'common';
  const serial = seededInt(seed, 'serial', 1, 1000);
  return { concept, rarity, serial, seed };
}

/* ── Card faces ────────────────────────────────────────── */

function CardBack({ concept }: { concept: Concept }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[14px] border-[6px] border-white/80"
      style={{ background: concept.pack, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 14px)',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 font-display text-3xl font-black drop-shadow">
          N
        </div>
        <p className="font-display text-sm font-extrabold tracking-[0.35em] drop-shadow">NEANDER</p>
        <p className="text-[9px] font-semibold tracking-[0.25em] opacity-90">OFFICIAL PHOTOCARD</p>
      </div>
    </div>
  );
}

function CardFront({
  concept,
  conceptId,
  image,
  stageName,
  group,
  serial,
  rarity,
  shine,
}: {
  concept: Concept;
  conceptId: ConceptId;
  image: string;
  stageName: string;
  group: string;
  serial: number;
  rarity: Rarity;
  shine: MotionValue<string>;
}) {
  const isHolo = conceptId === 'holo';
  const r = RARITY[rarity];
  return (
    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
      {/* 테두리 */}
      <motion.div
        className="absolute inset-0 rounded-[14px]"
        style={
          concept.border.startsWith('linear')
            ? { backgroundImage: concept.border, backgroundSize: '300% 300%' }
            : { backgroundColor: concept.border }
        }
        animate={isHolo ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : undefined}
        transition={isHolo ? { duration: 4, repeat: Infinity, ease: 'linear' } : undefined}
      />
      <div className="absolute inset-[6px] overflow-hidden rounded-[10px] bg-slate-900">
        <ProcessedPhoto src={image} look={concept.look} className="absolute inset-0 h-full w-full" alt={`${stageName} 포토카드`} delayMs={300} />

        {/* 홀로 무지개 반사 */}
        {isHolo && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge"
            style={{
              backgroundImage:
                'linear-gradient(115deg, transparent 20%, #f0abfc 35%, #a5f3fc 45%, #fde68a 55%, #86efac 65%, transparent 80%)',
              backgroundSize: '250% 250%',
              backgroundPosition: shine,
            }}
          />
        )}
        {/* 유광 코팅 하이라이트 */}
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            backgroundImage: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.75) 50%, transparent 65%)',
            backgroundSize: '250% 250%',
            backgroundPosition: shine,
          }}
        />

        {/* 상단 */}
        <div className="absolute inset-x-2 top-2 flex items-start justify-between">
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-[8px] font-bold tracking-[0.3em] text-white backdrop-blur-sm">
            {group}
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[7px] font-black tracking-widest text-slate-950"
            style={{ backgroundColor: r.color }}
          >
            {r.label}
          </span>
        </div>

        {/* 콘셉트 장식 */}
        {conceptId === 'tour' && (
          <span className="absolute left-2 top-8 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[7px] font-black tracking-widest text-white">
            <span className="h-1 w-1 rounded-full bg-white" />
            LIVE
          </span>
        )}
        {conceptId === 'debut' && (
          <span className="absolute right-2 top-8 rotate-6 rounded-sm border border-sky-900/40 bg-white/85 px-1.5 py-0.5 text-[7px] font-black tracking-widest text-sky-800">
            D-DAY
          </span>
        )}
        {concept.deco.map((d, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute text-white drop-shadow"
            style={{ left: `${[10, 80, 70][i]}%`, top: `${[30, 40, 14][i]}%`, fontSize: [14, 10, 12][i] }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          >
            {d}
          </motion.span>
        ))}

        {/* 하단 네임 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2.5 pt-10 text-left">
          <p className="text-[8px] font-semibold tracking-[0.25em] text-white/75">{concept.album}</p>
          <p className="font-display text-2xl font-extrabold leading-tight text-white [word-break:keep-all]">{stageName}</p>
          <div className="mt-1 flex items-center justify-between font-mono text-[8px] text-white/80">
            <span>{serialLabel(serial)}</span>
            <span>NEANDER ENT.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Print card (정적 SVG, 300×400) ───────────────────── */

const CARD_SANS = 'Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Helvetica Neue", Arial, sans-serif';
const CARD_MONO = 'ui-monospace, Menlo, monospace';

/** 컬렉션 넘버 표기 — 카드와 출력물이 같이 쓴다 */
function serialLabel(serial: number): string {
  return `No. ${String(serial).padStart(4, '0')} / 1000`;
}

/** 카드 앞면(테두리·그룹 칩·장식·네임)을 출력물 위에 얹는다. 레어도는 팩 개봉의 재미를 위해 싣지 않는다 */
function CardPrint({ concept, conceptId, stageName, group, serial }: { concept: Concept; conceptId: ConceptId; stageName: string; group: string; serial: number }) {
  const border = concept.border.match(/#[0-9a-f]{6}/gi) ?? ['#ffffff'];
  const groupW = Math.min(150, group.length * 8.2 + 18);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width={1200} height={1600}>
      <defs>
        <linearGradient id="card-border" x1="0" y1="0" x2="1" y2="1">
          {border.map((c, i) => (
            <stop key={i} offset={i / Math.max(1, border.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id="card-gloss" x1="0" y1="0.15" x2="1" y2="0.85">
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.65" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="card-holo" x1="0" y1="0.2" x2="1" y2="0.8">
          <stop offset="0.2" stopColor="#f0abfc" stopOpacity="0" />
          <stop offset="0.35" stopColor="#f0abfc" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#a5f3fc" stopOpacity="0.35" />
          <stop offset="0.55" stopColor="#fde68a" stopOpacity="0.35" />
          <stop offset="0.65" stopColor="#86efac" stopOpacity="0.35" />
          <stop offset="0.8" stopColor="#86efac" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="card-bottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#000000" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#000000" stopOpacity="0.4" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {conceptId === 'holo' && <rect width="300" height="400" fill="url(#card-holo)" />}
      <rect width="300" height="400" fill="url(#card-gloss)" />

      {/* 그룹 칩 · 콘셉트 태그 */}
      <rect x="18" y="18" width={groupW} height="17" rx="8.5" fill="#000000" fillOpacity="0.3" />
      <text
        x={18 + groupW / 2}
        y="29.8"
        textAnchor="middle"
        fontFamily={CARD_SANS}
        fontSize="9.4"
        fontWeight="700"
        fill="#ffffff"
        textLength={groupW - 18}
        lengthAdjust="spacingAndGlyphs"
      >
        {group}
      </text>
      {conceptId === 'tour' && (
        <g fontFamily={CARD_SANS} fontSize="8.2" fontWeight="900" letterSpacing="1.2" fill="#ffffff">
          <rect x="18" y="42" width="44" height="14" rx="2.5" fill="#dc2626" />
          <circle cx="26" cy="49" r="2" />
          <text x="31" y="52.2">LIVE</text>
        </g>
      )}
      {conceptId === 'debut' && (
        <g transform="translate(282 50) rotate(6)" fontFamily={CARD_SANS} fontSize="8.2" fontWeight="900" letterSpacing="1.2">
          <rect x="-50" y="-8" width="50" height="15" rx="1.5" fill="#ffffff" fillOpacity="0.85" stroke="#0c4a6e" strokeOpacity="0.4" />
          <text x="-25" y="3" textAnchor="middle" fill="#075985">
            D-DAY
          </text>
        </g>
      )}
      {/* 콘셉트 장식 — 화면과 같은 위치·크기 */}
      <g fontFamily={CARD_SANS} fill="#ffffff" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" paintOrder="stroke">
        {concept.deco.map((d, i) => {
          // 화면 카드 사진 영역(약 220px 폭) 기준 px → 300 좌표
          const size = [14, 10, 12][i]! * 1.36;
          return (
            <text key={i} x={[10, 80, 70][i]! * 3} y={[30, 40, 14][i]! * 4 + size} fontSize={size}>
              {d}
            </text>
          );
        })}
      </g>

      {/* 앨범 · 활동명 · 넘버 */}
      <rect y="300" width="300" height="100" fill="url(#card-bottom)" />
      <g fontFamily={CARD_SANS} fill="#ffffff">
        <text x="20" y="345" fontSize="9.4" fontWeight="600" letterSpacing="2.3" fillOpacity="0.75">
          {concept.album}
        </text>
        <text x="19" y="373" fontSize="30" fontWeight="900">
          {stageName}
        </text>
      </g>
      <g fontFamily={CARD_MONO} fontSize="9.4" fill="#ffffff" fillOpacity="0.8">
        <text x="20" y="388">{serialLabel(serial)}</text>
        <text x="280" y="388" textAnchor="end">
          NEANDER ENT.
        </text>
      </g>

      {/* 카드 테두리 */}
      <path
        d="M0 0 H300 V400 H0 Z M20 8 H280 Q292 8 292 20 V380 Q292 392 280 392 H20 Q8 392 8 380 V20 Q8 8 20 8 Z"
        fill="url(#card-border)"
        fillRule="evenodd"
      />
    </svg>
  );
}

const PAPER: Record<ConceptId, 'white' | 'cream' | 'black'> = { season: 'cream', tour: 'black', debut: 'white', holo: 'white' };

/** 텍스트 스텝에서 받은 활동명·그룹명 (비어 있으면 기본값) */
function namesOf(answers: DemoAnswers) {
  const fields = getFields<string>(answers, 'profile');
  return {
    stageName: (fields.stageName ?? '').trim() || '나',
    group: ((fields.group ?? '').trim() || 'NEANDER').toUpperCase(),
  };
}

/* ── Pack opening stage ────────────────────────────────── */

type Phase = 'sealed' | 'opening' | 'revealed';

const BURST = Array.from({ length: 14 }, (_, i) => i);

function PackStage({
  conceptId,
  image,
  stageName,
  group,
  serial,
  rarity,
  onRevealed,
}: {
  conceptId: ConceptId;
  image: string;
  stageName: string;
  group: string;
  serial: number;
  rarity: Rarity;
  onRevealed: () => void;
}) {
  const concept = CONCEPTS[conceptId];
  const [phase, setPhase] = useState<Phase>('sealed');

  // 카드 기울이기 (포인터 위치 → 회전 + 반사광 이동)
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 160, damping: 16 });
  const tiltY = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 160, damping: 16 });
  const shine = useTransform(mx, (v) => `${(1 - v) * 100}% ${(1 - v) * 100}%`);

  const open = () => {
    if (phase !== 'sealed') return;
    setPhase('opening');
    window.setTimeout(() => {
      setPhase('revealed');
      onRevealed();
    }, 1500);
  };

  const r = RARITY[rarity];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[420px] w-[270px]" style={{ perspective: 1100 }}>
        {/* 레어도 후광 */}
        <AnimatePresence>
          {phase === 'revealed' && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-[52%] h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: `radial-gradient(circle, ${r.glow} 0%, transparent 65%)` }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: [0.4, 1.15, 1] }}
              transition={{ duration: 0.9 }}
            />
          )}
        </AnimatePresence>

        {/* 카드 */}
        <motion.div
          className="absolute left-1/2 top-[40px] z-10 h-[358px] w-[232px] -ml-[116px]"
          style={{ transformStyle: 'preserve-3d', zIndex: phase === 'revealed' ? 30 : 10 }}
          initial={false}
          animate={
            phase === 'sealed'
              ? { y: 20, rotateY: 180, scale: 0.9 }
              : phase === 'opening'
                ? { y: -130, rotateY: 180, scale: 0.9 }
                : { y: 0, rotateY: 0, scale: 1 }
          }
          transition={
            phase === 'opening'
              ? { delay: 0.35, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }
              : { type: 'spring', stiffness: 70, damping: 13 }
          }
        >
          <motion.div
            className="relative h-full w-full cursor-grab"
            style={{ transformStyle: 'preserve-3d', rotateX: tiltX, rotateY: tiltY }}
            onPointerMove={(e) => {
              if (phase !== 'revealed') return;
              const rect = e.currentTarget.getBoundingClientRect();
              mx.set((e.clientX - rect.left) / rect.width);
              my.set((e.clientY - rect.top) / rect.height);
            }}
            onPointerLeave={() => {
              mx.set(0.5);
              my.set(0.5);
            }}
          >
            <div className="absolute inset-0 rounded-[14px] shadow-[0_24px_60px_rgba(0,0,0,0.55)]" />
            <CardFront
              concept={concept}
              conceptId={conceptId}
              image={image}
              stageName={stageName}
              group={group}
              serial={serial}
              rarity={rarity}
              shine={shine}
            />
            <CardBack concept={concept} />
          </motion.div>
        </motion.div>

        {/* 팩 (앞면) */}
        <AnimatePresence>
          {phase !== 'revealed' && (
            <motion.div
              key="pack"
              className="absolute inset-x-0 top-[24px] z-20 h-[390px]"
              exit={{ y: 260, opacity: 0, rotate: 6, transition: { duration: 0.5, ease: 'easeIn' } }}
            >
              {/* 뜯는 부분 */}
              <motion.div
                className="absolute inset-x-0 top-0 h-[44px] overflow-hidden rounded-t-2xl"
                style={{ background: concept.pack }}
                animate={phase === 'opening' ? { y: -70, x: -50, rotate: -22, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-3.5"
                  style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.45) 0 2px, transparent 2px 6px)' }}
                />
                <p className="absolute inset-x-0 bottom-1.5 text-center text-[9px] font-bold tracking-[0.3em] text-white/90">
                  ✂ TEAR HERE
                </p>
              </motion.div>

              {/* 몸통 */}
              <motion.div
                className="absolute inset-x-0 bottom-0 top-[44px] overflow-hidden rounded-b-2xl border-t-2 border-dashed border-white/60 shadow-2xl"
                style={{ background: concept.pack }}
                animate={phase === 'sealed' ? { rotate: [0, -1.5, 1.5, -1, 0] } : { rotate: 0 }}
                transition={phase === 'sealed' ? { duration: 0.6, repeat: Infinity, repeatDelay: 1.6 } : { duration: 0.2 }}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%)',
                    backgroundSize: '250% 100%',
                  }}
                  animate={{ backgroundPosition: ['120% 0%', '-20% 0%'] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-3.5"
                  style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.45) 0 2px, transparent 2px 6px)' }}
                />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
                  style={{ color: conceptId === 'holo' ? '#312e81' : '#ffffff' }}
                >
                  <p className="text-[10px] font-semibold tracking-[0.4em] opacity-90">{group}</p>
                  <p className="font-display text-[26px] font-black tracking-tight drop-shadow">NEANDER</p>
                  <p className="text-[10px] font-bold tracking-[0.3em] drop-shadow">RANDOM PHOTOCARD PACK</p>
                  <div className="my-3 h-px w-24 bg-current opacity-50" />
                  <p className="text-xs font-semibold drop-shadow">{concept.album}</p>
                  <p className="mt-6 rounded-full border border-current px-3 py-1 text-[10px] font-bold tracking-widest">
                    1 CARD INSIDE · ???
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 개봉 순간 파티클 */}
        {phase === 'revealed' &&
          BURST.map((i) => {
            const angle = (Math.PI * 2 * i) / BURST.length;
            const dist = rarity === 'common' ? 110 : 160;
            return (
              <motion.span
                key={i}
                className="pointer-events-none absolute left-1/2 top-[52%] z-40 text-lg"
                style={{ color: i % 2 ? r.color : '#ffffff' }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 1.2 }}
                transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
              >
                ✦
              </motion.span>
            );
          })}
      </div>

      <div className="mt-2 h-14">
        {phase === 'sealed' && (
          <motion.button
            type="button"
            onClick={open}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/30"
          >
            ✂️ 팩 뜯기
          </motion.button>
        )}
        {phase === 'opening' && <p className="pt-3 text-sm font-semibold text-slate-300">두근두근… 어떤 카드일까요?</p>}
        {phase === 'revealed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.3 }}
            className="text-center"
          >
            <p className="font-display text-lg font-black tracking-[0.15em] sm:text-xl" style={{ color: r.color, textShadow: `0 0 18px ${r.glow}` }}>
              ✦ {r.label} CARD ✦
            </p>
            <p className="text-[11px] text-slate-500">카드에 마우스를 올리거나 터치해 기울여 보세요</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor, onReveal }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const { stageName, group } = namesOf(answers);
  const { concept: conceptId, rarity, serial } = roll(answers);
  const concept = CONCEPTS[conceptId];
  const rates = dropRates(conceptId);
  const [revealed, setRevealed] = useState(false);

  return (
    <ResultShell
      eyebrow={`${concept.label} · 랜덤 포토카드 팩`}
      title={`${stageName}의 포토카드 팩 도착!`}
      description={revealed ? `${RARITY[rarity].ko} 등급 카드가 나왔어요. 실제 부스에서는 이 카드가 트레카 사이즈로 바로 출력돼요.` : '팩을 뜯어 어떤 카드가 나왔는지 확인해 보세요. 레어도와 컬렉션 넘버는 랜덤이에요!'}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="새 팩 만들기"
    >
      {capture && (
        <PackStage
          conceptId={conceptId}
          image={capture.image}
          stageName={stageName}
          group={group}
          serial={serial}
          rarity={rarity}
          onRevealed={() => {
            setRevealed(true);
            onReveal?.();
          }}
        />
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex w-full flex-col items-center gap-6"
          >
            <InfoGrid
              items={[
                { emoji: concept.emoji, label: '앨범 콘셉트', value: concept.label, desc: concept.desc },
                { emoji: '🔢', label: '컬렉션 넘버', value: serialLabel(serial), desc: '같은 번호는 한 장뿐이에요' },
                { emoji: '🎴', label: '출력 규격', value: '55 × 85mm 트레카', desc: '공식 포토카드 사이즈' },
                { emoji: '🎁', label: '패키징', value: '랜덤 팩 포장', desc: '포토카드 + 스티커 + 넘버 카드' },
              ]}
            />

            <Panel title="레어도 확률표">
              <div className="space-y-2.5">
                {(['common', 'rare', 'secret'] as Rarity[]).map((tier) => {
                  const mine = tier === rarity;
                  return (
                    <div
                      key={tier}
                      className="flex items-center gap-3 rounded-xl border px-3 py-2"
                      style={{
                        borderColor: mine ? RARITY[tier].color : 'rgb(30 41 59)',
                        backgroundColor: mine ? `${RARITY[tier].color}18` : 'transparent',
                      }}
                    >
                      <span className="w-[4.5rem] shrink-0 text-xs font-black tracking-wider" style={{ color: RARITY[tier].color }}>
                        {RARITY[tier].label}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: RARITY[tier].color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${rates[tier]}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                        />
                      </div>
                      <span className="w-9 text-right font-mono text-xs text-slate-400">{rates[tier]}%</span>
                      <span className="w-10 text-right text-[10px] font-bold text-white">{mine ? 'GET!' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <TraitChips title="적용된 AI 보정" items={['피부 결 리터칭', '아이돌 조명 보정', ...concept.edits]} />
          </motion.div>
        )}
      </AnimatePresence>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'fan-photocard',
    targetSlug: 'ai-fan-photocard',
    industryId: 'entertainment',
    analyzeEmoji: '🎴',
    analyzeDurationMs: 3400,
    analyzeImageStepId: 'face',
    printAfterReveal: '팩을 뜯으면 포토카드가 출력돼요',
    analyzeMessages: ['아이돌 조명으로 보정 중', '공식 포토카드 프레임 적용 중', '레어도 추첨 중', '랜덤 팩 포장 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '포토부스에서 한 장 찍어요',
      subtitle: '아이돌처럼 포즈! 셔터를 누르면 3초 뒤에 찍혀요',
      mode: 'face',
      countdown: true,
      scanLabels: ['얼굴 영역 감지', '피부 톤·결 분석', '아이돌 조명 매칭', '포토카드 비율 크롭'],
      readouts: (c) => [
        { label: '비주얼 에너지', value: `${72 + (c.seed % 27)}%` },
        { label: '조명 무드', value: c.stats.warmth > 52 ? '웜 스포트' : '쿨 스포트' },
      ],
    }),
    choiceStep({
      id: 'concept',
      title: '어떤 앨범 콘셉트로 만들까요?',
      subtitle: '콘셉트에 따라 보정 톤과 공식 프레임이 달라져요',
      columns: 2,
      options: (Object.keys(CONCEPTS) as ConceptId[]).map((id) => ({
        id,
        emoji: CONCEPTS[id].emoji,
        label: CONCEPTS[id].label,
        desc: CONCEPTS[id].desc,
        swatch: CONCEPTS[id].swatch,
      })),
    }),
    textStep({
      id: 'profile',
      title: '카드에 새길 활동명을 정해주세요',
      subtitle: '포토카드 하단에 크게 들어가요',
      fields: [
        { id: 'stageName', label: '활동명', placeholder: '예: 하린, JUN', maxLength: 10 },
        { id: 'group', label: '그룹명', placeholder: 'NEANDER', maxLength: 12, optional: true },
      ],
    }),
  ],
  computeResult: (answers) => {
    const { concept, rarity } = roll(answers);
    return `${concept}-${rarity}`;
  },
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'face');
    const { stageName, group } = namesOf(answers);
    const { concept: conceptId, serial } = roll(answers);
    const concept = CONCEPTS[conceptId];
    return {
      kind: 'photo',
      photos: capture
        ? [
            {
              src: capture.image,
              look: concept.look,
              overlay: <CardPrint concept={concept} conceptId={conceptId} stageName={stageName} group={group} serial={serial} />,
            },
          ]
        : [],
      title: `${stageName}의 포토카드`,
      caption: `${concept.label} · ${concept.album} · 55 × 85mm 트레카`,
      // 레어도는 화면에서 팩을 뜯어 확인하도록 남겨 두고, 컬렉션 넘버를 배지로 찍는다
      badge: serialLabel(serial),
      paper: PAPER[conceptId],
    };
  },
});
