// ============================================================
// 페이지 안에서 코드로 스크롤할 때 쓰는 공통 함수
// 사이트 스크롤은 Lenis 가 맡고 있어, 브라우저의 smooth 스크롤을 따로 부르면 두 움직임의
// 속도·가속이 달라 어색하다. Lenis 가 있으면 Lenis 로, 없으면(홈 화면) 브라우저로 굴린다.
// '동작 줄이기'를 켠 사용자에게는 애니메이션 없이 바로 옮긴다.
// ============================================================

import type Lenis from 'lenis';

let current: Lenis | null = null;

/** SmoothScrollProvider 가 Lenis 를 만들고 없앨 때 알려 준다 */
export function setLenis(lenis: Lenis | null) {
  current = lenis;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 부드럽게 멈추는 곡선 (Lenis 기본값과 같은 결) */
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** 이동 거리에 맞춘 시간 — 짧은 거리는 빠르게, 먼 거리도 1초를 넘지 않게 */
const durationFor = (distance: number) => Math.min(1, Math.max(0.45, 0.35 + Math.abs(distance) / 2400));

/** 문서 기준 y 위치로 부드럽게 스크롤한다 */
export function smoothScrollTo(top: number, options: { immediate?: boolean } = {}) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const target = Math.max(0, Math.min(max, top));
  const immediate = options.immediate || prefersReducedMotion();
  if (current) {
    // Lenis 는 페이지 높이를 조금 늦게 다시 잰다 — 방금 내용이 늘어난 경우 예전 높이로 목표를 잘라 버리므로 먼저 갱신한다
    current.resize();
    current.scrollTo(target, { immediate, duration: durationFor(target - window.scrollY), easing: easeOutExpo, force: true });
    return;
  }
  window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'smooth' });
}

/** 지금 위치에서 delta 만큼 부드럽게 스크롤한다 */
export function smoothScrollBy(delta: number, options: { immediate?: boolean } = {}) {
  smoothScrollTo(window.scrollY + delta, options);
}

/**
 * 요소가 보이도록 부드럽게 스크롤한다.
 * block 'start' 는 요소 윗변을 화면 위(고정 헤더 아래)에, 'nearest' 는 이미 보이면 움직이지 않고
 * 가려진 쪽만큼만 옮긴다.
 */
export function smoothScrollIntoView(element: Element | null | undefined, options: { block?: 'start' | 'nearest'; offset?: number; immediate?: boolean } = {}) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const header = document.querySelector('header')?.getBoundingClientRect();
  // 요소에 scroll-margin-top(예: scroll-mt-28)이 있으면 그 여백을, 없으면 고정 헤더 높이를 비운다
  const marginTop = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const topInset = (options.offset ?? 0) + (marginTop > 0 ? marginTop : header && header.bottom > 0 ? header.bottom : 0);
  if (options.block === 'nearest') {
    const bar = document.querySelector('[data-quote-bottom-bar]')?.getBoundingClientRect();
    const bottomEdge = bar && bar.height > 0 && bar.top < window.innerHeight ? bar.top : window.innerHeight;
    if (rect.top < topInset) smoothScrollBy(rect.top - topInset, options);
    else if (rect.bottom > bottomEdge) smoothScrollBy(Math.min(rect.bottom - bottomEdge, rect.top - topInset), options);
    return;
  }
  smoothScrollBy(rect.top - topInset, options);
}
