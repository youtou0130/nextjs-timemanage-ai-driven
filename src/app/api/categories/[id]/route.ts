import { NextResponse } from 'next/server'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-auth'

type Params = Promise<{ id: string }>

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params
    const { supabase, userId } = await createAuthenticatedSupabaseClient()

    const body = await request.json()
    const name: string = body.name
    const color: string = body.color
    const is_favorite: boolean = body.is_favorite

    if (!name?.trim())
      return NextResponse.json({ error: 'カテゴリ名は必須です' }, { status: 400 })

    const { data, error } = await supabase
      .from('categories')
      .update({ name: name.trim(), color, is_favorite })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[PUT /api/categories/[id]] Supabase error:', error)
      throw error
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to update category', detail: msg }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params
    const { supabase, userId } = await createAuthenticatedSupabaseClient()

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('[DELETE /api/categories/[id]] Supabase error:', error)
      throw error
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to delete category', detail: msg }, { status: 500 })
  }
}
