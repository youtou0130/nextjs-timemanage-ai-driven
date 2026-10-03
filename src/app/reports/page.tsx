import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { PlanProtect } from '@/components/PlanProtect'
import { ReportsContent } from '@/components/reports/ReportsContent'

export const metadata: Metadata = { title: 'レポート' }

export default async function ReportsPage() {
  await auth.protect()

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">レポート</h1>
          <p className="mt-1 text-sm text-gray-500">
            作業時間の詳細分析とトレンドを確認できます
          </p>
        </div>
        <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-semibold text-white">
          プレミアム
        </span>
      </div>

      {/* プラン保護 */}
      <PlanProtect>
        <ReportsContent />
      </PlanProtect>
    </div>
  )
}
