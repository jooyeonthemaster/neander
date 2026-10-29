import { expect, type Page } from '@playwright/test';
import { KIOSK_EXPERIENCES } from '../../../src/lib/quote/kiosk-experiences';

/** A restored draft opens on event details, just like a new quote. */
export async function enterExperienceStep(page: Page) {
  const experiences = page.locator('[data-quote-step="2"]');
  if (await experiences.isVisible()) return;
  const conditions = page.locator('[data-quote-step="1"]');
  await expect(conditions).toBeVisible();
  if (await conditions.getAttribute('data-quote-page') === '1') await nextPreviewStep(page);
  await nextPreviewStep(page);
  await expect(experiences).toBeVisible();
}

/** Close the live-updating editor without changing any selected option. */
export async function closePreviewOptions(page: Page) {
  const popover = page.getByTestId('quote-options-popover');
  if (await popover.isVisible()) {
    await page.getByTestId('quote-options-close').click();
    await expect(popover).toBeHidden();
  }
}

export async function openPreviewOptions(page: Page, service: string) {
  const panel = page.getByTestId(`quote-options-${service}`);
  if (await page.getByTestId('quote-options-popover').isVisible() && await panel.isVisible()) return panel;
  await closePreviewOptions(page);
  const add = page.getByTestId(`quote-add-${service}`);
  const edit = page.getByTestId(`quote-edit-${service}`);
  // 단계 전환 애니메이션이 끝나 카드가 나타난 뒤에 담았는지(add/edit)를 가린다
  await expect(add.or(edit)).toBeVisible();
  await (await add.isVisible() ? add : edit).click();
  await expect(page.getByTestId('quote-options-popover')).toBeVisible();
  await expect(panel).toBeVisible();
  return panel;
}

export async function showOptionPage(page: Page, service: string, id: string) {
  const panel = await openPreviewOptions(page, service);
  const tab = panel.getByTestId(`option-tab-${id}`);
  if (await tab.getAttribute('aria-selected') !== 'true') await tab.click();
  await expect(panel.getByTestId(`option-page-${id}`)).toBeVisible();
  return panel;
}

export async function removePreviewService(page: Page, service: string) {
  await closePreviewOptions(page);
  await page.getByTestId(`quote-remove-${service}`).click();
}

export async function nextPreviewStep(page: Page) {
  await closePreviewOptions(page);
  await page.getByTestId('quote-next').click();
}

/** Preview controls are outside the nonmodal balloon. Reopen the same editor
 * after inspecting its details, preserving the selected option topic. */
export async function openPreviewDetails(page: Page) {
  const detail = page.getByTestId('event-preview-detail');
  if (!(await detail.isVisible()) || await detail.getAttribute('aria-pressed') === 'true') return;
  const reopen = await page.getByTestId('quote-options-popover').isVisible();
  const service = await page.getByTestId('event-preview').getAttribute('data-active-service');
  await detail.click();
  await expect(page.getByTestId('event-preview')).toHaveAttribute('data-view', 'detail');
  await expect(page.getByTestId('service-preview')).toBeVisible();
  // The detail view changes the height of the column beside the service cards.
  // Let fonts and layout settle before measuring the card for a new popover.
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  if (reopen && service) await openPreviewOptions(page, service);
}

/** The photo-style gallery is one option topic with three internal views. */
export async function showPhotoGalleryPage(page: Page, target: number) {
  await showOptionPage(page, 'photoBooth', 'photo-styles');
  const gallery = page.getByTestId('photo-booth-templates');
  await expect(gallery).toBeVisible();
  let current = Number(await gallery.getAttribute('data-gallery-page'));
  while (current !== target) {
    await page.getByTestId(target > current ? 'booth-templates-next' : 'booth-templates-previous').click();
    const next = current + (target > current ? 1 : -1);
    await expect(gallery).toHaveAttribute('data-gallery-page', String(next));
    current = next;
  }
  return gallery;
}

/** Each kiosk owns a six-view experience gallery inside its existing topic. */
export async function showKioskGalleryPage(page: Page, _number: number, target: number, lang: 'ko' | 'en') {
  // 체험은 한 페이지(kiosk-1)에서 골라 여러 기기에 나눠 담는다
  await showOptionPage(page, 'rental', 'kiosk-1');
  const gallery = page.getByTestId('kiosk-experience-gallery-1');
  await expect(gallery).toBeVisible();
  let current = Number(await gallery.getAttribute('data-gallery-page'));
  while (current !== target) {
    const name = target > current
      ? lang === 'ko' ? '다음 체험 보기' : 'Next experiences'
      : lang === 'ko' ? '이전 체험 보기' : 'Previous experiences';
    await page.getByTestId('kiosk-assignment-1').getByRole('button', { name, exact: true }).click();
    const next = current + (target > current ? 1 : -1);
    await expect(gallery).toHaveAttribute('data-gallery-page', String(next));
    current = next;
  }
  return gallery;
}

/** 한 페이지에서 체험을 고르거나 뺀다 — 여러 대면 고른 체험들로 기기를 고르게 나눈다. slug '' 는 모두 상담 후 결정 */
export async function toggleKioskExperience(page: Page, slug: string, lang: 'ko' | 'en') {
  if (!slug) {
    await showOptionPage(page, 'rental', 'kiosk-1');
    await page.getByTestId('kiosk-experience-reset-1').click();
    await expect(page.getByTestId('kiosk-experience-assignments')).toHaveAttribute('data-assignments', /^,*$/);
    return;
  }
  const index = KIOSK_EXPERIENCES.findIndex(experience => experience.slug === slug);
  expect(index, `Known kiosk experience: ${slug}`).toBeGreaterThanOrEqual(0);
  await showKioskGalleryPage(page, 1, Math.floor(index / 4) + 1, lang);
  const card = page.getByTestId(`kiosk-experience-1-${slug}`);
  const before = await card.getAttribute('aria-checked');
  await card.click();
  await expect(card).toHaveAttribute('aria-checked', before === 'true' ? 'false' : 'true');
}

/** 고른 체험의 기기 수를 한 대 옮긴다 (+1: 늘리기, -1: 줄이기) */
export async function shiftKioskExperience(page: Page, slug: string, delta: 1 | -1) {
  await showOptionPage(page, 'rental', 'kiosk-1');
  await page.getByTestId(`kiosk-distribution-${delta > 0 ? 'more' : 'less'}-${slug}`).click();
}
