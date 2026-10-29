import { expect, test, type Page } from '@playwright/test';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { enterExperienceStep } from './helpers/quote-preview-options';

const key = 'neander-quote-preview-flow-v1';
const seed = { days: 3, hoursPerDay: 10, region: 'gyeongsang', extraStaff: 0, setupDayBefore: false, items: [
  { key: 'mediaArt', options: { grade: 'fullCustom', extraSensors: 10, sensorType: 'depth' } },
  { key: 'custom', options: { scope: 'large', consulting: true, pgIntegration: true, maintenanceMonths: 36 } },
] };
const saved = (page: Page): Promise<QuoteInput> => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: restored media and custom service options require inquiry without equipment or charges`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ key, seed }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed)); }, { key, seed });
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
    await enterExperienceStep(page);
    const original = await saved(page);
    expect(original.items).toEqual([]);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', '0');
    await expect(page.getByTestId('custom-content-tablet')).toHaveCount(0);
    await expect(page.locator('[data-kind="media-screen"], [data-kind="sensor"]')).toHaveCount(0);
    for (const service of ['mediaArt', 'custom']) {
      await page.getByTestId(`quote-add-${service}`).click();
      const notice = page.getByTestId('quote-consultation-notice');
      await expect(notice).toHaveAttribute('data-service', service);
      await expect(notice).toContainText(lang === 'ko' ? '별도 문의 필요' : 'Separate inquiry required');
      await expect(notice.getByRole('link')).toHaveAttribute('href', `${lang === 'en' ? '/en' : ''}/contact`);
      await expect(page.getByTestId('quote-options-popover')).toHaveCount(0);
      await expect(page.locator('#m-sensors, #c-consult, #c-pg, #c-maint')).toHaveCount(0);
      await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', '0');
      expect(await saved(page)).toEqual(original);
    }
    const estimate = calculateQuote(original, lang);
    expect(estimate.total).toBe(0);
    expect(estimate.lines).toEqual([]);
    await expect(page.getByTestId('quote-next')).toBeDisabled();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await enterExperienceStep(page);
    await expect.poll(() => saved(page)).toEqual(original);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', '0');
    expect(errors).toEqual([]);
  });
}
