'use client'

import { useState } from 'react'
import { X, Download } from 'lucide-react'

interface Props {
  onClose: () => void
}

type Preset = 'week' | 'month' | 'last_month' | 'all' | 'custom'

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getPresetRange(preset: Preset): { start: string; end: string } | null {
  const today = new Date()
  const todayStr = toDateStr(today)

  if (preset === 'week') {
    const day = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
    return { start: toDateStr(monday), end: todayStr }
  }
  if (preset === 'month') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    return { start: toDateStr(first), end: todayStr }
  }
  if (preset === 'last_month') {
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const last  = new Date(today.getFullYear(), today.getMonth(), 0)
    return { start: toDateStr(first), end: toDateStr(last) }
  }
  if (preset === 'all') {
    return null  // フィルタなし
  }
  return null  // custom は呼び出し元で制御
}

const PRESETS: { value: Preset; label: string }[] = [
  { value: 'week',       label: '今週' },
  { value: 'month',      label: '今月' },
  { value: 'last_month', label: '先月' },
  { value: 'all',        label: '全期間' },
  { value: 'custom',     label: 'カスタム' },
]

export function ExportModal({ onClose }: Props) {
  const [preset, setPreset] = useState<Preset>('month')
  const [customStart, setCustomStart] = useState(
    toDateStr(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  )
  const [customEnd, setCustomEnd] = useState(toDateStr(new Date()))
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  async function handleExport() {
    setDownloading(true)
    setError('')

    let range: { start: string; end: string } | null

    if (preset === 'custom') {
      if (!customStart || !customEnd) {
        setError('開始日と終了日を入力してください')
        setDownloading(false)
        return
      }
      if (customStart > customEnd) {
        setError('終了日は開始日以降にしてください')
        setDownloading(false)
        return
      }
      range = { start: customStart, end: customEnd }
    } else {
      range = getPresetRange(preset)
    }

    const params = new URLSearchParams()
    if (range) {
      params.set('start', range.start)
      params.set('end', range.end)
    }

    try {
      const res = await fetch(`/api/export/csv?${params.toString()}`)
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.detail ?? json.error ?? 'エクスポートに失敗しました')
      }

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url

      // Content-Disposition からファイル名を取得、なければデフォルト
      const cd = res.headers.get('Content-Disposition') ?? ''
      const match = cd.match(/filename\*=UTF-8''(.+)/)
      a.download = match ? decodeURIComponent(match[1]) : 'export.csv'

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エクスポートに失敗しました')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">CSVエクスポート</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {/* 期間選択 */}
          <div>
            <label className="block text-xs font-medium text-gray-600">エクスポート期間</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPreset(p.value)}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                    preset === p.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* カスタム期間 */}
          {preset === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">開始日</label>
                <input
                  type="date"
                  value={customStart}
                  max={customEnd || toDateStr(new Date())}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">終了日</label>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  max={toDateStr(new Date())}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* 説明 */}
          <p className="text-xs text-gray-400">
            日付・開始終了時刻・作業時間・カテゴリ・メモを含む CSV ファイルをダウンロードします。
            Excel で開く場合も文字化けしません。
          </p>

          {/* エラー */}
          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* ボタン */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={downloading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'ダウンロード中...' : 'CSVダウンロード'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
