'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import './viewport-media.css';

interface MediaFitProps {
  children: ReactNode;
  width: number;
  height: number;
  /** Space kept at its original size for controls outside the artwork. */
  reserve?: number;
  /** Extra room for artwork that animates above its resting position. */
  overflowTop?: number;
  className?: string;
}

/** Resize the displayed artwork only; its source image and print canvas stay intact. */
export function MediaFit({ children, width, height, reserve = 0, overflowTop = 0, className = '' }: MediaFitProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const viewport = node.closest<HTMLElement>('[data-demo-viewport]');
    const venue = node.closest<HTMLElement>('[data-fit-viewport]');
    if (!viewport || !venue) return;

    let frame = 0;
    const measure = () => {
      const cssHeight = Number.parseFloat(getComputedStyle(viewport).getPropertyValue('--demo-available-height'));
      const availableHeight = Number.isFinite(cssHeight) && cssHeight > 0 ? cssHeight : viewport.clientHeight || 300;
      const artworkHeight = height + overflowTop;
      const scale = Math.min(1, node.clientWidth / width, Math.max(1, availableHeight - reserve) / artworkHeight);
      node.style.setProperty('--demo-media-scale', String(scale));
      node.style.setProperty('--demo-media-top', `${overflowTop}px`);
      node.style.setProperty('--demo-media-layout-height', `${artworkHeight * scale}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);
    observer.observe(node);
    const mutations = new MutationObserver(schedule);
    mutations.observe(viewport, { attributes: true, attributeFilter: ['style'] });
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
    };
  }, [width, height, reserve, overflowTop]);

  return (
    <div
      ref={ref}
      className={`demo-media-fit ${className}`}
      data-demo-page-atomic
      style={{
        '--demo-media-width': `${width}px`,
        '--demo-media-height': `${height}px`,
        '--demo-media-layout-height': `${height}px`,
        width: '100%',
        height: 'var(--demo-media-layout-height)',
      } as CSSProperties}
    >
      <div style={{ position: 'relative', width: 'calc(var(--demo-media-width) * var(--demo-media-scale, 1))', height: '100%', marginInline: 'auto' }}>
        <div className="demo-media-fit-art" style={{ width, height }}>{children}</div>
      </div>
    </div>
  );
}
