'use client';

import { motion } from 'motion/react';
import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  Panel,
  RadarChart,
  ResultShell,
  answersSeed,
  choiceStep,
  clamp,
  defineDemo,
  getChoice,
  getFields,
  seededInt,
  sliderStep,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type Habit = 'espresso' | 'americano' | 'latte' | 'drip' | 'coldbrew' | 'sweet';
type Aroma = 'fruit' | 'floral' | 'chocolate' | 'nutty';
type Taste = { acid: number; bitter: number; nutty: number; sweet: number; body: number };

interface Bean {
  name: string;
  flag: string;
  region: string;
  process: string;
  altitude: string;
  profile: Taste;
  aroma: Aroma;
  notes: string[];
  /** 0(라이트) ~ 7(이탈리안) */
  roast: number;
  story: string;
}

const BEANS: Record<string, Bean> = {
  yirgacheffe: {
    name: '에티오피아 예가체프',
    flag: '🇪🇹',
    region: '에티오피아 · 게데오',
    process: '워시드',
    altitude: '1,800–2,200m',
    profile: { acid: 85, bitter: 20, nutty: 20, sweet: 60, body: 30 },
    aroma: 'floral',
    notes: ['자스민', '레몬', '홍차'],
    roast: 1,
    story: '커피의 고향 에티오피아의 고지대에서 자라, 꽃향기와 레몬 같은 산뜻한 산미가 돋보여요.',
  },
  kenya: {
    name: '케냐 AA',
    flag: '🇰🇪',
    region: '케냐 · 니에리',
    process: '워시드',
    altitude: '1,500–2,100m',
    profile: { acid: 90, bitter: 30, nutty: 15, sweet: 55, body: 55 },
    aroma: 'fruit',
    notes: ['블랙커런트', '자몽', '와인'],
    roast: 2,
    story: '큰 생두 등급(AA)의 케냐 원두로, 베리류의 선명한 산미와 주스 같은 질감이 매력이에요.',
  },
  geisha: {
    name: '파나마 게이샤',
    flag: '🇵🇦',
    region: '파나마 · 보케테',
    process: '워시드',
    altitude: '1,600–1,800m',
    profile: { acid: 75, bitter: 10, nutty: 10, sweet: 75, body: 25 },
    aroma: 'floral',
    notes: ['베르가못', '자스민', '복숭아'],
    roast: 0,
    story: '홍차처럼 섬세한 질감과 화려한 꽃향으로 스페셜티 대회에서 사랑받는 품종이에요.',
  },
  colombia: {
    name: '콜롬비아 수프리모',
    flag: '🇨🇴',
    region: '콜롬비아 · 우일라',
    process: '워시드',
    altitude: '1,500–1,900m',
    profile: { acid: 55, bitter: 45, nutty: 55, sweet: 60, body: 55 },
    aroma: 'chocolate',
    notes: ['캐러멜', '밀크초콜릿', '사과'],
    roast: 3,
    story: '산미·단맛·바디가 고르게 균형 잡힌, 누구에게나 편안한 클래식 원두예요.',
  },
  costarica: {
    name: '코스타리카 따라주',
    flag: '🇨🇷',
    region: '코스타리카 · 따라주',
    process: '허니',
    altitude: '1,200–1,900m',
    profile: { acid: 60, bitter: 30, nutty: 40, sweet: 80, body: 45 },
    aroma: 'fruit',
    notes: ['꿀', '살구', '흑설탕'],
    roast: 3,
    story: '과육을 일부 남긴 채 말리는 허니 가공 덕분에 꿀 같은 단맛이 은은하게 올라와요.',
  },
  brazil: {
    name: '브라질 산토스',
    flag: '🇧🇷',
    region: '브라질 · 미나스제라이스',
    process: '내추럴',
    altitude: '800–1,300m',
    profile: { acid: 25, bitter: 50, nutty: 85, sweet: 55, body: 60 },
    aroma: 'nutty',
    notes: ['땅콩', '헤이즐넛', '코코아'],
    roast: 4,
    story: '산미가 적고 고소한 견과 향이 풍부해서 블렌딩의 베이스로 가장 많이 쓰여요.',
  },
  guatemala: {
    name: '과테말라 안티구아',
    flag: '🇬🇹',
    region: '과테말라 · 안티구아',
    process: '워시드',
    altitude: '1,500–1,700m',
    profile: { acid: 45, bitter: 65, nutty: 50, sweet: 45, body: 75 },
    aroma: 'chocolate',
    notes: ['다크초콜릿', '스모키', '오렌지 필'],
    roast: 5,
    story: '화산 토양에서 자라 스모키한 향과 묵직한 초콜릿 풍미가 특징이에요.',
  },
  mandheling: {
    name: '인도네시아 만델링',
    flag: '🇮🇩',
    region: '인도네시아 · 수마트라',
    process: '습식 탈곡',
    altitude: '1,100–1,500m',
    profile: { acid: 15, bitter: 80, nutty: 45, sweet: 35, body: 95 },
    aroma: 'chocolate',
    notes: ['허브', '흙내음', '다크초콜릿'],
    roast: 6,
    story: '낮은 산미와 진하고 묵직한 바디감으로 강배전 커피 애호가들이 즐겨 찾는 원두예요.',
  },
};

const ROASTS = [
  { name: '라이트', color: '#c8a27a' },
  { name: '시나몬', color: '#b07d4f' },
  { name: '미디엄', color: '#95633a' },
  { name: '하이', color: '#7a4b2a' },
  { name: '시티', color: '#5f3920' },
  { name: '풀시티', color: '#482a17' },
  { name: '프렌치', color: '#331d10' },
  { name: '이탈리안', color: '#20120a' },
];

const PERSONAS: Record<keyof Taste, { name: string; emoji: string; desc: string }> = {
  acid: { name: '산미 탐험가', emoji: '🍋', desc: '밝고 화사한 과일 향을 좇는 타입' },
  bitter: { name: '다크 로스트 마니아', emoji: '🌑', desc: '진하고 쌉쌀한 한 잔에서 에너지를 얻는 타입' },
  nutty: { name: '고소함 수집가', emoji: '🥜', desc: '편안하고 구수한 풍미를 사랑하는 타입' },
  sweet: { name: '달콤함 러버', emoji: '🍯', desc: '부드러운 단맛과 여운을 즐기는 타입' },
  body: { name: '묵직한 바디 애호가', emoji: '🪨', desc: '입안을 꽉 채우는 질감을 좋아하는 타입' },
};

const BALANCED = { name: '밸런스 올라운더', emoji: '⚖️', desc: '어느 한쪽에 치우치지 않은 균형 잡힌 맛을 좋아하는 타입' };

type BrewId = 'pourover' | 'frenchpress' | 'espresso' | 'latte' | 'coldbrew';

interface Recipe {
  name: string;
  tool: string;
  emoji: string;
  beans: number;
  water: number;
  waterLabel: string;
  temp: string;
  time: string;
  grind: string;
  steps: string[];
}

function recipeFor(brew: BrewId, roast: number): Recipe {
  // 밝게 볶을수록 높은 온도, 진하게 볶을수록 낮은 온도로 추출한다
  const hot = roast <= 2 ? 93 : roast <= 4 ? 91 : 88;
  switch (brew) {
    case 'pourover':
      return {
        name: '핸드드립',
        tool: '원뿔형 드리퍼',
        emoji: '🫖',
        beans: 15,
        water: 240,
        waterLabel: '물',
        temp: `${hot}°C`,
        time: '2:30',
        grind: '중간-가늘게 (설탕 입자)',
        steps: ['30ml로 30초간 뜸 들이기', '가운데부터 원을 그리며 3번 나눠 붓기', '2분 30초 안에 추출 마무리'],
      };
    case 'frenchpress':
      return {
        name: '프렌치프레스',
        tool: '침출식 프레스',
        emoji: '🫙',
        beans: 16,
        water: 250,
        waterLabel: '물',
        temp: `${hot + 1}°C`,
        time: '4:00',
        grind: '굵게 (굵은 소금)',
        steps: ['원두에 물을 한 번에 붓고 가볍게 젓기', '뚜껑을 덮고 4분 기다리기', '필터를 천천히 눌러 따르기'],
      };
    case 'espresso':
      return {
        name: '에스프레소',
        tool: '에스프레소 머신',
        emoji: '☕',
        beans: 18,
        water: 36,
        waterLabel: '추출량',
        temp: `${hot}°C`,
        time: '0:28',
        grind: '아주 가늘게 (밀가루)',
        steps: ['포터필터에 18g을 고르게 담고 탬핑', '25~30초 동안 36ml 추출', '크레마가 살아 있을 때 바로 마시기'],
      };
    case 'latte':
      return {
        name: '카페 라떼',
        tool: '에스프레소 + 스팀 밀크',
        emoji: '🥛',
        beans: 18,
        water: 36,
        waterLabel: '에스프레소',
        temp: '우유 60°C',
        time: '0:28',
        grind: '아주 가늘게 (밀가루)',
        steps: ['에스프레소 36ml 추출', '우유 180ml를 60°C로 스티밍', '잔을 기울여 우유를 부으며 마무리'],
      };
    case 'coldbrew':
      return {
        name: '콜드브루',
        tool: '침출식 콜드브루',
        emoji: '🧊',
        beans: 60,
        water: 600,
        waterLabel: '찬물',
        temp: '실온 20°C',
        time: '12시간',
        grind: '굵게 (굵은 소금)',
        steps: ['굵게 간 원두를 찬물에 담그기', '실온에서 12시간 우려내기', '걸러서 냉장 보관 후 얼음과 함께'],
      };
  }
}

/** 원두:물 비율 (콜드브루는 원액 기준 1:10) */
function brewRatio(recipe: Recipe): string {
  return recipe.name === '콜드브루' ? '1:10' : `1:${(recipe.water / recipe.beans).toFixed(recipe.water % recipe.beans ? 1 : 0)}`;
}

/* ── Matching ─────────────────────────────────────────── */

function match(answers: DemoAnswers) {
  const t = getFields<number>(answers, 'taste');
  const user: Taste = {
    acid: t.acid ?? 50,
    bitter: t.bitter ?? 50,
    nutty: t.nutty ?? 50,
    sweet: t.sweet ?? 50,
    body: t.body ?? 50,
  };
  const habit = (getChoice(answers, 'habit') as Habit | undefined) ?? 'americano';
  const aroma = (getChoice(answers, 'aroma') as Aroma | undefined) ?? 'chocolate';

  let bestKey = 'colombia';
  let best = Infinity;
  for (const [key, bean] of Object.entries(BEANS)) {
    const p = bean.profile;
    let d = Math.hypot(p.acid - user.acid, p.bitter - user.bitter, p.nutty - user.nutty, p.sweet - user.sweet, p.body - user.body);
    if (bean.aroma === aroma) d -= 28;
    if ((habit === 'espresso' || habit === 'latte' || habit === 'sweet') && bean.roast <= 1) d += 18;
    if (habit === 'drip' && bean.roast <= 2) d -= 10;
    if (habit === 'coldbrew' && p.acid <= 45) d -= 10;
    if (d < best) {
      best = d;
      bestKey = key;
    }
  }
  const bean = BEANS[bestKey]!;
  const roastShift = habit === 'espresso' || habit === 'latte' || habit === 'sweet' ? 1 : habit === 'drip' ? -1 : 0;
  const roast = clamp(bean.roast + roastShift, 0, 7);

  let brew: BrewId;
  if (habit === 'coldbrew') brew = 'coldbrew';
  else if (habit === 'latte' || habit === 'sweet') brew = 'latte';
  else if (habit === 'espresso') brew = 'espresso';
  else if (habit === 'drip') brew = 'pourover';
  else brew = user.body >= 60 || roast >= 5 ? 'frenchpress' : 'pourover';

  const keys = Object.keys(user) as (keyof Taste)[];
  const top = keys.reduce((a, b) => (user[b] > user[a] ? b : a), 'acid');
  const spread = Math.max(...keys.map((k) => user[k])) - Math.min(...keys.map((k) => user[k]));
  const matchRate = Math.round(clamp(100 - best / 2.6, 72, 98));
  return { key: bestKey, bean, roast, brew, user, persona: spread < 15 ? BALANCED : PERSONAS[top], matchRate, habit };
}

/* ── Parts ─────────────────────────────────────────────── */

function RoastScale({ roast }: { roast: number }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-1">
        {ROASTS.map((r, i) => {
          const active = i === roast;
          return (
            <div key={r.name} className="flex flex-1 flex-col items-center gap-1">
              <motion.svg
                viewBox="0 0 24 32"
                className="w-full max-w-[28px]"
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: active ? -6 : 0, opacity: 1, scale: active ? 1.25 : 1 }}
                transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 200, damping: 14 }}
                aria-hidden="true"
              >
                <ellipse cx="12" cy="16" rx="10" ry="14" fill={r.color} stroke={active ? '#fde68a' : 'rgba(0,0,0,0.3)'} strokeWidth={active ? 2 : 1} />
                <path d="M12 3 C7 10 17 20 12 29" stroke="rgba(0,0,0,0.45)" strokeWidth="1.6" fill="none" />
              </motion.svg>
              <span className={active ? 'text-[9px] font-bold text-amber-200' : 'text-[9px] text-stone-500'}>{r.name}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${ROASTS.map((r) => r.color).join(', ')})` }} />
    </div>
  );
}

function BrewCup({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0" aria-hidden="true">
      <defs>
        <clipPath id="barista-cup">
          <path d="M12 22 L52 22 L48 54 Q47 58 43 58 L21 58 Q17 58 16 54 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#barista-cup)">
        <motion.rect x="10" width="44" height="40" fill={color} initial={{ y: 58 }} animate={{ y: 27 }} transition={{ duration: 2.2, ease: 'easeOut', delay: 0.4 }} />
      </g>
      <path d="M12 22 L52 22 L48 54 Q47 58 43 58 L21 58 Q17 58 16 54 Z" fill="none" stroke="#e7e5e4" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M51 28 Q60 29 58 38 Q56 45 48 44" fill="none" stroke="#e7e5e4" strokeWidth="2.5" />
      {[24, 32, 40].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 16 Q${x - 3} 11 ${x} 6`}
          stroke="#e7e5e4"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: [0, 0.8, 0], y: [2, -3, -6] }}
          transition={{ duration: 2, repeat: Infinity, delay: 2.4 + i * 0.4 }}
        />
      ))}
    </svg>
  );
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const { bean, roast, brew, user, persona, matchRate } = match(answers);
  const recipe = recipeFor(brew, roast);
  const serial = String(seededInt(answersSeed(answers), 'card', 1, 9999)).padStart(4, '0');
  const ratio = brewRatio(recipe);

  return (
    <ResultShell
      eyebrow="AI 바리스타의 추천"
      title={bean.name}
      description={`${persona.emoji} ${persona.name} · 취향 일치도 ${matchRate}%. ${bean.story}`}
      pillarColor={pillarColor}
      onRestart={onRestart}
      restartLabel="다시 테스트하기"
    >
      {/* 커피 프로필 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-900/50 bg-gradient-to-br from-[#2a1b12] via-[#1f140e] to-[#140d09] p-5 text-left shadow-2xl shadow-black/50"
      >
        {/* 커피 자국 */}
        <svg className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 opacity-20" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#a16207" strokeWidth="5" strokeDasharray="160 12 40 8" />
          <circle cx="50" cy="50" r="33" fill="none" stroke="#a16207" strokeWidth="1.5" opacity="0.6" />
        </svg>

        <div className="relative flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-amber-200/60">COFFEE PROFILE · No.{serial}</p>
            <p className="mt-1 text-lg font-bold text-amber-50">
              {persona.emoji} {persona.name}
            </p>
            <p className="text-xs text-amber-100/60">{persona.desc}</p>
          </div>
          <div className="rounded-2xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-center">
            <p className="font-display text-2xl font-extrabold text-amber-200">{matchRate}%</p>
            <p className="text-[9px] text-amber-100/60">취향 일치</p>
          </div>
        </div>

        <div className="relative mt-4 rounded-2xl border border-amber-200/10 bg-black/20 p-4">
          <p className="text-xs text-amber-100/60">추천 원두</p>
          <p className="mt-0.5 text-base font-bold text-amber-50">
            {bean.flag} {bean.name}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            {[bean.region, `${bean.process} 가공`, `해발 ${bean.altitude}`].map((c) => (
              <span key={c} className="rounded-full bg-amber-100/10 px-2 py-0.5 text-amber-100/80">
                {c}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-amber-100/50">테이스팅 노트</span>
            {bean.notes.map((n) => (
              <span key={n} className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${pillarColor}30`, color: '#bfdbfe' }}>
                {n}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-4 grid items-center gap-2 sm:grid-cols-[1fr_1fr]">
          <div className="-mx-2">
            <RadarChart
              color="#f59e0b"
              size={220}
              axes={[
                { label: '산미', value: bean.profile.acid },
                { label: '쓴맛', value: bean.profile.bitter },
                { label: '고소함', value: bean.profile.nutty },
                { label: '단맛', value: bean.profile.sweet },
                { label: '바디', value: bean.profile.body },
              ]}
            />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] text-amber-100/50">내 취향 vs 추천 원두</p>
            {(
              [
                ['산미', 'acid'],
                ['쓴맛', 'bitter'],
                ['고소함', 'nutty'],
                ['단맛', 'sweet'],
                ['바디', 'body'],
              ] as const
            ).map(([label, k], i) => (
              <div key={k} className="grid grid-cols-[2.6rem_1fr] items-center gap-2 text-[11px]">
                <span className="text-amber-100/70">{label}</span>
                <div className="relative h-2 rounded-full bg-amber-100/10">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-amber-500/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${bean.profile[k]}%` }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                  />
                  <motion.span
                    className="absolute top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300"
                    initial={{ left: '0%' }}
                    animate={{ left: `${user[k]}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                  />
                </div>
              </div>
            ))}
            <p className="flex items-center gap-3 pt-1 text-[10px] text-amber-100/50">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-3 rounded-full bg-amber-500/70" />
                원두
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-1 rounded-full bg-sky-300" />
                내 취향
              </span>
            </p>
          </div>
        </div>

        <div className="relative mt-4 border-t border-amber-200/10 pt-4">
          <p className="mb-3 flex items-center justify-between text-xs">
            <span className="text-amber-100/60">추천 로스팅</span>
            <span className="font-bold text-amber-200">{ROASTS[roast]!.name} 로스트</span>
          </p>
          <RoastScale roast={roast} />
        </div>
      </motion.div>

      {/* 레시피 카드 */}
      <Panel title={`추천 추출 레시피 · ${recipe.name}`}>
        <div className="flex items-center gap-3">
          <BrewCup color={ROASTS[Math.min(7, roast + 1)]!.color} />
          <div>
            <p className="text-sm font-bold text-white">
              {recipe.emoji} {recipe.name} <span className="font-normal text-slate-400">· {recipe.tool}</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              분쇄도 {recipe.grind} · 비율 {ratio}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { label: '원두', value: `${recipe.beans}`, unit: 'g' },
            { label: recipe.waterLabel, value: `${recipe.water}`, unit: 'ml' },
            { label: '온도', value: recipe.temp.replace(/[^0-9]/g, ''), unit: recipe.temp.includes('우유') ? '°C 우유' : recipe.temp.includes('실온') ? '°C 실온' : '°C' },
            { label: '시간', value: recipe.time, unit: '' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-slate-800 bg-slate-950/50 px-1 py-2.5">
              <p className="text-[10px] text-slate-500">{m.label}</p>
              <p className="font-display text-lg font-bold leading-tight" style={{ color: pillarColor }}>
                {m.value}
              </p>
              <p className="text-[10px] text-slate-400">{m.unit}</p>
            </div>
          ))}
        </div>
        <ol className="mt-4 space-y-2 border-t border-slate-800 pt-4">
          {recipe.steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm text-slate-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: pillarColor }}>
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Panel>

      <p className="max-w-md text-xs text-slate-500 [word-break:keep-all]">
        ☕ 실제 부스에서는 추천 원두로 내린 커피를 바로 시음하고, 이 프로필 카드를 출력해 가져갈 수 있어요.
      </p>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'barista-matching',
    targetSlug: 'ai-barista-matching',
    industryId: 'fnb',
    analyzeEmoji: '☕',
    analyzeDurationMs: 3200,
    analyzeMessages: ['취향 프로필 벡터화 중', '원두 데이터 100여 종 비교 중', '로스팅 포인트 계산 중', '추출 레시피 설계 중'],
  },
  steps: [
    choiceStep({
      id: 'habit',
      title: '평소 커피를 어떻게 마시나요?',
      subtitle: '가장 자주 마시는 스타일을 골라주세요',
      columns: 3,
      options: [
        { id: 'espresso', emoji: '☕', label: '에스프레소', desc: '진하고 짧게' },
        { id: 'americano', emoji: '🥤', label: '아메리카노', desc: '깔끔하게 매일' },
        { id: 'latte', emoji: '🥛', label: '라떼', desc: '우유와 부드럽게' },
        { id: 'drip', emoji: '🫖', label: '핸드드립', desc: '향을 음미하며' },
        { id: 'coldbrew', emoji: '🧊', label: '콜드브루', desc: '차갑고 부드럽게' },
        { id: 'sweet', emoji: '🍯', label: '달달한 커피', desc: '시럽·바닐라 추가' },
      ],
    }),
    sliderStep({
      id: 'taste',
      title: '좋아하는 맛의 균형을 알려주세요',
      subtitle: '슬라이더로 취향을 표시하면 AI가 원두와 비교해요',
      sliders: [
        { id: 'acid', emoji: '🍋', label: '산미', left: '부드럽게', right: '새콤하게' },
        { id: 'bitter', emoji: '🌑', label: '쓴맛', left: '연하게', right: '진하게' },
        { id: 'nutty', emoji: '🥜', label: '고소함', left: '은은하게', right: '듬뿍' },
        { id: 'sweet', emoji: '🍯', label: '단맛', left: '드라이하게', right: '달콤하게' },
        { id: 'body', emoji: '🥛', label: '바디', left: '가볍게', right: '묵직하게' },
      ],
    }),
    choiceStep({
      id: 'aroma',
      title: '가장 끌리는 향은?',
      subtitle: '원두의 테이스팅 노트와 매칭돼요',
      columns: 2,
      options: [
        { id: 'fruit', emoji: '🍓', label: '과일', desc: '베리·시트러스' },
        { id: 'floral', emoji: '🌸', label: '꽃', desc: '자스민·베르가못' },
        { id: 'chocolate', emoji: '🍫', label: '초콜릿', desc: '카카오·캐러멜' },
        { id: 'nutty', emoji: '🌰', label: '견과', desc: '아몬드·헤이즐넛' },
      ],
    }),
  ],
  computeResult: (answers) => match(answers).key,
  Result,
  print: (answers) => {
    const { bean, roast, brew, persona, matchRate } = match(answers);
    const recipe = recipeFor(brew, roast);
    return {
      kind: 'receipt',
      eyebrow: 'AI 바리스타의 추천',
      title: bean.name,
      sections: [
        { type: 'big', title: '취향 일치도', text: `${matchRate}% MATCH` },
        {
          type: 'rows',
          title: '커피 프로필',
          rows: [
            { label: '취향 타입', value: persona.name },
            { label: '산지', value: bean.region },
            { label: '가공', value: bean.process },
            { label: '재배 고도', value: bean.altitude },
            { label: '로스팅', value: `${ROASTS[roast]!.name} 로스트` },
            { label: '노트', value: bean.notes.join(' · ') },
          ],
        },
        {
          type: 'bars',
          title: '맛 밸런스',
          bars: [
            { label: '산미', value: bean.profile.acid },
            { label: '쓴맛', value: bean.profile.bitter },
            { label: '고소함', value: bean.profile.nutty },
            { label: '단맛', value: bean.profile.sweet },
            { label: '바디', value: bean.profile.body },
          ],
        },
        {
          type: 'rows',
          title: `레시피 · ${recipe.name}`,
          rows: [
            { label: '원두', value: `${recipe.beans}g` },
            { label: recipe.waterLabel, value: `${recipe.water}ml` },
            { label: '비율', value: brewRatio(recipe) },
            { label: '온도', value: recipe.temp },
            { label: '시간', value: recipe.time },
            { label: '분쇄', value: recipe.grind },
          ],
        },
        { type: 'list', title: '추출 순서', items: recipe.steps },
      ],
      footer: '오늘의 한 잔이 취향에 꼭 맞기를 바라요',
    };
  },
});
