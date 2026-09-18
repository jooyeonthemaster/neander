'use client';

import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  InfoGrid,
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
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type ThemeId = 'fairytale' | 'movie' | 'period' | 'travel';

const THEMES: Record<ThemeId, { label: string; emoji: string; desc: string; swatch: string; look: PhotoLook; tagline: string }> = {
  fairytale: {
    label: '동화',
    emoji: '🏰',
    desc: '꽃과 반짝임이 가득한 동화 속 한 장면',
    swatch: 'linear-gradient(135deg, #fbcfe8, #e9d5ff 50%, #fde68a)',
    look: {
      adjust: { brightness: 1.08, saturation: 1.1, contrast: 0.95, warmth: 0.08 },
      tint: { color: '#f9a8d4', alpha: 0.22, blend: 'soft-light' },
      vignette: 0.12,
    },
    tagline: '두 사람의 동화가 시작되는 날',
  },
  movie: {
    label: '영화',
    emoji: '🎬',
    desc: '시네마틱 컬러와 레터박스',
    swatch: 'linear-gradient(135deg, #0f766e, #1e293b 50%, #f97316)',
    look: {
      adjust: { contrast: 1.18, saturation: 0.9 },
      paints: [{ x: 50, y: 40, rx: 34, ry: 30, color: '#fb923c', alpha: 0.3, blend: 'soft-light' }],
      tint: { color: '#0d9488', alpha: 0.3, blend: 'soft-light' },
      grain: 14,
      vignette: 0.35,
    },
    tagline: '당신과 나, 주연은 둘뿐이에요',
  },
  period: {
    label: '시대극',
    emoji: '🕰️',
    desc: '세피아 톤과 앤티크 액자',
    swatch: 'linear-gradient(135deg, #78350f, #d6b98c 55%, #fef3c7)',
    look: { adjust: { sepia: 0.85, contrast: 1.08, brightness: 1.02 }, grain: 22, vignette: 0.45 },
    tagline: '시간이 흘러도 변치 않을 약속',
  },
  travel: {
    label: '여행지',
    emoji: '✈️',
    desc: '햇살 가득한 허니문 엽서',
    swatch: 'linear-gradient(135deg, #38bdf8, #fef08a 60%, #fb7185)',
    look: {
      adjust: { brightness: 1.08, saturation: 1.3, warmth: 0.18, contrast: 1.05 },
      tint: { color: '#fde68a', alpha: 0.18, blend: 'soft-light' },
      vignette: 0.1,
    },
    tagline: '함께라면 어디든 여행지예요',
  },
};

const SERIF = '"Nanum Myeongjo", "AppleMyungjo", "Batang", "Noto Serif KR", Georgia, "Times New Roman", serif';

interface Couple {
  names: string;
  date: string;
}

function getCouple(answers: DemoAnswers): Couple {
  const f = getFields<string>(answers, 'names');
  const a = (f.name1 ?? '').trim();
  const b = (f.name2 ?? '').trim();
  const names = a && b ? `${a} & ${b}` : a || b || 'Forever & Always';
  return { names, date: (f.date ?? '').trim() };
}

/* ── Ornaments ─────────────────────────────────────────── */

/** 80×80 꽃 장식 (결과 프레임 · 출력물 공용) */
function FloralCornerArt() {
  return (
    <>
      <g fill="#86efac" stroke="#15803d" strokeWidth="0.6">
        <ellipse cx="40" cy="12" rx="10" ry="4" transform="rotate(-20 40 12)" />
        <ellipse cx="12" cy="40" rx="4" ry="10" transform="rotate(-20 12 40)" />
        <ellipse cx="50" cy="26" rx="8" ry="3.4" transform="rotate(25 50 26)" />
        <ellipse cx="26" cy="50" rx="3.4" ry="8" transform="rotate(25 26 50)" />
      </g>
      <g fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.8">
        <circle cx="20.0" cy="13.0" r="7" />
        <circle cx="26.7" cy="17.8" r="7" />
        <circle cx="24.1" cy="25.7" r="7" />
        <circle cx="15.9" cy="25.7" r="7" />
        <circle cx="13.3" cy="17.8" r="7" />
      </g>
      <circle cx="20" cy="20" r="6.5" fill="#f472b6" />
      <path d="M17.5 20.5 a2.6 2.6 0 1 1 2.6 2.6 a4.4 4.4 0 0 1 -4.4 -4.4" fill="none" stroke="#be185d" strokeWidth="1.2" strokeLinecap="round" />
      <g>
        <circle cx="42" cy="8" r="6" fill="#fde68a" />
        <circle cx="42" cy="8" r="2.4" fill="#f59e0b" />
        <circle cx="8" cy="42" r="6" fill="#e9d5ff" />
        <circle cx="8" cy="42" r="2.4" fill="#a855f7" />
      </g>
      <g fill="#fbbf24">
        <path d="M60 14 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" />
        <path d="M16 62 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z" />
      </g>
    </>
  );
}

function FloralCorner({ className }: { className: string }) {
  return (
    <svg className={cn('pointer-events-none absolute h-20 w-20', className)} viewBox="0 0 80 80" aria-hidden="true">
      <FloralCornerArt />
    </svg>
  );
}

/** 48×48 금색 소용돌이 장식 */
function FlourishArt() {
  return (
    <>
      <path
        d="M4 44 C4 20 20 4 44 4 M10 44 C10 26 24 12 40 12 C30 16 26 24 30 30 C34 36 24 40 18 34"
        fill="none"
        stroke="#fcd34d"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="44" cy="4" r="2.5" fill="#fcd34d" />
      <circle cx="4" cy="44" r="2.5" fill="#fcd34d" />
    </>
  );
}

function Flourish({ className }: { className: string }) {
  return (
    <svg className={cn('pointer-events-none absolute h-12 w-12', className)} viewBox="0 0 48 48" aria-hidden="true">
      <FlourishArt />
    </svg>
  );
}

/** 120×120 허니문 입국 도장 */
function StampArt({ id, date }: { id: string; date: string }) {
  return (
    <>
      <defs>
        <path id={`${id}-ring`} d="M60 60 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0" />
      </defs>
      <g fill="none" stroke="#be123c" opacity="0.85">
        <circle cx="60" cy="60" r="54" strokeWidth="3" />
        <circle cx="60" cy="60" r="48" strokeWidth="1.2" />
        <circle cx="60" cy="60" r="30" strokeWidth="1.2" />
      </g>
      <text fill="#be123c" fontSize="10" fontWeight="700" letterSpacing="2.4" opacity="0.85">
        <textPath href={`#${id}-ring`}>HONEYMOON ★ APPROVED ★ LOVE ★</textPath>
      </text>
      <text x="60" y="58" textAnchor="middle" fontSize="18" fill="#be123c" opacity="0.85">
        ✈
      </text>
      <text x="60" y="74" textAnchor="middle" fontSize="8" fontWeight="700" fill="#be123c" opacity="0.85">
        {date || 'ARRIVED'}
      </text>
    </>
  );
}

function PassportStamp({ date }: { date: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="pointer-events-none absolute -right-4 -top-5 h-28 w-28 rotate-[14deg] drop-shadow" viewBox="0 0 120 120" aria-hidden="true">
      <StampArt id={id} date={date} />
    </svg>
  );
}

/* ── Frames ────────────────────────────────────────────── */

function Photo({ src, look }: { src: string; look: PhotoLook }) {
  return <ProcessedPhoto src={src} look={look} className="aspect-[3/4] w-full" alt="테마로 변환된 커플 사진" delayMs={1000} />;
}

function FairytaleFrame({ src, look, couple }: { src: string; look: PhotoLook; couple: Couple }) {
  return (
    <div className="relative w-72 rounded-[28px] bg-[#fffaf5] p-4 pb-5 shadow-2xl shadow-rose-950/40">
      <div className="relative overflow-hidden rounded-t-[120px] rounded-b-2xl border-[3px] border-[#e9c46a]">
        <Photo src={src} look={look} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pink-200/40 via-transparent to-transparent" />
      </div>
      <FloralCorner className="-left-5 -top-5" />
      <FloralCorner className="-right-5 -top-5 -scale-x-100" />
      <FloralCorner className="-bottom-5 -left-5 -scale-y-100" />
      <FloralCorner className="-bottom-5 -right-5 -scale-100" />
      <p className="mt-3 text-center text-[11px] italic tracking-[0.3em] text-rose-400" style={{ fontFamily: SERIF }}>
        Once Upon a Time
      </p>
      <p className="mt-1 text-center text-2xl font-bold text-rose-900" style={{ fontFamily: SERIF }}>
        {couple.names}
      </p>
      <p className="mt-1 text-center text-[11px] tracking-[0.25em] text-rose-400">{couple.date || '— HAPPILY EVER AFTER —'}</p>
    </div>
  );
}

function FilmHoles() {
  return (
    <div className="flex w-4 flex-col justify-between py-2" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="mx-auto h-3 w-2.5 rounded-[2px] bg-[#f5f5f4]/85" />
      ))}
    </div>
  );
}

function MovieFrame({ src, look, couple }: { src: string; look: PhotoLook; couple: Couple }) {
  return (
    <div className="flex w-80 max-w-full gap-1 rounded-md bg-[#0c0a09] px-1 shadow-2xl shadow-black/70">
      <FilmHoles />
      <div className="relative flex-1 overflow-hidden">
        <Photo src={src} look={look} />
        <div className="absolute inset-x-0 top-0 flex h-[13%] items-center justify-center bg-black">
          <p className="text-[9px] font-semibold tracking-[0.45em] text-amber-200/80">NEANDER PICTURES PRESENTS</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-[20%] flex-col items-center justify-center bg-black px-2 text-center">
          <p className="text-lg font-bold italic tracking-wide text-white" style={{ fontFamily: SERIF }}>
            A Love Story
          </p>
          <p className="text-[9px] tracking-[0.3em] text-amber-200/90">STARRING {couple.names.toUpperCase()}</p>
          <p className="mt-0.5 text-[8px] tracking-[0.35em] text-white/50">{couple.date ? `IN THEATERS ${couple.date}` : 'COMING SOON'}</p>
        </div>
        <span className="absolute right-2 top-[15%] rounded bg-black/50 px-1.5 py-0.5 font-mono text-[8px] text-white/70">● REC 00:02:14</span>
      </div>
      <FilmHoles />
    </div>
  );
}

function PeriodFrame({ src, look, couple }: { src: string; look: PhotoLook; couple: Couple }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-72 rounded-sm p-3 shadow-2xl shadow-black/70"
        style={{
          background: 'linear-gradient(135deg, #a16207, #fde68a 25%, #b45309 50%, #fcd34d 75%, #92400e)',
        }}
      >
        <div className="rounded-sm p-1.5" style={{ background: 'linear-gradient(135deg, #451a03, #78350f)' }}>
          <div className="relative rounded-sm bg-[#3b2a1a] p-4" style={{ boxShadow: 'inset 0 0 18px rgba(0,0,0,0.8)' }}>
            <div className="overflow-hidden rounded-[50%] border-[3px] border-[#e8c77a]" style={{ boxShadow: '0 0 0 4px #3b2a1a, 0 0 0 6px #b98b3a' }}>
              <Photo src={src} look={look} />
            </div>
            <Flourish className="left-1 top-1" />
            <Flourish className="right-1 top-1 -scale-x-100" />
            <Flourish className="bottom-1 left-1 -scale-y-100" />
            <Flourish className="bottom-1 right-1 -scale-100" />
          </div>
        </div>
      </div>
      <div className="-mt-1 rounded-sm border border-amber-900/60 px-5 py-1.5 text-center shadow-lg" style={{ background: 'linear-gradient(180deg, #fde68a, #d4a24c)' }}>
        <p className="text-sm font-bold text-amber-950" style={{ fontFamily: SERIF }}>
          {couple.names}
        </p>
        <p className="text-[9px] font-semibold tracking-[0.3em] text-amber-900">{couple.date ? `SINCE ${couple.date}` : 'EST. FOREVER'}</p>
      </div>
    </div>
  );
}

const AIRMAIL = 'repeating-linear-gradient(135deg, #e11d48 0 12px, #fff 12px 20px, #1d4ed8 20px 32px, #fff 32px 40px)';

function TravelFrame({ src, look, couple }: { src: string; look: PhotoLook; couple: Couple }) {
  return (
    <div className="relative w-72 rounded-md p-2 shadow-2xl shadow-black/60" style={{ background: AIRMAIL }}>
      <div className="rounded-sm bg-[#fffdf7] p-3">
        <div className="relative overflow-hidden rounded-sm">
          <Photo src={src} look={look} />
          <p className="absolute bottom-2 left-3 text-2xl font-extrabold italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" style={{ fontFamily: SERIF }}>
            Bon Voyage!
          </p>
        </div>
        {/* 탑승권 */}
        <div className="mt-3 flex items-stretch rounded-md border border-dashed border-sky-300 text-left">
          <div className="flex-1 px-3 py-2">
            <p className="text-[8px] font-bold tracking-[0.25em] text-sky-500">BOARDING PASS · LOVE AIR</p>
            <div className="mt-1 flex items-center gap-2 font-bold text-slate-800">
              <span className="text-sm">설렘</span>
              <span className="text-sky-400">✈</span>
              <span className="text-sm">영원</span>
            </div>
            <p className="mt-0.5 truncate text-[10px] text-slate-500" style={{ fontFamily: SERIF }}>
              {couple.names}
            </p>
          </div>
          <div className="flex w-16 flex-col items-center justify-center border-l border-dashed border-sky-300 text-center">
            <p className="text-[8px] text-slate-400">SEAT</p>
            <p className="text-sm font-extrabold text-slate-800">1A·1B</p>
          </div>
        </div>
      </div>
      <PassportStamp date={couple.date} />
    </div>
  );
}

/* ── Print overlay (300×400, 결과 프레임을 사진 위에 옮긴 정적 SVG) ── */

/** 글자 폭 어림 (em) — 한글·한자 1, 라틴 대문자·숫자 0.68, 공백 0.3, 그 외 0.55 */
function textEm(text: string): number {
  let em = 0;
  for (const ch of text) {
    if (/[ᄀ-ᇿ　-鿿가-힯＀-￯]/.test(ch)) em += 1;
    else if (/[A-Z0-9]/.test(ch)) em += 0.68;
    else if (ch === ' ') em += 0.3;
    else em += 0.55;
  }
  return em;
}

/** 넘칠 것 같은 줄만 textLength로 눌러 담는다 */
function fitText(text: string, fontSize: number, maxWidth: number, letterSpacing = 0) {
  const width = textEm(text) * fontSize + letterSpacing * [...text].length;
  return width > maxWidth ? { textLength: maxWidth, lengthAdjust: 'spacingAndGlyphs' as const } : {};
}

const PRINT_PAPER = '#f6efe2';
const ARCH = 'M0 382 V140 A140 140 0 0 1 140 0 H160 A140 140 0 0 1 300 140 V382 Q300 400 282 400 H18 Q0 400 0 382 Z';

function FairytalePrint() {
  return (
    <>
      <defs>
        <linearGradient id="wd-blush" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fbcfe8" stopOpacity="0.4" />
          <stop offset="0.5" stopColor="#fbcfe8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#wd-blush)" />
      {/* 아치 바깥은 인화지 색으로 덮어 아치형 사진처럼 */}
      <path d={`M0 0 H300 V400 H0 Z ${ARCH}`} fill={PRINT_PAPER} fillRule="evenodd" />
      <path d={ARCH} fill="none" stroke="#e9c46a" strokeWidth="3.5" />
      <g transform="translate(-4 -4) scale(0.9)">
        <FloralCornerArt />
      </g>
      <g transform="translate(304 -4) scale(-0.9 0.9)">
        <FloralCornerArt />
      </g>
      <g transform="translate(-4 404) scale(0.9 -0.9)">
        <FloralCornerArt />
      </g>
      <g transform="translate(304 404) scale(-0.9 -0.9)">
        <FloralCornerArt />
      </g>
    </>
  );
}

function MoviePrint({ couple }: { couple: Couple }) {
  const starring = `STARRING ${couple.names.toUpperCase()}`;
  return (
    <>
      <rect width="300" height="52" fill="#000" />
      <text x="150" y="30" textAnchor="middle" fontSize="8.5" fontWeight="600" letterSpacing="3.6" fill="rgba(253,230,138,0.8)">
        NEANDER PICTURES PRESENTS
      </text>
      <rect y="320" width="300" height="80" fill="#000" />
      <text x="150" y="350" textAnchor="middle" fontFamily={SERIF} fontSize="22" fontStyle="italic" fontWeight="700" fill="#fff">
        A Love Story
      </text>
      <text x="150" y="368" textAnchor="middle" fontSize="8.5" letterSpacing="2.6" fill="rgba(253,230,138,0.9)" {...fitText(starring, 8.5, 250, 2.6)}>
        {starring}
      </text>
      <text x="150" y="383" textAnchor="middle" fontSize="7.5" letterSpacing="2.8" fill="rgba(255,255,255,0.5)">
        {couple.date ? `IN THEATERS ${couple.date}` : 'COMING SOON'}
      </text>
      <rect x="226" y="60" width="66" height="15" rx="2" fill="rgba(0,0,0,0.5)" />
      <text x="259" y="70.5" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="7.5" fill="rgba(255,255,255,0.75)">
        ● REC 00:02:14
      </text>
    </>
  );
}

function PeriodPrint({ couple }: { couple: Couple }) {
  const since = couple.date ? `SINCE ${couple.date}` : 'EST. FOREVER';
  return (
    <>
      <defs>
        <linearGradient id="wd-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a16207" />
          <stop offset="0.25" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#b45309" />
          <stop offset="0.75" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="wd-plaque" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#d4a24c" />
        </linearGradient>
      </defs>
      {/* 타원 액자 바깥은 짙은 나무색 */}
      <path d="M0 0 H300 V400 H0 Z M150 24 A128 176 0 1 0 150 376 A128 176 0 1 0 150 24 Z" fill="#3b2a1a" fillRule="evenodd" />
      <ellipse cx="150" cy="200" rx="133" ry="181" fill="none" stroke="#b98b3a" strokeWidth="2" />
      <ellipse cx="150" cy="200" rx="128" ry="176" fill="none" stroke="#e8c77a" strokeWidth="3" />
      <rect x="4" y="4" width="292" height="392" fill="none" stroke="url(#wd-gold)" strokeWidth="8" />
      {[
        'translate(12 12)',
        'translate(288 12) scale(-1 1)',
        'translate(12 388) scale(1 -1)',
        'translate(288 388) scale(-1 -1)',
      ].map((t) => (
        <g key={t} transform={t}>
          <FlourishArt />
        </g>
      ))}
      {/* 이름 명판 */}
      <rect x="84" y="352" width="132" height="34" rx="2" fill="url(#wd-plaque)" stroke="rgba(120,53,15,0.6)" />
      <text x="150" y="368" textAnchor="middle" fontFamily={SERIF} fontSize="11" fontWeight="700" fill="#451a03" {...fitText(couple.names, 11, 120)}>
        {couple.names}
      </text>
      <text x="150" y="380" textAnchor="middle" fontSize="6" fontWeight="600" letterSpacing="1.8" fill="#78350f">
        {since}
      </text>
    </>
  );
}

function TravelPrint({ couple }: { couple: Couple }) {
  return (
    <>
      <defs>
        <pattern id="wd-airmail" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="40" fill="#e11d48" />
          <rect x="12" width="8" height="40" fill="#fff" />
          <rect x="20" width="12" height="40" fill="#1d4ed8" />
          <rect x="32" width="8" height="40" fill="#fff" />
        </pattern>
      </defs>
      {/* 에어메일 테두리 + 흰 여백 */}
      <path d="M0 0 H300 V400 H0 Z M9 9 V391 H291 V9 Z" fill="url(#wd-airmail)" fillRule="evenodd" />
      <path d="M9 9 H291 V391 H9 Z M14 14 V386 H286 V14 Z" fill="#fffdf7" fillRule="evenodd" />
      <text x="29" y="373" fontFamily={SERIF} fontSize="26" fontStyle="italic" fontWeight="800" fill="rgba(0,0,0,0.45)">
        Bon Voyage!
      </text>
      <text x="27" y="371" fontFamily={SERIF} fontSize="26" fontStyle="italic" fontWeight="800" fill="#fff">
        Bon Voyage!
      </text>
      <g transform="translate(192 16) rotate(14 48 48) scale(0.8)">
        <StampArt id="wd-stamp" date={couple.date} />
      </g>
    </>
  );
}

function WeddingPrintOverlay({ themeId, couple }: { themeId: ThemeId; couple: Couple }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" fontFamily="'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif">
      {themeId === 'fairytale' && <FairytalePrint />}
      {themeId === 'movie' && <MoviePrint couple={couple} />}
      {themeId === 'period' && <PeriodPrint couple={couple} />}
      {themeId === 'travel' && <TravelPrint couple={couple} />}
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'couple');
  const [themeId, setThemeId] = useState<ThemeId>(() => themeOf(answers));
  const theme = THEMES[themeId] ?? THEMES.fairytale;
  const couple = getCouple(answers);

  const frameProps = capture ? { src: capture.image, look: theme.look, couple } : null;

  return (
    <ResultShell
      eyebrow={`AI 웨딩 포토부스 · ${theme.label} 테마`}
      title={couple.names}
      description={`${theme.tagline}. 고급 코튼지에 바로 인화되는 커플 프레임이에요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 촬영하기"
    >
      {frameProps && (
        <motion.div
          key={themeId}
          initial={{ opacity: 0, y: 18, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex justify-center px-4 pt-4"
        >
          {themeId === 'fairytale' && <FairytaleFrame {...frameProps} />}
          {themeId === 'movie' && <MovieFrame {...frameProps} />}
          {themeId === 'period' && <PeriodFrame {...frameProps} />}
          {themeId === 'travel' && <TravelFrame {...frameProps} />}
        </motion.div>
      )}

      <div className="w-full max-w-md">
        <p className="mb-2 text-xs text-slate-500">다른 테마로도 미리보기</p>
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="테마 미리보기">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setThemeId(id)}
              aria-pressed={themeId === id}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition-colors',
                themeId === id ? 'text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'
              )}
              style={themeId === id ? { borderColor: pillarColor, backgroundColor: `${pillarColor}20` } : undefined}
            >
              <span className="h-5 w-full rounded-md" style={{ background: THEMES[id].swatch }} aria-hidden="true" />
              {THEMES[id].emoji} {THEMES[id].label}
            </button>
          ))}
        </div>
      </div>

      <InfoGrid
        items={[
          { emoji: '🖨️', label: '출력 용지', value: '프리미엄 코튼지 5×7', desc: '무광 300g · 은은한 펄 코팅' },
          { emoji: '⏱️', label: '인화 시간', value: '약 40초', desc: '현장 즉석 출력 + 커플 봉투' },
          { emoji: '👨‍👩‍👧‍👦', label: '하객 단체 모드', value: '최대 8인 프레임', desc: '축하 메시지 스티커 추가' },
          { emoji: '💌', label: '웨딩 로고', value: '이니셜·날짜 각인', desc: '예식 컬러에 맞춘 프레임' },
        ]}
      />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

function themeOf(answers: DemoAnswers): ThemeId {
  const picked = getChoice(answers, 'theme') as ThemeId | undefined;
  return picked && THEMES[picked] ? picked : 'fairytale';
}

function computeResult(answers: DemoAnswers): string {
  return themeOf(answers);
}

export default defineDemo({
  config: {
    id: 'wedding-booth',
    targetSlug: 'ai-wedding-booth',
    industryId: 'wedding',
    analyzeEmoji: '💍',
    analyzeDurationMs: 3500,
    analyzeImageStepId: 'couple',
    analyzeMessages: ['두 분의 얼굴 톤 맞추는 중', '로맨틱 테마 조명 입히는 중', '커플 프레임 디자인 중', '고급 용지 인화 준비 중'],
  },
  steps: [
    choiceStep({
      id: 'theme',
      title: '어떤 로맨틱 테마로 찍어볼까요?',
      subtitle: '결과 화면에서 다른 테마도 미리 볼 수 있어요',
      columns: 2,
      options: (Object.keys(THEMES) as ThemeId[]).map((id) => ({
        id,
        emoji: THEMES[id].emoji,
        label: THEMES[id].label,
        desc: THEMES[id].desc,
        swatch: THEMES[id].swatch,
      })),
    }),
    cameraStep({
      id: 'couple',
      title: '두 분이 함께 화면에 들어와 주세요',
      subtitle: '어깨를 살짝 기대면 더 로맨틱하게 나와요',
      mode: 'portrait',
      subject: '두 분',
      countdown: true,
      scanLabels: ['인물 2명 감지', '얼굴 톤 맞춤 보정', '테마 조명 계산', '로맨틱 무드 적용'],
      readouts: (c) => [
        { label: '케미 지수', value: `${82 + (c.seed % 17)}%` },
        { label: '조명', value: c.stats.brightness > 45 ? '화사함' : '분위기 있음' },
      ],
    }),
    textStep({
      id: 'names',
      title: '프레임에 새길 이름을 알려주세요',
      subtitle: '비워 두면 로맨틱 문구가 대신 들어가요',
      fields: [
        { id: 'name1', label: '첫 번째 이름', placeholder: '예) 민준', maxLength: 10, optional: true },
        { id: 'name2', label: '두 번째 이름', placeholder: '예) 서연', maxLength: 10, optional: true },
        { id: 'date', label: '기념일', placeholder: '예) 2026.10.24', maxLength: 12, optional: true },
      ],
    }),
  ],
  computeResult,
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'couple');
    const themeId = themeOf(answers);
    const theme = THEMES[themeId];
    const couple = getCouple(answers);
    return {
      kind: 'photo',
      photos: capture ? [{ src: capture.image, look: theme.look, overlay: <WeddingPrintOverlay themeId={themeId} couple={couple} /> }] : [],
      title: couple.names,
      caption: couple.date ? `${couple.date} · ${theme.tagline}` : theme.tagline,
      paper: 'cream',
    };
  },
});
