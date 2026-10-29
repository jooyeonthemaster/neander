import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PROJECTILE_HIT_TOLERANCE_M,
  PROJECTILE_TARGET_M,
  isProjectileHit,
  projectileOutcome,
  projectileRange,
} from '../../src/data/demo-ai/science-kiosk';
import { getServiceContactHref } from '../../src/lib/constants';

test('projectile target includes the ±2m boundary and rejects values outside it', () => {
  assert.equal(PROJECTILE_TARGET_M, 30);
  assert.equal(PROJECTILE_HIT_TOLERANCE_M, 2);
  for (const range of [28, 30, 32]) assert.equal(isProjectileHit(range), true, `${range}m`);
  for (const range of [27.999, 32.001, NaN, Infinity, -Infinity]) {
    assert.equal(isProjectileHit(range), false, `${range}m`);
  }
});

test('projectile measurements and result copy agree for a hit and a miss', () => {
  const hit = projectileRange(30, 18);
  const miss = projectileRange(45, 18);
  assert.equal(isProjectileHit(hit), true);
  assert.equal(projectileOutcome(hit), '30m 깃발 명중');
  assert.equal(isProjectileHit(miss), false);
  assert.equal(projectileOutcome(miss), '목표에서 3.1m 차이');
  assert.ok(Math.abs(projectileRange(30, 18) - projectileRange(60, 18)) < 1e-10);
});

test('quote links open the quote page with the selected service', () => {
  assert.deepEqual(getServiceContactHref('ai-science-kiosk'), {
    pathname: '/quote',
    query: { service: 'ai-science-kiosk' },
  });
});

test('inquiry links preserve the service without selecting the quote tab', () => {
  assert.deepEqual(getServiceContactHref('ai-fortune-robot', false), {
    pathname: '/contact',
    query: { service: 'ai-fortune-robot' },
  });
});
