// ── 表示フォーマット ──────────────────────────────────────────

/** 秒数を "1時間30分" 形式に変換 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}時間${m}分`
  if (h > 0) return `${h}時間`
  if (m > 0) return `${m}分`
  return '1分未満'
}

/** 秒数を "H:MM:SS" 形式に変換（統計カード用） */
export function formatHHMMSS(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** ISO 文字列を "09:30" 形式に変換 */
export function formatLocalTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 開始〜終了の時刻範囲を "09:30 〜 11:00" 形式で返す */
export function formatTimeRange(startISO: string, endISO: string | null): string {
  const start = formatLocalTime(startISO)
  if (!endISO) return `${start} 〜`
  return `${start} 〜 ${formatLocalTime(endISO)}`
}

// ── 日付キー操作 ──────────────────────────────────────────────

/** ISO 文字列をローカル "YYYY-MM-DD" キーに変換（グルーピング用） */
export function toLocalDateKey(iso: string): string {
  const d = new Date(iso)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/** "YYYY-MM-DD" キーを "今日" / "昨日" / "10月3日（金）" に変換 */
export function formatDateLabel(dateKey: string): string {
  const todayKey = toLocalDateKey(new Date().toISOString())
  const yesterdayKey = toLocalDateKey(
    new Date(Date.now() - 86_400_000).toISOString()
  )
  if (dateKey === todayKey) return '今日'
  if (dateKey === yesterdayKey) return '昨日'

  const [y, mo, d] = dateKey.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

// ── 統計計算 ──────────────────────────────────────────────────

function startOfDay(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function startOfWeek(): number {
  const d = new Date()
  const day = d.getDay()           // 0=Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))  // 月曜始まり
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function startOfMonth(): number {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export interface DashboardStats {
  todaySeconds: number
  weekSeconds: number
  monthSeconds: number
}

export function calcStats(
  entries: Array<{ start_time: string; duration: number | null }>
): DashboardStats {
  const todayMs  = startOfDay()
  const weekMs   = startOfWeek()
  const monthMs  = startOfMonth()

  let todaySeconds = 0
  let weekSeconds  = 0
  let monthSeconds = 0

  for (const e of entries) {
    if (!e.duration) continue
    const t = new Date(e.start_time).getTime()
    if (t >= monthMs) {
      monthSeconds += e.duration
      if (t >= weekMs)  weekSeconds  += e.duration
      if (t >= todayMs) todaySeconds += e.duration
    }
  }

  return { todaySeconds, weekSeconds, monthSeconds }
}
