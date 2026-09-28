import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DemoResultNotice } from '../../src/components/demo/DemoResultNotice';
import { classifyDemoResult, generateWithDeadline, generationMessage, requiredProfileCount } from '../../src/lib/demo-generation';

test('fallback includes missing data and unobserved photo, retaining no misleading payload', async () => {
  for (const data of [undefined, null, { observed: false, score: 99 }]) {
    assert.equal(classifyDemoResult(data), 'example');
    const result = await generateWithDeadline(async () => data);
    assert.equal(result.status, 'example');
    assert.equal(result.data, undefined);
  }
  const data = { observed: true, description: '검증된 응답' };
  assert.deepEqual(await generateWithDeadline(async () => data), { status: 'ai', data });
});
test('errors, stalled work and cancellation produce explicit states', async () => {
  assert.equal((await generateWithDeadline(async () => { throw Error('offline'); })).status, 'error');
  assert.equal((await generateWithDeadline(() => new Promise(() => {}), { timeoutMs: 8 })).status, 'timeout');
  const controller = new AbortController();
  controller.abort();
  let called = false;
  assert.equal((await generateWithDeadline(async () => { called = true; }, { signal: controller.signal })).status, 'error');
  assert.equal(called, false);
  assert.equal((await generateWithDeadline(async () => { throw new DOMException('Timed out', 'TimeoutError'); })).status, 'timeout');
});
test('late work cannot replace the deadline result', async () => {
  let finish!: (data: unknown) => void;
  const result = await generateWithDeadline(() => new Promise((resolve) => { finish = resolve; }), { timeoutMs: 8 });
  finish({ image: 'late' });
  await Promise.resolve();
  assert.equal(result.status, 'timeout');
  assert.equal(result.data, undefined);
});
test('example badge and same-input retry render for all fallback states only', () => {
  for (const status of ['example', 'timeout', 'error'] as const) {
    const html = renderToStaticMarkup(createElement(DemoResultNotice, { status, onRetry() {} }));
    assert.match(html, /예시 결과/);
    assert.match(html, /같은 입력으로 다시 시도/);
    assert.match(html, new RegExp(`data-result-status="${status}"`));
    assert.doesNotMatch(html, /사진 변환|사진 분석|AI가 만들었/);
  }
  assert.equal(renderToStaticMarkup(createElement(DemoResultNotice, { status: 'ai', onRetry() {} })), '');
});
test('progress messages change and required inputs stay within five', () => {
  assert.notEqual(generationMessage(0), generationMessage(15));
  assert.match(generationMessage(30), /45초/);
  for (const activities of [2, 3, 4]) {
    const total = activities + requiredProfileCount(activities, 3);
    assert.ok(total >= 4 && total <= 5);
  }
});
