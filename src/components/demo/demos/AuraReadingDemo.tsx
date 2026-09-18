'use client';

import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  Panel,
  ProcessedPhoto,
  ResultShell,
  ScoreBars,
  TraitChips,
  answersSeed,
  cameraStep,
  choiceStep,
  clamp,
  defineDemo,
  getCapture,
  getChoice,
  seededInt,
  seededRandom,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type AuraId = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'violet';

interface Aura {
  label: string;
  ko: string;
  nickname: string;
  color: string;
  desc: string;
  keywords: string[];
  profile: [number, number, number, number, number];
  match: AuraId;
  spark: AuraId;
  charge: string;
}

const AURAS: Record<AuraId, Aura> = {
  red: {
    label: 'RED',
    ko: '레드',
    nickname: '열정의 불꽃',
    color: '#ef4444',
    desc: '에너지가 밖으로 뿜어져 나오는 행동파예요. 마음먹은 일은 바로 실행하고 주변까지 뜨겁게 만드는 힘이 있어요.',
    keywords: ['열정', '추진력', '용기', '리더십'],
    profile: [92, 58, 62, 72, 56],
    match: 'green',
    spark: 'yellow',
    charge: '땀 흘리는 운동 30분',
  },
  orange: {
    label: 'ORANGE',
    ko: '오렌지',
    nickname: '즐거운 모험가',
    color: '#f97316',
    desc: '새로운 경험에서 에너지를 얻는 모험가예요. 사람들과 어울릴 때 가장 빛나고 분위기를 단숨에 띄워요.',
    keywords: ['사교성', '모험심', '유쾌함', '행동력'],
    profile: [86, 62, 78, 80, 55],
    match: 'blue',
    spark: 'red',
    charge: '처음 가보는 동네 산책',
  },
  yellow: {
    label: 'YELLOW',
    ko: '옐로',
    nickname: '햇살 같은 낙천가',
    color: '#facc15',
    desc: '밝고 긍정적인 기운이 주변을 환하게 비춰요. 아이디어가 많고 새로운 걸 배우는 순간을 즐겨요.',
    keywords: ['긍정', '호기심', '유머', '낙천'],
    profile: [82, 60, 74, 88, 62],
    match: 'violet',
    spark: 'orange',
    charge: '햇빛 아래 10분 광합성',
  },
  green: {
    label: 'GREEN',
    ko: '그린',
    nickname: '마음을 돌보는 치유자',
    color: '#22c55e',
    desc: '곁에 있으면 편안해지는 치유의 기운이에요. 성장과 균형을 소중히 여기고 사람을 잘 챙겨요.',
    keywords: ['배려', '성장', '균형', '회복력'],
    profile: [66, 74, 90, 68, 84],
    match: 'red',
    spark: 'blue',
    charge: '식물에 물 주고 숲 향 맡기',
  },
  blue: {
    label: 'BLUE',
    ko: '블루',
    nickname: '평화로운 소통가',
    color: '#3b82f6',
    desc: '차분하고 진솔한 대화로 신뢰를 쌓는 타입이에요. 말보다 마음을 먼저 듣는 사람이에요.',
    keywords: ['신뢰', '평온', '진정성', '경청'],
    profile: [60, 78, 86, 66, 90],
    match: 'orange',
    spark: 'indigo',
    charge: '물가 산책과 따뜻한 차 한 잔',
  },
  indigo: {
    label: 'INDIGO',
    ko: '인디고',
    nickname: '깊이 보는 직관가',
    color: '#6366f1',
    desc: '보이지 않는 흐름을 읽는 직관이 뛰어나요. 조용하지만 한 번 몰입하면 누구보다 깊이 파고들어요.',
    keywords: ['직관', '통찰', '몰입', '독립심'],
    profile: [64, 88, 70, 84, 76],
    match: 'green',
    spark: 'violet',
    charge: '조명 낮추고 좋아하는 음악 듣기',
  },
  violet: {
    label: 'VIOLET',
    ko: '바이올렛',
    nickname: '꿈꾸는 예술가',
    color: '#a855f7',
    desc: '상상력과 감수성이 풍부한 몽상가예요. 남들이 지나치는 아름다움을 발견하고 표현하는 재능이 있어요.',
    keywords: ['상상력', '감수성', '영감', '표현력'],
    profile: [70, 92, 76, 94, 60],
    match: 'yellow',
    spark: 'indigo',
    charge: '낙서하듯 자유롭게 그림 그리기',
  },
};

const SPECTRUM: AuraId[] = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const PROFILE_LABELS = ['에너지 레벨', '감수성', '공감력', '창의력', '안정감'] as const;

type MoodId = 'passion' | 'flutter' | 'joy' | 'tired' | 'calm' | 'dreamy';

const MOODS: { id: MoodId; emoji: string; label: string; desc: string; target: number }[] = [
  { id: 'passion', emoji: '🔥', label: '열정 가득', desc: '뭐든 해낼 것 같아요', target: 0 },
  { id: 'flutter', emoji: '💓', label: '두근두근', desc: '설레는 일이 있어요', target: 1 },
  { id: 'joy', emoji: '😆', label: '신나요', desc: '웃음이 계속 나와요', target: 2 },
  { id: 'tired', emoji: '🫠', label: '조금 지쳤어요', desc: '쉼이 필요해요', target: 3 },
  { id: 'calm', emoji: '🌊', label: '평온해요', desc: '마음이 잔잔해요', target: 4 },
  { id: 'dreamy', emoji: '☁️', label: '몽글몽글', desc: '생각이 둥둥 떠다녀요', target: 6 },
];

/* ── Reading ──────────────────────────────────────────── */

function readAura(answers: DemoAnswers) {
  const capture = getCapture(answers, 'face');
  const mood = MOODS.find((m) => m.id === getChoice(answers, 'mood')) ?? MOODS[4]!;
  const seed = answersSeed(answers);
  const warmth = capture?.stats.warmth ?? 50;
  const brightness = capture?.stats.brightness ?? 55;

  // 따뜻한 톤일수록 스펙트럼 앞쪽(레드), 어두울수록 뒤쪽(인디고·바이올렛)
  const photoIdx = ((100 - warmth) / 100) * 6 + (brightness < 40 ? 1 : brightness > 70 ? -0.6 : 0);
  const jitter = (seededRandom(seed, 'aura') - 0.5) * 1.2;
  const index = Math.round(clamp(mood.target * 0.55 + photoIdx * 0.45 + jitter, 0, 6));
  const id = SPECTRUM[index]!;
  const secondIndex = index === 6 ? 5 : index === 0 ? 1 : seededRandom(seed, 'second') > 0.5 ? index + 1 : index - 1;
  const second = SPECTRUM[secondIndex]!;

  const aura = AURAS[id];
  const profile = aura.profile.map((v, i) =>
    Math.round(clamp(v + seededInt(seed, `p${i}`, -6, 6) + (i === 0 ? (brightness - 50) / 8 : 0), 35, 98))
  );
  const intensity = Math.round(clamp(70 + seededInt(seed, 'intensity', 0, 20) + (brightness - 50) / 10, 60, 99));

  return { seed, id, second, mood, profile, intensity };
}

/* ── Aura art ──────────────────────────────────────────── */

function auraLook(main: string, second: string): PhotoLook {
  return {
    // 바탕을 충분히 어둡게 눌러야 screen 글로우가 밝은 배경에서도 살아난다
    adjust: { brightness: 0.58, saturation: 0.4, contrast: 1.18 },
    paints: [
      { x: 6, y: 50, rx: 34, ry: 62, color: main, alpha: 0.75, blend: 'color' },
      { x: 94, y: 50, rx: 34, ry: 62, color: second, alpha: 0.75, blend: 'color' },
      { x: 50, y: 20, rx: 60, ry: 30, color: main, alpha: 0.95, blend: 'screen' },
      { x: 2, y: 55, rx: 32, ry: 60, color: main, alpha: 0.9, blend: 'screen' },
      { x: 98, y: 45, rx: 32, ry: 60, color: second, alpha: 0.9, blend: 'screen' },
      { x: 50, y: 104, rx: 72, ry: 28, color: second, alpha: 0.85, blend: 'screen' },
      { x: 50, y: 46, rx: 30, ry: 34, color: main, alpha: 0.5, blend: 'soft-light' },
    ],
    grain: 14,
    vignette: 0.2,
  };
}

/** 오라 링·글로우가 놓이는 상자 (사진 대비 %) */
type Box = { left: number; right: number; top: number; bottom: number };
const RING_BOX: Box = { left: 17, right: 17, top: 8, bottom: 20 };
const GLOW_BOX: Box = { left: 20, right: 20, top: 11, bottom: 23 };

const boxStyle = (b: Box) => ({ left: `${b.left}%`, right: `${b.right}%`, top: `${b.top}%`, bottom: `${b.bottom}%` });

/** 상자에 내접하는 타원 (300×400 좌표) */
function boxEllipse(b: Box) {
  const x0 = b.left * 3;
  const x1 = 300 - b.right * 3;
  const y0 = b.top * 4;
  const y1 = 400 - b.bottom * 4;
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, rx: (x1 - x0) / 2, ry: (y1 - y0) / 2 };
}

/** 얼굴 둘레를 떠다니는 빛 입자 (위치 %, 크기 px) */
function auraParticles(seed: number, main: string, second: string) {
  return Array.from({ length: 16 }, (_, i) => {
    const angle = seededRandom(seed, `pa${i}`) * Math.PI * 2;
    return {
      x: 50 + Math.cos(angle) * (30 + seededRandom(seed, `pr${i}`) * 14),
      y: 44 + Math.sin(angle) * (36 + seededRandom(seed, `pr${i}`) * 12),
      size: 3 + seededRandom(seed, `ps${i}`) * 5,
      delay: seededRandom(seed, `pd${i}`) * 3,
      color: i % 3 === 0 ? second : i % 3 === 1 ? main : '#ffffff',
    };
  });
}

/** 출력물용 정적 오버레이 — 오라 링·글로우·빛 입자를 한 장면으로 멈춰 그린다 */
function AuraPrintOverlay({ main, second, seed }: { main: string; second: string; seed: number }) {
  const ring = boxEllipse(RING_BOX);
  const glow = boxEllipse(GLOW_BOX);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="900" height="1200">
      <defs>
        <linearGradient id="aura-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={main} />
          <stop offset="0.3" stopColor={second} />
          <stop offset="0.48" stopColor={second} stopOpacity="0" />
          <stop offset="0.7" stopColor={main} />
          <stop offset="1" stopColor={second} />
        </linearGradient>
        <filter id="aura-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="aura-ring-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="aura-dot" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* 바깥으로 번지는 글로우 + 안쪽 보조색 글로우 */}
      <ellipse cx={glow.cx} cy={glow.cy} rx={glow.rx + 16} ry={glow.ry + 16} fill="none" stroke={main} strokeWidth="28" strokeOpacity="0.6" filter="url(#aura-soft)" />
      <ellipse cx={glow.cx} cy={glow.cy} rx={glow.rx - 8} ry={glow.ry - 8} fill="none" stroke={second} strokeWidth="16" strokeOpacity="0.45" filter="url(#aura-soft)" />
      {/* 오라 링 */}
      <ellipse
        cx={ring.cx}
        cy={ring.cy}
        rx={ring.rx * 0.935}
        ry={ring.ry * 0.935}
        fill="none"
        stroke="url(#aura-ring)"
        strokeWidth="8"
        filter="url(#aura-ring-blur)"
      />
      {auraParticles(seed, main, second).map((p, i) => (
        <g key={i}>
          <circle cx={p.x * 3} cy={p.y * 4} r={p.size / 2 + 2} fill={p.color} opacity="0.8" filter="url(#aura-dot)" />
          <circle cx={p.x * 3} cy={p.y * 4} r={p.size / 2} fill={p.color} />
        </g>
      ))}
    </svg>
  );
}

function AuraOverlay({ main, second, seed, label }: { main: string; second: string; seed: number; label: string }) {
  const particles = auraParticles(seed, main, second);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* 회전하는 오라 링 */}
      <motion.div
        className="absolute"
        style={{
          ...boxStyle(RING_BOX),
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${main}, ${second}, transparent 45%, ${main} 70%, ${second}, ${main})`,
          WebkitMaskImage: 'radial-gradient(closest-side, transparent 86%, #000 90%, #000 97%, transparent 100%)',
          maskImage: 'radial-gradient(closest-side, transparent 86%, #000 90%, #000 97%, transparent 100%)',
          filter: 'blur(3px)',
        }}
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 360, opacity: 1 }}
        transition={{ rotate: { duration: 9, repeat: Infinity, ease: 'linear' }, opacity: { duration: 1.2 } }}
      />
      {/* 숨 쉬는 글로우 */}
      <motion.div
        className="absolute"
        style={{
          ...boxStyle(GLOW_BOX),
          borderRadius: '50%',
          boxShadow: `0 0 50px 14px ${main}aa, inset 0 0 40px 6px ${second}88`,
        }}
        initial={{ opacity: 0.4, scale: 0.96 }}
        animate={{ opacity: [0.45, 1, 0.45], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px 2px ${p.color}`,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: [0, -24] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
      <span
        className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/30 bg-black/50 px-3 py-1 text-[10px] font-bold tracking-[0.3em] text-white backdrop-blur-sm"
        style={{ boxShadow: `0 0 18px ${main}` }}
      >
        AURA · {label}
      </span>
    </div>
  );
}

function Spectrum({ id, second }: { id: AuraId; second: AuraId }) {
  return (
    <div className="flex items-end justify-between gap-1">
      {SPECTRUM.map((key, i) => {
        const aura = AURAS[key];
        const isMain = key === id;
        const isSecond = key === second;
        return (
          <div key={key} className="flex flex-1 flex-col items-center gap-1.5">
            <motion.span
              className="rounded-full"
              style={{
                backgroundColor: aura.color,
                boxShadow: isMain ? `0 0 18px 4px ${aura.color}` : undefined,
                opacity: isMain || isSecond ? 1 : 0.35,
              }}
              initial={{ width: 12, height: 12 }}
              animate={{ width: isMain ? 30 : isSecond ? 18 : 12, height: isMain ? 30 : isSecond ? 18 : 12 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.4 + i * 0.06 }}
            />
            <span className={isMain ? 'text-[11px] font-bold text-white' : 'text-[10px] text-slate-500'}>{aura.ko}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const { seed, id, second, mood, profile, intensity } = readAura(answers);
  const aura = AURAS[id];
  const secondAura = AURAS[second];

  return (
    <ResultShell
      eyebrow="나의 오라 컬러"
      title={`${aura.ko} 오라 · ${aura.nickname}`}
      description={aura.desc}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="오라 다시 읽기"
    >
      {capture && (
        <div className="relative">
          <div
            className="absolute -inset-6 rounded-[3rem] opacity-60 blur-3xl"
            style={{ background: `radial-gradient(circle, ${aura.color}, ${secondAura.color} 55%, transparent 75%)` }}
            aria-hidden="true"
          />
          <ProcessedPhoto
            src={capture.image}
            look={auraLook(aura.color, secondAura.color)}
            className="relative aspect-[3/4] w-64 rounded-[2rem] border border-white/15 sm:w-72"
            alt={`${aura.ko} 오라 아트`}
            delayMs={1000}
          >
            <AuraOverlay main={aura.color} second={secondAura.color} seed={seed} label={aura.label} />
          </ProcessedPhoto>
        </div>
      )}

      <p className="max-w-md text-xs text-slate-400 [word-break:keep-all]">
        오늘의 기분 <span className="font-semibold text-slate-200">{mood.emoji} {mood.label}</span> 에너지가 섞여{' '}
        <span className="font-semibold" style={{ color: secondAura.color }}>{secondAura.ko}</span> 빛이 가장자리에 번지고 있어요
      </p>

      <Panel title="오라 스펙트럼">
        <Spectrum id={id} second={second} />
        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
          <span className="text-slate-400">오라 선명도</span>
          <span className="font-semibold" style={{ color: aura.color }}>{intensity}%</span>
        </div>
      </Panel>

      <Panel title="에너지 프로필">
        <ScoreBars color={aura.color} items={PROFILE_LABELS.map((label, i) => ({ label, value: profile[i]! }))} />
      </Panel>

      <TraitChips title="오라 키워드" items={aura.keywords.map((k) => `#${k}`)} />

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {[
          { title: '찰떡 궁합 오라', key: aura.match, note: '함께 있으면 서로를 채워줘요' },
          { title: '자극을 주는 오라', key: aura.spark, note: '새로운 영감을 불어넣어요' },
        ].map((item) => {
          const other = AURAS[item.key];
          return (
            <div key={item.title} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
              <p className="text-[11px] font-medium text-slate-500">{item.title}</p>
              <div className="relative h-12 w-16" aria-hidden="true">
                <span className="absolute left-0 top-0 h-12 w-12 rounded-full opacity-80 mix-blend-screen blur-[2px]" style={{ backgroundColor: aura.color }} />
                <span className="absolute right-0 top-0 h-12 w-12 rounded-full opacity-80 mix-blend-screen blur-[2px]" style={{ backgroundColor: other.color }} />
              </div>
              <p className="text-sm font-semibold text-white">{other.ko} 오라</p>
              <p className="text-[11px] leading-relaxed text-slate-400 [word-break:keep-all]">
                {other.nickname} · {item.note}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="w-full max-w-md rounded-2xl border p-4 text-left"
        style={{ borderColor: `${aura.color}55`, background: `linear-gradient(135deg, ${aura.color}22, transparent 70%)` }}
      >
        <p className="text-xs text-slate-400">오늘의 오라 충전법</p>
        <p className="mt-1 text-sm font-semibold text-white">🔋 {aura.charge}</p>
        <p className="mt-2 text-[11px] text-slate-500">친구와 함께 찍으면 두 사람의 오라 궁합도 볼 수 있어요 (행사 풀 버전)</p>
      </div>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'aura-reading',
    targetSlug: 'ai-aura-reading',
    industryId: 'festival',
    analyzeEmoji: '🌈',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'face',
    analyzeMessages: ['표정 에너지 측정 중', '감정 파장 스펙트럼 분해 중', '7가지 오라 유형과 비교 중', '오라 아트 채색 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '표정과 분위기를 읽어볼게요',
      subtitle: '편하게 미소 지으며 카메라를 바라봐 주세요',
      mode: 'face',
      subject: '표정',
      scanLabels: ['얼굴·표정 영역 감지', '미소·눈빛 에너지 분석', '피부 톤 컬러 온도 추출', '주변 에너지장 스캔'],
      readouts: (c) => [
        { label: '컬러 온도', value: c.stats.warmth >= 55 ? '웜 에너지' : c.stats.warmth <= 45 ? '쿨 에너지' : '뉴트럴' },
        { label: '표정 에너지', value: `${58 + (c.seed % 38)}%` },
        { label: '분위기 밝기', value: c.stats.brightness > 55 ? '환함' : c.stats.brightness > 35 ? '은은함' : '차분함' },
        { label: '감지된 파장', value: '7 스펙트럼' },
      ],
    }),
    choiceStep({
      id: 'mood',
      title: '오늘 기분은 어떤가요?',
      subtitle: '지금의 감정이 오라 색에 섞여 들어가요',
      columns: 3,
      options: MOODS.map(({ id, emoji, label, desc }) => ({ id, emoji, label, desc })),
    }),
  ],
  computeResult: (answers) => readAura(answers).id,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'face');
    const { seed, id, second, intensity } = readAura(answers);
    const aura = AURAS[id];
    const secondAura = AURAS[second];
    return {
      kind: 'photo',
      photos: capture
        ? [
            {
              src: capture.image,
              look: auraLook(aura.color, secondAura.color),
              overlay: <AuraPrintOverlay main={aura.color} second={secondAura.color} seed={seed} />,
            },
          ]
        : [],
      title: `${aura.ko} 오라 · ${aura.nickname}`,
      caption: `${aura.keywords.map((k) => `#${k}`).join(' ')} · 오라 선명도 ${intensity}%`,
      badge: `AURA · ${aura.label}`,
      paper: 'black',
    };
  },
});
