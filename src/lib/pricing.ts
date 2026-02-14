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
    return `${(amount / 100000000).toFixed(1)}억원`;
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}
