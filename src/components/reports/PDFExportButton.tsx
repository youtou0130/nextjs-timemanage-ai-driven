'use client'

import { FileDown } from 'lucide-react'

interface Props {
  targetId: string   // キャプチャ対象要素の id（現在は使用しないが将来の拡張用に残す）
  filename: string
}

/**
 * ブラウザの印刷機能を使った PDF 出力。
 * html2canvas + jsPDF はTailwind CSS変数・Recharts SVG との相性問題があるため、
 * window.print() + @media print CSS で完全なレイアウトを PDF 化する。
 * ユーザーは印刷ダイアログで「PDF に保存」を選択する。
 */
export function PDFExportButton({ filename }: Props) {
  function handleExport() {
    // ドキュメントタイトルを一時的にファイル名に設定（PDF保存時のデフォルト名）
    const originalTitle = document.title
    document.title = filename

    window.print()

    // 印刷後にタイトルを元に戻す
    setTimeout(() => { document.title = originalTitle }, 1000)
  }

  return (
    <button
      onClick={handleExport}
      className="no-print flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
    >
      <FileDown className="h-4 w-4" />
      PDFレポート
    </button>
  )
}
