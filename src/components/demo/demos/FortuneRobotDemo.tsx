'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { IndustryId } from '@/data/experiences';
import type {
  DemoAnswers,
  DemoConfig,
  DemoModule,
  DemoStepProps,
  DemoResultProps,
} from '@/types/demo';

/* ── Data ──────────────────────────────────────────────── */

const MONTHS = [
  { month: 1, emoji: '\u2651' }, { month: 2, emoji: '\u2652' },
  { month: 3, emoji: '\u2653' }, { month: 4, emoji: '\u2648' },
  { month: 5, emoji: '\u2649' }, { month: 6, emoji: '\u264A' },
  { month: 7, emoji: '\u264B' }, { month: 8, emoji: '\u264C' },
  { month: 9, emoji: '\u264D' }, { month: 10, emoji: '\u264E' },
  { month: 11, emoji: '\u264F' }, { month: 12, emoji: '\u2650' },
] as const;

const ELEMENTS = [
  { id: 'fire', label: '\uBD88 \uD83D\uDD25', gradient: 'from-red-500 to-orange-600' },
  { id: 'water', label: '\uBB3C \uD83D\uDCA7', gradient: 'from-blue-400 to-cyan-600' },
  { id: 'earth', label: '\uD751 \uD83C\uDF0D', gradient: 'from-amber-600 to-yellow-800' },
  { id: 'air', label: '\uBC14\uB78C \uD83C\uDF2C\uFE0F', gradient: 'from-sky-300 to-blue-400' },
  { id: 'metal', label: '\uAE08\uC18D \u2699\uFE0F', gradient: 'from-slate-400 to-zinc-600' },
] as const;

const CATEGORIES = [
  { id: 'love', label: '\uC5F0\uC560 \uD83D\uDC95' },
  { id: 'career', label: '\uC9C1\uC5C5 \uD83D\uDCBC' },
  { id: 'health', label: '\uAC74\uAC15 \uD83D\uDCAA' },
  { id: 'wealth', label: '\uC7AC\uBB3C \uD83D\uDCB0' },
  { id: 'creativity', label: '\uCC3D\uC758 \u2728' },
] as const;

type ResultKey = 'phoenix-fire' | 'ocean-wisdom' | 'earth-guardian' | 'wind-dancer' | 'golden-path' | 'rising-star';
type CategoryId = 'love' | 'career' | 'health' | 'wealth' | 'creativity';

const RESULTS: Record<ResultKey, {
  name: string; luckyColor: string; direction: string;
  message: string; advice: Record<CategoryId, string>;
}> = {
  'phoenix-fire': {
    name: '\uD53C\uB2C9\uC2A4 \uD30C\uC774\uC5B4', luckyColor: '\uC8FC\uD64D\uC0C9', direction: '\uB0A8\uCABD',
    message: '\uB2F9\uC2E0 \uC548\uC758 \uBD88\uAF43\uC774 \uC0C8\uB85C\uC6B4 \uC2DC\uC791\uC744 \uC54C\uB9BD\uB2C8\uB2E4.\n\uC5F4\uC815\uC744 \uB530\uB77C\uAC00\uBA74 \uBCCB\uBC16\uC758 \uD589\uC6B4\uC774 \uCC3E\uC544\uC62C \uAC70\uC608\uC694.',
    advice: { love: '\uC6A9\uAE30 \uC788\uB294 \uACE0\uBC31\uC774 \uBE5B\uC744 \uBC1C\uD569\uB2C8\uB2E4', career: '\uB3C4\uC804\uC801\uC778 \uD504\uB85C\uC81D\uD2B8\uC5D0\uC11C \uBE5B\uB0A0 \uB54C', health: '\uD65C\uBC1C\uD55C \uC6B4\uB3D9\uC774 \uC5D0\uB108\uC9C0\uB97C \uB192\uC5EC\uC90D\uB2C8\uB2E4', wealth: '\uACFC\uAC10\uD55C \uD22C\uC790\uAC00 \uC5F4\uB9E4\uB97C \uB9FA\uC744 \uC2DC\uAE30', creativity: '\uC601\uAC10\uC774 \uD3ED\uBC1C\uD558\uB294 \uC2DC\uAC04\uC774 \uB2E4\uAC00\uC635\uB2C8\uB2E4' },
  },
  'ocean-wisdom': {
    name: '\uC624\uC158 \uC704\uC988\uB364', luckyColor: '\uCF54\uBC1C\uD2B8 \uBE14\uB8E8', direction: '\uB3D9\uCABD',
    message: '\uAE4A\uC740 \uBC14\uB2E4\uCC98\uB7FC \uACE0\uC694\uD55C \uC9C0\uD61C\uAC00 \uAE38\uC744 \uBC1D\uD600\uC90D\uB2C8\uB2E4.\n\uD750\uB984\uC5D0 \uBAB8\uC744 \uB9E1\uAE30\uBA74 \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uB2F5\uC744 \uCC3E\uAC8C \uB420 \uAC70\uC608\uC694.',
    advice: { love: '\uC9C4\uC194\uD55C \uB300\uD654\uAC00 \uAD00\uACC4\uB97C \uAE4A\uAC8C \uD569\uB2C8\uB2E4', career: '\uAFB8\uC900\uD55C \uB178\uB825\uC774 \uC778\uC815\uBC1B\uB294 \uC2DC\uAE30', health: '\uC218\uBD84 \uBCF4\uCDA9\uACFC \uCDA9\uBD84\uD55C \uD734\uC2DD\uC774 \uD544\uC694\uD574\uC694', wealth: '\uC548\uC815\uC801\uC778 \uC800\uCD95\uC774 \uBBF8\uB798\uB97C \uBC1D\uD600\uC90D\uB2C8\uB2E4', creativity: '\uBA85\uC0C1\uACFC \uC0B0\uCC45\uC5D0\uC11C \uC601\uAC10\uC744 \uC5BB\uC73C\uC138\uC694' },
  },
  'earth-guardian': {
    name: '\uC5B4\uC2A4 \uAC00\uB514\uC5B8', luckyColor: '\uD14C\uB77C\uCF54\uD0C0', direction: '\uC911\uC559',
    message: '\uB300\uC9C0\uC758 \uB4E0\uB4E0\uD55C \uAE30\uC6B4\uC774 \uB2F9\uC2E0\uC744 \uC9C0\uCF1C\uC90D\uB2C8\uB2E4.\n\uBFCC\uB9AC \uAE4A\uC740 \uB098\uBB34\uCC98\uB7FC \uD754\uB4E4\uB9AC\uC9C0 \uC54A\uB294 \uD55C \uD574\uAC00 \uB420 \uAC70\uC608\uC694.',
    advice: { love: '\uC2E0\uB8B0\uC640 \uC548\uC815\uC774 \uC0AC\uB791\uC758 \uAE30\uBC18', career: '\uC2E4\uB825\uC744 \uCC28\uACE1\uCC28\uACE1 \uC313\uC544\uAC08 \uC2DC\uAE30', health: '\uADDC\uCE59\uC801\uC778 \uC0DD\uD65C\uC774 \uAC74\uAC15\uC758 \uBE44\uACB0', wealth: '\uBD80\uB3D9\uC0B0\uACFC \uC2E4\uBB3C \uC790\uC0B0\uC5D0 \uC8FC\uBAA9\uD558\uC138\uC694', creativity: '\uC804\uD1B5\uC5D0\uC11C \uC0C8\uB85C\uC6B4 \uC601\uAC10\uC744 \uBC1C\uACAC\uD569\uB2C8\uB2E4' },
  },
  'wind-dancer': {
    name: '\uC708\uB4DC \uB304\uC11C', luckyColor: '\uC2A4\uCE74\uC774 \uBE14\uB8E8', direction: '\uC11C\uCABD',
    message: '\uC790\uC720\uB85C\uC6B4 \uBC14\uB78C\uC774 \uC0C8\uB85C\uC6B4 \uAE30\uD68C\uB97C \uC2E4\uC5B4\uC635\uB2C8\uB2E4.\n\uBCC0\uD654\uB97C \uB450\uB824\uC6CC\uD558\uC9C0 \uB9C8\uC138\uC694, \uB0A0\uAC1C\uB97C \uD3BC\uCE60 \uB54C\uC785\uB2C8\uB2E4.',
    advice: { love: '\uC608\uC0C1\uCE58 \uBABB\uD55C \uB9CC\uB0A8\uC774 \uC124\uB818\uC744 \uC90D\uB2C8\uB2E4', career: '\uB124\uD2B8\uC6CC\uD0B9\uACFC \uC18C\uD1B5\uC774 \uAE30\uD68C\uB97C \uC5F4\uC5B4\uC90D\uB2C8\uB2E4', health: '\uD638\uD761 \uC6B4\uB3D9\uACFC \uC57C\uC678 \uD65C\uB3D9\uC744 \uCD94\uCC9C\uD574\uC694', wealth: '\uC720\uC5F0\uD55C \uD22C\uC790 \uC804\uB7B5\uC774 \uC720\uB9AC\uD569\uB2C8\uB2E4', creativity: '\uC5EC\uD589\uACFC \uC0C8\uB85C\uC6B4 \uACBD\uD5D8\uC774 \uCC3D\uC791\uC758 \uC6D0\uCC9C' },
  },
  'golden-path': {
    name: '\uACE8\uB4E0 \uD328\uC2A4', luckyColor: '\uACE8\uB4DC', direction: '\uBD81\uCABD',
    message: '\uD669\uAE08\uBE5B \uAE38\uC774 \uB2F9\uC2E0 \uC55E\uC5D0 \uD3BC\uCCD0\uC9D1\uB2C8\uB2E4.\n\uC815\uD655\uD55C \uD310\uB2E8\uB825\uACFC \uC9D1\uC911\uB825\uC774 \uBE5B\uB098\uB294 \uC2DC\uAE30\uC608\uC694.',
    advice: { love: '\uC9C4\uC815\uC131 \uC788\uB294 \uAD00\uACC4\uC5D0 \uD22C\uC790\uD558\uC138\uC694', career: '\uC804\uBB38\uC131\uC744 \uC778\uC815\uBC1B\uB294 \uD669\uAE08\uAE30', health: '\uCCB4\uACC4\uC801\uC778 \uAC74\uAC15 \uAD00\uB9AC\uAC00 \uBE5B\uC744 \uBC1C\uD569\uB2C8\uB2E4', wealth: '\uD604\uBA85\uD55C \uC7AC\uD14C\uD06C\uB85C \uC790\uC0B0\uC774 \uB298\uC5B4\uB0A9\uB2C8\uB2E4', creativity: '\uB514\uD14C\uC77C\uC5D0\uC11C \uC644\uBCBD\uD568\uC744 \uBC1C\uACAC\uD569\uB2C8\uB2E4' },
  },
  'rising-star': {
    name: '\uB77C\uC774\uC9D5 \uC2A4\uD0C0', luckyColor: '\uBCF4\uB77C\uC0C9', direction: '\uB3D9\uBD81\uCABD',
    message: '\uBC18\uC9DD\uC774\uB294 \uBCC4\uBE5B\uC774 \uB2F9\uC2E0\uC758 \uC7A0\uC7AC\uB825\uC744 \uC77C\uAE68\uC6C1\uB2C8\uB2E4.\n\uC228\uACA8\uC9C4 \uC7AC\uB2A5\uC774 \uBE5B\uB0A0 \uC900\uBE44\uB97C \uD558\uACE0 \uC788\uC5B4\uC694.',
    advice: { love: '\uC790\uC2E0\uAC10\uC774 \uB9E4\uB825\uC744 \uB354\uD574\uC90D\uB2C8\uB2E4', career: '\uC0C8\uB85C\uC6B4 \uBD84\uC57C\uC5D0\uC11C \uB450\uAC01\uC744 \uB098\uD0C0\uB0BC \uB54C', health: '\uCDA9\uBD84\uD55C \uC218\uBA74\uC774 \uC5D0\uB108\uC9C0\uB97C \uCDA9\uC804\uD569\uB2C8\uB2E4', wealth: '\uC791\uC740 \uC2DC\uC791\uC774 \uD070 \uC131\uACFC\uB85C \uC774\uC5B4\uC9D1\uB2C8\uB2E4', creativity: '\uC790\uC720\uB85C\uC6B4 \uD45C\uD604\uC774 \uAC78\uC791\uC744 \uB9CC\uB4ED\uB2C8\uB2E4' },
  },
};

/* ── Config ─────────────────────────────────────────────── */

const config: DemoConfig = {
  id: 'fortune-robot',
  targetSlug: 'ai-fortune-robot',
  industryId: 'festival' as IndustryId,
  analyzeEmoji: '\uD83D\uDD2E',
  analyzeDurationMs: 3000,
  steps: [
    {
      id: 'month',
      titleKey: '\uD0DC\uC5B4\uB09C \uB2EC\uC744 \uC54C\uB824\uC8FC\uC138\uC694',
      subtitleKey: '\uBCC4\uC790\uB9AC\uC758 \uAE30\uC6B4\uC744 \uC77D\uC5B4\uBCFC\uAC8C\uC694',
      canProceed: (a) => typeof a['month'] === 'number',
    },
    {
      id: 'element',
      titleKey: '\uB04C\uB9AC\uB294 \uC6D0\uC18C\uB294?',
      subtitleKey: '\uC9C1\uAC10\uC73C\uB85C \uD558\uB098\uB97C \uACE8\uB77C\uC8FC\uC138\uC694',
      canProceed: (a) => typeof a['element'] === 'string' && (a['element'] as string).length > 0,
    },
    {
      id: 'category',
      titleKey: '\uC5B4\uB5A4 \uC6B4\uC138\uAC00 \uAD81\uAE08\uD558\uC138\uC694?',
      subtitleKey: '\uCE74\uB4DC\uB97C \uC120\uD0DD\uD574 \uC6B4\uBA85\uC744 \uD655\uC778\uD558\uC138\uC694',
      canProceed: (a) => typeof a['category'] === 'string' && (a['category'] as string).length > 0,
    },
  ],
};

/* ── Step 1 : Birth Month ──────────────────────────────── */

function StepMonth({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['month'] as number | undefined;
  return (
    <div className="grid grid-cols-4 gap-3">
      {MONTHS.map(({ month, emoji }) => (
        <motion.button
          key={month}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => onUpdate('month', month)}
          className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-xl border p-3 transition-colors',
            selected === month
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
          )}
        >
          <span className="text-xl">{emoji}</span>
          <span className="text-xs font-medium text-slate-300">{month}\uC6D4</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Step 2 : Element Affinity ─────────────────────────── */

function StepElement({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['element'] as string | undefined;
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 sm:justify-center sm:overflow-visible">
      {ELEMENTS.map((el) => (
        <motion.button
          key={el.id}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => onUpdate('element', el.id)}
          className={cn(
            'relative flex h-28 w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border transition-colors sm:w-28',
            selected === el.id
              ? 'border-purple-400 ring-2 ring-purple-500/40'
              : 'border-transparent',
          )}
        >
          {/* gradient background */}
          <div className={cn(
            'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-80',
            el.gradient,
          )} />
          {/* pulsing overlay */}
          <motion.div
            className={cn('absolute inset-0 rounded-2xl bg-gradient-to-br', el.gradient)}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="relative z-10 text-lg font-bold text-white drop-shadow-md">
            {el.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Step 3 : Fortune Category ─────────────────────────── */

function StepCategory({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['category'] as string | undefined;
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 sm:justify-center sm:overflow-visible">
      {CATEGORIES.map((cat) => (
        <motion.button
          key={cat.id}
          whileHover={{ rotateY: 12, scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => onUpdate('category', cat.id)}
          style={{ perspective: 600 }}
          className={cn(
            'flex h-32 w-22 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition-colors sm:w-26',
            'bg-gradient-to-b from-indigo-900 to-purple-950',
            selected === cat.id
              ? 'border-purple-400 ring-2 ring-purple-500/50'
              : 'border-purple-700/60 hover:border-purple-600',
          )}
        >
          <span className="text-2xl">{cat.label.split(' ')[1]}</span>
          <span className="text-xs font-semibold text-purple-200">{cat.label.split(' ')[0]}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Compute Result ────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  const month = answers['month'] as number;
  const element = answers['element'] as string;

  const season: string =
    month >= 3 && month <= 5 ? 'spring' :
    month >= 6 && month <= 8 ? 'summer' :
    month >= 9 && month <= 11 ? 'autumn' : 'winter';

  if (element === 'fire' && (season === 'spring' || season === 'summer')) return 'phoenix-fire';
  if (element === 'water') return 'ocean-wisdom';
  if (element === 'earth' && (season === 'autumn' || season === 'winter')) return 'earth-guardian';
  if (element === 'air') return 'wind-dancer';
  if (element === 'metal') return 'golden-path';
  if (element === 'fire') return 'phoenix-fire';
  if (element === 'earth') return 'earth-guardian';
  return 'rising-star';
}

/* ── Result Component ──────────────────────────────────── */

function ResultComponent({ resultKey, answers, onRestart, pillarColor }: DemoResultProps) {
  const data = RESULTS[resultKey as ResultKey] ?? RESULTS['rising-star'];
  const month = (answers['month'] as number) ?? 1;
  const category = (answers['category'] as CategoryId) ?? 'love';
  const luckyNumber = (month * 7) % 99 + 1;
  const advice = data.advice[category] ?? data.advice.love;

  const SEASON_DIRECTIONS: Record<string, string> = {
    spring: '\uB3D9\uCABD', summer: '\uB0A8\uCABD', autumn: '\uC11C\uCABD', winter: '\uBD81\uCABD',
  };
  const season =
    month >= 3 && month <= 5 ? 'spring' :
    month >= 6 && month <= 8 ? 'summer' :
    month >= 9 && month <= 11 ? 'autumn' : 'winter';
  const direction = SEASON_DIRECTIONS[season] ?? data.direction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative flex flex-col items-center gap-6 overflow-hidden text-center"
    >
      {/* Decorative stars */}
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-purple-400/30"
          style={{
            top: `${10 + i * 18}%`,
            left: `${5 + i * 20}%`,
            fontSize: `${10 + (i % 3) * 6}px`,
          }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
        >
          \u2726
        </motion.span>
      ))}

      {/* Archetype label */}
      <p className="text-sm font-medium tracking-widest text-purple-400/80 uppercase">
        \uB2F9\uC2E0\uC758 \uC6B4\uC138 \uC544\uD0A4\uD0C0\uC785
      </p>

      {/* Archetype name */}
      <h2
        className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl"
      >
        {data.name}
      </h2>

      {/* Fortune message */}
      <div className="max-w-sm rounded-2xl border border-purple-800/40 bg-purple-950/40 px-6 py-4">
        {data.message.split('\n').map((line, i) => (
          <p key={i} className="text-sm leading-relaxed text-purple-200/90">
            {line}
          </p>
        ))}
      </div>

      {/* Lucky items grid */}
      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {[
          { label: '\uD589\uC6B4\uC758 \uC22B\uC790', value: String(luckyNumber) },
          { label: '\uD589\uC6B4\uC758 \uC0C9', value: data.luckyColor },
          { label: '\uD589\uC6B4\uC758 \uBC29\uD5A5', value: direction },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 rounded-xl border border-purple-800/30 bg-slate-900/60 px-2 py-3"
          >
            <span className="text-[10px] text-slate-400">{item.label}</span>
            <span className="text-sm font-bold text-purple-300">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Category advice */}
      <div className="rounded-xl border border-purple-700/30 bg-indigo-950/30 px-5 py-3">
        <p className="text-xs text-slate-400 mb-1">
          {CATEGORIES.find((c) => c.id === category)?.label ?? ''} \uC6B4\uC138
        </p>
        <p className="text-sm font-semibold text-purple-200">{advice}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
        >
          \uB2E4\uC2DC \uC810\uCE58\uAE30
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: pillarColor }}
        >
          \uCCB4\uD5D8 \uC0C1\uB2F4 \uC2E0\uCCAD
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Export ──────────────────────────────────────────────── */

const FortuneRobotDemo: DemoModule = {
  config,
  StepComponents: [StepMonth, StepElement, StepCategory],
  ResultComponent,
  computeResult,
};

export default FortuneRobotDemo;
