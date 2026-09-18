'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { QUOTE_HREF } from '@/lib/constants';
import { ContactForm } from './ContactForm';
import { ContactInfo } from './ContactInfo';
import { QuoteBuilder } from '@/components/quote/QuoteBuilder';

/* ─────────────────────────────────────────────────────────
   ContactTabs
   문의하기 페이지의 두 가지 문의 방법.
   - 간단 문의: 자유 형식 폼 (아이디어 상담·제휴·취재·채용 등)
   - 견적 계산: 행사 정보·서비스를 고르면 예상 비용을 계산하는 단계형 빌더
   두 탭을 모두 그려 두고 숨기기만 해서, 탭을 오가도 입력한 내용이 남는다.
   ───────────────────────────────────────────────────────── */

export type ContactTab = 'inquiry' | 'quote';

const TABS: ContactTab[] = ['inquiry', 'quote'];

export function ContactTabs({ initialTab }: { initialTab: ContactTab }) {
  const t = useTranslations('contact');
  const router = useRouter();
  const [tab, setTab] = useState<ContactTab>(initialTab);
  const tabRefs = useRef<Record<ContactTab, HTMLButtonElement | null>>({ inquiry: null, quote: null });

  // 이미 이 페이지에 있을 때 링크로 다른 탭 주소가 들어오면 따라간다 (예: 견적 탭에서 헤더 '문의하기')
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  function select(next: ContactTab) {
    if (next === tab) return;
    setTab(next);
    router.replace(next === 'quote' ? QUOTE_HREF : '/contact', { scroll: false });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = TABS[(TABS.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    select(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      {/* Tab switcher */}
      <div
        role="tablist"
        aria-label={t('tabs.label')}
        className="mx-auto mb-10 grid max-w-3xl grid-cols-2 gap-3 sm:gap-4"
      >
        {TABS.map((id) => {
          const active = tab === id;
          return (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              type="button"
              role="tab"
              id={`contact-tab-${id}`}
              aria-selected={active}
              aria-controls={`contact-panel-${id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => select(id)}
              onKeyDown={handleKeyDown}
              className={cn(
                'flex flex-col gap-1 rounded-2xl border-2 px-4 py-4 text-left transition-all duration-200 sm:px-6 sm:py-5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2',
                active
                  ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <span
                className={cn(
                  'text-base font-bold sm:text-lg',
                  active ? 'text-teal-700' : 'text-slate-800'
                )}
              >
                {t(`tabs.${id}`)}
              </span>
              <span className="text-xs leading-relaxed text-slate-500 sm:text-sm">
                {t(`tabs.${id}Desc`)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 간단 문의 */}
      <div
        role="tabpanel"
        id="contact-panel-inquiry"
        aria-labelledby="contact-tab-inquiry"
        hidden={tab !== 'inquiry'}
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="mb-6 text-xl font-bold text-slate-900">{t('subtitle')}</h3>
              <ContactForm onRequestQuote={() => select('quote')} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <ContactInfo />
          </div>
        </div>
      </div>

      {/* 견적 계산 */}
      <div
        role="tabpanel"
        id="contact-panel-quote"
        aria-labelledby="contact-tab-quote"
        hidden={tab !== 'quote'}
      >
        <QuoteBuilder />
      </div>
    </div>
  );
}
