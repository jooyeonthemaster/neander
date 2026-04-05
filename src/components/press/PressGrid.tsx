'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { NewsArticle } from '@/types/admin';
import type { PressArticle } from '@/types';
import { useTranslations } from 'next-intl';
import { ScrollReveal } from '@/components/animations';
import { PressCard } from './PressCard';

interface PressGridProps {
  articles?: PressArticle[];
}

export function PressGrid({ articles: staticArticles }: PressGridProps) {
  const t = useTranslations('press');
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
              url: data.source_url || '#',
              excerpt: data.summary,
            };
          })
          .filter(Boolean) as PressArticle[];
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
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="py-20 text-center text-slate-400">
        {t('noArticles')}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <ScrollReveal key={article.id} delay={index * 0.08}>
          <PressCard article={article} />
        </ScrollReveal>
      ))}
    </div>
  );
}
