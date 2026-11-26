'use client';

import { createContext, useCallback, useContext, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   목록의 줄에 마우스를 올리면 그 줄의 사진이 커서를 따라다니며 뜬다.
   <HoverPreviewList> 가 사진을 띄우고, 각 줄은 <HoverPreviewRow image="…"> 로 감싼다.
   마우스가 없는 화면에서는 아무 일도 하지 않는다.
   ───────────────────────────────────────────────────────── */

const Ctx = createContext<(src: string | null) => void>(() => {});

export function HoverPreviewList({ children, className }: { children: ReactNode; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });
  const ref = useRef<HTMLDivElement>(null);

  const set = useCallback((next: string | null) => {
    setSrc(next);
    if (next) setLast(next);
  }, []);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return;
    x.set(e.clientX);
    y.set(e.clientY);
  }

  return (
    <Ctx.Provider value={set}>
      <div ref={ref} onPointerMove={onMove} className={cn('relative', className)}>
        {children}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-[15rem] w-[21rem] overflow-hidden lg:block"
          style={{ x: sx, y: sy, translateX: '1.5rem', translateY: '-50%' }}
          animate={{ opacity: src ? 1 : 0, scale: src ? 1 : 0.86 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {last && <img src={last} alt="" className="h-full w-full object-cover" />}
        </motion.div>
      </div>
    </Ctx.Provider>
  );
}

export function HoverPreviewRow({ image, children, className }: { image?: string | null; children: ReactNode; className?: string }) {
  const set = useContext(Ctx);
  return (
    <div
      className={className}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse' && image) set(image); }}
      onPointerLeave={() => set(null)}
    >
      {children}
    </div>
  );
}
