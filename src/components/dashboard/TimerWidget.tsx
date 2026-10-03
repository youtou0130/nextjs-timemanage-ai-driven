'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, Square, ChevronDown } from 'lucide-react'
import {
  useTimer,
  getElapsedSeconds,
  formatTime,
} from '@/contexts/TimerContext'
import type { CategoryRow } from '@/types/database.types'

export function TimerWidget() {
  const { state, dispatch } = useTimer()
  const [elapsed, setElapsed] = useState(0)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    state.categoryId ?? ''
  )
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // カテゴリ一覧取得
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: CategoryRow[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // 1秒ごとに経過時間を更新
  useEffect(() => {
    setElapsed(getElapsedSeconds(state))
    if (state.status !== 'running') return
    const id = setInterval(() => setElapsed(getElapsedSeconds(state)), 1000)
    return () => clearInterval(id)
  }, [state])

  // 起動中カテゴリを選択欄に反映
  useEffect(() => {
    if (state.categoryId) setSelectedCategoryId(state.categoryId)
  }, [state.categoryId])

  const handleStart = useCallback(() => {
    if (!selectedCategoryId) { setError('カテゴリを選択してください'); return }
    setError('')
    dispatch({ type: 'START', categoryId: selectedCategoryId, now: new Date().toISOString() })
  }, [selectedCategoryId, dispatch])

  const handlePause = useCallback(() => {
    dispatch({ type: 'PAUSE', now: new Date().toISOString() })
  }, [dispatch])

  const handleResume = useCallback(() => {
    dispatch({ type: 'RESUME', now: new Date().toISOString() })
  }, [dispatch])

  const handleStop = useCallback(async () => {
    if (state.status === 'idle') return
    setSaving(true)
    setError('')

    const now = new Date().toISOString()
    // 停止時点での最終経過秒数を計算
    const finalSeconds = getElapsedSeconds(
      state.status === 'running'
        ? { ...state, status: 'running' }
        : state
    )

    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: state.categoryId,
          start_time: state.sessionStartTime,
          end_time: now,
          duration: finalSeconds,
          memo: memo.trim() || null,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.detail ?? json.error ?? '保存に失敗しました')
      }

      dispatch({ type: 'RESET' })
      setMemo('')
      setSelectedCategoryId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }, [state, memo, dispatch])

  const selectedCategory = categories.find((c) => c.id === (state.categoryId ?? selectedCategoryId))

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">タイマー</h2>

      {/* 時間表示 */}
      <div className="my-6 flex flex-col items-center">
        <span
          className={`font-mono text-6xl font-bold tabular-nums tracking-tight ${
            state.status === 'running' ? 'text-indigo-600' : 'text-gray-900'
          }`}
        >
          {formatTime(elapsed)}
        </span>
        {state.status !== 'idle' && selectedCategory && (
          <span
            className="mt-3 flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: selectedCategory.color }}
          >
            {selectedCategory.name}
          </span>
        )}
      </div>

      {/* カテゴリ選択（idle 時のみ） */}
      {state.status === 'idle' && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <select
              value={selectedCategoryId}
              onChange={(e) => { setSelectedCategoryId(e.target.value); setError('') }}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">カテゴリを選択...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}

      {/* メモ（idle 以外でも入力可） */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500">
          メモ（任意）
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="作業内容などを記録..."
          maxLength={200}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* エラー */}
      {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

      {/* 操作ボタン */}
      <div className="flex items-center justify-center gap-3">
        {state.status === 'idle' && (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Play className="h-4 w-4 fill-white" />
            開始
          </button>
        )}

        {state.status === 'running' && (
          <>
            <button
              onClick={handlePause}
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Pause className="h-4 w-4" />
              一時停止
            </button>
            <button
              onClick={handleStop}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              <Square className="h-4 w-4 fill-white" />
              {saving ? '保存中...' : '停止して保存'}
            </button>
          </>
        )}

        {state.status === 'paused' && (
          <>
            <button
              onClick={handleResume}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Play className="h-4 w-4 fill-white" />
              再開
            </button>
            <button
              onClick={handleStop}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              <Square className="h-4 w-4 fill-white" />
              {saving ? '保存中...' : '停止して保存'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
