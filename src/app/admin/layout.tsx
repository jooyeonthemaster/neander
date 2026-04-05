'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import AdminGuard from './components/AdminGuard'
import AdminSidebar from './components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <AdminGuard>
            <div className="min-h-screen bg-gray-50">
              <AdminSidebar />
              <main className="ml-64 p-8">
                {children}
              </main>
            </div>
          </AdminGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
