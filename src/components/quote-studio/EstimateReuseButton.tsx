'use client';

import { useRouter } from '@/i18n/navigation';
import type { QuoteInput } from '@/lib/quote/engine';
import { QUOTE_STORAGE_KEY } from './history';

/** 저장된 가견적서의 조건을 온라인 견적 작성 중인 내용으로 불러와 견적 화면을 연다 */
export function EstimateReuseButton({ input, label }: { input: QuoteInput; label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        try {
          window.localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(input));
        } catch {
          // 저장할 수 없으면 빈 견적으로 연다
        }
        router.push('/quote');
      }}
      className="inline-flex h-11 items-center rounded-lg border-2 border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}
