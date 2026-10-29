import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../src/app/api/quote-pdf/route';
import { CONSULTATION_SERVICES } from '../../src/lib/quote/catalog';
import { calculateQuote, sanitizeInput } from '../../src/lib/quote/engine';
import { createEstimateToken, readEstimateToken, type EstimateSnapshot } from '../../src/lib/quote/token';

const recipient = { name: 'Local test', email: 'local-test@example.com' };
function requestFor(items: unknown[], lang: 'ko' | 'en' = 'ko') {
  return new NextRequest('http://localhost/api/quote-pdf?mode=token', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': 'unit-test-consultation' },
    body: JSON.stringify({ input: { items }, recipient, lang }),
  });
}

test('new PDF issuance rejects empty and inquiry-only selections before issuing an estimate', async () => {
  const empty = await POST(requestFor([]));
  assert.equal(empty.status, 400);
  assert.deepEqual(await empty.json(), { error: 'empty' });
  for (const lang of ['ko', 'en'] as const) {
    for (const keys of [...CONSULTATION_SERVICES.map((key) => [key]), [...CONSULTATION_SERVICES]]) {
      const response = await POST(requestFor(keys.map((key) => ({ key, options: {} })), lang));
      assert.equal(response.status, 400);
      const result = await response.json();
      assert.equal(result.error, 'consultation_required');
      assert.match(result.message, lang === 'ko' ? /별도 문의/ : /separate inquiry/);
      assert.equal(result.no, undefined);
      assert.equal(result.token, undefined);
    }
  }
});

test('new estimates can include a priced experience without billing inquiry-only items', async () => {
  const previousSecret = process.env.QUOTE_SIGNING_SECRET;
  process.env.QUOTE_SIGNING_SECRET = 'local-unit-test-signing-secret';
  try {
    const items = [{ key: 'rental', options: { kiosks: 1 } }, { key: 'spatialDesign', options: { size: 'large', pyeong: 500 } }];
    const response = await POST(requestFor(items));
    assert.equal(response.status, 200);
    const issued = await response.json();
    const snapshot = readEstimateToken(issued.token);
    assert.ok(snapshot);
    const pricedOnly = calculateQuote(sanitizeInput({ items: [items[0]] }));
    assert.deepEqual([snapshot.result.supply, snapshot.result.vat, snapshot.result.total], [pricedOnly.supply, pricedOnly.vat, pricedOnly.total]);
    assert.deepEqual(snapshot.result.lines.filter((line) => !line.tbd), pricedOnly.lines);
    assert.equal(snapshot.result.lines.find((line) => line.service === 'spatialDesign')?.tbd, true);
  } finally {
    if (previousSecret === undefined) delete process.env.QUOTE_SIGNING_SECRET;
    else process.env.QUOTE_SIGNING_SECRET = previousSecret;
  }
});

test('signed estimates issued before inquiry-only pricing remain downloadable with their original snapshot', async () => {
  const previousSecret = process.env.QUOTE_SIGNING_SECRET;
  process.env.QUOTE_SIGNING_SECRET = 'local-unit-test-signing-secret';
  try {
    const snapshot: EstimateSnapshot = {
      v: 1, no: 'NQ-LEGACY', issuedAt: '2026-09-28T00:00:00.000Z', lang: 'en', recipient,
      input: sanitizeInput({ items: [{ key: 'spatialDesign', options: { size: 'booth3x3' } }] }),
      result: { lines: [{ service: 'spatialDesign', label: 'Space Design', detail: 'Previously issued booth construction', amount: 3000000 }], supply: 3000000, vat: 300000, total: 3300000, warnings: [], notes: [] },
    };
    const token = createEstimateToken(snapshot);
    assert.ok(token);
    const response = await GET(new NextRequest(`http://localhost/api/quote-pdf?t=${encodeURIComponent(token)}&download=1`));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'application/pdf');
    assert.match(response.headers.get('content-disposition') ?? '', /attachment/);
    assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 4).toString(), '%PDF');
    assert.deepEqual(readEstimateToken(token)?.result, snapshot.result);
  } finally {
    if (previousSecret === undefined) delete process.env.QUOTE_SIGNING_SECRET;
    else process.env.QUOTE_SIGNING_SECRET = previousSecret;
  }
});
