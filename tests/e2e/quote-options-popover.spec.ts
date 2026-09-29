import { expect, test } from '@playwright/test';
import { SERVICE_TEXT } from '../../src/lib/quote/catalog';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { toggleKioskExperience, closePreviewOptions, nextPreviewStep, openPreviewOptions, showOptionPage } from './helpers/quote-preview-options';

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: card-anchored options keep the original preview and dismiss without trapping the page`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('quote-start-blank').click();
    await nextPreviewStep(page);
    await nextPreviewStep(page);
    const originalPreview = await page.getByTestId('event-preview').elementHandle();
    const originalScene = await page.getByTestId('event-scene-svg').elementHandle();
    const originalOverflow = await page.evaluate(() => [getComputedStyle(document.body).overflow, getComputedStyle(document.documentElement).overflow]);
    await openPreviewOptions(page, 'rental');
    const dialog = page.getByTestId('quote-options-popover');
    const trigger = page.getByTestId('quote-edit-rental');
    await expect(dialog).toHaveRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'false');
    await expect(dialog).toHaveAttribute('data-anchor-service', 'rental');
    await expect(dialog).toHaveAccessibleName(`${SERVICE_TEXT.rental.name[lang]} ${lang === 'ko' ? '옵션' : 'options'}`);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('quote-options-close')).toBeFocused();
    await expect(page.getByTestId('quote-options-backdrop')).toHaveCount(0);
    await expect(page.getByTestId('preview-popover-scene')).toHaveCount(0);
    await expect(page.getByTestId('event-scene')).toHaveCount(1);
    await expect(dialog.getByTestId('event-scene')).toHaveCount(0);
    expect(await originalPreview!.evaluate(node => node.isConnected)).toBe(true);
    expect(await originalScene!.evaluate(node => node.isConnected)).toBe(true);
    expect(await trigger.evaluate(node => node.closest('[inert]') === null)).toBe(true);
    expect(await page.evaluate(() => [getComputedStyle(document.body).overflow, getComputedStyle(document.documentElement).overflow])).toEqual(originalOverflow);

    const panel = page.getByTestId('quote-options-rental');
    const basic = panel.getByTestId('option-tab-basic');
    await basic.focus();
    await page.keyboard.press('End');
    // 키오스크 옵션의 마지막 페이지는 '체험·맞춤' (브랜드 맞춤 제작도 이 페이지에 있다)
    await expect(panel.getByTestId('option-tab-kiosk-1')).toBeFocused();
    await expect(panel.getByTestId('option-tab-kiosk-1')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(basic).toBeFocused();
    await expect(basic).toHaveAttribute('aria-selected', 'true');
    await panel.locator('#k-count').fill('2');
    await panel.locator('#k-count').press('Enter');
    await expect(page.locator('[data-testid="event-object"][data-service="rental"][data-kind="kiosk"]')).toHaveCount(2);
    await showOptionPage(page, 'rental', 'kiosk-1');
    await expect(page.getByTestId('kiosk-experience-gallery-1')).toBeVisible();
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await toggleKioskExperience(page, 'ai-sommelier', lang);
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('kiosk-experience-1-ai-sommelier')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-testid="event-object"][data-kind="kiosk"][data-instance="1"]')).toHaveAttribute('data-experience-slug', 'ai-sommelier');
    expect(await originalScene!.evaluate(node => node.isConnected)).toBe(true);

    const balloon = await dialog.boundingBox();
    const anchor = await trigger.locator('[data-options-anchor]').boundingBox();
    const arrow = await page.getByTestId('quote-options-arrow').boundingBox();
    const viewport = page.viewportSize()!;
    expect(balloon).not.toBeNull(); expect(anchor).not.toBeNull(); expect(arrow).not.toBeNull();
    expect(balloon!.x).toBeGreaterThanOrEqual(0);
    expect(balloon!.y).toBeGreaterThanOrEqual(0);
    expect(balloon!.x + balloon!.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(balloon!.y + balloon!.height).toBeLessThanOrEqual(viewport.height + 1);
    expect(balloon!.width).toBeLessThanOrEqual(480);
    expect(Math.abs(arrow!.x + arrow!.width / 2 - anchor!.x - anchor!.width / 2)).toBeLessThanOrEqual(1);
    if (await dialog.getAttribute('data-side') === 'top') expect(Math.abs(balloon!.y + balloon!.height + 12 - anchor!.y)).toBeLessThanOrEqual(1);
    else expect(Math.abs(balloon!.y - anchor!.y - anchor!.height - 12)).toBeLessThanOrEqual(1);
    await page.waitForTimeout(250);
    await page.screenshot({ path: testInfo.outputPath(`card-balloon-${lang}.png`), style: 'nextjs-portal { display: none !important; }' });

    const stored = async (): Promise<QuoteInput> => page.evaluate(() => JSON.parse(localStorage.getItem('neander-quote-preview-flow-v1')!));
    const configured = await stored();
    await expect(page.getByTestId('options-total')).toHaveAttribute('data-amount', String(calculateQuote(configured, lang).total));
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(await stored()).toEqual(configured);

    await openPreviewOptions(page, 'rental');
    await expect(panel.getByTestId('option-tab-kiosk-1')).toHaveAttribute('aria-selected', 'true');
    await page.getByTestId('quote-options-close').click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await openPreviewOptions(page, 'rental');
    await trigger.click();
    await expect(dialog).toBeHidden();
    await openPreviewOptions(page, 'rental');
    await page.getByTestId('event-preview-detail').click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('event-preview')).toHaveAttribute('data-view', 'detail');
    await openPreviewOptions(page, 'rental');
    // Focus may leave the nonmodal balloon; its background is never trapped.
    await page.locator('[data-testid="option-page-next"]:visible, [data-testid="quote-options-done"]:visible').last().focus();
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(false);
    // The portal is the document's last tab stop, so Chrome can focus its own
    // toolbar first. Re-entering an actual page control triggers dismissal.
    await page.getByTestId('quote-next').focus();
    await expect(dialog).toBeHidden();
    await openPreviewOptions(page, 'rental');
    await closePreviewOptions(page);
    expect(await stored()).toEqual(configured);
    await openPreviewOptions(page, 'rental');
    await page.getByTestId('quote-options-remove').click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-empty', 'true');
    await expect(page.getByTestId('event-object')).toHaveCount(0);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', '0');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}
