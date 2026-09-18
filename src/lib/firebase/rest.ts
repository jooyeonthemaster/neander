import type { PortfolioItem } from '@/types/admin'
import { applyPortfolioPreview } from '@/lib/portfolio-preview'

// 서버 컴포넌트에서 Firestore를 읽기 위한 REST 클라이언트.
// portfolio 컬렉션은 공개 읽기 규칙이라 인증 없이 조회할 수 있고,
// 빌드 시점에 Firebase SDK를 초기화하지 않아도 된다.

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }

interface FirestoreDocument {
  name: string
  fields?: Record<string, FirestoreValue>
}

function decodeValue(value: FirestoreValue): unknown {
  if ('nullValue' in value) return null
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('stringValue' in value) return value.stringValue
  if ('timestampValue' in value) return value.timestampValue
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decodeValue)
  if ('mapValue' in value) return decodeFields(value.mapValue.fields ?? {})
  return null
}

function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeValue(v)]))
}

/**
 * 공개된 포트폴리오를 display_order 순으로 반환한다.
 * 프로젝트 ID가 없거나 요청이 실패하면 null을 반환하므로 호출부에서 정적 데이터로 대체한다.
 */
export async function fetchPublishedPortfolio(revalidate = 300): Promise<PortfolioItem[] | null> {
  if (!PROJECT_ID) return null

  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/portfolio`
  const documents: FirestoreDocument[] = []
  let pageToken: string | undefined

  try {
    do {
      const url = `${base}?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`
      const res = await fetch(url, { next: { revalidate } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = (await res.json()) as { documents?: FirestoreDocument[]; nextPageToken?: string }
      documents.push(...(body.documents ?? []))
      pageToken = body.nextPageToken
    } while (pageToken)
  } catch (error) {
    console.error('[fetchPublishedPortfolio] Firestore REST request failed:', error)
    return null
  }

  const items = documents
    .map((d) => ({ id: d.name.split('/').pop()!, ...decodeFields(d.fields ?? {}) }) as PortfolioItem)
    .filter((item) => item.is_published !== false)
    .sort((a, b) => a.display_order - b.display_order)

  return await applyPortfolioPreview(items)
}
