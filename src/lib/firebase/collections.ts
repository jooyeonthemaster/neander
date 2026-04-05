import {
  collection,
  doc,
  query,
  where,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot,
  type FirestoreDataConverter,
} from 'firebase/firestore'
import { db } from './config'
import type { Popup, Banner, NewsArticle, PortfolioItem } from '@/types/admin'

// ============================================================
// Generic Converter
// ============================================================

function createConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T): DocumentData {
      const { id, ...rest } = data
      return rest
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data()
      return { id: snapshot.id, ...data } as T
    },
  }
}

const popupConverter = createConverter<Popup>()
const bannerConverter = createConverter<Banner>()
const newsConverter = createConverter<NewsArticle>()
const portfolioConverter = createConverter<PortfolioItem>()

// ============================================================
// Collection References
// ============================================================

export const popupsCollection = collection(db, 'popups').withConverter(popupConverter)
export const bannersCollection = collection(db, 'banners').withConverter(bannerConverter)
export const newsCollection = collection(db, 'news').withConverter(newsConverter)
export const portfolioCollection = collection(db, 'portfolio').withConverter(portfolioConverter)

// ============================================================
// Document References
// ============================================================

export const popupDoc = (id: string) => doc(db, 'popups', id).withConverter(popupConverter)
export const bannerDoc = (id: string) => doc(db, 'banners', id).withConverter(bannerConverter)
export const newsDoc = (id: string) => doc(db, 'news', id).withConverter(newsConverter)
export const portfolioDoc = (id: string) => doc(db, 'portfolio', id).withConverter(portfolioConverter)

// ============================================================
// Pre-built Queries
// ============================================================

export const allPopupsQuery = () =>
  query(popupsCollection, orderBy('display_order', 'asc'))

export const allBannersQuery = () =>
  query(bannersCollection, orderBy('display_order', 'asc'))

export const allNewsQuery = (category?: string) => {
  if (category) {
    return query(
      newsCollection,
      where('category', '==', category),
      orderBy('created_at', 'desc')
    )
  }
  return query(newsCollection, orderBy('created_at', 'desc'))
}

export const allPortfolioQuery = () =>
  query(portfolioCollection, orderBy('display_order', 'asc'))

export const publishedPortfolioQuery = () =>
  query(portfolioCollection, where('is_published', '==', true), orderBy('display_order', 'asc'))
