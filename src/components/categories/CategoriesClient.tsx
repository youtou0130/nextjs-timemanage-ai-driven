'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Star, Tag } from 'lucide-react'
import type { CategoryRow } from '@/types/database.types'
import { CategoryFormModal } from './CategoryFormModal'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

export function CategoriesClient() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryRow | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/categories')
    if (res.ok) {
      const data = await res.json()
      setCategories(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  function openCreate() {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  function openEdit(cat: CategoryRow) {
    setEditingCategory(cat)
    setIsFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">カテゴリ管理</h1>
          <p className="mt-1 text-sm text-gray-500">作業を分類するカテゴリを管理します</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          新規作成
        </button>
      </div>

      {/* カテゴリ一覧 */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        /* 空状態 */
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <Tag className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">カテゴリがありません</p>
          <p className="mt-1 text-xs text-gray-400">「新規作成」ボタンから追加してください</p>
          <button
            onClick={openCreate}
            className="mt-5 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            最初のカテゴリを作成
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {/* カラーインジケーター */}
              <div
                className="h-10 w-10 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />

              {/* 名前・お気に入り */}
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-gray-900">
                    {cat.name}
                  </span>
                  {cat.is_favorite && (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                </div>
              </div>

              {/* 操作ボタン */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  title="編集"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeletingCategory(cat)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="削除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* フォームモーダル */}
      {isFormOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setIsFormOpen(false)}
          onSaved={fetchCategories}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deletingCategory && (
        <DeleteConfirmDialog
          category={deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onDeleted={fetchCategories}
        />
      )}
    </div>
  )
}
