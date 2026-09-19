'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { startListeners, trackPageview } from '@/lib/analytics/tracker';

/* ─────────────────────────────────────────────────────────
   Analytics Tracker
   공개 페이지의 방문·체류·행동을 관리자 '유입 분석'용으로 기록한다.
   ───────────────────────────────────────────────────────── */

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => startListeners(), []);

  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  return null;
}
