import { NextResponse } from 'next/server'

// 개발용: 아직 Firestore에 올리지 않은 scripts/portfolio-sync.data.json 을 그대로 내려준다.
// NEXT_PUBLIC_PORTFOLIO_PREVIEW=1 일 때만 열리며, 파일은 요청 시 디스크에서 읽으므로
// 평소 빌드 결과물에는 공개 전 데이터가 포함되지 않는다.

export const dynamic = 'force-dynamic'

export async function GET() {
  if (process.env.NEXT_PUBLIC_PORTFOLIO_PREVIEW !== '1') {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    const { readFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const raw = await readFile(join(process.cwd(), 'scripts', 'portfolio-sync.data.json'), 'utf8')
    return NextResponse.json(JSON.parse(raw))
  } catch (error) {
    console.error('[portfolio-preview] 데이터 파일을 읽지 못했습니다:', error)
    return new NextResponse('Preview data unavailable', { status: 500 })
  }
}
