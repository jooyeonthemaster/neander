'use client';

import type { DemoResultStatus } from '@/lib/demo-generation';

export function DemoResultNotice({ status, onRetry }: { status: DemoResultStatus; onRetry: () => void }) {
  if (status === 'ai') return null;
  return <div className="demo-result-notice" role="status" data-result-status={status}>
    <div><strong>예시 결과</strong><span>{status === 'timeout' ? '생성이 오래 걸려 준비된 예시를 보여드려요.' : 'AI 생성이 완료되지 않아 준비된 예시를 보여드려요.'}</span></div>
    <button type="button" onClick={onRetry}>같은 입력으로 다시 시도</button>
  </div>;
}
