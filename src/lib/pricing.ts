import { pricingTiers, addOns } from '@/data/pricing';

export function calculateTotalEstimate(
  services: { serviceKey: string; options: Record<string, string | number | boolean> }[],
  selectedAddOnIds: string[],
  durationDays: number
): {
  servicesSubtotal: number;
  addOnsSubtotal: number;
  durationMultiplier: number;
  estimatedTotal: number;
} {
  let servicesSubtotal = 0;

  for (const svc of services) {
    const tier = pricingTiers.find((t) => t.serviceKey === svc.serviceKey);
    if (!tier) continue;

    let svcTotal = tier.basePriceKRW;

    for (const opt of tier.options) {
      const val = svc.options[opt.id] ?? opt.defaultValue;

      if (opt.type === 'toggle' && val === true) {
        svcTotal += opt.priceModifier as number;
      } else if (opt.type === 'select' && typeof opt.priceModifier === 'object') {
        svcTotal += (opt.priceModifier as Record<string, number>)[val as string] ?? 0;
      } else if (opt.type === 'number' && typeof val === 'number') {
        const multiplied = opt.id === 'boothCount' || opt.id === 'kiosk' ? val - 1 : val;
        svcTotal += (opt.priceModifier as number) * Math.max(0, multiplied);
      }
    }

    servicesSubtotal += svcTotal;
  }

  let addOnsDaily = 0;
  let addOnsFixed = 0;
  for (const id of selectedAddOnIds) {
    const addon = addOns.find((a) => a.id === id);
    if (!addon) continue;
    if (addon.perDay) {
      addOnsDaily += addon.priceKRW;
    } else {
      addOnsFixed += addon.priceKRW;
    }
  }
  const addOnsSubtotal = addOnsDaily + addOnsFixed;

  const durationMultiplier = durationDays > 1 ? 1 + (durationDays - 1) * 0.3 : 1;
  const estimatedTotal = Math.round((servicesSubtotal + addOnsDaily) * durationMultiplier + addOnsFixed);

  return {
    servicesSubtotal,
    addOnsSubtotal,
    durationMultiplier,
    estimatedTotal,
  };
}

export function formatKRW(amount: number): string {
  if (amount >= 100000000) {
    // 4.6억원처럼 소수로 줄이면 견적 금액이 부정확해지므로 억·만 단위를 함께 쓴다 (4억 6,272만원)
    const totalMan = Math.round(amount / 10000);
    const eok = Math.floor(totalMan / 10000);
    const man = totalMan % 10000;
    return man > 0 ? `${eok}억 ${man.toLocaleString('ko-KR')}만원` : `${eok}억원`;
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString('ko-KR')}만원`;
  }
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * 로케일에 맞춰 금액을 표시한다.
 * 한국어는 억/만원 단위, 그 외에는 통화 기호가 붙은 전체 금액을 쓴다.
 * (영문 페이지에서 '300만원'이나 '3000K KRW' 같은 표기가 나오지 않도록)
 */
export function formatPrice(amount: number, locale: string): string {
  if (locale === 'ko') return formatKRW(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}
