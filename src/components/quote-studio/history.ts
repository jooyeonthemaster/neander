/* 온라인 견적 — 이 브라우저에 남기는 값
   - 작성 중인 견적 (QUOTE_STORAGE_KEY)
   - 발급한 가견적서 목록: 다른 날 다시 와도 링크로 발급 당시 내용을 볼 수 있다 */

export const QUOTE_STORAGE_KEY = 'neander-quote-v2';
const HISTORY_KEY = 'neander-estimates';
const MAX = 10;

export interface EstimateHistoryItem {
  no: string;
  issuedAt: string;
  total: number;
  /** 서명된 다시 보기 토큰 */
  token: string;
  /** 담은 상품 이름 요약 */
  summary: string;
}

export function estimateHref(token: string) {
  return `/quote/estimate?t=${encodeURIComponent(token)}`;
}

export function loadEstimateHistory(): EstimateHistoryItem[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const list = raw ? (JSON.parse(raw) as EstimateHistoryItem[]) : [];
    return Array.isArray(list) ? list.filter((i) => i && typeof i.token === 'string' && typeof i.no === 'string') : [];
  } catch {
    return [];
  }
}

export function addEstimateHistory(item: EstimateHistoryItem) {
  try {
    const list = [item, ...loadEstimateHistory().filter((i) => i.no !== item.no)].slice(0, MAX);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // 저장할 수 없으면 목록만 남지 않는다
  }
}

export function removeEstimateHistory(no: string) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(loadEstimateHistory().filter((i) => i.no !== no)));
  } catch {
    // 무시
  }
}
