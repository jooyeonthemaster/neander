'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFormulaLabStore } from '@/stores/formulaLabStore';
import { PROCESSING_STAGES } from '@/data/formula-lab-data';

// ─── Animated Counter ─────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    const steps = Math.ceil(duration / 16);
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (step >= steps) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

// ─── Neural Network Visualization ─────────────────────────────────────
function NeuralGrid({ stage }: { stage: number }) {
  const nodes = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 15 + (i % 6) * 14,
      y: 20 + Math.floor(i / 6) * 20,
      delay: (i % 6) * 0.1 + Math.floor(i / 6) * 0.15,
    })), []);

  const connections = useMemo(() => {
    const conns: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
    nodes.forEach((n, i) => {
      if (i % 6 < 5) conns.push({ x1: n.x, y1: n.y, x2: nodes[i + 1].x, y2: nodes[i + 1].y, delay: n.delay });
      if (i + 6 < nodes.length) conns.push({ x1: n.x, y1: n.y, x2: nodes[i + 6].x, y2: nodes[i + 6].y, delay: n.delay + 0.05 });
    });
    return conns;
  }, [nodes]);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
      {/* Connections */}
      {connections.map((c, i) => (
        <motion.line
          key={`c-${i}`}
          x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
          stroke="rgba(36,173,181,0.12)"
          strokeWidth="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, stroke: ['rgba(36,173,181,0.08)', 'rgba(36,173,181,0.25)', 'rgba(36,173,181,0.08)'] }}
          transition={{ duration: 2.5, delay: c.delay + stage * 0.3, repeat: Infinity, repeatType: 'reverse' }}
        />
      ))}
      {/* Nodes */}
      {nodes.map(n => (
        <motion.circle
          key={`n-${n.id}`}
          cx={n.x} cy={n.y} r="0.8"
          fill="rgba(36,173,181,0.3)"
          initial={{ scale: 0 }}
          animate={{
            scale: [1, 1.8, 1],
            fill: ['rgba(36,173,181,0.2)', 'rgba(36,173,181,0.6)', 'rgba(36,173,181,0.2)'],
          }}
          transition={{ duration: 2, delay: n.delay + stage * 0.2, repeat: Infinity }}
        />
      ))}
      {/* Active pulse at center */}
      <motion.circle
        cx="50" cy="50" r="8"
        fill="none"
        stroke="rgba(36,173,181,0.3)"
        strokeWidth="0.5"
        style={{ transformOrigin: '50px 50px' }}
        animate={{ scale: [0.4, 1.5, 0.4], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </svg>
  );
}

// ─── Processing Metrics ───────────────────────────────────────────────
function StageMetrics({ stage, progress }: { stage: number; progress: number }) {
  const metrics: Record<number, { label: string; value: number; unit: string }[]> = {
    0: [
      { label: '감성 키워드 추출', value: Math.min(Math.floor(progress / 14), 7), unit: '개' },
      { label: 'OPT-16 벡터 차원', value: progress >= 80 ? 16 : Math.floor(progress / 6), unit: 'D' },
    ],
    1: [
      { label: '배합 후보 생성', value: Math.floor(progress * 8.5), unit: '개' },
      { label: '잠재 공간 탐색', value: Math.min(progress, 100), unit: '%' },
    ],
    2: [
      { label: '성분 페어 검증', value: Math.floor(progress * 12.4), unit: '건' },
      { label: '검증 통과', value: Math.floor(progress * 0.28), unit: '개' },
    ],
    3: [
      { label: 'IFRA 규제 적합', value: progress >= 60 ? 100 : Math.floor(progress * 1.67), unit: '%' },
      { label: '원가 최적화', value: progress >= 80 ? 100 : Math.floor(progress * 1.25), unit: '%' },
    ],
    4: [
      { label: '가상 패널 수', value: Math.floor(progress * 100), unit: '명' },
      { label: '시뮬레이션 라운드', value: Math.floor(progress * 2.5), unit: '회' },
    ],
  };

  const items = metrics[stage] || [];

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map(m => (
        <div key={m.label} className="bg-neutral-50 rounded-xl px-5 py-4 border border-neutral-100">
          <div className="text-xs text-neutral-400 font-medium mb-1">{m.label}</div>
          <div className="text-2xl font-[family-name:var(--font-display)] font-bold text-neutral-950">
            <AnimatedNumber value={m.value} />
            <span className="text-sm font-normal text-neutral-400 ml-1">{m.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Processing View ─────────────────────────────────────────────
export function ProcessingView() {
  const { processingStage, processingProgress } = useFormulaLabStore();
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsedSec(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStage = PROCESSING_STAGES[processingStage] || PROCESSING_STAGES[0];
  const overallProgress = ((processingStage * 100 + processingProgress) / (PROCESSING_STAGES.length * 100)) * 100;

  // SVG arc for circular progress
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (processingProgress / 100) * circumference;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Neural Grid Background */}
      <div className="absolute inset-0 opacity-40">
        <NeuralGrid stage={processingStage} />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 max-w-2xl w-full px-8">
        {/* Circular Progress */}
        <div className="flex justify-center mb-12">
          <div className="relative w-56 h-56">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              {/* Track */}
              <circle cx="100" cy="100" r={radius} fill="none" stroke="#f5f5f5" strokeWidth="3" />
              {/* Progress */}
              <motion.circle
                cx="100" cy="100" r={radius}
                fill="none"
                stroke="#24adb5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={processingProgress}
                className="text-4xl font-[family-name:var(--font-display)] font-bold text-neutral-950"
              >
                {processingProgress}
                <span className="text-lg font-normal text-neutral-400">%</span>
              </motion.div>
              <div className="text-xs text-neutral-400 font-medium mt-1">
                Stage {processingStage + 1}/{PROCESSING_STAGES.length}
              </div>
            </div>
          </div>
        </div>

        {/* Stage Info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={processingStage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase">{currentStage.module}</span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-neutral-950 mb-2">
              {currentStage.nameKo}
            </h2>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              {currentStage.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Stage Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <StageMetrics stage={processingStage} progress={processingProgress} />
        </motion.div>

        {/* Overall Progress Bar */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">Overall Progress</span>
            <span className="text-xs text-neutral-400 font-mono">{elapsedSec}s elapsed</span>
          </div>
          <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-teal-500 rounded-full"
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {/* Stage labels */}
          <div className="flex mt-4 gap-1">
            {PROCESSING_STAGES.map((s, i) => (
              <div key={s.id} className="flex-1 flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  i < processingStage ? 'bg-teal-500 text-white'
                    : i === processingStage ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500'
                    : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {i < processingStage ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-medium hidden lg:block ${
                  i <= processingStage ? 'text-neutral-700' : 'text-neutral-300'
                }`}>
                  {s.module}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
