'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { CategoryRow } from '@/types/database.types'

interface Props {
  category: CategoryRow
  onClose: () => void
  onDeleted: () => void
}

export function DeleteConfirmDialog({ category, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) {
      onDeleted()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">カテゴリを削除</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              <span className="font-medium">「{category.name}」</span>
              を削除しますか？この操作は取り消せません。
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  )
}
