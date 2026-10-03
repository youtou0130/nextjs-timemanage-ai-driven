'use client'

import { useState, useEffect } from 'react'
import { X, Clock, Timer } from 'lucide-react'
import type { CategoryRow } from '@/types/database.types'

interface Props {
  onClose: () => void
  onSaved: () => void
}

type InputMode = 'timerange' | 'duration'

function toISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function nowTimeStr(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function ManualEntryModal({ onClose, onSaved }: Props) {
  const [mode, setMode] = useState<InputMode>('timerange')
  const [date, setDate] = useState(todayStr())
  const [startTime, setStartTime] = useState(nowTimeStr())
  const [endTime, setEndTime] = useState('')
  const [durationHours, setDurationHours] = useState(0)
  const [durationMins, setDurationMins] = useState(30)
  const [categoryId, setCategoryId] = useState('')
  const [memo, setMemo] = useState('')
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: CategoryRow[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  function validate(): string {
    if (!categoryId) return 'カテゴリを選択してください'
    if (!date) return '日付を入力してください'
    if (!startTime) return '開始時刻を入力してください'

    if (mode === 'timerange') {
      if (!endTime) return '終了時刻を入力してください'
      const start = new Date(`${date}T${startTime}:00`)
      const end = new Date(`${date}T${endTime}:00`)
      if (end <= start) return '終了時刻は開始時刻より後にしてください'
    } else {
      if (durationHours === 0 && durationMins === 0)
        return '作業時間は1分以上入力してください'
    }
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    let start_time: string
    let end_time: string
    let duration: number

    if (mode === 'timerange') {
      start_time = toISO(date, startTime)
      end_time = toISO(date, endTime)
      duration = Math.floor((new Date(end_time).getTime() - new Date(start_time).getTime()) / 1000)
    } else {
      start_time = toISO(date, startTime)
      duration = durationHours * 3600 + durationMins * 60
      end_time = new Date(new Date(start_time).getTime() + duration * 1000).toISOString()
    }

    const res = await fetch('/api/time-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: categoryId,
        start_time,
        end_time,
        duration,
        memo: memo.trim() || null,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const json = await res.json()
      setError(json.detail ?? json.error ?? '保存に失敗しました')
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">手動で記録</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* 入力モード切替 */}
          <div className="flex rounded-xl border border-gray-200 p-1">
            <button
              type="button"
              onClick={() => setMode('timerange')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === 'timerange'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="h-4 w-4" />
              時刻指定
            </button>
            <button
              type="button"
              onClick={() => setMode('duration')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === 'duration'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Timer className="h-4 w-4" />
              時間入力
            </button>
          </div>

          {/* 日付 */}
          <div>
            <label className="block text-xs font-medium text-gray-600">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={todayStr()}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* 開始時刻 */}
          <div>
            <label className="block text-xs font-medium text-gray-600">開始時刻</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* 終了時刻（時刻指定モード） */}
          {mode === 'timerange' && (
            <div>
              <label className="block text-xs font-medium text-gray-600">終了時刻</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* 作業時間（時間入力モード） */}
          {mode === 'duration' && (
            <div>
              <label className="block text-xs font-medium text-gray-600">作業時間</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.max(0, Math.min(23, Number(e.target.value))))}
                  min={0}
                  max={23}
                  className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-500">時間</span>
                <input
                  type="number"
                  value={durationMins}
                  onChange={(e) => setDurationMins(Math.max(0, Math.min(59, Number(e.target.value))))}
                  min={0}
                  max={59}
                  className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-500">分</span>
              </div>
            </div>
          )}

          {/* カテゴリ */}
          <div>
            <label className="block text-xs font-medium text-gray-600">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setError('') }}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">カテゴリを選択...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-xs font-medium text-gray-600">メモ（任意）</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="作業内容など..."
              maxLength={200}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* エラー */}
          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '記録を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
