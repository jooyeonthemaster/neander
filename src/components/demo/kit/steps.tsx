'use client';

/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — step builders
   각 데모가 스텝을 데이터로 선언할 수 있게 하는 빌더 모음.
   defineDemo({ config, steps: [cameraStep(...), choiceStep(...)], ... })
   ───────────────────────────────────────────────────────── */

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type {
  DemoAnswers,
  DemoConfig,
  DemoModule,
  DemoResultProps,
  DemoStepMeta,
  DemoStepProps,
} from '@/types/demo';
import { getChoices, getFields } from './core';
import { createCameraStep, type CameraStepOptions } from './CameraStep';
import { createMicStep, type MicStepOptions } from './MicStep';
import type { PrintSpec } from './print';

export interface DemoStepDef {
  meta: DemoStepMeta;
  Component: React.ComponentType<DemoStepProps>;
}

interface StepCopy {
  id: string;
  title: string;
  subtitle?: string;
}

export function defineDemo(opts: {
  config: Omit<DemoConfig, 'steps'>;
  steps: DemoStepDef[];
  computeResult: (answers: DemoAnswers) => string;
  Result: React.ComponentType<DemoResultProps>;
  /** 결과 출력물 — 영수증(receipt) 또는 4×6 인화 사진(photo) */
  print?: (answers: DemoAnswers, resultKey: string) => PrintSpec;
}): DemoModule {
  return {
    config: { ...opts.config, steps: opts.steps.map((s) => s.meta) },
    StepComponents: opts.steps.map((s) => s.Component),
    ResultComponent: opts.Result,
    computeResult: opts.computeResult,
    getPrint: opts.print,
  };
}

/* ── Camera / Mic ─────────────────────────────────────── */

export function cameraStep(opts: StepCopy & Omit<CameraStepOptions, 'id'>): DemoStepDef {
  return {
    meta: {
      id: opts.id,
      titleKey: opts.title,
      subtitleKey: opts.subtitle ?? '',
      canProceed: (a) => !!a[opts.id],
    },
    Component: createCameraStep(opts),
  };
}

export function micStep(opts: StepCopy & Omit<MicStepOptions, 'id'>): DemoStepDef {
  return {
    meta: {
      id: opts.id,
      titleKey: opts.title,
      subtitleKey: opts.subtitle ?? '',
      canProceed: (a) => !!a[opts.id],
    },
    Component: createMicStep(opts),
  };
}

/* ── Choice ───────────────────────────────────────────── */

export interface ChoiceOption {
  id: string;
  label: string;
  desc?: string;
  emoji?: string;
  /** 옵션 상단 색 미리보기 (CSS background 값) */
  swatch?: string;
}

const GRID_COLS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export function choiceStep(
  opts: StepCopy & {
    options: ChoiceOption[];
    columns?: 2 | 3 | 4;
    /** 다중 선택 — 최소/최대 개수 */
    multi?: { min?: number; max: number };
  }
): DemoStepDef {
  const min = opts.multi?.min ?? 1;

  function ChoiceStepComponent({ answers, onUpdate }: DemoStepProps) {
    const selected = opts.multi ? getChoices(answers, opts.id) : [answers[opts.id] as string | undefined];

    const toggle = (id: string) => {
      if (!opts.multi) {
        onUpdate(opts.id, id);
        return;
      }
      const current = getChoices(answers, opts.id);
      if (current.includes(id)) onUpdate(opts.id, current.filter((c) => c !== id));
      else if (current.length < opts.multi.max) onUpdate(opts.id, [...current, id]);
    };

    return (
      <div>
        {opts.multi && (
          <p className="mb-4 text-center text-xs text-slate-500">
            최대 {opts.multi.max}개 선택 · <span className="text-teal-400">{getChoices(answers, opts.id).length}</span>/
            {opts.multi.max}
          </p>
        )}
        <div className={cn('grid gap-3 sm:gap-4', GRID_COLS[opts.columns ?? 2])}>
          {opts.options.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <motion.button
                key={option.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(option.id)}
                aria-pressed={isSelected}
                className={cn(
                  'relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border p-4 text-center transition-colors sm:p-5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                  isSelected
                    ? 'border-teal-400 bg-teal-500/10 ring-1 ring-teal-400/40'
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                )}
              >
                {option.swatch && (
                  <span
                    className="mb-1 h-10 w-full rounded-lg border border-white/10"
                    style={{ background: option.swatch }}
                    aria-hidden="true"
                  />
                )}
                {option.emoji && <span className="text-3xl leading-none">{option.emoji}</span>}
                <span className="text-sm font-semibold text-slate-100 sm:text-base">{option.label}</span>
                {option.desc && <span className="text-xs leading-relaxed text-slate-400">{option.desc}</span>}
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-slate-950">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }
  ChoiceStepComponent.displayName = `ChoiceStep(${opts.id})`;

  return {
    meta: {
      id: opts.id,
      titleKey: opts.title,
      subtitleKey: opts.subtitle ?? '',
      canProceed: (a) => (opts.multi ? getChoices(a, opts.id).length >= min : !!a[opts.id]),
    },
    Component: ChoiceStepComponent,
  };
}

/* ── Text ─────────────────────────────────────────────── */

export interface TextField {
  id: string;
  label: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  optional?: boolean;
}

export function textStep(opts: StepCopy & { fields: TextField[] }): DemoStepDef {
  function TextStepComponent({ answers, onUpdate }: DemoStepProps) {
    const values = getFields<string>(answers, opts.id);
    const update = (fieldId: string, value: string) => onUpdate(opts.id, { ...values, [fieldId]: value });

    return (
      <div className="mx-auto max-w-md space-y-4">
        {opts.fields.map((field) => {
          const inputId = `${opts.id}-${field.id}`;
          const common = {
            id: inputId,
            value: values[field.id] ?? '',
            placeholder: field.placeholder,
            maxLength: field.maxLength ?? 40,
            className:
              'w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-colors focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400',
          };
          return (
            <div key={field.id} className="text-left">
              <label htmlFor={inputId} className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-400">
                <span>
                  {field.label}
                  {field.optional && <span className="ml-1 text-slate-600">(선택)</span>}
                </span>
                <span className="text-slate-600">
                  {(values[field.id] ?? '').length}/{field.maxLength ?? 40}
                </span>
              </label>
              {field.multiline ? (
                <textarea {...common} rows={3} onChange={(e) => update(field.id, e.target.value)} className={cn(common.className, 'resize-none')} />
              ) : (
                <input {...common} type="text" onChange={(e) => update(field.id, e.target.value)} />
              )}
            </div>
          );
        })}
      </div>
    );
  }
  TextStepComponent.displayName = `TextStep(${opts.id})`;

  return {
    meta: {
      id: opts.id,
      titleKey: opts.title,
      subtitleKey: opts.subtitle ?? '',
      canProceed: (a) => {
        const values = getFields<string>(a, opts.id);
        return opts.fields.every((f) => f.optional || (values[f.id] ?? '').trim().length > 0);
      },
    },
    Component: TextStepComponent,
  };
}

/* ── Slider ───────────────────────────────────────────── */

export interface SliderField {
  id: string;
  label: string;
  /** 0 쪽 라벨 */
  left: string;
  /** 100 쪽 라벨 */
  right: string;
  emoji?: string;
  defaultValue?: number;
}

export function sliderStep(opts: StepCopy & { sliders: SliderField[] }): DemoStepDef {
  function SliderStepComponent({ answers, onUpdate }: DemoStepProps) {
    const values = getFields<number>(answers, opts.id);
    const hasValues = Object.keys(values).length > 0;

    // 처음 들어오면 기본값을 채워서 바로 다음으로 넘어갈 수 있게 한다
    useEffect(() => {
      if (hasValues) return;
      onUpdate(opts.id, Object.fromEntries(opts.sliders.map((s) => [s.id, s.defaultValue ?? 50])));
    }, [hasValues, onUpdate]);

    return (
      <div className="mx-auto max-w-md space-y-7">
        {opts.sliders.map((slider) => {
          const value = values[slider.id] ?? slider.defaultValue ?? 50;
          const inputId = `${opts.id}-${slider.id}`;
          return (
            <div key={slider.id}>
              <label htmlFor={inputId} className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-100">
                  {slider.emoji && <span className="mr-1.5">{slider.emoji}</span>}
                  {slider.label}
                </span>
                <span className="font-mono text-xs text-teal-300">{value}</span>
              </label>
              <input
                id={inputId}
                type="range"
                min={0}
                max={100}
                step={5}
                value={value}
                onChange={(e) => onUpdate(opts.id, { ...values, [slider.id]: Number(e.target.value) })}
                className="w-full cursor-pointer accent-teal-400"
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
                <span>{slider.left}</span>
                <span>{slider.right}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  SliderStepComponent.displayName = `SliderStep(${opts.id})`;

  return {
    meta: {
      id: opts.id,
      titleKey: opts.title,
      subtitleKey: opts.subtitle ?? '',
      canProceed: (a) => Object.keys(getFields(a, opts.id)).length > 0,
    },
    Component: SliderStepComponent,
  };
}
