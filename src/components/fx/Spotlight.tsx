'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* 마우스를 따라다니는 옅은 빛. 안쪽에 .spot 요소가 --mx / --my 를 읽어 그린다 */
export function Spotlight({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'footer' }) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);

  function onMove(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse') return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${clientX - r.left}px`);
      el.style.setProperty('--my', `${clientY - r.top}px`);
      el.style.setProperty('--spot', '1');
    });
  }

  return (
    <Tag ref={ref as never} onPointerMove={onMove} onPointerLeave={() => ref.current?.style.setProperty('--spot', '0')} className={cn('relative', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: 'var(--spot, 0)',
          background: 'radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), rgba(125, 149, 255, 0.16), transparent 62%)',
        }}
      />
      {children}
    </Tag>
  );
}
