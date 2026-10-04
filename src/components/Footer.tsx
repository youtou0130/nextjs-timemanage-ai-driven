import Link from 'next/link'
import { Timer } from 'lucide-react'

const footerColumns = [
  {
    heading: '製品',
    links: [
      { label: 'ダッシュボード', href: '/dashboard' },
      { label: 'カテゴリ管理', href: '/categories' },
      { label: 'レポート', href: '/reports' },
      { label: 'タイマー機能', href: '/dashboard' },
    ],
  },
  {
    heading: 'サポート',
    links: [
      { label: 'ヘルプセンター', href: '#' },
      { label: 'お問い合わせ', href: '#' },
      { label: 'プライバシーポリシー', href: '#' },
      { label: '利用規約', href: '#' },
      { label: 'ステータス', href: '#' },
    ],
  },
  {
    heading: '料金プラン',
    links: [
      { label: '無料プラン', href: '/pricing' },
      { label: 'プレミアムプラン', href: '/pricing' },
      { label: 'プラン比較', href: '/pricing' },
      { label: 'エンタープライズ', href: '#' },
    ],
  },
  {
    heading: '会社',
    links: [
      { label: '会社概要', href: '#' },
      { label: '採用情報', href: '#' },
      { label: 'ブログ', href: '#' },
      { label: 'ニュースリリース', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

          {/* ロゴ・タグライン */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-white transition-colors duration-150 ease-in-out hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-900 rounded-sm"
            >
              {/* blue-500 = design system primary color */}
              <Timer className="h-6 w-6 text-blue-500" />
              Project Tracker
            </Link>
            {/* gray-300 on gray-900: contrast ratio ~6.7:1 (WCAG AA 適合) */}
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              シンプルに、効率よく。
              <br />
              作業時間を管理しよう。
            </p>
          </div>

          {/* リンク列 */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              {/* blue-500 ボーダーでブランドカラーを軸に表現 */}
              <h3 className="border-b border-blue-500 pb-2 text-sm font-semibold tracking-wide text-white">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {/* gray-300 on gray-900: contrast ratio ~6.7:1 (WCAG AA 適合) */}
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 transition-colors duration-150 ease-in-out hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-900 rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* コピーライト */}
        <div className="mt-12 border-t border-gray-700 pt-6">
          {/* gray-400 on gray-900: contrast ratio ~5.9:1 (WCAG AA 適合) */}
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Project Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
