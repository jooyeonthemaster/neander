'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  Eye,
  EyeOff,
  Star,
  StarOff,
  X,
  Loader2,
  ChevronUp,
  ChevronDown,
  FolderOpen,
  Save,
  ImagePlus,
} from 'lucide-react'
import AdminHeader from '../components/AdminHeader'
import { db } from '@/lib/firebase/config'
import { uploadImage, deleteImage } from '@/lib/firebase/storage'
import {
  PORTFOLIO_CATEGORY_LABELS,
  SERVICE_OPTIONS,
} from '@/types/admin'
import type { PortfolioItem } from '@/types/admin'

// ── Category badge colors ──────────────────────────────────
const CATEGORY_COLORS: Record<PortfolioItem['category'], string> = {
  online: 'bg-blue-100 text-blue-700',
  offline: 'bg-amber-100 text-amber-700',
  service: 'bg-teal-100 text-teal-700',
}

// ── Toast ──────────────────────────────────────────────────
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++counterRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return { toasts, show }
}

// ── Default form state ─────────────────────────────────────
type FormData = Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>

function defaultForm(): FormData {
  return {
    title_ko: '',
    title_en: '',
    description_ko: '',
    description_en: '',
    slug: '',
    year: new Date().getFullYear(),
    category: 'online',
    tags: [],
    images: [],
    thumbnail: '',
    services: [],
    client: '',
    location: null,
    is_featured: false,
    display_order: 0,
    is_published: false,
  }
}

// ── Slug generation ────────────────────────────────────────
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// ============================================================
// Main Component
// ============================================================
export default function PortfolioAdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [tagsInput, setTagsInput] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const { toasts, show: showToast } = useToast()

  // ── Real-time Firestore listener ──────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'portfolio'), orderBy('display_order', 'asc'))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as PortfolioItem[]
        setItems(data)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore listener error:', err)
        showToast('데이터 로딩 실패', 'error')
        setLoading(false)
      },
    )
    return () => unsub()
  }, [showToast])

  // ── Helpers ───────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null)
    const nextOrder =
      items.length > 0 ? Math.max(...items.map((i) => i.display_order)) + 1 : 0
    setForm({ ...defaultForm(), display_order: nextOrder })
    setTagsInput('')
    setValidationErrors([])
    setModalOpen(true)
  }

  const openEdit = (item: PortfolioItem) => {
    setEditingId(item.id)
    setForm({
      title_ko: item.title_ko,
      title_en: item.title_en,
      description_ko: item.description_ko,
      description_en: item.description_en,
      slug: item.slug,
      year: item.year,
      category: item.category,
      tags: item.tags,
      images: item.images,
      thumbnail: item.thumbnail,
      services: item.services,
      client: item.client,
      location: item.location,
      is_featured: item.is_featured,
      display_order: item.display_order,
      is_published: item.is_published,
    })
    setTagsInput(item.tags.join(', '))
    setValidationErrors([])
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setValidationErrors([])
  }

  // ── Title → Slug auto-sync ────────────────────────────────
  const handleTitleEnChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title_en: value,
      slug: generateSlug(value),
    }))
  }

  // ── Tags ──────────────────────────────────────────────────
  const handleTagsChange = (value: string) => {
    setTagsInput(value)
    setForm((prev) => ({
      ...prev,
      tags: value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }))
  }

  // ── Services checkbox ─────────────────────────────────────
  const toggleService = (serviceValue: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(serviceValue)
        ? prev.services.filter((s) => s !== serviceValue)
        : [...prev.services, serviceValue],
    }))
  }

  // ── Image upload ──────────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있습니다.', 'error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('파일 크기는 10MB 이하여야 합니다.', 'error')
      return
    }
    setUploadingImage(true)
    try {
      const url = await uploadImage(file, 'portfolio')
      setForm((prev) => {
        const newImages = [...prev.images, url]
        return {
          ...prev,
          images: newImages,
          thumbnail: prev.thumbnail || url,
        }
      })
      showToast('이미지가 업로드되었습니다.')
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async (url: string) => {
    try {
      await deleteImage(url)
    } catch {
      // Storage delete may fail for already-deleted files – continue
    }
    setForm((prev) => {
      const newImages = prev.images.filter((u) => u !== url)
      return {
        ...prev,
        images: newImages,
        thumbnail:
          prev.thumbnail === url ? newImages[0] || '' : prev.thumbnail,
      }
    })
  }

  const setThumbnail = (url: string) => {
    setForm((prev) => ({ ...prev, thumbnail: url }))
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const imgs = [...prev.images]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= imgs.length) return prev
      ;[imgs[index], imgs[targetIndex]] = [imgs[targetIndex], imgs[index]]
      return { ...prev, images: imgs }
    })
  }

  // ── Validation ────────────────────────────────────────────
  const validate = (): string[] => {
    const errors: string[] = []
    if (!form.title_ko.trim()) errors.push('한국어 제목을 입력하세요.')
    if (!form.title_en.trim()) errors.push('영어 제목을 입력하세요.')
    if (!form.description_ko.trim()) errors.push('한국어 설명을 입력하세요.')
    if (!form.description_en.trim()) errors.push('영어 설명을 입력하세요.')
    if (form.images.length === 0) errors.push('이미지를 1개 이상 업로드하세요.')
    return errors
  }

  // ── Save (Create / Update) ────────────────────────────────
  const handleSave = async () => {
    const errors = validate()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors([])
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const payload = {
        ...form,
        thumbnail: form.thumbnail || form.images[0] || '',
        location: form.location || null,
      }

      if (editingId) {
        await updateDoc(doc(db, 'portfolio', editingId), {
          ...payload,
          updated_at: now,
        })
        showToast('포트폴리오가 수정되었습니다.')
      } else {
        await addDoc(collection(db, 'portfolio'), {
          ...payload,
          created_at: now,
          updated_at: now,
        })
        showToast('포트폴리오가 추가되었습니다.')
      }
      closeModal()
    } catch (err) {
      console.error(err)
      showToast('저장에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    setDeleting(id)
    try {
      // Delete all images from Storage
      await Promise.all(item.images.map((url) => deleteImage(url)))
      await deleteDoc(doc(db, 'portfolio', id))
      showToast('포트폴리오가 삭제되었습니다.')
    } catch (err) {
      console.error(err)
      showToast('삭제에 실패했습니다.', 'error')
    } finally {
      setDeleting(null)
      setConfirmDeleteId(null)
    }
  }

  // ── Quick toggles ─────────────────────────────────────────
  const togglePublished = async (item: PortfolioItem) => {
    try {
      await updateDoc(doc(db, 'portfolio', item.id), {
        is_published: !item.is_published,
        updated_at: new Date().toISOString(),
      })
    } catch {
      showToast('상태 변경에 실패했습니다.', 'error')
    }
  }

  const toggleFeatured = async (item: PortfolioItem) => {
    try {
      await updateDoc(doc(db, 'portfolio', item.id), {
        is_featured: !item.is_featured,
        updated_at: new Date().toISOString(),
      })
    } catch {
      showToast('상태 변경에 실패했습니다.', 'error')
    }
  }

  // ── Reorder items ─────────────────────────────────────────
  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return
    const current = items[index]
    const target = items[targetIndex]
    try {
      await Promise.all([
        updateDoc(doc(db, 'portfolio', current.id), {
          display_order: target.display_order,
          updated_at: new Date().toISOString(),
        }),
        updateDoc(doc(db, 'portfolio', target.id), {
          display_order: current.display_order,
          updated_at: new Date().toISOString(),
        }),
      ])
    } catch {
      showToast('순서 변경에 실패했습니다.', 'error')
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white animate-in slide-in-from-right fade-in duration-300 ${
              t.type === 'success' ? 'bg-gray-900' : 'bg-red-600'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      <AdminHeader
        title="포트폴리오 관리"
        description="프로젝트를 추가, 수정, 삭제하고 이미지를 관리합니다."
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트
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
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-1">
            등록된 포트폴리오가 없습니다
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            새 프로젝트를 추가하여 포트폴리오를 시작하세요.
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            첫 프로젝트 추가
          </button>
        </div>
      )}

      {/* Card grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
                !item.is_published ? 'opacity-60' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] bg-gray-100">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title_ko}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {/* Category badge */}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    CATEGORY_COLORS[item.category]
                  }`}
                >
                  {PORTFOLIO_CATEGORY_LABELS[item.category]}
                </span>
                {/* Year badge */}
                <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
                  {item.year}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {item.title_ko}
                </h3>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {item.title_en}
                </p>
                {item.client && (
                  <p className="text-xs text-gray-400 mt-1">
                    클라이언트: {item.client}
                  </p>
                )}

                {/* Actions row */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    {/* Reorder */}
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="위로 이동"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="아래로 이동"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-300 ml-1">
                      #{item.display_order}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Featured */}
                    <button
                      onClick={() => toggleFeatured(item)}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      title={item.is_featured ? '추천 해제' : '추천 설정'}
                    >
                      {item.is_featured ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {/* Published */}
                    <button
                      onClick={() => togglePublished(item)}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      title={item.is_published ? '비공개 전환' : '공개 전환'}
                    >
                      {item.is_published ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="수정"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      disabled={deleting === item.id}
                      className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="삭제"
                    >
                      {deleting === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete confirmation dialog ─────────────────────── */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              삭제 확인
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              이 포트폴리오를 삭제하시겠습니까? 모든 이미지도 함께 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deleting === confirmDeleteId}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting === confirmDeleteId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] flex items-start justify-center overflow-y-auto py-8 px-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? '포트폴리오 수정' : '새 포트폴리오 추가'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
              {/* Validation errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Section: Basic info ──────────────────── */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 mb-3">
                  기본 정보
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-600">
                      제목 (한국어) <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={form.title_ko}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, title_ko: e.target.value }))
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                      placeholder="프로젝트 제목"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">
                      제목 (English) <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={form.title_en}
                      onChange={(e) => handleTitleEnChange(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                      placeholder="Project Title"
                    />
                  </label>
                </div>

                <label className="block mt-4">
                  <span className="text-sm text-gray-600">슬러그 (URL)</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, slug: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                    placeholder="auto-generated-slug"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <label className="block">
                    <span className="text-sm text-gray-600">
                      설명 (한국어) <span className="text-red-500">*</span>
                    </span>
                    <textarea
                      rows={4}
                      value={form.description_ko}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          description_ko: e.target.value,
                        }))
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition resize-none"
                      placeholder="프로젝트 설명을 입력하세요"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">
                      설명 (English) <span className="text-red-500">*</span>
                    </span>
                    <textarea
                      rows={4}
                      value={form.description_en}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          description_en: e.target.value,
                        }))
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition resize-none"
                      placeholder="Project description"
                    />
                  </label>
                </div>
              </fieldset>

              {/* ── Section: Classification ──────────────── */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 mb-3">
                  분류
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-600">카테고리</span>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          category: e.target.value as PortfolioItem['category'],
                        }))
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition bg-white"
                    >
                      {Object.entries(PORTFOLIO_CATEGORY_LABELS).map(
                        ([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">연도</span>
                    <input
                      type="number"
                      value={form.year}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          year: parseInt(e.target.value) || new Date().getFullYear(),
                        }))
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">표시 순서</span>
                    <input
                      type="number"
                      value={form.display_order}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          display_order: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                    />
                  </label>
                </div>

                <label className="block mt-4">
                  <span className="text-sm text-gray-600">
                    태그 (쉼표로 구분)
                  </span>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                    placeholder="향수, 팝업, 브랜딩"
                  />
                </label>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </fieldset>

              {/* ── Section: Client & location ───────────── */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 mb-3">
                  클라이언트 정보
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-600">클라이언트</span>
                    <input
                      type="text"
                      value={form.client}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, client: e.target.value }))
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                      placeholder="클라이언트명"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">
                      장소 (선택사항)
                    </span>
                    <input
                      type="text"
                      value={form.location ?? ''}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          location: e.target.value || null,
                        }))
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                      placeholder="서울 성수동"
                    />
                  </label>
                </div>
              </fieldset>

              {/* ── Section: Services ────────────────────── */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 mb-3">
                  제공 서비스
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                        form.services.includes(opt.value)
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.services.includes(opt.value)}
                        onChange={() => toggleService(opt.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* ── Section: Toggles ─────────────────────── */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 mb-3">
                  상태
                </legend>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        form.is_published ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          is_published: !p.is_published,
                        }))
                      }
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          form.is_published
                            ? 'translate-x-5'
                            : 'translate-x-1'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-gray-700">공개</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        form.is_featured ? 'bg-yellow-400' : 'bg-gray-300'
                      }`}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          is_featured: !p.is_featured,
                        }))
                      }
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          form.is_featured
                            ? 'translate-x-5'
                            : 'translate-x-1'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-gray-700">추천</span>
                  </label>
                </div>
              </fieldset>

              {/* ── Section: Images ──────────────────────── */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 mb-3">
                  이미지 관리 <span className="text-red-500">*</span>
                </legend>

                {/* Image grid */}
                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {form.images.map((url, idx) => (
                      <div
                        key={url}
                        className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
                          form.thumbnail === url
                            ? 'border-yellow-400'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="aspect-[4/3]">
                          <img
                            src={url}
                            alt={`이미지 ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Thumbnail badge */}
                        {form.thumbnail === url && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded text-[10px] font-bold">
                            대표
                          </span>
                        )}
                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {/* Set thumbnail */}
                          {form.thumbnail !== url && (
                            <button
                              type="button"
                              onClick={() => setThumbnail(url)}
                              className="p-1.5 bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-300 transition-colors"
                              title="대표 이미지로 설정"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Move up */}
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 bg-white/90 text-gray-700 rounded-md hover:bg-white disabled:opacity-30 transition-colors"
                            title="앞으로"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          {/* Move down */}
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'down')}
                            disabled={idx === form.images.length - 1}
                            className="p-1.5 bg-white/90 text-gray-700 rounded-md hover:bg-white disabled:opacity-30 transition-colors"
                            title="뒤로"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(url)}
                            className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            title="삭제"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ImagePlus className="w-5 h-5" />
                  )}
                  {uploadingImage
                    ? '업로드 중...'
                    : '이미지 추가 (PNG, JPG, WebP, 최대 10MB)'}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                    e.target.value = ''
                  }}
                />
              </fieldset>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? '저장 중...' : editingId ? '수정 저장' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
