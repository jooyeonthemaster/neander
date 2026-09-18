'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { PortfolioItem } from '@/types/admin'
import { applyPortfolioPreview } from '@/lib/portfolio-preview'

export interface DisplayPortfolio {
  id: string
  slug: string
  title_ko: string
  title_en: string
  description_ko: string
  description_en: string
  year: number
  category: 'online' | 'offline' | 'service' | 'ip'
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
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PortfolioItem)
        void applyPortfolioPreview(docs).then((merged) => {
          const items: DisplayPortfolio[] = merged
            // 비공개 항목은 매핑 전에 걸러낸다.
            // (매핑 결과에는 is_published가 없어서 뒤에서 거르면 항상 통과했다)
            .filter((data) => data.is_published !== false)
            .map((data) => {
              return {
                id: data.id,
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
          setProjects(items)
          setLoading(false)
        })
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
