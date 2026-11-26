import catalog from '@/data/portfolio-catalog.json'
import type { PortfolioItem } from '@/types/admin'

/** Reviewed public archive, also available when Firestore is unreachable. */
export const portfolioCatalog = catalog as unknown as PortfolioItem[]

/** 대행사를 거쳐 맡은 행사는 대행사 이름을 사이트에 내보이지 않는다 (2026-11-21 사용자 지시).
    CMS(Firestore)와 카탈로그의 client 값은 그대로 두고, 공개 화면으로 나가는 길목인 publishedPortfolio 에서만 비운다 —
    홈 · 포트폴리오 목록(검색 포함) · 사례 상세 · llms.txt 가 모두 여기를 거친다. 관리자 화면은 거치지 않는다.
    새 대행사가 생기면 여기에 이름을 더한다 (한국어 · 영어 표기 모두). */
const AGENCY_CLIENTS = new Set(['미리내컴', 'Mirinaecom', '수상한협동조합', 'SUSCOOP', '잡담', 'Japdam'])
// 괄호 속 표기는 떼고 비교한다: "수상한협동조합 (SUSCOOP)"
const isAgency = (name?: string | null) => !!name && AGENCY_CLIENTS.has(name.replace(/\s*\(.*\)\s*$/, '').trim())

function withoutAgency(item: PortfolioItem): PortfolioItem {
  if (![item.client, item.client_ko, item.client_en].some(isAgency)) return item
  return { ...item, client: '', client_ko: '', client_en: '' }
}

/** A successful CMS response is authoritative, including hidden or deleted items. */
export function publishedPortfolio(items: PortfolioItem[] = portfolioCatalog): PortfolioItem[] {
  return items
    .filter((item) => item.is_published !== false)
    .map(withoutAgency)
    .sort((a, b) => a.display_order - b.display_order || a.slug.localeCompare(b.slug))
}
