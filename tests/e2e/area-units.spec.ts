import { expect, test, type Page } from '@playwright/test';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { closePreviewOptions, enterExperienceStep, openPreviewOptions } from './helpers/quote-preview-options';

const key = 'neander-quote-preview-flow-v1';
const saved = (page: Page): Promise<QuoteInput> => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);

for (const lang of ['ko', 'en'] as const) {
  for (const areaUnit of ['pyeong', 'sqm'] as const) {
    test(`${lang}: a restored ${areaUnit} space restores only the automatic experience and exposes no area pricing controls`, async ({ page }) => {
      const seed = { days: 1, hoursPerDay: 6, region: 'seoul', items: [
        { key: 'acscent', options: { guests: 100, volume: '10ml' } },
        { key: 'spatialDesign', options: { size: 'large', pyeong: 30.25, areaUnit, photoZone: true, lighting: true, build: 'wood' } },
      ] };
      await page.addInitScript(({ key, seed }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed)); }, { key, seed });
      await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
      await enterExperienceStep(page);
      const original = await saved(page);
      expect(original.items.map(item => item.key)).toEqual(['acscent']);
      await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', '2035000');
      const perfume = await openPreviewOptions(page, 'acscent');
      await expect(perfume.getByTestId('option-tab-space')).toHaveCount(0);
      await expect(perfume.getByTestId('option-tab-space-area')).toHaveCount(0);
      await expect(page.locator('#perfume-space-pyeong, #s-pyeong')).toHaveCount(0);
      await closePreviewOptions(page);
      await page.getByTestId('quote-add-spatialDesign').click();
      await expect(page.getByTestId('quote-consultation-notice')).toHaveAttribute('data-service', 'spatialDesign');
      await expect(page.getByTestId('quote-options-spatialDesign')).toHaveCount(0);
      expect(calculateQuote(await saved(page), lang).lines.filter(line => line.service === 'spatialDesign')).toEqual([]);
      expect(await saved(page)).toEqual(original);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await enterExperienceStep(page);
      await expect.poll(() => saved(page)).toEqual(original);
      await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', '2035000');
    });
  }
}
