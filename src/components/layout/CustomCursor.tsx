'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useUIStore } from '@/stores/uiStore';

/* ─────────────────────────────────────────────────────────
   Custom Cursor
   Desktop-only dual-circle cursor with spring physics
   Reacts to cursorVariant from global UI store
   ───────────────────────────────────────────────────────── */

const CURSOR_SIZES: Record<string, { outer: number; inner: number }> = {
  default: { outer: 32, inner: 6 },
  pointer: { outer: 48, inner: 4 },
  text: { outer: 4, inner: 0 },
  hidden: { outer: 0, inner: 0 },
  expand: { outer: 80, inner: 8 },
};

export default function CustomCursor() {
  const cursorVariant = useUIStore((s) => s.cursorVariant);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const dotSpringConfig = { damping: 20, stiffness: 500, mass: 0.2 };
  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  useEffect(() => {
    // Detect touch device
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    // Also check for fine pointer (mouse)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    setIsTouchDevice(hasTouch && !hasFinePointer);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    function handleMouseMove(e: MouseEvent) {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    }

    function handleMouseLeave() {
      setIsVisible(false);
    }

    function handleMouseEnter() {
      setIsVisible(true);
    }

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isTouchDevice, isVisible, mouseX, mouseY]);

  // Do not render on touch devices
  if (isTouchDevice) return null;

  const sizes = CURSOR_SIZES[cursorVariant] ?? CURSOR_SIZES.default;

  return (
    <>
      {/* Outer follower ring */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 rounded-full border border-teal-400/60 mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          width: sizes.outer,
          height: sizes.outer,
          translateX: '-50%',
          translateY: '-50%',
          zIndex: 'var(--z-max)',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: sizes.outer,
          height: sizes.outer,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      />

      {/* Inner solid dot */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 rounded-full bg-teal-400"
        style={{
          x: dotX,
          y: dotY,
          width: sizes.inner,
          height: sizes.inner,
          translateX: '-50%',
          translateY: '-50%',
          zIndex: 'var(--z-max)',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: sizes.inner,
          height: sizes.inner,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      />
    </>
  );
}
