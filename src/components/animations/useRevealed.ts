'use client';

import { useEffect, useRef, useState } from 'react';

// 0%, 5%, … 100% 보일 때마다 알려 달라고 해서 '얼마나 들어왔는지'를 직접 잰다
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

/**
 * 스크롤로 화면에 들어오면 한 번(once) 또는 들어올 때마다 true 가 된다.
 *
 * motion 의 whileInView 는 Safari(WebKit)에서 데이터를 받아 나중에 그려진 요소
 * (언론 보도·포트폴리오 목록 등)에 신호가 오지 않아 끝까지 투명하게 남는 일이 있어,
 * IntersectionObserver 를 직접 쓴다.
 * - margin('-80px')만큼 화면 안으로 들어오면 보인다. 요소가 그보다 작으면 절반만 보여도 된다
 *   (페이지 맨 아래처럼 더 올라올 수 없는 곳에서도 보이게).
 * - 빠르게 스크롤해 이미 화면 위로 지나간 요소도 보여준다.
 */
export function useRevealed<T extends Element>(margin = '-80px', once = true) {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const inset = Math.abs(parseFloat(margin)) || 0;
    const observer = new IntersectionObserver(([entry]) => {
      const box = entry.boundingClientRect;
      const enough = entry.isIntersecting && entry.intersectionRect.height >= Math.min(inset, box.height / 2);
      const passed = box.bottom < 0;
      if (enough || passed) {
        setRevealed(true);
        if (once) observer.disconnect();
      } else if (!once && !entry.isIntersecting) {
        setRevealed(false);
      }
    }, { threshold: THRESHOLDS });
    observer.observe(element);
    return () => observer.disconnect();
  }, [margin, once]);

  return [ref, revealed] as const;
}
