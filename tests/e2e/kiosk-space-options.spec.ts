import { expect, test, type Page } from '@playwright/test';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { CUSTOM_DEV } from '../../src/lib/quote/catalog';
import { enterExperienceStep, toggleKioskExperience, closePreviewOptions, showOptionPage } from './helpers/quote-preview-options';

const key = 'neander-quote-preview-flow-v1';
const seed = { days: 1, hoursPerDay: 6, region: 'capital', items: [
  { key: 'rental', options: { kiosks: 1, printer: true, custom: 'none', experienceSlugs: ['ai-personal-color'] } },
  { key: 'spatialDesign', options: { size: 'booth6x3', pyeong: 10, photoZone: false, lighting: false } },
] };
const saved = (page: Page): Promise<QuoteInput> => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
const amount = (page: Page) => page.getByTestId('quote-total').getAttribute('data-amount').then(Number);

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: kiosk custom options share the experience topic while space design requires a separate inquiry`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ key, seed }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed)); }, { key, seed });
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`);
    const resume = () => enterExperienceStep(page);
    await resume();
    await page.getByTestId('quote-edit-rental').evaluate(element => element.scrollIntoView({ block: 'end' }));
    const kiosk = await showOptionPage(page, 'rental', 'kiosk-1');
    await expect(kiosk.getByTestId('option-pages')).toHaveAttribute('data-total-steps', '2');
    await expect(kiosk.getByTestId('option-tab-printing')).toHaveCount(0);
    await expect(kiosk.getByTestId('option-tab-branding')).toHaveCount(0);
    await expect(kiosk.locator('#k-printer')).toHaveCount(0);
    expect((await saved(page)).items.find(item => item.key === 'rental')!.options.printer).toBe(false);
    expect(calculateQuote(await saved(page), lang).lines.some(line => /프린터|Instant printer/.test(line.label))).toBe(false);
    const base = await amount(page);
    const measurements: unknown[] = [];
    const capture = async (service: string, label: string) => {
      const panel = page.getByTestId(`quote-options-${service}`);
      const dimensions = await panel.getByTestId('option-page-scroll').evaluate(element => ({ height: element.clientHeight, content: element.scrollHeight, overflow: element.scrollHeight - element.clientHeight }));
      measurements.push({ label, ...dimensions });
      expect(dimensions.overflow, label).toBeLessThanOrEqual(1);
      await page.mouse.move(1, 100);
      await page.screenshot({ path: testInfo.outputPath(`${label}-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
    };
    await expect(page.getByTestId('kiosk-config-custom')).toHaveCount(0);
    await expect(page.getByTestId('kiosk-customization-cards')).toBeVisible();
    const galleryBottom = (await page.getByTestId('kiosk-assignment-1').boundingBox())!;
    const customTop = (await page.getByTestId('kiosk-customization-cards').boundingBox())!;
    expect(customTop.y).toBeGreaterThanOrEqual(galleryBottom.y + galleryBottom.height);
    await capture('rental', 'experience');
    for (const choice of ['brand', 'content', 'dedicated'] as const) {
      await page.getByTestId(`kiosk-custom-${choice}`).click();
      await expect.poll(() => amount(page)).toBe(base + Math.round(CUSTOM_DEV.kiosk[choice] * 1.1));
      await expect(page.getByTestId(`kiosk-custom-${choice}`)).toHaveAttribute('aria-checked', 'true');
    }
    await capture('rental', 'custom');
    await toggleKioskExperience(page, 'ai-sommelier', lang);
    expect((await saved(page)).items.find(item => item.key === 'rental')!.options.custom).toBe('dedicated');
    await showOptionPage(page, 'rental', 'basic');
    await kiosk.locator('#k-count').fill('4');
    await kiosk.locator('#k-count').press('Enter');
    // 체험은 한 페이지에서 골라 나눠 담는다: 기본 구성 + 체험·맞춤
    await expect(kiosk.getByTestId('option-pages')).toHaveAttribute('data-total-steps', '2');
    await toggleKioskExperience(page, 'ai-travel-style', lang);
    await expect(page.getByTestId('kiosk-experience-assignments')).toHaveAttribute('data-assignments', 'ai-sommelier,ai-sommelier,ai-travel-style,ai-travel-style');
    const quote = calculateQuote(await saved(page), lang);
    expect(quote.lines.filter(line => /키오스크 커스텀|Kiosk custom/.test(line.label)).map(line => line.amount)).toEqual([CUSTOM_DEV.kiosk.dedicated]);
    await showOptionPage(page, 'rental', 'kiosk-1');
    await page.getByTestId('kiosk-custom-none').click();
    await closePreviewOptions(page);
    const automaticTotal = await amount(page);
    await page.getByTestId('quote-add-spatialDesign').click();
    const inquiry = page.getByTestId('quote-consultation-notice');
    await expect(inquiry).toHaveAttribute('data-service', 'spatialDesign');
    await expect(inquiry).toContainText(lang === 'ko' ? '별도 문의 필요' : 'Separate inquiry required');
    await expect(page.getByTestId('quote-options-popover')).toBeHidden();
    await expect.poll(() => amount(page)).toBe(automaticTotal);
    expect(calculateQuote(await saved(page), lang).lines.filter(line => line.service === 'spatialDesign')).toEqual([]);
    const final = await saved(page);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(final, lang).total));
    await page.reload();
    await resume();
    await expect.poll(() => saved(page)).toEqual(final);
    await showOptionPage(page, 'rental', 'kiosk-1');
    await expect(page.getByTestId('kiosk-assignment-1')).toHaveAttribute('data-experience-slug', 'ai-sommelier');
    await expect(page.getByTestId('kiosk-custom-none')).toHaveAttribute('aria-checked', 'true');
    expect(errors).toEqual([]);
    await testInfo.attach('dimensions', { body: JSON.stringify(measurements), contentType: 'application/json' });
  });
}
