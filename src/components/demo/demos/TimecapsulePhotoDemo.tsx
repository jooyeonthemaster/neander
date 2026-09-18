'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  FACE_POINTS,
  InfoGrid,
  Panel,
  ProcessedPhoto,
  ResultShell,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  getFields,
  textStep,
  type PhotoLook,
  type PhotoPaint,
} from '../kit';

/* ── Aging looks ───────────────────────────────────────── */

type Years = 10 | 20 | 30;
const YEARS: Years[] = [10, 20, 30];

const { eyeL, eyeR, cheekL, cheekR, forehead } = FACE_POINTS;

/** 강도(0–1)에 따라 눈 밑 그늘·팔자 주름·이마·헤어 톤을 점점 진하게 칠한다 */
function agingPaints(k: number): PhotoPaint[] {
  const shade = '#6b4f3a';
  return [
    { x: eyeL.x, y: eyeL.y + 6, rx: 8, ry: 3.2, color: shade, alpha: 0.1 + k * 0.22, blend: 'multiply' },
    { x: eyeR.x, y: eyeR.y + 6, rx: 8, ry: 3.2, color: shade, alpha: 0.1 + k * 0.22, blend: 'multiply' },
    { x: 41, y: 58, rx: 3, ry: 8, color: shade, alpha: 0.06 + k * 0.22, blend: 'multiply' },
    { x: 59, y: 58, rx: 3, ry: 8, color: shade, alpha: 0.06 + k * 0.22, blend: 'multiply' },
    { x: forehead.x, y: forehead.y + 4, rx: 18, ry: 4, color: shade, alpha: k * 0.2, blend: 'multiply' },
    { x: cheekL.x, y: cheekL.y + 8, rx: 9, ry: 6, color: shade, alpha: k * 0.15, blend: 'multiply' },
    { x: cheekR.x, y: cheekR.y + 8, rx: 9, ry: 6, color: shade, alpha: k * 0.15, blend: 'multiply' },
    // 헤어 라인 — 채도를 빼고 밝게 해서 희끗희끗하게
    { x: 50, y: 6, rx: 48, ry: 18, color: '#a8a29e', alpha: 0.2 + k * 0.6, blend: 'color' },
    { x: 50, y: 6, rx: 48, ry: 18, color: '#e7e5e4', alpha: k * 0.55, blend: 'screen' },
    { x: 22, y: 34, rx: 9, ry: 16, color: '#e7e5e4', alpha: k * 0.45, blend: 'screen' },
    { x: 78, y: 34, rx: 9, ry: 16, color: '#e7e5e4', alpha: k * 0.45, blend: 'screen' },
  ];
}

const AGING: Record<Years, { label: string; look: PhotoLook; k: number; note: string }> = {
  10: {
    label: '10년 후',
    k: 0.25,
    note: '눈가에 웃음 주름이 살짝, 인상은 더 또렷하게',
    look: {
      adjust: { saturation: 0.88, contrast: 1.06, brightness: 0.99, warmth: 0.04 },
      paints: agingPaints(0.25),
      grain: 8,
      vignette: 0.12,
    },
  },
  20: {
    label: '20년 후',
    k: 0.6,
    note: '희끗한 머리카락과 깊어진 눈빛',
    look: {
      adjust: { saturation: 0.7, contrast: 1.12, brightness: 0.97, sepia: 0.18 },
      paints: agingPaints(0.6),
      grain: 16,
      vignette: 0.25,
    },
  },
  30: {
    label: '30년 후',
    k: 1,
    note: '은빛 머리와 연륜이 묻어나는 미소',
    look: {
      adjust: { saturation: 0.45, contrast: 1.2, brightness: 0.95, sepia: 0.4 },
      paints: agingPaints(1),
      grain: 26,
      vignette: 0.4,
    },
  },
};

/** 잔주름이 보이기 시작하는 에이징 강도 */
const WRINKLE_FROM = 0.5;

/** 눈가·이마 잔주름 선 (0–100 좌표, 가로세로 따로 늘려 쓴다) */
function WrinkleStrokes({ k }: { k: number }) {
  return (
    <g stroke="#5b4636" strokeWidth="0.35" fill="none" strokeLinecap="round" opacity={0.25 + (k - WRINKLE_FROM) * 0.5}>
      <path d="M40 27 Q50 25.5 60 27" />
      <path d="M42 30 Q50 28.8 58 30" />
      <path d="M30 40 L27 38.5 M30 41.5 L26.5 41.5 M30 43 L27 44.5" />
      <path d="M70 40 L73 38.5 M70 41.5 L73.5 41.5 M70 43 L73 44.5" />
    </g>
  );
}

/** 눈가·이마 잔주름 (얼굴 좌표계 %) */
function WrinkleLines({ k }: { k: number }) {
  if (k < WRINKLE_FROM) return null;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <WrinkleStrokes k={k} />
    </svg>
  );
}

/** 출력물용 잔주름 — 300×400 프레임에 화면과 같은 비율로 늘린다 */
function PrintWrinkles({ k }: { k: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="900" height="1200">
      <g transform="scale(3 4)">
        <WrinkleStrokes k={k} />
      </g>
    </svg>
  );
}

function parseYears(answers: DemoAnswers): Years {
  const v = Number(getChoice(answers, 'open'));
  return v === 20 || v === 30 ? v : 10;
}

function letterOf(answers: DemoAnswers) {
  const fields = getFields<string>(answers, 'letter');
  return {
    message: (fields.message ?? '').trim() || '지금의 나는 꿈을 향해 열심히 달리고 있어. 그때의 나도 웃고 있기를!',
    from: (fields.from ?? '').trim() || '지금의 나',
  };
}

/** 한 줄에 들어가게 자르고 말줄임표를 붙인다 */
function clip(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, Math.max(1, max - 1))}…` : flat;
}

/** 인화지 캡션 한 줄에 들어가는 대략적인 글자 수 */
const CAPTION_CHARS = 34;

/* ── Compare slider ───────────────────────────────────── */

function AgeCompare({ image, years, nowYear }: { image: string; years: Years; nowYear: number }) {
  const [pos, setPos] = useState(50);
  const age = AGING[years];
  return (
    <div className="relative aspect-[3/4] w-64 overflow-hidden rounded-2xl border border-slate-700 shadow-2xl shadow-black/50 sm:w-72">
      <ProcessedPhoto key={years} src={image} look={age.look} className="absolute inset-0 h-full w-full" alt={`AI가 예측한 ${age.label}의 모습`} delayMs={900}>
        <WrinkleLines k={age.k} />
      </ProcessedPhoto>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="지금의 모습"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-lg">
          ⇆
        </span>
      </div>
      <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
        지금 · {nowYear}
      </span>
      <span className="pointer-events-none absolute right-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
        {age.label} · {nowYear + years}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="지금과 미래 모습 비교"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

/* ── Envelope ──────────────────────────────────────────── */

function Envelope({
  message,
  from,
  years,
  dates,
  color,
}: {
  message: string;
  from: string;
  years: Years;
  dates: { now: string; open: string; days: number; nowYear: number };
  color: string;
}) {
  const [sealed, setSealed] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative w-[280px]"
        initial={false}
        animate={{ height: sealed ? 190 : 360 }}
        transition={{ duration: 0.6, delay: sealed ? 0.7 : 0, ease: 'easeInOut' }}
      >
        {/* 편지 */}
        <motion.div
          className="absolute left-[20px] top-0 z-10 h-[230px] w-[240px] rounded-sm bg-[#fffbeb] p-4 text-left shadow-lg"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent 0 23px, rgba(148,163,184,0.35) 23px 24px)',
            backgroundPosition: '0 42px',
          }}
          animate={sealed ? { y: 170, scale: 0.92, opacity: 0.0 } : { y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeIn' }}
        >
          <p className="font-serif text-sm font-bold text-slate-800">To. {dates.nowYear + years}년의 나에게</p>
          <p className="mt-3 line-clamp-5 whitespace-pre-line font-serif text-[13px] italic leading-6 text-slate-700 [word-break:keep-all]">
            {message}
          </p>
          <p className="absolute bottom-3 right-4 font-serif text-[11px] text-slate-500">
            From. {from} · {dates.now}
          </p>
        </motion.div>

        {/* 봉투 */}
        <div className="absolute inset-x-0 bottom-0 h-[180px]">
          {/* 뚜껑 */}
          <motion.svg
            viewBox="0 0 300 100"
            preserveAspectRatio="none"
            className="absolute inset-x-0 top-0 h-[100px] w-full"
            style={{ transformOrigin: '50% 0%', zIndex: sealed ? 30 : 0 }}
            initial={false}
            animate={{ scaleY: sealed ? 1 : -1 }}
            transition={{ duration: 0.5, delay: sealed ? 0.55 : 0 }}
            aria-hidden="true"
          >
            <path d="M0 0 L150 92 L300 0 Z" fill="#b8905f" stroke="#8a6a44" strokeWidth="1" />
          </motion.svg>
          {/* 몸통 */}
          <div className="absolute inset-0 z-20 overflow-hidden rounded-md bg-[#c8a174] shadow-2xl shadow-black/50">
            <svg viewBox="0 0 300 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 0 L150 100 L300 0 L300 180 L0 180 Z" fill="#d4b084" />
              <path d="M0 180 L150 92 L300 180" fill="none" stroke="#a9835a" strokeWidth="1" />
            </svg>
            {/* 우표 & 소인 */}
            <div className="absolute right-3 top-3 flex h-14 w-12 flex-col items-center justify-center border-2 border-dashed border-[#8a6a44] bg-[#fef3c7] text-center">
              <span className="text-lg leading-none">⏳</span>
              <span className="mt-0.5 text-[6px] font-bold tracking-wider text-[#8a6a44]">TIME CAPSULE</span>
            </div>
            <div className="absolute right-[4.5rem] top-10 flex h-14 w-14 -rotate-12 flex-col items-center justify-center rounded-full border-2 border-[#8a6a44]/60 text-center font-mono text-[7px] font-bold leading-tight text-[#8a6a44]/80">
              <span>{dates.now}</span>
              <span>NEANDER</span>
            </div>
            <div className="absolute bottom-4 left-5 text-left">
              <p className="font-serif text-sm font-bold text-[#5c4326]">To. {dates.nowYear + years}년의 나</p>
              <p className="mt-0.5 font-mono text-[11px] text-[#5c4326]/80">개봉일 {dates.open}</p>
            </div>
          </div>
          {/* 밀랍 봉인 */}
          <AnimatePresence>
            {sealed && (
              <motion.div
                className="absolute left-1/2 top-[70px] z-40 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full font-serif text-lg font-bold text-red-100 shadow-lg"
                style={{ background: 'radial-gradient(circle at 35% 35%, #ef4444, #991b1b 70%)' }}
                initial={{ scale: 2.5, opacity: 0, rotate: -40 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 1.05, type: 'spring', stiffness: 300, damping: 15 }}
              >
                N
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="mt-4 min-h-[56px] text-center">
        {!sealed ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSealed(true)}
            className="rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg"
            style={{ backgroundColor: color }}
          >
            🔒 타임캡슐 봉인하기
          </motion.button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
            <p className="font-display text-2xl font-extrabold text-white">D-{dates.days.toLocaleString('ko-KR')}</p>
            <p className="text-xs text-slate-400">봉인 완료! {dates.open}에 열어보세요</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── Result ────────────────────────────────────────────── */

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const years = parseYears(answers);
  const { message, from } = letterOf(answers);
  const [selected, setSelected] = useState<Years>(years);
  // 날짜는 결과가 처음 열릴 때 한 번만 계산한다
  const [dates] = useState(() => {
    const now = new Date();
    const open = new Date(now);
    open.setFullYear(now.getFullYear() + years);
    return {
      now: formatDate(now),
      open: formatDate(open),
      days: Math.round((open.getTime() - now.getTime()) / 86_400_000),
      nowYear: now.getFullYear(),
    };
  });

  return (
    <ResultShell
      eyebrow="AI 타임캡슐 포토"
      title={`${years}년 뒤의 나에게 보내는 편지`}
      description="AI가 지금의 얼굴에서 10·20·30년 뒤의 모습을 예측하고, 편지와 함께 타임캡슐에 담았어요."
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="새 타임캡슐 만들기"
    >
      {capture && (
        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <AgeCompare image={capture.image} years={selected} nowYear={dates.nowYear} />
          <p className="text-[11px] text-slate-500">사진을 좌우로 밀어 지금과 비교해 보세요</p>

          <div className="grid w-full grid-cols-3 gap-2.5">
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setSelected(y)}
                aria-pressed={selected === y}
                className={cn(
                  'rounded-2xl border p-1.5 text-center transition-colors',
                  selected === y ? 'bg-slate-900' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                )}
                style={selected === y ? { borderColor: pillarColor } : undefined}
              >
                <ProcessedPhoto src={capture.image} look={AGING[y].look} className="aspect-[3/4] w-full rounded-xl" alt={`${AGING[y].label} 모습`} delayMs={600 + y * 30}>
                  <WrinkleLines k={AGING[y].k} />
                </ProcessedPhoto>
                <p className="mt-1.5 text-xs font-bold text-white">
                  +{y}년 {y === years && '💌'}
                </p>
                <p className="text-[10px] text-slate-500">{dates.nowYear + y}년</p>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 [word-break:keep-all]">
            <span className="font-semibold text-slate-200">{AGING[selected].label}</span> · {AGING[selected].note}
          </p>
        </div>
      )}

      <Panel title="타임캡슐 봉투" className="px-3 sm:px-5">
        <div className="flex justify-center">
          <Envelope message={message} from={from} years={years} dates={dates} color={pillarColor} />
        </div>
      </Panel>

      <InfoGrid
        items={[
          { emoji: '📆', label: '개봉일', value: dates.open, desc: `${years}년 뒤 오늘` },
          { emoji: '🖼️', label: '사진 구성', value: '지금 + 미래 3컷', desc: '10·20·30년 후 에이징' },
          { emoji: '✉️', label: '패키징', value: '타임캡슐 봉투', desc: '사진과 편지를 함께 봉인' },
          { emoji: '📲', label: '디지털 보관', value: 'QR 코드 저장', desc: '실제 부스에서 사본을 받아요' },
        ]}
      />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'timecapsule-photo',
    targetSlug: 'ai-timecapsule-photo',
    industryId: 'education',
    analyzeEmoji: '⏳',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'face',
    analyzeMessages: ['얼굴 골격 구조 분석 중', '10년 후 모습 예측 중', '20·30년 후 에이징 계산 중', '타임캡슐 봉투에 담는 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '지금의 나를 기록해요',
      subtitle: '정면을 바라보고 편하게 웃어 주세요. 3초 뒤에 찍혀요',
      mode: 'face',
      subject: '얼굴',
      countdown: true,
      scanLabels: ['얼굴 영역 감지', '골격 구조 추정', '피부 결·탄력 분석', '에이징 기준점 설정'],
      readouts: (c) => [
        { label: '피부 톤', value: c.stats.warmth > 52 ? '웜' : '쿨' },
        { label: '기준점', value: '128개' },
      ],
    }),
    textStep({
      id: 'letter',
      title: '미래의 나에게 한마디',
      subtitle: '타임캡슐 편지에 그대로 담겨요',
      fields: [
        { id: 'message', label: '미래의 나에게', placeholder: '10년 뒤의 나, 지금도 꿈을 향해 가고 있니?', maxLength: 120, multiline: true },
        { id: 'from', label: '보내는 사람', placeholder: '예: 2026년의 하린', maxLength: 12, optional: true },
      ],
    }),
    choiceStep({
      id: 'open',
      title: '언제 열어볼까요?',
      subtitle: '고른 시점의 모습이 편지와 함께 봉인돼요',
      columns: 3,
      options: [
        { id: '10', emoji: '🌱', label: '10년 후', desc: '꿈을 향해 달리는 중' },
        { id: '20', emoji: '🌳', label: '20년 후', desc: '인생의 한가운데' },
        { id: '30', emoji: '🌅', label: '30년 후', desc: '오늘을 추억하는 날' },
      ],
    }),
  ],
  computeResult: (answers) => `open-${parseYears(answers)}`,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'face');
    const years = parseYears(answers);
    const { message, from } = letterOf(answers);
    return {
      kind: 'photo',
      photos: capture
        ? [
            { src: capture.image, label: '지금' },
            ...YEARS.map((y) => ({
              src: capture.image,
              look: AGING[y].look,
              label: y === years ? `💌 ${AGING[y].label}` : AGING[y].label,
              overlay: AGING[y].k >= WRINKLE_FROM ? <PrintWrinkles k={AGING[y].k} /> : undefined,
            })),
          ]
        : [],
      title: `${years}년 뒤의 나에게`,
      caption: `From. ${from} · “${clip(message, CAPTION_CHARS - from.length - 6)}”`,
      badge: 'TIME CAPSULE',
      paper: 'cream',
    };
  },
});
