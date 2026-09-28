import { NextRequest, NextResponse } from 'next/server';
import { rateLimited } from '@/lib/demo-ai/openrouter';
import type { DemoAiSpec } from '@/lib/demo-ai/types';
import { experiencePromptContext } from '@/data/demo-experiences';
import { withExperienceContext } from '@/lib/demo-ai/experience-context';

// 데모 체험의 실제 AI 결과 — /api/demo-ai/<config.id>
// 데모별 정의는 src/lib/demo-ai/specs/<config.id>.ts. 실패하면 4xx/5xx를 돌려주고, 클라이언트는 기존 고정 결과로 넘어간다.

// 이미지 생성은 10~20초(재시도 포함 최대 ~90초) 걸린다
export const maxDuration = 120;

const MAX_BODY = 3_000_000;

async function loadSpec(id: string): Promise<DemoAiSpec | null> {
  if (!/^[a-z0-9-]{2,40}$/.test(id)) return null;
  try {
    const mod = await import(`@/lib/demo-ai/specs/${id}`);
    return (mod.default as DemoAiSpec) ?? null;
  } catch {
    return null;
  }
}

function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  const spec = await loadSpec(demo);
  if (!spec) return NextResponse.json({ error: 'unknown_demo' }, { status: 404 });

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }
  if (rateLimited(clientIp(request), spec.bucket)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const raw: unknown = await request.json().catch(() => null);
  const parsed = spec.input.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }

  try {
    const profile = raw && typeof raw === 'object' && 'experienceProfile' in raw
      ? raw.experienceProfile
      : undefined;
    const context = experiencePromptContext(demo, profile);
    return NextResponse.json(await withExperienceContext(context, () => spec.run(parsed.data)));
  } catch (error) {
    console.error(`demo-ai/${demo} failed:`, error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'generation_failed' }, { status: 502 });
  }
}
