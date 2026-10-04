'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Timer } from 'lucide-react'

const publicNav = [
  { href: '/', label: 'ホーム' },
  { href: '/pricing', label: '料金プラン' },
]

const appNav = [
  { href: '/dashboard', label: 'ダッシュボード' },
  { href: '/categories', label: 'カテゴリ' },
  { href: '/reports', label: 'レポート' },
]

export function Header() {
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth()

  const nav = isLoaded && isSignedIn ? appNav : publicNav

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <Timer className="h-5 w-5 text-blue-600" />
          <span>Project Tracker</span>
        </Link>

        {/* ナビゲーション */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ユーザーメニュー */}
        <div className="flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            <UserButton />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                サインイン
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
              >
                無料で始める
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
