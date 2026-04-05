'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminHeader from '../components/AdminHeader'
import ImageUploader from '../components/ImageUploader'
import { db } from '@/lib/firebase/config'
import { deleteImage } from '@/lib/firebase/storage'
import type { Banner } from '@/types/admin'
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
  ImageIcon,
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react'

// ────────────────────────────────────────────────────────────
// Toast
// ────────────────────────────────────────────────────────────

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up ${
            t.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span>{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Form defaults
// ────────────────────────────────────────────────────────────

interface BannerForm {
  title: string
  subtitle: string
  image_url: string
  mobile_image_url: string
  link_url: string
  is_active: boolean
}

const EMPTY_FORM: BannerForm = {
  title: '',
  subtitle: '',
  image_url: '',
  mobile_image_url: '',
  link_url: '',
  is_active: true,
}

// ────────────────────────────────────────────────────────────
// Page component
// ────────────────────────────────────────────────────────────

export default function BannersAdminPage() {
  // Data
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([])

  // ── helpers ─────────────────────────────────────────────

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Firestore listener ─────────────────────────────────

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('display_order', 'asc'))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Banner))
        setBanners(data)
        setLoading(false)
      },
      (err) => {
        console.error('배너 목록 로드 실패:', err)
        toast('배너 목록을 불러오는데 실패했습니다.', 'error')
        setLoading(false)
      },
    )
    return unsub
  }, [toast])

  // ── Modal open/close ────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((banner: Banner) => {
    setEditingId(banner.id)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      image_url: banner.image_url,
      mobile_image_url: banner.mobile_image_url ?? '',
      link_url: banner.link_url ?? '',
      is_active: banner.is_active,
    })
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }, [])

  // ── Save ────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) {
      toast('제목을 입력해주세요.', 'error')
      return
    }
    if (!form.image_url) {
      toast('데스크톱 이미지를 업로드해주세요.', 'error')
      return
    }

    setSaving(true)
    try {
      const now = new Date().toISOString()
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        image_url: form.image_url,
        mobile_image_url: form.mobile_image_url || null,
        link_url: form.link_url.trim() || null,
        is_active: form.is_active,
        updated_at: now,
      }

      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), payload)
        toast('배너가 수정되었습니다.')
      } else {
        const maxOrder = banners.length > 0
          ? Math.max(...banners.map((b) => b.display_order))
          : -1
        await addDoc(collection(db, 'banners'), {
          ...payload,
          display_order: maxOrder + 1,
          created_at: now,
        })
        toast('배너가 추가되었습니다.')
      }
      closeModal()
    } catch (err) {
      console.error(err)
      toast('저장에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }, [form, editingId, banners, closeModal, toast])

  // ── Toggle active ───────────────────────────────────────

  const toggleActive = useCallback(async (banner: Banner) => {
    try {
      await updateDoc(doc(db, 'banners', banner.id), {
        is_active: !banner.is_active,
        updated_at: new Date().toISOString(),
      })
      toast(banner.is_active ? '배너가 비활성화되었습니다.' : '배너가 활성화되었습니다.')
    } catch {
      toast('상태 변경에 실패했습니다.', 'error')
    }
  }, [toast])

  // ── Reorder ─────────────────────────────────────────────

  const moveOrder = useCallback(async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= banners.length) return

    const current = banners[index]
    const target = banners[targetIndex]

    try {
      await Promise.all([
        updateDoc(doc(db, 'banners', current.id), {
          display_order: target.display_order,
          updated_at: new Date().toISOString(),
        }),
        updateDoc(doc(db, 'banners', target.id), {
          display_order: current.display_order,
          updated_at: new Date().toISOString(),
        }),
      ])
      toast('순서가 변경되었습니다.')
    } catch {
      toast('순서 변경에 실패했습니다.', 'error')
    }
  }, [banners, toast])

  // ── Delete ──────────────────────────────────────────────

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      // Delete images from Storage
      if (deleteTarget.image_url) {
        await deleteImage(deleteTarget.image_url)
      }
      if (deleteTarget.mobile_image_url) {
        await deleteImage(deleteTarget.mobile_image_url)
      }
      // Delete Firestore document
      await deleteDoc(doc(db, 'banners', deleteTarget.id))
      toast('배너가 삭제되었습니다.')
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
      toast('삭제에 실패했습니다.', 'error')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, toast])

  // ── Render ──────────────────────────────────────────────

  return (
    <div>
      <AdminHeader
        title="배너 관리"
        description="메인 페이지 히어로 배너를 관리합니다."
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            배너 추가
          </button>
        }
      />

      {/* ─── Loading state ─────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* ─── Empty state ──────────────────────────────── */}
      {!loading && banners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">등록된 배너가 없습니다</h3>
          <p className="text-sm text-gray-500 mb-6">
            히어로 섹션에 표시할 배너를 추가해주세요.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            첫 배너 추가하기
          </button>
        </div>
      )}

      {/* ─── Banner list ──────────────────────────────── */}
      {!loading && banners.length > 0 && (
        <div className="space-y-4">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`bg-white rounded-xl border transition-all ${
                banner.is_active
                  ? 'border-gray-200 shadow-sm'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image preview – 16:9 */}
                <div className="md:w-80 lg:w-96 flex-shrink-0">
                  <div className="aspect-[16/9] rounded-tl-xl rounded-tr-xl md:rounded-tr-none md:rounded-bl-xl overflow-hidden bg-gray-100">
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {banner.title}
                        </h3>
                        {banner.subtitle && (
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {banner.subtitle}
                          </p>
                        )}
                      </div>
                      {/* Active badge */}
                      <button
                        onClick={() => toggleActive(banner)}
                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          banner.is_active
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={banner.is_active ? '클릭하여 비활성화' : '클릭하여 활성화'}
                      >
                        {banner.is_active ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        {banner.is_active ? '활성' : '비활성'}
                      </button>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
                      <span className="inline-flex items-center gap-1">
                        <Monitor className="w-3.5 h-3.5" />
                        데스크톱
                      </span>
                      {banner.mobile_image_url && (
                        <span className="inline-flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5" />
                          모바일
                        </span>
                      )}
                      {banner.link_url && (
                        <span className="truncate max-w-[200px]" title={banner.link_url}>
                          {banner.link_url}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    {/* Reorder */}
                    <div className="flex items-center gap-1 mr-auto">
                      <button
                        onClick={() => moveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="위로 이동"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveOrder(idx, 'down')}
                        disabled={idx === banners.length - 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="아래로 이동"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-300 ml-1">
                        {idx + 1} / {banners.length}
                      </span>
                    </div>

                    <button
                      onClick={() => openEdit(banner)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      수정
                    </button>
                    <button
                      onClick={() => setDeleteTarget(banner)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create / Edit Modal ──────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? '배너 수정' : '새 배너 추가'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="배너 제목을 입력하세요"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  부제목
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="부제목 (선택사항)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Desktop Image */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Monitor className="w-4 h-4" />
                  데스크톱 이미지 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  권장 비율 16:9 (예: 1920x1080)
                </p>
                <ImageUploader
                  value={form.image_url || null}
                  onChange={(url) => setForm((f) => ({ ...f, image_url: url ?? '' }))}
                  folder="banners"
                  aspectRatio="16/9"
                />
              </div>

              {/* Mobile Image */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Smartphone className="w-4 h-4" />
                  모바일 이미지 <span className="text-xs font-normal text-gray-400">(선택)</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  권장 비율 9:16 (예: 1080x1920). 미등록 시 데스크톱 이미지가 사용됩니다.
                </p>
                <ImageUploader
                  value={form.mobile_image_url || null}
                  onChange={(url) => setForm((f) => ({ ...f, mobile_image_url: url ?? '' }))}
                  folder="banners"
                  aspectRatio="9/16"
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
                  onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
                  placeholder="https://example.com (선택사항)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">활성화 상태</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    비활성화 시 사이트에 표시되지 않습니다.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_active}
                  onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.is_active ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      form.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? '수정하기' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">배너 삭제</h3>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium text-gray-700">&ldquo;{deleteTarget.title}&rdquo;</span> 배너를 삭제하시겠습니까?
            </p>
            <p className="text-xs text-gray-400 mb-6">
              삭제된 배너와 이미지는 복구할 수 없습니다.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toasts ───────────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  )
}
