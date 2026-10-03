'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { CategoryRow } from '@/types/database.types'

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#14b8a6', '#3b82f6', '#6366f1',
  '#a855f7', '#ec4899', '#6b7280', '#0f172a',
]

interface Props {
  category?: CategoryRow | null
  onClose: () => void
  onSaved: () => void
}

export function CategoryFormModal({ category, onClose, onSaved }: Props) {
  const [name, setName] = useState(category?.name ?? '')
  const [color, setColor] = useState(category?.color ?? '#6366f1')
  const [isFavorite, setIsFavorite] = useState(category?.is_favorite ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setName(category?.name ?? '')
    setColor(category?.color ?? '#6366f1')
    setIsFavorite(category?.is_favorite ?? false)
    setError('')
  }, [category])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('カテゴリ名を入力してください'); return }

    setLoading(true)
    setError('')

    const url = category ? `/api/categories/${category.id}` : '/api/categories'
    const method = category ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), color, is_favorite: isFavorite }),
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
          <h2 className="text-lg font-semibold text-gray-900">
            {category ? 'カテゴリを編集' : '新しいカテゴリを作成'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {/* カテゴリ名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              カテゴリ名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="例：開発作業"
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* カラー選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">カラー</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* お気に入り */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
            />
            <span className="text-sm text-gray-700">お気に入りに登録</span>
          </label>

          {/* エラー */}
          {error && <p className="text-sm text-red-500">{error}</p>}

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
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
