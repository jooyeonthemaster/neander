'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useUIStore } from '@/stores/uiStore';

/* ─────────────────────────────────────────────────────────
   커서 따라다니는 고리 (마우스가 있는 화면에서만)
   · 기본: 작은 점 + 뒤따르는 고리
   · 링크 · 버튼 위: 고리가 커지고 강조색으로
   · data-cursor="VIEW" 같은 구역: 글자가 든 큰 원 (그 구역에서는 기본 화살표를 숨긴다 — theme-redesign.css)
   · 입력칸 위: 숨김
   요소마다 이벤트를 달지 않고 문서 전체에서 한 번만 듣는다.
   ───────────────────────────────────────────────────────── */

type Mode = 'default' | 'link' | 'label' | 'hidden';

export default function CustomCursor() {
  const storeVariant = useUIStore((s) => s.cursorVariant);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>('default');
  const [label, setLabel] = useState('');
  const seen = useRef(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const ringX = useSpring(x, { damping: 30, stiffness: 340, mass: 0.5 });
  const ringY = useSpring(y, { damping: 30, stiffness: 340, mass: 0.5 });

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
      if (!seen.current) {
        seen.current = true;
        setVisible(true);
      }
    }

    function onOver(e: Event) {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== 'function') return;
      const labelled = target.closest<HTMLElement>('[data-cursor]');
      if (labelled?.dataset.cursor) {
        setLabel(labelled.dataset.cursor);
        setMode('label');
        return;
      }
      if (target.closest('input, textarea, select, [contenteditable="true"], [data-cursor-hide], iframe, canvas')) {
        setMode('hidden');
        return;
      }
      if (target.closest('a, button, [role="button"], summary, label[for], [data-cursor-link]')) {
        setMode('link');
        return;
      }
      setMode('default');
    }

    const onLeave = () => { seen.current = false; setVisible(false); };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  // 예전 컴포넌트가 store 로 알려 주는 상태도 존중한다
  const effective: Mode =
    mode !== 'default' ? mode : storeVariant === 'pointer' || storeVariant === 'expand' ? 'link' : storeVariant === 'hidden' || storeVariant === 'text' ? 'hidden' : 'default';

  const ring =
    effective === 'label' ? { size: 92, bg: 'rgba(125,149,255,1)', border: 'rgba(125,149,255,1)' }
      : effective === 'link' ? { size: 58, bg: 'rgba(125,149,255,0.12)', border: 'rgba(125,149,255,0.95)' }
        : { size: 34, bg: 'rgba(244,244,242,0)', border: 'rgba(244,244,242,0.45)' };
  const show = visible && effective !== 'hidden';

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 flex items-center justify-center rounded-full border"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%', zIndex: 'var(--z-max)' }}
        animate={{ width: ring.size, height: ring.size, backgroundColor: ring.bg, borderColor: ring.border, opacity: show ? 1 : 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.6 }}
      >
        <motion.span
          className="t-label whitespace-nowrap !text-[0.66rem] !tracking-[0.16em] text-accent-ink"
          animate={{ opacity: effective === 'label' ? 1 : 0, scale: effective === 'label' ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-paper"
        style={{ x, y, translateX: '-50%', translateY: '-50%', zIndex: 'var(--z-max)' }}
        animate={{ opacity: show && effective === 'default' ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
