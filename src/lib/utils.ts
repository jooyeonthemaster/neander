import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx.
 * Handles conditional classes and deduplication.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Korean Won currency string.
 * @example formatPrice(1500000) => "1,500,000원"
 */
export function formatPrice(num: number): string {
  return `${num.toLocaleString('ko-KR')}원`;
}

/**
 * Async sleep helper for delays.
 * @param ms - Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a value between a minimum and maximum.
 */
export function clamp(min: number, val: number, max: number): number {
  return Math.min(Math.max(min, val), max);
}
