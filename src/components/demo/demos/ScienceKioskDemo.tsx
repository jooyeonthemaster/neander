'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps, DemoStepProps } from '@/types/demo';
import {
  Panel,
  ResultShell,
  TraitChips,
  answersSeed,
  choiceStep,
  defineDemo,
  getChoice,
  getFields,
  seededInt,
  textStep,
  type DemoStepDef,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type TopicId = 'physics' | 'chemistry' | 'biology' | 'earth';
type LevelId = 'elem' | 'middle' | 'high';

interface Topic {
  label: string;
  emoji: string;
  desc: string;
  experiment: string;
  code: string;
  color: string;
  mission: Record<LevelId, string>;
  concept: Record<LevelId, string>;
  links: Record<LevelId, string>;
  terms: string[];
}

const TOPICS: Record<TopicId, Topic> = {
  physics: {
    label: '물리',
    emoji: '🚀',
    desc: '포물선 운동',
    experiment: '발사각과 포물선 운동',
    code: 'PHY',
    color: '#38bdf8',
    mission: {
      elem: '발사 각도를 바꿔서 30m 깃발을 맞혀 보세요!',
      middle: '발사 각도와 속력에 따라 날아가는 거리가 어떻게 달라지는지 비교해 보세요.',
      high: '수평 도달 거리 R = v²·sin2θ / g 가 언제 최대가 되는지 확인해 보세요.',
    },
    concept: {
      elem: '공을 너무 낮게 던지면 금방 떨어지고, 너무 높게 던지면 위로만 올라가요. 비스듬히 45° 근처로 던질 때 가장 멀리 날아가요!',
      middle:
        '던진 물체는 앞으로 나아가면서 중력 때문에 아래로 끌려 포물선을 그려요. 공기 저항이 없다면 45°에서 가장 멀리 날아가고, 30°와 60°처럼 합이 90°인 두 각도는 같은 거리를 날아가요.',
      high:
        '수평 방향은 등속 운동(v·cosθ), 연직 방향은 중력 가속도 g = 9.8 m/s²의 등가속도 운동이에요. 체공 시간 t = 2v·sinθ/g, 수평 도달 거리 R = v²·sin2θ/g 이므로 sin2θ가 최대인 45°에서 R이 가장 커요.',
    },
    links: { elem: '물체의 운동', middle: '운동과 에너지', high: '역학 · 포물선 운동' },
    terms: ['포물선', '중력', '발사각', '수평 도달 거리'],
  },
  chemistry: {
    label: '화학',
    emoji: '🧪',
    desc: '산과 염기',
    experiment: '지시약으로 알아보는 pH',
    code: 'CHM',
    color: '#a3e635',
    mission: {
      elem: '여러 가지 용액을 넣어 보고 색깔이 어떻게 변하는지 관찰해요.',
      middle: 'pH에 따라 만능 지시약의 색이 어떻게 달라지는지 알아봐요.',
      high: '수소 이온 농도 [H⁺]와 pH의 관계(pH = −log[H⁺])를 확인해 보세요.',
    },
    concept: {
      elem: '레몬즙처럼 신맛이 나는 용액은 산성, 비눗물처럼 미끌미끌한 용액은 염기성이에요. 지시약은 용액의 성질에 따라 색깔이 바뀌는 "색깔 탐정"이에요.',
      middle:
        'pH는 0~14 사이의 숫자로 산성과 염기성의 정도를 나타내요. 7은 중성, 7보다 작으면 산성, 크면 염기성이에요. 만능 지시약은 산성에서 붉은색, 중성에서 초록색, 염기성에서 푸른색~보라색을 띠어요.',
      high:
        'pH = −log[H⁺] 이므로 pH가 1 작아지면 수소 이온 농도는 10배 커져요. 지시약은 약산(또는 약염기) 분자로, H⁺와 결합한 형태와 떨어진 형태의 색이 달라서 용액의 pH에 따라 색이 변해요.',
    },
    links: { elem: '산과 염기', middle: '산과 염기의 성질', high: '산·염기와 중화 반응' },
    terms: ['산성', '염기성', '중성', '지시약'],
  },
  biology: {
    label: '생물',
    emoji: '🌱',
    desc: '광합성',
    experiment: '빛의 세기와 광합성',
    code: 'BIO',
    color: '#4ade80',
    mission: {
      elem: '불빛을 밝게 하면 물풀에서 무슨 일이 생길까요? 조명을 조절해 보세요.',
      middle: '빛의 세기와 광합성 속도(산소 기포 수)의 관계를 알아봐요.',
      high: '광포화점을 찾아보세요 — 빛이 세져도 광합성 속도가 거의 늘지 않는 지점이에요.',
    },
    concept: {
      elem: '식물은 햇빛을 받아 스스로 양분을 만들어요. 이때 산소가 나오는데, 물속 식물에서는 작은 기포로 보여요. 빛이 밝을수록 기포가 더 많이 생겨요!',
      middle:
        '광합성은 빛에너지를 이용해 이산화 탄소와 물로 포도당을 만들고 산소를 내놓는 과정이에요. 빛이 셀수록 광합성 속도가 빨라져 산소 기포가 많아지지만, 어느 정도 이상이면 더 늘지 않아요.',
      high:
        '6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O. 빛이 약할 때는 빛의 세기가 제한 요인이지만, 광포화점을 넘으면 CO₂ 농도나 온도가 제한 요인이 되어 광합성 속도가 더 이상 증가하지 않아요.',
    },
    links: { elem: '식물의 구조와 기능', middle: '식물과 에너지', high: '생명 활동과 에너지' },
    terms: ['광합성', '엽록체', '산소', '광포화점'],
  },
  earth: {
    label: '지구과학',
    emoji: '🌋',
    desc: '판 구조론',
    experiment: '움직이는 판과 지형 변화',
    code: 'EAR',
    color: '#fb923c',
    mission: {
      elem: '땅덩어리(판)를 밀고 당겨 보세요. 어떤 일이 일어날까요?',
      middle: '판의 경계에서 어떤 지형과 지각 변동이 생기는지 관찰해요.',
      high: '발산형·수렴형 경계에서 일어나는 지각 변동을 비교해 보세요.',
    },
    concept: {
      elem: '지구의 겉은 여러 조각(판)으로 나뉘어 아주 천천히 움직여요. 판끼리 부딪히면 산이 솟고 지진이 나고, 멀어지면 그 틈으로 마그마가 올라와요.',
      middle:
        '지구 표면은 10여 개의 판으로 이루어져 있고, 맨틀 대류 때문에 1년에 수 cm씩 움직여요. 판의 경계에서는 지진과 화산 활동이 활발해요. 판이 멀어지면 해령, 부딪히면 해구와 습곡 산맥이 생겨요.',
      high:
        '발산형 경계에서는 맨틀 물질이 상승해 새 해양 지각이 만들어지고(해령·열곡대), 수렴형 경계에서는 밀도가 큰 해양판이 섭입하며 해구와 화산대가 생겨요. 대륙판끼리 충돌하면 거대한 습곡 산맥이 형성돼요.',
    },
    links: { elem: '화산과 지진', middle: '지권의 변화', high: '판 구조론' },
    terms: ['판', '맨틀 대류', '해령', '해구'],
  },
};

const LEVELS: Record<LevelId, { label: string; emoji: string; desc: string }> = {
  elem: { label: '초등', emoji: '🐣', desc: '그림과 놀이로 쉽게' },
  middle: { label: '중등', emoji: '📘', desc: '교과 개념까지' },
  high: { label: '고등', emoji: '🎓', desc: '공식과 그래프로 깊게' },
};

/** 실험 스텝이 answers.experiment 에 저장하는 값 */
interface ExperimentData {
  topic: TopicId;
  runs: number;
  /** 대표 조작값 (각도·pH·빛의 세기·판 이동) */
  value: number;
  /** 보조 값 (속력 등) */
  value2?: number;
  headline: string;
  summary: string;
}

function getExperiment(answers: DemoAnswers): ExperimentData | undefined {
  const v = answers.experiment;
  return typeof v === 'object' && v !== null && 'summary' in v ? (v as ExperimentData) : undefined;
}

type Record_ = (d: Omit<ExperimentData, 'topic' | 'runs'>) => void;

/* ── Physics: 포물선 발사 ─────────────────────────────── */

const G = 9.8;
const SCALE = 5.5;
const OX = 20;
const OY = 160;
const TARGET = 30;
/** 깃발 명중으로 치는 거리 오차 (m) */
const HIT_RANGE = 2.5;

function hitsTarget(range: number): boolean {
  return Math.abs(range - TARGET) <= HIT_RANGE;
}

function flight(angle: number, speed: number) {
  const rad = (angle * Math.PI) / 180;
  const vx = speed * Math.cos(rad);
  const vy = speed * Math.sin(rad);
  const T = (2 * vy) / G;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 30; i++) {
    const t = (T * i) / 30;
    pts.push([OX + vx * t * SCALE, OY - (vy * t - 0.5 * G * t * t) * SCALE]);
  }
  return { pts, T, R: (speed * speed * Math.sin(2 * rad)) / G, H: (vy * vy) / (2 * G) };
}

function ProjectileSim({ level, saved, onRecord }: { level: LevelId; saved?: ExperimentData; onRecord: Record_ }) {
  const [angle, setAngle] = useState(saved?.value ?? 30);
  const [speed, setSpeed] = useState(saved?.value2 ?? 18);
  const [shots, setShots] = useState<{ id: number; angle: number; speed: number }[]>([]);
  const [landed, setLanded] = useState<number[]>([]);
  const fixedSpeed = level === 'elem';
  const v = fixedSpeed ? 18 : speed;
  const active = shots[shots.length - 1];
  const flying = active !== undefined && !landed.includes(active.id);

  const launch = () => {
    if (flying) return;
    setShots((s) => [...s.slice(-3), { id: (s[s.length - 1]?.id ?? 0) + 1, angle, speed: v }]);
  };

  const rad = (angle * Math.PI) / 180;
  const last = [...shots].reverse().find((s) => landed.includes(s.id));
  const lastFlight = last ? flight(last.angle, last.speed) : null;
  const hit = lastFlight ? hitsTarget(lastFlight.R) : false;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-sky-950/60 to-slate-950">
        <svg viewBox="0 20 320 160" className="w-full" role="img" aria-label="포물선 발사 시뮬레이션">
          {/* 지면 & 눈금 */}
          <rect x="0" y={OY} width="320" height="20" fill="#14532d" opacity="0.6" />
          {[0, 10, 20, 30, 40, 50].map((m) => (
            <g key={m}>
              <line x1={OX + m * SCALE} x2={OX + m * SCALE} y1={OY} y2={OY + 5} stroke="#94a3b8" strokeWidth="1" />
              <text x={OX + m * SCALE} y={OY + 15} fontSize="8" fill="#94a3b8" textAnchor="middle">
                {m}m
              </text>
            </g>
          ))}
          {/* 목표 깃발 */}
          <g transform={`translate(${OX + TARGET * SCALE}, ${OY})`}>
            <rect x={-2.5 * SCALE} y="-2" width={5 * SCALE} height="2" fill="#facc15" opacity="0.5" />
            <line x1="0" y1="0" x2="0" y2="-26" stroke="#e2e8f0" strokeWidth="1.2" />
            <path d="M0 -26 L14 -21 L0 -16 Z" fill="#f43f5e" />
          </g>
          {/* 지난 궤적 */}
          {shots
            .filter((s) => landed.includes(s.id))
            .map((s, i, arr) => {
              const f = flight(s.angle, s.speed);
              const end = f.pts[f.pts.length - 1]!;
              return (
                <g key={s.id} opacity={i === arr.length - 1 ? 1 : 0.35}>
                  <polyline points={f.pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" />
                  <circle cx={end[0]} cy={end[1]} r="2.5" fill="#38bdf8" />
                  {i === arr.length - 1 && (
                    <text x={end[0]} y={end[1] - 6} fontSize="8" fill="#e0f2fe" textAnchor="middle" fontWeight="bold">
                      {f.R.toFixed(1)}m
                    </text>
                  )}
                </g>
              );
            })}
          {/* 발사대 */}
          <g transform={`translate(${OX}, ${OY}) rotate(${-angle})`}>
            <rect x="0" y="-4" width="22" height="8" rx="2" fill="#cbd5e1" />
            <rect x="18" y="-5" width="6" height="10" rx="1" fill="#64748b" />
          </g>
          <circle cx={OX} cy={OY} r="7" fill="#475569" />
          <path
            d={`M ${OX + 30} ${OY} A 30 30 0 0 0 ${OX + 30 * Math.cos(rad)} ${OY - 30 * Math.sin(rad)}`}
            fill="none"
            stroke="#facc15"
            strokeWidth="1"
          />
          <text x={OX + 34} y={OY - 6} fontSize="8" fill="#facc15">
            {angle}°
          </text>
          {/* 날아가는 공 */}
          {active && flying && (() => {
            const f = flight(active.angle, active.speed);
            return (
              <motion.circle
                key={active.id}
                r="4.5"
                fill="#fde047"
                style={{ filter: 'drop-shadow(0 0 4px #fde047)' }}
                initial={{ cx: f.pts[0]![0], cy: f.pts[0]![1] }}
                animate={{ cx: f.pts.map((p) => p[0]), cy: f.pts.map((p) => p[1]) }}
                transition={{ duration: Math.min(2.2, Math.max(0.9, f.T * 0.45)), ease: 'linear' }}
                onAnimationComplete={() => {
                  setLanded((l) => [...l, active.id]);
                  const ok = hitsTarget(f.R);
                  onRecord({
                    value: active.angle,
                    value2: active.speed,
                    headline: `${f.R.toFixed(1)}m 비행`,
                    summary: `발사각 ${active.angle}°, 속력 ${active.speed}m/s로 쏜 공이 ${f.R.toFixed(1)}m 날아갔어요 (최고 높이 ${f.H.toFixed(1)}m)${ok ? ' — 30m 깃발 명중!' : ''}`,
                  });
                }}
              />
            );
          })()}
        </svg>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 flex justify-between text-xs text-slate-400">
              <span>🎯 발사 각도</span>
              <span className="font-mono text-sky-300">{angle}°</span>
            </span>
            <input type="range" min={10} max={80} step={1} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-sky-400" />
          </label>
          {!fixedSpeed && (
            <label className="block">
              <span className="mb-1 flex justify-between text-xs text-slate-400">
                <span>💨 처음 속력</span>
                <span className="font-mono text-sky-300">{speed} m/s</span>
              </span>
              <input type="range" min={10} max={22} step={1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-sky-400" />
            </label>
          )}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={launch}
          disabled={flying}
          className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/20 disabled:opacity-50"
        >
          🚀 발사!
        </motion.button>
      </div>

      {lastFlight && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: '비행 거리', value: `${lastFlight.R.toFixed(1)}m` },
            { label: '최고 높이', value: `${lastFlight.H.toFixed(1)}m` },
            { label: '체공 시간', value: `${lastFlight.T.toFixed(1)}초` },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-slate-800 bg-slate-900/60 px-2 py-2">
              <p className="text-[10px] text-slate-500">{m.label}</p>
              <p className="font-mono text-sm font-bold text-sky-300">{m.value}</p>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {hit && (
          <motion.p
            key={last?.id}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm font-bold text-amber-300"
          >
            🎯 30m 깃발 명중!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Chemistry: pH & 지시약 ───────────────────────────── */

const PH_STOPS = [
  { ph: 0, color: '#b91c1c', name: '빨간색' },
  { ph: 2, color: '#ef4444', name: '빨간색' },
  { ph: 3, color: '#f97316', name: '주황색' },
  { ph: 5, color: '#facc15', name: '노란색' },
  { ph: 6, color: '#a3e635', name: '연두색' },
  { ph: 7, color: '#22c55e', name: '초록색' },
  { ph: 8, color: '#14b8a6', name: '청록색' },
  { ph: 9, color: '#0ea5e9', name: '파란색' },
  { ph: 11, color: '#4f46e5', name: '남색' },
  { ph: 14, color: '#7e22ce', name: '보라색' },
];

const SUBSTANCES = [
  { name: '레몬즙', ph: 2 },
  { name: '식초', ph: 3 },
  { name: '우유', ph: 6.5 },
  { name: '증류수', ph: 7 },
  { name: '베이킹소다', ph: 8.5 },
  { name: '비눗물', ph: 10 },
  { name: '표백제', ph: 12.5 },
];

function substanceAt(ph: number) {
  return SUBSTANCES.find((s) => Math.abs(s.ph - ph) < 0.5);
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) + ((((pb >> shift) & 255) - ((pa >> shift) & 255)) * t));
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

function indicator(ph: number) {
  for (let i = 0; i < PH_STOPS.length - 1; i++) {
    const a = PH_STOPS[i]!;
    const b = PH_STOPS[i + 1]!;
    if (ph <= b.ph) {
      const t = (ph - a.ph) / (b.ph - a.ph);
      return { color: mix(a.color, b.color, t), name: t < 0.5 ? a.name : b.name };
    }
  }
  return { color: '#7e22ce', name: '보라색' };
}

function phClass(ph: number): string {
  if (ph < 3) return '강한 산성';
  if (ph < 7) return '산성';
  if (ph === 7) return '중성';
  if (ph <= 11) return '염기성';
  return '강한 염기성';
}

const SUPER: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

function hConcentration(ph: number): string {
  const [mant, exp] = (10 ** -ph).toExponential(1).split('e');
  const e = String(Number(exp)).split('').map((c) => SUPER[c] ?? c).join('');
  return mant === '1.0' ? `10${e}` : `${mant} × 10${e}`;
}

const PH_GRADIENT = `linear-gradient(90deg, ${PH_STOPS.map((s) => `${s.color} ${(s.ph / 14) * 100}%`).join(', ')})`;

function PhSim({ level, saved, onRecord }: { level: LevelId; saved?: ExperimentData; onRecord: Record_ }) {
  const [ph, setPh] = useState(saved?.value ?? 7);
  const [drops, setDrops] = useState(0);
  const ind = indicator(ph);
  const substance = substanceAt(ph);

  const change = (next: number) => {
    setPh(next);
    setDrops((d) => d + 1);
    const i = indicator(next);
    const sub = substanceAt(next);
    onRecord({
      value: next,
      headline: `pH ${next} · ${phClass(next)}`,
      summary: `${sub ? `${sub.name}(pH ${next})` : `pH ${next} 용액`}을 넣었더니 지시약이 ${i.name}으로 변했어요 — ${phClass(next)}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
        <svg viewBox="0 0 200 180" className="w-40 shrink-0 sm:w-48" role="img" aria-label={`비커 속 지시약 색: ${ind.name}`}>
          <defs>
            <clipPath id="beaker-inside">
              <path d="M52 30 L52 150 Q52 163 65 163 L135 163 Q148 163 148 150 L148 30 Z" />
            </clipPath>
          </defs>
          {/* 스포이트 */}
          <rect x="94" y="0" width="12" height="16" rx="3" fill="#e2e8f0" opacity="0.8" />
          <path d="M96 16 L104 16 L101 30 L99 30 Z" fill="#cbd5e1" />
          <motion.circle
            key={drops}
            cx="100"
            r="3.5"
            fill={ind.color}
            initial={{ cy: 32, opacity: drops ? 1 : 0 }}
            animate={{ cy: 72, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
          />
          <g clipPath="url(#beaker-inside)">
            <rect x="40" y="70" width="120" height="100" style={{ fill: ind.color, transition: 'fill 0.6s ease' }} opacity="0.85" />
            <motion.ellipse
              key={`r${drops}`}
              cx="100"
              cy="72"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              initial={{ rx: 2, ry: 1, opacity: drops ? 0.9 : 0 }}
              animate={{ rx: 40, ry: 5, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
            />
            <rect x="40" y="70" width="120" height="6" fill="#ffffff" opacity="0.18" />
          </g>
          <path d="M48 26 L52 30 L52 150 Q52 163 65 163 L135 163 Q148 163 148 150 L148 30 L152 26" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinejoin="round" />
          {[90, 110, 130, 150].map((y) => (
            <line key={y} x1="52" x2="62" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" opacity="0.6" />
          ))}
          <rect x="60" y="36" width="5" height="100" rx="2.5" fill="#ffffff" opacity="0.15" />
        </svg>
        <div className="min-w-0 flex-1 space-y-2 text-left">
          <p className="text-xs text-slate-500">현재 용액</p>
          <p className="whitespace-nowrap font-display text-2xl font-extrabold text-white sm:text-3xl">pH {ph}</p>
          <p className="text-sm font-semibold" style={{ color: ind.color }}>
            {phClass(ph)} · {ind.name}
          </p>
          {substance && <p className="text-xs text-slate-400">≈ {substance.name}</p>}
          {level === 'high' && (
            <p className="font-mono text-[11px] text-slate-400">
              [H⁺] = {hConcentration(ph)} mol/L
            </p>
          )}
        </div>
      </div>

      <div>
        <input
          type="range"
          min={0}
          max={14}
          step={0.5}
          value={ph}
          onChange={(e) => change(Number(e.target.value))}
          aria-label="pH"
          className="w-full accent-lime-400"
        />
        <div className="mt-1 h-2.5 rounded-full" style={{ background: PH_GRADIENT }} />
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>0 · 산성</span>
          <span>7 · 중성</span>
          <span>염기성 · 14</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {SUBSTANCES.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => change(s.ph)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              substance?.name === s.name ? 'border-lime-400 bg-lime-400/15 text-lime-200' : 'border-slate-700 text-slate-300 hover:border-slate-500'
            )}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Biology: 광합성 기포 ─────────────────────────────── */

/** 빛의 세기(%)가 이 이상이면 광포화 구간으로 본다 */
const NEAR_SATURATION = 80;

function o2Rate(light: number): number {
  return Math.round(40 * (1 - Math.exp(-light / 28)));
}

function PhotosynthesisSim({ level, saved, onRecord }: { level: LevelId; saved?: ExperimentData; onRecord: Record_ }) {
  const [light, setLight] = useState(saved?.value ?? 20);
  const rate = o2Rate(light);
  const count = Math.min(10, Math.round(rate / 4));
  const tips = [
    [196, 78],
    [172, 96],
    [226, 92],
  ] as const;

  const change = (next: number) => {
    setLight(next);
    const r = o2Rate(next);
    onRecord({
      value: next,
      headline: `산소 기포 ${r}개/분`,
      summary: `빛의 세기를 ${next}%로 맞추자 검정말에서 산소 기포가 1분에 ${r}개씩 나왔어요${next >= NEAR_SATURATION ? ' — 광포화에 가까워요' : ''}`,
    });
  };

  // 광합성 속도 곡선 (0–100)
  const curve = Array.from({ length: 21 }, (_, i) => {
    const x = i * 5;
    return `${20 + x * 2.8},${56 - (o2Rate(x) / 40) * 46}`;
  }).join(' ');

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
        <svg viewBox="0 0 320 190" className="w-full" role="img" aria-label={`빛의 세기 ${light}%, 산소 기포 1분에 ${rate}개`}>
          <defs>
            <linearGradient id="bio-beam" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fde047" stopOpacity={0.55 * (light / 100)} />
              <stop offset="1" stopColor="#fde047" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* 조명 */}
          <polygon points="58,34 120,44 290,180 110,180" fill="url(#bio-beam)" />
          <rect x="20" y="16" width="40" height="18" rx="4" fill="#475569" />
          <circle cx="54" cy="34" r="9" fill="#fde047" opacity={0.15 + (light / 100) * 0.85} style={{ filter: `drop-shadow(0 0 ${light / 6}px #fde047)` }} />
          <text x="40" y="58" fontSize="9" fill="#fde68a" textAnchor="middle">
            {light}%
          </text>
          {/* 수조 */}
          <rect x="110" y="44" width="190" height="136" rx="6" fill="#0ea5e9" opacity="0.18" />
          <rect x="110" y="44" width="190" height="136" rx="6" fill="none" stroke="#bae6fd" strokeWidth="1.5" opacity="0.6" />
          <line x1="110" y1="52" x2="300" y2="52" stroke="#e0f2fe" strokeWidth="1" opacity="0.5" />
          {/* 검정말 */}
          <g stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M200 178 C196 150 204 120 196 78" />
            <path d="M200 178 C186 150 180 120 172 96" />
            <path d="M202 178 C214 150 222 120 226 92" />
          </g>
          <g fill="#22c55e">
            {[
              [196, 90, -30], [199, 108, 30], [197, 128, -30], [201, 148, 30],
              [176, 104, -40], [180, 124, 35], [186, 146, -35],
              [224, 100, 40], [220, 122, -30], [214, 146, 35],
            ].map(([x, y, r], i) => (
              <ellipse key={i} cx={x} cy={y} rx="7" ry="2.6" transform={`rotate(${r} ${x} ${y})`} />
            ))}
          </g>
          {/* 산소 기포 */}
          {Array.from({ length: count }, (_, i) => {
            const [tx, ty] = tips[i % tips.length]!;
            const dur = 2.2;
            return (
              <motion.circle
                key={`${count}-${i}`}
                cx={tx + ((i * 5) % 7) - 3}
                r={1.8 + (i % 3) * 0.6}
                fill="#e0f2fe"
                stroke="#ffffff"
                strokeWidth="0.5"
                initial={{ cy: ty, opacity: 0 }}
                animate={{ cy: [ty, 52], opacity: [0, 0.95, 0.9, 0] }}
                transition={{ duration: dur, repeat: Infinity, delay: (i * dur) / Math.max(1, count), ease: 'easeIn' }}
              />
            );
          })}
          <text x="205" y="68" fontSize="9" fill="#e0f2fe" textAnchor="middle" fontWeight="bold">
            O₂ {rate}개/분
          </text>
        </svg>
      </div>

      <label className="block">
        <span className="mb-1 flex justify-between text-xs text-slate-400">
          <span>💡 빛의 세기</span>
          <span className="font-mono text-green-300">{light}%</span>
        </span>
        <input type="range" min={0} max={100} step={5} value={light} onChange={(e) => change(Number(e.target.value))} className="w-full accent-green-400" />
      </label>

      {level !== 'elem' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="mb-1 text-[11px] text-slate-400">빛의 세기에 따른 광합성 속도</p>
          <svg viewBox="0 0 320 70" className="w-full" aria-hidden="true">
            <line x1="20" y1="58" x2="305" y2="58" stroke="#334155" />
            <line x1="20" y1="6" x2="20" y2="58" stroke="#334155" />
            <polyline points={curve} fill="none" stroke="#4ade80" strokeWidth="2" />
            {level === 'high' && (
              <>
                <line x1={20 + NEAR_SATURATION * 2.8} x2={20 + NEAR_SATURATION * 2.8} y1="6" y2="58" stroke="#facc15" strokeDasharray="3 3" strokeWidth="1" />
                <text x={20 + NEAR_SATURATION * 2.8} y="68" fontSize="8" fill="#facc15" textAnchor="middle">
                  광포화 구간
                </text>
              </>
            )}
            <circle cx={20 + light * 2.8} cy={56 - (rate / 40) * 46} r="4" fill="#ffffff" stroke="#4ade80" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ── Earth: 판의 이동 ─────────────────────────────────── */

/** 슬라이더 값 → 1년에 움직이는 거리 (cm) */
function plateSpeed(v: number): string {
  return (Math.abs(v) / 10).toFixed(1);
}

function plateInfo(v: number) {
  const speed = plateSpeed(v);
  if (v <= -15) {
    return {
      type: '발산형 경계',
      feature: '해령 · 열곡대',
      example: '대서양 중앙 해령, 동아프리카 열곡대',
      summary: `두 판이 1년에 ${speed}cm씩 멀어지자 틈으로 마그마가 올라와 새로운 해양 지각(해령)이 만들어졌어요`,
    };
  }
  if (v >= 15) {
    const big = v >= 50;
    return {
      type: '수렴형 경계',
      feature: big ? '해구 · 화산 · 습곡 산맥' : '해구 · 지진대',
      example: '페루–칠레 해구, 안데스 산맥',
      summary: `두 판이 1년에 ${speed}cm씩 부딪히자 해양판이 섭입하며 해구와 ${big ? '화산·습곡 산맥' : '지진대'}가 만들어졌어요`,
    };
  }
  return { type: '거의 정지', feature: '변화 없음', example: '', summary: '' };
}

const QUAKES = [
  [150, 118],
  [138, 132],
  [162, 128],
  [128, 110],
  [170, 140],
] as const;

function PlateSim({ saved, onRecord }: { level: LevelId; saved?: ExperimentData; onRecord: Record_ }) {
  const [v, setV] = useState(saved?.value ?? 0);
  const info = plateInfo(v);
  const diverge = v <= -15;
  const converge = v >= 15;
  const gap = diverge ? Math.abs(v) * 0.22 : 0;
  const push = converge ? v * 0.12 : 0;
  const mountain = converge ? v * 0.5 : 0;
  const dip = converge ? 20 + v * 0.35 : 0;

  const change = (next: number) => {
    setV(next);
    const i = plateInfo(next);
    if (!i.summary) return;
    onRecord({ value: next, headline: `${i.type} · ${i.feature}`, summary: i.summary });
  };

  const seismo = Array.from({ length: 80 }, (_, i) => {
    const amp = (Math.abs(v) / 100) * 14 * (0.3 + (((i * 37) % 10) / 10) * 0.7);
    return `${i * 5},${16 + Math.sin(i * 1.9) * amp}`;
  }).join(' ');

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
        <svg viewBox="0 0 320 190" className="w-full" role="img" aria-label={`판의 이동: ${info.type}`}>
          <defs>
            <linearGradient id="earth-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0c4a6e" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="earth-mantle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ea580c" />
              <stop offset="1" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          <rect width="320" height="92" fill="url(#earth-sky)" opacity="0.5" />
          {/* 맨틀 + 대류 */}
          <rect y="120" width="320" height="70" fill="url(#earth-mantle)" />
          {Math.abs(v) >= 15 && (
            <g fill="none" stroke="#fed7aa" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.7">
              <motion.path
                d={diverge ? 'M160 176 C160 140 100 136 60 150' : 'M40 150 C90 132 140 140 150 176'}
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 1.2 - Math.abs(v) / 200, repeat: Infinity, ease: 'linear' }}
              />
              <motion.path
                d={diverge ? 'M160 176 C160 140 220 136 260 150' : 'M280 150 C230 132 180 140 170 176'}
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 1.2 - Math.abs(v) / 200, repeat: Infinity, ease: 'linear' }}
              />
            </g>
          )}
          {/* 바다 (오른쪽 해양판 위) */}
          <rect x={160 + gap / 2 - push} y="76" width="200" height="20" fill="#0284c7" opacity="0.55" />

          {/* 발산: 마그마 & 해령 */}
          {diverge && (
            <>
              <rect x={160 - gap / 2 - 1} y="88" width={gap + 2} height="36" fill="#f97316" />
              <motion.rect
                x={160 - gap / 2}
                y="88"
                width={gap}
                height="36"
                fill="#fde047"
                animate={{ opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <path d={`M${160 - gap / 2 - 18} 96 Q160 ${96 - Math.abs(v) * 0.14} ${160 + gap / 2 + 18} 96`} fill="#57534e" />
            </>
          )}

          {/* 왼쪽 대륙판 */}
          <g transform={`translate(${-gap / 2 + push * 0.3}, 0)`}>
            <rect x="0" y="92" width="160" height="30" fill="#a16207" />
            <rect x="0" y="88" width="160" height="6" fill="#65a30d" />
            {converge && (
              <>
                <path d={`M70 90 L${112} ${90 - mountain} L${150} 90 Z`} fill="#78716c" />
                <path d={`M${104} ${90 - mountain * 0.8} L112 ${90 - mountain} L${120} ${90 - mountain * 0.8} Z`} fill="#f8fafc" opacity={mountain > 25 ? 0.9 : 0} />
                {v >= 50 && (
                  <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    <circle cx="112" cy={84 - mountain} r="5" fill="#94a3b8" />
                    <circle cx="118" cy={76 - mountain} r="7" fill="#94a3b8" opacity="0.7" />
                    <circle cx="112" cy={90 - mountain + 2} r="3" fill="#f97316" />
                  </motion.g>
                )}
              </>
            )}
          </g>

          {/* 오른쪽 해양판 (수렴 시 섭입) */}
          <g transform={`translate(${gap / 2 - push}, 0)`}>
            {converge ? (
              <path
                d={`M320 96 L166 96 C150 96 140 ${100 + dip * 0.4} ${130} ${108 + dip} L${138} ${122 + dip} C150 ${114 + dip * 0.4} 158 118 170 118 L320 118 Z`}
                fill="#57534e"
              />
            ) : (
              <rect x="160" y="96" width="160" height="22" fill="#57534e" />
            )}
          </g>

          {/* 지진 */}
          {Math.abs(v) >= 15 &&
            QUAKES.slice(0, Math.ceil(Math.abs(v) / 25)).map(([x, y], i) => (
              <motion.text
                key={i}
                x={x}
                y={y}
                fontSize="10"
                textAnchor="middle"
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.25 }}
              >
                💥
              </motion.text>
            ))}

          {/* 방향 화살표 */}
          {Math.abs(v) >= 15 && (
            <g fontSize="16" fill="#ffffff" fontWeight="bold">
              <text x="40" y="112">{diverge ? '◀' : '▶'}</text>
              <text x="266" y="112">{diverge ? '▶' : '◀'}</text>
            </g>
          )}
          <text x="10" y="186" fontSize="8" fill="#fed7aa">맨틀</text>
          <text x="10" y="84" fontSize="8" fill="#e2e8f0">대륙판</text>
          <text x="276" y="72" fontSize="8" fill="#e2e8f0">해양판</text>
        </svg>
        <svg viewBox="0 0 320 32" className="w-full border-t border-slate-800 bg-slate-950" aria-hidden="true">
          <motion.polyline
            points={seismo}
            fill="none"
            stroke="#f87171"
            strokeWidth="1.2"
            animate={{ x: [0, -60] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <text x="4" y="10" fontSize="7" fill="#64748b">지진계</text>
        </svg>
      </div>

      <label className="block">
        <span className="mb-1 flex justify-between text-xs text-slate-400">
          <span>◀ 멀어지게</span>
          <span className="font-mono text-orange-300">
            {v === 0 ? '정지' : `${v < 0 ? '발산' : '수렴'} · 연 ${plateSpeed(v)}cm`}
          </span>
          <span>부딪히게 ▶</span>
        </span>
        <input type="range" min={-100} max={100} step={5} value={v} onChange={(e) => change(Number(e.target.value))} className="w-full accent-orange-400" />
      </label>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left">
        <p className="text-sm font-semibold text-white">
          {info.type}
          {info.feature !== '변화 없음' && <span className="ml-2 text-orange-300">→ {info.feature}</span>}
        </p>
        <p className="mt-1 text-xs text-slate-400">{info.example ? `실제 예: ${info.example}` : '슬라이더를 좌우로 움직여 판을 밀고 당겨 보세요.'}</p>
      </div>
    </div>
  );
}

/* ── Experiment step (custom) ──────────────────────────── */

function ExperimentStep({ answers, onUpdate }: DemoStepProps) {
  const topicId = (getChoice(answers, 'topic') as TopicId | undefined) ?? 'physics';
  const levelId = (getChoice(answers, 'level') as LevelId | undefined) ?? 'middle';
  const topic = TOPICS[topicId];
  const current = getExperiment(answers);
  const saved = current?.topic === topicId ? current : undefined;

  const record: Record_ = (d) => onUpdate('experiment', { ...d, topic: topicId, runs: (saved?.runs ?? 0) + 1 } satisfies ExperimentData);

  return (
    <div className="mx-auto max-w-lg space-y-4 text-left">
      <div className="flex items-start gap-3 rounded-2xl border p-4" style={{ borderColor: `${topic.color}55`, backgroundColor: `${topic.color}12` }}>
        <span className="text-3xl leading-none">{topic.emoji}</span>
        <div>
          <p className="text-xs font-semibold" style={{ color: topic.color }}>
            {topic.label} · {LEVELS[levelId].label} 과정 · {topic.experiment}
          </p>
          <p className="mt-1 text-sm text-slate-200 [word-break:keep-all]">{topic.mission[levelId]}</p>
        </div>
      </div>

      {topicId === 'physics' && <ProjectileSim level={levelId} saved={saved} onRecord={record} />}
      {topicId === 'chemistry' && <PhSim level={levelId} saved={saved} onRecord={record} />}
      {topicId === 'biology' && <PhotosynthesisSim level={levelId} saved={saved} onRecord={record} />}
      {topicId === 'earth' && <PlateSim level={levelId} saved={saved} onRecord={record} />}

      <AnimatePresence mode="wait">
        {saved ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-teal-500/10 px-4 py-2.5 text-xs text-teal-200 [word-break:keep-all]"
          >
            ✅ 실험 기록 완료 — {saved.summary}
          </motion.p>
        ) : (
          <motion.p key="todo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-slate-500">
            👆 직접 조작해 실험하면 다음 단계로 넘어갈 수 있어요
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const experimentStep: DemoStepDef = {
  meta: {
    id: 'experiment',
    titleKey: '터치로 직접 실험해 보세요',
    subtitleKey: '조작하고 관찰하면 AI 선생님이 원리를 설명해 줘요',
    canProceed: (a) => {
      const d = getExperiment(a);
      return !!d && d.topic === ((getChoice(a, 'topic') as TopicId | undefined) ?? 'physics') && d.runs > 0;
    },
  },
  Component: ExperimentStep,
};

/* ── Result ────────────────────────────────────────────── */

function ResultGraph({ topicId, data, color }: { topicId: TopicId; data: ExperimentData; color: string }) {
  if (topicId === 'physics') {
    const speed = data.value2 ?? 18;
    const pts = Array.from({ length: 19 }, (_, i) => {
      const a = 5 + i * 5;
      return `${20 + a * 3.1},${70 - ((speed * speed * Math.sin((2 * a * Math.PI) / 180)) / G / 50) * 60}`;
    }).join(' ');
    const r = (speed * speed * Math.sin((2 * data.value * Math.PI) / 180)) / G;
    return (
      <svg viewBox="0 0 320 86" className="w-full" aria-label="발사각에 따른 비행 거리 그래프">
        <line x1="20" y1="70" x2="305" y2="70" stroke="#334155" />
        <line x1="20" y1={70 - (TARGET / 50) * 60} x2="305" y2={70 - (TARGET / 50) * 60} stroke="#f43f5e" strokeDasharray="3 3" opacity="0.6" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
        <circle cx={20 + data.value * 3.1} cy={70 - (r / 50) * 60} r="4.5" fill="#fff" stroke={color} strokeWidth="2" />
        {[15, 30, 45, 60, 75, 90].map((a) => (
          <text key={a} x={20 + a * 3.1} y="82" fontSize="8" fill="#64748b" textAnchor="middle">
            {a}°
          </text>
        ))}
        <text x="300" y={66 - (TARGET / 50) * 60} fontSize="7" fill="#fb7185" textAnchor="end">
          목표 30m
        </text>
      </svg>
    );
  }
  if (topicId === 'chemistry') {
    return (
      <div className="px-1 pt-2">
        <div className="relative h-4 rounded-full" style={{ background: PH_GRADIENT }}>
          <motion.span
            className="absolute -top-1.5 h-7 w-1.5 -translate-x-1/2 rounded-full bg-white shadow"
            initial={{ left: '50%' }}
            animate={{ left: `${(data.value / 14) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>
    );
  }
  if (topicId === 'biology') {
    const curve = Array.from({ length: 21 }, (_, i) => `${20 + i * 5 * 2.8},${60 - (o2Rate(i * 5) / 40) * 50}`).join(' ');
    return (
      <svg viewBox="0 0 320 78" className="w-full" aria-label="빛의 세기와 광합성 속도 그래프">
        <line x1="20" y1="60" x2="305" y2="60" stroke="#334155" />
        <polyline points={curve} fill="none" stroke={color} strokeWidth="2" />
        <circle cx={20 + data.value * 2.8} cy={60 - (o2Rate(data.value) / 40) * 50} r="4.5" fill="#fff" stroke={color} strokeWidth="2" />
        <text x="20" y="74" fontSize="8" fill="#64748b">빛 0%</text>
        <text x="300" y="74" fontSize="8" fill="#64748b" textAnchor="end">빛 100%</text>
      </svg>
    );
  }
  return (
    <div className="px-1 pt-2">
      <div className="relative flex h-6 overflow-hidden rounded-full text-[10px] font-semibold">
        <span className="flex flex-[85] items-center justify-center bg-sky-500/30 text-sky-200">발산형</span>
        <span className="flex flex-[30] items-center justify-center bg-slate-700/50 text-slate-300">정지</span>
        <span className="flex flex-[85] items-center justify-center bg-orange-500/30 text-orange-200">수렴형</span>
        <motion.span
          className="absolute inset-y-0 w-1.5 -translate-x-1/2 bg-white"
          initial={{ left: '50%' }}
          animate={{ left: `${((data.value + 100) / 200) * 100}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

/** 인증서에 들어가는 정보 — 화면과 출력물이 같이 쓴다 */
function certInfo(answers: DemoAnswers) {
  const topicId = (getChoice(answers, 'topic') as TopicId | undefined) ?? 'physics';
  const levelId = (getChoice(answers, 'level') as LevelId | undefined) ?? 'middle';
  const fields = getFields<string>(answers, 'cert');
  return {
    topicId,
    levelId,
    topic: TOPICS[topicId],
    level: LEVELS[levelId],
    data: getExperiment(answers),
    name: (fields.name ?? '').trim() || '탐험가',
    school: (fields.school ?? '').trim(),
    serial: String(seededInt(answersSeed(answers), 'cert', 1, 9999)).padStart(4, '0'),
  };
}

function certStatement(topic: Topic): string {
  return `위 사람은 AI 과학 체험 키오스크에서 「${topic.experiment}」 실험을 스스로 조작하고 관찰하며 끝까지 탐구하였기에 이 인증서를 드립니다.`;
}

/** 출력물용 — 실험별 대표 측정값(크게)과 측정 기록 */
function experimentReadout(topicId: TopicId, levelId: LevelId, data: ExperimentData): { big: string; rows: { label: string; value: string }[] } {
  if (topicId === 'physics') {
    const speed = data.value2 ?? 18;
    const f = flight(data.value, speed);
    return {
      big: `${f.R.toFixed(1)}m`,
      rows: [
        { label: '발사 각도', value: `${data.value}°` },
        { label: '처음 속력', value: `${speed} m/s` },
        { label: '최고 높이', value: `${f.H.toFixed(1)}m` },
        { label: '체공 시간', value: `${f.T.toFixed(1)}초` },
        { label: `${TARGET}m 깃발`, value: hitsTarget(f.R) ? '명중!' : `${Math.abs(f.R - TARGET).toFixed(1)}m 차이` },
      ],
    };
  }
  if (topicId === 'chemistry') {
    const ph = data.value;
    const substance = substanceAt(ph);
    return {
      big: `pH ${ph}`,
      rows: [
        { label: '성질', value: phClass(ph) },
        { label: '지시약 색', value: indicator(ph).name },
        ...(substance ? [{ label: '비슷한 용액', value: substance.name }] : []),
        ...(levelId === 'high' ? [{ label: '[H⁺]', value: `${hConcentration(ph)} mol/L` }] : []),
      ],
    };
  }
  if (topicId === 'biology') {
    const rate = o2Rate(data.value);
    return {
      big: `O₂ ${rate}개/분`,
      rows: [
        { label: '빛의 세기', value: `${data.value}%` },
        { label: '산소 기포', value: `1분에 ${rate}개` },
        { label: '광합성', value: data.value >= NEAR_SATURATION ? '광포화에 가까워요' : '빛이 셀수록 늘어요' },
      ],
    };
  }
  const info = plateInfo(data.value);
  return {
    big: info.type,
    rows: [
      { label: '판의 이동', value: `${data.value < 0 ? '멀어짐' : '부딪힘'} · 연 ${plateSpeed(data.value)}cm` },
      { label: '생긴 지형', value: info.feature },
      ...(info.example ? [{ label: '실제 예', value: info.example }] : []),
    ],
  };
}

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const { topicId, levelId, topic, level, data, name, school, serial } = certInfo(answers);
  const [today] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
  });

  return (
    <ResultShell
      eyebrow={`${topic.label} · ${level.label} 과정 체험 완료`}
      title={`${name}님, 실험 성공!`}
      description={data?.summary}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 실험 하기"
    >
      {/* 인증서 */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md bg-[#fffdf7] p-2.5 text-slate-800 shadow-2xl shadow-black/50"
      >
        <div className="relative border-[3px] border-double p-5 sm:p-6" style={{ borderColor: pillarColor }}>
          {['left-1 top-1', 'right-1 top-1 rotate-90', 'bottom-1 right-1 rotate-180', 'bottom-1 left-1 -rotate-90'].map((pos) => (
            <svg key={pos} className={cn('absolute h-5 w-5', pos)} viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2 18 V2 H18" fill="none" stroke={pillarColor} strokeWidth="2" />
              <circle cx="6" cy="6" r="2" fill={pillarColor} />
            </svg>
          ))}
          <p className="text-center text-[10px] font-semibold tracking-[0.35em] text-slate-500">NEANDER SCIENCE LAB</p>
          <h3 className="mt-1 text-center font-serif text-3xl font-bold tracking-[0.2em] text-slate-900">체험 인증서</h3>
          <p className="text-center font-serif text-[10px] italic tracking-widest text-slate-500">Certificate of Discovery</p>
          <p className="mt-3 text-center font-mono text-[10px] text-slate-400">
            제 {today.y}-{topic.code}-{serial} 호
          </p>

          <dl className="mt-4 space-y-1.5 text-sm">
            {[
              { k: '성명', v: name },
              ...(school ? [{ k: '소속', v: school }] : []),
              { k: '과정', v: `${topic.emoji} ${topic.label} · ${level.label} (${topic.experiment})` },
            ].map((row) => (
              <div key={row.k} className="flex gap-3 border-b border-dashed border-slate-300 pb-1.5">
                <dt className="w-10 shrink-0 text-slate-500">{row.k}</dt>
                <dd className="font-semibold text-slate-900 [word-break:keep-all]">{row.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-lg px-3 py-2.5" style={{ backgroundColor: `${pillarColor}14` }}>
            <p className="text-[11px] font-bold" style={{ color: pillarColor }}>
              실험 결과 · {data?.headline}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-700 [word-break:keep-all]">{data?.summary}</p>
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-slate-600 [word-break:keep-all]">{certStatement(topic)}</p>

          <div className="mt-5 flex items-end justify-between">
            <div className="text-left">
              <p className="font-serif text-sm font-semibold text-slate-800">
                {today.y}년 {today.m}월 {today.d}일
              </p>
              <p className="mt-1 text-[11px] text-slate-500">AI 과학 선생님 N-BOT</p>
            </div>
            <motion.svg
              viewBox="0 0 80 80"
              className="h-20 w-20"
              initial={{ scale: 2.2, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 0.9, rotate: -12 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 260, damping: 14 }}
              aria-label="인증 도장"
            >
              <defs>
                <path id="seal-ring" d="M40 40 m-29 0 a29 29 0 1 1 58 0 a29 29 0 1 1 -58 0" />
              </defs>
              <circle cx="40" cy="40" r="37" fill="none" stroke={pillarColor} strokeWidth="2.5" />
              <circle cx="40" cy="40" r="22" fill="none" stroke={pillarColor} strokeWidth="1" />
              <text fontSize="7" fontWeight="bold" fill={pillarColor} letterSpacing="0.8">
                <textPath href="#seal-ring">NEANDER SCIENCE LAB · CERTIFIED ·</textPath>
              </text>
              <text x="40" y="45" textAnchor="middle" fontSize="16">
                {topic.emoji}
              </text>
            </motion.svg>
          </div>
        </div>
      </motion.div>

      {data && (
        <Panel title="나의 실험 데이터">
          <ResultGraph topicId={topicId} data={data} color={topic.color} />
        </Panel>
      )}

      <Panel title={`AI 선생님의 개념 설명 · ${level.label}`}>
        <p className="text-sm leading-relaxed text-slate-200 [word-break:keep-all]">{topic.concept[levelId]}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
          <span className="text-xs text-slate-500">연계 주제</span>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${pillarColor}25`, color: pillarColor }}>
            {level.label} · {topic.links[levelId]}
          </span>
        </div>
      </Panel>

      <TraitChips title="오늘 배운 핵심 용어" items={topic.terms} />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'science-kiosk',
    targetSlug: 'ai-science-kiosk',
    industryId: 'education',
    analyzeEmoji: '🔬',
    analyzeDurationMs: 3200,
    analyzeMessages: ['실험 데이터 정리 중', '과학 원리 설명 생성 중', '난이도별 해설 맞추는 중', '체험 인증서 발급 중'],
  },
  steps: [
    choiceStep({
      id: 'topic',
      title: '어떤 과학을 탐구해 볼까요?',
      subtitle: '주제마다 다른 인터랙티브 실험이 준비돼 있어요',
      columns: 2,
      options: (Object.keys(TOPICS) as TopicId[]).map((id) => ({
        id,
        emoji: TOPICS[id].emoji,
        label: TOPICS[id].label,
        desc: `${TOPICS[id].desc} 실험`,
      })),
    }),
    choiceStep({
      id: 'level',
      title: '난이도를 골라주세요',
      subtitle: '설명의 깊이와 실험 미션이 달라져요',
      columns: 3,
      options: (Object.keys(LEVELS) as LevelId[]).map((id) => ({
        id,
        emoji: LEVELS[id].emoji,
        label: LEVELS[id].label,
        desc: LEVELS[id].desc,
      })),
    }),
    experimentStep,
    textStep({
      id: 'cert',
      title: '인증서에 들어갈 이름을 알려주세요',
      subtitle: '체험 인증서에 그대로 인쇄돼요',
      fields: [
        { id: 'name', label: '이름', placeholder: '예: 김하늘', maxLength: 10 },
        { id: 'school', label: '학교 · 소속', placeholder: '예: 네안데르초등학교', maxLength: 16, optional: true },
      ],
    }),
  ],
  computeResult: (answers) => `${getChoice(answers, 'topic') ?? 'physics'}-${getChoice(answers, 'level') ?? 'middle'}`,
  Result,
  print: (answers) => {
    const { topicId, levelId, topic, level, data, name, school, serial } = certInfo(answers);
    const readout = data ? experimentReadout(topicId, levelId, data) : null;
    return {
      kind: 'receipt',
      eyebrow: 'NEANDER SCIENCE LAB',
      title: '체험 인증서',
      sections: [
        {
          type: 'rows',
          rows: [
            { label: '인증 번호', value: `제 ${topic.code}-${serial} 호` },
            { label: '성명', value: name },
            ...(school ? [{ label: '소속', value: school }] : []),
            { label: '과정', value: `${topic.label} · ${level.label}` },
            { label: '실험', value: topic.experiment },
          ],
        },
        ...(readout
          ? [
              { type: 'big' as const, title: '실험 결과', text: readout.big },
              { type: 'rows' as const, title: '측정 기록', rows: readout.rows },
            ]
          : []),
        { type: 'text', title: '인증', text: `${certStatement(topic)}\n— AI 과학 선생님 N-BOT` },
        { type: 'list', title: '오늘 배운 용어', items: topic.terms },
      ],
      footer: '오늘 발견한 원리, 오래 기억해요!',
    };
  },
});
