'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { PortfolioItem } from '@/types/admin'

export interface DisplayPortfolio {
  id: string
  slug: string
  title_ko: string
  title_en: string
  description_ko: string
  description_en: string
  year: number
  category: 'online' | 'offline' | 'service'
  tags: string[]
  thumbnail: string
  images: string[]
  services: string[]
  client: string
  location: string | null
  is_featured: boolean
}

export function useFirestorePortfolio() {
  const [projects, setProjects] = useState<DisplayPortfolio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'portfolio'), orderBy('display_order', 'asc'))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: DisplayPortfolio[] = snapshot.docs
          .map((d) => {
            const data = d.data() as Omit<PortfolioItem, 'id'>
            return {
              id: d.id,
              slug: data.slug,
              title_ko: data.title_ko,
              title_en: data.title_en,
              description_ko: data.description_ko,
              description_en: data.description_en,
              year: data.year,
              category: data.category,
              tags: data.tags || [],
              thumbnail: data.thumbnail || (data.images?.[0] ?? ''),
              images: data.images || [],
              services: data.services || [],
              client: data.client,
              location: data.location,
              is_featured: data.is_featured,
            }
          })
          .filter((item) => (item as unknown as PortfolioItem).is_published !== false)
        setProjects(items)
        setLoading(false)
      },
      (error) => {
        console.error('Firestore portfolio listen failed:', error)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  return { projects, loading }
}
