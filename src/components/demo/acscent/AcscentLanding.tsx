'use client';

import { motion } from 'motion/react';

interface Props {
  onStart: () => void;
}

const FLOATING_NOTES = [
  { label: '베르가못', x: '15%', y: '20%', delay: 0, size: 'text-sm' },
  { label: '샌달우드', x: '78%', y: '15%', delay: 0.5, size: 'text-base' },
  { label: '자스민', x: '85%', y: '55%', delay: 1, size: 'text-sm' },
  { label: '베티버', x: '10%', y: '65%', delay: 1.5, size: 'text-sm' },
  { label: '앰버', x: '60%', y: '80%', delay: 0.8, size: 'text-base' },
  { label: '네롤리', x: '30%', y: '85%', delay: 1.2, size: 'text-sm' },
  { label: '머스크', x: '70%', y: '35%', delay: 0.3, size: 'text-sm' },
  { label: '파출리', x: '22%', y: '45%', delay: 1.8, size: 'text-sm' },
];

export function AcscentLanding({ onStart }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-500/10"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'blur(80px)' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/8"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'blur(100px)' }}
        />
      </div>

      {/* Floating note labels */}
      {FLOATING_NOTES.map((note) => (
        <motion.span
          key={note.label}
          className={`pointer-events-none absolute ${note.size} font-body text-white/20`}
          style={{ left: note.x, top: note.y }}
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4 + note.delay, repeat: Infinity, delay: note.delay }}
        >
          {note.label}
        </motion.span>
      ))}

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 rounded-full border border-teal-500/20 bg-teal-500/10 px-5 py-2"
      >
        <span className="text-sm font-medium tracking-widest text-teal-400">A C&apos;SCENT OLFACTORY TYPE TEST</span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mb-8 text-center font-display text-6xl font-extrabold leading-tight tracking-tight text-white md:text-8xl"
      >
        당신의 후각은
        <br />
        <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">어떤 세계</span>를
        <br />
        보고 있나요?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-5 max-w-lg text-center text-xl leading-relaxed text-white/60"
      >
        같은 향수를 맡아도 사람마다 다르게 느끼는 이유,
        <br />
        <span className="text-white">6종의 시향지</span>로 발견하는 <span className="text-teal-400">16가지 후각 인지 유형</span>
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-14 text-center text-base text-white/40"
      >
        소요 시간 약 3분 · 배송받은 시향지 키트를 준비해주세요
      </motion.p>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(36, 173, 181, 0.3)' }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-12 py-5 font-display text-xl font-bold text-white shadow-lg shadow-teal-500/20 transition-shadow"
      >
        <span className="relative z-10">검사 시작하기</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      {/* Bottom info cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-20 grid max-w-2xl grid-cols-3 gap-5"
      >
        {[
          { num: '6', label: '테스트 향료', desc: '수학적 선별' },
          { num: '16', label: '인지 유형', desc: 'K-means 분류' },
          { num: '48', label: '차원 벡터', desc: '후각 프로파일링' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + i * 0.15 }}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-center backdrop-blur-sm"
          >
            <p className="mb-2 font-display text-4xl font-extrabold text-teal-400">{stat.num}</p>
            <p className="text-base font-medium text-white">{stat.label}</p>
            <p className="mt-1 text-sm text-white/40">{stat.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="h-8 w-5 rounded-full border-2 border-white/30">
          <motion.div
            className="mx-auto mt-1 h-2 w-1 rounded-full bg-white/50"
            animate={{ opacity: [1, 0.3, 1], y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}
