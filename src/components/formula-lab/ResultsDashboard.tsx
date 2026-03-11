'use client';

import { motion } from 'motion/react';
import { useFormulaLabStore } from '@/stores/formulaLabStore';
import { EMOTION_TYPES, USAGE_OPTIONS, AGE_OPTIONS } from '@/data/formula-lab-data';
import { EmotionBarChart, EmotionRadarChart, DominantEmotionCards } from './EmotionChart';
import { FormulaCard } from './FormulaCard';
import { ConsumerInsightsPanel } from './ConsumerInsights';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
});

export function ResultsDashboard() {
  const { brief, results, selectedFormulaId, selectFormula } = useFormulaLabStore();

  if (!brief || !results) return null;

  const ageLabel = AGE_OPTIONS.find(o => o.value === brief.targetAge)?.label || brief.targetAge;
  const usageLabel = USAGE_OPTIONS.find(o => o.value === brief.usageContext)?.label || brief.usageContext;
  const genderLabel = { female: '여성', male: '남성', unisex: '유니섹스' }[brief.targetGender];
  const topEmotion = EMOTION_TYPES[results.dominantEmotions[0]?.typeId];

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* ── Dashboard Header ── */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          <motion.div {...fadeUp(0.1)}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-teal-500" />
              <span className="text-xs font-medium text-teal-600 tracking-[0.2em] uppercase">
                Analysis Complete
              </span>
              <span className="text-xs text-neutral-300 ml-2">
                {results.processingTimeSec}s · {results.totalCandidatesGenerated.toLocaleString()} candidates evaluated
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-neutral-950 mb-3">
              {brief.brandName || 'Untitled Project'}
              <span className="text-neutral-300 font-normal ml-3">Formula Report</span>
            </h1>
            <p className="text-neutral-500 max-w-2xl leading-relaxed">
              &ldquo;{brief.emotionalDescription}&rdquo;
            </p>
          </motion.div>

          {/* Summary Stats */}
          <motion.div {...fadeUp(0.2)} className="grid grid-cols-6 gap-4 mt-8">
            {[
              { label: 'Target', value: `${ageLabel} ${genderLabel}` },
              { label: 'Context', value: usageLabel },
              { label: 'Budget', value: brief.budgetLevel.charAt(0).toUpperCase() + brief.budgetLevel.slice(1) },
              { label: 'Dominant', value: topEmotion?.nameKo || '—' },
              { label: 'Candidates', value: results.totalCandidatesGenerated.toLocaleString() },
              { label: 'Preference', value: `${results.consumerPrediction.preferenceRate}%` },
            ].map(s => (
              <div key={s.label} className="bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                <div className="text-[10px] font-semibold text-neutral-400 tracking-[0.1em] uppercase">{s.label}</div>
                <div className="text-sm font-bold text-neutral-950 mt-0.5">{s.value}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Main Dashboard Grid ── */}
      <div className="max-w-[1400px] mx-auto px-8 py-10">
        <div className="grid grid-cols-12 gap-8">

          {/* ── Left Column: Emotion Analysis ── */}
          <div className="col-span-5 space-y-8">
            {/* Section: OPT-16 Emotion Profile */}
            <motion.section {...fadeUp(0.3)} className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase">
                    OPT-16 Emotion Profile
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">감성 브리프의 16차원 벡터 분석 결과</p>
                </div>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                  OPT-16
                </span>
              </div>
              <EmotionRadarChart vector={results.emotionVector} />
            </motion.section>

            {/* Section: Dominant Emotions */}
            <motion.section {...fadeUp(0.4)}>
              <h2 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-4">
                Dominant Emotion Types
              </h2>
              <DominantEmotionCards emotions={results.dominantEmotions} />
            </motion.section>

            {/* Section: Full Emotion Bars */}
            <motion.section {...fadeUp(0.5)} className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-5">
                Full Emotion Spectrum
              </h2>
              <EmotionBarChart vector={results.emotionVector} maxBars={16} />
            </motion.section>

            {/* Pipeline Summary */}
            <motion.section {...fadeUp(0.6)} className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-5">
                AI Pipeline Summary
              </h2>
              <div className="space-y-3">
                {[
                  { module: 'CVAE-PA', label: '배합 후보 생성', value: `${results.totalCandidatesGenerated}개` },
                  { module: 'CINN', label: '상호작용 검증 통과', value: `${results.candidatesAfterCINN}개` },
                  { module: 'BO-OC', label: '제약 조건 최적화', value: `${results.candidatesAfterBOOC}개` },
                  { module: 'SOP', label: '가상 소비자 시뮬레이션', value: '10,000명' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded font-mono w-16 text-center shrink-0">
                      {item.module}
                    </span>
                    <span className="text-sm text-neutral-600 flex-1">{item.label}</span>
                    <span className="text-sm font-bold font-mono text-neutral-900">{item.value}</span>
                    {i < 3 && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#24adb5" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Total Processing Time</span>
                <span className="text-sm font-bold font-mono text-neutral-900">{results.processingTimeSec}s</span>
              </div>
            </motion.section>
          </div>

          {/* ── Right Column: Formulas + Consumer Insights ── */}
          <div className="col-span-7 space-y-8">
            {/* Section: Formula Recommendations */}
            <motion.section {...fadeUp(0.35)}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase">
                    AI-Generated Formulas
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    CVAE-PA + CINN + BO-OC 파이프라인으로 최적화된 배합 3종
                  </p>
                </div>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                  {results.formulas.length} Formulas
                </span>
              </div>
              <div className="space-y-4">
                {results.formulas.map(formula => (
                  <FormulaCard
                    key={formula.id}
                    formula={formula}
                    isSelected={selectedFormulaId === formula.id}
                    onSelect={() => selectFormula(formula.id)}
                  />
                ))}
              </div>
            </motion.section>

            {/* Section: Consumer Insights */}
            <motion.section {...fadeUp(0.5)}>
              <div className="mb-5">
                <h2 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase">
                  Consumer Prediction (SOP)
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  가상 소비자 10,000명 기반 몬테카를로 시뮬레이션 결과
                </p>
              </div>
              <ConsumerInsightsPanel
                prediction={results.consumerPrediction}
                targetInsight={results.targetInsight}
              />
            </motion.section>

            {/* Section: Actions */}
            <motion.section {...fadeUp(0.7)} className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-5">
                Next Steps
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center gap-3 px-5 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-500 transition-colors cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  <div className="text-left">
                    <div className="text-sm font-semibold">리포트 다운로드</div>
                    <div className="text-xs text-teal-200">PDF 형식 상세 보고서</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 px-5 py-4 bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-sm font-semibold">시제품 요청</div>
                    <div className="text-xs text-neutral-400">선택된 배합으로 제조 의뢰</div>
                  </div>
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-4 text-center">
                시제품 제조는 10-50ml 소량 제조(자체 공방) 또는 대량 양산(AROKOR OEM) 중 선택 가능합니다.
              </p>
            </motion.section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Powered by ONSCENT AI Pipeline</span>
            <span className="text-neutral-200">·</span>
            <span>OPT-16 · CVAE-PA · CINN · BO-OC · SOP</span>
          </div>
          <span className="text-xs text-neutral-300">
            This report is generated by AI simulation and should be validated with physical testing.
          </span>
        </div>
      </div>
    </div>
  );
}
