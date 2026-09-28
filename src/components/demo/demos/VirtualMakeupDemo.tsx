'use client';

import { makeupBlockedReason } from '@/data/demo-ai/beauty-completion';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps, DemoStepProps } from '@/types/demo';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import {
  FACE_POINTS,
  Panel,
  ResultShell,
  cameraStep,
  defineDemo,
  getCapture,
  getChoice,
  renderLook,
  requestDemoAi,
  seededRandom,
  type DemoStepDef,
  type PhotoLook,
  type PhotoPaint,
} from '../kit';
import { isAiMakeup, type AiMakeup, type MakeupLookId, type MakeupTone } from '@/data/demo-ai/virtual-makeup';

/* ── Data ──────────────────────────────────────────────── */

type Tone = MakeupTone;
type LookId = MakeupLookId;

const TONES: Record<Tone, { name: string; short: string; desc: string }> = {
  warm: {
    name: '따뜻한 컬러 방향',
    short: '웜톤',
    desc: '따뜻한 느낌을 원한다면 코랄·오렌지·브라운 계열을 나란히 비교해 보세요.',
  },
  cool: {
    name: '차가운 컬러 방향',
    short: '쿨톤',
    desc: '차가운 느낌을 원한다면 로즈·푸시아·블루 레드 계열을 나란히 비교해 보세요.',
  },
  neutral: {
    name: '뉴트럴 컬러 방향',
    short: '뉴트럴',
    desc: '양쪽 계열을 함께 탐색하고 싶다면 채도가 낮은 MLBB 컬러부터 비교해 보세요.',
  },
};

interface Shade {
  part: string;
  product: string;
  shade: string;
  color: string;
}

interface MakeupLook {
  name: string;
  emoji: string;
  desc: string;
  mood: string;
  tone: Tone;
  lip: string;
  blush: string;
  shadow: string;
  lipAlpha: number;
  blushAlpha: number;
  shadowAlpha: number;
  /** 섀도 가로 반경 (%) — 스모키일수록 넓게 */
  shadowSize: number;
  gloss?: boolean;
  liner?: boolean;
  shimmer?: boolean;
  shades: Shade[];
}

const LOOKS: Record<LookId, MakeupLook> = {
  coral: {
    name: '내추럴 코랄',
    emoji: '🍑',
    desc: '맑은 코랄 립 + 복숭아 볼',
    mood: '물 먹은 듯 맑은 혈색으로 5분 만에 끝내는 데일리 코랄 룩이에요.',
    tone: 'warm',
    lip: '#f0604d',
    blush: '#ff9478',
    shadow: '#d99a78',
    lipAlpha: 0.5,
    blushAlpha: 0.75,
    shadowAlpha: 0.4,
    shadowSize: 7,
    gloss: true,
    shades: [
      { part: '립', product: '워터 글로우 틴트', shade: '03 코랄 선셋', color: '#f0604d' },
      { part: '블러셔', product: '에어 블러쉬 쿠션', shade: '02 피치 블룸', color: '#ff9478' },
      { part: '섀도', product: '데일리 아이 팔레트', shade: '살몬 브라운', color: '#d99a78' },
    ],
  },
  rose: {
    name: '로즈 글램',
    emoji: '🌹',
    desc: '장밋빛 립 + 샴페인 펄',
    mood: '샴페인 펄과 장밋빛 립으로 조명 아래서 더 빛나는 글램 룩이에요.',
    tone: 'cool',
    lip: '#c73866',
    blush: '#f07aa0',
    shadow: '#b0707e',
    lipAlpha: 0.52,
    blushAlpha: 0.7,
    shadowAlpha: 0.45,
    shadowSize: 7.5,
    gloss: true,
    shimmer: true,
    shades: [
      { part: '립', product: '새틴 벨벳 립스틱', shade: '07 로즈 가든', color: '#c73866' },
      { part: '블러셔', product: '블루밍 치크', shade: '05 로지 핑크', color: '#f07aa0' },
      { part: '섀도', product: '글리터 아이 토퍼', shade: '샴페인 로즈', color: '#b0707e' },
      { part: '하이라이터', product: '문라이트 하이라이터', shade: '실버 핑크', color: '#f3dde3' },
    ],
  },
  mlbb: {
    name: 'MLBB 데일리',
    emoji: '🤎',
    desc: '내 입술 같은 로즈 베이지',
    mood: '내 입술보다 한 톤 짙은 MLBB 컬러로 꾸안꾸 무드를 완성해요.',
    tone: 'neutral',
    lip: '#b0666a',
    blush: '#d9978d',
    shadow: '#a88170',
    lipAlpha: 0.45,
    blushAlpha: 0.6,
    shadowAlpha: 0.35,
    shadowSize: 6.5,
    shades: [
      { part: '립', product: '소프트 매트 립밤', shade: '11 누디 로즈', color: '#b0666a' },
      { part: '블러셔', product: '크림 블러쉬 스틱', shade: '베이지 로즈', color: '#d9978d' },
      { part: '섀도', product: '싱글 크림 섀도', shade: '토피 브라운', color: '#a88170' },
    ],
  },
  red: {
    name: '레트로 레드립',
    emoji: '💋',
    desc: '선명한 레드 립 + 윙 라인',
    mood: '또렷한 레드 립과 날렵한 윙 라인으로 완성하는 클래식 레트로 룩이에요.',
    tone: 'cool',
    lip: '#c1121f',
    blush: '#e38a8a',
    shadow: '#9c6b5a',
    lipAlpha: 0.62,
    blushAlpha: 0.45,
    shadowAlpha: 0.3,
    shadowSize: 6.5,
    liner: true,
    shades: [
      { part: '립', product: '벨벳 매트 립스틱', shade: '01 클래식 레드', color: '#c1121f' },
      { part: '블러셔', product: '에어 블러쉬 쿠션', shade: '04 로즈 베이지', color: '#e38a8a' },
      { part: '아이라인', product: '젤 펜슬 라이너', shade: '딥 블랙', color: '#1f1a1a' },
    ],
  },
  smoky: {
    name: '스모키 나이트',
    emoji: '🌙',
    desc: '브라운 스모키 + 누드 립',
    mood: '그윽한 브라운 스모키와 누드 립으로 밤을 위한 시크한 무드를 만들어요.',
    tone: 'warm',
    lip: '#c2847a',
    blush: '#b88a7a',
    shadow: '#5a4038',
    lipAlpha: 0.4,
    blushAlpha: 0.5,
    shadowAlpha: 0.62,
    shadowSize: 9,
    liner: true,
    shades: [
      { part: '섀도', product: '스모키 아이 팔레트', shade: '에스프레소 나잇', color: '#5a4038' },
      { part: '립', product: '누드 새틴 립스틱', shade: '09 모카 누드', color: '#c2847a' },
      { part: '쉐이딩', product: '컨투어 스틱', shade: '웜 토프', color: '#9c7a6a' },
    ],
  },
};

const LOOK_IDS = Object.keys(LOOKS) as LookId[];

const INTENSITIES = [
  { id: 'soft', label: '은은하게', k: 0.7 },
  { id: 'daily', label: '데일리', k: 1 },
  { id: 'bold', label: '또렷하게', k: 1.3 },
] as const;

/* ── Helpers ───────────────────────────────────────────── */

function getLookId(answers: DemoAnswers): LookId {
  const id = getChoice(answers, 'look');
  return id && id in LOOKS ? (id as LookId) : 'coral';
}

function getIntensity(answers: DemoAnswers) {
  const id = getChoice(answers, 'intensity');
  return INTENSITIES.find((i) => i.id === id) ?? INTENSITIES[1];
}

function swatchOf(look: MakeupLook): string {
  return `linear-gradient(90deg, ${look.shadow} 0%, ${look.blush} 50%, ${look.lip} 100%)`;
}

/** 얼굴 랜드마크(FACE_POINTS) 위에 립·블러셔·섀도를 얹는다 */
function makeupPaints(look: MakeupLook, k: number): PhotoPaint[] {
  const { eyeL, eyeR, cheekL, cheekR, lips } = FACE_POINTS;
  const a = (v: number) => Math.min(1, v * k);
  const paints: PhotoPaint[] = [];

  for (const eye of [eyeL, eyeR]) {
    // 섀도는 눈 바로 위 눈두덩에 곱하기로
    paints.push({ x: eye.x, y: eye.y - 2.8, rx: look.shadowSize, ry: 3.4, color: look.shadow, alpha: a(look.shadowAlpha), blend: 'multiply' });
    if (look.shimmer) {
      paints.push({ x: eye.x, y: eye.y - 2.4, rx: 3.5, ry: 1.6, color: '#fff4e6', alpha: a(0.35), blend: 'screen' });
    }
    if (look.liner) {
      const outward = eye.x < 50 ? -1 : 1;
      paints.push({ x: eye.x + outward * 5.5, y: eye.y - 1, rx: 3, ry: 0.9, color: '#1a1212', alpha: a(0.45), blend: 'multiply' });
    }
  }

  for (const cheek of [cheekL, cheekR]) {
    const spot = { x: cheek.x + (cheek.x < 50 ? 1 : -1), y: cheek.y - 1.5, rx: 8.5, ry: 5 };
    paints.push({ ...spot, color: look.blush, alpha: a(look.blushAlpha), blend: 'soft-light' });
    paints.push({ ...spot, color: look.blush, alpha: a(look.blushAlpha * 0.28), blend: 'multiply' });
  }

  paints.push({ x: lips.x, y: lips.y, rx: 8, ry: 3.4, color: look.lip, alpha: a(look.lipAlpha), blend: 'multiply' });
  paints.push({ x: lips.x, y: lips.y, rx: 7, ry: 2.8, color: look.lip, alpha: a(0.3), blend: 'soft-light' });
  if (look.gloss) {
    paints.push({ x: lips.x - 1.2, y: lips.y + 0.9, rx: 2.6, ry: 0.9, color: '#ffffff', alpha: a(0.4), blend: 'screen' });
  }
  return paints;
}

function buildLook(look: MakeupLook, k: number, answers: DemoAnswers): PhotoLook {
  const profile = (answers.experienceProfile ?? {}) as Record<string, string>;
  const finish = profile.finish;
  const style = { ...look, gloss: finish === 'matte' ? false : look.gloss, shimmer: finish === 'matte' ? false : look.shimmer };
  const opacity = finish === 'sheer' ? 0.72 : 1;
  return { adjust: { brightness: 1.03, saturation: 1.04, contrast: finish === 'matte' ? 1.04 : 1.02 }, paints: makeupPaints(style, k * opacity) };
}

/** Color direction describes the selected cosmetic palette, never a measured skin trait. */
function styleDirection(answers: DemoAnswers) {
  const lookId = getLookId(answers);
  return { lookId, tone: LOOKS[lookId].tone };
}

/** 캡처 이미지에 룩을 입힌 결과 — 새 룩을 렌더링하는 동안에는 이전 결과를 유지한다 */
function useRenderedLook(src: string | undefined, look: PhotoLook) {
  const key = JSON.stringify(look);
  const [state, setState] = useState<{ src: string; key: string; url: string } | null>(null);

  useEffect(() => {
    if (!src) return;
    let alive = true;
    renderLook(src, JSON.parse(key) as PhotoLook)
      .then((url) => {
        if (alive) setState({ src, key, url });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [src, key]);

  return {
    url: state && state.src === src ? state.url : null,
    fresh: !!state && state.src === src && state.key === key,
  };
}

/* ── Step: AR 메이크업 적용 ─────────────────────────────── */

const BARE_LOOK: PhotoLook = { adjust: { brightness: 1.03, saturation: 1.04, contrast: 1.02 } };

function LookStudio({ answers, onUpdate }: DemoStepProps) {
  const capture = getCapture(answers, 'face');
  const selected = getChoice(answers, 'look') as LookId | undefined;
  const selectedIntensity = getChoice(answers, 'intensity');
  const intensity = getIntensity(answers);
  const look = selected ? LOOKS[selected] : undefined;
  const preview = useRenderedLook(capture?.image, look ? buildLook(look, intensity.k, answers) : BARE_LOOK);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <div className="w-44 shrink-0">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl shadow-black/40">
          {preview.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.url} alt="AR 메이크업 미리보기" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              {capture ? '시안 준비 중…' : '먼저 사진을 준비해 주세요'}
            </div>
          )}
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold tracking-widest text-white">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-rose-400"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            AR LIVE
          </div>
          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white">
              {!preview.fresh && preview.url ? '메이크업 입히는 중…' : look ? `${look.emoji} ${look.name}` : '룩을 골라주세요'}
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs font-semibold text-slate-400">강도 <span aria-live="polite">{selectedIntensity ? '✓ 선택 완료' : '· 선택 필요'}</span></p>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1" role="group" aria-label="메이크업 강도">
          {INTENSITIES.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => onUpdate('intensity', level.id)}
              aria-pressed={selectedIntensity === level.id}
              className={cn(
                'rounded-lg py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                selectedIntensity === level.id ? 'bg-teal-500/20 text-teal-200' : 'text-slate-400 hover:text-white'
              )}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2.5" role="group" aria-label="메이크업 룩">
        <p className="col-span-2 text-xs font-semibold text-slate-400">룩 <span aria-live="polite">{selected ? '✓ 선택 완료' : '· 선택 필요'}</span></p>
        {LOOK_IDS.map((id, i) => {
          const item = LOOKS[id];
          const isSelected = selected === id;
          return (
            <motion.button
              key={id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onUpdate('look', id)}
              aria-pressed={isSelected}
              className={cn(
                'relative rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                i === LOOK_IDS.length - 1 && 'col-span-2',
                isSelected ? 'border-teal-400 bg-teal-500/10 ring-1 ring-teal-400/40' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              )}
            >
              <span className="block h-7 w-full rounded-lg border border-white/10" style={{ background: swatchOf(item) }} aria-hidden="true" />
              <span className="mt-2 block text-sm font-semibold text-slate-100">
                <span className="mr-1">{item.emoji}</span>
                {item.name}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">{item.desc}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

const lookStep: DemoStepDef = {
  meta: {
    id: 'look',
    titleKey: 'AR로 메이크업 룩을 입혀볼게요',
    subtitleKey: '강도와 룩을 각각 골라주세요 · 고른 조합은 미리보기에 바로 반영돼요',
    canProceed: (a) => !makeupBlockedReason(a),
    getBlockedReason: makeupBlockedReason,
  },
  Component: LookStudio,
};

/* ── Result parts ──────────────────────────────────────── */

function MakeupCompare({ src, look, aiImage }: { src: string; look: PhotoLook; aiImage?: string }) {
  const rendered = useRenderedLook(aiImage ? undefined : src, look);
  // AI가 메이크업을 입힌 사진이 있으면 그게 '후', 없으면 캔버스 합성
  const url = aiImage ?? rendered.url;

  if (!url) {
    return (
      <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-lg bg-slate-100">
        <motion.div
          className="h-6 w-6 rounded-full border-2 border-rose-400 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-xs text-slate-500">비교 사진 출력 중…</p>
      </div>
    );
  }
  return <BeforeAfterSlider beforeSrc={src} afterSrc={url} className="rounded-lg" />;
}

/** 장식용 QR 패턴 (실제 링크 아님) */
function DecorativeQR({ seed, className }: { seed: number; className?: string }) {
  const size = 21;
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [size - 7, 0], [0, size - 7]] as const) {
      const dx = x - fx;
      const dy = y - fy;
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
        if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return 0;
        const ring = Math.min(dx, dy, 6 - dx, 6 - dy);
        return ring === 1 ? 0 : 1;
      }
    }
    return -1;
  };
  const cells: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const f = finder(x, y);
      if (f === 1 || (f === -1 && seededRandom(seed, `${x}.${y}`) > 0.52)) cells.push([x, y]);
    }
  }
  return (
    <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className={className} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="-1" y="-1" width={size + 2} height={size + 2} fill="#ffffff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="#0f172a" />
      ))}
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor, generated }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const ai = isAiMakeup(generated) ? generated : null;
  const { lookId, tone } = styleDirection(answers);
  const look = LOOKS[lookId];
  const intensity = getIntensity(answers);
  const alternatives = LOOK_IDS.filter(id => id !== lookId);

  return (
    <ResultShell
      eyebrow="가상 메이크업 비포 & 애프터"
      title={`${look.name} 룩 완성`}
      description={look.mood}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 룩 입어보기"
    >
      {/* 비교 사진 출력물 */}
      <div className="w-full max-w-[320px]">
        <motion.div
          initial={{ opacity: 0, y: 16, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl bg-white p-3 pb-4 shadow-2xl shadow-black/40"
        >
          {capture ? (
            <MakeupCompare src={capture.image} look={buildLook(look, intensity.k, answers)} aiImage={ai?.image} />
          ) : (
            <div className="aspect-[3/4] rounded-lg bg-slate-100" />
          )}
          <div className="mt-3 flex items-end justify-between px-1 text-left">
            <div>
              <p className="text-[9px] font-bold tracking-[0.3em] text-slate-400">NEANDER LOOK FITTING</p>
              <p className="font-display text-sm font-bold text-slate-900">
                {look.emoji} {look.name} · {intensity.label}
              </p>
            </div>
            <div className="flex -space-x-1.5">
              {look.shades.map((s) => (
                <span key={s.part} className="h-5 w-5 rounded-full border-2 border-white shadow" style={{ background: s.color }} />
              ))}
            </div>
          </div>
        </motion.div>
        <p className="mt-3 text-xs text-slate-500">가운데 핸들을 좌우로 밀어 비교해 보세요</p>
        {ai && <p className="mt-1 text-[11px] text-slate-600">AI가 내 사진에 직접 메이크업을 그렸어요</p>}
      </div>

      {ai && (
        <Panel title="AI 메이크업 아티스트 코멘트">
          <p className="text-sm leading-relaxed text-slate-200 [word-break:keep-all]">{ai.comment}</p>
          <ul className="mt-3 space-y-1.5">
            {ai.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">
                <span className="font-bold" style={{ color: pillarColor }}>
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <p className="max-w-md text-xs leading-relaxed text-slate-400">선택한 컬러를 사진에 표현한 가상 시안이에요. 실제 피부 언더톤 측정이나 제품 발색 시험 결과가 아니에요.</p>

      {/* 쉐이드 리스트 */}
      <Panel title="이 룩에 쓴 제품">
        <ul className="space-y-3">
          {look.shades.map((s, i) => (
            <motion.li
              key={s.part}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span
                className="h-9 w-9 shrink-0 rounded-full border border-white/10 shadow-inner"
                style={{ background: `radial-gradient(circle at 32% 30%, #ffffffaa 0%, ${s.color} 38%, ${s.color} 100%)` }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100">{s.product}</p>
                <p className="text-xs text-slate-400">{s.shade}</p>
              </div>
              <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${pillarColor}1f`, color: pillarColor }}>
                {s.part}
              </span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-800 pt-4">
          <DecorativeQR seed={(capture?.seed ?? 7) + lookId.length} className="h-14 w-14 shrink-0 rounded" />
          <p className="text-xs leading-relaxed text-slate-400 [word-break:keep-all]">
            현장에서는 제품별 QR이 함께 출력돼 바로 구매 페이지로 이어져요. <span className="text-slate-600">(데모용 이미지)</span>
          </p>
        </div>
      </Panel>

      <Panel title="오늘의 컬러 스타일 가이드">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white">{TONES[tone].name}</p>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">선택한 표현 · {intensity.label}</span>
        </div>
        <div className="mt-3 h-10 rounded-xl" style={{ background: swatchOf(look) }} aria-label={`${look.name} 아이·치크·립 컬러 조합`} />
        <p className="mt-3 text-xs leading-relaxed text-slate-400 [word-break:keep-all]">{TONES[tone].desc}</p>
        <p className="mt-5 text-xs font-semibold text-slate-300">다음에 비교해 볼 팔레트</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {alternatives.map(id => (
            <li key={id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-left">
              <div className="h-6 rounded-md" style={{ background: swatchOf(LOOKS[id]) }} />
              <p className="mt-2 text-xs font-semibold text-white">{LOOKS[id].emoji} {LOOKS[id].name}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{LOOKS[id].desc}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'virtual-makeup',
    targetSlug: 'ai-virtual-makeup',
    industryId: 'beauty',
    analyzeEmoji: '💄',
    analyzeDurationMs: 3400,
    analyzeImageStepId: 'face',
    // AI 사진 변환은 10~20초 — 마지막 문구가 남은 시간을 채운다
    analyzeMessages: ['장면·질감·선택 룩을 한 브리프로 정리', '사진에 메이크업 콘셉트 표현', '전후 비교와 스타일링 노트 준비'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '거울 앞, 사진을 준비해요',
      subtitle: '정면을 바라보고, 눈과 입술이 잘 보이게 해주세요',
      mode: 'face',
      subject: '얼굴',
      scanLabels: ['정면 사진 준비', '선택한 룩과 질감 확인', '가상 메이크업 시안 준비'],
      readouts: c => [{ label: '사진 밝기', value: c.stats.brightness > 45 ? '밝은 편' : '조명을 높여주세요' }, { label: '체험 방식', value: '사진 기반 스타일링' }],
    }),
    lookStep,
  ],
  computeResult: (answers) => getLookId(answers),
  Result,
  generate: (answers) => {
    const capture = getCapture(answers, 'face');
    if (!capture) return Promise.resolve(null);
    return requestDemoAi<AiMakeup>(
      'virtual-makeup',
      { experienceProfile: answers.experienceProfile, photo: capture.image, look: getLookId(answers), intensity: getIntensity(answers).id },
      { timeoutMs: 60_000, validate: isAiMakeup }
    );
  },
  print: (answers, _resultKey, generated) => {
    const capture = getCapture(answers, 'face');
    const ai = isAiMakeup(generated) ? generated : null;
    const { lookId, tone } = styleDirection(answers);
    const look = LOOKS[lookId];
    const intensity = getIntensity(answers);
    const lip = look.shades.find((s) => s.part === '립');
    return {
      kind: 'photo',
      // 결과 화면의 비포 & 애프터 슬라이더와 같은 두 장
      photos: capture
        ? [
            { src: capture.image, label: '전' },
            ai ? { src: ai.image, label: '후' } : { src: capture.image, look: buildLook(look, intensity.k, answers), label: '후' },
          ]
        : [],
      title: `${look.name} 룩 완성`,
      caption: `${intensity.label} · ${TONES[tone].short} 컬러 방향${lip ? ` · 립 ${lip.shade}` : ''}`,
      badge: 'LOOK FITTING',
    };
  },
});
