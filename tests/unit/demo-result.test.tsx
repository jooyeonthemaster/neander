import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { DemoResultContext, ResultShell } from '../../src/components/demo/kit/ResultParts';

test('primary result stays outside details even when a disclaimer precedes it', () => {
  const html = renderToStaticMarkup(
    <NextIntlClientProvider locale="ko" messages={{}}>
      <DemoResultContext.Provider value={{ status: 'example', slug: 'ai-product-experience' }}>
        <ResultShell eyebrow="비교 결과" title="추천 제품" description="AI가 직접 만든 결과예요."
          pillarColor="#008080" coreCount={2} onRestart={() => {}}>
          <p>가상의 예시 제품</p>
          <article>주요 추천 제품 카드</article>
          <section>세부 비교 기준</section>
        </ResultShell>
      </DemoResultContext.Provider>
    </NextIntlClientProvider>,
  );
  const details = html.indexOf('<details');
  assert.ok(details > 0);
  assert.ok(html.indexOf('주요 추천 제품 카드') < details);
  assert.ok(html.indexOf('세부 비교 기준') > details);
  assert.doesNotMatch(html, /AI가 직접 만든/);
  assert.match(html, /선택한 조건으로 구성한 예시/);
  assert.doesNotMatch(html, /demo-result-footer/);
});
