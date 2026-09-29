import assert from 'node:assert/strict';
import test from 'node:test';
import { createPreviewInput } from '../../src/lib/quote-preview/model';
import { resolvePerfumeScene } from '../../src/lib/quote-preview/perfume-scene';
import { type QuoteInput } from '../../src/lib/quote/engine';

function inputWith(extraTeams: number, kiosks: number, size: 'booth3x3' | 'booth6x3' = 'booth3x3'): QuoteInput {
  const input = createPreviewInput();
  const perfume = input.items.find((item) => item.key === 'acscent')!;
  perfume.options.extraTeams = extraTeams;
  perfume.options.analysisKiosks = kiosks;
  input.items.find((item) => item.key === 'spatialDesign')!.options.size = size;
  return input;
}

test('every allowed perfume team and kiosk count is represented, including overflow', () => {
  for (const size of ['booth3x3', 'booth6x3'] as const) {
    for (let extraTeams = 0; extraTeams <= 2; extraTeams++) {
      for (let kiosks = 0; kiosks <= 4; kiosks++) {
        const model = resolvePerfumeScene(inputWith(extraTeams, kiosks, size))!;
        assert.equal(model.kiosks.length, kiosks);
        assert.equal(model.teams.length + model.overflowTeams.length, extraTeams + 1);
        assert.equal(model.staff, (extraTeams + 1) * 2);
        assert.equal(new Set([...model.teams, ...model.overflowTeams].map((team) => team.id)).size, extraTeams + 1);
        assert.equal(model.counter.id, 'counter');
        // The SVG uses an 800 x 520 world. Actual rendered glyph bounds are
        // checked in the browser; the pure model must provide valid origins.
        for (const object of [...model.teams, ...model.kiosks, model.counter]) {
          assert.ok(object.x >= 0 && object.x <= 800);
          assert.ok(object.y >= 0 && object.y <= 520);
          assert.ok(Number.isFinite(object.scale) && object.scale > 0);
        }
        assert.doesNotMatch(JSON.stringify(model), /\.(png|jpe?g|webp|gif)|\/images\//);
      }
    }
  }
});

test('more teams never enlarge the purchased footprint or add tables', () => {
  const base = resolvePerfumeScene(inputWith(0, 1))!;
  const crowded = resolvePerfumeScene(inputWith(2, 4))!;
  assert.deepEqual(crowded.footprint, base.footprint);
  assert.deepEqual(crowded.floor, base.floor);
  assert.deepEqual(crowded.counters.map(counter => counter.racks), base.counters.map(counter => counter.racks));
  assert.ok(crowded.overflowTeams.length > 0);
  assert.equal(crowded.needsPlacement, true);
});

test('size changes preserve glyph proportions and express the selected footprint', () => {
  const small = resolvePerfumeScene(inputWith(0, 1, 'booth3x3'))!;
  const wide = resolvePerfumeScene(inputWith(0, 1, 'booth6x3'))!;
  assert.deepEqual(small.footprint, { width: 3, depth: 3 });
  assert.deepEqual(wide.footprint, { width: 6, depth: 3 });
  assert.equal(small.kiosks[0].scale, small.teams[0].scale);
  assert.equal(wide.kiosks[0].scale, wide.teams[0].scale);
  assert.ok(small.floor.width < wide.floor.width);
});

test('every kiosk base stays on the purchased booth floor, including its rear corners', () => {
  // KioskGlyph's pedestal touches the floor along this projected quadrilateral.
  // Its upper cabinet and decorative shadow are not floor-contact geometry.
  const baseCorners = [[-24, 0], [16, 0], [25, -6], [-15, -6]] as const;
  const tolerance = 1e-6;
  for (const size of ['booth3x3', 'booth6x3'] as const) {
    for (let count = 1; count <= 4; count++) {
      for (const extraTeams of [0, 2]) {
        for (const photoZone of [false, true]) {
          for (const lighting of [false, true]) {
            const input = inputWith(extraTeams, count, size);
            const space = input.items.find((item) => item.key === 'spatialDesign')!;
            space.options.photoZone = photoZone;
            space.options.lighting = lighting;
            const model = resolvePerfumeScene(input)!;
            const floor = model.floor;
            for (const kiosk of model.kiosks) {
              for (const [cornerX, cornerY] of baseCorners) {
                const x = kiosk.x + cornerX * kiosk.scale;
                const y = kiosk.y + cornerY * kiosk.scale;
                // Resolve into the floor's front-to-back and left-to-right axes.
                // A rectangular viewport test cannot detect a device past the
                // sloping platform edge; both coordinates must be within 0..1.
                const depth = (floor.front - y) / floor.depthY;
                const across = (x - floor.left - depth * floor.depthX) / floor.width;
                const context = `${size}, ${count} kiosks, ${extraTeams + 1} teams, ${kiosk.id} corner (${x}, ${y})`;
                assert.ok(depth >= -tolerance && depth <= 1 + tolerance, `${context} is beyond the floor depth`);
                assert.ok(across >= -tolerance && across <= 1 + tolerance, `${context} is past the sloping floor edge`);
              }
            }
          }
        }
      }
    }
  }
});

test('two teams and two kiosks remain visible in the main small-booth arrangement', () => {
  const model = resolvePerfumeScene(inputWith(1, 2))!;
  assert.equal(model.teams.length, 2);
  assert.equal(model.overflowTeams.length, 0);
  assert.equal(model.kiosks.length, 2);
  assert.equal(model.needsPlacement, true);
});

test('days, guests and unrelated staff do not multiply perfume teams', () => {
  const input = inputWith(1, 2);
  input.days = 10;
  input.attendees = 5000;
  input.extraStaff = 30;
  const model = resolvePerfumeScene(input)!;
  assert.equal(model.totalTeams, 2);
  assert.equal(model.staff, 4);
  assert.equal(model.kiosks.length, 2);
});

test('no space purchase and custom venues do not imply a prefabricated booth', () => {
  const input = inputWith(0, 0);
  input.items = input.items.filter((item) => item.key !== 'spatialDesign');
  const existing = resolvePerfumeScene(input)!;
  assert.equal(existing.size, 'existing');
  assert.equal(existing.footprint, null);
  const largeInput = inputWith(0, 0);
  largeInput.items.find((item) => item.key === 'spatialDesign')!.options.size = 'large';
  assert.equal(resolvePerfumeScene(largeInput)!.footprint, null);
});

test('photo-zone and lighting selections remain explicit rather than changing staff or furniture', () => {
  const input = inputWith(1, 2);
  const base = resolvePerfumeScene(input)!;
  const space = input.items.find((item) => item.key === 'spatialDesign')!;
  space.options.photoZone = true;
  space.options.lighting = true;
  const withExtras = resolvePerfumeScene(input)!;
  assert.equal(withExtras.photoZone, true);
  assert.equal(withExtras.lighting, true);
  assert.deepEqual(withExtras.footprint, base.footprint);
  assert.deepEqual(withExtras.counters.map(counter => counter.racks), base.counters.map(counter => counter.racks));
  assert.equal(withExtras.totalTeams, base.totalTeams);
  assert.equal(withExtras.kiosks.length, base.kiosks.length);
});

test('sanitization protects scene quantities without mutating quote input', () => {
  const input = inputWith(100, 100);
  const before = structuredClone(input);
  const model = resolvePerfumeScene(input)!;
  assert.equal(model.totalTeams, 101);
  assert.equal(model.kiosks.length, 4);
  assert.deepEqual(input, before);
  input.items = input.items.filter((item) => item.key !== 'acscent');
  assert.equal(resolvePerfumeScene(input), null);
});
