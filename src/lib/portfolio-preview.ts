import type { PortfolioItem } from '@/types/admin'

// 아직 Firestore에 올리지 않은 scripts/portfolio-sync.data.json 을 로컬에서 미리 보는 개발용 모드.
// NEXT_PUBLIC_PORTFOLIO_PREVIEW=1 로 실행할 때만 동작하며, 데이터는 번들에 넣지 않고
// 개발용 API(/api/portfolio-preview)에서 요청 시에 읽어온다.

type Upsert = { slug: string } & Partial<PortfolioItem>
type PreviewData = { order: string[]; upserts: Upsert[] }

function merge(items: PortfolioItem[], data: PreviewData): PortfolioItem[] {
  const now = new Date().toISOString()
  const bySlug = new Map(items.map((item) => [item.slug, { ...item }]))

  for (const { slug, ...fields } of data.upserts) {
    const existing = bySlug.get(slug)
    if (existing) {
      bySlug.set(slug, { ...existing, ...fields })
    } else {
      bySlug.set(slug, {
        id: `preview-${slug}`,
        slug,
        tags: [],
        images: [],
        services: [],
        location: null,
        is_featured: false,
        is_published: true,
        display_order: 0,
        created_at: now,
        updated_at: now,
        ...fields,
        thumbnail: fields.thumbnail || fields.images?.[0] || '',
      } as PortfolioItem)
    }
  }

  return [...bySlug.values()]
    .filter((item) => item.is_published !== false)
    .sort((a, b) => {
      const ai = data.order.indexOf(a.slug)
      const bi = data.order.indexOf(b.slug)
      if (ai === -1 && bi === -1) return a.display_order - b.display_order
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
}

export async function applyPortfolioPreview(items: PortfolioItem[]): Promise<PortfolioItem[]> {
  if (process.env.NEXT_PUBLIC_PORTFOLIO_PREVIEW !== '1') return items

  try {
    const base = typeof window === 'undefined' ? `http://127.0.0.1:${process.env.PORT || 3000}` : ''
    const res = await fetch(`${base}/api/portfolio-preview`, { cache: 'no-store' })
    if (!res.ok) return items
    return merge(items, (await res.json()) as PreviewData)
  } catch (error) {
    console.warn('[portfolio-preview] 미리보기 데이터를 불러오지 못해 실제 데이터를 사용합니다:', error)
    return items
  }
}
