import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * カスタムヘッダー方式で Clerk userId を Supabase に渡す認証済みクライアント。
 * API Route (サーバーサイド) でのみ使用する。
 * RLS ポリシーは get_clerk_user_id() 関数で x-clerk-user-id ヘッダーを参照する。
 */
export async function createAuthenticatedSupabaseClient() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-clerk-user-id': userId,
      },
    },
  })

  return { supabase, userId }
}
