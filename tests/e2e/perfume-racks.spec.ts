import { expect, test } from '@playwright/test';
import { calculateQuote } from '../../src/lib/quote/engine';
import { closePreviewOptions, showOptionPage } from './helpers/quote-preview-options';

test('participant count adds scent racks and widens tables in overview and detail', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const key = 'neander-quote-preview-flow-v1';
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({ items: [
    { key: 'acscent', options: { guests: 50, extraTeams: 1 } },
    { key: 'spatialDesign', options: { size: 'booth6x3' } },
    { key: 'photoBooth', options: {} }, { key: 'rental', options: {} },
  ] })), key);
  await page.goto('/quote-preview');
  await page.getByRole('button', { name: /담아 둔 체험 4개/ }).click();
  const viewport = page.getByTestId('preview-canvas');
  const height = (await viewport.boundingBox())!.height;
  let width = 0;
  for (const [guests, racks] of [[50, 1], [100, 2], [200, 4], [301, 7], [50, 1]]) {
    await showOptionPage(page, 'acscent', 'basic');
    await page.locator('#p-guests').fill(String(guests));
    await page.locator('#p-guests').press('Enter');
    await expect(page.getByTestId('perfume-scent-rack')).toHaveCount(racks);
    await expect(page.locator('[data-kind="team"]')).toHaveCount(2);
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-needs-placement', 'false');
    const currentWidth = Number(await page.getByTestId('perfume-table').first().getAttribute('data-table-width'));
    if (racks <= 4 && guests !== 50) expect(currentWidth).toBeGreaterThan(width);
    width = currentWidth;
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(saved).total));
    await closePreviewOptions(page);
    await viewport.evaluate(element => window.scrollBy(0, element.getBoundingClientRect().top - 150));
    if ([100, 200, 301].includes(guests)) await page.getByTestId('event-scene').screenshot({ path: testInfo.outputPath(`overview-${guests}.png`) });
    expect((await viewport.boundingBox())!.height).toBe(height);
    await page.getByTestId('event-preview-detail').click();
    await expect(page.getByTestId('perfumery-scene').getByTestId('perfume-scent-rack')).toHaveCount(racks);
    await expect(page.getByTestId('scene-team')).toHaveCount(2);
    if (guests === 200) await page.getByTestId('perfumery-scene').screenshot({ path: testInfo.outputPath('detail-200.png') });
    await page.getByTestId('event-preview-overview').click();
  }
  expect(errors).toEqual([]);
});
