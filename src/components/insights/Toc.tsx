'use client';

import { useEffect, useState } from 'react';
import { smoothScrollIntoView } from '@/lib/smooth-scroll';
import { cn } from '@/lib/utils';

/* 긴 안내 글의 목차 — 읽고 있는 곳이 밝아지고, 누르면 그 자리로 부드럽게 내려간다 (넓은 화면에서 왼쪽에 붙어 있다) */
export function Toc({ items, label }: { items: { id: string; text: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    // 화면 위 1/3 선을 지난 마지막 제목이 지금 읽는 곳
    const onScroll = () => {
      const line = window.innerHeight * 0.34;
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label={label}>
      <p className="t-label mb-5 text-paper/45">{label}</p>
      <ol className="border-l border-paper/15">
        {items.map((item, i) => {
          const on = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => { e.preventDefault(); smoothScrollIntoView(document.getElementById(item.id)); history.replaceState(null, '', `#${item.id}`); }}
                aria-current={on ? 'location' : undefined}
                className={cn('-ml-px flex gap-3 border-l py-2 pl-4 text-[0.9rem] leading-snug transition-colors duration-300', on ? 'border-accent text-paper' : 'border-transparent text-paper/45 hover:text-paper/80')}
              >
                <span className={cn('font-display text-[0.62rem] font-bold tracking-[0.1em] pt-[0.2em]', on ? 'text-accent' : 'text-paper/30')}>{String(i + 1).padStart(2, '0')}</span>
                <span>{item.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
