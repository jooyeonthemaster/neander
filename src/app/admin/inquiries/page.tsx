'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Select } from '@/components/ui/Select'
import AdminHeader from '../components/AdminHeader'
import { db } from '@/lib/firebase/config'
import { setInquiryStatus, deleteInquiry } from '@/lib/firebase/inquiries'
import type { Inquiry, InquiryStatus, QuoteSnapshot } from '@/types/inquiry'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Inbox, Loader2, Mail, Phone, Trash2, Search, Building2, X } from 'lucide-react'

type FilterStatus = 'all' | InquiryStatus

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: '신규',
  in_progress: '처리 중',
  done: '완료',
}

const STATUS_COLORS: Record<InquiryStatus, string> = {
  new: 'bg-teal-100 text-teal-700',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-gray-100 text-gray-500',
}

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'new', label: '신규' },
  { value: 'in_progress', label: '처리 중' },
  { value: 'done', label: '완료' },
]

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setInquiries(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Inquiry[]
        )
        setLoadError(null)
        setLoading(false)
      },
      (error) => {
        console.error('문의 목록 로딩 실패:', error)
        setLoadError(
          'Firestore 규칙(inquiries)이 배포되지 않았거나 권한이 없습니다. firebase deploy --only firestore:rules 를 실행했는지 확인해 주세요.'
        )
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  const filtered = useMemo(() => {
    let result = inquiries
    if (filter !== 'all') {
      result = result.filter((item) => (item.status ?? 'new') === filter)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter((item) =>
        [item.name, item.email, item.company, item.subject, item.message]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q))
      )
    }
    return result
  }, [inquiries, filter, searchQuery])

  const newCount = useMemo(
    () => inquiries.filter((item) => (item.status ?? 'new') === 'new').length,
    [inquiries]
  )

  async function handleStatusChange(id: string, status: InquiryStatus) {
    setBusyId(id)
    try {
      await setInquiryStatus(id, status)
      showToast('상태를 변경했습니다.')
    } catch (error) {
      console.error('상태 변경 실패:', error)
      showToast('상태 변경에 실패했습니다.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`'${name}' 문의를 삭제할까요? 되돌릴 수 없습니다.`)) return
    setBusyId(id)
    try {
      await deleteInquiry(id)
      showToast('문의를 삭제했습니다.')
    } catch (error) {
      console.error('삭제 실패:', error)
      showToast('삭제에 실패했습니다.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <AdminHeader
        title="문의함"
        description={`홈페이지 문의·견적 폼으로 들어온 요청입니다. 신규 ${newCount}건`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === item.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 이메일, 내용 검색"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">
            {inquiries.length === 0
              ? '아직 들어온 문의가 없습니다.'
              : '조건에 맞는 문의가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const status = (item.status ?? 'new') as InquiryStatus
            return (
              <article
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {item.kind === 'quote' ? '견적 요청' : '일반 문의'}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                    </div>
                    <h2 className="mt-2 text-base font-semibold text-gray-900">
                      {item.name}
                      {item.subject ? (
                        <span className="ml-2 text-sm font-normal text-gray-500">{item.subject}</span>
                      ) : null}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 hover:text-teal-600">
                        <Mail className="w-3.5 h-3.5" />
                        {item.email}
                      </a>
                      {item.phone && (
                        <a
                          href={`tel:${String(item.phone).replace(/[^0-9+]/g, '')}`}
                          className="inline-flex items-center gap-1 hover:text-teal-600"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {item.phone}
                        </a>
                      )}
                      {item.company && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {item.company}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={status}
                      onValueChange={(value) => handleStatusChange(item.id, value as InquiryStatus)}
                      disabled={busyId === item.id}
                      aria-label={`${item.name} 문의 처리 상태`}
                      className="w-28"
                      triggerClassName="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      options={(Object.keys(STATUS_LABELS) as InquiryStatus[]).map((value) => ({ value, label: STATUS_LABELS[value] }))}
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={busyId === item.id}
                      className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      aria-label="문의 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {item.message}
                </p>

                {item.quote && <QuoteDetail quote={item.quote} />}
              </article>
            )
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            toast.type === 'success' ? 'bg-gray-900' : 'bg-rose-600'
          }`}
          role="status"
        >
          {toast.message}
          <button onClick={() => setToast(null)} aria-label="알림 닫기">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 온라인 견적 상세 — 행사 조건, 체험별 옵션, 품목별 수량·단가, 합계 */
function QuoteDetail({ quote }: { quote: QuoteSnapshot }) {
  const conditions: [string, string | undefined][] = [
    [quote.eventName ? '행사명' : '행사 유형', quote.eventName || quote.eventType],
    ['행사 일자', quote.eventDate || '미정'],
    ['운영 기간', quote.duration ? `${quote.duration}일${quote.hoursPerDay ? ` · 1일 ${quote.hoursPerDay}시간` : ''}` : undefined],
    ['예상 체험 인원', quote.expectedAttendees ? `${quote.expectedAttendees.toLocaleString('ko-KR')}명` : undefined],
    ['지역', quote.location],
    ['전날 설치', quote.setupDayBefore === undefined ? undefined : quote.setupDayBefore ? '예' : '아니오'],
    ['추가 인력', quote.extraStaff ? `${quote.extraStaff}명` : undefined],
  ]
  return (
    <div className="mt-4 space-y-4 rounded-lg bg-gray-50 p-4 text-sm">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        {conditions.filter(([, v]) => v).map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-gray-400">{k}</dt>
            <dd className="text-gray-800">{v}</dd>
          </div>
        ))}
      </dl>

      {quote.items && quote.items.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs text-gray-400">선택한 체험과 옵션</p>
          <ul className="space-y-1">
            {quote.items.map((it) => (
              <li key={it.name} className="text-gray-800">
                <span className="font-semibold">{it.name}</span>
                <span className="text-gray-600"> — {it.options.join(' · ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {quote.lines && quote.lines.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs text-gray-400">견적 내역</p>
          <table className="w-full text-left">
            <tbody className="divide-y divide-gray-200">
              {quote.lines.map((l, i) => (
                <tr key={i} className="align-top">
                  <td className="py-1.5 pr-3 font-medium whitespace-nowrap text-gray-800">{l.label}</td>
                  <td className="py-1.5 pr-3 text-xs leading-relaxed text-gray-500">{l.detail}</td>
                  <td className="py-1.5 text-right whitespace-nowrap tabular-nums text-gray-900">{l.tbd ? '상담 후 산정' : won(l.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-300 tabular-nums">
              {quote.supply !== undefined && <tr><td colSpan={2} className="pt-2 text-right text-xs text-gray-500">공급가액</td><td className="pt-2 text-right text-gray-700">{won(quote.supply)}</td></tr>}
              {quote.vat !== undefined && <tr><td colSpan={2} className="text-right text-xs text-gray-500">부가세</td><td className="text-right text-gray-700">{won(quote.vat)}</td></tr>}
              <tr><td colSpan={2} className="pt-1 text-right text-xs font-semibold text-gray-700">합계 (VAT 포함)</td><td className="pt-1 text-right font-semibold text-gray-900">{won(quote.estimatedTotal)}</td></tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <>
          {quote.services.length > 0 && (
            <div>
              <p className="text-xs text-gray-400">선택 서비스</p>
              <p className="text-gray-800">{quote.services.join(', ')}</p>
            </div>
          )}
          {quote.addOns.length > 0 && (
            <div>
              <p className="text-xs text-gray-400">추가 옵션</p>
              <p className="text-gray-800">{quote.addOns.join(', ')}</p>
            </div>
          )}
          {quote.estimatedTotal > 0 && (
            <div>
              <p className="text-xs text-gray-400">예상 견적</p>
              <p className="font-semibold text-gray-900">{won(quote.estimatedTotal)}</p>
            </div>
          )}
        </>
      )}

      {quote.estimateToken && (
        <div className="flex flex-wrap items-center gap-2">
          {quote.estimateNo && <span className="mr-1 text-xs text-gray-500">견적번호 {quote.estimateNo}</span>}
          <a
            href={`/quote/estimate?t=${encodeURIComponent(quote.estimateToken)}`}
            target="_blank"
            rel="noopener"
            className="inline-flex h-8 items-center rounded-md bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-500"
          >
            가견적서 다시 보기
          </a>
          <a
            href={`/api/quote-pdf?t=${encodeURIComponent(quote.estimateToken)}`}
            target="_blank"
            rel="noopener"
            className="inline-flex h-8 items-center rounded-md border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            PDF
          </a>
        </div>
      )}
    </div>
  )
}
