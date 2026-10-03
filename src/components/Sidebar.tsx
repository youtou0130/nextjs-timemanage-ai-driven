'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Tag, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard',    label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/categories',   label: 'カテゴリ',       icon: Tag },
  { href: '/reports',      label: 'レポート',       icon: BarChart2 },
  { href: '/user-setting', label: '設定',           icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
      <nav className="flex flex-col gap-1 p-3 pt-6">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
