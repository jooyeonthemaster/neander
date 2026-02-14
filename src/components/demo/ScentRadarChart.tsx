'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

interface ScentRadarChartProps {
  scores: {
    floral: number;
    citrus: number;
    woody: number;
    oriental: number;
    fresh: number;
    sweet: number;
  };
  className?: string;
}

const AXES = ['floral', 'citrus', 'woody', 'oriental', 'fresh', 'sweet'] as const;
const AXIS_LABELS: Record<string, string> = {
  floral: 'Floral',
  citrus: 'Citrus',
  woody: 'Woody',
  oriental: 'Oriental',
  fresh: 'Fresh',
  sweet: 'Sweet',
};

const CENTER = 120;
const RADIUS = 90;
const GRID_LEVELS = 5;

function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function getGridPath(level: number): string {
  const r = (RADIUS / GRID_LEVELS) * level;
  const points = AXES.map((_, i) => {
    const angle = (360 / AXES.length) * i;
    const { x, y } = polarToCartesian(angle, r);
    return `${x},${y}`;
  });
  return `M${points.join('L')}Z`;
}

export function ScentRadarChart({ scores, className }: ScentRadarChartProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  // Build data polygon path
  const dataPoints = AXES.map((axis, i) => {
    const angle = (360 / AXES.length) * i;
    const value = scores[axis] / 10;
    const { x, y } = polarToCartesian(angle, RADIUS * value);
    return { x, y, axis, value: scores[axis] };
  });

  const dataPath = `M${dataPoints.map((p) => `${p.x},${p.y}`).join('L')}Z`;

  return (
    <svg
      ref={ref}
      viewBox="0 0 240 240"
      className={cn('w-full max-w-[280px]', className)}
      role="img"
      aria-label="Scent profile radar chart"
    >
      {/* Grid rings */}
      {Array.from({ length: GRID_LEVELS }, (_, i) => (
        <path
          key={`grid-${i}`}
          d={getGridPath(i + 1)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={i === GRID_LEVELS - 1 ? 1 : 0.5}
        />
      ))}

      {/* Axis lines */}
      {AXES.map((_, i) => {
        const angle = (360 / AXES.length) * i;
        const { x, y } = polarToCartesian(angle, RADIUS);
        return (
          <line
            key={`axis-${i}`}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data area */}
      <motion.path
        d={dataPath}
        fill="rgba(20, 184, 166, 0.2)"
        stroke="rgb(20, 184, 166)"
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={
          isInView
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.3 }
        }
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
        style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
      />

      {/* Data points */}
      {dataPoints.map((point, i) => (
        <motion.circle
          key={`point-${i}`}
          cx={point.x}
          cy={point.y}
          r={4}
          fill="rgb(20, 184, 166)"
          stroke="white"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            isInView
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0 }
          }
          transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
        />
      ))}

      {/* Axis labels */}
      {AXES.map((axis, i) => {
        const angle = (360 / AXES.length) * i;
        const { x, y } = polarToCartesian(angle, RADIUS + 20);
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-400 text-[10px] font-medium"
          >
            {AXIS_LABELS[axis]}
          </text>
        );
      })}

      {/* Score values on data points */}
      {dataPoints.map((point, i) => {
        const angle = (360 / AXES.length) * i;
        const { x, y } = polarToCartesian(angle, RADIUS * (point.value / 10) + 14);
        return (
          <motion.text
            key={`score-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-teal-400 text-[9px] font-bold"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
          >
            {point.value}
          </motion.text>
        );
      })}
    </svg>
  );
}
