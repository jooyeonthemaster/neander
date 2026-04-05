'use client'

import type { ReactNode } from 'react'

interface AdminHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export default function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
