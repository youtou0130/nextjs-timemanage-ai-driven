'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatDuration } from '@/lib/time-utils'

interface CategoryData {
  id: string
  name: string
  color: string
  totalSeconds: number
  percentage: number
}

interface Props {
  data: CategoryData[]
  loading: boolean
}

export function PieChartCard({ data, loading }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">カテゴリ別時間配分</h3>

      {loading ? (
        <div className="h-56 animate-pulse rounded-lg bg-gray-100" />
      ) : data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-gray-400">
          この期間に記録がありません
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="totalSeconds"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                strokeWidth={2}
              >
                {data.map((c) => (
                  <Cell key={c.id} fill={c.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [formatDuration(Number(v)), '作業時間']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* カテゴリ凡例 */}
          <ul className="mt-3 flex flex-col gap-1.5">
            {data.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-gray-700">{c.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>{formatDuration(c.totalSeconds)}</span>
                  <span className="w-8 text-right font-medium text-gray-700">{c.percentage}%</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
