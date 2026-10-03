import { NextResponse } from 'next/server'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-auth'

type Row = {
  start_time: string
  end_time: string | null
  duration: number | null
  memo: string | null
  categories: { name: string } | null
}

function escapeCell(value: string): string {
  // CSV インジェクション対策 + ダブルクォートのエスケープ
  return `"${value.replace(/"/g, '""')}"`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function buildCSV(rows: Row[]): string {
  const headers = [
    '日付',
    '開始時刻',
    '終了時刻',
    '作業時間（分）',
    '作業時間（時間）',
    'カテゴリ',
    'メモ',
  ]

  const lines = rows.map((r) => {
    const durationMin = r.duration != null ? Math.round(r.duration / 60) : ''
    const durationH   = r.duration != null ? (r.duration / 3600).toFixed(2) : ''
    return [
      formatDate(r.start_time),
      formatTime(r.start_time),
      r.end_time ? formatTime(r.end_time) : '',
      String(durationMin),
      String(durationH),
      r.categories?.name ?? '',
      r.memo ?? '',
    ]
      .map(escapeCell)
      .join(',')
  })

  // UTF-8 BOM を先頭に付与（Excel で日本語が文字化けしないよう）
  return '﻿' + [headers.map(escapeCell).join(','), ...lines].join('\r\n')
}

export async function GET(request: Request) {
  try {
    const { supabase } = await createAuthenticatedSupabaseClient()

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')  // YYYY-MM-DD
    const end   = searchParams.get('end')    // YYYY-MM-DD

    let query = supabase
      .from('time_entries')
      .select('start_time, end_time, duration, memo, categories(name)')
      .order('start_time', { ascending: false })
      .limit(10000)

    if (start) query = query.gte('start_time', new Date(`${start}T00:00:00`).toISOString())
    if (end)   query = query.lte('start_time', new Date(`${end}T23:59:59`).toISOString())

    const { data, error } = await query
    if (error) throw error

    const csv = buildCSV((data ?? []) as unknown as Row[])

    const startLabel = start ?? 'all'
    const endLabel   = end   ?? new Date().toISOString().slice(0, 10)
    const filename   = `project-tracker-${startLabel.replace(/-/g, '')}-${endLabel.replace(/-/g, '')}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Export failed', detail: msg }, { status: 500 })
  }
}
