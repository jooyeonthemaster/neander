'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps, DemoStepProps } from '@/types/demo';
import {
  InfoGrid,
  Panel,
  ProcessedPhoto,
  ResultShell,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  handPose,
  hashString,
  seededInt,
  seededRandom,
  type DemoStepDef,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type MoodId = 'lovely' | 'chic' | 'natural' | 'funky' | 'elegant' | 'dreamy';
type PaletteId = 'cherry' | 'nude' | 'midnight' | 'mint' | 'wine' | 'lavender';
type PatternId = 'french' | 'gradient' | 'glitter' | 'marble' | 'art';
type ShapeId = 'round' | 'square' | 'almond' | 'stiletto';

const MOODS: Record<MoodId, { label: string; emoji: string; desc: string; adj: string }> = {
  lovely: { label: '러블리', emoji: '💗', desc: '사랑스럽고 달콤하게', adj: '러블리' },
  chic: { label: '시크', emoji: '🖤', desc: '도시적이고 세련되게', adj: '시크' },
  natural: { label: '내추럴', emoji: '🌿', desc: '깨끗하고 편안하게', adj: '내추럴' },
  funky: { label: '펑키', emoji: '⚡', desc: '톡톡 튀고 대담하게', adj: '펑키' },
  elegant: { label: '우아한', emoji: '🦢', desc: '고급스럽고 단정하게', adj: '엘레강스' },
  dreamy: { label: '몽환', emoji: '🔮', desc: '신비롭고 반짝이게', adj: '드리미' },
};

const PALETTES: Record<PaletteId, { name: string; en: string; colors: [string, string, string] }> = {
  cherry: { name: '체리 블라썸', en: 'Cherry Blossom', colors: ['#ffe4ec', '#ff8fab', '#e11d74'] },
  nude: { name: '누드 베이지', en: 'Nude Beige', colors: ['#f7e7dc', '#d9b8a3', '#8d5b4c'] },
  midnight: { name: '미드나잇 블루', en: 'Midnight Blue', colors: ['#dbe4ff', '#6272e8', '#1e1b4b'] },
  mint: { name: '민트 소다', en: 'Mint Soda', colors: ['#e6fff7', '#7ee0c3', '#0f9b8e'] },
  wine: { name: '버건디 와인', en: 'Burgundy Wine', colors: ['#fbe3e8', '#c0395a', '#5b0f24'] },
  lavender: { name: '라벤더 드림', en: 'Lavender Dream', colors: ['#f3edff', '#c4b0ff', '#7c4dff'] },
};

const PATTERNS: Record<PatternId, { label: string; emoji: string; en: string }> = {
  french: { label: '프렌치', emoji: '🤍', en: 'French' },
  gradient: { label: '그라데이션', emoji: '🌅', en: 'Ombre' },
  glitter: { label: '글리터', emoji: '✨', en: 'Glitter' },
  marble: { label: '마블', emoji: '🪨', en: 'Marble' },
  art: { label: '아트 드로잉', emoji: '🎨', en: 'Art' },
};

const SHAPES: Record<ShapeId, { label: string; ratio: number; length: string }> = {
  round: { label: '라운드', ratio: 1.25, length: '숏' },
  square: { label: '스퀘어', ratio: 1.15, length: '숏' },
  almond: { label: '아몬드', ratio: 1.5, length: '미디엄' },
  stiletto: { label: '스틸레토', ratio: 1.8, length: '롱' },
};

const FINGERS = [
  { name: '엄지', base: 15 },
  { name: '검지', base: 12 },
  { name: '중지', base: 13 },
  { name: '약지', base: 12 },
  { name: '소지', base: 9 },
] as const;

/** 포인트 네일 = 약지 */
const ACCENT = 3;

interface NailDesign {
  palette: [string, string, string];
  pattern: PatternId;
  shape: ShapeId;
  mood: MoodId;
  seed: number;
}

/* ── Helpers ───────────────────────────────────────────── */

/** 손 스캔 시드로 손톱 가로 폭(mm)을 "측정"한다 */
function nailSizes(seed: number): number[] {
  return FINGERS.map((f, i) => f.base + seededInt(seed, `nail-${i}`, -1, 1));
}

function pick<T extends string>(answers: DemoAnswers, id: string, table: Record<T, unknown>, fallback: T): T {
  const value = getChoice(answers, id);
  return value && value in table ? (value as T) : fallback;
}

function designFrom(answers: DemoAnswers, overrides?: { pattern?: PatternId; shape?: ShapeId }): NailDesign {
  const mood = pick<MoodId>(answers, 'mood', MOODS, 'lovely');
  const palette = pick<PaletteId>(answers, 'palette', PALETTES, 'cherry');
  const captureSeed = getCapture(answers, 'hand')?.seed ?? 11;
  return {
    palette: PALETTES[palette].colors,
    pattern: overrides?.pattern ?? pick<PatternId>(answers, 'pattern', PATTERNS, 'gradient'),
    shape: overrides?.shape ?? pick<ShapeId>(answers, 'shape', SHAPES, 'round'),
    mood,
    // 무늬 배치는 손 스캔 + 무드 + 팔레트로 고정 — 미리보기와 결과가 같은 디자인이 된다
    seed: hashString(`${captureSeed}-${mood}-${palette}`),
  };
}

/** 손톱 윤곽 — 끝(자유연)이 y=0, 큐티클 쪽이 아래 */
function nailPath(shape: ShapeId, w: number, h: number): string {
  const c = w * 0.2;
  const cuticle = `L${w} ${h} Q${w / 2} ${h + c} 0 ${h} Z`;
  if (shape === 'square') {
    const r = w * 0.14;
    return `M0 ${h} L0 ${r} Q0 0 ${r} 0 L${w - r} 0 Q${w} 0 ${w} ${r} ${cuticle}`;
  }
  if (shape === 'almond') {
    return `M0 ${h} L0 ${h * 0.5} C0 ${h * 0.2} ${w * 0.34} ${h * 0.07} ${w / 2} 0 C${w * 0.66} ${h * 0.07} ${w} ${h * 0.2} ${w} ${h * 0.5} ${cuticle}`;
  }
  if (shape === 'stiletto') {
    return `M0 ${h} L0 ${h * 0.55} C0 ${h * 0.3} ${w * 0.38} ${h * 0.12} ${w / 2} 0 C${w * 0.62} ${h * 0.12} ${w} ${h * 0.3} ${w} ${h * 0.55} ${cuticle}`;
  }
  return `M0 ${h} L0 ${w / 2} A${w / 2} ${w / 2} 0 0 1 ${w} ${w / 2} ${cuticle}`;
}

const STAR_PATH =
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 0.45 : 1;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${i === 0 ? 'M' : 'L'}${(Math.cos(a) * r).toFixed(3)} ${(Math.sin(a) * r).toFixed(3)}`;
  }).join(' ') + ' Z';

type MotifId = 'heart' | 'star' | 'flower' | 'moon' | 'cherry' | 'dots' | 'wave' | 'bolt';
const MOTIFS: MotifId[] = ['heart', 'star', 'flower', 'moon', 'cherry', 'dots', 'wave', 'bolt'];

function Motif({ id, color, x, y, size }: { id: MotifId; color: string; x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      {id === 'heart' && <path d="M0 0.8 C-1.2 -0.1 -0.6 -1 0 -0.35 C0.6 -1 1.2 -0.1 0 0.8 Z" fill={color} />}
      {id === 'star' && <path d={STAR_PATH} fill={color} />}
      {id === 'flower' && (
        <>
          {[0, 1, 2, 3, 4].map((k) => {
            const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
            return <circle key={k} cx={Math.cos(a) * 0.55} cy={Math.sin(a) * 0.55} r="0.42" fill={color} />;
          })}
          <circle r="0.3" fill="#fde047" />
        </>
      )}
      {id === 'moon' && <path d="M0.3 -0.9 A0.9 0.9 0 1 0 0.3 0.9 A0.7 0.7 0 1 1 0.3 -0.9 Z" fill={color} />}
      {id === 'cherry' && (
        <>
          <path d="M-0.35 0.25 Q-0.1 -0.5 0.25 -0.85 M0.35 0.35 Q0.3 -0.3 0.25 -0.85" stroke="#15803d" strokeWidth="0.12" fill="none" />
          <circle cx="-0.35" cy="0.45" r="0.32" fill={color} />
          <circle cx="0.35" cy="0.55" r="0.32" fill={color} />
        </>
      )}
      {id === 'dots' && (
        <>
          <circle cx="-0.5" cy="0.4" r="0.25" fill={color} />
          <circle cx="0.1" cy="-0.1" r="0.32" fill={color} />
          <circle cx="0.5" cy="0.6" r="0.18" fill={color} />
        </>
      )}
      {id === 'wave' && (
        <path d="M-1 -0.2 Q-0.5 -0.7 0 -0.2 T1 -0.2 M-1 0.45 Q-0.5 -0.05 0 0.45 T1 0.45" stroke={color} strokeWidth="0.2" fill="none" strokeLinecap="round" />
      )}
      {id === 'bolt' && <path d="M0.2 -1 L-0.5 0.1 L0 0.1 L-0.2 1 L0.5 -0.15 L0 -0.15 Z" fill={color} />}
    </g>
  );
}

/* ── Nail ──────────────────────────────────────────────── */

/** 손톱 하나. (0,0)이 손톱 끝 왼쪽 위, 폭 w */
function Nail({ design, index, w, uid }: { design: NailDesign; index: number; w: number; uid: string }) {
  const h = w * SHAPES[design.shape].ratio;
  const d = nailPath(design.shape, w, h);
  const [c1, c2, c3] = design.palette;
  const accent = index === ACCENT;
  const rnd = (salt: string) => seededRandom(design.seed, `${salt}-${index}`);
  const clipId = `${uid}-${index}-clip`;
  const gradId = `${uid}-${index}-grad`;
  const holoId = `${uid}-${index}-holo`;
  const total = h + w * 0.1;

  let base = c1;
  let layer: React.ReactNode = null;

  if (design.pattern === 'french') {
    const depth = h * (0.24 + rnd('tip') * 0.1);
    base = accent ? c3 : c1;
    layer = (
      <>
        <ellipse cx={w / 2} cy={-h * 0.02} rx={w * 0.9} ry={depth} fill={accent ? c1 : c3} />
        <ellipse cx={w / 2} cy={-h * 0.02} rx={w * 0.9} ry={depth} fill="none" stroke={c2} strokeWidth={w * 0.05} />
      </>
    );
  } else if (design.pattern === 'gradient') {
    base = `url(#${gradId})`;
  } else if (design.pattern === 'glitter') {
    base = accent ? c3 : `url(#${gradId})`;
    const count = accent ? 46 : 20;
    const colors = ['#ffffff', '#fcd34d', '#e2e8f0', accent ? c1 : c3];
    layer = Array.from({ length: count }, (_, k) => (
      <circle
        key={k}
        cx={rnd(`gx${k}`) * w}
        cy={Math.pow(rnd(`gy${k}`), accent ? 1 : 1.8) * total}
        r={w * (0.025 + rnd(`gr${k}`) * 0.045)}
        fill={colors[k % colors.length]}
        opacity={0.75 + rnd(`go${k}`) * 0.25}
      />
    ));
  } else if (design.pattern === 'marble') {
    base = accent ? c3 : '#fbf8f6';
    const vein = accent ? '#ffffff' : c3;
    layer = (
      <>
        {!accent && <ellipse cx={w * (0.3 + rnd('wash') * 0.4)} cy={total * 0.55} rx={w * 0.6} ry={h * 0.35} fill={c2} opacity="0.3" />}
        {[0, 1, 2].map((k) => (
          <path
            key={k}
            d={`M${rnd(`v0${k}`) * w} ${-2} C${rnd(`v1${k}`) * w * 1.4 - w * 0.2} ${total * 0.3} ${rnd(`v2${k}`) * w} ${total * 0.65} ${rnd(`v3${k}`) * w} ${total + 2}`}
            stroke={k === 2 ? '#d4a017' : vein}
            strokeWidth={w * (k === 2 ? 0.025 : 0.035 + rnd(`vw${k}`) * 0.04)}
            opacity={k === 2 ? 0.9 : 0.55}
            fill="none"
          />
        ))}
      </>
    );
  } else {
    const motif = MOTIFS[(seededInt(design.seed, 'motif', 0, MOTIFS.length - 1) + index * 3) % MOTIFS.length]!;
    base = accent ? c2 : c1;
    layer = <Motif id={motif} color={accent ? '#ffffff' : c3} x={w / 2} y={h * 0.55} size={w * 0.26} />;
  }

  // 무드별 포인트 네일 장식
  let deco: React.ReactNode = null;
  if (accent) {
    const cy = h * 0.82;
    if (design.mood === 'lovely') deco = <circle cx={w / 2} cy={cy} r={w * 0.11} fill="#fff7fb" stroke="#f9a8d4" strokeWidth={w * 0.02} />;
    if (design.mood === 'chic') deco = <rect x={w * 0.46} y={-2} width={w * 0.08} height={total + 4} fill="#d4a017" />;
    if (design.mood === 'funky') deco = <Motif id="bolt" color="#fde047" x={w * 0.5} y={h * 0.3} size={w * 0.16} />;
    if (design.mood === 'elegant')
      deco = [-1, 0, 1].map((k) => (
        <path
          key={k}
          d={`M${w / 2 + k * w * 0.2} ${cy - w * 0.08} l${w * 0.07} ${w * 0.08} l${-w * 0.07} ${w * 0.08} l${-w * 0.07} ${-w * 0.08} Z`}
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth={w * 0.01}
        />
      ));
    if (design.mood === 'dreamy') deco = <rect x={-2} y={-2} width={w + 4} height={total + 4} fill={`url(#${holoId})`} opacity="0.45" />;
  }

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="1" x2={accent ? 1 : 0} y2="0">
          <stop offset="0" stopColor={c1} />
          <stop offset="0.5" stopColor={c2} />
          <stop offset="1" stopColor={c3} />
        </linearGradient>
        <linearGradient id={holoId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0abfc" />
          <stop offset="0.5" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <path d={d} fill={base} />
      <g clipPath={`url(#${clipId})`}>
        {layer}
        {deco}
        <path
          d={`M${w * 0.24} ${h * 0.2} Q${w * 0.17} ${h * 0.55} ${w * 0.25} ${h * 0.88}`}
          stroke="#ffffff"
          strokeOpacity="0.5"
          strokeWidth={w * 0.09}
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <path d={d} fill="none" stroke="rgba(15,23,42,0.18)" strokeWidth={Math.max(0.5, w * 0.025)} />
    </g>
  );
}

/* ── Hand render ───────────────────────────────────────── */

/** 결과 손 일러스트의 손가락 배치 (viewBox 320×250) */
const HAND_LAYOUT = [
  { cx: 60, top: 146, rot: -15 },
  { cx: 114, top: 62, rot: -5 },
  { cx: 167, top: 40, rot: 0 },
  { cx: 219, top: 58, rot: 5 },
  { cx: 268, top: 100, rot: 9 },
] as const;

function skinTone(brightness: number): [string, string] {
  if (brightness > 58) return ['#f8dccb', '#ecbfa4'];
  if (brightness > 40) return ['#efc6a8', '#dca17f'];
  return ['#d6a07c', '#b27552'];
}

function HandRender({ design, sizes, skin }: { design: NailDesign; sizes: number[]; skin: [string, string] }) {
  return (
    <svg viewBox="0 0 320 250" className="h-auto w-full" role="img" aria-label="AI가 생성한 다섯 손가락 네일 디자인">
      <defs>
        <linearGradient id="nail-skin" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={skin[1]} />
          <stop offset="0.35" stopColor={skin[0]} />
          <stop offset="1" stopColor={skin[1]} />
        </linearGradient>
      </defs>
      {HAND_LAYOUT.map((f, i) => {
        const nw = sizes[i]! * 2.3;
        const fw = nw / 0.74;
        const cuticleY = f.top + nw * 1.3;
        const h = nw * SHAPES[design.shape].ratio;
        return (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
          >
            <g transform={`rotate(${f.rot} ${f.cx} 270)`}>
              <rect x={f.cx - fw / 2} y={f.top} width={fw} height={290 - f.top} rx={fw / 2} fill="url(#nail-skin)" />
              <path
                d={`M${f.cx - fw * 0.28} ${cuticleY + fw * 0.95} q${fw * 0.28} ${fw * 0.12} ${fw * 0.56} 0`}
                stroke="rgba(120,60,40,0.18)"
                strokeWidth="1.5"
                fill="none"
              />
              <g transform={`translate(${f.cx - nw / 2} ${cuticleY - h})`}>
                <Nail design={design} index={i} w={nw} uid="hand" />
              </g>
            </g>
          </motion.g>
        );
      })}
    </svg>
  );
}

/** 촬영 가이드와 같은 손 모양 좌표(300×400)의 손톱 5개 — 정적 SVG라 출력물 오버레이에도 쓴다 */
function HandNails({ design, thumbLeft, uid }: { design: NailDesign; thumbLeft: boolean; uid: string }) {
  return (
    <>
      {handPose(thumbLeft).map((finger, i) => {
        const fingerW = finger.width * 3;
        const nw = fingerW * 0.64;
        return (
          <g
            key={finger.name}
            transform={`translate(${finger.tip.x * 3} ${finger.tip.y * 4}) rotate(${finger.angle}) translate(${-nw / 2} ${fingerW * 0.14})`}
          >
            <Nail design={design} index={i} w={nw} uid={uid} />
          </g>
        );
      })}
    </>
  );
}

/** 촬영 가이드와 같은 손 모양 좌표에 손톱을 얹는다 (엄지 방향은 촬영 때 고른 손 기준) */
function PhotoNails({ design, thumbLeft }: { design: NailDesign; thumbLeft: boolean }) {
  return (
    <svg viewBox="0 0 300 400" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <HandNails design={design} thumbLeft={thumbLeft} uid="photo" />
    </svg>
  );
}

/** 결과 화면의 "내 손에 가상 적용" 사진 보정 */
const HAND_LOOK: PhotoLook = { adjust: { brightness: 1.05, saturation: 1.06, contrast: 1.03 }, vignette: 0.25 };

/** 디자인 카드·스티커 시트에 찍히는 일련번호 */
function serialOf(design: NailDesign): number {
  return seededInt(design.seed ^ hashString(design.pattern + design.shape), 'serial', 1000, 9999);
}

function Sticker({ design, index, mm, uid }: { design: NailDesign; index: number; mm: number; uid: string }) {
  const w = mm * 2.1;
  const h = w * SHAPES[design.shape].ratio + w * 0.1;
  const pad = 5;
  const d = nailPath(design.shape, w, w * SHAPES[design.shape].ratio);
  return (
    <svg width={w + pad * 2} height={h + pad * 2} viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`} aria-hidden="true">
      <path d={d} fill="#ffffff" stroke="#cbd5e1" strokeWidth="7" strokeLinejoin="round" />
      <path d={d} fill="#ffffff" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
      <Nail design={design} index={index} w={w} uid={uid} />
    </svg>
  );
}

/* ── Step: 패턴·쉐입 ───────────────────────────────────── */

function ShapeIcon({ shape }: { shape: ShapeId }) {
  const w = 14;
  const h = w * SHAPES[shape].ratio;
  return (
    <svg viewBox={`-2 -2 ${w + 4} ${h + 7}`} className="h-8 w-6" aria-hidden="true">
      <path d={nailPath(shape, w, h)} fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function DetailStudio({ answers, onUpdate }: DemoStepProps) {
  const pattern = getChoice(answers, 'pattern') as PatternId | undefined;
  const shape = getChoice(answers, 'shape') as ShapeId | undefined;
  const design = designFrom(answers, { pattern: pattern ?? 'gradient', shape: shape ?? 'round' });
  const sizes = nailSizes(getCapture(answers, 'hand')?.seed ?? 11);
  const bg = design.palette[0];

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch">
      <div
        className="flex w-44 shrink-0 flex-col items-center justify-end rounded-2xl border border-slate-700 p-4"
        style={{ background: `linear-gradient(160deg, ${bg}, #ffffff 80%)` }}
      >
        <svg viewBox="0 0 120 120" className="w-full" aria-label="네일 미리보기" role="img">
          {[1, 2, 3].map((i, k) => {
            const widths = [1, 2, 3].map((f) => sizes[f]! * 2.7);
            const nw = widths[k]!;
            const h = nw * SHAPES[design.shape].ratio;
            const x = (120 - widths.reduce((sum, v) => sum + v, 0) - 12) / 2 + widths.slice(0, k).reduce((sum, v) => sum + v + 6, 0);
            return (
              <g key={`${i}-${design.pattern}-${design.shape}`} transform={`translate(${x} ${112 - h - (k === 1 ? 8 : 0)})`}>
                <Nail design={design} index={i} w={nw} uid="preview" />
              </g>
            );
          })}
        </svg>
        <p className="mt-2 text-[10px] font-semibold tracking-widest text-slate-500">LIVE PREVIEW</p>
      </div>

      <div className="w-full flex-1 space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400">패턴</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {(Object.keys(PATTERNS) as PatternId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onUpdate('pattern', id)}
                aria-pressed={pattern === id}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                  pattern === id ? 'border-teal-400 bg-teal-500/10 text-white' : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600'
                )}
              >
                <span className="text-xl leading-none">{PATTERNS[id].emoji}</span>
                {PATTERNS[id].label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400">쉐입</p>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(SHAPES) as ShapeId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onUpdate('shape', id)}
                aria-pressed={shape === id}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                  shape === id ? 'border-teal-400 bg-teal-500/10 text-teal-200' : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600'
                )}
              >
                <ShapeIcon shape={id} />
                {SHAPES[id].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const detailStep: DemoStepDef = {
  meta: {
    id: 'detail',
    titleKey: '패턴과 쉐입을 골라주세요',
    subtitleKey: '고를 때마다 미리보기에 바로 반영돼요',
    canProceed: (a) => !!getChoice(a, 'pattern') && !!getChoice(a, 'shape'),
  },
  Component: DetailStudio,
};

/* ── Result ────────────────────────────────────────────── */

/** 결과 화면과 출력물이 함께 쓰는 디자인 요약 */
function summaryOf(answers: DemoAnswers) {
  const design = designFrom(answers);
  const mood = MOODS[design.mood];
  const palette = PALETTES[pick<PaletteId>(answers, 'palette', PALETTES, 'cherry')];
  const pattern = PATTERNS[design.pattern];
  const shape = SHAPES[design.shape];
  return { design, mood, palette, pattern, shape, title: `${mood.adj} ${palette.name} ${pattern.label}` };
}

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'hand');
  const { design, mood, palette, pattern, shape, title } = summaryOf(answers);
  const sizes = nailSizes(capture?.seed ?? 11);
  const leftSizes = sizes.map((mm, i) => mm - (seededRandom(design.seed, `L${i}`) > 0.65 ? 1 : 0));
  const serial = serialOf(design);
  const skin = skinTone(capture?.stats.brightness ?? 55);

  return (
    <ResultShell
      eyebrow="세상에 하나뿐인 AI 네일 디자인"
      title={title}
      description={`${mood.desc} 무드에 ${palette.name} 컬러를 얹은 ${shape.label} ${pattern.label} 네일이에요. 약지는 포인트 네일로 디자인했어요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="새 디자인 만들기"
    >
      {/* 메인 디자인 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50"
        style={{ background: `linear-gradient(165deg, ${palette.colors[0]} 0%, #ffffff 50%, ${palette.colors[0]} 100%)` }}
      >
        <div className="flex items-start justify-between px-5 pt-4 text-left">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-slate-500">NEANDER NAIL LAB</p>
            <p className="font-display text-lg font-bold text-slate-900">
              {palette.en} {pattern.en}
            </p>
          </div>
          <span className="rounded-full bg-slate-900 px-2.5 py-1 font-mono text-[10px] font-bold text-white">No.{serial}</span>
        </div>
        <div className="px-3 pb-0 pt-2">
          <HandRender design={design} sizes={sizes} skin={skin} />
        </div>
      </motion.div>

      {/* 내 손 가상 적용 + 디자인 정보 */}
      <div className="flex w-full max-w-md flex-col items-center gap-4 sm:flex-row sm:items-stretch">
        {capture && (
          <div className="w-full max-w-[240px] shrink-0 sm:w-52">
            <ProcessedPhoto
              src={capture.image}
              look={HAND_LOOK}
              className="aspect-[3/4] rounded-2xl border border-slate-700"
              alt="내 손에 가상 적용한 네일"
            >
              <PhotoNails design={design} thumbLeft={capture.hand?.thumbLeft ?? true} />
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">내 손에 가상 적용</span>
            </ProcessedPhoto>
          </div>
        )}
        <InfoGrid
          items={[
            { emoji: mood.emoji, label: '무드', value: mood.label },
            { emoji: '🎨', label: '팔레트', value: palette.name },
            { emoji: '💅', label: '쉐입 · 길이', value: `${shape.label} · ${shape.length}` },
            { emoji: '⏳', label: '지속력', value: '약 7~10일' },
          ]}
        />
      </div>

      {/* 스티커 시트 */}
      <Panel title="네일 스티커 출력 미리보기">
        <div className="rounded-xl bg-[#fbfaf8] p-3 text-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-[9px] font-bold tracking-[0.2em] text-slate-400">
            <span>NEANDER NAIL STICKER</span>
            <span>10 PCS · No.{serial}</span>
          </div>
          {[
            { side: 'L', list: leftSizes.map((mm, i) => ({ mm, i })).reverse() },
            { side: 'R', list: sizes.map((mm, i) => ({ mm, i })) },
          ].map((row) => (
            <div key={row.side} className="mt-2 flex items-end justify-between gap-1 border-t border-dashed border-slate-300 pt-2">
              <span className="w-3 self-center text-[10px] font-bold text-slate-400">{row.side}</span>
              {row.list.map(({ mm, i }) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <Sticker design={design} index={i} mm={mm} uid={`sheet-${row.side}`} />
                  <span className="font-mono text-[9px] text-slate-500">{mm}mm</span>
                </div>
              ))}
            </div>
          ))}
          <p className="mt-2 text-[10px] text-slate-400">✂ 점선을 따라 떼어 붙이세요 · 젤 타입 실제 부착용</p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">
          손 스캔으로 잰 손톱 폭({FINGERS.map((f, i) => `${f.name} ${sizes[i]}`).join(' · ')}mm)에 맞춰 양손 10개 사이즈로 출력돼요.
        </p>
      </Panel>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'nail-designer',
    targetSlug: 'ai-nail-designer',
    industryId: 'beauty',
    analyzeEmoji: '💅',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'hand',
    analyzeMessages: ['손톱 사이즈에 맞춰 캔버스 준비 중', '무드·팔레트로 디자인 생성 중', '포인트 네일 디테일 그리는 중', '스티커 시트 배치 중'],
  },
  steps: [
    cameraStep({
      id: 'hand',
      title: '손등을 스캔해 볼게요',
      subtitle: '손등이 보이게 손가락을 쫙 펴서 가이드에 맞춰주세요 · 손톱 크기를 재요',
      mode: 'handBack',
      subject: '손등',
      scanLabels: ['손 영역 감지', '손가락 끝마디 5개 추적', '손톱 폭·길이 측정', '네일 곡률 계산'],
      readouts: (c) => {
        const sizes = nailSizes(c.seed);
        return [
          ...FINGERS.map((f, i) => ({ label: f.name, value: `${sizes[i]}mm` })),
          { label: '곡률', value: `C커브 ${38 + (c.seed % 17)}%` },
        ];
      },
    }),
    choiceStep({
      id: 'mood',
      title: '오늘의 무드는?',
      subtitle: '네일 전체 분위기를 정해요',
      columns: 3,
      options: (Object.keys(MOODS) as MoodId[]).map((id) => ({ id, emoji: MOODS[id].emoji, label: MOODS[id].label, desc: MOODS[id].desc })),
    }),
    choiceStep({
      id: 'palette',
      title: '컬러 팔레트를 골라주세요',
      columns: 3,
      options: (Object.keys(PALETTES) as PaletteId[]).map((id) => {
        const [a, b, c] = PALETTES[id].colors;
        return { id, label: PALETTES[id].name, swatch: `linear-gradient(90deg, ${a} 0 33%, ${b} 33% 66%, ${c} 66% 100%)` };
      }),
    }),
    detailStep,
  ],
  computeResult: (answers) => `${pick<PatternId>(answers, 'pattern', PATTERNS, 'gradient')}-${pick<ShapeId>(answers, 'shape', SHAPES, 'round')}`,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'hand');
    const { design, palette, pattern, shape, title } = summaryOf(answers);
    return {
      kind: 'photo',
      photos: capture
        ? [
            {
              src: capture.image,
              look: HAND_LOOK,
              label: '내 손에 가상 적용',
              overlay: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width={1200} height={1600}>
                  <HandNails design={design} thumbLeft={capture.hand?.thumbLeft ?? true} uid="print" />
                </svg>
              ),
            },
          ]
        : [],
      title,
      caption: `${palette.en} ${pattern.en} · ${shape.label} ${shape.length} · 약지 포인트 네일`,
      badge: `No.${serialOf(design)}`,
    };
  },
});
