'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  ResultShell,
  TraitChips,
  choiceStep,
  defineDemo,
  getChoice,
  getFields,
  hashString,
  seededInt,
  seededPick,
  seededRandom,
  textStep,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type ArtStyle = 'flower' | 'constellation' | 'wave' | 'city';

const STYLES: Record<ArtStyle, { label: string; emoji: string; desc: string; noun: string; swatch: string }> = {
  flower: {
    label: '꽃',
    emoji: '🌸',
    desc: '아이디어가 꽃처럼 피어나요',
    noun: '정원',
    swatch: 'radial-gradient(circle at 50% 60%, #f9a8d4, #c026d3 45%, #1a0b2e 80%)',
  },
  constellation: {
    label: '별자리',
    emoji: '✨',
    desc: '생각이 별처럼 이어져요',
    noun: '별자리',
    swatch: 'radial-gradient(circle at 30% 30%, #bae6fd 0 3%, transparent 4%), radial-gradient(circle at 70% 60%, #fde68a 0 3%, transparent 4%), linear-gradient(160deg, #0b1a3a, #020617)',
  },
  wave: {
    label: '파도',
    emoji: '🌊',
    desc: '에너지가 물결쳐 퍼져요',
    noun: '물결',
    swatch: 'linear-gradient(180deg, #03346e 0 45%, #0ea5e9 45% 60%, #22d3ee 60% 75%, #6366f1 75%)',
  },
  city: {
    label: '도시 불빛',
    emoji: '🌃',
    desc: '비전이 도시의 불빛이 돼요',
    noun: '야경',
    swatch: 'linear-gradient(180deg, #3b0764, #0f0a2a 60%), linear-gradient(90deg, #fbbf24, #f472b6)',
  },
};

const STYLE_ORDER: ArtStyle[] = ['flower', 'constellation', 'wave', 'city'];

const PARTICIPANTS: [string, string][] = [
  ['모두가 웃으며 출근하는 회사', '피플팀'],
  ['고객의 하루를 바꾸는 서비스', 'CX팀'],
  ['실패를 두려워하지 않는 팀', '개발1팀'],
  ['해외 10개국 진출', '글로벌사업팀'],
  ['데이터로 더 나은 결정을', '데이터팀'],
  ['지구를 생각하는 제품', 'ESG TF'],
  ['매일 1% 성장', '영업2팀'],
  ['아이디어가 존중받는 문화', '디자인팀'],
  ['AI와 함께 일하는 미래', 'AI랩'],
  ['우리 동네 최고의 브랜드', '마케팅팀'],
  ['건강하게 오래 일하기', '경영지원팀'],
  ['모두의 목소리가 들리는 회의', 'HR'],
  ['올해는 꼭 신제품 런칭', '상품기획팀'],
  ['서로의 성장을 응원하는 동료', '교육팀'],
  ['고객 만족도 1위', 'CS팀'],
  ['버그 없는 금요일', 'QA팀'],
  ['함께라서 가능한 도전', '전략기획팀'],
  ['창의력이 넘치는 사무실', '브랜드팀'],
  ['다양성이 힘이 되는 조직', 'D&I TF'],
  ['작은 친절이 큰 브랜드로', '고객지원팀'],
];

const FLOWER_PALETTES = [
  ['#f472b6', '#fb7185', '#fde68a', '#fef3c7'],
  ['#c084fc', '#f0abfc', '#f9a8d4', '#fde68a'],
  ['#fb923c', '#fbbf24', '#fde047', '#fff7ed'],
  ['#2dd4bf', '#a7f3d0', '#f9a8d4', '#fef9c3'],
];
const SKY_PALETTES = [
  ['#7dd3fc', '#c4b5fd', '#fde68a'],
  ['#f9a8d4', '#a78bfa', '#bae6fd'],
  ['#5eead4', '#93c5fd', '#fef08a'],
];
const WAVE_PALETTES = [
  ['#22d3ee', '#0ea5e9', '#6366f1', '#2dd4bf', '#a5f3fc'],
  ['#a78bfa', '#818cf8', '#38bdf8', '#f0abfc', '#c7d2fe'],
  ['#34d399', '#2dd4bf', '#0ea5e9', '#a3e635', '#99f6e4'],
];
const WINDOW_COLORS = [
  ['#fde68a', '#fbbf24', '#fcd34d'],
  ['#fde68a', '#f472b6', '#67e8f9'],
  ['#fef3c7', '#fb923c', '#a5f3fc'],
];

/* ── Helpers ───────────────────────────────────────────── */

function visionOf(answers: DemoAnswers) {
  const fields = getFields<string>(answers, 'vision');
  const text = (fields.text ?? '').trim() || '모두가 함께 성장하는 회사';
  const team = (fields.team ?? '').trim();
  const style = (getChoice(answers, 'style') as ArtStyle | undefined) ?? 'flower';
  const seed = hashString(`${text}|${team}|${style}`);
  return { text, team, style: STYLES[style] ? style : 'flower', seed };
}

/** 명사 뒤에 붙는 조사 (은/는은 동사 관형형과 헷갈려서 뺀다) */
const NOUN_PARTICLE = /(으로|에서|에게|까지|부터|을|를|의|에|로|와|과|이|가|도|만)$/;
/** 동사·형용사 어미로 끝나는 단어는 키워드에서 뺀다 */
const VERB_ENDING = /(다|요|고|는|은|한|할|게|며|면|서|지|죠|어|아|던|된|운)$/;

/** 문장에서 시각화 키워드(주로 명사)를 앞에서부터 3개 뽑는다 */
function keywordsOf(text: string): string[] {
  const tokens = text.split(/[\s,.!?~·'"“”‘’()]+/).filter((w) => /[가-힣A-Za-z]/.test(w));
  const nouns: string[] = [];
  for (const token of tokens) {
    const stem = token.replace(NOUN_PARTICLE, '');
    if (stem !== token ? stem.length >= 2 : token.length >= 2 && !VERB_ENDING.test(token)) nouns.push(stem);
  }
  const unique = [...new Set(nouns)].slice(0, 3);
  if (unique.length) return unique;
  const fallback = [...new Set(tokens.filter((w) => w.length >= 2))].sort((a, b) => b.length - a.length).slice(0, 3);
  return fallback.length ? fallback : ['비전', '미래', '함께'];
}

/** 결과 화면과 출력물이 함께 쓰는 비전 요약 */
function summarize(answers: DemoAnswers) {
  const vision = visionOf(answers);
  const meta = STYLES[vision.style];
  const keywords = keywordsOf(vision.text);
  return {
    ...vision,
    meta,
    keywords,
    title: `${keywords[0]}의 ${meta.noun}`,
    number: String(vision.seed % 10000).padStart(4, '0'),
    particles: 800 + seededInt(vision.seed, 'particles', 0, 1400),
    convertSec: `0.${seededInt(vision.seed, 'ms', 4, 9)}`,
  };
}

/** mini(비전 월 타일)일 때는 정적 SVG, 아니면 motion 애니메이션 */
function Anim({ on, children, ...props }: { on: boolean; children: React.ReactNode } & React.ComponentProps<typeof motion.g>) {
  if (!on) return <g>{children}</g>;
  return <motion.g {...props}>{children}</motion.g>;
}

/* ── Generative art ────────────────────────────────────── */

/** SVG 변환 기준점을 도형 bbox가 아닌 viewBox 좌표(꽃 중심 100,100)로 고정 */
const FLOWER_ORIGIN = { transformBox: 'view-box', originX: '100px', originY: '100px' } as const;

function FlowerArt({ seed, mini, uid }: { seed: number; mini: boolean; uid: string }) {
  const pal = seededPick(seed, 'pal', FLOWER_PALETTES);
  const layers = [0, 1, 2].map((L) => {
    const n = 5 + seededInt(seed, `n${L}`, 0, 5);
    const r = 70 - L * 20;
    return { n, r, w: r * (0.32 + seededRandom(seed, `w${L}`) * 0.2), color: pal[L]!, offset: seededRandom(seed, `o${L}`) * 360 };
  });
  const buds = mini
    ? []
    : Array.from({ length: 4 }, (_, i) => ({
        x: [28, 172, 30, 170][i]! + seededInt(seed, `bx${i}`, -8, 8),
        y: [30, 34, 168, 166][i]! + seededInt(seed, `by${i}`, -8, 8),
        color: pal[(i + 1) % 3]!,
      }));
  const pollen = mini
    ? []
    : Array.from({ length: 22 }, (_, i) => ({
        x: 10 + seededRandom(seed, `px${i}`) * 180,
        y: 20 + seededRandom(seed, `py${i}`) * 170,
        r: 0.8 + seededRandom(seed, `pr${i}`) * 1.6,
        d: seededRandom(seed, `pd${i}`) * 4,
      }));

  return (
    <>
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#3b0a45" />
          <stop offset="100%" stopColor="#0b0a1a" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${uid}-bg)`} />
      {buds.map((b, i) => (
        <Anim key={i} on={!mini} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.55 }} transition={{ delay: 1.2 + i * 0.15, duration: 0.8 }}>
          {Array.from({ length: 5 }, (_, k) => (
            <ellipse key={k} cx={b.x} cy={b.y - 7} rx="4" ry="7" fill={b.color} transform={`rotate(${k * 72} ${b.x} ${b.y})`} />
          ))}
          <circle cx={b.x} cy={b.y} r="3" fill={pal[3]} />
        </Anim>
      ))}
      <Anim on={!mini} animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} style={FLOWER_ORIGIN}>
        {layers.map((layer, L) => (
          <Anim
            key={L}
            on={!mini}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + L * 0.35, duration: 1, type: 'spring', stiffness: 60, damping: 12 }}
            style={FLOWER_ORIGIN}
          >
            {Array.from({ length: layer.n }, (_, k) => (
              <ellipse
                key={k}
                cx="100"
                cy={100 - layer.r / 2}
                rx={layer.w / 2}
                ry={layer.r / 2}
                fill={layer.color}
                fillOpacity={0.78}
                stroke="#ffffff"
                strokeOpacity={0.25}
                strokeWidth="0.6"
                transform={`rotate(${layer.offset + (k * 360) / layer.n} 100 100)`}
              />
            ))}
          </Anim>
        ))}
      </Anim>
      <circle cx="100" cy="100" r="11" fill={pal[2]} />
      {!mini &&
        Array.from({ length: 34 }, (_, i) => {
          const a = i * 2.39996;
          const d = 1.7 * Math.sqrt(i);
          return <circle key={i} cx={100 + Math.cos(a) * d} cy={100 + Math.sin(a) * d} r="0.9" fill="#7c2d12" fillOpacity="0.55" />;
        })}
      {pollen.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={pal[3]}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.9, 0], y: [0, -14] }}
          transition={{ duration: 3.4, delay: p.d, repeat: Infinity }}
        />
      ))}
    </>
  );
}

function ConstellationArt({ seed, mini, uid }: { seed: number; mini: boolean; uid: string }) {
  const pal = seededPick(seed, 'pal', SKY_PALETTES);
  const k = 7 + seededInt(seed, 'k', 0, 4);
  const stars = Array.from({ length: k }, (_, i) => {
    const angle = (i / k) * Math.PI * 2 + (seededRandom(seed, `sa${i}`) - 0.5) * 0.7;
    const radius = 38 + seededRandom(seed, `sr${i}`) * 48;
    return { x: 100 + Math.cos(angle) * radius, y: 100 + Math.sin(angle) * radius * 0.85, r: 2 + seededRandom(seed, `sz${i}`) * 2.5 };
  });
  const path = stars.map((s, i) => `${i === 0 ? 'M' : 'L'} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`).join(' ');
  const hub = stars[seededInt(seed, 'hub', 0, k - 1)]!;
  const branch = stars[(stars.indexOf(hub) + Math.floor(k / 2)) % k]!;
  const dust = Array.from({ length: mini ? 18 : 70 }, (_, i) => ({
    x: seededRandom(seed, `dx${i}`) * 200,
    y: seededRandom(seed, `dy${i}`) * 200,
    r: 0.3 + seededRandom(seed, `dr${i}`) * 0.9,
    d: seededRandom(seed, `dd${i}`) * 3,
  }));

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#0b1a3a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <radialGradient id={`${uid}-neb1`}>
          <stop offset="0%" stopColor={pal[1]} stopOpacity="0.55" />
          <stop offset="100%" stopColor={pal[1]} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-neb2`}>
          <stop offset="0%" stopColor={pal[0]} stopOpacity="0.4" />
          <stop offset="100%" stopColor={pal[0]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${uid}-bg)`} />
      <circle cx={60 + seededInt(seed, 'n1x', 0, 40)} cy={70} r="70" fill={`url(#${uid}-neb1)`} />
      <circle cx={140 - seededInt(seed, 'n2x', 0, 40)} cy={135} r="60" fill={`url(#${uid}-neb2)`} />
      {dust.map((d, i) =>
        mini ? (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#e2e8f0" opacity="0.6" />
        ) : (
          <motion.circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill="#e2e8f0"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 2.4, delay: d.d, repeat: Infinity }}
          />
        )
      )}
      {mini ? (
        <>
          <path d={path} fill="none" stroke={pal[0]} strokeOpacity="0.8" strokeWidth="1.2" />
          <line x1={hub.x} y1={hub.y} x2={branch.x} y2={branch.y} stroke={pal[0]} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 3" />
        </>
      ) : (
        <>
          <motion.path
            d={path}
            fill="none"
            stroke={pal[0]}
            strokeOpacity="0.85"
            strokeWidth="1.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.4, delay: 0.6, ease: 'easeInOut' }}
          />
          <motion.line
            x1={hub.x}
            y1={hub.y}
            x2={branch.x}
            y2={branch.y}
            stroke={pal[0]}
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="3 3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          />
        </>
      )}
      {stars.map((s, i) => (
        <Anim
          key={i}
          on={!mini}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 + i * 0.25, type: 'spring', stiffness: 220, damping: 12 }}
        >
          <circle cx={s.x} cy={s.y} r={s.r * 3} fill={pal[2]} fillOpacity="0.18" />
          <circle cx={s.x} cy={s.y} r={s.r} fill="#ffffff" />
          <path
            d={`M ${s.x - s.r * 2.6} ${s.y} H ${s.x + s.r * 2.6} M ${s.x} ${s.y - s.r * 2.6} V ${s.y + s.r * 2.6}`}
            stroke="#ffffff"
            strokeOpacity="0.6"
            strokeWidth="0.5"
          />
        </Anim>
      ))}
    </>
  );
}

function wavePath(base: number, amp: number, cycles: number, phase: number): string {
  let d = '';
  for (let x = 0; x <= 400; x += 5) {
    const y = base + amp * Math.sin((2 * Math.PI * cycles * x) / 200 + phase);
    d += `${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)} `;
  }
  return `${d}L 400 200 L 0 200 Z`;
}

function WaveArt({ seed, mini, uid }: { seed: number; mini: boolean; uid: string }) {
  const pal = seededPick(seed, 'pal', WAVE_PALETTES);
  const count = mini ? 3 : 5;
  const waves = Array.from({ length: count }, (_, L) => ({
    d: wavePath(
      88 + L * (mini ? 30 : 20),
      5 + seededRandom(seed, `amp${L}`) * 11,
      1 + seededInt(seed, `cyc${L}`, 0, 2),
      seededRandom(seed, `ph${L}`) * Math.PI * 2
    ),
    color: pal[L % pal.length]!,
    dur: 9 + L * 3,
    dir: L % 2 === 0 ? -1 : 1,
  }));
  const sunX = 40 + seededInt(seed, 'sun', 0, 120);
  const sparkles = mini
    ? []
    : Array.from({ length: 16 }, (_, i) => ({
        x: seededRandom(seed, `sx${i}`) * 200,
        y: 100 + seededRandom(seed, `sy${i}`) * 90,
        d: seededRandom(seed, `sd${i}`) * 3,
      }));

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#021526" />
          <stop offset="100%" stopColor="#03346e" />
        </linearGradient>
        <radialGradient id={`${uid}-sun`}>
          <stop offset="0%" stopColor={pal[4]} />
          <stop offset="45%" stopColor={pal[4]} stopOpacity="0.5" />
          <stop offset="100%" stopColor={pal[4]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${uid}-bg)`} />
      <circle cx={sunX} cy="52" r="34" fill={`url(#${uid}-sun)`} />
      <circle cx={sunX} cy="52" r="11" fill={pal[4]} />
      {waves.map((w, L) =>
        mini ? (
          <path key={L} d={w.d} fill={w.color} fillOpacity={0.55 + L * 0.12} />
        ) : (
          <motion.path
            key={L}
            d={w.d}
            fill={w.color}
            fillOpacity={0.45 + L * 0.1}
            initial={{ x: w.dir < 0 ? 0 : -200, opacity: 0 }}
            animate={{ x: w.dir < 0 ? -200 : 0, opacity: 1 }}
            transition={{ x: { duration: w.dur, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.8, delay: L * 0.2 } }}
          />
        )
      )}
      {sparkles.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r="1"
          fill="#ffffff"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, delay: s.d, repeat: Infinity }}
        />
      ))}
    </>
  );
}

function CityArt({ seed, mini, uid }: { seed: number; mini: boolean; uid: string }) {
  const windows = seededPick(seed, 'win', WINDOW_COLORS);
  const buildings: { x: number; w: number; h: number; back: boolean }[] = [];
  for (const back of [true, false]) {
    let x = -4 + seededInt(seed, back ? 'bx' : 'fx', 0, 8);
    let i = 0;
    while (x < 204) {
      const w = (back ? 14 : 12) + seededRandom(seed, `${back}w${i}`) * 16;
      const h = (back ? 70 : 40) + seededRandom(seed, `${back}h${i}`) * (back ? 70 : 80);
      buildings.push({ x, w, h, back });
      x += w + (back ? 1 : 2);
      i++;
    }
  }
  const moonX = 30 + seededInt(seed, 'moon', 0, 140);
  const step = mini ? 9 : 6;

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0a2a" />
          <stop offset="70%" stopColor="#3b0764" />
          <stop offset="100%" stopColor="#831843" />
        </linearGradient>
        <linearGradient id={`${uid}-beam`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={windows[1]} stopOpacity="0.45" />
          <stop offset="100%" stopColor={windows[1]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${uid}-bg)`} />
      {Array.from({ length: mini ? 10 : 30 }, (_, i) => (
        <circle key={i} cx={seededRandom(seed, `st${i}`) * 200} cy={seededRandom(seed, `sty${i}`) * 80} r="0.6" fill="#fff" opacity="0.7" />
      ))}
      <circle cx={moonX} cy="34" r="12" fill="#fef3c7" opacity="0.95" />
      <circle cx={moonX + 5} cy="30" r="10" fill="#1e0b3d" opacity="0.9" />
      {!mini &&
        [60, 140].map((bx, i) => (
          <motion.polygon
            key={bx}
            points={`${bx - 3},200 ${bx + 3},200 ${bx + 26},0 ${bx - 26},0`}
            fill={`url(#${uid}-beam)`}
            style={{ transformBox: 'view-box', originX: `${bx}px`, originY: '200px' }}
            initial={{ rotate: i === 0 ? -18 : 18 }}
            animate={{ rotate: i === 0 ? [-18, 12, -18] : [18, -12, 18] }}
            transition={{ duration: 7 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      {buildings.map((b, i) => {
        const top = 200 - b.h;
        const cols = Math.max(1, Math.floor((b.w - 4) / step));
        const rows = Math.max(1, Math.floor((b.h - 8) / (step + 1)));
        const lit: { x: number; y: number; c: string; flicker: boolean }[] = [];
        if (!b.back) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (seededRandom(seed, `win${i}-${r}-${c}`) > 0.52) {
                lit.push({
                  x: b.x + 3 + c * step,
                  y: top + 5 + r * (step + 1),
                  c: windows[seededInt(seed, `wc${i}-${r}-${c}`, 0, 2)]!,
                  flicker: !mini && seededRandom(seed, `fl${i}-${r}-${c}`) > 0.93,
                });
              }
            }
          }
        }
        return (
          <Anim
            key={i}
            on={!mini}
            initial={{ y: b.h }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: (b.back ? 0 : 0.4) + (i % 12) * 0.05, ease: 'easeOut' }}
          >
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={b.back ? '#2e1065' : '#0f0a1f'} opacity={b.back ? 0.85 : 1} />
            {lit.map((w, j) =>
              w.flicker ? (
                <motion.rect
                  key={j}
                  x={w.x}
                  y={w.y}
                  width={step * 0.45}
                  height={step * 0.6}
                  fill={w.c}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.6 + (j % 3), repeat: Infinity }}
                />
              ) : (
                <rect key={j} x={w.x} y={w.y} width={step * 0.45} height={step * 0.6} fill={w.c} opacity="0.9" />
              )
            )}
          </Anim>
        );
      })}
    </>
  );
}

function VisionArt({ style, seed, mini = false, className }: { style: ArtStyle; seed: number; mini?: boolean; className?: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 200 200" className={cn('block h-full w-full', className)} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {style === 'flower' && <FlowerArt seed={seed} mini={mini} uid={uid} />}
      {style === 'constellation' && <ConstellationArt seed={seed} mini={mini} uid={uid} />}
      {style === 'wave' && <WaveArt seed={seed} mini={mini} uid={uid} />}
      {style === 'city' && <CityArt seed={seed} mini={mini} uid={uid} />}
    </svg>
  );
}

/* ── Wall ──────────────────────────────────────────────── */

const WALL_DELAY = 0.4;
const FLY_IN_DELAY = WALL_DELAY + PARTICIPANTS.length * 0.05 + 0.4;

function VisionWall({ style, seed, text, team, color }: { style: ArtStyle; seed: number; text: string; team: string; color: string }) {
  // 네 가지 스타일이 고르게 섞이도록 순서만 결정적으로 섞는다
  const tiles = PARTICIPANTS.map(([vision, teamName], i) => ({
    vision,
    teamName,
    seed: hashString(`${vision}|${i}`),
    style: STYLE_ORDER[i % STYLE_ORDER.length]!,
  })).sort((a, b) => a.seed - b.seed);

  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-black p-3 shadow-2xl shadow-black/60 sm:p-4">
      {/* LED 도트 질감 */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-40 mix-blend-overlay"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 0.6px, transparent 0.8px)', backgroundSize: '4px 4px' }}
        aria-hidden="true"
      />
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-[10px] font-bold tracking-[0.3em] text-slate-300 sm:text-xs">NEANDER VISION WALL</p>
        <p className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          LIVE · 참여 비전 {PARTICIPANTS.length + 1}
        </p>
      </div>
      <div className="grid grid-flow-row-dense grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2">
        {tiles.map((t, i) => (
          <motion.div
            key={t.vision}
            title={`${t.vision} · ${t.teamName}`}
            className="relative aspect-square overflow-hidden rounded-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ delay: WALL_DELAY + i * 0.05, duration: 0.4 }}
          >
            <VisionArt style={t.style} seed={t.seed} mini />
          </motion.div>
        ))}
        <motion.div
          className="relative z-20 col-span-2 col-start-2 row-span-2 row-start-2 aspect-square overflow-hidden rounded-lg sm:col-start-3"
          initial={{ opacity: 0, scale: 2.2, y: -140 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: FLY_IN_DELAY, type: 'spring', stiffness: 90, damping: 14 }}
        >
          <motion.div
            className="absolute inset-0 z-10 rounded-lg"
            style={{ boxShadow: `inset 0 0 0 2px ${color}` }}
            animate={{ boxShadow: [`inset 0 0 0 2px ${color}, 0 0 0px ${color}`, `inset 0 0 0 2px ${color}, 0 0 24px ${color}`, `inset 0 0 0 2px ${color}, 0 0 0px ${color}`] }}
            transition={{ duration: 2, repeat: Infinity, delay: FLY_IN_DELAY + 0.6 }}
          />
          <VisionArt style={style} seed={seed} mini />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2 pb-2 pt-6 text-left">
            <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white [word-break:keep-all] sm:text-xs">{text}</p>
            <p className="mt-0.5 text-[9px] text-white/70">{team ? `${team} · ` : ''}나의 비전</p>
          </div>
          <span className="absolute left-1.5 top-1.5 z-20 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white" style={{ backgroundColor: color }}>
            NEW
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const { text, team, style, seed, meta, keywords, title, number, particles, convertSec } = summarize(answers);

  return (
    <ResultShell
      eyebrow={`AI 비전 시각화 · ${meta.emoji} ${meta.label}`}
      title={`『${title}』`}
      description={`“${text}”${team ? ` — ${team}` : ''}`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 비전 그리기"
    >
      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-3 rounded-[2rem] opacity-40 blur-2xl" style={{ background: meta.swatch }} aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
        >
          <VisionArt style={style} seed={seed} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 text-left">
            <p className="text-[10px] font-bold tracking-[0.25em] text-white/60">VISION #{number}</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-white [word-break:keep-all]">{text}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <TraitChips title="AI가 읽어낸 키워드" items={keywords.map((k) => `#${k}`)} />
        <p className="text-[11px] text-slate-500">
          텍스트 → 이미지 변환 {convertSec}초 · 파티클 {particles.toLocaleString('ko-KR')}개 · 팔레트 자동 생성
        </p>
      </div>

      <div className="w-full space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">지금 대형 LED 월에 올라갔어요 ✨</p>
          <p className="text-xs text-slate-400 [word-break:keep-all]">참여자들의 비전이 모여 하나의 미디어아트가 돼요</p>
        </div>
        <div className="flex justify-center">
          <VisionWall style={style} seed={seed} text={text} team={team} color={pillarColor} />
        </div>
        <p className="text-[11px] text-slate-500">행사가 끝나면 전체 비전 월 아카이브를 받아볼 수 있어요</p>
      </div>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'vision-wall',
    targetSlug: 'ai-vision-wall',
    industryId: 'corporate',
    analyzeEmoji: '🎆',
    analyzeDurationMs: 3400,
    analyzeMessages: ['문장의 감정과 키워드 읽는 중', '텍스트를 이미지로 변환 중', '색과 움직임 생성 중', 'LED 비전 월에 전송 중'],
  },
  steps: [
    textStep({
      id: 'vision',
      title: '나의 비전이나 아이디어를 적어주세요',
      subtitle: '한 문장이면 충분해요. AI가 그림으로 바꿔 드려요',
      fields: [
        { id: 'text', label: '나의 비전 · 아이디어', placeholder: '예: 모두가 즐겁게 일하는 회사를 만들고 싶어요', maxLength: 60, multiline: true },
        { id: 'team', label: '팀 이름', placeholder: '예: 브랜드전략팀', maxLength: 14, optional: true },
      ],
    }),
    choiceStep({
      id: 'style',
      title: '어떤 모습으로 피어나게 할까요?',
      subtitle: '비전 월에 표시될 시각화 스타일이에요',
      columns: 2,
      options: STYLE_ORDER.map((id) => ({ id, emoji: STYLES[id].emoji, label: STYLES[id].label, desc: STYLES[id].desc, swatch: STYLES[id].swatch })),
    }),
  ],
  computeResult: (answers) => visionOf(answers).style,
  Result,
  print: (answers) => {
    const v = summarize(answers);
    return {
      kind: 'receipt',
      eyebrow: 'VISION WALL · ENTRY TICKET',
      title: `『${v.title}』`,
      sections: [
        { type: 'big', title: '비전 번호', text: `#${v.number}` },
        { type: 'text', title: '나의 비전', text: `“${v.text}”${v.team ? `\n— ${v.team}` : ''}` },
        { type: 'list', title: 'AI가 읽어낸 키워드', items: v.keywords.map((k) => `#${k}`) },
        {
          type: 'rows',
          title: '비전 월 게시 정보',
          rows: [
            { label: '스타일', value: `${v.meta.label} · ${v.meta.noun}` },
            { label: '게시 위치', value: 'LED 월 중앙 타일' },
            { label: '함께한 비전', value: `${PARTICIPANTS.length + 1}개` },
            { label: '파티클', value: `${v.particles.toLocaleString('ko-KR')}개` },
            { label: '변환 시간', value: `${v.convertSec}초` },
          ],
        },
      ],
      footer: '모두의 비전이 모여 하나의 미디어아트가 됐어요',
    };
  },
});
