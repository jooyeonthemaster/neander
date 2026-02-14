'use client';

import { memo } from 'react';
import { motion, type MotionValue } from 'motion/react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════
   Neural Circuit Grid — Tech-forward background layer
   CSS/SVG-based, zero JS animation loops
   ═══════════════════════════════════════════════════════════ */

interface CircuitNode {
  x: string;
  y: string;
  size: number;
  color: string;
  delay: number;
  hideMobile?: boolean;
}

const NODES: CircuitNode[] = [
  // Core teal nodes
  { x: '20%', y: '25%', size: 6, color: 'var(--color-teal-400)', delay: 0 },
  { x: '40%', y: '18%', size: 8, color: 'var(--color-teal-500)', delay: 0.5 },
  { x: '65%', y: '14%', size: 5, color: 'var(--color-teal-400)', delay: 1.2 },
  { x: '80%', y: '28%', size: 7, color: 'var(--color-teal-500)', delay: 0.8 },
  { x: '15%', y: '55%', size: 6, color: 'var(--color-teal-400)', delay: 1.5 },
  { x: '50%', y: '42%', size: 9, color: 'var(--color-teal-500)', delay: 0.3 },
  { x: '72%', y: '50%', size: 6, color: 'var(--color-teal-400)', delay: 2.0 },
  { x: '35%', y: '68%', size: 7, color: 'var(--color-teal-500)', delay: 1.0 },

  // Service accent nodes
  { x: '30%', y: '35%', size: 5, color: 'var(--color-scent)', delay: 0.7 },
  { x: '75%', y: '38%', size: 5, color: 'var(--color-photo)', delay: 1.8 },
  { x: '55%', y: '62%', size: 5, color: 'var(--color-media)', delay: 2.2 },
  { x: '22%', y: '60%', size: 5, color: 'var(--color-spatial)', delay: 1.3 },

  // Peripheral nodes (hidden on mobile)
  { x: '8%', y: '15%', size: 4, color: 'var(--color-teal-300)', delay: 2.5, hideMobile: true },
  { x: '90%', y: '20%', size: 4, color: 'var(--color-teal-300)', delay: 1.7, hideMobile: true },
  { x: '88%', y: '65%', size: 4, color: 'var(--color-teal-300)', delay: 0.4, hideMobile: true },
  { x: '10%', y: '75%', size: 4, color: 'var(--color-teal-300)', delay: 2.8, hideMobile: true },
];

interface CircuitTrace {
  d: string;
  duration: number;
  delay: number;
  hideMobile?: boolean;
}

const TRACES: CircuitTrace[] = [
  { d: 'M 20,25 Q 30,20 40,18', duration: 3, delay: 0 },
  { d: 'M 40,18 Q 52,15 65,14', duration: 3.5, delay: 0.5 },
  { d: 'M 65,14 Q 72,20 80,28', duration: 4, delay: 1.0 },
  { d: 'M 50,42 Q 42,55 35,68', duration: 3.8, delay: 0.3 },
  { d: 'M 20,25 Q 17,40 15,55', duration: 4.2, delay: 0.8, hideMobile: true },
  { d: 'M 80,28 Q 76,38 72,50', duration: 3.2, delay: 1.5, hideMobile: true },
  // Cross connections
  { d: 'M 30,35 Q 40,38 50,42', duration: 3.6, delay: 1.2 },
  { d: 'M 50,42 Q 62,46 72,50', duration: 3.4, delay: 0.6, hideMobile: true },
];

/* ─────────────────────────────────────────────────────────── */

interface NeuralCircuitGridProps {
  gridY: MotionValue<number>;
  nodesY: MotionValue<number>;
  className?: string;
}

function NeuralCircuitGridInner({ gridY, nodesY, className }: NeuralCircuitGridProps) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)} aria-hidden="true">
      {/* ── Circuit Grid Pattern ─────────────────────── */}
      <motion.div className="absolute inset-0 circuit-grid" style={{ y: gridY }}>
        {/* Scan line sweep */}
        <div
          className="absolute inset-x-0 h-32 md:h-48 animate-scan-line will-change-transform"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(36, 173, 181, 0.12), transparent)',
          }}
        />
      </motion.div>

      {/* ── Nodes + Traces ───────────────────────────── */}
      <motion.div className="absolute inset-0" style={{ y: nodesY }}>
        {/* SVG Connection Traces */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          fill="none"
        >
          {TRACES.map((trace, i) => (
            <path
              key={i}
              d={trace.d}
              stroke="rgba(36, 173, 181, 0.15)"
              strokeWidth="0.15"
              strokeDasharray="2 3"
              className={cn(
                'animate-data-flow',
                trace.hideMobile && 'hidden md:block',
              )}
              style={{
                animationDuration: `${trace.duration}s`,
                animationDelay: `${trace.delay}s`,
              }}
            />
          ))}
        </svg>

        {/* Glowing Nodes */}
        {NODES.map((node, i) => (
          <div
            key={i}
            className={cn(
              'absolute rounded-full animate-node-pulse',
              node.hideMobile && 'hidden md:block',
            )}
            style={{
              left: node.x,
              top: node.y,
              width: node.size,
              height: node.size,
              backgroundColor: node.color,
              color: node.color,
              animationDelay: `${node.delay}s`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export const NeuralCircuitGrid = memo(NeuralCircuitGridInner);
