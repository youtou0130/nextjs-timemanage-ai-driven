'use client'

import { Clock, TrendingUp, Zap, Tag } from 'lucide-react'
import { formatDuration, formatHHMMSS } from '@/lib/time-utils'

interface Props {
  totalSeconds: number
  avgDailySeconds: number
  peakHour: number
  daysWorked: number
  topCategory: string | null
  loading: boolean
}

function peakHourLabel(h: number): string {
  return `${String(h).padStart(2, '0')}:00 〜 ${String(h + 1).padStart(2, '0')}:00`
}

export function ProductivityCards({
  totalSeconds,
  avgDailySeconds,
  peakHour,
  daysWorked,
  topCategory,
  loading,
}: Props) {
  const cards = [
    {
      icon: Clock,
      label: '総作業時間',
      value: loading ? '—' : formatHHMMSS(totalSeconds),
      sub: `${daysWorked} 日間の記録`,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      icon: TrendingUp,
      label: '1日平均',
      value: loading ? '—' : formatDuration(avgDailySeconds),
      sub: '作業のある日の平均',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Zap,
      label: '最も集中した時間帯',
      value: loading ? '—' : peakHourLabel(peakHour),
      sub: '最も作業時間が多い時間帯',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: Tag,
      label: '最多カテゴリ',
      value: loading ? '—' : (topCategory ?? 'なし'),
      sub: '時間配分が最も多いカテゴリ',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map(({ icon: Icon, label, value, sub, color, bg }) => (
        <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="mt-3 text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-gray-900 leading-tight">
            {value}
          </p>
          <p className="mt-1 text-xs text-gray-400">{sub}</p>
        </div>
      ))}
    </div>
  )
}
