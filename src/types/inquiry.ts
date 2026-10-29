/** 문의 처리 상태 */
export type InquiryStatus = 'new' | 'in_progress' | 'done'

/** 문의가 들어온 경로 */
export type InquiryKind = 'contact' | 'quote'

/** 폼에서 보내는 값 */
export interface InquiryInput {
  kind: InquiryKind
  name: string
  email: string
  phone?: string
  company?: string
  /** 문의 유형 (contact 폼의 subject) 또는 견적 요약 제목 */
  subject: string
  message: string
  locale: string
  /** 견적 폼에서 계산된 내용 (contact 폼은 없음) */
  quote?: QuoteSnapshot | null
}

/** 견적 마법사에서 고른 내용의 스냅샷 */
export interface QuoteSnapshot {
  eventName?: string
  eventType?: string
  eventDate?: string
  duration?: number
  expectedAttendees?: number
  location?: string
  venueSize?: string
  services: string[]
  addOns: string[]
  estimatedTotal: number
  /** 온라인 견적 견적번호 (NQ-…) */
  estimateNo?: string
  /** 가견적서 다시 보기 토큰 — /quote/estimate?t= , /api/quote-pdf?t= */
  estimateToken?: string
  /** 온라인 견적 상세 (관리자 수신함 표시용) */
  hoursPerDay?: number
  setupDayBefore?: boolean
  extraStaff?: number
  /** 체험별로 고른 옵션 요약 */
  items?: { name: string; options: string[] }[]
  /** 견적 품목 (수량·단가 계산식 포함) */
  lines?: { label: string; detail: string; amount: number; tbd?: boolean }[]
  supply?: number
  vat?: number
}

/** Firestore에 저장된 문의 */
export interface Inquiry extends Omit<InquiryInput, 'phone' | 'company'> {
  id: string
  phone: string | null
  company: string | null
  status: InquiryStatus
  created_at: string
  updated_at?: string
  source_path?: string | null
}
