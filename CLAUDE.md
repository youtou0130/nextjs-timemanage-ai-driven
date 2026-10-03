# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクトの目的

**Project Tracker** — タイマー計測・手動入力・カテゴリ管理でシンプルに作業時間を記録・分析する Next.js タイム管理アプリ。無料プランと premium プランを Clerk Billing で管理。

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
- **Recharts** — プレミアム分析グラフ（棒・円・カスタムヒートマップ）
- **lucide-react** — アイコン

## アーキテクチャ概観

```
src/
├── app/
│   ├── layout.tsx           # ルートレイアウト（Providers + Header をラップ）
│   ├── providers.tsx        # ClerkProvider + TimerProvider
│   ├── middleware.ts        # Clerk 認証ミドルウェア（← src/ 直下が必須）
│   ├── page.tsx             # ランディングページ (/)
│   ├── pricing/page.tsx     # 料金ページ（PricingTableClient + 比較表）
│   ├── sign-in/[[...sign-in]]/
│   ├── sign-up/[[...sign-up]]/
│   ├── dashboard/
│   │   ├── layout.tsx       # Sidebar を含む 2 カラムレイアウト
│   │   └── page.tsx         # Server Component → DashboardContent に displayName を渡す
│   ├── categories/
│   │   ├── layout.tsx       # Sidebar を含む 2 カラムレイアウト
│   │   └── page.tsx
│   ├── reports/
│   │   ├── layout.tsx       # Sidebar を含む 2 カラムレイアウト
│   │   └── page.tsx         # PlanProtect で ReportsContent を保護
│   └── api/
│       ├── categories/route.ts           # GET(?), POST
│       ├── categories/[id]/route.ts      # PUT, DELETE
│       ├── time-entries/route.ts         # GET(?since&limit), POST
│       ├── time-entries/[id]/route.ts    # PUT, DELETE
│       ├── analytics/route.ts            # GET(?start&end) → 日別時系列・カテゴリ・生産性指標
│       └── export/csv/route.ts           # GET(?start&end) → UTF-8 BOM 付き CSV
├── components/
│   ├── Header.tsx            # 全ページ共通（useAuth で認証状態判定）
│   ├── Sidebar.tsx           # アプリ内ナビ
│   ├── PlanProtect.tsx       # useAuth().has() でプランチェック（フリーならUpgradePrompt表示）
│   ├── UpgradePrompt.tsx     # プレミアム機能のアップグレード促進 UI
│   ├── categories/           # CategoriesClient, CategoryFormModal, DeleteConfirmDialog
│   ├── dashboard/
│   │   ├── DashboardContent.tsx   # データ取得統合クライアント（refreshKey パターン）
│   │   ├── RecordingSection.tsx   # TimerWidget + 手動入力ボタン
│   │   ├── TimerWidget.tsx        # タイマー UI（TimerContext を消費）
│   │   ├── ManualEntryModal.tsx   # 手動入力モーダル（時刻指定 / 時間入力）
│   │   ├── RecentEntries.tsx      # 日付グルーピング履歴・削除・CSV エクスポートボタン
│   │   └── ExportModal.tsx        # CSV エクスポート期間選択モーダル
│   ├── pricing/
│   │   └── PricingTableClient.tsx # Clerk PricingTable を ssr:false で動的インポート
│   └── reports/
│       ├── ReportsContent.tsx     # 期間状態管理 + /api/analytics フェッチ統合
│       ├── PeriodSelector.tsx     # 日次/週次/月次/年次タブ + 前後ナビ
│       ├── ProductivityCards.tsx  # 総作業時間・平均・最多時間帯・最多カテゴリ
│       ├── BarChartCard.tsx       # Recharts 棒グラフ（期間で X 軸自動切替）
│       ├── PieChartCard.tsx       # Recharts 円グラフ + カテゴリ凡例
│       ├── ActivityHeatmap.tsx    # カスタム CSS Grid カレンダーヒートマップ
│       └── PDFExportButton.tsx    # window.print() で PDF 出力
├── contexts/
│   └── TimerContext.tsx      # グローバルタイマー状態（localStorage で永続化）
├── lib/
│   ├── constants.ts          # PLAN_SLUG / FREE_FEATURES / PREMIUM_FEATURES
│   ├── supabase.ts           # 公開用 Supabase クライアント（anon key）
│   ├── supabase-auth.ts      # 認証済み Supabase クライアント（API Route 専用）
│   ├── ensure-user.ts        # 初回 API アクセス時に users テーブルを upsert
│   └── time-utils.ts         # 時間フォーマット・日付ユーティリティ・統計計算
└── types/
    ├── index.ts              # アプリ共通型定義
    └── database.types.ts     # Supabase スキーマ型（Row / Insert / Update / Relationships）
```

## 重要なパターンと制約

### Clerk v7 (Core 3) の廃止コンポーネント

以下は Core 3 で**すべて廃止**。代わりに `useAuth()` フックを使う:

```tsx
// ❌ 廃止: <SignedIn>, <SignedOut>, <Protect>
// ✅ 代替: useAuth()
const { isSignedIn, isLoaded, has } = useAuth()

// 認証状態の切り替え
isLoaded && isSignedIn ? <UserButton /> : <Link href="/sign-in">...</Link>

// プランチェック（PlanProtect の内部実装）
if (!has?.({ plan: 'premium' })) return <UpgradePrompt />
```

サーバーコンポーネントでは `auth()` / `currentUser()` を使用。

### プレミアム機能の保護（PlanProtect）

`src/components/PlanProtect.tsx` が `useAuth().has()` でプランをチェックする:

```tsx
<PlanProtect>               {/* plan='premium' がデフォルト */}
  <PremiumFeature />        {/* プレミアムのみ表示 */}
</PlanProtect>
// → フリーユーザーには UpgradePrompt を表示
```

プラン slug は `src/lib/constants.ts` の `PLAN_SLUG.PREMIUM = 'premium'` で定義。Clerk Dashboard の Product slug と一致させること。

### Supabase + Clerk の統合（カスタムヘッダー方式）

すべての API Route は `createAuthenticatedSupabaseClient()` を使う。`x-clerk-user-id` ヘッダーで DB 側 RLS が動作する:

```typescript
const supabase = createClient<Database>(url, anonKey, {
  global: { headers: { 'x-clerk-user-id': userId } },
})
```

**重要**: SQL Editor でテーブルを作成した場合は GRANT が必要:
```sql
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
-- categories, time_entries も同様
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
```

### users テーブルへの初回登録

Clerk Webhook は使用しない。各 API Route の先頭で `ensureUser(supabase, userId)` を呼ぶ。

### API Route の実装パターン

```typescript
export async function GET(request: Request) {
  try {
    const { supabase, userId } = await createAuthenticatedSupabaseClient()
    await ensureUser(supabase, userId)
    // ...
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

### `[id]` Route の params（Next.js 15+）

```typescript
type Params = Promise<{ id: string }>
export async function PUT(req: Request, { params }: { params: Params }) {
  const { id } = await params
}
```

### Supabase JOIN クエリの型アサーション

JOIN クエリ（`select('*, categories(name)')`）は `Relationships` 未定義により TypeScript エラーになる。`as unknown as T[]` で回避:

```typescript
const rows = (data ?? []) as unknown as MyRowType[]
```

### ダッシュボードのデータフロー（refreshKey パターン）

```typescript
const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
// 保存操作後に refresh() を呼ぶと再フェッチが走る
```

### タイマー状態（グローバル）

`TimerContext` は `localStorage`（`project_tracker_timer` キー）に永続化。ページ遷移後も継続。停止時に `/api/time-entries` へ POST。

### PDF 出力

`window.print()` + `@media print` CSS を使用。`html2canvas` は Tailwind v4 CSS変数・Recharts SVG との相性問題があるため不使用。印刷時に隠す要素には `no-print` クラスを付与。

### CSV エクスポート

`GET /api/export/csv?start=YYYY-MM-DD&end=YYYY-MM-DD` が UTF-8 BOM 付き CSV を返す（Excel 日本語対応）。クライアントは Blob URL 経由でダウンロードし `URL.revokeObjectURL` でクリーンアップ。

### レポートページのデータフロー

`ReportsContent` がピリオド状態（`day/week/month/year`）と anchor（基準日）を管理し、`/api/analytics?start=&end=` をフェッチして各チャートコンポーネントに配布する。期間切替・前後ナビゲーションのロジックは `PeriodSelector.tsx` の `getPeriodRange()` / `navigate()` に集約。

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
`PricingTable` を使う際は Clerk Dashboard で Billing 有効化 + Stripe 接続が必要。

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
