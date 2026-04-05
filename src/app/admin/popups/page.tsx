'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminHeader from '../components/AdminHeader'
import ImageUploader from '../components/ImageUploader'
import { db } from '@/lib/firebase/config'
import { deleteImage } from '@/lib/firebase/storage'
import { ASPECT_RATIO_OPTIONS } from '@/types/admin'
import type { Popup } from '@/types/admin'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  Megaphone,
  Calendar,
  ExternalLink,
} from 'lucide-react'

// ============================================================
// Types
// ============================================================

type PopupStatus = 'active' | 'inactive' | 'scheduled' | 'expired'

interface PopupFormData {
  title: string
  description: string
  image_url: string | null
  image_aspect_ratio: Popup['image_aspect_ratio']
  link_url: string
  link_text: string
  is_active: boolean
  start_date: string
  end_date: string
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

// ============================================================
// Helpers
// ============================================================

const INITIAL_FORM: PopupFormData = {
  title: '',
  description: '',
  image_url: null,
  image_aspect_ratio: '1/1',
  link_url: '',
  link_text: '',
  is_active: true,
  start_date: '',
  end_date: '',
}

function getPopupStatus(popup: Popup): PopupStatus {
  if (!popup.is_active) return 'inactive'
  const now = new Date().toISOString()
  if (popup.start_date > now) return 'scheduled'
  if (popup.end_date && popup.end_date < now) return 'expired'
  return 'active'
}

const STATUS_CONFIG: Record<PopupStatus, { label: string; className: string }> = {
  active: { label: '활성', className: 'bg-green-100 text-green-700' },
  inactive: { label: '비활성', className: 'bg-gray-100 text-gray-600' },
  scheduled: { label: '예약됨', className: 'bg-blue-100 text-blue-700' },
  expired: { label: '만료됨', className: 'bg-red-100 text-red-700' },
}

function toLocalDatetime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function toISOString(localDatetime: string): string {
  if (!localDatetime) return ''
  return new Date(localDatetime).toISOString()
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  if (endDate) return `${fmt(startDate)} ~ ${fmt(endDate)}`
  return `${fmt(startDate)} ~`
}

// ============================================================
// Component
// ============================================================

export default function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PopupFormData>(INITIAL_FORM)
  const [deleteTarget, setDeleteTarget] = useState<Popup | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  // ----------------------------------------------------------
  // Toast
  // ----------------------------------------------------------

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ----------------------------------------------------------
  // Firestore listener
  // ----------------------------------------------------------

  useEffect(() => {
    const q = query(collection(db, 'popups'), orderBy('display_order', 'asc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Popup[]
        setPopups(items)
        setLoading(false)
      },
      (error) => {
        console.error('팝업 목록 로드 실패:', error)
        showToast('팝업 목록을 불러오지 못했습니다.', 'error')
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [showToast])

  // ----------------------------------------------------------
  // Modal open / close
  // ----------------------------------------------------------

  const openCreateModal = () => {
    setEditingId(null)
    setForm(INITIAL_FORM)
    setModalOpen(true)
  }

  const openEditModal = (popup: Popup) => {
    setEditingId(popup.id)
    setForm({
      title: popup.title,
      description: popup.description || '',
      image_url: popup.image_url,
      image_aspect_ratio: popup.image_aspect_ratio,
      link_url: popup.link_url || '',
      link_text: popup.link_text || '',
      is_active: popup.is_active,
      start_date: toLocalDatetime(popup.start_date),
      end_date: popup.end_date ? toLocalDatetime(popup.end_date) : '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(INITIAL_FORM)
  }

  // ----------------------------------------------------------
  // Save (create / update)
  // ----------------------------------------------------------

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast('제목을 입력해주세요.', 'error')
      return
    }
    if (!form.start_date) {
      showToast('시작일을 설정해주세요.', 'error')
      return
    }

    setSaving(true)
    try {
      const now = new Date().toISOString()
      const data = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url,
        image_aspect_ratio: form.image_aspect_ratio,
        link_url: form.link_url.trim() || null,
        link_text: form.link_text.trim() || null,
        is_active: form.is_active,
        start_date: toISOString(form.start_date),
        end_date: form.end_date ? toISOString(form.end_date) : null,
        updated_at: now,
      }

      if (editingId) {
        await updateDoc(doc(db, 'popups', editingId), data)
        showToast('팝업이 수정되었습니다.', 'success')
      } else {
        const nextOrder =
          popups.length > 0
            ? Math.max(...popups.map((p) => p.display_order)) + 1
            : 0
        await addDoc(collection(db, 'popups'), {
          ...data,
          display_order: nextOrder,
          created_at: now,
        })
        showToast('팝업이 생성되었습니다.', 'success')
      }
      closeModal()
    } catch (error) {
      console.error('팝업 저장 실패:', error)
      showToast('팝업 저장에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ----------------------------------------------------------
  // Delete
  // ----------------------------------------------------------

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.image_url) {
        await deleteImage(deleteTarget.image_url)
      }
      await deleteDoc(doc(db, 'popups', deleteTarget.id))
      showToast('팝업이 삭제되었습니다.', 'success')
      setDeleteTarget(null)
    } catch (error) {
      console.error('팝업 삭제 실패:', error)
      showToast('팝업 삭제에 실패했습니다.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ----------------------------------------------------------
  // Reorder
  // ----------------------------------------------------------

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= popups.length) return

    const current = popups[index]
    const target = popups[swapIndex]

    try {
      await Promise.all([
        updateDoc(doc(db, 'popups', current.id), {
          display_order: target.display_order,
          updated_at: new Date().toISOString(),
        }),
        updateDoc(doc(db, 'popups', target.id), {
          display_order: current.display_order,
          updated_at: new Date().toISOString(),
        }),
      ])
    } catch (error) {
      console.error('순서 변경 실패:', error)
      showToast('순서 변경에 실패했습니다.', 'error')
    }
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div>
      <AdminHeader
        title="팝업 관리"
        description="사이트에 표시되는 팝업을 생성하고 관리합니다."
        actions={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            팝업 추가
          </button>
        }
      />

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && popups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            등록된 팝업이 없습니다
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            첫 번째 팝업을 추가해보세요.
          </p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            팝업 추가
          </button>
        </div>
      )}

      {/* Popup list */}
      {!loading && popups.length > 0 && (
        <div className="space-y-4">
          {popups.map((popup, index) => {
            const status = getPopupStatus(popup)
            const config = STATUS_CONFIG[status]

            return (
              <div
                key={popup.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-5">
                  {/* Image preview */}
                  {popup.image_url ? (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100">
                      <img
                        src={popup.image_url}
                        alt={popup.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Megaphone className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {popup.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    {popup.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                        {popup.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateRange(popup.start_date, popup.end_date)}
                      </span>
                      {popup.link_url && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                          {popup.link_text || '링크'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleReorder(index, 'up')}
                      disabled={index === 0}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="위로 이동"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReorder(index, 'down')}
                      disabled={index === popups.length - 1}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="아래로 이동"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-gray-200 mx-1" />
                    <button
                      onClick={() => openEditModal(popup)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="수정"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(popup)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ====================================================== */}
      {/* Create / Edit Modal                                     */}
      {/* ====================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? '팝업 수정' : '팝업 추가'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="팝업 제목을 입력하세요"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  설명
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="팝업에 대한 설명을 입력하세요 (선택)"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all resize-none"
                />
              </div>

              {/* Aspect ratio select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  이미지 비율
                </label>
                <select
                  value={form.image_aspect_ratio}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      image_aspect_ratio: e.target
                        .value as Popup['image_aspect_ratio'],
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all bg-white"
                >
                  {ASPECT_RATIO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image uploader */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  이미지
                </label>
                <ImageUploader
                  value={form.image_url}
                  onChange={(url) =>
                    setForm((prev) => ({ ...prev, image_url: url }))
                  }
                  folder="popups"
                  aspectRatio={form.image_aspect_ratio}
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  링크 URL
                </label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, link_url: e.target.value }))
                  }
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                />
              </div>

              {/* Link text (only when link_url exists) */}
              {form.link_url.trim() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    링크 텍스트
                  </label>
                  <input
                    type="text"
                    value={form.link_text}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        link_text: e.target.value,
                      }))
                    }
                    placeholder="자세히 보기"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                  />
                </div>
              )}

              {/* Active toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    활성화
                  </label>
                  <p className="text-xs text-gray-400 mt-0.5">
                    비활성화 시 사이트에 표시되지 않습니다.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_active}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: !prev.is_active,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.is_active ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    종료일
                  </label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? '수정' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* Delete Confirmation Dialog                              */}
      {/* ====================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              팝업 삭제
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              <strong className="text-gray-700">{deleteTarget.title}</strong>
              {' '}팝업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* Toast Notifications                                     */}
      {/* ====================================================== */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right ${
                toast.type === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-0.5 rounded hover:bg-white/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
