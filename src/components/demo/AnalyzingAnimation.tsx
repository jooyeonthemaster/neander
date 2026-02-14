'use client';

import { motion } from 'motion/react';

interface AnalyzingAnimationProps {
  emoji: string;
  title: string;
  subtitle: string;
}

export function AnalyzingAnimation({ emoji, title, subtitle }: AnalyzingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Pulse circles */}
      <div className="relative mb-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-teal-400/30"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.8],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeOut',
            }}
            style={{ width: 80, height: 80 }}
          />
        ))}
        <motion.div
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <span className="text-2xl">{emoji}</span>
        </motion.div>
      </div>

      <motion.p
        className="text-lg font-semibold text-white"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {title}
      </motion.p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
