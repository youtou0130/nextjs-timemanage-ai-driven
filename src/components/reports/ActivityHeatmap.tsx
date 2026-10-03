'use client'

import { toLocalDateKey } from '@/lib/time-utils'

interface DayData { date: string; totalSeconds: number }

interface Props {
  timeSeries: DayData[]
  start: string  // YYYY-MM-DD
  end: string    // YYYY-MM-DD
  loading: boolean
}

// 作業時間に応じた色強度（5段階）
function intensityClass(seconds: number): string {
  if (seconds === 0)        return 'bg-gray-100'
  if (seconds < 3600)       return 'bg-indigo-100'
  if (seconds < 7200)       return 'bg-indigo-300'
  if (seconds < 14400)      return 'bg-indigo-500'
  return                           'bg-indigo-700'
}

function formatTooltip(seconds: number): string {
  if (seconds === 0) return '記録なし'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}時間${m}分` : `${m}分`
}

function eachDay(start: string, end: string): string[] {
  const days: string[] = []
  const cur = new Date(`${start}T00:00:00`)
  const last = new Date(`${end}T00:00:00`)
  while (cur <= last) {
    days.push(toLocalDateKey(cur.toISOString()))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

export function ActivityHeatmap({ timeSeries, start, end, loading }: Props) {
  const secMap = new Map(timeSeries.map((d) => [d.date, d.totalSeconds]))
  const days   = eachDay(start, end)

  // 最初の日の曜日オフセット（月曜始まり）
  const firstDay = new Date(`${start}T00:00:00`)
  const offset   = (firstDay.getDay() + 6) % 7  // 0=月, 1=火, ...

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">作業密度ヒートマップ</h3>

      {loading ? (
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <>
          {/* 曜日ヘッダー */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400">{d}</div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1">
            {/* 開始オフセット */}
            {Array.from({ length: offset }, (_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {days.map((dateKey) => {
              const secs = secMap.get(dateKey) ?? 0
              const d    = new Date(`${dateKey}T00:00:00`)
              return (
                <div
                  key={dateKey}
                  title={`${d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}: ${formatTooltip(secs)}`}
                  className={`aspect-square rounded-sm ${intensityClass(secs)} cursor-default transition-transform hover:scale-110`}
                />
              )
            })}
          </div>

          {/* 凡例 */}
          <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-gray-400">
            <span>少</span>
            {['bg-gray-100', 'bg-indigo-100', 'bg-indigo-300', 'bg-indigo-500', 'bg-indigo-700'].map((c) => (
              <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
            ))}
            <span>多</span>
          </div>
        </>
      )}
    </div>
  )
}
