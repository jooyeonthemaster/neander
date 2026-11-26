import { expect, test, type Page } from '@playwright/test';
import { FAKE_ESTIMATE, closePreviewOptions, enterExperienceStep, mockQuoteSubmission, nextPreviewStep, openEstimateForm, openPreviewDetails, openPreviewOptions, openReportForm, openRequestForm, showOptionPage } from './helpers/quote-preview-options';
import { QUOTE_COPY } from '../../src/components/quote-studio/copy';
import { QUOTE_STORAGE_KEY } from '../../src/components/quote-studio/history';
import { calculateQuote, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';

const section = (page: Page, step: number) => page.locator(`[data-quote-step="${step}"]`);

async function openPreview(page: Page, lang: 'ko' | 'en' = 'ko') {
  await page.goto(`${lang === 'en' ? '/en' : ''}/quote`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('quote-studio')).toBeVisible();
  await expect(section(page, 1)).toBeVisible();
  await expect(section(page, 0)).toHaveCount(0);
}

async function savedPreview(page: Page): Promise<QuoteInput> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), QUOTE_STORAGE_KEY);
}

async function expectPriceParity(page: Page) {
  await expect.poll(async () => Number(await page.getByTestId('quote-total').getAttribute('data-amount')) - calculateQuote(await savedPreview(page)).total).toBe(0);
}

async function expectOnlyVectors(page: Page) {
  const lab = page.getByTestId('quote-studio');
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
      if (count === 4) await expect(perfume.getByTestId('perfume-capacity-notice')).toContainText(lang === 'ko' ? '상담이 필요' : 'consult us');
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

test('a saved draft restores, reloads and clears while issued estimate history stays', async ({ page }) => {
  const draft = sanitizeInput({ eventName: '실제 저장 행사', attendees: 77, items: [{ key: 'photoBooth', options: { booths: 2 } }, { key: 'rental', options: { kiosks: 2 } }] });
  const history = JSON.stringify([{ no: 'TEST-EXISTING', issuedAt: '2026-09-28T00:00:00.000Z', token: 'test-only-existing-token', total: 123, summary: '기존 견적' }]);
  await page.addInitScript(({ draftKey, value, history }) => {
    if (!sessionStorage.getItem('quote-draft-seeded')) {
      localStorage.setItem(draftKey, value);
      localStorage.setItem('neander-estimates', history);
      sessionStorage.setItem('quote-draft-seeded', '1');
    }
  }, { draftKey: QUOTE_STORAGE_KEY, value: JSON.stringify(draft), history });
  await openPreview(page);
  await expect(page.getByText('TEST-EXISTING', { exact: true })).toBeVisible();
  await expect.poll(() => savedPreview(page)).toMatchObject({
    eventName: '실제 저장 행사', attendees: 77,
    items: [{ key: 'photoBooth', options: { booths: 2 } }, { key: 'rental', options: { kiosks: 2, mode: 'event' } }],
  });
  await enterExperienceStep(page);
  await expect(page.getByTestId('quote-edit-photoBooth')).toBeVisible();
  await openPreviewOptions(page, 'rental');
  await expect(page.getByTestId('kiosk-event-rental-note')).toBeVisible();
  await expect(page.locator('#k-printer, #k-months')).toHaveCount(0);
  await showOptionPage(page, 'photoBooth', 'prints');
  await page.locator('#b-wrap').check();
  await expectPriceParity(page);
  const selected = await savedPreview(page);
  expect(selected.items.map(item => item.key)).toEqual(['photoBooth', 'rental']);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(section(page, 1)).toBeVisible();
  await expect.poll(() => savedPreview(page)).toEqual(selected);
  await page.getByTestId('quote-clear').focus();
  await page.keyboard.press('Space');
  await expect.poll(async () => (await savedPreview(page)).items).toEqual([]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(section(page, 1)).toBeVisible();
  await expect.poll(async () => (await savedPreview(page)).items).toEqual([]);
  // 견적을 비워도 이 브라우저에서 받은 가견적서 목록은 그대로 남는다
  expect(await page.evaluate(() => localStorage.getItem('neander-estimates'))).toBe(history);
  await expect(page.getByText('TEST-EXISTING', { exact: true })).toBeVisible();
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

test('the final stage validates the estimate form and submits only to mocked estimate endpoints', async ({ page }) => {
  const c = QUOTE_COPY.ko;
  const { estimates, blockedWrites } = await mockQuoteSubmission(page);
  const downloads: string[] = [];
  page.on('download', download => downloads.push(download.suggestedFilename()));
  await begin(page);
  await openPreviewOptions(page, 'acscent');
  await nextPreviewStep(page);
  const final = section(page, 3);
  await expect(final).toBeVisible();
  for (const [id, name] of [
    ['quote-final-estimate', '가견적서 (PDF)'], ['quote-final-report', '보고서 (PDF · 한글 파일)'], ['quote-final-request', '상담 요청'],
  ]) await expect(page.getByTestId(id)).toHaveAccessibleName(name);
  await expect(final.locator('form')).toHaveCount(0);
  await expect(page.getByTestId('quote-summary-action')).toHaveCount(0);

  // 가견적서: 팝업에서 이름 · 이메일(필수) · 회사 · 전화(선택) · 동의만 묻고, 버튼은 하나
  const estimate = await openEstimateForm(page);
  await expect(estimate.locator('#q-name, #q-email, #q-company, #q-phone, input[name="consent"]')).toHaveCount(5);
  await expect(estimate.locator('#q-note, #q-referral, input[name="format"]')).toHaveCount(0);
  await expect(estimate.locator('button[type="submit"]')).toHaveCount(1);
  await estimate.locator('button[type="submit"][value="pdf"]').click();
  await expect(estimate.getByRole('alert')).toHaveText(c.required);
  await expect(page.locator('#q-name')).toBeFocused();
  await page.locator('#q-name').fill('견적 담당자');
  await page.locator('#q-email').fill('quote-e2e@example.com');
  await page.locator('input[name="consent"]').check();
  await estimate.locator('button[type="submit"][value="pdf"]').click();
  await expect(final.getByRole('status').filter({ hasText: c.pdfDone(FAKE_ESTIMATE.no) })).toBeVisible();
  expect(estimates.map(entry => entry.mode)).toEqual(['pdf']);
  expect(estimates[0].body).toMatchObject({ lang: 'ko', input: await savedPreview(page), recipient: { name: '견적 담당자', email: 'quote-e2e@example.com' } });
  await expect.poll(() => downloads).toEqual([`neander-estimate-${FAKE_ESTIMATE.no}.pdf`]);
  // 받은 가견적서는 이 브라우저 목록에 남는다 (연락처는 견적 초안에 남기지 않는다)
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('neander-estimates')))!)).toEqual([expect.objectContaining({ no: FAKE_ESTIMATE.no, token: FAKE_ESTIMATE.token })]);
  await expect(page.getByTestId('quote-final-estimate')).toHaveCount(0);

  // 구성을 바꾸면 다시 고를 수 있고, 연 입력 칸과 적은 연락처는 그대로다
  await page.getByTestId('quote-prev').click();
  const perfume = await showOptionPage(page, 'acscent', 'basic');
  await perfume.getByRole('radiogroup', { name: c.volume, exact: true }).getByRole('radio', { name: /50ml/ }).check();
  await nextPreviewStep(page);
  await expect(page.getByTestId('quote-final-estimate')).toBeVisible();
  await openEstimateForm(page);
  await expect(page.locator('#q-name')).toHaveValue('견적 담당자');
  await page.keyboard.press('Escape');
  await expect.poll(() => blockedWrites.length).toBeGreaterThan(0);
  const draft = JSON.stringify(await savedPreview(page));
  for (const secret of ['quote-e2e@example.com', '견적 담당자']) expect(draft).not.toContain(secret);
});

test('the report tile asks for contact details and a format before downloading', async ({ page }) => {
  const c = QUOTE_COPY.ko;
  const { estimates } = await mockQuoteSubmission(page);
  const downloads: string[] = [];
  page.on('download', download => downloads.push(download.suggestedFilename()));
  await begin(page);
  await openPreviewOptions(page, 'acscent');
  await nextPreviewStep(page);
  await expect(section(page, 3)).toBeVisible();

  // 보고서: 팝업에서 형식(한글 파일 · PDF)을 고르고 연락처를 적어야 받는다 — 바로 받아지지 않는다
  const report = await openReportForm(page);
  await expect(report.locator('input[name="format"]')).toHaveCount(2);
  await expect(report.locator('input[name="format"][value="hwpx"]')).toBeChecked();
  await expect(report.locator('#q-name, #q-email, #q-company, #q-phone, input[name="consent"]')).toHaveCount(5);
  await report.locator('button[type="submit"][value="report"]').click();
  await expect(report.getByRole('alert')).toHaveText(c.required);
  expect(downloads).toEqual([]);
  await page.locator('#q-name').fill('보고서 담당자');
  await page.locator('#q-email').fill('report-e2e@example.com');
  await report.locator('input[name="consent"]').check();
  await report.locator('button[type="submit"][value="report"]').click();
  await expect.poll(() => downloads.length).toBe(1);
  expect(downloads[0]).toMatch(/\.hwpx$/);
  expect(estimates.map(entry => entry.mode)).toEqual(['token']);
  await expect(section(page, 3).getByRole('status')).toContainText(FAKE_ESTIMATE.no);
  await expect(page.getByTestId('quote-request-modal')).toHaveCount(0);
});

test('the request modal offers a call or the full form and never reports an unsaved inquiry as received', async ({ page, isMobile }) => {
  const c = QUOTE_COPY.ko;
  const { estimates, blockedWrites } = await mockQuoteSubmission(page);
  await begin(page);
  await openPreviewOptions(page, 'acscent');
  await nextPreviewStep(page);
  await expect(section(page, 3)).toBeVisible();

  // 상담 요청: 한 화면에 전화 한 줄 + 입력 칸 (2026-11-23 — 고르는 단계 없음)
  await page.getByTestId('quote-final-request').click();
  const modal = page.getByTestId('quote-request-modal');
  await expect(page.getByTestId('quote-request-tel')).toHaveAttribute('href', /^tel:\+?\d+$/);
  await expect(modal.locator('form')).toBeVisible();
  void isMobile;
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
  const { form } = await openRequestForm(page, 'ko');
  await expect(form.locator('#q-name, #q-email, #q-company, #q-phone, #q-note, #q-referral, input[name="consent"]')).toHaveCount(7);
  await expect(form.locator('button[type="submit"]')).toHaveCount(1);
  await form.locator('button[type="submit"][value="request"]').click();
  await expect(form.getByRole('alert')).toHaveText(c.required);
  // soft: 팝업 안에서도 첫 빈 칸으로 포커스가 가고, 글자를 이어 칠 수 있어야 한다
  await expect.soft(page.locator('#q-name')).toBeFocused();
  await expect(page.getByTestId('quote-name-error')).toHaveText(c.nameRequired);
  await expect(page.getByTestId('quote-email-required')).toHaveText(c.emailRequired);
  await expect(page.getByTestId('quote-consent-error')).toHaveText(c.consentRequired);
  await page.locator('#q-note').pressSequentially('e2e test only');
  await expect.soft(page.locator('#q-note')).toHaveValue('e2e test only');
  await page.locator('#q-note').fill('e2e test only');
  await page.locator('#q-name').fill('상담 담당자');
  await page.locator('#q-email').fill('request-e2e@example.com');
  await page.locator('#q-phone').fill('010-0000-0000');
  await form.locator('input[name="consent"]').check();
  expect(estimates).toEqual([]);
  await form.locator('button[type="submit"][value="request"]').click();
  await expect.poll(() => estimates.map(entry => entry.mode)).toEqual(['token']);
  expect(estimates[0].body).toMatchObject({ lang: 'ko', input: await savedPreview(page), recipient: { name: '상담 담당자', email: 'request-e2e@example.com', phone: '010-0000-0000' } });
  // 문의 저장(Firestore)은 막혀 있으므로 접수되지 않고, 저장 시간(15초)이 지나면 오류를 알린다
  await expect(form.getByRole('alert')).toHaveText(c.error, { timeout: 25_000 });
  expect(blockedWrites.length).toBeGreaterThan(0);
  await expect(page.getByText(c.requestDone)).toHaveCount(0);
  const draft = JSON.stringify(await savedPreview(page));
  for (const secret of ['request-e2e@example.com', '상담 담당자', '010-0000-0000', 'e2e test only']) expect(draft).not.toContain(secret);
});
