'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { DemoAnswers, DemoResultProps, DemoStepProps } from '@/types/demo';
import {
  Panel,
  RadarChart,
  ResultShell,
  ScoreBars,
  answersSeed,
  choiceStep,
  defineDemo,
  getChoice,
  getFields,
  seededInt,
  sliderStep,
  type DemoStepDef,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type TasteId = 'sweet' | 'salty' | 'sour' | 'bitter' | 'umami';

const TASTES: { id: TasteId; label: string; emoji: string; color: string; left: string; right: string; code: string }[] = [
  { id: 'sweet', label: '단맛', emoji: '🍯', color: '#f472b6', left: '덜 달게', right: '달콤할수록 좋아', code: 'SW' },
  { id: 'salty', label: '짠맛', emoji: '🧂', color: '#38bdf8', left: '싱겁게', right: '짭짤하게', code: 'SA' },
  { id: 'sour', label: '신맛', emoji: '🍋', color: '#facc15', left: '새콤한 건 별로', right: '시큼할수록 좋아', code: 'SO' },
  { id: 'bitter', label: '쓴맛', emoji: '☕', color: '#a78bfa', left: '쓴 건 싫어요', right: '쌉싸름한 게 좋아', code: 'BI' },
  { id: 'umami', label: '감칠맛', emoji: '🍄', color: '#fb923c', left: '담백하게', right: '진하고 깊게', code: 'UM' },
];

const SPICE_LEVELS = [
  { label: '맵찔이', desc: '후추만 뿌려도 매워요', emoji: '🥛' },
  { label: '순한맛', desc: '살짝 칼칼한 정도가 좋아요', emoji: '🌱' },
  { label: '보통맛', desc: '떡볶이는 기본이죠', emoji: '🌶️' },
  { label: '매운맛', desc: '땀이 나야 먹은 것 같아요', emoji: '🔥' },
  { label: '지옥맛', desc: '매울수록 행복해져요', emoji: '🌋' },
];

type TextureId = 'crispy' | 'chewy' | 'soft' | 'creamy';

const TEXTURES: Record<TextureId, { label: string; emoji: string; desc: string; intensity: number; pick: Rec }> = {
  crispy: {
    label: '바삭',
    emoji: '🍗',
    desc: '튀김·크래커·누룽지',
    intensity: 88,
    pick: { emoji: '🍤', name: '새우튀김 & 누룽지칩', why: '씹는 소리까지 맛있는 바삭 조합' },
  },
  chewy: {
    label: '쫄깃',
    emoji: '🍡',
    desc: '떡·생면·젤리',
    intensity: 72,
    pick: { emoji: '🍡', name: '쫄면 & 인절미', why: '탄력 있는 식감을 두 번 즐겨요' },
  },
  soft: {
    label: '부드러운',
    emoji: '🍮',
    desc: '푸딩·계란찜·두부',
    intensity: 38,
    pick: { emoji: '🍮', name: '뚝배기 계란찜 & 연두부', why: '입에서 사르르 녹는 포근함' },
  },
  creamy: {
    label: '크리미',
    emoji: '🧀',
    desc: '크림 파스타·치즈·라테',
    intensity: 56,
    pick: { emoji: '🍝', name: '까르보나라 & 부라타', why: '진하고 매끄러운 크림 텍스처' },
  },
};

type AdventureId = 'classic' | 'curious' | 'explorer' | 'pioneer';

const ADVENTURE: Record<AdventureId, { label: string; emoji: string; desc: string; value: number; suffix: string; pick: Rec; drink: Rec }> = {
  classic: {
    label: '늘 먹던 맛',
    emoji: '🏠',
    desc: '검증된 단골 메뉴가 최고',
    value: 18,
    suffix: '수호자',
    pick: { emoji: '🍲', name: '집밥 된장찌개', why: '익숙함이 주는 안정감이 1순위' },
    drink: { emoji: '🍚', name: '살얼음 식혜', why: '실패 없는 전통 디저트 음료' },
  },
  curious: {
    label: '가끔은 새롭게',
    emoji: '👀',
    desc: '후기가 좋으면 도전해요',
    value: 46,
    suffix: '미식가',
    pick: { emoji: '🌮', name: '비리아 타코', why: '살짝 새로운 한 입으로 기분 전환' },
    drink: { emoji: '🫖', name: '진저 콤부차', why: '톡 쏘는 발효차로 가볍게 도전' },
  },
  explorer: {
    label: '신메뉴 먼저',
    emoji: '🧭',
    desc: '처음 보는 메뉴부터 시켜요',
    value: 76,
    suffix: '탐험가',
    pick: { emoji: '🫓', name: '에티오피아 인제라', why: '발효 빵으로 떠나는 미식 여행' },
    drink: { emoji: '🟣', name: '페루 치차 모라다', why: '보라 옥수수로 만든 이국적인 음료' },
  },
  pioneer: {
    label: '세상 모든 맛',
    emoji: '🚀',
    desc: '곤충 요리도 한 입은 먹어봐요',
    value: 96,
    suffix: '개척자',
    pick: { emoji: '🦗', name: '귀뚜라미 단백질 쿠키', why: '미래 식량까지 섭렵하는 개척 정신' },
    drink: { emoji: '🍄', name: '차가버섯 커피', why: '버섯으로 내린 신개념 커피' },
  },
};

interface Rec {
  emoji: string;
  name: string;
  why: string;
}

type BaseId = TasteId | 'fire' | 'balance';

const BASES: Record<BaseId, { prefix: string; emoji: string; desc: string; tint: string; foods: Rec[]; drinks: Rec[] }> = {
  sweet: {
    prefix: '달콤',
    emoji: '🍰',
    desc: '단맛에서 행복을 찾는 타입이에요. 디저트 배는 따로 있다는 말이 딱 당신 이야기예요.',
    tint: '#f472b6',
    foods: [
      { emoji: '🥞', name: '수플레 팬케이크', why: '폭신한 단맛의 정석' },
      { emoji: '🍠', name: '꿀 고구마 맛탕', why: '겉바속촉 달콤함' },
      { emoji: '🍗', name: '허니 간장 치킨', why: '단짠의 황금 비율' },
    ],
    drinks: [
      { emoji: '🧋', name: '흑당 밀크티', why: '진한 캐러멜 향' },
      { emoji: '🍑', name: '복숭아 아이스티', why: '과즙 가득한 단맛' },
      { emoji: '🥂', name: '모스카토 스파클링', why: '꿀 향 나는 달콤한 기포' },
    ],
  },
  salty: {
    prefix: '짭짤',
    emoji: '🧂',
    desc: '간이 딱 맞는 짭짤함이 입맛을 깨우는 타입이에요. 국물 한 숟갈로 하루를 시작해요.',
    tint: '#38bdf8',
    foods: [
      { emoji: '🍜', name: '진한 돈코츠 라멘', why: '깊고 짭짤한 국물' },
      { emoji: '🍈', name: '프로슈토 멜론', why: '짠맛이 단맛을 끌어올려요' },
      { emoji: '🍙', name: '명란 버터 주먹밥', why: '고소하고 짭짤한 한 입' },
    ],
    drinks: [
      { emoji: '🍺', name: '청량한 라거', why: '짠맛 뒤의 시원한 리셋' },
      { emoji: '🫧', name: '레몬 탄산수', why: '입안을 산뜻하게' },
      { emoji: '🍵', name: '구수한 보리차', why: '짠 음식과 편안한 궁합' },
    ],
  },
  sour: {
    prefix: '상큼',
    emoji: '🍋',
    desc: '새콤한 맛에 눈이 번쩍 뜨이는 상큼파예요. 입맛 없을 때도 식초 한 방울이면 해결!',
    tint: '#facc15',
    foods: [
      { emoji: '🥗', name: '유자 드레싱 샐러드', why: '향긋한 시트러스 산미' },
      { emoji: '🐟', name: '페루식 세비체', why: '라임에 절인 상큼한 해산물' },
      { emoji: '🥧', name: '레몬 머랭 타르트', why: '새콤달콤한 디저트' },
    ],
    drinks: [
      { emoji: '🍹', name: '레몬 하이볼', why: '톡 쏘는 산미와 기포' },
      { emoji: '🥝', name: '키위 에이드', why: '비타민 폭탄 상큼함' },
      { emoji: '🍶', name: '생막걸리', why: '새콤한 발효의 맛' },
    ],
  },
  bitter: {
    prefix: '쌉싸름',
    emoji: '☕',
    desc: '쌉싸름한 맛의 깊이를 아는 어른 입맛이에요. 에스프레소의 끝맛까지 즐길 줄 알아요.',
    tint: '#a78bfa',
    foods: [
      { emoji: '🍕', name: '루콜라 프로슈토 피자', why: '쌉쌀한 잎채소의 매력' },
      { emoji: '🍫', name: '다크 초콜릿 가나슈', why: '카카오 70% 이상의 깊이' },
      { emoji: '🌿', name: '봄 두릅 숙회', why: '제철 나물의 쌉싸름함' },
    ],
    drinks: [
      { emoji: '☕', name: '에스프레소 도피오', why: '진하게 떨어지는 쓴맛' },
      { emoji: '🍺', name: 'IPA 수제맥주', why: '홉의 향긋한 쌉쌀함' },
      { emoji: '🍵', name: '말차 라테', why: '녹차의 은은한 떫은맛' },
    ],
  },
  umami: {
    prefix: '감칠맛',
    emoji: '🍄',
    desc: '깊고 진한 감칠맛을 쫓는 타입이에요. 육수·발효·숙성이라는 단어에 저절로 반응해요.',
    tint: '#fb923c',
    foods: [
      { emoji: '🍄', name: '트러플 버섯 리조또', why: '버섯이 가진 감칠맛 끝판왕' },
      { emoji: '🥩', name: '드라이에이징 스테이크', why: '숙성이 만든 깊은 풍미' },
      { emoji: '🥘', name: '묵은지 김치찜', why: '발효가 쌓아 올린 감칠맛' },
    ],
    drinks: [
      { emoji: '🍶', name: '숙성 청주', why: '쌀의 감칠맛이 은은하게' },
      { emoji: '🍅', name: '토마토 바질 주스', why: '글루탐산 가득한 채소 주스' },
      { emoji: '🍷', name: '피노 누아', why: '버섯·흙 향과 찰떡궁합' },
    ],
  },
  fire: {
    prefix: '불꽃',
    emoji: '🔥',
    desc: '매운맛에서 쾌감을 느끼는 불꽃 미각이에요. 스트레스는 매운 음식으로 푸는 게 국룰!',
    tint: '#ef4444',
    foods: [
      { emoji: '🍲', name: '얼얼한 마라탕', why: '혀가 저릿한 화자오 매운맛' },
      { emoji: '🌶️', name: '청양고추 숯불 닭발', why: '불향 가득 매운 안주' },
      { emoji: '🍛', name: '빈달루 커리', why: '향신료가 폭발하는 인도식 매운맛' },
    ],
    drinks: [
      { emoji: '🥛', name: '망고 라씨', why: '매운맛을 달래는 요거트' },
      { emoji: '🍺', name: '벨지안 위트 비어', why: '부드러운 밀맥주로 진화' },
      { emoji: '🧊', name: '쿨 민트 레모네이드', why: '입안 온도를 뚝' },
    ],
  },
  balance: {
    prefix: '밸런스',
    emoji: '⚖️',
    desc: '어느 한 맛에 치우치지 않는 올라운더예요. 오늘의 메뉴는 당신이 고르면 다 맛있어요.',
    tint: '#2dd4bf',
    foods: [
      { emoji: '🍱', name: '제철 한정식 코스', why: '다섯 가지 맛을 골고루' },
      { emoji: '🍣', name: '셰프 추천 스시 코스', why: '섬세한 맛의 균형' },
      { emoji: '🥘', name: '해산물 파에야', why: '감칠맛·산미·향의 조화' },
    ],
    drinks: [
      { emoji: '🍵', name: '우전 녹차', why: '맑고 균형 잡힌 향' },
      { emoji: '🥂', name: '브뤼 스파클링 와인', why: '어떤 음식과도 무난한 페어링' },
      { emoji: '🍹', name: '논알콜 모히토', why: '민트와 라임의 산뜻함' },
    ],
  },
};

/** DNA 이중나선 염기쌍 색 — 8가지 미각 축 */
const AXIS_COLORS = {
  spice: '#ef4444',
  texture: '#2dd4bf',
  adventure: '#4ade80',
} as const;

/* ── Analysis ─────────────────────────────────────────── */

function analyze(answers: DemoAnswers) {
  const fields = getFields<number>(answers, 'taste');
  const tastes = TASTES.map((t) => ({ ...t, value: fields[t.id] ?? 50 }));
  const spice = typeof answers.spice === 'number' ? answers.spice : 2;
  const textureId = (getChoice(answers, 'texture') as TextureId | undefined) ?? 'crispy';
  const adventureId = (getChoice(answers, 'adventure') as AdventureId | undefined) ?? 'curious';
  const texture = TEXTURES[textureId] ?? TEXTURES.crispy;
  const adventure = ADVENTURE[adventureId] ?? ADVENTURE.curious;
  const seed = answersSeed(answers);

  const sorted = [...tastes].sort((a, b) => b.value - a.value);
  const top = sorted[0]!;
  const spread = top.value - sorted[sorted.length - 1]!.value;
  const spiceScore = spice * 25;

  let base: BaseId = top.id;
  if (spice >= 3 && spiceScore >= top.value) base = 'fire';
  else if (spread < 20) base = 'balance';

  const data = BASES[base];
  const name = `${data.prefix} ${adventure.suffix}`;

  const axes = [
    ...tastes.map((t) => ({ id: t.id as string, label: t.label, emoji: t.emoji, color: t.color, value: t.value })),
    { id: 'spice', label: '매운맛', emoji: '🌶️', color: AXIS_COLORS.spice, value: Math.max(6, spiceScore) },
    { id: 'texture', label: `식감·${texture.label}`, emoji: texture.emoji, color: AXIS_COLORS.texture, value: texture.intensity },
    { id: 'adventure', label: '모험 지수', emoji: '🧭', color: AXIS_COLORS.adventure, value: adventure.value },
  ];

  const codeParts = [
    `${top.code}${String(Math.min(99, top.value)).padStart(2, '0')}`,
    `${sorted[1]!.code}${String(Math.min(99, sorted[1]!.value)).padStart(2, '0')}`,
    `SP${spice}`,
    ({ crispy: 'CS', chewy: 'CH', soft: 'SF', creamy: 'CM' } as const)[textureId] ?? 'CS',
    adventureId.slice(0, 2).toUpperCase(),
  ];
  const code = codeParts.join('·');

  const rarity = (seededInt(seed, 'rarity', 21, 94) / 10).toFixed(1);
  const serial = String(seededInt(seed, 'serial', 1, 9999)).padStart(4, '0');

  // 유형 추천 3개 + 식감·모험 성향 맞춤 1개씩
  const foods = [...data.foods, texture.pick];
  const drinks = [...data.drinks, adventure.drink];
  const hashtags = ['#미각DNA', `#${name.replace(/\s/g, '')}`, `#${texture.label}파`];

  return { base, data, name, tastes, spice, texture, textureId, adventure, adventureId, axes, code, codeParts, rarity, serial, foods, drinks, hashtags };
}

/* ── Spice step (custom) ──────────────────────────────── */

function SpiceStep({ answers, onUpdate }: DemoStepProps) {
  const level = typeof answers.spice === 'number' ? answers.spice : null;
  const current = level === null ? null : SPICE_LEVELS[level]!;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6">
      <div className="flex h-36 w-full flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60">
        {current ? (
          <motion.div key={level} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
            <span className="text-5xl leading-none">{current.emoji}</span>
            <p className="mt-3 text-lg font-bold text-white">
              {level}단계 · {current.label}
            </p>
            <p className="mt-1 text-xs text-slate-400">{current.desc}</p>
          </motion.div>
        ) : (
          <p className="text-sm text-slate-500">아래 고추를 눌러 매운맛 내성을 알려주세요</p>
        )}
      </div>

      {/* 온도계 */}
      <div className="w-full">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #fde68a, #fb923c, #ef4444, #991b1b)' }}
            animate={{ width: `${level === null ? 0 : 8 + (level / 4) * 92}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
          <span>순둥</span>
          <span>얼얼</span>
        </div>
      </div>

      <div className="flex w-full justify-between gap-2">
        {SPICE_LEVELS.map((s, i) => {
          const lit = level !== null && i <= level;
          return (
            <motion.button
              key={s.label}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate('spice', i)}
              aria-pressed={level === i}
              aria-label={`${i}단계 ${s.label}`}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-2xl border py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                level === i ? 'border-red-400 bg-red-500/15' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              )}
            >
              <span className={cn('text-2xl transition-all', lit ? 'grayscale-0' : 'opacity-40 grayscale')}>🌶️</span>
              <span className="text-[11px] font-medium text-slate-300">{s.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

const spiceStep: DemoStepDef = {
  meta: {
    id: 'spice',
    titleKey: '매운맛, 어디까지 괜찮아요?',
    subtitleKey: '고추를 눌러 나의 매운맛 내성 단계를 골라주세요',
    canProceed: (a) => typeof a.spice === 'number',
  },
  Component: SpiceStep,
};

/* ── DNA helix ────────────────────────────────────────── */

const HELIX_W = 320;
const HELIX_H = 128;
const HELIX_PAD = 18;
const RUNGS = 16;

function mix(hex: string, amount: number): string {
  // 흰색과 섞어 염기쌍의 상보 염기 색을 만든다
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const m = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

function DnaHelix({ axes }: { axes: { color: string; value: number }[] }) {
  const reduceMotion = useReducedMotion();
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;
    let start = 0;
    const loop = (now: number) => {
      if (!start) start = now;
      setTime((now - start) / 1000);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  const cy = HELIX_H / 2;
  const amp = HELIX_H / 2 - 16;
  const span = HELIX_W - HELIX_PAD * 2;
  const theta = (x: number) => ((x - HELIX_PAD) / span) * Math.PI * 3.2 + time * 1.3;

  const strand = (sign: 1 | -1) => {
    let d = '';
    for (let i = 0; i <= 64; i++) {
      const x = HELIX_PAD + (span * i) / 64;
      const y = cy + sign * amp * Math.sin(theta(x));
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d;
  };

  return (
    <svg viewBox={`0 0 ${HELIX_W} ${HELIX_H}`} className="h-auto w-full" role="img" aria-label="미각 DNA 이중나선">
      <defs>
        <linearGradient id="dna-strand-a" x1="0" x2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="dna-strand-b" x1="0" x2="1">
          <stop offset="0" stopColor="#f9a8d4" />
          <stop offset="1" stopColor="#fdba74" />
        </linearGradient>
      </defs>
      {Array.from({ length: RUNGS }, (_, i) => {
        const axis = axes[i % axes.length]!;
        const x = HELIX_PAD + (span * i) / (RUNGS - 1);
        const t = theta(x);
        const ya = cy + amp * Math.sin(t);
        const yb = cy - amp * Math.sin(t);
        const depth = Math.cos(t); // 앞(+)·뒤(-)
        const opacity = 0.35 + (depth + 1) * 0.3;
        const width = 2 + (axis.value / 100) * 4;
        return (
          <g key={i} opacity={opacity}>
            <line x1={x} y1={ya} x2={x} y2={cy} stroke={axis.color} strokeWidth={width} strokeLinecap="round" />
            <line x1={x} y1={cy} x2={x} y2={yb} stroke={mix(axis.color, 0.55)} strokeWidth={width} strokeLinecap="round" />
          </g>
        );
      })}
      <path d={strand(1)} fill="none" stroke="url(#dna-strand-a)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <path d={strand(-1)} fill="none" stroke="url(#dna-strand-b)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      {Array.from({ length: RUNGS }, (_, i) => {
        const x = HELIX_PAD + (span * i) / (RUNGS - 1);
        const t = theta(x);
        const depth = Math.cos(t);
        return (
          <g key={`n${i}`}>
            <circle cx={x} cy={cy + amp * Math.sin(t)} r={2.6 + depth * 1.2} fill="#e0f2fe" />
            <circle cx={x} cy={cy - amp * Math.sin(t)} r={2.6 - depth * 1.2} fill="#fff7ed" />
          </g>
        );
      })}
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const r = analyze(answers);
  const { foods, drinks } = r;

  return (
    <ResultShell
      eyebrow="AI 미각 DNA 분석 결과"
      title={`${r.data.emoji} ${r.name}`}
      description={r.data.desc}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 분석하기"
    >
      {/* SNS 공유용 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/10 p-5 text-left shadow-2xl shadow-black/50"
        style={{
          background: `radial-gradient(120% 70% at 100% 0%, ${r.data.tint}40, transparent 60%), radial-gradient(90% 60% at 0% 100%, #6366f140, transparent 60%), linear-gradient(165deg, #0f172a, #020617)`,
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-[11px] font-bold tracking-[0.3em] text-white/80">NEANDER · TASTE DNA</p>
          <p className="font-mono text-[10px] text-white/50">No.{r.serial}</p>
        </div>

        <div className="mt-3 rounded-2xl border border-white/5 bg-black/20 px-1 py-2">
          <DnaHelix axes={r.axes} />
        </div>

        <p className="mt-4 text-[11px] font-medium uppercase tracking-widest text-white/50">My taste type</p>
        <p className="mt-1 text-3xl font-extrabold text-white [word-break:keep-all]">
          <span className="mr-2">{r.data.emoji}</span>
          {r.name}
        </p>
        <p className="mt-2 font-mono text-xs tracking-wider" style={{ color: r.data.tint }}>
          DNA · {r.code}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { k: '매운맛', v: `${r.spice}/4`, e: '🌶️' },
            { k: '최애 식감', v: r.texture.label, e: r.texture.emoji },
            { k: '모험 지수', v: `${r.adventure.value}%`, e: '🧭' },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center">
              <p className="text-base leading-none">{s.e}</p>
              <p className="mt-1 text-sm font-bold text-white">{s.v}</p>
              <p className="text-[10px] text-white/50">{s.k}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-white/10 pt-3 text-[11px] font-medium" style={{ color: r.data.tint }}>
          {r.hashtags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
          <span className="ml-auto text-white/40">상위 {r.rarity}% 희귀 유형</span>
        </div>
      </motion.div>

      {/* 8가지 축 범례 */}
      <Panel title="8가지 미각 축 · 염기쌍 해독">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {r.axes.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-xs">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: a.color }} aria-hidden="true" />
              <span className="truncate text-slate-300">
                {a.emoji} {a.label}
              </span>
              <span className="ml-auto font-mono font-semibold text-white">{a.value}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-500">색은 미각 축, 막대 굵기는 강도를 뜻해요</p>
      </Panel>

      <Panel title="5미(味) 밸런스">
        <RadarChart color={pillarColor} axes={r.tastes.map((t) => ({ label: t.label, value: t.value }))} />
        <ScoreBars
          className="mt-2"
          color={pillarColor}
          items={[
            { label: '🌶️ 매운맛 내성', value: r.spice * 25 },
            { label: '🧭 새로운 맛 도전 지수', value: r.adventure.value },
          ]}
        />
      </Panel>

      <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
        {[
          { title: '🍽️ 추천 음식', items: foods },
          { title: '🥤 추천 음료', items: drinks },
        ].map((block) => (
          <div key={block.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left">
            <p className="mb-3 text-xs font-semibold text-slate-300">{block.title}</p>
            <ul className="space-y-2.5">
              {block.items.map((item, i) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex gap-2.5"
                >
                  <span className="text-xl leading-none">{item.emoji}</span>
                  <span>
                    <span className="block text-sm font-medium text-white [word-break:keep-all]">{item.name}</span>
                    <span className="block text-[11px] text-slate-400 [word-break:keep-all]">{item.why}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="flex w-full max-w-md items-center gap-4 rounded-2xl border p-4 text-left"
        style={{ borderColor: `${pillarColor}55`, background: `linear-gradient(120deg, ${pillarColor}1f, transparent)` }}
      >
        <span className="text-4xl leading-none">{r.adventure.pick.emoji}</span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: pillarColor }}>
            이번 주 미각 도전 미션
          </p>
          <p className="mt-0.5 text-sm font-bold text-white">{r.adventure.pick.name}</p>
          <p className="text-xs text-slate-400 [word-break:keep-all]">
            {r.adventure.pick.why} · 모험 지수 {r.adventure.value}% 맞춤
          </p>
        </div>
      </div>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'taste-dna',
    targetSlug: 'ai-taste-dna',
    industryId: 'fnb',
    analyzeEmoji: '🧬',
    analyzeDurationMs: 3400,
    analyzeMessages: ['미각 데이터 8개 축 정규화 중', '염기서열 매핑 중', '미각 유형 클러스터링 중', '맞춤 메뉴 찾는 중'],
  },
  steps: [
    sliderStep({
      id: 'taste',
      title: '다섯 가지 기본 맛, 얼마나 좋아하세요?',
      subtitle: '슬라이더로 나의 입맛을 표시해 주세요',
      sliders: TASTES.map((t) => ({ id: t.id, emoji: t.emoji, label: t.label, left: t.left, right: t.right })),
    }),
    spiceStep,
    choiceStep({
      id: 'texture',
      title: '가장 끌리는 식감은?',
      subtitle: '한 입 베어 물었을 때 제일 행복한 느낌을 골라주세요',
      columns: 4,
      options: (Object.keys(TEXTURES) as TextureId[]).map((id) => ({
        id,
        emoji: TEXTURES[id].emoji,
        label: TEXTURES[id].label,
        desc: TEXTURES[id].desc,
      })),
    }),
    choiceStep({
      id: 'adventure',
      title: '처음 보는 음식 앞에서 나는?',
      columns: 2,
      options: (Object.keys(ADVENTURE) as AdventureId[]).map((id) => ({
        id,
        emoji: ADVENTURE[id].emoji,
        label: ADVENTURE[id].label,
        desc: ADVENTURE[id].desc,
      })),
    }),
  ],
  computeResult: (answers) => analyze(answers).base,
  Result,
  print: (answers) => {
    const r = analyze(answers);
    return {
      kind: 'receipt',
      eyebrow: 'AI 미각 DNA 분석 결과',
      title: r.name,
      sections: [
        // 영수증 폭에 맞춰 코드를 두 줄로 나눈다
        { type: 'big', title: 'DNA CODE', text: `${r.codeParts.slice(0, 2).join('·')}\n${r.codeParts.slice(2).join('·')}` },
        { type: 'bars', title: '8가지 미각 축', bars: r.axes.map((a) => ({ label: a.label, value: a.value })) },
        {
          type: 'rows',
          title: '미각 프로필',
          rows: [
            { label: '매운맛', value: `${r.spice}단계 · ${SPICE_LEVELS[r.spice]?.label ?? '보통맛'}` },
            { label: '최애 식감', value: r.texture.label },
            { label: '모험 지수', value: `${r.adventure.value}%` },
            { label: '희귀도', value: `상위 ${r.rarity}%` },
          ],
        },
        { type: 'text', title: '유형 해설', text: r.data.desc },
        {
          type: 'list',
          title: '맞춤 추천',
          items: [
            `음식 · ${r.foods[0]!.name}`,
            `음식 · ${r.texture.pick.name}`,
            `음료 · ${r.drinks[0]!.name}`,
            `음료 · ${r.adventure.drink.name}`,
            `도전 · ${r.adventure.pick.name}`,
          ],
        },
      ],
      footer: r.hashtags.join(' '),
    };
  },
});
