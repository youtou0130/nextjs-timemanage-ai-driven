import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-auth'

/**
 * 初回アクセス時に users テーブルへユーザーを登録。
 * anon キー + x-clerk-user-id ヘッダーを使用。
 * RLS ポリシー "users_insert_own" が id = get_clerk_user_id() を許可する。
 */
async function ensureUser(
  supabase: Awaited<ReturnType<typeof createAuthenticatedSupabaseClient>>['supabase'],
  userId: string
) {
  const user = await currentUser()
  if (!user) throw new Error('Unauthorized')

  const email =
    user.primaryEmailAddress?.emailAddress ?? `${userId}@clerk.placeholder`

  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, email }, { onConflict: 'id' })

  if (error) {
    console.error('[ensureUser] Supabase error:', error)
    throw new Error(`Failed to ensure user record: ${error.message}`)
  }
}

export async function GET() {
  try {
    const { supabase, userId } = await createAuthenticatedSupabaseClient()
    await ensureUser(supabase, userId)

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[GET /api/categories]', error)
      throw error
    }
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch categories', detail: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, userId } = await createAuthenticatedSupabaseClient()
    await ensureUser(supabase, userId)

    const body = await request.json()
    const name: string = body.name
    const color: string = body.color ?? '#6366f1'
    const is_favorite: boolean = body.is_favorite ?? false

    if (!name?.trim())
      return NextResponse.json({ error: 'カテゴリ名は必須です' }, { status: 400 })

    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name: name.trim(), color, is_favorite })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/categories]', error)
      throw error
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create category', detail: msg }, { status: 500 })
  }
}
