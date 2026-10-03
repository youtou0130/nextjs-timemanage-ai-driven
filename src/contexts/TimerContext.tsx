'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type Dispatch,
} from 'react'

// ── 状態定義 ──────────────────────────────────────────────────
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerState {
  status: TimerStatus
  categoryId: string | null
  sessionStartTime: string | null   // セッション全体の開始時刻（DB保存用）
  segmentStartTime: string | null   // 現在の計測セグメント開始時刻
  accumulatedSeconds: number        // 完了済みセグメントの合計秒数
}

const INITIAL: TimerState = {
  status: 'idle',
  categoryId: null,
  sessionStartTime: null,
  segmentStartTime: null,
  accumulatedSeconds: 0,
}

const STORAGE_KEY = 'project_tracker_timer'

// ── アクション ────────────────────────────────────────────────
type Action =
  | { type: 'START'; categoryId: string; now: string }
  | { type: 'PAUSE'; now: string }
  | { type: 'RESUME'; now: string }
  | { type: 'RESET' }

function reducer(state: TimerState, action: Action): TimerState {
  switch (action.type) {
    case 'START':
      return {
        status: 'running',
        categoryId: action.categoryId,
        sessionStartTime: action.now,
        segmentStartTime: action.now,
        accumulatedSeconds: 0,
      }
    case 'PAUSE': {
      const segSec = state.segmentStartTime
        ? Math.floor((Date.parse(action.now) - Date.parse(state.segmentStartTime)) / 1000)
        : 0
      return {
        ...state,
        status: 'paused',
        segmentStartTime: null,
        accumulatedSeconds: state.accumulatedSeconds + segSec,
      }
    }
    case 'RESUME':
      return { ...state, status: 'running', segmentStartTime: action.now }
    case 'RESET':
      return INITIAL
    default:
      return state
  }
}

// ── 経過秒数の計算 ────────────────────────────────────────────
export function getElapsedSeconds(state: TimerState): number {
  if (state.status === 'idle') return 0
  const segSec =
    state.status === 'running' && state.segmentStartTime
      ? Math.floor((Date.now() - Date.parse(state.segmentStartTime)) / 1000)
      : 0
  return state.accumulatedSeconds + segSec
}

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

// ── Context ──────────────────────────────────────────────────
interface TimerContextValue {
  state: TimerState
  dispatch: Dispatch<Action>
}

const TimerContext = createContext<TimerContextValue | null>(null)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL, (init) => {
    if (typeof window === 'undefined') return init
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? (JSON.parse(saved) as TimerState) : init
    } catch {
      return init
    }
  })

  // 状態変化を localStorage に永続化（ページ遷移後も継続）
  useEffect(() => {
    if (state.status === 'idle') {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state])

  return (
    <TimerContext.Provider value={{ state, dispatch }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimer must be used within TimerProvider')
  return ctx
}
