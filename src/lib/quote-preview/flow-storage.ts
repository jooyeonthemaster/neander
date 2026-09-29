import { sanitizeInput, type QuoteInput } from '@/lib/quote/engine';
import { PREVIEW_STORAGE_KEY } from './model';
import { getKioskAssignments } from '@/lib/quote/kiosk-experiences';

export const QUOTE_PREVIEW_FLOW_STORAGE_KEY = 'neander-quote-preview-flow-v1';

/** The lab offers event rental, with one existing experience per active kiosk.
 * Production drafts retain their subscription and legacy-content contracts. */
export function normalizePreviewInput(raw: unknown): QuoteInput {
  const input = sanitizeInput(raw);
  return { ...input, items: input.items.map((item) => {
    if (item.key !== 'rental') return item;
    const experienceSlugs = getKioskAssignments(item.options);
    return { ...item, options: { ...item.options, mode: 'event' as const, months: 1, printer: false, experienceSlugs, experienceSlug: experienceSlugs[0] || undefined, extraContents: 0 } };
  }) };
}

/** Read a prior experiment once without ever touching production drafts/history. */
export function loadPreviewFlow(storage: Pick<Storage, 'getItem'>): QuoteInput | null {
  try {
    const current = storage.getItem(QUOTE_PREVIEW_FLOW_STORAGE_KEY);
    if (current !== null) {
      const parsed = JSON.parse(current);
      return Array.isArray(parsed?.items) ? normalizePreviewInput(parsed) : null;
    }
    const previous = JSON.parse(storage.getItem(PREVIEW_STORAGE_KEY) ?? 'null');
    return previous?.version === 1 && Array.isArray(previous.input?.items) ? normalizePreviewInput(previous.input) : null;
  } catch {
    return null;
  }
}
