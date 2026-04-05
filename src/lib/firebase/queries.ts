import { getDocs, getDoc, doc, collection, query, where } from 'firebase/firestore'
import { db } from './config'
import type { Popup, Banner, NewsArticle, PortfolioItem, SiteSettings } from '@/types/admin'

export async function getActivePopups(): Promise<Popup[]> {
  try {
    const snapshot = await getDocs(collection(db, 'popups'))
    const now = new Date().toISOString()

    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Popup))
      .filter((popup) => {
        if (!popup.is_active) return false
        if (popup.start_date > now) return false
        if (popup.end_date && popup.end_date < now) return false
        return true
      })
      .sort((a, b) => a.display_order - b.display_order)
  } catch (error) {
    console.error('[getActivePopups] Firestore query failed:', error)
    return []
  }
}

export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const snapshot = await getDocs(collection(db, 'banners'))
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Banner))
      .filter((banner) => banner.is_active)
      .sort((a, b) => a.display_order - b.display_order)
  } catch (error) {
    console.error('[getActiveBanners] Firestore query failed:', error)
    return []
  }
}

export async function getPublishedNews(
  category?: string,
  maxItems?: number
): Promise<NewsArticle[]> {
  try {
    const snapshot = await getDocs(collection(db, 'news'))
    let articles = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as NewsArticle))
      .filter((article) => {
        if (!article.is_published) return false
        if (category && article.category !== category) return false
        return true
      })
      .sort((a, b) => {
        const dateA = a.published_at || a.created_at || ''
        const dateB = b.published_at || b.created_at || ''
        return dateB.localeCompare(dateA)
      })

    if (maxItems) {
      articles = articles.slice(0, maxItems)
    }
    return articles
  } catch (error) {
    console.error('[getPublishedNews] Firestore query failed:', error)
    return []
  }
}

export async function getNewsById(id: string): Promise<NewsArticle | null> {
  try {
    const docRef = doc(db, 'news', id)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() } as NewsArticle
  } catch (error) {
    console.error('[getNewsById] Firestore query failed:', error)
    return null
  }
}

export async function getPublishedPortfolio(): Promise<PortfolioItem[]> {
  try {
    const snapshot = await getDocs(collection(db, 'portfolio'))
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as PortfolioItem))
      .filter((item) => item.is_published)
      .sort((a, b) => a.display_order - b.display_order)
  } catch (error) {
    console.error('[getPublishedPortfolio] Firestore query failed:', error)
    return []
  }
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
  try {
    const q = query(collection(db, 'portfolio'), where('slug', '==', slug))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const d = snapshot.docs[0]
    return { id: d.id, ...d.data() } as PortfolioItem
  } catch (error) {
    console.error('[getPortfolioBySlug] Firestore query failed:', error)
    return null
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const docRef = doc(db, 'settings', 'site')
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() } as SiteSettings
  } catch (error) {
    console.error('[getSiteSettings] Firestore query failed:', error)
    return null
  }
}
