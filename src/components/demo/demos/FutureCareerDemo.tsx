'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getServiceContactHref } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { IndustryId } from '@/data/experiences';
import type {
  DemoModule,
  DemoConfig,
  DemoAnswers,
  DemoStepProps,
  DemoResultProps,
} from '@/types/demo';
import { requestDemoAi, type PrintSpec } from '../kit';
import { CAREER_EMOJIS, CAREER_INTERESTS, CAREER_QUADRANTS, CAREER_SUPERPOWERS, type AiCareer } from '@/data/demo-ai/future-career';

/* ── Static Data ─────────────────────────────────────── */
const INTERESTS = CAREER_INTERESTS;
const QUADRANTS = CAREER_QUADRANTS;
const SUPERPOWERS = CAREER_SUPERPOWERS;

interface CareerData { name: string; emoji: string; compatibility: number; skills: string[]; timeline: [string, string, string]; desc: string; }
const CAREERS: Record<string, CareerData> = {
  'ai-engineer': {
    name: 'AI \uC5D4\uC9C0\uB2C8\uC5B4', emoji: '\u{1F916}', compatibility: 94,
    skills: ['Python', 'Machine Learning', '\uB370\uC774\uD130 \uBD84\uC11D', '\uBB38\uC81C \uD574\uACB0'],
    timeline: ["Python의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","AI 엔지니어가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","AI 엔지니어의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 AI 엔지니어입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'ux-designer': {
    name: 'UX \uB514\uC790\uC774\uB108', emoji: '\u{1F3AF}', compatibility: 91,
    skills: ['\uC0AC\uC6A9\uC790 \uB9AC\uC11C\uCE58', 'Figma', '\uD504\uB85C\uD1A0\uD0C0\uC774\uD551', '\uB514\uC790\uC778 \uC0AC\uACE0'],
    timeline: ["사용자 리서치의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","UX 디자이너가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","UX 디자이너의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 UX 디자이너입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'tech-entrepreneur': {
    name: '\uD14C\uD06C \uCC3D\uC5C5\uAC00', emoji: '\u{1F680}', compatibility: 88,
    skills: ['\uBE44\uC804 \uC124\uACC4', '\uC81C\uD488 \uAC1C\uBC1C', '\uD300 \uBE4C\uB529', '\uD22C\uC790 \uC720\uCE58'],
    timeline: ["비전 설계의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","테크 창업가가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","테크 창업가의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 테크 창업가입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'content-creator': {
    name: '\uCF58\uD150\uCE20 \uD06C\uB9AC\uC5D0\uC774\uD130', emoji: '\u{1F4F1}', compatibility: 92,
    skills: ['\uC601\uC0C1 \uC81C\uC791', '\uC2A4\uD1A0\uB9AC\uD154\uB9C1', 'SNS \uB9C8\uCF00\uD305', '\uD2B8\uB80C\uB4DC \uBD84\uC11D'],
    timeline: ["영상 제작의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","콘텐츠 크리에이터가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","콘텐츠 크리에이터의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 콘텐츠 크리에이터입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'creative-director': {
    name: '\uD06C\uB9AC\uC5D0\uC774\uD2F0\uBE0C \uB514\uB809\uD130', emoji: '\u{1F3AC}', compatibility: 90,
    skills: ['\uBE44\uC8FC\uC5BC \uC804\uB7B5', '\uBE0C\uB79C\uB529', '\uD300 \uB9E4\uB2C8\uC9C0\uBA3C\uD2B8', '\uD2B8\uB80C\uB4DC \uD050\uB808\uC774\uC158'],
    timeline: ["비주얼 전략의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","크리에이티브 디렉터가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","크리에이티브 디렉터의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 크리에이티브 디렉터입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'research-scientist': {
    name: '\uC5F0\uAD6C \uACFC\uD559\uC790', emoji: '\u{1F52C}', compatibility: 93,
    skills: ['\uB370\uC774\uD130 \uBD84\uC11D', '\uB17C\uBB38 \uC791\uC131', '\uC2E4\uD5D8 \uC124\uACC4', '\uBE44\uD310\uC801 \uC0AC\uACE0'],
    timeline: ["데이터 분석의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","연구 과학자가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","연구 과학자의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 연구 과학자입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'biotech-innovator': {
    name: '\uBC14\uC774\uC624\uD14C\uD06C \uD601\uC2E0\uAC00', emoji: '\u{1F9EC}', compatibility: 87,
    skills: ['\uC0DD\uBA85\uACF5\uD559', '\uC784\uC0C1 \uC5F0\uAD6C', '\uD2B9\uD5C8 \uC804\uB7B5', '\uADDC\uC81C \uB300\uC751'],
    timeline: ["생명공학의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","바이오테크 혁신가가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","바이오테크 혁신가의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 바이오테크 혁신가입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'startup-ceo': {
    name: '\uC2A4\uD0C0\uD2B8\uC5C5 CEO', emoji: '\u{1F4A1}', compatibility: 89,
    skills: ['\uB9AC\uB354\uC2ED', '\uC804\uB7B5 \uAE30\uD68D', '\uB124\uD2B8\uC6CC\uD0B9', '\uC758\uC0AC \uACB0\uC815'],
    timeline: ["리더십의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","스타트업 CEO가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","스타트업 CEO의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 스타트업 CEO입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'brand-strategist': {
    name: '\uBE0C\uB79C\uB4DC \uC804\uB7B5\uAC00', emoji: '\u{1F4E3}', compatibility: 86,
    skills: ['\uC2DC\uC7A5 \uBD84\uC11D', '\uBE0C\uB79C\uB4DC \uC804\uB7B5', '\uCEE4\uBBA4\uB2C8\uCF00\uC774\uC158', '\uC18C\uBE44\uC790 \uC2EC\uB9AC'],
    timeline: ["시장 분석의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","브랜드 전략가가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","브랜드 전략가의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 브랜드 전략가입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'social-innovator': {
    name: '\uC18C\uC15C \uC774\uB178\uBCA0\uC774\uD130', emoji: '\u{1F30D}', compatibility: 91,
    skills: ['\uACF5\uAC10 \uB2A5\uB825', '\uD504\uB85C\uC81D\uD2B8 \uAD00\uB9AC', '\uC784\uD329\uD2B8 \uCE21\uC815', '\uCEE4\uBBA4\uB2C8\uD2F0 \uBE4C\uB529'],
    timeline: ["공감 능력의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","소셜 이노베이터가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","소셜 이노베이터의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 소셜 이노베이터입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
  'ngo-leader': {
    name: 'NGO \uB9AC\uB354', emoji: '\u{1F91D}', compatibility: 88,
    skills: ['\uC815\uCC45 \uBD84\uC11D', '\uAE00\uB85C\uBC8C \uB124\uD2B8\uC6CC\uD0B9', '\uD380\uB4DC\uB808\uC774\uC9D5', '\uC704\uAE30 \uAD00\uB9AC'],
    timeline: ["정책 분석의 입문 자료 한 개를 읽고 실제 업무에서 쓰이는 장면을 찾아보세요.","NGO 리더가 만드는 결과물의 작은 예제를 직접 완성하고 재미있던 과정과 어려웠던 점을 기록해 보세요.","NGO 리더의 실제 업무 인터뷰를 찾아 필요한 교육·경험과 자신의 관심이 맞는지 다시 확인해 보세요."],
    desc: "선택한 관심 활동과 연결해 탐색해 볼 직업은 NGO 리더입니다. 아래 활동을 직접 해보고 더 알아갈지 판단해 보세요.",
  },
};

/* ── Step 1: Interest Field ──────────────────────────── */
function InterestStep({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['interest'] as string | undefined;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {INTERESTS.map((item, idx) => {
          const isSelected = selected === item.id;
          const isLast = idx === INTERESTS.length - 1;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onUpdate('interest', item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
                isLast && 'col-span-2 sm:col-span-1',
              )}
              aria-pressed={isSelected}
            >
              <span className="text-3xl shrink-0">{item.emoji}</span>
              <div className="min-w-0">
                <p className={cn('font-semibold text-sm', isSelected ? 'text-blue-300' : 'text-white')}>
                  {item.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 2: Work Style (2x2 Matrix) ────────────────── */
const quadrantColors: Record<string, { bg: string; border: string; text: string }> = {
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500',   text: 'text-blue-300' },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500',  text: 'text-green-300' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-300' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500',  text: 'text-amber-300' },
};
function WorkStyleStep({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['workStyle'] as string | undefined;
  return (
    <div className="space-y-4">
      {/* Axis labels - top */}
      <div className="grid grid-cols-[2rem_1fr_1fr] gap-2">
        <div />
        <p className="text-center text-xs font-medium text-slate-500">혼자 Solo</p>
        <p className="text-center text-xs font-medium text-slate-500">함께 Team</p>
      </div>

      {/* Matrix rows */}
      {[0, 1].map((row) => (
        <div key={row} className="grid grid-cols-[2rem_1fr_1fr] gap-2 items-center">
          <p className="text-xs font-medium text-slate-500 [writing-mode:vertical-lr] rotate-180 text-center">
            {row === 0 ? '\uAD6C\uC870\uC801' : '\uC720\uC5F0\uD55C'}
          </p>
          {QUADRANTS.filter((q) => q.row === row).map((q) => {
            const isSelected = selected === q.id;
            const colors = quadrantColors[q.color];

            return (
              <motion.button
                key={q.id}
                type="button"
                onClick={() => onUpdate('workStyle', q.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 rounded-xl border p-6 transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                  colors.bg,
                  isSelected
                    ? cn(colors.border, 'border-2 shadow-lg')
                    : 'border-slate-700/50',
                )}
                aria-pressed={isSelected}
              >
                <span className={cn('text-sm font-semibold', isSelected ? colors.text : 'text-slate-300')}>
                  {q.label}
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="ws-check"
                    className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Step 3: Superpower ──────────────────────────────── */
function SuperpowerStep({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['superpower'] as string | undefined;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {SUPERPOWERS.map((item, idx) => {
          const isSelected = selected === item.id;
          const isLast = idx === SUPERPOWERS.length - 1;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onUpdate('superpower', item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
                isLast && 'col-span-2 sm:col-span-1',
              )}
              aria-pressed={isSelected}
            >
              <span className="text-3xl">{item.emoji}</span>
              <p className={cn('text-sm font-semibold', isSelected ? 'text-blue-300' : 'text-white')}>
                {item.label}
              </p>
              <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Result Component ────────────────────────────────── */
/** 직업을 알아가는 실천 순서 timeline 3단계의 시점 */
const YEAR_LABELS = ['먼저 알아보기', '작게 해보기', '다시 점검하기'] as const;

function careerFor(resultKey: string): CareerData {
  return CAREERS[resultKey] ?? CAREERS['tech-entrepreneur']!;
}

function isAiCareer(v: unknown): v is AiCareer {
  const o = v as AiCareer | null;
  return !!o && typeof o.name === 'string' && typeof o.desc === 'string' && typeof o.compatibility === 'number'
    && (CAREER_EMOJIS as readonly string[]).includes(o.emoji)
    && Array.isArray(o.timeline) && o.timeline.length === 3 && o.timeline.every((t) => typeof t === 'string')
    && Array.isArray(o.skills) && o.skills.every((t) => typeof t === 'string');
}

/** 화면·출력물이 그리는 커리어 — AI 결과가 있으면 그것, 없으면 고정 결과 */
function careerView(resultKey: string, generated: unknown): CareerData & { ai: boolean } {
  if (isAiCareer(generated)) {
    const [y1 = '', y3 = '', y5 = ''] = generated.timeline;
    return {
      name: generated.name, emoji: generated.emoji, compatibility: generated.compatibility,
      skills: generated.skills, timeline: [y1, y3, y5], desc: generated.desc, ai: true,
    };
  }
  return { ...careerFor(resultKey), ai: false };
}

function CareerResult({ resultKey, onRestart, pillarColor, generated }: DemoResultProps) {
  const tCommon = useTranslations('demos.common');
  const career = careerView(resultKey, generated);

  return (
    <div className="space-y-8">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <p className="text-sm font-medium tracking-widest text-blue-400 uppercase">
          관심 활동으로 찾은 직업 탐색 후보
        </p>
        <p className="text-5xl">{career.emoji}</p>
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          {career.name}
        </h2>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-500/30 px-4 py-1.5">
          <span className="text-sm font-semibold text-blue-300">
            답변에 연결된 탐색 후보
          </span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-auto max-w-sm text-sm leading-relaxed text-slate-400 text-center"
      >
        {career.desc}
      </motion.p>

      {/* Growth Roadmap Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
          직업을 알아가는 실천 순서
        </p>
        <div className="relative ml-8 space-y-6 py-2">
          {/* Vertical line */}
          <div className="absolute left-[5px] top-0 h-full w-0.5 bg-blue-500/30" aria-hidden="true" />

          {career.timeline.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12 }}
              className="relative flex items-start gap-4"
            >
              <div className="relative z-10 mt-0.5 h-3 w-3 shrink-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40" />
              <div>
                <p className="text-xs font-semibold text-blue-400">{YEAR_LABELS[i]}</p>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Core Skills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
          핵심 스킬
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {career.skills.map((skill, i) => (
            <span
              key={`${i}-${skill}`}
              className="rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-medium text-blue-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {career.ai && (
        <p className="text-center text-xs text-slate-500">관심에 맞춰 제안한 탐색 후보입니다. 적성이나 성공 가능성을 측정한 결과가 아닙니다.</p>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="demo-legacy-result-cta flex flex-wrap justify-center gap-3 pt-4"
      >
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          다시 분석하기
        </button>
        <Link
          href={getServiceContactHref('ai-future-career')}
          className="demo-accent-surface inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{ backgroundColor: pillarColor }}
        >
          {tCommon('ctaButton')}
        </Link>
      </motion.div>
    </div>
  );
}

/* ── computeResult ───────────────────────────────────── */
function computeResult(answers: DemoAnswers): string {
  const interest = answers['interest'] as string | undefined;
  const superpower = answers['superpower'] as string | undefined;
  if (interest === 'tech') {
    if (superpower === 'logic') return 'ai-engineer';
    if (superpower === 'creativity') return 'ux-designer';
    return 'tech-entrepreneur';
  }
  if (interest === 'creative') {
    if (superpower === 'creativity') return 'content-creator';
    if (superpower === 'communication') return 'creative-director';
    return 'content-creator';
  }
  if (interest === 'science') {
    if (superpower === 'logic') return 'research-scientist';
    return 'biotech-innovator';
  }
  if (interest === 'business') {
    if (superpower === 'leadership') return 'startup-ceo';
    if (superpower === 'communication') return 'brand-strategist';
    return 'startup-ceo';
  }
  if (interest === 'social') {
    if (superpower === 'empathy') return 'social-innovator';
    if (superpower === 'leadership') return 'ngo-leader';
    return 'social-innovator';
  }
  return 'tech-entrepreneur';
}

/* ── Config & Export ─────────────────────────────────── */
const config: DemoConfig = {
  id: 'future-career',
  targetSlug: 'ai-future-career',
  industryId: 'education' as IndustryId,
  analyzeEmoji: '\u{1F680}',
  analyzeDurationMs: 2800,
  steps: [
    {
      id: 'interest',
      titleKey: '\uAC00\uC7A5 \uAD00\uC2EC \uC788\uB294 \uBD84\uC57C\uB294?',
      subtitleKey: '\uB9C8\uC74C\uC774 \uB04C\uB9AC\uB294 \uBD84\uC57C\uB97C \uC120\uD0DD\uD558\uC138\uC694',
      canProceed: (a) => typeof a['interest'] === 'string',
    },
    {
      id: 'workStyle',
      titleKey: '\uB098\uC758 \uC5C5\uBB34 \uC2A4\uD0C0\uC77C\uC740?',
      subtitleKey: '2x2 \uB9E4\uD2B8\uB9AD\uC2A4\uC5D0\uC11C \uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uC704\uCE58\uB97C \uD0ED\uD558\uC138\uC694',
      canProceed: (a) => typeof a['workStyle'] === 'string',
    },
    {
      id: 'superpower',
      titleKey: '\uB2F9\uC2E0\uC758 \uCD08\uB2A5\uB825\uC740?',
      subtitleKey: '\uD558\uB098\uB9CC \uACE0\uB97C \uC218 \uC788\uB2E4\uBA74?',
      canProceed: (a) => typeof a['superpower'] === 'string',
    },
  ],
};

/* ── Print ───────────────────────────────────────────── */
function getPrint(answers: DemoAnswers, resultKey: string, generated?: unknown): PrintSpec {
  const career = careerView(resultKey, generated);
  const interest = INTERESTS.find((i) => i.id === answers['interest']);
  const workStyle = QUADRANTS.find((q) => q.id === answers['workStyle']);
  const superpower = SUPERPOWERS.find((s) => s.id === answers['superpower']);
  return {
    kind: 'receipt',
    eyebrow: '관심 활동으로 찾은 직업 탐색 후보',
    title: career.name,
    sections: [
      { type: 'text', title: '탐색의 출발점', text: '흥미에 기반한 직업 후보입니다. 적성·성공 가능성을 측정한 점수는 제공하지 않습니다.' },
      { type: 'text', text: career.desc },
      {
        type: 'rows',
        title: '내가 고른 관심과 선호',
        rows: [
          { label: '관심 분야', value: interest?.label ?? '-' },
          { label: '업무 스타일', value: workStyle?.label ?? '-' },
          { label: '나의 초능력', value: superpower?.label ?? '-' },
        ],
      },
      { type: 'list', title: '직업을 알아가는 실천 순서', items: career.timeline.map((step, i) => `${YEAR_LABELS[i]} · ${step}`) },
      { type: 'list', title: '핵심 스킬', items: career.skills },
    ],
    footer: '직접 해본 뒤 관심과 조건을 다시 점검해 보세요.',
  };
}

/* ── AI 생성 ──────────────────────────────────────────── */
function generate(answers: DemoAnswers): Promise<AiCareer | null> {
  return requestDemoAi<AiCareer>(
    config.id,
    { experienceProfile: answers.experienceProfile, interest: answers['interest'], workStyle: answers['workStyle'], superpower: answers['superpower'] },
    { validate: isAiCareer }
  );
}

const futureCareerDemo: DemoModule = {
  config,
  StepComponents: [InterestStep, WorkStyleStep, SuperpowerStep],
  ResultComponent: CareerResult,
  computeResult,
  getPrint,
  generate,
};

export default futureCareerDemo;
