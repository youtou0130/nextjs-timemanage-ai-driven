'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { TimeEntryRow, CategoryRow } from '@/types/database.types'

type EntryWithCategory = TimeEntryRow & {
  categories: Pick<CategoryRow, 'id' | 'name' | 'color'> | null
}

interface Props {
  entry: EntryWithCategory
  onClose: () => void
  onSaved: () => void
}

function parseLocalDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return { date, time }
}

function toISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function EditEntryModal({ entry, onClose, onSaved }: Props) {
  const parsed = parseLocalDateTime(entry.start_time)
  const [date, setDate] = useState(parsed.date)
  const [startTime, setStartTime] = useState(parsed.time)
  const [endTime, setEndTime] = useState(
    entry.end_time ? parseLocalDateTime(entry.end_time).time : ''
  )
  const [categoryId, setCategoryId] = useState(entry.category_id ?? '')
  const [memo, setMemo] = useState(entry.memo ?? '')
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
    if (!endTime) return '終了時刻を入力してください'
    const start = new Date(`${date}T${startTime}:00`)
    const end = new Date(`${date}T${endTime}:00`)
    if (end <= start) return '終了時刻は開始時刻より後にしてください'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    const start_time = toISO(date, startTime)
    const end_time = toISO(date, endTime)
    const duration = Math.floor(
      (new Date(end_time).getTime() - new Date(start_time).getTime()) / 1000
    )

    const res = await fetch(`/api/time-entries/${entry.id}`, {
      method: 'PUT',
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
      setError(json.detail ?? json.error ?? '更新に失敗しました')
      return
    }

    onSaved()
    onClose()
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">記録を編集</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* 日付 */}
          <div>
            <label className="block text-xs font-medium text-gray-600">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* 開始・終了時刻 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">開始時刻</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">終了時刻</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-xs font-medium text-gray-600">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setError('') }}
              className={inputCls}
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
              className={inputCls}
            />
          </div>

          {/* エラー */}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-2 border-blue-700 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-all duration-200 hover:bg-blue-50 hover:shadow-md"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '保存中...' : '変更を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
