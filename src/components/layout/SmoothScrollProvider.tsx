'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { usePathname } from '@/i18n/navigation';

/* ─────────────────────────────────────────────────────────
   Smooth Scroll Provider
   Wraps the app in Lenis smooth scrolling with context access
   ───────────────────────────────────────────────────────── */

interface SmoothScrollContextValue {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  // The home page uses native CSS scroll snapping, which Lenis would fight
  const isHome = pathname === '/';
  // 뒤로·앞으로 가기는 브라우저가 이전 위치로 돌려놓으므로 맨 위로 올리지 않는다
  const isHistoryNav = useRef(false);

  useEffect(() => {
    const onPop = () => { isHistoryNav.current = true; };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // 링크로 다른 페이지에 가면 맨 위에서 시작한다.
  // Lenis가 자기 스크롤 위치를 들고 있어 Next의 기본 '맨 위로'가 먹지 않고, 이전 페이지 위치에 머물렀다
  // (예: 회사 소개를 내려 본 뒤 서비스 소개를 누르면 제목이 화면 밖에 있어 글자가 안 보였다).
  useEffect(() => {
    if (isHistoryNav.current) {
      isHistoryNav.current = false;
      return;
    }
    if (window.location.hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (isHome) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isHome]);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
