import { expect, test, type Page } from '@playwright/test';
import type { QuoteInput } from '../../src/lib/quote/engine';

// 저장된 구성이 있을 때 1단계에서 새로 시작하면 확인 없이 비워진다 — 되돌릴 수 있어야 한다
const FLOW_KEY = 'neander-quote-preview-flow-v1';
const draft = {
  eventType: 'festival', eventDate: '', days: 3, hoursPerDay: 8, attendees: 500, region: 'gyeongin', extraStaff: 1,
  items: [
    { key: 'photoBooth', options: { booths: 2 } },
    { key: 'rental', options: { kiosks: 2, experienceSlugs: ['ai-personal-color', ''] } },
  ],
};
const saved = (page: Page): Promise<QuoteInput> => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), FLOW_KEY);
const step = (page: Page, index: number) => page.locator(`[data-quote-step="${index}"]`);

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: starting over keeps the saved plan one click away`, async ({ page }) => {
    await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, { key: FLOW_KEY, value: draft });
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 2개/ : /You have 2 saved experiences/ })).toBeVisible();
    const original = await saved(page);
    expect(original.items.map((item) => item.key)).toEqual(['photoBooth', 'rental']);
    const total = await page.getByTestId('quote-total').getAttribute('data-amount');
    const undo = page.getByTestId('quote-start-undo');

    // 직접 골라보기: 비워지지만 되돌리기가 보인다
    await page.getByTestId('quote-start-blank').click();
    await expect(step(page, 1)).toBeVisible();
    await expect.poll(async () => (await saved(page)).items).toEqual([]);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', '0');
    await expect(undo).toBeVisible();
    await expect(undo).toHaveRole('status');
    await expect(undo).toContainText(lang === 'ko' ? '체험 2개' : '2 experiences');
    await page.getByTestId('quote-start-undo-button').click();
    await expect(undo).toHaveCount(0);
    await expect.poll(() => saved(page)).toEqual(original);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', total!);
    await expect(step(page, 1)).toBeVisible();
    await expect(page.locator('#q-days')).toHaveValue('3');

    // 템플릿으로 바꿔도 같은 방법으로 되돌린다
    await page.getByTestId('quote-prev').click();
    await expect(step(page, 0)).toBeVisible();
    await page.getByTestId('quote-start-templates').click();
    await page.getByTestId('quote-preset-brand-popup').click();
    await expect(step(page, 1)).toBeVisible();
    await expect(undo).toBeVisible();
    await expect.poll(async () => JSON.stringify(await saved(page)) === JSON.stringify(original)).toBe(false);
    await page.getByTestId('quote-start-undo-button').click();
    await expect.poll(() => saved(page)).toEqual(original);

    // 새 구성으로 체험 단계까지 가면 안내를 거둔다. 비어 있던 견적에서는 처음부터 안내가 없다
    await page.getByTestId('quote-prev').click();
    await page.getByTestId('quote-back-to-start').click();
    await page.getByTestId('quote-start-blank').click();
    await expect(undo).toBeVisible();
    await page.getByTestId('quote-next').click();
    await expect(step(page, 1)).toHaveAttribute('data-quote-page', '2');
    await expect(undo).toBeVisible();
    await page.getByTestId('quote-next').click();
    await expect(step(page, 2)).toBeVisible();
    await page.getByTestId('quote-prev').click();
    await expect(step(page, 1)).toBeVisible();
    await expect(undo).toHaveCount(0);
    await page.getByTestId('quote-prev').click();
    await page.getByTestId('quote-prev').click();
    await expect(step(page, 0)).toBeVisible();
    await page.getByTestId('quote-start-blank').click();
    await expect(step(page, 1)).toBeVisible();
    await expect(undo).toHaveCount(0);
  });
}
