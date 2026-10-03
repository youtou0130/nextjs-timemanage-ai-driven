# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクトの目的

**Project Tracker** — タイマー計測・手動入力・カテゴリ管理でシンプルに作業時間を記録・分析する Next.js タイム管理アプリ。

## コマンド

```bash
npm run dev      # 開発サーバー (http://localhost:3000)
npm run build    # 本番ビルド
npm run lint     # ESLint 実行
npx tsc --noEmit # 型チェックのみ（テストの代わりに使用）
```

マイグレーション（Supabase CLI でリンク済みの場合）:
```bash
npx supabase migration new <name>   # 新規マイグレーション作成
npx supabase db push                # クラウドへ適用
```

テストランナーは未設定。

## スタック

- **Next.js 16.3.6** — App Router (`src/app/`)、`src/middleware.ts` が必須位置
- **React 19** / **TypeScript** strict モード
- **Tailwind CSS v4** — `@import "tailwindcss"` 構文、`tailwind.config.js` は不要
- **Clerk v7（Core 3）** — `@clerk/nextjs ^7`
- **Supabase** — `@supabase/supabase-js ^2`、クラウドベース（Docker 不使用）
- **lucide-react** — アイコン

## アーキテクチャ概観

```
src/
├── app/
│   ├── layout.tsx           # ルートレイアウト（Providers + Header をラップ）
│   ├── providers.tsx        # ClerkProvider + TimerProvider
│   ├── middleware.ts        # Clerk 認証ミドルウェア（← src/ 直下が必須）
│   ├── page.tsx             # ランディングページ (/)
│   ├── sign-in/[[...sign-in]]/
│   ├── sign-up/[[...sign-up]]/
│   ├── dashboard/
│   │   ├── layout.tsx       # Sidebar を含む 2 カラムレイアウト
│   │   └── page.tsx         # Server Component → DashboardContent に displayName を渡す
│   ├── categories/
│   │   ├── layout.tsx       # Sidebar を含む 2 カラムレイアウト
│   │   └── page.tsx
│   └── api/
│       ├── categories/route.ts           # GET(?), POST
│       ├── categories/[id]/route.ts      # PUT, DELETE
│       ├── time-entries/route.ts         # GET(?since&limit), POST
│       ├── time-entries/[id]/route.ts    # PUT, DELETE
│       └── export/csv/route.ts           # GET(?start&end) → CSV ダウンロード
├── components/
│   ├── Header.tsx            # 全ページ共通（useAuth で認証状態判定）
│   ├── Sidebar.tsx           # アプリ内ナビ（dashboard/categories/reports/user-setting）
│   ├── UserMenu.tsx          # ヘッダー用ユーザーメニュー
│   ├── categories/           # CategoriesClient, CategoryFormModal, DeleteConfirmDialog
│   └── dashboard/
│       ├── DashboardContent.tsx  # データ取得の統合クライアント（refreshKey パターン）
│       ├── RecordingSection.tsx  # TimerWidget + 手動入力ボタンをまとめる
│       ├── TimerWidget.tsx       # タイマー UI（TimerContext を消費）
│       ├── ManualEntryModal.tsx  # 手動入力モーダル（時刻指定 / 時間入力の 2 モード）
│       ├── RecentEntries.tsx     # 日付グルーピング履歴・インライン削除・CSVエクスポートボタン
│       └── ExportModal.tsx       # CSV エクスポート期間選択モーダル
├── contexts/
│   └── TimerContext.tsx      # グローバルタイマー状態（localStorage で永続化）
├── lib/
│   ├── supabase.ts           # 公開用 Supabase クライアント（anon key）
│   ├── supabase-auth.ts      # 認証済み Supabase クライアント（API Route 専用）
│   ├── ensure-user.ts        # 初回 API アクセス時に users テーブルを upsert
│   └── time-utils.ts         # formatDuration / formatHHMMSS / formatTimeRange /
│                             #   formatDateLabel / toLocalDateKey / calcStats
└── types/
    ├── index.ts              # アプリ共通型定義
    └── database.types.ts     # Supabase スキーマ型（Row / Insert / Update / Relationships）
```

## 重要なパターンと制約

### Clerk v7 (Core 3) の注意点

`<SignedIn>` / `<SignedOut>` コンポーネントは Core 3 で**廃止**。クライアントコンポーネントでは `useAuth()` を使う:

```tsx
const { isSignedIn, isLoaded } = useAuth()
// isLoaded && isSignedIn ? <UserButton /> : <Link href="/sign-in">...</Link>
```

サーバーコンポーネントでは `auth()` / `currentUser()` を使用。

### Supabase + Clerk の統合（カスタムヘッダー方式）

すべての API Route は `createAuthenticatedSupabaseClient()` を使う。これが `x-clerk-user-id` ヘッダーを付与し、DB 側の `get_clerk_user_id()` 関数が RLS で参照する:

```typescript
// src/lib/supabase-auth.ts
const supabase = createClient<Database>(url, anonKey, {
  global: { headers: { 'x-clerk-user-id': userId } },
})
```

RLS ポリシーは全テーブルで `user_id = get_clerk_user_id()` を条件とする。

**重要**: SQL Editor でテーブルを作成した場合は GRANT が必要:
```sql
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
-- categories, time_entries も同様
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
```

### users テーブルへの初回登録

Clerk Webhook は使用しない。各 API Route の先頭で `ensureUser(supabase, userId)` を呼ぶ（`src/lib/ensure-user.ts`）。初回アクセス時に users テーブルへ upsert する。

### API Route の実装パターン

```typescript
export async function GET(request: Request) {
  try {
    const { supabase, userId } = await createAuthenticatedSupabaseClient()
    await ensureUser(supabase, userId)

    // クエリパラメータ付きの場合（time-entries など）
    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')
    let query = supabase.from('time_entries').select('*').order('start_time', { ascending: false })
    if (since) query = query.gte('start_time', since)
    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: '...', detail: msg }, { status: 500 })
  }
}
```

`detail` フィールドにより Supabase の実際のエラーをクライアントで表示できる。

### `[id]` Route の params（Next.js 15+）

```typescript
type Params = Promise<{ id: string }>
export async function PUT(req: Request, { params }: { params: Params }) {
  const { id } = await params
}
```

### Supabase JOIN クエリの型アサーション

`select('*, categories(id, name, color)')` のような JOIN クエリは、`Database` 型に `Relationships` が定義されていないと TypeScript エラーになる。`as unknown as YourType[]` で回避する:

```typescript
const { data } = await supabase.from('time_entries').select('*, categories(name)')
const rows = (data ?? []) as unknown as MyRowType[]
```

### ダッシュボードのデータフロー（refreshKey パターン）

`DashboardContent` が単一の state `refreshKey` を持ち、タイマー停止・手動入力・削除など保存操作のたびにインクリメントして再フェッチをトリガーする:

```typescript
const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
// <RecordingSection onSaved={refresh} />
// <RecentEntries onRefresh={refresh} />
```

### タイマー状態（グローバル）

`TimerContext` は `localStorage` (`project_tracker_timer` キー) に状態を永続化し、ページ遷移後もタイマーが継続する。`providers.tsx` で ClerkProvider の内側にラップ済み。タイマー停止時に `/api/time-entries` へ POST する。

### CSV エクスポート

`GET /api/export/csv?start=YYYY-MM-DD&end=YYYY-MM-DD` が UTF-8 BOM 付き CSV を返す（Excel での日本語文字化け防止）。クライアントは Blob URL 経由でダウンロードし、`URL.revokeObjectURL` でクリーンアップする。

## 時間ユーティリティ（`src/lib/time-utils.ts`）

| 関数 | 用途 |
|------|------|
| `formatDuration(sec)` | `"1時間30分"` — 履歴カード表示用 |
| `formatHHMMSS(sec)` | `"1:30:00"` — 統計カード表示用 |
| `formatTimeRange(start, end)` | `"09:00 〜 10:30"` |
| `toLocalDateKey(iso)` | `"2026-10-03"` — グルーピングキー |
| `formatDateLabel(key)` | `"今日"` / `"昨日"` / `"10月3日（金）"` |
| `calcStats(entries)` | 今日・今週・今月の合計秒数を返す |

## Clerk

認証・課金実装時は `.claude/clerk_document.md` を参照。  
プラン確認は `has({ plan: 'premium' })` を使用（`publicMetadata` は不可）。

## Supabase

実装時は `.claude/supabase_document.md` を参照。  
Clerk 連携時は `.claude/clerk_supabase_integration_document.md` を参照。

## Tailwind CSS

設定変更時は `.claude/tailwind_document.md` を参照。  
テーマ拡張は `globals.css` の `@theme inline` ブロックで行う（`tailwind.config.js` は作成しない）。

## 環境変数（`.env.local`）

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # オプション（Service Role バイパス用）
```
