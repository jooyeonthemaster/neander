import { expect, test, type Page } from '@playwright/test';
import { closePreviewOptions, nextPreviewStep, openPreviewOptions, showOptionPage } from './helpers/quote-preview-options';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { normalizePreviewInput } from '../../src/lib/quote-preview/flow-storage';
import { QUOTE_PRESETS } from '../../src/lib/quote/presets';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';

// 2026-10-02 UI/UX 점검에서 고친 항목의 회귀 테스트 (docs/quote-preview.md 참고)
const FLOW_KEY = 'neander-quote-preview-flow-v1';
const saved = (page: Page): Promise<QuoteInput> => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), FLOW_KEY);
const route = (lang: 'ko' | 'en', path = '/quote-preview') => `${lang === 'en' ? '/en' : ''}${path}`;
async function toExperiences(page: Page, lang: 'ko' | 'en') {
  await page.goto(route(lang), { waitUntil: 'domcontentloaded' });
  await page.getByTestId('quote-start-blank').click();
  await nextPreviewStep(page);
  await nextPreviewStep(page);
  await expect(page.locator('[data-quote-step="2"]')).toBeVisible();
}

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: short desktop windows keep the balloon attached to its card at one height`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop window sizes');
    for (const viewport of [{ width: 1280, height: 700 }, { width: 1280, height: 660 }, { width: 1366, height: 768 }]) {
      await page.setViewportSize(viewport);
      await toExperiences(page, lang);
      const kiosk = await openPreviewOptions(page, 'rental');
      const balloon = page.getByTestId('quote-options-popover');
      const label = `${viewport.width}×${viewport.height}`;
      // 카드 위나 아래에 붙고(겹치지 않는다) 꼬리가 카드 이름을 가리킨다
      await expect(balloon, label).toHaveAttribute('data-side', /^(top|bottom)$/);
      await expect(page.getByTestId('quote-options-arrow')).toBeVisible();
      const geometry = async () => page.evaluate(() => {
        const box = document.querySelector('[data-testid="quote-options-popover"]')!.getBoundingClientRect();
        const name = document.querySelector('#preview-trigger-rental [data-options-anchor]')!.getBoundingClientRect();
        const title = document.querySelector('[data-testid="quote-options-popover"] h2')!.getBoundingClientRect();
        const scene = document.querySelector('[data-testid="preview-canvas"]')!.getBoundingClientRect();
        return {
          top: Math.round(box.top), height: Math.round(box.height), title: Math.round(title.top), scrollY: Math.round(window.scrollY),
          coversName: box.top < name.bottom && box.bottom > name.top,
          nameVisible: name.top >= 0 && name.bottom <= window.innerHeight,
          // 낮은 창에서는 미리보기 아래쪽(설명·확대 버튼)이 잘릴 수 있지만 그림의 절반 이상은 보인다
          sceneVisible: (Math.min(scene.bottom, window.innerHeight) - Math.max(scene.top, 80)) / scene.height,
        };
      });
      const opened = await geometry();
      expect(opened.coversName, `${label} balloon leaves the card name uncovered`).toBe(false);
      expect(opened.nameVisible, `${label} card name stays on screen`).toBe(true);
      expect(opened.sceneVisible, `${label} preview scene stays on screen`).toBeGreaterThanOrEqual(0.5);
      // 가장 짧은 첫 주제는 안쪽 스크롤 없이 보인다
      const area = kiosk.getByTestId('option-page-scroll');
      expect(await area.evaluate(element => element.scrollHeight - element.clientHeight), `${label} first topic`).toBeLessThanOrEqual(1);
      // 주제를 옮겨도 제목·탭이 위아래로 움직이지 않는다
      await page.locator('[data-testid="option-page-next"]:visible').click();
      await expect(kiosk.getByTestId('option-pages')).toHaveAttribute('data-current-page', 'kiosk-1');
      expect(await geometry(), `${label} second topic`).toEqual(opened);
      // 가장 긴 주제: 노트북 높이(768)면 그대로 다 보이고, 그보다 낮은 창은 안에서 조금 스크롤한다
      const overflow = await area.evaluate(element => element.scrollHeight - element.clientHeight);
      if (viewport.height >= 768) expect(overflow, `${label} tallest topic`).toBeLessThanOrEqual(1);
      else if (overflow > 4) await expect(area).toHaveAttribute('data-more-below', 'true');
      await page.screenshot({ path: testInfo.outputPath(`short-window-${viewport.width}x${viewport.height}-${lang}.png`), style: 'nextjs-portal { display: none !important; }' });
      await closePreviewOptions(page);
    }
  });

  test(`${lang}: mobile hides the page's total bar behind an open balloon and keeps 44px touch targets`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile layout');
    await toExperiences(page, lang);
    const bar = page.locator('[data-quote-bottom-bar]');
    await expect(bar).toBeVisible();
    const kiosk = await openPreviewOptions(page, 'rental');
    await expect(bar).toBeHidden();
    await kiosk.locator('#k-count').fill('3');
    await kiosk.locator('#k-count').press('Enter');
    await page.locator('[data-testid="option-page-next"]:visible').click();
    const cards = page.locator('[data-testid^="kiosk-experience-1-"]');
    await cards.nth(0).click();
    await cards.nth(1).click();
    await expect(page.getByTestId('kiosk-distribution')).toBeVisible();
    const targets = {
      close: page.getByTestId('quote-options-close'),
      tab: kiosk.getByRole('tab').first(),
      galleryNext: page.getByTestId('kiosk-assignment-1').getByRole('button', { name: lang === 'ko' ? '다음 체험 보기' : 'Next experiences', exact: true }),
      fewer: page.locator('[data-testid^="kiosk-distribution-less-"]').first(),
      more: page.locator('[data-testid^="kiosk-distribution-more-"]').first(),
      removeFromQuote: page.getByTestId('quote-options-remove'),
      previous: page.locator('[data-testid="option-page-previous"]:visible'),
      done: page.locator('[data-testid="quote-options-done"]:visible, [data-testid="option-page-next"]:visible'),
      cardRemove: page.getByTestId('quote-remove-rental'),
    };
    for (const [name, target] of Object.entries(targets)) {
      const box = await target.evaluate(node => { const rect = node.getBoundingClientRect(); return { width: rect.width, height: rect.height }; });
      expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44);
      expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44);
    }
    // 데모 링크는 보이는 크기를 그대로 두고 누르는 영역만 넓힌다 (이름 글자와 겹쳐 보이지 않게)
    const demo = await page.locator('[data-testid^="kiosk-demo-1-"]').first().evaluate(node => {
      const rect = node.getBoundingClientRect();
      const before = getComputedStyle(node, '::before');
      return { height: rect.height - parseFloat(before.top) - parseFloat(before.bottom), width: rect.width - parseFloat(before.left) - parseFloat(before.right) };
    });
    expect(demo.height).toBeGreaterThanOrEqual(44);
    expect(demo.width).toBeGreaterThanOrEqual(44);
    // 휴지통 둘레의 빈 띠: 바로 옆을 눌러도 카드(옵션)가 열리지 않는다
    await closePreviewOptions(page);
    await expect(bar).toBeVisible();
    const guard = (await page.getByTestId('quote-remove-guard-rental').boundingBox())!;
    await page.touchscreen.tap(guard.x + 3, guard.y + guard.height - 3);
    await page.waitForTimeout(200);
    await expect(page.getByTestId('quote-options-popover')).toBeHidden();
    await expect(page.getByTestId('quote-edit-rental')).toBeVisible();
  });

  test(`${lang}: totals name their VAT basis, flash the change and the kiosk summary does not repeat itself`, async ({ page }) => {
    await page.goto(route(lang), { waitUntil: 'domcontentloaded' });
    await page.getByTestId('quote-start-templates').click();
    // 템플릿 카드: 고른 뒤 보이는 예상 합계와 같은 기준(부가세 포함) + 부가세 별도 금액
    for (const preset of QUOTE_PRESETS) {
      const estimate = calculateQuote(normalizePreviewInput(structuredClone(preset.input)), lang);
      const price = page.getByTestId(`quote-template-price-${preset.id}`);
      await expect(price).toHaveAttribute('data-total', String(estimate.total));
      await expect(price).toHaveAttribute('data-supply', String(estimate.supply));
      await expect(price).toContainText(lang === 'ko' ? '부가세 포함' : 'incl. VAT');
      await expect(price).toContainText(lang === 'ko' ? '별도' : 'before VAT');
      // 그림 설명은 장식이다 — 버튼 이름은 템플릿 이름으로 시작한다
      await expect(page.getByTestId(`quote-preset-${preset.id}`)).toHaveAccessibleName(new RegExp(`^${preset.title[lang].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    }
    await page.getByTestId('quote-back-to-start').click();
    await page.getByTestId('quote-start-blank').click();
    await expect(page.locator('[data-quote-step="1"]')).toBeVisible();
    // 요약 칸의 '다음'은 내려받기 아이콘이 아니라 화살표
    await expect(page.getByTestId('quote-summary-action')).toHaveText(QUOTE_COPY[lang].next);
    await expect(page.getByTestId('quote-summary-action').locator('svg')).toHaveClass(/lucide-arrow-right/);
    await nextPreviewStep(page);
    // 운영 시간에도 단위가 붙는다
    await expect(page.locator('#q-hours').locator('xpath=..')).toContainText(lang === 'ko' ? '시간' : 'hours');
    await nextPreviewStep(page);

    const kiosk = await openPreviewOptions(page, 'rental');
    const before = Number(await page.getByTestId('quote-total').getAttribute('data-amount'));
    await kiosk.locator('#k-count').fill('3');
    await kiosk.locator('#k-count').press('Enter');
    await expect.poll(async () => (await saved(page)).items[0].options).toMatchObject({ kiosks: 3 });
    const quote = calculateQuote(await saved(page), lang);
    await expect(page.getByTestId('options-total')).toHaveAttribute('data-amount', String(quote.total));
    await expect(page.getByTestId('options-total-supply')).toHaveAttribute('data-amount', String(quote.supply));
    // 증감 표시가 잠깐 나타났다 사라진다
    const delta = page.locator('[data-testid="quote-total-delta"]:visible').first();
    await expect(delta).toHaveAttribute('data-delta', String(quote.total - before));
    await expect(delta).toContainText('+');
    await expect(page.locator('[data-testid="quote-total-delta"]')).toHaveCount(0, { timeout: 6_000 });
    // 체험을 아직 고르지 않았으면 대수를 되풀이하지 않는다
    const summary = page.getByRole('complementary');
    await expect(summary).toContainText(lang === 'ko' ? '3대 · 체험 미정' : '3 kiosks · experience not chosen yet');
    await expect(summary).not.toContainText(lang === 'ko' ? '상담 후 결정 3대' : 'Decide later ×3');
    await expect(summary.getByTestId('quote-items-vat-note')).toBeVisible();
    // 여러 대면 한 갤러리에서 여러 체험을 골라 나눠 담는다 — 접근성 이름도 그렇게 읽힌다
    await showOptionPage(page, 'rental', 'kiosk-1');
    await expect(page.getByTestId('kiosk-experience-gallery-1')).toHaveAccessibleName(lang === 'ko' ? '키오스크에 넣을 체험 둘러보기 · 여러 개 선택' : 'Browse experiences for your kiosks, choose one or more');
    await expect(page.getByTestId('kiosk-experience-gallery-1').getByRole('group')).toHaveAccessibleName(lang === 'ko' ? '키오스크 3대에 나눠 담을 체험 (최대 3종)' : 'Experiences to split across 3 kiosks (up to 3)');
  });

  test(`${lang}: small text and primary buttons meet 4.5:1`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'colours are the same on every screen');
    await toExperiences(page, lang);
    let kiosk = await openPreviewOptions(page, 'rental');
    await kiosk.locator('#k-count').fill('3');
    await kiosk.locator('#k-count').press('Enter');
    // 상세 금액을 펼쳐 둔 뒤(말풍선 밖을 누르면 닫힌다) 말풍선을 다시 열어 함께 잰다
    await closePreviewOptions(page);
    await page.locator('aside details summary').first().click();
    kiosk = await openPreviewOptions(page, 'rental');
    await expect(kiosk.getByTestId('option-pages')).toBeVisible();
    const ratios = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true })!;
      const rgba = (color: string) => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
      const over = (top: number[], bottom: number[]) => top.slice(0, 3).map((value, index) => value * top[3] + bottom[index] * (1 - top[3])).concat(1);
      const luminance = (color: number[]) => color.slice(0, 3).map((value) => { const channel = value / 255; return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const background = (node: Element | null): number[] => {
        let color = [255, 255, 255, 1];
        const layers: number[][] = [];
        for (let element = node; element; element = element.parentElement) layers.push(rgba(getComputedStyle(element).backgroundColor));
        for (const layer of layers.reverse()) color = over(layer, color);
        return color;
      };
      const ratio = (selector: string) => {
        const node = document.querySelector(selector);
        if (!node) return null;
        const back = background(node);
        const fore = over(rgba(getComputedStyle(node).color), back);
        const [light, dark] = [luminance(fore), luminance(back)].sort((a, b) => b - a);
        return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
      };
      return {
        summaryOptions: ratio('aside ul li p:nth-of-type(3)'),
        priceDetail: ratio('aside details ul li p.mt-1'),
        topicProgress: ratio('[data-testid="option-flow-progress"]'),
        unvisitedTab: ratio('[data-testid="quote-options-popover"] [role="tab"][data-visited="false"]'),
        currentTab: ratio('[data-testid="quote-options-popover"] [role="tab"][aria-selected="true"]'),
        nextTopic: ratio('[data-testid="option-page-next"]'),
        primaryButton: ratio('[data-testid="quote-summary-action"]'),
        pageNext: ratio('[data-testid="quote-next"]'),
        vatNote: ratio('[data-testid="quote-items-vat-note"]'),
      };
    });
    for (const [name, value] of Object.entries(ratios)) {
      expect(value, `${name} was measured`).not.toBeNull();
      expect(value!, name).toBeGreaterThanOrEqual(4.5);
    }
  });

  test(`${lang}: the estimate form points at the first empty field and retires the summary button when done`, async ({ page }) => {
    const c = QUOTE_COPY[lang];
    await page.goto(route(lang, '/quote-preview?item=rental'), { waitUntil: 'domcontentloaded' });
    for (let index = 0; index < 3; index++) await nextPreviewStep(page);
    const form = page.locator('[data-quote-step="3"] form');
    await expect(form).toBeVisible();
    const submit = form.locator('button[type="submit"]').first();
    await submit.click();
    await expect(page.locator('#q-name')).toBeFocused();
    await expect(page.locator('#q-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('quote-name-error')).toHaveText(c.nameRequired);
    await expect(page.getByTestId('quote-email-required')).toHaveText(c.emailRequired);
    await expect(page.getByTestId('quote-consent-error')).toHaveText(c.consentRequired);
    await expect(page.locator('[data-quote-step="3"]').getByRole('alert')).toHaveText(c.required);
    await page.locator('#q-name').fill('Tester');
    await expect(page.getByTestId('quote-name-error')).toHaveCount(0);
    await submit.click();
    await expect(page.locator('#q-email')).toBeFocused();
    await page.locator('#q-email').fill('not-an-email');
    // 칸을 벗어나면 형식 안내가 먼저 나타난다 (그 안내가 버튼을 밀어 내므로 벗어난 뒤에 누른다)
    await page.locator('#q-email').blur();
    await expect(page.getByTestId('quote-email-error')).toBeVisible();
    await submit.click();
    await expect(page.locator('#q-email')).toBeFocused();
    await expect(page.getByTestId('quote-email-error')).toHaveText(c.invalidEmail);
    await page.locator('#q-email').fill('tester@example.com');
    await submit.click();
    await expect(form.locator('input[name="consent"]')).toBeFocused();
    await form.locator('input[name="consent"]').check();
    await expect(page.getByTestId('quote-consent-error')).toHaveCount(0);
    await expect(page.getByTestId('quote-summary-action')).toBeVisible();
    await submit.click();
    // 미리보기 실험 페이지는 실제로 발급·접수하지 않는다
    await expect(page.getByTestId('quote-preview-complete')).toBeVisible();
    await expect(page.getByTestId('quote-summary-action')).toHaveCount(0);
  });
}

test('the first screen of /services and the home page is visible in the server HTML', async ({ browser, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'server HTML is the same for every screen');
  // 서버가 보낸 HTML 을 스크립트 없이 그대로 읽는다 — 제목과 그 바깥 요소에 opacity:0 이 남아 있으면
  // 스크립트가 실행되기 전까지 첫 화면이 비어 보인다
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ['/services', '/en/services', '/', '/en']) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    await page.setContent(await response.text(), { waitUntil: 'domcontentloaded' });
    const faded = await page.locator('h1').first().evaluate((heading) => {
      const hidden: string[] = [];
      for (let element: HTMLElement | null = heading as HTMLElement; element; element = element.parentElement) {
        if (element.style.opacity !== '' && Number(element.style.opacity) < 1) hidden.push(`${element.tagName.toLowerCase()}.${element.className.slice(0, 40)}`);
      }
      return hidden;
    });
    expect(faded, `${path} h1 and its ancestors`).toEqual([]);
    expect((await page.locator('h1').first().innerText()).trim().length, `${path} h1 text`).toBeGreaterThan(0);
  }
  await context.close();
});

test('the estimate page has a localized title and a way to reach us when the link is broken', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'same content on every screen');
  await page.goto('/quote/estimate?t=broken', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/^가견적서/);
  await expect(page.getByRole('link', { name: '새 견적 만들기', exact: true })).toHaveAttribute('href', /\/quote$/);
  await expect(page.getByRole('main').getByRole('link', { name: '담당자에게 문의하기', exact: true })).toHaveAttribute('href', /\/contact$/);
  await page.goto('/en/quote/estimate?t=broken', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/^Preliminary estimate/);
  await expect(page.getByRole('main').getByRole('link', { name: 'Contact us', exact: true })).toBeVisible();
});
