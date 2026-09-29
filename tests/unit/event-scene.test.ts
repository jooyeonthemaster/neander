import assert from 'node:assert/strict';
import test from 'node:test';
import { SERVICE_ORDER, type ServiceKey } from '../../src/lib/quote/catalog';
import { calculateQuote, defaultOptions, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { EVENT_SCENE_FLOOR, isOnEventFloor, resolveEventScene, type EventSceneBounds, type EventSceneObjectType } from '../../src/lib/quote-preview/event-scene';
import { eventObjectGroundPoints } from '../../src/lib/quote-preview/booth-layout';

const physicalKeys = ['acscent', 'photoBooth', 'rental', 'spatialDesign', 'mediaArt'] as const;

function inputFor(keys: readonly ServiceKey[] = physicalKeys): QuoteInput {
  return sanitizeInput({
    eventType: 'popup', eventDate: '', days: 1, hoursPerDay: 6, attendees: 100,
    region: 'seoul', extraStaff: 0, items: keys.map((key) => defaultOptions(key)),
  });
}

function fullInput(): QuoteInput {
  const input = inputFor(SERVICE_ORDER);
  for (const item of input.items) {
    if (item.key === 'acscent') Object.assign(item.options, { extraTeams: 2, analysisKiosks: 4, volume: '50ml', guests: 300, customBox: true, customScent: true });
    if (item.key === 'photoBooth') Object.assign(item.options, { booths: 3, wrapping: true });
    if (item.key === 'rental') Object.assign(item.options, {
      kiosks: 4, printer: true, custom: 'brand',
      experienceSlugs: ['ai-personal-color', 'ai-sommelier', '', 'ai-personal-color'],
    });
    if (item.key === 'mediaArt') Object.assign(item.options, { extraSensors: 10, grade: 'premium' });
    if (item.key === 'spatialDesign') Object.assign(item.options, { photoZone: true, lighting: true });
  }
  return input;
}

test('all 31 physical-service combinations share one floor and never add unselected services', () => {
  for (let mask = 1; mask < 32; mask++) {
    const selected = physicalKeys.filter((_, index) => mask & (1 << index));
    const scene = resolveEventScene(inputFor([...selected, 'custom']))!;
    assert.deepEqual(scene.services, selected);
    assert.equal(scene.floor.points.length, 4);
    assert.ok(scene.objects.every((object) => selected.includes(object.service)));
    assert.ok(!JSON.stringify(scene).includes('"service":"custom"'));
    assert.equal(scene.zones.length, selected.length);
    for (const zone of scene.zones) {
      assert.ok(Object.values(zone.bounds).every(Number.isFinite), `${zone.service} needs finite bounds`);
    }
    assert.deepEqual(scene, resolveEventScene(inputFor(selected)), 'custom content must not change the physical scene');
  }
  assert.equal(resolveEventScene(inputFor([])), null);
  assert.equal(resolveEventScene(inputFor(['custom'])), null);
});

test('maximum configuration shows every device and all six perfume staff at the same equipment scale', () => {
  const scene = resolveEventScene(fullInput())!;
  const expected: Record<EventSceneObjectType, number> = {
    counter: 1, team: 3, 'analysis-kiosk': 4, 'photo-booth': 3, kiosk: 4, printer: 4,
    'media-screen': 1, projector: 1, sensor: 11, 'media-operator': 1, 'media-guest': 1, 'photo-zone': 1,
  };
  for (const [type, count] of Object.entries(expected)) {
    assert.equal(scene.objects.filter((object) => object.type === type).length, count, type);
  }
  assert.deepEqual(scene.counts, { teams: 3, staff: 6, analysisKiosks: 4, photoBooths: 3, kiosks: 4, printers: 4, sensors: 11, projectors: 1 });
  const equipment = scene.objects.filter((object) => !['counter', 'photo-zone'].includes(object.type));
  assert.equal(new Set(equipment.map((object) => object.scale)).size, 1);
  assert.equal(new Set(scene.objects.map((object) => object.id)).size, scene.objects.length);
  assert.deepEqual(scene.objects.filter((object) => object.type === 'team').map((object) => object.variant), [0, 1, 2]);
});

test('visible bounds and ground contacts fit the common scene, with separate service equipment unoccluded', () => {
  const scene = resolveEventScene(fullInput())!;
  const overlaps = (a: EventSceneBounds, b: EventSceneBounds) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  for (const object of scene.objects) {
    const context = `${object.id}: ${JSON.stringify(object.bounds)}`;
    assert.ok(object.bounds.left >= 0 && object.bounds.right <= scene.width, context);
    assert.ok(object.bounds.top >= 0 && object.bounds.bottom <= scene.height, context);
    assert.ok(isOnEventFloor(object, scene.floor.points), context);
    // Both sides of each grounded glyph fit the common floor, even the last
    // rental printer along its sloping edge. Tall image corners need not.
    assert.ok(isOnEventFloor({ x: object.bounds.left, y: object.y }, scene.floor.points), context);
    assert.ok(isOnEventFloor({ x: object.bounds.right, y: object.y }, scene.floor.points), context);
    for (const other of scene.objects) {
      if (object.service === other.service || object.type === 'photo-zone' || other.type === 'photo-zone') continue;
      // The photo-zone backdrop deliberately sits behind the perfume team.
      assert.ok(!overlaps(object.bounds, other.bounds), `${object.id} must not hide ${other.id}`);
    }
  }
});

test('floor and booth use the same 2:1 parallel depth projection with full-height walls behind the equipment', () => {
  const [a, b, c, d] = EVENT_SCENE_FLOOR.points;
  assert.equal(a.y, b.y);
  assert.equal(c.y, d.y);
  assert.equal(d.x - a.x, (a.y - d.y) * 2);
  assert.equal(c.x - b.x, (b.y - c.y) * 2);
  for (const size of ['booth3x3', 'booth6x3', 'large'] as const) {
    const input = fullInput();
    input.items = input.items.map((item) => item.key === 'spatialDesign' ? { ...item, options: { ...item.options, size } } : item);
    const scene = resolveEventScene(input)!;
    const footprint = scene.footprint!;
    const [frontLeft, frontRight, backRight, backLeft] = footprint.points;
    assert.equal(backLeft.x - frontLeft.x, (frontLeft.y - backLeft.y) * 2);
    assert.equal(backRight.x - frontRight.x, (frontRight.y - backRight.y) * 2);
    const personHeight = scene.objects.find((object) => object.type === 'media-operator')!;
    assert.ok(footprint.wallHeight >= (personHeight.bounds.bottom - personHeight.bounds.top) * 1.5);
    assert.ok(scene.bounds.top <= backLeft.y - footprint.wallHeight, 'camera bounds include the actual wall volume');
    assert.ok(scene.objects.every((object) => object.y >= backLeft.y), 'rear services stand in front of the wall or beside the booth');
  }
});

test('all eleven sensors remain separate from one another, the projector and visitors', () => {
  const scene = resolveEventScene(fullInput())!;
  const sensors = scene.objects.filter((object) => object.type === 'sensor');
  const equipment = scene.objects.filter((object) => ['sensor', 'projector', 'media-operator', 'media-guest'].includes(object.type));
  for (const sensor of sensors) for (const other of equipment) {
    if (sensor.id === other.id) continue;
    const a = sensor.bounds, b = other.bounds;
    assert.ok(!(a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top), `${sensor.id} overlaps ${other.id}`);
  }
});

test('one kiosk keeps one assigned experience, including duplicate and undecided slots and legacy drafts', () => {
  const input = fullInput();
  const kioskItem = input.items.find((item) => item.key === 'rental')!;
  const assignments = resolveEventScene(input)!.objects.filter((object) => object.type === 'kiosk');
  assert.deepEqual(assignments.map((object) => object.slug), ['ai-personal-color', 'ai-sommelier', '', 'ai-personal-color']);
  assert.ok(assignments.every((object) => object.branded));
  delete kioskItem.options.experienceSlugs;
  kioskItem.options.experienceSlug = 'ai-sommelier';
  assert.deepEqual(resolveEventScene(input)!.objects.filter((object) => object.type === 'kiosk').map((object) => object.slug), ['ai-sommelier', '', '', '']);
  kioskItem.options.printer = false;
  assert.equal(resolveEventScene(input)!.objects.filter((object) => object.type === 'printer').length, 0);
});

test('the purchased booth stays fixed and every selected device stays inside it', () => {
  const small = inputFor(['spatialDesign']);
  const smallScene = resolveEventScene(small)!;
  const fullScene = resolveEventScene(fullInput())!;
  assert.deepEqual(fullScene.footprint, smallScene.footprint);
  assert.deepEqual(fullScene.floor, smallScene.floor);
  assert.equal(smallScene.needsPlacement, false);
  assert.equal(fullScene.needsPlacement, false);
  assert.deepEqual(fullScene.outsideFootprint, []);
  for (const object of fullScene.objects) {
    assert.ok(eventObjectGroundPoints(object).every(point => isOnEventFloor(point, fullScene.footprint!.points)), object.id);
  }
  small.items[0] = { key: 'spatialDesign', options: { size: 'booth6x3', pyeong: 10, lighting: false, photoZone: false } };
  const wideScene = resolveEventScene(small)!;
  const smallWidth = smallScene.footprint!.points[1].x - smallScene.footprint!.points[0].x;
  const wideWidth = wideScene.footprint!.points[1].x - wideScene.footprint!.points[0].x;
  assert.equal(wideWidth, smallWidth * 2);
  assert.deepEqual([wideScene.footprint!.widthMeters, wideScene.footprint!.depthMeters], [6, 3]);
  assert.deepEqual(wideScene.floor, smallScene.floor);
});

test('all service combinations and maximum quantities fit every booth size without changing the quote', () => {
  for (const size of ['booth3x3', 'booth6x3', 'large'] as const) {
    for (let mask = 0; mask < 16; mask++) {
      const equipment = ['acscent', 'photoBooth', 'rental', 'mediaArt'] as const;
      const selected = equipment.filter((_, index) => mask & (1 << index));
      for (const maximum of [false, true]) {
        const input = maximum ? fullInput() : inputFor();
        input.items = input.items.filter(item => item.key === 'spatialDesign' || selected.some(key => key === item.key));
        const space = input.items.find(item => item.key === 'spatialDesign')!;
        space.options.size = size;
        const snapshot = structuredClone(input);
        const quote = calculateQuote(input);
        const scene = resolveEventScene(input)!;
        assert.deepEqual(scene.outsideFootprint, [], `${size}, ${selected}, maximum: ${maximum}`);
        for (const object of scene.objects) {
          assert.ok(eventObjectGroundPoints(object).every(point => isOnEventFloor(point, scene.footprint!.points)), `${size}: ${object.id}`);
        }
        assert.deepEqual(input, snapshot);
        assert.deepEqual(calculateQuote(input), quote);
      }
    }
  }
});

test('existing and custom venues do not imply a different purchased fixed booth', () => {
  const existing = resolveEventScene(inputFor(['acscent', 'rental']))!;
  assert.equal(existing.footprint, null);
  assert.equal(existing.space.size, 'existing');
  assert.equal(existing.needsPlacement, false);
  const input = inputFor(['spatialDesign']);
  input.items[0] = { key: 'spatialDesign', options: { size: 'large', pyeong: 35, photoZone: true, lighting: true } };
  const scene = resolveEventScene(input)!;
  assert.equal(scene.footprint!.widthMeters, null);
  assert.equal(scene.footprint!.depthMeters, null);
  assert.equal(scene.footprint!.pyeong, 35);
  // 맞춤 공간은 부스 구조를 고르지 않는다 — 나무 가벽이 저장돼 있어도 기본 구조로 그린다
  assert.deepEqual(scene.space, { size: 'large', photoZone: true, lighting: true, build: 'fabric' });
  assert.equal(scene.needsPlacement, false);
  input.items[0] = { key: 'spatialDesign', options: { size: 'large', pyeong: 35, photoZone: false, lighting: false, build: 'wood' } };
  assert.equal(resolveEventScene(input)!.space.build, 'fabric');
});

test('3×3 and 6×3 booths draw the chosen build: modular fabric by default, wooden walls when chosen', () => {
  for (const size of ['booth3x3', 'booth6x3'] as const) {
    const input = inputFor(['acscent', 'spatialDesign']);
    input.items[1] = { key: 'spatialDesign', options: { size, pyeong: 10, photoZone: false, lighting: false } };
    assert.equal(resolveEventScene(input)!.space.build, 'fabric');
    input.items[1] = { key: 'spatialDesign', options: { size, pyeong: 10, photoZone: false, lighting: false, build: 'wood' } };
    assert.equal(resolveEventScene(input)!.space.build, 'wood');
  }
});

test('option changes retain common anchors while details update, without modifying inputs or totals', () => {
  const input = fullInput();
  const saved = structuredClone(input);
  const quote = calculateQuote(sanitizeInput(input));
  const scene = resolveEventScene(input)!;
  assert.deepEqual(input, saved);
  assert.deepEqual(calculateQuote(sanitizeInput(input)), quote);
  const counter = scene.objects.find((object) => object.type === 'counter')!;
  assert.equal(counter.volume, '50ml');
  assert.equal(counter.packaging, 'custom');
  assert.equal(counter.customScent, true);
  assert.ok(scene.objects.filter((object) => object.type === 'photo-booth').every((object) => object.wrapped));
  assert.equal(scene.objects.find((object) => object.type === 'media-screen')!.grade, 'premium');

  const reordered = structuredClone(input);
  reordered.items.reverse();
  reordered.days = 20;
  reordered.attendees = 5000;
  reordered.extraStaff = 15;
  assert.deepEqual(resolveEventScene(reordered), scene, 'navigation/selection order and unrelated event fields cannot move furniture');
});

test('sanitization bounds malformed saved quantities without mutating the saved input', () => {
  const input = fullInput();
  for (const item of input.items) {
    if (item.key === 'acscent') Object.assign(item.options, { extraTeams: 999, analysisKiosks: 999 });
    if (item.key === 'photoBooth') item.options.booths = 999;
    if (item.key === 'rental') item.options.kiosks = 999;
    if (item.key === 'mediaArt') item.options.extraSensors = 999;
  }
  const saved = structuredClone(input);
  assert.deepEqual(resolveEventScene(input)!.counts, { teams: 1000, staff: 2000, analysisKiosks: 4, photoBooths: 3, kiosks: 4, printers: 4, sensors: 11, projectors: 1 });
  assert.deepEqual(input, saved);
});
