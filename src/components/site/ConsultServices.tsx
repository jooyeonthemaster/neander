'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PRODUCTS } from '@/data/products';
import { isConsultationService, SERVICE_TEXT } from '@/lib/quote/catalog';
import { HoverPreviewList, HoverPreviewRow, Reveal } from '@/components/fx';
import { cn } from '@/lib/utils';

/* 상담형 3종(공간 디자인 · 인터랙티브 미디어 아트 · 커스텀 AI 콘텐츠) 목록.
   온라인 시작가가 없어 「별도 문의」로 연결한다. 줄에 마우스를 올리면 대표 사진이 커서를 따라 뜬다. */
export function ConsultServices({ className, startNo = 4 }: { className?: string; startNo?: number }) {
  const t = useTranslations('services');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'ko';
  const consult = PRODUCTS.filter((p) => isConsultationService(p.key));

  return (
    <HoverPreviewList className={cn(className)}>
      <ul className="border-t border-paper/15">
        {consult.map((p, i) => (
          <li key={p.key}>
            <HoverPreviewRow image={p.image}>
              <Reveal delay={i * 70}>
                <Link
                  href="/contact"
                  className="group grid items-baseline gap-x-8 gap-y-1 border-b border-paper/15 py-6 transition-colors duration-500 hover:border-paper/60 md:grid-cols-[4rem_minmax(0,22rem)_1fr_auto] lg:py-7"
                >
                  <span className="t-label text-paper/40">{String(i + startNo).padStart(2, '0')}</span>
                  <span className="text-xl font-bold tracking-[-0.02em] text-paper transition-transform duration-500 group-hover:translate-x-2 lg:text-2xl">{SERVICE_TEXT[p.key].name[lang]}</span>
                  <span className="text-[0.95rem] leading-relaxed text-paper/55">{SERVICE_TEXT[p.key].summary[lang]}</span>
                  <span className="t-label inline-flex items-center gap-2 whitespace-nowrap text-paper/70 transition-colors group-hover:text-accent">{t('consultationOnly')} <span aria-hidden="true">→</span></span>
                </Link>
              </Reveal>
            </HoverPreviewRow>
          </li>
        ))}
      </ul>
    </HoverPreviewList>
  );
}
