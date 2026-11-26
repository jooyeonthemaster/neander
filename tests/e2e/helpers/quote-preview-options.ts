import { expect, type Page } from '@playwright/test';
import { QUOTE_KIOSK_EXPERIENCES } from '../../../src/data/product-lines';

const publicKioskExperiences = QUOTE_KIOSK_EXPERIENCES;

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
  if (await page.getByTestId('quote-options-popover').isVisible() && await panel.isVisible()) {
    if (service === 'acscent') await fillPerfumeGuests(page, 100);
    return panel;
  }
  await closePreviewOptions(page);
  const add = page.getByTestId(`quote-add-${service}`);
  const edit = page.getByTestId(`quote-edit-${service}`);
  // 단계 전환 애니메이션이 끝나 카드가 나타난 뒤에 담았는지(add/edit)를 가린다
  await expect(add.or(edit)).toBeVisible();
  await (await add.isVisible() ? add : edit).click();
  await expect(page.getByTestId('quote-options-popover')).toBeVisible();
  await expect(panel).toBeVisible();
  // 2026-11-23: AI 조향사를 담으면 향수 인원을 직접 적어야 한다 — 테스트는 예전 기본값(100명)을 고른다
  if (service === 'acscent') await fillPerfumeGuests(page, 100);
  return panel;
}

/** AI 조향사 인원 입력 칸이 떠 있으면 인원을 고른다 (이미 적었으면 아무것도 하지 않는다) */
export async function fillPerfumeGuests(page: Page, guests: number) {
  const prompt = page.getByTestId('perfume-guests-prompt');
  if (!(await prompt.isVisible())) return;
  const chip = prompt.getByTestId(`perfume-guests-${guests}`);
  if (await chip.count()) await chip.click();
  else {
    await prompt.locator('#p-guests').fill(String(guests));
    await prompt.locator('#p-guests').press('Enter');
  }
  await expect(prompt).toHaveCount(0);
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

/** The photo-style gallery stays within one option topic. */
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

/** Browse the public kiosk experiences inside the existing option topic. */
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
  const index = publicKioskExperiences.findIndex(experience => experience.slug === slug);
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

/* ── 마지막 단계(가견적서 · 보고서 · 상담 요청) ── */

/** The fake estimate the mocked /api/quote-pdf returns. */
export const FAKE_ESTIMATE = { no: 'E2E-TEST-0001', token: 'e2e-test-only-token' } as const;

/**
 * Never let a test issue a real estimate or write an inquiry to production Firestore:
 * /api/quote-pdf answers with a fake PDF (or {no, token} for ?mode=token), Firestore
 * writes and the inquiry e-mail notification are aborted. Returns what was attempted.
 */
export async function mockQuoteSubmission(page: Page) {
  const estimates: { mode: 'pdf' | 'token'; body: { input?: unknown; lang?: string; recipient?: Record<string, string> } }[] = [];
  const blockedWrites: string[] = [];
  await page.route(url => url.hostname === 'firestore.googleapis.com' && /\/Write\/|:commit$|:batchWrite$/.test(url.pathname), route => {
    blockedWrites.push(route.request().url());
    return route.abort();
  });
  await page.route('**/api/inquiry-notify**', route => {
    blockedWrites.push(route.request().url());
    return route.abort();
  });
  await page.route('**/api/quote-pdf**', route => {
    const request = route.request();
    const mode = new URL(request.url()).searchParams.get('mode') === 'token' ? 'token' : 'pdf';
    estimates.push({ mode, body: request.postDataJSON() });
    if (mode === 'token') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FAKE_ESTIMATE) });
    return route.fulfill({
      status: 200, contentType: 'application/pdf', body: '%PDF-1.4\n% e2e fake estimate\n%%EOF\n',
      headers: { 'X-Estimate-No': FAKE_ESTIMATE.no, 'X-Estimate-Token': FAKE_ESTIMATE.token },
    });
  });
  return { estimates, blockedWrites };
}

/** 「가견적서 (PDF)」 tile → the popup form (name · e-mail · company · phone · consent). */
export async function openEstimateForm(page: Page) {
  // 2026-11-23: 가견적서도 팝업에서 연락처를 받는다
  await page.getByTestId('quote-final-estimate').click();
  const form = page.getByTestId('quote-request-modal').locator('form');
  await expect(form).toBeVisible();
  await expect(form.locator('button[type="submit"][value="pdf"]')).toBeVisible();
  return form;
}

/** 「보고서」 tile → modal with the format choice (한글 파일 · PDF) and the contact fields. */
export async function openReportForm(page: Page) {
  await page.getByTestId('quote-final-report').click();
  const form = page.getByTestId('quote-request-modal').locator('form');
  await expect(form).toBeVisible();
  await expect(form.locator('button[type="submit"][value="report"]')).toBeVisible();
  return form;
}

/** 「상담 요청」 tile → modal with the full request form. */
export async function openRequestForm(page: Page, lang: 'ko' | 'en') {
  await page.getByTestId('quote-final-request').click();
  const modal = page.getByTestId('quote-request-modal');
  await expect(modal).toBeVisible();
  // 2026-11-23: 고르는 단계 없이 입력 칸이 바로 열린다 (전화는 같은 화면 위쪽 한 줄)
  void lang;
  const form = modal.locator('form');
  await expect(form).toBeVisible();
  await expect(form.locator('button[type="submit"][value="request"]')).toBeVisible();
  return { modal, form };
}

/**
 * Full option summaries of the 「지금까지 고른 견적」 sidebar, one string per item.
 * The sidebar shows only the first two parts plus 「외 N개」 / "+N more"; the full list
 * is in the paragraph's title attribute (2026-11-22).
 */
export async function sidebarOptionSummaries(page: Page): Promise<string[]> {
  return page.locator('aside ul > li').evaluateAll(items => items.flatMap(item => {
    const summary = item.querySelectorAll(':scope > div > p')[2];
    return summary ? [summary.getAttribute('title') ?? summary.textContent ?? ''] : [];
  }));
}
