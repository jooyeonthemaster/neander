'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { getPathname, useRouter } from '@/i18n/navigation';

/* 칸 어디를 눌러도 정해진 주소로 간다 — 안에 있는 링크 · 버튼 · 입력칸은 제 할 일을 그대로 한다.
   키보드 · 화면 낭독기는 칸 안의 진짜 링크(「자세히」 등)를 쓴다. 글자를 끌어 고르던 중이면 넘어가지 않는다. */
export function ClickArea({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('a, button, input, select, textarea, label, summary, [role="button"]')) return;
    if (window.getSelection()?.toString()) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      window.open(getPathname({ href, locale }), '_blank', 'noopener');
      return;
    }
    router.push(href);
  };
  return (
    <div onClick={onClick} data-cursor="VIEW" className={className ? `${className} cursor-pointer` : 'cursor-pointer'}>
      {children}
    </div>
  );
}
