/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — 실제 AI 결과 요청
   /api/demo-ai/<config.id> 로 답변(사진 포함)을 보내 결과 JSON을 받는다.
   실패·호출 제한은 null, 시간 초과는 TimeoutError — 공통 셸이 예시 상태를 표시한다.
   ───────────────────────────────────────────────────────── */

/** 모든 개별 요청은 최대 45초. 공통 셸도 전체 생성에 45초 제한을 둔다. */
export async function requestDemoAi<T>(
  demoId: string,
  body: unknown,
  { timeoutMs = 45_000, validate }: { timeoutMs?: number; validate?: (data: unknown) => data is T } = {}
): Promise<T | null> {
  try {
    const res = await fetch(`/api/demo-ai/${demoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(Math.min(timeoutMs, 45_000)),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (validate && !validate(data)) return null;
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') throw error;
    return null;
  }
}

/** 녹음 object URL → base64 (오디오 분석용). 실패하면 null */
export async function audioUrlToBase64(url: string | null): Promise<{ data: string; mime: string } | null> {
  if (!url) return null;
  try {
    const blob = await (await fetch(url)).blob();
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return { data: btoa(bin), mime: blob.type || 'audio/webm' };
  } catch {
    return null;
  }
}
