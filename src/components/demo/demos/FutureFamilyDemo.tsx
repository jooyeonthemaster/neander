'use client';

import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  Panel,
  ProcessedPhoto,
  ResultShell,
  TraitChips,
  cameraStep,
  choiceStep,
  clamp,
  defineDemo,
  getCapture,
  getChoice,
  seededInt,
  seededPick,
  type CaptureData,
  type PhotoLook,
  type PrintSpec,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type ConceptId = 'son' | 'daughter' | 'twins' | 'surprise';
type Gender = 'boy' | 'girl';
type Stage = 'baby' | 'toddler' | 'kid';

const CONCEPTS: Record<ConceptId, { label: string; emoji: string; desc: string }> = {
  son: { label: '아들', emoji: '👦', desc: '씩씩한 우리 첫째' },
  daughter: { label: '딸', emoji: '👧', desc: '다정한 우리 첫째' },
  twins: { label: '쌍둥이 남매', emoji: '👫', desc: '행복도 두 배' },
  surprise: { label: 'AI에게 맡기기', emoji: '🎁', desc: '두근두근 서프라이즈' },
};

const COLOR_A = '#fb7185';
const COLOR_B = '#38bdf8';

const FEATURES = [
  { id: 'eyes', label: '눈매', emoji: '👀' },
  { id: 'brows', label: '눈썹', emoji: '〰️' },
  { id: 'nose', label: '코', emoji: '👃' },
  { id: 'mouth', label: '입매', emoji: '👄' },
  { id: 'face', label: '얼굴형', emoji: '🙂' },
  { id: 'smile', label: '웃는 모습', emoji: '😊' },
] as const;

type FeatureId = (typeof FEATURES)[number]['id'];

const HAIR_COLORS = ['#1f1512', '#2e1d14', '#4a2e1c', '#6b4226'];
const FIRST_WORDS = ['까까', '맘마', '멍멍', '안녕', '빠빠', '아니야'];
const FAVORITE_PLAY = ['블록 쌓기', '공룡 흉내', '그림 그리기', '숨바꼭질', '노래 부르기', '모래 놀이'];
const DREAMS = ['🚀 우주비행사', '🎨 그림 작가', '🩺 동물 의사', '⚽ 축구 선수', '🎹 작곡가', '🔬 과학자', '👩‍🍳 요리사'];
const PERSONALITY = ['호기심 대장', '애교 만점', '웃음 부자', '씩씩함', '꼼꼼함', '먹보', '음악 감각', '모험가', '배려왕', '수다쟁이'];

const PHOTO_LOOK: PhotoLook = {
  adjust: { brightness: 1.05, saturation: 1.05, warmth: 0.12 },
  tint: { color: '#fecdd3', alpha: 0.15, blend: 'soft-light' },
  vignette: 0.18,
};

/* ── Genetics (재미용 시드 조합) ──────────────────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `#${[m(ar, br), m(ag, bg), m(ab, bb)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

interface AvatarLook {
  gender: Gender;
  skin: string;
  skinShade: string;
  hair: string;
  shapes: Record<FeatureId, number>;
  freckles: boolean;
  outfit: string;
}

function analyze(answers: DemoAnswers) {
  const a = getCapture(answers, 'partnerA');
  const b = getCapture(answers, 'partnerB');
  const seedA = a?.seed ?? 1103;
  const seedB = b?.seed ?? 2207;
  const mix = (seedA ^ Math.imul(seedB, 2654435761)) >>> 0;
  const concept = (getChoice(answers, 'concept') as ConceptId | undefined) ?? 'surprise';

  const features = FEATURES.map((f) => {
    const pa = seededInt(mix, f.id, 31, 69);
    return { ...f, a: pa, b: 100 - pa };
  });
  const overallA = Math.round(features.reduce((s, f) => s + f.a, 0) / features.length);

  const shapes = Object.fromEntries(
    features.map((f) => [f.id, seededInt(f.a >= 50 ? seedA : seedB, `shape-${f.id}`, 0, 2)])
  ) as Record<FeatureId, number>;

  const statsOf = (c: CaptureData | undefined) => c?.stats ?? { brightness: 62, warmth: 56, saturation: 30, contrast: 40 };
  const avgBright = (statsOf(a).brightness + statsOf(b).brightness) / 2;
  const avgWarm = (statsOf(a).warmth + statsOf(b).warmth) / 2;
  const light = avgWarm >= 50 ? '#fde3cf' : '#f9e2d9';
  const deep = avgWarm >= 50 ? '#c68a5e' : '#b98272';
  const skin = lerpColor(light, deep, clamp((72 - avgBright) / 60, 0.06, 0.7));
  const skinShade = lerpColor(skin, '#8b5a3c', 0.3);
  const hair = seededPick(mix, 'hair', HAIR_COLORS);
  const freckles = seededInt(mix, 'freckles', 0, 3) === 0;

  const baseGender: Gender = concept === 'son' ? 'boy' : concept === 'daughter' ? 'girl' : seededInt(mix, 'gender', 0, 1) ? 'girl' : 'boy';
  const make = (gender: Gender): AvatarLook => ({
    gender,
    skin,
    skinShade,
    hair,
    shapes,
    freckles,
    outfit: gender === 'girl' ? '#f9a8d4' : '#7dd3fc',
  });
  const kids = concept === 'twins' ? [make('boy'), make('girl')] : [make(baseGender)];

  const name = concept === 'twins' ? '쌍둥이 남매' : baseGender === 'girl' ? '딸' : '아들';
  const predictions = {
    word: seededPick(mix, 'word', FIRST_WORDS),
    play: seededPick(mix, 'play', FAVORITE_PLAY),
    dream: seededPick(mix, 'dream', DREAMS),
    walk: seededInt(mix, 'walk', 10, 14),
  };
  const personality = [0, 1, 2].map((i) => PERSONALITY[(seededInt(mix, `p${i}`, 0, PERSONALITY.length - 1) + i * 3) % PERSONALITY.length]!);
  const uniquePersonality = [...new Set(personality)];

  return { a, b, concept, features, overallA, kids, name, predictions, personality: uniquePersonality };
}

/* ── Child avatar (SVG) ───────────────────────────────── */

const STAGES: Record<Stage, { headR: number; cy: number; bodyTop: number; bodyW: number; bodyBottom: number; legLen: number }> = {
  baby: { headR: 36, cy: 60, bodyTop: 92, bodyW: 54, bodyBottom: 146, legLen: 8 },
  toddler: { headR: 31, cy: 50, bodyTop: 78, bodyW: 50, bodyBottom: 128, legLen: 22 },
  kid: { headR: 27, cy: 40, bodyTop: 64, bodyW: 46, bodyBottom: 118, legLen: 36 },
};

function ChildAvatar({ look, stage, className }: { look: AvatarLook; stage: Stage; className?: string }) {
  const st = STAGES[stage];
  const cx = 60;
  const { headR, cy } = st;
  const faceShape = look.shapes.face;
  const rx = faceShape === 1 ? headR * 0.92 : faceShape === 2 ? headR * 1.05 : headR;
  const ry = faceShape === 1 ? headR * 1.06 : faceShape === 2 ? headR * 0.95 : headR;
  const s = headR * (stage === 'baby' ? 0.14 : 0.13);
  const eyeY = cy + headR * 0.1;
  const eyeDx = headR * 0.37;
  const isGirl = look.gender === 'girl';
  const hair = look.hair;

  const capTop = cy - ry * 1.18;
  const fringeY = cy - ry * 0.42;
  const cap = `M${cx - rx * 1.02} ${cy - ry * 0.05} C${cx - rx * 1.08} ${capTop} ${cx + rx * 1.08} ${capTop} ${cx + rx * 1.02} ${cy - ry * 0.05} ${
    isGirl
      ? `Q${cx + rx * 0.7} ${fringeY - 4} ${cx} ${fringeY + 2} Q${cx - rx * 0.7} ${fringeY - 4} ${cx - rx * 1.02} ${cy - ry * 0.05}`
      : [0.75, 0.5, 0.25, 0, -0.25, -0.5, -0.75].map((f, i) => `L${cx + f * rx} ${fringeY + (i % 2 ? -5 : 2)}`).join(' ') + ` L${cx - rx * 1.02} ${cy - ry * 0.05}`
  } Z`;

  const bodyL = cx - st.bodyW / 2;
  const bodyR = cx + st.bodyW / 2;

  return (
    <svg viewBox="0 0 120 160" className={className} role="img" aria-label={`${stage === 'baby' ? '아기' : stage === 'toddler' ? '유아' : '어린이'} 시절 예상 모습`}>
      {/* 몸 */}
      {stage === 'baby' ? (
        <g>
          <ellipse cx={cx - 13} cy={st.bodyBottom + 2} rx="9" ry="7" fill={look.skin} />
          <ellipse cx={cx + 13} cy={st.bodyBottom + 2} rx="9" ry="7" fill={look.skin} />
          <rect x={bodyL} y={st.bodyTop} width={st.bodyW} height={st.bodyBottom - st.bodyTop} rx="24" fill="#fde68a" />
          <ellipse cx={bodyL + 2} cy={st.bodyTop + 22} rx="8" ry="13" fill="#fde68a" transform={`rotate(24 ${bodyL + 2} ${st.bodyTop + 22})`} />
          <ellipse cx={bodyR - 2} cy={st.bodyTop + 22} rx="8" ry="13" fill="#fde68a" transform={`rotate(-24 ${bodyR - 2} ${st.bodyTop + 22})`} />
          <circle cx={bodyL - 3} cy={st.bodyTop + 33} r="6" fill={look.skin} />
          <circle cx={bodyR + 3} cy={st.bodyTop + 33} r="6" fill={look.skin} />
          <path d={`M${cx - 15} ${st.bodyTop + 2} Q${cx} ${st.bodyTop + 30} ${cx + 15} ${st.bodyTop + 2} Z`} fill="#fff" />
          <path d={`M${cx} ${st.bodyTop + 16} l-3 -3 a2 2 0 0 1 3 -2.5 a2 2 0 0 1 3 2.5 z`} fill={COLOR_A} />
        </g>
      ) : (
        <g>
          {/* 다리 */}
          <rect x={cx - 13} y={st.bodyBottom - 4} width="10" height={st.legLen + 4} rx="4" fill={look.skin} />
          <rect x={cx + 3} y={st.bodyBottom - 4} width="10" height={st.legLen + 4} rx="4" fill={look.skin} />
          <rect x={cx - 15} y={st.bodyBottom + st.legLen - 2} width="13" height="6" rx="3" fill="#475569" />
          <rect x={cx + 2} y={st.bodyBottom + st.legLen - 2} width="13" height="6" rx="3" fill="#475569" />
          {/* 팔 */}
          <rect x={bodyL - 9} y={st.bodyTop + 6} width="10" height={stage === 'kid' ? 40 : 30} rx="5" fill={look.outfit} transform={`rotate(12 ${bodyL - 4} ${st.bodyTop + 6})`} />
          <rect x={bodyR - 1} y={st.bodyTop + 6} width="10" height={stage === 'kid' ? 40 : 30} rx="5" fill={look.outfit} transform={`rotate(-12 ${bodyR + 4} ${st.bodyTop + 6})`} />
          <circle cx={bodyL - 9} cy={st.bodyTop + (stage === 'kid' ? 46 : 36)} r="5" fill={look.skin} />
          <circle cx={bodyR + 9} cy={st.bodyTop + (stage === 'kid' ? 46 : 36)} r="5" fill={look.skin} />
          {/* 옷 */}
          {isGirl ? (
            <path d={`M${bodyL + 4} ${st.bodyTop} H${bodyR - 4} L${bodyR + 6} ${st.bodyBottom} H${bodyL - 6} Z`} fill={look.outfit} />
          ) : (
            <>
              <rect x={bodyL} y={st.bodyTop} width={st.bodyW} height={(st.bodyBottom - st.bodyTop) * 0.68} rx="10" fill={look.outfit} />
              <rect x={bodyL + 2} y={st.bodyTop + (st.bodyBottom - st.bodyTop) * 0.62} width={st.bodyW - 4} height={(st.bodyBottom - st.bodyTop) * 0.38} rx="5" fill="#1e3a8a" />
              <rect x={bodyL} y={st.bodyTop + 14} width={st.bodyW} height="5" fill="#fff" opacity="0.6" />
            </>
          )}
          {isGirl && <circle cx={cx} cy={st.bodyTop + 10} r="3.5" fill="#fff" opacity="0.85" />}
        </g>
      )}

      {/* 뒷머리 */}
      {isGirl && stage === 'kid' && (
        <rect x={cx - rx * 1.14} y={cy - ry * 1.14} width={rx * 2.28} height={ry * 1.85} rx={rx * 0.95} fill={hair} />
      )}
      {isGirl && stage === 'toddler' && (
        <>
          <circle cx={cx - rx * 1.05} cy={cy - ry * 0.5} r={headR * 0.36} fill={hair} />
          <circle cx={cx + rx * 1.05} cy={cy - ry * 0.5} r={headR * 0.36} fill={hair} />
          <circle cx={cx - rx * 0.86} cy={cy - ry * 0.62} r="3.2" fill={COLOR_A} />
          <circle cx={cx + rx * 0.86} cy={cy - ry * 0.62} r="3.2" fill={COLOR_A} />
        </>
      )}

      {/* 귀 + 얼굴 */}
      <circle cx={cx - rx * 0.98} cy={cy + 3} r={headR * 0.18} fill={look.skin} />
      <circle cx={cx + rx * 0.98} cy={cy + 3} r={headR * 0.18} fill={look.skin} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={look.skin} />

      {/* 앞머리 */}
      {stage === 'baby' ? (
        <path d={`M${cx - 2} ${cy - ry + 3} c-2 -9 10 -12 11 -4 c1 5 -6 6 -6 2`} fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d={cap} fill={hair} />
      )}
      {isGirl && stage === 'kid' && (
        <g transform={`translate(${cx + rx * 0.62} ${cy - ry * 0.62})`}>
          <path d="M0 0 l-7 -5 v10 z M0 0 l7 -5 v10 z" fill={COLOR_A} />
          <circle r="2.4" fill="#fde68a" />
        </g>
      )}

      {/* 눈썹 */}
      <g stroke={hair} strokeLinecap="round" fill="none" opacity={stage === 'baby' ? 0.35 : 0.85}>
        {[-1, 1].map((side) => {
          const x = cx + side * eyeDx;
          const y = eyeY - s * 2.3;
          if (look.shapes.brows === 0) return <line key={side} x1={x - s} y1={y} x2={x + s} y2={y} strokeWidth="2" />;
          if (look.shapes.brows === 1) return <path key={side} d={`M${x - s * 1.1} ${y + 1.5} Q${x} ${y - 2.5} ${x + s * 1.1} ${y + 1.5}`} strokeWidth="2" />;
          return <line key={side} x1={x - s * 0.8} y1={y} x2={x + s * 0.8} y2={y} strokeWidth="3.4" />;
        })}
      </g>

      {/* 눈 */}
      {[-1, 1].map((side) => {
        const x = cx + side * eyeDx;
        if (look.shapes.eyes === 2) {
          return <path key={side} d={`M${x - s} ${eyeY + 1} Q${x} ${eyeY - s * 1.3} ${x + s} ${eyeY + 1}`} stroke="#2b1d16" strokeWidth="2.4" fill="none" strokeLinecap="round" />;
        }
        return (
          <g key={side}>
            {look.shapes.eyes === 1 ? (
              <ellipse cx={x} cy={eyeY} rx={s * 1.25} ry={s * 0.82} fill="#2b1d16" />
            ) : (
              <circle cx={x} cy={eyeY} r={s} fill="#2b1d16" />
            )}
            <circle cx={x - s * 0.32} cy={eyeY - s * 0.32} r={s * 0.36} fill="#fff" />
          </g>
        );
      })}

      {/* 볼·주근깨 */}
      <circle cx={cx - rx * 0.55} cy={cy + ry * 0.36} r={headR * 0.16} fill="#fb7185" opacity="0.35" />
      <circle cx={cx + rx * 0.55} cy={cy + ry * 0.36} r={headR * 0.16} fill="#fb7185" opacity="0.35" />
      {look.freckles && stage !== 'baby' && (
        <g fill={look.skinShade} opacity="0.7">
          {[-1, 1].map((side) => (
            <g key={side}>
              <circle cx={cx + side * rx * 0.5} cy={cy + ry * 0.22} r="0.9" />
              <circle cx={cx + side * rx * 0.42} cy={cy + ry * 0.28} r="0.9" />
              <circle cx={cx + side * rx * 0.58} cy={cy + ry * 0.27} r="0.9" />
            </g>
          ))}
        </g>
      )}

      {/* 코 */}
      {look.shapes.nose === 0 && <circle cx={cx} cy={cy + ry * 0.3} r="1.8" fill={look.skinShade} />}
      {look.shapes.nose === 1 && <path d={`M${cx - 2.5} ${cy + ry * 0.28} Q${cx} ${cy + ry * 0.36} ${cx + 2.5} ${cy + ry * 0.28}`} stroke={look.skinShade} strokeWidth="1.6" fill="none" strokeLinecap="round" />}
      {look.shapes.nose === 2 && <ellipse cx={cx} cy={cy + ry * 0.3} rx="3.2" ry="2.2" fill={look.skinShade} opacity="0.75" />}

      {/* 입 */}
      {look.shapes.mouth === 0 && (
        <path d={`M${cx - 6} ${cy + ry * 0.5} Q${cx} ${cy + ry * 0.5 + 6} ${cx + 6} ${cy + ry * 0.5}`} stroke="#be123c" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {look.shapes.mouth === 1 && (
        <g>
          <path d={`M${cx - 6.5} ${cy + ry * 0.47} Q${cx} ${cy + ry * 0.47 + 10} ${cx + 6.5} ${cy + ry * 0.47} Z`} fill="#9f1239" />
          <ellipse cx={cx} cy={cy + ry * 0.47 + 5} rx="3" ry="1.8" fill="#fb7185" />
        </g>
      )}
      {look.shapes.mouth === 2 && (
        <path
          d={`M${cx - 6} ${cy + ry * 0.5} Q${cx - 3} ${cy + ry * 0.5 + 4} ${cx} ${cy + ry * 0.5} Q${cx + 3} ${cy + ry * 0.5 + 4} ${cx + 6} ${cy + ry * 0.5}`}
          stroke="#be123c"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

/* ── Print (4×6 격자: A · B · 아이 · 닮은 곳 분석) ─────────── */

const SVG_FONT = "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif";

/** 아이·분석 칸의 바탕 — 가족 액자와 같은 크림 → 로즈 그라디언트 (SVG data URL, 3:4) */
const FAMILY_PAPER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7ed"/><stop offset="1" stop-color="#ffe4e6"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/></svg>'
)}`;

const HEART = 'M0 3 C0 -1 5 -2 6 2 C7 -2 12 -1 12 3 C12 7 6 10 6 12 C6 10 0 7 0 3 Z';

function ParentFrame({ color }: { color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <rect x="5" y="5" width="290" height="390" rx="8" fill="none" stroke={color} strokeWidth="10" />
    </svg>
  );
}

function ChildCell({ kids }: { kids: AvatarLook[] }) {
  const twins = kids.length > 1;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" fontFamily={SVG_FONT}>
      <text x="150" y="44" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="4" fill="#fb7185">
        OUR FUTURE FAMILY
      </text>
      {[
        [34, 70, 1.3],
        [252, 64, 1.6],
        [262, 330, 1.2],
      ].map(([x, y, k]) => (
        <path key={`${x}-${y}`} d={HEART} transform={`translate(${x} ${y}) scale(${k})`} fill="#fda4af" />
      ))}
      {kids.map((kid, i) => (
        <svg
          key={kid.gender + i}
          x={twins ? 8 + i * 142 : 45}
          y={twins ? 110 : 76}
          width={twins ? 142 : 210}
          height={twins ? 190 : 280}
          viewBox="0 0 120 160"
        >
          <ChildAvatar look={kid} stage="toddler" />
        </svg>
      ))}
    </svg>
  );
}

function ResemblanceCell({ features, overallA }: { features: ReturnType<typeof analyze>['features']; overallA: number }) {
  const barW = 252;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" fontFamily={SVG_FONT}>
      <text x="24" y="48" fontSize="22" fontWeight="800" fill="#1f2937">
        닮은 곳 분석
      </text>
      <text x="24" y="78" fontSize="13" fontWeight="700" fill={COLOR_A}>
        A 닮음 {overallA}%
      </text>
      <text x="276" y="78" textAnchor="end" fontSize="13" fontWeight="700" fill={COLOR_B}>
        B 닮음 {100 - overallA}%
      </text>
      {features.map((f, i) => {
        const y = 112 + i * 44;
        return (
          <g key={f.id}>
            <text x="24" y={y} fontSize="13" fill="#374151">
              {f.label}
            </text>
            <text x="276" y={y} textAnchor="end" fontSize="12" fontWeight="700" fill={f.a >= 50 ? COLOR_A : COLOR_B}>
              {f.a >= 50 ? `A ${f.a}%` : `B ${f.b}%`}
            </text>
            <rect x="24" y={y + 9} width={barW} height="10" rx="5" fill={COLOR_B} />
            <path d={`M29 ${y + 9} H${24 + (barW * f.a) / 100} V${y + 19} H29 A5 5 0 0 1 29 ${y + 9} Z`} fill={COLOR_A} />
          </g>
        );
      })}
      <text x="150" y="382" textAnchor="middle" fontSize="10" fill="#9ca3af">
        재미로 보는 AI 상상이에요
      </text>
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function ParentPhoto({ capture, label, color }: { capture: CaptureData | undefined; label: string; color: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div className="h-16 w-16 overflow-hidden rounded-full border-[3px] shadow-lg sm:h-24 sm:w-24" style={{ borderColor: color }}>
        {capture ? (
          <ProcessedPhoto src={capture.image} look={PHOTO_LOOK} className="h-full w-full" alt={`${label} 사진`} delayMs={600} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800 text-2xl">🙂</div>
        )}
      </div>
      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
        {label}
      </span>
    </div>
  );
}

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const r = analyze(answers);
  const overallB = 100 - r.overallA;

  return (
    <ResultShell
      eyebrow="AI 미래 가족 상상"
      title={`미래에서 온 우리 ${r.name}`}
      description={`두 분의 얼굴 특징을 섞어 그려 봤어요. 전체적으로 A를 ${r.overallA}%, B를 ${overallB}% 닮았어요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 상상하기"
    >
      {/* 가족 액자 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[28px] p-2 shadow-2xl shadow-black/50"
        style={{ background: 'linear-gradient(135deg, #fcd34d, #b45309 50%, #fde68a)' }}
      >
        <div className="rounded-[22px] bg-gradient-to-b from-[#fff7ed] to-[#ffe4e6] px-4 pb-4 pt-5">
          <p className="text-center text-[10px] font-bold tracking-[0.35em] text-rose-400">OUR FUTURE FAMILY</p>
          <div className="mt-3 flex items-end justify-center gap-0.5 sm:gap-3">
            <ParentPhoto capture={r.a} label="A" color={COLOR_A} />
            <div className="flex items-end">
              {r.kids.map((kid, i) => (
                <motion.div
                  key={kid.gender + i}
                  initial={{ scale: 0.4, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.2, type: 'spring', stiffness: 140, damping: 12 }}
                >
                  <ChildAvatar look={kid} stage="toddler" className={r.kids.length > 1 ? 'h-28 w-[4.5rem] sm:h-36 sm:w-28' : 'h-36 w-28 sm:h-40 sm:w-32'} />
                </motion.div>
              ))}
            </div>
            <ParentPhoto capture={r.b} label="B" color={COLOR_B} />
          </div>
          <div className="mt-2 flex justify-center gap-1 text-lg" aria-hidden="true">
            {['💗', '✨', '💗'].map((e, i) => (
              <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}>
                {e}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 닮은 곳 분석 */}
      <Panel title="닮은 곳 분석">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold">
          <span style={{ color: COLOR_A }}>A 닮음 {r.overallA}%</span>
          <span style={{ color: COLOR_B }}>B 닮음 {overallB}%</span>
        </div>
        <ul className="space-y-3">
          {r.features.map((f, i) => (
            <li key={f.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  {f.emoji} {f.label}
                </span>
                <span className="font-medium" style={{ color: f.a >= 50 ? COLOR_A : COLOR_B }}>
                  {f.a >= 50 ? `A ${f.a}%` : `B ${f.b}%`}
                </span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: COLOR_A }}
                  initial={{ width: '50%' }}
                  animate={{ width: `${f.a}%` }}
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 60, damping: 14 }}
                />
                <div className="h-full flex-1" style={{ backgroundColor: COLOR_B }} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* 성장 타임라인 */}
      <Panel title="성장 타임라인">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { stage: 'baby', label: '아기', age: '1세', note: `첫 걸음마 ${r.predictions.walk}개월`, extra: `첫 단어 “${r.predictions.word}”` },
              { stage: 'toddler', label: '유아', age: '4세', note: '최애 놀이', extra: r.predictions.play },
              { stage: 'kid', label: '어린이', age: '8세', note: '장래희망', extra: r.predictions.dream },
            ] as const
          ).map((item, i) => (
            <motion.div
              key={item.stage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="flex flex-col items-center rounded-2xl bg-slate-950/50 px-1 pb-3 pt-2 text-center"
            >
              <div className="flex">
                {r.kids.map((kid, k) => (
                  <ChildAvatar key={k} look={kid} stage={item.stage} className={r.kids.length > 1 ? 'h-20 w-12' : 'h-24 w-20'} />
                ))}
              </div>
              <p className="mt-1 text-sm font-bold text-white">
                {item.label} <span className="text-xs font-medium text-slate-500">{item.age}</span>
              </p>
              <p className="mt-1 text-[10px] text-slate-500">{item.note}</p>
              <p className="text-[11px] font-medium text-slate-200 [word-break:keep-all]">{item.extra}</p>
            </motion.div>
          ))}
        </div>
      </Panel>

      <TraitChips title="AI가 예측한 성격 키워드" items={r.personality} />
      <p className="max-w-sm text-[11px] leading-relaxed text-slate-500 [word-break:keep-all]">
        재미로 보는 AI 상상이에요. 실제 유전과는 관계가 없고, 사진은 이 브라우저 밖으로 전송되지 않아요.
      </p>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

function familyPrint(answers: DemoAnswers): PrintSpec {
  const r = analyze(answers);
  const parents = [
    { capture: r.a, label: 'A', color: COLOR_A },
    { capture: r.b, label: 'B', color: COLOR_B },
  ].flatMap(({ capture, label, color }) => (capture ? [{ src: capture.image, look: PHOTO_LOOK, label, overlay: <ParentFrame color={color} /> }] : []));
  return {
    kind: 'photo',
    photos: [
      ...parents,
      { src: FAMILY_PAPER, label: `우리 ${r.name} · 4세`, overlay: <ChildCell kids={r.kids} /> },
      { src: FAMILY_PAPER, overlay: <ResemblanceCell features={r.features} overallA={r.overallA} /> },
    ],
    title: `미래에서 온 우리 ${r.name}`,
    caption: `A ${r.overallA}% · B ${100 - r.overallA}% 닮았어요 · ${r.personality.join(' · ')}`,
    paper: 'cream',
  };
}

function computeResult(answers: DemoAnswers): string {
  const r = analyze(answers);
  return r.concept === 'twins' ? 'twins' : r.kids[0]!.gender;
}

export default defineDemo({
  config: {
    id: 'future-family',
    targetSlug: 'ai-future-family',
    industryId: 'wedding',
    analyzeEmoji: '👶',
    analyzeDurationMs: 3800,
    analyzeImageStepId: 'partnerA',
    analyzeMessages: ['두 분의 얼굴 특징 비교 중', '닮은 곳 확률 계산 중', '아기·유아·어린이 모습 그리는 중', '가족 액자 꾸미는 중'],
  },
  steps: [
    cameraStep({
      id: 'partnerA',
      title: '먼저 A님, 카메라를 봐 주세요',
      subtitle: '눈매·코·입매 같은 얼굴 특징을 읽어요',
      mode: 'face',
      subject: 'A님 얼굴',
      scanLabels: ['얼굴 영역 감지', '눈매·코·입매 측정', '피부 톤 추출', '특징 벡터 A 생성'],
    }),
    cameraStep({
      id: 'partnerB',
      title: '이번엔 B님 차례예요',
      subtitle: '두 분의 특징을 섞어 아이의 모습을 상상해요',
      mode: 'face',
      subject: 'B님 얼굴',
      scanLabels: ['얼굴 영역 감지', '눈매·코·입매 측정', '피부 톤 추출', '특징 벡터 B 생성'],
    }),
    choiceStep({
      id: 'concept',
      title: '어떤 아이를 만나보고 싶나요?',
      subtitle: '가족 사진 콘셉트에 반영돼요',
      columns: 2,
      options: (Object.keys(CONCEPTS) as ConceptId[]).map((id) => ({
        id,
        emoji: CONCEPTS[id].emoji,
        label: CONCEPTS[id].label,
        desc: CONCEPTS[id].desc,
      })),
    }),
  ],
  computeResult,
  Result,
  print: familyPrint,
});
