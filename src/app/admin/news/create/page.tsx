'use client'

import { useState, useCallback } from 'react'
import AdminHeader from '../../components/AdminHeader'
import ImageUploader from '../../components/ImageUploader'
import TiptapEditor from '../../components/TiptapEditor'
import { db } from '@/lib/firebase/config'
import { NEWS_CATEGORY_LABELS, type NewsCategory } from '@/types/admin'
import { collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface FormData {
  title: string
  category: NewsCategory
  summary: string
  content: string
  image_url: string | null
  is_published: boolean
  source_name: string
  source_url: string
}

interface FormErrors {
  title?: string
  summary?: string
  content?: string
  source_name?: string
}

const initialFormData: FormData = {
  title: '',
  category: 'press',
  summary: '',
  content: '',
  image_url: null,
  is_published: false,
  source_name: '',
  source_url: '',
}

export default function AdminNewsCreatePage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.title.trim()) {
      newErrors.title = '제목을 입력해 주세요.'
    }
    if (!form.summary.trim()) {
      newErrors.summary = '요약을 입력해 주세요.'
    }
    if (!form.content.trim() || form.content === '<p></p>') {
      newErrors.content = '내용을 입력해 주세요.'
    }
    if (form.category === 'press' && !form.source_name.trim()) {
      newErrors.source_name = '보도자료의 출처를 입력해 주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      const now = new Date().toISOString()
      await addDoc(collection(db, 'news'), {
        title: form.title.trim(),
        category: form.category,
        summary: form.summary.trim(),
        content: form.content,
        image_url: form.image_url,
        is_published: form.is_published,
        published_at: form.is_published ? now : null,
        source_name: form.category === 'press' ? form.source_name.trim() || null : null,
        source_url: form.category === 'press' ? form.source_url.trim() || null : null,
        created_at: now,
        updated_at: now,
      })
      router.push('/admin/news')
    } catch (error) {
      console.error('저장 실패:', error)
      showToast('저장에 실패했습니다. 다시 시도해 주세요.', 'error')
      setSaving(false)
    }
  }

  return (
    <div>
      <AdminHeader
        title="새 글 작성"
        description="뉴스, 보도자료, 공지사항 또는 이벤트를 작성합니다."
        actions={
          <Link
            href="/admin/news"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Link>
        }
      />

      <div className="max-w-4xl space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">기본 정보</h2>

          {/* Title */}
          <div className="mb-5">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="기사 제목을 입력하세요"
              className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors ${
                errors.title ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-5">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
              카테고리
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => updateField('category', e.target.value as NewsCategory)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            >
              {(Object.entries(NEWS_CATEGORY_LABELS) as [NewsCategory, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1.5">
              요약 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="summary"
              value={form.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              placeholder="기사의 요약 내용을 입력하세요 (목록에 표시됩니다)"
              rows={3}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors ${
                errors.summary ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-300'
              }`}
            />
            {errors.summary && (
              <p className="text-red-500 text-xs mt-1.5">{errors.summary}</p>
            )}
          </div>
        </section>

        {/* Press Source (Conditional) */}
        {form.category === 'press' && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">보도자료 출처</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="source_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  출처명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="source_name"
                  type="text"
                  value={form.source_name}
                  onChange={(e) => updateField('source_name', e.target.value)}
                  placeholder="예: 조선일보, 매일경제"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors ${
                    errors.source_name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-300'
                  }`}
                />
                {errors.source_name && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.source_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="source_url" className="block text-sm font-medium text-gray-700 mb-1.5">
                  원문 링크
                </label>
                <input
                  id="source_url"
                  type="url"
                  value={form.source_url}
                  onChange={(e) => updateField('source_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                />
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">본문 내용</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              내용 <span className="text-red-500">*</span>
            </label>
            <TiptapEditor
              value={form.content}
              onChange={(html) => updateField('content', html)}
              placeholder="기사 내용을 작성하세요..."
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1.5">{errors.content}</p>
            )}
          </div>
        </section>

        {/* Image */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">대표 이미지</h2>
          <ImageUploader
            value={form.image_url}
            onChange={(url) => updateField('image_url', url)}
            folder="news"
            aspectRatio="16/9"
            placeholder="대표 이미지를 드래그하거나 클릭하여 업로드"
          />
        </section>

        {/* Publish Toggle */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">게시 상태</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {form.is_published ? '이 글은 사이트에 바로 게시됩니다.' : '비공개 상태로 저장됩니다. 나중에 게시할 수 있습니다.'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_published}
              onClick={() => updateField('is_published', !form.is_published)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:ring-offset-2 ${
                form.is_published ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                  form.is_published ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/admin/news"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-gray-900 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
