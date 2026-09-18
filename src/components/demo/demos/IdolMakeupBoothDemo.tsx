'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  FACE_POINTS,
  InfoGrid,
  ProcessedPhoto,
  ResultShell,
  ScoreBars,
  TraitChips,
  cameraStep,
  choiceStep,
  defineDemo,
  getCapture,
  getChoice,
  hashString,
  seededInt,
  seededPick,
  seededRandom,
  type PhotoLook,
  type PhotoPaint,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type ConceptId = 'girlcrush' | 'lovely' | 'fresh' | 'dreamy' | 'retro';
type StageId = 'stage' | 'studio' | 'album' | 'fansign';

interface Makeup {
  lip: string;
  lipAlpha: number;
  shadow: string;
  shadowAlpha: number;
  shadowBlend: GlobalCompositeOperation;
  blush: string;
  blushAlpha: number;
  gloss?: boolean;
  liner?: boolean;
  glitter?: boolean;
}

interface Concept {
  label: string;
  emoji: string;
  desc: string;
  swatch: string;
  en: string;
  frame: string;
  pen: string;
  lights: [string, string];
  makeup: Makeup;
  base: PhotoLook;
  points: string[];
  caption: string;
  cheer: { n: string; h: string };
}

const CONCEPTS: Record<ConceptId, Concept> = {
  girlcrush: {
    label: '걸크러시',
    emoji: '🖤',
    desc: '스모키 아이 + 플럼 립',
    swatch: 'linear-gradient(135deg, #0f0a14, #7b1e3a 55%, #e11d48)',
    en: 'GIRL CRUSH',
    frame: 'linear-gradient(120deg, #111827, #e11d48, #a1a1aa, #111827, #e11d48)',
    pen: '#f43f5e',
    lights: ['#e11d48', '#7c3aed'],
    makeup: { lip: '#7b1e3a', lipAlpha: 0.55, shadow: '#3b1f2b', shadowAlpha: 0.5, shadowBlend: 'multiply', blush: '#8b5a4a', blushAlpha: 0.2, liner: true },
    base: { adjust: { contrast: 1.2, saturation: 0.95 }, tint: { color: '#1e1b4b', alpha: 0.3, blend: 'soft-light' }, vignette: 0.45 },
    points: ['스모키 아이', '플럼 립', '샤프 쉐딩', '레드 스테이지 조명'],
    caption: '무대 위에서 제일 멋있게! 오늘도 같이 불태워요',
    cheer: { n: '크림슨 레드', h: '#e11d48' },
  },
  lovely: {
    label: '러블리',
    emoji: '🎀',
    desc: '핑크 블러셔 + 글로시 립',
    swatch: 'linear-gradient(135deg, #ffe4ec, #ff8fab 55%, #f472b6)',
    en: 'LOVELY',
    frame: 'linear-gradient(120deg, #fbcfe8, #fff1f2, #f9a8d4, #e0e7ff, #fbcfe8)',
    pen: '#ec4899',
    lights: ['#f9a8d4', '#fda4af'],
    makeup: { lip: '#ff5c8a', lipAlpha: 0.45, shadow: '#f4a3a8', shadowAlpha: 0.3, shadowBlend: 'multiply', blush: '#ff8fab', blushAlpha: 0.85, gloss: true },
    base: { adjust: { brightness: 1.08, saturation: 1.05 }, tint: { color: '#fbcfe8', alpha: 0.3, blend: 'soft-light' } },
    points: ['애교살 하이라이트', '복숭아 블러셔', '글로시 핑크 립', '핑크 스포트라이트'],
    caption: '오늘 와줘서 고마워요 ♡ 우리 매일 꽃길만 걸어요!',
    cheer: { n: '베이비 핑크', h: '#f9a8d4' },
  },
  fresh: {
    label: '청량',
    emoji: '🫧',
    desc: '아쿠아 섀도 + 코랄 틴트',
    swatch: 'linear-gradient(135deg, #e0f2fe, #67e8f9 55%, #34d399)',
    en: 'FRESH',
    frame: 'linear-gradient(120deg, #a5f3fc, #ffffff, #6ee7b7, #bae6fd, #a5f3fc)',
    pen: '#0891b2',
    lights: ['#67e8f9', '#a7f3d0'],
    makeup: { lip: '#ff7a59', lipAlpha: 0.45, shadow: '#7dd3fc', shadowAlpha: 0.55, shadowBlend: 'soft-light', blush: '#ffb4a2', blushAlpha: 0.6, glitter: true },
    base: { adjust: { brightness: 1.1, saturation: 1.15 }, tint: { color: '#bae6fd', alpha: 0.3, blend: 'soft-light' } },
    points: ['아쿠아 펄 섀도', '코랄 워터 틴트', '물광 피부', '민트 백라이트'],
    caption: '여름보다 더 청량하게! 늘 곁에 있어줘서 고마워요',
    cheer: { n: '아쿠아 민트', h: '#5eead4' },
  },
  dreamy: {
    label: '몽환',
    emoji: '🌙',
    desc: '라벤더 글리터 + 로지 립',
    swatch: 'linear-gradient(135deg, #1e1b4b, #a78bfa 55%, #f0abfc)',
    en: 'DREAMY',
    frame: 'linear-gradient(120deg, #c4b5fd, #f0abfc, #a5f3fc, #fde68a, #c4b5fd)',
    pen: '#8b5cf6',
    lights: ['#c4b5fd', '#f0abfc'],
    makeup: { lip: '#d4668f', lipAlpha: 0.4, shadow: '#a78bfa', shadowAlpha: 0.4, shadowBlend: 'multiply', blush: '#f0abfc', blushAlpha: 0.6, glitter: true },
    base: { adjust: { saturation: 0.95, brightness: 1.04 }, tint: { color: '#c4b5fd', alpha: 0.35, blend: 'soft-light' }, grain: 6 },
    points: ['라벤더 글리터', '로지 그라데이션 립', '홀로그램 하이라이터', '퍼플 헤이즈 조명'],
    caption: '꿈에서도 만나요 ☾ 오늘 밤도 반짝반짝',
    cheer: { n: '드림 라벤더', h: '#a78bfa' },
  },
  retro: {
    label: '레트로',
    emoji: '📼',
    desc: '레드 립 + 브라운 섀도',
    swatch: 'linear-gradient(135deg, #451a03, #c81d25 55%, #f59e0b)',
    en: 'RETRO',
    frame: 'linear-gradient(120deg, #f59e0b, #fef3c7, #c81d25, #fde68a, #f59e0b)',
    pen: '#c81d25',
    lights: ['#f59e0b', '#fb7185'],
    makeup: { lip: '#c81d25', lipAlpha: 0.6, shadow: '#9a6b4f', shadowAlpha: 0.35, shadowBlend: 'multiply', blush: '#f59e8b', blushAlpha: 0.5, liner: true },
    base: { adjust: { sepia: 0.2, warmth: 0.2, contrast: 1.1 }, tint: { color: '#f59e0b', alpha: 0.2, blend: 'soft-light' }, grain: 25 },
    points: ['클래식 레드 립', '브라운 윙 섀도', '필름 그레인', '앰버 무대 조명'],
    caption: '오래오래 함께해요! 우리의 레트로 청춘 ♡',
    cheer: { n: '빈티지 앰버', h: '#f59e0b' },
  },
};

const STAGES: Record<StageId, { label: string; emoji: string; desc: string; tag: string }> = {
  stage: { label: '무대', emoji: '🎤', desc: '조명 쏟아지는 콘서트 무대', tag: 'LIVE STAGE' },
  studio: { label: '화보', emoji: '📸', desc: '깨끗한 스튜디오 화보', tag: 'PHOTOBOOK' },
  album: { label: '앨범 재킷', emoji: '💿', desc: '미니 앨범 커버 컷', tag: '1st MINI ALBUM' },
  fansign: { label: '팬사인회', emoji: '✍️', desc: '친필 사인 포토카드', tag: 'FANSIGN EVENT' },
};

const STAGE_NAMES = ['NEVI', 'LUZE', 'RIEL', 'SEVA', 'HAEL', 'MIRE', 'ZENA', 'LIVA', 'ORIN', 'YUVE', 'KAEL', 'ELIO'];
const POSITIONS = ['메인보컬', '리드보컬', '메인댄서', '리드래퍼', '센터', '비주얼', '리더', '막내'];

function getConcept(answers: DemoAnswers): ConceptId {
  const id = getChoice(answers, 'concept');
  return id && id in CONCEPTS ? (id as ConceptId) : 'lovely';
}

function getStage(answers: DemoAnswers): StageId {
  const id = getChoice(answers, 'stage');
  return id && id in STAGES ? (id as StageId) : 'stage';
}

/** 콘셉트 메이크업 + 무대 조명을 얼굴 랜드마크 위에 얹는다 */
function idolLook(concept: Concept, stage: StageId): PhotoLook {
  const { eyeL, eyeR, cheekL, cheekR, lips } = FACE_POINTS;
  const m = concept.makeup;
  const paints: PhotoPaint[] = [];
  for (const eye of [eyeL, eyeR]) {
    paints.push({ x: eye.x, y: eye.y - 2.6, rx: 8, ry: 3.6, color: m.shadow, alpha: m.shadowAlpha, blend: m.shadowBlend });
    if (m.liner) {
      paints.push({ x: eye.x + (eye.x < 50 ? -5.5 : 5.5), y: eye.y - 1, rx: 3, ry: 0.9, color: '#140c10', alpha: 0.45, blend: 'multiply' });
    }
    if (m.glitter) paints.push({ x: eye.x, y: eye.y - 2.2, rx: 3.8, ry: 1.5, color: '#ffffff', alpha: 0.4, blend: 'screen' });
    // 애교살 하이라이트
    paints.push({ x: eye.x, y: eye.y + 2.4, rx: 4, ry: 1, color: '#fff7ed', alpha: 0.28, blend: 'screen' });
  }
  for (const cheek of [cheekL, cheekR]) {
    const spot = { x: cheek.x + (cheek.x < 50 ? 1.5 : -1.5), y: cheek.y - 2.5, rx: 9, ry: 5.2 };
    paints.push({ ...spot, color: m.blush, alpha: m.blushAlpha, blend: 'soft-light' });
    paints.push({ ...spot, color: m.blush, alpha: m.blushAlpha * 0.25, blend: 'multiply' });
  }
  paints.push({ x: lips.x, y: lips.y, rx: 8, ry: 3.4, color: m.lip, alpha: m.lipAlpha, blend: 'multiply' });
  paints.push({ x: lips.x, y: lips.y, rx: 7, ry: 2.8, color: m.lip, alpha: 0.3, blend: 'soft-light' });
  if (m.gloss) paints.push({ x: lips.x - 1.2, y: lips.y + 0.9, rx: 2.6, ry: 0.9, color: '#ffffff', alpha: 0.45, blend: 'screen' });

  // 무대 조명 — 위쪽 양 모서리에서 떨어지는 컬러 라이트
  const light = stage === 'studio' ? 0.28 : stage === 'stage' ? 0.55 : 0.42;
  paints.push({ x: 0, y: 0, rx: 60, ry: 45, color: concept.lights[0], alpha: light, blend: 'screen' });
  paints.push({ x: 100, y: 8, rx: 55, ry: 42, color: concept.lights[1], alpha: light * 0.9, blend: 'screen' });

  return {
    ...concept.base,
    paints,
    vignette: stage === 'studio' ? 0.12 : (concept.base.vignette ?? 0.3),
    grain: stage === 'album' ? Math.max(concept.base.grain ?? 0, 14) : concept.base.grain,
  };
}

function profileOf(answers: DemoAnswers) {
  const capture = getCapture(answers, 'face');
  const conceptId = getConcept(answers);
  const seed = hashString(`${capture?.seed ?? 9}-${conceptId}`);
  const name = seededPick(seed, 'name', STAGE_NAMES);
  const first = seededInt(seed, 'pos1', 0, POSITIONS.length - 1);
  const second = (first + seededInt(seed, 'pos2', 1, POSITIONS.length - 1)) % POSITIONS.length;
  return {
    seed,
    name,
    positions: [POSITIONS[first]!, POSITIONS[second]!],
    cardNo: seededInt(seed, 'card', 1, 9),
    birthday: `${String(seededInt(seed, 'mm', 1, 12)).padStart(2, '0')}.${String(seededInt(seed, 'dd', 1, 28)).padStart(2, '0')}`,
  };
}

/** 포토카드 번호 — 9종 중 몇 번째 카드인지 */
function cardLabel(cardNo: number): string {
  return `${String(cardNo).padStart(2, '0')}/09`;
}

/* ── Photocard ─────────────────────────────────────────── */

const SIGN_FONT = '"Segoe Script", "Brush Script MT", "Snell Roundhand", cursive';

function Sparkles({ seed }: { seed: number }) {
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
          style={{
            left: `${6 + seededRandom(seed, `sx${i}`) * 84}%`,
            top: `${4 + seededRandom(seed, `sy${i}`) * 60}%`,
            fontSize: 8 + seededRandom(seed, `ss${i}`) * 12,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 1.6 + (i % 3) * 0.5, repeat: Infinity, delay: i * 0.3 }}
          aria-hidden="true"
        >
          ✦
        </motion.span>
      ))}
    </>
  );
}

function Photocard({
  src,
  concept,
  stage,
  profile,
}: {
  src: string;
  concept: Concept;
  stage: StageId;
  profile: ReturnType<typeof profileOf>;
}) {
  const [flipped, setFlipped] = useState(false);
  const face = 'absolute inset-0 overflow-hidden rounded-[18px] [backface-visibility:hidden]';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-64 [perspective:1200px]">
        <motion.div
          className="relative aspect-[55/85] w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* 앞면 */}
          <motion.div
            className={`${face} p-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.55)]`}
            style={{ backgroundImage: concept.frame, backgroundSize: '300% 300%' }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-slate-900">
              <ProcessedPhoto src={src} look={idolLook(concept, stage)} className="h-full w-full" alt={`${concept.label} 콘셉트 아이돌 포토카드`} delayMs={1100}>
                <Sparkles seed={profile.seed} />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.28)_45%,transparent_60%)] mix-blend-overlay" />
                <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                  <span className="rounded-full bg-black/55 px-2 py-0.5 text-[8px] font-bold tracking-[0.2em] text-white">NEANDER</span>
                  <span className="rounded-full px-2 py-0.5 text-[8px] font-bold tracking-wider text-slate-950" style={{ backgroundColor: concept.cheer.h }}>
                    {concept.en}
                  </span>
                </div>
                <span className="absolute right-2.5 top-2.5 font-mono text-[9px] font-bold text-white drop-shadow">
                  {cardLabel(profile.cardNo)}
                </span>
                {/* 팬사인 메시지 */}
                <div className="absolute inset-x-4 top-[11%] -rotate-[5deg] text-center" style={{ fontFamily: SIGN_FONT, color: concept.pen }}>
                  <p className="text-[11px] font-semibold leading-snug [text-shadow:0_0_3px_#fff,0_0_6px_#fff] [word-break:keep-all]">
                    To. 나의 첫 팬 ♡
                    <br />
                    {concept.caption}
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2.5 pt-10 text-left">
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold tracking-[0.25em] text-white/70">{STAGES[stage].tag}</p>
                    <p className="font-display text-2xl font-extrabold leading-none text-white">{profile.name}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-white/85">{profile.positions.join(' · ')}</p>
                  </div>
                  <p
                    className="mb-1 shrink-0 -rotate-12 text-2xl font-bold italic text-white"
                    style={{ fontFamily: SIGN_FONT, textShadow: `0 0 6px ${concept.pen}, 0 0 12px ${concept.pen}` }}
                    aria-label={`${profile.name} 사인`}
                  >
                    {profile.name.charAt(0)}
                    {profile.name.slice(1).toLowerCase()}♡
                  </p>
                </div>
              </ProcessedPhoto>
            </div>
          </motion.div>

          {/* 뒷면 */}
          <div className={`${face} [transform:rotateY(180deg)] p-[5px]`} style={{ backgroundImage: concept.frame, backgroundSize: '300% 300%' }}>
            <div className="flex h-full w-full flex-col justify-between rounded-[14px] bg-slate-950/90 p-4 text-left text-white">
              <div>
                <p className="text-[9px] font-bold tracking-[0.3em] text-white/50">NEANDER ENT. PHOTOCARD</p>
                <p className="mt-3 font-display text-3xl font-extrabold leading-none">{profile.name}</p>
                <p className="mt-1 text-xs text-white/70">{profile.positions.join(' · ')}</p>
              </div>
              <dl className="space-y-2 text-xs">
                {[
                  ['콘셉트', `${concept.emoji} ${concept.label}`],
                  ['생일', profile.birthday],
                  ['포토카드', `${STAGES[stage].label} 버전 · ${cardLabel(profile.cardNo)}`],
                  ['메이크업', concept.points.slice(0, 2).join(', ')],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="w-14 shrink-0 text-white/45">{k}</dt>
                    <dd className="text-white/90">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] text-white/60">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: concept.cheer.h }} />
                  응원 컬러 · {concept.cheer.n}
                </span>
                <span className="font-display text-sm font-bold" style={{ color: concept.cheer.h }}>
                  ♡
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        ↻ {flipped ? '앞면 보기' : '뒷면 프로필 보기'}
      </button>
    </div>
  );
}

/* ── Print photocard (정적 SVG, 300×400) ──────────────── */

const CARD_SANS = 'Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "Helvetica Neue", Arial, sans-serif';

/** 네 갈래 반짝이 (✦) */
function sparklePath(x: number, y: number, r: number): string {
  const k = r * 0.22;
  return `M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z`;
}

/** 손글씨 메시지를 대략 maxChars 글자 단위로 줄바꿈한다 (SVG text는 자동 줄바꿈이 없다) */
function wrapWords(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && `${line} ${word}`.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** 결과 화면 포토카드 앞면(홀로 테두리·반짝이·팬사인·네임)을 출력물 위에 얹는다 */
function PhotocardPrint({ concept, stage, profile }: { concept: Concept; stage: StageId; profile: ReturnType<typeof profileOf> }) {
  const frame = concept.frame.match(/#[0-9a-f]{6}/gi) ?? ['#ffffff'];
  const message = ['To. 나의 첫 팬 ♡', ...wrapWords(concept.caption, 18)];
  const sign = `${profile.name.charAt(0)}${profile.name.slice(1).toLowerCase()}♡`;
  // 화면 카드(256px 폭)의 스파클 배치를 같은 비율로 옮긴다
  const sparkles = Array.from({ length: 7 }, (_, i) => ({
    x: (6 + seededRandom(profile.seed, `sx${i}`) * 84) * 3,
    y: (4 + seededRandom(profile.seed, `sy${i}`) * 60) * 4,
    r: (8 + seededRandom(profile.seed, `ss${i}`) * 12) * 0.45,
  }));
  const enW = concept.en.length * 6.6;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width={1200} height={1600}>
      <defs>
        <linearGradient id="pc-frame" x1="0" y1="0" x2="1" y2="1">
          {frame.map((c, i) => (
            <stop key={i} offset={i / Math.max(1, frame.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id="pc-sheen" x1="0" y1="0.2" x2="1" y2="0.8">
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pc-bottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#000000" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#000000" stopOpacity="0.4" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pc-glow">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="300" height="400" fill="url(#pc-sheen)" />
      {sparkles.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r={s.r * 1.6} fill="url(#pc-glow)" opacity="0.6" />
          <path d={sparklePath(s.x, s.y, s.r)} fill="#ffffff" />
        </g>
      ))}

      {/* 로고 · 콘셉트 칩 */}
      <g fontFamily={CARD_SANS} fontSize="9.4" fontWeight="700">
        <rect x="14" y="14" width="74" height="17" rx="8.5" fill="#000000" fillOpacity="0.55" />
        <text x="51" y="25.8" textAnchor="middle" fill="#ffffff" letterSpacing="1.9" textLength="56" lengthAdjust="spacingAndGlyphs">
          NEANDER
        </text>
        <rect x="93" y="14" width={enW + 16} height="17" rx="8.5" fill={concept.cheer.h} />
        <text x={93 + (enW + 16) / 2} y="25.8" textAnchor="middle" fill="#020617" textLength={enW} lengthAdjust="spacingAndGlyphs">
          {concept.en}
        </text>
      </g>

      {/* 팬사인 메시지 */}
      <g transform="rotate(-5 150 60)" fontFamily={SIGN_FONT} fontSize="12.9" fontWeight="600" textAnchor="middle" fill={concept.pen} stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke">
        {message.map((line, i) => (
          <text key={i} x="150" y={56 + i * 17}>
            {line}
          </text>
        ))}
      </g>

      {/* 네임 · 사인 */}
      <rect y="290" width="300" height="110" fill="url(#pc-bottom)" />
      <g fontFamily={CARD_SANS} fill="#ffffff">
        <text x="16" y="342" fontSize="9.4" fontWeight="700" letterSpacing="2.3" fillOpacity="0.7">
          {STAGES[stage].tag}
        </text>
        <text x="15" y="369" fontSize="30" fontWeight="900">
          {profile.name}
        </text>
        <text x="16" y="385" fontSize="11.7" fontWeight="500" fillOpacity="0.85">
          {profile.positions.join(' · ')}
        </text>
      </g>
      <g transform="translate(282 374) rotate(-12)" fontFamily={SIGN_FONT} fontSize="28" fontWeight="700" fontStyle="italic" textAnchor="end">
        <text stroke={concept.pen} strokeWidth="5" strokeOpacity="0.55" strokeLinejoin="round" fill={concept.pen}>
          {sign}
        </text>
        <text fill="#ffffff">{sign}</text>
      </g>

      {/* 홀로 테두리 */}
      <path d="M0 0 H300 V400 H0 Z M21 7 H279 Q293 7 293 21 V379 Q293 393 279 393 H21 Q7 393 7 379 V21 Q7 7 21 7 Z" fill="url(#pc-frame)" fillRule="evenodd" />
    </svg>
  );
}

const PAPER: Record<ConceptId, 'white' | 'cream' | 'black'> = { girlcrush: 'black', lovely: 'white', fresh: 'white', dreamy: 'white', retro: 'cream' };

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const capture = getCapture(answers, 'face');
  const conceptId = getConcept(answers);
  const concept = CONCEPTS[conceptId];
  const stage = getStage(answers);
  const profile = profileOf(answers);
  const stat = (salt: string) => seededInt(profile.seed, salt, 84, 99);

  return (
    <ResultShell
      eyebrow={`${concept.label} 콘셉트 · 아이돌 데뷔 포토카드`}
      title={`${profile.name}, 데뷔를 축하해요!`}
      description={`${concept.desc} 메이크업에 ${STAGES[stage].label} 조명을 더해 포토카드로 출력했어요. 카드를 뒤집어 프로필도 확인해 보세요.`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다른 콘셉트로 변신"
    >
      {capture && <Photocard src={capture.image} concept={concept} stage={stage} profile={profile} />}

      <TraitChips title="AI가 적용한 메이크업·조명" items={concept.points} />

      <InfoGrid
        items={[
          { emoji: '🎤', label: '스테이지 네임', value: profile.name },
          { emoji: '⭐', label: '포지션', value: profile.positions.join(' · ') },
          { emoji: concept.emoji, label: '콘셉트', value: concept.label },
          { emoji: '💡', label: '응원 컬러', value: concept.cheer.n },
        ]}
      />

      <ScoreBars
        color={pillarColor}
        suffix="점"
        items={[
          { label: '카메라 흡입력', value: stat('camera') },
          { label: '콘셉트 소화력', value: stat('concept') },
          { label: '무대 장악력', value: stat('stage') },
        ]}
      />
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'idol-makeup-booth',
    targetSlug: 'ai-idol-makeup-booth',
    industryId: 'entertainment',
    analyzeEmoji: '💖',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'face',
    analyzeMessages: ['아이돌 메이크업 입히는 중', '무대 조명 세팅 중', '스테이지 네임 짓는 중', '포토카드 인쇄 중'],
  },
  steps: [
    choiceStep({
      id: 'concept',
      title: '어떤 콘셉트로 데뷔할까요?',
      subtitle: '콘셉트에 맞춰 메이크업과 조명이 달라져요',
      columns: 3,
      options: (Object.keys(CONCEPTS) as ConceptId[]).map((id) => ({
        id,
        emoji: CONCEPTS[id].emoji,
        label: CONCEPTS[id].label,
        desc: CONCEPTS[id].desc,
        swatch: CONCEPTS[id].swatch,
      })),
    }),
    choiceStep({
      id: 'stage',
      title: '포토카드 배경을 골라주세요',
      columns: 2,
      options: (Object.keys(STAGES) as StageId[]).map((id) => ({ id, emoji: STAGES[id].emoji, label: STAGES[id].label, desc: STAGES[id].desc })),
    }),
    cameraStep({
      id: 'face',
      title: '데뷔 촬영을 시작할게요',
      subtitle: '셔터를 누르면 3초 뒤 찰칵! 카메라를 보고 웃어주세요',
      mode: 'face',
      subject: '얼굴',
      countdown: true,
      scanLabels: ['얼굴 랜드마크 인식', '눈매·입술 영역 분리', '무대 조명 시뮬레이션', '아이돌 메이크업 레이어 합성'],
      readouts: (c) => [
        { label: '포토제닉 지수', value: `${88 + (c.seed % 11)}%` },
        { label: '베스트 앵글', value: seededPick(c.seed, 'angle', ['정면', '좌 15°', '우 15°']) },
        { label: '매력 포인트', value: seededPick(c.seed, 'charm', ['눈웃음', '콧선', '미소 라인', '또렷한 눈매']) },
        { label: '피부 톤', value: c.stats.warmth > 55 ? '웜' : c.stats.warmth < 45 ? '쿨' : '뉴트럴' },
      ],
    }),
  ],
  computeResult: (answers) => getConcept(answers),
  Result,
  print: (answers) => {
    const capture = getCapture(answers, 'face');
    const conceptId = getConcept(answers);
    const concept = CONCEPTS[conceptId];
    const stage = getStage(answers);
    const profile = profileOf(answers);
    return {
      kind: 'photo',
      photos: capture
        ? [{ src: capture.image, look: idolLook(concept, stage), overlay: <PhotocardPrint concept={concept} stage={stage} profile={profile} /> }]
        : [],
      title: `${profile.name}, 데뷔를 축하해요!`,
      caption: `${concept.label} 콘셉트 · ${STAGES[stage].label} 버전 · ${profile.positions.join(' · ')}`,
      // 화면 포토카드 오른쪽 위의 카드 번호
      badge: cardLabel(profile.cardNo),
      paper: PAPER[conceptId],
    };
  },
});
