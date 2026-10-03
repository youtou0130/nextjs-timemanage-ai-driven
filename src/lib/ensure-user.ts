import { currentUser } from '@clerk/nextjs/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * 初回 API アクセス時に users テーブルへユーザーを登録する共通ユーティリティ。
 * Clerk Webhook 不使用 → 各 API Route の先頭で呼び出す。
 * anon キー + x-clerk-user-id ヘッダーを使用（GRANT が必要）。
 */
export async function ensureUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
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
