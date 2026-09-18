'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { pricingTiers, addOns, type PricingOption } from '@/data/pricing';

export interface SelectedService {
  id: string;
  serviceKey: string;
  options: Record<string, string | number | boolean>;
  subtotal: number;
}

export interface EventDetails {
  type: 'popup' | 'festival' | 'exhibition' | 'concert' | 'brand-event' | 'other';
  duration: number;
  expectedAttendees: number;
  venueSize: 'small' | 'medium' | 'large';
  location: string;
  date: string;
  description: string;
}

interface QuoteState {
  services: SelectedService[];
  eventDetails: EventDetails;
  selectedAddOns: string[];

  addService: (serviceKey: string) => void;
  removeService: (id: string) => void;
  updateServiceOption: (id: string, optionId: string, value: string | number | boolean) => void;
  updateEventDetails: (details: Partial<EventDetails>) => void;
  toggleAddOn: (addOnId: string) => void;
  getEstimate: () => { subtotal: number; addOnsTotal: number; durationMultiplier: number; total: number };
  reset: () => void;
}

const initialEventDetails: EventDetails = {
  type: 'popup',
  duration: 1,
  expectedAttendees: 100,
  venueSize: 'small',
  location: '',
  date: '',
  description: '',
};

function calculateServicePrice(serviceKey: string, options: Record<string, string | number | boolean>): number {
  const tier = pricingTiers.find((t) => t.serviceKey === serviceKey);
  if (!tier) return 0;

  let total = tier.basePriceKRW;

  for (const opt of tier.options) {
    const value = options[opt.id] ?? opt.defaultValue;
    if (opt.type === 'toggle' && value === true) {
      total += opt.priceModifier as number;
    } else if (opt.type === 'select' && typeof opt.priceModifier === 'object') {
      total += (opt.priceModifier as Record<string, number>)[value as string] ?? 0;
    } else if (opt.type === 'number' && typeof value === 'number') {
      const base = opt.id === 'boothCount' || opt.id === 'kiosk' ? value - 1 : value;
      total += (opt.priceModifier as number) * Math.max(0, base);
    }
  }

  return total;
}

/**
 * 옵션을 모두 최솟값으로 골랐을 때의 가격 ("~부터" 표시용).
 * 기본가만 보여주면 최소 수량이 1 이상인 옵션(예: AI 스타일)의 비용이 빠져 실제보다 싸게 보인다.
 */
export function getStartingPrice(serviceKey: string): number {
  const tier = pricingTiers.find((t) => t.serviceKey === serviceKey);
  if (!tier) return 0;

  const options: Record<string, string | number | boolean> = {};
  for (const opt of tier.options) {
    if (opt.type === 'toggle') {
      options[opt.id] = false;
    } else if (opt.type === 'select' && typeof opt.priceModifier === 'object') {
      const prices = opt.priceModifier as Record<string, number>;
      options[opt.id] = Object.keys(prices).reduce((a, b) => (prices[a] <= prices[b] ? a : b));
    } else if (opt.type === 'number') {
      options[opt.id] = opt.min ?? 0;
    }
  }
  return calculateServicePrice(serviceKey, options);
}

function getDefaultOptions(serviceKey: string): Record<string, string | number | boolean> {
  const tier = pricingTiers.find((t) => t.serviceKey === serviceKey);
  if (!tier) return {};
  const opts: Record<string, string | number | boolean> = {};
  for (const opt of tier.options) {
    opts[opt.id] = opt.defaultValue;
  }
  return opts;
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      services: [],
      eventDetails: initialEventDetails,
      selectedAddOns: [],

      addService: (serviceKey: string) => {
        const existing = get().services.find((s) => s.serviceKey === serviceKey);
        if (existing) return;

        const options = getDefaultOptions(serviceKey);
        const subtotal = calculateServicePrice(serviceKey, options);

        set((state) => ({
          services: [
            ...state.services,
            {
              id: `${serviceKey}-${Date.now()}`,
              serviceKey,
              options,
              subtotal,
            },
          ],
        }));
      },

      removeService: (id: string) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),

      updateServiceOption: (id: string, optionId: string, value: string | number | boolean) =>
        set((state) => ({
          services: state.services.map((s) => {
            if (s.id !== id) return s;
            const newOptions = { ...s.options, [optionId]: value };
            return {
              ...s,
              options: newOptions,
              subtotal: calculateServicePrice(s.serviceKey, newOptions),
            };
          }),
        })),

      updateEventDetails: (details: Partial<EventDetails>) =>
        set((state) => ({
          eventDetails: { ...state.eventDetails, ...details },
        })),

      toggleAddOn: (addOnId: string) =>
        set((state) => ({
          selectedAddOns: state.selectedAddOns.includes(addOnId)
            ? state.selectedAddOns.filter((a) => a !== addOnId)
            : [...state.selectedAddOns, addOnId],
        })),

      getEstimate: () => {
        const { services, eventDetails, selectedAddOns } = get();
        const subtotal = services.reduce((sum, s) => sum + s.subtotal, 0);

        let addOnsDaily = 0;
        let addOnsFixed = 0;
        for (const id of selectedAddOns) {
          const addon = addOns.find((a) => a.id === id);
          if (!addon) continue;
          if (addon.perDay) {
            addOnsDaily += addon.priceKRW;
          } else {
            addOnsFixed += addon.priceKRW;
          }
        }
        const addOnsTotal = addOnsDaily + addOnsFixed;

        const durationMultiplier =
          eventDetails.duration > 1 ? 1 + (eventDetails.duration - 1) * 0.3 : 1;

        const total = Math.round((subtotal + addOnsDaily) * durationMultiplier + addOnsFixed);

        return { subtotal, addOnsTotal, durationMultiplier, total };
      },

      reset: () =>
        set({
          services: [],
          eventDetails: initialEventDetails,
          selectedAddOns: [],
        }),
    }),
    {
      name: 'neander-quote',
      // 서버는 저장값 없이 그리므로, 첫 렌더에 localStorage 값을 쓰면 하이드레이션 불일치가 난다.
      // QuoteBuilder가 마운트된 뒤 rehydrate()로 불러온다.
      skipHydration: true,
    }
  )
);
