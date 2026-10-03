import Link from 'next/link'
import { Lock, Check, ArrowRight } from 'lucide-react'
import { PREMIUM_FEATURES } from '@/lib/constants'

interface Props {
  title?: string
}

export function UpgradePrompt({ title = 'プレミアムプラン限定機能' }: Props) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="mx-auto max-w-lg text-center">
        {/* ロックアイコン */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
          <Lock className="h-7 w-7 text-indigo-600" />
        </div>

        {/* タイトル */}
        <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">
          この機能はプレミアムプランでご利用いただけます。
          <br />
          月額 <span className="font-semibold text-indigo-600">$10</span> でデータ分析機能を全て解放。
        </p>

        {/* 機能一覧 */}
        <ul className="mt-6 grid gap-2 text-left sm:grid-cols-2">
          {PREMIUM_FEATURES.slice(1).map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            プレミアムにアップグレード
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            プラン詳細を見る
          </Link>
        </div>
      </div>
    </div>
  )
}
