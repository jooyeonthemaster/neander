import { expect, test, type Locator, type Page } from '@playwright/test';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { SERVICE_ORDER } from '../../src/lib/quote/catalog';
import { calculateQuote, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { enterExperienceStep, closePreviewOptions, nextPreviewStep, openPreviewOptions, showOptionPage } from './helpers/quote-preview-options';

const storageKey = 'neander-quote-preview-flow-v1';
const canvas = (page: Page) => page.getByTestId('preview-canvas');
const viewport = (page: Page) => page.getByTestId('preview-canvas-viewport');
const saved = (page: Page): Promise<QuoteInput> => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey);
async function dimensions(target: Locator) {
  const box = (await target.boundingBox())!;
  return { width: box.width, height: box.height };
}
async function stableSize(page: Page, baseline: { width: number; height: number }) {
  await expect(canvas(page)).toHaveCount(1);
  await expect.poll(async () => {
    const actual = await dimensions(canvas(page));
    return Math.max(Math.abs(actual.width - baseline.width), Math.abs(actual.height - baseline.height));
  }).toBeLessThanOrEqual(1);
}
async function resetCamera(page: Page) {
  await page.getByTestId('preview-zoom-reset').click();
  await expect(canvas(page)).toHaveAttribute('data-zoom', '1');
  await expect(canvas(page)).toHaveAttribute('data-pan-x', '0');
  await expect(canvas(page)).toHaveAttribute('data-pan-y', '0');
  await expect(page.getByTestId('preview-zoom-value')).toHaveText('100%');
}
async function setNumber(page: Page, id: string, value: number) {
  await page.locator(`#${id}`).fill(String(value));
  await page.locator(`#${id}`).press('Enter');
}
async function fitGeometry(page: Page) {
  await expect.poll(() => page.locator('[data-testid="event-object"], [data-testid="event-booth-footprint"]').evaluateAll(nodes => nodes.flatMap(node => {
    const object = node as SVGGraphicsElement;
    const svg = object.ownerSVGElement;
    const rootMatrix = svg?.getCTM(), objectMatrix = object.getCTM();
    if (!svg || !rootMatrix || !objectMatrix) return ['missing SVG geometry'];
    const box = object.getBBox(), view = svg.viewBox.baseVal;
    const transform = rootMatrix.inverse().multiply(objectMatrix);
    const outside = [[box.x, box.y], [box.x + box.width, box.y], [box.x + box.width, box.y + box.height], [box.x, box.y + box.height]].some(([x, y]) => {
      const point = new DOMPoint(x, y).matrixTransform(transform);
      return point.x < view.x - 1 || point.x > view.x + view.width + 1 || point.y < view.y - 1 || point.y > view.y + view.height + 1;
    });
    const clip = node.closest('[data-testid="preview-canvas-viewport"]')!.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    const clipped = rect.left < clip.left - 1 || rect.right > clip.right + 1 || rect.top < clip.top - 1 || rect.bottom > clip.bottom + 1;
    return outside || clipped ? [object.getAttribute('data-object-id') ?? object.getAttribute('data-testid')] : [];
  }))).toEqual([]);
}
async function drag(page: Page, mobile: boolean) {
  // Raw touch coordinates must clear the site's sticky header.
  await viewport(page).evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  const box = (await viewport(page).boundingBox())!;
  const start = { x: box.x + box.width * .4, y: box.y + box.height * .4 };
  const delta = { x: 42, y: 22 };
  expect(await page.evaluate(point => !!document.elementFromPoint(point.x, point.y)?.closest('[data-testid="preview-canvas-viewport"]'), start)).toBe(true);
  if (mobile) {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
    for (let i = 1; i <= 5; i++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + delta.x * i / 5, y: start.y + delta.y * i / 5, id: 1 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + delta.x, start.y + delta.y, { steps: 5 });
    await page.mouse.up();
  }
  await expect.poll(async () => Number(await canvas(page).getAttribute('data-pan-x'))).toBeGreaterThan(20);
  await expect.poll(async () => Number(await canvas(page).getAttribute('data-pan-y'))).toBeGreaterThan(10);
}
async function pinch(page: Page) {
  await viewport(page).evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  const box = (await viewport(page).boundingBox())!;
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: center.x - 25, y: center.y, id: 1 }, { x: center.x + 25, y: center.y, id: 2 }] });
  for (let i = 1; i <= 5; i++) {
    const spread = 25 + i * 6;
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: center.x - spread, y: center.y, id: 1 }, { x: center.x + spread, y: center.y, id: 2 }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await session.detach();
  await expect.poll(async () => Number(await canvas(page).getAttribute('data-zoom'))).toBeGreaterThan(1.5);
}

test('wheel over the preview zooms around the cursor without scrolling the page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Mouse wheel interaction on desktop');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const input = sanitizeInput({ items: [{ key: 'acscent', options: {} }] });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: JSON.stringify(input) });
  await page.goto('/quote-preview', { waitUntil: 'domcontentloaded' });
  await enterExperienceStep(page);
  await viewport(page).evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const baseline = await dimensions(canvas(page));
  const selection = await saved(page);
  const total = await page.getByTestId('quote-total').getAttribute('data-amount');
  const scrollY = await page.evaluate(() => window.scrollY);
  const box = (await viewport(page).boundingBox())!;
  const cursor = { x: box.x + box.width * .65, y: box.y + box.height * .4 };
  await page.mouse.move(cursor.x, cursor.y);
  await page.mouse.wheel(0, -120);
  await expect.poll(async () => Number(await canvas(page).getAttribute('data-zoom'))).toBeGreaterThan(1);
  const zoom = Number(await canvas(page).getAttribute('data-zoom'));
  // Browser wheel coordinates can round to whole CSS pixels.
  expect(Number(await canvas(page).getAttribute('data-pan-x'))).toBeCloseTo((cursor.x - box.x - box.width / 2) * (1 - zoom), 0);
  expect(Number(await canvas(page).getAttribute('data-pan-y'))).toBeCloseTo((cursor.y - box.y - box.height / 2) * (1 - zoom), 0);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollY, 0);
  await stableSize(page, baseline);
  await page.screenshot({ path: testInfo.outputPath('wheel-zoom.png'), style: 'nextjs-portal{display:none!important}' });
  await page.mouse.wheel(0, 120);
  await expect.poll(async () => Number(await canvas(page).getAttribute('data-zoom'))).toBeCloseTo(1, 5);
  for (const [delta, limit] of [[-10_000, '3'], [10_000, '0.5']] as const) {
    await page.mouse.wheel(0, delta);
    await expect(canvas(page)).toHaveAttribute('data-zoom', limit);
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollY, 0);
  }
  // Firefox and some mouse drivers deliver lines or pages instead of pixels.
  for (const deltaMode of [1, 2]) {
    await resetCamera(page);
    const prevented = await viewport(page).evaluate((el, init) => !el.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true, cancelable: true, deltaY: -1, deltaMode: init.deltaMode,
      clientX: init.cursor.x, clientY: init.cursor.y,
    })), { deltaMode, cursor });
    expect(prevented).toBe(true);
    await expect.poll(async () => Number(await canvas(page).getAttribute('data-zoom'))).toBeGreaterThan(1);
  }
  await resetCamera(page);
  await drag(page, false);
  await resetCamera(page);
  await stableSize(page, baseline);
  expect(await saved(page)).toEqual(selection);
  await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', total!);
  const beforeOutside = await page.evaluate(() => window.scrollY);
  await page.mouse.move(8, 400);
  await page.mouse.wheel(0, beforeOutside > 150 ? -180 : 180);
  await expect.poll(async () => Math.abs(await page.evaluate(() => window.scrollY) - beforeOutside)).toBeGreaterThan(20);
  await expect(canvas(page)).toHaveAttribute('data-zoom', '1');
});

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: the same canvas fits the three automatic experiences and zooming or moving never changes the estimate`, async ({ page }, testInfo) => {
    const mobile = testInfo.project.name === 'mobile';
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
    await nextPreviewStep(page);
    await nextPreviewStep(page);
    await expect(canvas(page)).toHaveCount(1);
    await expect(page.getByTestId('event-scene')).toHaveAttribute('data-empty', 'true');
    const baseline = await dimensions(canvas(page));
    const measured: unknown[] = [{ state: 'empty', ...baseline }];
    await expect(canvas(page)).toHaveAttribute('data-zoom', '1');
    await expect(viewport(page)).toHaveAttribute('tabindex', '0');
    await expect(page.getByTestId('preview-zoom-in')).toHaveAccessibleName(lang === 'ko' ? '미리보기 확대' : 'Zoom in');
    await expect(page.getByTestId('preview-zoom-out')).toHaveAccessibleName(lang === 'ko' ? '미리보기 축소' : 'Zoom out');
    await openPreviewOptions(page, 'acscent');
    await closePreviewOptions(page);
    await stableSize(page, baseline);
    measured.push({ state: 'single-perfume', ...await dimensions(canvas(page)) });
    await page.getByTestId('preview-zoom-in').click();
    await expect(canvas(page)).toHaveAttribute('data-zoom', '1.25');
    await showOptionPage(page, 'acscent', 'analysis');
    await page.getByTestId('quote-options-acscent').getByRole('radiogroup', { name: QUOTE_COPY[lang].analysis, exact: true }).getByRole('radio').last().check();
    await setNumber(page, 'p-akiosk', 4);
    await showOptionPage(page, 'acscent', 'basic');
    await setNumber(page, 'p-teams', 3);
    await showOptionPage(page, 'photoBooth', 'basic');
    await setNumber(page, 'b-booths', 3);
    await showOptionPage(page, 'rental', 'basic');
    await setNumber(page, 'k-count', 4);
    await closePreviewOptions(page);
    await stableSize(page, baseline);
    await expect(canvas(page)).toHaveAttribute('data-zoom', '1.25');
    measured.push({ state: 'three-services-max-equipment', ...await dimensions(canvas(page)) });
    if (!mobile) {
      const options = await openPreviewOptions(page, 'acscent');
      const topic = await options.getByTestId('option-pages').getAttribute('data-current-page');
      await page.getByTestId('preview-zoom-in').click();
      await expect(canvas(page)).toHaveAttribute('data-zoom', '1.5');
      await expect(page.getByTestId('quote-options-popover')).toBeVisible();
      await expect(options.getByTestId('option-pages')).toHaveAttribute('data-current-page', topic!);
      await page.getByTestId('preview-zoom-out').click();
      await expect(canvas(page)).toHaveAttribute('data-zoom', '1.25');
      await expect(page.getByTestId('quote-options-popover')).toBeVisible();
      await closePreviewOptions(page);
    }
    for (const [kind, count] of [['team', 3], ['analysis-kiosk', 4], ['photo-booth', 3], ['kiosk', 4], ['printer', 0], ['sensor', 0]] as const) {
      await expect(page.locator(`[data-testid="event-object"][data-kind="${kind}"]`)).toHaveCount(count);
    }
    await resetCamera(page);
    await fitGeometry(page);
    const input = await saved(page);
    const total = await page.getByTestId('quote-total').getAttribute('data-amount');
    expect(Number(total)).toBe(calculateQuote(input, lang).total);
    const up = page.getByTestId('preview-zoom-in'), down = page.getByTestId('preview-zoom-out');
    for (let i = 0; i < 8; i++) await up.click();
    await expect(canvas(page)).toHaveAttribute('data-zoom', '3');
    await expect(up).toBeDisabled();
    await expect(page.getByTestId('preview-zoom-value')).toHaveText('300%');
    for (let i = 0; i < 10; i++) await down.click();
    await expect(canvas(page)).toHaveAttribute('data-zoom', '0.5');
    await expect(down).toBeDisabled();
    await resetCamera(page);
    await viewport(page).focus();
    await page.keyboard.press('+');
    await expect(canvas(page)).toHaveAttribute('data-zoom', '1.25');
    await page.keyboard.press('-');
    await expect(canvas(page)).toHaveAttribute('data-zoom', '1');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await expect(canvas(page)).not.toHaveAttribute('data-pan-x', '0');
    await expect(canvas(page)).not.toHaveAttribute('data-pan-y', '0');
    await page.keyboard.press('0');
    await expect(canvas(page)).toHaveAttribute('data-pan-x', '0');
    await expect(canvas(page)).toHaveAttribute('data-pan-y', '0');
    await drag(page, mobile);
    await resetCamera(page);
    const box = (await viewport(page).boundingBox())!;
    const at = { x: box.width * .6, y: box.height * .4 };
    await viewport(page).dblclick({ position: at });
    await expect(canvas(page)).toHaveAttribute('data-zoom', '1.5');
    // The point under the cursor stays anchored while scaling about the center.
    const pan = { x: Number(await canvas(page).getAttribute('data-pan-x')), y: Number(await canvas(page).getAttribute('data-pan-y')) };
    expect(pan.x).toBeCloseTo((at.x - box.width / 2) * -.5, 0);
    expect(pan.y).toBeCloseTo((at.y - box.height / 2) * -.5, 0);
    if (mobile) { await resetCamera(page); await pinch(page); }
    await stableSize(page, baseline);
    await page.mouse.move(5, 100);
    await page.waitForTimeout(250);
    await page.screenshot({ path: testInfo.outputPath(`zoomed-event-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
    await resetCamera(page);
    await fitGeometry(page);
    expect(await saved(page)).toEqual(input);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', total!);
    await page.screenshot({ path: testInfo.outputPath(`fit-event-${lang}.png`), style: 'nextjs-portal{display:none!important}' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
    await testInfo.attach('fixed-canvas-dimensions', { body: JSON.stringify(measured, null, 2), contentType: 'application/json' });
  });
}

test('every service detail and alternate view uses the same fixed canvas controls', async ({ page }, testInfo) => {
  const input = sanitizeInput({ items: [
    { key: 'acscent', options: { analysisKiosks: 2, extraTeams: 1 } },
    { key: 'photoBooth', options: { booths: 2, templateSlugs: ['ai-caricature-artist', 'ai-hanbok-booth'] } },
    { key: 'rental', options: { kiosks: 2, experienceSlugs: ['ai-personal-color', 'ai-face-reading'] } },
  ] });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: JSON.stringify(input) });
  await page.goto('/quote-preview', { waitUntil: 'domcontentloaded' });
  await enterExperienceStep(page);
  const baseline = await dimensions(canvas(page));
  const original = await saved(page);
  const total = await page.getByTestId('quote-total').getAttribute('data-amount');
  for (const service of SERVICE_ORDER.filter(key => ['acscent', 'photoBooth', 'rental'].includes(key))) {
    await openPreviewOptions(page, service);
    await closePreviewOptions(page);
    await page.getByTestId('event-preview-detail').click();
    await expect(page.getByTestId('service-preview')).toHaveAttribute('data-service', service);
    await expect(canvas(page)).toHaveCount(1);
    expect((await dimensions(canvas(page))).height).toBeCloseTo(baseline.height, 0);
    const alternate = service === 'acscent' || service === 'spatialDesign'
      ? page.locator('[data-testid^="preview-view-"]')
      : page.locator('[data-testid^="service-preview-view-"]');
    for (const button of await alternate.all()) {
      await button.click();
      await expect(canvas(page)).toHaveCount(1);
      expect((await dimensions(canvas(page))).height).toBeCloseTo(baseline.height, 0);
      await page.getByTestId('preview-zoom-in').click();
      await expect.poll(async () => Number(await canvas(page).getAttribute('data-zoom'))).toBeGreaterThan(1);
      await resetCamera(page);
    }
    await page.getByTestId('preview-zoom-in').click();
    await expect.poll(async () => Number(await canvas(page).getAttribute('data-zoom'))).toBeGreaterThan(1);
    await resetCamera(page);
    expect(await saved(page)).toEqual(original);
    await expect(page.getByTestId('quote-total')).toHaveAttribute('data-amount', total!);
    if (service === 'rental' || service === 'photoBooth') await page.screenshot({ path: testInfo.outputPath(`detail-${service}.png`), style: 'nextjs-portal{display:none!important}' });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
