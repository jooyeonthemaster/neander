/** 검색엔진·AI용 구조화 데이터(schema.org). '<'를 이스케이프해 스크립트 태그가 닫히지 않게 한다 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
