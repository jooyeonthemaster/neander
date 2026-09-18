'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  ProcessedPhoto,
  ResultShell,
  answersSeed,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  getFields,
  seededPick,
  seededRandom,
  textStep,
  type PhotoLook,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type JobId = 'dev' | 'design' | 'marketing' | 'sales' | 'management';

interface Job {
  label: string;
  emoji: string;
  desc: string;
  accent: string;
  accent2: string;
  taglines: string[];
}

const JOBS: Record<JobId, Job> = {
  dev: {
    label: '개발',
    emoji: '💻',
    desc: '엔지니어 · 개발자',
    accent: '#22d3ee',
    accent2: '#6366f1',
    taglines: ['코드로 내일을 설계하는 사람', '버그보다 빠른 문제 해결사', '아이디어를 움직이게 만드는 사람'],
  },
  design: {
    label: '디자인',
    emoji: '🎨',
    desc: '디자이너 · 크리에이터',
    accent: '#f472b6',
    accent2: '#f59e0b',
    taglines: ['보이지 않는 것을 보이게 하는 사람', '디테일로 마음을 움직이는 사람', '경험을 그리는 사람'],
  },
  marketing: {
    label: '마케팅',
    emoji: '📣',
    desc: '마케터 · 브랜드',
    accent: '#fb923c',
    accent2: '#ef4444',
    taglines: ['브랜드에 목소리를 입히는 사람', '마음을 여는 스토리텔러', '숫자와 감성을 잇는 사람'],
  },
  sales: {
    label: '영업',
    emoji: '🤝',
    desc: '세일즈 · 파트너십',
    accent: '#34d399',
    accent2: '#0ea5e9',
    taglines: ['신뢰로 길을 여는 사람', '고객의 내일을 함께 고민하는 파트너', '만남을 기회로 바꾸는 사람'],
  },
  management: {
    label: '경영',
    emoji: '📈',
    desc: '리더 · 기획 · 경영지원',
    accent: '#fbbf24',
    accent2: '#a78bfa',
    taglines: ['팀의 방향을 밝히는 사람', '큰 그림을 현실로 만드는 사람', '사람과 숫자를 함께 보는 리더'],
  },
};

const JOB_ORDER: JobId[] = ['dev', 'design', 'marketing', 'sales', 'management'];

type DesignId = 'minimal' | 'bold' | 'premium';

const DESIGNS: { id: DesignId; name: string; desc: string }[] = [
  { id: 'minimal', name: '미니멀 화이트', desc: '여백과 타이포로 신뢰감을' },
  { id: 'bold', name: '볼드 컬러블록', desc: '직무 컬러로 강렬한 첫인상을' },
  { id: 'premium', name: '다크 프리미엄', desc: '골드 포일로 품격 있게' },
];

const GOLD = '#e7c77a';

/** 결과 화면에서 처음 골라져 있는 디자인 — 출력물도 이 명함으로 뽑는다 */
const DEFAULT_DESIGN: DesignId = 'bold';

/* ── Helpers ───────────────────────────────────────────── */

interface CardInfo {
  name: string;
  title: string;
  company: string;
  email: string;
  tagline: string;
  job: Job;
  jobId: JobId;
  seed: number;
}

function infoOf(answers: DemoAnswers): CardInfo {
  const fields = getFields<string>(answers, 'info');
  const jobId = (getChoice(answers, 'job') as JobId | undefined) ?? 'dev';
  const job = JOBS[jobId] ?? JOBS.dev;
  const seed = answersSeed(answers);
  return {
    name: (fields.name ?? '').trim() || '김네안',
    title: (fields.title ?? '').trim() || '프로덕트 매니저',
    company: (fields.company ?? '').trim() || 'NEANDER',
    email: (fields.email ?? '').trim(),
    tagline: seededPick(seed, 'tagline', job.taglines),
    job,
    jobId: JOBS[jobId] ? jobId : 'dev',
    seed,
  };
}

function lookFor(design: DesignId, job: Job): PhotoLook {
  if (design === 'minimal') return { adjust: { saturation: 0.08, contrast: 1.12, brightness: 1.06 }, grain: 6 };
  if (design === 'bold') return { adjust: { contrast: 1.15 }, effect: { kind: 'duotone', dark: '#0f172a', light: job.accent } };
  return { adjust: { contrast: 1.2, brightness: 0.95 }, effect: { kind: 'duotone', dark: '#1c1917', light: '#f5d98b' }, vignette: 0.3 };
}

/* ── Job motifs ────────────────────────────────────────── */

function Motif({ jobId, color }: { jobId: JobId; color: string }) {
  return (
    <svg viewBox="0 0 200 110" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <g stroke={color} fill="none" strokeWidth="1.2" opacity="0.28">
        {jobId === 'dev' && (
          <>
            <text x="120" y="42" fill={color} stroke="none" fontSize="34" fontFamily="monospace" fontWeight="700">
              {'</>'}
            </text>
            <text x="140" y="92" fill={color} stroke="none" fontSize="12" fontFamily="monospace">
              {'01 10 11'}
            </text>
            {Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={110 + i * 15} cy="104" r="1.4" fill={color} stroke="none" />
            ))}
          </>
        )}
        {jobId === 'design' && (
          <>
            <circle cx="160" cy="36" r="24" />
            <rect x="118" y="56" width="34" height="34" transform="rotate(12 135 73)" />
            <path d="M170 98 L190 64 L200 98 Z" />
            <circle cx="160" cy="36" r="3" fill={color} stroke="none" />
          </>
        )}
        {jobId === 'marketing' && (
          <>
            {[14, 28, 42, 56, 70].map((r) => (
              <path key={r} d={`M 200 ${55 - r} A ${r} ${r} 0 0 0 200 ${55 + r}`} transform="translate(-10 0)" />
            ))}
            <circle cx="190" cy="55" r="4" fill={color} stroke="none" />
          </>
        )}
        {jobId === 'sales' && (
          <>
            {[
              [120, 30, 150, 60],
              [150, 60, 185, 25],
              [150, 60, 175, 95],
              [120, 30, 130, 88],
              [130, 88, 175, 95],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
            {[
              [120, 30],
              [150, 60],
              [185, 25],
              [175, 95],
              [130, 88],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="none" />
            ))}
          </>
        )}
        {jobId === 'management' && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={120 + i * 15} y={96 - (i + 1) * 13} width="9" height={(i + 1) * 13} fill={color} fillOpacity="0.4" stroke="none" />
            ))}
            <path d="M118 80 L140 66 L158 72 L190 30" strokeWidth="2" />
            <path d="M182 30 H190 V38" strokeWidth="2" />
          </>
        )}
      </g>
    </svg>
  );
}

/* ── Card designs ──────────────────────────────────────── */

function CardFace({ design, info, src }: { design: DesignId; info: CardInfo; src: string }) {
  const look = lookFor(design, info.job);

  if (design === 'minimal') {
    return (
      <div className="relative flex h-full w-full bg-[#fafaf9] p-4 text-left text-slate-900 sm:p-5">
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400">{info.company}</p>
          <p className="mt-auto truncate text-xl font-bold tracking-tight sm:text-3xl">{info.name}</p>
          <p className="truncate text-[11px] text-slate-500 sm:text-sm">
            {info.title} · {info.job.label}
          </p>
          <div className="mt-2 h-px w-10" style={{ backgroundColor: info.job.accent2 }} />
          <p className="mt-2 truncate text-[10px] text-slate-500 sm:text-xs">{info.email || info.tagline}</p>
        </div>
        <ProcessedPhoto src={src} look={look} className="ml-3 aspect-square h-16 shrink-0 self-start rounded-full sm:h-24" imgClassName="object-[50%_35%]" alt={`${info.name} 미니멀 명함 사진`} delayMs={500} />
        <span className="absolute bottom-4 right-4 font-display text-lg font-extrabold text-slate-200 sm:bottom-5 sm:right-5">
          {info.name.slice(0, 1)}
        </span>
      </div>
    );
  }

  if (design === 'bold') {
    return (
      <div className="relative flex h-full w-full bg-slate-950 text-left">
        <div className="relative w-[40%] shrink-0" style={{ background: `linear-gradient(160deg, ${info.job.accent}, ${info.job.accent2})` }}>
          <ProcessedPhoto src={src} look={look} className="absolute inset-0 h-full w-full mix-blend-luminosity" imgClassName="object-[50%_35%]" alt={`${info.name} 볼드 명함 사진`} delayMs={500} />
          <span className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white">
            {info.job.emoji} {info.job.label}
          </span>
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <Motif jobId={info.jobId} color={info.job.accent} />
          <p className="relative text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: info.job.accent }}>
            {info.company}
          </p>
          <p className="relative mt-auto truncate text-2xl font-black leading-tight text-white sm:text-4xl">{info.name}</p>
          <p className="relative truncate text-xs font-semibold sm:text-sm" style={{ color: info.job.accent }}>
            {info.title}
          </p>
          <p className="relative mt-1.5 line-clamp-1 text-[10px] text-slate-400 sm:text-xs">{info.email || info.tagline}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center gap-4 bg-[#0c0a09] p-4 text-left sm:p-5" style={{ color: GOLD }}>
      <div className="pointer-events-none absolute inset-2 rounded-lg border" style={{ borderColor: `${GOLD}55` }} aria-hidden="true" />
      <div className="relative shrink-0 rounded-xl p-[2px]" style={{ background: `linear-gradient(135deg, ${GOLD}, #7c5e1f, ${GOLD})` }}>
        <ProcessedPhoto src={src} look={look} className="aspect-[3/4] w-16 rounded-[10px] sm:w-28" imgClassName="object-[50%_35%]" alt={`${info.name} 프리미엄 명함 사진`} delayMs={500} />
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="text-[8px] uppercase tracking-[0.4em] opacity-70 sm:text-[10px]">{info.company}</p>
        <p className="mt-1.5 truncate font-serif text-xl font-semibold tracking-wide sm:text-3xl" style={{ textShadow: `0 0 12px ${GOLD}44` }}>
          {info.name}
        </p>
        <p className="truncate text-[11px] opacity-80 sm:text-sm">{info.title}</p>
        <div className="my-2 h-px w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
        <p className="truncate text-[9px] italic opacity-70 sm:text-xs">“{info.tagline}”</p>
      </div>
      {/* 포일 반짝임 */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,236,179,0.18), transparent)' }}
        initial={{ left: '-40%' }}
        animate={{ left: '130%' }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
        aria-hidden="true"
      />
    </div>
  );
}

/** 장식용 QR 모양 패턴 (스캔되지 않음) */
function QrPattern({ seed, color }: { seed: number; color: string }) {
  const N = 21;
  // 세 모서리의 파인더 패턴 + 여백 칸은 비워 둔다
  const reserved = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  const cells: [number, number][] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!reserved(x, y) && seededRandom(seed, `q${x}-${y}`) > 0.52) cells.push([x, y]);
    }
  }
  const eyes: [number, number][] = [
    [0, 0],
    [N - 7, 0],
    [0, N - 7],
  ];
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} className="h-full w-full" aria-hidden="true">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#ffffff" rx="1" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.05} y={y + 0.05} width="0.9" height="0.9" rx="0.2" fill="#0f172a" />
      ))}
      {eyes.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x + 0.5} y={y + 0.5} width="6" height="6" rx="1.4" fill="none" stroke="#0f172a" strokeWidth="1" />
          <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.8" fill={color} />
        </g>
      ))}
    </svg>
  );
}

function CardBack({ info }: { info: CardInfo }) {
  return (
    <div className="flex h-full w-full items-center gap-4 bg-slate-900 p-4 text-left sm:p-5">
      <div className="aspect-square h-[78%] shrink-0 rounded-lg bg-white p-1.5">
        <QrPattern seed={info.seed} color={info.job.accent} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: info.job.accent }}>
          Digital Card
        </p>
        <p className="mt-1 truncate text-lg font-bold text-white">{info.name}</p>
        <p className="truncate text-[11px] text-slate-400">
          {info.title} · {info.company}
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500 [word-break:keep-all]">스캔하면 연락처가 저장되는 디지털 명함이에요</p>
      </div>
    </div>
  );
}

/* ── Print overlay (300×400) ──────────────────────────── */

/** 글자 폭 어림 (em) — 한글·한자 1, 라틴 대문자·숫자 0.68, 공백 0.3, 그 외 0.55 */
function textEm(text: string): number {
  let em = 0;
  for (const ch of text) {
    if (/[ᄀ-ᇿ　-鿿가-힯＀-￯]/.test(ch)) em += 1;
    else if (/[A-Z0-9@]/.test(ch)) em += 0.68;
    else if (ch === ' ') em += 0.3;
    else em += 0.55;
  }
  return em;
}

/** 폭에 맞춰 글자 크기를 줄이고, 최소 크기로도 넘치면 textLength로 눌러 담는다 */
function fitText(text: string, maxWidth: number, maxSize: number, minSize: number, letterSpacing = 0) {
  const n = [...text].length;
  const size = Math.max(minSize, Math.min(maxSize, (maxWidth - letterSpacing * n) / Math.max(0.5, textEm(text))));
  const width = textEm(text) * size + letterSpacing * n;
  return {
    fontSize: Number(size.toFixed(2)),
    ...(width > maxWidth ? { textLength: maxWidth, lengthAdjust: 'spacingAndGlyphs' as const } : {}),
  };
}

const CARD_W = 250;
const CARD_H = (CARD_W * 5) / 9;
const CARD_PHOTO_W = CARD_W * 0.4;
const CARD_PAD = 12;

/** '#rrggbb' → 0–1 채널 */
function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** 볼드 컬러블록 명함을 사진 아래쪽에 살짝 기울여 얹는다 (결과 화면 CardFace 'bold'와 같은 구성) */
function CardPrintOverlay({ info, src }: { info: CardInfo; src: string }) {
  // 명함 속 사진도 결과 화면처럼 듀오톤 → 직무 그라디언트 위에 luminosity로 얹는다
  const look = lookFor(DEFAULT_DESIGN, info.job);
  const duo = look.effect?.kind === 'duotone' ? look.effect : { dark: '#0f172a', light: info.job.accent };
  const [dark, light] = [channels(duo.dark), channels(duo.light)];
  const textX = CARD_PHOTO_W + CARD_PAD;
  const textW = CARD_W - CARD_PHOTO_W - CARD_PAD * 2;
  const company = info.company.toUpperCase();
  const contact = info.email || info.tagline;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" fontFamily="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif">
      <defs>
        <linearGradient id="bcp-accent" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={info.job.accent} />
          <stop offset="1" stopColor={info.job.accent2} />
        </linearGradient>
        <clipPath id="bcp-card">
          <rect width={CARD_W} height={CARD_H} rx="8" />
        </clipPath>
        <filter id="bcp-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id="bcp-duotone" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={`${dark[0]} ${light[0]}`} />
            <feFuncG type="table" tableValues={`${dark[1]} ${light[1]}`} />
            <feFuncB type="table" tableValues={`${dark[2]} ${light[2]}`} />
          </feComponentTransfer>
        </filter>
      </defs>
      <g transform={`translate(25 ${400 - CARD_H - 16}) rotate(-3 ${CARD_W / 2} ${CARD_H / 2})`}>
        <rect width={CARD_W} height={CARD_H} rx="8" fill="#020617" filter="url(#bcp-shadow)" />
        <g clipPath="url(#bcp-card)">
          <rect width={CARD_PHOTO_W} height={CARD_H} fill="url(#bcp-accent)" />
          <g style={{ mixBlendMode: 'luminosity' }}>
            <image href={src} width={CARD_PHOTO_W} height={CARD_H} preserveAspectRatio="xMidYMid slice" filter="url(#bcp-duotone)" />
          </g>
          <rect x="6" y={CARD_H - 20} width={textEm(info.job.label) * 7.5 + 10} height="13" rx="3" fill="rgba(0,0,0,0.5)" />
          <text x="11" y={CARD_H - 10.5} fontSize="7.5" fontWeight="700" fill="#fff">
            {info.job.label}
          </text>
          <svg x={CARD_PHOTO_W} width={CARD_W - CARD_PHOTO_W} height={CARD_H}>
            <Motif jobId={info.jobId} color={info.job.accent} />
          </svg>
          <text x={textX} y="22" fontWeight="700" letterSpacing="1.8" fill={info.job.accent} {...fitText(company, textW, 7, 5, 1.8)}>
            {company}
          </text>
          <text x={textX} y={CARD_H - 40} fontWeight="900" fill="#fff" {...fitText(info.name, textW, 26, 13)}>
            {info.name}
          </text>
          <text x={textX} y={CARD_H - 24} fontWeight="600" fill={info.job.accent} {...fitText(info.title, textW, 10, 7)}>
            {info.title}
          </text>
          <text x={textX} y={CARD_H - 11} fill="#94a3b8" {...fitText(contact, textW, 7, 5.5)}>
            {contact}
          </text>
        </g>
      </g>
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function CardGallery({ info, src, color }: { info: CardInfo; src: string; color: string }) {
  const [picked, setPicked] = useState<DesignId>(DEFAULT_DESIGN);
  const [flipped, setFlipped] = useState(false);
  const pickedMeta = DESIGNS.find((d) => d.id === picked)!;
  const pick = (id: DesignId) => {
    setPicked(id);
    setFlipped(false);
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <div className="w-full space-y-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">AI가 디자인한 명함 3종 · 마음에 드는 걸 골라주세요</p>
        {DESIGNS.map((d, i) => {
          const on = d.id === picked;
          return (
            <motion.div
              key={d.id}
              role="button"
              tabIndex={0}
              onClick={() => pick(d.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pick(d.id);
                }
              }}
              aria-pressed={on}
              aria-label={`${d.name} 디자인 선택`}
              initial={{ opacity: 0, y: 24, rotate: i % 2 ? 1.5 : -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.2 + i * 0.2, type: 'spring', stiffness: 110, damping: 15 }}
              whileHover={{ y: -3 }}
              className="block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-200">
                  {String.fromCharCode(65 + i)} · {d.name}
                  <span className="ml-1.5 font-normal text-slate-500">{d.desc}</span>
                </span>
                {on && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                    ✓ 선택됨
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'relative mx-auto aspect-[9/5] w-full overflow-hidden rounded-xl shadow-xl shadow-black/40 transition-all',
                  on ? 'ring-2 ring-offset-2 ring-offset-slate-950' : 'opacity-80 hover:opacity-100'
                )}
                style={on ? ({ '--tw-ring-color': color } as React.CSSProperties) : undefined}
              >
                <CardFace design={d.id} info={info} src={src} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">내 명함 · {pickedMeta.name}</p>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
          >
            {flipped ? '앞면 보기' : '뒤집어서 QR 보기'}
          </button>
        </div>
        <div className="[perspective:1200px]">
          <motion.div
            className="relative mx-auto aspect-[9/5] w-full [transform-style:preserve-3d]"
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-xl shadow-2xl shadow-black/50 [backface-visibility:hidden]">
              <CardFace key={picked} design={picked} info={info} src={src} />
            </div>
            <div className="absolute inset-0 overflow-hidden rounded-xl shadow-2xl shadow-black/50 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <CardBack info={info} />
            </div>
          </motion.div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-400">🖨️ 인쇄용 300dpi 파일 준비 완료 · 현장에서 즉석 출력돼요</span>
        </div>
        <p className="mt-2 text-[10px] text-slate-600">QR은 데모용 장식 패턴이에요. 실제 행사에선 스캔 가능한 디지털 명함 QR이 발급돼요.</p>
      </div>
    </div>
  );
}

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const info = infoOf(answers);
  const warm = (capture?.stats.warmth ?? 50) >= 50;

  return (
    <ResultShell
      eyebrow={`AI 명함 디자이너 · ${info.job.emoji} ${info.job.label}`}
      title={`“${info.tagline}”`}
      description={`${info.name} 님의 ${warm ? '따뜻하고 친근한' : '또렷하고 시원한'} 인상과 ${info.job.label} 직무 키워드를 읽어 세상에 하나뿐인 명함 3종을 디자인했어요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 디자인하기"
    >
      {capture ? (
        <CardGallery info={info} src={capture.image} color={pillarColor} />
      ) : (
        <p className="text-sm text-slate-400">사진이 없어 명함을 만들 수 없어요. 다시 촬영해 주세요.</p>
      )}
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'business-card',
    targetSlug: 'ai-business-card',
    industryId: 'corporate',
    analyzeEmoji: '💼',
    analyzeDurationMs: 3500,
    analyzeMessages: ['인상 키워드 추출 중', '직무 컬러 팔레트 생성 중', '레이아웃 3종 조판 중', '디지털 명함 QR 만드는 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '명함에 들어갈 사진을 찍어요',
      subtitle: '밝은 표정으로 정면을 바라봐 주세요',
      mode: 'face',
      subject: '얼굴',
      scanLabels: ['얼굴 영역 분리', '인상 키워드 추출', '프로필 조명 보정', '레이아웃 후보 생성'],
      readouts: (c) => [
        { label: '인상 키워드', value: c.stats.warmth >= 50 ? '따뜻함 · 친근함' : '또렷함 · 신뢰감' },
        { label: '추천 톤', value: c.stats.brightness > 55 ? '라이트 톤' : '딥 톤' },
      ],
    }),
    textStep({
      id: 'info',
      title: '명함에 넣을 정보를 알려주세요',
      subtitle: '데모에서만 쓰이고 저장되지 않아요',
      fields: [
        { id: 'name', label: '이름', placeholder: '예: 김네안', maxLength: 10 },
        { id: 'title', label: '직함', placeholder: '예: 프로덕트 매니저', maxLength: 18 },
        { id: 'company', label: '회사', placeholder: '예: NEANDER', maxLength: 18 },
        { id: 'email', label: '이메일', placeholder: '예: hello@company.com', maxLength: 32, optional: true },
      ],
    }),
    choiceStep({
      id: 'job',
      title: '어떤 일을 하고 계신가요?',
      subtitle: '직무에 맞춰 컬러와 그래픽 모티프가 달라져요',
      columns: 3,
      options: JOB_ORDER.map((id) => ({ id, emoji: JOBS[id].emoji, label: JOBS[id].label, desc: JOBS[id].desc })),
    }),
  ],
  computeResult: (answers) => infoOf(answers).jobId,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'face');
    const info = infoOf(answers);
    const design = DESIGNS.find((d) => d.id === DEFAULT_DESIGN)!;
    return {
      kind: 'photo',
      photos: capture
        ? [{ src: capture.image, look: lookFor(DEFAULT_DESIGN, info.job), overlay: <CardPrintOverlay info={info} src={capture.image} /> }]
        : [],
      title: info.name,
      caption: `${info.title} · ${info.company} · ${design.name} 명함`,
      paper: 'white',
    };
  },
});
