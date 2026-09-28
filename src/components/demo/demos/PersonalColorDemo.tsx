'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getServiceContactHref } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { IndustryId } from '@/data/experiences';
import type {
  DemoAnswers,
  DemoConfig,
  DemoModule,
  DemoStepProps,
  DemoResultProps,
} from '@/types/demo';
import { requestDemoAi, type PrintSpec } from '../kit';
import {
  PC_COLOR_SWATCHES,
  PC_SEASONS,
  PC_SEASON_PALETTES,
  PC_UNDERTONES,
  type AiPersonalColor,
  type PcColor,
} from '@/data/demo-ai/personal-color';

/* ── Data ──────────────────────────────────────────────── */

const UNDERTONES = PC_UNDERTONES;
const COLOR_SWATCHES = PC_COLOR_SWATCHES;
const SEASON_PALETTES = PC_SEASON_PALETTES;

const LIGHT_COLORING = new Set(['hazel', 'honey', 'reddishBrown', 'grayBrown']);

type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';

const RESULTS: Record<SeasonKey, {
  name: string; en: string; emoji: string; desc: string;
  colors: string[]; avoid: string[];
}> = {
  spring: {
    name: '봄 웜 라이트', en: 'Spring Warm Light', emoji: '\uD83C\uDF38',
    colors: ['#FFD54F', '#FF8A80', '#FFAB91', '#FFE082', '#C5E1A5', '#FFF9C4', '#FFCC80', '#F48FB1'],
    avoid: ['#263238', '#1A237E', '#4A148C', '#B71C1C'],
    desc: '밝고 화사한 컬러가 잘 어울리는 당신! 생기 넘치는 따뜻한 톤이 얼굴을 환하게 빛나게 해요.',
  },
  summer: {
    name: '여름 쿨 라이트', en: 'Summer Cool Light', emoji: '\uD83C\uDF0A',
    colors: ['#90CAF9', '#CE93D8', '#F48FB1', '#B2DFDB', '#E1BEE7', '#B3E5FC', '#80CBC4', '#EF9A9A'],
    avoid: ['#E65100', '#FF6F00', '#BF360C', '#33691E'],
    desc: '부드럽고 우아한 톤이 어울리는 당신! 파스텔과 뮤트 톤이 고급스러운 분위기를 만들어요.',
  },
  autumn: {
    name: '가을 웜 딥', en: 'Autumn Warm Deep', emoji: '\uD83C\uDF42',
    colors: ['#8D6E63', '#FF8F00', '#BF360C', '#4E342E', '#827717', '#E65100', '#6D4C41', '#FF6F00'],
    avoid: ['#E1BEE7', '#B3E5FC', '#F8BBD0', '#BBDEFB'],
    desc: '깊고 풍성한 어스 톤이 어울리는 당신! 자연에서 온 따뜻한 색감이 매력을 극대화해요.',
  },
  winter: {
    name: '겨울 쿨 딥', en: 'Winter Cool Deep', emoji: '\u2744\uFE0F',
    colors: ['#E53935', '#1E88E5', '#000000', '#FFFFFF', '#7B1FA2', '#00897B', '#C62828', '#1565C0'],
    avoid: ['#FFE082', '#FFCC80', '#A1887F', '#BCAAA4'],
    desc: '선명하고 대비감 있는 컬러가 어울리는 당신! 강렬한 색감이 존재감을 더해줘요.',
  },
};

/* ── Config ─────────────────────────────────────────────── */

const config: DemoConfig = {
  id: 'personal-color',
  targetSlug: 'ai-personal-color',
  industryId: 'beauty' as IndustryId,
  analyzeEmoji: '\uD83C\uDFA8',
  analyzeDurationMs: 2500,
  steps: [
    {
      id: 'undertone',
      titleKey: '피부 언더톤을 선택해 주세요',
      subtitleKey: '평소 느끼는 색을 골라주세요 · 확신이 없다면 뉴트럴로 시작해요',
      canProceed: (a) => !!a['undertone'],
    },
    {
      id: 'coloring',
      titleKey: '눈동자와 머리카락 색은?',
      subtitleKey: '자연광에서의 색을 골라주세요 (최대 2개)',
      canProceed: (a) => Array.isArray(a['coloring']) && (a['coloring'] as string[]).length > 0,
    },
    {
      id: 'preference',
      titleKey: '끌리는 컬러 팔레트는?',
      subtitleKey: '직감적으로 끌리는 계절을 골라주세요',
      canProceed: (a) => !!a['preference'],
    },
  ],
};

/* ── Step 1 : Undertone ─────────────────────────────────── */

function StepUndertone({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['undertone'] as string | undefined;
  return (
    <div className="demo-choice-grid grid gap-4">
      {UNDERTONES.map((t) => (
        <motion.button
          key={t.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onUpdate('undertone', t.id)}
          type="button"
          aria-pressed={selected === t.id}
          className={cn(
            'demo-choice demo-custom-choice demo-undertone-choice flex items-center gap-5 rounded-2xl border p-5 text-left transition-colors',
            selected === t.id
              ? 'border-teal-500 bg-teal-500/10'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
          )}
        >
          <div className={cn('h-14 w-24 shrink-0 rounded-xl bg-gradient-to-r', t.from, t.to)} />
          <div>
            <p className="text-base font-semibold text-slate-100">{t.label}</p>
            <p className="mt-1 text-sm text-slate-400">{t.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Step 2 : Coloring ──────────────────────────────────── */

function StepColoring({ answers, onUpdate }: DemoStepProps) {
  const selected = (answers['coloring'] as string[] | undefined) ?? [];

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onUpdate('coloring', selected.filter((s) => s !== id));
    } else if (selected.length < 2) {
      onUpdate('coloring', [...selected, id]);
    }
  };

  return (
    <div>
      <p className="mb-4 text-right text-sm font-medium text-slate-400">
        {selected.length}/2
      </p>
      <div className="grid grid-cols-3 gap-5">
        {COLOR_SWATCHES.map((c) => {
          const active = selected.includes(c.id);
          return (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(c.id)}
              type="button"
              aria-pressed={active}
              className="demo-choice demo-color-swatch-choice flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  'h-16 w-16 rounded-full transition-shadow',
                  active && 'ring-4 ring-teal-400',
                )}
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-xs text-slate-300">{c.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 3 : Preference ────────────────────────────────── */

function StepPreference({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['preference'] as string | undefined;
  return (
    <div className="demo-choice-grid grid grid-cols-2 gap-4">
      {SEASON_PALETTES.map((s) => (
        <motion.button
          key={s.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onUpdate('preference', s.id)}
          type="button"
          aria-pressed={selected === s.id}
          className={cn(
            'demo-choice demo-custom-choice demo-season-choice rounded-2xl border p-4 text-left transition-colors',
            selected === s.id
              ? 'border-teal-500 bg-teal-500/10'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
          )}
        >
          <p className="mb-3 text-sm font-semibold text-slate-200">{s.label}</p>
          <div className="grid grid-cols-3 gap-2">
            {s.colors.map((hex) => (
              <div
                key={hex}
                className={cn(
                  'h-7 w-7 rounded-full',
                  hex === '#FFFFFF' && 'border border-slate-600',
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Compute Result ─────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  const undertone = answers['undertone'] as string | undefined;
  const coloring = (answers['coloring'] as string[] | undefined) ?? [];
  const preference = answers['preference'] as string | undefined;

  const isLightColoring = coloring.some((c) => LIGHT_COLORING.has(c));

  if (undertone === 'warm') {
    if (preference === 'spring' || preference === 'summer') return isLightColoring ? 'spring' : 'autumn';
    return isLightColoring ? 'spring' : 'autumn';
  }
  if (undertone === 'cool') {
    if (preference === 'winter' || preference === 'autumn') return isLightColoring ? 'summer' : 'winter';
    return isLightColoring ? 'summer' : 'winter';
  }
  // neutral -- follow preference directly
  if (preference === 'spring') return 'spring';
  if (preference === 'summer') return 'summer';
  if (preference === 'autumn') return 'autumn';
  if (preference === 'winter') return 'winter';
  return 'spring';
}

/* ── Diagnosis (결과 화면 · 출력물 공용) ─────────────────── */

function seasonResult(resultKey: string) {
  return RESULTS[resultKey as SeasonKey] ?? RESULTS.spring;
}

const HEX = /^#[0-9A-Fa-f]{6}$/;
const isColorList = (v: unknown) => Array.isArray(v) && v.length > 0 && v.every((c: PcColor) => !!c && typeof c.hex === 'string' && HEX.test(c.hex));

function isAiPersonalColor(v: unknown): v is AiPersonalColor {
  const o = v as AiPersonalColor | null;
  return !!o && (PC_SEASONS as readonly string[]).includes(o.season) && typeof o.name === 'string' && typeof o.desc === 'string'
    && isColorList(o.colors) && isColorList(o.avoid) && Array.isArray(o.tips);
}

/** 화면·출력물이 그리는 진단 — AI 결과가 있으면 그것, 없으면 고정 결과 */
interface ColorView { name: string; en: string; emoji: string; desc: string; colors: PcColor[]; avoid: PcColor[]; tips: string[]; ai: boolean }

function colorView(resultKey: string, generated: unknown): ColorView {
  if (isAiPersonalColor(generated)) {
    return { ...generated, emoji: RESULTS[generated.season].emoji, ai: true };
  }
  const d = seasonResult(resultKey);
  const named = (hex: string) => ({ hex, name: '' });
  return { name: d.name, en: d.en, emoji: d.emoji, desc: d.desc, colors: d.colors.map(named), avoid: d.avoid.map(named), tips: [], ai: false };
}

/** 진단에 쓰인 답변을 사람이 읽는 이름으로 */
function diagnosisInputs(answers: DemoAnswers) {
  const coloring = (answers['coloring'] as string[] | undefined) ?? [];
  return {
    undertone: UNDERTONES.find((t) => t.id === answers['undertone'])?.label,
    coloring: COLOR_SWATCHES.filter((c) => coloring.includes(c.id)).map((c) => c.label),
    preference: SEASON_PALETTES.find((s) => s.id === answers['preference'])?.label,
  };
}

/* ── Result Component ───────────────────────────────────── */

function ResultComponent({ resultKey, onRestart, pillarColor, generated }: DemoResultProps) {
  const tCommon = useTranslations('demos.common');
  const data = colorView(resultKey, generated);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="demo-custom-result flex flex-col items-center gap-8 text-center"
    >
      {/* Season emoji */}
      <span className="text-6xl">{data.emoji}</span>

      {/* Label */}
      <p className="demo-custom-result-eyebrow text-sm font-medium tracking-widest text-slate-400 uppercase">
        당신의 퍼스널 컬러
      </p>

      {/* Season name */}
      <div>
        <h2 className="demo-custom-result-title text-3xl font-bold" style={{ color: `var(--venue-accent, ${pillarColor})` }}>
          {data.name}
        </h2>
        <p className="mt-1 text-base text-slate-400">{data.en}</p>
      </div>

      {/* Description */}
      <p className="max-w-sm text-sm leading-relaxed text-slate-300">{data.desc}</p>

      {/* Recommended colors */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          추천 컬러 팔레트
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {data.colors.map(({ hex, name }) => (
            <div
              key={hex}
              title={name || undefined}
              className={cn(
                'h-9 w-9 rounded-full shadow-md',
                hex.toUpperCase() === '#FFFFFF' && 'border border-slate-600',
              )}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* Colors to avoid */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          함께 비교해 볼 색상
        </p>
        <div className="flex justify-center gap-3">
          {data.avoid.map(({ hex, name }) => (
            <div
              key={hex}
              title={name || undefined}
              className="h-8 w-8 rounded-full opacity-60 shadow-inner"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* 스타일링 팁 — AI 결과에만 있다 */}
      {data.tips.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            스타일링 팁
          </p>
          <ul className="space-y-2 text-left">
            {data.tips.map((tip) => (
              <li key={tip} className="demo-result-item rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-300">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.ai && (
        <p className="-mt-4 text-xs text-slate-500">직접 알려주신 취향을 바탕으로 만든 컬러 추천이에요</p>
      )}

      {/* Actions */}
      <div className="demo-legacy-result-cta flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="demo-secondary-action rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
        >
          다른 조합 찾아보기
        </motion.button>
        <Link
          href={getServiceContactHref('ai-personal-color')}
          className="demo-primary-action demo-accent-surface rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: `var(--venue-accent, ${pillarColor})` }}
        >
          {tCommon('ctaButton')}
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Print ──────────────────────────────────────────────── */

function getPrint(answers: DemoAnswers, resultKey: string, generated?: unknown): PrintSpec {
  const data = colorView(resultKey, generated);
  const inputs = diagnosisInputs(answers);
  const code = (c: PcColor) => (c.name ? `${c.hex} ${c.name}` : c.hex);
  const signature = data.colors[0]!;
  return {
    kind: 'receipt',
    eyebrow: '당신의 퍼스널 컬러',
    title: data.name,
    sections: [
      { type: 'big', title: signature.name ? `시그니처 컬러 · ${signature.name}` : '시그니처 컬러', text: signature.hex },
      { type: 'text', text: data.desc },
      {
        type: 'rows',
        title: '직접 선택한 컬러 취향',
        rows: [
          { label: '언더톤', value: inputs.undertone ?? '-' },
          { label: '눈·모발 컬러', value: inputs.coloring.join(' · ') || '-' },
          { label: '끌린 팔레트', value: inputs.preference ?? '-' },
        ],
      },
      data.ai
        ? { type: 'list', title: '추천 컬러 코드', items: data.colors.map(code) }
        : { type: 'text', title: '추천 컬러 코드', text: data.colors.map((c) => c.hex).join(' ') },
      data.ai
        ? { type: 'list', title: '함께 비교할 컬러', items: data.avoid.map(code) }
        : { type: 'text', title: '함께 비교할 컬러', text: data.avoid.map((c) => c.hex).join(' ') },
      ...(data.tips.length > 0 ? [{ type: 'list' as const, title: '스타일링 팁', items: data.tips }] : []),
    ],
    footer: '자연광 아래에서 옷장 속 컬러와 맞춰 보세요',
  };
}

/* ── AI 생성 ──────────────────────────────────────────── */

function generate(answers: DemoAnswers): Promise<AiPersonalColor | null> {
  return requestDemoAi<AiPersonalColor>(
    config.id,
    { experienceProfile: answers.experienceProfile, undertone: answers['undertone'], coloring: answers['coloring'], preference: answers['preference'] },
    { validate: isAiPersonalColor }
  );
}

/* ── Export ──────────────────────────────────────────────── */

const PersonalColorDemo: DemoModule = {
  config,
  StepComponents: [StepUndertone, StepColoring, StepPreference],
  ResultComponent,
  computeResult,
  getPrint,
  generate,
};

export default PersonalColorDemo;
