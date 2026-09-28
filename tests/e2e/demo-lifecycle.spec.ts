import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const tasteFixture = {
  base: 'fire', name: '화끈한 크림 모험가',
  desc: '선택한 매운맛과 크리미한 식감을 함께 즐기는 취향이에요.',
  foods: [{ emoji: '🌶️', name: '매운 크림 파스타', why: '매운맛과 크림의 조합' }],
  drinks: [{ emoji: '🥛', name: '우유', why: '식사와 함께 즐겨요' }],
  mission: { emoji: '🍝', name: '새 파스타 먹기', why: '선택한 식감 탐험' },
  hashtags: ['크림', '모험'],
};

/** Leave the representative demo on its last completed input, before generation. */
async function prepareTaste(page: Page) {
  await page.goto('/services?demo=ai-taste-dna', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-demo-view="step-0"]').waitFor();
  const primary = page.locator('.venue-navigation [data-primary]');
  await primary.click();
  await page.locator('[data-profile-question] button').first().click();
  await primary.click();
  const workspace = page.locator('.venue-workspace');
  await expect(workspace.locator('h2')).toHaveText('다섯 가지 기본 맛, 얼마나 좋아하세요?');
  await workspace.getByRole('slider').first().focus();
  await page.keyboard.press('Home');
  await primary.click();
  await expect(workspace.locator('h2')).toHaveText('매운맛, 어디까지 괜찮아요?');
  await workspace.getByRole('button', { name: /^0단계/ }).click();
  await primary.click();
  await expect(workspace.locator('h2')).toHaveText('가장 끌리는 식감은?');
  await workspace.locator('.demo-choice').first().click();
  await primary.click();
  await expect(workspace.locator('h2')).toHaveText('처음 보는 음식 앞에서 나는?');
  await workspace.locator('.demo-choice').first().click();
  await expect(primary).toBeEnabled();
  return primary;
}

test('failed generation retries the same input and removes the example notice after success', async ({ page }, testInfo) => {
  const requests: unknown[] = [];
  await page.route('**/api/demo-ai/**', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      status: requests.length === 1 ? 503 : 200,
      contentType: 'application/json',
      body: JSON.stringify(requests.length === 1 ? { error: 'Controlled unavailable response' } : tasteFixture),
    });
  });
  const primary = await prepareTaste(page);
  await primary.click();
  const result = page.locator('[data-demo-view="result"]');
  await expect(result).toBeVisible();
  const notice = page.locator('.demo-result-notice');
  await expect(notice).toContainText('예시 결과');
  await page.screenshot({ path: testInfo.outputPath('example-before-retry.png') });
  await notice.getByRole('button', { name: '같은 입력으로 다시 시도' }).click();
  await expect.poll(() => requests.length).toBe(2);
  await expect(result).toBeVisible();
  await expect(notice).toHaveCount(0);
  await expect(page.locator('.venue-result-content')).toContainText(tasteFixture.name);
  expect(requests[1]).toEqual(requests[0]);
  await page.screenshot({ path: testInfo.outputPath('generated-after-retry.png') });
});

test('generation shows elapsed progress without a pager and stops waiting at 45 seconds', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  let releaseRequest!: () => void;
  const held = new Promise<void>(resolve => { releaseRequest = resolve; });
  await page.route('**/api/demo-ai/**', async route => {
    await held;
    await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Controlled stalled response"}' }).catch(() => {});
  });
  try {
    const primary = await prepareTaste(page);
    await primary.click();
    const loading = page.locator('[data-demo-view="analyzing"]');
    await expect(loading).toBeVisible();
    await expect(loading.locator('.demo-page-pagination')).toHaveCount(0);
    // Real elapsed time also covers the browser's native AbortSignal deadline.
    // It avoids distorting Motion's exit/enter clocks while checking the bound.
    await expect(loading.locator('.venue-processing-time')).toContainText(/3\d초 경과/, { timeout: 35_000 });
    await expect(loading).toContainText('45초 안에 결과 또는 다시 시도 안내');
    await page.screenshot({ path: testInfo.outputPath('waiting-30-seconds.png') });
    await expect(page.locator('[data-demo-view="result"]')).toBeVisible({ timeout: 18_000 });
    const notice = page.locator('.demo-result-notice');
    await expect(notice).toHaveAttribute('data-result-status', 'timeout');
    await expect(notice).toContainText('생성이 오래 걸려 준비된 예시');
    await expect(notice.getByRole('button', { name: '같은 입력으로 다시 시도' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('timeout-example.png') });
  } finally {
    releaseRequest();
    // Reload abandons old chunk requests; do not wait on their obsolete route handlers.
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  }
});

test('stalled lazy module shows a reload action after 15 seconds and can recover', async ({ page }, testInfo) => {
  let releaseModule!: () => void;
  let heldModule = false;
  let shouldHold = true;
  const held = new Promise<void>(resolve => { releaseModule = resolve; });
  // Find the actual lazy chunk by its contents so production hash changes are safe.
  await page.route('**/_next/static/chunks/*.js', async route => {
    const response = await route.fetch();
    const source = await response.text();
    if (shouldHold && source.includes('다섯 가지 기본 맛, 얼마나 좋아하세요?')) {
      heldModule = true;
      await held;
    }
    await route.fulfill({ response, body: source }).catch(() => {});
  });
  await page.route('**/api/demo-ai/**', route => route.fulfill({ status: 503, body: '{}' }));
  try {
    await page.clock.install();
    await page.goto('/services?demo=ai-taste-dna', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => heldModule).toBe(true);
    const loading = page.locator('.mockup-loading');
    await expect(loading).toBeVisible();
    await expect(loading.locator('.demo-page-pagination')).toHaveCount(0);
    await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1_000)));
    await page.clock.fastForward(15_001);
    const reload = page.getByRole('button', { name: '다시 불러오기', exact: true });
    await expect(reload).toBeVisible();
    await expect(loading).toContainText('데모를 불러오지 못했어요. 다시 시도해 주세요.');
    await page.screenshot({ path: testInfo.outputPath('module-timeout.png') });
    shouldHold = false;
    releaseModule();
    await page.clock.resume();
    await reload.click();
    await expect(page.locator('[data-demo-view="step-0"]')).toBeVisible();
    await expect(loading).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('module-recovered.png') });
  } finally {
    shouldHold = false;
    releaseModule();
    // Reload abandons old chunk requests; do not wait on their obsolete route handlers.
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  }
});

test('failed print rendering exposes a retry and then downloads a valid image', async ({ page }, testInfo) => {
  await page.route('**/api/demo-ai/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const primary = await prepareTaste(page);
  await primary.click();
  await expect(page.locator('[data-demo-view="result"]')).toBeVisible();
  const originalRenderer = await page.evaluateHandle(() => HTMLCanvasElement.prototype.toDataURL);
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toDataURL = function () {
      throw new Error('Controlled first print attempt failure');
    };
  });
  await page.getByRole('tab', { name: '출력물 저장', exact: true }).click();
  const print = page.locator('.demo-print-stage');
  await expect(print).toContainText('출력 준비 실패');
  await expect(print.getByRole('alert')).toContainText('출력물을 만들지 못했어요. 다시 준비해 주세요.');
  const retry = print.getByRole('button', { name: '출력 다시 준비하기', exact: true });
  await expect(retry).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('print-failure.png') });
  await page.evaluate(original => { HTMLCanvasElement.prototype.toDataURL = original; }, originalRenderer);
  await originalRenderer.dispose();
  await retry.click();
  const save = print.getByRole('link', { name: '출력물 저장', exact: true });
  await expect(save).toBeVisible();
  const downloaded = page.waitForEvent('download');
  await save.click();
  const download = await downloaded;
  const file = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(file);
  const bytes = await readFile(file);
  expect(await download.failure()).toBeNull();
  expect(bytes.length).toBeGreaterThan(1_000);
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  expect(png || jpeg, 'Downloaded PNG or JPEG signature').toBe(true);
  await expect(print.getByRole('alert')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('print-recovered.png') });
});
