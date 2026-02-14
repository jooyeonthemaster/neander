'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { IndustryId } from '@/data/experiences';
import type { DemoModule, DemoConfig, DemoAnswers, DemoStepProps, DemoResultProps } from '@/types/demo';

/* ── Static Data ─────────────────────────────────────── */

const MOODS = [
  { id: 'relaxed', emoji: '\u{1F33F}', label: '편안한 휴식', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'adventurous', emoji: '\u26A1', label: '새로운 모험', gradient: 'from-amber-400 to-orange-500' },
  { id: 'romantic', emoji: '\u{1F339}', label: '로맨틱한 밤', gradient: 'from-rose-400 to-pink-500' },
  { id: 'celebratory', emoji: '\u{1F389}', label: '축하 파티', gradient: 'from-violet-400 to-purple-500' },
] as const;

const SPIRITS = [
  { id: 'vodka', emoji: '\u{1F378}', label: '보드카' },
  { id: 'gin', emoji: '\u{1FAD2}', label: '진' },
  { id: 'rum', emoji: '\u{1F3DD}\uFE0F', label: '럼' },
  { id: 'whiskey', emoji: '\u{1F943}', label: '위스키' },
  { id: 'tequila', emoji: '\u{1F335}', label: '데킬라' },
  { id: 'nonalcohol', emoji: '\u{1F379}', label: '논알콜' },
] as const;

type CD = { name: string; gradient: string; ingredients: string[]; garnish: string; desc: string };

const C: Record<string, CD> = {
  'zen-garden': { name: '젠 가든', gradient: 'from-emerald-300 to-teal-500', ingredients: ['보드카 45ml', '큐컴버 시럽 20ml', '라임 주스 15ml', '토닉워터'], garnish: '오이 슬라이스 & 민트', desc: '차분하고 깨끗한 맛이 마음의 평화를 선물합니다' },
  'sunset-drift': { name: '선셋 드리프트', gradient: 'from-amber-300 to-orange-500', ingredients: ['다크 럼 45ml', '파인애플 주스 30ml', '코코넛 크림 15ml', '그레나딘'], garnish: '파인애플 웨지 & 체리', desc: '따뜻한 석양처럼 부드럽게 번지는 열대의 여유' },
  'tropical-storm': { name: '트로피컬 스톰', gradient: 'from-yellow-300 to-red-500', ingredients: ['테킬라 45ml', '망고 퓨레 30ml', '할라피뇨 시럽 10ml', '라임'], garnish: '라임 휠 & 칠리 플레이크', desc: '달콤함과 매콤함이 폭풍처럼 몰아치는 강렬한 한 잔' },
  'northern-lights': { name: '노던 라이츠', gradient: 'from-cyan-300 to-blue-600', ingredients: ['진 45ml', '블루 큐라소 20ml', '토닉워터', '레몬 주스 10ml'], garnish: '레몬 필 & 로즈마리', desc: '오로라처럼 신비로운 빛깔의 탐험적인 맛' },
  'rose-petal': { name: '로즈 페탈', gradient: 'from-rose-200 to-pink-500', ingredients: ['리치 리큐어 30ml', '장미 시럽 15ml', '스파클링 와인', '레몬 주스 10ml'], garnish: '식용 장미꽃잎', desc: '장미향이 은은하게 퍼지는 로맨틱한 순간을 위한 칵테일' },
  'golden-hour': { name: '골든 아워', gradient: 'from-amber-200 to-yellow-500', ingredients: ['샴페인 90ml', '엘더플라워 리큐어 15ml', '금박', '레몬 주스 5ml'], garnish: '금박 & 레몬 트위스트', desc: '축하의 순간을 황금빛으로 물들이는 럭셔리한 한 잔' },
  'aurora-mocktail': { name: '오로라 목테일', gradient: 'from-teal-200 to-purple-400', ingredients: ['패션프루트 퓨레 40ml', '바질 시럽 15ml', '토닉워터', '라임 주스 15ml'], garnish: '바질 잎 & 패션프루트', desc: '알콜 없이도 환상적인 맛의 여행을 떠나보세요' },
  'classic-blend': { name: '클래식 블렌드', gradient: 'from-amber-300 to-yellow-900', ingredients: ['버번 45ml', '심플 시럽 15ml', '앙고스투라 비터스', '오렌지 필'], garnish: '오렌지 필 & 체리', desc: '시간이 검증한 클래식의 깊은 풍미' },
};

/* ── Shared: Slider thumb classes ────────────────────── */

const THUMB = [
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7',
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
  '[&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-teal-500',
  '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-teal-500/30',
  '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
  '[&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-teal-500',
  '[&::-moz-range-thumb]:shadow-lg',
].join(' ');

const GRADIENT_BAR = 'linear-gradient(to right, rgba(20,184,166,0.3), rgba(20,184,166,0.6), rgba(20,184,166,1))';

/* ── Step 1: Mood ────────────────────────────────────── */

function MoodStep({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['mood'] as string | undefined;
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">오늘의 기분은?</h2>
        <p className="mt-2 text-sm text-slate-400">칵테일에 담고 싶은 무드를 골라주세요</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {MOODS.map((mood) => {
          const isSel = selected === mood.id;
          return (
            <motion.button
              key={mood.id}
              type="button"
              onClick={() => onUpdate('mood', mood.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              animate={isSel ? { scale: 1.05 } : { scale: 1, opacity: selected && !isSel ? 0.5 : 1 }}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-2xl p-8 text-center transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                `bg-gradient-to-br ${mood.gradient}`,
                isSel ? 'shadow-2xl ring-2 ring-white/50' : 'shadow-lg',
              )}
              aria-pressed={isSel}
            >
              <span className="text-5xl mb-3">{mood.emoji}</span>
              <span className="text-base font-semibold text-white drop-shadow-sm">{mood.label}</span>
              {isSel && (
                <motion.div
                  layoutId="mood-check-cocktail"
                  className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-teal-600 shadow"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 2: Flavor Profile ──────────────────────────── */

interface FlavorValues { sweetness: number; strength: number }

function FlavorSlider({ label, labelMin, labelMax, value, onChange }: {
  label: string; labelMin: string; labelMax: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-300 text-center">{label}</p>
      <div className="relative">
        <div className="h-3 w-full rounded-full" style={{ background: GRADIENT_BAR }} />
        <input
          type="range" min={1} max={10} step={1} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn('absolute inset-0 w-full h-3 appearance-none bg-transparent cursor-pointer', THUMB)}
          aria-label={label} aria-valuemin={1} aria-valuemax={10} aria-valuenow={value}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400 font-medium">{labelMin}</span>
        <motion.span key={value} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="font-display text-2xl font-bold text-teal-400 tabular-nums">{value}</motion.span>
        <span className="text-slate-400 font-medium">{labelMax}</span>
      </div>
      <div className="flex justify-center gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div key={i} className="rounded-full" transition={{ duration: 0.2, delay: i * 0.02 }}
            animate={{ height: i < value ? 20 + i * 3 : 8, width: 6, backgroundColor: i < value ? 'rgb(20,184,166)' : 'rgb(51,65,85)' }} />
        ))}
      </div>
    </div>
  );
}

function FlavorStep({ answers, onUpdate }: DemoStepProps) {
  const f = (answers['flavor'] as FlavorValues) ?? { sweetness: 5, strength: 5 };
  const set = (k: keyof FlavorValues, v: number) => onUpdate('flavor', { ...f, [k]: v });
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">맛 프로필을 조절해 보세요</h2>
        <p className="mt-2 text-sm text-slate-400">슬라이더를 움직여 원하는 맛을 설정하세요</p>
      </div>
      <div className="space-y-10 py-4">
        <FlavorSlider label="당도" labelMin="드라이" labelMax="스위트" value={f.sweetness} onChange={(v) => set('sweetness', v)} />
        <FlavorSlider label="도수" labelMin="라이트" labelMax="스트롱" value={f.strength} onChange={(v) => set('strength', v)} />
      </div>
    </div>
  );
}

/* ── Step 3: Spirit ──────────────────────────────────── */

function SpiritStep({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['spirit'] as string | undefined;
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">베이스를 선택해 주세요</h2>
        <p className="mt-2 text-sm text-slate-400">칵테일의 기본이 될 술을 골라주세요</p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {SPIRITS.map((s) => {
          const isSel = selected === s.id;
          return (
            <motion.button
              key={s.id} type="button" onClick={() => onUpdate('spirit', s.id)}
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                isSel ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50',
              )}
              aria-pressed={isSel}
            >
              <span className="text-3xl">{s.emoji}</span>
              <span className={cn('text-sm font-medium', isSel ? 'text-teal-300' : 'text-slate-300')}>{s.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Result Component ────────────────────────────────── */

function CocktailResult({ resultKey, onRestart, pillarColor }: DemoResultProps) {
  const d = C[resultKey] ?? C['classic-blend']!;
  return (
    <div className="space-y-8 text-center">
      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium tracking-widest text-teal-400 uppercase">당신을 위한 칵테일</motion.p>

      <motion.h2 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
        className="font-display text-3xl font-bold text-white sm:text-4xl">{d.name}</motion.h2>

      {/* Glass visual */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center py-4">
        <div className="relative">
          <div
            className={cn('h-48 w-20 rounded-b-3xl bg-gradient-to-b shadow-lg', d.gradient)}
            style={{ clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)', boxShadow: `0 0 40px ${pillarColor}33, 0 0 80px ${pillarColor}1a` }}
          />
          <div className="absolute -top-1 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/20" aria-hidden="true" />
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
        className="mx-auto max-w-sm text-sm leading-relaxed text-slate-400">{d.desc}</motion.p>

      {/* Ingredients */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">재료</p>
        <div className="flex flex-wrap justify-center gap-2">
          {d.ingredients.map((ing) => (
            <span key={ing} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">{ing}</span>
          ))}
        </div>
      </motion.div>

      {/* Garnish */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">가니쉬</p>
        <p className="text-sm text-slate-300">{d.garnish}</p>
      </motion.div>

      {/* Restart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="flex justify-center pt-4">
        <button type="button" onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
          다시 만들기
        </button>
      </motion.div>
    </div>
  );
}

/* ── computeResult ───────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  const mood = answers['mood'] as string | undefined;
  const spirit = answers['spirit'] as string | undefined;
  if (spirit === 'nonalcohol') return 'aurora-mocktail';
  if (mood === 'romantic') return 'rose-petal';
  if (mood === 'celebratory') return 'golden-hour';
  if (mood === 'relaxed') return spirit === 'vodka' || spirit === 'gin' ? 'zen-garden' : 'sunset-drift';
  if (mood === 'adventurous') return spirit === 'tequila' || spirit === 'rum' ? 'tropical-storm' : 'northern-lights';
  return 'classic-blend';
}

/* ── Config & Export ─────────────────────────────────── */

const config: DemoConfig = {
  id: 'cocktail-creator',
  targetSlug: 'ai-cocktail-creator',
  industryId: 'fnb' as IndustryId,
  analyzeEmoji: '\u{1F378}',
  analyzeDurationMs: 2800,
  steps: [
    { id: 'mood', titleKey: '오늘의 기분은?', subtitleKey: '칵테일에 담고 싶은 무드를 골라주세요', canProceed: (a) => typeof a['mood'] === 'string' },
    { id: 'flavor', titleKey: '맛 프로필을 조절해 보세요', subtitleKey: '슬라이더를 움직여 원하는 맛을 설정하세요', canProceed: () => true },
    { id: 'spirit', titleKey: '베이스를 선택해 주세요', subtitleKey: '칵테일의 기본이 될 술을 골라주세요', canProceed: (a) => typeof a['spirit'] === 'string' },
  ],
};

const cocktailCreatorDemo: DemoModule = {
  config,
  StepComponents: [MoodStep, FlavorStep, SpiritStep],
  ResultComponent: CocktailResult,
  computeResult,
};

export default cocktailCreatorDemo;
