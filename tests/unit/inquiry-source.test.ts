import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyOrigin, normalizeStoredOrigin } from '../../src/lib/analytics/sources';
import { describeAttribution, referralLabel } from '../../src/lib/inquiry-referral';
import { serviceSearchDescription, serviceSearchTitle } from '../../src/lib/seo-service';

const OWN = ['neander.co.kr', 'www.neander.co.kr'];

test('ChatGPT 답변 링크(utm_source=chatgpt.com)는 캠페인이 아니라 AI 유입', () => {
  const result = classifyOrigin({ ref: '', utm: { source: 'chatgpt.com' }, landing: '/' }, null, OWN);
  assert.equal(result.channel, 'ai');
  assert.equal(result.source, 'chatgpt');
});

test('Perplexity UTM 도 AI 유입, 일반 캠페인은 그대로 캠페인', () => {
  assert.equal(classifyOrigin({ ref: '', utm: { source: 'perplexity.ai' }, landing: '/' }, null, OWN).channel, 'ai');
  const ad = classifyOrigin({ ref: '', utm: { source: 'naver', medium: 'cpc', campaign: 'booth' }, landing: '/' }, null, OWN);
  assert.equal(ad.channel, 'campaign');
  assert.equal(ad.campaign, 'booth');
});

test('예전 기록(campaign · chatgpt.com)을 읽을 때 AI 로 보정', () => {
  assert.deepEqual(normalizeStoredOrigin('campaign', 'chatgpt.com'), { channel: 'ai', source: 'chatgpt' });
  assert.deepEqual(normalizeStoredOrigin('campaign', 'naver'), { channel: 'campaign', source: 'naver' });
  assert.deepEqual(normalizeStoredOrigin('search', 'google'), { channel: 'search', source: 'google' });
});

test('유입 경로 문장: 재방문이면 첫 방문과 방문 횟수를 함께', () => {
  const text = describeAttribution({
    channel: 'direct', source: 'direct', landing: '/services', campaign: null,
    first_channel: 'ai', first_source: 'chatgpt', first_landing: '/', first_at: '2026-11-09T02:28:00.000Z',
    visits: 4, vid: 'v', sid: 's',
  });
  assert.equal(text, '직접 유입 → /services · 첫 방문 11/9 ChatGPT (AI 서비스) → / · 4번째 방문');
});

test('유입 경로 문장: 첫 방문에 바로 문의하면 한 줄', () => {
  const text = describeAttribution({
    channel: 'search', source: 'naver', landing: '/', campaign: null,
    first_channel: 'search', first_source: 'naver', first_landing: '/', first_at: '2026-11-10T00:00:00.000Z',
    visits: 1, vid: null, sid: null,
  });
  assert.equal(text, '네이버 검색 (검색) → /');
  assert.equal(describeAttribution(null), null);
});

test('「어떻게 알게 되셨나요」 라벨', () => {
  assert.equal(referralLabel('ai'), 'ChatGPT 등 AI 추천');
  assert.equal(referralLabel('word', 'en'), 'Referral from a colleague or partner');
  assert.equal(referralLabel(''), null);
});

test('서비스 검색 제목·설명에 검색어와 시작가가 들어간다', () => {
  assert.equal(serviceSearchTitle('AI 포토카드', 'ai-fan-photocard', 'ai-photo', 'ko'), 'AI 포토카드 — AI 포토부스 대여·행사 운영');
  assert.equal(serviceSearchTitle('AI 관상', 'ai-face-reading', 'ai-fortune', 'ko'), 'AI 관상 — AI 운세 체험 키오스크 대여');
  const desc = serviceSearchDescription('AI가 향을 찾아 드립니다.', 'ai-scent-soulmate', 'ai-creative', 'ko');
  assert.match(desc, /^AI가 향을 찾아 드립니다\. 팝업·기업 행사/);
  assert.match(desc, /99만원부터\(VAT 별도/);
});

/* ── 브라우저 흉내: 문의 보낼 때 붙는 유입 정보 ─────────────── */

function fakeBrowser(search: string, pathname: string, referrer = '') {
  const store = new Map<string, string>();
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = {
    location: { search, pathname, host: 'neander.co.kr', hostname: 'neander.co.kr' },
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };
  g.document = { referrer };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Mozilla/5.0 (Macintosh) Chrome/130.0', maxTouchPoints: 0, language: 'ko-KR' },
    configurable: true,
  });
  return store;
}

test('방문 기록이 없는 상태(첫 페이지에서 바로 문의)에서도 현재 페이지 기준으로 유입을 채운다', async () => {
  fakeBrowser('?utm_source=chatgpt.com', '/contact');
  const { inquiryAttribution } = await import('../../src/lib/analytics/tracker');
  const a = inquiryAttribution();
  assert.ok(a);
  assert.equal(a.channel, 'ai');
  assert.equal(a.source, 'chatgpt');
  assert.equal(a.landing, '/contact');
  assert.equal(a.first_at, null);
});

test('저장된 세션·첫 방문이 있으면 그 값을 쓴다', async () => {
  const store = fakeBrowser('', '/quote');
  const now = Date.now();
  store.set('neander:analytics-vid', 'VISITOR1234567890');
  store.set('neander:analytics-session', JSON.stringify({ id: 'SESSION123456789', last: now - 60_000, seq: 3, nv: false, origin: { ref: 'https://m.search.naver.com/search.naver?query=x', utm: {}, landing: '/services' } }));
  store.set('neander:analytics-first', JSON.stringify({ at: now - 2 * 86_400_000, origin: { ref: '', utm: { source: 'chatgpt.com' }, landing: '/' } }));
  store.set('neander:analytics-visits', '3');
  const { inquiryAttribution } = await import('../../src/lib/analytics/tracker');
  const a = inquiryAttribution();
  assert.ok(a);
  assert.deepEqual([a.channel, a.source, a.landing], ['search', 'naver', '/services']);
  assert.deepEqual([a.first_channel, a.first_source, a.first_landing, a.visits], ['ai', 'chatgpt', '/', 3]);
  assert.equal(a.vid, 'VISITOR1234567890');
  assert.equal(a.sid, 'SESSION123456789');
  assert.match(describeAttribution(a) ?? '', /^네이버 검색 \(검색\) → \/services · 첫 방문 \d+\/\d+ ChatGPT \(AI 서비스\) → \/ · 3번째 방문$/);
});

test('방문 기록을 끈 브라우저는 유입 정보를 보내지 않는다', async () => {
  const store = fakeBrowser('', '/contact');
  store.set('neander:analytics-optout', '1');
  const { inquiryAttribution } = await import('../../src/lib/analytics/tracker');
  assert.equal(inquiryAttribution(), null);
});
