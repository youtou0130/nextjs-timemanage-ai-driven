import { NextResponse } from 'next/server'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-auth'
import { ensureUser } from '@/lib/ensure-user'

export async function GET(request: Request) {
  try {
    const { supabase, userId } = await createAuthenticatedSupabaseClient()
    await ensureUser(supabase, userId)

    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')          // ISO string
    const limit = Number(searchParams.get('limit')) || 100

    let query = supabase
      .from('time_entries')
      .select(`*, categories(id, name, color)`)
      .order('start_time', { ascending: false })
      .limit(limit)

    if (since) query = query.gte('start_time', since)

    const { data, error } = await query

    if (error) {
      console.error('[GET /api/time-entries]', error)
      throw error
    }
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch time entries', detail: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, userId } = await createAuthenticatedSupabaseClient()
    await ensureUser(supabase, userId)

    const body = await request.json()
    const category_id: string = body.category_id
    const start_time: string = body.start_time
    const end_time: string | null = body.end_time ?? null
    const duration: number | null = body.duration ?? null
    const memo: string | null = body.memo ?? null

    if (!category_id)
      return NextResponse.json({ error: 'カテゴリは必須です' }, { status: 400 })
    if (!start_time)
      return NextResponse.json({ error: '開始時刻は必須です' }, { status: 400 })

    const { data, error } = await supabase
      .from('time_entries')
      .insert({ user_id: userId, category_id, start_time, end_time, duration, memo })
      .select(`*, categories(id, name, color)`)
      .single()

    if (error) {
      console.error('[POST /api/time-entries]', error)
      throw error
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create time entry', detail: msg }, { status: 500 })
  }
}
