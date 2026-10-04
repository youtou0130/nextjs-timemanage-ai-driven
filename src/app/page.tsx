import Link from 'next/link'
import { Timer, LayoutDashboard, Tag, ArrowRight, Check } from 'lucide-react'
import { Footer } from '@/components/Footer'

const features = [
  {
    icon: Timer,
    title: '作業時間の記録',
    description:
      'ワンクリックで計測開始。タイマーまたは手動入力で、どんな作業も素早く記録できます。',
  },
  {
    icon: Tag,
    title: 'カテゴリ管理',
    description:
      'プロジェクト・タスクをカテゴリで色分け管理。時間の使い方を整理して可視化します。',
  },
  {
    icon: LayoutDashboard,
    title: 'ダッシュボード',
    description:
      '今日・今週・今月の作業時間を一目で確認。プレミアムでは詳細グラフ分析も利用できます。',
  },
]

const freePlanFeatures = [
  'タイマー・手動入力による時間記録',
  'カテゴリ管理（色分け）',
  '日・週・月の合計時間表示',
  '作業履歴の閲覧',
  'CSVエクスポート',
]

const premiumPlanFeatures = [
  '無料プランの全機能',
  '日次・週次・月次・年次の詳細分析',
  'カテゴリ別グラフ（円・棒・ヒートマップ）',
  '前期間比較・トレンド分析',
  'PDFレポート生成',
  'カテゴリ無制限作成',
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-24 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Timer className="h-4 w-4" />
            時間を見える化して、生産性を向上
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            シンプルな作業時間管理で
            <br />
            <span className="text-indigo-600">生産性を最大化</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            タイマー計測・手動入力・カテゴリ管理。シンプルな操作で作業時間を記録し、
            <br className="hidden sm:block" />
            時間の使い方を分析・改善できるタイム管理アプリです。
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              無料で始める
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="rounded-xl border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
            >
              サインイン
            </Link>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">3つの主要機能</h2>
            <p className="mt-3 text-gray-500">必要な機能だけに絞ったシンプルな設計</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                  <feature.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">シンプルな料金プラン</h2>
            <p className="mt-3 text-gray-500">まず無料で始めて、必要なときにアップグレード</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* 無料プラン */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">無料プラン</h3>
              <p className="mt-1 text-sm text-gray-500">基本機能をすべて無料で</p>
              <p className="mt-4 text-4xl font-bold text-gray-900">
                $0<span className="text-lg font-normal text-gray-500">/月</span>
              </p>
              <ul className="mt-6 space-y-3">
                {freePlanFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block rounded-xl border border-indigo-600 px-6 py-3 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                無料で始める
              </Link>
            </div>

            {/* プレミアムプラン */}
            <div className="rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">プレミアムプラン</h3>
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  おすすめ
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">高度な分析で生産性を最大化</p>
              <p className="mt-4 text-4xl font-bold text-gray-900">
                $10<span className="text-lg font-normal text-gray-500">/月</span>
              </p>
              <ul className="mt-6 space-y-3">
                {premiumPlanFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="mt-8 block rounded-xl bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
              >
                プレミアムを試す
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">今すぐ時間を管理しよう</h2>
          <p className="mt-4 text-gray-500">
            クレジットカード不要。無料プランで今すぐ始められます。
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-10 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            無料アカウントを作成
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
