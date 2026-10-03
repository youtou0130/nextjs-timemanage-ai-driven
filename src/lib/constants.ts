// Clerk Billing で設定するプランスラグ（Dashboard の Product slug と一致させる）
export const PLAN_SLUG = {
  FREE:    'free',
  PREMIUM: 'premium',
} as const

export type PlanSlug = (typeof PLAN_SLUG)[keyof typeof PLAN_SLUG]

// 無料プランの機能一覧（UI 表示用）
export const FREE_FEATURES = [
  'タイマー計測・手動入力',
  'カテゴリ管理（色分け）',
  '日・週・月の合計時間表示',
  '作業履歴閲覧',
  'CSVエクスポート',
] as const

// プレミアムプランの追加機能一覧
export const PREMIUM_FEATURES = [
  '無料プランの全機能',
  '日次・週次・月次・年次の詳細分析',
  'カテゴリ別グラフ（円・棒・ヒートマップ）',
  '前期間比較・トレンド分析',
  '生産性指標の分析',
  'PDFレポート生成',
  'カテゴリ無制限作成',
  '目標時間設定と達成率表示',
] as const
