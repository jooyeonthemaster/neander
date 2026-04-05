// ============================================================
// Neander Admin CMS Types
// ============================================================

/** 팝업 관리 */
export interface Popup {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  link_text: string | null
  is_active: boolean
  start_date: string
  end_date: string | null
  display_order: number
  image_aspect_ratio: '1/1' | '4/5' | '3/4' | '16/9' | '9/16'
  created_at: string
  updated_at: string
}

export type PopupInput = Omit<Popup, 'id' | 'created_at' | 'updated_at'>

/** 배너 관리 (히어로 슬라이드) */
export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  mobile_image_url: string | null
  link_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type BannerInput = Omit<Banner, 'id' | 'created_at' | 'updated_at'>

/** 뉴스/프레스 카테고리 */
export type NewsCategory = 'press' | 'notice' | 'event'

/** 뉴스/프레스 기사 */
export interface NewsArticle {
  id: string
  title: string
  content: string
  summary: string
  category: NewsCategory
  image_url: string | null
  source_name: string | null
  source_url: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type NewsArticleInput = Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>

/** 포트폴리오 프로젝트 */
export interface PortfolioItem {
  id: string
  title_ko: string
  title_en: string
  description_ko: string
  description_en: string
  slug: string
  year: number
  category: 'online' | 'offline' | 'service'
  tags: string[]
  images: string[]        // Firebase Storage URLs
  thumbnail: string       // 대표 이미지 URL
  services: string[]
  client: string
  location: string | null
  is_featured: boolean
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export type PortfolioItemInput = Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>

/** 사이트 설정 */
export interface SiteSettings {
  id: string
  company_name_ko: string
  company_name_en: string
  email: string
  phone: string
  address_ko: string
  address_en: string
  instagram_url: string
  youtube_url: string
  linkedin_url: string
  blog_url: string
  ceo_name_ko: string
  ceo_name_en: string
  business_number: string
  updated_at: string
}

// ============================================================
// Constants
// ============================================================

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  press: '보도자료',
  notice: '공지사항',
  event: '이벤트',
}

export const NEWS_CATEGORY_COLORS: Record<NewsCategory, string> = {
  press: 'bg-blue-100 text-blue-700',
  notice: 'bg-orange-100 text-orange-700',
  event: 'bg-green-100 text-green-700',
}

export const PORTFOLIO_CATEGORY_LABELS: Record<PortfolioItem['category'], string> = {
  online: '온라인 솔루션',
  offline: '오프라인 솔루션',
  service: '네안데르 서비스',
}

export const ASPECT_RATIO_OPTIONS = [
  { label: '1:1 (정사각형)', value: '1/1' },
  { label: '4:5 (세로)', value: '4/5' },
  { label: '3:4 (세로)', value: '3/4' },
  { label: '16:9 (가로)', value: '16/9' },
  { label: '9:16 (세로)', value: '9/16' },
] as const

export const SERVICE_OPTIONS = [
  { label: 'A\'CSCENT', value: 'acscent' },
  { label: 'AI 포토부스', value: 'photoBooth' },
  { label: '미디어아트', value: 'mediaArt' },
  { label: '공간디자인', value: 'spatialDesign' },
  { label: '렌탈', value: 'rental' },
  { label: '커스텀 콘텐츠', value: 'custom' },
] as const
