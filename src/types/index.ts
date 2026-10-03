// ─── カテゴリ ───────────────────────────────────────────────

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Pick<Category, "name" | "color" | "isFavorite">;

// ─── 作業時間記録 ────────────────────────────────────────────

export interface TimeEntry {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TimeEntryInput = {
  categoryId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  memo?: string;
};

// ─── タイマー状態 ────────────────────────────────────────────

export type TimerStatus = "idle" | "running" | "paused";

export interface TimerState {
  status: TimerStatus;
  startTime: string | null;
  pausedAt: string | null;
  accumulatedSeconds: number;
  categoryId: string | null;
}

// ─── ダッシュボード統計 ──────────────────────────────────────

export interface DashboardStats {
  todaySeconds: number;
  weekSeconds: number;
  monthSeconds: number;
}

export interface RecentEntry extends TimeEntry {
  category: Category;
}

// ─── API レスポンス ──────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── ユーザー設定 ────────────────────────────────────────────

export type WeekStartDay = "monday" | "sunday";

export interface UserSettings {
  userId: string;
  timezone: string;
  weekStartDay: WeekStartDay;
}

// ─── プラン ──────────────────────────────────────────────────

export type Plan = "free" | "premium";

// ─── ページネーション ────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── フィルター ──────────────────────────────────────────────

export interface TimeEntryFilters {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
