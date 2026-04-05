'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Megaphone,
  ImageIcon,
  Newspaper,
  FolderOpen,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/portfolio', label: '포트폴리오 관리', icon: FolderOpen },
  { href: '/admin/news', label: '뉴스/프레스 관리', icon: Newspaper },
  { href: '/admin/popups', label: '팝업 관리', icon: Megaphone },
  { href: '/admin/banners', label: '배너 관리', icon: ImageIcon },
  { href: '/admin/settings', label: '사이트 설정', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0f172a] text-white flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="block">
          <h1 className="text-lg font-bold tracking-tight">NEANDERco.</h1>
          <p className="text-xs text-gray-400 mt-0.5">관리자 패널</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-gray-400 truncate mb-3">{user?.email}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
