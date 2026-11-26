'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/* 「움직임 줄이기」 설정을 읽는다.
   motion 의 useReducedMotion 은 브라우저에서 첫 그리기부터 true 를 돌려줘서, 서버가 보낸 HTML(항상 false 기준)과
   style 이 어긋난다는 경고가 난다. 여기서는 서버와 첫 그리기에서는 false 로 맞추고, 그 직후 실제 값으로 바꾼다. */
export function useReduce(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
