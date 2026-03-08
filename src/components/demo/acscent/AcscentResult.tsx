'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { type AcscentType, ACSCENT_TYPES, AXIS_LABELS } from '@/data/acscent-types';
import { PERFUMES } from '@/data/acscent-perfumes';

interface Props {
  type: AcscentType;
  scores: Record<string, number>;
  onSelectPerfume: (id: string) => void;
  onRestart: () => void;
}

export function AcscentResult({ type, scores, onSelectPerfume, onRestart }: Props) {
  const [showAllTypes, setShowAllTypes] = useState(false);

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="mx-auto max-w-4xl">

        {/* ── Hero: Type Reveal ───────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-20 text-center">
          {/* Type badge */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="mb-8 inline-block rounded-full border border-teal-500/30 bg-teal-500/10 px-6 py-2.5"
          >
            <span className="text-sm font-medium tracking-widest text-teal-400">YOUR OLFACTORY TYPE</span>
          </motion.div>

          {/* Type code */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 font-display text-8xl font-extrabold tracking-tighter md:text-[10rem]"
            style={{ background: `linear-gradient(135deg, ${type.gradientFrom}, ${type.gradientTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            {type.code}
          </motion.h1>

          {/* Type name */}
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="mb-3 font-display text-4xl font-bold text-white md:text-5xl"
          >
            {type.name}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mb-3 font-display text-xl text-white/60"
          >
            {type.nameEn}
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="mb-8 text-base text-white/40"
          >
            &ldquo;{type.weatherName}&rdquo;
          </motion.p>
        </motion.div>

        {/* ── Type Image + Description ────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="mb-20 grid gap-10 md:grid-cols-2"
        >
          {/* Image */}
          <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/50" style={{ aspectRatio: '1' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 30% 30%, ${type.gradientFrom}40, transparent 70%)` }} />
            <Image src={type.imagePath} alt={type.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>

          {/* Description */}
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-medium tracking-widest text-teal-400">{type.tagline}</p>
            <p className="mb-8 text-lg leading-relaxed text-white/80">{type.description}</p>

            {/* Characteristics */}
            <div className="mb-8">
              <p className="mb-4 text-sm font-bold tracking-widest text-white/50">핵심 특성</p>
              <div className="space-y-3">
                {type.characteristics.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: type.color }} />
                    <p className="text-base text-white/80">{c}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-8">
              <p className="mb-4 text-sm font-bold tracking-widest text-white/50">후각적 강점</p>
              <div className="flex flex-wrap gap-2">
                {type.strengths.map((s) => (
                  <span key={s} className="rounded-full border border-neutral-700 bg-neutral-800/50 px-4 py-1.5 text-sm text-white/80">{s}</span>
                ))}
              </div>
            </div>

            {/* Recommended */}
            <div>
              <p className="mb-4 text-sm font-bold tracking-widest text-white/50">추천 향 계열</p>
              <div className="flex flex-wrap gap-2">
                {type.recommendedFamilies.map((f) => (
                  <span key={f} className="rounded-full px-4 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: type.color + '30', border: `1px solid ${type.color}50` }}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Axis Scores ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
          className="mb-20 rounded-3xl border border-neutral-800 bg-neutral-900/50 p-10"
        >
          <h3 className="mb-8 text-center font-display text-2xl font-bold text-white">4축 후각 인지 프로파일</h3>
          <div className="grid gap-8 sm:grid-cols-2">
            {(['IO', 'BG', 'LS', 'CW'] as const).map((axis) => {
              const label = AXIS_LABELS[axis];
              const score = scores[axis] ?? 0;
              const percentage = Math.min(Math.max((score + 10) / 20 * 100, 5), 95);
              return (
                <div key={axis} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/60">{label.negKo}</span>
                    <span className="text-sm font-medium text-white/60">{label.posKo}</span>
                  </div>
                  <div className="relative h-4 overflow-hidden rounded-full bg-neutral-800">
                    <motion.div
                      className="absolute left-0 top-0 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 1.5, duration: 0.8, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(to right, ${type.gradientFrom}, ${type.gradientTo})` }}
                    />
                    <div className="absolute left-1/2 top-0 h-full w-px bg-neutral-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{label.negative}</span>
                    <span className="text-sm font-bold" style={{ color: type.color }}>{type.code[['IO', 'BG', 'LS', 'CW'].indexOf(axis)]}</span>
                    <span className="text-xs text-white/40">{label.positive}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Perfume Recommendations ─────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="mb-20">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-medium tracking-widest text-teal-400">FOR YOUR TYPE</p>
            <h3 className="font-display text-3xl font-bold text-white md:text-4xl">
              <span style={{ color: type.color }}>{type.name}</span>를 위한 향수 추천
            </h3>
            <p className="mt-3 text-base text-white/50">당신의 후각 인지 유형에 맞춰 선별된 향수들입니다</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PERFUMES.map((perfume, i) => (
              <motion.button
                key={perfume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 + i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectPerfume(perfume.id)}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-left transition-all hover:border-neutral-600"
              >
                {/* Gradient preview */}
                <div className="mb-5 flex h-32 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${perfume.gradientFrom}30, ${perfume.gradientTo}30)` }}>
                  <span className="font-display text-4xl font-extrabold tracking-tight text-white/20">{perfume.brand.charAt(0)}</span>
                </div>
                <p className="text-sm text-white/40">{perfume.brand}</p>
                <p className="mb-2 font-display text-base font-bold text-white">{perfume.name}</p>
                <p className="mb-4 text-sm text-white/40">{perfume.family}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-amber-400">★</span>
                    <span className="text-sm text-white/70">{perfume.rating}</span>
                  </div>
                  <span className="text-sm text-white/40">{perfume.price}</span>
                </div>
                {/* Hover arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── All 16 Types Grid ────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}
          className="relative mb-20 rounded-3xl border border-neutral-800 bg-neutral-900/50 p-10"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium tracking-widest text-teal-400">16 TYPES</p>
              <h3 className="font-display text-2xl font-bold text-white">모든 후각 인지 유형</h3>
            </div>
            <button onClick={() => setShowAllTypes(!showAllTypes)} className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors">
              {showAllTypes ? '접기' : '모두 보기'}
            </button>
          </div>

          <div className={`grid grid-cols-4 gap-4 ${showAllTypes ? '' : 'max-h-56 overflow-hidden'}`}>
            {ACSCENT_TYPES.map((t) => {
              const isMine = t.code === type.code;
              return (
                <div
                  key={t.code}
                  className={`relative overflow-hidden rounded-xl border p-4 text-center transition-all ${
                    isMine ? 'border-teal-400/50 bg-teal-500/10 ring-1 ring-teal-400/20' : 'border-neutral-800 bg-neutral-900/30'
                  }`}
                >
                  <div className="relative mx-auto mb-3 h-14 w-14 overflow-hidden rounded-full">
                    <Image src={t.imagePath} alt={t.name} fill className="object-cover" sizes="56px" />
                  </div>
                  <p className="font-display text-sm font-bold" style={{ color: isMine ? type.color : '#94a3b8' }}>{t.code}</p>
                  <p className="text-xs text-white/50">{t.name}</p>
                  {isMine && (
                    <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-teal-400" />
                  )}
                </div>
              );
            })}
          </div>
          {!showAllTypes && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 rounded-b-3xl bg-gradient-to-t from-neutral-900/95 to-transparent" />
          )}
        </motion.div>

        {/* ── Actions ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={onRestart}
            className="text-base text-white/40 transition-colors hover:text-white/70"
          >
            다시 검사하기
          </button>
        </motion.div>
      </div>
    </div>
  );
}
