'use client';

import { useState, useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/tracker';

/* ─────────────────────────────────────────────────────────
   영문 페이지에 한국어 브라우저로 들어온 방문자에게 한국어 페이지를 권한다.
   ChatGPT 답변 링크가 /en 주소를 가리켜 한국 방문자 상당수가 영문 페이지로 들어온다 (2026-11 유입 분석).
   한 번 닫으면 이 브라우저에서는 다시 띄우지 않는다.
   ───────────────────────────────────────────────────────── */

const DISMISS_KEY = 'neander:ko-suggestion-dismissed';

/** 한국어 브라우저이고 아직 닫은 적이 없는지 (서버 렌더에서는 항상 false) */
function isEligible(): boolean {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  if (!languages[0]?.toLowerCase().startsWith('ko')) return false;
  try {
    return window.localStorage.getItem(DISMISS_KEY) !== '1';
  } catch {
    return true;
  }
}

const noSubscribe = () => () => {};

export default function KoreanPageSuggestion() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const eligible = useSyncExternalStore(noSubscribe, isEligible, () => false);
  const [dismissed, setDismissed] = useState(false);

  if (locale !== 'en' || !eligible || dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // 이번 화면에서만 닫는다
    }
  }

  return (
    <div
      role="dialog"
      aria-label="한국어 페이지 안내"
      lang="ko"
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 pl-4 shadow-xl backdrop-blur lg:bottom-6"
    >
      <p className="min-w-0 flex-1 text-sm text-slate-700">한국어 페이지가 있어요.</p>
      <button
        type="button"
        onClick={() => {
          trackEvent('ko_suggest', 'switch');
          dismiss();
          router.replace(pathname, { locale: 'ko' });
        }}
        className="shrink-0 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        한국어로 보기
      </button>
      <button
        type="button"
        onClick={() => {
          trackEvent('ko_suggest', 'dismiss');
          dismiss();
        }}
        aria-label="닫기"
        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
