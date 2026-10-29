import { expect, test, type Page } from '@playwright/test';
import { SERVICE_TEXT } from '../../src/lib/quote/catalog';
import { calculateQuote, type QuoteInput } from '../../src/lib/quote/engine';
import { KIOSK_EXPERIENCES } from '../../src/lib/quote/kiosk-experiences';
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
    // 키보드: 마지막 버튼에서 Tab 을 누르면 닫히고 카드 바로 다음 요소(이 카드의 빼기 버튼)로,
    // 첫 버튼에서 Shift+Tab 을 누르면 닫히고 카드로 돌아온다 — 사이트 헤더로 튀지 않는다
    await openPreviewOptions(page, 'rental');
    await page.locator('[data-testid="option-page-next"]:visible, [data-testid="quote-options-done"]:visible').last().focus();
    await page.keyboard.press('Tab');
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('quote-remove-rental')).toBeFocused();
    await openPreviewOptions(page, 'rental');
    await expect(page.getByTestId('quote-options-close')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
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

// 말풍선은 여는 순간 한 번만 자리를 잡는다. 열려 있는 동안에는 옵션을 고르거나 주제를 옮겨도
// 문서 스크롤·위아래 배치·높이가 그대로이고, 늘어난 내용은 말풍선 안에서 스크롤한다.
test.describe('an open balloon stays put', () => {
  // 화면이 움직이는지 보려면 애니메이션을 켠 상태여야 한다 (기본 설정은 reduce)
  test.use({ reducedMotion: 'no-preference' });

  const placement = (page: Page) => page.evaluate(() => {
    const balloon = document.querySelector<HTMLElement>('[data-testid="quote-options-popover"]')!;
    const box = balloon.getBoundingClientRect();
    return { scrollY: Math.round(window.scrollY), side: balloon.dataset.side, top: Math.round(box.top), height: Math.round(box.height) };
  });
  /** 여는 순간의 화면 맞춤(부드러운 스크롤)이 끝날 때까지 기다린다 */
  async function settled(page: Page) {
    let previous = await placement(page);
    await expect.poll(async () => {
      await page.waitForTimeout(250);
      const current = await placement(page);
      const still = JSON.stringify(current) === JSON.stringify(previous);
      previous = current;
      return still;
    }, { timeout: 10_000 }).toBe(true);
    return previous;
  }

  for (const lang of ['ko', 'en'] as const) {
    test(`${lang}: choosing kiosk experiences and changing topics never moves the document or flips the balloon`, async ({ page }) => {
      await page.route('**/api/demo-ai/**', route => route.abort());
      await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('quote-start-blank').click();
      await nextPreviewStep(page);
      await nextPreviewStep(page);

      const kiosk = await openPreviewOptions(page, 'rental');
      const opened = await settled(page);
      expect(['top', 'bottom', 'overlay']).toContain(opened.side);
      await kiosk.locator('#k-count').fill('3');
      await kiosk.locator('#k-count').press('Enter');
      await expect(page.locator('[data-testid="event-object"][data-service="rental"][data-kind="kiosk"]')).toHaveCount(3);
      expect(await settled(page), 'changing the kiosk count').toEqual(opened);

      await page.locator('[data-testid="option-page-next"]:visible').click();
      await expect(kiosk.getByTestId('option-pages')).toHaveAttribute('data-current-page', 'kiosk-1');
      expect(await settled(page), 'moving to the experience topic').toEqual(opened);

      const area = kiosk.getByTestId('option-page-scroll');
      const before = await area.evaluate(element => element.scrollHeight);
      // 갤러리 첫 쪽의 체험 두 개를 차례로 고른다
      for (const slug of KIOSK_EXPERIENCES.slice(0, 2).map(experience => experience.slug)) {
        await page.getByTestId(`kiosk-experience-1-${slug}`).click();
        await expect(page.getByTestId(`kiosk-experience-1-${slug}`)).toHaveAttribute('aria-checked', 'true');
        expect(await settled(page), `choosing ${slug}`).toEqual(opened);
      }
      // 고른 체험의 기기 배분 줄만큼 내용이 길어졌다 — 말풍선은 그대로이고 안에서 스크롤한다
      await expect(page.getByTestId('kiosk-distribution')).toBeVisible();
      expect(await area.evaluate(element => element.scrollHeight)).toBeGreaterThan(before);
      const overflow = await area.evaluate(element => element.scrollHeight - element.clientHeight);
      if (overflow > 4) await expect(area).toHaveAttribute('data-more-below', 'true');

      await page.locator('[data-testid="option-page-previous"]:visible').click();
      await expect(kiosk.getByTestId('option-pages')).toHaveAttribute('data-current-page', 'basic');
      expect(await settled(page), 'back to the first topic').toEqual(opened);
      await closePreviewOptions(page);

      // 향수: 주제를 끝까지 옮겨도 문서와 말풍선이 움직이지 않는다
      const perfume = await openPreviewOptions(page, 'acscent');
      const perfumeOpened = await settled(page);
      const pages = perfume.getByTestId('option-pages');
      const total = Number(await pages.getAttribute('data-total-steps'));
      expect(total).toBeGreaterThanOrEqual(4);
      for (let step = 2; step <= total; step++) {
        await page.locator('[data-testid="option-page-next"]:visible').click();
        await expect(pages).toHaveAttribute('data-current-step', String(step));
        expect(await settled(page), `perfume topic ${step}`).toEqual(perfumeOpened);
      }
    });

    test(`${lang}: kiosk customization cards show their whole label and price`, async ({ page }, testInfo) => {
      await page.goto(`${lang === 'en' ? '/en' : ''}/quote-preview`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('quote-start-blank').click();
      await nextPreviewStep(page);
      await nextPreviewStep(page);
      await showOptionPage(page, 'rental', 'kiosk-1');
      const group = page.getByTestId('kiosk-customization-cards');
      await group.scrollIntoViewIfNeeded();
      const cards = group.getByRole('radio');
      await expect(cards).toHaveCount(4);
      for (const choice of ['none', 'brand', 'content', 'dedicated'] as const) {
        if (choice !== 'none') await page.getByTestId(`kiosk-custom-${choice}`).click();
        await expect(page.getByTestId(`kiosk-custom-${choice}`)).toHaveAttribute('aria-checked', 'true');
        const measured = await cards.evaluateAll(nodes => nodes.map((node) => {
          const card = node.getBoundingClientRect();
          const mark = (node.querySelector('[data-card-mark]') ?? node.querySelector('svg.absolute'))?.getBoundingClientRect() ?? new DOMRect(-9, -9, 0, 0);
          // 글자가 실제로 차지하는 영역 (이름과 금액)
          const text = [...node.querySelectorAll('[data-card-text] > *')].map((part) => {
            const range = document.createRange();
            range.selectNodeContents(part);
            return range.getBoundingClientRect();
          });
          return {
            name: node.getAttribute('data-testid'),
            clipped: node.scrollHeight - node.clientHeight, clippedWidth: node.scrollWidth - node.clientWidth,
            height: Math.round(card.height),
            textInside: text.every((rect) => rect.top >= card.top - .5 && rect.bottom <= card.bottom + .5 && rect.left >= card.left - .5 && rect.right <= card.right + .5),
            markOverlapsText: text.some((rect) => rect.left < mark.right - .5 && rect.right > mark.left + .5 && rect.top < mark.bottom - .5 && rect.bottom > mark.top + .5),
          };
        }));
        for (const card of measured) {
          expect(card.clipped, `${card.name} height`).toBeLessThanOrEqual(0);
          expect(card.clippedWidth, `${card.name} width`).toBeLessThanOrEqual(0);
          expect(card.textInside, `${card.name} text stays inside the card`).toBe(true);
          expect(card.markOverlapsText, `${card.name} selection mark and text`).toBe(false);
        }
        // 네 장 모두 가장 큰 카드의 높이에 맞춘다
        expect(new Set(measured.map((card) => card.height)).size, JSON.stringify(measured)).toBe(1);
      }
      await group.screenshot({ path: testInfo.outputPath(`kiosk-custom-cards-${lang}.png`), style: 'nextjs-portal { display: none !important; }' });
    });
  }
});
