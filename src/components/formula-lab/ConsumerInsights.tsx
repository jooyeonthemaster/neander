'use client';

import { motion } from 'motion/react';
import type { ConsumerPrediction } from '@/data/formula-lab-data';
import { AGE_OPTIONS } from '@/data/formula-lab-data';

// ─── Gauge Metric ─────────────────────────────────────────────────────
function GaugeMetric({ value, label, suffix = '%', size = 'md' }: {
  value: number; label: string; suffix?: string; size?: 'sm' | 'md';
}) {
  const r = size === 'md' ? 36 : 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${size === 'md' ? 'w-24 h-24' : 'w-18 h-18'}`}>
        <svg viewBox={`0 0 ${(r + 6) * 2} ${(r + 6) * 2}`} className="w-full h-full -rotate-90">
          <circle cx={r + 6} cy={r + 6} r={r} fill="none" stroke="#f5f5f5" strokeWidth="4" />
          <motion.circle
            cx={r + 6} cy={r + 6} r={r}
            fill="none" stroke="#24adb5" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-[family-name:var(--font-display)] font-bold text-neutral-950 ${size === 'md' ? 'text-xl' : 'text-base'}`}>
            {value}<span className="text-xs font-normal text-neutral-400">{suffix}</span>
          </span>
        </div>
      </div>
      <span className={`mt-2 font-medium text-neutral-600 ${size === 'md' ? 'text-xs' : 'text-[10px]'}`}>{label}</span>
    </div>
  );
}

// ─── Horizontal Bar ───────────────────────────────────────────────────
function HBar({ value, label, color = '#24adb5', delay = 0 }: {
  value: number; label: string; color?: string; delay?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-neutral-50 rounded-md overflow-hidden relative">
        <motion.div
          className="h-full rounded-md"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: 0.5 + delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-xs font-mono font-semibold text-neutral-700 w-10 text-right">{value}%</span>
    </div>
  );
}

// ─── Main Consumer Insights Panel ─────────────────────────────────────
export function ConsumerInsightsPanel({ prediction, targetInsight }: {
  prediction: ConsumerPrediction;
  targetInsight: string;
}) {
  const ageLabels: Record<string, string> = {};
  AGE_OPTIONS.forEach(o => { ageLabels[o.value] = o.label; });

  return (
    <div className="space-y-8">
      {/* Key Metric: Preference Rate */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative">
          <div className="text-xs font-medium text-teal-200 tracking-[0.15em] uppercase mb-2">
            SOP Predicted Preference Rate
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-6xl font-[family-name:var(--font-display)] font-bold">
              {prediction.preferenceRate}
            </span>
            <span className="text-2xl font-medium text-teal-200">%</span>
          </div>
          <div className="text-sm text-teal-200">
            95% CI: {prediction.confidenceInterval[0]}% — {prediction.confidenceInterval[1]}%
          </div>
          <div className="mt-4 pt-4 border-t border-teal-500/30 text-sm text-teal-100 leading-relaxed">
            {targetInsight}
          </div>
        </div>
      </motion.div>

      {/* Gauge Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-5">
          Consumer Response Metrics
        </h4>
        <div className="grid grid-cols-4 gap-4">
          <GaugeMetric value={prediction.purchaseIntentRate} label="구매 의향" />
          <GaugeMetric value={prediction.repurchaseRate} label="재구매율" />
          <GaugeMetric value={prediction.targetAudienceMatch} label="타깃 매칭" />
          <GaugeMetric value={prediction.competitiveEdge} label="경쟁 우위" />
        </div>
      </motion.div>

      {/* Demographics */}
      <div className="grid grid-cols-2 gap-6">
        {/* Gender Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-neutral-100 rounded-xl p-5"
        >
          <h4 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-4">
            Gender Distribution
          </h4>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-neutral-700">여성</span>
                <span className="text-sm font-bold font-mono text-neutral-900">{prediction.genderBreakdown.female}%</span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.genderBreakdown.female}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-neutral-700">남성</span>
                <span className="text-sm font-bold font-mono text-neutral-900">{prediction.genderBreakdown.male}%</span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-neutral-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.genderBreakdown.male}%` }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Age Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-neutral-100 rounded-xl p-5"
        >
          <h4 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-4">
            Age Distribution
          </h4>
          <div className="space-y-2">
            {Object.entries(prediction.ageBreakdown).map(([key, value], i) => (
              <HBar key={key} label={ageLabels[key] || key} value={value} delay={i * 0.05} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Market Positioning */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-neutral-50 border border-neutral-100 rounded-xl p-5"
      >
        <h4 className="text-xs font-semibold text-neutral-400 tracking-[0.15em] uppercase mb-2">
          Market Positioning
        </h4>
        <p className="text-sm text-neutral-700 leading-relaxed">
          {prediction.marketPositioning}
        </p>
      </motion.div>
    </div>
  );
}
