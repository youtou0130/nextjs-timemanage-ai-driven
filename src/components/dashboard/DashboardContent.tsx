'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, CalendarDays, Calendar } from 'lucide-react'
import { RecordingSection } from './RecordingSection'
import { RecentEntries } from './RecentEntries'
import { calcStats, formatHHMMSS } from '@/lib/time-utils'
import type { TimeEntryRow, CategoryRow } from '@/types/database.types'

type EntryWithCategory = TimeEntryRow & {
  categories: Pick<CategoryRow, 'id' | 'name' | 'color'> | null
}

interface Props {
  displayName: string
}

function getSince(): string {
  // 今月1日と今週月曜の早い方から取得（統計に必要な範囲をカバー）
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const day = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  weekStart.setHours(0, 0, 0, 0)
  return (weekStart < monthStart ? weekStart : monthStart).toISOString()
}

export function DashboardContent({ displayName }: Props) {
  const [entries, setEntries] = useState<EntryWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    setLoading(true)
    const since = encodeURIComponent(getSince())
    fetch(`/api/time-entries?since=${since}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [refreshKey])

  const stats = calcStats(entries)

  const statCards = [
    { label: '今日の作業時間',  value: formatHHMMSS(stats.todaySeconds),  icon: Clock },
    { label: '今週の作業時間',  value: formatHHMMSS(stats.weekSeconds),   icon: CalendarDays },
    { label: '今月の作業時間',  value: formatHHMMSS(stats.monthSeconds),  icon: Calendar },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          おかえりなさい、{displayName} さん
        </h1>
        <p className="mt-1 text-sm text-gray-500">今日も時間を記録しましょう</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md transition-all duration-200 hover:border-gray-400 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-100">
                <Icon className="h-4 w-4 text-blue-700" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums text-gray-900">
              {loading ? (
                <span className="inline-block h-9 w-28 animate-pulse rounded bg-gray-100" />
              ) : (
                value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* タイマー＋手動入力 */}
      <RecordingSection onSaved={refresh} />

      {/* 作業履歴 */}
      <RecentEntries entries={entries} loading={loading} onRefresh={refresh} />
    </div>
  )
}
