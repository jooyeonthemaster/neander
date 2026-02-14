'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { IndustryId } from '@/data/experiences';
import type { DemoModule, DemoConfig, DemoAnswers, DemoStepProps, DemoResultProps } from '@/types/demo';

/* ── Static Data ─────────────────────────────────────── */

const ROLES = [
  { id: 'leader', emoji: '\u{1F981}', title: '\uB9AC\uB354', desc: '\uBC29\uD5A5\uC744 \uC81C\uC2DC\uD558\uACE0 \uD300\uC744 \uC774\uB044\uB2E4' },
  { id: 'mediator', emoji: '\u{1F54A}\uFE0F', title: '\uC870\uC728\uC790', desc: '\uAC08\uB4F1\uC744 \uD574\uACB0\uD558\uACE0 \uC870\uD654\uB97C \uB9CC\uB4E0\uB2E4' },
  { id: 'analyst', emoji: '\u{1F50D}', title: '\uBD84\uC11D\uAC00', desc: '\uB370\uC774\uD130\uB85C \uCD5C\uC801\uC758 \uB2F5\uC744 \uCC3E\uB294\uB2E4' },
  { id: 'creator', emoji: '\u{1F4A1}', title: '\uD06C\uB9AC\uC5D0\uC774\uD130', desc: '\uC0C8\uB85C\uC6B4 \uC544\uC774\uB514\uC5B4\uB97C \uB9CC\uB4E4\uC5B4\uB0B8\uB2E4' },
  { id: 'executor', emoji: '\u26A1', title: '\uC2E4\uD589\uC790', desc: '\uACC4\uD68D\uC744 \uBE60\uB974\uACE0 \uC815\uD655\uD558\uAC8C \uC2E4\uD589\uD55C\uB2E4' },
] as const;

const COMM_STYLES = [
  { id: 'direct', emoji: '\u{1F4AC}', title: '\uC9C1\uC124\uC801', desc: '\uD575\uC2EC\uB9CC \uAC04\uACB0\uD558\uAC8C \uC804\uB2EC' },
  { id: 'diplomatic', emoji: '\u{1F91D}', title: '\uC678\uAD50\uC801', desc: '\uC0C1\uB300\uC758 \uAC10\uC815\uC744 \uACE0\uB824\uD558\uBA70 \uC804\uB2EC' },
  { id: 'dataDriven', emoji: '\u{1F4CA}', title: '\uB370\uC774\uD130 \uC911\uC2EC', desc: '\uC218\uCE58\uC640 \uADFC\uAC70\uB85C \uC124\uB4DD' },
  { id: 'storytelling', emoji: '\u{1F4D6}', title: '\uC2A4\uD1A0\uB9AC\uD154\uB9C1', desc: '\uC774\uC57C\uAE30\uC640 \uBE44\uC720\uB85C \uACF5\uAC10 \uC720\uB3C4' },
] as const;

const STRESS_RESPONSES = [
  { id: 'charge', emoji: '\u{1F3C3}', title: '\uB3CC\uC9C4', desc: '\uC77C\uB2E8 \uBD80\uB52A\uD788\uBA70 \uD574\uACB0\uD55C\uB2E4' },
  { id: 'plan', emoji: '\u{1F4CB}', title: '\uACC4\uD68D \uC218\uB9BD', desc: '\uC6B0\uC120\uC21C\uC704\uB97C \uC7AC\uC815\uB9AC\uD55C\uB2E4' },
  { id: 'collaborate', emoji: '\u{1F932}', title: '\uD611\uC5C5', desc: '\uD300\uC6D0\uC5D0\uAC8C \uB3C4\uC6C0\uC744 \uC694\uCCAD\uD55C\uB2E4' },
  { id: 'reflect', emoji: '\u{1F9D8}', title: '\uC131\uCC30', desc: '\uD55C \uBC1C \uBB3C\uB7EC\uC11C\uC11C \uC0DD\uAC01\uD55C\uB2E4' },
] as const;

type ResultKey = 'commander' | 'diplomat-leader' | 'harmony-maker' | 'data-strategist'
  | 'strategic-thinker' | 'visionary' | 'innovator' | 'action-hero' | 'reliable-anchor';

interface ResultData {
  name: string; emoji: string; strengths: string[]; challenges: string[];
  partner: string; desc: string;
}

const RESULTS: Record<ResultKey, ResultData> = {
  commander: { name: '\uCEE4\uB9E8\uB354', emoji: '\u{1F3AF}', strengths: ['\uACB0\uB2E8\uB825 \uC788\uB294 \uC758\uC0AC\uACB0\uC815', '\uC704\uAE30 \uB300\uC751 \uB2A5\uB825', '\uBAA9\uD45C \uB2EC\uC131 \uCD94\uC9C4\uB825'], challenges: ['\uD300\uC6D0 \uC758\uACAC \uC218\uB834 \uBD80\uC871', '\uBC88\uC544\uC6C3 \uC704\uD5D8'], partner: '\uD558\uBAA8\uB2C8 \uBA54\uC774\uCEE4', desc: '\uBAA9\uD45C\uB97C \uD5A5\uD574 \uD300\uC744 \uC774\uB044\uB294 \uAC15\uB825\uD55C \uB9AC\uB354! \uBE60\uB978 \uD310\uB2E8\uB825\uACFC \uCD94\uC9C4\uB825\uC73C\uB85C \uC5B4\uB5A4 \uC0C1\uD669\uB3C4 \uB3CC\uD30C\uD569\uB2C8\uB2E4.' },
  'diplomat-leader': { name: '\uB514\uD50C\uB85C\uB9F7 \uB9AC\uB354', emoji: '\u{1F310}', strengths: ['\uD300 \uD654\uD569 \uB2A5\uB825', '\uC804\uB7B5\uC801 \uC18C\uD1B5', '\uC2E0\uB8B0 \uAD6C\uCD95'], challenges: ['\uACB0\uC815 \uC18D\uB3C4 \uB290\uB9BC', '\uAC08\uB4F1 \uD68C\uD53C \uACBD\uD5A5'], partner: '\uC561\uC158 \uD788\uC5B4\uB85C', desc: '\uC678\uAD50\uC801 \uC18C\uD1B5\uC73C\uB85C \uD300\uC744 \uD558\uB098\uB85C \uB9CC\uB4DC\uB294 \uB9AC\uB354! \uC2E0\uB8B0 \uAE30\uBC18\uC758 \uB9AC\uB354\uC2ED\uC73C\uB85C \uC7A5\uAE30\uC801 \uC131\uACFC\uB97C \uC774\uB055\uB2C8\uB2E4.' },
  'harmony-maker': { name: '\uD558\uBAA8\uB2C8 \uBA54\uC774\uCEE4', emoji: '\u{1F3B6}', strengths: ['\uAC08\uB4F1 \uD574\uACB0 \uC804\uBB38\uAC00', '\uD300 \uBD84\uC704\uAE30 \uC870\uC131', '\uACBD\uCCAD \uB2A5\uB825'], challenges: ['\uC790\uAE30 \uC758\uACAC \uD45C\uD604 \uBD80\uC871', '\uACFC\uB3C4\uD55C \uC911\uC7AC \uD53C\uB85C'], partner: '\uCEE4\uB9E8\uB354', desc: '\uD300\uC758 \uD654\uD569\uC744 \uB9CC\uB4DC\uB294 \uC870\uC728\uC758 \uB2EC\uC778! \uBAA8\uB450\uC758 \uBAA9\uC18C\uB9AC\uB97C \uB4E3\uACE0 \uCD5C\uC801\uC758 \uADE0\uD615\uC810\uC744 \uCC3E\uC544\uB0C5\uB2C8\uB2E4.' },
  'data-strategist': { name: '\uB370\uC774\uD130 \uC804\uB7B5\uAC00', emoji: '\u{1F4C8}', strengths: ['\uB17C\uB9AC\uC801 \uBD84\uC11D\uB825', '\uAC1D\uAD00\uC801 \uD310\uB2E8', '\uB9AC\uC2A4\uD06C \uAD00\uB9AC'], challenges: ['\uAC10\uC815 \uC18C\uD1B5 \uBD80\uC871', '\uACFC\uB3C4\uD55C \uBD84\uC11D \uB9C8\uBE44'], partner: '\uBE44\uC800\uB108\uB9AC', desc: '\uB370\uC774\uD130\uB85C \uC804\uB7B5\uC744 \uC218\uB9BD\uD558\uB294 \uBD84\uC11D\uC758 \uB2EC\uC778! \uAC1D\uAD00\uC801 \uADFC\uAC70\uB85C \uD300\uC758 \uBC29\uD5A5\uC744 \uC81C\uC2DC\uD569\uB2C8\uB2E4.' },
  'strategic-thinker': { name: '\uC804\uB7B5\uC801 \uC0AC\uACE0\uAC00', emoji: '\u265F\uFE0F', strengths: ['\uD070 \uADF8\uB9BC \uD30C\uC545', '\uCCB4\uACC4\uC801 \uC0AC\uACE0', '\uBB38\uC81C \uD574\uACB0\uB825'], challenges: ['\uC2E4\uD589 \uC18D\uB3C4', '\uC644\uBCBD\uC8FC\uC758 \uC131\uD5A5'], partner: '\uC561\uC158 \uD788\uC5B4\uB85C', desc: '\uC804\uB7B5\uC801 \uC0AC\uACE0\uB85C \uCD5C\uC801\uC758 \uACBD\uB85C\uB97C \uCC3E\uB294 \uB450\uB1CC! \uCCB4\uACC4\uC801 \uBD84\uC11D\uC73C\uB85C \uD300\uC758 \uB098\uCE68\uBC18 \uC5ED\uD560\uC744 \uD569\uB2C8\uB2E4.' },
  visionary: { name: '\uBE44\uC800\uB108\uB9AC', emoji: '\u{1F52D}', strengths: ['\uD601\uC2E0\uC801 \uC544\uC774\uB514\uC5B4', '\uC601\uAC10 \uC81C\uACF5', '\uBBF8\uB798 \uC608\uCE21\uB825'], challenges: ['\uD604\uC2E4\uC131 \uBD80\uC871', '\uB514\uD14C\uC77C \uAD00\uB9AC'], partner: '\uB370\uC774\uD130 \uC804\uB7B5\uAC00', desc: '\uBBF8\uB798\uB97C \uADF8\uB9AC\uB294 \uBE44\uC804\uC758 \uC18C\uC720\uC790! \uD601\uC2E0\uC801 \uC544\uC774\uB514\uC5B4\uC640 \uC2A4\uD1A0\uB9AC\uB85C \uD300\uC5D0 \uC601\uAC10\uC744 \uBD88\uC5B4\uB123\uC2B5\uB2C8\uB2E4.' },
  innovator: { name: '\uC774\uB178\uBCA0\uC774\uD130', emoji: '\u{1F9EA}', strengths: ['\uCC3D\uC758\uC801 \uBB38\uC81C \uD574\uACB0', '\uC2E4\uD5D8 \uC815\uC2E0', '\uC0C8\uB85C\uC6B4 \uAD00\uC810'], challenges: ['\uC77C\uAD00\uC131 \uC720\uC9C0', '\uC6B0\uC120\uC21C\uC704 \uBD84\uC0B0'], partner: '\uB9B4\uB77C\uC774\uC5B4\uBE14 \uC575\uCEE4', desc: '\uB04A\uC784\uC5C6\uC774 \uC0C8\uB85C\uC6B4 \uC2DC\uB3C4\uB97C \uD558\uB294 \uD601\uC2E0\uAC00! \uCC3D\uC758\uC801 \uC811\uADFC\uC73C\uB85C \uD300\uC758 \uD55C\uACC4\uB97C \uB113\uD600\uAC11\uB2C8\uB2E4.' },
  'action-hero': { name: '\uC561\uC158 \uD788\uC5B4\uB85C', emoji: '\u26A1', strengths: ['\uBE60\uB978 \uC2E4\uD589\uB825', '\uACB0\uACFC \uC911\uC2EC', '\uB192\uC740 \uC0DD\uC0B0\uC131'], challenges: ['\uACC4\uD68D \uC5C6\uB294 \uB3CC\uC9C4', '\uD300 \uC18D\uB3C4 \uCC28\uC774 \uBB34\uC2DC'], partner: '\uC804\uB7B5\uC801 \uC0AC\uACE0\uAC00', desc: '\uC0DD\uAC01\uBCF4\uB2E4 \uD589\uB3D9\uC774 \uC55E\uC11C\uB294 \uC2E4\uD589\uC758 \uB2EC\uC778! \uBE60\uB978 \uCD94\uC9C4\uB825\uC73C\uB85C \uD300\uC758 \uC131\uACFC\uB97C \uB9CC\uB4E4\uC5B4\uB0C5\uB2C8\uB2E4.' },
  'reliable-anchor': { name: '\uB9B4\uB77C\uC774\uC5B4\uBE14 \uC575\uCEE4', emoji: '\u2693', strengths: ['\uC548\uC815\uC801 \uC218\uD589\uB825', '\uCC45\uC784\uAC10', '\uAFB8\uC900\uD55C \uD488\uC9C8'], challenges: ['\uBCC0\uD654 \uC801\uC751 \uC18D\uB3C4', '\uC0C8\uB85C\uC6B4 \uC2DC\uB3C4 \uC8FC\uC800'], partner: '\uC774\uB178\uBCA0\uC774\uD130', desc: '\uD300\uC758 \uB4E0\uB4E0\uD55C \uBC84\uD300\uBAA9! \uBBC5\uBBC5\uD788 \uB9E1\uC740 \uBC14\uB97C \uC644\uC218\uD558\uB294 \uC2E0\uB8B0\uC758 \uC0C1\uC9D5\uC785\uB2C8\uB2E4.' },
};

/* ── Config ──────────────────────────────────────────── */

const config: DemoConfig = {
  id: 'team-chemistry',
  targetSlug: 'ai-team-chemistry',
  industryId: 'corporate' as IndustryId,
  analyzeEmoji: '\u{1F9EC}',
  analyzeDurationMs: 2500,
  steps: [
    { id: 'role', titleKey: '\uD300\uC5D0\uC11C \uB098\uC758 \uC5ED\uD560\uC740?', subtitleKey: '\uAC00\uC7A5 \uC798 \uC5B4\uC6B8\uB9AC\uB294 \uD3EC\uC9C0\uC158\uC744 \uACE8\uB77C\uC8FC\uC138\uC694', canProceed: (a) => typeof a['role'] === 'string' },
    { id: 'communication', titleKey: '\uB098\uC758 \uC18C\uD1B5 \uBC29\uC2DD\uC740?', subtitleKey: '\uD68C\uC758\uC5D0\uC11C \uC8FC\uB85C \uC5B4\uB5BB\uAC8C \uC758\uACAC\uC744 \uC804\uB2EC\uD558\uB098\uC694?', canProceed: (a) => typeof a['communication'] === 'string' },
    { id: 'stress', titleKey: '\uC704\uAE30 \uC0C1\uD669\uC5D0\uC11C \uB098\uB294?', subtitleKey: '\uD504\uB85C\uC81D\uD2B8 \uB9C8\uAC10\uC774 \uCD09\uBC15\uD560 \uB54C \uC5B4\uB5BB\uAC8C \uD558\uB098\uC694?', canProceed: (a) => typeof a['stress'] === 'string' },
  ],
};

/* ── Step 1: Work Personality (Role) ─────────────────── */

function StepRole({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['role'] as string | undefined;
  return (
    <div className="grid gap-3">
      {ROLES.map((r) => {
        const active = selected === r.id;
        return (
          <motion.button
            key={r.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onUpdate('role', r.id)}
            aria-pressed={active}
            className={cn(
              'flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              active
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
            )}
          >
            <span className="text-3xl shrink-0">{r.emoji}</span>
            <div className="min-w-0">
              <p className={cn('text-base font-semibold', active ? 'text-blue-300' : 'text-slate-100')}>
                {r.title}
              </p>
              <p className="mt-0.5 text-sm text-slate-400">{r.desc}</p>
            </div>
            {active && (
              <motion.div
                layoutId="role-check"
                className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow"
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
  );
}

/* ── Step 2: Communication Style ─────────────────────── */

function StepCommunication({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['communication'] as string | undefined;
  return (
    <div className="grid grid-cols-2 gap-4">
      {COMM_STYLES.map((c) => {
        const active = selected === c.id;
        return (
          <motion.button
            key={c.id}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onUpdate('communication', c.id)}
            aria-pressed={active}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-2xl border p-5 pb-7 text-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              active
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
            )}
          >
            {/* Speech bubble tail */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute -bottom-2 left-5 h-0 w-0',
                'border-l-[8px] border-r-[8px] border-t-[8px]',
                'border-l-transparent border-r-transparent',
                active ? 'border-t-blue-500/40' : 'border-t-slate-700',
              )}
            />
            <span className="text-3xl">{c.emoji}</span>
            <p className={cn('text-sm font-semibold', active ? 'text-blue-300' : 'text-slate-100')}>
              {c.title}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Step 3: Stress Response ─────────────────────────── */

function StepStress({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['stress'] as string | undefined;
  return (
    <div className="grid grid-cols-2 gap-4">
      {STRESS_RESPONSES.map((s) => {
        const active = selected === s.id;
        return (
          <motion.button
            key={s.id}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onUpdate('stress', s.id)}
            aria-pressed={active}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              active
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
            )}
          >
            <span className="text-3xl">{s.emoji}</span>
            <p className={cn('text-sm font-semibold', active ? 'text-blue-300' : 'text-slate-100')}>
              {s.title}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── computeResult ───────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  const role = answers['role'] as string | undefined;
  const comm = answers['communication'] as string | undefined;
  const stress = answers['stress'] as string | undefined;

  if (role === 'leader' && comm === 'direct' && stress === 'charge') return 'commander';
  if (role === 'leader' && comm === 'diplomatic') return 'diplomat-leader';
  if (role === 'mediator') return 'harmony-maker';
  if (role === 'analyst' && comm === 'dataDriven') return 'data-strategist';
  if (role === 'analyst') return 'strategic-thinker';
  if (role === 'creator' && comm === 'storytelling') return 'visionary';
  if (role === 'creator') return 'innovator';
  if (role === 'executor' && stress === 'charge') return 'action-hero';
  if (role === 'executor') return 'reliable-anchor';
  return 'strategic-thinker';
}

/* ── Result Component ────────────────────────────────── */

function ResultComponent({ resultKey, onRestart, pillarColor }: DemoResultProps) {
  const d = RESULTS[resultKey as ResultKey] ?? RESULTS['strategic-thinker'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      {/* Badge */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-6xl">{d.emoji}</span>
        <p className="text-xs font-medium tracking-widest text-slate-400 uppercase">
          Team Archetype
        </p>
        <h2 className="text-3xl font-bold" style={{ color: pillarColor }}>{d.name}</h2>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="max-w-sm text-sm leading-relaxed text-slate-300"
      >
        {d.desc}
      </motion.p>

      {/* Strengths & Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid w-full max-w-md grid-cols-2 gap-4 text-left"
      >
        {/* Strengths */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <p className="mb-3 text-xs font-semibold tracking-wider text-green-400 uppercase">
            Strengths
          </p>
          <ul className="space-y-2">
            {d.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-slate-300">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-400" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <p className="mb-3 text-xs font-semibold tracking-wider text-amber-400 uppercase">
            Challenges
          </p>
          <ul className="space-y-2">
            {d.challenges.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-slate-300">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 4v5m0 2.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Complementary Partner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md rounded-xl p-[1px]"
        style={{ background: `linear-gradient(135deg, ${pillarColor}, transparent 60%)` }}
      >
        <div className="flex items-center justify-between rounded-xl bg-slate-950 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-400">{'\uBCF4\uC644 \uD30C\uD2B8\uB108'}</p>
            <p className="mt-1 text-base font-bold text-slate-100">{d.partner}</p>
          </div>
          <span className="text-2xl" aria-hidden="true">{'\u{1F91D}'}</span>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3 pt-2"
      >
        <button
          type="button"
          onClick={onRestart}
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {'\uB2E4\uC2DC \uC9C4\uB2E8\uD558\uAE30'}
        </button>
        <button
          type="button"
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: pillarColor }}
        >
          {'\uCCB4\uD5D8 \uC0C1\uB2F4 \uC2E0\uCCAD'}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── Export ───────────────────────────────────────────── */

const TeamChemistryDemo: DemoModule = {
  config,
  StepComponents: [StepRole, StepCommunication, StepStress],
  ResultComponent,
  computeResult,
};

export default TeamChemistryDemo;
