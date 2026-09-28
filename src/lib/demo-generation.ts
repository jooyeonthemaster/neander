export const DEMO_GENERATION_TIMEOUT_MS = 45_000;
export type DemoResultStatus = 'ai' | 'example' | 'timeout' | 'error';
export interface DemoGenerationResult { status: DemoResultStatus; data?: unknown }

export function classifyDemoResult(data: unknown): DemoResultStatus {
  return data == null || (typeof data === 'object' && 'observed' in data && data.observed === false) ? 'example' : 'ai';
}

/** One deadline covers the entire generation, including multi-request demos. */
export async function generateWithDeadline(
  generate: () => Promise<unknown>,
  { timeoutMs = DEMO_GENERATION_TIMEOUT_MS, signal }: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<DemoGenerationResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abort: (() => void) | undefined;
  const deadline = new Promise<DemoGenerationResult>((resolve) => {
    timer = setTimeout(() => resolve({ status: 'timeout' }), timeoutMs);
    abort = () => resolve({ status: 'error' });
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, { once: true });
  });
  const work = Promise.resolve().then(() => signal?.aborted ? null : generate()).then((data) => {
    const status = classifyDemoResult(data);
    return { status, data: status === 'ai' ? data : undefined };
  }).catch((error: unknown): DemoGenerationResult => ({
    status: error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'error',
  }));
  try { return await Promise.race([work, deadline]); }
  finally {
    clearTimeout(timer);
    if (abort) signal?.removeEventListener('abort', abort);
  }
}

export function generationMessage(elapsedSeconds: number): string {
  if (elapsedSeconds >= 30) return '조금 더 걸리고 있어요. 45초 안에 결과 또는 다시 시도 안내를 보여드릴게요.';
  if (elapsedSeconds >= 15) return '결과를 정리하고 있어요. 잠시만 기다려주세요.';
  return '선택한 조건으로 결과를 만들고 있어요.';
}

/** Intro is separate; request only the essential 4–5 input screens. */
export function requiredProfileCount(activityCount: number, availableProfiles: number): number {
  return Math.max(0, Math.min(availableProfiles, 5 - activityCount));
}
