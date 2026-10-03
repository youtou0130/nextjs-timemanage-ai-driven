-- ──────────────────────────────────────────────────────────────────────────
-- users テーブル（Clerk ユーザー連携・ユーザー設定）
-- Clerk の userId は "user_xxxx" 形式の TEXT なので UUID は使わない
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             TEXT        PRIMARY KEY,                      -- Clerk user ID
  email          TEXT        NOT NULL UNIQUE,
  timezone       TEXT        NOT NULL DEFAULT 'Asia/Tokyo',
  week_start_day TEXT        NOT NULL DEFAULT 'monday'
                             CHECK (week_start_day IN ('monday', 'sunday')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────
-- categories テーブル（カテゴリ管理）
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  color       TEXT        NOT NULL DEFAULT '#6366f1',
  is_favorite BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────
-- time_entries テーブル（作業時間記録）
-- duration は秒単位で保存（NULL = タイマー実行中 or 手動終了前）
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS time_entries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ,
  duration    INTEGER,    -- 秒単位
  memo        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────────────
-- インデックス
-- ──────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_categories_user_id
  ON categories(user_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_user_id
  ON time_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_category_id
  ON time_entries(category_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_start_time
  ON time_entries(start_time DESC);

-- ──────────────────────────────────────────────────────────────────────────
-- updated_at 自動更新トリガー
-- ──────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────────────────────
-- Clerk ユーザー ID 取得関数（カスタムヘッダー方式 RLS 用）
-- API Route で x-clerk-user-id ヘッダーを付与して呼び出す
-- ──────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('request.headers', true)::json->>'x-clerk-user-id';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────────────────────────────
-- Row Level Security 有効化
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────────────────
-- users RLS ポリシー
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (
    id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (
    id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (
    id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ──────────────────────────────────────────────────────────────────────────
-- categories RLS ポリシー
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "categories_select_own"
  ON categories FOR SELECT
  USING (
    user_id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "categories_insert_own"
  ON categories FOR INSERT
  WITH CHECK (
    user_id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "categories_update_own"
  ON categories FOR UPDATE
  USING (
    user_id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "categories_delete_own"
  ON categories FOR DELETE
  USING (
    user_id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ──────────────────────────────────────────────────────────────────────────
-- time_entries RLS ポリシー
-- ──────────────────────────────────────────────────────────────────────────
CREATE POLICY "time_entries_select_own"
  ON time_entries FOR SELECT
  USING (
    user_id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "time_entries_insert_own"
  ON time_entries FOR INSERT
  WITH CHECK (
    user_id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "time_entries_update_own"
  ON time_entries FOR UPDATE
  USING (
    user_id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE POLICY "time_entries_delete_own"
  ON time_entries FOR DELETE
  USING (
    user_id = get_clerk_user_id()
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ──────────────────────────────────────────────────────────────────────────
-- テーブルアクセス権限付与
-- SQL Editorでテーブルを作成した場合、明示的なGRANTが必要
-- ──────────────────────────────────────────────────────────────────────────
GRANT ALL ON TABLE public.users        TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.categories   TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.time_entries TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
