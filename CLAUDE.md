# CLAUDE.md

このファイルは、リポジトリ内のコードを扱う際に Claude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクトの目的

Next.js で構築された AI 駆動のタイム管理アプリケーション。現在は初期スキャフォールディング段階。

## コマンド

```bash
npm run dev      # 開発サーバーを起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run start    # 本番サーバーを起動
npm run lint     # ESLint を実行
```

テストランナーは未設定。

## スタック

- **Next.js 16.3.6** — App Router 使用 (`src/app/`)
- **React 19**
- **TypeScript** — strict モード有効
- **Tailwind CSS v4** — `@import "tailwindcss"` 構文を使用 (v3 のディレクティブではない)
- **Geist** フォント (`next/font/google` 経由)

## アーキテクチャ

App Router の規則に従い、すべてのルートは `src/app/` 以下に配置する。ルートレイアウト (`src/app/layout.tsx`) が Geist フォント変数と flex-column の body で全体をラップしている。

パスエイリアス `@/*` は `./src/*` に解決される。

## Clerk

認証・サブスクリプション・課金機能を実装する際は必ず `.claude/clerk_document.md` を参照すること。

- **認証**: サインイン・サインアップ・セッション管理はすべて Clerk を使用する。
- **サブスクリプション・課金**: プラン管理・課金機能の実装も Clerk ドキュメントの指示に従う。

## Supabase

Supabase を使用する際は必ず `.claude/supabase_document.md` を参照すること。

Supabase と Clerk を**連携させて使用する**際は `.claude/clerk_supabase_integration_document.md` を参照すること。

- **開発環境**: クラウドベース（方法1）を使用。Docker は使用しない。
- 環境変数は `.env.local` に設定し、API キーはユーザーが手動で入力する。
- マイグレーションは `npx supabase db push` でクラウド環境に適用する。
- RLS ポリシーは Clerk 認証との統合を考慮して設計する。

## Tailwind CSS

Tailwind CSS のセットアップや設定を行う際は必ず `.claude/tailwind_document.md` を参照すること。

## 設定上の注意点

- **Tailwind v4**: テーマの拡張は `tailwind.config.js` ではなく、`globals.css` 内の `@theme inline` ブロックで行う。
- **CSS 変数**: `--background` と `--foreground` は `:root` で定義され、`@media (prefers-color-scheme: dark)` でダークモード用の値を上書きしている。
- **ESLint**: `eslint-config-next/core-web-vitals` と `eslint-config-next/typescript` を使用。設定は `eslint.config.mjs`（フラット設定フォーマット）。
