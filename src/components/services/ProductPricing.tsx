import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { quoteHrefFor } from '@/data/products';
import type { CoreServiceKey } from '@/data/site';
import { COMMON, CUSTOM_DEV, KIOSK, PERFUME, PHOTO_BOOTH, SERVICE_TEXT } from '@/lib/quote/catalog';
import { startingPrice } from '@/lib/quote/engine';
import { formatPrice } from '@/lib/quote/format';
import { Reveal } from '@/components/fx';
import { cn } from '@/lib/utils';
import { keepNumbersTogether } from '@/lib/keep-numbers';

/* ─────────────────────────────────────────────────────────
   주력 3종의 가격표 — 숫자는 모두 온라인 견적 가격표(src/lib/quote/catalog.ts)에서 읽는다.
   가격을 바꿀 때는 catalog.ts 만 고치면 여기도 함께 바뀐다.
   ───────────────────────────────────────────────────────── */

interface Row { label: string; note?: string; value: string }

function rowsFor(key: CoreServiceKey, lang: 'ko' | 'en'): { base: Row[]; options: Row[] } {
  const ko = lang === 'ko';
  const p = (n: number) => formatPrice(n, lang);
  // 원 단위 그대로 (15,000원) — 만원 단위로 반올림하면 1인 단가가 틀려 보인다
  const won = (n: number) => (ko ? `${n.toLocaleString('ko-KR')}원` : p(n));
  const from = (n: number, f: (n: number) => string = p) => (ko ? `${f(n)}부터` : `from ${f(n)}`);
  if (key === 'acscent') {
    const [t1, t2, t3] = PERFUME.tiers;
    return {
      base: [
        // 1인 단가는 만원 단위로 줄이지 않는다 (18,000원이 '2만원'으로 보이던 것 — 2026-11-21 온라인 견적과 대조해 고침)
        ...(['10ml', '50ml'] as const).map((v) => ({
          label: ko ? `1인 단가 · ${v}` : `Per guest · ${v}`,
          note: ko
            ? `${t1.min}–${t1.max}명 ${won(t1.unit[v])} · ${t2.min}–${t2.max}명 ${won(t2.unit[v])} · ${t3.min}명 이상 ${won(t3.unit[v])}`
            : `${t1.min}–${t1.max}: ${won(t1.unit[v])} · ${t2.min}–${t2.max}: ${won(t2.unit[v])} · ${t3.min}+: ${won(t3.unit[v])}`,
          value: from(t3.unit[v], won),
        })),
        { label: ko ? '조향 팀 출장비' : 'Perfumer team travel', note: ko ? '조향사 1 + 조수 1 · 팀 · 운영일마다 · 서울 기준' : '1 perfumer + 1 assistant · per team per day · Seoul', value: p(PERFUME.teamTravel.seoul) },
      ],
      options: [
        { label: ko ? '분석용 AI 키오스크' : 'Analysis kiosk', note: ko ? `대당 · 추가 1일 ${p(PERFUME.analysisKioskExtraDay)} (기본은 QR 휴대폰 분석)` : `per kiosk · extra day ${p(PERFUME.analysisKioskExtraDay)} (default: QR on guests’ phones)`, value: p(PERFUME.analysisKiosk) },
        { label: ko ? '고급 선물 포장' : 'Premium gift packaging', note: ko ? `병당 · 50ml ${p(PERFUME.premiumPackaging['50ml'])}` : `per bottle · 50ml ${p(PERFUME.premiumPackaging['50ml'])}`, value: p(PERFUME.premiumPackaging['10ml']) },
        { label: ko ? '커스텀 향 디자인' : 'Custom scent design', note: ko ? '브랜드 전용 향 개발' : 'Signature scent for the brand', value: p(PERFUME.customScent) },
        { label: ko ? '전용 디자인 단박스' : 'Custom-designed box', note: ko ? `${PERFUME.customBox.minGuests}명 이상 · 디자인비 포함` : `${PERFUME.customBox.minGuests}+ guests · design included`, value: from(PERFUME.customBox.minimum) },
        { label: ko ? '연장 운영' : 'Extended hours', note: ko ? `기본 ${COMMON.baseHours}시간 초과 · 인력 1명(또는 기기 1대) 시간당 · 조향 1팀(2명)은 시간당 ${p(COMMON.extraHourPerDay * 2)}` : `beyond ${COMMON.baseHours} hours · per staff (or device) per hour · a perfumer team (2) is ${p(COMMON.extraHourPerDay * 2)}/hour`, value: p(COMMON.extraHourPerDay) },
      ],
    };
  }
  if (key === 'photoBooth') {
    return {
      base: [
        { label: ko ? '2 · 3번째 부스' : '2nd and 3rd booth', note: ko ? `대당 1일 · 최대 ${PHOTO_BOOTH.maxBooths}대` : `per booth per day · up to ${PHOTO_BOOTH.maxBooths}`, value: p(PHOTO_BOOTH.extraBooth) },
        { label: ko ? '대당 추가 1일' : 'Extra day per booth', value: p(PHOTO_BOOTH.extraDayPerBooth) },
        { label: ko ? '현장 운영 인력' : 'On-site staff', note: ko ? '1명 1일' : 'per person per day', value: p(COMMON.staffPerDay) },
      ],
      options: [
        { label: ko ? 'AI 스타일 추가' : 'Extra AI style', note: ko ? `1종마다 · 기본 ${PHOTO_BOOTH.includedStyles}종 포함` : `each · ${PHOTO_BOOTH.includedStyles} included`, value: p(PHOTO_BOOTH.extraStyle) },
        { label: ko ? '인화 1롤 추가' : 'Extra print roll', note: ko ? `${PHOTO_BOOTH.printsPerRoll}장` : `${PHOTO_BOOTH.printsPerRoll} prints`, value: p(PHOTO_BOOTH.extraPrintRoll) },
        { label: ko ? '부스 랩핑' : 'Booth wrapping', note: ko ? '행사 디자인으로 외관 연출' : 'Exterior in your event design', value: p(PHOTO_BOOTH.wrapping) },
        { label: ko ? '전용 AI 스타일' : 'Dedicated AI style', note: ko ? `1종 · ${CUSTOM_DEV.leadDays.style}일 전 확정` : `each · confirm ${CUSTOM_DEV.leadDays.style} days ahead`, value: p(CUSTOM_DEV.boothStyle) },
        { label: ko ? '촬영 흐름 · 화면 커스텀' : 'Flow & screen customization', note: ko ? `${CUSTOM_DEV.leadDays.flow / 7}주 전 확정` : `confirm ${CUSTOM_DEV.leadDays.flow / 7} weeks ahead`, value: p(CUSTOM_DEV.booth.flow) },
        { label: ko ? '전용 AI 기능 개발' : 'Dedicated AI feature', note: ko ? `${CUSTOM_DEV.leadDays.dedicated / 7}주 전 확정` : `confirm ${CUSTOM_DEV.leadDays.dedicated / 7} weeks ahead`, value: from(CUSTOM_DEV.booth.dedicated) },
      ],
    };
  }
  return {
    base: [
      { label: ko ? '추가 키오스크' : 'Additional kiosk', note: ko ? `2대째부터 대당 · 최대 ${KIOSK.maxKiosks}대` : `each from the 2nd · up to ${KIOSK.maxKiosks}`, value: p(KIOSK.extraKiosk) },
      { label: ko ? '대당 추가 1일' : 'Extra day per kiosk', value: p(KIOSK.extraDayPerKiosk) },
      { label: ko ? '상시 운영' : 'Long-term placement', note: ko ? '대당 월 · 콘텐츠 월 1회 교체 포함' : 'per kiosk per month · monthly content refresh', value: p(KIOSK.monthlyPerKiosk) },
    ],
    options: [
      { label: ko ? '브랜드 적용' : 'Branding', note: ko ? `로고 · 색 · 문구 · ${CUSTOM_DEV.leadDays.brand / 7}주 전 확정` : `logo, colors, copy · confirm ${CUSTOM_DEV.leadDays.brand / 7} week ahead`, value: p(CUSTOM_DEV.kiosk.brand) },
      { label: ko ? '콘텐츠 커스텀' : 'Content customization', note: ko ? `질문 · 결과 유형 · 화면 · ${CUSTOM_DEV.leadDays.content / 7}주 전 확정` : `questions, results, screens · confirm ${CUSTOM_DEV.leadDays.content / 7} weeks ahead`, value: p(CUSTOM_DEV.kiosk.content) },
      { label: ko ? '전용 체험 개발' : 'Dedicated experience', note: ko ? `새 AI 분석 · 생성 · ${CUSTOM_DEV.leadDays.dedicated / 7}주 전 확정` : `new AI logic · confirm ${CUSTOM_DEV.leadDays.dedicated / 7} weeks ahead`, value: from(CUSTOM_DEV.kiosk.dedicated) },
      { label: ko ? '현장 운영 인력' : 'On-site staff', note: ko ? '1명 1일' : 'per person per day', value: p(COMMON.staffPerDay) },
    ],
  };
}

export async function ProductPricing({ service, locale }: { service: CoreServiceKey; locale: string }) {
  const lang = locale === 'en' ? 'en' : 'ko';
  const ko = lang === 'ko';
  const t = await getTranslations({ locale, namespace: 'pricingGuide' });
  const { base, options } = rowsFor(service, lang);
  const price = formatPrice(startingPrice(service), lang);
  const name = SERVICE_TEXT[service].name[lang];

  const table = (rows: Row[], light: boolean) => (
    <dl>
      {rows.map((r) => (
        <div key={r.label} className={light ? 'flex items-baseline justify-between gap-6 border-t border-ink/15 py-3.5' : 'flex items-baseline justify-between gap-6 border-t border-paper/12 py-3.5'}>
          <dt className="min-w-0">
            <span className="block text-[0.98rem] font-semibold tracking-[-0.01em]">{r.label}</span>
            {/* 금액만 한 줄로 묶는다 — 아이폰(WebKit)이 숫자의 쉼표 뒤에서 줄을 바꿔 「15,」/「000원」으로 갈라졌다.
                (설명 전체를 묶으면 긴 영어 설명이 휴대폰 폭을 넘는다) */}
            {r.note && <span className={light ? 'mt-0.5 block text-[13px] text-ink/55' : 'mt-0.5 block text-[13px] text-paper/45'}>{keepNumbersTogether(r.note)}</span>}
          </dt>
          <dd className="shrink-0 whitespace-nowrap text-[0.98rem] font-bold">{r.value}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        {/* 밝은 종이 — 시작가. 등장 효과 없이 처음부터 보인다 (스크립트가 늦게 도는 휴대폰에서도 가격·견적 버튼이 숨지 않게) */}
        <div className="bg-paper p-7 text-ink lg:p-10" data-cta-area="price_card">
          <p className="t-label text-ink/50">{name}</p>
          {/* 영어는 「from ₩890,000」처럼 길어 휴대폰 폭(카드 안쪽 약 290px)을 넘는다 — 모바일에서는 from 을 윗줄로 올리고 글씨를 줄인다 */}
          <p className={cn('mt-4 font-display font-extrabold leading-none tracking-[-0.03em]', ko ? 'text-[clamp(2.75rem,5.4vw,4.75rem)]' : 'text-[clamp(1.75rem,8.5vw,2.75rem)] sm:text-[clamp(2.75rem,5.4vw,4.75rem)]')}>
            {!ko && <span className="mb-2 block font-body text-lg font-bold tracking-normal sm:mb-0 sm:mr-2 sm:inline">{t('from')}</span>}
            {price}
            {ko && <span className="ml-1.5 font-body text-xl font-bold tracking-[-0.02em]">{t('from')}</span>}
          </p>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/65">{t(`basis.${service}`)}</p>
          <div className="mt-6">{table(base, true)}</div>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href={quoteHrefFor(service)} className="inline-flex min-h-12 items-center gap-2.5 bg-ink px-6 text-[0.95rem] font-semibold text-paper transition-colors duration-300 hover:bg-accent hover:text-ink">
              {ko ? '이 체험으로 견적 계산' : 'Estimate with this'} <span aria-hidden="true" className="font-display">→</span>
            </Link>
            <Link href="/contact" className="inline-flex min-h-12 items-center border border-ink/60 px-6 text-[0.95rem] font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper">
              {ko ? '문의하기' : 'Ask us'}
            </Link>
          </div>
        </div>
        <Reveal delay={90} className="border border-paper/15 p-7 lg:p-10">
          <p className="t-label mb-5 text-paper/50">OPTIONS{ko && <span className="ml-2 font-body text-[11px] font-medium normal-case tracking-normal text-paper/40">옵션</span>}</p>
          {table(options, false)}
        </Reveal>
      </div>
      <p className="mt-5 text-[13px] leading-relaxed text-paper/45">
        {t('startingNote')} {ko ? '지역별 운송비는 별도이며, 제주 및 도서 지역은 운영하지 않습니다.' : 'Regional transport is extra; we do not operate on Jeju or other islands.'}
      </p>
    </div>
  );
}
