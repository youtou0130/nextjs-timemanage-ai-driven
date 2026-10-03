'use client'

import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { TimerWidget } from './TimerWidget'
import { ManualEntryModal } from './ManualEntryModal'

interface Props {
  onSaved?: () => void
}

export function RecordingSection({ onSaved }: Props) {
  const [showManual, setShowManual] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      {/* タイマー */}
      <TimerWidget />

      {/* 手動入力トリガー */}
      <button
        onClick={() => setShowManual(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white py-3 text-sm font-medium text-gray-500 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
      >
        <PenLine className="h-4 w-4" />
        手動で記録を追加
      </button>

      {/* 手動入力モーダル */}
      {showManual && (
        <ManualEntryModal
          onClose={() => setShowManual(false)}
          onSaved={() => {
            setShowManual(false)
            onSaved?.()
          }}
        />
      )}
    </div>
  )
}
