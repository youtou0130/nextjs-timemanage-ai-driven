'use client'

import { useState, useEffect, useCallback } from 'react'
import { PeriodSelector, getPeriodRange, navigate, type Period } from './PeriodSelector'
import { ProductivityCards } from './ProductivityCards'
import { BarChartCard } from './BarChartCard'
import { PieChartCard } from './PieChartCard'
import { ActivityHeatmap } from './ActivityHeatmap'
import { PDFExportButton } from './PDFExportButton'
import { formatHHMMSS } from '@/lib/time-utils'

interface AnalyticsData {
  timeSeries:        { date: string; totalSeconds: number }[]
  hourlyBreakdown:   { hour: number; totalSeconds: number }[]
  categoryBreakdown: { id: string; name: string; color: string; totalSeconds: number; percentage: number }[]
  productivity: {
    totalSeconds:    number
    avgDailySeconds: number
    peakHour:        number
    daysWorked:      number
    topCategory:     string | null
  }
}

const EMPTY: AnalyticsData = {
  timeSeries:        [],
  hourlyBreakdown:   Array.from({ length: 24 }, (_, h) => ({ hour: h, totalSeconds: 0 })),
  categoryBreakdown: [],
  productivity: { totalSeconds: 0, avgDailySeconds: 0, peakHour: 9, daysWorked: 0, topCategory: null },
}

const CAPTURE_ID = 'analytics-report-content'

export function ReportsContent() {
  const [period, setPeriod] = useState<Period>('month')
  const [anchor, setAnchor] = useState<Date>(new Date())
  const [data, setData]     = useState<AnalyticsData>(EMPTY)
  const [loading, setLoading] = useState(true)

  const { start, end, label } = getPeriodRange(period, anchor)

  const fetchData = useCallback(async (s: string, e: string) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/analytics?start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`
      )
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(start, end) }, [start, end, fetchData])

  function handlePeriodChange(p: Period) {
    setPeriod(p)
    setAnchor(new Date())
  }

  function handleNavigate(dir: -1 | 1) {
    setAnchor((prev) => navigate(period, prev, dir))
  }

  // PDF ファイル名: project-tracker-report-2026-10 など
  const pdfFilename = `project-tracker-report-${start.slice(0, 7)}`

  return (
    <div className="flex flex-col gap-5">
      {/* 期間セレクター + PDF ボタン（印刷時は非表示） */}
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <PeriodSelector
            period={period}
            anchor={anchor}
            onPeriodChange={handlePeriodChange}
            onNavigate={handleNavigate}
          />
        </div>
        <PDFExportButton targetId={CAPTURE_ID} filename={pdfFilename} />
      </div>

      {/* ── PDF キャプチャ範囲 ── */}
      <div id={CAPTURE_ID} className="flex flex-col gap-5 rounded-xl bg-gray-50 p-2">

        {/* PDF 用レポートヘッダー（スクリーンでは薄く表示） */}
        <div className="rounded-xl border border-gray-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                Project Tracker
              </p>
              <h2 className="mt-0.5 text-lg font-bold text-gray-900">作業時間レポート</h2>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>生成日時</p>
              <p className="font-medium text-gray-600">
                {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {!loading && (
                <p className="mt-1 text-sm font-bold text-gray-700">
                  合計 {formatHHMMSS(data.productivity.totalSeconds)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 生産性指標 */}
        <ProductivityCards
          totalSeconds={data.productivity.totalSeconds}
          avgDailySeconds={data.productivity.avgDailySeconds}
          peakHour={data.productivity.peakHour}
          daysWorked={data.productivity.daysWorked}
          topCategory={data.productivity.topCategory}
          loading={loading}
        />

        {/* グラフ（棒グラフ + 円グラフ） */}
        <div className="grid gap-5 lg:grid-cols-2">
          <BarChartCard
            period={period}
            timeSeries={data.timeSeries}
            hourlyBreakdown={data.hourlyBreakdown}
            loading={loading}
          />
          <PieChartCard
            data={data.categoryBreakdown}
            loading={loading}
          />
        </div>

        {/* ヒートマップ（日次以外で表示） */}
        {period !== 'day' && (
          <ActivityHeatmap
            timeSeries={data.timeSeries}
            start={start}
            end={end}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
