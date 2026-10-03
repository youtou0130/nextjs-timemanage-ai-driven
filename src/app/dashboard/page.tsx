import type { Metadata } from 'next'
import { auth, currentUser } from '@clerk/nextjs/server'

export const metadata: Metadata = { title: 'ダッシュボード' }

export default async function DashboardPage() {
  await auth.protect()
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="mt-2 text-sm text-gray-500">
          ようこそ、{user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? 'ユーザー'} さん
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: '今日の作業時間', value: '0:00:00' },
            { label: '今週の作業時間', value: '0:00:00' },
            { label: '今月の作業時間', value: '0:00:00' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-400">
            タイマーや作業記録は今後のフェーズで実装されます。
          </p>
        </div>
      </div>
    </div>
  )
}
