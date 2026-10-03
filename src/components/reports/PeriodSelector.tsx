'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export type Period = 'day' | 'week' | 'month' | 'year'

const TABS: { value: Period; label: string }[] = [
  { value: 'day',   label: '日次' },
  { value: 'week',  label: '週次' },
  { value: 'month', label: '月次' },
  { value: 'year',  label: '年次' },
]

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getPeriodRange(
  period: Period,
  anchor: Date
): { start: string; end: string; label: string } {
  const y = anchor.getFullYear()
  const m = anchor.getMonth()
  const d = anchor.getDate()

  if (period === 'day') {
    const str = toDateStr(anchor)
    return {
      start: str,
      end: str,
      label: anchor.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }),
    }
  }
  if (period === 'week') {
    const day = anchor.getDay()
    const monday = new Date(anchor)
    monday.setDate(d - (day === 0 ? 6 : day - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return {
      start: toDateStr(monday),
      end: toDateStr(sunday),
      label: `${monday.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} 〜 ${sunday.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}`,
    }
  }
  if (period === 'month') {
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0)
    return {
      start: toDateStr(start),
      end: toDateStr(end),
      label: anchor.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' }),
    }
  }
  // year
  return {
    start: `${y}-01-01`,
    end:   `${y}-12-31`,
    label: `${y}年`,
  }
}

export function navigate(period: Period, anchor: Date, dir: -1 | 1): Date {
  const d = new Date(anchor)
  if (period === 'day')   d.setDate(d.getDate() + dir)
  if (period === 'week')  d.setDate(d.getDate() + dir * 7)
  if (period === 'month') d.setMonth(d.getMonth() + dir)
  if (period === 'year')  d.setFullYear(d.getFullYear() + dir)
  return d
}

interface Props {
  period: Period
  anchor: Date
  onPeriodChange: (p: Period) => void
  onNavigate: (dir: -1 | 1) => void
}

export function PeriodSelector({ period, anchor, onPeriodChange, onNavigate }: Props) {
  const { label } = getPeriodRange(period, anchor)
  const isToday = getPeriodRange(period, anchor).end >= getPeriodRange(period, new Date()).start

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      {/* タブ */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onPeriodChange(tab.value)}
            className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              period === tab.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate(-1)}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-40 text-center text-sm font-medium text-gray-700">{label}</span>
        <button
          onClick={() => onNavigate(1)}
          disabled={isToday}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
