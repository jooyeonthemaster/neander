import { getTranslations } from 'next-intl/server';
import { ScrollReveal } from '@/components/animations';
import { Link } from '@/i18n/navigation';
import { QUOTE_HREF } from '@/lib/constants';
import { SERVICE_ORDER, SERVICE_TEXT, isConsultationService } from '@/lib/quote/catalog';
import { startingPrice } from '@/lib/quote/engine';

/* ─────────────────────────────────────────────────────────
   비용·운영 안내
   - compact (/services): 서비스별 시작가 + 온라인 견적으로 가는 버튼
   - full (/quote): 시작가 + 가격 결정 요인 + 규모별 가이드 + 운영 형태
   시작가는 온라인 견적과 같은 계산(src/lib/quote)을 쓴다.
   ───────────────────────────────────────────────────────── */

const FACTOR_KEYS = ['duration', 'scale', 'custom', 'output', 'staff', 'venue'] as const;
const MODEL_KEYS = ['rental', 'monthly'] as const;

export async function PricingGuide({ locale, variant = 'full' }: { locale: string; variant?: 'compact' | 'full' }) {
  const t = await getTranslations({ locale, namespace: 'pricingGuide' });
  const lang = locale === 'en' ? 'en' : 'ko';
  const fmt = (n: number) => (lang === 'ko' ? `${(n / 10000).toLocaleString('ko-KR')}만원` : `KRW ${n.toLocaleString('en-US')}`);

  const starting = SERVICE_ORDER.map((key) => ({
    key,
    name: SERVICE_TEXT[key].name[lang],
    consultation: isConsultationService(key),
    price: isConsultationService(key) ? (lang === 'ko' ? '별도 문의' : 'On request') : fmt(startingPrice(key)),
    desc: SERVICE_TEXT[key].summary[lang],
    basis: !isConsultationService(key) && t.has(`basis.${key}`) ? t(`basis.${key}`) : '',
  }));

  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-20 sm:py-28" aria-labelledby="pricing-title">
      <div className="container-wide">
        <ScrollReveal>
          <p className="text-xs font-semibold tracking-[0.2em] text-teal-600">{t('eyebrow')}</p>
          <h2 id="pricing-title" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">{t('subtitle')}</p>
        </ScrollReveal>

        {/* 시작가 — 설명 툴팁이 아래 섹션 위로 뜨도록 쌓임 순서를 올린다 */}
        <ScrollReveal delay={0.05} className="relative z-10">
          <h3 className="mt-12 text-lg font-bold text-slate-900">{t('startingTitle')}</h3>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {starting.map((item) => (
              // 마우스를 올리거나(데스크톱) 탭·키보드로 포커스하면(모바일·접근성) 서비스 설명이 카드 아래로 펼쳐진다
              <li
                key={item.key}
                tabIndex={0}
                aria-describedby={`price-desc-${item.key}`}
                className="group/price relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl border border-slate-200 p-5 outline-none transition-colors hover:border-teal-300 hover:bg-teal-50/40 focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-200"
              >
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  {item.name}
                  <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold text-slate-400 group-hover/price:border-teal-400 group-hover/price:text-teal-600">
                    ?
                  </span>
                </span>
                <span
                  id={`price-desc-${item.key}`}
                  role="tooltip"
                  className="pointer-events-none invisible absolute left-3 right-3 top-[calc(100%-6px)] z-20 translate-y-1 rounded-xl bg-slate-900 px-4 py-3 text-left text-xs leading-relaxed text-slate-100 opacity-0 shadow-xl transition-all duration-200 group-hover/price:visible group-hover/price:translate-y-0 group-hover/price:opacity-100 group-focus/price:visible group-focus/price:translate-y-0 group-focus/price:opacity-100"
                >
                  {item.desc}
                </span>
                <span className="shrink-0 text-lg font-bold text-slate-900">
                  {!item.consultation && lang !== 'ko' && <span className="mr-1 text-sm font-medium text-slate-500">{t('from')}</span>}
                  {item.price}
                  {!item.consultation && lang === 'ko' && <span className="ml-0.5 text-sm font-medium text-slate-500">{t('from')}</span>}
                </span>
                {/* 이 시작가가 나오는 조건 */}
                {item.basis && (
                  <span className="w-full text-right text-xs leading-relaxed text-slate-400">{item.basis}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">{t('startingNote')} · {t('hoverHint')}</p>
        </ScrollReveal>

        {variant === 'full' && (
          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* 가격 결정 요인 */}
            <ScrollReveal delay={0.1}>
              <h3 className="text-lg font-bold text-slate-900">{t('factorsTitle')}</h3>
              <dl className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {FACTOR_KEYS.map((key) => (
                  <div key={key} className="grid grid-cols-[7.5rem_1fr] gap-4 px-5 py-3.5 text-sm sm:grid-cols-[9rem_1fr]">
                    <dt className="font-semibold text-slate-800">{t(`factors.${key}.name`)}</dt>
                    <dd className="text-slate-600">{t(`factors.${key}.desc`)}</dd>
                  </div>
                ))}
              </dl>
            </ScrollReveal>

            <div className="space-y-10">
              {/* 규모별 가이드 */}
              <ScrollReveal delay={0.15}>
                <h3 className="text-lg font-bold text-slate-900">{t('scaleTitle')}</h3>
                <ul className="mt-4 space-y-3">
                  {(['scaleAcscent', 'scaleKiosk'] as const).map((key) => (
                    <li key={key} className="rounded-2xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-700">
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>

              {/* 운영 형태 */}
              <ScrollReveal delay={0.2}>
                <h3 className="text-lg font-bold text-slate-900">{t('modelsTitle')}</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {MODEL_KEYS.map((key) => (
                    <div key={key} className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{t(`models.${key}.name`)}</span>
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                          {t(`models.${key}.tag`)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(`models.${key}.desc`)}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}

        {variant === 'compact' && (
          <ScrollReveal delay={0.1}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={QUOTE_HREF}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
              >
                {t('cta')}
              </Link>
              <Link
                href="/brochure"
                className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-slate-300 px-6 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
