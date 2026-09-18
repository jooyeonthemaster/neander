'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  InfoGrid,
  PALM_CENTER,
  Panel,
  ProcessedPhoto,
  ResultShell,
  answersSeed,
  cameraStep,
  choiceStep,
  clamp,
  defineDemo,
  getCapture,
  getChoice,
  seededInt,
  seededPick,
  seededRandom,
  WRIST,
  type CaptureData,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type LineId = 'life' | 'head' | 'heart' | 'fate';
type HandId = 'left' | 'right';
type Pt = [number, number];

const LINES: Record<
  LineId,
  { name: string; color: string; meaning: string; title: string; texts: [string, string, string] }
> = {
  life: {
    name: '생명선',
    color: '#f87171',
    meaning: '체력 · 활력 · 회복력',
    title: '생명력 가득한 에너자이저 손금',
    texts: [
      '굵고 길게 뻗은 생명선이에요. 체력과 회복력이 좋아 바쁜 일정도 거뜬히 소화해요.',
      '안정적인 곡선을 그리는 생명선이에요. 꾸준한 생활 리듬이 에너지를 오래 지켜줘요.',
      '섬세하게 그려진 생명선이에요. 충분히 쉬어 갈 때 더 멀리 가는 타입이에요.',
    ],
  },
  head: {
    name: '두뇌선',
    color: '#60a5fa',
    meaning: '사고방식 · 집중력 · 재능',
    title: '번뜩이는 전략가 손금',
    texts: [
      '길고 선명한 두뇌선이에요. 분석력과 집중력이 뛰어나 복잡한 문제도 술술 풀어내요.',
      '완만하게 내려가는 두뇌선이에요. 논리와 상상력을 균형 있게 쓰는 타입이에요.',
      '부드럽게 휘는 두뇌선이에요. 직관과 감성이 풍부해 아이디어가 번뜩여요.',
    ],
  },
  heart: {
    name: '감정선',
    color: '#f472b6',
    meaning: '사랑 · 우정 · 감수성',
    title: '마음이 따뜻한 로맨티스트 손금',
    texts: [
      '검지 쪽으로 힘차게 뻗은 감정선이에요. 사랑과 우정에 진심이고 표현도 솔직해요.',
      '고르게 이어진 감정선이에요. 따뜻하지만 선을 지킬 줄 아는 균형 잡힌 마음이에요.',
      '잔잔하게 흐르는 감정선이에요. 마음을 천천히 여는 만큼 한번 맺은 인연이 깊어요.',
    ],
  },
  fate: {
    name: '운명선',
    color: '#fbbf24',
    meaning: '진로 · 성취 · 사회운',
    title: '스스로 길을 여는 개척자 손금',
    texts: [
      '손목에서 곧게 올라가는 운명선이에요. 목표를 향해 흔들림 없이 나아가는 개척자예요.',
      '중간부터 또렷해지는 운명선이에요. 경험이 쌓일수록 기회가 커지는 흐름이에요.',
      '여러 갈래로 나뉜 운명선이에요. 다양한 길을 오가며 나만의 길을 만들어 가요.',
    ],
  },
};

const LINE_ORDER: LineId[] = ['life', 'head', 'heart', 'fate'];

const HANDS: Record<HandId, { label: string; tag: string; desc: string }> = {
  left: { label: '왼손', tag: '타고난 운', desc: '왼손은 태어날 때부터 지닌 기질과 타고난 운을 보여줘요.' },
  right: { label: '오른손', tag: '만들어갈 운', desc: '오른손은 노력과 선택으로 만들어갈 앞으로의 운을 보여줘요.' },
};

const HAND_SHAPES = [
  { name: '불의 손', desc: '열정 · 행동파' },
  { name: '물의 손', desc: '감성 · 공감형' },
  { name: '흙의 손', desc: '성실 · 현실파' },
  { name: '바람의 손', desc: '호기심 · 소통형' },
];

const SPECIAL_MARKS = [
  { name: '재물 삼각형', desc: '손바닥 가운데 작은 삼각형은 모으는 재주를 뜻해요' },
  { name: '행운의 별 표식', desc: '뜻밖의 기회가 찾아오는 표식이에요' },
  { name: '태양선', desc: '인기와 명예가 따르는 선이에요' },
  { name: '직감선', desc: '촉이 좋아 선택의 순간에 강해요' },
];

/* ── Reading ──────────────────────────────────────────── */

interface PalmLine {
  id: LineId;
  strength: number;
  d: string;
  branch: string | null;
  /** 번호 배지 위치 — 감정선은 새끼손가락 쪽 시작점, 나머지는 끝점 */
  marker: Pt;
}

function bezier([p0, p1, p2, p3]: [Pt, Pt, Pt, Pt], t: number): Pt {
  const u = 1 - t;
  const f = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i];
  return [f(0), f(1)];
}

/**
 * 시드에 따라 곡률·길이를 바꾼 손금 곡선 (프레임 %, 엄지가 왼쪽인 기본형).
 * 카메라 손 가이드(kit/hand.ts)의 손바닥 위에 놓이도록 잡았고, 샘플 손 사진에 그려진
 * 감정선·두뇌선·생명선 주름을 중심으로 흔든다. 운명선은 손목에서 가운데로 올라간다.
 */
function lineControls(id: LineId, seed: number): [Pt, Pt, Pt, Pt] {
  const c = seededRandom(seed, `curve-${id}`);
  const len = seededRandom(seed, `len-${id}`);
  const j = (salt: string, amp: number) => (seededRandom(seed, `${id}-${salt}`) - 0.5) * 2 * amp;
  switch (id) {
    case 'life':
      // 검지 아래 손바닥 가장자리에서 엄지 두덩을 감싸며 손목 쪽으로
      return [[33.3 + j('x0', 1), 51.5 + j('y0', 1)], [31.5 + 5 * c, 66], [33 + 5 * c, 81], [41 + j('x3', 1.5), 84 + 9 * len]];
    case 'head':
      // 생명선 시작점 근처에서 손바닥을 가로질러 약지 아래로
      return [[32 + j('x0', 1), 53.5 + j('y0', 1)], [44, 54 + 3 * c], [55, 57 + 4 * c], [59 + 8 * len, 60 + 5 * c]];
    case 'heart':
      // 새끼손가락 아래 바깥쪽에서 검지·중지 사이로
      return [[69 + j('x0', 1), 51 + j('y0', 1.5)], [58, 47 + 3 * c], [47, 46 + 3 * c], [35 + 7 * (1 - len), 48 + 2 * c]];
    case 'fate':
    default:
      // 손목 가운데에서 중지 쪽으로
      return [
        [WRIST.x + 1 + j('x0', 2), WRIST.y - 3],
        [51 + 4 * (c - 0.5), 81],
        [49 - 4 * (c - 0.5), 68],
        [49 + j('x3', 1.5), 54 + 9 * (1 - len)],
      ];
  }
}

function readPalm(answers: DemoAnswers) {
  const capture = getCapture(answers, 'palm');
  const hand = (getChoice(answers, 'hand') as HandId | undefined) ?? 'left';
  const seed = capture?.seed ?? answersSeed(answers);
  // 카메라 스텝이 가이드 방향(엄지 위치)을 저장해 둔다. 예전 캡처처럼 없으면 촬영 방식으로 추정한다 —
  // 셀피 화면은 좌우 반전이라 카메라로 찍은 왼손, 업로드한 오른손은 엄지가 오른쪽에 온다
  const source = capture?.source ?? 'sample';
  const thumbRight = capture?.hand
    ? !capture.hand.thumbLeft
    : (source === 'camera' && hand === 'left') || (source === 'upload' && hand === 'right');
  const X = (x: number) => (thumbRight ? 100 - x : x) * 3;
  const Y = (y: number) => y * 4;
  const pt = (p: Pt) => `${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`;

  const bonus: Record<LineId, number> =
    hand === 'left' ? { life: 3, head: 0, heart: 3, fate: 0 } : { life: 0, head: 2, heart: 0, fate: 4 };

  const lines: PalmLine[] = LINE_ORDER.map((id) => {
    const ctrl = lineControls(id, seed);
    const [p0, p1, p2, p3] = ctrl;
    let branch: string | null = null;
    if (seededRandom(seed, `branch-${id}`) > 0.45) {
      const from = bezier(ctrl, 0.72);
      const dir = seededRandom(seed, `branch-dir-${id}`) > 0.5 ? 1 : -1;
      const to: Pt = id === 'fate' || id === 'life' ? [from[0] + 5 * dir, from[1] + 5] : [from[0] + 4, from[1] + 4 * dir];
      branch = `M ${pt(from)} Q ${pt([(from[0] + to[0]) / 2 + dir, (from[1] + to[1]) / 2])} ${pt(to)}`;
    }
    return {
      id,
      strength: clamp(seededInt(seed, `strength-${id}`, 60, 93) + bonus[id], 0, 97),
      d: `M ${pt(p0)} C ${pt(p1)}, ${pt(p2)}, ${pt(p3)}`,
      branch,
      marker: id === 'heart' ? [X(p0[0]), Y(p0[1])] : [X(p3[0]), Y(p3[1])],
    };
  });

  const strongest = [...lines].sort((a, b) => b.strength - a.strength)[0]!;
  return {
    seed,
    hand,
    lines,
    strongest,
    shape: seededPick(seed, 'shape', HAND_SHAPES),
    mark: seededPick(seed, 'mark', SPECIAL_MARKS),
  };
}

function tierOf(strength: number): 0 | 1 | 2 {
  return strength >= 84 ? 0 : strength >= 72 ? 1 : 2;
}

/** 선명할수록 굵게 */
function lineWidth(strength: number): number {
  return 2.2 + strength / 45;
}

/** 손바닥 중심 조준선 (300×400 좌표) */
const AIM = { cx: PALM_CENTER.x * 3, cy: PALM_CENTER.y * 4 };
const AIM_TICKS = `M${AIM.cx} ${AIM.cy - 22} V${AIM.cy - 12} M${AIM.cx} ${AIM.cy + 12} V${AIM.cy + 22} M${AIM.cx - 22} ${AIM.cy} H${AIM.cx - 12} M${AIM.cx + 12} ${AIM.cy} H${AIM.cx + 22}`;

/* ── AR visual ─────────────────────────────────────────── */

const AR_LOOK: PhotoLook = {
  adjust: { brightness: 0.82, saturation: 0.5, contrast: 1.15 },
  tint: { color: '#1e1b4b', alpha: 0.3, blend: 'multiply' },
  vignette: 0.5,
};

function PalmOverlay({ lines, active }: { lines: PalmLine[]; active: LineId | null }) {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-fuchsia-300/30 to-transparent"
        initial={{ top: '-15%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" aria-hidden="true">
        <defs>
          <filter id="palm-glow" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="400">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {/* 손바닥 중심 조준선 */}
        <g stroke="#e9d5ff" strokeOpacity="0.45" fill="none" strokeWidth="1">
          <circle cx={AIM.cx} cy={AIM.cy} r="16" strokeDasharray="3 4" />
          <path d={AIM_TICKS} />
        </g>
        {lines.map((line, i) => {
          const { color } = LINES[line.id];
          const dim = active !== null && active !== line.id;
          const width = lineWidth(line.strength);
          const delay = 0.5 + i * 0.55;
          return (
            <motion.g key={line.id} initial={{ opacity: 1 }} animate={{ opacity: dim ? 0.12 : 1 }} transition={{ duration: 0.3 }}>
              <motion.path
                d={line.d}
                fill="none"
                stroke={color}
                strokeWidth={width * 3}
                strokeLinecap="round"
                filter="url(#palm-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 1.1, delay, ease: 'easeInOut' }}
              />
              <motion.path
                d={line.d}
                fill="none"
                stroke={color}
                strokeWidth={width}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay, ease: 'easeInOut' }}
              />
              <motion.path
                d={line.d}
                fill="none"
                stroke="white"
                strokeOpacity="0.7"
                strokeWidth={width * 0.35}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay, ease: 'easeInOut' }}
              />
              {line.branch && (
                <motion.path
                  d={line.branch}
                  fill="none"
                  stroke={color}
                  strokeWidth={width * 0.55}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: delay + 1 }}
                />
              )}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15, delay: delay + 1.05 }}
              >
                <circle cx={line.marker[0]} cy={line.marker[1]} r="8" fill={color} stroke="#0f172a" strokeWidth="1.5" />
                <text
                  x={line.marker[0]}
                  y={line.marker[1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight="800"
                  fill="#0f172a"
                >
                  {i + 1}
                </text>
              </motion.g>
            </motion.g>
          );
        })}
      </svg>
      <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold tracking-widest text-fuchsia-200">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-fuchsia-400"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        AR PALM
      </span>
    </>
  );
}

/** 출력물용 정적 오버레이 — 결과 화면의 AR 손금이 다 그려진 순간 그대로 */
function PalmPrintOverlay({ lines }: { lines: PalmLine[] }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="900" height="1200">
      <defs>
        <filter id="palm-glow" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="400">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <g stroke="#e9d5ff" strokeOpacity="0.45" fill="none" strokeWidth="1">
        <circle cx={AIM.cx} cy={AIM.cy} r="16" strokeDasharray="3 4" />
        <path d={AIM_TICKS} />
      </g>
      {lines.map((line, i) => {
        const { color } = LINES[line.id];
        const width = lineWidth(line.strength);
        return (
          <g key={line.id}>
            <path d={line.d} fill="none" stroke={color} strokeWidth={width * 3} strokeLinecap="round" opacity="0.8" filter="url(#palm-glow)" />
            <path d={line.d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
            <path d={line.d} fill="none" stroke="white" strokeOpacity="0.7" strokeWidth={width * 0.35} strokeLinecap="round" />
            {line.branch && <path d={line.branch} fill="none" stroke={color} strokeWidth={width * 0.55} strokeLinecap="round" />}
            <circle cx={line.marker[0]} cy={line.marker[1]} r="8" fill={color} stroke="#0f172a" strokeWidth="1.5" />
            <text
              x={line.marker[0]}
              y={line.marker[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
              fill="#0f172a"
            >
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const CIRCLED = ['①', '②', '③', '④'];

function PalmVisual({ capture, lines, color }: { capture: CaptureData; lines: PalmLine[]; color: string }) {
  const [active, setActive] = useState<LineId | null>(null);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <ProcessedPhoto
        src={capture.image}
        look={AR_LOOK}
        className="aspect-[3/4] w-full max-w-[300px] rounded-3xl border border-fuchsia-300/20 shadow-2xl shadow-fuchsia-950/40"
        alt="손금 AR 시각화"
        delayMs={800}
      >
        <PalmOverlay lines={lines} active={active} />
      </ProcessedPhoto>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="손금 선택">
        {lines.map((line, i) => {
          const meta = LINES[line.id];
          const on = active === line.id;
          return (
            <button
              key={line.id}
              type="button"
              onClick={() => setActive(on ? null : line.id)}
              aria-pressed={on}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                on ? 'text-white' : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500'
              )}
              style={on ? { borderColor: meta.color, backgroundColor: `${meta.color}22` } : undefined}
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold text-slate-950"
                style={{ backgroundColor: meta.color }}
              >
                {i + 1}
              </span>
              {meta.name}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500">
        {active ? (
          <>
            <span style={{ color }}>{LINES[active].name}</span>만 보고 있어요 · 다시 누르면 전체 보기
          </>
        ) : (
          '선 이름을 누르면 해당 손금만 강조돼요'
        )}
      </p>
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'palm');
  const { hand, lines, strongest, shape, mark } = readPalm(answers);
  const handMeta = HANDS[hand];
  const top = LINES[strongest.id];

  return (
    <ResultShell
      eyebrow={`AI 손금 리포트 · ${handMeta.label} (${handMeta.tag})`}
      title={top.title}
      description={`${handMeta.desc} 그중 ${top.name}이 가장 선명하게 읽혔어요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 손도 보기"
    >
      {capture && <PalmVisual capture={capture} lines={lines} color={pillarColor} />}

      <Panel title="선별 손금 풀이">
        <ul className="space-y-5">
          {lines.map((line, i) => {
            const meta = LINES[line.id];
            return (
              <motion.li
                key={line.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-slate-950"
                      style={{ backgroundColor: meta.color }}
                    >
                      {i + 1}
                    </span>
                    {meta.name}
                    <span className="text-[11px] font-normal text-slate-500">{meta.meaning}</span>
                  </p>
                  <span className="shrink-0 text-sm font-bold" style={{ color: meta.color }}>
                    {line.strength}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: meta.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${line.strength}%` }}
                    transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.4 + i * 0.12 }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">
                  <span className="mr-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">{handMeta.tag}</span>
                  {meta.texts[tierOf(line.strength)]}
                </p>
              </motion.li>
            );
          })}
        </ul>
      </Panel>

      <InfoGrid
        items={[
          { emoji: '🖐️', label: '손 모양', value: shape.name, desc: shape.desc },
          { emoji: '✨', label: '특별한 표식', value: mark.name, desc: mark.desc },
        ]}
      />

      <p className="max-w-md text-[11px] leading-relaxed text-slate-500 [word-break:keep-all]">
        손금은 재미로 보는 풀이예요. 손금보다 손으로 해내는 일이 운을 더 크게 바꿔요 ✋
      </p>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'palm-reading',
    targetSlug: 'ai-palm-reading',
    industryId: 'festival',
    analyzeEmoji: '🖐️',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'palm',
    analyzeMessages: ['손바닥 주름 지도 그리는 중', '생명선·두뇌선 추적 중', '감정선·운명선 해석 중', 'AR 리포트 만드는 중'],
  },
  steps: [
    choiceStep({
      id: 'hand',
      title: '어느 손을 읽어볼까요?',
      subtitle: '손금은 왼손과 오른손이 말해주는 운이 달라요',
      columns: 2,
      options: [
        { id: 'left', emoji: '🤚', label: '왼손', desc: '타고난 운 · 선천적 기질' },
        { id: 'right', emoji: '✋', label: '오른손', desc: '만들어갈 운 · 노력과 선택' },
      ],
    }),
    cameraStep({
      id: 'palm',
      title: '손바닥을 카메라에 보여주세요',
      subtitle: '손가락을 쫙 펴고 손바닥이 가이드에 가득 차게 맞춰주세요',
      mode: 'hand',
      hand: (a) => getChoice(a, 'hand') as 'left' | 'right' | undefined,
      subject: '손바닥',
      scanLabels: ['손바닥 윤곽 감지', '손가락 관절 21점 추적', '주름 에지 추출', '4대 손금 분류'],
      readouts: (c) => [
        { label: '손 모양', value: seededPick(c.seed, 'shape', HAND_SHAPES).name },
        { label: '선 선명도', value: `${Math.round(clamp(62 + c.stats.contrast * 0.35, 0, 98))}%` },
        { label: '인식된 주요선', value: '4개' },
        { label: '보조선', value: `${3 + (c.seed % 5)}개` },
      ],
    }),
  ],
  computeResult: (answers) => readPalm(answers).strongest.id,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'palm');
    const { hand, lines, strongest } = readPalm(answers);
    const handMeta = HANDS[hand];
    return {
      kind: 'photo',
      photos: capture ? [{ src: capture.image, look: AR_LOOK, overlay: <PalmPrintOverlay lines={lines} /> }] : [],
      title: LINES[strongest.id].title,
      caption: `${handMeta.label}(${handMeta.tag}) · ${lines.map((line, i) => `${CIRCLED[i]}${LINES[line.id].name}`).join(' ')}`,
      badge: 'AR PALM',
      paper: 'black',
    };
  },
});
