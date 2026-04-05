'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, signInWithGoogle, signInWithEmail, signOut } = useAuth()
  const [useEmailLogin, setUseEmailLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">관리자 로그인</h1>
            <p className="text-gray-500 text-sm">NEANDERco. 관리자 패널에 접근하려면 로그인하세요.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {!useEmailLogin ? (
            <>
              <button
                onClick={async () => {
                  try {
                    setError('')
                    await signInWithGoogle()
                  } catch {
                    setError('Google 로그인에 실패했습니다.')
                  }
                }}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google 계정으로 로그인
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-400">또는</span></div>
              </div>

              <button
                onClick={() => setUseEmailLogin(true)}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors"
              >
                <Mail className="w-4 h-4" />
                이메일로 로그인
              </button>
            </>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setSubmitting(true)
                setError('')
                try {
                  await signInWithEmail(email, password)
                } catch {
                  setError('이메일 또는 비밀번호가 올바르지 않습니다.')
                } finally {
                  setSubmitting(false)
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="admin@neander.co.kr"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gray-900 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                로그인
              </button>
              <button
                type="button"
                onClick={() => { setUseEmailLogin(false); setError('') }}
                className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
              >
                다른 방법으로 로그인
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">접근 권한 없음</h2>
          <p className="text-gray-500 text-sm mb-1">현재 로그인 계정: <strong>{user.email}</strong></p>
          <p className="text-gray-400 text-xs mb-6">관리자 권한이 필요합니다. 담당자에게 문의하세요.</p>
          <button
            onClick={() => signOut()}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            다른 계정으로 로그인
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
