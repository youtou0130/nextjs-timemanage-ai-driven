'use client'

import dynamic from 'next/dynamic'

// Clerk の PricingTable は SSR 無効で動的インポート（ハイドレーションエラー防止）
const ClerkPricingTable = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.PricingTable),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    ),
  }
)

export function PricingTableClient() {
  return <ClerkPricingTable />
}
