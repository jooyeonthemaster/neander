import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateQuote, defaultOptions, sanitizeInput, type QuoteItem } from '../../src/lib/quote/engine';
import { resolveServicePreview } from '../../src/lib/quote-preview/service-model';

function resolve(item: QuoteItem, lang: 'ko' | 'en' = 'ko') {
  return resolveServicePreview(sanitizeInput({ items: [item], days: 3 }), item.key, lang)!;
}

test('each service resolves independently; stale active keys fall back only to a selected service', () => {
  for (const key of ['acscent', 'photoBooth', 'rental', 'mediaArt', 'spatialDesign', 'custom'] as const) {
    const input = sanitizeInput({ items: [defaultOptions(key)] });
    const model = resolveServicePreview(input, 'acscent', 'ko');
    assert.equal(model?.key, key);
    if (key !== 'acscent' && key !== 'spatialDesign') assert.ok(model!.views.length > 0);
  }
  assert.equal(resolveServicePreview(sanitizeInput({ items: [] }), 'acscent', 'ko'), null);
});

test('photo booth wrapping and custom styles alter the relevant view without changing the take-home workflow', () => {
  const base = { key: 'photoBooth', options: { booths: 3, extraStyles: 4, extraPrintRolls: 2, photocard: false, wrapping: false } } as const;
  const plain = resolve(base);
  const wrapped = resolve({ ...base, options: { ...base.options, wrapping: true, customStyles: 2, custom: 'dedicated' } });
  assert.notEqual(plain.views[0].description, wrapped.views[0].description);
  assert.notEqual(plain.views.find((view) => view.id === 'style')!.description, wrapped.views.find((view) => view.id === 'style')!.description);
  assert.equal(plain.views.find((view) => view.id === 'result')!.description, wrapped.views.find((view) => view.id === 'result')!.description);
  assert.ok(wrapped.badges.includes('포토부스 3대'));
  assert.ok(wrapped.badges.includes('기존 스타일 6종'));
  assert.ok(wrapped.badges.includes('새 스타일 2종 제작'));
  assert.ok(wrapped.badges.includes('인화지 2롤 추가'));
  assert.ok(wrapped.notes.some((note) => note.includes('포토부스 수를 모두')));
  assert.ok(wrapped.notes.every((note) => !note.includes('대표 기기 1대')));
});

test('kiosk previews normalize former subscriptions to event rental and preserve exact device assignments', () => {
  for (const mode of ['event', 'monthly'] as const) {
    for (const printer of [false, true]) {
      const model = resolve({ key: 'rental', options: { mode, kiosks: 4, months: 6, printer, extraContents: 2, experienceSlug: 'ai-personal-color' } });
      assert.match(model.views[0].description, /키오스크 4대/);
      assert.equal(model.views[0].description.includes('프린터 4대'), false);
      assert.match(model.views[0].description, /행사장/);
      assert.equal(model.views[0].description.includes('상시 운영 공간'), false);
      assert.ok(model.badges.includes('키오스크 4대'));
      assert.ok(model.badges.includes('3일 행사 운영'));
      assert.ok(model.badges.includes('기기마다 체험 1종'));
      assert.equal(model.badges.includes('콘텐츠 3종'), false);
      assert.ok(model.views.some((view) => view.id === 'experience'));
      assert.equal(model.item.key, 'rental');
      if (model.item.key === 'rental') {
        assert.equal(model.item.options.mode, 'event');
        assert.equal(model.item.options.months, 1);
        assert.equal(model.item.options.experienceSlug, 'ai-personal-color');
        assert.deepEqual(model.item.options.experienceSlugs, ['ai-personal-color', '', '', '']);
      }
      assert.ok(model.views.every((view) => !/실제 운영 사례|AI 생성/.test(view.caption)));
    }
  }
  const invalid = resolve({ key: 'rental', options: { mode: 'event', kiosks: 1, months: 1, printer: false, extraContents: 0, experienceSlug: '../../secret' } });
  assert.equal(invalid.views.find((view) => view.id === 'experience')?.description, '기기 1대 중 0대의 체험을 골랐어요');
  assert.ok(invalid.notes.includes('미정인 기기의 체험은 나중에 정해도 괜찮아요.'));
});

test('media production tiers preserve one projector and operator while reporting every selected sensor', () => {
  const grades = new Set<string>();
  for (const grade of ['standard', 'premium', 'fullCustom'] as const) {
    const model = resolve({ key: 'mediaArt', options: { grade, extraSensors: 4 } });
    grades.add(model.badges[0]);
    assert.ok(model.badges.includes('센서 5세트'));
    assert.ok(model.badges.includes('프로젝터 1대'));
    assert.ok(model.badges.includes('운영 1인'));
    assert.ok(model.notes.some((note) => note.includes('선택한 센서 수를 모두')));
    assert.equal(model.views.find((view) => view.id === 'case')!.label, '장비 구성');
  }
  assert.equal(grades.size, 3);
});

test('custom scopes describe distinct experiences and retain planning and maintenance choices', () => {
  const single = resolve({ key: 'custom', options: { scope: 'standard', consulting: false, maintenanceMonths: 0 } });
  const large = resolve({ key: 'custom', options: { scope: 'large', consulting: true, maintenanceMonths: 12 } });
  assert.notEqual(single.views[0].description, large.views[0].description);
  assert.notDeepEqual(single.journey, large.journey);
  assert.ok(large.badges.includes('기획 컨설팅'));
  assert.ok(large.badges.includes('운영 관리 12개월'));
  assert.ok(large.notes.some((note) => note.includes('제작비에 기본 포함되는 것은 아니')));
});

test('all view metadata is bilingual, independent of raster assets, and cannot change the input or quote', () => {
  for (const lang of ['ko', 'en'] as const) {
    for (const key of ['photoBooth', 'rental', 'mediaArt', 'custom'] as const) {
      const input = sanitizeInput({ items: [defaultOptions(key)] });
      const original = structuredClone(input);
      const price = calculateQuote(input, lang);
      const model = resolveServicePreview(input, key, lang)!;
      assert.deepEqual(input, original);
      assert.deepEqual(calculateQuote(input, lang), price);
      assert.equal(model.journey.length, 3);
      assert.ok(model.notes.length);
      for (const view of model.views) {
        assert.ok(view.label && view.description && view.caption);
        assert.equal('asset' in view, false);
      }
      assert.doesNotMatch(JSON.stringify(model), /\/images\/|\.(webp|jpe?g|png|avif|gif)|\/Users\//);
    }
  }
});
