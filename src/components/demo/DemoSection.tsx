'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { loadDemoModule } from '@/data/demo-registry';
import type { DemoModule } from '@/types/demo';
import { DemoShell } from './DemoShell';

interface DemoSectionProps {
  slug: string;
  pillarColor: string;
  sectionTitle: string;
  sectionSubtitle: string;
  tryDemoLabel: string;
  labels: {
    back: string;
    next: string;
    seeResult: string;
    analyzing: string;
    analyzingSubtitle: string;
    complete: string;
  };
}

export function DemoSection({
  slug,
  pillarColor,
  sectionTitle,
  sectionSubtitle,
  tryDemoLabel,
  labels,
}: DemoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [demoModule, setDemoModule] = useState<DemoModule | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExpand = useCallback(async () => {
    if (isExpanded) return;
    setIsLoading(true);
    try {
      const loader = loadDemoModule(slug);
      if (loader) {
        const mod = await loader();
        setDemoModule(mod);
      }
    } finally {
      setIsLoading(false);
      setIsExpanded(true);
    }
  }, [slug, isExpanded]);

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      {/* Glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full"
        style={{ backgroundColor: pillarColor, opacity: 0.06, filter: 'blur(140px)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: pillarColor }}
          >
            <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
            Demo
            <span className="h-px w-8" style={{ backgroundColor: pillarColor }} aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {sectionTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400 leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Collapsed CTA card */}
          {!isExpanded && (
            <motion.div
              key="cta"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-lg"
            >
              <button
                type="button"
                onClick={handleExpand}
                disabled={isLoading}
                className={cn(
                  'group relative w-full overflow-hidden rounded-2xl border p-8 text-center transition-all duration-500',
                  'hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                  isLoading ? 'cursor-wait' : 'cursor-pointer'
                )}
                style={{
                  borderColor: `${pillarColor}30`,
                  background: `linear-gradient(135deg, ${pillarColor}08, ${pillarColor}04)`,
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at center, ${pillarColor}15, transparent 70%)`,
                  }}
                  aria-hidden="true"
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${pillarColor}15` }}
                  >
                    {isLoading ? (
                      <motion.div
                        className="h-6 w-6 rounded-full border-2 border-t-transparent"
                        style={{ borderColor: `${pillarColor}60`, borderTopColor: 'transparent' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <svg
                        className="h-7 w-7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={pillarColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                    )}
                  </div>

                  <p className="font-display text-xl font-bold text-white mb-2">
                    {tryDemoLabel}
                  </p>
                  <p className="text-sm text-slate-500">
                    {sectionSubtitle}
                  </p>
                </div>
              </button>
            </motion.div>
          )}

          {/* Expanded demo */}
          {isExpanded && demoModule && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-3xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm"
            >
              <DemoShell
                module={demoModule}
                pillarColor={pillarColor}
                labels={labels}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edge lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${pillarColor}20, transparent)` }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${pillarColor}20, transparent)` }}
        aria-hidden="true"
      />
    </section>
  );
}
