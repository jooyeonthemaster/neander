'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { QUOTE_HREF, getServiceContactHref } from '@/lib/constants';
import { experiences } from '@/data/experiences';
import { Select } from '@/components/ui';
import { ContactForm } from './ContactForm';
import { ContactInfo } from './ContactInfo';

/* ─────────────────────────────────────────────────────────
   ContactTabs
   문의하기 페이지의 두 가지 문의 방법.
   - 간단 문의: 자유 형식 폼 (아이디어 상담·제휴·취재·채용 등)
   - 견적 계산: 온라인 견적 페이지(/quote)로 이동한다 (고른 체험을 함께 넘긴다)
   ───────────────────────────────────────────────────────── */

export type ContactTab = 'inquiry' | 'quote';

const TABS: ContactTab[] = ['inquiry', 'quote'];

export function ContactTabs({ initialTab, initialService, developmentInquiry = false }: {
  initialTab: ContactTab;
  initialService?: string;
  developmentInquiry?: boolean;
}) {
  const t = useTranslations('contact');
  const tService = useTranslations('services');
  const locale = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<ContactTab>(initialTab);
  const [serviceSlug, setServiceSlug] = useState(initialService ?? '');
  const tabRefs = useRef<Record<ContactTab, HTMLButtonElement | null>>({ inquiry: null, quote: null });

  // 이미 이 페이지에 있을 때 링크로 다른 탭 주소가 들어오면 따라간다 (예: 견적 탭에서 헤더 '문의하기')
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);
  useEffect(() => { setServiceSlug(initialService ?? ''); }, [initialService]);

  function select(next: ContactTab) {
    if (next === tab) return;
    if (next === 'quote') {
      router.push(serviceSlug ? getServiceContactHref(serviceSlug) : QUOTE_HREF);
      return;
    }
    setTab(next);
    router.replace(serviceSlug ? getServiceContactHref(serviceSlug, false) : '/contact', { scroll: false });
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
      {!developmentInquiry && (
        <>
          <div className="mx-auto mb-6 max-w-3xl" data-service-context>
            <Select id="contact-service" label={locale === 'ko' ? '관심 있는 체험' : 'Experience of interest'} value={serviceSlug}
              options={[{ value: '', label: locale === 'ko' ? '아직 정하지 않았어요' : 'Not decided yet' }, ...experiences.map((experience) => ({ value: experience.slug, label: tService(experience.nameKey) }))]}
              onValueChange={(slug) => {
                setServiceSlug(slug);
                router.replace(slug ? getServiceContactHref(slug, tab === 'quote') : tab === 'quote' ? QUOTE_HREF : '/contact', { scroll: false });
              }} />
          </div>
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
        </>
      )}

      {/* 간단 문의 */}
      <div
        role={developmentInquiry ? 'region' : 'tabpanel'}
        id="contact-panel-inquiry"
        aria-labelledby={developmentInquiry ? 'development-inquiry-title' : 'contact-tab-inquiry'}
        hidden={!developmentInquiry && tab !== 'inquiry'}
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 id={developmentInquiry ? 'development-inquiry-title' : undefined} className="mb-6 text-xl font-bold text-slate-900">
                {developmentInquiry ? t('form.subjectOptions.development') : t('subtitle')}
              </h3>
              <ContactForm
                onRequestQuote={developmentInquiry ? undefined : () => select('quote')}
                serviceSlug={developmentInquiry ? undefined : serviceSlug}
                developmentInquiry={developmentInquiry}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <ContactInfo />
          </div>
        </div>
      </div>

    </div>
  );
}
