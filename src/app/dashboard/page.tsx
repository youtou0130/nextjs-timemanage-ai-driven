import type { Metadata } from 'next'
import { auth, currentUser } from '@clerk/nextjs/server'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export const metadata: Metadata = { title: 'ダッシュボード' }

export default async function DashboardPage() {
  await auth.protect()
  const user = await currentUser()

  const displayName =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress ??
    'ユーザー'

  return <DashboardContent displayName={displayName} />
}
