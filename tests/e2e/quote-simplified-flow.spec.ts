import { expect, test, type Page } from '@playwright/test';
import type { QuoteInput } from '../../src/lib/quote/engine';
import { closePreviewOptions, nextPreviewStep, openPreviewOptions } from './helpers/quote-preview-options';

const STORAGE_KEY = 'neander-quote-v2';
const saved = (page: Page): Promise<QuoteInput> => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
const amount = (page: Page) => page.getByTestId('quote-total').getAttribute('data-amount').then(Number);
const stage = (page: Page, index: number) => page.locator(`[data-quote-step="${index}"]`);

async function toExperiences(page: Page) {
  await nextPreviewStep(page);
  await expect(stage(page, 1)).toHaveAttribute('data-quote-page', '2');
  await nextPreviewStep(page);
  await expect(stage(page, 2)).toBeVisible();
}

for (const lang of ['ko', 'en'] as const) {
  const prefix = lang === 'en' ? '/en' : '';
  const progress = (page: Page) => page.getByRole('navigation', { name: lang === 'ko' ? '견적 만들기 단계' : 'Estimate steps', exact: true });

  test(`${lang}: event details open directly in a three-stage quote and typed values survive reload`, async ({ page }) => {
    await page.goto(`${prefix}/quote`, { waitUntil: 'domcontentloaded' });
    await expect(stage(page, 1)).toBeVisible();
    await expect(stage(page, 1)).toHaveAttribute('data-quote-page', '1');
    await expect(stage(page, 0)).toHaveCount(0);
    await expect(page.getByTestId('quote-start-blank')).toHaveCount(0);
    await expect(page.getByTestId('quote-start-templates')).toHaveCount(0);
    await expect(page.getByTestId('quote-start-undo')).toHaveCount(0);
    await expect(page.locator('[data-testid^="quote-preset-"]')).toHaveCount(0);
    await expect(page.locator('#q-type')).toHaveCount(0);
    await expect(progress(page).locator('li')).toHaveCount(3);
    await expect(progress(page).getByRole('button').nth(0)).toHaveAttribute('aria-current', 'step');

    const eventName = lang === 'ko' ? '가을 고객 초청 행사' : 'Autumn Customer Event';
    const name = page.locator('#q-event-name');
    await expect(name).toHaveAttribute('type', 'text');
    await name.fill(eventName);
    for (const [id, value] of [['q-days', '3'], ['q-attendees', '500']]) {
      const field = page.locator(`#${id}`);
      await expect(field).toHaveAttribute('inputmode', 'numeric');
      await expect(field.locator('..').getByRole('button')).toHaveCount(0);
      await field.fill(value);
      await field.press('Tab');
      await expect(field).toHaveValue(value);
    }
    await expect.poll(() => saved(page)).toMatchObject({ eventName, days: 3, attendees: 500, items: [] });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(stage(page, 1)).toBeVisible();
    await expect(name).toHaveValue(eventName);
    await expect(page.locator('#q-days')).toHaveValue('3');
    await expect(page.locator('#q-attendees')).toHaveValue('500');
    await toExperiences(page);
    await expect(progress(page).getByRole('button').nth(1)).toHaveAttribute('aria-current', 'step');
    await openPreviewOptions(page, 'rental');
    await closePreviewOptions(page);
    await nextPreviewStep(page);
    await expect(stage(page, 3)).toBeVisible();
    await expect(progress(page).getByRole('button').nth(2)).toHaveAttribute('aria-current', 'step');
    await expect(page.getByTestId('event-info-summary')).toContainText(eventName);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });

  test(`${lang}: perfume totals follow the expected participants, bottle size and option quantity`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${prefix}/quote?item=acscent`, { waitUntil: 'domcontentloaded' });
    await expect(stage(page, 1)).toBeVisible();
    await expect(page.locator('#q-attendees')).toHaveValue('100');
    await expect.poll(() => amount(page)).toBe(2_035_000);
    await page.locator('#q-attendees').fill('150');
    await page.locator('#q-attendees').press('Tab');
    await expect.poll(async () => (await saved(page)).items.find(item => item.key === 'acscent')?.options.guests).toBe(150);
    await expect.poll(() => amount(page)).toBe(2_860_000);
    await toExperiences(page);

    const options = await openPreviewOptions(page, 'acscent');
    await expect(options.locator('#p-guests')).toHaveValue('150');
    await expect(options.getByTestId('option-tab-space')).toHaveCount(0);
    await options.getByRole('radio', { name: /50ml/ }).check();
    await expect.poll(() => amount(page)).toBe(6_160_000);
    await options.locator('#p-guests').fill('200');
    await options.locator('#p-guests').press('Enter');
    await expect.poll(() => amount(page)).toBe(8_085_000);

    await closePreviewOptions(page);
    await page.getByTestId('quote-prev').click();
    await expect(stage(page, 1)).toHaveAttribute('data-quote-page', '2');
    await page.getByTestId('quote-prev').click();
    await expect(stage(page, 1)).toHaveAttribute('data-quote-page', '1');
    await page.locator('#q-attendees').fill('500');
    await page.locator('#q-attendees').press('Tab');
    await expect.poll(async () => (await saved(page)).items.find(item => item.key === 'acscent')?.options.guests).toBe(500);
    await expect.poll(() => amount(page)).toBe(20_405_000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#q-attendees')).toHaveValue('500');
    await expect.poll(() => amount(page)).toBe(20_405_000);
    expect(errors).toEqual([]);
  });

  test(`${lang}: the three inquiry services show a notice without adding prices or selected items`, async ({ page }) => {
    await page.goto(`${prefix}/quote`, { waitUntil: 'domcontentloaded' });
    await toExperiences(page);
    const notice = page.getByTestId('quote-consultation-notice');
    const inquiryServices = ['spatialDesign', 'mediaArt', 'custom'] as const;
    const verifyInquiry = async (service: typeof inquiryServices[number], total: number, selected: string[]) => {
      const card = page.getByTestId(`quote-add-${service}`);
      await expect(card).toBeVisible();
      await card.click();
      await expect(notice).toBeVisible();
      await expect(notice).toHaveAttribute('data-service', service);
      await expect(notice).toContainText(lang === 'ko' ? '별도 문의 필요' : 'Separate inquiry required');
      await expect(notice.getByRole('link')).toHaveAttribute('href', `${prefix}/contact`);
      await expect(notice.locator('input, select, [role="radiogroup"], [data-price-tag]')).toHaveCount(0);
      await expect(card.locator('[data-price-tag]')).toHaveCount(0);
      await expect(page.getByTestId('quote-options-popover')).toBeHidden();
      await expect.poll(() => amount(page)).toBe(total);
      await expect.poll(async () => (await saved(page)).items.map(item => item.key)).toEqual(selected);
    };
    for (const service of inquiryServices) await verifyInquiry(service, 0, []);

    await openPreviewOptions(page, 'acscent');
    await expect(notice).toHaveCount(0);
    await closePreviewOptions(page);
    const perfumeTotal = await amount(page);
    expect(perfumeTotal).toBe(2_035_000);
    for (const service of inquiryServices) await verifyInquiry(service, perfumeTotal, ['acscent']);

    for (const service of ['photoBooth', 'rental']) {
      await openPreviewOptions(page, service);
      await closePreviewOptions(page);
    }
    await expect.poll(async () => (await saved(page)).items.map(item => item.key)).toEqual(['acscent', 'photoBooth', 'rental']);
    await expect.poll(() => amount(page)).toBe(4_334_000);
  });
}

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: old inquiry-only drafts cannot produce a zero-price estimate and new perfume selections use the full participant count`, async ({ page }) => {
    await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({
      eventName: 'Saved event', days: 1, hoursPerDay: 6, attendees: 750, region: 'seoul', extraStaff: 0,
      items: [
        { key: 'spatialDesign', options: { size: 'large', pyeong: 500, photoZone: true, lighting: true } },
        { key: 'mediaArt', options: { grade: 'fullCustom', extraSensors: 10 } },
        { key: 'custom', options: { scope: 'large', consulting: true, maintenanceMonths: 36, pgIntegration: true } },
      ],
    })), { key: STORAGE_KEY });
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote`, { waitUntil: 'domcontentloaded' });
    await expect.poll(async () => (await saved(page)).items).toEqual([]);
    await expect.poll(() => amount(page)).toBe(0);
    await toExperiences(page);
    await expect(page.getByTestId('quote-next')).toBeDisabled();
    const options = await openPreviewOptions(page, 'acscent');
    await expect(options.locator('#p-guests')).toHaveValue('750');
    await expect.poll(() => amount(page)).toBe(13_915_000);
  });
}
