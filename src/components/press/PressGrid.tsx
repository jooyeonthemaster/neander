'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useLocale, useTranslations } from 'next-intl';
import { db } from '@/lib/firebase/config';
import type { NewsArticle } from '@/types/admin';
import type { PressArticle } from '@/types';
import { Reveal } from '@/components/fx';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   언론 보도 목록 (2026-11 개편)
   관리자 화면에서 올린 기사(Firestore news)를 보도일 최신순으로, 달마다 묶어 한 줄씩 보여 준다.
   달 이름은 내려 읽는 동안 왼쪽에 붙어 있다. 원문 주소가 있는 기사만 링크가 된다.
   ───────────────────────────────────────────────────────── */

interface PressGridProps {
  articles?: PressArticle[];
}

export function PressGrid({ articles: staticArticles }: PressGridProps) {
  const t = useTranslations('press');
  const locale = useLocale();
  const ko = locale !== 'en';
  const [articles, setArticles] = useState<PressArticle[]>(staticArticles || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: PressArticle[] = snapshot.docs
          .map((d) => {
            const data = d.data() as Omit<NewsArticle, 'id'>;
            if (!data.is_published) return null;
            return {
              id: d.id,
              title: data.title,
              source: data.source_name || '',
              date: data.published_at?.split('T')[0] || data.created_at?.split('T')[0] || '',
              url: data.source_url || '',
              excerpt: data.summary,
            };
          })
          .filter(Boolean) as PressArticle[];
        // 여러 기사를 한 번에 등록하면 created_at이 같아지므로 보도일 기준으로 최신순 정렬한다.
        items.sort((a, b) => b.date.localeCompare(a.date));
        setArticles(items);
        setLoading(false);
      },
      () => {
        // Firestore 실패 시 정적 데이터 유지
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center" role="status">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-paper/20 border-t-accent" aria-hidden="true" />
      </div>
    );
  }

  if (articles.length === 0) {
    return <p className="py-24 text-center text-paper/50">{t('noArticles')}</p>;
  }

  // 달마다 묶는다 (YYYY-MM)
  const groups: { month: string; items: PressArticle[] }[] = [];
  for (const article of articles) {
    const month = article.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.items.push(article);
    else groups.push({ month, items: [article] });
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-6 border-b border-paper/20 pb-6">
        <p className="t-label text-paper/55">{ko ? '보도일 최신순' : 'NEWEST FIRST'}</p>
        <p className="font-display text-sm font-semibold tracking-[0.14em] text-paper/55">
          <span className="mr-2.5 text-[clamp(2.2rem,4.6vw,3.8rem)] font-extrabold leading-none tracking-[-0.03em] text-paper">{articles.length}</span>ARTICLES
        </p>
      </div>

      {groups.map((group) => {
        const [year, month] = group.month.split('-');
        return (
          <section key={group.month} className="grid gap-x-10 border-b border-paper/20 lg:grid-cols-[11rem_minmax(0,1fr)]" aria-label={`${year}.${month}`}>
            <div className="pt-7 lg:pb-7">
              <h3 className="font-display font-extrabold leading-none tracking-[-0.02em] text-paper lg:sticky lg:top-24">
                <span className="text-[clamp(1.7rem,3vw,2.6rem)]">{month}</span>
                <span className="ml-2 text-sm font-semibold tracking-[0.1em] text-paper/40">{year}</span>
              </h3>
            </div>
            <ul className="py-2">
              {group.items.map((article, i) => {
                // 원문 주소가 없는 글(공지·이벤트)은 클릭해도 갈 곳이 없으므로 링크로 만들지 않는다
                const hasLink = Boolean(article.url) && article.url !== '#';
                const Wrapper = hasLink ? 'a' : 'div';
                return (
                  <li key={article.id} className={cn(i > 0 && 'border-t border-paper/10')}>
                    <Reveal delay={(i % 4) * 50}>
                      <Wrapper
                        {...(hasLink ? { href: article.url, target: '_blank', rel: 'noopener noreferrer', 'data-cursor': 'READ' } : {})}
                        className="group relative grid items-baseline gap-x-8 gap-y-2 py-6 md:grid-cols-[5.5rem_9.5rem_minmax(0,1fr)_1.5rem]"
                      >
                        <span aria-hidden="true" className="absolute inset-y-0 -inset-x-4 -z-10 origin-left scale-x-0 bg-paper/[0.045] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
                        <time dateTime={article.date} className="font-display text-[0.82rem] font-semibold tracking-[0.06em] text-paper/45">{article.date.slice(5).replace('-', '.')}</time>
                        <span className="text-[0.92rem] font-semibold text-accent">{article.source}</span>
                        <span className="min-w-0">
                          <span className="t-kr-title block text-[clamp(1.05rem,1.5vw,1.3rem)] text-paper transition-transform duration-500 group-hover:translate-x-1.5">{article.title}</span>
                          {article.excerpt && <span className="mt-2 block text-[0.92rem] leading-relaxed text-paper/50">{article.excerpt}</span>}
                        </span>
                        {hasLink && (
                          <span className="hidden justify-self-end font-display text-lg text-paper/35 transition-[color,transform] duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent md:block" aria-hidden="true">↗</span>
                        )}
                        {hasLink && <span className="sr-only">{t('readMore')}</span>}
                      </Wrapper>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
