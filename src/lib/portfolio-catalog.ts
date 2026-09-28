import catalog from '@/data/portfolio-catalog.json'
import type { PortfolioItem } from '@/types/admin'

/** Reviewed public archive, also available when Firestore is unreachable. */
export const portfolioCatalog = catalog as unknown as PortfolioItem[]

/** A successful CMS response is authoritative, including hidden or deleted items. */
export function publishedPortfolio(items: PortfolioItem[] = portfolioCatalog): PortfolioItem[] {
  return items
    .filter((item) => item.is_published !== false)
    .sort((a, b) => a.display_order - b.display_order || a.slug.localeCompare(b.slug))
}
