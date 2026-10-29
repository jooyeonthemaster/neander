import { expect, test } from '@playwright/test';
import { calculateQuote } from '../../src/lib/quote/engine';
import { enterExperienceStep, closePreviewOptions, showOptionPage } from './helpers/quote-preview-options';

test('automatic experience equipment remains visible without adding a purchased booth', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const key = 'neander-quote-preview-flow-v1';
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({ items: [
    { key: 'acscent', options: { guests: 100 } },
    { key: 'photoBooth', options: { booths: 1 } },
    { key: 'rental', options: { kiosks: 1 } },
  ] })), key);
  await page.goto('/quote-preview');
  await enterExperienceStep(page);
  const canvas = page.getByTestId('preview-canvas');
  const originalCanvas = await canvas.boundingBox();
  for (const [booths, kiosks] of [[1, 1], [3, 4], [2, 2]]) {
    await showOptionPage(page, 'photoBooth', 'basic');
    await page.locator('#b-booths').fill(String(booths));
    await page.locator('#b-booths').press('Enter');
    await showOptionPage(page, 'rental', 'basic');
    await page.locator('#k-count').fill(String(kiosks));
    await page.locator('#k-count').press('Enter');
    await closePreviewOptions(page);
    await expect(page.locator('[data-kind="photo-booth"]')).toHaveCount(booths);
    await expect(page.locator('[data-kind="kiosk"]')).toHaveCount(kiosks);
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-space', 'existing');
    await expect(page.getByTestId('event-booth-footprint')).toHaveCount(0);
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-needs-placement', 'false');
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(saved).total));
    const before = await page.getByTestId('event-object').evaluateAll(nodes => nodes.map(node => node.getAttribute('transform')));
    await page.getByTestId('preview-zoom-in').click();
    await page.getByTestId('preview-zoom-reset').click();
    expect(await page.getByTestId('event-object').evaluateAll(nodes => nodes.map(node => node.getAttribute('transform')))).toEqual(before);
    expect((await canvas.boundingBox())!.height).toBe(originalCanvas!.height);
    await page.getByTestId('event-scene').screenshot({ path: testInfo.outputPath(`devices-${booths}-${kiosks}.png`) });
  }
  expect(errors).toEqual([]);
});
