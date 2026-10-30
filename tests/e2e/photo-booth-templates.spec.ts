import { expect, test, type Page } from '@playwright/test';
import { enterExperienceStep, closePreviewOptions, nextPreviewStep, openPreviewDetails, showPhotoGalleryPage } from './helpers/quote-preview-options';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { calculateQuote, defaultOptions, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { PHOTO_BOOTH_TEMPLATES } from '../../src/lib/quote/photo-booth-templates';
import { getExperienceBySlug } from '../../src/data/experiences';

const FLOW_KEY = 'neander-quote-preview-flow-v1';
const LIVE_KEY = 'neander-quote-v2';
const publicTemplates = PHOTO_BOOTH_TEMPLATES.filter((template) => getExperienceBySlug(template.slug));
const templates = publicTemplates.slice(0, 3);
const galleryPages = Math.max(1, Math.ceil(publicTemplates.length / 4));
const step = (page: Page, index: number) => page.locator(`[data-quote-step="${index}"]`);
const choice = (page: Page, slug: string) => page.getByTestId(`booth-template-${slug}`);

async function openDetails(page: Page) {
  await openPreviewDetails(page);
}

async function passConditions(page: Page) {
  await expect(step(page, 1)).toHaveAttribute('data-quote-page', '1');
  await nextPreviewStep(page);
  await expect(step(page, 1)).toHaveAttribute('data-quote-page', '2');
  await nextPreviewStep(page);
  await expect(step(page, 2)).toBeVisible();
}

async function saved(page: Page, key = FLOW_KEY): Promise<QuoteInput> {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key);
}

async function total(page: Page) {
  return Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
}

async function expectPrice(page: Page, amount: number, lang: 'ko' | 'en') {
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(amount));
  await expect.poll(async () => calculateQuote(await saved(page), lang).total).toBe(amount);
}

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: existing templates and new custom styles have independent prices and survive the three-stage journey`, async ({ page }, testInfo) => {
    const path = lang === 'ko' ? '/quote-preview' : '/en/quote-preview';
    const existingLive = JSON.stringify(sanitizeInput({ days: 5, items: [defaultOptions('rental')] }));
    await page.addInitScript(({ key, value }) => {
      if (!sessionStorage.getItem('photo-template-test-seeded')) {
        localStorage.setItem(key, value);
        sessionStorage.setItem('photo-template-test-seeded', 'yes');
      }
    }, { key: LIVE_KEY, value: existingLive });
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('quote-studio')).toHaveAttribute('data-mode', 'preview');
    await expect(step(page, 1)).toBeVisible();
    await passConditions(page);
    await showPhotoGalleryPage(page, 1);
    const picker = page.locator('[data-testid="photo-booth-templates"]:visible');
    await expect(picker).toBeVisible();
    await expect(picker.locator('[data-testid^="booth-template-"][aria-pressed="true"]')).toHaveCount(0);
    await expect(picker.locator('[data-testid^="booth-template-"][aria-pressed]')).toHaveCount(Math.min(4, publicTemplates.length));
    const base = await total(page);

    // Choosing cards with Enter and Space preserves native button keyboard behavior.
    for (const [index, template] of templates.entries()) {
      const button = choice(page, template.slug);
      await expect(button).toHaveAccessibleName(template.name[lang]);
      await button.focus();
      await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expectPrice(page, base + (index === 2 ? 220_000 : 0), lang);
    }
    await expect(picker.getByTestId('booth-template-selection')).toContainText(lang === 'ko' ? '20만원' : '200,000');
    await expect(picker.locator('[data-testid^="booth-demo-"]')).toHaveCount(0);
    await expect(page.locator('.demo-modal-panel')).toHaveCount(0);

    await showPhotoGalleryPage(page, galleryPages);
    const customStyle = picker;
    const custom = customStyle.locator('#b-custom-style-enabled');
    await custom.click();
    await expect(custom).toHaveAttribute('aria-pressed', 'true');
    await expect(customStyle.locator('#b-cstyles')).toHaveValue('1');
    await expectPrice(page, base + 770_000, lang);
    await customStyle.locator('#b-cstyles').fill('2');
    await customStyle.locator('#b-cstyles').press('Enter');
    await expectPrice(page, base + 1_320_000, lang);
    await customStyle.locator('#b-cstyles').fill('1');
    await customStyle.locator('#b-cstyles').press('Enter');
    await expectPrice(page, base + 770_000, lang);

    for (const [index, template] of publicTemplates.entries()) {
      await showPhotoGalleryPage(page, Math.floor(index / 4) + 1);
      await expect(choice(page, template.slug)).toBeVisible();
      await expect(choice(page, template.slug).locator('svg[data-template-appearance]')).toHaveAttribute('data-template-appearance', template.appearance);
    }
    await expect(picker.getByTestId('booth-templates-page')).toHaveText(`${galleryPages} / ${galleryPages}`);
    await showPhotoGalleryPage(page, 1);
    await expect(picker.locator('img, canvas, svg image')).toHaveCount(0);
    await picker.screenshot({ path: testInfo.outputPath(`photo-templates-${lang}.png`), style: 'nextjs-portal { display: none !important; }' });

    // Inspect the growing result illustrations with the options closed so the
    // detail column does not move the card anchoring the active editor.
    await closePreviewOptions(page);
    await openDetails(page);
    for (const template of templates) {
      const example = page.getByTestId(`preview-photo-template-${template.slug}`);
      await expect(example).toContainText(template.name[lang]);
      await expect(example.locator('svg[data-template-appearance]')).toHaveAttribute('data-template-appearance', template.appearance);
    }
    await expect(page.getByTestId('preview-photo-custom-styles')).toHaveAttribute('data-count', '1');
    await expect(page.locator('[data-testid^="preview-photo-template-"]')).toHaveCount(3);

    await nextPreviewStep(page);
    await expect(step(page, 3)).toBeVisible();
    const summary = page.getByRole('complementary', { name: QUOTE_COPY[lang].sheetTitle });
    for (const template of templates) await expect(summary).toContainText(template.name[lang]);
    await expectPrice(page, base + 770_000, lang);
    await page.getByTestId('quote-prev').click();
    await expect(step(page, 2)).toBeVisible();
    await showPhotoGalleryPage(page, 1);
    for (const template of templates) await expect(choice(page, template.slug)).toHaveAttribute('aria-pressed', 'true');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(step(page, 1)).toBeVisible();
    await enterExperienceStep(page);
    await expect(step(page, 2)).toBeVisible();
    await showPhotoGalleryPage(page, 1);
    await openDetails(page);
    for (const template of templates) await expect(choice(page, template.slug)).toHaveAttribute('aria-pressed', 'true');
    await showPhotoGalleryPage(page, galleryPages);
    await expect(custom).toHaveAttribute('aria-pressed', 'true');
    await expectPrice(page, base + 770_000, lang);

    await showPhotoGalleryPage(page, 1);
    await choice(page, templates[2].slug).click();
    await expect(page.getByTestId(`preview-photo-template-${templates[2].slug}`)).toHaveCount(0);
    await expectPrice(page, base + 550_000, lang);
    await showPhotoGalleryPage(page, galleryPages);
    await custom.click();
    await expect(custom).toHaveAttribute('aria-pressed', 'false');
    await expectPrice(page, base, lang);
    await expect(page.getByTestId('preview-photo-custom-styles')).toHaveCount(0);
    const selection = (await saved(page)).items.find((item) => item.key === 'photoBooth')!.options;
    expect(selection.templateSlugs).toEqual(templates.slice(0, 2).map((template) => template.slug));
    expect(selection.extraStyles).toBe(0);
    expect(selection.customStyles).toBe(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), LIVE_KEY)).toBe(existingLive);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}

test('legacy style quantities migrate to named templates in both the live quote and the lab', async ({ page }) => {
  const input = sanitizeInput({ items: [{ key: 'photoBooth', options: { extraStyles: 3, customStyles: 2 } }] });
  await page.addInitScript(({ liveKey, flowKey, value }) => {
    if (!sessionStorage.getItem('photo-legacy-test-seeded')) {
      localStorage.setItem(liveKey, value);
      localStorage.setItem(flowKey, value);
      sessionStorage.setItem('photo-legacy-test-seeded', 'yes');
    }
  }, { liveKey: LIVE_KEY, flowKey: FLOW_KEY, value: JSON.stringify(input) });
  let liveAfterEdit: string | null = null;
  for (const [path, key] of [['/quote', LIVE_KEY], ['/quote-preview', FLOW_KEY]]) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await enterExperienceStep(page);
    const picker = await showPhotoGalleryPage(page, 1);
    await expect(picker).toContainText('저장된 추가 3종');
    await expect(picker.locator('[data-testid^="booth-template-"][aria-pressed="true"]')).toHaveCount(0);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(input, 'ko').total));
    await choice(page, templates[0].slug).click();
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(calculateQuote(input, 'ko').total - 660_000));
    await expect(picker).not.toContainText('저장된 추가');
    expect((await saved(page, key)).items.find(item => item.key === 'photoBooth')!.options).toMatchObject({ templateSlugs: [templates[0].slug], customStyles: 2 });
    if (key === LIVE_KEY) liveAfterEdit = await page.evaluate(key => localStorage.getItem(key), LIVE_KEY);
    else expect(await page.evaluate(key => localStorage.getItem(key), LIVE_KEY)).toBe(liveAfterEdit);
  }
});
