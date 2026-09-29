import { expect, test, type Page } from '@playwright/test';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { nextPreviewStep, showOptionPage } from './helpers/quote-preview-options';

const storageKey = 'neander-quote-preview-flow-v1';
const saved = (page: Page): Promise<QuoteInput> => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey);
const area = async (page: Page) => (await saved(page)).items.find(item => item.key === 'spatialDesign')!.options;

async function setArea(page: Page, id: string, value: string) {
  await page.locator(`#${id}`).fill(value);
  await page.locator(`#${id}`).press('Enter');
}

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: pyeong and square metres share one precise area through editing, switching and reload`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('quote-start-blank').click();
    await nextPreviewStep(page);
    await nextPreviewStep(page);
    await showOptionPage(page, 'acscent', 'space');
    await page.getByTestId('perfume-space-large').click();
    await showOptionPage(page, 'acscent', 'space-area');
    const perfumeId = 'perfume-space-pyeong';
    const perfume = page.locator(`#${perfumeId}`);
    const unit = (id: string, value: 'pyeong' | 'sqm') => page.getByTestId(`${id}-unit-${value}`);
    const base = calculateQuote(await saved(page), lang).total;
    await expect(perfume).toHaveValue('10');
    await expect(perfume).toHaveAttribute('inputmode', 'decimal');
    await expect(unit(perfumeId, 'pyeong')).toHaveAttribute('aria-pressed', 'true');

    // Display rounding must not become a new canonical area when switching.
    for (let index = 0; index < 4; index++) {
      await unit(perfumeId, 'sqm').click();
      await expect(perfume).toHaveValue('33.06');
      await perfume.focus();
      await perfume.press('Tab');
      expect((await area(page)).pyeong).toBe(10);
      await unit(perfumeId, 'pyeong').click();
      await expect(perfume).toHaveValue('10');
    }
    await unit(perfumeId, 'sqm').focus();
    await page.keyboard.press('Space');
    await expect(unit(perfumeId, 'sqm')).toHaveAttribute('aria-pressed', 'true');
    await setArea(page, perfumeId, '100');
    await expect.poll(async () => (await area(page)).pyeong).toBe(30.25);
    expect((await area(page)).areaUnit).toBe('sqm');
    await expect(page.getByTestId(`${perfumeId}-conversion`)).toContainText('30.25');
    await unit(perfumeId, 'pyeong').click();
    await expect(perfume).toHaveValue('30.25');
    await unit(perfumeId, 'sqm').click();
    await expect(perfume).toHaveValue('100');

    // Six canonical decimals survive two-decimal display and clean blur.
    await setArea(page, perfumeId, '150.25');
    await expect.poll(async () => (await area(page)).pyeong).toBe(45.450625);
    await unit(perfumeId, 'pyeong').click();
    await expect(perfume).toHaveValue('45.45');
    await perfume.focus();
    await perfume.press('Tab');
    expect((await area(page)).pyeong).toBe(45.450625);
    await unit(perfumeId, 'sqm').click();
    await expect(perfume).toHaveValue('150.25');

    // Both entry points edit the same spatial-design item and selected unit.
    await showOptionPage(page, 'spatialDesign', 'area');
    const spaceId = 's-pyeong';
    const space = page.locator(`#${spaceId}`);
    await expect(space).toHaveValue('150.25');
    await expect(unit(spaceId, 'sqm')).toHaveAttribute('aria-pressed', 'true');
    await unit(spaceId, 'pyeong').click();
    await setArea(page, spaceId, '45.5');
    await showOptionPage(page, 'acscent', 'space-area');
    await expect(perfume).toHaveValue('45.5');
    await expect(unit(perfumeId, 'pyeong')).toHaveAttribute('aria-pressed', 'true');
    await unit(perfumeId, 'sqm').click();
    await expect(perfume).toHaveValue('150.41');
    expect((await area(page)).pyeong).toBe(45.5);

    // Bounds refer to the same physical area in either unit.
    await setArea(page, perfumeId, '0');
    await expect.poll(async () => (await area(page)).pyeong).toBe(10);
    await expect(perfume).toHaveValue('33.06');
    await setArea(page, perfumeId, '99999');
    await expect.poll(async () => (await area(page)).pyeong).toBe(500);
    await expect(perfume).toHaveValue('1652.89');
    await unit(perfumeId, 'pyeong').click();
    await expect(perfume).toHaveValue('500');
    await setArea(page, perfumeId, '0');
    await expect(perfume).toHaveValue('10');
    await setArea(page, perfumeId, '501');
    await expect(perfume).toHaveValue('500');
    await unit(perfumeId, 'sqm').click();
    await setArea(page, perfumeId, '100');

    const options = page.getByTestId('quote-options-acscent');
    const dimensions = await options.getByTestId('option-page-scroll').evaluate(element => ({ height: element.clientHeight, overflow: element.scrollHeight - element.clientHeight }));
    if (testInfo.project.name === 'desktop') expect(dimensions.overflow).toBeLessThanOrEqual(1);
    expect(dimensions.height).toBeGreaterThan(0);
    await page.mouse.move(8, 100);
    await page.waitForTimeout(250);
    await page.screenshot({ path: testInfo.outputPath(`area-units-${lang}.png`), style: 'nextjs-portal { display:none!important; }' });
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(base + 26_730_000));
    expect(calculateQuote(await saved(page), lang).total).toBe(base + 26_730_000);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: lang === 'ko' ? /담아 둔 체험 2개/ : /You have 2 saved experiences/ }).click();
    await showOptionPage(page, 'acscent', 'space-area');
    await expect(perfume).toHaveValue('100');
    await expect(unit(perfumeId, 'sqm')).toHaveAttribute('aria-pressed', 'true');
    await showOptionPage(page, 'spatialDesign', 'area');
    await expect(space).toHaveValue('100');
    await expect(unit(spaceId, 'sqm')).toHaveAttribute('aria-pressed', 'true');
    expect((await area(page)).pyeong).toBe(30.25);
    await nextPreviewStep(page);
    const summary = page.getByRole('complementary', { name: QUOTE_COPY[lang].sheetTitle });
    await expect(summary).toContainText(lang === 'ko' ? /100\s*㎡/ : /100\s*m²/);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(base + 26_730_000));
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}
