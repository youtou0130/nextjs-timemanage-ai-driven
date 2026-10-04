'use client'

import dynamic from 'next/dynamic'

const UserProfile = dynamic(
  () => import('@clerk/nextjs').then((mod) => ({ default: mod.UserProfile })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-2xl bg-gray-100" /> }
)

export function UserSettingContent() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">アカウント設定</h1>
        <p className="mt-1 text-sm text-gray-500">プロフィール・メールアドレス・セキュリティを管理します</p>
      </div>

      {/* Clerk UserProfile（プロフィール編集・パスワード・セキュリティ） */}
      <div className="w-full">
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'rounded-2xl border border-gray-300 shadow-md w-full',
              navbar: 'border-r border-gray-200',
              navbarButton__active: 'bg-blue-50 text-blue-700 font-semibold',
              formButtonPrimary:
                'bg-blue-500 hover:bg-blue-600 shadow-md text-white font-semibold rounded-xl transition-all duration-200',
              formFieldInput:
                'rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500',
            },
          }}
        />
      </div>
    </div>
  )
}
