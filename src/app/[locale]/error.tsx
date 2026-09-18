'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 렌더링 중 오류가 났을 때 흰 화면 대신 보여줄 화면.
 * (Firestore 응답 실패 등으로 공개 페이지가 죽는 경우를 막는다)
 */
export default function LocaleError({ error, reset }: Props) {
  const t = useTranslations('errors.500');
  const t404 = useTranslations('errors.404');

  useEffect(() => {
    console.error('[page error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {t('description')}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-teal-600 px-7 text-base font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
          >
            {t('retry')}
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-slate-200 px-7 text-base font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            {t404('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
