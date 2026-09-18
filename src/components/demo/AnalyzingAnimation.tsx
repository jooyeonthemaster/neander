'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnalyzingAnimationProps {
  emoji: string;
  title: string;
  subtitle: string;
  /** 순서대로 교체되는 진행 문구 (없으면 subtitle 고정) */
  messages?: string[];
  /** 전체 분석 시간 — messages 교체 간격 계산용 */
  durationMs?: number;
  /** 카메라로 촬영한 이미지 — 있으면 이모지 대신 표시 */
  image?: string;
}

export function AnalyzingAnimation({
  emoji,
  title,
  subtitle,
  messages,
  durationMs = 3000,
  image,
}: AnalyzingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length < 2) return;
    const interval = Math.max(500, durationMs / messages.length);
    const timer = window.setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, messages.length - 1));
    }, interval);
    return () => window.clearInterval(timer);
  }, [messages, durationMs]);

  const currentMessage = messages?.length ? messages[messageIndex] : subtitle;

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
            style={image ? { width: 112, height: 112 } : { width: 80, height: 80 }}
          />
        ))}
        {image ? (
          <div className="relative h-28 w-28">
            <motion.div
              className="absolute -inset-1 rounded-full"
              style={{ background: 'conic-gradient(from 0deg, #2dd4bf, transparent 40%, #22d3ee 70%, transparent)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="relative h-full w-full rounded-full border-2 border-slate-950 object-cover"
            />
            <motion.div
              className="absolute inset-x-2 h-0.5 rounded-full bg-teal-300 shadow-[0_0_12px_2px_rgba(45,212,191,0.8)]"
              animate={{ top: ['12%', '88%', '12%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        ) : (
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <span className="text-2xl">{emoji}</span>
          </motion.div>
        )}
      </div>

      <motion.p
        className="text-lg font-semibold text-white"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {title}
      </motion.p>
      <div className="mt-2 h-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-slate-500"
          >
            {currentMessage}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
