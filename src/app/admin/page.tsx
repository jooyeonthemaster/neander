'use client'

import Link from 'next/link'
import {
  FolderOpen,
  Newspaper,
  Megaphone,
  ImageIcon,
  Settings,
} from 'lucide-react'

const cards = [
  {
    href: '/admin/portfolio',
    icon: FolderOpen,
    label: '포트폴리오 관리',
    description: '프로젝트 추가, 수정, 삭제 및 이미지 관리',
    color: 'bg-blue-500',
  },
  {
    href: '/admin/news',
    icon: Newspaper,
    label: '뉴스/프레스 관리',
    description: '보도자료, 공지사항, 이벤트 관리',
    color: 'bg-green-500',
  },
  {
    href: '/admin/popups',
    icon: Megaphone,
    label: '팝업 관리',
    description: '사이트 팝업 생성 및 스케줄링',
    color: 'bg-orange-500',
  },
  {
    href: '/admin/banners',
    icon: ImageIcon,
    label: '배너 관리',
    description: '히어로 배너 이미지 및 링크 관리',
    color: 'bg-purple-500',
  },
  {
    href: '/admin/settings',
    icon: Settings,
    label: '사이트 설정',
    description: '회사 정보, 연락처, SNS 링크 관리',
    color: 'bg-gray-500',
  },
]

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">NEANDERco. 웹사이트 콘텐츠를 관리합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group"
            >
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.label}</h3>
              <p className="text-sm text-gray-500">{card.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
