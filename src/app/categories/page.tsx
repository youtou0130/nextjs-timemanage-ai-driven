import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { CategoriesClient } from '@/components/categories/CategoriesClient'

export const metadata: Metadata = { title: 'カテゴリ管理' }

export default async function CategoriesPage() {
  await auth.protect()
  return <CategoriesClient />
}
