'use client';

import { motion } from 'motion/react';
import { EMOTION_TYPES, type EmotionScore } from '@/data/formula-lab-data';

// ─── Horizontal Bar Chart ─────────────────────────────────────────────
export function EmotionBarChart({ vector, maxBars = 8 }: { vector: EmotionScore[]; maxBars?: number }) {
  const sorted = [...vector].sort((a, b) => b.score - a.score).slice(0, maxBars);
  const maxScore = sorted[0]?.score || 1;

  return (
    <div className="space-y-3">
      {sorted.map((em, i) => {
        const type = EMOTION_TYPES[em.typeId];
        return (
          <motion.div
            key={em.typeId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="w-20 flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-neutral-400">
                T{String(type.id).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-neutral-700 truncate">
                {type.nameKo}
              </span>
            </div>
            <div className="flex-1 h-6 bg-neutral-50 rounded-md overflow-hidden relative">
              <motion.div
                className="h-full rounded-md"
                style={{ backgroundColor: type.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(em.score / maxScore) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold font-mono text-neutral-500">
                {em.score}%
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Radar Chart (SVG) ────────────────────────────────────────────────
export function EmotionRadarChart({ vector }: { vector: EmotionScore[] }) {
  const sorted = [...vector].sort((a, b) => b.score - a.score).slice(0, 6);
  const size = 200;
  const center = size / 2;
  const maxRadius = 75;
  const count = sorted.length;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  // Grid rings
  const rings = [25, 50, 75, 100];
  const gridPaths = rings.map(pct => {
    const points = Array.from({ length: count }, (_, i) => getPoint(i, pct));
    return points.map(p => `${p.x},${p.y}`).join(' ');
  });

  // Data path
  const dataPoints = sorted.map((em, i) => getPoint(i, em.score * (100 / (sorted[0]?.score || 1))));
  const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-64 h-64">
        {/* Grid rings */}
        {gridPaths.map((path, i) => (
          <polygon key={i} points={path} fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
        ))}
        {/* Axis lines */}
        {sorted.map((_, i) => {
          const p = getPoint(i, 100);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e5e5e5" strokeWidth="0.5" />;
        })}
        {/* Data polygon */}
        <motion.polygon
          points={dataPath}
          fill="rgba(36,173,181,0.15)"
          stroke="#24adb5"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x} cy={p.y} r="3"
            fill="#24adb5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          />
        ))}
        {/* Labels */}
        {sorted.map((em, i) => {
          const labelDist = maxRadius + 18;
          const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);
          return (
            <text
              key={i}
              x={lx} y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[8px] font-medium fill-neutral-500"
            >
              {EMOTION_TYPES[em.typeId].nameKo}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Dominant Emotion Cards ───────────────────────────────────────────
export function DominantEmotionCards({ emotions }: { emotions: EmotionScore[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {emotions.slice(0, 3).map((em, i) => {
        const type = EMOTION_TYPES[em.typeId];
        return (
          <motion.div
            key={em.typeId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="relative bg-white border border-neutral-100 rounded-xl p-5 overflow-hidden"
          >
            {/* Rank indicator */}
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-neutral-50 flex items-center justify-center">
              <span className="text-[10px] font-bold text-neutral-400">#{i + 1}</span>
            </div>
            {/* Color bar */}
            <div className="w-8 h-1 rounded-full mb-4" style={{ backgroundColor: type.color }} />
            <div className="text-xs font-mono text-neutral-400 mb-1">Type {String(type.id).padStart(2, '0')}</div>
            <div className="text-lg font-bold text-neutral-950 mb-1">{type.nameKo}</div>
            <div className="text-xs text-neutral-400 mb-3 line-clamp-2">{type.description}</div>
            <div className="text-2xl font-[family-name:var(--font-display)] font-bold text-teal-600">
              {em.score}
              <span className="text-sm font-normal text-neutral-400">%</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
