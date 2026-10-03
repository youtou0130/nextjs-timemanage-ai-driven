'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Period } from './PeriodSelector'

interface DayData   { date:  string; totalSeconds: number }
interface HourData  { hour:  number; totalSeconds: number }

interface Props {
  period: Period
  timeSeries: DayData[]
  hourlyBreakdown: HourData[]
  loading: boolean
}

function dateLabel(dateStr: string, period: Period): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (period === 'week')  return d.toLocaleDateString('ja-JP', { weekday: 'short', day: 'numeric' })
  if (period === 'month') return `${d.getDate()}日`
  if (period === 'year')  return `${d.getMonth() + 1}月`
  return dateStr
}

// 年次表示用: 日次データを月次に集計
function aggregateByMonth(series: DayData[]): { key: string; totalSeconds: number }[] {
  const map = new Map<string, number>()
  for (const d of series) {
    const key = d.date.slice(0, 7) // YYYY-MM
    map.set(key, (map.get(key) ?? 0) + d.totalSeconds)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, totalSeconds]) => ({
      key: `${parseInt(key.slice(5))}月`,
      totalSeconds,
    }))
}

export function BarChartCard({ period, timeSeries, hourlyBreakdown, loading }: Props) {
  let chartData: { label: string; hours: number }[]

  if (period === 'day') {
    chartData = hourlyBreakdown.map((h) => ({
      label: `${h.hour}時`,
      hours: parseFloat((h.totalSeconds / 3600).toFixed(2)),
    }))
  } else if (period === 'year') {
    chartData = aggregateByMonth(timeSeries).map((d) => ({
      label: d.key,
      hours: parseFloat((d.totalSeconds / 3600).toFixed(2)),
    }))
  } else {
    chartData = timeSeries.map((d) => ({
      label: dateLabel(d.date, period),
      hours: parseFloat((d.totalSeconds / 3600).toFixed(2)),
    }))
  }

  const title = period === 'day' ? '時間帯別作業時間' : '日別作業時間'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      {loading ? (
        <div className="h-56 animate-pulse rounded-lg bg-gray-100" />
      ) : chartData.every((d) => d.hours === 0) ? (
        <div className="flex h-56 items-center justify-center text-sm text-gray-400">
          この期間に記録がありません
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              interval={period === 'month' ? 4 : 'preserveStartEnd'}
            />
            <YAxis
              unit="h"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              formatter={(v) => [`${Number(v).toFixed(2)}h`, '作業時間']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
            />
            <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
