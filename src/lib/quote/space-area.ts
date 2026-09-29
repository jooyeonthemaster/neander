import type { Lang } from './catalog';

export type AreaUnit = 'pyeong' | 'sqm';
export const SQM_PER_PYEONG = 400 / 121;
export const PYEONG_PER_SQM = 121 / 400;
export const SPACE_AREA_LIMITS = { minPyeong: 10, maxPyeong: 500 } as const;

export interface SpaceAreaValue { pyeong: number; areaUnit?: AreaUnit }

/** Pure conversion: callers normalize only when a user changes the area.
 * Merely switching the displayed unit must leave canonical pyeong untouched. */
export function convertAreaFromPyeong(pyeong: number, unit: AreaUnit): number {
  return unit === 'sqm' ? pyeong * SQM_PER_PYEONG : pyeong;
}

export function convertAreaToPyeong(value: number, unit: AreaUnit): number {
  return unit === 'sqm' ? value * PYEONG_PER_SQM : value;
}

/** Six decimal places retain fractional square-metre input while stabilizing
 * repeated saves. Existing integer-pyeong drafts normalize exactly as before. */
export function normalizePyeong(value: unknown): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return SPACE_AREA_LIMITS.minPyeong;
  const clamped = Math.min(SPACE_AREA_LIMITS.maxPyeong, Math.max(SPACE_AREA_LIMITS.minPyeong, number));
  return Math.round(clamped * 1_000_000) / 1_000_000;
}

function formatArea(value: number, unit: AreaUnit, lang: Lang): string {
  const number = value.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', { maximumFractionDigits: 2 });
  return `${number}${unit === 'sqm' ? (lang === 'ko' ? '㎡' : ' m²') : lang === 'ko' ? '평' : ' pyeong'}`;
}

/** Primary area label in the customer's chosen unit; missing units are legacy pyeong. */
export function formatSpaceArea(options: SpaceAreaValue, lang: Lang): string {
  const unit = options.areaUnit === 'sqm' ? 'sqm' : 'pyeong';
  return formatArea(convertAreaFromPyeong(normalizePyeong(options.pyeong), unit), unit, lang);
}

/** A short, rounded equivalent for explanatory text beside the primary value. */
export function formatSpaceAreaEquivalent(options: SpaceAreaValue, lang: Lang): string {
  const unit = options.areaUnit === 'sqm' ? 'pyeong' : 'sqm';
  return formatArea(convertAreaFromPyeong(normalizePyeong(options.pyeong), unit), unit, lang);
}
