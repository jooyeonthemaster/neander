import { expect, test, type Page } from '@playwright/test';
import { closePreviewOptions, enterExperienceStep, nextPreviewStep, openPreviewDetails, openPreviewOptions, showOptionPage } from './helpers/quote-preview-options';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { QUOTE_STORAGE_KEY } from '../../src/components/quote-studio/history';
import { calculateQuote, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { PREVIEW_STORAGE_KEY } from '../../src/lib/quote-preview/model';

const FLOW_STORAGE_KEY = 'neander-quote-preview-flow-v1';
const section = (page: Page, step: number) => page.locator(`[data-quote-step="${step}"]`);

async function openPreview(page: Page, lang: 'ko' | 'en' = 'ko') {
  await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('quote-studio')).toHaveAttribute('data-mode', 'preview');
  await expect(section(page, 1)).toBeVisible();
  await expect(section(page, 0)).toHaveCount(0);
}

async function savedPreview(page: Page): Promise<QuoteInput> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), FLOW_STORAGE_KEY);
}

async function expectPriceParity(page: Page) {
  await expect.poll(async () => Number(await page.getByTestId('quote-total').getAttribute('data-amount')) - calculateQuote(await savedPreview(page)).total).toBe(0);
}

async function expectOnlyVectors(page: Page) {
  const lab = page.getByTestId('quote-preview-lab');
  await expect(lab.locator('img, canvas, svg image')).toHaveCount(0);
  expect(await lab.evaluate(root => [...root.querySelectorAll('*')].flatMap(element => {
    const style = getComputedStyle(element);
    return [style.backgroundImage, style.maskImage].filter(value => /url\([^)]*\.(?:png|jpe?g|webp|gif|avif)/i.test(value));
  }))).toEqual([]);
}

async function begin(page: Page, lang: 'ko' | 'en' = 'ko') {
  await openPreview(page, lang);
  const progress = page.getByRole('navigation', { name: lang === 'ko' ? '견적 만들기 단계' : 'Estimate steps' });
  await expect(progress.getByRole('button')).toHaveCount(3);
  await expect(page.getByTestId('quote-start-blank')).toHaveCount(0);
  await expect(page.getByTestId('quote-start-templates')).toHaveCount(0);
  await enterExperienceStep(page);
}

async function expectPerfumeScene(page: Page, kiosks: number, teams: number) {
  await openPreviewDetails(page);
  const scene = page.getByTestId('perfumery-scene');
  await expect(scene).toHaveAttribute('data-kiosks', String(kiosks));
  await expect(scene).toHaveAttribute('data-teams', String(teams));
  await expect(scene).toHaveAttribute('data-staff', String(teams * 2));
  await expect(scene.getByTestId('scene-kiosk')).toHaveCount(kiosks);
  await expect(scene.getByTestId('scene-team')).toHaveCount(teams);
  await expect(scene.getByTestId('scene-counter')).toHaveCount(1);
  expect(await scene.locator('[data-placement="scene"]').evaluateAll(objects => objects.flatMap(object => {
    const svg = object.closest('svg');
    if (!svg) return ['Missing SVG parent'];
    const canvas = svg.getBoundingClientRect(), bounds = object.getBoundingClientRect();
    return bounds.left < canvas.left - 1 || bounds.right > canvas.right + 1 || bounds.top < canvas.top - 1 || bounds.bottom > canvas.bottom + 1
      ? [object.getAttribute('data-instance')] : [];
  }))).toEqual([]);
}

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: the three-step preview keeps perfume staffing, scent and packaging linked to its price`, async ({ page }) => {
    const c = QUOTE_COPY[lang];
    await begin(page, lang);
    await expect(page.getByTestId('quote-next')).toBeDisabled();
    await expect(page.locator('[data-testid^="quote-add-"]')).toHaveCount(6);
    const perfume = await showOptionPage(page, 'acscent', 'basic');
    await expect(perfume.getByTestId('option-tab-space')).toHaveCount(0);
    await expect(perfume.getByTestId('option-tab-teams')).toHaveCount(0);
    const teams = perfume.locator('#p-teams');
    await expect(teams).toHaveValue('1');
    await expect(teams).not.toHaveAttribute('max');
    const oneTeam = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
    for (const count of [2, 3, 4, 1]) {
      await teams.fill(String(count));
      await teams.press('Enter');
      await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(oneTeam + (count - 1) * 385000));
      await expectPerfumeScene(page, 0, count);
      if (count === 4) await expect(perfume.getByTestId('perfume-capacity-notice')).toContainText(lang === 'ko' ? '상담이 필요' : 'need consultation');
    }
    await perfume.getByRole('radiogroup', { name: c.volume, exact: true }).getByRole('radio', { name: /50ml/ }).check();
    await showOptionPage(page, 'acscent', 'packaging');
    const scents = perfume.getByRole('radiogroup', { name: lang === 'ko' ? '향 구성' : 'Scent selection', exact: true });
    const packaging = perfume.getByRole('radiogroup', { name: c.premiumPackaging, exact: true });
    await expect(scents.getByRole('radio').nth(0)).toBeChecked();
    await expect(packaging.getByRole('radio')).toHaveCount(3);
    const before = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
    await scents.getByRole('radio').nth(1).focus();
    await page.keyboard.press('Space');
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(before + 979000));
    await packaging.getByRole('radio').nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(packaging.getByRole('radio').nth(1)).toBeChecked();
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(before + 979000 + 550000));
    await packaging.getByRole('radio').nth(1).focus();
    await page.keyboard.press('ArrowRight');
    await expect(packaging.getByRole('radio').nth(2)).toBeChecked();
    await expect(perfume.locator('#p-guests')).toHaveValue('300');
    await expect(perfume.locator('#p-guests')).toHaveAttribute('min', '300');
    await expect(page.getByTestId('preview-product')).toHaveAttribute('data-packaging', 'custom');
    const withBox = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
    await scents.getByRole('radio').nth(0).check();
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(withBox - 979000));
    await packaging.getByRole('radio').nth(0).check();
    await expect(perfume.locator('#p-guests')).toHaveValue('100');
    await expect(perfume.locator('#p-guests')).toHaveAttribute('min', '20');
    await expect(page.getByTestId('preview-product')).toHaveAttribute('data-packaging', 'none');
    await expectPriceParity(page);
    await nextPreviewStep(page);
    await expect(section(page, 3)).toBeVisible();
    await expectOnlyVectors(page);
  });
}

test('inquiry-only services never add equipment, options or fees to the perfume preview', async ({ page }) => {
  await begin(page);
  await openPreviewOptions(page, 'acscent');
  await openPreviewDetails(page);
  await closePreviewOptions(page);
  const before = await savedPreview(page);
  const total = calculateQuote(before).total;
  for (const service of ['spatialDesign', 'mediaArt', 'custom']) {
    await page.getByTestId(`quote-add-${service}`).click();
    const notice = page.getByTestId('quote-consultation-notice');
    await expect(notice).toHaveAttribute('data-service', service);
    await expect(notice).toContainText('별도 문의 필요');
    await expect(notice.getByRole('link')).toHaveAttribute('href', '/contact');
    await expect(notice.locator('input, [data-price-tag]')).toHaveCount(0);
    await expect(page.getByTestId('quote-options-popover')).toBeHidden();
    await expect.poll(() => savedPreview(page)).toEqual(before);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', String(total));
  }
  await showOptionPage(page, 'acscent', 'basic');
  await expect(page.getByTestId('quote-consultation-notice')).toHaveCount(0);
  await expect(page.getByTestId('option-tab-space')).toHaveCount(0);
  await expectPriceParity(page);
});

test('every selected perfume kiosk and team stays in the existing venue without adding a booth', async ({ page }) => {
  await begin(page);
  const perfume = await showOptionPage(page, 'acscent', 'analysis');
  await perfume.getByRole('radiogroup', { name: QUOTE_COPY.ko.analysis, exact: true }).getByRole('radio').nth(1).check();
  for (const kiosks of [1, 2, 3, 4]) {
    await perfume.locator('#p-akiosk').fill(String(kiosks));
    await perfume.locator('#p-akiosk').press('Enter');
    await expectPerfumeScene(page, kiosks, 1);
  }
  await showOptionPage(page, 'acscent', 'basic');
  for (const teams of [2, 3]) {
    await perfume.locator('#p-teams').fill(String(teams));
    await perfume.locator('#p-teams').press('Enter');
    await expectPerfumeScene(page, 4, teams);
    await expect(page.getByTestId('perfumery-scene')).toHaveAttribute('data-space', 'existing');
    await expectOnlyVectors(page);
  }
  expect((await savedPreview(page)).items.map(item => item.key)).toEqual(['acscent']);
  await showOptionPage(page, 'acscent', 'analysis');
  await perfume.getByRole('radiogroup', { name: QUOTE_COPY.ko.analysis, exact: true }).getByRole('radio').nth(0).check();
  await expectPerfumeScene(page, 0, 3);
  await expectPriceParity(page);
});

test('legacy migration, reload and clear preserve the isolated production draft and issued history', async ({ page }) => {
  const production = sanitizeInput({ eventName: '실제 저장 행사', attendees: 77, items: [{ key: 'photoBooth', options: { booths: 2 } }, { key: 'rental', options: { kiosks: 2 } }] });
  const productionDraft = JSON.stringify(production);
  const productionHistory = JSON.stringify([{ no: 'TEST-EXISTING', issuedAt: '2026-09-28T00:00:00.000Z', token: 'test-only-existing-token', total: 123, summary: '기존 견적' }]);
  const legacyInput = sanitizeInput({ items: [{ key: 'acscent', options: { guests: 100, volume: '50ml' } }, { key: 'photoBooth', options: { booths: 1 } }] });
  const legacyDraft = JSON.stringify({ version: 1, input: legacyInput });
  await page.addInitScript(({ draftKey, oldKey, draft, history, legacy }) => {
    if (!sessionStorage.getItem('quote-preview-isolation-seeded')) {
      localStorage.setItem(draftKey, draft);
      localStorage.setItem('neander-estimates', history);
      localStorage.setItem(oldKey, legacy);
      sessionStorage.setItem('quote-preview-isolation-seeded', '1');
    }
  }, { draftKey: QUOTE_STORAGE_KEY, oldKey: PREVIEW_STORAGE_KEY, draft: productionDraft, history: productionHistory, legacy: legacyDraft });
  await openPreview(page);
  await expect.poll(async () => (await savedPreview(page)).items[0].options).toMatchObject({ volume: '50ml' });
  await expect(page.getByText('TEST-EXISTING')).toHaveCount(0);
  await enterExperienceStep(page);
  await openPreviewOptions(page, 'rental');
  await expect(page.getByTestId('kiosk-event-rental-note')).toBeVisible();
  await expect(page.locator('#k-printer, #k-months')).toHaveCount(0);
  await showOptionPage(page, 'photoBooth', 'prints');
  await page.locator('#b-wrap').check();
  await expectPriceParity(page);
  const selected = await savedPreview(page);
  expect(selected.items.map(item => item.key)).toEqual(['acscent', 'photoBooth', 'rental']);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(section(page, 1)).toBeVisible();
  await expect.poll(() => savedPreview(page)).toEqual(selected);
  await page.getByTestId('quote-clear').focus();
  await page.keyboard.press('Space');
  await expect.poll(async () => (await savedPreview(page)).items).toEqual([]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(section(page, 1)).toBeVisible();
  await expect.poll(async () => (await savedPreview(page)).items).toEqual([]);
  expect(await page.evaluate(({ draftKey, oldKey }) => ({ draft: localStorage.getItem(draftKey), history: localStorage.getItem('neander-estimates'), legacy: localStorage.getItem(oldKey) }), { draftKey: QUOTE_STORAGE_KEY, oldKey: PREVIEW_STORAGE_KEY })).toEqual({ draft: productionDraft, history: productionHistory, legacy: legacyDraft });
  await page.goto('/quote', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('quote-studio')).toHaveAttribute('data-mode', 'live');
  await expect(page.getByText('TEST-EXISTING', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), QUOTE_STORAGE_KEY)).toMatchObject({
    eventName: '실제 저장 행사', attendees: 77,
    items: [{ key: 'photoBooth', options: { booths: 2 } }, { key: 'rental', options: { kiosks: 2 } }],
  });
  await enterExperienceStep(page);
  await expect(page.getByTestId('quote-edit-photoBooth')).toBeVisible();
  await expect(page.getByTestId('quote-edit-rental')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).items, FLOW_STORAGE_KEY)).toEqual([]);
});

test('all three stages and automatically priced service details use vector illustrations', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openPreview(page);
  await expectOnlyVectors(page);
  await nextPreviewStep(page);
  await expectOnlyVectors(page);
  await enterExperienceStep(page);
  for (const service of ['acscent', 'photoBooth', 'rental']) {
    await openPreviewOptions(page, service);
    await openPreviewDetails(page);
    await expect(page.getByTestId('service-preview')).toHaveAttribute('data-service', service);
    await expectOnlyVectors(page);
    await expectPriceParity(page);
  }
  await nextPreviewStep(page);
  await expect(section(page, 3)).toBeVisible();
  await expectOnlyVectors(page);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('the final preview stage validates privately without issuing PDFs, creating inquiries or storing contact data', async ({ page }) => {
  const blockedWrites: string[] = [];
  const downloads: string[] = [];
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    const apiWrite = url.pathname.startsWith('/api/quote-pdf') || url.pathname.startsWith('/api/inquiry-notify');
    const firebaseWrite = url.hostname === 'firestore.googleapis.com' && (/\/Write\//.test(url.pathname) || /:commit$/.test(url.pathname) || /:batchWrite$/.test(url.pathname));
    if (apiWrite || firebaseWrite) { blockedWrites.push(request.method() + ' ' + url.href); await route.abort(); }
    else await route.continue();
  });
  page.on('download', download => downloads.push(download.suggestedFilename()));
  await begin(page);
  await openPreviewOptions(page, 'acscent');
  await nextPreviewStep(page);
  await page.locator('button[type="submit"][value="pdf"]').click();
  await expect(section(page, 3).getByRole('alert')).toHaveText(QUOTE_COPY.ko.required);
  await page.locator('#q-name').fill('실험 담당자');
  await page.locator('#q-email').fill('preview@example.com');
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"][value="pdf"]').click();
  await expect(page.getByTestId('quote-preview-complete')).toBeVisible();
  await page.getByTestId('quote-prev').click();
  const perfume = await showOptionPage(page, 'acscent', 'basic');
  await perfume.getByRole('radiogroup', { name: QUOTE_COPY.ko.volume, exact: true }).getByRole('radio', { name: /50ml/ }).check();
  await nextPreviewStep(page);
  await page.locator('button[type="submit"][value="request"]').click();
  await expect(page.getByTestId('quote-preview-complete')).toBeVisible();
  expect(blockedWrites).toEqual([]);
  expect(downloads).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('neander-estimates'))).toBeNull();
  expect(await page.evaluate(key => localStorage.getItem(key), QUOTE_STORAGE_KEY)).toBeNull();
  const draft = JSON.stringify(await savedPreview(page));
  expect(draft).not.toContain('preview@example.com');
  expect(draft).not.toContain('실험 담당자');
});
