'use client';

import { useEffect, useRef, type ComponentProps, type Ref } from 'react';

/* ─────────────────────────────────────────────────────────
   화면에 들어올 때만 받는 무음 반복 영상 (2026-11-23)
   · 처음에는 포스터 그림만 두고 영상 주소를 넣지 않는다 — 휴대폰에서 페이지를 열자마자
     영상 여러 개(각 2~4MB)를 미리 받던 것을 막는다.
   · 화면 근처(위아래 200px)에 오면 주소를 넣고 재생, 벗어나면 멈춘다.
   · 데이터 절약 모드에서는 포스터만 보여 준다.
   ───────────────────────────────────────────────────────── */

type Props = Omit<ComponentProps<'video'>, 'src' | 'preload' | 'autoPlay' | 'ref'> & {
  src: string;
  ref?: Ref<HTMLVideoElement>;
};

export function LazyVideo({ src, ref, ...rest }: Props) {
  const own = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = own.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) v.src = src;
          void v.play().catch(() => {});
        } else if (v.getAttribute('src')) {
          v.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      {...rest}
      ref={(el) => {
        own.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as { current: HTMLVideoElement | null }).current = el;
      }}
      muted
      playsInline
      preload="none"
    />
  );
}
