'use client'

import { useState } from 'react'
import { Trash2, CalendarDays, Download, Pencil } from 'lucide-react'
import {
  formatDuration,
  formatTimeRange,
  toLocalDateKey,
  formatDateLabel,
} from '@/lib/time-utils'
import type { TimeEntryRow, CategoryRow } from '@/types/database.types'
import { ExportModal } from './ExportModal'
import { EditEntryModal } from './EditEntryModal'

type EntryWithCategory = TimeEntryRow & {
  categories: Pick<CategoryRow, 'id' | 'name' | 'color'> | null
}

interface Props {
  entries: EntryWithCategory[]
  loading: boolean
  onRefresh: () => void
}

export function RecentEntries({ entries, loading, onRefresh }: Props) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [editingEntry, setEditingEntry] = useState<EntryWithCategory | null>(null)

  // 日付キーでグルーピング（降順）
  const grouped = entries.slice(0, 10).reduce<Record<string, EntryWithCategory[]>>(
    (acc, entry) => {
      const key = toLocalDateKey(entry.start_time)
      ;(acc[key] ??= []).push(entry)
      return acc
    },
    {}
  )
  const dateKeys = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1))

  async function handleDelete(id: string) {
    setDeleting(true)
    const res = await fetch(`/api/time-entries/${id}`, { method: 'DELETE' })
    setDeleting(false)
    setConfirmDeleteId(null)
    if (res.ok) onRefresh()
  }

  return (
    <div className="rounded-2xl border border-gray-300 bg-white shadow-md">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">直近の作業履歴</h2>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
        >
          <Download className="h-3.5 w-3.5" />
          CSVエクスポート
        </button>
      </div>

      {/* エクスポートモーダル */}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}

      {/* 編集モーダル */}
      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={() => { setEditingEntry(null); onRefresh() }}
        />
      )}

      {/* ローディング */}
      {loading && (
        <div className="space-y-3 p-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      )}

      {/* 空状態 */}
      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarDays className="h-8 w-8 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-gray-600">作業記録がありません</p>
          <p className="mt-1 text-xs text-gray-500">
            タイマーまたは手動入力で記録を始めましょう
          </p>
        </div>
      )}

      {/* 履歴一覧（日付グルーピング） */}
      {!loading && dateKeys.length > 0 && (
        <div className="divide-y divide-gray-100">
          {dateKeys.map((dateKey) => (
            <div key={dateKey}>
              {/* 日付ヘッダー */}
              <div className="bg-gray-50 px-5 py-2">
                <span className="text-xs font-semibold text-gray-500">
                  {formatDateLabel(dateKey)}
                </span>
              </div>

              {/* その日のエントリ */}
              {grouped[dateKey].map((entry) => {
                const cat = entry.categories
                const isConfirming = confirmDeleteId === entry.id

                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
                  >
                    {/* カテゴリカラー */}
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cat?.color ?? '#6b7280' }}
                    />

                    {/* メイン情報 */}
                    <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {cat?.name ?? '不明なカテゴリ'}
                        </span>
                        {entry.duration != null && (
                          <span className="shrink-0 rounded-md border border-blue-300 bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                            {formatDuration(entry.duration)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{formatTimeRange(entry.start_time, entry.end_time)}</span>
                        {entry.memo && (
                          <>
                            <span>·</span>
                            <span className="truncate">{entry.memo}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="shrink-0">
                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleting}
                            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-700 disabled:opacity-50"
                          >
                            削除
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-50"
                          >
                            戻る
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="rounded-lg p-1.5 text-gray-300 transition-all duration-200 hover:bg-blue-50 hover:text-blue-500"
                            title="編集"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(entry.id)}
                            className="rounded-lg p-1.5 text-gray-300 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                            title="削除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
