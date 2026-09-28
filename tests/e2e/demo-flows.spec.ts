import { test, expect, type Locator, type Page } from '@playwright/test';
import fs from 'node:fs';

const slugs = [...fs.readFileSync('src/data/demo-registry.ts', 'utf8').matchAll(/'(ai-[a-z-]+)':/g)].map(match => match[1]);
const variants = ['first', 'last'] as const;

async function reachable(locator: Locator): Promise<boolean> {
  return locator.evaluate(element => {
    if (element.closest('[inert], [hidden], [aria-hidden="true"]')) return false;
    const r = element.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(element).visibility === 'hidden') return false;
    if (element.closest('[data-scroll-mode="true"]')) return true;
    const clip = element.closest('.demo-page-clip')?.getBoundingClientRect();
    return !clip || (r.top >= clip.top - 3 && r.bottom <= clip.bottom + 3);
  });
}

async function pageForward(scope: Locator, page: Page): Promise<boolean> {
  const button = scope.getByRole('button', { name: '다음 내용', exact: true });
  if (await button.count() && await button.isEnabled()) { await button.click(); await page.waitForTimeout(180); return true; }
  return false;
}

async function checkFrame(page: Page) {
  const dimensions = await page.locator('[data-fit-viewport]').evaluate(stage => {
    const dialog = stage.closest('[role="dialog"]');
    return {
      stageX: stage.scrollWidth - stage.clientWidth, stageY: stage.scrollHeight - stage.clientHeight,
      dialogX: dialog ? dialog.scrollWidth - dialog.clientWidth : 0, dialogY: dialog ? dialog.scrollHeight - dialog.clientHeight : 0,
      documentX: document.documentElement.scrollWidth - innerWidth,
    };
  });
  for (const [name, overflow] of Object.entries(dimensions)) expect(overflow, name).toBeLessThanOrEqual(2);
}

for (const slug of slugs) for (const variant of variants) {
  test(`${slug} — ${variant} choices`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    const requests: Record<string, unknown>[] = [];
    const selectedProfile: Record<string, string> = {};
    let inputSteps = 0;
    page.on('pageerror', error => errors.push(error.message));
    // No live AI requests are allowed: exercise the visible example-result path.
    await page.route('**/api/demo-ai/**', async route => {
      requests.push(route.request().postDataJSON() as Record<string, unknown>);
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"E2E controlled example result"}' });
    });
    await page.goto(variant === 'first' ? `/services/${slug}` : `/services?demo=${slug}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.locator('[data-demo-view]').waitFor({ timeout: 60_000 });
    const primary = page.locator('.venue-navigation [data-primary]');
    await page.waitForTimeout(550);
    await checkFrame(page);
    await primary.click();
    await page.waitForTimeout(450);

    for (let iteration = 0; iteration < 8; iteration++) {
      if (await page.locator('.venue-workspace').count()) break;
      const field = page.locator('[data-profile-question]').first();
      await field.waitFor();
      if (await primary.isDisabled()) await expect(page.locator('#demo-blocked-reason')).toBeVisible();
      const id = await field.getAttribute('data-profile-question');
      let selected = false;
      for (let attempt = 0; attempt < 20 && !selected; attempt++) {
        const choices = field.locator('button');
        const count = await choices.count();
        const indexes = Array.from({ length: count }, (_, index) => variant === 'first' ? index : count - index - 1);
        for (const index of indexes) {
          const choice = choices.nth(index);
          if (!await reachable(choice)) continue;
          const value = await choice.getAttribute('data-option');
          await choice.click();
          await expect(choice).toHaveAttribute('aria-pressed', 'true');
          if (id && value) selectedProfile[id] = value;
          selected = true;
          break;
        }
        if (!selected && !await pageForward(page.locator('.venue-view-panel'), page)) await page.waitForTimeout(250);
      }
      expect(selected, `Reach profile question ${id}`).toBe(true);
      inputSteps++;
      await primary.click();
      await page.waitForTimeout(450);
    }

    for (let step = 0; step < 12; step++) {
      const view = await page.locator('[data-demo-view]').getAttribute('data-demo-view');
      if (view === 'result') break;
      if (view === 'analyzing') { await page.locator('[data-demo-view="result"]').waitFor({ timeout: 55_000 }); break; }
      const workspace = page.locator('.venue-workspace');
      await workspace.waitFor();
      const clicked = new Set<string>();
      let optionalSampleCaptured = false;
      for (let attempt = 0; attempt < 110; attempt++) {
        const inputs = workspace.locator('input:not([type="file"]):not([type="range"]), textarea');
        for (let i = 0; i < await inputs.count(); i++) {
          const input = inputs.nth(i);
          if (!await reachable(input) || !await input.isEditable()) continue;
          const type = await input.getAttribute('type');
          if (['checkbox', 'radio', 'hidden'].includes(type ?? '')) continue;
          await input.fill(type === 'date' ? (variant === 'first' ? '2000-06-15' : '1995-11-20') : type === 'number' ? (variant === 'first' ? '25' : '35') : type === 'email' ? 'e2e@example.com' : variant === 'first' ? '함께 배우는 오늘' : '새롭게 나누는 내일');
        }
        const sample = workspace.getByRole('button', { name: /샘플.*체험/ }).first();
        // Skin-care photos are optional: cover one supplied sample and one deliberate skip.
        if (slug === 'ai-skincare-analysis' && variant === 'first' && !optionalSampleCaptured && await sample.count() && await sample.isEnabled() && await reachable(sample)) {
          await sample.click();
          optionalSampleCaptured = true;
          await page.waitForTimeout(3400);
          continue;
        }
        if (!await primary.isDisabled()) break;
        await expect(page.locator('#demo-blocked-reason')).toBeVisible();
        if (await sample.count() && await sample.isEnabled() && await reachable(sample)) {
          await sample.click(); await page.waitForTimeout(3400); continue;
        }
        const ranges = workspace.getByRole('slider');
        for (let i = 0; i < await ranges.count(); i++) {
          if (!await reachable(ranges.nth(i))) continue;
          await ranges.nth(i).focus();
          await page.keyboard.press(variant === 'first' ? 'ArrowRight' : 'ArrowLeft');
        }
        if (!await primary.isDisabled()) break;
        const launch = workspace.getByRole('button', { name: /발사!/ });
        if (await launch.count() && await launch.isEnabled() && await reachable(launch)) {
          await launch.click(); await page.waitForTimeout(2500); continue;
        }
        const options = workspace.locator('button');
        const count = await options.count();
        const indexes = Array.from({ length: count }, (_, index) => variant === 'first' ? index : count - index - 1);
        let didClick = false;
        for (const index of indexes) {
          const button = options.nth(index);
          if (!await reachable(button) || await button.isDisabled()) continue;
          if (await button.evaluate(element => !!element.closest('.demo-page-pagination'))) continue;
          const label = (await button.innerText()).trim();
          const key = `${label}|${await button.getAttribute('aria-label')}`;
          if (clicked.has(key) || /카메라 켜기|사진 업로드|다시 촬영|사진 다시|마이크 켜기|녹음 시작|처음부터|다시 대화|촬영하기|이전 기록|대화 기록|상담으로/.test(label)) continue;
          if (await button.getAttribute('aria-pressed') === 'true') continue;
          clicked.add(key);
          await button.click();
          await page.waitForTimeout(slug === 'ai-product-experience' ? 1500 : 260);
          didClick = true;
          break;
        }
        if (!didClick && !await pageForward(workspace, page)) {
          const previous = workspace.getByRole('button', { name: '이전 내용', exact: true });
          if (await previous.count() && await previous.isEnabled()) {
            while (await previous.isEnabled()) await previous.click();
          }
          await page.waitForTimeout(350);
        }
      }
      await expect(primary, `Complete activity ${step + 1}`).toBeEnabled();
      await checkFrame(page);
      inputSteps++;
      await primary.click();
      await page.waitForTimeout(500);
    }

    await page.locator('[data-demo-view="result"]').waitFor({ timeout: 55_000 });
    await page.waitForTimeout(600);
    expect(inputSteps, 'Maximum five input steps').toBeLessThanOrEqual(5);
    if (slug === 'ai-skincare-analysis' && variant === 'last') {
      expect(requests, 'Optional photo skipped without an AI request').toHaveLength(0);
      await expect(page.locator('.venue-result-content')).toContainText('사진 없이 답변으로 준비한 관리 노트');
    } else {
      expect(requests.length).toBeGreaterThan(0);
      expect(requests[0].experienceProfile).toEqual(selectedProfile);
    }
    await expect(page.locator('.demo-result-notice')).toBeVisible();
    await expect(page.locator('.demo-result-notice')).toContainText('예시 결과');
    const copy = await page.locator('.venue-result-content').textContent() ?? '';
    expect(copy).not.toMatch(/undefined|NaN|\([을를]\)|을\(를\)|이\(가\)|은\(는\)|오버사이즈으로/);
    await checkFrame(page);
    if (slug === 'ai-product-experience') await expect(page.locator('.demo-result-core .demo-dark-surface')).toBeVisible();
    if (slug === 'ai-coord-recommender') await expect(page.locator('.demo-result-core > .grid')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('result.png') });
    for (const name of ['체험 결과', '맞춤 가이드', '출력물 저장']) {
      const tab = page.getByRole('tab', { name, exact: true });
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      const panel = page.locator(`[id="${await tab.getAttribute('aria-controls')}"]`);
      await expect(panel).toBeVisible();
      await expect(panel.locator('[data-content-pages]')).toHaveAttribute('data-content-pages', '1');
      if (name === '출력물 저장') await expect(panel.locator('.demo-print-controls')).toBeVisible();
      await checkFrame(page);
    }
    await page.getByRole('tab', { name: '체험 결과', exact: true }).click();
    if (slug === 'ai-product-experience') {
      const before = requests.length;
      await page.locator('.demo-result-notice').getByRole('button', { name: /다시 시도/ }).click();
      await expect.poll(() => requests.length).toBeGreaterThan(before);
      await page.locator('[data-demo-view="result"]').waitFor({ timeout: 55_000 });
      expect(requests.at(-1)).toEqual(requests[0]);
    }
    await page.locator('.venue-navigation [data-restart]').click();
    await page.locator('[data-demo-view="step-0"]').waitFor();
    await primary.click();
    await page.waitForTimeout(450);
    if (await page.locator('[data-profile-question]').count()) {
      await expect(page.locator('.venue-option[aria-pressed="true"]')).toHaveCount(0);
      await expect(primary).toBeDisabled();
    }
    expect(errors).toEqual([]);
    await testInfo.attach('flow-summary', { body: JSON.stringify({ slug, variant, inputSteps, requests: requests.length, profile: selectedProfile, errors }), contentType: 'application/json' });
  });
}
