import { NextResponse } from 'next/server'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-auth'

type Params = Promise<{ id: string }>

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params
    const { supabase, userId } = await createAuthenticatedSupabaseClient()

    const body = await request.json()
    const category_id: string = body.category_id
    const start_time: string = body.start_time
    const end_time: string | null = body.end_time ?? null
    const duration: number | null = body.duration ?? null
    const memo: string | null = body.memo ?? null

    if (!category_id)
      return NextResponse.json({ error: 'カテゴリは必須です' }, { status: 400 })

    const { data, error } = await supabase
      .from('time_entries')
      .update({ category_id, start_time, end_time, duration, memo })
      .eq('id', id)
      .eq('user_id', userId)
      .select(`*, categories(id, name, color)`)
      .single()

    if (error) {
      console.error('[PUT /api/time-entries/[id]]', error)
      throw error
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to update time entry', detail: msg }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params
    const { supabase, userId } = await createAuthenticatedSupabaseClient()

    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('[DELETE /api/time-entries/[id]]', error)
      throw error
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to delete time entry', detail: msg }, { status: 500 })
  }
}
