'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminHeader from '../components/AdminHeader'
import { db } from '@/lib/firebase/config'
import type { SiteSettings } from '@/types/admin'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { Save, Loader2, Building2, Phone, Globe, Link as LinkIcon } from 'lucide-react'

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const EMPTY_SETTINGS: Omit<SiteSettings, 'id' | 'updated_at'> = {
  company_name_ko: '',
  company_name_en: '',
  email: '',
  phone: '',
  address_ko: '',
  address_en: '',
  instagram_url: '',
  youtube_url: '',
  linkedin_url: '',
  blog_url: '',
  ceo_name_ko: '',
  ceo_name_en: '',
  business_number: '',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface FieldDef {
  key: keyof typeof EMPTY_SETTINGS
  label: string
  type?: string
  placeholder?: string
  required?: boolean
}

interface SectionDef {
  title: string
  icon: React.ReactNode
  fields: FieldDef[]
}

const SECTIONS: SectionDef[] = [
  {
    title: '회사 기본 정보',
    icon: <Building2 className="w-5 h-5" />,
    fields: [
      { key: 'company_name_ko', label: '회사명 (한글)', placeholder: '예: 네안더' },
      { key: 'company_name_en', label: '회사명 (영문)', placeholder: 'e.g. NEANDERco.' },
      { key: 'ceo_name_ko', label: '대표자명 (한글)', placeholder: '예: 홍길동' },
      { key: 'ceo_name_en', label: '대표자명 (영문)', placeholder: 'e.g. Gil-dong Hong' },
      { key: 'business_number', label: '사업자등록번호', placeholder: '000-00-00000' },
    ],
  },
  {
    title: '연락처 정보',
    icon: <Phone className="w-5 h-5" />,
    fields: [
      { key: 'email', label: '이메일', type: 'email', placeholder: 'hello@neander.co.kr', required: true },
      { key: 'phone', label: '전화번호', type: 'tel', placeholder: '02-0000-0000', required: true },
      { key: 'address_ko', label: '주소 (한글)', placeholder: '서울시 강남구 ...' },
      { key: 'address_en', label: '주소 (영문)', placeholder: 'Gangnam-gu, Seoul ...' },
    ],
  },
  {
    title: 'SNS 링크',
    icon: <Globe className="w-5 h-5" />,
    fields: [
      { key: 'instagram_url', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/...' },
      { key: 'youtube_url', label: 'YouTube', type: 'url', placeholder: 'https://youtube.com/...' },
      { key: 'linkedin_url', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/company/...' },
      { key: 'blog_url', label: '블로그', type: 'url', placeholder: 'https://blog.naver.com/...' },
    ],
  },
]

function snsIcon(key: string) {
  switch (key) {
    case 'instagram_url':
      return <LinkIcon className="w-4 h-4 text-gray-400" />
    case 'youtube_url':
      return <LinkIcon className="w-4 h-4 text-gray-400" />
    case 'linkedin_url':
      return <LinkIcon className="w-4 h-4 text-gray-400" />
    default:
      return <Globe className="w-4 h-4 text-gray-400" />
  }
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all animate-slide-up ${
            t.type === 'success' ? 'bg-gray-900' : 'bg-red-600'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [form, setForm] = useState<Omit<SiteSettings, 'id' | 'updated_at'>>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // -- Toast helper --
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  // -- Load settings --
  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'))
        if (snap.exists()) {
          const data = snap.data() as SiteSettings
          const { id: _id, updated_at: _u, ...rest } = data
          setForm({ ...EMPTY_SETTINGS, ...rest })
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
        showToast('설정을 불러오는 데 실패했습니다.', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  // -- Validation --
  const validate = useCallback(() => {
    const next: Record<string, string> = {}
    if (!form.email.trim()) {
      next.email = '이메일은 필수 항목입니다.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = '유효한 이메일 주소를 입력해 주세요.'
    }
    if (!form.phone.trim()) {
      next.phone = '전화번호는 필수 항목입니다.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }, [form.email, form.phone])

  // -- Save --
  const handleSave = useCallback(async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await setDoc(
        doc(db, 'settings', 'site'),
        {
          ...form,
          id: 'site',
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      )
      showToast('설정이 저장되었습니다.', 'success')
    } catch (err) {
      console.error('Failed to save settings:', err)
      showToast('저장에 실패했습니다. 다시 시도해 주세요.', 'error')
    } finally {
      setSaving(false)
    }
  }, [form, validate, showToast])

  // -- Field change --
  const handleChange = (key: keyof typeof EMPTY_SETTINGS, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // -- Loading skeleton --
  if (loading) {
    return (
      <div>
        <AdminHeader title="사이트 설정" description="회사 정보, 연락처, SNS 링크를 관리합니다." />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
                    <div className="h-10 bg-gray-100 rounded w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader
        title="사이트 설정"
        description="회사 정보, 연락처, SNS 링크를 관리합니다."
      />

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            {/* Section Header */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                {section.icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {section.fields.map((field) => {
                const isSns = section.title === 'SNS 링크'
                const hasError = !!errors[field.key]

                return (
                  <div key={field.key} className={field.key === 'address_ko' || field.key === 'address_en' ? 'md:col-span-2' : ''}>
                    <label
                      htmlFor={field.key}
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      {field.label}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <div className="relative">
                      {isSns && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {snsIcon(field.key)}
                        </div>
                      )}
                      <input
                        id={field.key}
                        type={field.type ?? 'text'}
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={`
                          w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900
                          placeholder:text-gray-400 outline-none transition-colors
                          ${isSns ? 'pl-10' : ''}
                          ${hasError
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
                          }
                        `}
                      />
                    </div>
                    {hasError && (
                      <p className="mt-1.5 text-xs text-red-600">{errors[field.key]}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* Save Button */}
        <div className="flex justify-end pt-2 pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium
              bg-gray-900 text-white hover:bg-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

    </div>
  )
}
