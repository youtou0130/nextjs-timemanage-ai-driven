export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          timezone: string
          week_start_day: 'monday' | 'sunday'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          timezone?: string
          week_start_day?: 'monday' | 'sunday'
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          timezone?: string
          week_start_day?: 'monday' | 'sunday'
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          color?: string
          is_favorite?: boolean
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          category_id: string
          start_time: string
          end_time: string | null
          duration: number | null
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          start_time: string
          end_time?: string | null
          duration?: number | null
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          start_time?: string
          end_time?: string | null
          duration?: number | null
          memo?: string | null
          updated_at?: string
        }
      }
    }
    Functions: {
      get_clerk_user_id: {
        Args: Record<string, never>
        Returns: string | null
      }
    }
  }
}

// テーブルの Row 型を便利エイリアスとして公開
export type UserRow      = Database['public']['Tables']['users']['Row']
export type CategoryRow  = Database['public']['Tables']['categories']['Row']
export type TimeEntryRow = Database['public']['Tables']['time_entries']['Row']
