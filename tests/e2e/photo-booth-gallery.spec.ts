import { expect, test, type Page } from '@playwright/test';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { PHOTO_BOOTH_TEMPLATES } from '../../src/lib/quote/photo-booth-templates';
import { enterExperienceStep, showOptionPage, showPhotoGalleryPage } from './helpers/quote-preview-options';

const storageKey = 'neander-quote-preview-flow-v1';
const visible = (page: Page, id: string) => page.locator(`[data-testid="${id}"]:visible`);
async function saved(page: Page): Promise<QuoteInput> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey);
}
async function swipeGallery(page: Page, direction: 'left' | 'right') {
  const gallery = page.getByTestId('booth-templates-gallery');
  await gallery.scrollIntoViewIfNeeded();
  const box = (await gallery.boundingBox())!;
  const x = box.x + box.width * (direction === 'left' ? 0.8 : 0.2);
  const delta = box.width * (direction === 'left' ? -0.6 : 0.6);
  const y = box.y + box.height / 2;
  const touch = await page.context().newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 5; step++) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + delta * step / 5, y }] });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touch.detach();
}

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: one photo topic keeps all template choices and same-page demos across gallery views`, async ({ page }, testInfo) => {
    const mobile = testInfo.project.name === 'mobile';
    const errors: string[] = [];
    const generationRequests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/demo-ai/**', route => { generationRequests.push(route.request().url()); return route.abort(); });
    await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({ items: [{ key: 'photoBooth', options: { booths: 1, templateSlugs: [], customStyles: 0 } }] })), storageKey);
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
    await enterExperienceStep(page);
    const picker = await showPhotoGalleryPage(page, 1);
    const options = page.getByTestId('quote-options-photoBooth');
    const flow = options.getByTestId('option-pages');
    const gallery = page.getByTestId('booth-templates-gallery');
    await expect(flow).toHaveAttribute('data-current-page', 'photo-styles');
    await expect(flow).toHaveAttribute('data-current-step', '2');
    await expect(flow).toHaveAttribute('data-total-steps', '4');
    await expect(options.getByTestId('option-tab-custom-style')).toHaveCount(0);
    await expect(options.getByTestId('option-tab-wrapping')).toHaveCount(0);
    await expect(page.getByTestId('booth-templates-previous')).toBeDisabled();
    await expect(page.getByTestId('booth-template-custom-style')).toBeVisible();
    await expect(gallery.getByTestId('booth-template-custom-style')).toHaveCount(0);
    const pager = (await page.getByTestId('booth-templates-next').boundingBox())!;
    const custom = (await page.getByTestId('booth-template-custom-style').boundingBox())!;
    expect(custom.y).toBeGreaterThanOrEqual(pager.y + pager.height);
    await page.screenshot({ path: testInfo.outputPath(`styles-first-page-${lang}.png`) });
    await gallery.focus();
    await page.keyboard.press('ArrowRight');
    await expect(picker).toHaveAttribute('data-gallery-page', '2');
    await page.keyboard.press('End');
    await expect(picker).toHaveAttribute('data-gallery-page', '3');
    await expect(page.getByTestId('booth-templates-next')).toBeDisabled();
    await page.keyboard.press('ArrowLeft');
    await expect(picker).toHaveAttribute('data-gallery-page', '2');
    await page.keyboard.press('Home');
    await expect(picker).toHaveAttribute('data-gallery-page', '1');
    if (mobile) {
      await swipeGallery(page, 'left');
      await expect(picker).toHaveAttribute('data-gallery-page', '2');
      await swipeGallery(page, 'right');
      await expect(picker).toHaveAttribute('data-gallery-page', '1');
      // A real swipe suppresses its synthetic click for 350 ms.
      await page.waitForTimeout(400);
    }
    const base = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
    for (const [index, template] of PHOTO_BOOTH_TEMPLATES.entries()) {
      await showPhotoGalleryPage(page, Math.floor(index / 4) + 1);
      await expect(page.getByTestId('booth-template-custom-style')).toBeVisible();
      const button = page.getByTestId(`booth-template-${template.slug}`);
      await expect(button).toHaveAccessibleName(template.name[lang]);
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(base + Math.max(0, index - 1) * 220_000));
      await expect(flow).toHaveAttribute('data-current-step', '2');
      await expect(flow).toHaveAttribute('data-total-steps', '4');
    }
    const customTile = page.getByTestId('booth-template-custom-style');
    await expect(customTile).toBeVisible();
    await expect(customTile.locator('[data-testid^="booth-demo-"]')).toHaveCount(0);
    await customTile.locator('#b-custom-style-enabled').click();
    await expect(customTile.locator('#b-cstyles')).toHaveValue('1');
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(base + 1_980_000 + 550_000));
    await customTile.locator('#b-cstyles').fill('10');
    await customTile.locator('#b-cstyles').press('Enter');
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(base + 1_980_000 + 5_500_000));
    await expect(customTile.getByRole('button', { name: lang === 'ko' ? '새로 만들 스타일 수 늘리기' : 'Increase new styles', exact: true })).toBeDisabled();
    await customTile.locator('#b-cstyles').fill('2');
    await customTile.locator('#b-cstyles').press('Enter');
    const chosen = await saved(page);
    expect(chosen.items[0].options).toMatchObject({ templateSlugs: PHOTO_BOOTH_TEMPLATES.map(item => item.slug), extraStyles: 9, customStyles: 2 });
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(chosen, lang).total));

    // Loaded welcome screens only: no camera, upload, or AI generation action.
    const url = page.url();
    const pageCount = page.context().pages().length;
    const total = await page.getByTestId('quote-total').getAttribute('data-amount');
    for (const [index, slug] of ['ai-wedding-booth', 'ai-traditional-painter'].entries()) {
      const demo = page.getByTestId(`booth-demo-${slug}`);
      await expect(demo).toHaveText(lang === 'ko' ? '데모' : 'Demo');
      await demo.click();
      const modal = page.locator('.demo-modal-panel[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal.locator(`[data-program="${slug}"] .venue-shell`)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId('quote-options-popover')).toHaveAttribute('inert', '');
      expect(page.url()).toBe(url);
      expect(page.context().pages()).toHaveLength(pageCount);
      if (index === 0) {
        await page.waitForTimeout(250);
        await page.screenshot({ path: testInfo.outputPath(`demo-welcome-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
        await page.keyboard.press('Escape');
      } else await modal.locator('[data-demo-return]:visible').first().click();
      await expect(modal).toHaveCount(0);
      await expect(page.getByTestId('quote-options-popover')).toBeVisible();
      await expect(page.getByTestId('quote-options-popover')).not.toHaveAttribute('inert', '');
      await expect(demo).toBeFocused();
      await expect(flow).toHaveAttribute('data-current-page', 'photo-styles');
      await expect(picker).toHaveAttribute('data-gallery-page', '3');
      await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', total!);
      expect(await saved(page)).toEqual(chosen);
    }
    await showOptionPage(page, 'photoBooth', 'prints');
    const prints = options.getByTestId('option-page-prints');
    await expect(flow).toHaveAttribute('data-current-step', '3');
    await expect(options.getByTestId('option-tab-prints')).toHaveAccessibleName(lang === 'ko' ? '인화와 부스 외관 고르기' : 'Choose prints and booth wrapping');
    await expect(prints.locator('#b-prints')).toBeVisible();
    await expect(prints.locator('#b-wrap')).toBeVisible();
    await prints.locator('#b-prints').fill('2');
    await prints.locator('#b-prints').press('Enter');
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(Number(total) + 440_000));
    await prints.locator('#b-wrap').check();
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(Number(total) + 990_000));
    await prints.locator('#b-wrap').uncheck();
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(Number(total) + 440_000));
    await prints.locator('#b-wrap').check();
    const withPrintsAndWrapping = await saved(page);
    expect(withPrintsAndWrapping.items[0].options).toMatchObject({ ...chosen.items[0].options, extraPrintRolls: 2, wrapping: true });
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(withPrintsAndWrapping, lang).total));
    const measurements: unknown[] = [];
    const inspectCombinedPage = async () => {
      await showOptionPage(page, 'photoBooth', 'prints');
      await expect(prints.locator('#b-prints')).toHaveValue('2');
      await expect(prints.locator('#b-wrap')).toBeChecked();
      const size = await options.getByTestId('option-page-scroll').evaluate(el => ({
        viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
        height: el.clientHeight, content: el.scrollHeight, overflow: el.scrollHeight - el.clientHeight,
      }));
      measurements.push(size);
      expect(size.overflow).toBeLessThanOrEqual(2);
      await page.mouse.move(5, 100);
      await page.waitForTimeout(250);
      await page.screenshot({ path: testInfo.outputPath(`${size.viewportWidth}-merged-prints-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
    };
    await inspectCombinedPage();
    await showOptionPage(page, 'photoBooth', 'photo-styles');
    await expect(picker).toHaveAttribute('data-gallery-page', '3');
    await expect(customTile.locator('#b-cstyles')).toHaveValue('2');
    await page.mouse.move(5, 100);
    await page.waitForTimeout(250);
    await page.screenshot({ path: testInfo.outputPath(`gallery-return-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
    if (!mobile) {
      for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }]) {
        await page.getByTestId('quote-options-close').click();
        await page.setViewportSize(viewport);
        await showPhotoGalleryPage(page, 3);
        await expect.poll(() => options.getByTestId('option-page-scroll').evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(2);
        await page.waitForTimeout(250);
        await page.screenshot({ path: testInfo.outputPath(`${viewport.width}-gallery-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
        await inspectCombinedPage();
      }
    }
    // Both gallery views and direct topic navigation feed the same three-stage flow.
    await options.getByTestId('option-tab-basic').click();
    for (const id of ['photo-styles', 'prints', 'branding']) {
      await visible(page, 'option-page-next').click();
      await expect(flow).toHaveAttribute('data-current-page', id);
    }
    await expect(flow).toHaveAttribute('data-all-visited', 'true');
    await visible(page, 'quote-options-done').click();
    await expect(page.getByTestId('quote-options-popover')).toBeHidden();
    expect(await saved(page)).toEqual(withPrintsAndWrapping);
    await testInfo.attach('combined-prints-dimensions', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
    expect(page.url()).toBe(url);
    expect(generationRequests).toEqual([]);
    expect(errors).toEqual([]);
  });
}
