'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { PortfolioImageMetadata, PortfolioItem } from '@/types/admin'
import { applyPortfolioPreview } from '@/lib/portfolio-preview'
import { publishedPortfolio } from '@/lib/portfolio-catalog'

export interface DisplayPortfolio {
  id: string
  slug: string
  title_ko: string
  title_en: string
  description_ko: string
  description_en: string
  year: number | null
  category: 'online' | 'offline' | 'service' | 'ip'
  tags: string[]
  tags_ko?: string[]
  tags_en?: string[]
  thumbnail: string
  images: string[]
  image_metadata?: Record<string, PortfolioImageMetadata>
  services: string[]
  client: string
  client_ko?: string
  client_en?: string
  location: string | null
  location_ko?: string | null
  location_en?: string | null
  is_featured: boolean
}

export function useFirestorePortfolio() {
  const [projects, setProjects] = useState<DisplayPortfolio[]>(() => publishedPortfolio())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    let revision = 0
    const q = query(collection(db, 'portfolio'), orderBy('display_order', 'asc'))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const currentRevision = ++revision
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PortfolioItem)
        void applyPortfolioPreview(docs).then((merged) => {
          if (!active || currentRevision !== revision) return
          const items: DisplayPortfolio[] = publishedPortfolio(merged)
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
                tags_ko: data.tags_ko,
                tags_en: data.tags_en,
                thumbnail: data.thumbnail || (data.images?.[0] ?? ''),
                images: data.images || [],
                image_metadata: data.image_metadata,
                services: data.services || [],
                client: data.client,
                client_ko: data.client_ko,
                client_en: data.client_en,
                location: data.location,
                location_ko: data.location_ko,
                location_en: data.location_en,
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
    return () => { active = false; unsub() }
  }, [])

  return { projects, loading }
}
