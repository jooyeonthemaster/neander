'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/* 언어 전환 — KR / EN 글자 두 개 */

interface LanguageToggleProps {
  className?: string;
  /** 예전 머리글과의 호환용 — 이제 늘 어두운 바탕이라 쓰지 않는다 */
  inverted?: boolean;
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: 'ko' | 'en') {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  const item = (code: 'ko' | 'en', label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={locale === code}
      onClick={() => switchLocale(code)}
      className={cn(
        't-label !text-[0.74rem] !tracking-[0.14em] px-1 py-2 transition-colors',
        locale === code ? 'text-paper' : 'text-paper/40 hover:text-paper/80',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className={cn('flex items-center', className)} role="radiogroup" aria-label="Language selection">
      {item('ko', 'KR')}
      <span aria-hidden="true" className="px-0.5 text-xs text-paper/30">/</span>
      {item('en', 'EN')}
    </div>
  );
}
