'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AcscentLanding } from './AcscentLanding';
import { AcscentTestFlow } from './AcscentTestFlow';
import { AcscentResult } from './AcscentResult';
import { AcscentPerfumeDetail } from './AcscentPerfumeDetail';
import { calculateType, getTypeByCode, type AcscentType } from '@/data/acscent-types';

type View = 'landing' | 'test' | 'analyzing' | 'result' | 'perfume-detail';

export function AcscentDemo() {
  const [view, setView] = useState<View>('landing');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [userType, setUserType] = useState<AcscentType | null>(null);
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string | null>(null);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleStartTest = useCallback(() => { setView('test'); scrollTop(); }, []);

  const handleTestComplete = useCallback((finalScores: Record<string, number>) => {
    setScores(finalScores);
    setView('analyzing');
    scrollTop();

    setTimeout(() => {
      const typeCode = calculateType(finalScores);
      const type = getTypeByCode(typeCode);
      setUserType(type ?? getTypeByCode('IGLW')!);
      setView('result');
      scrollTop();
    }, 3500);
  }, []);

  const handleSelectPerfume = useCallback((perfumeId: string) => {
    setSelectedPerfumeId(perfumeId);
    setView('perfume-detail');
    scrollTop();
  }, []);

  const handleBackToResult = useCallback(() => {
    setSelectedPerfumeId(null);
    setView('result');
    scrollTop();
  }, []);

  const handleRestart = useCallback(() => {
    setScores({});
    setUserType(null);
    setSelectedPerfumeId(null);
    setView('landing');
    scrollTop();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-body">
      {/* Background grain texture */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <AcscentLanding onStart={handleStartTest} />
          </motion.div>
        )}

        {view === 'test' && (
          <motion.div key="test" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.5 }}>
            <AcscentTestFlow onComplete={handleTestComplete} />
          </motion.div>
        )}

        {view === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.5 }}>
            <AnalyzingScreen />
          </motion.div>
        )}

        {view === 'result' && userType && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <AcscentResult type={userType} scores={scores} onSelectPerfume={handleSelectPerfume} onRestart={handleRestart} />
          </motion.div>
        )}

        {view === 'perfume-detail' && userType && selectedPerfumeId && (
          <motion.div key="perfume" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.5 }}>
            <AcscentPerfumeDetail perfumeId={selectedPerfumeId} userType={userType} onBack={handleBackToResult} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Analyzing Screen ────────────────────────────────── */
function AnalyzingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Orbiting particles */}
      <div className="relative mb-12 h-40 w-40">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full"
            style={{ background: ['#40c9cf', '#7de0e3', '#24adb5', '#b2eeef', '#22707c'][i] }}
            animate={{ rotate: 360, scale: [1, 1.5, 1] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 0.4 }}
          >
            <motion.div
              className="absolute h-3 w-3 rounded-full"
              style={{ background: ['#40c9cf', '#7de0e3', '#24adb5', '#b2eeef', '#22707c'][i] }}
              animate={{ x: [0, 60 + i * 10, 0, -(60 + i * 10), 0], y: [-(60 + i * 10), 0, 60 + i * 10, 0, -(60 + i * 10)] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 0.4 }}
            />
          </motion.div>
        ))}
        {/* Center glow */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 60, height: 60, filter: 'blur(20px)' }}
        />
      </div>

      <motion.p
        className="mb-4 font-display text-2xl font-bold tracking-tight text-white"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        후각 인지 유형 분석 중
      </motion.p>
      <motion.p className="text-sm text-neutral-400" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}>
        48차원 후각 벡터를 K-means 클러스터링으로 분류하고 있습니다...
      </motion.p>

      {/* Progress bar */}
      <div className="mt-8 h-1 w-64 overflow-hidden rounded-full bg-neutral-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3.2, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
