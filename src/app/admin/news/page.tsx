'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import AdminHeader from '../components/AdminHeader'
import { db } from '@/lib/firebase/config'
import { deleteImage } from '@/lib/firebase/storage'
import { NEWS_CATEGORY_LABELS, NEWS_CATEGORY_COLORS, type NewsArticle, type NewsCategory } from '@/types/admin'
import { collection, doc, updateDoc, deleteDoc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Eye, EyeOff, Pencil, Trash2, Plus, Search, Loader2, Newspaper, X } from 'lucide-react'
import Link from 'next/link'

type FilterCategory = 'all' | NewsCategory

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as NewsArticle[]
        setArticles(data)
        setLoading(false)
      },
      (error) => {
        console.error('뉴스 목록 로딩 실패:', error)
        showToast('뉴스 목록을 불러오는데 실패했습니다.', 'error')
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [showToast])

  // Filtered and searched articles
  const filteredArticles = useMemo(() => {
    let result = articles
    if (filter !== 'all') {
      result = result.filter((a) => a.category === filter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((a) => a.title.toLowerCase().includes(q))
    }
    return result
  }, [articles, filter, searchQuery])

  // Toggle publish status
  const handleTogglePublish = useCallback(async (article: NewsArticle) => {
    setTogglingId(article.id)
    try {
      const newPublished = !article.is_published
      await updateDoc(doc(db, 'news', article.id), {
        is_published: newPublished,
        published_at: newPublished ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      showToast(newPublished ? '게시되었습니다.' : '비공개 처리되었습니다.')
    } catch (error) {
      console.error('상태 변경 실패:', error)
      showToast('상태 변경에 실패했습니다.', 'error')
    } finally {
      setTogglingId(null)
    }
  }, [showToast])

  // Delete article
  const handleDelete = useCallback(async (article: NewsArticle) => {
    const confirmed = window.confirm(
      `"${article.title}" 기사를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    )
    if (!confirmed) return

    setDeletingId(article.id)
    try {
      if (article.image_url) {
        await deleteImage(article.image_url)
      }
      await deleteDoc(doc(db, 'news', article.id))
      showToast('기사가 삭제되었습니다.')
    } catch (error) {
      console.error('삭제 실패:', error)
      showToast('삭제에 실패했습니다.', 'error')
    } finally {
      setDeletingId(null)
    }
  }, [showToast])

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return '-'
    }
  }

  const filterTabs: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'press', label: '보도자료' },
    { key: 'notice', label: '공지사항' },
    { key: 'event', label: '이벤트' },
  ]

  return (
    <div>
      <AdminHeader
        title="뉴스/프레스 관리"
        description="보도자료, 공지사항, 이벤트를 관리합니다."
        actions={
          <Link
            href="/admin/news/create"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 글 작성
          </Link>
        }
      />

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.key === 'all' && (
                <span className="ml-1.5 text-xs text-gray-400">
                  {articles.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목으로 검색..."
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Newspaper className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery ? '검색 결과가 없습니다' : '등록된 글이 없습니다'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchQuery
              ? '다른 검색어로 다시 시도해 보세요.'
              : '새 글을 작성하여 뉴스를 게시해 보세요.'}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/news/create"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              새 글 작성
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[80px_1fr_100px_90px_100px_120px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>이미지</span>
            <span>제목</span>
            <span>카테고리</span>
            <span>상태</span>
            <span>작성일</span>
            <span className="text-right">관리</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="grid grid-cols-1 md:grid-cols-[80px_1fr_100px_90px_100px_120px] gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 md:w-full md:h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Title + Summary */}
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {article.summary}
                    </p>
                  )}
                </div>

                {/* Category Badge */}
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      NEWS_CATEGORY_COLORS[article.category]
                    }`}
                  >
                    {NEWS_CATEGORY_LABELS[article.category]}
                  </span>
                </div>

                {/* Published Status */}
                <div>
                  <button
                    onClick={() => handleTogglePublish(article)}
                    disabled={togglingId === article.id}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      article.is_published
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={article.is_published ? '클릭하여 비공개' : '클릭하여 게시'}
                  >
                    {togglingId === article.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : article.is_published ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                    {article.is_published ? '게시' : '비공개'}
                  </button>
                </div>

                {/* Date */}
                <div className="text-xs text-gray-500">
                  {formatDate(article.created_at)}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/news/${article.id}/edit`}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="수정"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(article)}
                    disabled={deletingId === article.id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="삭제"
                  >
                    {deletingId === article.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              총 {filteredArticles.length}개
              {filter !== 'all' && ` (전체 ${articles.length}개 중)`}
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-bottom-4 ${
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
