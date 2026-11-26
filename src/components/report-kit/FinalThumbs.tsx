'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { palette as P } from '@/components/quote-preview/illustrations/VectorPrimitives';

/* ─────────────────────────────────────────────────────────
   견적 마지막 단계 버튼의 썸네일 (2026-11-21 사용자 요청: 「실제로 나올 파일의 모습을 미리보기 형식으로」)
   보고서 · 가견적서는 실제로 받게 될 파일의 첫 장(지금 고른 견적으로 그린 A4, 1pt = 1px)을 그대로 줄여 보여 준다.
   상담 요청은 파일이 없어 말풍선 그림을 쓴다.
   ───────────────────────────────────────────────────────── */

const A4 = { w: 595.28, h: 841.89 };
/** 썸네일 위에 겹쳐 올리는 이름 — 아래쪽을 어둡게 깔고 흰 글자로 (2026-11-21 사용자 요청) */
function Label({ text }: { text: string }) {
  return (
    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[42%] items-end bg-gradient-to-t from-[rgba(8,10,14,0.82)] via-[rgba(8,10,14,0.45)] to-transparent px-3.5 pb-3">
      <span className="text-[15px] font-bold leading-tight text-[#fff] [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">{text}</span>
    </span>
  );
}

function Badge({ badge }: { badge?: { text: string; color: string } }) {
  if (!badge) return null;
  return <span className="absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none tracking-wide text-[#fff] shadow-sm" style={{ background: badge.color }}>{badge.text}</span>;
}

const CARD = 'relative block w-full overflow-hidden rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.25),0_12px_28px_-10px_rgba(0,0,0,0.55)] ring-1 ring-black/5';

/** A4 한 장(595 × 842px)을 칸 폭에 맞춰 줄이고, 위에 이름과 형식 뱃지를 겹친다 */
export function PageThumb({ children, badge, label }: { children: ReactNode; badge?: { text: string; color: string }; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span ref={ref} className={`${CARD} bg-[#fff]`} style={{ aspectRatio: `${A4.w} / ${A4.h}` }}>
      {/* 문서 내용은 그림일 뿐이라 버튼 이름·화면 낭독기에서 뺀다 */}
      <span aria-hidden="true" className="absolute left-0 top-0 block origin-top-left" style={{ width: A4.w, height: A4.h, transform: `scale(${(w || A4.w) / A4.w})`, visibility: w ? 'visible' : 'hidden' }}>{children}</span>
      <Label text={label} />
      <Badge badge={badge} />
    </span>
  );
}

/** 아직 문서를 만들기 전 — 빈 종이 */
export function BlankPage() {
  return <span className="block h-full w-full bg-[#fff]" />;
}

export const BADGE = { hwpx: { text: 'HWPX', color: P.teal }, pdf: { text: 'PDF', color: P.coral }, report: { text: 'PDF · HWPX', color: P.teal } };

/** 상담 요청 — 담당자와 주고받는 말풍선 (문서 썸네일과 같은 크기 · 같은 이름 겹침) */
export function ConsultThumb({ label }: { label: string }) {
  return (
    <span className={CARD} style={{ aspectRatio: `${A4.w} / ${A4.h}` }}>
      <svg viewBox="0 0 84 119" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect width="84" height="119" fill={P.background} />
        <circle cx="20" cy="30" r="10" fill={P.tealLight} />
        <circle cx="20" cy="27.5" r="3.6" fill={P.navy} />
        <path d="M13.5 37Q20 31 26.5 37" fill={P.navy} />
        <rect x="33" y="18" width="44" height="22" rx="7" fill={P.paper} stroke={P.silver} strokeWidth="0.8" />
        <path d="M36 38 30 44 42 39Z" fill={P.paper} stroke={P.silver} strokeWidth="0.8" strokeLinejoin="round" />
        <rect x="34" y="37" width="9" height="2.6" fill={P.paper} />
        <rect x="39" y="25" width="30" height="2.4" rx="1.2" fill={P.ink} />
        <rect x="39" y="31" width="20" height="2.4" rx="1.2" fill={P.silverDark} />
        <rect x="9" y="55" width="58" height="22" rx="7" fill={P.teal} />
        <path d="M58 75 68 82 62 74Z" fill={P.teal} />
        <rect x="16" y="62" width="40" height="2.6" rx="1.3" fill="#fff" />
        <rect x="16" y="68" width="26" height="2.6" rx="1.3" fill={P.tealLight} />
      </svg>
      <Label text={label} />
    </span>
  );
}
