'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TEST_FRAGRANCES, type TestFragrance, type NoteOption } from '@/data/acscent-types';

interface Props {
  onComplete: (scores: Record<string, number>) => void;
}

interface FragranceAnswers {
  notes: string[];
  cardIndex: number | null;
  intensity: number;
  temperature: number;
}

const INITIAL_ANSWERS: FragranceAnswers = { notes: [], cardIndex: null, intensity: 50, temperature: 50 };

export function AcscentTestFlow({ onComplete }: Props) {
  const [fragranceIdx, setFragranceIdx] = useState(0);
  const [answers, setAnswers] = useState<FragranceAnswers>({ ...INITIAL_ANSWERS });
  const [axisScores, setAxisScores] = useState<Record<string, number>>({ IO: 0, BG: 0, LS: 0, CW: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const fragrance = TEST_FRAGRANCES[fragranceIdx];
  const progress = ((fragranceIdx + 1) / TEST_FRAGRANCES.length) * 100;
  const canProceed = answers.notes.length > 0 && answers.cardIndex !== null;
  const isLast = fragranceIdx === TEST_FRAGRANCES.length - 1;

  const handleNoteToggle = useCallback((label: string) => {
    setAnswers((prev) => ({
      ...prev,
      notes: prev.notes.includes(label)
        ? prev.notes.filter((l) => l !== label)
        : [...prev.notes, label],
    }));
  }, []);

  const handleCardSelect = useCallback((index: number) => {
    setAnswers((prev) => ({ ...prev, cardIndex: index }));
  }, []);

  const handleIntensity = useCallback((v: number) => {
    setAnswers((prev) => ({ ...prev, intensity: v }));
  }, []);

  const handleTemperature = useCallback((v: number) => {
    setAnswers((prev) => ({ ...prev, temperature: v }));
  }, []);

  const handleNext = useCallback(() => {
    if (!canProceed) return;

    const noteOptions = fragrance.questions[0].noteOptions ?? [];
    let concreteCount = 0;
    let abstractCount = 0;
    for (const label of answers.notes) {
      const opt = noteOptions.find((n) => n.label === label);
      if (opt?.category === 'concrete') concreteCount++;
      else if (opt?.category === 'abstract') abstractCount++;
    }
    const totalSelected = answers.notes.length;
    const bgFromNotes = (totalSelected - 4) * 0.5;
    const lsScore = totalSelected > 0 ? ((abstractCount - concreteCount) / totalSelected) * 2 : 0;

    let ioScore = 0;
    if (answers.cardIndex !== null) {
      const opt = fragrance.questions[1].options?.[answers.cardIndex];
      if (opt?.scores.IO !== undefined) ioScore = opt.scores.IO;
    }

    const bgFromIntensity = ((answers.intensity - 50) / 50) * 2;
    const cwScore = ((answers.temperature - 50) / 50) * 2;

    const newScores = {
      IO: axisScores.IO + ioScore,
      BG: axisScores.BG + bgFromNotes + bgFromIntensity,
      LS: axisScores.LS + lsScore,
      CW: axisScores.CW + cwScore,
    };

    if (isLast) {
      onComplete(newScores);
      return;
    }

    setAxisScores(newScores);
    setAnswers({ ...INITIAL_ANSWERS });
    setFragranceIdx((i) => i + 1);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [canProceed, fragrance, answers, axisScores, isLast, onComplete]);

  return (
    <div ref={scrollRef} className="min-h-screen overflow-y-auto">
      {/* ── Sticky Header ──────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{fragrance.icon}</span>
            <div>
              <p className="text-sm text-white/50">시향지 {fragrance.id}/6</p>
              <p className="font-display text-base font-bold text-white">{fragrance.nameKo}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-white/50">{fragranceIdx + 1} / {TEST_FRAGRANCES.length}</p>
        </div>
        <div className="mx-auto mt-3 max-w-2xl">
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            {TEST_FRAGRANCES.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i < fragranceIdx ? 'bg-teal-400' : i === fragranceIdx ? 'bg-teal-400 ring-2 ring-teal-400/30 ring-offset-1 ring-offset-neutral-950' : 'bg-neutral-700'
                  }`}
                />
                {i < TEST_FRAGRANCES.length - 1 && (
                  <div className={`h-px w-4 ${i < fragranceIdx ? 'bg-teal-400/40' : 'bg-neutral-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={fragranceIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl px-6 py-10"
        >
          <FragranceIntro fragrance={fragrance} />

          <Section num="01" title="향 인지" subtitle="이 향에서 감지되는 것들을 모두 선택해주세요" delay={0.1}>
            <NoteSelection
              options={fragrance.questions[0].noteOptions ?? []}
              selected={answers.notes}
              onToggle={handleNoteToggle}
              gradientFrom={fragrance.gradientFrom}
              gradientTo={fragrance.gradientTo}
            />
          </Section>

          <Section num="02" title="인지 방식" subtitle="이 향을 맡을 때, 가장 먼저 일어나는 반응은?" delay={0.2}>
            <CardSelection
              options={fragrance.questions[1].options ?? []}
              selectedIndex={answers.cardIndex}
              onSelect={handleCardSelect}
            />
          </Section>

          <Section num="03" title="강도 인지" subtitle="이 향의 전체적 강도는 어떻게 느껴지나요?" delay={0.3}>
            <SpectrumSlider
              labels={['거의 느끼지 못함', '매우 강렬하게 느낌']}
              value={answers.intensity}
              onChange={handleIntensity}
              gradientFrom={fragrance.gradientFrom}
              gradientTo={fragrance.gradientTo}
            />
          </Section>

          <Section num="04" title="온도 인지" subtitle="이 향에서 느껴지는 온도감은?" delay={0.4}>
            <SpectrumSlider
              labels={['매우 차갑게 느껴짐', '매우 따뜻하게 느껴짐']}
              value={answers.temperature}
              onChange={handleTemperature}
              gradientFrom={fragrance.gradientFrom}
              gradientTo={fragrance.gradientTo}
            />
          </Section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex justify-center pb-16"
          >
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`rounded-full px-12 py-4 font-display text-lg font-bold text-white shadow-lg transition-all ${
                canProceed
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.97]'
                  : 'cursor-not-allowed bg-neutral-700 opacity-40 shadow-none'
              }`}
            >
              {isLast ? '분석하기' : `다음 시향지 →`}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Section Wrapper ──────────────────────────────────── */
function Section({ num, title, subtitle, delay, children }: {
  num: string; title: string; subtitle: string; delay: number; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="mb-14"
    >
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-display text-sm font-bold text-teal-400/60">{num}</span>
        <h3 className="font-display text-2xl font-bold text-white">{title}</h3>
      </div>
      <p className="mb-6 text-base text-white/60">{subtitle}</p>
      {children}
    </motion.div>
  );
}

/* ── Fragrance Intro Card ─────────────────────────────── */
function FragranceIntro({ fragrance }: { fragrance: TestFragrance }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-14"
    >
      <div
        className="relative overflow-hidden rounded-3xl p-10 text-center"
        style={{ background: `linear-gradient(135deg, ${fragrance.gradientFrom}15, ${fragrance.gradientTo}15)` }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at 50% 30%, ${fragrance.gradientFrom}40, transparent 70%)` }}
        />
        <div className="relative">
          <span className="mb-4 inline-block text-6xl">{fragrance.icon}</span>
          <p className="mb-1 text-sm font-medium tracking-widest text-white/40">STRIP #{fragrance.id}</p>
          <p className="font-display text-2xl font-bold text-white">{fragrance.nameKo}</p>
          <p className="mb-4 font-display text-base text-white/50">{fragrance.name}</p>
          <p className="text-base leading-relaxed text-white/70">{fragrance.description}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[...fragrance.notes.top, ...fragrance.notes.middle.slice(0, 1)].map((note) => (
              <span key={note} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70">{note}</span>
            ))}
          </div>
          <p className="mt-6 text-sm text-white/40">지금 시향지 #{fragrance.id}을 맡아보세요</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Note Selection (multi-select chips) ──────────────── */
function NoteSelection({ options, selected, onToggle, gradientFrom, gradientTo }: {
  options: NoteOption[];
  selected: string[];
  onToggle: (label: string) => void;
  gradientFrom: string;
  gradientTo: string;
}) {
  const concreteOpts = options.filter((o) => o.category === 'concrete');
  const abstractOpts = options.filter((o) => o.category === 'abstract');

  return (
    <div className="space-y-8">
      {/* Concrete */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="text-sm font-medium text-white/40">어떤 냄새가 나나요?</span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {concreteOpts.map((opt) => {
            const isSelected = selected.includes(opt.label);
            return (
              <button
                key={opt.label}
                onClick={() => onToggle(opt.label)}
                className={`rounded-full border px-5 py-2.5 text-base font-medium transition-all ${
                  isSelected
                    ? 'border-teal-400/50 bg-teal-500/15 text-teal-300 shadow-lg shadow-teal-500/10'
                    : 'border-neutral-700 bg-neutral-800/50 text-white/80 hover:border-neutral-500'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isSelected && (
                    <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Abstract */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="text-sm font-medium text-white/40">어떤 느낌이 드나요?</span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {abstractOpts.map((opt) => {
            const isSelected = selected.includes(opt.label);
            return (
              <button
                key={opt.label}
                onClick={() => onToggle(opt.label)}
                className={`rounded-full border px-5 py-2.5 text-base font-medium transition-all ${
                  isSelected
                    ? 'text-white shadow-lg'
                    : 'border-neutral-700 bg-neutral-800/50 text-white/80 hover:border-neutral-500'
                }`}
                style={isSelected ? {
                  borderColor: `${gradientFrom}60`,
                  background: `linear-gradient(135deg, ${gradientFrom}20, ${gradientTo}20)`,
                  boxShadow: `0 4px 15px ${gradientFrom}15`,
                } : undefined}
              >
                <span className="flex items-center gap-2">
                  {isSelected && (
                    <svg className="h-4 w-4" style={{ color: gradientFrom }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <div className="flex gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-2 w-5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i < selected.length ? gradientFrom : '#27272a' }}
            />
          ))}
        </div>
        <span className="text-sm text-white/50">{selected.length}개 선택</span>
      </div>
    </div>
  );
}

/* ── Card Selection ───────────────────────────────────── */
function CardSelection({ options, selectedIndex, onSelect }: {
  options: { label: string; emoji: string; description: string; scores: Partial<Record<'IO' | 'BG' | 'LS' | 'CW', number>> }[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((opt, i) => {
        const isSelected = selectedIndex === i;
        return (
          <button
            key={opt.label}
            onClick={() => onSelect(i)}
            className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all ${
              isSelected
                ? 'border-teal-400/50 bg-teal-500/10 shadow-lg shadow-teal-500/10'
                : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'
            }`}
          >
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/5" />
            )}
            <div className="relative">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-3xl">{opt.emoji}</span>
                <span className={`font-display text-base font-bold ${isSelected ? 'text-teal-300' : 'text-white'}`}>{opt.label}</span>
              </div>
              <p className="text-sm leading-relaxed text-white/60">{opt.description}</p>
            </div>
            {isSelected && (
              <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-teal-400">
                <svg className="h-3.5 w-3.5 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Spectrum Slider ──────────────────────────────────── */
function SpectrumSlider({ labels, value, onChange, gradientFrom, gradientTo }: {
  labels: [string, string];
  value: number;
  onChange: (val: number) => void;
  gradientFrom: string;
  gradientTo: string;
}) {
  const barCount = 20;
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 flex items-end justify-center gap-1">
        {Array.from({ length: barCount }).map((_, i) => {
          const barProgress = i / (barCount - 1);
          const isActive = barProgress <= value / 100;
          const height = 20 + Math.sin(barProgress * Math.PI) * 40 + (isActive ? (value / 100) * 20 : 0);
          return (
            <div
              key={i}
              className="w-2.5 rounded-full transition-all duration-300"
              style={{
                height,
                opacity: isActive ? 1 : 0.2,
                backgroundColor: isActive ? gradientFrom : '#27272a',
              }}
            />
          );
        })}
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="acscent-slider w-full cursor-pointer appearance-none bg-transparent"
        />
        <div
          className="pointer-events-none absolute -top-9 rounded-lg px-3 py-1.5 text-sm font-bold"
          style={{ left: `${value}%`, transform: 'translateX(-50%)', background: gradientFrom, color: '#fff' }}
        >
          {value}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-white/50">{labels[0]}</span>
        <span className="text-sm text-white/50">{labels[1]}</span>
      </div>

      <style jsx>{`
        .acscent-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, ${gradientFrom}, ${gradientTo});
          opacity: 0.3;
        }
        .acscent-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${gradientFrom};
          border: 3px solid white;
          margin-top: -11px;
          cursor: pointer;
          box-shadow: 0 0 20px ${gradientFrom}40;
        }
        .acscent-slider::-moz-range-track {
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, ${gradientFrom}, ${gradientTo});
          opacity: 0.3;
        }
        .acscent-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${gradientFrom};
          border: 3px solid white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
