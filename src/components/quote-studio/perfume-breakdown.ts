import { PERFUME } from '@/lib/quote/catalog';
import { getPerfumeStaffing, perfumeGuestCost, type QuoteInput, type QuoteItem } from '@/lib/quote/engine';

type PerfumeOptions = Extract<QuoteItem, { key: 'acscent' }>['options'];

/**
 * AI 향수 체험의 기본 금액이 어떻게 나오는지 화면에 풀어 보여 주기 위한 값.
 * 계산은 calculateQuote 의 향수 줄(인원 비용 · 조향 팀 출장비 · 최소 금액 보정)과 같은 식을 그대로 따른다 —
 * 가격을 정하는 곳이 아니라 보여 주기만 한다 (tests/unit/perfume-breakdown.test.ts 가 두 값이 같은지 확인한다).
 */
export function perfumeBaseBreakdown(options: Pick<PerfumeOptions, 'guests' | 'volume' | 'extraTeams' | 'requestedExtraTeams'>, schedule: Pick<QuoteInput, 'days' | 'hoursPerDay' | 'region'>) {
  const guests = perfumeGuestCost(options.guests, options.volume).amount;
  const { teams } = getPerfumeStaffing(options, schedule);
  const rate = PERFUME.teamTravel[schedule.region];
  const travel = rate * teams * schedule.days;
  const minimum = PERFUME.minimumCharge + (rate - PERFUME.teamTravel.seoul);
  const adjustment = Math.max(0, minimum - guests - travel);
  return { guests, travel, adjustment, subtotal: guests + travel + adjustment, teams, days: schedule.days, rate };
}
