'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { IndustryId } from '@/data/experiences';
import type { DemoModule, DemoConfig, DemoAnswers, DemoStepProps, DemoResultProps } from '@/types/demo';

/* ── Data ──────────────────────────────────────────────── */

const LOVE_LANGS = [
  { id: 'words', label: '칭찬의 말', emoji: '💬' },
  { id: 'touch', label: '스킨십', emoji: '🤗' },
  { id: 'gifts', label: '선물', emoji: '🎁' },
  { id: 'acts', label: '행동으로 표현', emoji: '🛠️' },
  { id: 'time', label: '함께하는 시간', emoji: '⏰' },
] as const;

const CONFLICTS = [
  { id: 'talk', emoji: '💬', label: '대화로 해결', desc: '마주 앉아 솔직하게 이야기한다' },
  { id: 'space', emoji: '🌙', label: '시간을 두고', desc: '각자 시간을 가진 후 대화한다' },
  { id: 'compromise', emoji: '🤝', label: '타협', desc: '서로 한 발씩 양보한다' },
  { id: 'humor', emoji: '😄', label: '유머로', desc: '웃음으로 분위기를 풀어낸다' },
] as const;

const DREAMS = [
  { id: 'adventure', emoji: '✈️', label: '모험과 여행' },
  { id: 'stability', emoji: '🏠', label: '안정과 평화' },
  { id: 'growth', emoji: '📈', label: '성장과 도전' },
  { id: 'romance', emoji: '💕', label: '로맨스와 설렘' },
] as const;

type ResultKey = 'soulmate' | 'affection-duo' | 'action-couple' | 'together-forever'
  | 'passionate-pair' | 'comedy-couple' | 'steady-partners' | 'balanced-harmony';

const RESULTS: Record<ResultKey, {
  name: string; emoji: string; score: number; strengths: string[];
  advice: string; color: string;
}> = {
  'soulmate': { name: '소울메이트', emoji: '👫', score: 98, strengths: ['완벽한 공감 능력', '말하지 않아도 통하는 사이', '깊은 정서적 유대감'], advice: '서로를 비추는 거울 같은 관계. 같은 언어로 사랑하는 행운을 가진 커플입니다.', color: 'from-rose-400 to-pink-500' },
  'affection-duo': { name: '애정 듀오', emoji: '💑', score: 92, strengths: ['풍부한 애정 표현', '따뜻한 일상의 순간들', '감정적 안정감'], advice: '말과 스킨십으로 사랑을 확인하는 다정한 커플. 매일의 작은 표현이 관계를 빛나게 합니다.', color: 'from-amber-400 to-rose-400' },
  'action-couple': { name: '액션 커플', emoji: '🤝', score: 88, strengths: ['실질적인 사랑 표현', '서로를 위한 행동력', '깊은 배려심'], advice: '말보다 행동으로 증명하는 사랑. 서로를 위한 작은 실천이 큰 사랑이 됩니다.', color: 'from-blue-400 to-teal-400' },
  'together-forever': { name: '투게더 포에버', emoji: '🫶', score: 90, strengths: ['함께하는 시간의 가치', '깊은 유대감', '공유하는 추억의 힘'], advice: '함께 있는 것만으로도 행복한 커플. 양질의 시간이 관계의 뿌리를 깊게 합니다.', color: 'from-teal-400 to-cyan-400' },
  'passionate-pair': { name: '패셔닛 페어', emoji: '🔥', score: 91, strengths: ['뜨거운 감정 교류', '솔직한 소통 능력', '설렘을 유지하는 힘'], advice: '대화와 로맨스로 불꽃을 지피는 열정적인 커플. 그 열정이 관계를 항상 새롭게 만듭니다.', color: 'from-red-400 to-orange-400' },
  'comedy-couple': { name: '코미디 커플', emoji: '😂', score: 93, strengths: ['유머 감각의 궁합', '스트레스를 녹이는 웃음', '밝은 가정 분위기'], advice: '웃음이 끊이지 않는 관계가 가장 오래갑니다. 유머는 최고의 사랑 언어예요.', color: 'from-yellow-400 to-amber-400' },
  'steady-partners': { name: '스테디 파트너', emoji: '🏡', score: 89, strengths: ['안정적인 파트너십', '성숙한 갈등 해결', '함께 만드는 미래 설계'], advice: '흔들리지 않는 반석 위에 세운 관계. 서로를 향한 신뢰가 가장 큰 자산입니다.', color: 'from-emerald-400 to-teal-400' },
  'balanced-harmony': { name: '밸런스드 하모니', emoji: '☯️', score: 86, strengths: ['서로를 보완하는 균형', '다양한 시각의 풍요', '함께 성장하는 관계'], advice: '서로 다르기에 더 풍요로운 관계. 차이를 인정하고 존중하는 것이 사랑의 완성입니다.', color: 'from-purple-400 to-indigo-400' },
};

/* ── Config ─────────────────────────────────────────────── */

const config: DemoConfig = {
  id: 'couple-chemistry',
  targetSlug: 'ai-couple-chemistry',
  industryId: 'wedding' as IndustryId,
  analyzeEmoji: '💞',
  analyzeDurationMs: 3000,
  steps: [
    {
      id: 'loveLanguage',
      titleKey: '우리의 사랑의 언어는?',
      subtitleKey: '파트너 A와 B 각각 하나씩 골라주세요',
      canProceed: (a) => {
        const v = a['loveLanguage'] as { a?: string; b?: string } | undefined;
        return !!v?.a && !!v?.b;
      },
    },
    {
      id: 'conflict',
      titleKey: '갈등이 생기면?',
      subtitleKey: '두 분은 주로 어떻게 해결하나요?',
      canProceed: (a) => typeof a['conflict'] === 'string' && (a['conflict'] as string).length > 0,
    },
    {
      id: 'dreamLife',
      titleKey: '꿈꾸는 삶의 우선순위는?',
      subtitleKey: '1순위와 2순위를 순서대로 탭하세요',
      canProceed: (a) => {
        const v = a['dreamLife'] as { first?: string; second?: string } | undefined;
        return !!v?.first && !!v?.second;
      },
    },
  ],
};

/* ── Step 1 : Love Language ──────────────────────────────── */

function StepLoveLanguage({ answers, onUpdate }: DemoStepProps) {
  const val = (answers['loveLanguage'] as { a?: string; b?: string }) ?? {};

  const select = (partner: 'a' | 'b', id: string) => {
    onUpdate('loveLanguage', { ...val, [partner]: id });
  };

  const Column = ({ partner, label, heart, selected }: {
    partner: 'a' | 'b'; label: string; heart: string; selected?: string;
  }) => (
    <div className="flex-1 space-y-3">
      <p className="text-center text-sm font-semibold text-slate-200">
        {heart} {label}
      </p>
      <div className="space-y-2">
        {LOVE_LANGS.map((lang) => {
          const isSel = selected === lang.id;
          return (
            <motion.button
              key={lang.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => select(partner, lang.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400',
                isSel
                  ? 'border-purple-500 bg-purple-500/15 shadow-md shadow-purple-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
              )}
              aria-pressed={isSel}
            >
              <span className="text-lg">{lang.emoji}</span>
              <span className={cn('text-sm font-medium', isSel ? 'text-purple-300' : 'text-slate-300')}>
                {lang.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex gap-4">
      <Column partner="a" label="파트너 A" heart="💜" selected={val.a} />
      <div className="flex items-center px-1">
        <motion.span
          className="text-2xl text-purple-400"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          💕
        </motion.span>
      </div>
      <Column partner="b" label="파트너 B" heart="💛" selected={val.b} />
    </div>
  );
}

/* ── Step 2 : Conflict Style ─────────────────────────────── */

function StepConflict({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['conflict'] as string | undefined;
  return (
    <div className="grid grid-cols-2 gap-3">
      {CONFLICTS.map((c) => {
        const isSel = selected === c.id;
        return (
          <motion.button
            key={c.id}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onUpdate('conflict', c.id)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400',
              isSel
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
            )}
            aria-pressed={isSel}
          >
            <span className="text-3xl">{c.emoji}</span>
            <span className={cn('text-sm font-bold', isSel ? 'text-purple-300' : 'text-slate-200')}>
              {c.label}
            </span>
            <span className="text-xs text-slate-400 leading-snug">{c.desc}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Step 3 : Dream Life Priority ────────────────────────── */

function StepDreamLife({ answers, onUpdate }: DemoStepProps) {
  const val = (answers['dreamLife'] as { first?: string; second?: string }) ?? {};

  const handleTap = (id: string) => {
    if (val.first === id) {
      onUpdate('dreamLife', { first: val.second, second: undefined });
    } else if (val.second === id) {
      onUpdate('dreamLife', { ...val, second: undefined });
    } else if (!val.first) {
      onUpdate('dreamLife', { ...val, first: id });
    } else if (!val.second) {
      onUpdate('dreamLife', { ...val, second: id });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {DREAMS.map((d) => {
        const rank = val.first === d.id ? 1 : val.second === d.id ? 2 : 0;
        return (
          <motion.button
            key={d.id}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleTap(d.id)}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-2xl border p-6 text-center transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400',
              rank > 0
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
            )}
            aria-pressed={rank > 0}
          >
            {rank > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shadow-md',
                  rank === 1
                    ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900'
                    : 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700',
                )}
              >
                {rank === 1 ? '1st' : '2nd'}
              </motion.span>
            )}
            <span className="text-3xl">{d.emoji}</span>
            <span className={cn('text-sm font-bold', rank > 0 ? 'text-purple-300' : 'text-slate-200')}>
              {d.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Compute Result ────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  const ll = answers['loveLanguage'] as { a: string; b: string };
  const conflict = answers['conflict'] as string;
  const dream = answers['dreamLife'] as { first: string; second: string };

  if (ll.a === ll.b) return 'soulmate';

  const pair = new Set([ll.a, ll.b]);
  if (pair.has('words') && pair.has('touch')) return 'affection-duo';
  if (pair.has('gifts') && pair.has('acts')) return 'action-couple';
  if (pair.has('time')) return 'together-forever';
  if (conflict === 'talk' && (dream.first === 'romance' || dream.second === 'romance')) return 'passionate-pair';
  if (conflict === 'humor') return 'comedy-couple';
  if (conflict === 'compromise' && (dream.first === 'stability' || dream.second === 'stability')) return 'steady-partners';
  return 'balanced-harmony';
}

/* ── Circular Progress Ring ──────────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const R = 70;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC - (score / 100) * CIRC;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90" aria-hidden="true">
        <circle cx="90" cy="90" r={R} fill="none" stroke="rgb(30 41 59)" strokeWidth="10" />
        <motion.circle
          cx="90" cy="90" r={R} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-4xl font-black text-white tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-xs font-medium text-slate-400">케미 점수</span>
      </div>
    </div>
  );
}

/* ── Result Component ──────────────────────────────────── */

function ResultComponent({ resultKey, onRestart, pillarColor }: DemoResultProps) {
  const data = RESULTS[resultKey as ResultKey] ?? RESULTS['balanced-harmony'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <p className="text-sm font-medium tracking-widest text-purple-400/80 uppercase">
        커플 케미스트리 결과
      </p>

      <ScoreRing score={data.score} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-4xl">{data.emoji}</span>
        <h2 className={cn(
          'mt-2 bg-gradient-to-r bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl',
          data.color,
        )}>
          {data.name}
        </h2>
      </motion.div>

      {/* Strengths */}
      <div className="w-full max-w-sm space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          커플 강점
        </p>
        <div className="grid gap-2">
          {data.strengths.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.12 }}
              className="flex items-center gap-2.5 rounded-xl border border-purple-800/30 bg-slate-900/60 px-4 py-3"
            >
              <span className="text-purple-400">&#9825;</span>
              <span className="text-sm text-slate-200">{s}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Advice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="max-w-sm rounded-2xl border border-purple-800/40 bg-purple-950/40 px-6 py-4"
      >
        <p className="mb-1 text-xs font-semibold text-purple-400">사랑의 조언</p>
        <p className="text-sm leading-relaxed text-purple-200/90">{data.advice}</p>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
        >
          다시 분석하기
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: pillarColor }}
        >
          체험 상담 신청
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Export ──────────────────────────────────────────────── */

const CoupleChemistryDemo: DemoModule = {
  config,
  StepComponents: [StepLoveLanguage, StepConflict, StepDreamLife],
  ResultComponent,
  computeResult,
};

export default CoupleChemistryDemo;
