import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Zap } from 'lucide-react'
import { PricingTableClient } from '@/components/pricing/PricingTableClient'
import { FREE_FEATURES, PREMIUM_FEATURES } from '@/lib/constants'

export const metadata: Metadata = { title: '料金プラン' }

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Zap className="h-3.5 w-3.5" />
            シンプルな料金体系
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
            必要な機能を、必要な分だけ
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            まず無料で始めて、分析機能が必要になったときにアップグレード。
            <br className="hidden sm:block" />
            いつでもキャンセル可能です。
          </p>
        </div>
      </section>

      {/* プラン比較カード */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">プラン比較</h2>
          <div className="grid gap-6 sm:grid-cols-2">

            {/* 無料プラン */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-gray-900">無料プラン</h3>
                <p className="mt-1 text-sm text-gray-500">すべての基本機能が永久無料</p>
              </div>
              <div className="mt-5">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="ml-1 text-gray-500">/月</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/sign-up"
                  className="block rounded-xl border border-indigo-600 px-6 py-3 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  無料で始める
                </Link>
              </div>
            </div>

            {/* プレミアムプラン */}
            <div className="flex flex-col rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">プレミアムプラン</h3>
                  <p className="mt-1 text-sm text-gray-500">高度な分析で生産性を最大化</p>
                </div>
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  おすすめ
                </span>
              </div>
              <div className="mt-5">
                <span className="text-4xl font-bold text-gray-900">$10</span>
                <span className="ml-1 text-gray-500">/月</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/sign-up"
                  className="block rounded-xl bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  プレミアムを試す
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clerk PricingTable（サブスクリプション購入） */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900">今すぐ始める</h2>
            <p className="mt-2 text-sm text-gray-500">
              プランを選択してサブスクリプションを開始してください
            </p>
          </div>
          <PricingTableClient />
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">よくある質問</h2>
          <dl className="flex flex-col gap-6">
            {[
              {
                q: 'いつでもキャンセルできますか？',
                a: 'はい。プレミアムプランはいつでもキャンセル可能です。キャンセル後は期間終了まで引き続きご利用いただけます。',
              },
              {
                q: '無料プランに機能制限はありますか？',
                a: '時間記録・カテゴリ管理・基本的な統計表示・CSVエクスポートはすべて無料でご利用いただけます。高度なグラフ分析機能がプレミアム限定です。',
              },
              {
                q: '支払い方法は何が使えますか？',
                a: 'クレジットカード（Visa、Mastercard、American Express）に対応しています。Stripe による安全な決済処理を行っています。',
              },
              {
                q: 'プランの変更はできますか？',
                a: 'いつでも無料プランとプレミアムプランの間でアップグレード・ダウングレードが可能です。',
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-gray-200 bg-white p-6">
                <dt className="text-sm font-semibold text-gray-900">{q}</dt>
                <dd className="mt-2 text-sm text-gray-600">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* フッター CTA */}
      <section className="bg-indigo-600 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white">
            まずは無料で始めてみましょう
          </h2>
          <p className="mt-3 text-indigo-200">
            クレジットカード不要。無料プランでいつでも始められます。
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            無料アカウントを作成
          </Link>
        </div>
      </section>
    </div>
  )
}
