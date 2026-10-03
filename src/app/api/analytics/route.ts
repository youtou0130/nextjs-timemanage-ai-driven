import { NextResponse } from 'next/server'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-auth'
import { toLocalDateKey } from '@/lib/time-utils'

type RawEntry = {
  start_time: string
  duration: number | null
  categories: { id: string; name: string; color: string } | null
}

export async function GET(request: Request) {
  try {
    const { supabase } = await createAuthenticatedSupabaseClient()
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end   = searchParams.get('end')

    let query = supabase
      .from('time_entries')
      .select('start_time, duration, categories(id, name, color)')
      .order('start_time', { ascending: true })
      .limit(5000)

    if (start) query = query.gte('start_time', `${start}T00:00:00`)
    if (end)   query = query.lte('start_time', `${end}T23:59:59`)

    const { data, error } = await query
    if (error) throw error

    const entries = (data ?? []) as unknown as RawEntry[]

    // 集計用マップ
    const dateMap   = new Map<string, number>()      // YYYY-MM-DD → 秒
    const hourMap   = new Map<number, number>()       // 0-23 → 秒
    const catMap    = new Map<string, { id: string; name: string; color: string; totalSeconds: number }>()
    let totalSeconds = 0

    for (const e of entries) {
      if (!e.duration) continue

      // 日別
      const dk = toLocalDateKey(e.start_time)
      dateMap.set(dk, (dateMap.get(dk) ?? 0) + e.duration)

      // 時間帯別
      const hr = new Date(e.start_time).getHours()
      hourMap.set(hr, (hourMap.get(hr) ?? 0) + e.duration)

      // カテゴリ別
      const cat = e.categories
      if (cat) {
        const existing = catMap.get(cat.id) ?? { ...cat, totalSeconds: 0 }
        existing.totalSeconds += e.duration
        catMap.set(cat.id, existing)
      }

      totalSeconds += e.duration
    }

    // 日別時系列（昇順）
    const timeSeries = Array.from(dateMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, secs]) => ({ date, totalSeconds: secs }))

    // 時間帯別（0-23 全時間帯を返す）
    const hourlyBreakdown = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      totalSeconds: hourMap.get(h) ?? 0,
    }))

    // カテゴリ別（降順）
    const categoryBreakdown = Array.from(catMap.values())
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
      .map((c) => ({
        ...c,
        percentage: totalSeconds > 0 ? Math.round((c.totalSeconds / totalSeconds) * 100) : 0,
      }))

    // 生産性指標
    const daysWorked = dateMap.size
    let peakHour = 0, peakHourSecs = 0
    for (const [h, s] of hourMap.entries()) {
      if (s > peakHourSecs) { peakHour = h; peakHourSecs = s }
    }

    return NextResponse.json({
      timeSeries,
      hourlyBreakdown,
      categoryBreakdown,
      productivity: {
        totalSeconds,
        avgDailySeconds: daysWorked > 0 ? Math.round(totalSeconds / daysWorked) : 0,
        peakHour,
        daysWorked,
        topCategory: categoryBreakdown[0]?.name ?? null,
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch analytics', detail: msg }, { status: 500 })
  }
}
