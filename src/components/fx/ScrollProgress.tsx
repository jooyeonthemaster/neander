'use client';

import { motion, useScroll, useSpring } from 'motion/react';

/* 페이지를 얼마나 내렸는지 보여 주는 얇은 선 (머리글 아래) */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return <motion.div aria-hidden="true" className={className} style={{ scaleX, transformOrigin: '0 50%' }} />;
}
