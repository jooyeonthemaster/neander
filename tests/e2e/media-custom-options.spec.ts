import { expect, test, type Page } from '@playwright/test';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { closePreviewOptions, showOptionPage } from './helpers/quote-preview-options';

const key = 'neander-quote-preview-flow-v1';
const seed = { days: 1, hoursPerDay: 6, region: 'capital', eventType: 'popup', items: [
  { key: 'acscent', options: {} }, { key: 'mediaArt', options: {} }, { key: 'custom', options: {} },
] };
const saved = (page: Page): Promise<QuoteInput> => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
const total = (page: Page) => page.getByTestId('quote-total').getAttribute('data-amount').then(Number);

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: sensors, custom tablet, planning and payment options update and restore`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ key, seed }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed)); }, { key, seed });
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`);
    await page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 3개/ : /You have 3 saved experiences/ }).click();
    const tablet = page.getByTestId('custom-content-tablet');
    await expect(tablet).toBeVisible();
    const canvas = page.getByTestId('preview-canvas');
    const canvasBefore = await canvas.boundingBox();
    const base = await total(page);
    await page.getByTestId('quote-edit-mediaArt').evaluate(element => element.scrollIntoView({ block: 'end' }));
    const media = await showOptionPage(page, 'mediaArt', 'sensors');
    await media.getByRole('radio', { name: /3D/ }).check();
    await expect.poll(() => total(page)).toBe(base + 550_000);
    await media.locator('#m-sensors').fill('2');
    await media.locator('#m-sensors').press('Enter');
    await expect.poll(() => total(page)).toBe(base + 2_310_000);
    await expect(page.locator('[data-kind="sensor"][data-sensor-type="depth"]')).toHaveCount(3);
    const dimensions = await media.getByTestId('option-page-scroll').evaluate(element => ({ height: element.clientHeight, content: element.scrollHeight }));
    expect(dimensions.content - dimensions.height, 'Sensor controls fit without scrolling').toBeLessThanOrEqual(1);
    await page.mouse.move(1, 100);
    await page.screenshot({ path: testInfo.outputPath(`sensors-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
    await closePreviewOptions(page);
    const beforeCustom = await total(page);
    const custom = await showOptionPage(page, 'custom', 'consulting');
    await custom.locator('#c-consult').check();
    await custom.locator('#c-pg').check();
    await expect.poll(() => total(page)).toBe(beforeCustom + 4_400_000);
    await expect(tablet).toHaveAttribute('data-pg', 'true');
    await expect(tablet).toHaveAttribute('data-consulting', 'true');
    const fitting = await custom.getByTestId('option-page-scroll').evaluate(element => element.scrollHeight - element.clientHeight);
    expect(fitting, 'Planning and PG fit without scrolling').toBeLessThanOrEqual(1);
    await showOptionPage(page, 'custom', 'basic');
    await custom.getByRole('radio').last().check();
    await expect(tablet).toHaveAttribute('data-scope', 'large');
    await expect(page.getByTestId('custom-tablet-connected')).toBeVisible();
    await showOptionPage(page, 'custom', 'maintenance');
    await custom.locator('#c-maint').fill('12');
    await custom.locator('#c-maint').press('Enter');
    await expect(tablet).toHaveAttribute('data-maintenance', '12');
    await closePreviewOptions(page);
    await canvas.evaluate(element => window.scrollBy(0, element.getBoundingClientRect().top - 150));
    await page.getByTestId('custom-tablet-screen').click();
    await expect(tablet).toHaveAttribute('data-screen', 'participate');
    const unchanged = await saved(page);
    const tabletBefore = await tablet.boundingBox();
    const viewportBefore = await page.getByTestId('preview-canvas-viewport').boundingBox();
    expect(tabletBefore!.y + tabletBefore!.height).toBeLessThanOrEqual(viewportBefore!.y + viewportBefore!.height);
    const mediaWall = await page.locator('[data-kind="media-screen"]').boundingBox();
    expect(mediaWall!.x + mediaWall!.width, 'Tablet leaves the media wall visible').toBeLessThan(tabletBefore!.x);
    await page.getByTestId('preview-zoom-in').click();
    const viewport = await page.getByTestId('preview-canvas-viewport').boundingBox();
    await page.mouse.move(viewport!.x + 30, viewport!.y + viewport!.height - 30);
    await page.mouse.down(); await page.mouse.move(viewport!.x + 65, viewport!.y + viewport!.height - 40); await page.mouse.up();
    const tabletAfter = await tablet.boundingBox();
    expect(Math.abs(tabletAfter!.x - tabletBefore!.x)).toBeLessThan(1);
    expect(Math.abs(tabletAfter!.y - tabletBefore!.y)).toBeLessThan(1);
    expect((await canvas.boundingBox())!.height).toBe(canvasBefore!.height);
    expect(await saved(page)).toEqual(unchanged);
    await page.getByTestId('preview-zoom-reset').click();
    await page.getByTestId('custom-tablet-screen').click();
    await page.screenshot({ path: testInfo.outputPath(`tablet-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(unchanged, lang).total));
    await page.reload();
    await page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 3개/ : /You have 3 saved experiences/ }).click();
    await expect.poll(() => saved(page)).toEqual(unchanged);
    await expect(tablet).toHaveAttribute('data-pg', 'true');
    for (const service of ['acscent', 'mediaArt']) {
      await page.getByTestId(`quote-remove-${service}`).click();
    }
    await expect(tablet).toBeVisible();
    await expect(page.getByTestId('event-object')).toHaveCount(0);
    expect((await canvas.boundingBox())!.height).toBe(canvasBefore!.height);
    await page.getByTestId('quote-remove-custom').click();
    await expect(tablet).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
